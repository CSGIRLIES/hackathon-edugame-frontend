import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUser } from '../contexts/UserContext.tsx';
import Animal from '../components/Animal.tsx';
import StreaksWidget from '../components/StreaksWidget.tsx';

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useUser();
  const navigate = useNavigate();

  if (!user) {
    navigate('/');
    return null;
  }

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
        <section className="card dashboard-main-card">
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
          />

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
            <button className="btn btn-secondary" onClick={() => navigate('/quiz')}>
              {t('dashboard.quickQuiz')}
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
