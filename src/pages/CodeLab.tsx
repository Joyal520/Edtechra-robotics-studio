import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { CheckCircle2, Code2, HelpCircle, Trophy, XCircle } from 'lucide-react';
import { GuidedCodingExercise } from '../components/GuidedCodingExercise';
import { UploadPanel } from '../components/UploadPanel';
import { useStudio } from '../context/StudioContext';
import type { CodeCheckRule, GuidedStage } from '../types';

type CodeMode = 'guided' | 'practice' | 'challenge';

const GUIDED_BUTTON_STAGES: GuidedStage[] = [
  {
    id: 'b1',
    title: 'Define Button & LED Pins',
    instruction: 'Connect the push button to GPIO 18.',
    hint: 'Type 18',
    codeBefore: 'int buttonPin = ',
    placeholder: '__',
    codeAfter: ';\nint ledPin = 23;',
    acceptedAnswers: ['18'],
  },
  {
    id: 'b2',
    title: 'Configure Button as INPUT',
    instruction: 'Tell the ESP32 that buttonPin will read signals IN.',
    hint: 'Type: pinMode(buttonPin, INPUT);',
    codeBefore: 'void setup() {\n  ',
    placeholder: 'pinMode(..., ...);',
    codeAfter: '\n  pinMode(ledPin, OUTPUT);\n}',
    acceptedAnswers: ['pinMode(buttonPin, INPUT);', 'pinMode(buttonPin, INPUT_PULLUP);'],
  },
  {
    id: 'b3',
    title: 'Read the Button State',
    instruction: 'Use digitalRead() to read buttonPin into buttonState.',
    hint: 'Type: digitalRead(buttonPin)',
    codeBefore: 'int buttonState = ',
    placeholder: 'digitalRead(...)',
    codeAfter: ';',
    acceptedAnswers: ['digitalRead(buttonPin)'],
  },
  {
    id: 'b4',
    title: 'Turn LED ON When Pressed',
    instruction: 'Check if buttonState equals HIGH.',
    hint: 'Type: buttonState == HIGH',
    codeBefore: 'if (',
    placeholder: 'condition',
    codeAfter: ') {\n  digitalWrite(ledPin, HIGH);\n} else {\n  digitalWrite(ledPin, LOW);\n}',
    acceptedAnswers: ['buttonState == HIGH'],
  },
];

const GUIDED_BUTTON_FULL = `int buttonPin = 18;
int ledPin = 23;

void setup() {
  pinMode(buttonPin, INPUT);
  pinMode(ledPin, OUTPUT);
}

void loop() {
  int buttonState = digitalRead(buttonPin);
  if (buttonState == HIGH) {
    digitalWrite(ledPin, HIGH);
  } else {
    digitalWrite(ledPin, LOW);
  }
}`;

interface ChallengeDef {
  id: string;
  title: string;
  prompt: string;
  starter: string;
  hints: string[];
  rules: CodeCheckRule[];
}

