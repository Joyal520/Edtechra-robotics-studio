import { ESPLoader, Transport } from 'esptool-js';
import type { HardwareDeviceInfo } from '../types';

export type UploadStage =
  | 'idle'
  | 'checking'
  | 'compiling'
  | 'preparing'
  | 'uploading'
  | 'verifying'
  | 'done'
  | 'error';

export interface CompilerHealth {
  online: boolean;
  installed: boolean;
  esp32Core: boolean;
  version: string | null;
}

export interface CompileResult {
  ok: boolean;
  code?: string;
  error?: string;
  setupSteps?: string[];
  images?: { name: string; address: number; dataBase64: string }[];
}

export interface FirmwarePart {
  path: string;
  address: string;
}

export interface FirmwareEntry {
  id: string;
  level: number;
  name: string;
  description: string;
  board: string;
  version: string;
  flashConfig: { flashSize: string; flashMode: string; flashFreq: string };
  parts: FirmwarePart[];
}

export interface FirmwareManifest {
  generatedAt: string;
  boardFqbn: string;
  firmware: FirmwareEntry[];
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function arrayBufferToBinaryString(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  const chunks: string[] = [];
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    chunks.push(String.fromCharCode(...bytes.subarray(i, i + CHUNK)));
  }
  return chunks.join('');
}

function base64ToBinaryString(base64: string): string {
  return atob(base64);
}

/**
 * Safely releases esptool-js Transport reader locks and closes the Web Serial port.
 * Works around esptool-js Transport.disconnect() not always calling reader.releaseLock()
 * after reader.cancel(), which can wedge Windows CP210x drivers on subsequent opens.
 */
async function safeReleasePort(transport: Transport | null, port: SerialPort | null): Promise<void> {
  if (transport) {
    const t = transport as unknown as { reader?: ReadableStreamDefaultReader<Uint8Array> };
    if (t.reader) {
      try {
        await t.reader.cancel();
      } catch {
        // ignore cancel errors
      }
      try {
        t.reader.releaseLock();
      } catch {
        // ignore releaseLock errors
      }
      t.reader = undefined;
    }
  }

  if (port) {
    try {
      if (port.readable || port.writable) {
        await port.close();
      }
    } catch {
      // ignore close errors if already closed
    }
  }

  // Give Windows CP210x / CH340 driver time to finalize CloseHandle before next open
  await sleep(350);
}

class ESP32HardwareService {
  private port: SerialPort | null = null;
  private transport: Transport | null = null;
  private loader: ESPLoader | null = null;
  private deviceInfo: HardwareDeviceInfo | null = null;
  private monitorReader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private monitorActive = false;

  isWebSerialSupported(): boolean {
    return typeof navigator !== 'undefined' && 'serial' in navigator;
  }

  isConnected(): boolean {
    return this.port !== null && this.deviceInfo !== null;
  }

  getDeviceInfo(): HardwareDeviceInfo | null {
    return this.deviceInfo;
  }

