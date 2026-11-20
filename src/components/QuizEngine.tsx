import React, { useMemo, useState } from 'react';
import { CheckCircle2, Flame, RotateCcw, Sparkles, Trophy, XCircle } from 'lucide-react';
import type { QuizQuestion } from '../data/beginnerJourney';

interface QuizEngineProps {
  title: string;
  questions: QuizQuestion[];
  passingPercent?: number;
  bestScore?: number;
  onPass: (scorePercent: number) => void;
}

interface ShuffledQuestion extends QuizQuestion {
  shuffledOptions: string[];
  shuffledCorrectIndex: number;
}

/** Fisher-Yates shuffle returning a new question list with shuffled options per question. */
function shuffleQuizQuestions(questions: QuizQuestion[]): ShuffledQuestion[] {
  return questions.map((q) => {
    const indexed = q.options.map((text, idx) => ({
      text,
      isCorrect: idx === q.correctIndex,
    }));
    for (let i = indexed.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indexed[i], indexed[j]] = [indexed[j], indexed[i]];
    }
    return {
      ...q,
      shuffledOptions: indexed.map((item) => item.text),
      shuffledCorrectIndex: indexed.findIndex((item) => item.isCorrect),
    };
  });
}

export const QuizEngine: React.FC<QuizEngineProps> = ({
  title,
  questions,
  passingPercent = 80,
  bestScore,
  onPass,
}) => {
  const [attemptSeed, setAttemptSeed] = useState(0);
  const shuffledQuestions = useMemo(
    () => shuffleQuizQuestions(questions),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [questions, attemptSeed]
  );

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [streak, setStreak] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = shuffledQuestions[currentIdx];

  const handleSubmitAnswer = () => {
    if (selected === null) return;
    setSubmitted(true);
    if (selected === q.shuffledCorrectIndex) {
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (selected === null) return;
    const nextAnswers = [...answers, selected];
    setAnswers(nextAnswers);
    setSelected(null);
    setSubmitted(false);

    if (currentIdx + 1 < shuffledQuestions.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setFinished(true);
      const correctCount = nextAnswers.filter(
        (a, i) => a === shuffledQuestions[i].shuffledCorrectIndex
      ).length;
      const pct = Math.round((correctCount / shuffledQuestions.length) * 100);
      if (pct >= passingPercent) {
        onPass(pct);
      }
    }
  };

  const handleRetake = () => {
    setAttemptSeed((s) => s + 1);
    setCurrentIdx(0);
    setSelected(null);
    setSubmitted(false);
    setAnswers([]);
    setStreak(0);
    setFinished(false);
  };

  if (finished) {
    const correctCount = answers.filter(
      (a, i) => a === shuffledQuestions[i].shuffledCorrectIndex
    ).length;
    const pct = Math.round((correctCount / shuffledQuestions.length) * 100);
    const passed = pct >= passingPercent;

    return (
      <div
        className="card quiz-slide"
        style={{
          textAlign: 'center',
          padding: 32,
          background: passed ? 'linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 100%)' : '#FFFFFF',
          borderColor: passed ? 'var(--success-border)' : 'var(--border)',
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 8 }}>{passed ? '🎉' : '💪'}</div>
        <h2 style={{ fontSize: 24, marginBottom: 6 }}>
          {passed ? 'Quiz Passed!' : 'Nice Try — One More Go!'}
        </h2>
        <p className="muted" style={{ margin: '0 0 16px' }}>
          Score: <strong>{correctCount} / {shuffledQuestions.length} ({pct}%)</strong>
        </p>

        <div
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 20 }}
          className={passed ? 'tag tag-ok' : 'tag tag-warn'}
        >
          {passed ? <Trophy size={15} /> : <XCircle size={15} />}
          {passed ? '+30 XP Earned' : `Score ${passingPercent}% to pass`}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={handleRetake}>
            <RotateCcw size={15} /> Retake Quiz
          </button>
        </div>
      </div>
    );
  }

  const isCorrect = selected === q.shuffledCorrectIndex;

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
      }}
    >
      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 17 }}>{title}</h3>
          <div className="muted" style={{ fontSize: 12.5 }}>
            Question {currentIdx + 1} of {shuffledQuestions.length}
            {bestScore !== undefined && ` • Best: ${bestScore}%`}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {streak >= 2 && (
            <span className="tag tag-warn" style={{ animation: 'quizPop 0.25s ease-out' }}>
              <Flame size={13} /> {streak} streak!
            </span>
          )}
          <span className="tag">
            <Sparkles size={13} /> {currentIdx + 1}/{shuffledQuestions.length}
          </span>
        </div>
      </div>

      {/* Step Dots */}
      <div style={{ display: 'flex', gap: 6 }}>
        {shuffledQuestions.map((_, i) => {
          const pastAns = answers[i];
          const wasRight = pastAns !== undefined && pastAns === shuffledQuestions[i].shuffledCorrectIndex;
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: 7,
                borderRadius: 99,
                transition: 'background 0.25s',
                background:
                  i < currentIdx
                    ? wasRight
                      ? 'var(--success)'
                      : 'var(--danger)'
                    : i === currentIdx
                    ? 'var(--primary)'
                    : '#E2E8F0',
              }}
            />
          );
        })}
      </div>

      {/* Question Card */}
      <div key={`${attemptSeed}-${currentIdx}`} className="quiz-slide" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', lineHeight: 1.4 }}>
          {q.question}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {q.shuffledOptions.map((opt, idx) => {
            let cls = 'quiz-opt';
            if (submitted) {
              if (idx === q.shuffledCorrectIndex) cls += ' correct';
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
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    background:
                      submitted && idx === q.shuffledCorrectIndex
                        ? 'var(--success)'
                        : idx === selected
                        ? 'var(--primary)'
                        : '#F1F5F9',
                    color:
                      (submitted && idx === q.shuffledCorrectIndex) || idx === selected
                        ? '#FFFFFF'
                        : '#172033',
                    fontSize: 12.5,
                    fontWeight: 800,
                    flexShrink: 0,
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
          <div className={`check-item ${isCorrect ? 'ok' : 'err'} quiz-slide`}>
            {isCorrect ? (
              <CheckCircle2 size={18} color="#16A34A" style={{ flexShrink: 0, marginTop: 2 }} />
            ) : (
              <XCircle size={18} color="#DC2626" style={{ flexShrink: 0, marginTop: 2 }} />
            )}
            <div>
              <strong>{isCorrect ? 'Awesome!' : 'Good try!'}</strong> {q.explanation}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {!submitted ? (
          <button className="btn btn-primary" disabled={selected === null} onClick={handleSubmitAnswer}>
            Check Answer
          </button>
        ) : (
          <button className="btn btn-primary" onClick={handleNext}>
            {currentIdx + 1 < shuffledQuestions.length ? 'Next Question →' : 'Finish Quiz'}
          </button>
        )}
      </div>
    </div>
  );
};
