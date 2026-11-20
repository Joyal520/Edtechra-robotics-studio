import React from 'react';
import { Award, CheckCircle2, Flame, RotateCcw, Settings as SettingsIcon, User } from 'lucide-react';
import { BeginnerFirmwareUploader } from '../components/BeginnerFirmwareUploader';
import { useStudio } from '../context/StudioContext';
import { BEGINNER_LEVELS } from '../data/beginnerJourney';

export const BeginnerProjectsPage: React.FC = () => {
  const { openLevel, isLevelUnlocked } = useStudio();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <span className="tag" style={{ marginBottom: 8 }}>PRECOMPILED FIRMWARE PROJECTS</span>
          <h1>Beginner Projects</h1>
          <p className="muted" style={{ margin: 0 }}>
            Upload ready-to-run ESP32 projects straight from GitHub Pages over USB — no compiler setup required!
          </p>
        </div>
      </div>

      <BeginnerFirmwareUploader
        level={3}
        firmwareIds={['level-3-blink', 'level-3-blink-slow', 'level-3-blink-fast']}
        title="Quick Flash: Level 3 Built-in LED Blink Variants"
      />

      <div className="grid-3">
        {BEGINNER_LEVELS.filter((l) => l.level >= 3).map((lvl) => (
          <div key={lvl.level} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 10 }}>
            <div>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{lvl.icon}</div>
              <span className={lvl.stageStatus === 'ready' ? 'tag tag-ok' : 'tag tag-neutral'}>
                Level {lvl.level} {lvl.stageStatus === 'ready' ? '• Ready' : '• Next Stage'}
              </span>
              <h3 style={{ marginTop: 8 }}>{lvl.title}</h3>
              <p className="muted" style={{ margin: 0, fontSize: 13 }}>{lvl.description}</p>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              disabled={!isLevelUnlocked(lvl.level) && lvl.level > 3}
              onClick={() => openLevel(lvl.level)}
            >
              Open Project
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AchievementsPage: React.FC = () => {
  const { progress } = useStudio();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <span className="tag" style={{ marginBottom: 8 }}>12 LEVEL BADGES</span>
          <h1>My Achievements</h1>
          <p className="muted" style={{ margin: 0 }}>
            Earn badges by completing real ESP32 hardware missions and passing each level&apos;s 10-question quiz.
          </p>
        </div>
        <span className="tag tag-ok" style={{ fontSize: 14, padding: '6px 14px' }}>
          <Award size={16} /> {progress.beginnerBadges.length} / {BEGINNER_LEVELS.length} Unlocked
        </span>
      </div>

      <div className="grid-3">
        {BEGINNER_LEVELS.map((lvl) => {
          const earned = progress.beginnerBadges.includes(lvl.badge.id);
          return (
            <div
              key={lvl.badge.id}
              className="card"
              style={{
                opacity: earned ? 1 : 0.62,
                borderColor: earned ? 'var(--success)' : 'var(--border)',
                background: earned ? 'var(--success-bg)' : '#FFFFFF',
              }}
            >
              <div style={{ fontSize: 34, marginBottom: 8 }}>{lvl.badge.icon}</div>
              <span className={earned ? 'tag tag-ok' : 'tag tag-neutral'}>
                Level {lvl.level} {earned ? '• Earned' : '• Locked'}
              </span>
              <h3 style={{ marginTop: 8 }}>{lvl.badge.name}</h3>
              <p className="muted" style={{ margin: 0, fontSize: 13 }}>{lvl.badge.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const MyProgressPage: React.FC = () => {
  const { progress } = useStudio();
  const pct = Math.round((progress.completedLevels.length / BEGINNER_LEVELS.length) * 100);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <span className="tag" style={{ marginBottom: 8 }}>STUDENT PROGRESS</span>
          <h1>My Progress</h1>
          <p className="muted" style={{ margin: 0 }}>
            All progress is saved automatically in your browser.
          </p>
        </div>
      </div>

      <div className="grid-4">
        <div className="card">
          <div className="muted" style={{ fontSize: 13 }}><Flame size={14} style={{ verticalAlign: 'middle' }} /> Total XP</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)' }}>{progress.xp} XP</div>
        </div>
        <div className="card">
          <div className="muted" style={{ fontSize: 13 }}><CheckCircle2 size={14} style={{ verticalAlign: 'middle' }} /> Levels Complete</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--success)' }}>{progress.completedLevels.length} / 12</div>
        </div>
        <div className="card">
          <div className="muted" style={{ fontSize: 13 }}>Journey Progress</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{pct}%</div>
        </div>
        <div className="card">
          <div className="muted" style={{ fontSize: 13 }}>Badges Earned</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{progress.beginnerBadges.length} / 12</div>
        </div>
      </div>

      <div className="card">
        <h2>Level-by-Level Report</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Level</th>
              <th>Title</th>
              <th>Quiz Best</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {BEGINNER_LEVELS.map((l) => {
              const done = progress.completedLevels.includes(l.level);
              const q = progress.quizScores[l.level];
              return (
                <tr key={l.level}>
                  <td><strong>Level {l.level}</strong></td>
                  <td>{l.icon} {l.title}</td>
                  <td>{q !== undefined ? `${q}%` : '—'}</td>
                  <td>
                    <span className={done ? 'tag tag-ok' : 'tag tag-neutral'}>
                      {done ? 'Completed' : 'In Progress'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const SettingsPage: React.FC = () => {
  const { progress, setStudentName, resetProgress, setTab } = useStudio();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 680 }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <span className="tag" style={{ marginBottom: 8 }}><SettingsIcon size={13} /> PREFERENCES</span>
          <h1>Settings</h1>
        </div>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <h3><User size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Student Name</h3>
        <input
          value={progress.studentName}
          onChange={(e) => setStudentName(e.target.value)}
          style={{
            padding: '10px 12px',
            borderRadius: 10,
            border: '1.5px solid var(--border-strong)',
            maxWidth: 360,
          }}
        />
        <div className="muted" style={{ fontSize: 13 }}>
          Stored locally in this browser (zero cloud accounts or paid databases required).
        </div>
      </div>

      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={{ marginBottom: 4 }}>Teacher Tools</h3>
          <div className="muted" style={{ fontSize: 13 }}>Inspect student code submissions and export progress JSON.</div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => setTab('teacher')}>
          Open Teacher Dashboard
        </button>
      </div>

      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={{ marginBottom: 4, color: 'var(--danger)' }}>Reset Local Progress</h3>
          <div className="muted" style={{ fontSize: 13 }}>Clears XP, completed levels, quiz scores, and badges on this device.</div>
        </div>
        <button
          className="btn btn-danger btn-sm"
          onClick={() => {
            if (window.confirm('Reset all local student progress?')) resetProgress();
          }}
        >
          <RotateCcw size={15} /> Reset Progress
        </button>
      </div>
    </div>
  );
};
