import React, { useEffect, useState } from 'react';
import { CheckCircle2, Cpu, Loader2, Plug, Unplug, Upload, XCircle } from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import {
  esp32Service,
  type FirmwareEntry,
  type UploadStage,
} from '../services/esp32Service';

interface BeginnerFirmwareUploaderProps {
  level: number;
  firmwareIds: string[];
  title?: string;
  onUploadSuccess?: (firmwareId: string) => void;
}

export const BeginnerFirmwareUploader: React.FC<BeginnerFirmwareUploaderProps> = ({
  level,
  firmwareIds,
  title = 'Upload Precompiled Firmware to ESP32',
  onUploadSuccess,
}) => {
  const { device, hwConnecting, hwError, connectESP32, disconnectESP32, markUploaded } = useStudio();
  const [entries, setEntries] = useState<FirmwareEntry[]>([]);
  const [selectedId, setSelectedId] = useState<string>(firmwareIds[0] || '');
  const [manifestError, setManifestError] = useState<string | null>(null);
  const [stage, setStage] = useState<UploadStage>('idle');
  const [detail, setDetail] = useState('');
  const [progressPct, setProgressPct] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedIds, setUploadedIds] = useState<string[]>([]);

  useEffect(() => {
    esp32Service
      .fetchFirmwareManifest()
      .then((m) => {
        const matched = m.firmware.filter((f) => firmwareIds.includes(f.id) || f.level === level);
        setEntries(matched);
        if (matched.length > 0 && !matched.some((f) => f.id === selectedId)) {
          setSelectedId(matched[0].id);
        }
      })
      .catch((err) => {
        setManifestError(err instanceof Error ? err.message : 'Failed to load firmware manifest.');
      });
  }, [level, firmwareIds, selectedId]);

  const selectedEntry = entries.find((e) => e.id === selectedId) || entries[0];
  const isBusy =
    stage === 'checking' ||
    stage === 'preparing' ||
    stage === 'uploading' ||
    stage === 'verifying';

  const handleFlash = async () => {
    if (!selectedEntry) return;
    setUploadError(null);
    setProgressPct(0);
    setStage('checking');
    try {
      await esp32Service.flashPrecompiledFirmware(
        selectedEntry,
        (s, d) => {
          setStage(s);
          setDetail(d);
        },
        (p) => setProgressPct(p)
      );
      markUploaded();
      setUploadedIds((prev) => (prev.includes(selectedEntry.id) ? prev : [...prev, selectedEntry.id]));
      onUploadSuccess?.(selectedEntry.id);
    } catch (err) {
      setStage('error');
      setUploadError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <span className="tag" style={{ marginBottom: 6 }}>
            GITHUB PAGES READY • NO COMPILER SERVER NEEDED
          </span>
          <h3 style={{ margin: 0, fontSize: 17 }}>{title}</h3>
        </div>
        {selectedEntry && (
          <span className="tag tag-neutral">
            <Cpu size={13} /> {selectedEntry.board}
          </span>
        )}
      </div>

      {/* Step 1 & 2: Connection Status Banner */}
      <div className={`status-banner ${device ? 'connected' : 'disconnected'}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {device ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
          <div>
            <div>{device ? 'ESP32 CONNECTED SUCCESSFULLY' : 'ESP32 NOT CONNECTED'}</div>
            <div style={{ fontSize: 12.5, fontWeight: 500, opacity: 0.9 }}>
              {device
                ? `${device.chip} • ${device.portLabel}`
                : 'Plug your ESP32 into USB and click Connect ESP32.'}
            </div>
          </div>
        </div>
        <div>
          {!device ? (
            <button className="btn btn-primary btn-sm" onClick={connectESP32} disabled={hwConnecting}>
              {hwConnecting ? <Loader2 size={15} /> : <Plug size={15} />}
              {hwConnecting ? 'Connecting...' : 'Connect ESP32'}
            </button>
          ) : (
            <button className="btn btn-secondary btn-sm" onClick={disconnectESP32}>
              <Unplug size={15} /> Disconnect
            </button>
          )}
        </div>
      </div>

      {hwError && (
        <div className="check-item err">
          <XCircle size={18} color="#DC2626" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>{hwError}</div>
        </div>
      )}

      {manifestError && (
        <div className="check-item err">
          <XCircle size={18} color="#DC2626" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>{manifestError}</div>
        </div>
      )}

      {/* Variant Selector (Experiment Mode) */}
      {entries.length > 0 && (
        <div>
          <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 8 }}>
            Choose Firmware Variant:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 10 }}>
            {entries.map((item) => {
              const active = item.id === selectedEntry?.id;
              const wasFlashed = uploadedIds.includes(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedId(item.id);
                    setUploadError(null);
                  }}
                  style={{
                    textAlign: 'left',
                    padding: 12,
                    borderRadius: 11,
                    border: `2px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                    background: active ? 'var(--primary-light)' : '#FFFFFF',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                    <strong style={{ fontSize: 14, color: active ? 'var(--primary)' : 'var(--text)' }}>
                      {item.name}
                    </strong>
                    {wasFlashed && <CheckCircle2 size={15} color="#16A34A" />}
                  </div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                    {item.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3: Upload Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <button
          className="btn btn-primary"
          onClick={handleFlash}
          disabled={!device || !selectedEntry || isBusy}
        >
          {isBusy ? <Loader2 size={16} /> : <Upload size={16} />}
          {isBusy
            ? 'Flashing Firmware...'
            : selectedEntry
            ? `Upload ${selectedEntry.name}`
            : 'Upload Firmware'}
        </button>
        {!device && (
          <span className="muted" style={{ fontSize: 13 }}>
            Connect your ESP32 above first to enable uploading.
          </span>
        )}
      </div>

      {/* Step 4: Upload Progress */}
      {stage !== 'idle' && (
        <div className="card-sm" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="progress-track">
            <div
              className={`progress-fill ${stage === 'done' ? 'success' : ''}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span className="muted">{detail}</span>
            <strong>{progressPct}%</strong>
          </div>
          {stage === 'checking' && (
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 9,
                background: 'var(--warning-bg)',
                border: '1px solid var(--warning-border)',
                color: '#92400E',
                fontSize: 13,
              }}
            >
              <strong>Hold BOOT button now if needed:</strong> Many ESP32 DevKit boards require pressing and holding the{' '}
              <strong>BOOT</strong> button while syncing. Release BOOT as soon as <strong>Uploading…</strong> appears!
            </div>
          )}
        </div>
      )}

      {/* Step 5: Success / Error */}
      {stage === 'done' && (
        <div className="check-item ok">
          <CheckCircle2 size={19} color="#16A34A" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong>Firmware Uploaded Successfully!</strong> Look at your real ESP32 board — your program is now running!
          </div>
        </div>
      )}

      {uploadError && (
        <div className="check-item err">
          <XCircle size={19} color="#DC2626" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong>Upload Error:</strong> {uploadError}
          </div>
        </div>
      )}
    </div>
  );
};
