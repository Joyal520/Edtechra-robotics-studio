import React from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Target } from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { SESSIONS } from '../data/curriculum';
import {
  Session1Connect,
  Session2Upload,
  Session3Understand,
  Session4Modify,
} from './sessions/HardwareStartSessions';
import {
  ProjectSessionWorkbench,
  Session5ExternalLedCircuit,
  Session6GuidedCoding,
} from './sessions/CircuitAndProjectSessions';

export const InteractiveSession: React.FC = () => {
  const { activeSessionId, openSession, setTab, progress } = useStudio();
  const session = SESSIONS.find((s) => s.id === activeSessionId) || SESSIONS[0];
  const isCompleted = progress.completedSessions.includes(session.id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Session Header */}
      <div className="page-header" style={{ marginBottom: 4 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setTab('path')}>
              <ArrowLeft size={14} /> Learning Path
            </button>
            <span className="tag">
              LEVEL {session.level}: {session.levelTitle}
            </span>
            <span className="tag">Session {session.id} of 30</span>
            {session.hardwareFocused && <span className="tag tag-warn">Hardware-First Session</span>}
            {isCompleted && (
              <span className="tag tag-ok">
                <CheckCircle2 size={13} /> Completed (+{session.xpReward} XP)
              </span>
            )}
          </div>
          <h1>{session.title}</h1>
          <p className="muted" style={{ margin: 0, maxWidth: 780 }}>
            {session.explanation}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn btn-secondary btn-sm"
            disabled={session.id <= 1}
            onClick={() => openSession(session.id - 1)}
          >
            <ArrowLeft size={14} /> Prev
          </button>
          <button
            className="btn btn-secondary btn-sm"
            disabled={session.id >= 30}
            onClick={() => openSession(session.id + 1)}
          >
            Next <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Clear Learning Objective Banner */}
      <div className="card-sm" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Target size={18} color="#22d3ee" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: 13.5 }}>
          <strong>Learning Objective:</strong> {session.objective}
        </div>
      </div>

      {/* Specialized Interactive Session Body */}
      {session.id === 1 && <Session1Connect />}
      {session.id === 2 && <Session2Upload />}
      {session.id === 3 && <Session3Understand />}
      {session.id === 4 && <Session4Modify />}
      {session.id === 5 && <Session5ExternalLedCircuit />}
      {session.id === 6 && <Session6GuidedCoding />}
      {session.id >= 7 && <ProjectSessionWorkbench session={session} />}
    </div>
  );
};
