import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUser } from '../contexts/UserContext.tsx';
import Modal from '../components/Modal.tsx';

interface Question {
  question: string;
  options: string[];
  correct: number;
  wolframInput?: string | null;
}

interface WolframExplanation {
  title: string;
  plaintext: string;
}

interface WolframHistoryEntry {
  question: string;
  primaryResult: string;
  explanations: WolframExplanation[];
}

// Essaie de transformer certaines questions (ex : "Quelle est la solution de l'équation 3x + 5 = 18 ?")
// en une expression Wolfram plus précise (ex : "Solve[3 x + 5 == 18, x]") avant d'appeler l'API.
const buildWolframInput = (questionText: string): string => {
  // Cas 1 : question de type "Quelle est la solution de l'équation 3x + 5 = 18 ?"
  const eqMatch = questionText.match(/équation\s+([^?]+)/i);
  if (eqMatch) {
    const rawEq = eqMatch[1].trim(); // ex : "3x + 5 = 18"

    if (!rawEq.includes('=')) {
      return questionText;
    }

    const parts = rawEq.split('=');
    if (parts.length !== 2) {
      return questionText;
    }

    const lhs = parts[0].trim();
    const rhs = parts[1].trim();
    const wolframEq = `${lhs} == ${rhs}`;

    // On suppose ici que la variable principale est x (pour les questions de type collège/lycée)
    return `Solve[${wolframEq}, x]`;
  }

  // Cas 2 : question de type "Quel est le résultat de 8 - 3 ?"
  const resultMatch = questionText.match(/résultat de\s+([^?]+)/i);
  if (resultMatch) {
    const expr = resultMatch[1].trim(); // ex : "8 - 3"
    // Cette expression est déjà compréhensible par Wolfram (calcul direct)
    return expr;
  }

  // Cas 3 : question de type "Quelle est la somme de 4 et 7 ?"
  const sumMatch = questionText.match(/(?:somme|addition|plus)\s+de\s+(\d+(?:\.\d+)?)\s+(?:et|plus|aussi)\s+(\d+(?:\.\d+)?)/i);
  if (sumMatch) {
    const num1 = sumMatch[1];
    const num2 = sumMatch[2];
    return `${num1} + ${num2}`;
  }

  // Cas 4 : soustraction/différence
  const diffMatch = questionText.match(/(?:différence|soustraction|moins)\s+de\s+(\d+(?:\.\d+)?)\s+(?:et|moins)\s+(\d+(?:\.\d+)?)/i);
  if (diffMatch) {
    const num1 = diffMatch[1];
    const num2 = diffMatch[2];
    return `${num1} - ${num2}`;
  }

  // Cas 5 : produit/multiplication
  const productMatch = questionText.match(/(?:produit|multiplication|fois)\s+de\s+(\d+(?:\.\d+)?)\s+(?:et|fois|par)\s+(\d+(?:\.\d+)?)/i);
  if (productMatch) {
    const num1 = productMatch[1];
    const num2 = productMatch[2];
    return `${num1} * ${num2}`;
  }

  // Cas 6 : quotient/division
  const quotientMatch = questionText.match(/(?:quotient|division)(?:\s+de)?\s+(\d+(?:\.\d+)?)\s+(?:par|divisé\s+par)\s+(\d+(?:\.\d+)?)/i);
  if (quotientMatch) {
    const num1 = quotientMatch[1];
    const num2 = quotientMatch[2];
    return `${num1} / ${num2}`;
  }

  // Par défaut, on renvoie le texte original
  return questionText;
};

const QuizPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wolframHistory, setWolframHistory] = useState<WolframHistoryEntry[]>([]);
  const [wolframError, setWolframError] = useState<string | null>(null);
  const [wolframLoading, setWolframLoading] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const { updateXP } = useUser();
  const navigate = useNavigate();

  // Check for themed quiz data on mount
  useEffect(() => {
    if (location.state?.themedQuiz && location.state.questions) {
      setQuestions(location.state.questions);
      setStarted(true);
      setScore(0);
      setCurrentQuestion(0);
      setWolframHistory([]);
      setWolframError(null);
    }
  }, [location.state]);

  const handleStartQuiz = async () => {
    const trimmed = topic.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setError(null);
    setWolframHistory([]);
    setWolframError(null);

    try {
      const res = await fetch('http://localhost:4000/api/quiz/from-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: trimmed,
          numQuestions: 3,
          language: i18n.language,
        }),
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

  const handleWolframExplain = async () => {
    if (!questions.length) return;

    const current = questions[currentQuestion];
    const input = current.wolframInput && current.wolframInput.trim().length > 0
      ? current.wolframInput
      : buildWolframInput(current.question);

    setWolframLoading(true);
    setWolframError(null);

    try {
      const res = await fetch('http://localhost:4000/api/wolfram/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erreur lors de l'appel à Wolfram");
      }

      const data = await res.json();
      const explanations: WolframExplanation[] = data.explanations || [];
      const primaryResult: string = data.primaryResult || '';

      setWolframHistory((prev) => [
        {
          question: current.question,
          primaryResult,
          explanations,
        },
        ...prev,
      ]);
    } catch (e: any) {
      console.error('[QuizPage] Wolfram explanation error', e);
      setWolframError(
        e.message || "Impossible de récupérer l'explication Wolfram."
      );
    } finally {
      setWolframLoading(false);
    }
  };

  const handleAnswer = (index: number) => {
    const current = questions[currentQuestion];
    const isCorrect = index === current.correct;

    setScore((prevScore) => {
      const updatedScore = isCorrect ? prevScore + 20 : prevScore;

      if (currentQuestion < questions.length - 1) {
        // Not the last question, just move to the next one
        setCurrentQuestion((prev) => prev + 1);
      } else {
        // Last question: award XP once based on final score
        updateXP(updatedScore);
        setFinalScore(updatedScore);
        setShowCompletionModal(true);
      }

      return updatedScore;
    });
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

          <div style={{ marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleWolframExplain}
              disabled={wolframLoading}
            >
              {wolframLoading
                ? t('quiz.wolframLoading')
                : t('quiz.wolframButton')}
            </button>
            {wolframError && (
              <p
                className="helper-text"
                style={{ color: '#fb7185', marginTop: '0.5rem' }}
              >
                {wolframError}
              </p>
            )}
          </div>
        </section>

        {wolframHistory.length > 0 && (
          <section className="card" style={{ marginTop: '1.5rem' }}>
            <div className="card-header">
              <h2 className="card-title">{t('quiz.wolframHistoryTitle')}</h2>
              <p className="card-subtitle">
                {t('quiz.wolframHistorySubtitle')}
              </p>
            </div>
            <div className="wolfram-history">
              {wolframHistory.map((entry, idx) => (
                <div
                  key={idx}
                  className="wolfram-entry"
                  style={{ marginBottom: '1rem' }}
                >
                  <p className="wolfram-question">
                    <strong>{t('quiz.wolframQuestionLabel')}</strong> {entry.question}
                  </p>
                  <p className="wolfram-result">
                    <strong>{t('quiz.wolframResultLabel')}</strong>{' '}
                    {entry.primaryResult || t('quiz.wolframNoResult')}
                  </p>
                  {entry.explanations.length > 0 && (
                    <ul className="wolfram-explanations">
                      {entry.explanations.map((exp, i) => (
                        <li key={i}>
                          <strong>{exp.title} :</strong> {exp.plaintext}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <Modal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        title={t('quiz.quizCompletionTitle')}
        message={t('quiz.quizCompletionMessage', { score: finalScore })}
        icon="✨"
        buttonText={t('quiz.quizCompletionButton')}
        buttonAction={() => {
          setShowCompletionModal(false);
          navigate('/dashboard');
        }}
      />
    </div>
  );
};

export default QuizPage;
