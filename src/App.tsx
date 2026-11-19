import React from 'react';
import {
  BookOpen,
  Code2,
  Cpu,
  FileCode2,
  GraduationCap,
  LayoutDashboard,
  Map,
  X,
  Zap,
} from 'lucide-react';
import { InteractiveSession } from './components/InteractiveSession';
import { StudioProvider, useStudio } from './context/StudioContext';
import { CircuitLabPage } from './pages/CircuitLabPage';
import { CodeLab } from './pages/CodeLab';
import { Dashboard } from './pages/Dashboard';
import { HardwareLab } from './pages/HardwareLab';
import { LearningPath } from './pages/LearningPath';
import { SketchIDE } from './pages/SketchIDE';
import { TeacherDashboard } from './pages/TeacherDashboard';
import type { NavTab } from './types';

const NAV_ITEMS: { id: NavTab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { id: 'path', label: 'Learning Path', icon: <Map size={18} /> },
  { id: 'session', label: 'Current Session', icon: <BookOpen size={18} /> },
  { id: 'ide', label: 'Arduino IDE', icon: <FileCode2 size={18} /> },
  { id: 'hardware', label: 'Hardware Lab', icon: <Cpu size={18} /> },
  { id: 'circuit', label: 'Circuit Lab', icon: <Zap size={18} /> },
  { id: 'code', label: 'Code Lab', icon: <Code2 size={18} /> },
  { id: 'teacher', label: 'Teacher Dashboard', icon: <GraduationCap size={18} /> },
];

const StudioShell: React.FC = () => {
  const { tab, setTab, progress, device, toastBadge, dismissToast } = useStudio();
  const pct = Math.round((progress.completedSessions.length / 30) * 100);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-box">
          <div className="brand-logo">E</div>
          <div>
            <div className="brand-title">EdTechra</div>
            <div className="brand-sub">ROBOTICS STUDIO</div>
          </div>
        </div>

        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`nav-btn ${tab === item.id ? 'active' : ''}`}
            onClick={() => {
              setTab(item.id);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}

        <div className="sidebar-footer">
          <button
            className="hw-pill"
            onClick={() => setTab('hardware')}
            style={{ width: '100%', textAlign: 'left' }}
          >
            <span className={`hw-dot ${device ? 'connected' : ''}`} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {device ? `${device.chip} Connected` : 'ESP32: Not Connected'}
            </span>
          </button>

          <div className="xp-mini">
            <div className="xp-mini-row">
              <span style={{ color: '#22d3ee' }}>{progress.xp} XP</span>
              <span className="muted">{pct}% Course</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      </aside>

      <main className="main-area">
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'path' && <LearningPath />}
        {tab === 'session' && <InteractiveSession />}
        {tab === 'ide' && <SketchIDE />}
        {tab === 'hardware' && <HardwareLab />}
        {tab === 'circuit' && <CircuitLabPage />}
        {tab === 'code' && <CodeLab />}
        {tab === 'teacher' && <TeacherDashboard />}
      </main>

      {toastBadge && (
        <div className="badge-toast" role="status">
          <div style={{ fontSize: 34 }}>{toastBadge.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#22d3ee', letterSpacing: '0.06em' }}>
              ACHIEVEMENT UNLOCKED (+{toastBadge.xpBonus} XP)
            </div>
            <div style={{ fontWeight: 800, fontSize: 15 }}>{toastBadge.title}</div>
            <div className="muted" style={{ fontSize: 12 }}>{toastBadge.description}</div>
          </div>
          <button
            onClick={dismissToast}
            aria-label="Dismiss"
            style={{ background: 'none', border: 0, color: '#93a7cc', padding: 4 }}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export const App: React.FC = () => (
  <StudioProvider>
    <StudioShell />
  </StudioProvider>
);

export default App;
