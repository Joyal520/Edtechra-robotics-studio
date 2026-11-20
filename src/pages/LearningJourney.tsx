import React from 'react';
import { ArrowRight, CheckCircle2, Lock, PlayCircle } from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { BEGINNER_LEVELS } from '../data/beginnerJourney';

const LEVEL_SUMMARIES: Record<number, string> = {
  1: 'Learn what ESP32 is and explore its 10 parts.',
  2: 'Connect your ESP32 board to your computer via USB.',
  3: 'Upload your first Blink program to flash the LED.',
  4: 'Wire an external LED and resistor on a breadboard.',
  5: 'Program a Morse code S-O-S light signal.',
  6: 'Build a Red, Yellow, and Green traffic light.',
  7: 'Control an LED with a physical push button.',
  8: 'Measure your reflexes in a reaction speed game.',
  9: 'Make alarms and doorbells with a buzzer.',
  10: 'Play musical notes and game sound effects.',
  11: 'Create Knight Rider and wave LED animations.',
  12: 'Build a 5-mode mini DJ Light Show.',
};

export const LearningJourney: React.FC = () => {
  const { progress, isLevelUnlocked, openLevel } = useStudio();
  const doneCount = progress.completedLevels.length;
  const pct = Math.round((doneCount / BEGINNER_LEVELS.length) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>Learning Journey</h1>
          <p className="muted" style={{ margin: 0 }}>
            Complete each level to unlock the next mission.
          </p>
        </div>

        <div className="card-sm" style={{ minWidth: 220, background: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
            <span>Overall Progress</span>
            <span style={{ color: 'var(--primary)' }}>{doneCount} / 12 ({pct}%)</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      <div className="grid-3" style={{ gap: 16 }}>
        {BEGINNER_LEVELS.map((lvl) => {
          const unlocked = isLevelUnlocked(lvl.level);
          const completed = progress.completedLevels.includes(lvl.level);

          return (
            <div
              key={lvl.level}
              className={`card ${unlocked ? 'card-interactive' : ''}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 16,
                padding: 20,
                opacity: unlocked ? 1 : 0.68,
                borderColor: completed ? 'var(--success-border)' : 'var(--border)',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 30 }}>{lvl.icon}</span>
                  {completed ? (
                    <span className="tag tag-ok">
                      <CheckCircle2 size={13} /> Done
                    </span>
                  ) : !unlocked ? (
                    <span className="tag tag-neutral">
                      <Lock size={12} /> Locked
                    </span>
                  ) : lvl.stageStatus === 'coming-next' ? (
                    <span className="tag tag-warn">Coming Soon</span>
                  ) : (
                    <span className="tag">Level {lvl.level}</span>
                  )}
                </div>

                <div className="muted" style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>
                  LEVEL {lvl.level}
                </div>
                <h3 style={{ fontSize: 17, marginBottom: 6 }}>{lvl.title}</h3>
                <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>
                  {LEVEL_SUMMARIES[lvl.level] || lvl.theme}
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: 12,
                  borderTop: '1px solid var(--border)',
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)' }}>
                  {lvl.badge.icon} {lvl.badge.name}
                </span>

                <button
                  className={`btn btn-sm ${completed ? 'btn-secondary' : 'btn-primary'}`}
                  disabled={!unlocked}
                  onClick={() => openLevel(lvl.level)}
                >
                  {!unlocked ? (
                    'Locked'
                  ) : completed ? (
                    'Review'
                  ) : (
                    <>
                      <PlayCircle size={14} /> Start <ArrowRight size={14} />
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
