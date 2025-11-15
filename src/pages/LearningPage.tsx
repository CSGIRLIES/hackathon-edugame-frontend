import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext.tsx';
import Animal from '../components/Animal.tsx';

const LearningPage: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [usePomodoro, setUsePomodoro] = useState(true);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isWorking, setIsWorking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [availableTime, setAvailableTime] = useState<number>(60);
  const [isPlanLoading, setIsPlanLoading] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [studyPlan, setStudyPlan] = useState<any | null>(null);

  const { user, updateXP } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    let timer: number;
    if (isWorking && !isPaused && timeLeft > 0) {
      timer = window.setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (isWorking && timeLeft === 0) {
      const xpGained = 25; // 25 minutes = 25 XP
      updateXP(xpGained);
      alert(`Bravo ! Tu as terminé un focus de 25 min. ${xpGained} XP pour ${user.animalName} ✨`);
      navigate('/quiz');
    }
    return () => window.clearTimeout(timer);
  }, [timeLeft, isWorking, isPaused, updateXP, navigate, user]);

  const handleStart = () => {
    if (topic.trim()) {
      setIsWorking(true);
      setIsPaused(false);
      setTimeLeft(25 * 60);
      alert(
        `Plan d'apprentissage pour ${topic}:\n1. Relire le cours calmement\n2. Faire 2-3 exercices\n3. Noter ce que tu dois revoir au prochain cycle`
      );
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setUploadFile(file);
    setUploadStatus(null);
    setUploadError(null);
  };

  const handleUpload = async () => {
    if (!user) return;
    if (!uploadFile) {
      setUploadError('Choisis un fichier à envoyer.');
      return;
    }

    setUploadStatus(null);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('userId', user.id);
      formData.append('file', uploadFile);

      const res = await fetch('http://localhost:4000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Erreur lors de l\'ingestion du document');
      }

      setUploadStatus(`Document ingéré avec succès (${data.chunksStored} morceaux).`);
    } catch (e: any) {
      console.error('[LearningPage] Upload error', e);
      setUploadError(e.message || 'Impossible d\'ingérer ce document.');
    }
  };

  const handleGeneratePlan = async () => {
    if (!user) return;
    if (!availableTime || availableTime < 10) {
      setPlanError('Donne au moins 10 minutes pour créer un vrai plan.');
      return;
    }

    setIsPlanLoading(true);
    setPlanError(null);
    setStudyPlan(null);

    try {
      const res = await fetch('http://localhost:4000/api/study/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id, availableTime }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Erreur serveur lors de la génération du plan.');
      }

      setStudyPlan(data.studyPlan || data);
    } catch (e: any) {
      console.error('[LearningPage] Study plan error', e);
      setPlanError(e.message || 'Impossible de générer un plan pour le moment.');
    } finally {
      setIsPlanLoading(false);
    }
  };

  if (!user) {
    navigate('/');
    return null;
  }

  const progress = (1 - timeLeft / (25 * 60)) * 100;

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Session d'apprentissage</h1>
        <p className="page-subtitle">
          On se concentre ensemble pendant 25 minutes, puis ton compagnon te propose un quiz pour vérifier que tout est bien assimilé.
        </p>
      </header>

      <main className="layout-grid">
        <section className="card learning-card">
          <div className="card-header">
            <h2 className="card-title">Prépare ta session</h2>
            <p className="card-subtitle">
              Décris ce que tu vas réviser. Le quiz de fin utilisera ce contexte.
            </p>
          </div>

          {!isWorking && (
            <>
              <div className="input-group">
                <label className="input-label" htmlFor="topic">
                  Ton cours / chapitre
                </label>
                <textarea
                  id="topic"
                  className="textarea"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Ex : Chapitre sur les fonctions affines, ou copier un extrait de ton cours"
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Mode</label>
                <label className="helper-text">
                  <input
                    type="checkbox"
                    checked={usePomodoro}
                    onChange={() => setUsePomodoro(!usePomodoro)}
                    style={{ marginRight: 8 }}
                  />
                  Utiliser le mode pomodoro (25 min focus / 5 min pause)
                </label>
              </div>

              <div className="btn-row" style={{ marginTop: '1.25rem' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleStart}
                  disabled={!topic.trim()}
                >
                  Lancer la session
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/dashboard')}
                >
                  Retour au tableau de bord
                </button>
              </div>
            </>
          )}

          {isWorking && (
            <>
              <div className="card-header" style={{ marginBottom: '1rem' }}>
                <h2 className="card-title">En plein focus sur : {topic}</h2>
                <p className="card-subtitle">
                  Quand le temps est écoulé, tu passes automatiquement sur un quiz.
                </p>
              </div>

              <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                <div className="timer-display">{formatTime(timeLeft)}</div>
                <div className="progress-track" style={{ marginTop: '0.75rem' }}>
                  <div className="progress-bar" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="btn-row">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsPaused((p) => !p)}
                >
                  {isPaused ? 'Reprendre' : 'Mettre en pause'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setIsWorking(false);
                    setIsPaused(false);
                    setTimeLeft(25 * 60);
                  }}
                >
                  Terminer sans quiz
                </button>
              </div>
            </>
          )}
        </section>

        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Ton compagnon te regarde travailler</h2>
            <p className="card-subtitle">
              {user.animalName} observe ta progression et t'encourage pendant toute la session.
            </p>
          </div>

          <Animal
            type={user.animalType}
            color={user.animalColor}
            level={user.level}
            xp={user.xp}
            context={isWorking ? 'learning' : 'break'}
          />

          <div style={{ marginTop: '1.5rem' }}>
            <h3 className="card-title" style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
              Ajouter tes documents de cours
            </h3>
            <p className="helper-text">
              Tu peux envoyer un PDF / DOCX / image, il sera découpé en petits morceaux pour que l'IA crée des quiz et des plans d'étude plus précis.
            </p>
            <div className="input-group" style={{ marginTop: '0.5rem' }}>
              <input type="file" onChange={handleFileChange} />
            </div>
            <div className="btn-row">
              <button type="button" className="btn btn-secondary" onClick={handleUpload}>
                Envoyer le document
              </button>
            </div>
            {uploadStatus && (
              <p className="helper-text" style={{ color: '#4ade80' }}>
                {uploadStatus}
              </p>
            )}
            {uploadError && (
              <p className="helper-text" style={{ color: '#fb7185' }}>
                {uploadError}
              </p>
            )}
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <h3 className="card-title" style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
              Plan d'étude personnalisé
            </h3>
            <p className="helper-text">
              Dis combien de minutes tu as aujourd'hui et l'IA crée un planning Pomodoro + quiz à partir de tes documents.
            </p>
            <div className="input-group" style={{ maxWidth: 220, marginTop: '0.5rem' }}>
              <label className="input-label" htmlFor="availableTime">
                Temps disponible (minutes)
              </label>
              <input
                id="availableTime"
                className="input"
                type="number"
                min={10}
                value={availableTime}
                onChange={(e) => setAvailableTime(parseInt(e.target.value || '0', 10))}
              />
            </div>
            <div className="btn-row">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleGeneratePlan}
                disabled={isPlanLoading}
              >
                {isPlanLoading ? 'Génération en cours...' : 'Générer mon plan'}
              </button>
            </div>
            {planError && (
              <p className="helper-text" style={{ color: '#fb7185' }}>
                {planError}
              </p>
            )}
            {studyPlan && (
              <div style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
                <p className="helper-text">
                  Temps total : {studyPlan.totalTime} min • Cycles : {studyPlan.pomodoroCount}
                </p>
                {Array.isArray(studyPlan.cycles) && (
                  <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
                    {studyPlan.cycles.slice(0, 3).map((cycle: any, idx: number) => (
                      <li key={idx} style={{ marginBottom: '0.35rem' }}>
                        <strong>Cycle {cycle.cycleNumber}</strong> : {cycle.focusTask}
                      </li>
                    ))}
                    {studyPlan.cycles.length > 3 && (
                      <li className="helper-text">(... d'autres cycles sont disponibles dans la réponse brute)</li>
                    )}
                  </ul>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default LearningPage;
