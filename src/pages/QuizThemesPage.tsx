import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

// Embedded theme data since we're using Wolfram Alpha directly
const THEME_PROMPTS = {
  'math-algebra-beginner': {
    theme: 'Mathématiques',
    subTheme: 'Algèbre',
    difficulty: 'beginner',
    title: 'Les bases de l\'algèbre',
    description: 'Résoudre des équations simples, comprendre les variables et les termes algébriques',
    prompt: `Génère un quiz sur les bases de l'algèbre en collège : équations simples, variables, coefficients, termes algébriques.`
  },
  'math-algebra-intermediate': {
    theme: 'Mathématiques',
    subTheme: 'Algèbre',
    difficulty: 'intermediate',
    title: 'Équations du premier degré',
    description: 'Équations avec parenthèses, fractions et inéquations',
    prompt: `Génère un quiz sur les équations du premier degré : résolutions d'équations avec parenthèses, fractions et inéquations.`
  },
  'math-geometry-beginner': {
    theme: 'Mathématiques',
    subTheme: 'Géométrie',
    difficulty: 'beginner',
    title: 'Figures géométriques de base',
    description: 'Noms et propriétés des formes planes et solides',
    prompt: `Génère un quiz sur les figures géométriques de base : carrés, triangles, cercles, cubes, pyramides et leurs propriétés.`
  },
  'sciences-biology-beginner': {
    theme: 'Sciences',
    subTheme: 'Biologie',
    difficulty: 'beginner',
    title: 'Le monde du vivant',
    description: 'Découvrez les bases de la biologie et l\'organisation du vivant',
    prompt: `Génère un quiz sur les bases de la biologie : cellules, tissus, organes, systèmes et photosynthèse.`
  },
  'sciences-chemistry-beginner': {
    theme: 'Sciences',
    subTheme: 'Chimie',
    difficulty: 'beginner',
    title: 'Éléments et atomes',
    description: 'Comprends la composition de la matière',
    prompt: `Génère un quiz sur les atomes et les éléments : structure atomique, tableau périodique, liaisons chimiques.`
  },
  'sciences-physics-beginner': {
    theme: 'Sciences',
    subTheme: 'Physique',
    difficulty: 'beginner',
    title: 'Les lois de Newton',
    description: 'Comprends les principes fondamentaux de la physique',
    prompt: `Génère un quiz sur les lois de Newton : première, deuxième et troisième loi, force, masse et accélération.`
  },
  'history-ancient-beginner': {
    theme: 'Histoire',
    subTheme: 'Antiquité',
    difficulty: 'beginner',
    title: 'Les civilisations anciennes',
    description: 'Voyage dans le temps vers l\'Antiquité',
    prompt: `Génère un quiz sur les civilisations antiques : Égypte pharaonique, Grèce antique, Rome antique et leurs inventions.`
  },
  'geography-maps-beginner': {
    theme: 'Géographie',
    subTheme: 'Cartes',
    difficulty: 'beginner',
    title: 'Lire une carte',
    description: 'Apprends à t\'orienter avec les cartes',
    prompt: `Génère un quiz sur la lecture de cartes : points cardinaux, échelle, légendes et courbes de niveau.`
  },
  'languages-vocabulary-beginner': {
    theme: 'Langues',
    subTheme: 'Vocabulaire',
    difficulty: 'beginner',
    title: 'Enrichis ton vocabulaire',
    description: 'Apprends de nouveaux mots en français',
    prompt: `Génère un quiz de vocabulaire français niveau collège : synonymes, antonymes, familles de mots et orthographe.`
  }
};

const getThemeData = (themeId: string) => {
  return THEME_PROMPTS[themeId as keyof typeof THEME_PROMPTS];
};

const getThemesByCategory = () => {
  const themes: any = {};
  Object.entries(THEME_PROMPTS).forEach(([id, data]) => {
    if (!themes[data.theme]) {
      themes[data.theme] = {};
    }
    if (!themes[data.theme][data.subTheme]) {
      themes[data.theme][data.subTheme] = {};
    }
    themes[data.theme][data.subTheme][data.difficulty] = {
      id,
      title: data.title,
      description: data.description
    };
  });
  return themes;
};

