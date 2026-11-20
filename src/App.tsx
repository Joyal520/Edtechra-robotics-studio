import React, { useState } from 'react';
import {
  Award,
  BarChart3,
  Code2,
  Cpu,
  FileCode2,
  FolderKanban,
  LayoutDashboard,
  Map,
  Menu,
  Settings,
  X,
  Zap,
} from 'lucide-react';
import { InteractiveSession } from './components/InteractiveSession';
import { StudioProvider, useStudio } from './context/StudioContext';
import { BeginnerLevelPage } from './pages/BeginnerLevelPage';
import { CircuitLabPage } from './pages/CircuitLabPage';
import { CodeLab } from './pages/CodeLab';
import { Dashboard } from './pages/Dashboard';
import { HardwareLab } from './pages/HardwareLab';
import { LearningJourney } from './pages/LearningJourney';
import { LearningPath } from './pages/LearningPath';
import {
  AchievementsPage,
  BeginnerProjectsPage,
  MyProgressPage,
  SettingsPage,
} from './pages/ProfilePages';
import { SketchIDE } from './pages/SketchIDE';
import { TeacherDashboard } from './pages/TeacherDashboard';
import type { NavTab } from './types';

const NAV_GROUPS: {
  group: string;
  items: { id: NavTab; label: string; icon: React.ReactNode }[];
}[] = [
  {
    group: 'HOME',
    items: [{ id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={17} /> }],
  },
  {
    group: 'LEARNING',
    items: [
      { id: 'journey', label: 'Learning Journey', icon: <Map size={17} /> },
      { id: 'projects', label: 'Beginner Projects', icon: <FolderKanban size={17} /> },
      { id: 'achievements', label: 'My Achievements', icon: <Award size={17} /> },
    ],
  },
  {
    group: 'LAB',
    items: [
      { id: 'hardware', label: 'Hardware Lab', icon: <Cpu size={17} /> },
      { id: 'code', label: 'Code Lab', icon: <Code2 size={17} /> },
      { id: 'ide', label: 'Arduino IDE', icon: <FileCode2 size={17} /> },
      { id: 'circuit', label: 'Circuit Lab', icon: <Zap size={17} /> },
    ],
  },
  {
    group: 'PROFILE',
    items: [
      { id: 'progress', label: 'My Progress', icon: <BarChart3 size={17} /> },
      { id: 'settings', label: 'Settings', icon: <Settings size={17} /> },
    ],
  },
];

const StudioShell: React.FC = () => {
  const { tab, setTab, progress, device, toastBadge, dismissToast } = useStudio();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pct = Math.round((progress.completedLevels.length / 12) * 100);

  const navigate = (id: NavTab) => {
    setTab(id);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div className="mobile-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div className="brand-logo" style={{ width: 32, height: 32, fontSize: 15 }}>E</div>
          <strong>EdTechra Robotics</strong>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => setMobileOpen((o) => !o)} aria-label="Menu">
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <div className="app-shell">
        <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
          <div className="brand-box">
            <div className="brand-logo">E</div>
            <div>
              <div className="brand-title">EdTechra</div>
              <div className="brand-sub">ROBOTICS STUDIO</div>
            </div>
          </div>

          {NAV_GROUPS.map((grp) => (
            <React.Fragment key={grp.group}>
              <div className="nav-group-label">{grp.group}</div>
              {grp.items.map((item) => (
                <button
                  key={item.id}
                  className={`nav-btn ${
                    tab === item.id || (item.id === 'journey' && tab === 'level') ? 'active' : ''
                  }`}
                  onClick={() => navigate(item.id)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </React.Fragment>
          ))}

          <div className="sidebar-footer">
            <button
              className={`hw-pill ${device ? 'connected' : 'disconnected'}`}
              onClick={() => navigate('hardware')}
              style={{ width: '100%', textAlign: 'left' }}
            >
              <span className={`hw-dot ${device ? 'connected' : ''}`} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {device ? `${device.chip} Connected` : 'ESP32 Not Connected'}
              </span>
            </button>

            <div className="xp-mini">
              <div className="xp-mini-row">
                <span style={{ color: 'var(--primary)' }}>{progress.xp} XP</span>
                <span className="muted">{pct}% Journey</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>
        </aside>

        <main className="main-area">
          {tab === 'dashboard' && <Dashboard />}
          {tab === 'journey' && <LearningJourney />}
          {tab === 'level' && <BeginnerLevelPage />}
          {tab === 'projects' && <BeginnerProjectsPage />}
          {tab === 'achievements' && <AchievementsPage />}
          {tab === 'path' && <LearningPath />}
          {tab === 'session' && <InteractiveSession />}
          {tab === 'ide' && <SketchIDE />}
          {tab === 'hardware' && <HardwareLab />}
          {tab === 'circuit' && <CircuitLabPage />}
          {tab === 'code' && <CodeLab />}
          {tab === 'progress' && <MyProgressPage />}
          {tab === 'settings' && <SettingsPage />}
          {tab === 'teacher' && <TeacherDashboard />}
        </main>

        {toastBadge && (
          <div className="badge-toast" role="status">
            <div style={{ fontSize: 32 }}>{toastBadge.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.06em' }}>
                BADGE UNLOCKED (+{toastBadge.xpBonus} XP)
              </div>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{toastBadge.title}</div>
              <div className="muted" style={{ fontSize: 12 }}>{toastBadge.description}</div>
            </div>
            <button
              onClick={dismissToast}
              aria-label="Dismiss"
              style={{ background: 'none', border: 0, color: 'var(--muted)', padding: 4 }}
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export const App: React.FC = () => (
  <StudioProvider>
    <StudioShell />
  </StudioProvider>
);

export default App;
