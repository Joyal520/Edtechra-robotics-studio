import React, { useState } from 'react';
import { ClipboardCheck, Download, RotateCcw, Users } from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { BADGES, LEVELS_SUMMARY, SESSIONS } from '../data/curriculum';

interface AssignmentItem {
  id: string;
  title: string;
  sessionId: number;
  due: string;
  assigned: boolean;
}

const DEFAULT_ASSIGNMENTS: AssignmentItem[] = [
  { id: 'a1', title: 'Connect ESP32 & Upload First Blink', sessionId: 2, due: 'Week 1', assigned: true },
  { id: 'a2', title: 'Modify Blink Speed (4 Challenges)', sessionId: 4, due: 'Week 2', assigned: true },
  { id: 'a3', title: 'External LED Circuit + Guided Code', sessionId: 6, due: 'Week 3', assigned: true },
  { id: 'a4', title: 'Traffic Light Controller Project', sessionId: 9, due: 'Week 4', assigned: true },
  { id: 'a5', title: 'Automatic Irrigation System', sessionId: 22, due: 'Week 6', assigned: false },
  { id: 'a6', title: 'Obstacle Avoiding Robot Capstone', sessionId: 29, due: 'Week 8', assigned: false },
];

export const TeacherDashboard: React.FC = () => {
  const { progress, setStudentName, resetProgress, openSession } = useStudio();
  const [assignments, setAssignments] = useState<AssignmentItem[]>(DEFAULT_ASSIGNMENTS);
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);

  const selectedSub = progress.submissions.find((s) => s.id === selectedSubId) || progress.submissions[0];

  const handleExportReport = () => {
    const blob = new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `edtechra-progress-${progress.studentName.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="page-header" style={{ marginBottom: 4 }}>
        <div>
          <span className="tag" style={{ marginBottom: 8 }}>PHASE 7 — CLASSROOM MANAGEMENT</span>
          <h1>Teacher Dashboard</h1>
          <p className="muted" style={{ margin: 0 }}>
            Track student progress across all 14 levels, manage assignments, review rule-based assessments, and inspect code submissions.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-sm" onClick={handleExportReport}>
            <Download size={15} /> Export Progress JSON
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => {
              if (window.confirm('Reset all local student progress and XP?')) resetProgress();
            }}
          >
            <RotateCcw size={15} /> Reset Student Data
          </button>
        </div>
      </div>

      {/* Student Profile & Overview */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Users size={22} color="#22d3ee" />
            <div>
              <div className="muted" style={{ fontSize: 12 }}>Active Student Profile</div>
              <input
                value={progress.studentName}
                onChange={(e) => setStudentName(e.target.value)}
                style={{
                  background: '#081224',
                  border: '1px solid #233861',
                  borderRadius: 8,
                  padding: '6px 10px',
                  fontWeight: 700,
                  marginTop: 4,
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div className="muted" style={{ fontSize: 12 }}>Completion</div>
              <strong style={{ fontSize: 18, color: '#22d3ee' }}>
                {progress.completedSessions.length} / {SESSIONS.length}
              </strong>
            </div>
            <div>
              <div className="muted" style={{ fontSize: 12 }}>Earned XP</div>
              <strong style={{ fontSize: 18, color: '#6ee7b7' }}>{progress.xp} XP</strong>
            </div>
            <div>
              <div className="muted" style={{ fontSize: 12 }}>Badges</div>
              <strong style={{ fontSize: 18, color: '#c4b5fd' }}>
                {progress.unlockedBadges.length} / {BADGES.length}
              </strong>
            </div>
            <div>
              <div className="muted" style={{ fontSize: 12 }}>Hardware Verified</div>
              <strong style={{ fontSize: 18, color: progress.hardwareConnectedOnce ? '#10b981' : '#f59e0b' }}>
                {progress.hardwareConnectedOnce ? 'Yes' : 'Pending'}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Level-by-Level Progress Matrix + Assignments */}
      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div className="card">
          <h2>14-Level Mastery Tracker</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Level</th>
                <th>Topic</th>
                <th>Sessions Done</th>
              </tr>
            </thead>
            <tbody>
              {LEVELS_SUMMARY.map((lvl) => {
                const done = lvl.sessions.filter((s) => progress.completedSessions.includes(s.id)).length;
                return (
                  <tr key={lvl.level}>
                    <td><strong>L{lvl.level}</strong></td>
                    <td>{lvl.title}</td>
                    <td>
                      <span className={done === lvl.sessions.length ? 'tag tag-ok' : 'tag'}>
                        {done} / {lvl.sessions.length}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <ClipboardCheck size={18} color="#22d3ee" />
            <h2 style={{ margin: 0 }}>Classroom Assignments</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {assignments.map((a) => {
              const completed = progress.completedSessions.includes(a.sessionId);
              return (
                <div key={a.id} className="card-sm" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{a.title}</div>
                    <div className="muted" style={{ fontSize: 12 }}>
                      Target: {a.due} • Session {a.sessionId} •{' '}
                      <strong style={{ color: completed ? '#6ee7b7' : '#f59e0b' }}>
                        {completed ? 'Completed' : 'In Progress'}
                      </strong>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      className={`btn btn-sm ${a.assigned ? 'btn-success' : 'btn-secondary'}`}
                      onClick={() =>
                        setAssignments((prev) =>
                          prev.map((x) => (x.id === a.id ? { ...x, assigned: !x.assigned } : x))
                        )
                      }
                    >
                      {a.assigned ? 'Assigned' : 'Assign'}
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => openSession(a.sessionId)}>
                      Open
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Student Code Submissions */}
      <div className="card">
        <h2>Student Code Submissions &amp; Assessment</h2>
        {progress.submissions.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>
            No code submissions recorded yet. When a student clicks &ldquo;Check My Code&rdquo; or &ldquo;Evaluate Code&rdquo;, their code and rule-check score appear here automatically.
          </p>
        ) : (
          <div className="grid-2" style={{ alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 340, overflowY: 'auto' }}>
              {progress.submissions.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubId(sub.id)}
                  className="card-sm"
                  style={{
                    textAlign: 'left',
                    borderColor: selectedSub?.id === sub.id ? '#22d3ee' : '#233861',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <strong style={{ fontSize: 13.5 }}>{sub.sessionTitle}</strong>
                    <span className={sub.passedRules === sub.totalRules ? 'tag tag-ok' : 'tag tag-warn'}>
                      {sub.passedRules}/{sub.totalRules} rules
                    </span>
                  </div>
                  <div className="muted" style={{ fontSize: 11.5, marginTop: 4 }}>
                    {sub.studentName} • {sub.submittedAt}
                  </div>
                </button>
              ))}
            </div>

            {selectedSub && (
              <div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>
                  Submitted Code — {selectedSub.sessionTitle}
                </div>
                <pre className="code-block" style={{ maxHeight: 310, overflowY: 'auto', fontSize: 12.5 }}>
                  {selectedSub.code}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
