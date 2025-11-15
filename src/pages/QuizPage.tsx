import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext.tsx';

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

  // Par défaut, on renvoie le texte original
  return questionText;
};

const QuizPage: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [wolframHistory, setWolframHistory] = useState<WolframHistoryEntry[]>([]);
  const [wolframLoading, setWolframLoading] = useState(false);
  const [wolframError, setWolframError] = useState<string | null>(null);

  const { updateXP } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  // Check for themed quiz data in location state
  useEffect(() => {
    if (location.state?.themedQuiz) {
      const { themeData, questions: themedQuestions } = location.state as any;
      setTopic(`${themeData.theme} - ${themeData.subTheme} (${themeData.title})`);
      setQuestions(themedQuestions);
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

          <div style={{ marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleWolframExplain}
              disabled={wolframLoading}
            >
              {wolframLoading
                ? 'Consultation Wolfram...'
                : 'Voir l’explication par Wolfram'}
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
              <h2 className="card-title">Historique des explications Wolfram</h2>
              <p className="card-subtitle">
                Résultats et explications renvoyés par Wolfram Alpha pour tes questions.
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
                    <strong>Question :</strong> {entry.question}
                  </p>
                  <p className="wolfram-result">
                    <strong>Résultat Wolfram :</strong>{' '}
                    {entry.primaryResult || 'Pas de résultat clair renvoyé.'}
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
    </div>
  );
};

export default QuizPage;
