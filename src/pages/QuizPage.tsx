import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUser } from '../contexts/UserContext.tsx';
import Modal from '../components/Modal.tsx';

interface Question {
  question: string;
  options: string[];
  correct: number;
}

const QuizPage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const { updateXP } = useUser();
  const navigate = useNavigate();

  // Auto-start quiz if topic is passed from LearningPage
  useEffect(() => {
    const stateData = location.state as { topic?: string } | null;
    if (stateData?.topic) {
      setTopic(stateData.topic);
      // Auto-start the quiz with the provided topic
      const startQuizWithTopic = async () => {
        setIsLoading(true);
        setError(null);

        try {
          const res = await fetch('http://localhost:4000/api/quiz/from-text', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ topic: stateData.topic, numQuestions: 3 }),
          });

          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || 'Erreur serveur');
          }

          const data = await res.json();
          const q: Question[] = data.questions || [];

          if (!q.length) {
            throw new Error("L'IA n'a pas réussi à générer des questions.");
          }

          setQuestions(q);
          setStarted(true);
          setScore(0);
          setCurrentQuestion(0);
        } catch (e: any) {
          console.error('[QuizPage] Failed to start quiz', e);
          setError(e.message || 'Impossible de générer le quiz, réessaie plus tard.');
        } finally {
          setIsLoading(false);
        }
      };

      startQuizWithTopic();
    }
  }, [location]);

  const handleStartQuiz = async () => {
    const trimmed = topic.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:4000/api/quiz/from-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic: trimmed, numQuestions: 3 }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Erreur serveur');
      }

      const data = await res.json();
      const q: Question[] = data.questions || [];

      if (!q.length) {
        throw new Error("L'IA n'a pas réussi à générer des questions.");
      }

      setQuestions(q);
      setStarted(true);
      setScore(0);
      setCurrentQuestion(0);
    } catch (e: any) {
      console.error('[QuizPage] Failed to start quiz', e);
      setError(e.message || 'Impossible de générer le quiz, réessaie plus tard.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (index: number) => {
    const current = questions[currentQuestion];
    const isCorrect = index === current.correct;

    // Calculate the new score
    const newScore = isCorrect ? score + 20 : score;

    if (currentQuestion < questions.length - 1) {
      // Not the last question, just update score and move to next
      setScore(newScore);
      setCurrentQuestion((prev) => prev + 1);
    } else {
      // Last question, update score and show completion modal
      setScore(newScore);
      updateXP(newScore);
      setFinalScore(newScore);
      setShowCompletionModal(true);
    }
  };

  if (!started) {
    return (
      <div className="page">
        <header className="page-header">
          <h1 className="page-title">{t('quiz.title')}</h1>
          <p className="page-subtitle">
            {t('quiz.subtitle')}
          </p>
        </header>

        <main>
          <section className="card quiz-card">
            <div className="card-header">
              <h2 className="card-title">{t('quiz.whatLearn')}</h2>
              <p className="card-subtitle">
                {t('quiz.topicLabel')}
              </p>
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="topic">
                {t('quiz.topicLabel')}
              </label>
              <textarea
                id="topic"
                className="textarea"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={t('quiz.topicPlaceholder')}
                required
              />
              {error && (
                <p className="helper-text" style={{ color: '#fb7185' }}>
                  {error}
                </p>
              )}
            </div>

            <div className="btn-row" style={{ marginTop: '1.25rem' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleStartQuiz}
                disabled={!topic.trim() || isLoading}
              >
                {isLoading ? t('quiz.generating') : t('quiz.generateButton')}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/dashboard')}
              >
                {t('quiz.backToDashboard')}
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  const current = questions[currentQuestion];

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">{t('quiz.title')}</h1>
        <p className="page-subtitle">
          {t('quiz.subtitle')}
        </p>
      </header>

      <main>
        <section className="card quiz-card">
          <div className="card-header">
            <h2 className="card-title">
              {t('quiz.question', { current: currentQuestion + 1, total: questions.length })}
            </h2>
            <p className="card-subtitle">{t('quiz.xpEarned')} {score} XP</p>
          </div>

          <p>{current.question}</p>

          <div className="quiz-options">
            {current.options.map((option, index) => (
              <button
                key={index}
                type="button"
                className="btn quiz-option-btn"
                onClick={() => handleAnswer(index)}
              >
                {option}
              </button>
            ))}
          </div>
        </section>
      </main>

      <Modal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        title="✨ Félicitations !"
        message={`Quiz terminé ! Tu as gagné ${finalScore} XP pour ton compagnon. Continue comme ça ! 🎉`}
        icon="✨"
        buttonText="Retour au tableau de bord"
        buttonAction={() => {
          setShowCompletionModal(false);
          navigate('/dashboard');
        }}
      />
    </div>
  );
};

export default QuizPage;
