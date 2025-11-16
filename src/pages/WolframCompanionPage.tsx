import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface WolframExplanation {
  title: string;
  plaintext: string;
}

interface WolframResult {
  input: string;
  primaryResult: string;
  explanations: WolframExplanation[];
}

const THEME_OPTIONS = [
  'Core Language & Structure',
  'Data Manipulation & Analysis',
  'Visualization & Graphics',
  'Machine Learning & LLMs',
  'Symbolic & Numeric Computation',
  'Higher Mathematical Computation',
  'Strings & Text',
  'Graphs & Networks',
  'Images',
  'Geometry',
  'Sound & Video',
  'Knowledge Representation & Natural Language',
  'Time-Related Computation',
  'Geographic Data & Computation',
  'Scientific and Medical Data & Computation',
  'Engineering Data & Computation',
  'Financial Data & Computation',
  'Social, Cultural & Linguistic Data',
  'Notebook Documents & Presentation',
  'User Interface Construction',
  'System Operation & Setup',
  'External Interfaces & Connections',
  'Cloud & Deployment',
];

const WolframCompanionPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';
  const [theme, setTheme] = useState<string>('Core Language & Structure');
  const [task, setTask] = useState<string>('');
  const [details, setDetails] = useState<string>('');
  const [wolframInput, setWolframInput] = useState<string>('');
  const [result, setResult] = useState<WolframResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      let input = wolframInput.trim();

      // Si l'élève n'a PAS fourni de code Wolfram, on demande à Mistral
      // de générer une requête wolframInput à partir du thème + tâche + détails.
      if (!input) {
        const assistRes = await fetch('http://localhost:4000/api/wolfram/assist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ theme, task, details }),
        });

        if (!assistRes.ok) {
          const data = await assistRes.json().catch(() => ({}));
          throw new Error(data.error || "Erreur lors de la génération du code Wolfram");
        }

        const assistData = await assistRes.json();
        if (!assistData.wolframInput || !assistData.wolframInput.trim()) {
          throw new Error("Impossible de générer une requête Wolfram adaptée.");
        }

        input = assistData.wolframInput.trim();
        // On affiche le code généré dans le champ pour que l'élève puisse le voir/apprendre.
        setWolframInput(input);
      }

      if (!input.trim()) {
        throw new Error('Merci de remplir au moins une tâche ou une requête Wolfram.');
      }

      const res = await fetch('http://localhost:4000/api/wolfram/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Erreur lors de l\'appel à Wolfram');
      }

      const data = await res.json();
      setResult({
        input: data.input,
        primaryResult: data.primaryResult,
        explanations: data.explanations || [],
      });
    } catch (e: any) {
      console.error('[WolframCompanion] Error:', e);
      setError(e.message || 'Erreur inconnue lors de la consultation Wolfram.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">{t('wolfram.title')}</h1>
        <p className="page-subtitle">
          {t('wolfram.subtitle')}
        </p>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate('/dashboard')}
        >
          {t('wolfram.backToDashboard')}
        </button>
      </header>

      <main>
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">{t('wolfram.step1Title')}</h2>
            <p className="card-subtitle">
              {t('wolfram.step1Subtitle')}
            </p>
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="wolfram-theme">{t('wolfram.themeLabel')}</label>
            <select
              id="wolfram-theme"
              className="select"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              {THEME_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="card" style={{ marginTop: '1.5rem' }}>
          <div className="card-header">
            <h2 className="card-title">{t('wolfram.step2Title')}</h2>
            <p className="card-subtitle">
              {t('wolfram.step2Subtitle')}
            </p>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="wolfram-task">
              {t('wolfram.taskLabel')}
            </label>
            <input
              id="wolfram-task"
              className="input"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder={t('wolfram.taskPlaceholder')}
              dir={isRTL ? 'rtl' : 'ltr'}
              style={{ textAlign: isRTL ? 'right' : 'left' }}
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="wolfram-details">
              {t('wolfram.detailsLabel')}
            </label>
            <textarea
              id="wolfram-details"
              className="textarea"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={t('wolfram.detailsPlaceholder')}
              dir={isRTL ? 'rtl' : 'ltr'}
              style={{ textAlign: isRTL ? 'right' : 'left' }}
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="wolfram-input">
              {t('wolfram.inputLabel')}
            </label>
            <input
              id="wolfram-input"
              className="input"
              value={wolframInput}
              onChange={(e) => setWolframInput(e.target.value)}
              placeholder={t('wolfram.inputPlaceholder')}
              dir="ltr"
              style={{ textAlign: 'left' }}
            />
            <p className="helper-text">
              {t('wolfram.inputHelper')}
            </p>
          </div>

          <div className="btn-row" style={{ marginTop: '1.25rem' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleRun}
              disabled={isLoading}
            >
              {isLoading ? t('wolfram.querying') : t('wolfram.queryButton')}
            </button>
          </div>

          {error && (
            <p className="helper-text" style={{ color: '#fb7185', marginTop: '1rem' }}>
              {error}
            </p>
          )}
        </section>

        {result && (
          <section className="card" style={{ marginTop: '1.5rem' }}>
            <div className="card-header">
              <h2 className="card-title">{t('wolfram.resultTitle')}</h2>
              <p className="card-subtitle">
                {t('wolfram.resultSubtitle')}
              </p>
            </div>

            <div className="wolfram-result-block" style={{ padding: '1rem' }}>
              <p>
                <strong>{t('wolfram.querySent')}</strong> {result.input}
              </p>
              <p style={{ marginTop: '0.5rem' }}>
                <strong>{t('wolfram.primaryResult')}</strong> {result.primaryResult || t('wolfram.noResult')}
              </p>

              {result.explanations.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <h3 className="card-title" style={{ fontSize: '1rem' }}>{t('wolfram.detailedExplanations')}</h3>
                  <ul className="wolfram-explanations">
                    {result.explanations.map((exp, idx) => (
                      <li key={idx}>
                        <strong>{exp.title} :</strong> {exp.plaintext}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default WolframCompanionPage;
