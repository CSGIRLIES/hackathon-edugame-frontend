import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUser } from '../contexts/UserContext.tsx';
import Animal from '../components/Animal.tsx';
import Modal from '../components/Modal.tsx';

const LearningPage: React.FC = () => {
  const { t } = useTranslation();
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

  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [sessionXP, setSessionXP] = useState(0);

  const [checkedTasks, setCheckedTasks] = useState<boolean[]>([false, false, false]);

  const { user, updateXP, updateStreak } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    let timer: number;
    if (isWorking && !isPaused && timeLeft > 0) {
      timer = window.setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (isWorking && timeLeft === 0) {
      const xpGained = 25; // 25 minutes = 25 XP
      updateXP(xpGained);
      updateStreak(); // Update streak when session completes
      setSessionXP(xpGained);
      setShowCompletionModal(true);
    }
    return () => window.clearTimeout(timer);
  }, [timeLeft, isWorking, isPaused, updateXP, updateStreak, user]);

  const handleStart = () => {
    if (topic.trim()) {
      setIsWorking(true);
      setIsPaused(false);
      setTimeLeft(25 * 60);
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
        <h1 className="page-title">{t('learning.title')}</h1>
        <p className="page-subtitle">
          {t('learning.subtitle')}
        </p>
      </header>

      <main className="layout-grid">
        <section className="card learning-card">
          {!isWorking && (
            <>
              <div className="card-header">
                <h2 className="card-title">{t('learning.prepareTitle')}</h2>
                <p className="card-subtitle">
                  {t('learning.prepareSubtitle')}
                </p>
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="topic">
                  {t('learning.topicLabel')}
                </label>
                <textarea
                  id="topic"
                  className="textarea"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={t('learning.topicPlaceholder')}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">{t('learning.modeLabel')}</label>
                <label className="helper-text">
                  <input
                    type="checkbox"
                    checked={usePomodoro}
                    onChange={() => setUsePomodoro(!usePomodoro)}
                    style={{ marginRight: 8 }}
                  />
                  {t('learning.pomodoroMode')}
                </label>
              </div>

              <div className="btn-row" style={{ marginTop: '1.25rem' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleStart}
                  disabled={!topic.trim()}
                >
                  {t('learning.startSession')}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/dashboard')}
                >
                  {t('learning.backToDashboard')}
                </button>
              </div>
            </>
          )}

          {isWorking && (
            <>
              <div className="card-header" style={{ marginBottom: '1rem' }}>
                <h2 className="card-title">{t('learning.focusingOn', { topic })}</h2>
                <p className="card-subtitle">
                  {t('learning.focusSubtitle')}
                </p>
              </div>

              <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                <div className="timer-display">{formatTime(timeLeft)}</div>
                <div className="progress-track" style={{ marginTop: '0.75rem' }}>
                  <div className="progress-bar" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div style={{ 
                background: 'rgba(56, 189, 248, 0.1)', 
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '0.75rem',
                padding: '1rem',
                marginBottom: '1.25rem',
                textAlign: 'left'
              }}>
                <h3 style={{ 
                  fontSize: '0.9rem', 
                  color: 'var(--accent-blue)', 
                  marginBottom: '0.75rem',
                  fontWeight: 600
                }}>
                  📚 Plan d'apprentissage
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    'Relire le cours calmement',
                    'Faire 2-3 exercices',
                    'Noter ce que tu dois revoir au prochain cycle'
                  ].map((task, index) => (
                    <label 
                      key={index}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        transition: 'opacity 0.2s ease'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checkedTasks[index]}
                        onChange={() => {
                          const newChecked = [...checkedTasks];
                          newChecked[index] = !newChecked[index];
                          setCheckedTasks(newChecked);
                        }}
                        style={{ 
                          width: '16px', 
                          height: '16px',
                          cursor: 'pointer',
                          accentColor: 'var(--accent-blue)'
                        }}
                      />
                      <span style={{ 
                        textDecoration: checkedTasks[index] ? 'line-through' : 'none',
                        opacity: checkedTasks[index] ? 0.6 : 1
                      }}>
                        {task}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="btn-row">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsPaused((p) => !p)}
                >
                  {isPaused ? t('learning.resume') : t('learning.pause')}
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
                  {t('learning.endWithoutQuiz')}
                </button>
              </div>
            </>
          )}
        </section>

        <section className="card">
          <div className="card-header">
            <h2 className="card-title">{t('learning.companionWatching')}</h2>
            <p className="card-subtitle">
              {t('learning.companionSubtitle', { name: user.animalName })}
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
              {t('learning.uploadTitle')}
            </h3>
            <p className="helper-text">
              {t('learning.uploadSubtitle')}
            </p>
            <div className="input-group" style={{ marginTop: '0.5rem' }}>
              <input type="file" onChange={handleFileChange} />
            </div>
            <div className="btn-row">
              <button type="button" className="btn btn-secondary" onClick={handleUpload}>
                {t('learning.uploadButton')}
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
              {t('learning.planTitle')}
            </h3>
            <p className="helper-text">
              {t('learning.planSubtitle')}
            </p>
            <div className="input-group" style={{ maxWidth: 220, marginTop: '0.5rem' }}>
              <label className="input-label" htmlFor="availableTime">
                {t('learning.planTimeLabel')}
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
                {isPlanLoading ? t('learning.planGenerating') : t('learning.planGenerate')}
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
                  {t('learning.planTotalTime', { time: studyPlan.totalTime, count: studyPlan.pomodoroCount })}
                </p>
                {Array.isArray(studyPlan.cycles) && (
                  <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
                    {studyPlan.cycles.slice(0, 3).map((cycle: any, idx: number) => (
                      <li key={idx} style={{ marginBottom: '0.35rem' }}>
                        <strong>{t('learning.planCycle', { number: cycle.cycleNumber })}</strong> : {cycle.focusTask}
                      </li>
                    ))}
                    {studyPlan.cycles.length > 3 && (
                      <li className="helper-text">{t('learning.planMoreCycles')}</li>
                    )}
                  </ul>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <Modal
        isOpen={showCompletionModal}
        onClose={() => {
          setShowCompletionModal(false);
          setIsWorking(false);
          setCheckedTasks([false, false, false]);
        }}
        title="🎉 Bravo !"
        message={`Tu as terminé une session de 25 minutes ! ${sessionXP} XP gagnés pour ${user.animalName}. C'est l'heure de tester tes connaissances !`}
        icon="🎉"
        buttonText="Commencer le quiz"
        buttonAction={() => {
          setShowCompletionModal(false);
          setIsWorking(false);
          setCheckedTasks([false, false, false]);
          // Small delay to ensure modal closes before navigation
          setTimeout(() => {
            navigate('/quiz', { state: { topic } });
          }, 100);
        }}
      />
    </div>
  );
};

export default LearningPage;
