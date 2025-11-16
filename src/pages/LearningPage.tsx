import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUser } from '../contexts/UserContext.tsx';
import Animal from '../components/Animal.tsx';
import Modal from '../components/Modal.tsx';

const LearningPage: React.FC = () => {
  const { t } = useTranslation();
  const [topic, setTopic] = useState('');
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
  const [showPlanModal, setShowPlanModal] = useState(false);
  
  // Cycle execution state
  const [activePlan, setActivePlan] = useState<any | null>(null);
  const [currentCycleIndex, setCurrentCycleIndex] = useState(0);
  const [isInBreak, setIsInBreak] = useState(false);

  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [sessionXP, setSessionXP] = useState(0);

  const [checkedTasks, setCheckedTasks] = useState<boolean[]>([false, false, false]);

  const { user, updateXP, updateStreak, incrementLearningCycle } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    let timer: number;
    if (isWorking && !isPaused && timeLeft > 0) {
      timer = window.setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (isWorking && timeLeft === 0) {
      // Play completion sound
      try {
        const audio = new Audio('/completion.mp3');
        audio.volume = 0.3;
        audio.play().catch((err) => {
          if (process.env.NODE_ENV === 'development') {
            console.info('[LearningPage] Completion sound play blocked:', err);
          }
        });
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.info('[LearningPage] Completion sound error:', err);
        }
      }

      // Handle cycle-based or single session completion
      if (activePlan && activePlan.cycles) {
        handleCycleCompletion();
      } else {
        // Single session mode
        const xpGained = 25;
        updateXP(xpGained);
        updateStreak();
        incrementLearningCycle();
        setSessionXP(xpGained);
        setShowCompletionModal(true);
      }
    }
    return () => window.clearTimeout(timer);
  }, [timeLeft, isWorking, isPaused, activePlan, currentCycleIndex, isInBreak, updateXP, updateStreak, user]);

  const handleCycleCompletion = () => {
    if (!activePlan || !activePlan.cycles) return;

    const currentCycle = activePlan.cycles[currentCycleIndex];

    if (!isInBreak) {
      // Just finished focus session - award XP
      const xpGained = 25;
      updateXP(xpGained);
      incrementLearningCycle();

      // Check if this was the last cycle
      if (currentCycleIndex === activePlan.cycles.length - 1) {
        // Last cycle complete - show final completion
        updateStreak();
        setSessionXP(activePlan.pomodoroCount * 25);
        setIsWorking(false);
        setActivePlan(null);
        setCurrentCycleIndex(0);
        setIsInBreak(false);
        setShowCompletionModal(true);
      } else {
        // Start break
        setIsInBreak(true);
        setTimeLeft((currentCycle.breakMinutes || 5) * 60);
        setCheckedTasks([false, false, false]);
      }
    } else {
      // Break finished - move to next cycle
      setIsInBreak(false);
      setCurrentCycleIndex(prev => prev + 1);
      setTimeLeft(25 * 60); // Next focus session
      setCheckedTasks([false, false, false]);
    }
  };

  const startStudyPlan = () => {
    if (!studyPlan || !studyPlan.cycles || studyPlan.cycles.length === 0) return;
    
    setActivePlan(studyPlan);
    setCurrentCycleIndex(0);
    setIsInBreak(false);
    setIsWorking(true);
    setIsPaused(false);
    setTimeLeft(25 * 60);
    setCheckedTasks([false, false, false]);
    setShowPlanModal(false);
  };

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
      setUploadError(t('learning.uploadChooseFile'));
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
      setPlanError(t('learning.planMinTime'));
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
      setShowPlanModal(true); // Show modal when plan is generated
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
                {activePlan ? (
                  <>
                    <h2 className="card-title">
                      {isInBreak ? '☕ Break Time!' : `🔄 Cycle ${currentCycleIndex + 1} of ${activePlan.pomodoroCount}`}
                    </h2>
                    <p className="card-subtitle">
                      {isInBreak 
                        ? 'Take a break! Stretch, hydrate, and relax.' 
                        : activePlan.cycles[currentCycleIndex]?.focusTask || 'Focus session'}
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="card-title">{t('learning.focusingOn', { topic })}</h2>
                    <p className="card-subtitle">
                      {t('learning.focusSubtitle')}
                    </p>
                  </>
                )}
              </div>

              <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                <div className="timer-display">{formatTime(timeLeft)}</div>
                <div className="progress-track" style={{ marginTop: '0.75rem' }}>
                  <div className="progress-bar" style={{ width: `${progress}%` }} />
                </div>
              </div>

              {!isInBreak && (
                <div style={{ 
                  background: 'rgba(56, 189, 248, 0.1)', 
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  marginBottom: '1.25rem',
                  textAlign: 'left'
                }}>
                  {activePlan && activePlan.cycles[currentCycleIndex] ? (
                    <>
                      <h3 style={{ 
                        fontSize: '0.9rem', 
                        color: 'var(--accent-blue)', 
                        marginBottom: '0.75rem',
                        fontWeight: 600
                      }}>
                        🎯 Cycle {currentCycleIndex + 1} Objectives
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {activePlan.cycles[currentCycleIndex].objectives?.map((objective: string, index: number) => (
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
                              checked={checkedTasks[index] || false}
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
                              {objective}
                            </span>
                          </label>
                        )) || [
                          t('learning.focusEndTask1'),
                          t('learning.focusEndTask2'),
                          t('learning.focusEndTask3')
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
                    </>
                  ) : (
                    <>
                      <h3 style={{ 
                        fontSize: '0.9rem', 
                        color: 'var(--accent-blue)', 
                        marginBottom: '0.75rem',
                        fontWeight: 600
                      }}>
                        {t('learning.focusEndTitle')}
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {[
                          t('learning.focusEndTask1'),
                          t('learning.focusEndTask2'),
                          t('learning.focusEndTask3')
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
                    </>
                  )}
                </div>
              )}

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
                    setActivePlan(null);
                    setCurrentCycleIndex(0);
                    setIsInBreak(false);
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
            <div style={{ marginTop: '0.5rem' }}>
              <label className="input-label" htmlFor="availableTime">
                {t('learning.planTimeLabel')}
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ padding: '0.5rem 0.75rem', fontSize: '1.25rem', lineHeight: 1 }}
                  onClick={() => setAvailableTime(prev => Math.max(30, prev - 30))}
                  disabled={availableTime <= 10}
                >
                  -
                </button>
                <div style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.375rem',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  minWidth: '80px',
                  textAlign: 'center'
                }}>
                  {availableTime} min
                </div>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ padding: '0.5rem 0.75rem', fontSize: '1.25rem', lineHeight: 1 }}
                  onClick={() => setAvailableTime(prev => prev + 30)}
                >
                  +
                </button>
              </div>
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
          </div>
        </section>
      </main>

      {/* Study Plan Modal */}
      {studyPlan && (
        <Modal
          isOpen={showPlanModal}
          onClose={() => setShowPlanModal(false)}
          title="📚 Your Personalized Study Plan"
          message=""
          icon="🎯"
          buttonText="Start Study Plan"
          buttonAction={startStudyPlan}
        >
          <div style={{ textAlign: 'left', maxHeight: '60vh', overflowY: 'auto' }}>
            {/* Summary */}
            <div style={{ 
              padding: '1rem', 
              background: 'rgba(139, 92, 246, 0.1)',
              borderRadius: '0.75rem',
              marginBottom: '1.5rem'
            }}>
              <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.6 }}>
                <strong>📊 Total Time:</strong> {studyPlan.totalTime} minutes<br/>
                <strong>🔄 Pomodoro Cycles:</strong> {studyPlan.pomodoroCount}<br/>
                <strong>⏱️ Per Cycle:</strong> 25 min focus + 5 min break
              </p>
              {studyPlan.summary && (
                <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', opacity: 0.9 }}>
                  {studyPlan.summary}
                </p>
              )}
            </div>

            {/* Cycles */}
            {Array.isArray(studyPlan.cycles) && studyPlan.cycles.map((cycle: any, idx: number) => (
              <div key={idx} style={{
                padding: '1rem',
                background: 'rgba(56, 189, 248, 0.08)',
                borderRadius: '0.75rem',
                marginBottom: '1rem',
                border: '1px solid rgba(56, 189, 248, 0.2)'
              }}>
                <h4 style={{ 
                  margin: '0 0 0.75rem 0', 
                  fontSize: '1rem',
                  color: 'var(--accent-blue)'
                }}>
                  🔄 Cycle {cycle.cycleNumber} ({cycle.focusMinutes || 25} min focus + {cycle.breakMinutes || 5} min break)
                </h4>
                
                <div style={{ marginBottom: '0.75rem' }}>
                  <strong style={{ color: 'var(--text-main)' }}>📖 Focus Task:</strong>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
                    {cycle.focusTask}
                  </p>
                </div>

                {cycle.detailedExplanation && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <strong style={{ color: 'var(--text-main)' }}>💡 What to do:</strong>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', lineHeight: 1.5 }}>
                      {cycle.detailedExplanation}
                    </p>
                  </div>
                )}

                {cycle.objectives && cycle.objectives.length > 0 && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <strong style={{ color: 'var(--text-main)' }}>🎯 Objectives:</strong>
                    <ul style={{ margin: '0.25rem 0 0 0', paddingLeft: '1.5rem', fontSize: '0.85rem' }}>
                      {cycle.objectives.map((obj: string, i: number) => (
                        <li key={i} style={{ marginBottom: '0.25rem' }}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {cycle.keyPoints && cycle.keyPoints.length > 0 && (
                  <div>
                    <strong style={{ color: 'var(--text-main)' }}>🔑 Key Points:</strong>
                    <ul style={{ margin: '0.25rem 0 0 0', paddingLeft: '1.5rem', fontSize: '0.85rem' }}>
                      {cycle.keyPoints.map((point: string, i: number) => (
                        <li key={i} style={{ marginBottom: '0.25rem' }}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}

            {/* Tips */}
            {studyPlan.tips && studyPlan.tips.length > 0 && (
              <div style={{
                padding: '1rem',
                background: 'rgba(34, 197, 94, 0.1)',
                borderRadius: '0.75rem',
                border: '1px solid rgba(34, 197, 94, 0.2)'
              }}>
                <strong style={{ color: 'var(--text-main)' }}>💪 Study Tips:</strong>
                <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem', fontSize: '0.85rem' }}>
                  {studyPlan.tips.map((tip: string, i: number) => (
                    <li key={i} style={{ marginBottom: '0.25rem' }}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Completion Modal */}
      <Modal
        isOpen={showCompletionModal}
        onClose={() => {
          setShowCompletionModal(false);
          setIsWorking(false);
          setCheckedTasks([false, false, false]);
        }}
        title={t('learning.focusEndCompletionTitle')}
        message={t('learning.focusEndCompletionMessage', { xp: sessionXP, name: user.animalName })}
        icon="🎉"
        buttonText={t('learning.focusEndCompletionButton')}
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