const CHALLENGES: ChallengeDef[] = [
  {
    id: 'sos-blink',
    title: 'Challenge A: Asymmetric Beacon (3s ON, 1s OFF)',
    prompt:
      'Write an ESP32 program for an LED on GPIO 23 that turns ON for 3000ms, turns OFF for 1000ms, and repeats continuously.',
    starter: `// Write your solution from scratch\n\n`,
    hints: [
      'Declare int ledPin = 23; and call pinMode(ledPin, OUTPUT); in setup().',
      'Inside loop(), call digitalWrite(ledPin, HIGH); delay(3000); digitalWrite(ledPin, LOW); delay(1000);.',
    ],
    rules: [
      { id: 'v', label: 'Declares GPIO 23 variable', hint: 'Add int ledPin = 23;', test: (c) => /int\s+\w+\s*=\s*23\s*;/.test(c) },
      { id: 's', label: 'Has setup() with pinMode OUTPUT', hint: 'Use pinMode(ledPin, OUTPUT); in setup().', test: (c) => /void\s+setup/.test(c) && /pinMode\s*\([^)]+,\s*OUTPUT\s*\)/.test(c) },
      { id: 'l', label: 'Has loop() with HIGH & LOW', hint: 'Use digitalWrite(..., HIGH) and LOW in loop().', test: (c) => /void\s+loop/.test(c) && /HIGH/.test(c) && /LOW/.test(c) },
      { id: 'd', label: 'Uses delay(3000) and delay(1000)', hint: 'Add delay(3000); and delay(1000);.', test: (c) => /delay\s*\(\s*3000\s*\)/.test(c) && /delay\s*\(\s*1000\s*\)/.test(c) },
    ],
  },
  {
    id: 'night-light',
    title: 'Challenge B: Automatic Night Light (LDR + LED)',
    prompt:
      'Read an LDR sensor on GPIO 34 using analogRead(). If the reading is below 1500, turn the LED on GPIO 23 HIGH; otherwise turn it LOW.',
    starter: `int ldrPin = 34;\nint ledPin = 23;\n\nvoid setup() {\n  \n}\n\nvoid loop() {\n  \n}\n`,
    hints: [
      'Set ledPin as OUTPUT in setup().',
      'Read int light = analogRead(ldrPin); and use if (light < 1500) { digitalWrite(ledPin, HIGH); } else { digitalWrite(ledPin, LOW); }.',
    ],
    rules: [
      { id: 'pm', label: 'Configures LED pin as OUTPUT', hint: 'Call pinMode(ledPin, OUTPUT); in setup().', test: (c) => /pinMode\s*\([^)]+,\s*OUTPUT\s*\)/.test(c) },
      { id: 'ar', label: 'Reads LDR with analogRead()', hint: 'Call analogRead(ldrPin); in loop().', test: (c) => /analogRead\s*\([^)]+\)/.test(c) },
      { id: 'ie', label: 'Uses if / else threshold check', hint: 'Add if (... < 1500) { ... } else { ... }.', test: (c) => /if\s*\([^)]*<\s*1500[^)]*\)/.test(c) && /else/.test(c) },
      { id: 'dw', label: 'Turns LED HIGH and LOW', hint: 'Use digitalWrite(ledPin, HIGH) and LOW.', test: (c) => /digitalWrite\s*\([^)]+,\s*HIGH\s*\)/.test(c) && /digitalWrite\s*\([^)]+,\s*LOW\s*\)/.test(c) },
    ],
  },
];

