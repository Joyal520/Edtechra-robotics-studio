import React, { useEffect, useMemo, useState } from 'react';
import Editor from '@monaco-editor/react';
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  HelpCircle,
  Play,
  Square,
  XCircle,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import type { GuidedStage, SessionDef } from '../../types';
import { CircuitSimulator } from '../CircuitSimulator';
import { GuidedCodingExercise } from '../GuidedCodingExercise';
import { UploadPanel } from '../UploadPanel';

/* =========================================================================
   SESSION 5 — LEVEL 5: CONNECT AN EXTERNAL LED (4 SCREENS + GUIDED WIRING)
   ========================================================================= */
export const Session5ExternalLedCircuit: React.FC = () => {
  const { completeSession, openSession } = useStudio();
  const [screen, setScreen] = useState<1 | 2 | 3 | 4>(1);
  const [ledPart, setLedPart] = useState<'anode' | 'cathode' | null>(null);
  const [resistorInspected, setResistorInspected] = useState(false);
  const [circuitValid, setCircuitValid] = useState(false);

  // Guided 3-step wiring state
  const [wiredSteps, setWiredSteps] = useState<number[]>([]);
  const [wireMsg, setWireMsg] = useState<string | null>(null);

  const guidedSteps = [
    {
      step: 1,
      from: 'ESP32 GPIO 23',
      to: '220Ω Resistor (End A)',
      wrongHint: 'Check the connection. GPIO 23 should connect to the resistor first.',
    },
    {
      step: 2,
      from: '220Ω Resistor (End B)',
      to: 'LED Anode (+)',
      wrongHint: 'Connect the other side of the resistor to the LED Anode (+ long leg).',
    },
    {
      step: 3,
      from: 'LED Cathode (-)',
      to: 'ESP32 GND',
      wrongHint: 'Connect the LED Cathode (- short leg) back to GND to complete the circuit.',
    },
  ];

  const handleGuidedWire = (stepNum: number) => {
    const expected = wiredSteps.length + 1;
    if (stepNum !== expected) {
      setWireMsg(guidedSteps[expected - 1].wrongHint);
      return;
    }
    const next = [...wiredSteps, stepNum];
    setWiredSteps(next);
    setWireMsg(null);
    if (next.length === 3) {
      setCircuitValid(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="stepper">
        {[
          { n: 1 as const, label: '1. Learn the LED' },
          { n: 2 as const, label: '2. Understand the Resistor' },
          { n: 3 as const, label: '3. Circuit Diagram' },
          { n: 4 as const, label: '4. Guided Connection' },
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

      {/* Components Checklist */}
      <div className="card-sm" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <strong>Required Components:</strong>
        {['ESP32', 'Breadboard', 'LED', '220Ω Resistor', 'Jumper Wires'].map((c) => (
          <span key={c} className="tag">{c}</span>
        ))}
      </div>

      {/* SCREEN 1: LEARN THE LED */}
      {screen === 1 && (
        <div className="card">
          <h2>Screen 1 — Learn the LED</h2>
          <p className="muted">An LED only lets electricity flow in one direction. Click both legs below to inspect them.</p>
          <div className="grid-2" style={{ alignItems: 'center' }}>
            <svg viewBox="0 0 260 240" style={{ width: '100%', maxWidth: 260, margin: '0 auto', display: 'block' }}>
              <circle cx="130" cy="80" r="46" fill="#ef4444" opacity="0.2" />
              <path d="M96 105 V70 A34 34 0 0 1 164 70 V105 Z" fill="#ef4444" stroke="#fca5a5" strokeWidth="3" />
              <rect x="88" y="103" width="84" height="10" rx="3" fill="#dc2626" />
              {/* Anode (Long leg) */}
              <g onClick={() => setLedPart('anode')} style={{ cursor: 'pointer' }}>
                <rect x="98" y="113" width="24" height="108" fill="transparent" />
                <line x1="110" y1="113" x2="110" y2="215" stroke={ledPart === 'anode' ? '#22d3ee' : '#cbd5e1'} strokeWidth="6" strokeLinecap="round" />
                <text x="86" y="180" textAnchor="end" fill="#22d3ee" fontWeight="800" fontSize="13">Anode (+)</text>
              </g>
              {/* Cathode (Short leg) */}
              <g onClick={() => setLedPart('cathode')} style={{ cursor: 'pointer' }}>
                <rect x="138" y="113" width="24" height="86" fill="transparent" />
                <line x1="150" y1="113" x2="150" y2="188" stroke={ledPart === 'cathode' ? '#22d3ee' : '#94a3b8'} strokeWidth="6" strokeLinecap="round" />
                <text x="172" y="170" textAnchor="start" fill="#94a3b8" fontWeight="800" fontSize="13">Cathode (-)</text>
              </g>
            </svg>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary" onClick={() => setLedPart('anode')}>
                  Inspect Anode (+)
                </button>
                <button className="btn btn-secondary" onClick={() => setLedPart('cathode')}>
                  Inspect Cathode (-)
                </button>
              </div>
              <div className="card-sm" style={{ borderColor: 'var(--cyan)' }}>
                {ledPart === 'anode' ? (
                  <>
                    <h3>Anode (+) — Positive Side</h3>
                    <p style={{ margin: 0 }}>The <strong>longer leg</strong> of the LED. It connects to the resistor and GPIO signal pin.</p>
                  </>
                ) : ledPart === 'cathode' ? (
                  <>
                    <h3>Cathode (-) — Negative Side</h3>
                    <p style={{ margin: 0 }}>The <strong>shorter leg</strong> (next to the flat rim). It connects to <strong>GND</strong>.</p>
                  </>
                ) : (
                  <p style={{ margin: 0 }} className="muted">Click Anode (+) or Cathode (-) on the LED diagram to see how it works.</p>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" disabled={!ledPart} onClick={() => setScreen(2)}>
                  Next: Understand the Resistor <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 2: RESISTOR */}
      {screen === 2 && (
        <div className="card">
          <h2>Screen 2 — Understand the 220Ω Resistor</h2>
          <p>A <strong>resistor</strong> reduces the flow of electrical current. Without it, too much current rushes through the LED and can burn it out!</p>
          <div className="card-sm" style={{ textAlign: 'center', padding: 24, margin: '14px 0' }}>
            <svg viewBox="0 0 320 90" style={{ width: '100%', maxWidth: 320, display: 'block', margin: '0 auto' }}>
              <line x1="10" y1="45" x2="310" y2="45" stroke="#cbd5e1" strokeWidth="6" />
              <rect x="75" y="20" width="170" height="50" rx="18" fill="#d6a56e" stroke="#8a5a2b" strokeWidth="3" />
              <rect x="105" y="20" width="14" height="50" fill="#ef4444" />
              <rect x="135" y="20" width="14" height="50" fill="#ef4444" />
              <rect x="165" y="20" width="14" height="50" fill="#78350f" />
              <rect x="205" y="20" width="12" height="50" fill="#eab308" />
            </svg>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#22d3ee', marginTop: 8 }}>220Ω Resistor</div>
            <div className="muted" style={{ fontSize: 13 }}>Color Bands: Red (2) • Red (2) • Brown (×10) • Gold (±5%)</div>
            <button
              className="btn btn-secondary btn-sm"
              style={{ marginTop: 12 }}
              onClick={() => setResistorInspected(true)}
            >
              {resistorInspected ? '✓ Got it — Resistor Protects the LED!' : 'Acknowledge: Why We Use 220Ω'}
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn btn-secondary" onClick={() => setScreen(1)}>Back</button>
            <button className="btn btn-primary" disabled={!resistorInspected} onClick={() => setScreen(3)}>
              Next: View Circuit Diagram <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 3: ANIMATED CIRCUIT DIAGRAM */}
      {screen === 3 && (
        <div className="card">
          <h2>Screen 3 — Circuit Diagram</h2>
          <p className="muted">Current leaves ESP32 GPIO 23, passes safely through the 220Ω resistor, lights up the LED, and returns to GND.</p>
          <div className="card-sm" style={{ textAlign: 'center', padding: 24, fontFamily: 'var(--font-mono)', fontSize: 16 }}>
            <div style={{ color: '#22d3ee', fontWeight: 800 }}>ESP32 GPIO 23</div>
            <div style={{ color: '#64748b' }}>↓</div>
            <div style={{ color: '#f59e0b', fontWeight: 800 }}>220Ω Resistor</div>
            <div style={{ color: '#64748b' }}>↓</div>
            <div style={{ color: '#f43f5e', fontWeight: 800 }}>LED (Anode + → Cathode -)</div>
            <div style={{ color: '#64748b' }}>↓</div>
            <div style={{ color: '#94a3b8', fontWeight: 800 }}>GND (Ground)</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
            <button className="btn btn-secondary" onClick={() => setScreen(2)}>Back</button>
            <button className="btn btn-primary" onClick={() => setScreen(4)}>
              Start Guided Wiring <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 4: GUIDED CONNECTION + VIRTUAL BREADBOARD */}
      {screen === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <h2>Screen 4 — Guided Step-by-Step Connection</h2>
            <p className="muted" style={{ marginTop: 0 }}>
              Complete each physical connection in order (1 → 2 → 3), or wire it live on the interactive circuit canvas below. The lesson unlocks only when all connections are verified!
            </p>
            <div className="grid-3" style={{ marginBottom: 14 }}>
              {guidedSteps.map((gs) => {
                const done = wiredSteps.includes(gs.step);
                return (
                  <button
                    key={gs.step}
                    onClick={() => handleGuidedWire(gs.step)}
                    className="card-sm"
                    style={{
                      textAlign: 'left',
                      borderColor: done ? '#10b981' : '#34528a',
                      background: done ? 'rgba(16,185,129,0.12)' : '#132240',
                    }}
                  >
                    <div style={{ fontWeight: 800, color: done ? '#6ee7b7' : '#22d3ee', marginBottom: 4 }}>
                      {done ? '✓ ' : ''}Connection {gs.step}
                    </div>
                    <div style={{ fontSize: 13.5 }}>
                      {gs.from} → <strong>{gs.to}</strong>
                    </div>
                  </button>
                );
              })}
            </div>
            {wireMsg && <div className="check-item err">{wireMsg}</div>}
          </div>

          <CircuitSimulator
            preset="single-led"
            expectedGpio="GPIO23"
            onCircuitValid={() => setCircuitValid(true)}
          />

          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <strong>Completion Check:</strong>{' '}
              {circuitValid ? (
                <span style={{ color: '#6ee7b7' }}>✓ Circuit wired correctly (GPIO 23 → 220Ω → LED → GND)!</span>
              ) : (
                <span className="muted">Complete all 3 guided connections (or wire GPIO23 → R1 → LED → GND in the simulator) to continue.</span>
              )}
            </div>
            <button
              className="btn btn-success"
              disabled={!circuitValid}
              onClick={() => {
                completeSession(5, 'Built external LED circuit on GPIO 23');
                openSession(6);
              }}
            >
              Continue to Level 6: Guided LED Programming <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================================================
   SESSION 6 — LEVEL 6: WRITE YOUR FIRST EXTERNAL LED PROGRAM (7 STAGES)
   ========================================================================= */
const LEVEL6_STAGES: GuidedStage[] = [
  {
    id: 's1',
    title: 'Create the LED Variable',
    instruction: 'Your external LED is connected to GPIO 23. Enter the pin number.',
    hint: 'Type 23',
    codeBefore: 'int ledPin = ',
    placeholder: '___',
    codeAfter: ';',
    acceptedAnswers: ['23'],
  },
  {
    id: 's2',
    title: 'Setup GPIO Mode',
    instruction: 'Tell the ESP32 that ledPin will be used as an OUTPUT.',
    hint: 'Type: pinMode(ledPin, OUTPUT);',
    codeBefore: 'void setup() {\n  ',
    placeholder: 'pinMode(..., ...);',
    codeAfter: '\n}',
    acceptedAnswers: ['pinMode(ledPin, OUTPUT);', 'pinMode(23, OUTPUT);'],
  },
  {
    id: 's3',
    title: 'Turn ON the LED',
    instruction: 'Send a HIGH signal to ledPin to turn the LED ON.',
    hint: 'Type HIGH',
    codeBefore: 'digitalWrite(ledPin, ',
    placeholder: '______',
    codeAfter: ');',
    acceptedAnswers: ['HIGH'],
  },
  {
    id: 's4',
    title: 'Wait 1 Second',
    instruction: 'Pause the ESP32 for 1,000 milliseconds (1 second).',
    hint: 'Type 1000',
    codeBefore: 'delay(',
    placeholder: '______',
    codeAfter: ');',
    acceptedAnswers: ['1000'],
  },
  {
    id: 's5',
    title: 'Turn OFF the LED',
    instruction: 'Send a LOW signal to ledPin to turn the LED OFF.',
    hint: 'Type LOW',
    codeBefore: 'digitalWrite(ledPin, ',
    placeholder: '______',
    codeAfter: ');',
    acceptedAnswers: ['LOW'],
  },
  {
    id: 's6',
    title: 'Complete the Loop Pause',
    instruction: 'Wait 1 second while the LED is OFF before the loop repeats.',
    hint: 'Type: delay(1000);',
    codeBefore: '  digitalWrite(ledPin, LOW);\n  ',
    placeholder: 'delay(...);',
    codeAfter: '\n}',
    acceptedAnswers: ['delay(1000);'],
  },
];

const LEVEL6_FULL_PROGRAM = `int ledPin = 23;

void setup() {
  pinMode(ledPin, OUTPUT);
}

void loop() {
  digitalWrite(ledPin, HIGH);
  delay(1000);
  digitalWrite(ledPin, LOW);
  delay(1000);
}`;

export const Session6GuidedCoding: React.FC = () => {
  const { completeSession, openSession } = useStudio();
  const [allStagesDone, setAllStagesDone] = useState(false);
  const [completed, setCompleted] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="card">
        <GuidedCodingExercise
          title="Build Your External LED Program Step by Step"
          stages={LEVEL6_STAGES}
          fullProgram={LEVEL6_FULL_PROGRAM}
          onAllComplete={() => setAllStagesDone(true)}
        />
      </div>

      {allStagesDone && (
        <>
          <UploadPanel
            code={LEVEL6_FULL_PROGRAM}
            buttonLabel="Upload My Program"
            onUploadSuccess={() => {
              setCompleted(true);
              completeSession(6, 'Completed Guided External LED Coding & Uploaded to ESP32');
            }}
          />

          <div className="celebration">
            <div style={{ fontSize: 44 }}>🎉</div>
            <h2 style={{ marginBottom: 6 }}>Your External LED Program Is Ready!</h2>
            <p className="muted" style={{ marginTop: 0 }}>
              Upload to your real ESP32 above, then claim your 🏅 Circuit Builder badge and advance to independent coding!
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 14 }}>
              <button
                className="btn btn-success"
                onClick={() => {
                  setCompleted(true);
                  completeSession(6, 'Completed Level 6 Guided Coding');
                  openSession(7);
                }}
              >
                {completed ? 'Continue to Level 7' : 'Claim 🏅 Circuit Builder & Go to Level 7'} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/* =========================================================================
   SESSIONS 7–30 (LEVELS 7–14): INDEPENDENT CODING, PROJECTS, SENSORS,
   AUTOMATION & ROBOTICS WORKBENCH
   ========================================================================= */
export const ProjectSessionWorkbench: React.FC<{ session: SessionDef }> = ({ session }) => {
  const { progress, saveSessionCode, completeSession, openSession, recordSubmission } = useStudio();
  const initialCode = progress.savedCode[session.id] ?? session.starterCode ?? '';
  const [code, setCode] = useState(initialCode);
  const [hintLevel, setHintLevel] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [simOn, setSimOn] = useState(true);
  const [checked, setChecked] = useState(false);

  // Interactive virtual hardware states
  const [ledStates, setLedStates] = useState({ red: false, yellow: false, green: false, blue: false });
  const [buttonPressed, setButtonPressed] = useState(false);
  const [sensorVal, setSensorVal] = useState(
    session.sensorType === 'dht11' || session.sensorType === 'dht11-led'
      ? 26
      : session.sensorType === 'ultrasonic' || session.sensorType === 'robot-obstacle'
      ? 45
      : 1200
  );
  const [robotDir, setRobotDir] = useState<'FORWARD' | 'BACKWARD' | 'LEFT' | 'RIGHT' | 'STOP'>('FORWARD');

  useEffect(() => {
    setCode(progress.savedCode[session.id] ?? session.starterCode ?? '');
    setHintLevel(0);
    setShowSolution(false);
    setChecked(false);
  }, [session.id, session.starterCode, progress.savedCode]);

  // Code-driven virtual simulation for LEDs / Traffic Light
  useEffect(() => {
    if (!simOn) {
      setLedStates({ red: false, yellow: false, green: false, blue: false });
      return;
    }

    if (session.category === 'traffic-light') {
      const steps = [
        { red: true, yellow: false, green: false, blue: false, ms: 3000 },
        { red: false, yellow: true, green: false, blue: false, ms: 2000 },
        { red: false, yellow: false, green: true, blue: false, ms: 3000 },
      ];
      let idx = 0;
      setLedStates(steps[0]);
      let timer = window.setTimeout(function next() {
        idx = (idx + 1) % steps.length;
        setLedStates(steps[idx]);
        timer = window.setTimeout(next, steps[idx].ms);
      }, steps[0].ms);
      return () => window.clearTimeout(timer);
    }

    if (session.category === 'multi-led') {
      let toggle = true;
      setLedStates({ red: true, yellow: false, green: false, blue: false });
      const id = window.setInterval(() => {
        toggle = !toggle;
        setLedStates({ red: toggle, yellow: false, green: false, blue: !toggle });
      }, 600);
      return () => window.clearInterval(id);
    }

    if (session.category === 'code-independent') {
      const delays = [...code.matchAll(/delay\s*\(\s*(\d+)\s*\)/g)].map((m) =>
        Math.max(150, Math.min(4000, Number(m[1])))
      );
      const onMs = delays[0] || 1000;
      const offMs = delays[1] || 1000;
      let on = true;
      setLedStates({ red: true, yellow: false, green: false, blue: false });
      let timer = window.setTimeout(function tick() {
        on = !on;
        setLedStates({ red: on, yellow: false, green: false, blue: false });
        timer = window.setTimeout(tick, on ? onMs : offMs);
      }, onMs);
      return () => window.clearTimeout(timer);
    }
  }, [simOn, session.category, code]);

  const ruleResults = useMemo(() => {
    const rules = session.rules || [];
    return rules.map((r) => ({ ...r, passed: r.test(code) }));
  }, [session.rules, code]);

  const allPassed = ruleResults.length > 0 ? ruleResults.every((r) => r.passed) : code.trim().length > 20;

  const handleEvaluate = () => {
    setChecked(true);
    saveSessionCode(session.id, code);
    const passedCount = ruleResults.filter((r) => r.passed).length;
    recordSubmission({
      sessionId: session.id,
      sessionTitle: `Session ${session.id}: ${session.title}`,
      code,
      passedRules: passedCount,
      totalRules: ruleResults.length,
    });
    if (allPassed) {
      completeSession(session.id);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Components Bar */}
      {session.components && session.components.length > 0 && (
        <div className="card-sm" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <strong>Hardware Components:</strong>
          {session.components.map((c) => (
            <span key={c} className="tag">{c}</span>
          ))}
        </div>
      )}

      {/* Main Editor + Virtual Hardware Simulator */}
      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Left: Monaco Editor + Hints + Assessment */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>ESP32 Arduino C++ Editor</h3>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setCode(session.starterCode || '')}
            >
              Reset Code
            </button>
          </div>

          <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #233861' }}>
            <Editor
              height="310px"
              defaultLanguage="cpp"
              theme="vs-dark"
              value={code}
              onChange={(v) => {
                setCode(v || '');
                saveSessionCode(session.id, v || '');
              }}
              options={{ minimap: { enabled: false }, fontSize: 13.5, scrollBeyondLastLine: false }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={handleEvaluate}>
              <CheckCircle2 size={16} /> Check My Code
            </button>

            {session.hints && session.hints.length > 0 && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setHintLevel((h) => Math.min(session.hints!.length, h + 1))}
                disabled={hintLevel >= session.hints.length}
              >
                <HelpCircle size={14} /> Show Hint {Math.min(hintLevel + 1, session.hints.length)}
              </button>
            )}

            {session.solutionCode && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowSolution((s) => !s)}
              >
                <Eye size={14} /> {showSolution ? 'Hide Example' : 'Show Example'}
              </button>
            )}
          </div>

          {/* Progressive Hints */}
          {hintLevel > 0 && session.hints && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {session.hints.slice(0, hintLevel).map((h, i) => (
                <div
                  key={i}
                  style={{
                    padding: '9px 12px',
                    borderRadius: 9,
                    background: 'rgba(245,158,11,0.12)',
                    border: '1px solid rgba(245,158,11,0.4)',
                    color: '#fde68a',
                    fontSize: 13,
                  }}
                >
                  💡 {h}
                </div>
              ))}
            </div>
          )}

          {showSolution && session.solutionCode && (
            <div>
              <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>Reference Example Solution:</div>
              <pre className="code-block" style={{ fontSize: 12 }}>{session.solutionCode}</pre>
            </div>
          )}

          {/* Rule-Based Assessment */}
          {checked && ruleResults.length > 0 && (
            <div>
              <h3 style={{ marginBottom: 8 }}>
                Assessment ({ruleResults.filter((r) => r.passed).length} / {ruleResults.length} passed)
              </h3>
              <ul className="checklist">
                {ruleResults.map((r) => (
                  <li key={r.id} className={`check-item ${r.passed ? 'ok' : 'err'}`}>
                    {r.passed ? (
                      <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
                    ) : (
                      <XCircle size={16} color="#f43f5e" style={{ flexShrink: 0, marginTop: 2 }} />
                    )}
                    <div>
                      <div style={{ fontWeight: 700 }}>{r.label}</div>
                      {!r.passed && <div className="muted" style={{ fontSize: 12 }}>Hint: {r.hint}</div>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right: Tailored Interactive Virtual Simulator */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Interactive Hardware Simulation</h3>
            <button
              className={`btn btn-sm ${simOn ? 'btn-danger' : 'btn-success'}`}
              onClick={() => setSimOn((s) => !s)}
            >
              {simOn ? <Square size={14} /> : <Play size={14} />}
              {simOn ? 'Stop' : 'Run'}
            </button>
          </div>

          {/* TRAFFIC LIGHT SIMULATOR */}
          {session.category === 'traffic-light' && (
            <div style={{ textAlign: 'center' }}>
              <div className="traffic-housing">
                <div
                  className="led-bulb"
                  style={{
                    background: ledStates.red ? '#ef4444' : '#3a161b',
                    boxShadow: ledStates.red ? '0 0 36px #ef4444' : 'none',
                  }}
                />
                <div
                  className="led-bulb"
                  style={{
                    background: ledStates.yellow ? '#facc15' : '#3b3211',
                    boxShadow: ledStates.yellow ? '0 0 36px #facc15' : 'none',
                  }}
                />
                <div
                  className="led-bulb"
                  style={{
                    background: ledStates.green ? '#22c55e' : '#10351f',
                    boxShadow: ledStates.green ? '0 0 36px #22c55e' : 'none',
                  }}
                />
              </div>
              <div style={{ marginTop: 12, fontWeight: 700, fontSize: 15 }}>
                {ledStates.red
                  ? '🔴 RED (GPIO 23) — STOP (3s)'
                  : ledStates.yellow
                  ? '🟡 YELLOW (GPIO 22) — READY (2s)'
                  : ledStates.green
                  ? '🟢 GREEN (GPIO 21) — GO (3s)'
                  : 'Paused'}
              </div>
            </div>
          )}

          {/* TWO LEDS SIMULATOR */}
          {session.category === 'multi-led' && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 36, padding: 24 }}>
              <div style={{ textAlign: 'center' }}>
                <div
                  className="led-bulb"
                  style={{
                    margin: '0 auto 8px',
                    background: ledStates.red ? '#ef4444' : '#3a161b',
                    boxShadow: ledStates.red ? '0 0 34px #ef4444' : 'none',
                  }}
                />
                <strong>LED 1 (GPIO 23)</strong>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div
                  className="led-bulb"
                  style={{
                    margin: '0 auto 8px',
                    background: ledStates.blue ? '#3b82f6' : '#162547',
                    boxShadow: ledStates.blue ? '0 0 34px #3b82f6' : 'none',
                  }}
                />
                <strong>LED 2 (GPIO 22)</strong>
              </div>
            </div>
          )}

          {/* SINGLE EXTERNAL LED SIMULATOR */}
          {session.category === 'code-independent' && (
            <div style={{ textAlign: 'center', padding: 26 }}>
              <div
                className="led-bulb"
                style={{
                  width: 82,
                  height: 82,
                  margin: '0 auto 12px',
                  background: ledStates.red ? '#ef4444' : '#3a161b',
                  boxShadow: ledStates.red ? '0 0 42px #ef4444' : 'none',
                }}
              />
              <div style={{ fontWeight: 700 }}>
                External LED on GPIO 23: {ledStates.red ? 'ON (HIGH)' : 'OFF (LOW)'}
              </div>
            </div>
          )}

          {/* BUTTON / CONDITIONAL SIMULATOR */}
          {(session.category === 'buttons' || session.category === 'conditionals') && (
            <div style={{ textAlign: 'center', padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <div
                className="led-bulb"
                style={{
                  width: 74,
                  height: 74,
                  background: buttonPressed ? '#22c55e' : '#123121',
                  boxShadow: buttonPressed ? '0 0 38px #22c55e' : 'none',
                }}
              />
              <button
                className={`btn ${buttonPressed ? 'btn-success' : 'btn-primary'}`}
                onMouseDown={() => setButtonPressed(true)}
                onMouseUp={() => setButtonPressed(false)}
                onMouseLeave={() => setButtonPressed(false)}
                onClick={() => setButtonPressed((p) => !p)}
              >
                {buttonPressed ? 'BUTTON PRESSED (HIGH)' : 'Press / Click Push Button (GPIO 18)'}
              </button>
              <div className="muted" style={{ fontSize: 13 }}>
                <code>digitalRead(18)</code> = <strong>{buttonPressed ? 'HIGH (1)' : 'LOW (0)'}</strong> → LED on GPIO 23 is{' '}
                <strong>{buttonPressed ? 'ON' : 'OFF'}</strong>
              </div>
            </div>
          )}

          {/* SENSORS / AUTOMATION / ROBOTICS INTERACTIVE BENCH */}
          {(session.category === 'sensors' || session.category === 'automation' || session.category === 'robotics') && (
            <div className="card-sm" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {(session.sensorType === 'ldr' || session.sensorType === 'moisture' || session.sensorType === 'irrigation') && (
                <>
                  <label style={{ fontWeight: 700, fontSize: 14 }}>
                    {session.sensorType === 'ldr'
                      ? `Ambient Light Level (LDR): ${sensorVal} / 4095`
                      : `Soil Moisture Level: ${sensorVal} / 4095`}
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={4095}
                    value={sensorVal}
                    onChange={(e) => setSensorVal(Number(e.target.value))}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div
                      className="led-bulb"
                      style={{
                        width: 48,
                        height: 48,
                        background: sensorVal < 1800 ? '#22d3ee' : '#16253f',
                        boxShadow: sensorVal < 1800 ? '0 0 28px #22d3ee' : 'none',
                      }}
                    />
                    <div>
                      <strong>
                        {session.sensorType === 'ldr'
                          ? sensorVal < 1500
                            ? '🌙 Dark Detected → Night Light LED ON'
                            : '☀️ Bright Light → Night Light LED OFF'
                          : session.sensorType === 'irrigation'
                          ? sensorVal < 1800
                            ? '🏜️ Dry Soil → Relay ON → 💧 Water Pump RUNNING'
                            : '🌱 Soil Moist → Relay OFF → Water Pump STOPPED'
                          : sensorVal < 1800
                          ? '🏜️ Dry Soil Alert (LED ON)'
                          : '🌱 Soil Moisture OK (LED OFF)'}
                      </strong>
                    </div>
                  </div>
                </>
              )}

              {(session.sensorType === 'dht11' || session.sensorType === 'dht11-led') && (
                <>
                  <label style={{ fontWeight: 700 }}>DHT11 Temperature: {sensorVal}°C</label>
                  <input
                    type="range"
                    min={10}
                    max={48}
                    value={sensorVal}
                    onChange={(e) => setSensorVal(Number(e.target.value))}
                  />
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div
                      className="led-bulb"
                      style={{
                        width: 42,
                        height: 42,
                        background: sensorVal > 30 ? '#ef4444' : '#3a161b',
                        boxShadow: sensorVal > 30 ? '0 0 24px #ef4444' : 'none',
                      }}
                    />
                    <div
                      className="led-bulb"
                      style={{
                        width: 42,
                        height: 42,
                        background: sensorVal <= 30 ? '#22c55e' : '#10351f',
                        boxShadow: sensorVal <= 30 ? '0 0 24px #22c55e' : 'none',
                      }}
                    />
                    <strong>{sensorVal > 30 ? '🔥 High Temp (>30°C): Red LED ON' : '✅ Normal Temp: Green LED ON'}</strong>
                  </div>
                </>
              )}

              {(session.sensorType === 'ultrasonic' || session.sensorType === 'robot-obstacle') && (
                <>
                  <label style={{ fontWeight: 700 }}>HC-SR04 Obstacle Distance: {sensorVal} cm</label>
                  <input
                    type="range"
                    min={4}
                    max={120}
                    value={sensorVal}
                    onChange={(e) => setSensorVal(Number(e.target.value))}
                  />
                  <div className="card-sm" style={{ textAlign: 'center', fontWeight: 800, fontSize: 15 }}>
                    {sensorVal < 25
                      ? '⚠️ OBSTACLE < 25 cm — Robot Stops & Turns Right ↱'
                      : '🤖 Path Clear — Robot Moving Forward ↑'}
                  </div>
                </>
              )}

              {(session.sensorType === 'relay' || session.sensorType === 'pump') && (
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
                  <button
                    className={`btn ${buttonPressed ? 'btn-success' : 'btn-secondary'}`}
                    onClick={() => setButtonPressed((p) => !p)}
                  >
                    {buttonPressed ? '⚡ Relay Energized (NO Closed — Load ON)' : 'Relay De-energized (Load OFF)'}
                  </button>
                </div>
              )}

              {(session.sensorType === 'motor' || session.sensorType === 'l298n' || session.sensorType === 'robot-move') && (
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ fontSize: 32 }}>
                    {robotDir === 'FORWARD'
                      ? '⬆️'
                      : robotDir === 'BACKWARD'
                      ? '⬇️'
                      : robotDir === 'LEFT'
                      ? '⬅️'
                      : robotDir === 'RIGHT'
                      ? '➡️'
                      : '⏹️'}
                  </div>
                  <strong>Robot Chassis State: {robotDir}</strong>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
                    {(['FORWARD', 'BACKWARD', 'LEFT', 'RIGHT', 'STOP'] as const).map((d) => (
                      <button
                        key={d}
                        className={`btn btn-sm ${robotDir === d ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setRobotDir(d)}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Completion CTA */}
          {allPassed && checked && (
            <div className="check-item ok" style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <strong>🎉 Session {session.id} Completed!</strong> (+{session.xpReward} XP)
              </div>
              {session.id < 30 && (
                <button className="btn btn-success btn-sm" onClick={() => openSession(session.id + 1)}>
                  Next Session <ArrowRight size={14} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Real ESP32 Hardware Upload */}
      <UploadPanel code={code} buttonLabel={`Upload Session ${session.id} to ESP32`} />
    </div>
  );
};
