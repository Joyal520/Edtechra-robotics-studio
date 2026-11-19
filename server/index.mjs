import http from 'node:http';
import { execFile } from 'node:child_process';
import { existsSync, promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const PORT = Number(process.env.PORT || 3001);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const LOCAL_CLI = path.join(
  PROJECT_ROOT,
  'tools',
  'arduino-cli',
  process.platform === 'win32' ? 'arduino-cli.exe' : 'arduino-cli'
);

function getCliBin() {
  return existsSync(LOCAL_CLI) ? LOCAL_CLI : 'arduino-cli';
}

function sendJson(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
}

let cachedCliStatus = null;

async function checkArduinoCli() {
  if (cachedCliStatus?.installed && cachedCliStatus?.esp32Core) {
    return cachedCliStatus;
  }
  const cliBin = getCliBin();
  try {
    const { stdout } = await execFileAsync(cliBin, ['version', '--format', 'json'], {
      timeout: 15000,
    });
    let version = stdout.trim();
    try {
      const parsed = JSON.parse(stdout);
      version = parsed.VersionString || version;
    } catch {
      // plain text fallback
    }

    let esp32Core = false;
    try {
      const coreOut = await execFileAsync(cliBin, ['core', 'list'], { timeout: 25000 });
      esp32Core = /esp32:esp32/i.test(coreOut.stdout);
    } catch {
      esp32Core = false;
    }

    const result = { installed: true, version, esp32Core, cliPath: cliBin };
    if (esp32Core) cachedCliStatus = result;
    return result;
  } catch {
    return { installed: false, version: null, esp32Core: false, cliPath: null };
  }
}

async function handleCompile(body) {
  const code = typeof body?.code === 'string' ? body.code : '';
  const fqbn = typeof body?.fqbn === 'string' && body.fqbn ? body.fqbn : 'esp32:esp32:esp32';

  if (!code.trim()) {
    return { status: 400, data: { ok: false, error: 'No source code provided.' } };
  }

  const cli = await checkArduinoCli();
  if (!cli.installed) {
    return {
      status: 503,
      data: {
        ok: false,
        code: 'COMPILER_NOT_INSTALLED',
        error:
          'arduino-cli is not installed on this computer. Install arduino-cli with the ESP32 core for one-click source compilation, or upload a pre-compiled .bin firmware file directly to your ESP32.',
        setupSteps: [
          'Install arduino-cli (winget install ArduinoSA.CLI)',
          'Run: arduino-cli core update-index --additional-urls https://espressif.github.io/arduino-esp32/package_esp32_index.json',
          'Run: arduino-cli core install esp32:esp32 --additional-urls https://espressif.github.io/arduino-esp32/package_esp32_index.json',
        ],
      },
    };
  }

  if (!cli.esp32Core) {
    return {
      status: 503,
      data: {
        ok: false,
        code: 'ESP32_CORE_MISSING',
        error: 'arduino-cli is installed, but the esp32:esp32 board package is missing.',
        setupSteps: [
          'Run: arduino-cli core update-index --additional-urls https://espressif.github.io/arduino-esp32/package_esp32_index.json',
          'Run: arduino-cli core install esp32:esp32 --additional-urls https://espressif.github.io/arduino-esp32/package_esp32_index.json',
        ],
      },
    };
  }

  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'edtechra-esp32-'));
  const sketchName = 'sketch';
  const sketchDir = path.join(tmpRoot, sketchName);
  const buildDir = path.join(tmpRoot, 'build');

  try {
    await fs.mkdir(sketchDir, { recursive: true });
    await fs.mkdir(buildDir, { recursive: true });
    await fs.writeFile(path.join(sketchDir, `${sketchName}.ino`), code, 'utf8');

    const cacheDir = path.join(os.tmpdir(), 'edtechra-esp32-build-cache');
    await fs.mkdir(cacheDir, { recursive: true });

    const { stdout, stderr } = await execFileAsync(
      getCliBin(),
      ['compile', '--fqbn', fqbn, '--build-path', cacheDir, '--output-dir', buildDir, sketchDir],
      { timeout: 180000, maxBuffer: 10 * 1024 * 1024 }
    );

    const files = await fs.readdir(buildDir);
    const mergedBin = files.find((f) => f.endsWith('.merged.bin'));
    const images = [];

    if (mergedBin) {
      const buf = await fs.readFile(path.join(buildDir, mergedBin));
      images.push({ name: mergedBin, address: 0x0, dataBase64: buf.toString('base64') });
    } else {
      const bootloader = files.find((f) => f.endsWith('.bootloader.bin'));
      const partitions = files.find((f) => f.endsWith('.partitions.bin'));
      const app = files.find(
        (f) => f.endsWith('.ino.bin') && !f.endsWith('.bootloader.bin') && !f.endsWith('.partitions.bin')
      );

      if (bootloader) {
        const buf = await fs.readFile(path.join(buildDir, bootloader));
        images.push({ name: bootloader, address: 0x1000, dataBase64: buf.toString('base64') });
      }
      if (partitions) {
        const buf = await fs.readFile(path.join(buildDir, partitions));
        images.push({ name: partitions, address: 0x8000, dataBase64: buf.toString('base64') });
      }
      if (app) {
        const buf = await fs.readFile(path.join(buildDir, app));
        images.push({ name: app, address: 0x10000, dataBase64: buf.toString('base64') });
      }
    }

    if (images.length === 0) {
      return {
        status: 500,
        data: { ok: false, error: 'Compilation succeeded but no .bin output was produced.', stdout, stderr },
      };
    }

    return {
      status: 200,
      data: { ok: true, fqbn, images, stdout, stderr },
    };
  } catch (err) {
    return {
      status: 422,
      data: {
        ok: false,
        code: 'COMPILE_ERROR',
        error: err.stderr || err.stdout || err.message || 'Compilation failed.',
      },
    };
  } finally {
    await fs.rm(tmpRoot, { recursive: true, force: true }).catch(() => {});
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  if (req.method === 'GET' && req.url === '/api/health') {
    const cli = await checkArduinoCli();
    sendJson(res, 200, { ok: true, ...cli });
    return;
  }

  if (req.method === 'POST' && req.url === '/api/compile') {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 512 * 1024) {
        req.destroy();
      }
    });
    req.on('end', async () => {
      try {
        const body = JSON.parse(raw || '{}');
        const result = await handleCompile(body);
        sendJson(res, result.status, result.data);
      } catch (e) {
        sendJson(res, 400, { ok: false, error: 'Invalid JSON payload.' });
      }
    });
    return;
  }

  sendJson(res, 404, { ok: false, error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`[EdTechra Compiler Bridge] Listening on http://localhost:${PORT}`);
});