  private getApiCandidates(): string[] {
    if (typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)) {
      return ['/api', 'http://localhost:3001/api'];
    }
    return ['http://localhost:3001/api'];
  }

  async checkCompilerHealth(): Promise<CompilerHealth> {
    for (const base of this.getApiCandidates()) {
      try {
        const res = await fetch(`${base}/health`);
        if (!res.ok) continue;
        const data = await res.json();
        return {
          online: true,
          installed: Boolean(data.installed),
          esp32Core: Boolean(data.esp32Core),
          version: data.version || null,
        };
      } catch {
        // try next candidate
      }
    }
    return { online: false, installed: false, esp32Core: false, version: null };
  }

  async connect(onLog?: (line: string) => void): Promise<HardwareDeviceInfo> {
    if (!this.isWebSerialSupported()) {
      throw new Error(
        'Web Serial API is not supported in this browser. Please open EdTechra Robotics Studio in Google Chrome or Microsoft Edge on a desktop/laptop computer.'
      );
    }

    await this.disconnect();

    const log = (msg: string) => onLog?.(msg);

    log('Requesting USB Serial device from browser...');
    let port: SerialPort;
    try {
      port = await navigator.serial.requestPort();
    } catch (err) {
      const e = err as Error;
      if (e.name === 'NotFoundError') {
        throw new Error(
          'No port was selected. In the browser popup, click your board (e.g. "CP2102 USB to UART Bridge Controller") so it is highlighted, then press Connect.'
        );
      }
      throw err;
    }

    // Genuinely open and close the USB serial port to prove real hardware is attached and free.
    // We intentionally do NOT enter ROM bootloader mode here so boards requiring BOOT hold
    // stay clean and ready for flashing when the student clicks Upload.
    log('Verifying USB serial port at 115200 baud...');
    try {
      if (port.readable || port.writable) {
        await port.close();
        await sleep(350);
      }
      await port.open({ baudRate: 115200 });
      await sleep(100);
      await port.close();
      await sleep(350);
    } catch (err) {
      await safeReleasePort(null, port);
      const e = err as Error;
      throw new Error(
        e.name === 'InvalidStateError'
          ? 'The port is already open in another tab or program. Close Arduino IDE, other Serial Monitors, or other EdTechra tabs, then try again.'
          : e.name === 'NetworkError'
          ? 'Windows could not open the COM port. Make sure Arduino IDE or another Serial Monitor is closed, unplug and replug the ESP32 USB cable, and try again.'
          : `Could not open the serial port: ${e.message}`
      );
    }

    const info = port.getInfo();
    const vidHex = info.usbVendorId
      ? `0x${info.usbVendorId.toString(16).toUpperCase().padStart(4, '0')}`
      : '';
    const pidHex = info.usbProductId
      ? `0x${info.usbProductId.toString(16).toUpperCase().padStart(4, '0')}`
      : '';
    const bridge =
      info.usbVendorId === 0x10c4
        ? 'CP210x'
        : info.usbVendorId === 0x1a86
        ? 'CH340'
        : info.usbVendorId === 0x0403
        ? 'FTDI'
        : info.usbVendorId === 0x303a
        ? 'ESP32 Native USB'
        : 'USB Serial';
    const portLabel = vidHex ? `${bridge} (${vidHex}:${pidHex})` : 'USB Serial Port';

    this.port = port;
    this.deviceInfo = {
      chip: 'ESP32',
      usbVendorId: info.usbVendorId,
      usbProductId: info.usbProductId,
      portLabel,
      connectedAt: new Date().toLocaleTimeString(),
    };

    log(`Connected to ${this.deviceInfo.chip} on ${portLabel}. Ready to upload!`);
    return this.deviceInfo;
  }

  /**
   * Opens the serial port cleanly and syncs with the ESP32 ROM bootloader + stub flasher.
   * Gives 12 connect attempts (~15 seconds) so students have plenty of time to hold BOOT
   * on DevKit clones whose auto-reset capacitor does not trigger download mode automatically.
   */
  private async startBootloaderSession(onLog?: (line: string) => void): Promise<ESPLoader> {
    if (!this.port) {
      throw new Error('No ESP32 board is connected. Click Connect ESP32 first.');
    }
    const log = (msg: string) => onLog?.(msg);

    await this.stopSerialMonitor();
    await safeReleasePort(this.transport, this.port);
    this.transport = null;
    this.loader = null;

    const transport = new Transport(this.port, false);
    const loader = new ESPLoader({
      transport,
      baudrate: 115200,
      romBaudrate: 115200,
      terminal: {
        clean: () => {},
        writeLine: (data: string) => log(data),
        write: (data: string) => {
          if (data.trim()) log(data.trim());
        },
      },
    });

    try {
      // 12 attempts (~12–15s) gives plenty of time for auto-reset OR holding BOOT button
      await loader.connect('default_reset', 12, true);
      const chipDesc = await loader.chip.getChipDescription(loader);
      let mac = '';
      try {
        mac = await loader.chip.readMac(loader);
      } catch {
        mac = '';
      }
      if (typeof (loader.chip as unknown as { postConnect?: (l: ESPLoader) => Promise<void> }).postConnect === 'function') {
        await (loader.chip as unknown as { postConnect: (l: ESPLoader) => Promise<void> }).postConnect(loader);
      }
      await loader.runStub();

      this.transport = transport;
      this.loader = loader;
      if (this.deviceInfo) {
        this.deviceInfo = {
          ...this.deviceInfo,
          chip: String(chipDesc).split(' (')[0] || 'ESP32',
          mac: mac || undefined,
        };
      }
      log(`Synced with ${this.deviceInfo?.chip}${mac ? ` (MAC: ${mac})` : ''}`);
      return loader;
    } catch (err) {
      await safeReleasePort(transport, this.port);
      this.transport = null;
      this.loader = null;

      const msg = err instanceof Error ? err.message : String(err);
      if (/open/i.test(msg)) {
        throw new Error(
          'Windows could not open the COM port. Close any other program or tab using the ESP32, unplug and replug the USB cable, click Disconnect then Connect ESP32, and try again.'
        );
      }
      throw new Error(
        `ESP32 did not enter download mode (${msg}). Hold down the BOOT button on your ESP32 board, click Upload, and release BOOT as soon as "Uploading..." starts.`
      );
    }
  }

  async disconnect(): Promise<void> {
    await this.stopSerialMonitor();
    await safeReleasePort(this.transport, this.port);
    this.port = null;
    this.transport = null;
    this.loader = null;
    this.deviceInfo = null;
  }

  async compileCode(code: string, fqbn = 'esp32:esp32:esp32'): Promise<CompileResult> {
    for (const base of this.getApiCandidates()) {
      try {
        const res = await fetch(`${base}/compile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, fqbn }),
        });
        if (res.status === 404) continue;
        return (await res.json()) as CompileResult;
      } catch {
        // try next candidate
      }
    }
    return {
      ok: false,
      code: 'COMPILER_BRIDGE_OFFLINE',
      error:
        'Could not reach the local ESP32 Compiler Bridge (http://localhost:3001). GitHub Pages hosts the static web app only — use Beginner Mode precompiled firmware, run "npm run dev:server" on your PC for C++ compilation, or flash a .bin file directly.',
    };
  }

  async flashImages(
    images: { address: number; data: string; name?: string }[],
    onStage: (stage: UploadStage, detail: string) => void,
    onProgress: (pct: number) => void
  ): Promise<void> {
    if (!this.port) {
      throw new Error('No ESP32 board is currently connected. Connect your ESP32 first.');
    }

    onStage(
      'checking',
      'Syncing with ESP32 bootloader... (Hold the BOOT button on your ESP32 if this takes >2 seconds)'
    );
    onProgress(12);

    const loader = await this.startBootloaderSession();

    try {
      onStage('preparing', `Preparing ${images.length} firmware image(s)...`);
      const fileArray = images.map((img) => ({
        data: img.data,
        address: img.address,
      }));
      onProgress(22);

      onStage('uploading', 'Uploading firmware to ESP32 flash memory... (You can release BOOT now)');
      await loader.writeFlash({
        fileArray,
        flashSize: 'keep',
        flashMode: 'keep',
        flashFreq: 'keep',
        eraseAll: false,
        compress: true,
        reportProgress: (fileIndex: number, written: number, total: number) => {
          const filePct = total > 0 ? written / total : 0;
          const overall = 22 + Math.round(((fileIndex + filePct) / Math.max(1, fileArray.length)) * 70);
          onProgress(Math.min(93, overall));
        },
      });

      onStage('verifying', 'Resetting ESP32 and starting your program...');
      onProgress(97);
      try {
        await loader.after('hard_reset');
      } catch {
        // some boards reset automatically on disconnect
      }
    } finally {
      // ALWAYS release the reader lock and close the port cleanly so the next upload or Serial Monitor works!
      await safeReleasePort(this.transport, this.port);
      this.transport = null;
      this.loader = null;
    }

    onProgress(100);
    onStage('done', 'Program uploaded and running on ESP32!');
  }

  async compileAndUpload(
    code: string,
    onStage: (stage: UploadStage, detail: string) => void,
    onProgress: (pct: number) => void,
    fqbn = 'esp32:esp32:esp32'
  ): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('No ESP32 board is connected. Please connect your ESP32 via USB first.');
    }

    onStage('checking', 'Checking board and compiler availability...');
    onProgress(5);

    onStage('compiling', 'Compiling Arduino C++ code for ESP32...');
    onProgress(10);

    const compiled = await this.compileCode(code, fqbn);
    if (!compiled.ok || !compiled.images || compiled.images.length === 0) {
      const err = new Error(compiled.error || 'Compilation failed.');
      (err as Error & { code?: string; setupSteps?: string[] }).code = compiled.code;
      (err as Error & { code?: string; setupSteps?: string[] }).setupSteps = compiled.setupSteps;
      throw err;
    }

    const images = compiled.images.map((img) => ({
      name: img.name,
      address: img.address,
      data: base64ToBinaryString(img.dataBase64),
    }));

    await this.flashImages(images, onStage, onProgress);
  }

  async fetchFirmwareManifest(): Promise<FirmwareManifest> {
    const res = await fetch('./firmware/manifest.json', { cache: 'no-cache' });
    if (!res.ok) {
      throw new Error('Could not load firmware/manifest.json.');
    }
    return (await res.json()) as FirmwareManifest;
  }

  async flashPrecompiledFirmware(
    entry: FirmwareEntry,
    onStage: (stage: UploadStage, detail: string) => void,
    onProgress: (pct: number) => void
  ): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('No ESP32 board is connected. Please connect your ESP32 via USB first.');
    }

    onStage('preparing', `Downloading precompiled firmware (${entry.name})...`);
    onProgress(5);

    const images: { address: number; data: string; name: string }[] = [];
    for (let i = 0; i < entry.parts.length; i++) {
      const part = entry.parts[i];
      const url = `./${part.path.replace(/^\.?\//, '')}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Could not download firmware file: ${part.path} (HTTP ${res.status})`);
      }
      const buf = await res.arrayBuffer();
      images.push({
        name: part.path.split('/').pop() || part.path,
        address: parseInt(part.address, 16),
        data: arrayBufferToBinaryString(buf),
      });
      onProgress(5 + Math.round(((i + 1) / entry.parts.length) * 5));
    }

    await this.flashImages(images, onStage, onProgress);
  }

  async uploadBinFile(
    file: File,
    address: number,
    onStage: (stage: UploadStage, detail: string) => void,
    onProgress: (pct: number) => void
  ): Promise<void> {
    const data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Failed to read .bin file.'));
      reader.readAsBinaryString(file);
    });

    await this.flashImages([{ name: file.name, address, data }], onStage, onProgress);
  }

  async startSerialMonitor(onLine: (text: string) => void): Promise<void> {
    if (!this.port) {
      throw new Error('Connect an ESP32 board before starting the Serial Monitor.');
    }
    await this.stopSerialMonitor();
    await safeReleasePort(this.transport, this.port);
    this.transport = null;
    this.loader = null;

    await this.port.open({ baudRate: 115200 });
    if (!this.port.readable) {
      throw new Error('Serial port is not readable.');
    }

    this.monitorActive = true;
    const decoder = new TextDecoder();
    const reader = this.port.readable.getReader();
    this.monitorReader = reader;

    (async () => {
      try {
        while (this.monitorActive) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value) {
            onLine(decoder.decode(value, { stream: true }));
          }
        }
      } catch {
        // stream closed or disconnected
      } finally {
        try {
          reader.releaseLock();
        } catch {
          // ignore
        }
        this.monitorReader = null;
        this.monitorActive = false;
      }
    })();
  }

  async stopSerialMonitor(): Promise<void> {
    this.monitorActive = false;
    if (this.monitorReader) {
      try {
        await this.monitorReader.cancel();
      } catch {
        // ignore
      }
      try {
        this.monitorReader.releaseLock();
      } catch {
        // ignore
      }
      this.monitorReader = null;
    }
    if (this.port && (this.port.readable || this.port.writable)) {
      try {
        await this.port.close();
      } catch {
        // ignore
      }
      await sleep(300);
    }
  }
}

export const esp32Service = new ESP32HardwareService();
