import React from 'react';
import { ArrowRight, Award, CheckCircle2, Cpu, Flame, Plug } from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { BEGINNER_LEVELS } from '../data/beginnerJourney';

export const Dashboard: React.FC = () => {
  const { progress, device, openLevel, setTab } = useStudio();

  const nextLevel =
    BEGINNER_LEVELS.find((l) => !progress.completedLevels.includes(l.level)) ||
    BEGINNER_LEVELS[BEGINNER_LEVELS.length - 1];
  const pct = Math.round((progress.completedLevels.length / BEGINNER_LEVELS.length) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <span className="tag" style={{ marginBottom: 8 }}>WELCOME TO YOUR ROBOTICS JOURNEY</span>
          <h1>EdTechra Robotics Studio</h1>
          <p className="muted" style={{ margin: 0 }}>
            Learn ESP32 step by step — from connecting your first board to uploading real projects and building your own DJ Light Show.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => openLevel(nextLevel.level)}>
          {progress.completedLevels.length === 0
            ? 'Start Level 1: Meet the ESP32'
            : `Continue Level ${nextLevel.level}: ${nextLevel.title}`}
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Hero Row */}
      <div className="grid-2">
        <div
          className="card"
          style={{
            background: 'var(--primary-light)',
            borderColor: 'var(--primary-border)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 14,
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span className="tag">CURRENT MISSION • LEVEL {nextLevel.level}</span>
              <span className="muted" style={{ fontSize: 12.5, fontWeight: 700 }}>
                {progress.completedLevels.length} / 12 Levels
              </span>
            </div>
            <h2 style={{ fontSize: 22, marginBottom: 4 }}>
              {nextLevel.icon} {nextLevel.title}
            </h2>
            <p className="muted" style={{ margin: '0 0 14px' }}>{nextLevel.description}</p>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => openLevel(nextLevel.level)}>
              Open Level {nextLevel.level} <ArrowRight size={16} />
            </button>
            <button className="btn btn-secondary" onClick={() => setTab('journey')}>
              View All 12 Levels
            </button>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 14 }}>
          <div>
            <h2>ESP32 Hardware Status</h2>
            <div className={`status-banner ${device ? 'connected' : 'disconnected'}`} style={{ marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 14 }}>
                  {device ? 'ESP32 CONNECTED SUCCESSFULLY' : 'ESP32 NOT CONNECTED'}
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 500 }}>
                  {device ? `${device.chip} • ${device.portLabel}` : 'Connect via USB in Chrome or Edge'}
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setTab('hardware')}>
                <Plug size={14} /> {device ? 'Manage' : 'Connect'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setTab('projects')}>
              Beginner Projects
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setTab('code')}>
              <Cpu size={14} /> Code Lab
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setTab('ide')}>
              Arduino IDE
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4">
        <div className="card">
          <div className="muted" style={{ fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Flame size={15} color="#F59E0B" /> Total XP
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)', marginTop: 4 }}>
            {progress.xp} XP
          </div>
        </div>
        <div className="card">
          <div className="muted" style={{ fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={15} color="#16A34A" /> Levels Completed
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--success)', marginTop: 4 }}>
            {progress.completedLevels.length} / 12
          </div>
        </div>
        <div className="card">
          <div className="muted" style={{ fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Award size={15} color="#2563EB" /> Badges Earned
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>
            {progress.beginnerBadges.length} / 12
          </div>
        </div>
        <div className="card">
          <div className="muted" style={{ fontSize: 12.5 }}>Quizzes Passed</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>
            {Object.values(progress.quizScores).filter((s) => s >= 80).length} / 12
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2>Recent Activity</h2>
        {progress.activityLog.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>
            Start Level 1 to explore your ESP32 board, earn XP, and unlock your first badge!
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
