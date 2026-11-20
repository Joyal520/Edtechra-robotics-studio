import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { BEGINNER_LEVELS, XP_RULES } from '../data/beginnerJourney';
import { BADGES, SESSIONS } from '../data/curriculum';
import { esp32Service } from '../services/esp32Service';
import type {
  BadgeDef,
  BadgeId,
  HardwareDeviceInfo,
  NavTab,
  StudentProgress,
  StudentSubmission,
} from '../types';

const STORAGE_KEY = 'edtechra_robotics_studio_v2';

const DEFAULT_PROGRESS: StudentProgress = {
  studentName: 'Student Explorer',
  xp: 0,
  completedSessions: [],
  completedLevels: [],
  quizScores: {},
  beginnerBadges: [],
  unlockedBadges: [],
  hardwareConnectedOnce: false,
  uploadedOnce: false,
  savedCode: {},
  submissions: [],
  activityLog: [],
};

interface StudioContextValue {
  tab: NavTab;
  setTab: (t: NavTab) => void;
  activeSessionId: number;
  openSession: (id: number) => void;
  activeLevel: number;
  openLevel: (level: number) => void;
  isLevelUnlocked: (level: number) => boolean;
  recordQuizPass: (level: number, scorePercent: number) => void;
  completeBeginnerLevel: (level: number) => void;
  progress: StudentProgress;
  setStudentName: (name: string) => void;
  completeSession: (sessionId: number, extraNote?: string) => void;
  unlockBadge: (badgeId: BadgeId) => void;
  awardTaskXP: (amount: number, reason: string) => void;
  saveSessionCode: (sessionId: number, code: string) => void;
  recordSubmission: (sub: Omit<StudentSubmission, 'id' | 'studentName' | 'submittedAt'>) => void;
  resetProgress: () => void;
  importProgress: (data: StudentProgress) => void;
  // Real hardware state
  device: HardwareDeviceInfo | null;
  hwConnecting: boolean;
  hwLogs: string[];
  hwError: string | null;
  connectESP32: () => Promise<HardwareDeviceInfo | null>;
  disconnectESP32: () => Promise<void>;
  markUploaded: () => void;
  // Toast
  toastBadge: BadgeDef | null;
  dismissToast: () => void;
}

const StudioContext = createContext<StudioContextValue | null>(null);

