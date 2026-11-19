import React, { useState } from 'react';
import { CheckCircle2, HelpCircle, Lock, Sparkles } from 'lucide-react';
import type { GuidedStage } from '../types';

interface GuidedCodingExerciseProps {
  title: string;
  stages: GuidedStage[];
  fullProgram: string;
  onAllComplete?: () => void;
}

function normalize(val: string, stripSpaces = true): string {
  const trimmed = val.trim();
  return stripSpaces ? trimmed.replace(/\s+/g, '') : trimmed.replace(/\s+/g, ' ');
}

export const GuidedCodingExercise: React.FC<GuidedCodingExerciseProps> = ({
  title,
  stages,
  fullProgram,
  onAllComplete,
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [solved, setSolved] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showHint, setShowHint] = useState<Record<string, boolean>>({});
  const [unlockedIdx, setUnlockedIdx] = useState<number>(0);

  const allDone = stages.every((s) => solved[s.id]);

  const checkStage = (stage: GuidedStage, idx: number) => {
    const raw = answers[stage.id] || '';
    const norm = normalize(raw, stage.normalizeWhitespace !== false);
    const ok = stage.acceptedAnswers.some(
      (acc) => normalize(acc, stage.normalizeWhitespace !== false) === norm
    );

    if (ok) {
      const nextSolved = { ...solved, [stage.id]: true };
      setSolved(nextSolved);
      setErrors((e) => ({ ...e, [stage.id]: '' }));
      if (idx + 1 > unlockedIdx && idx + 1 < stages.length) {
        setUnlockedIdx(idx + 1);
      }
      if (stages.every((s) => nextSolved[s.id])) {
        onAllComplete?.();
      }
    } else {
      setErrors((e) => ({
        ...e,
        [stage.id]: 'Not quite right yet — check spelling, capitalization, and semicolons, or click Show Hint.',
      }));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        <span className={allDone ? 'tag tag-ok' : 'tag'}>
          {Object.keys(solved).length} / {stages.length} stages completed
        </span>
      </div>

      {stages.map((stage, idx) => {
        const isUnlocked = idx <= unlockedIdx || solved[stage.id];
        const isSolved = Boolean(solved[stage.id]);

        if (!isUnlocked) {
          return (
            <div
              key={stage.id}
              className="card-sm"
              style={{ opacity: 0.55, display: 'flex', alignItems: 'center', gap: 10 }}
            >
              <Lock size={16} color="#93a7cc" />
              <div>
                <strong>
                  Stage {idx + 1}: {stage.title}
                </strong>{' '}
                <span className="muted">— Complete Stage {idx} to unlock</span>
              </div>
            </div>
          );
        }

        return (
          <div
            key={stage.id}
            className="card-sm"
            style={{
              borderColor: isSolved ? 'rgba(16,185,129,0.55)' : '#34528a',
              background: isSolved ? 'rgba(16,185,129,0.06)' : '#132240',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 14.5 }}>
                Stage {idx + 1} — {stage.title}
              </div>
              {isSolved && (
                <span className="tag tag-ok">
                  <CheckCircle2 size={13} /> Correct!
                </span>
              )}
            </div>
            <p className="muted" style={{ margin: '0 0 10px', fontSize: 13.5 }}>
              {stage.instruction}
            </p>

            <div
              className="code-block"
              style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4, padding: '12px 14px' }}
            >
              <span>{stage.codeBefore}</span>
              <input
                type="text"
                className={`inline-input ${isSolved ? 'ok' : errors[stage.id] ? 'err' : ''}`}
                value={answers[stage.id] || ''}
                disabled={isSolved}
                placeholder={stage.placeholder}
                onChange={(e) => setAnswers((a) => ({ ...a, [stage.id]: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isSolved) checkStage(stage, idx);
                }}
                style={{ width: Math.max(100, (stage.placeholder.length + 3) * 9.5) }}
              />
              <span>{stage.codeAfter}</span>
            </div>

            {errors[stage.id] && (
              <div style={{ color: '#fda4af', fontSize: 12.5, marginTop: 8 }}>{errors[stage.id]}</div>
            )}

            {showHint[stage.id] && (
              <div
                style={{
                  marginTop: 8,
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: 'rgba(245,158,11,0.12)',
                  border: '1px solid rgba(245,158,11,0.4)',
                  color: '#fde68a',
                  fontSize: 13,
                }}
              >
                💡 <strong>Hint:</strong> {stage.hint}
              </div>
            )}

            {!isSolved && (
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button className="btn btn-primary btn-sm" onClick={() => checkStage(stage, idx)}>
                  Check Stage {idx + 1}
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowHint((h) => ({ ...h, [stage.id]: !h[stage.id] }))}
                >
                  <HelpCircle size={14} />
                  {showHint[stage.id] ? 'Hide Hint' : 'Show Hint'}
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Complete Program Reveal */}
      {allDone ? (
        <div
          className="card"
          style={{
            borderColor: 'rgba(16,185,129,0.6)',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(34,211,238,0.08))',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Sparkles size={18} color="#10b981" />
            <h3 style={{ margin: 0, color: '#6ee7b7' }}>Complete Program Unlocked!</h3>
          </div>
          <p className="muted" style={{ marginTop: 0, fontSize: 13.5 }}>
            Great work! You built every piece of this program yourself. Review your full code below and upload it to your ESP32!
          </p>
          <pre className="code-block">{fullProgram}</pre>
        </div>
      ) : (
        <div className="card-sm" style={{ textAlign: 'center', color: '#93a7cc', fontSize: 13 }}>
          <Lock size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          Complete all {stages.length} stages above to unlock the full program.
        </div>
      )}
    </div>
  );
};
