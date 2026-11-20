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
  const binary = atob(base64);
  return binary;
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

    const log = (msg: string) => {
      if (onLog) onLog(msg);
    };

    log('Requesting USB Serial device from browser...');
    let port: SerialPort;
    try {
      port = await navigator.serial.requestPort();
    } catch (err) {
      const e = err as Error;
      if (e.name === 'NotFoundError') {
        throw new Error(
          'No port was selected. In the browser popup, click your board (e.g. "CP2102 USB to UART Bridge Controller (COM14)") so it is highlighted, then press Connect.'
        );
      }
      throw err;
    }
    const info = port.getInfo();

    // STAGE 1 — Genuinely open the USB serial port. This proves a real device is attached.
    log('Opening USB serial port at 115200 baud...');
    try {
      await port.open({ baudRate: 115200 });
      await port.close();
    } catch (err) {
      const e = err as Error;
      throw new Error(
        e.name === 'InvalidStateError'
          ? 'The port is already open in another tab or program. Close Arduino IDE, PuTTY, other Serial Monitors, or other EdTechra tabs, then try again.'
          : e.name === 'NetworkError'
          ? 'Windows could not open the COM port. It is probably in use by Arduino IDE or another Serial Monitor. Close it, unplug/replug the ESP32, and try again.'
          : `Could not open the serial port: ${e.message}`
      );
    }
    log('USB serial port opened successfully.');

    const vidHex = info.usbVendorId ? `0x${info.usbVendorId.toString(16).toUpperCase().padStart(4, '0')}` : '';
    const pidHex = info.usbProductId ? `0x${info.usbProductId.toString(16).toUpperCase().padStart(4, '0')}` : '';
    const bridge =
      info.usbVendorId === 0x10c4 ? 'CP210x' : info.usbVendorId === 0x1a86 ? 'CH340' : info.usbVendorId === 0x0403 ? 'FTDI' : info.usbVendorId === 0x303a ? 'Native USB' : 'USB Serial';
    const portLabel = vidHex ? `${bridge} (${vidHex}:${pidHex})` : 'USB Serial Port';

    this.port = port;
    this.deviceInfo = {
      chip: 'ESP32 (USB serial detected)',
      usbVendorId: info.usbVendorId,
      usbProductId: info.usbProductId,
      portLabel,
      connectedAt: new Date().toLocaleTimeString(),
    };

    // STAGE 2 — Try to sync with the ESP32 ROM bootloader to read the chip type and MAC.
    try {
      const loader = await this.ensureLoader(log);
      // Return the board to normal run mode so its current program keeps running.
      try {
        await loader.after('hard_reset');
      } catch {
        // ignore
      }
      await this.releaseLoader();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      log(`Bootloader sync not completed yet (${msg}).`);
      log('Board is connected over USB. Chip details will be read again when you upload.');
      log('Tip: if upload fails, hold the BOOT button on the ESP32 while the upload starts.');
    }

    return this.deviceInfo;
  }

  /** Sync with the ESP32 ROM bootloader (needed for flashing). Safe to call repeatedly. */
  async ensureLoader(onLog?: (line: string) => void): Promise<ESPLoader> {
    if (this.loader) return this.loader;
    if (!this.port) throw new Error('No ESP32 board is connected. Connect your ESP32 first.');
    const log = (msg: string) => onLog?.(msg);

    log('Syncing with ESP32 bootloader (auto-reset)...');
    // Transport opens the port itself, so make sure it is closed first (e.g. after Serial Monitor).
    try {
      if (this.port.readable || this.port.writable) await this.port.close();
    } catch {
      // ignore
    }
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
      const chipName = await loader.main();
      let mac = '';
      try {
        mac = await loader.chip.readMac(loader);
      } catch {
        mac = '';
      }
      this.transport = transport;
      this.loader = loader;
      if (this.deviceInfo) {
        this.deviceInfo = {
          ...this.deviceInfo,
          chip: String(chipName).split(' (')[0] || 'ESP32',
          mac: mac || undefined,
        };
      }
      log(`Detected ${this.deviceInfo?.chip}${mac ? ` (MAC: ${mac})` : ''}`);
      return loader;
    } catch (err) {
      try {
        await transport.disconnect();
      } catch {
        // ignore
      }
      try {
        if (this.port.readable || this.port.writable) await this.port.close();
      } catch {
        // ignore
      }
      throw err;
    }
  }

  async disconnect(): Promise<void> {
    await this.stopSerialMonitor();
    if (this.transport) {
      try {
        await this.transport.disconnect();
      } catch {
        // ignore
      }
    }
    if (this.port) {
      try {
        if (this.port.readable || this.port.writable) {
          await this.port.close();
        }
      } catch {
        // ignore
      }
    }
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
        'Could not reach the local ESP32 Compiler Bridge (http://localhost:3001). GitHub Pages hosts the static web app only — run "npm run dev:server" on your PC for one-click C++ compilation, or use the "Flash .bin to ESP32" option directly over USB.',
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

    await this.stopSerialMonitor();

    onStage('checking', 'Checking board connection and syncing with ESP32 bootloader...');
    onProgress(10);
    let loader: ESPLoader;
    try {
      loader = await this.ensureLoader();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(
        `Could not enter ESP32 upload mode (${msg}). Hold the BOOT button on the ESP32, click Upload again, and release BOOT once "Uploading..." appears.`
      );
    }

    onStage('preparing', `Preparing ${images.length} firmware image(s)...`);
    const fileArray = images.map((img) => ({
      data: img.data,
      address: img.address,
    }));
    onProgress(20);

    onStage('uploading', 'Uploading firmware to ESP32 flash memory...');
    await loader.writeFlash({
      fileArray,
      flashSize: 'keep',
      flashMode: 'keep',
      flashFreq: 'keep',
      eraseAll: false,
      compress: true,
      reportProgress: (fileIndex: number, written: number, total: number) => {
        const filePct = total > 0 ? written / total : 0;
        const overall = 20 + Math.round(((fileIndex + filePct) / Math.max(1, fileArray.length)) * 70);
        onProgress(Math.min(92, overall));
      },
    });

    onStage('verifying', 'Verifying flash and resetting ESP32...');
    onProgress(96);
    await loader.after('hard_reset');
    // Release the bootloader session so the new program runs and the port is free
    // for the Serial Monitor. The next upload re-syncs automatically.
    await this.releaseLoader();

    onProgress(100);
    onStage('done', 'Program uploaded and running on ESP32!');
  }

  private async releaseLoader(): Promise<void> {
    if (this.transport) {
      try {
        await this.transport.disconnect();
      } catch {
        // ignore
      }
    }
    this.transport = null;
    this.loader = null;
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
    onProgress(12);

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

    onStage('checking', 'Checking board connection...');
    onProgress(5);

    onStage('preparing', `Downloading precompiled firmware (${entry.name})...`);
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
      onProgress(8 + Math.round(((i + 1) / entry.parts.length) * 10));
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
    // Bootloader session holds the port; release it and reset the board into run mode.
    if (this.loader) {
      try {
        await this.loader.after('hard_reset');
      } catch {
        // ignore
      }
      await this.releaseLoader();
    }

    // Ensure port is open at 115200
    if (!this.port.readable) {
      await this.port.open({ baudRate: 115200 });
    }
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
      this.monitorReader = null;
    }
  }
}

export const esp32Service = new ESP32HardwareService();
