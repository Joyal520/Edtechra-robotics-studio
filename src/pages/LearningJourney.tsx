import React from 'react';
import { ArrowRight, CheckCircle2, Lock, PlayCircle } from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { BEGINNER_LEVELS } from '../data/beginnerJourney';

export const LearningJourney: React.FC = () => {
  const { progress, isLevelUnlocked, openLevel } = useStudio();
  const doneCount = progress.completedLevels.length;
  const pct = Math.round((doneCount / BEGINNER_LEVELS.length) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <span className="tag" style={{ marginBottom: 8 }}>12 SEQUENTIAL LEVELS • BEGINNER MODE</span>
          <h1>Learning Journey</h1>
          <p className="muted" style={{ margin: 0 }}>
            Start from zero electronics experience and progress step by step from meeting your ESP32 to building your own DJ Light Show.
          </p>
        </div>
        <div className="card-sm" style={{ minWidth: 210 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
            <span>Journey Progress</span>
            <span style={{ color: 'var(--primary)' }}>{doneCount} / 12 ({pct}%)</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      <div className="grid-2">
        {BEGINNER_LEVELS.map((lvl) => {
          const unlocked = isLevelUnlocked(lvl.level);
          const completed = progress.completedLevels.includes(lvl.level);
          const quizBest = progress.quizScores[lvl.level];

          return (
            <div
              key={lvl.level}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 14,
                opacity: unlocked ? 1 : 0.72,
                borderColor: completed ? 'var(--success-border)' : unlocked ? 'var(--border)' : 'var(--border)',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 26 }}>{lvl.icon}</span>
                    <span className={completed ? 'tag tag-ok' : unlocked ? 'tag' : 'tag tag-neutral'}>
                      LEVEL {lvl.level}
                    </span>
                  </div>
                  {completed ? (
                    <span className="tag tag-ok">
                      <CheckCircle2 size={13} /> Completed
                    </span>
                  ) : !unlocked ? (
                    <span className="tag tag-neutral">
                      <Lock size={13} /> Complete Level {lvl.level - 1}
                    </span>
                  ) : lvl.stageStatus === 'coming-next' ? (
                    <span className="tag tag-warn">Next Stage</span>
                  ) : (
                    <span className="tag">Unlocked</span>
                  )}
                </div>

                <h2 style={{ marginBottom: 4 }}>{lvl.title}</h2>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', marginBottom: 6 }}>
                  {lvl.theme}
                </div>
                <p className="muted" style={{ margin: '0 0 12px', fontSize: 13.5 }}>
                  {lvl.description}
                </p>

                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--muted)' }}>
                  {lvl.objectives.slice(0, 3).map((obj) => (
                    <li key={obj}>{obj}</li>
                  ))}
                </ul>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: 12,
                  borderTop: '1px solid var(--border)',
                  gap: 10,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--muted)' }}>
                  Badge: {lvl.badge.icon} {lvl.badge.name}
                  {quizBest !== undefined && ` • Quiz: ${quizBest}%`}
                </div>
                <button
                  className={`btn btn-sm ${completed ? 'btn-secondary' : 'btn-primary'}`}
                  disabled={!unlocked}
                  onClick={() => openLevel(lvl.level)}
                >
                  {!unlocked ? (
                    <>
                      <Lock size={14} /> Locked
                    </>
                  ) : completed ? (
                    <>Review Level</>
                  ) : (
                    <>
                      <PlayCircle size={14} /> Start Level {lvl.level} <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