export const StudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tab, setTab] = useState<NavTab>('dashboard');
  const [activeSessionId, setActiveSessionId] = useState<number>(1);
  const [activeLevel, setActiveLevel] = useState<number>(1);
  const [progress, setProgress] = useState<StudentProgress>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return { ...DEFAULT_PROGRESS, ...JSON.parse(raw) };
      }
    } catch {
      // ignore storage errors
    }
    return DEFAULT_PROGRESS;
  });

  const [device, setDevice] = useState<HardwareDeviceInfo | null>(esp32Service.getDeviceInfo());
  const [hwConnecting, setHwConnecting] = useState(false);
  const [hwLogs, setHwLogs] = useState<string[]>([]);
  const [hwError, setHwError] = useState<string | null>(null);
  const [toastBadge, setToastBadge] = useState<BadgeDef | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // ignore
    }
  }, [progress]);

  const dismissToast = useCallback(() => setToastBadge(null), []);

  const unlockBadge = useCallback((badgeId: BadgeId) => {
    const def = BADGES.find((b) => b.id === badgeId);
    if (!def) return;
    setProgress((prev) => {
      if (prev.unlockedBadges.includes(badgeId)) return prev;
      setToastBadge(def);
      setTimeout(() => setToastBadge((cur) => (cur?.id === badgeId ? null : cur)), 5500);
      return {
        ...prev,
        xp: prev.xp + def.xpBonus,
        unlockedBadges: [...prev.unlockedBadges, badgeId],
        activityLog: [
          {
            time: new Date().toLocaleTimeString(),
            message: `Earned badge: ${def.icon} ${def.title}`,
            xp: def.xpBonus,
          },
          ...prev.activityLog,
        ].slice(0, 25),
      };
    });
  }, []);

  const awardTaskXP = useCallback((amount: number, reason: string) => {
    if (amount <= 0) return;
    setProgress((prev) => ({
      ...prev,
      xp: prev.xp + amount,
      activityLog: [
        { time: new Date().toLocaleTimeString(), message: reason, xp: amount },
        ...prev.activityLog,
      ].slice(0, 25),
    }));
  }, []);

  const completeSession = useCallback(
    (sessionId: number, extraNote?: string) => {
      const session = SESSIONS.find((s) => s.id === sessionId);
      if (!session) return;

      setProgress((prev) => {
        if (prev.completedSessions.includes(sessionId)) return prev;
        return {
          ...prev,
          xp: prev.xp + session.xpReward,
          completedSessions: [...prev.completedSessions, sessionId].sort((a, b) => a - b),
          activityLog: [
            {
              time: new Date().toLocaleTimeString(),
              message: extraNote || `Completed Session ${session.id}: ${session.title}`,
              xp: session.xpReward,
            },
            ...prev.activityLog,
          ].slice(0, 25),
        };
      });

      if (session.badgeReward) {
        unlockBadge(session.badgeReward);
      }
    },
    [unlockBadge]
  );

  const openSession = useCallback((id: number) => {
    setActiveSessionId(id);
    setTab('session');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const openLevel = useCallback((level: number) => {
    setActiveLevel(level);
    setTab('level');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const isLevelUnlocked = useCallback(
    (level: number) => {
      if (level <= 1) return true;
      return progress.completedLevels.includes(level - 1);
    },
    [progress.completedLevels]
  );

  const recordQuizPass = useCallback((level: number, scorePercent: number) => {
    setProgress((prev) => {
      const prevBest = prev.quizScores[level] ?? 0;
      const firstPass = prevBest < 80 && scorePercent >= 80;
      return {
        ...prev,
        xp: prev.xp + (firstPass ? XP_RULES.quizPassed : 0),
        quizScores: { ...prev.quizScores, [level]: Math.max(prevBest, scorePercent) },
        activityLog: firstPass
          ? [
              {
                time: new Date().toLocaleTimeString(),
                message: `Passed Level ${level} Quiz (${scorePercent}%)`,
                xp: XP_RULES.quizPassed,
              },
              ...prev.activityLog,
            ].slice(0, 25)
          : prev.activityLog,
      };
    });
  }, []);

  const completeBeginnerLevel = useCallback((level: number) => {
    const def = BEGINNER_LEVELS.find((l) => l.level === level);
    if (!def) return;
    setProgress((prev) => {
      const alreadyDone = prev.completedLevels.includes(level);
      const alreadyBadge = prev.beginnerBadges.includes(def.badge.id);
      if (!alreadyBadge) {
        setToastBadge({
          id: 'first-connection',
          title: def.badge.name,
          description: def.badge.description,
          icon: def.badge.icon,
          xpBonus: XP_RULES.projectCompleted,
        });
        setTimeout(() => setToastBadge(null), 5500);
      }
      return {
        ...prev,
        xp: prev.xp + (alreadyDone ? 0 : XP_RULES.projectCompleted),
        completedLevels: alreadyDone ? prev.completedLevels : [...prev.completedLevels, level].sort((a, b) => a - b),
        beginnerBadges: alreadyBadge ? prev.beginnerBadges : [...prev.beginnerBadges, def.badge.id],
        activityLog: alreadyDone
          ? prev.activityLog
          : [
              {
                time: new Date().toLocaleTimeString(),
                message: `Completed Level ${level}: ${def.title} (${def.badge.icon} ${def.badge.name})`,
                xp: XP_RULES.projectCompleted,
              },
              ...prev.activityLog,
            ].slice(0, 25),
      };
    });
  }, []);

  const saveSessionCode = useCallback((sessionId: number, code: string) => {
    setProgress((prev) => ({
      ...prev,
      savedCode: { ...prev.savedCode, [sessionId]: code },
    }));
  }, []);

  const recordSubmission = useCallback(
    (sub: Omit<StudentSubmission, 'id' | 'studentName' | 'submittedAt'>) => {
      setProgress((prev) => ({
        ...prev,
        submissions: [
          {
            ...sub,
            id: `sub-${Date.now()}`,
            studentName: prev.studentName,
            submittedAt: new Date().toLocaleString(),
          },
          ...prev.submissions,
        ].slice(0, 40),
      }));
    },
    []
  );

  const setStudentName = useCallback((name: string) => {
    setProgress((prev) => ({ ...prev, studentName: name.trim() || 'Student Explorer' }));
  }, []);

  const connectESP32 = useCallback(async () => {
    setHwConnecting(true);
    setHwError(null);
    setHwLogs([]);
    try {
      const info = await esp32Service.connect((line) => {
        setHwLogs((prev) => [...prev.slice(-30), line]);
      });
      setDevice(info);
      setProgress((prev) => {
        const firstTime = !prev.hardwareConnectedOnce;
        return {
          ...prev,
          hardwareConnectedOnce: true,
          xp: prev.xp + (firstTime ? 50 : 0),
          activityLog: [
            {
              time: new Date().toLocaleTimeString(),
              message: `Connected real hardware: ${info.chip} (${info.portLabel})`,
              xp: firstTime ? 50 : undefined,
            },
            ...prev.activityLog,
          ].slice(0, 25),
        };
      });
      unlockBadge('first-connection');
      return info;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setHwError(msg);
      return null;
    } finally {
      setHwConnecting(false);
    }
  }, [unlockBadge]);

  const disconnectESP32 = useCallback(async () => {
    await esp32Service.disconnect();
    setDevice(null);
    setHwError(null);
  }, []);

  const markUploaded = useCallback(() => {
    setProgress((prev) => {
      const firstTime = !prev.uploadedOnce;
      return {
        ...prev,
        uploadedOnce: true,
        xp: prev.xp + (firstTime ? 60 : 20),
        activityLog: [
          {
            time: new Date().toLocaleTimeString(),
            message: 'Uploaded program to real ESP32 board',
            xp: firstTime ? 60 : 20,
          },
          ...prev.activityLog,
        ].slice(0, 25),
      };
    });
    unlockBadge('first-upload');
  }, [unlockBadge]);

  const resetProgress = useCallback(() => {
    setProgress(DEFAULT_PROGRESS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const importProgress = useCallback((data: StudentProgress) => {
    setProgress({ ...DEFAULT_PROGRESS, ...data });
  }, []);

  return (
    <StudioContext.Provider
      value={{
        tab,
        setTab,
        activeSessionId,
        openSession,
        activeLevel,
        openLevel,
        isLevelUnlocked,
        recordQuizPass,
        completeBeginnerLevel,
        progress,
        setStudentName,
        completeSession,
        unlockBadge,
        awardTaskXP,
        saveSessionCode,
        recordSubmission,
        resetProgress,
        importProgress,
        device,
        hwConnecting,
        hwLogs,
        hwError,
        connectESP32,
        disconnectESP32,
        markUploaded,
        toastBadge,
        dismissToast,
      }}
    >
      {children}
    </StudioContext.Provider>
  );
};

export function useStudio() {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error('useStudio must be used inside StudioProvider');
  return ctx;
}