export const CodeLab: React.FC = () => {
  const { awardTaskXP, recordSubmission } = useStudio();
  const [mode, setMode] = useState<CodeMode>('guided');
  const [chIdx, setChIdx] = useState(0);
  const [code, setCode] = useState(CHALLENGES[0].starter);
  const [hintIdx, setHintIdx] = useState(0);
  const [evaluated, setEvaluated] = useState(false);

  const ch = CHALLENGES[chIdx];
  const results = ch.rules.map((r) => ({ ...r, passed: r.test(code) }));
  const allPassed = results.every((r) => r.passed);

  const runCheck = () => {
    setEvaluated(true);
    const passedCount = results.filter((r) => r.passed).length;
    recordSubmission({
      sessionId: 0,
      sessionTitle: `Code Lab (${mode}): ${ch.title}`,
      code,
      passedRules: passedCount,
      totalRules: results.length,
    });
    if (allPassed) {
      awardTaskXP(50, `Passed Code Lab ${mode === 'challenge' ? 'Challenge' : 'Practice'}: ${ch.title}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="page-header" style={{ marginBottom: 4 }}>
        <div>
          <span className="tag" style={{ marginBottom: 8 }}>MONACO EDITOR • 3 LEARNING MODES</span>
          <h1>Code Lab</h1>
          <p className="muted" style={{ margin: 0 }}>
            Progress from Guided step-by-step completion → Practice with hints → Independent Challenges evaluated by rule-based tests.
          </p>
        </div>
      </div>

      {/* Mode Switcher */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {[
          { id: 'guided' as const, label: 'Mode 1 — Guided Mode', desc: 'Step-by-step reveal' },
          { id: 'practice' as const, label: 'Mode 2 — Practice Mode', desc: 'Monaco Editor + Hints' },
          { id: 'challenge' as const, label: 'Mode 3 — Challenge Mode', desc: 'Rule-based test evaluation' },
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => {
              setMode(m.id);
              setEvaluated(false);
              setHintIdx(0);
            }}
            className={`btn ${mode === m.id ? 'btn-primary' : 'btn-secondary'}`}
          >
            {m.id === 'challenge' ? <Trophy size={16} /> : <Code2 size={16} />}
            {m.label}
          </button>
        ))}
      </div>

      {/* MODE 1: GUIDED MODE */}
      {mode === 'guided' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <GuidedCodingExercise
              title="Guided Module: Button-Controlled LED (GPIO 18 → GPIO 23)"
              stages={GUIDED_BUTTON_STAGES}
              fullProgram={GUIDED_BUTTON_FULL}
              onAllComplete={() => awardTaskXP(40, 'Completed Code Lab Guided Button Module')}
            />
          </div>
          <UploadPanel code={GUIDED_BUTTON_FULL} buttonLabel="Upload Guided Program to ESP32" />
        </div>
      )}

      {/* MODE 2 & 3: PRACTICE / CHALLENGE MODE */}
      {(mode === 'practice' || mode === 'challenge') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CHALLENGES.map((item, i) => (
              <button
                key={item.id}
                className={`btn btn-sm ${chIdx === i ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => {
                  setChIdx(i);
                  setCode(item.starter);
                  setEvaluated(false);
                  setHintIdx(0);
                }}
              >
                {item.title}
              </button>
            ))}
          </div>

          <div className="grid-2" style={{ alignItems: 'start' }}>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h2 style={{ margin: 0 }}>{ch.title}</h2>
              <p className="muted" style={{ margin: 0 }}>{ch.prompt}</p>
              <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #233861' }}>
                <Editor
                  height="320px"
                  defaultLanguage="cpp"
                  theme="vs-dark"
                  value={code}
                  onChange={(v) => setCode(v || '')}
                  options={{ minimap: { enabled: false }, fontSize: 14, scrollBeyondLastLine: false }}
                />
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={runCheck}>
                  <CheckCircle2 size={16} /> Evaluate Code
                </button>
                {mode === 'practice' && (
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={hintIdx >= ch.hints.length}
                    onClick={() => setHintIdx((h) => Math.min(ch.hints.length, h + 1))}
                  >
                    <HelpCircle size={14} /> Show Hint ({hintIdx}/{ch.hints.length})
                  </button>
                )}
              </div>
              {mode === 'practice' && hintIdx > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {ch.hints.slice(0, hintIdx).map((h, idx) => (
                    <div key={idx} className="card-sm" style={{ borderColor: '#f59e0b', color: '#fde68a', fontSize: 13 }}>
                      💡 {h}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <h3>Predefined Test Rules {mode === 'challenge' && '(Challenge Mode — No Hints)'}</h3>
              <ul className="checklist">
                {results.map((r) => (
                  <li
                    key={r.id}
                    className={`check-item ${evaluated ? (r.passed ? 'ok' : 'err') : ''}`}
                  >
                    {evaluated ? (
                      r.passed ? (
                        <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
                      ) : (
                        <XCircle size={16} color="#f43f5e" style={{ flexShrink: 0, marginTop: 2 }} />
                      )
                    ) : (
                      <span className="muted">○</span>
                    )}
                    <div>
                      <div style={{ fontWeight: 700 }}>{r.label}</div>
                      {evaluated && !r.passed && mode === 'practice' && (
                        <div className="muted" style={{ fontSize: 12 }}>Hint: {r.hint}</div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              {evaluated && allPassed && (
                <div className="check-item ok" style={{ marginTop: 12 }}>
                  <strong>🎉 All test rules passed! (+50 XP)</strong>
                </div>
              )}
            </div>
          </div>

          <UploadPanel code={code} buttonLabel="Upload Solution to ESP32" />
        </div>
      )}
    </div>
  );
};
