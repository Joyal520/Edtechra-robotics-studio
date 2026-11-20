import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Loader2,
  Lock,
  Plug,
  Unplug,
  XCircle,
} from 'lucide-react';
import { BeginnerFirmwareUploader } from '../components/BeginnerFirmwareUploader';
import { ESP32BoardSVG, ESP32_PARTS, type BoardPartId } from '../components/ESP32BoardSVG';
import { Levels4To12 } from '../components/Levels4To12';
import { QuizEngine } from '../components/QuizEngine';
import { useStudio } from '../context/StudioContext';
import { BEGINNER_LEVELS, XP_RULES } from '../data/beginnerJourney';

const ALL_10_PARTS: BoardPartId[] = [
  'mcu',
  'usb',
  'gpio',
  'gnd',
  '3v3',
  'en',
  'boot',
  'wifi',
  'pwr',
  'uart',
];

const MATCH_TARGETS: { id: BoardPartId; clue: string }[] = [
  { id: 'mcu', clue: 'The silver-shielded brain that runs your program' },
  { id: 'usb', clue: 'Connects the board to your computer for power & uploading' },
  { id: 'gpio', clue: 'Numbered pins that control LEDs or read buttons' },
  { id: 'gnd', clue: '0V negative return path that completes every circuit' },
  { id: 'en', clue: 'Button that restarts your ESP32 from the beginning' },
  { id: 'wifi', clue: 'Gold zig-zag trace used for wireless IoT connections' },
];

const BLINK_LINES = [
  {
    code: 'void setup() {',
    explain: 'Runs ONCE when your ESP32 powers on or resets. We put one-time setup commands here.',
  },
  {
    code: '  pinMode(2, OUTPUT);',
    explain: 'Tells the ESP32 that GPIO pin 2 (the built-in blue LED) will send signals OUT.',
  },
  {
    code: '}',
    explain: 'Marks the end of the setup() section.',
  },
  {
    code: 'void loop() {',
    explain: 'Runs again and again FOREVER in order from top to bottom.',
  },
  {
    code: '  digitalWrite(2, HIGH);',
    explain: 'Sends a HIGH (3.3V) signal to GPIO 2 — turning the built-in LED ON!',
  },
  {
    code: '  delay(1000);',
    explain: 'Pauses for 1,000 milliseconds (1 second) while the LED stays ON.',
  },
  {
    code: '  digitalWrite(2, LOW);',
    explain: 'Sets GPIO 2 to LOW (0V) — turning the built-in LED OFF.',
  },
  {
    code: '  delay(1000);',
    explain: 'Waits 1 second while the LED is OFF, then loop() repeats from the top!',
  },
  {
    code: '}',
    explain: 'Marks the end of loop() — the ESP32 immediately jumps back to the start of loop().',
  },
];

