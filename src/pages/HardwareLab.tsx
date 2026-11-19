import React, { useState } from 'react';
import { Loader2, Plug, Terminal, Trash2, Unplug } from 'lucide-react';
import { ESP32BoardSVG } from '../components/ESP32BoardSVG';
import { UploadPanel } from '../components/UploadPanel';
import { useStudio } from '../context/StudioContext';
import { BLINK_CODE } from '../data/curriculum';
import { esp32Service } from '../services/esp32Service';

export const HardwareLab: React.FC = () => {
  const { device, hwConnecting, hwError, hwLogs, connectESP32, disconnectESP32 } = useStudio();
  const [monitorRunning, setMonitorRunning] = useState(false);
  const [serialOut, setSerialOut] = useState('');
  const [monitorErr, setMonitorErr] = useState<string | null>(null);

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
        setSerialOut((prev) => (prev + chunk).slice(-8000));
      });
    } catch (err) {
      setMonitorRunning(false);
      setMonitorErr(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="page-header" style={{ marginBottom: 4 }}>
        <div>
          <span className="tag" style={{ marginBottom: 8 }}>GENUINE WEB SERIAL + ESPTOOL-JS</span>
          <h1>Real ESP32 Hardware Lab</h1>
          <p className="muted" style={{ margin: 0 }}>
            Connect a physical ESP32 over USB, verify chip detection, flash firmware, and read live Serial Monitor output.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {!device ? (
            <button className="btn btn-primary" onClick={connectESP32} disabled={hwConnecting}>
              {hwConnecting ? <Loader2 size={16} /> : <Plug size={16} />}
              {hwConnecting ? 'Connecting...' : '🔌 Connect ESP32'}
            </button>
          ) : (
            <button className="btn btn-danger" onClick={disconnectESP32}>
              <Unplug size={16} /> Disconnect Board
            </button>
          )}
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h2 style={{ margin: 0 }}>Connection Status</h2>
          {device ? (
            <div className="celebration" style={{ padding: 20 }}>
              <div style={{ fontSize: 32 }}>🎉</div>
              <h3 style={{ color: '#6ee7b7', fontSize: 19, margin: '6px 0' }}>
                ESP32 Connected Successfully!
              </h3>
              <div style={{ fontSize: 13.5, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div><strong>Chip:</strong> {device.chip}</div>
                <div><strong>Port:</strong> {device.portLabel}</div>
                {device.mac && <div><strong>MAC Address:</strong> {device.mac}</div>}
                <div><strong>Connected At:</strong> {device.connectedAt}</div>
              </div>
            </div>
          ) : (
            <div className="card-sm">
              <p style={{ marginTop: 0 }}>
                No ESP32 detected yet. Plug your ESP32 into your computer using a <strong>USB data cable</strong> and click <strong>Connect ESP32</strong>.
              </p>
              <div className="muted" style={{ fontSize: 12.5 }}>
                Web Serial API supported: <strong>{esp32Service.isWebSerialSupported() ? 'Yes (Chrome/Edge)' : 'No — switch to Chrome or Edge'}</strong>
              </div>
            </div>
          )}

          {hwError && (
            <div className="check-item err">
              <div><strong>Hardware Error:</strong> {hwError}</div>
            </div>
          )}

          {hwLogs.length > 0 && (
            <div>
              <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>Bootloader Sync Log:</div>
              <pre className="code-block" style={{ fontSize: 11.5, maxHeight: 160, overflowY: 'auto' }}>
                {hwLogs.join('\n')}
              </pre>
            </div>
          )}
        </div>

        <div className="card" style={{ background: '#091224', textAlign: 'center' }}>
          <h3 style={{ marginBottom: 10 }}>ESP32 Pinout Reference</h3>
          <ESP32BoardSVG ledOn={Boolean(device)} compact />
        </div>
      </div>

      {/* Upload & Compiler Panel */}
      <UploadPanel code={BLINK_CODE} buttonLabel="Compile & Flash Blink to ESP32" />

      {/* Live Serial Monitor */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Terminal size={18} color="#22d3ee" />
            <h2 style={{ margin: 0 }}>Live Serial Monitor (115200 baud)</h2>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className={`btn btn-sm ${monitorRunning ? 'btn-danger' : 'btn-primary'}`}
              disabled={!device}
              onClick={toggleMonitor}
            >
              {monitorRunning ? 'Stop Monitor' : 'Start Serial Monitor'}
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setSerialOut('')}>
              <Trash2 size={14} /> Clear
            </button>
          </div>
        </div>
        {monitorErr && <div className="check-item err">{monitorErr}</div>}
        <pre className="code-block" style={{ minHeight: 150, maxHeight: 280, overflowY: 'auto' }}>
          {serialOut || (device ? 'Click "Start Serial Monitor" to view Serial.println() messages from your ESP32...' : 'Connect an ESP32 to use the Serial Monitor.')}
        </pre>
      </div>
    </div>
  );
};
