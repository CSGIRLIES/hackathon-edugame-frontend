import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUser } from '../contexts/UserContext.tsx';

interface Question {
  question: string;
  options: string[];
  correct: number;
}

const QuizPage: React.FC = () => {
  const { t } = useTranslation();
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { updateXP } = useUser();
  const navigate = useNavigate();

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

    if (isCorrect) {
      setScore((prev) => prev + 20);
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      const finalScore = isCorrect ? score + 20 : score;
      updateXP(finalScore);
      alert(`Quiz terminé ! Tu as gagné ${finalScore} XP pour ton compagnon ✨`);
      navigate('/dashboard');
    }
  };

  if (!started) {
    return (
      <div className="page">
        <header className="page-header">
          <h1 className="page-title">Mini quiz de révision ✨</h1>
          <p className="page-subtitle">
            Décris ton cours ou ton sujet. Ton compagnon génère des questions pour vérifier si tu as bien compris.
          </p>
        </header>

        <main>
          <section className="card quiz-card">
            <div className="card-header">
              <h2 className="card-title">De quoi veux-tu parler aujourd'hui ?</h2>
              <p className="card-subtitle">
                Tu peux écrire un chapitre, un thème ("fractions", "révolution française"...) ou copier un bout de ton cours.
              </p>
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="topic">
                Ton sujet
              </label>
              <textarea
                id="topic"
                className="textarea"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ex : Les équations du 1er degré, ou copier/colle un paragraphe de ton cours"
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
                {isLoading ? 'Génération en cours...' : 'Générer des questions'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/dashboard')}
              >
                Retour au tableau de bord
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
        <h1 className="page-title">Quiz sur : {topic}</h1>
        <p className="page-subtitle">
          Réponds aux questions pour prouver à ton compagnon que tu as bien travaillé.
        </p>
      </header>

      <main>
        <section className="card quiz-card">
          <div className="card-header">
            <h2 className="card-title">
              Question {currentQuestion + 1} / {questions.length}
            </h2>
            <p className="card-subtitle">Score actuel : {score} XP potentiels</p>
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
    </div>
  );
};

export default QuizPage;
