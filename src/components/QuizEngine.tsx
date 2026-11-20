import React, { useState } from 'react';
import { CheckCircle2, RotateCcw, Trophy, XCircle } from 'lucide-react';
import type { QuizQuestion } from '../data/beginnerJourney';

interface QuizEngineProps {
  title: string;
  questions: QuizQuestion[];
  passingPercent?: number;
  bestScore?: number;
  onPass: (scorePercent: number) => void;
}

export const QuizEngine: React.FC<QuizEngineProps> = ({
  title,
  questions,
  passingPercent = 80,
  bestScore,
  onPass,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);

  const q = questions[currentIdx];

  const handleSubmitAnswer = () => {
    if (selected === null) return;
    setSubmitted(true);
  };

  const handleNext = () => {
    if (selected === null) return;
    const nextAnswers = [...answers, selected];
    setAnswers(nextAnswers);
    setSelected(null);
    setSubmitted(false);

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setFinished(true);
      const correctCount = nextAnswers.filter((a, i) => a === questions[i].correctIndex).length;
      const pct = Math.round((correctCount / questions.length) * 100);
      if (pct >= passingPercent) {
        onPass(pct);
      }
    }
  };

  const handleRetake = () => {
    setCurrentIdx(0);
    setSelected(null);
    setSubmitted(false);
    setAnswers([]);
    setFinished(false);
  };

  if (finished) {
    const correctCount = answers.filter((a, i) => a === questions[i].correctIndex).length;
    const pct = Math.round((correctCount / questions.length) * 100);
    const passed = pct >= passingPercent;

    return (
      <div className="card" style={{ textAlign: 'center', padding: 28 }}>
        <div style={{ fontSize: 44, marginBottom: 8 }}>{passed ? '🎉' : '📝'}</div>
        <h2 style={{ fontSize: 24, marginBottom: 6 }}>
          {passed ? 'Quiz Passed!' : 'Almost There — Try Again!'}
        </h2>
        <p className="muted" style={{ margin: '0 0 16px' }}>
          You scored <strong>{correctCount} / {questions.length} ({pct}%)</strong>. Passing score is {passingPercent}%.
        </p>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 18,
          }}
          className={passed ? 'tag tag-ok' : 'tag tag-warn'}
        >
          {passed ? <Trophy size={15} /> : <XCircle size={15} />}
          {passed ? '+30 XP Earned — Quiz Requirement Complete' : `Need ${passingPercent}% to pass — retakes are unlimited`}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
          <button className="btn btn-secondary" onClick={handleRetake}>
            <RotateCcw size={15} /> Retake Quiz
          </button>
        </div>
      </div>
    );
  }

  const isCorrect = selected === q.correctIndex;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <div className="muted" style={{ fontSize: 13 }}>
            Question {currentIdx + 1} of {questions.length} • Passing score: {passingPercent}%
            {bestScore !== undefined && ` • Best score: ${bestScore}%`}
          </div>
        </div>
        <span className="tag">
          {Math.round(((currentIdx + (submitted ? 1 : 0)) / questions.length) * 100)}%
        </span>
      </div>

      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${((currentIdx + (submitted ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>
        {currentIdx + 1}. {q.question}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {q.options.map((opt, idx) => {
          let cls = 'quiz-opt';
          if (submitted) {
            if (idx === q.correctIndex) cls += ' correct';
            else if (idx === selected) cls += ' wrong';
          } else if (idx === selected) {
            cls += ' selected';
          }
          return (
            <button
              key={idx}
              className={cls}
              disabled={submitted}
              onClick={() => setSelected(idx)}
            >
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  fontSize: 12.5,
                  fontWeight: 800,
                  flexShrink: 0,
                  color: '#172033',
                }}
              >
                {String.fromCharCode(65 + idx)}
              </span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>

      {submitted && (
        <div className={`check-item ${isCorrect ? 'ok' : 'err'}`}>
          {isCorrect ? (
            <CheckCircle2 size={18} color="#16A34A" style={{ flexShrink: 0, marginTop: 2 }} />
          ) : (
            <XCircle size={18} color="#DC2626" style={{ flexShrink: 0, marginTop: 2 }} />
          )}
          <div>
            <strong>{isCorrect ? 'Correct!' : 'Not quite right.'}</strong> {q.explanation}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        {!submitted ? (
          <button className="btn btn-primary" disabled={selected === null} onClick={handleSubmitAnswer}>
            Check Answer
          </button>
        ) : (
          <button className="btn btn-primary" onClick={handleNext}>
            {currentIdx + 1 < questions.length ? 'Next Question →' : 'See Quiz Results'}
          </button>
        )}
      </div>
    </div>
  );
};
