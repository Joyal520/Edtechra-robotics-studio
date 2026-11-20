import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, Music, Play, Square, Volume2 } from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import type { BeginnerLevelDef } from '../data/beginnerJourney';
import { XP_RULES } from '../data/beginnerJourney';
import { BeginnerFirmwareUploader } from './BeginnerFirmwareUploader';
import { QuizEngine } from './QuizEngine';
import { WiringDiagramSVG, type WiringType } from './WiringDiagramSVG';

interface LevelMeta {
  wiring: WiringType;
  parts: string[];
  tips: { icon: string; title: string; text: string }[];
}

const LEVEL_META: Record<number, LevelMeta> = {
  4: {
    wiring: 'external-led',
    parts: ['ESP32', 'Breadboard', '1× LED', '330Ω Resistor', '2× Jumper Wires'],
    tips: [
      { icon: '📏', title: 'Long Leg = +', text: 'Connect the longer LED leg (Anode) to the 330Ω resistor.' },
      { icon: '🛡️', title: '330Ω Resistor', text: 'Protects your LED by limiting current from GPIO 23.' },
      { icon: '➖', title: 'Short Leg = GND', text: 'Connect the shorter LED leg (Cathode) back to GND.' },
    ],
  },
  5: {
    wiring: 'external-led',
    parts: ['ESP32', 'Breadboard', '1× LED', '330Ω Resistor', '2× Jumper Wires'],
    tips: [
      { icon: '· · ·', title: 'S = 3 Short', text: 'Three quick flashes in a row.' },
      { icon: '— — —', title: 'O = 3 Long', text: 'Three longer flashes held ON.' },
      { icon: '📡', title: 'Same Wiring', text: 'Reuse your exact Level 4 LED circuit on GPIO 23!' },
    ],
  },
  6: {
    wiring: 'traffic-light',
    parts: ['ESP32', 'Breadboard', 'Red, Yellow & Green LEDs', '3× 330Ω Resistors', 'Jumper Wires'],
    tips: [
      { icon: '🔴', title: 'Red → GPIO 23', text: 'Stops traffic for 3 seconds.' },
      { icon: '🟢', title: 'Green → GPIO 21', text: 'Cars go for 3 seconds.' },
      { icon: '🟡', title: 'Yellow → GPIO 22', text: 'Warns before returning to Red.' },
    ],
  },
  7: {
    wiring: 'button-led',
    parts: ['ESP32', 'Breadboard', 'Push Button', '1× LED', '330Ω Resistor', 'Jumper Wires'],
    tips: [
      { icon: '🔘', title: 'Button = Input', text: 'Connect button legs between GPIO 18 and GND.' },
      { icon: '💡', title: 'LED = Output', text: 'Connect LED + 330Ω resistor to GPIO 23 and GND.' },
      { icon: '🔁', title: '2 Modes', text: 'Try both Press-and-Hold and Toggle On/Off firmware!' },
    ],
  },
  8: {
    wiring: 'button-led',
    parts: ['ESP32', 'Breadboard', 'Push Button (GPIO 18)', 'LED (GPIO 23)', '330Ω Resistor'],
    tips: [
      { icon: '⏳', title: 'Random Wait', text: 'ESP32 waits 2–4.5 seconds before lighting the LED.' },
      { icon: '⚡', title: 'Fastest Wins', text: 'Press the button as soon as the light turns ON!' },
      { icon: '📊', title: 'Serial Score', text: 'Open Hardware Lab → Serial Monitor to see your ms score.' },
    ],
  },
  9: {
    wiring: 'buzzer',
    parts: ['ESP32', 'Piezo Buzzer', '2× Jumper Wires'],
    tips: [
      { icon: '🔔', title: 'Buzzer (+) → 25', text: 'Connect the positive (+) buzzer pin to GPIO 25.' },
      { icon: '➖', title: 'Buzzer (-) → GND', text: 'Connect the negative (-) buzzer pin to GND.' },
      { icon: '🔊', title: 'Frequency = Pitch', text: 'Higher frequency makes a higher tone.' },
    ],
  },
  10: {
    wiring: 'buzzer',
    parts: ['ESP32', 'Piezo Buzzer (GPIO 25)', '2× Jumper Wires'],
    tips: [
      { icon: '🎵', title: 'Notes = Hz', text: 'Middle C is 262 Hz, G is 392 Hz, High C is 523 Hz.' },
      { icon: '🎮', title: 'Game Sounds', text: 'Fast rising tones create arcade coin and victory sounds.' },
      { icon: '🔌', title: 'Same Wiring', text: 'Keep your exact Level 9 buzzer wiring on GPIO 25!' },
    ],
  },
  11: {
    wiring: 'four-leds',
    parts: ['ESP32', 'Breadboard', '4× LEDs', '4× 330Ω Resistors', 'Jumper Wires'],
    tips: [
      { icon: '✨', title: '4 Outputs', text: 'Wire LEDs to GPIOs 23, 22, 21, and 19.' },
      { icon: '🛡️', title: '4 Resistors', text: 'Use one 330Ω resistor for each LED.' },
      { icon: '🏃', title: 'Motion Illusion', text: 'Fast sequential lighting looks like moving light!' },
    ],
  },
  12: {
    wiring: 'four-leds',
    parts: ['ESP32', 'Breadboard', '4× Colored LEDs', '4× 330Ω Resistors', 'Jumper Wires'],
    tips: [
      { icon: '🎉', title: '5 Party Modes', text: 'Disco, Chase, Alternating, Police, and Party Strobe!' },
      { icon: '🎛️', title: 'Custom Beat', text: 'Design your own LED sequence below.' },
      { icon: '🏆', title: 'Final Capstone', text: 'Complete Level 12 to earn the DJ Light Engineer badge!' },
    ],
  },
};