const QuizThemesPage: React.FC = () => {
  const navigate = useNavigate();
  const [themeData, setThemeData] = useState<ThemeData | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<string>('Mathématiques');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('beginner');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadThemeData();
  }, []);

  const loadThemeData = () => {
    try {
      setIsLoading(true);
      const themes = getThemesByCategory();
      setThemeData({ themes });
    } catch (e: any) {
      console.error('Failed to load theme data', e);
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartThemedQuiz = async (themeId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const themeData = getThemeData(themeId);
      if (!themeData) {
        throw new Error('Thème non trouvé');
      }

      // Generate quiz using Wolfram Alpha API directly
      const questions = await generateQuizWithWolframAlpha(themeData);

      // Navigate to quiz page with themed questions
      navigate('/quiz', {
        state: {
          themedQuiz: true,
          themeId,
          themeData,
          questions
        }
      });
    } catch (e: any) {
      console.error('Failed to start themed quiz', e);
      setError(e.message || 'Impossible de générer le quiz, réessaie plus tard.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateQuizWithWolframAlpha = async (themeData: any) => {
    const WOLFRAM_APPID = 'UVWUVAV38';
    const numQuestions = 3;

    // Create a prompt that asks Wolfram Alpha to generate quiz questions
    const prompt = `${themeData.prompt} Génère ${numQuestions} questions à choix multiples en français avec 4 options chacune et indique la réponse correcte. Format: question|optionA|optionB|optionC|optionD|correctIndex`;

    try {
      const response = await fetch(`https://api.wolframalpha.com/v2/query?appid=${WOLFRAM_APPID}&input=${encodeURIComponent(prompt)}&output=JSON`);

      if (!response.ok) {
        throw new Error('Erreur lors de l\'appel à Wolfram Alpha');
      }

      const data = await response.json();

      // Parse Wolfram Alpha response to extract questions
      // This is a simplified parsing - Wolfram Alpha's response structure can vary
      if (data.queryresult && data.queryresult.pods) {
        const questions: any[] = [];

        // Try to find relevant information in the response
        for (const pod of data.queryresult.pods) {
          if (pod.subpods && pod.subpods[0] && pod.subpods[0].plaintext) {
            const content = pod.subpods[0].plaintext;

            // Parse the content to extract questions
            // This is a basic implementation - you may need to adjust based on actual responses
            const lines = content.split('\n').filter(line => line.trim());

            for (let i = 0; i < Math.min(lines.length, numQuestions); i++) {
              const line: string = lines[i];
              // Parse line format: question|optionA|optionB|optionC|optionD|correctIndex
              const parts = line.split('|');
              if (parts.length >= 6) {
                questions.push({
                  question: parts[0],
                  options: [parts[1], parts[2], parts[3], parts[4]],
                  correct: parseInt(parts[5]) || 0
                });
              }
            }
          }
        }

        if (questions.length === 0) {
          // Fallback: create basic questions if parsing fails
          return createFallbackQuestions(themeData, numQuestions);
        }

        return questions;
      } else {
        // Fallback if Wolfram Alpha doesn't return expected structure
        return createFallbackQuestions(themeData, numQuestions);
      }

    } catch (error) {
      console.error('Wolfram Alpha API error:', error);
      // Fallback to basic questions
      return createFallbackQuestions(themeData, numQuestions);
    }
  };

  const createFallbackQuestions = (themeData: any, numQuestions: number) => {
    // Create basic fallback questions when Wolfram Alpha fails
    const questions = [];

    for (let i = 0; i < numQuestions; i++) {
      questions.push({
        question: `Question ${i + 1} sur ${themeData.title}`,
        options: [
          'Réponse A',
          'Réponse B',
          'Réponse C',
          'Réponse D'
        ],
        correct: 0
      });
    }

    return questions;
  };

  if (!themeData) {
    return (
      <div className="page">
        <div className="loading-spinner" style={{ textAlign: 'center', padding: '2rem' }}>
          {isLoading ? 'Chargement des thèmes...' : error || 'Erreur de chargement'}
        </div>
      </div>
    );
  }

  const themes = Object.keys(themeData.themes);
  const selectedThemeData = themeData.themes[selectedTheme];
  const subThemes = Object.keys(selectedThemeData || {});

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Thèmes de Quiz ✨</h1>
        <p className="page-subtitle">
          Choisis un thème et un niveau de difficulté pour commencer ton quiz pédagogique.
        </p>
      </header>

      <main>
        {/* Theme Selection */}
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Matière principale</h2>
          </div>
          <div className="theme-tabs">
            {themes.map(theme => (
              <button
                key={theme}
                type="button"
                className={`theme-tab ${selectedTheme === theme ? 'active' : ''}`}
                onClick={() => setSelectedTheme(theme)}
              >
                {theme}
              </button>
            ))}
          </div>
        </section>

        {/* Difficulty Selection */}
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Niveau de difficulté</h2>
          </div>
          <div className="btn-row">
            {['beginner', 'intermediate', 'advanced'].map(difficulty => (
              <button
                key={difficulty}
                type="button"
                className={`btn ${selectedDifficulty === difficulty ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedDifficulty(difficulty)}
              >
                {difficulty === 'beginner' ? 'Débutant' :
                 difficulty === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
              </button>
            ))}
          </div>
        </section>

        {/* Quiz Selection */}
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Quiz disponibles</h2>
            <p className="card-subtitle">Sélectionne le quiz que tu veux faire</p>
          </div>

          <div className="quiz-grid">
            {subThemes.map(subTheme => {
              const difficultyQuizzes = selectedThemeData[subTheme];
              const quiz = difficultyQuizzes?.[selectedDifficulty];

              if (!quiz) return null;

              return (
                <div key={`${subTheme}-${selectedDifficulty}`} className="quiz-card">
                  <div className="quiz-card-header">
                    <h3 className="quiz-card-title">{quiz.title}</h3>
                    <span className={`difficulty-badge difficulty-${selectedDifficulty}`}>
                      {selectedDifficulty === 'beginner' ? 'Débutant' :
                       selectedDifficulty === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
                    </span>
                  </div>
                  <p className="quiz-card-subtitle">{subTheme}</p>
                  <p className="quiz-card-description">{quiz.description}</p>
                  <button
                    type="button"
                    className="btn btn-primary quiz-start-btn"
                    onClick={() => handleStartThemedQuiz(quiz.id)}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Génération...' : 'Commencer le quiz'}
                  </button>
                </div>
              );
            })}
          </div>

          {error && (
            <p className="helper-text" style={{ color: '#fb7185', marginTop: '1rem' }}>
              {error}
            </p>
          )}
        </section>

        <div className="btn-row" style={{ justifyContent: 'center', marginTop: '2rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/dashboard')}
          >
            Retour au tableau de bord
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate('/quiz')}
          >
            Quiz personnalisé
          </button>
        </div>
      </main>


    </div>
  );
};

export default QuizThemesPage;
