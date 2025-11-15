import React from 'react';
import { useTranslation } from 'react-i18next';
import { useUser } from '../contexts/UserContext.tsx';

const StreaksWidget: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useUser();

  if (!user) return null;

  const getStreakEmoji = (streak: number) => {
    if (streak === 0) return '💧'; // Droplet for restart
    if (streak < 3) return '🔥'; // Small flame
    if (streak < 7) return '🔥🔥'; // Two flames
    if (streak < 14) return '🔥🔥🔥'; // Three flames
    if (streak < 30) return '🌟'; // Star for epic streaks
    return '👑'; // Crown for legendary streaks
  };

  const getStreakMessage = (streak: number) => {
    if (streak === 0) return t('streaks.restart');
    if (streak === 1) return t('streaks.oneDay');
    if (streak < 7) return t('streaks.keepGoing');
    if (streak < 14) return t('streaks.onFire');
    if (streak < 30) return t('streaks.epic');
    return t('streaks.legendary');
  };

  const isPersonalRecord = user.currentStreak === user.maxStreak && user.currentStreak > 0;

  return (
    <section className="card">
      <div className="card-header">
        <h2 className="card-title">
          🔥 {t('streaks.title')}
          {isPersonalRecord && <span className="streak-record">🏆</span>}
        </h2>
        <p className="card-subtitle">
          {t('streaks.subtitle')}
        </p>
      </div>

      <div className="streak-content">
        <div className="streak-main">
          <div className="streak-flames">
            {getStreakEmoji(user.currentStreak)}
          </div>
          <div className="streak-number">
            {user.currentStreak}
          </div>
          <div className="streak-label">
            {t('streaks.days')}
          </div>
        </div>

        {user.currentStreak > 0 && (
          <div className="streak-info">
            <div className="streak-message">
              {getStreakMessage(user.currentStreak)}
            </div>
            {user.maxStreak > 0 && (
              <div className="streak-max">
                {t('streaks.personalBest')}: {user.maxStreak} {t('streaks.days')}
              </div>
            )}
          </div>
        )}

        {user.currentStreak === 0 && (
          <div className="streak-encouragement">
            {t('streaks.getStarted')}
          </div>
        )}
      </div>
    </section>
  );
};

export default StreaksWidget;</parameter>
</xai:function_call>
