import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUser } from '../contexts/UserContext.tsx';
import Animal from '../components/Animal.tsx';
import StreaksWidget from '../components/StreaksWidget.tsx';
import { getFoodItem } from '../data/foodItems';

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, updateXP, subtractXP } = useUser();
  const navigate = useNavigate();
  const [foodFeedback, setFoodFeedback] = useState<string | null>(null);

  if (!user) {
    navigate('/');
    return null;
  }

  const handleFoodClick = async (foodId: string, cost: number) => {
    const foodItem = getFoodItem(user.animalType, foodId.split('-')[1]); // Extract food key from id

    if (!foodItem) {
      setFoodFeedback('Nourriture non trouvée.');
      setTimeout(() => setFoodFeedback(null), 3000);
      return;
    }

    // Try to subtract the cost
    const costSubtracted = await subtractXP(cost);
    if (!costSubtracted) {
      setFoodFeedback(`Vous n'avez pas assez d'XP ! (Requis: ${cost} XP)`);
      setTimeout(() => setFoodFeedback(null), 3000);
      return;
    }

    try {
      // Add the XP reward
      await updateXP(foodItem.xpReward);
      setFoodFeedback(`Délicieux ! ${user.animalName} a gagné ${foodItem.xpReward} XP supplémentaires !`);
      setTimeout(() => setFoodFeedback(null), 3000);
    } catch (error) {
      setFoodFeedback('Erreur lors de l\'ajout de la récompense XP.');
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

      <main className="layout-grid">
        <section className="card dashboard-main-card" style={{ minHeight: '400px' }}>
          <div className="card-header">
            <h2 className="card-title">{t('dashboard.companionName')}</h2>
            <p className="card-subtitle">
              {user.animalName} évolue en fonction de ton XP et t'envoie des petits messages.
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
        </section>

        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Ta session du jour</h2>
            <p className="card-subtitle">
              Choisis comment tu veux apprendre aujourd'hui. Ton compagnon suivra ton rythme.
            </p>
          </div>

          <div className="btn-row">
            <button className="btn btn-primary" onClick={() => navigate('/learning')}>
              {t('dashboard.startLearning')}
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/quiz/themes')}>
              Thèmes de Quiz
            </button>
            <button className="btn btn-outline" onClick={() => navigate('/quiz')}>
              Quiz personnalisé
            </button>
            <button className="btn btn-outline" onClick={() => navigate('/wolfram')}>
              Compagnon prof (Wolfram)
            </button>
          </div>

          <p className="helper-text" style={{ marginTop: '0.5rem' }}>
            Astuce : une session pomodoro + un quiz à la fin = beaucoup d'XP pour {user.animalName} ✨
          </p>
        </section>

        <StreaksWidget />
      </main>
    </div>
  );
};

export default DashboardPage;
