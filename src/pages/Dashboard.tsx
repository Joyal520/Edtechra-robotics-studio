import React from 'react';
import { ArrowRight, Award, CheckCircle2, Code2, Cpu, Flame, FolderKanban, Plug } from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { BEGINNER_LEVELS } from '../data/beginnerJourney';

const SHORT_GOALS: Record<number, string> = {
  1: 'Explore the ESP32 board and its 10 key parts.',
  2: 'Plug in your ESP32 via USB and verify the connection.',
  3: 'Upload your first Blink program and watch the LED flash.',
  4: 'Wire an external LED and 330Ω resistor on a breadboard.',
  5: 'Broadcast an S-O-S Morse code signal with your LED.',
  6: 'Build a 3-LED Red, Yellow, and Green traffic light.',
  7: 'Use a push button to turn an LED ON and OFF.',
  8: 'Test your reflexes in a millisecond reaction game.',
  9: 'Connect a buzzer to create alarms and doorbells.',
  10: 'Play musical notes and game sound effects.',
  11: 'Create Knight Rider and wave LED light animations.',
  12: 'Build a 5-mode mini DJ Light Show.',
};

export const Dashboard: React.FC = () => {
  const { progress, device, openLevel, setTab } = useStudio();

  const nextLevel =
    BEGINNER_LEVELS.find((l) => !progress.completedLevels.includes(l.level)) ||
    BEGINNER_LEVELS[BEGINNER_LEVELS.length - 1];
  const pct = Math.round((progress.completedLevels.length / BEGINNER_LEVELS.length) * 100);
  const quizzesPassed = Object.values(progress.quizScores).filter((s) => s >= 80).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Clean Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>Robotics Studio</h1>
          <p className="muted" style={{ margin: 0 }}>
            Hands-on ESP32 lessons — from your first connection to real hardware projects.
          </p>
        </div>
        <span className="tag" style={{ fontSize: 13, padding: '6px 12px' }}>
          {progress.completedLevels.length} / 12 Levels Complete
        </span>
      </div>

      {/* Hero Row */}
      <div className="grid-2" style={{ gap: 18 }}>
        {/* Next Mission Card */}
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 100%)',
            borderColor: 'var(--primary-border)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 18,
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span className="tag">NEXT MISSION • LEVEL {nextLevel.level}</span>
              <span style={{ fontSize: 28 }}>{nextLevel.icon}</span>
            </div>
            <h2 style={{ fontSize: 22, marginBottom: 6 }}>{nextLevel.title}</h2>
            <p className="muted" style={{ margin: '0 0 16px', fontSize: 14.5 }}>
              {SHORT_GOALS[nextLevel.level] || nextLevel.theme}
            </p>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => openLevel(nextLevel.level)}>
              {progress.completedLevels.length === 0 ? 'Start Level 1' : `Continue Level ${nextLevel.level}`}
              <ArrowRight size={16} />
            </button>
            <button className="btn btn-secondary" onClick={() => setTab('journey')}>
              All 12 Levels
            </button>
          </div>
        </div>

        {/* Hardware & Quick Lab Access */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h2 style={{ marginBottom: 12 }}>ESP32 Board</h2>
            <div className={`status-banner ${device ? 'connected' : 'disconnected'}`}>
              <div>
                <div style={{ fontSize: 14 }}>{device ? 'Connected' : 'Not Connected'}</div>
                <div style={{ fontSize: 12.5, fontWeight: 500 }}>
                  {device ? device.chip : 'Plug in USB and click Connect'}
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setTab('hardware')}>
                <Plug size={14} /> {device ? 'Manage' : 'Connect'}
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setTab('projects')}>
              <FolderKanban size={14} /> Projects
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setTab('code')}>
              <Code2 size={14} /> Code Lab
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setTab('ide')}>
              <Cpu size={14} /> IDE
            </button>
          </div>
        </div>
      </div>

      {/* 4 Clean Stat Cards */}
      <div className="grid-4" style={{ gap: 14 }}>
        <div className="card" style={{ padding: 18 }}>
          <div className="muted" style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Flame size={15} color="#F59E0B" /> Total XP
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)', marginTop: 4 }}>
            {progress.xp}
          </div>
        </div>

        <div className="card" style={{ padding: 18 }}>
          <div className="muted" style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={15} color="#16A34A" /> Levels Done
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--success)', marginTop: 4 }}>
            {progress.completedLevels.length} / 12
          </div>
        </div>

        <div className="card" style={{ padding: 18 }}>
          <div className="muted" style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Award size={15} color="#2563EB" /> Badges
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>
            {progress.beginnerBadges.length} / 12
          </div>
        </div>

        <div className="card" style={{ padding: 18 }}>
          <div className="muted" style={{ fontSize: 13 }}>Quizzes Passed</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>
            {quizzesPassed} / 12
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {progress.activityLog.length > 0 && (
        <div className="card">
          <h2 style={{ marginBottom: 12 }}>Recent Activity</h2>
          <ul className="checklist">
            {progress.activityLog.slice(0, 4).map((item, idx) => (
              <li key={idx} className="check-item" style={{ justifyContent: 'space-between' }}>
                <span>{item.message}</span>
                {item.xp && <span className="tag tag-ok">+{item.xp} XP</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
