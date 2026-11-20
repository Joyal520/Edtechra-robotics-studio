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
const FQBN = 'esp32:esp32:esp32:FlashMode=dio,FlashFreq=40';
const OUT_ROOT = path.join(ROOT, 'public', 'firmware');
const COMMON_DIR = path.join(OUT_ROOT, 'common');
const CACHE_DIR = path.join(os.tmpdir(), 'edtechra-esp32-dio40-cache');

const SKETCHES = [
  // LEVEL 3 — BUILT-IN BLINK
  {
    id: 'level-3-blink',
    level: 3,
    name: 'Normal Blink (1s)',
    folder: 'level-3',
    filename: 'blink.bin',
    description: 'Blinks built-in LED (GPIO 2) every 1 second.',
    code: `void setup() { Serial.begin(115200); pinMode(2, OUTPUT); }
void loop() { digitalWrite(2, HIGH); Serial.println("LED ON"); delay(1000); digitalWrite(2, LOW); Serial.println("LED OFF"); delay(1000); }`,
  },
  {
    id: 'level-3-blink-slow',
    level: 3,
    name: 'Slow Blink (2s)',
    folder: 'level-3',
    filename: 'blink-slow.bin',
    description: 'Blinks built-in LED (GPIO 2) slowly every 2 seconds.',
    code: `void setup() { Serial.begin(115200); pinMode(2, OUTPUT); }
void loop() { digitalWrite(2, HIGH); Serial.println("LED ON (2s)"); delay(2000); digitalWrite(2, LOW); Serial.println("LED OFF (2s)"); delay(2000); }`,
  },
  {
    id: 'level-3-blink-fast',
    level: 3,
    name: 'Fast Blink (250ms)',
    folder: 'level-3',
    filename: 'blink-fast.bin',
    description: 'Flashes built-in LED (GPIO 2) quickly every 250ms.',
    code: `void setup() { Serial.begin(115200); pinMode(2, OUTPUT); }
void loop() { digitalWrite(2, HIGH); Serial.println("LED ON (250ms)"); delay(250); digitalWrite(2, LOW); Serial.println("LED OFF (250ms)"); delay(250); }`,
  },

  // LEVEL 4 — EXTERNAL LED (GPIO 23)
  {
    id: 'level-4-slow',
    level: 4,
    name: 'External LED — Slow',
    folder: 'level-4',
    filename: 'external-led-slow.bin',
    description: 'Blinks external LED on GPIO 23 every 1.5 seconds.',
    code: `const int LED = 23;
void setup() { pinMode(LED, OUTPUT); pinMode(2, OUTPUT); }
void loop() { digitalWrite(LED, HIGH); digitalWrite(2, HIGH); delay(1500); digitalWrite(LED, LOW); digitalWrite(2, LOW); delay(1500); }`,
  },
  {
    id: 'level-4-medium',
    level: 4,
    name: 'External LED — Medium',
    folder: 'level-4',
    filename: 'external-led.bin',
    description: 'Blinks external LED on GPIO 23 every 600ms.',
    code: `const int LED = 23;
void setup() { pinMode(LED, OUTPUT); pinMode(2, OUTPUT); }
void loop() { digitalWrite(LED, HIGH); digitalWrite(2, HIGH); delay(600); digitalWrite(LED, LOW); digitalWrite(2, LOW); delay(600); }`,
  },
  {
    id: 'level-4-fast',
    level: 4,
    name: 'External LED — Fast',
    folder: 'level-4',
    filename: 'external-led-fast.bin',
    description: 'Flashes external LED on GPIO 23 rapidly every 200ms.',
    code: `const int LED = 23;
void setup() { pinMode(LED, OUTPUT); pinMode(2, OUTPUT); }
void loop() { digitalWrite(LED, HIGH); digitalWrite(2, HIGH); delay(200); digitalWrite(LED, LOW); digitalWrite(2, LOW); delay(200); }`,
  },

  // LEVEL 5 — SOS MORSE SIGNAL (GPIO 23 + GPIO 2)
  {
    id: 'level-5-sos',
    level: 5,
    name: 'Standard SOS Signal',
    folder: 'level-5',
    filename: 'sos.bin',
    description: '3 short, 3 long, 3 short Morse flashes on GPIO 23 & built-in LED.',
    code: `void flash(int ms) { digitalWrite(23, HIGH); digitalWrite(2, HIGH); delay(ms); digitalWrite(23, LOW); digitalWrite(2, LOW); delay(250); }
void setup() { pinMode(23, OUTPUT); pinMode(2, OUTPUT); }
void loop() {
  for (int i=0;i<3;i++) flash(200);
  delay(300);
  for (int i=0;i<3;i++) flash(650);
  delay(300);
  for (int i=0;i<3;i++) flash(200);
  delay(1500);
}`,
  },
  {
    id: 'level-5-sos-fast',
    level: 5,
    name: 'Fast Emergency SOS',
    folder: 'level-5',
    filename: 'sos-fast.bin',
    description: 'Faster emergency S-O-S beacon on GPIO 23 & built-in LED.',
    code: `void flash(int ms) { digitalWrite(23, HIGH); digitalWrite(2, HIGH); delay(ms); digitalWrite(23, LOW); digitalWrite(2, LOW); delay(140); }
void setup() { pinMode(23, OUTPUT); pinMode(2, OUTPUT); }
void loop() {
  for (int i=0;i<3;i++) flash(120);
  delay(200);
  for (int i=0;i<3;i++) flash(400);
  delay(200);
  for (int i=0;i<3;i++) flash(120);
  delay(900);
}`,
  },

  // LEVEL 6 — TRAFFIC LIGHT (Red 23, Yellow 22, Green 21)
  {
    id: 'level-6-traffic',
    level: 6,
    name: 'Traffic Light (Standard)',
    folder: 'level-6',
    filename: 'traffic-lights.bin',
    description: 'Red (23) → Green (21) → Yellow (22) → Repeat.',
    code: `const int RED=23, YEL=22, GRN=21;
void setup() { pinMode(RED,OUTPUT); pinMode(YEL,OUTPUT); pinMode(GRN,OUTPUT); }
void loop() {
  digitalWrite(RED,HIGH); digitalWrite(YEL,LOW); digitalWrite(GRN,LOW); delay(3000);
  digitalWrite(RED,LOW); digitalWrite(GRN,HIGH); delay(3000);
  digitalWrite(GRN,LOW); digitalWrite(YEL,HIGH); delay(1500);
  digitalWrite(YEL,LOW);
}`,
  },
  {
    id: 'level-6-pedestrian',
    level: 6,
    name: 'Pedestrian Crossing Mode',
    folder: 'level-6',
    filename: 'traffic-pedestrian.bin',
    description: 'Flashes Green before turning Yellow and Red for safe crossing.',
    code: `const int RED=23, YEL=22, GRN=21;
void setup() { pinMode(RED,OUTPUT); pinMode(YEL,OUTPUT); pinMode(GRN,OUTPUT); }
void loop() {
  digitalWrite(RED,HIGH); digitalWrite(YEL,LOW); digitalWrite(GRN,LOW); delay(4000);
  digitalWrite(RED,LOW); digitalWrite(GRN,HIGH); delay(2500);
  for (int i=0;i<4;i++) { digitalWrite(GRN,LOW); delay(250); digitalWrite(GRN,HIGH); delay(250); }
  digitalWrite(GRN,LOW); digitalWrite(YEL,HIGH); delay(1500);
  digitalWrite(YEL,LOW);
}`,
  },

  // LEVEL 7 — BUTTON CONTROLLER (Button GPIO 18 to GND with INPUT_PULLUP, LED GPIO 23)
  {
    id: 'level-7-momentary',
    level: 7,
    name: 'Press & Hold Button LED',
    folder: 'level-7',
    filename: 'button-led.bin',
    description: 'Press button (GPIO 18) = LED ON, Release = LED OFF.',
    code: `const int BTN=18, LED=23;
void setup() { pinMode(BTN, INPUT_PULLUP); pinMode(LED, OUTPUT); pinMode(2, OUTPUT); }
void loop() {
  bool pressed = (digitalRead(BTN) == LOW);
  digitalWrite(LED, pressed ? HIGH : LOW);
  digitalWrite(2, pressed ? HIGH : LOW);
  delay(20);
}`,
  },
  {
    id: 'level-7-toggle',
    level: 7,
    name: 'Toggle Switch Button LED',
    folder: 'level-7',
    filename: 'button-toggle.bin',
    description: 'Press once = LED ON, Press again = LED OFF.',
    code: `const int BTN=18, LED=23;
bool state=false, last=HIGH;
void setup() { pinMode(BTN, INPUT_PULLUP); pinMode(LED, OUTPUT); pinMode(2, OUTPUT); }
void loop() {
  bool cur = digitalRead(BTN);
  if (last == HIGH && cur == LOW) {
    state = !state;
    digitalWrite(LED, state ? HIGH : LOW);
    digitalWrite(2, state ? HIGH : LOW);
    delay(200);
  }
  last = cur;
  delay(15);
}`,
  },

  // LEVEL 8 — REACTION SPEED GAME (Button 18, LED 23)
  {
    id: 'level-8-reaction',
    level: 8,
    name: 'Reaction Speed Game',
    folder: 'level-8',
    filename: 'reaction-game.bin',
    description: 'Waits randomly, lights LED (23), measures button (18) reflex time in ms.',
    code: `const int BTN=18, LED=23;
void setup() { Serial.begin(115200); pinMode(BTN, INPUT_PULLUP); pinMode(LED, OUTPUT); pinMode(2, OUTPUT); randomSeed(analogRead(34)); }
void loop() {
  digitalWrite(LED, LOW); digitalWrite(2, LOW);
  Serial.println("Get ready...");
  delay(random(2000, 4500));
  digitalWrite(LED, HIGH); digitalWrite(2, HIGH);
  unsigned long t0 = millis();
  while (digitalRead(BTN) == HIGH) { delay(1); }
  unsigned long rt = millis() - t0;
  digitalWrite(LED, LOW); digitalWrite(2, LOW);
  Serial.print("YOUR REACTION TIME: "); Serial.print(rt); Serial.println(" ms");
  delay(2000);
}`,
  },

  // LEVEL 9 — ELECTRONIC BUZZER (GPIO 25)
  {
    id: 'level-9-alarm',
    level: 9,
    name: 'Buzzer Alarm Siren',
    folder: 'level-9',
    filename: 'buzzer.bin',
    description: 'Alternating high-low alarm siren on GPIO 25.',
    code: `const int BUZ=25;
void setup() { pinMode(BUZ, OUTPUT); }
void loop() { tone(BUZ, 950, 350); delay(400); tone(BUZ, 650, 350); delay(400); }`,
  },
  {
    id: 'level-9-doorbell',
    level: 9,
    name: 'Ding-Dong Doorbell',
    folder: 'level-9',
    filename: 'buzzer-doorbell.bin',
    description: 'Classic two-tone Ding-Dong chime on GPIO 25.',
    code: `const int BUZ=25;
void setup() { pinMode(BUZ, OUTPUT); }
void loop() { tone(BUZ, 659, 400); delay(450); tone(BUZ, 523, 600); delay(2500); }`,
  },

  // LEVEL 10 — ELECTRONIC MUSIC (GPIO 25)
  {
    id: 'level-10-melody',
    level: 10,
    name: 'Electronic Melody',
    folder: 'level-10',
    filename: 'music.bin',
    description: 'Plays a cheerful musical scale & melody on GPIO 25.',
    code: `const int BUZ=25;
int notes[] = {262, 294, 330, 349, 392, 440, 494, 523};
void setup() { pinMode(BUZ, OUTPUT); }
void loop() {
  for (int i=0;i<8;i++) { tone(BUZ, notes[i], 220); delay(260); }
  delay(600);
  for (int i=7;i>=0;i--) { tone(BUZ, notes[i], 220); delay(260); }
  delay(1200);
}`,
  },
  {
    id: 'level-10-game',
    level: 10,
    name: 'Game & Celebration Sounds',
    folder: 'level-10',
    filename: 'music-game.bin',
    description: 'Arcade coin, power-up, and victory fanfare on GPIO 25.',
    code: `const int BUZ=25;
void setup() { pinMode(BUZ, OUTPUT); }
void loop() {
  tone(BUZ, 988, 100); delay(120); tone(BUZ, 1319, 300); delay(800);
  int win[] = {523, 659, 784, 1047};
  for (int i=0;i<4;i++) { tone(BUZ, win[i], 180); delay(210); }
  delay(1500);
}`,
  },

  // LEVEL 11 — LED PATTERNS (4 LEDs: 23, 22, 21, 19)
  {
    id: 'level-11-knight',
    level: 11,
    name: 'Knight Rider Sweep',
    folder: 'level-11',
    filename: 'led-patterns.bin',
    description: 'Back-and-forth running light across GPIOs 23, 22, 21, 19.',
    code: `int pins[] = {23, 22, 21, 19};
void setup() { for (int i=0;i<4;i++) pinMode(pins[i], OUTPUT); }
void loop() {
  for (int i=0;i<4;i++) { digitalWrite(pins[i], HIGH); delay(140); digitalWrite(pins[i], LOW); }
  for (int i=2;i>=1;i--) { digitalWrite(pins[i], HIGH); delay(140); digitalWrite(pins[i], LOW); }
}`,
  },
  {
    id: 'level-11-police',
    level: 11,
    name: 'Police Strobe Lights',
    folder: 'level-11',
    filename: 'led-police.bin',
    description: 'Alternating double-flash strobe on GPIOs 23/22 and 21/19.',
    code: `int pins[] = {23, 22, 21, 19};
void setup() { for (int i=0;i<4;i++) pinMode(pins[i], OUTPUT); }
void loop() {
  for (int k=0;k<2;k++) { digitalWrite(23,HIGH); digitalWrite(22,HIGH); delay(90); digitalWrite(23,LOW); digitalWrite(22,LOW); delay(90); }
  for (int k=0;k<2;k++) { digitalWrite(21,HIGH); digitalWrite(19,HIGH); delay(90); digitalWrite(21,LOW); digitalWrite(19,LOW); delay(90); }
}`,
  },

  // LEVEL 12 — DJ LIGHT SHOW (4 LEDs: 23, 22, 21, 19)
  {
    id: 'level-12-dj',
    level: 12,
    name: 'DJ Light — Party Mix (All 5 Modes)',
    folder: 'level-12',
    filename: 'dj-light.bin',
    description: 'Auto-cycles Disco, Chase, Alternating, Police, and Party strobe!',
    code: `int p[] = {23, 22, 21, 19};
void all(int v) { for (int i=0;i<4;i++) digitalWrite(p[i], v); }
void setup() { for (int i=0;i<4;i++) pinMode(p[i], OUTPUT); }
void loop() {
  // 1. Disco random
  for (int k=0;k<12;k++) { all(LOW); digitalWrite(p[random(0,4)], HIGH); delay(110); }
  // 2. LED Chase
  for (int k=0;k<3;k++) for (int i=0;i<4;i++) { all(LOW); digitalWrite(p[i], HIGH); delay(100); }
  // 3. Alternating
  for (int k=0;k<6;k++) { digitalWrite(23,HIGH); digitalWrite(21,HIGH); digitalWrite(22,LOW); digitalWrite(19,LOW); delay(180);
    digitalWrite(23,LOW); digitalWrite(21,LOW); digitalWrite(22,HIGH); digitalWrite(19,HIGH); delay(180); }
  // 4. Party Strobe
  for (int k=0;k<6;k++) { all(HIGH); delay(80); all(LOW); delay(80); }
}`,
  },
  {
    id: 'level-12-disco',
    level: 12,
    name: 'DJ Light — Disco Beat',
    folder: 'level-12',
    filename: 'dj-disco.bin',
    description: 'Fast energetic disco sparkle across 4 LEDs.',
    code: `int p[] = {23, 22, 21, 19};
void setup() { for (int i=0;i<4;i++) pinMode(p[i], OUTPUT); }
void loop() {
  for (int i=0;i<4;i++) digitalWrite(p[i], random(0,2));
  delay(120);
}`,
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
  if (!existsSync(CLI)) throw new Error(`arduino-cli not found at ${CLI}`);
  await fs.mkdir(COMMON_DIR, { recursive: true });
  await fs.mkdir(CACHE_DIR, { recursive: true });

  const bootApp0Src = await findBootApp0();
  if (bootApp0Src) {
    await fs.copyFile(bootApp0Src, path.join(COMMON_DIR, 'boot_app0.bin'));
  }

  let commonCopied = existsSync(path.join(COMMON_DIR, 'bootloader.bin'));
  const manifestItems = [];

  for (const sk of SKETCHES) {
    const levelDir = path.join(OUT_ROOT, sk.folder);
    const destBin = path.join(levelDir, sk.filename);
    await fs.mkdir(levelDir, { recursive: true });

    // Reuse already-compiled Level 3 binaries if present
    if (sk.level === 3 && existsSync(destBin)) {
      console.log(`Skipping already-built ${sk.id}`);
    } else {
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

      await fs.copyFile(path.join(buildDir, app), destBin);
      const stat = await fs.stat(destBin);
      console.log(`  -> ${sk.folder}/${sk.filename} (${Math.round(stat.size / 1024)} KB)`);
      await fs.rm(tmpRoot, { recursive: true, force: true }).catch(() => {});
    }

    const parts = [
      { path: 'firmware/common/bootloader.bin', address: '0x1000' },
      { path: 'firmware/common/partitions.bin', address: '0x8000' },
    ];
    if (bootApp0Src) parts.push({ path: 'firmware/common/boot_app0.bin', address: '0xe000' });
    parts.push({ path: `firmware/${sk.folder}/${sk.filename}`, address: '0x10000' });

    manifestItems.push({
      id: sk.id,
      level: sk.level,
      name: sk.name,
      description: sk.description,
      board: 'ESP32 DevKit V1 (DIO 40MHz)',
      version: '1.1.0',
      flashConfig: { flashSize: '4MB', flashMode: 'dio', flashFreq: '40m' },
      parts,
    });
  }

  await fs.writeFile(
    path.join(OUT_ROOT, 'manifest.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), boardFqbn: FQBN, firmware: manifestItems }, null, 2),
    'utf8'
  );
  console.log(`Done! Manifest has ${manifestItems.length} precompiled firmware images.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
