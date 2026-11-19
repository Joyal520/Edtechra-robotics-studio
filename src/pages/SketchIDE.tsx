import React, { useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import {
  CheckCircle2,
  ClipboardPaste,
  Download,
  FileCode2,
  FolderOpen,
  Terminal,
  Trash2,
  XCircle,
} from 'lucide-react';
import { UploadPanel } from '../components/UploadPanel';
import { useStudio } from '../context/StudioContext';
import { esp32Service } from '../services/esp32Service';

const TEMPLATES: { id: string; name: string; code: string }[] = [
  {
    id: 'blink',
    name: 'Blink (Onboard LED)',
    code: `// Blink the built-in ESP32 LED on GPIO 2
void setup() {
  pinMode(2, OUTPUT);
}

void loop() {
  digitalWrite(2, HIGH);
  delay(1000);
  digitalWrite(2, LOW);
  delay(1000);
}
`,
  },
  {
    id: 'serial',
    name: 'Serial Hello World',
    code: `void setup() {
  Serial.begin(115200);
  pinMode(2, OUTPUT);
}

void loop() {
  Serial.println("Hello from ESP32!");
  digitalWrite(2, HIGH);
  delay(500);
  digitalWrite(2, LOW);
  delay(500);
}
`,
  },
  {
    id: 'blank',
    name: 'Blank Sketch',
    code: `void setup() {
  // Put your setup code here, to run once:
}

void loop() {
  // Put your main code here, to run repeatedly:
}
`,
  },
];

const BOARDS = [
  { fqbn: 'esp32:esp32:esp32', label: 'ESP32 Dev Module (ESP32-WROOM / DevKit V1)' },
  { fqbn: 'esp32:esp32:esp32s3', label: 'ESP32-S3 Dev Module' },
  { fqbn: 'esp32:esp32:esp32c3', label: 'ESP32-C3 Dev Module' },
  { fqbn: 'esp32:esp32:esp32s2', label: 'ESP32-S2 Dev Module' },
];

export const SketchIDE: React.FC = () => {
  const { device } = useStudio();
  const [sketchName, setSketchName] = useState('my_esp32_sketch.ino');
  const [code, setCode] = useState(TEMPLATES[0].code);
  const [fqbn, setFqbn] = useState(BOARDS[0].fqbn);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [monitorRunning, setMonitorRunning] = useState(false);
  const [serialOut, setSerialOut] = useState('');
  const [monitorErr, setMonitorErr] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleOpenFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSketchName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setCode(String(reader.result || ''));
      setVerifyResult(null);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setCode(text);
        setVerifyResult(null);
      }
    } catch {
      setVerifyResult({
        ok: false,
        message: 'Browser blocked clipboard read — click inside the editor and press Ctrl+V to paste.',
      });
    }
  };

  const handleDownloadSketch = () => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = sketchName.endsWith('.ino') ? sketchName : `${sketchName}.ino`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleVerify = async () => {
    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await esp32Service.compileCode(code, fqbn);
      if (res.ok) {
        setVerifyResult({
          ok: true,
          message: `Verified & compiled successfully (${res.images?.length || 1} binary image ready to flash).`,
        });
      } else {
        setVerifyResult({
          ok: false,
          message: res.error || 'Compilation failed.',
        });
      }
    } catch (err) {
      setVerifyResult({
        ok: false,
        message: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setVerifying(false);
    }
  };

  const toggleMonitor = async () => {
    setMonitorErr(null);
    if (monitorRunning) {
      await esp32Service.stopSerialMonitor();
      setMonitorRunning(false);
      return;
    }
    try {
      setMonitorRunning(true);
      await esp32Service.startSerialMonitor((chunk) => {
        setSerialOut((prev) => (prev + chunk).slice(-10000));
      });
    } catch (err) {
      setMonitorRunning(false);
      setMonitorErr(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="page-header" style={{ marginBottom: 4 }}>
        <div>
          <span className="tag" style={{ marginBottom: 8 }}>ARDUINO-STYLE FREE SKETCH EDITOR</span>
          <h1>ESP32 Sketch IDE</h1>
          <p className="muted" style={{ margin: 0 }}>
            Write, paste, or open any Arduino <code>.ino</code> / <code>.cpp</code> sketch, verify it, and upload directly to your connected ESP32 board.
          </p>
        </div>
      </div>

      {/* Arduino IDE Toolbar */}
      <div
        className="card-sm"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-success btn-sm" onClick={handleVerify} disabled={verifying}>
            <CheckCircle2 size={15} />
            {verifying ? 'Compiling...' : 'Verify / Compile'}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".ino,.cpp,.c,.h,.txt"
            onChange={handleOpenFile}
            style={{ display: 'none' }}
          />
          <button className="btn btn-secondary btn-sm" onClick={() => fileInputRef.current?.click()}>
            <FolderOpen size={15} /> Open .ino File
          </button>

          <button className="btn btn-secondary btn-sm" onClick={handlePasteClipboard}>
            <ClipboardPaste size={15} /> Paste Code
          </button>

          <button className="btn btn-secondary btn-sm" onClick={handleDownloadSketch}>
            <Download size={15} /> Save .ino
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <select
            value={fqbn}
            onChange={(e) => setFqbn(e.target.value)}
            aria-label="Select ESP32 Board"
            style={{
              background: '#081224',
              border: '1px solid #34528a',
              borderRadius: 8,
              padding: '6px 10px',
              fontSize: 13,
            }}
          >
            {BOARDS.map((b) => (
              <option key={b.fqbn} value={b.fqbn}>
                {b.label}
              </option>
            ))}
          </select>

          <select
            defaultValue=""
            onChange={(e) => {
              const t = TEMPLATES.find((x) => x.id === e.target.value);
              if (t) {
                setCode(t.code);
                setSketchName(`${t.id}.ino`);
                setVerifyResult(null);
              }
              e.target.value = '';
            }}
            aria-label="Load Example Template"
            style={{
              background: '#081224',
              border: '1px solid #233861',
              borderRadius: 8,
              padding: '6px 10px',
              fontSize: 13,
            }}
          >
            <option value="" disabled>
              Load Template...
            </option>
            {TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sketch Editor Card */}
      <div className="card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileCode2 size={17} color="#22d3ee" />
            <input
              value={sketchName}
              onChange={(e) => setSketchName(e.target.value)}
              style={{
                background: 'transparent',
                border: '1px solid #233861',
                borderRadius: 6,
                padding: '3px 8px',
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                fontWeight: 600,
              }}
            />
          </div>
          <span className="muted" style={{ fontSize: 12 }}>
            {code.split('\n').length} lines • Paste any Arduino C++ sketch or drag/open a .ino file
          </span>
        </div>

        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #233861' }}>
          <Editor
            height="380px"
            defaultLanguage="cpp"
            theme="vs-dark"
            value={code}
            onChange={(v) => setCode(v || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>

        {verifyResult && (
          <div className={`check-item ${verifyResult.ok ? 'ok' : 'err'}`}>
            {verifyResult.ok ? (
              <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
            ) : (
              <XCircle size={18} color="#f43f5e" style={{ flexShrink: 0, marginTop: 2 }} />
            )}
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)', fontSize: 12.5 }}>
              {verifyResult.message}
            </pre>
          </div>
        )}
      </div>

      {/* Real ESP32 Upload Panel */}
      <UploadPanel code={code} fqbn={fqbn} buttonLabel="Compile & Upload Sketch to ESP32" />

      {/* Integrated Serial Monitor */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Terminal size={18} color="#22d3ee" />
            <h3 style={{ margin: 0 }}>Serial Monitor (115200 baud)</h3>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className={`btn btn-sm ${monitorRunning ? 'btn-danger' : 'btn-primary'}`}
              disabled={!device}
              onClick={toggleMonitor}
            >
              {monitorRunning ? 'Stop Monitor' : 'Open Serial Monitor'}
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setSerialOut('')}>
              <Trash2 size={14} /> Clear
            </button>
          </div>
        </div>
        {monitorErr && <div className="check-item err">{monitorErr}</div>}
        <pre className="code-block" style={{ minHeight: 120, maxHeight: 240, overflowY: 'auto' }}>
          {serialOut ||
            (device
              ? 'Click "Open Serial Monitor" to view live Serial.println() output from your ESP32.'
              : 'Connect your ESP32 above to use the Serial Monitor.')}
        </pre>
      </div>
    </div>
  );
};
