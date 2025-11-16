import React, { useEffect , useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUser } from '../contexts/UserContext.tsx';
import Animal from '../components/Animal.tsx';
import LearningAnalytics from '../components/LearningAnalytics.tsx';
import { getFoodItem } from '../data/foodItems.js';

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, isLoading, checkStreakExpiry, updateXP, subtractXP } = useUser();
  const navigate = useNavigate();
  const [foodFeedback, setFoodFeedback] = useState<string | null>(null);

  // Check if streak has expired when dashboard loads
  useEffect(() => {
    if (user) {
      checkStreakExpiry();
    }
  }, [user?.id]); // Only run when user id changes (on mount/user change)

  // Redirect to home if no user is found after component is mounted
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  // Show loading until we know user state
  if (isLoading) {
    return (
      <div className="page">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '2rem',
              marginBottom: '1rem'
            }}>
              ✨
            </div>
            <p style={{ color: 'var(--text-muted)' }}>Loading your learning companion...</p>
          </div>
        </div>
      </div>
    );
  }

  // Don't render dashboard content until we confirm user exists
  if (!user) {
    return null;
  }

  const handleFoodClick = async (foodId: string, cost: number) => {
    const foodItem = getFoodItem(user.animalType, foodId.split('-')[1]); // Extract food key from id

    if (!foodItem) {
      setFoodFeedback(t('dashboard.foodNotFound'));
      setTimeout(() => setFoodFeedback(null), 3000);
      return;
    }

    // Try to subtract the cost (no XP reward anymore)
    const costSubtracted = await subtractXP(cost);
    if (!costSubtracted) {
      setFoodFeedback(t('dashboard.notEnoughXP', { cost }));
      setTimeout(() => setFoodFeedback(null), 3000);
      return;
    }

    try {
      // Food eaten successfully - no XP reward
      setFoodFeedback(t('dashboard.foodEatenSuccess', { name: user.animalName }));
      setTimeout(() => setFoodFeedback(null), 3000);
    } catch (error) {
      setFoodFeedback(t('errors.generic'));
      setTimeout(() => setFoodFeedback(null), 3000);
    }
  };

  const levelLabel =
    user.level === 'baby' ? t('dashboard.levelBaby') : 
    user.level === 'adolescent' ? t('dashboard.levelAdolescent') : 
    t('dashboard.levelAdult');

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">{t('dashboard.title')}, {user.name} ✨</h1>
        <p className="page-subtitle">
          {t('dashboard.subtitle')}
        </p>
      </header>

      <main style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '1.75rem'
      }}>

        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          <section className="card dashboard-main-card" style={{ minHeight: '400px' }}>
            <div className="card-header">
              <h2 className="card-title">{t('dashboard.companionName')}</h2>
              <p className="card-subtitle">
                {t('dashboard.companionDescription', { name: user.animalName })}
              </p>
            </div>

            <Animal
              type={user.animalType}
              color={user.animalColor}
              level={user.level}
              xp={user.xp}
              context="dashboard"
              onFoodClick={handleFoodClick}
            />

            {foodFeedback && (
              <div style={{
                marginTop: '10px',
                padding: '8px 12px',
                backgroundColor: foodFeedback.includes('Erreur') || foodFeedback.includes('n\'avez pas') ? '#fef2f2' : '#f0fdf4',
                border: `1px solid ${foodFeedback.includes('Erreur') || foodFeedback.includes('n\'avez pas') ? '#fecaca' : '#bbf7d0'}`,
                borderRadius: '6px',
                fontSize: '0.875rem',
                color: foodFeedback.includes('Erreur') || foodFeedback.includes('n\'avez pas') ? '#dc2626' : '#166534'
              }}>
                {foodFeedback}
              </div>
            )}

            <div className="dashboard-stats">
              <div className="xp-pill">
                <span className="badge-dot" />
                <span>{user.xp} {t('dashboard.companionXP')}</span>
              </div>
              <div className="level-pill">
                <span>{levelLabel}</span>
              </div>
            </div>

            {/* Progression vers le prochain âge/niveau */}
            {user.level !== 'adult' && (
              <p className="helper-text" style={{ marginTop: '0.35rem' }}>
                {user.level === 'baby' && `${user.xp}/1000 XP pour atteindre le niveau adolescent`}
                {user.level === 'adolescent' && `${user.xp}/2000 XP pour atteindre le niveau adulte`}
              </p>
            )}
            {user.level === 'adult' && (
              <p className="helper-text" style={{ marginTop: '0.35rem' }}>
                {t('dashboard.adultReached')}
              </p>
            )}
          </section>

          <section className="card">
            <div className="card-header">
              <h2 className="card-title">{t('dashboard.todaySessionTitle')}</h2>
              <p className="card-subtitle">
                {t('dashboard.todaySessionDescription')}
              </p>
            </div>

            <div className="btn-row">
              <button className="btn btn-primary" onClick={() => navigate('/learning')}>
                {t('dashboard.startLearning')}
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/quiz/themes')}>
                {t('dashboard.quizThemes')}
              </button>
              <button className="btn btn-outline" onClick={() => navigate('/quiz')}>
                {t('dashboard.customQuiz')}
              </button>
              <button className="btn btn-outline" onClick={() => navigate('/wolfram')}>
                {t('dashboard.wolframCompanion')}
              </button>
            </div>

            <p className="helper-text" style={{ marginTop: '0.5rem' }}>
              {t('dashboard.tip', { name: user.animalName })}
            </p>
          </section>
        </div>

        {/* Right Column - Learning Analytics */}
        <div>
          <LearningAnalytics />
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
