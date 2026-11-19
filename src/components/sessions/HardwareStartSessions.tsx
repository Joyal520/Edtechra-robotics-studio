import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import {
  ArrowRight,
  CheckCircle2,
  Cpu,
  HelpCircle,
  Loader2,
  Plug,
  Unplug,
  XCircle,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { BLINK_CODE } from '../../data/curriculum';
import { ESP32BoardSVG, ESP32_PARTS, type BoardPartId } from '../ESP32BoardSVG';
import { UploadPanel } from '../UploadPanel';

/* =========================================================================
   SESSION 1 — LEVEL 1: CONNECT YOUR ESP32
   ========================================================================= */
export const Session1Connect: React.FC = () => {
  const {
    device,
    hwConnecting,
    hwError,
    hwLogs,
    connectESP32,
    disconnectESP32,
    completeSession,
    openSession,
    progress,
  } = useStudio();

  const [screen, setScreen] = useState<1 | 2 | 3 | 4>(device ? 4 : 1);
  const [selectedPart, setSelectedPart] = useState<BoardPartId>('mcu');
  const [explored, setExplored] = useState<BoardPartId[]>(['mcu']);

  const requiredParts: BoardPartId[] = ['usb', 'mcu', 'gpio', '3v3', 'gnd', 'en', 'boot'];

  const handleSelectPart = (part: BoardPartId) => {
    setSelectedPart(part);
    if (!explored.includes(part)) {
      setExplored((prev) => [...prev, part]);
    }
  };

  useEffect(() => {
    if (device && screen === 3) {
      setScreen(4);
      completeSession(1, 'Connected real ESP32 board in Session 1');
    }
  }, [device, screen, completeSession]);

  const handleConnect = async () => {
    const info = await connectESP32();
    if (info) {
      completeSession(1, `Connected real ${info.chip} in Session 1`);
      setScreen(4);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Screen Stepper */}
      <div className="stepper">
        {[
          { n: 1 as const, label: '1. Welcome' },
          { n: 2 as const, label: '2. Identify Your Board' },
          { n: 3 as const, label: '3. Connect Your Board' },
          { n: 4 as const, label: '4. Connection Success' },
        ].map((st) => (
          <button
            key={st.n}
            className={`step-pill ${screen === st.n ? 'active' : screen > st.n ? 'done' : ''}`}
            onClick={() => {
              if (st.n <= 3 || device) setScreen(st.n);
            }}
          >
            {screen > st.n ? '✓ ' : ''}
            {st.label}
          </button>
        ))}
      </div>

      {/* SCREEN 1 — WELCOME */}
      {screen === 1 && (
        <div className="card" style={{ padding: 32, textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>🤖</div>
          <span className="tag" style={{ marginBottom: 12 }}>
            LEVEL 1 — SESSION 1
          </span>
          <h2 style={{ fontSize: 28, marginBottom: 12 }}>Welcome to your first robotics lesson!</h2>
          <p style={{ fontSize: 16.5, color: '#cbd5e1', maxWidth: 560, margin: '0 auto 24px' }}>
            Today, you will connect your <strong>ESP32 board</strong> to your computer. No breadboard,
            no complicated coding yet — this is your first hands-on step into robotics and programming.
          </p>
          <button className="btn btn-primary" style={{ fontSize: 16, padding: '12px 28px' }} onClick={() => setScreen(2)}>
            Start Lesson <ArrowRight size={18} />
          </button>
        </div>
      )}

      {/* SCREEN 2 — IDENTIFY YOUR BOARD */}
      {screen === 2 && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
            <div>
              <h2 style={{ margin: 0 }}>Identify Your ESP32 DevKit Board</h2>
              <p className="muted" style={{ margin: '4px 0 0' }}>
                Click each highlighted component on the board (or the buttons below) to learn what it does.
              </p>
            </div>
            <span className={explored.length >= requiredParts.length ? 'tag tag-ok' : 'tag'}>
              Explored {requiredParts.filter((p) => explored.includes(p)).length} / {requiredParts.length} parts
            </span>
          </div>

          <div className="grid-2" style={{ alignItems: 'center' }}>
            <div className="card-sm" style={{ background: '#070e1d' }}>
              <ESP32BoardSVG
                selectedPart={selectedPart}
                exploredParts={explored}
                onSelectPart={handleSelectPart}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {requiredParts.map((partId) => {
                  const done = explored.includes(partId);
                  return (
                    <button
                      key={partId}
                      onClick={() => handleSelectPart(partId)}
                      className="btn btn-sm"
                      style={{
                        background:
                          selectedPart === partId
                            ? 'var(--cyan)'
                            : done
                            ? 'rgba(16,185,129,0.16)'
                            : 'var(--panel-2)',
                        color: selectedPart === partId ? '#04101f' : done ? '#6ee7b7' : 'var(--text)',
                        borderColor: done ? 'rgba(16,185,129,0.5)' : 'var(--border-hi)',
                      }}
                    >
                      {done ? '✓ ' : ''}
                      {ESP32_PARTS[partId].name}
                    </button>
                  );
                })}
              </div>

              <div
                className="card-sm"
                style={{
                  borderColor: 'var(--cyan)',
                  background: 'rgba(34,211,238,0.08)',
                  padding: 18,
                }}
              >
                <div className="tag" style={{ marginBottom: 8 }}>
                  {ESP32_PARTS[selectedPart].shortDesc}
                </div>
                <h3 style={{ fontSize: 19, marginBottom: 8 }}>{ESP32_PARTS[selectedPart].name}</h3>
                <p style={{ margin: 0, color: '#dbeafe', fontSize: 14.5 }}>
                  {ESP32_PARTS[selectedPart].details}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                <button className="btn btn-secondary" onClick={() => setScreen(1)}>
                  Back
                </button>
                <button className="btn btn-primary" onClick={() => setScreen(3)}>
                  Next: Connect Your Board <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 3 — CONNECT YOUR BOARD */}
      {screen === 3 && (
        <div className="card">
          <h2>Connect Your ESP32 to Your Computer</h2>
          <div className="grid-2" style={{ alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <ol style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 15 }}>
                <li>Take your physical <strong>ESP32 DevKit</strong> board.</li>
                <li>Connect one end of the <strong>USB data cable</strong> to the ESP32 USB port.</li>
                <li>Connect the other end to your computer&apos;s USB port.</li>
                <li>Click <strong>Connect My ESP32</strong> below and pick the USB serial device in your browser popup.</li>
              </ol>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 6 }}>
                <button
                  className="btn btn-primary"
                  style={{ fontSize: 16, padding: '12px 24px' }}
                  onClick={handleConnect}
                  disabled={hwConnecting}
                >
                  {hwConnecting ? <Loader2 size={18} /> : <Plug size={18} />}
                  {hwConnecting ? 'Connecting to ESP32...' : '🔌 Connect My ESP32'}
                </button>
                <button className="btn btn-secondary" onClick={() => setScreen(2)}>
                  Back to Board Map
                </button>
              </div>

              {hwError && (
                <div className="check-item err">
                  <XCircle size={18} color="#f43f5e" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong>Board not detected yet:</strong> {hwError}
                  </div>
                </div>
              )}

              {hwLogs.length > 0 && (
                <pre className="code-block" style={{ fontSize: 12, maxHeight: 140, overflowY: 'auto' }}>
                  {hwLogs.join('\n')}
                </pre>
              )}
            </div>

            <div className="card-sm">
              <h3>Troubleshooting Checklist</h3>
              <ul className="checklist">
                <li className="check-item">Use Google Chrome or Microsoft Edge on a desktop/laptop computer.</li>
                <li className="check-item">Make sure your USB cable transfers data (some phone cables are charge-only).</li>
                <li className="check-item">Close Arduino IDE or any other Serial Monitor using the COM port.</li>
                <li className="check-item">If syncing stalls, hold the <strong>BOOT</strong> button on the ESP32 while clicking Connect.</li>
                <li className="check-item">Install CP210x or CH340 USB drivers if no COM port appears in the popup.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 4 — CONNECTION SUCCESS */}
      {screen === 4 && (
        <div className="celebration">
          <div style={{ fontSize: 54, marginBottom: 8 }}>🎉</div>
          <h2 style={{ fontSize: 30, marginBottom: 6 }}>Congratulations!</h2>
          <h3 style={{ fontSize: 20, color: '#6ee7b7', marginBottom: 12 }}>
            You have successfully connected your ESP32!
          </h3>
          <p style={{ maxWidth: 520, margin: '0 auto 20px', color: '#dbeafe' }}>
            You have completed your very first real robotics hardware task.
          </p>

          <div
            className="grid-3"
            style={{ maxWidth: 680, margin: '0 auto 22px', textAlign: 'left' }}
          >
            <div className="card-sm">
              <div className="muted" style={{ fontSize: 12 }}>Board Detected</div>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#22d3ee' }}>
                {device?.chip || 'ESP32'}
              </div>
            </div>
            <div className="card-sm">
              <div className="muted" style={{ fontSize: 12 }}>Connection Status</div>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#10b981' }}>
                {device ? '● Connected' : 'Disconnected'}
              </div>
            </div>
            <div className="card-sm">
              <div className="muted" style={{ fontSize: 12 }}>Device Info</div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>
                {device?.mac || device?.portLabel || 'USB Serial'}
              </div>
            </div>
          </div>

          <div
            className="card-sm"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 22,
              borderColor: '#10b981',
            }}
          >
            <span style={{ fontSize: 24 }}>🏅</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 800, fontSize: 14 }}>Badge Unlocked: First Hardware Connection</div>
              <div className="muted" style={{ fontSize: 12 }}>
                {progress.completedSessions.includes(1) ? '+100 XP Session Complete' : 'Hardware Verified'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => openSession(2)}>
              Continue to Level 2: Upload Your First Code <ArrowRight size={16} />
            </button>
            {device && (
              <button
                className="btn btn-danger"
                onClick={async () => {
                  await disconnectESP32();
                  setScreen(3);
                }}
              >
                <Unplug size={16} /> Disconnect Board
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================================================
   SESSION 2 — LEVEL 2: UPLOAD YOUR FIRST CODE
   ========================================================================= */
export const Session2Upload: React.FC = () => {
  const { completeSession, openSession } = useStudio();
  const [screen, setScreen] = useState<1 | 2 | 3 | 4>(1);
  const [blinkOn, setBlinkOn] = useState(true);
  const [uploaded, setUploaded] = useState(false);
  const [troubleshoot, setTroubleshoot] = useState(false);
  const [confirmedBlink, setConfirmedBlink] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setBlinkOn((b) => !b), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="stepper">
        {[
          { n: 1 as const, label: '1. What Is a Program?' },
          { n: 2 as const, label: '2. Built-in LED' },
          { n: 3 as const, label: '3. Upload Blink Code' },
          { n: 4 as const, label: '4. Verify Blinking' },
        ].map((st) => (
          <button
            key={st.n}
            className={`step-pill ${screen === st.n ? 'active' : screen > st.n ? 'done' : ''}`}
            onClick={() => setScreen(st.n)}
          >
            {screen > st.n ? '✓ ' : ''}
            {st.label}
          </button>
        ))}
      </div>

      {screen === 1 && (
        <div className="card" style={{ maxWidth: 740, margin: '0 auto', padding: 28 }}>
          <span className="tag" style={{ marginBottom: 10 }}>LEVEL 2 — SESSION 2</span>
          <h2>Your ESP32 is ready! Now let&apos;s give it its first instruction.</h2>
          <div className="card-sm" style={{ margin: '16px 0', borderColor: 'var(--cyan)', background: 'rgba(34,211,238,0.08)' }}>
            <strong>Key Concept:</strong> A <em>program</em> is a set of step-by-step instructions that tells a computer or microcontroller what to do.
          </div>
          <p className="muted">
            You do <strong>not</strong> need to understand or write code yet. First, let&apos;s upload a prepared program and see your real ESP32 respond!
          </p>
          <button className="btn btn-primary" onClick={() => setScreen(2)}>
            Meet the Built-in LED <ArrowRight size={16} />
          </button>
        </div>
      )}

      {screen === 2 && (
        <div className="card">
          <h2>Introduce the Built-in LED</h2>
          <div className="grid-2" style={{ alignItems: 'center' }}>
            <div className="card-sm" style={{ background: '#070e1d' }}>
              <ESP32BoardSVG ledOn={blinkOn} highlightLed compact />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ fontSize: 16 }}>
                Your ESP32 has a small <strong>LED built right into the board</strong> (connected internally to <strong>GPIO 2</strong>).
              </p>
              <p className="muted">
                We can turn this LED ON and OFF using a program — without connecting a single wire or breadboard!
              </p>
              <div className="card-sm" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: blinkOn ? '#38bdf8' : '#1e3a5f',
                    boxShadow: blinkOn ? '0 0 18px #38bdf8' : 'none',
                  }}
                />
                <span>
                  Preview: <strong>{blinkOn ? 'ON (HIGH)' : 'OFF (LOW)'}</strong> — alternating every 1 second
                </span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary" onClick={() => setScreen(1)}>Back</button>
                <button className="btn btn-primary" onClick={() => setScreen(3)}>
                  View &amp; Upload Program <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {screen === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h2 style={{ margin: 0 }}>Your First Program Is Ready</h2>
              <span className="tag">Prepared Blink Code</span>
            </div>
            <p className="muted" style={{ marginTop: 0 }}>
              You don&apos;t have to write this yet. Click <strong>Upload to ESP32</strong> below to send it to your board.
            </p>
            <pre className="code-block">{BLINK_CODE}</pre>
          </div>

          <UploadPanel
            code={BLINK_CODE}
            buttonLabel="Upload to ESP32"
            onUploadSuccess={() => {
              setUploaded(true);
              setScreen(4);
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn btn-secondary" onClick={() => setScreen(2)}>Back</button>
            <button className="btn btn-secondary" onClick={() => setScreen(4)}>
              {uploaded ? 'Go to Verification' : 'Already Uploaded? Verify LED'} <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {screen === 4 && (
        <div className="celebration">
          <div style={{ fontSize: 48, marginBottom: 6 }}>🎉</div>
          <h2 style={{ fontSize: 28, marginBottom: 8 }}>Your First Program Is Running!</h2>

          {/* ON -> OFF -> ON -> OFF Animation */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, margin: '18px 0' }}>
            {['ON', 'OFF', 'ON', 'OFF'].map((lbl, idx) => {
              const active = (idx % 2 === 0) === blinkOn;
              return (
                <div
                  key={idx}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 12,
                    fontWeight: 800,
                    background: active ? 'rgba(56,189,248,0.22)' : '#0b1426',
                    border: `2px solid ${active ? '#38bdf8' : '#233861'}`,
                    color: active ? '#7dd3fc' : '#64748b',
                  }}
                >
                  {lbl}
                </div>
              );
            })}
          </div>

          <p style={{ fontSize: 16, maxWidth: 480, margin: '0 auto 18px' }}>
            Look at your physical ESP32 board. <strong>Can you see the small built-in LED blinking?</strong>
          </p>

          {!confirmedBlink ? (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
              <button
                className="btn btn-success"
                onClick={() => {
                  setConfirmedBlink(true);
                  setTroubleshoot(false);
                  completeSession(2, 'Uploaded and verified first Blink program on ESP32');
                }}
              >
                <CheckCircle2 size={18} /> Yes, it is blinking!
              </button>
              <button className="btn btn-danger" onClick={() => setTroubleshoot(true)}>
                <HelpCircle size={18} /> Something is wrong
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <div className="tag tag-ok" style={{ fontSize: 14, padding: '6px 14px' }}>
                🏅 Achievement Unlocked: My First Program (+120 XP)
              </div>
              <button className="btn btn-primary" onClick={() => openSession(3)}>
                Continue to Level 3: Understand the Code <ArrowRight size={16} />
              </button>
            </div>
          )}

          {troubleshoot && (
            <div className="card-sm" style={{ maxWidth: 540, margin: '18px auto 0', textAlign: 'left' }}>
              <h3 style={{ color: '#fda4af' }}>Troubleshooting Guide</h3>
              <ol style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14 }}>
                <li>Check the USB connection and ensure the cable carries data.</li>
                <li>Check whether the upload reached 100% and reset the board (try pressing EN once).</li>
                <li>Check whether your ESP32 board uses GPIO 2 for its built-in LED (some boards use GPIO 5 or an external LED).</li>
                <li>Go back to Step 3 and try uploading again.</li>
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* =========================================================================
   SESSION 3 — LEVEL 3: UNDERSTAND THE CODE (6 INTERACTIVE STEPS)
   ========================================================================= */
export const Session3Understand: React.FC = () => {
  const { completeSession, openSession } = useStudio();
  const [step, setStep] = useState(1);

  // Step 1 quiz
  const [q1, setQ1] = useState<string | null>(null);
  // Step 2 drag/select INPUT vs OUTPUT
  const [pinModeChoice, setPinModeChoice] = useState<string | null>(null);
  // Step 3 & 5 LED state
  const [step3Led, setStep3Led] = useState(false);
  const [step5Led, setStep5Led] = useState(true);
  // Step 4 ms -> seconds exercise
  const [conv, setConv] = useState({ c1000: '', c2000: '', c500: '', c100: '' });
  const [convChecked, setConvChecked] = useState(false);
  // Step 6 loop cycle animation
  const [loopPhase, setLoopPhase] = useState(0);

  useEffect(() => {
    if (step !== 6) return;
    const id = window.setInterval(() => setLoopPhase((p) => (p + 1) % 5), 1100);
    return () => window.clearInterval(id);
  }, [step]);

  const convCorrect =
    conv.c1000.trim() === '1' &&
    conv.c2000.trim() === '2' &&
    conv.c500.trim() === '0.5' &&
    conv.c100.trim() === '0.1';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="stepper">
        {['1. setup()', '2. pinMode()', '3. HIGH', '4. delay()', '5. LOW', '6. loop()'].map((lbl, idx) => (
          <button
            key={lbl}
            className={`step-pill ${step === idx + 1 ? 'active' : step > idx + 1 ? 'done' : ''}`}
            onClick={() => setStep(idx + 1)}
          >
            {lbl}
          </button>
        ))}
      </div>

      {/* STEP 1: setup() */}
      {step === 1 && (
        <div className="card">
          <h2>Step 1 — void setup()</h2>
          <pre className="code-block" style={{ marginBottom: 14 }}>{`void setup() {\n  // Runs ONCE when ESP32 starts\n}`}</pre>
          <p>The <code>setup()</code> function runs <strong>once</strong> when the ESP32 powers on or resets.</p>
          <div className="card-sm" style={{ marginTop: 14 }}>
            <h3>Quick Check: What happens when the ESP32 starts?</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
              {[
                { id: 'A', text: 'A. The entire program runs only once and stops.' },
                { id: 'B', text: 'B. The setup() function runs once.' },
                { id: 'C', text: 'C. The LED always stays ON forever.' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setQ1(opt.id)}
                  className="btn btn-secondary"
                  style={{
                    justifyContent: 'flex-start',
                    borderColor: q1 === opt.id ? (opt.id === 'B' ? '#10b981' : '#f43f5e') : undefined,
                    background:
                      q1 === opt.id
                        ? opt.id === 'B'
                          ? 'rgba(16,185,129,0.16)'
                          : 'rgba(244,63,94,0.16)'
                        : undefined,
                  }}
                >
                  {opt.text}
                </button>
              ))}
            </div>
            {q1 === 'B' && (
              <p style={{ color: '#6ee7b7', fontWeight: 700, marginTop: 10 }}>
                ✓ Correct! setup() runs once at startup to configure pins.
              </p>
            )}
            {q1 && q1 !== 'B' && (
              <p style={{ color: '#fda4af', marginTop: 10 }}>Not quite — try again! Remember what setup() does.</p>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <button className="btn btn-primary" disabled={q1 !== 'B'} onClick={() => setStep(2)}>
              Next Step <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: pinMode() */}
      {step === 2 && (
        <div className="card">
          <h2>Step 2 — pinMode(2, OUTPUT);</h2>
          <p>This tells the ESP32 that pin 2 will <strong>send electrical signals out</strong> to control the LED.</p>
          <div className="card-sm" style={{ marginTop: 14 }}>
            <h3>Interactive Activity: Place the correct mode into pinMode()</h3>
            <div className="code-block" style={{ margin: '12px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>pinMode(2, </span>
              <span
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  setPinModeChoice(e.dataTransfer.getData('text/plain'));
                }}
                style={{
                  display: 'inline-block',
                  minWidth: 96,
                  textAlign: 'center',
                  padding: '3px 10px',
                  borderRadius: 6,
                  border: `2px dashed ${pinModeChoice === 'OUTPUT' ? '#10b981' : '#22d3ee'}`,
                  background: pinModeChoice === 'OUTPUT' ? 'rgba(16,185,129,0.2)' : '#0d1d3a',
                  color: '#fff',
                  fontWeight: 700,
                }}
              >
                {pinModeChoice || 'DROP HERE'}
              </span>
              <span>);</span>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              {['INPUT', 'OUTPUT'].map((mode) => (
                <button
                  key={mode}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', mode)}
                  onClick={() => setPinModeChoice(mode)}
                  className="btn btn-secondary"
                >
                  {mode}
                </button>
              ))}
            </div>
            {pinModeChoice === 'OUTPUT' && (
              <p style={{ color: '#6ee7b7', fontWeight: 700, marginTop: 10 }}>
                ✓ Correct! An LED receives signals from the ESP32, so pin 2 must be an OUTPUT.
              </p>
            )}
            {pinModeChoice === 'INPUT' && (
              <p style={{ color: '#fda4af', marginTop: 10 }}>
                INPUT is for reading buttons or sensors. To control an LED, choose OUTPUT!
              </p>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
            <button className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
            <button className="btn btn-primary" disabled={pinModeChoice !== 'OUTPUT'} onClick={() => setStep(3)}>
              Next Step <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: digitalWrite HIGH */}
      {step === 3 && (
        <div className="card">
          <h2>Step 3 — digitalWrite(2, HIGH);</h2>
          <pre className="code-block" style={{ marginBottom: 14 }}>digitalWrite(2, HIGH);</pre>
          <p><strong>HIGH</strong> means the pin sends out 3.3V — turning the LED <strong>ON</strong>!</p>
          <div className="card-sm" style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 12 }}>
            <div
              className="led-bulb"
              style={{
                background: step3Led ? '#38bdf8' : '#16253f',
                boxShadow: step3Led ? '0 0 36px #38bdf8' : 'none',
              }}
            />
            <div>
              <button className="btn btn-primary" onClick={() => setStep3Led(true)}>
                Execute digitalWrite(2, HIGH);
              </button>
              <div className="muted" style={{ fontSize: 13, marginTop: 6 }}>
                Status: {step3Led ? 'HIGH → LED is ON!' : 'Click the button to send HIGH'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
            <button className="btn btn-secondary" onClick={() => setStep(2)}>Back</button>
            <button className="btn btn-primary" disabled={!step3Led} onClick={() => setStep(4)}>
              Next Step <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: delay() conversion */}
      {step === 4 && (
        <div className="card">
          <h2>Step 4 — delay(1000);</h2>
          <pre className="code-block" style={{ marginBottom: 12 }}>delay(1000);</pre>
          <p>
            <code>delay()</code> pauses the ESP32 in <strong>milliseconds</strong> (1000 milliseconds = 1 second).
            Complete the conversion table below:
          </p>
          <table className="data-table" style={{ marginTop: 12 }}>
            <thead>
              <tr>
                <th>Code</th>
                <th>Milliseconds</th>
                <th>Seconds (Your Answer)</th>
              </tr>
            </thead>
            <tbody>
              {[
                { key: 'c1000' as const, ms: 1000, expected: '1' },
                { key: 'c2000' as const, ms: 2000, expected: '2' },
                { key: 'c500' as const, ms: 500, expected: '0.5' },
                { key: 'c100' as const, ms: 100, expected: '0.1' },
              ].map((row) => (
                <tr key={row.ms}>
                  <td><code>delay({row.ms});</code></td>
                  <td>{row.ms} ms</td>
                  <td>
                    <input
                      className={`inline-input ${
                        convChecked ? (conv[row.key].trim() === row.expected ? 'ok' : 'err') : ''
                      }`}
                      value={conv[row.key]}
                      placeholder="?"
                      onChange={(e) => setConv((c) => ({ ...c, [row.key]: e.target.value }))}
                      style={{ width: 85 }}
                    />{' '}
                    second(s)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: 'flex', gap: 10, marginTop: 14, alignItems: 'center' }}>
            <button className="btn btn-secondary" onClick={() => setConvChecked(true)}>
              Check Conversions
            </button>
            {convChecked && convCorrect && (
              <span style={{ color: '#6ee7b7', fontWeight: 700 }}>✓ All 4 conversions are correct!</span>
            )}
            {convChecked && !convCorrect && (
              <span style={{ color: '#fda4af' }}>Hint: Divide milliseconds by 1000 (e.g., 500 ÷ 1000 = 0.5).</span>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
            <button className="btn btn-secondary" onClick={() => setStep(3)}>Back</button>
            <button className="btn btn-primary" disabled={!convCorrect} onClick={() => setStep(5)}>
              Next Step <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: digitalWrite LOW */}
      {step === 5 && (
        <div className="card">
          <h2>Step 5 — digitalWrite(2, LOW);</h2>
          <pre className="code-block" style={{ marginBottom: 14 }}>digitalWrite(2, LOW);</pre>
          <p><strong>LOW</strong> sets the pin to 0V, turning the LED <strong>OFF</strong>.</p>
          <div className="card-sm" style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 12 }}>
            <div
              className="led-bulb"
              style={{
                background: step5Led ? '#38bdf8' : '#16253f',
                boxShadow: step5Led ? '0 0 36px #38bdf8' : 'none',
              }}
            />
            <div>
              <button className="btn btn-primary" onClick={() => setStep5Led(false)}>
                Execute digitalWrite(2, LOW);
              </button>
              <div className="muted" style={{ fontSize: 13, marginTop: 6 }}>
                Status: {!step5Led ? 'LOW → LED is OFF!' : 'Click to turn the LED OFF'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
            <button className="btn btn-secondary" onClick={() => setStep(4)}>Back</button>
            <button className="btn btn-primary" disabled={step5Led} onClick={() => setStep(6)}>
              Next Step <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: loop() */}
      {step === 6 && (
        <div className="card">
          <h2>Step 6 — void loop()</h2>
          <p>The <code>loop()</code> function repeats your instructions again and again forever:</p>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, flexWrap: 'wrap', margin: '20px 0' }}>
            {['1. ON (HIGH)', '2. WAIT (1000ms)', '3. OFF (LOW)', '4. WAIT (1000ms)', '5. REPEAT ↻'].map(
              (lbl, idx) => (
                <React.Fragment key={lbl}>
                  <div
                    style={{
                      padding: '12px 16px',
                      borderRadius: 12,
                      fontWeight: 700,
                      background: loopPhase === idx ? 'rgba(34,211,238,0.22)' : '#0a1428',
                      border: `2px solid ${loopPhase === idx ? '#22d3ee' : '#233861'}`,
                      color: loopPhase === idx ? '#fff' : '#93a7cc',
                    }}
                  >
                    {lbl}
                  </div>
                  {idx < 4 && <span className="muted">→</span>}
                </React.Fragment>
              )
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18 }}>
            <button className="btn btn-secondary" onClick={() => setStep(5)}>Back</button>
            <button
              className="btn btn-success"
              onClick={() => {
                completeSession(3, 'Completed all 6 code comprehension steps in Session 3');
                openSession(4);
              }}
            >
              <CheckCircle2 size={18} /> Complete Level 3 &amp; Go to Level 4
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================================================
   SESSION 4 — LEVEL 4: MODIFY YOUR FIRST PROGRAM (4 CHALLENGES)
   ========================================================================= */
const MODIFY_CHALLENGES = [
  {
    id: 1,
    title: 'Challenge 1: Blink Slowly',
    instruction: 'Change both delay(1000); lines to delay(2000); so the LED blinks every 2 seconds.',
    check: (c: string) => (c.match(/delay\s*\(\s*2000\s*\)/g) || []).length >= 2,
    onMs: 2000,
    offMs: 2000,
  },
  {
    id: 2,
    title: 'Challenge 2: Blink Faster',
    instruction: 'Change the delays to delay(200); so the LED flashes rapidly (5 times per second).',
    check: (c: string) => (c.match(/delay\s*\(\s*200\s*\)/g) || []).length >= 2,
    onMs: 200,
    offMs: 200,
  },
  {
    id: 3,
    title: 'Challenge 3: Blink Every 5 Seconds',
    instruction: 'Modify the code to use delay(5000); so the LED toggles every 5 seconds.',
    check: (c: string) => (c.match(/delay\s*\(\s*5000\s*\)/g) || []).length >= 1,
    onMs: 5000,
    offMs: 5000,
  },
  {
    id: 4,
    title: 'Challenge 4: Asymmetric Blink (3s ON, 1s OFF)',
    instruction: 'Make the LED stay ON for 3 seconds (delay(3000)) and OFF for 1 second (delay(1000)).',
    check: (c: string) => /HIGH[\s\S]*delay\s*\(\s*3000\s*\)[\s\S]*LOW[\s\S]*delay\s*\(\s*1000\s*\)/.test(c),
    onMs: 3000,
    offMs: 1000,
  },
];

export const Session4Modify: React.FC = () => {
  const { completeSession, openSession, recordSubmission } = useStudio();
  const [chIdx, setChIdx] = useState(0);
  const [code, setCode] = useState(BLINK_CODE);
  const [passed, setPassed] = useState<number[]>([]);
  const [ledOn, setLedOn] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  const ch = MODIFY_CHALLENGES[chIdx];

  // Parse live delays from code for real-time LED preview
  useEffect(() => {
    const matches = [...code.matchAll(/delay\s*\(\s*(\d+)\s*\)/g)].map((m) => Math.max(80, Math.min(5000, Number(m[1]))));
    const onMs = matches[0] || 1000;
    const offMs = matches[1] || onMs;
    let state = true;
    setLedOn(true);
    let timer = window.setTimeout(function tick() {
      state = !state;
      setLedOn(state);
      timer = window.setTimeout(tick, state ? onMs : offMs);
    }, onMs);
    return () => window.clearTimeout(timer);
  }, [code]);

  const handleCheck = () => {
    if (ch.check(code)) {
      const nextPassed = passed.includes(ch.id) ? passed : [...passed, ch.id];
      setPassed(nextPassed);
      setFeedback(`✓ ${ch.title} passed! Try uploading it to your ESP32 or continue to the next challenge.`);
      recordSubmission({
        sessionId: 4,
        sessionTitle: `Session 4 — ${ch.title}`,
        code,
        passedRules: 1,
        totalRules: 1,
      });
      if (nextPassed.length === MODIFY_CHALLENGES.length) {
        completeSession(4, 'Completed all 4 Blink modification challenges');
      }
    } else {
      setFeedback(`Not quite yet! ${ch.instruction}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="stepper">
        {MODIFY_CHALLENGES.map((item, idx) => (
          <button
            key={item.id}
            className={`step-pill ${chIdx === idx ? 'active' : passed.includes(item.id) ? 'done' : ''}`}
            onClick={() => {
              setChIdx(idx);
              setFeedback(null);
            }}
          >
            {passed.includes(item.id) ? '✓ ' : ''}
            Challenge {item.id}
          </button>
        ))}
      </div>

      <div className="card">
        <h2>{ch.title}</h2>
        <p className="muted" style={{ marginTop: 0 }}>{ch.instruction}</p>

        <div className="grid-2" style={{ alignItems: 'start' }}>
          <div>
            <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #233861' }}>
              <Editor
                height="260px"
                defaultLanguage="cpp"
                theme="vs-dark"
                value={code}
                onChange={(v) => setCode(v || '')}
                options={{ minimap: { enabled: false }, fontSize: 14, scrollBeyondLastLine: false }}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={handleCheck}>
                Check Challenge {ch.id}
              </button>
              {passed.includes(ch.id) && chIdx < MODIFY_CHALLENGES.length - 1 && (
                <button
                  className="btn btn-success"
                  onClick={() => {
                    setChIdx(chIdx + 1);
                    setFeedback(null);
                  }}
                >
                  Next Challenge <ArrowRight size={16} />
                </button>
              )}
              {passed.length === MODIFY_CHALLENGES.length && (
                <button className="btn btn-success" onClick={() => openSession(5)}>
                  Continue to Level 5: External LED <ArrowRight size={16} />
                </button>
              )}
            </div>
            {feedback && (
              <div
                className={`check-item ${passed.includes(ch.id) ? 'ok' : 'err'}`}
                style={{ marginTop: 12 }}
              >
                {feedback}
              </div>
            )}
          </div>

          <div className="card-sm" style={{ textAlign: 'center', background: '#070e1d' }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Live Onboard LED Preview</div>
            <ESP32BoardSVG ledOn={ledOn} highlightLed compact />
            <div className="muted" style={{ fontSize: 13, marginTop: 8 }}>
              <Cpu size={14} style={{ verticalAlign: 'middle' }} /> LED State: <strong>{ledOn ? 'ON (HIGH)' : 'OFF (LOW)'}</strong>
            </div>
          </div>
        </div>
      </div>

      <UploadPanel code={code} buttonLabel="Upload Modified Code to ESP32" />
    </div>
  );
};