export const BeginnerLevelPage: React.FC = () => {
  const {
    activeLevel,
    openLevel,
    setTab,
    progress,
    device,
    hwConnecting,
    hwError,
    connectESP32,
    disconnectESP32,
    recordQuizPass,
    completeBeginnerLevel,
    awardTaskXP,
  } = useStudio();

  const levelDef = BEGINNER_LEVELS.find((l) => l.level === activeLevel) || BEGINNER_LEVELS[0];
  const quizBest = progress.quizScores[levelDef.level] ?? 0;
  const quizPassed = quizBest >= 80;
  const levelCompleted = progress.completedLevels.includes(levelDef.level);

  // Level 1 states
  const [l1Step, setL1Step] = useState<'lessons' | 'explore' | 'activity' | 'quiz' | 'done'>('lessons');
  const [selectedPart, setSelectedPart] = useState<BoardPartId>('mcu');
  const [exploredParts, setExploredParts] = useState<BoardPartId[]>(['mcu']);
  const [selectedChip, setSelectedChip] = useState<BoardPartId | null>(null);
  const [matchedParts, setMatchedParts] = useState<Record<string, BoardPartId>>({});
  const [matchError, setMatchError] = useState<string | null>(null);

  // Level 2 states
  const [l2Step, setL2Step] = useState<'lesson' | 'connect' | 'quiz' | 'done'>('lesson');

  // Level 3 states
  const [l3Step, setL3Step] = useState<'lesson' | 'code' | 'upload' | 'quiz' | 'done'>('lesson');
  const [activeLineIdx, setActiveLineIdx] = useState<number>(0);
  const [blinkStep, setBlinkStep] = useState<number>(0);
  const [l3Uploaded, setL3Uploaded] = useState<boolean>(false);

  useEffect(() => {
    setL1Step('lessons');
    setL2Step('lesson');
    setL3Step('lesson');
  }, [activeLevel]);

  useEffect(() => {
    if (activeLevel !== 3) return;
    const id = window.setInterval(() => setBlinkStep((s) => (s + 1) % 5), 950);
    return () => window.clearInterval(id);
  }, [activeLevel]);

  const handleSelectBoardPart = (part: BoardPartId) => {
    setSelectedPart(part);
    if (!exploredParts.includes(part)) {
      setExploredParts((prev) => [...prev, part]);
    }
  };

  const handlePlaceMatch = (targetId: BoardPartId, droppedId?: BoardPartId) => {
    const pick = droppedId || selectedChip;
    if (!pick) return;
    if (pick === targetId) {
      setMatchedParts((prev) => ({ ...prev, [targetId]: pick }));
      setSelectedChip(null);
      setMatchError(null);
    } else {
      setMatchError(
        `"${ESP32_PARTS[pick].name}" does not match that clue — try another spot!`
      );
    }
  };

  const allMatched = MATCH_TARGETS.every((t) => matchedParts[t.id] === t.id);

  // Levels 4–12 interactive workbench + precompiled firmware + 5-question quizzes
  if (levelDef.level >= 4) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setTab('journey')}>
                <ArrowLeft size={14} /> Learning Journey
              </button>
              <span className="tag">LEVEL {levelDef.level} OF 12</span>
              {levelCompleted && (
                <span className="tag tag-ok">
                  <CheckCircle2 size={13} /> {levelDef.badge.icon} {levelDef.badge.name}
                </span>
              )}
            </div>
            <h1>
              {levelDef.icon} Level {levelDef.level} — {levelDef.title}
            </h1>
            <p className="muted" style={{ margin: 0 }}>{levelDef.description}</p>
          </div>
        </div>
        <Levels4To12 levelDef={levelDef} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setTab('journey')}>
              <ArrowLeft size={14} /> Learning Journey
            </button>
            <span className="tag">LEVEL {levelDef.level} OF 12</span>
            {levelCompleted && (
              <span className="tag tag-ok">
                <CheckCircle2 size={13} /> Completed • {levelDef.badge.icon} {levelDef.badge.name}
              </span>
            )}
          </div>
          <h1>
            {levelDef.icon} Level {levelDef.level} — {levelDef.title}
          </h1>
          <p className="muted" style={{ margin: 0 }}>
            <strong>{levelDef.theme}</strong> — {levelDef.description}
          </p>
        </div>
      </div>

      {/* =================================================================
          LEVEL 1 — MEET THE ESP32
         ================================================================= */}
      {levelDef.level === 1 && (
        <>
          <div className="stepper">
            {[
              { id: 'lessons' as const, label: '1. Lessons' },
              { id: 'explore' as const, label: '2. Explore Board (10 Parts)' },
              { id: 'activity' as const, label: '3. Identify the Parts' },
              { id: 'quiz' as const, label: '4. 10-Question Quiz' },
              { id: 'done' as const, label: '5. Badge & Complete' },
            ].map((s) => (
              <button
                key={s.id}
                className={`step-pill ${l1Step === s.id ? 'active' : ''}`}
                onClick={() => setL1Step(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>

          {l1Step === 'lessons' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card">
                <h2>Lesson 1 — What Is ESP32?</h2>
                <p>
                  The <strong>ESP32</strong> is a small, powerful <strong>microcontroller board</strong> — like a tiny computer designed to control real-world electronics.
                </p>
                <div className="grid-3" style={{ marginTop: 14 }}>
                  {[
                    { icon: '📥', title: 'Receives Information', desc: 'Reads push buttons, light sensors, temperature sensors, and distance sensors.' },
                    { icon: '🧠', title: 'Processes Instructions', desc: 'Follows your step-by-step program to make smart decisions in milliseconds.' },
                    { icon: '💡', title: 'Controls Electronics', desc: 'Turns LEDs, buzzers, displays, relays, and robot motors ON and OFF.' },
                    { icon: '📶', title: 'Wi-Fi & Bluetooth', desc: 'Connects wirelessly to phones and the internet for IoT (Internet of Things) devices.' },
                    { icon: '🤖', title: 'Built for Robotics', desc: 'Fast, reliable, and affordable — used by students and real engineers worldwide.' },
                    { icon: '💻', title: 'Programming', desc: 'Programming means giving clear step-by-step instructions to the ESP32.' },
                  ].map((c) => (
                    <div key={c.title} className="card-sm">
                      <div style={{ fontSize: 24, marginBottom: 6 }}>{c.icon}</div>
                      <h3>{c.title}</h3>
                      <div className="muted" style={{ fontSize: 13 }}>{c.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h2>Lesson 3 — What Can We Build with ESP32?</h2>
                <div className="grid-4" style={{ marginTop: 10 }}>
                  {[
                    '💡 Smart Lights',
                    '🤖 Autonomous Robots',
                    '🚦 Traffic Lights',
                    '🌦️ Weather Stations',
                    '🌱 Automatic Irrigation',
                    '🔒 Security Systems',
                    '🏠 Smart Homes',
                    '📶 Wi-Fi IoT Devices',
                  ].map((proj) => (
                    <div key={proj} className="card-sm" style={{ fontWeight: 700, textAlign: 'center' }}>
                      {proj}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      awardTaskXP(XP_RULES.lesson, 'Completed Level 1 Introduction Lessons');
                      setL1Step('explore');
                    }}
                  >
                    Next: Explore the ESP32 Board <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {l1Step === 'explore' && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
                <div>
                  <h2 style={{ margin: 0 }}>Lesson 2 — Explore the ESP32 Board</h2>
                  <p className="muted" style={{ margin: '4px 0 0' }}>
                    Click each component on the board or select a label below to learn all 10 hardware parts.
                  </p>
                </div>
                <span className={exploredParts.length >= 10 ? 'tag tag-ok' : 'tag'}>
                  {ALL_10_PARTS.filter((p) => exploredParts.includes(p)).length} / 10 Explored
                </span>
              </div>

              <div className="grid-2" style={{ alignItems: 'center' }}>
                <div className="card-sm" style={{ background: '#0F172A', padding: 18 }}>
                  <ESP32BoardSVG
                    selectedPart={selectedPart}
                    exploredParts={exploredParts}
                    onSelectPart={handleSelectBoardPart}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {ALL_10_PARTS.map((pid) => {
                      const done = exploredParts.includes(pid);
                      const active = selectedPart === pid;
                      return (
                        <button
                          key={pid}
                          onClick={() => handleSelectBoardPart(pid)}
                          className={`btn btn-sm ${active ? 'btn-primary' : 'btn-secondary'}`}
                          style={
                            !active && done
                              ? { background: 'var(--success-bg)', borderColor: 'var(--success-border)', color: '#15803D' }
                              : undefined
                          }
                        >
                          {done ? '✓ ' : ''}
                          {ESP32_PARTS[pid].name}
                        </button>
                      );
                    })}
                  </div>

                  <div className="card-sm" style={{ background: 'var(--primary-light)', borderColor: 'var(--primary-border)', padding: 18 }}>
                    <span className="tag" style={{ marginBottom: 8 }}>{ESP32_PARTS[selectedPart].shortDesc}</span>
                    <h3 style={{ fontSize: 18 }}>{ESP32_PARTS[selectedPart].name}</h3>
                    <p style={{ margin: 0 }}>{ESP32_PARTS[selectedPart].details}</p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <button className="btn btn-secondary" onClick={() => setL1Step('lessons')}>Back</button>
                    <button className="btn btn-primary" onClick={() => setL1Step('activity')}>
                      Next: Identify the Parts Activity <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {l1Step === 'activity' && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <h2>Interactive Activity — Identify the Parts</h2>
                <p className="muted" style={{ margin: 0 }}>
                  Drag a component name onto its matching description — or tap a component name first, then tap its matching box (mobile-friendly!).
                </p>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {MATCH_TARGETS.map((t) => {
                  const alreadyPlaced = Object.values(matchedParts).includes(t.id);
                  const isSel = selectedChip === t.id;
                  return (
                    <button
                      key={t.id}
                      draggable={!alreadyPlaced}
                      disabled={alreadyPlaced}
                      onDragStart={(e) => e.dataTransfer.setData('text/plain', t.id)}
                      onClick={() => setSelectedChip(isSel ? null : t.id)}
                      className={`btn btn-sm ${isSel ? 'btn-primary' : 'btn-secondary'}`}
                      style={alreadyPlaced ? { opacity: 0.45 } : undefined}
                    >
                      {alreadyPlaced ? '✓ ' : ''}
                      {ESP32_PARTS[t.id].name}
                    </button>
                  );
                })}
              </div>

              {matchError && <div className="check-item err">{matchError}</div>}

              <div className="grid-2">
                {MATCH_TARGETS.map((t) => {
                  const placed = matchedParts[t.id];
                  return (
                    <div
                      key={t.id}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        handlePlaceMatch(t.id, e.dataTransfer.getData('text/plain') as BoardPartId);
                      }}
                      onClick={() => !placed && handlePlaceMatch(t.id)}
                      className="card-sm"
                      style={{
                        cursor: placed ? 'default' : 'pointer',
                        borderStyle: placed ? 'solid' : 'dashed',
                        borderWidth: 2,
                        borderColor: placed ? 'var(--success)' : selectedChip ? 'var(--primary)' : 'var(--border-strong)',
                        background: placed ? 'var(--success-bg)' : '#FFFFFF',
                      }}
                    >
                      <div style={{ fontSize: 13.5, marginBottom: 8 }}>{t.clue}</div>
                      {placed ? (
                        <span className="tag tag-ok">✓ {ESP32_PARTS[placed].name}</span>
                      ) : (
                        <span className="muted" style={{ fontSize: 12.5 }}>
                          {selectedChip ? 'Tap here to place selected part' : 'Drop or tap a part here'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button className="btn btn-secondary" onClick={() => setL1Step('explore')}>Back</button>
                <button className="btn btn-primary" disabled={!allMatched} onClick={() => setL1Step('quiz')}>
                  {allMatched ? 'Great! Go to Level 1 Quiz →' : `Match all ${MATCH_TARGETS.length} parts to continue`}
                </button>
              </div>
            </div>
          )}

          {l1Step === 'quiz' && levelDef.quiz && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <QuizEngine
                title="Level 1 Quiz — Meet the ESP32"
                questions={levelDef.quiz}
                bestScore={progress.quizScores[1]}
                onPass={(pct) => {
                  recordQuizPass(1, pct);
                  completeBeginnerLevel(1);
                }}
              />
              {quizPassed && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn btn-success" onClick={() => setL1Step('done')}>
                    View Completion &amp; Badge <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}

          {l1Step === 'done' && (
            <div className="celebration">
              <div style={{ fontSize: 52 }}>{levelDef.badge.icon}</div>
              <h2 style={{ fontSize: 28, marginBottom: 6 }}>Level 1 Complete!</h2>
              <p style={{ margin: '0 auto 16px', maxWidth: 500 }}>
                {quizPassed
                  ? `Awesome work! You earned the ${levelDef.badge.name} badge and unlocked Level 2: Connect Your ESP32.`
                  : 'Complete the 10-question quiz with 80% or higher to earn your badge and unlock Level 2.'}
              </p>
              {quizPassed ? (
                <button className="btn btn-primary" onClick={() => openLevel(2)}>
                  Unlock &amp; Start Level 2: Connect Your ESP32 <ArrowRight size={16} />
                </button>
              ) : (
                <button className="btn btn-primary" onClick={() => setL1Step('quiz')}>
                  Take Level 1 Quiz
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* =================================================================
          LEVEL 2 — CONNECT YOUR ESP32
         ================================================================= */}
      {levelDef.level === 2 && (
        <>
          <div className="stepper">
            {[
              { id: 'lesson' as const, label: '1. USB & Serial Lesson' },
              { id: 'connect' as const, label: '2. Connect Real ESP32' },
              { id: 'quiz' as const, label: '3. 5-Question Quiz' },
              { id: 'done' as const, label: '4. Badge & Complete' },
            ].map((s) => (
              <button
                key={s.id}
                className={`step-pill ${l2Step === s.id ? 'active' : ''}`}
                onClick={() => setL2Step(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>

          {l2Step === 'lesson' && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <h2>How Your Computer Talks to the ESP32</h2>
              <p>
                Your computer sends programming instructions to the ESP32 through a <strong>USB data cable</strong> using <strong>serial communication</strong>.
              </p>
              <div className="grid-3">
                <div className="card-sm" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28 }}>💻</div>
                  <h3>1. Computer (Browser)</h3>
                  <div className="muted" style={{ fontSize: 13 }}>Sends instructions through Web Serial in Chrome or Edge.</div>
                </div>
                <div className="card-sm" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28 }}>🔌</div>
                  <h3>2. USB Data Cable</h3>
                  <div className="muted" style={{ fontSize: 13 }}>Carries both 5V power AND data wires (avoid charge-only phone cables).</div>
                </div>
                <div className="card-sm" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28 }}>🤖</div>
                  <h3>3. ESP32 Board</h3>
                  <div className="muted" style={{ fontSize: 13 }}>CP2102 / CH340 chip translates USB into Serial data for the ESP32 brain.</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    awardTaskXP(XP_RULES.lesson, 'Completed Level 2 USB Connection Lesson');
                    setL2Step('connect');
                  }}
                >
                  Start Practical Mission: Connect ESP32 <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {l2Step === 'connect' && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2>Practical Mission — Connect Your Real ESP32</h2>

              {/* Required RED / GREEN Hardware Status Banner */}
              <div className={`status-banner ${device ? 'connected' : 'disconnected'}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {device ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
                  <div>
                    <div style={{ fontSize: 15 }}>
                      {device ? 'ESP32 CONNECTED SUCCESSFULLY' : 'ESP32 NOT CONNECTED'}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>
                      {device
                        ? `Detected: ${device.chip} (${device.portLabel})`
                        : 'Follow the 6 steps below and click Connect ESP32.'}
                    </div>
                  </div>
                </div>
                <div>
                  {!device ? (
                    <button className="btn btn-primary" onClick={connectESP32} disabled={hwConnecting}>
                      {hwConnecting ? <Loader2 size={16} /> : <Plug size={16} />}
                      {hwConnecting ? 'Connecting...' : 'Connect ESP32'}
                    </button>
                  ) : (
                    <button className="btn btn-secondary btn-sm" onClick={disconnectESP32}>
                      <Unplug size={15} /> Disconnect
                    </button>
                  )}
                </div>
              </div>

              {hwError && <div className="check-item err">{hwError}</div>}

              <ol style={{ margin: 0, paddingLeft: 22, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>Locate the USB port on your ESP32 board.</li>
                <li>Plug the small end of your USB data cable into the ESP32.</li>
                <li>Plug the other end into your computer&apos;s USB port (the red PWR LED will light up).</li>
                <li>Click <strong>Connect ESP32</strong> above.</li>
                <li>In the browser popup, click your ESP32 port (for example, <em>CP2102 USB to UART Bridge</em>) so it is highlighted.</li>
                <li>Click <strong>Connect</strong> in the popup to establish a real hardware link!</li>
              </ol>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <button className="btn btn-secondary" onClick={() => setL2Step('lesson')}>Back</button>
                <button
                  className="btn btn-primary"
                  disabled={!progress.hardwareConnectedOnce && !device}
                  onClick={() => setL2Step('quiz')}
                >
                  {progress.hardwareConnectedOnce || device ? (
                    <>Hardware Verified! Go to Level 2 Quiz <ArrowRight size={16} /></>
                  ) : (
                    <><Lock size={15} /> Connect Real ESP32 to Unlock Quiz</>
                  )}
                </button>
              </div>
            </div>
          )}

          {l2Step === 'quiz' && levelDef.quiz && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <QuizEngine
                title="Level 2 Quiz — Connect Your ESP32"
                questions={levelDef.quiz}
                bestScore={progress.quizScores[2]}
                onPass={(pct) => {
                  recordQuizPass(2, pct);
                  if (progress.hardwareConnectedOnce || device) {
                    completeBeginnerLevel(2);
                  }
                }}
              />
              {quizPassed && (progress.hardwareConnectedOnce || device) && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn btn-success" onClick={() => setL2Step('done')}>
                    Claim Badge &amp; Unlock Level 3 <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}

          {l2Step === 'done' && (
            <div className="celebration">
              <div style={{ fontSize: 52 }}>{levelDef.badge.icon}</div>
              <h2 style={{ fontSize: 28, marginBottom: 6 }}>Level 2 Complete!</h2>
              <p style={{ margin: '0 auto 16px', maxWidth: 500 }}>
                You established a real USB serial connection with your ESP32 and passed the quiz. You earned the <strong>{levelDef.badge.name}</strong> badge!
              </p>
              <button className="btn btn-primary" onClick={() => openLevel(3)}>
                Start Level 3: Blink Your ESP32 <ArrowRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* =================================================================
          LEVEL 3 — BLINK YOUR ESP32 (PRECOMPILED FIRMWARE)
         ================================================================= */}
      {levelDef.level === 3 && (
        <>
          <div className="stepper">
            {[
              { id: 'lesson' as const, label: '1. Programming & LED' },
              { id: 'code' as const, label: '2. Interactive Code' },
              { id: 'upload' as const, label: '3. Upload Blink Firmware' },
              { id: 'quiz' as const, label: '4. 5-Question Quiz' },
              { id: 'done' as const, label: '5. Badge & Complete' },
            ].map((s) => (
              <button
                key={s.id}
                className={`step-pill ${l3Step === s.id ? 'active' : ''}`}
                onClick={() => setL3Step(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>

          {l3Step === 'lesson' && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2>Lessons 1–3: Programs, LEDs &amp; the Blink Sequence</h2>
              <div className="grid-2">
                <div className="card-sm">
                  <h3>What Is Programming?</h3>
                  <p className="muted" style={{ margin: 0 }}>
                    A <strong>program</strong> is a step-by-step list of instructions given to a microcontroller. Your ESP32 follows every instruction in exact order.
                  </p>
                </div>
                <div className="card-sm">
                  <h3>What Is an LED?</h3>
                  <p className="muted" style={{ margin: 0 }}>
                    <strong>LED</strong> stands for <em>Light-Emitting Diode</em>. Sending <strong>HIGH</strong> turns it ON; sending <strong>LOW</strong> turns it OFF. Your ESP32 has a built-in LED on <strong>GPIO 2</strong>.
                  </p>
                </div>
              </div>

              <div className="card-sm" style={{ textAlign: 'center', padding: 20 }}>
                <div style={{ fontWeight: 700, marginBottom: 12 }}>Visual Blinking Sequence</div>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  {['ON (HIGH)', 'WAIT (1s)', 'OFF (LOW)', 'WAIT (1s)', 'REPEAT ↻'].map((lbl, idx) => (
                    <React.Fragment key={lbl}>
                      <div
                        style={{
                          padding: '10px 14px',
                          borderRadius: 10,
                          fontWeight: 700,
                          fontSize: 13.5,
                          background: blinkStep === idx ? 'var(--primary)' : '#FFFFFF',
                          color: blinkStep === idx ? '#FFFFFF' : 'var(--text)',
                          border: `1.5px solid ${blinkStep === idx ? 'var(--primary)' : 'var(--border)'}`,
                        }}
                      >
                        {lbl}
                      </div>
                      {idx < 4 && <span className="muted">→</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    awardTaskXP(XP_RULES.lesson, 'Completed Level 3 LED & Sequence Lesson');
                    setL3Step('code');
                  }}
                >
                  Next: Click &amp; Understand Each Code Line <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {l3Step === 'code' && (
            <div className="card">
              <h2>Interactive Code Explorer — Click Any Line</h2>
              <p className="muted" style={{ marginTop: 0 }}>
                Click any line of the Blink program below to see what it tells the ESP32 to do.
              </p>
              <div className="grid-2" style={{ alignItems: 'start' }}>
                <div className="code-block" style={{ padding: 10 }}>
                  {BLINK_LINES.map((line, idx) => (
                    <button
                      key={idx}
                      className={`code-line-btn ${activeLineIdx === idx ? 'active' : ''}`}
                      onClick={() => setActiveLineIdx(idx)}
                    >
                      <span style={{ color: '#64748B', minWidth: 20 }}>{idx + 1}</span>
                      <span>{line.code}</span>
                    </button>
                  ))}
                </div>
                <div className="card-sm" style={{ background: 'var(--primary-light)', borderColor: 'var(--primary-border)', padding: 18 }}>
                  <span className="tag" style={{ marginBottom: 8 }}>Line {activeLineIdx + 1} Explanation</span>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, marginBottom: 8 }}>
                    {BLINK_LINES[activeLineIdx].code.trim()}
                  </div>
                  <p style={{ margin: 0 }}>{BLINK_LINES[activeLineIdx].explain}</p>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
                <button className="btn btn-secondary" onClick={() => setL3Step('lesson')}>Back</button>
                <button className="btn btn-primary" onClick={() => setL3Step('upload')}>
                  Next: Upload Blink Firmware to ESP32 <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {l3Step === 'upload' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <BeginnerFirmwareUploader
                level={3}
                firmwareIds={['level-3-blink', 'level-3-blink-slow', 'level-3-blink-fast']}
                title="Level 3 Mission — Upload & Experiment with Blink Firmware"
                onUploadSuccess={() => setL3Uploaded(true)}
              />

              <div className="card-sm" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ fontSize: 13.5 }}>
                  <Cpu size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                  {l3Uploaded || progress.uploadedOnce
                    ? 'Firmware uploaded! Try Slow Blink and Fast Blink above, then take the Level 3 Quiz.'
                    : 'Upload any Blink firmware variant to your ESP32 above to complete the hardware mission.'}
                </div>
                <button
                  className="btn btn-primary"
                  disabled={!l3Uploaded && !progress.uploadedOnce}
                  onClick={() => setL3Step('quiz')}
                >
                  {l3Uploaded || progress.uploadedOnce ? (
                    <>Go to Level 3 Quiz <ArrowRight size={16} /></>
                  ) : (
                    <><Lock size={15} /> Upload Firmware to Unlock Quiz</>
                  )}
                </button>
              </div>
            </div>
          )}

          {l3Step === 'quiz' && levelDef.quiz && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <QuizEngine
                title="Level 3 Quiz — Blink Your ESP32"
                questions={levelDef.quiz}
                bestScore={progress.quizScores[3]}
                onPass={(pct) => {
                  recordQuizPass(3, pct);
                  if (l3Uploaded || progress.uploadedOnce) {
                    completeBeginnerLevel(3);
                  }
                }}
              />
              {quizPassed && (l3Uploaded || progress.uploadedOnce) && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn btn-success" onClick={() => setL3Step('done')}>
                    Claim Badge &amp; Complete Level 3 <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}

          {l3Step === 'done' && (
            <div className="celebration">
              <div style={{ fontSize: 52 }}>{levelDef.badge.icon}</div>
              <h2 style={{ fontSize: 28, marginBottom: 6 }}>Level 3 Complete!</h2>
              <p style={{ margin: '0 auto 16px', maxWidth: 520 }}>
                You uploaded your first real program to the ESP32, experimented with blink speeds, and passed the quiz. You earned the <strong>{levelDef.badge.name}</strong> badge!
              </p>
              <button className="btn btn-primary" onClick={() => setTab('journey')}>
                Back to Learning Journey <ArrowRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
