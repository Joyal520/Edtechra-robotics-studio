import React from 'react';
import { ArrowRight, CheckCircle2, Cpu, PlayCircle } from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { LEVELS_SUMMARY } from '../data/curriculum';

export const LearningPath: React.FC = () => {
  const { progress, openSession } = useStudio();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="page-header" style={{ marginBottom: 4 }}>
        <div>
          <span className="tag" style={{ marginBottom: 8 }}>14 LEVELS • 30 HANDS-ON SESSIONS</span>
          <h1>Complete Robotics Learning Journey</h1>
          <p className="muted" style={{ margin: 0 }}>
            Levels 1–4 focus on real ESP32 hardware first (zero breadboard complexity), then progress into breadboard circuits, guided coding, traffic lights, sensors, automation, and autonomous robotics.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {LEVELS_SUMMARY.map((lvl) => {
          const doneCount = lvl.sessions.filter((s) =>
            progress.completedSessions.includes(s.id)
          ).length;
          const pct = Math.round((doneCount / lvl.sessions.length) * 100);
          const isComplete = doneCount === lvl.sessions.length;

          return (
            <div
              key={lvl.level}
              className="card"
              style={{
                borderColor: isComplete ? 'rgba(16,185,129,0.55)' : '#233861',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span className={isComplete ? 'tag tag-ok' : 'tag'}>LEVEL {lvl.level}</span>
                  <h2 style={{ margin: 0, fontSize: 18 }}>{lvl.title}</h2>
                  {lvl.level <= 4 && (
                    <span className="tag tag-warn">
                      <Cpu size={12} /> Hardware-First
                    </span>
                  )}
                </div>
                <span className="muted" style={{ fontSize: 13, fontWeight: 700 }}>
                  {doneCount} / {lvl.sessions.length} sessions ({pct}%)
                </span>
              </div>

              <div className="progress-track" style={{ marginBottom: 14 }}>
                <div className="progress-fill" style={{ width: `${pct}%` }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 10 }}>
                {lvl.sessions.map((s) => {
                  const done = progress.completedSessions.includes(s.id);
                  return (
                    <div
                      key={s.id}
                      className="card-sm"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: 10,
                        borderColor: done ? 'rgba(16,185,129,0.45)' : '#233861',
                        background: done ? 'rgba(16,185,129,0.07)' : '#12203b',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span className="muted" style={{ fontSize: 12, fontWeight: 700 }}>
                            Session {s.id}
                          </span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: done ? '#6ee7b7' : '#22d3ee' }}>
                            {done ? '✓ Completed' : `+${s.xpReward} XP`}
                          </span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 4 }}>{s.title}</div>
                        <div className="muted" style={{ fontSize: 12.5 }}>{s.subtitle}</div>
                      </div>
                      <button
                        className={`btn btn-sm ${done ? 'btn-secondary' : 'btn-primary'}`}
                        onClick={() => openSession(s.id)}
                      >
                        {done ? <CheckCircle2 size={14} /> : <PlayCircle size={14} />}
                        {done ? 'Review Session' : 'Start Session'}
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
