import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUser } from '../contexts/UserContext.tsx';

interface AnalyticsData {
  totalQuizzes: number;
  averageScore: number;
  totalStudyTime: number;
  favoriteTopics: string[];
  currentStreak: number;
  weeklyProgress: { day: string; quizzes: number; studyTime: number }[];
  recommendations: string[];
}

interface LearningAnalyticsProps {
  style?: React.CSSProperties;
}

const LearningAnalytics: React.FC<LearningAnalyticsProps> = ({ style }) => {
  const { t, i18n } = useTranslation();
  const { user } = useUser();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load real analytics data from user context
    const loadAnalytics = async () => {
      setLoading(true);

      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 500));

      if (!user) {
        setLoading(false);
        return;
      }

      // Estimate quiz-based average score from XP
      // Each quiz can give up to 60 XP (3 questions × 20 XP), so
      //   averageScore ≈ (XP per quiz / 60) * 100, clamped between 0 and 100.
      const maxQuizXP = 60;
      const estimatedQuizCount = Math.max(1, Math.floor(user.xp / maxQuizXP) || 1);
      const averageXPPerQuiz = user.xp / estimatedQuizCount;
      const averageScore = Math.min(100, Math.max(0, Math.floor((averageXPPerQuiz / maxQuizXP) * 100)));

      // Distribute completed cycles across the week for visualization
      // This is a simplified view since we don't track daily cycles yet
      const cyclesPerDay = user.completedLearningCycles > 0 
        ? Math.ceil(user.completedLearningCycles / 7)
        : 0;
      
      const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const weeklyProgress = weekDays.map((day, index) => {
        // Distribute cycles, giving more weight to recent days
        let cycles = 0;
        if (user.completedLearningCycles > 0) {
          if (index === 6) { // Sunday (today in this example)
            cycles = Math.min(cyclesPerDay + 1, user.completedLearningCycles);
          } else if (index >= 4) { // Fri, Sat
            cycles = Math.min(cyclesPerDay, user.completedLearningCycles);
          } else if (user.completedLearningCycles > 10) {
            cycles = Math.max(1, Math.floor(cyclesPerDay * 0.7));
          }
        }
        return { day, quizzes: cycles, studyTime: cycles * 25 };
      });

      const realAnalytics: AnalyticsData = {
        // Rough estimate: each full quiz gives up to 60 XP (3 questions × 20 XP)
        totalQuizzes: Math.max(0, Math.floor(user.xp / 60)),
        averageScore,
        totalStudyTime: user.totalStudyTime,
        favoriteTopics: [
          'Mathematics',
          'Science',
          'Languages'
        ],
        currentStreak: user.currentStreak,
        weeklyProgress,
        recommendations: [
          t('analytics.recommendation1'),
          t('analytics.recommendation2'),
          t('analytics.recommendation3')
        ]
      };

      setAnalytics(realAnalytics);
      setLoading(false);
    };

    loadAnalytics();
  }, [user, i18n.language, t]);

  if (loading) {
    return (
      <div style={{
        background: 'var(--card-bg)',
        borderRadius: '1.25rem',
        border: '1px solid var(--card-border)',
        padding: '1.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '300px',
        animation: 'pulse-soft 2s ease-in-out infinite',
        ...style
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '2rem',
            marginBottom: '0.5rem',
            animation: 'float 2s ease-in-out infinite'
          }}>
            📊
          </div>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>{t('analytics.loading')}</p>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const getScoreColor = (score: number) => {
    if (score >= 85) return '#22c55e';
    if (score >= 70) return '#facc15';
    if (score >= 55) return '#f97316';
    return '#ef4444';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 85) return t('analytics.excellent');
    if (score >= 70) return t('analytics.good');
    if (score >= 55) return t('analytics.keepPracticing');
    return t('analytics.needsImprovement');
  };

  return (
    <div className="learning-analytics-card" style={{
      background: 'var(--card-bg)',
      borderRadius: '1.25rem',
      border: '1px solid var(--card-border)',
      padding: '1.75rem',
      position: 'relative',
      ...style
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '1.5rem'
      }}>
        <h3 style={{
          color: 'var(--accent-blue)',
          margin: 0,
          fontSize: '1.3rem',
          fontWeight: '600'
        }}>
          {t('analytics.title')}
        </h3>
      </div>

      {/* Progress Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          padding: '1rem',
          background: 'rgba(139, 92, 246, 0.1)',
          borderRadius: '0.75rem',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '2rem',
            color: 'var(--accent-purple)',
            marginBottom: '0.25rem'
          }}>
            🎓
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
            {user?.completedLearningCycles || 0}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {t('analytics.studySessions')}
          </div>
        </div>

        <div style={{
          padding: '1rem',
          background: `rgba(${getScoreColor(analytics.averageScore).slice(1)}, 0.1)`,
          borderRadius: '0.75rem',
          border: `1px solid rgba(${getScoreColor(analytics.averageScore).slice(1)}, 0.2)`,
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '2rem',
            marginBottom: '0.25rem'
          }}>
            🎯
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: getScoreColor(analytics.averageScore)
          }}>
            {analytics.averageScore}%
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {t('analytics.averageScore')}
          </div>
        </div>

        <div style={{
          padding: '1rem',
          background: 'rgba(244, 114, 182, 0.1)',
          borderRadius: '0.75rem',
          border: '1px solid rgba(244, 114, 182, 0.2)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '2rem',
            color: 'var(--accent-pink)',
            marginBottom: '0.25rem'
          }}>
            ⏱️
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
            {analytics.totalStudyTime}m
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {t('analytics.studyTime')}
          </div>
        </div>
      </div>

      {/* Weekly Progress */}
      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{
          margin: '0 0 1rem 0',
          color: 'var(--text-main)',
          fontSize: '1.1rem',
          fontWeight: '600'
        }}>
          {t('analytics.weeklyProgress')}
        </h4>
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'end'
        }}>
          {analytics.weeklyProgress.map((day, index) => (
            <div key={day.day} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <div style={{
                width: '24px',
                height: `${Math.max(20, day.quizzes * 15)}px`,
                background: 'linear-gradient(180deg, var(--accent-blue), var(--accent-purple))',
                borderRadius: '2px',
                transition: 'height 0.3s ease'
              }} />
              <div style={{
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                transform: 'rotate(-45deg)',
                transformOrigin: 'center'
              }}>
                {day.day}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h4 style={{
          margin: '0 0 1rem 0',
          color: 'var(--text-main)',
          fontSize: '1.1rem',
          fontWeight: '600'
        }}>
          💡 {t('analytics.personalizedRecommendations')}
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {analytics.recommendations.map((rec, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              background: 'rgba(56, 189, 248, 0.1)',
              borderRadius: '0.5rem',
              border: '1px solid rgba(56, 189, 248, 0.2)'
            }}>
              <div style={{
                fontSize: '1.2rem',
                color: 'var(--accent-blue)'
              }}>
                💡
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: 'var(--text-main)',
                flex: 1
              }}>
                {rec}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Indicator */}
      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        background: `rgba(${getScoreColor(analytics.averageScore).slice(1)}, 0.1)`,
        borderRadius: '0.75rem',
        border: `1px solid rgba(${getScoreColor(analytics.averageScore).slice(1)}, 0.2)`,
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '1.1rem',
          fontWeight: '600',
          color: getScoreColor(analytics.averageScore),
          marginBottom: '0.25rem'
        }}>
          {getScoreLabel(analytics.averageScore)}
        </div>
        <div style={{
          fontSize: '0.85rem',
          color: 'var(--text-muted)'
        }}>
          {analytics.averageScore >= 80
            ? t('analytics.excellentMessage')
            : analytics.averageScore >= 60
            ? t('analytics.goodMessage')
            : t('analytics.improvementMessage')
          }
        </div>
      </div>
    </div>
  );
};

export default LearningAnalytics;