function playWebTone(freq: number, durationMs = 220) {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    gain.gain.value = 0.14;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    setTimeout(() => {
      osc.stop();
      ctx.close().catch(() => {});
    }, durationMs);
  } catch {
    // audio unavailable
  }
}

export const Levels4To12: React.FC<{ levelDef: BeginnerLevelDef }> = ({ levelDef }) => {
  const { progress, openLevel, setTab, recordQuizPass, completeBeginnerLevel, awardTaskXP } = useStudio();
  const meta = LEVEL_META[levelDef.level];

  const [step, setStep] = useState<'learn' | 'lab' | 'upload' | 'quiz' | 'done'>('learn');
  const [uploaded, setUploaded] = useState(false);

  // Interactive states across levels
  const [ledSpeed, setLedSpeed] = useState(600);
  const [ledOn, setLedOn] = useState(true);
  const [sosIdx, setSosIdx] = useState(0);
  const [trafficPhase, setTrafficPhase] = useState<'red' | 'green' | 'yellow'>('red');
  const [btnMode, setBtnMode] = useState<'hold' | 'toggle'>('hold');
  const [btnLit, setBtnLit] = useState(false);

  // Level 8 Reaction Game state
  const [rxState, setRxState] = useState<'idle' | 'waiting' | 'go' | 'result' | 'early'>('idle');
  const [rxMs, setRxMs] = useState<number | null>(null);
  const [rxBest, setRxBest] = useState<number | null>(null);
  const rxTimerRef = useRef<number | null>(null);
  const rxStartRef = useRef<number>(0);

  // Level 11 & 12 4-LED Pattern state
  const [patternMode, setPatternMode] = useState<'knight' | 'police' | 'disco' | 'alternating' | 'party'>('knight');
  const [fourLeds, setFourLeds] = useState<[boolean, boolean, boolean, boolean]>([true, false, false, false]);
  const [customSteps, setCustomSteps] = useState<boolean[]>([true, false, true, false]);

  const quizBest = progress.quizScores[levelDef.level] ?? 0;
  const quizPassed = quizBest >= 80;

  useEffect(() => {
    setStep('learn');
    setUploaded(false);
    setRxState('idle');
    setRxMs(null);
  }, [levelDef.level]);

  // Level 4 LED preview timer
  useEffect(() => {
    if (levelDef.level !== 4 || step !== 'lab') return;
    const id = window.setInterval(() => setLedOn((v) => !v), ledSpeed);
    return () => window.clearInterval(id);
  }, [levelDef.level, step, ledSpeed]);

  // Level 5 SOS preview timer
  useEffect(() => {
    if (levelDef.level !== 5 || step !== 'lab') return;
    const seq = [1, 0, 1, 0, 1, 0, 2, 0, 2, 0, 2, 0, 1, 0, 1, 0, 1, 0];
    let i = 0;
    const tick = () => {
      setSosIdx(i);
      const val = seq[i];
      const wait = val === 2 ? 550 : val === 1 ? 220 : 200;
      i = (i + 1) % seq.length;
      timer = window.setTimeout(tick, wait);
    };
    let timer = window.setTimeout(tick, 200);
    return () => window.clearTimeout(timer);
  }, [levelDef.level, step]);

  // Level 6 Traffic light preview timer
  useEffect(() => {
    if (levelDef.level !== 6 || step !== 'lab') return;
    const order: ('red' | 'green' | 'yellow')[] = ['red', 'green', 'yellow'];
    let i = 0;
    const id = window.setInterval(() => {
      i = (i + 1) % 3;
      setTrafficPhase(order[i]);
    }, 1800);
    return () => window.clearInterval(id);
  }, [levelDef.level, step]);

  // Level 11 & 12 4-LED animation timer
  useEffect(() => {
    if ((levelDef.level !== 11 && levelDef.level !== 12) || step !== 'lab') return;
    let tick = 0;
    const knightSeq = [0, 1, 2, 3, 2, 1];
    const id = window.setInterval(() => {
      tick++;
      if (patternMode === 'knight') {
        const active = knightSeq[tick % knightSeq.length];
        setFourLeds([0, 1, 2, 3].map((n) => n === active) as [boolean, boolean, boolean, boolean]);
      } else if (patternMode === 'police') {
        const left = tick % 4 < 2;
        const on = tick % 2 === 0;
        setFourLeds([left && on, left && on, !left && on, !left && on]);
      } else if (patternMode === 'alternating') {
        const odd = tick % 2 === 0;
        setFourLeds([odd, !odd, odd, !odd]);
      } else if (patternMode === 'disco') {
        setFourLeds([Math.random() > 0.5, Math.random() > 0.5, Math.random() > 0.5, Math.random() > 0.5]);
      } else {
        const on = tick % 2 === 0;
        setFourLeds([on, on, on, on]);
      }
    }, 220);
    return () => window.clearInterval(id);
  }, [levelDef.level, step, patternMode]);

  const startReactionGame = () => {
    if (rxTimerRef.current) window.clearTimeout(rxTimerRef.current);
    setRxState('waiting');
    setRxMs(null);
    const delay = 1400 + Math.random() * 2400;
    rxTimerRef.current = window.setTimeout(() => {
      rxStartRef.current = performance.now();
      setRxState('go');
    }, delay);
  };

  const hitReactionButton = () => {
    if (rxState === 'waiting') {
      if (rxTimerRef.current) window.clearTimeout(rxTimerRef.current);
      setRxState('early');
      return;
    }
    if (rxState === 'go') {
      const elapsed = Math.round(performance.now() - rxStartRef.current);
      setRxMs(elapsed);
      setRxBest((b) => (b === null ? elapsed : Math.min(b, elapsed)));
      setRxState('result');
    }
  };

  const LED_COLORS = ['#DC2626', '#F59E0B', '#16A34A', '#2563EB'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="stepper">
        {[
          { id: 'learn' as const, label: '1. Learn & Wire' },
          { id: 'lab' as const, label: '2. Interactive Lab' },
          { id: 'upload' as const, label: '3. Upload Firmware' },
          { id: 'quiz' as const, label: '4. 5-Question Quiz' },
          { id: 'done' as const, label: '5. Badge' },
        ].map((s) => (
          <button
            key={s.id}
            className={`step-pill ${step === s.id ? 'active' : ''}`}
            onClick={() => setStep(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* STEP 1: LEARN & WIRE */}
      {step === 'learn' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
              {meta.parts.map((p) => (
                <span key={p} className="tag">{p}</span>
              ))}
            </div>
            <div className="grid-3" style={{ marginBottom: 18 }}>
              {meta.tips.map((t) => (
                <div key={t.title} className="card-sm">
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{t.icon}</div>
                  <h3>{t.title}</h3>
                  <div className="muted" style={{ fontSize: 13 }}>{t.text}</div>
                </div>
              ))}
            </div>

            <WiringDiagramSVG type={meta.wiring} />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button
                className="btn btn-primary"
                onClick={() => {
                  awardTaskXP(XP_RULES.lesson, `Completed Level ${levelDef.level} Lesson`);
                  setStep('lab');
                }}
              >
                Next: Try Interactive Lab <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: INTERACTIVE LAB */}
      {step === 'lab' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 18, textAlign: 'center' }}>
          {/* Level 4: Speed Preview */}
          {levelDef.level === 4 && (
            <>
              <h2>Test External LED Speed</h2>
              <div
                className="led-bulb"
                style={{
                  width: 78,
                  height: 78,
                  margin: '0 auto',
                  background: ledOn ? '#DC2626' : '#E2E8F0',
                  boxShadow: ledOn ? '0 0 36px rgba(220,38,38,0.65)' : 'none',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
                {[
                  { label: 'Slow (1.5s)', ms: 1500 },
                  { label: 'Medium (0.6s)', ms: 600 },
                  { label: 'Fast (0.2s)', ms: 200 },
                ].map((opt) => (
                  <button
                    key={opt.ms}
                    className={`btn btn-sm ${ledSpeed === opt.ms ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setLedSpeed(opt.ms)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Level 5: Morse SOS */}
          {levelDef.level === 5 && (
            <>
              <h2>Visual Morse SOS Pattern</h2>
              <div
                className="led-bulb"
                style={{
                  width: 78,
                  height: 78,
                  margin: '0 auto',
                  background: sosIdx % 2 === 0 ? '#2563EB' : '#E2E8F0',
                  boxShadow: sosIdx % 2 === 0 ? '0 0 36px rgba(37,99,235,0.65)' : 'none',
                }}
              />
              <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: 6, color: 'var(--primary)' }}>
                · · · &nbsp; — — — &nbsp; · · ·
              </div>
              <div className="muted">3 Short (S) → 3 Long (O) → 3 Short (S)</div>
            </>
          )}

          {/* Level 6: Traffic Light */}
          {levelDef.level === 6 && (
            <>
              <h2>Live Traffic Light Sequence</h2>
              <div className="traffic-housing">
                <div className="led-bulb" style={{ background: trafficPhase === 'red' ? '#EF4444' : '#334155', boxShadow: trafficPhase === 'red' ? '0 0 28px #EF4444' : 'none' }} />
                <div className="led-bulb" style={{ background: trafficPhase === 'yellow' ? '#FACC15' : '#334155', boxShadow: trafficPhase === 'yellow' ? '0 0 28px #FACC15' : 'none' }} />
                <div className="led-bulb" style={{ background: trafficPhase === 'green' ? '#22C55E' : '#334155', boxShadow: trafficPhase === 'green' ? '0 0 28px #22C55E' : 'none' }} />
              </div>
              <strong>
                {trafficPhase === 'red' ? '🔴 RED — STOP' : trafficPhase === 'green' ? '🟢 GREEN — GO' : '🟡 YELLOW — SLOW DOWN'}
              </strong>
            </>
          )}

          {/* Level 7: Button Controller */}
          {levelDef.level === 7 && (
            <>
              <h2>Try Both Button Modes</h2>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                <button className={`btn btn-sm ${btnMode === 'hold' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setBtnMode('hold'); setBtnLit(false); }}>
                  Press &amp; Hold Mode
                </button>
                <button className={`btn btn-sm ${btnMode === 'toggle' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setBtnMode('toggle'); setBtnLit(false); }}>
                  Toggle Switch Mode
                </button>
              </div>
              <div
                className="led-bulb"
                style={{
                  width: 74,
                  height: 74,
                  margin: '0 auto',
                  background: btnLit ? '#16A34A' : '#E2E8F0',
                  boxShadow: btnLit ? '0 0 34px rgba(22,163,74,0.6)' : 'none',
                }}
              />
              <div>
                <button
                  className="btn btn-primary"
                  onMouseDown={() => btnMode === 'hold' && setBtnLit(true)}
                  onMouseUp={() => btnMode === 'hold' && setBtnLit(false)}
                  onMouseLeave={() => btnMode === 'hold' && setBtnLit(false)}
                  onClick={() => btnMode === 'toggle' && setBtnLit((v) => !v)}
                >
                  {btnMode === 'hold' ? 'Hold Me Down' : btnLit ? 'Tap to Turn OFF' : 'Tap to Turn ON'}
                </button>
              </div>
            </>
          )}

          {/* Level 8: Playable Reaction Speed Game */}
          {levelDef.level === 8 && (
            <>
              <h2>Play the Reaction Speed Game!</h2>
              <div
                className="led-bulb"
                style={{
                  width: 86,
                  height: 86,
                  margin: '0 auto',
                  background: rxState === 'go' ? '#16A34A' : rxState === 'early' ? '#DC2626' : '#E2E8F0',
                  boxShadow: rxState === 'go' ? '0 0 40px rgba(22,163,74,0.75)' : 'none',
                }}
              />
              {rxState === 'result' && rxMs !== null && (
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)' }}>
                  YOUR REACTION TIME: {rxMs} ms
                </div>
              )}
              {rxState === 'early' && (
                <div style={{ color: 'var(--danger)', fontWeight: 700 }}>Too early! Wait for the green light.</div>
              )}
              {rxBest !== null && <div className="muted">Best score: <strong>{rxBest} ms</strong></div>}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
                {(rxState === 'idle' || rxState === 'result' || rxState === 'early') ? (
                  <button className="btn btn-primary" onClick={startReactionGame}>
                    <Play size={15} /> Start Round
                  </button>
                ) : (
                  <button
                    className={`btn ${rxState === 'go' ? 'btn-success' : 'btn-secondary'}`}
                    onClick={hitReactionButton}
                  >
                    {rxState === 'go' ? 'PRESS NOW!' : 'Wait for Green...'}
                  </button>
                )}
              </div>
            </>
          )}

          {/* Level 9: Buzzer Sound Board */}
          {levelDef.level === 9 && (
            <>
              <h2>Preview Buzzer Sounds</h2>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
                <button className="btn btn-secondary" onClick={() => { playWebTone(950, 220); setTimeout(() => playWebTone(650, 220), 250); }}>
                  <Volume2 size={16} /> Alarm Siren
                </button>
                <button className="btn btn-secondary" onClick={() => { playWebTone(659, 260); setTimeout(() => playWebTone(523, 380), 280); }}>
                  <Volume2 size={16} /> Ding-Dong Doorbell
                </button>
                <button className="btn btn-secondary" onClick={() => { playWebTone(440, 120); setTimeout(() => playWebTone(440, 120), 250); setTimeout(() => playWebTone(880, 300), 500); }}>
                  <Volume2 size={16} /> Countdown Beep
                </button>
              </div>
            </>
          )}

          {/* Level 10: Mini Electronic Piano */}
          {levelDef.level === 10 && (
            <>
              <h2>Play Musical Notes</h2>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { n: 'C', f: 262 },
                  { n: 'D', f: 294 },
                  { n: 'E', f: 330 },
                  { n: 'F', f: 349 },
                  { n: 'G', f: 392 },
                  { n: 'A', f: 440 },
                  { n: 'B', f: 494 },
                  { n: 'C5', f: 523 },
                ].map((key) => (
                  <button
                    key={key.n}
                    className="btn btn-secondary"
                    style={{ minWidth: 58, flexDirection: 'column', gap: 2, padding: '12px 10px' }}
                    onClick={() => playWebTone(key.f, 220)}
                  >
                    <Music size={15} color="#2563EB" />
                    <strong>{key.n}</strong>
                    <span style={{ fontSize: 10, color: 'var(--muted)' }}>{key.f}Hz</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Levels 11 & 12: 4-LED Light Show & DJ Modes */}
          {(levelDef.level === 11 || levelDef.level === 12) && (
            <>
              <h2>{levelDef.level === 12 ? 'DJ Light Show Preview (5 Modes)' : '4-LED Pattern Preview'}</h2>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 18, padding: '12px 0' }}>
                {fourLeds.map((on, i) => (
                  <div
                    key={i}
                    className="led-bulb"
                    style={{
                      background: on ? LED_COLORS[i] : '#E2E8F0',
                      boxShadow: on ? `0 0 28px ${LED_COLORS[i]}` : 'none',
                    }}
                  />
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { id: 'disco' as const, label: 'Disco' },
                  { id: 'knight' as const, label: 'LED Chase / Knight Rider' },
                  { id: 'alternating' as const, label: 'Alternating' },
                  { id: 'police' as const, label: 'Police' },
                  { id: 'party' as const, label: 'Party Strobe' },
                ].map((m) => (
                  <button
                    key={m.id}
                    className={`btn btn-sm ${patternMode === m.id ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setPatternMode(m.id)}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {levelDef.level === 12 && (
                <div className="card-sm" style={{ marginTop: 6 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 8 }}>
                    Design Your Own LED Beat (Tap LEDs to toggle):
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
                    {customSteps.map((on, i) => (
                      <button
                        key={i}
                        className={`btn btn-sm ${on ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() =>
                          setCustomSteps((prev) => prev.map((v, idx) => (idx === i ? !v : v)))
                        }
                      >
                        LED {i + 1}: {on ? 'ON' : 'OFF'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <button className="btn btn-secondary" onClick={() => setStep('learn')}>Back</button>
            <button className="btn btn-primary" onClick={() => setStep('upload')}>
              Next: Upload Firmware to ESP32 <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: UPLOAD PRECOMPILED FIRMWARE */}
      {step === 'upload' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <BeginnerFirmwareUploader
            level={levelDef.level}
            firmwareIds={levelDef.firmwareIds || []}
            title={`Upload Level ${levelDef.level} Firmware`}
            onUploadSuccess={() => setUploaded(true)}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <button className="btn btn-secondary" onClick={() => setStep('lab')}>Back</button>
            <button className="btn btn-primary" onClick={() => setStep('quiz')}>
              {uploaded ? 'Uploaded! Go to 5-Question Quiz' : 'Go to 5-Question Quiz'} <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: 5-QUESTION QUIZ */}
      {step === 'quiz' && levelDef.quiz && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <QuizEngine
            title={`Level ${levelDef.level} Quiz — ${levelDef.title}`}
            questions={levelDef.quiz}
            bestScore={progress.quizScores[levelDef.level]}
            onPass={(pct) => {
              recordQuizPass(levelDef.level, pct);
              completeBeginnerLevel(levelDef.level);
            }}
          />
          {quizPassed && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-success" onClick={() => setStep('done')}>
                <CheckCircle2 size={16} /> Claim {levelDef.badge.name} Badge
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 5: BADGE & NEXT LEVEL */}
      {step === 'done' && (
        <div className="celebration">
          <div style={{ fontSize: 54 }}>{levelDef.badge.icon}</div>
          <h2 style={{ fontSize: 28, marginBottom: 6 }}>Level {levelDef.level} Complete!</h2>
          <p className="muted" style={{ margin: '0 auto 18px', maxWidth: 480 }}>
            You earned the <strong>{levelDef.badge.name}</strong> badge!
          </p>
          {levelDef.level < 12 ? (
            <button className="btn btn-primary" onClick={() => openLevel(levelDef.level + 1)}>
              Start Level {levelDef.level + 1} <ArrowRight size={16} />
            </button>
          ) : (
            <button className="btn btn-success" onClick={() => setTab('achievements')}>
              🎉 View All 12 Earned Badges!
            </button>
          )}
        </div>
      )}
    </div>
  );
};
