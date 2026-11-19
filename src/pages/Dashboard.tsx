import React from 'react';
import { ArrowRight, Award, CheckCircle2, Cpu, Flame, Plug, Zap } from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { BADGES, SESSIONS } from '../data/curriculum';

export const Dashboard: React.FC = () => {
  const { progress, device, openSession, setTab } = useStudio();

  const nextSession =
    SESSIONS.find((s) => !progress.completedSessions.includes(s.id)) || SESSIONS[SESSIONS.length - 1];
  const pct = Math.round((progress.completedSessions.length / SESSIONS.length) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <span className="tag" style={{ marginBottom: 8 }}>
            HANDS-ON ESP32 ROBOTICS CURRICULUM
          </span>
          <h1>Welcome to EdTechra Robotics Studio</h1>
          <p className="muted" style={{ margin: 0 }}>
            Connect hardware → Upload code → Understand → Modify → Build circuits → Complete projects → Build robots.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => openSession(nextSession.id)}>
          {progress.completedSessions.length === 0 ? 'Start Session 1: Connect ESP32' : `Continue Session ${nextSession.id}`}
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Hero Row */}
      <div className="grid-2">
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, #10203e, #152c54)',
            borderColor: 'var(--border-hi)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 14,
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span className="tag">NEXT UP — LEVEL {nextSession.level}</span>
              <span className="muted" style={{ fontSize: 12.5, fontWeight: 700 }}>
                Session {nextSession.id} / 30
              </span>
            </div>
            <h2 style={{ fontSize: 23, marginBottom: 6 }}>{nextSession.title}</h2>
            <p className="muted" style={{ margin: '0 0 14px' }}>{nextSession.subtitle}</p>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginTop: 6 }}>
              <span className="muted">{progress.completedSessions.length} of 30 sessions completed</span>
              <strong>{pct}%</strong>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => openSession(nextSession.id)}>
              Launch Session {nextSession.id} <ArrowRight size={16} />
            </button>
            <button className="btn btn-secondary" onClick={() => setTab('path')}>
              View All 14 Levels
            </button>
          </div>
        </div>

        {/* Quick Actions & Hardware Status */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 14 }}>
          <div>
            <h2>Hardware &amp; Studio Labs</h2>
            <div
              className="card-sm"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 14,
                borderColor: device ? '#10b981' : '#233861',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className={`hw-dot ${device ? 'connected' : ''}`} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>
                    {device ? `${device.chip} Connected` : 'ESP32 Not Connected'}
                  </div>
                  <div className="muted" style={{ fontSize: 12 }}>
                    {device ? device.portLabel : 'Connect via real Web Serial USB'}
                  </div>
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setTab('hardware')}>
                <Plug size={14} /> {device ? 'Manage' : 'Connect'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setTab('circuit')}>
              <Zap size={15} color="#22d3ee" /> Circuit Lab
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setTab('code')}>
              <Cpu size={15} color="#22d3ee" /> Code Lab (3 Modes)
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setTab('teacher')}>
              Teacher Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4">
        <div className="card">
          <div className="muted" style={{ fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Flame size={15} color="#f59e0b" /> Total XP Earned
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#22d3ee', marginTop: 4 }}>{progress.xp} XP</div>
          <div className="muted" style={{ fontSize: 12 }}>Awarded only for real completions</div>
        </div>
        <div className="card">
          <div className="muted" style={{ fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={15} color="#10b981" /> Sessions Completed
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#6ee7b7', marginTop: 4 }}>
            {progress.completedSessions.length} / 30
          </div>
          <div className="muted" style={{ fontSize: 12 }}>Across 14 progressive levels</div>
        </div>
        <div className="card">
          <div className="muted" style={{ fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Award size={15} color="#a855f7" /> Badges Unlocked
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#c4b5fd', marginTop: 4 }}>
            {progress.unlockedBadges.length} / {BADGES.length}
          </div>
          <div className="muted" style={{ fontSize: 12 }}>Practical hardware milestones</div>
        </div>
        <div className="card">
          <div className="muted" style={{ fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Cpu size={15} color="#3b82f6" /> Code Submissions
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#93c5fd', marginTop: 4 }}>
            {progress.submissions.length}
          </div>
          <div className="muted" style={{ fontSize: 12 }}>Evaluated with rule checks</div>
        </div>
      </div>

      {/* Achievements / Badges */}
      <div className="card">
        <h2 style={{ marginBottom: 14 }}>Student Achievements &amp; Badges</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(215px, 1fr))', gap: 10 }}>
          {BADGES.map((b) => {
            const earned = progress.unlockedBadges.includes(b.id);
            return (
              <div
                key={b.id}
                className="card-sm"
                style={{
                  opacity: earned ? 1 : 0.5,
                  borderColor: earned ? '#10b981' : '#233861',
                  background: earned ? 'rgba(16,185,129,0.09)' : '#0d1930',
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ fontSize: 24 }}>{b.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{b.title}</div>
                  <div className="muted" style={{ fontSize: 11.5 }}>{b.description}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: earned ? '#6ee7b7' : '#64748b', marginTop: 4 }}>
                    {earned ? `✓ Unlocked (+${b.xpBonus} XP)` : `Locked (+${b.xpBonus} XP)`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2>Recent Activity</h2>
        {progress.activityLog.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>
            No completed tasks yet. Start Session 1 to connect your ESP32 and earn your first badge!
          </p>
        ) : (
          <ul className="checklist">
            {progress.activityLog.slice(0, 6).map((item, idx) => (
              <li key={idx} className="check-item" style={{ justifyContent: 'space-between' }}>
                <span>
                  <span className="muted" style={{ marginRight: 10, fontSize: 12 }}>{item.time}</span>
                  {item.message}
                </span>
                {item.xp && <span className="tag tag-ok">+{item.xp} XP</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
