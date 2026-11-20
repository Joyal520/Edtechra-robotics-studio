import { execFile } from 'node:child_process';
import { existsSync, promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CLI = path.join(ROOT, 'tools', 'arduino-cli', process.platform === 'win32' ? 'arduino-cli.exe' : 'arduino-cli');
// Universal ESP32 flash settings (DIO @ 40MHz) so firmware boots on BOTH genuine Espressif modules AND all DevKit V1 clones
const FQBN = 'esp32:esp32:esp32:FlashMode=dio,FlashFreq=40';
const OUT_ROOT = path.join(ROOT, 'public', 'firmware');
const COMMON_DIR = path.join(OUT_ROOT, 'common');
const CACHE_DIR = path.join(os.tmpdir(), 'edtechra-esp32-dio40-cache');

const SKETCHES = [
  {
    id: 'level-3-blink',
    level: 3,
    name: 'Normal Blink (1s)',
    folder: 'level-3',
    filename: 'blink.bin',
    description: 'Blinks the onboard ESP32 LED (GPIO 2) ON for 1 second and OFF for 1 second.',
    code: `// Level 3: Normal Blink (1000ms)
void setup() {
  Serial.begin(115200);
  pinMode(2, OUTPUT);
  Serial.println("EdTechra Level 3: Normal Blink (1s) started!");
}

void loop() {
  digitalWrite(2, HIGH);
  Serial.println("LED ON (HIGH)");
  delay(1000);
  digitalWrite(2, LOW);
  Serial.println("LED OFF (LOW)");
  delay(1000);
}
`,
  },
  {
    id: 'level-3-blink-slow',
    level: 3,
    name: 'Slow Blink (2s)',
    folder: 'level-3',
    filename: 'blink-slow.bin',
    description: 'Blinks the onboard ESP32 LED (GPIO 2) slowly: 2 seconds ON, 2 seconds OFF.',
    code: `// Level 3: Slow Blink (2000ms)
void setup() {
  Serial.begin(115200);
  pinMode(2, OUTPUT);
  Serial.println("EdTechra Level 3: Slow Blink (2s) started!");
}

void loop() {
  digitalWrite(2, HIGH);
  Serial.println("LED ON (HIGH) - 2s");
  delay(2000);
  digitalWrite(2, LOW);
  Serial.println("LED OFF (LOW) - 2s");
  delay(2000);
}
`,
  },
  {
    id: 'level-3-blink-fast',
    level: 3,
    name: 'Fast Blink (250ms)',
    folder: 'level-3',
    filename: 'blink-fast.bin',
    description: 'Blinks the onboard ESP32 LED (GPIO 2) quickly: 250ms ON, 250ms OFF.',
    code: `// Level 3: Fast Blink (250ms)
void setup() {
  Serial.begin(115200);
  pinMode(2, OUTPUT);
  Serial.println("EdTechra Level 3: Fast Blink (250ms) started!");
}

void loop() {
  digitalWrite(2, HIGH);
  Serial.println("LED ON (HIGH) - 250ms");
  delay(250);
  digitalWrite(2, LOW);
  Serial.println("LED OFF (LOW) - 250ms");
  delay(250);
}
`,
  },
];

async function findBootApp0() {
  const localAppData = process.env.LOCALAPPDATA || '';
  const esp32HwDir = path.join(localAppData, 'Arduino15', 'packages', 'esp32', 'hardware', 'esp32');
  if (!existsSync(esp32HwDir)) return null;
  const versions = await fs.readdir(esp32HwDir);
  for (const v of versions) {
    const candidate = path.join(esp32HwDir, v, 'tools', 'partitions', 'boot_app0.bin');
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

async function main() {
  if (!existsSync(CLI)) {
    throw new Error(`arduino-cli not found at ${CLI}`);
  }
  await fs.mkdir(COMMON_DIR, { recursive: true });
  await fs.mkdir(CACHE_DIR, { recursive: true });

  const bootApp0Src = await findBootApp0();
  if (bootApp0Src) {
    await fs.copyFile(bootApp0Src, path.join(COMMON_DIR, 'boot_app0.bin'));
    console.log('Copied boot_app0.bin');
  }

  let commonCopied = false;
  const manifestItems = [];

  for (const sk of SKETCHES) {
    console.log(`Compiling ${sk.id} (${sk.name})...`);
    const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'edtechra-fw-'));
    const sketchDir = path.join(tmpRoot, 'sketch');
    const buildDir = path.join(tmpRoot, 'out');
    await fs.mkdir(sketchDir, { recursive: true });
    await fs.mkdir(buildDir, { recursive: true });
    await fs.writeFile(path.join(sketchDir, 'sketch.ino'), sk.code, 'utf8');

    await execFileAsync(
      CLI,
      ['compile', '--fqbn', FQBN, '--build-path', CACHE_DIR, '--output-dir', buildDir, sketchDir],
      { timeout: 600000, maxBuffer: 10 * 1024 * 1024 }
    );

    const files = await fs.readdir(buildDir);
    const bootloader = files.find((f) => f.endsWith('.bootloader.bin'));
    const partitions = files.find((f) => f.endsWith('.partitions.bin'));
    const app = files.find(
      (f) => f.endsWith('.ino.bin') && !f.endsWith('.bootloader.bin') && !f.endsWith('.partitions.bin')
    );

    if (!app) throw new Error(`App binary missing for ${sk.id}`);

    if (!commonCopied) {
      if (bootloader) await fs.copyFile(path.join(buildDir, bootloader), path.join(COMMON_DIR, 'bootloader.bin'));
      if (partitions) await fs.copyFile(path.join(buildDir, partitions), path.join(COMMON_DIR, 'partitions.bin'));
      commonCopied = true;
    }

    const levelDir = path.join(OUT_ROOT, sk.folder);
    await fs.mkdir(levelDir, { recursive: true });
    await fs.copyFile(path.join(buildDir, app), path.join(levelDir, sk.filename));

    const stat = await fs.stat(path.join(levelDir, sk.filename));
    console.log(`  -> ${sk.folder}/${sk.filename} (${Math.round(stat.size / 1024)} KB)`);

    const parts = [
      { path: 'firmware/common/bootloader.bin', address: '0x1000' },
      { path: 'firmware/common/partitions.bin', address: '0x8000' },
    ];
    if (bootApp0Src) {
      parts.push({ path: 'firmware/common/boot_app0.bin', address: '0xe000' });
    }
    parts.push({ path: `firmware/${sk.folder}/${sk.filename}`, address: '0x10000' });

    manifestItems.push({
      id: sk.id,
      level: sk.level,
      name: sk.name,
      description: sk.description,
      board: 'ESP32 DevKit V1 (esp32:esp32:esp32)',
      version: '1.1.0',
      flashConfig: { flashSize: '4MB', flashMode: 'dio', flashFreq: '40m' },
      parts,
    });

    await fs.rm(tmpRoot, { recursive: true, force: true }).catch(() => {});
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    boardFqbn: FQBN,
    firmware: manifestItems,
  };
  await fs.writeFile(path.join(OUT_ROOT, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
  console.log('Wrote public/firmware/manifest.json successfully!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
