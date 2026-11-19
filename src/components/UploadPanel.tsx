import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Cpu, FileUp, Loader2, Plug, RefreshCw, Upload, Wrench } from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { esp32Service, type CompilerHealth, type UploadStage } from '../services/esp32Service';

interface UploadPanelProps {
  code: string;
  fqbn?: string;
  buttonLabel?: string;
  onUploadSuccess?: () => void;
}

const STAGE_STEPS: { key: UploadStage; label: string }[] = [
  { key: 'checking', label: 'Checking board...' },
  { key: 'preparing', label: 'Preparing program...' },
  { key: 'uploading', label: 'Uploading...' },
  { key: 'verifying', label: 'Verifying...' },
];

export const UploadPanel: React.FC<UploadPanelProps> = ({
  code,
  fqbn = 'esp32:esp32:esp32',
  buttonLabel = 'Upload to ESP32',
  onUploadSuccess,
}) => {
  const { device, hwConnecting, hwError, connectESP32, markUploaded } = useStudio();
  const [stage, setStage] = useState<UploadStage>('idle');
  const [detail, setDetail] = useState('');
  const [progressPct, setProgressPct] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [setupSteps, setSetupSteps] = useState<string[] | null>(null);
  const [compiler, setCompiler] = useState<CompilerHealth | null>(null);
  const [binAddress, setBinAddress] = useState('0x0');
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    esp32Service.checkCompilerHealth().then(setCompiler);
  }, []);

  const isBusy = stage === 'checking' || stage === 'compiling' || stage === 'preparing' || stage === 'uploading' || stage === 'verifying';

  const handleCompileAndUpload = async () => {
    setErrorMsg(null);
    setSetupSteps(null);
    setProgressPct(0);
    setStage('checking');
    setDetail('Checking board connection...');
    try {
      await esp32Service.compileAndUpload(
        code,
        (s, d) => {
          setStage(s);
          setDetail(d);
        },
        (p) => setProgressPct(p),
        fqbn
      );
      markUploaded();
      onUploadSuccess?.();
    } catch (err) {
      const e = err as Error & { setupSteps?: string[] };
      setStage('error');
      setErrorMsg(e.message || 'Upload failed.');
      if (e.setupSteps) setSetupSteps(e.setupSteps);
    }
  };

  const handleBinUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setErrorMsg('Please select a compiled .bin firmware file first.');
      return;
    }
    setErrorMsg(null);
    setSetupSteps(null);
    setProgressPct(0);
    setStage('checking');
    try {
      const addr = parseInt(binAddress, 16) || 0;
      await esp32Service.uploadBinFile(
        file,
        addr,
        (s, d) => {
          setStage(s);
          setDetail(d);
        },
        (p) => setProgressPct(p)
      );
      markUploaded();
      onUploadSuccess?.();
    } catch (err) {
      setStage('error');
      setErrorMsg(err instanceof Error ? err.message : String(err));
    }
  };

  const stageIndex = (s: UploadStage) => {
    if (s === 'checking') return 0;
    if (s === 'compiling' || s === 'preparing') return 1;
    if (s === 'uploading') return 2;
    if (s === 'verifying') return 3;
    if (s === 'done') return 4;
    return -1;
  };
  const currentIdx = stageIndex(stage);

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Cpu size={20} color="#22d3ee" />
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Real ESP32 Hardware Upload</div>
            <div className="muted" style={{ fontSize: 12.5 }}>
              {device ? `Connected: ${device.chip} (${device.portLabel})` : 'No ESP32 connected yet'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {!device ? (
            <button className="btn btn-primary" onClick={connectESP32} disabled={hwConnecting}>
              {hwConnecting ? <Loader2 size={16} className="spin" /> : <Plug size={16} />}
              {hwConnecting ? 'Connecting...' : '🔌 Connect My ESP32'}
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleCompileAndUpload} disabled={isBusy}>
              {isBusy ? <Loader2 size={16} /> : <Upload size={16} />}
              {isBusy ? 'Uploading...' : buttonLabel}
            </button>
          )}
        </div>
      </div>

      {hwError && (
        <div className="check-item err">
          <div>
            <strong>Connection Error:</strong> {hwError}
          </div>
        </div>
      )}

      {/* Upload Stages */}
      {stage !== 'idle' && (
        <div className="card-sm" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
            {STAGE_STEPS.map((st, idx) => {
              const done = currentIdx > idx;
              const active = currentIdx === idx;
              return (
                <div
                  key={st.key}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 8,
                    fontSize: 12.5,
                    fontWeight: 700,
                    background: done
                      ? 'rgba(16,185,129,0.14)'
                      : active
                      ? 'rgba(34,211,238,0.14)'
                      : '#0a1428',
                    border: `1px solid ${done ? '#10b981' : active ? '#22d3ee' : '#233861'}`,
                    color: done ? '#6ee7b7' : active ? '#fff' : '#93a7cc',
                  }}
                >
                  {done ? '✓ ' : active ? '● ' : '○ '}
                  {st.label}
                </div>
              );
            })}
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
            <span className="muted">{detail}</span>
            <strong>{progressPct}%</strong>
          </div>
        </div>
      )}

      {stage === 'done' && (
        <div className="check-item ok">
          <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0 }} />
          <div>
            <strong>Upload Successful!</strong> Your ESP32 has been flashed and reset. Look at your real board!
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="check-item err" style={{ flexDirection: 'column', gap: 8 }}>
          <div>
            <strong>Upload Blocked:</strong> {errorMsg}
          </div>
          {setupSteps && (
            <div style={{ width: '100%' }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>
                One-time local compiler setup (for C++ → ESP32 flashing):
              </div>
              <pre className="code-block" style={{ fontSize: 12, padding: 10 }}>
                {setupSteps.join('\n')}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Direct .bin Flasher Option */}
      <details style={{ fontSize: 13 }}>
        <summary style={{ cursor: 'pointer', color: '#93a7cc', fontWeight: 600 }}>
          <Wrench size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          Alternative: Flash a pre-compiled .bin firmware file directly over USB
          {compiler && (
            <span style={{ marginLeft: 8 }} className={compiler.installed && compiler.esp32Core ? 'tag tag-ok' : 'tag tag-warn'}>
              {compiler.installed && compiler.esp32Core
                ? `arduino-cli ready (${compiler.version || 'OK'})`
                : 'local arduino-cli not installed'}
            </span>
          )}
        </summary>
        <div className="card-sm" style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <input ref={fileRef} type="file" accept=".bin" style={{ fontSize: 13 }} />
          <label style={{ fontSize: 12.5, color: '#93a7cc' }}>
            Flash Address:{' '}
            <select
              value={binAddress}
              onChange={(e) => setBinAddress(e.target.value)}
              style={{ background: '#070d1a', border: '1px solid #233861', borderRadius: 6, padding: '4px 8px' }}
            >
              <option value="0x0">0x0 (Merged .bin)</option>
              <option value="0x10000">0x10000 (App-only .bin)</option>
            </select>
          </label>
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleBinUpload}
            disabled={!device || isBusy}
          >
            <FileUp size={15} />
            Flash .bin to ESP32
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => esp32Service.checkCompilerHealth().then(setCompiler)}
          >
            <RefreshCw size={14} />
            Recheck Compiler
          </button>
        </div>
      </details>
    </div>
  );
};
