import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface ThemeData {
  themes: {
    [theme: string]: {
      [subTheme: string]: {
        [difficulty: string]: {
          id: string;
          title: string;
          description: string;
        };
      };
    };
  };
}

const QuizThemesPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [themeData, setThemeData] = useState<ThemeData | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<string>('Mathématiques');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('beginner');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translateSubject = (subject: string) => {
    const key = `quizThemes.subjects.${subject}`;
    const translated = t(key);
    // Si la clé n'existe pas, t() retourne la clé elle-même, donc on retourne le sujet original
    return translated === key ? subject : translated;
  };

  const translateSubTheme = (subTheme: string) => {
    const key = `quizThemes.subThemes.${subTheme}`;
    const translated = t(key);
    return translated === key ? subTheme : translated;
  };

  const translateQuizTitle = (title: string) => {
    const key = `quizThemes.quizTitles.${title}`;
    const translated = t(key);
    return translated === key ? title : translated;
  };

  const translateQuizDescription = (description: string) => {
    const key = `quizThemes.quizDescriptions.${description}`;
    const translated = t(key);
    return translated === key ? description : translated;
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return t('quizThemes.difficultyBeginner');
      case 'intermediate':
        return t('quizThemes.difficultyIntermediate');
      case 'advanced':
        return t('quizThemes.difficultyAdvanced');
      case 'pro':
        return t('quizThemes.difficultyPro');
      default:
        return difficulty;
    }
  };

  useEffect(() => {
    loadThemeData();
  }, []);

  const loadThemeData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:4000/api/quiz/themes');

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Erreur serveur');
      }

      const data = await res.json();
      // Backend retourne { status: 'success', themes }
      setThemeData({ themes: data.themes });
    } catch (e: any) {
      console.error('Failed to load theme data', e);
      setError(e.message || 'Erreur de chargement des thèmes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartThemedQuiz = async (themeId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:4000/api/quiz/from-theme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          themeId,
          numQuestions: 3,
          language: i18n.language,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Erreur serveur');
      }

      const data = await res.json();
      const questions = data.questions || [];

      if (!questions.length) {
        throw new Error("L'IA n'a pas réussi à générer des questions.");
      }

      const backendThemeData = data.themeData || {};

      navigate('/quiz', {
        state: {
          themedQuiz: true,
          themeId,
          themeData: backendThemeData,
          questions,
        },
      });
    } catch (e: any) {
      console.error('Failed to start themed quiz', e);
      setError(e.message || 'Impossible de générer le quiz, réessaie plus tard.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!themeData) {
    return (
      <div className="page">
        <div className="loading-spinner" style={{ textAlign: 'center', padding: '2rem' }}>
          {isLoading ? t('quizThemes.loadingThemes') : error || t('quizThemes.loadingError')}
        </div>
      </div>
    );
  }

  const themes = Object.keys(themeData.themes);

  // Si le thème sélectionné n'existe pas (par ex. au premier chargement),
  // on prend le premier disponible.
  const effectiveSelectedTheme =
    selectedTheme && themeData.themes[selectedTheme]
      ? selectedTheme
      : themes[0];

  const selectedThemeData = themeData.themes[effectiveSelectedTheme];
  const subThemes = Object.keys(selectedThemeData || {});

  const difficulties = ['beginner', 'intermediate', 'advanced', 'pro'];

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">{t('quizThemes.title')}</h1>
        <p className="page-subtitle">
          {t('quizThemes.subtitle')}
        </p>
      </header>

      <main>
        {/* Theme Selection */}
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">{t('quizThemes.mainSubject')}</h2>
          </div>
          <div className="theme-tabs">
            {themes.map((theme) => (
              <button
                key={theme}
                type="button"
                className={`theme-tab ${effectiveSelectedTheme === theme ? 'active' : ''}`}
                onClick={() => setSelectedTheme(theme)}
              >
                {translateSubject(theme)}
              </button>
            ))}
          </div>
        </section>

        {/* Difficulty Selection */}
        <section className="card" style={{ marginTop: '1.5rem' }}>
          <div className="card-header">
            <h2 className="card-title">{t('quizThemes.difficultyLevel')}</h2>
          </div>
          <div className="btn-row">
            {difficulties.map((difficulty) => (
              <button
                key={difficulty}
                type="button"
                className={`btn ${selectedDifficulty === difficulty ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedDifficulty(difficulty)}
              >
                {getDifficultyLabel(difficulty)}
              </button>
            ))}
          </div>
        </section>

        {/* Quiz Selection */}
        <section className="card" style={{ marginTop: '1.5rem' }}>
          <div className="card-header">
            <h2 className="card-title">{t('quizThemes.availableQuizzes')}</h2>
            <p className="card-subtitle">{t('quizThemes.selectQuiz')}</p>
          </div>

          <div className="quiz-grid">
            {subThemes.map((subTheme) => {
              const difficultyQuizzes = selectedThemeData[subTheme];
              const quiz = difficultyQuizzes?.[selectedDifficulty];

              if (!quiz) return null;

              return (
                <div
                  key={`${subTheme}-${selectedDifficulty}`}
                  className="quiz-card"
                >
                  <div className="quiz-card-header">
                    <h3 className="quiz-card-title">{translateQuizTitle(quiz.title)}</h3>
                    <span className={`difficulty-badge difficulty-${selectedDifficulty}`}>
                      {getDifficultyLabel(selectedDifficulty)}
                    </span>
                  </div>
                  <p className="quiz-card-subtitle">{translateSubTheme(subTheme)}</p>
                  <p className="quiz-card-description">{translateQuizDescription(quiz.description)}</p>
                  <button
                    type="button"
                    className="btn btn-primary quiz-start-btn"
                    onClick={() => handleStartThemedQuiz(quiz.id)}
                    disabled={isLoading}
                  >
                    {isLoading ? t('quizThemes.generating') : t('quizThemes.startQuiz')}
                  </button>
                </div>
              );
            })}
          </div>

          {error && (
            <p
              className="helper-text"
              style={{ color: '#fb7185', marginTop: '1rem' }}
            >
              {error}
            </p>
          )}
        </section>

        <div
          className="btn-row"
          style={{ justifyContent: 'center', marginTop: '2rem' }}
        >
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/dashboard')}
          >
            {t('quizThemes.backToDashboard')}
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate('/quiz')}
          >
            {t('quizThemes.customQuiz')}
          </button>
        </div>
      </main>
    </div>
  );
};

export default QuizThemesPage;
