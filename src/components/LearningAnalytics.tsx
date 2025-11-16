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
    // Simulate loading analytics data
    const loadAnalytics = async () => {
      setLoading(true);

      // Mock data - in a real app, this would come from an API
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockAnalytics: AnalyticsData = {
        totalQuizzes: Math.floor(Math.random() * 20) + 5,
        averageScore: Math.floor(Math.random() * 40) + 60,
        totalStudyTime: Math.floor(Math.random() * 300) + 100,
        favoriteTopics: [
          'Mathematics',
          'Science',
          'Languages',
          'History'
        ].slice(0, Math.floor(Math.random() * 3) + 2),
        currentStreak: user?.currentStreak || 0,
        weeklyProgress: [
          { day: 'Mon', quizzes: Math.floor(Math.random() * 3), studyTime: Math.floor(Math.random() * 60) },
          { day: 'Tue', quizzes: Math.floor(Math.random() * 3), studyTime: Math.floor(Math.random() * 60) },
          { day: 'Wed', quizzes: Math.floor(Math.random() * 3), studyTime: Math.floor(Math.random() * 60) },
          { day: 'Thu', quizzes: Math.floor(Math.random() * 3), studyTime: Math.floor(Math.random() * 60) },
          { day: 'Fri', quizzes: Math.floor(Math.random() * 3), studyTime: Math.floor(Math.random() * 60) },
          { day: 'Sat', quizzes: Math.floor(Math.random() * 3), studyTime: Math.floor(Math.random() * 60) },
          { day: 'Sun', quizzes: Math.floor(Math.random() * 3), studyTime: Math.floor(Math.random() * 60) }
        ],
        recommendations: [
          t('analytics.recommendation1'),
          t('analytics.recommendation2'),
          t('analytics.recommendation3'),
          t('analytics.recommendation4')
        ].slice(0, 3)
      };

      setAnalytics(mockAnalytics);
      setLoading(false);
    };

    loadAnalytics();
  }, [user, i18n.language, t]);

  if (loading) {
    return (
      <div style={{
        background: 'rgba(15, 23, 42, 0.94)',
        borderRadius: '1.25rem',
        border: '1px solid rgba(255, 255, 255, 0.08)',
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
    <div style={{
      background: 'rgba(15, 23, 42, 0.94)',
      borderRadius: '1.25rem',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '1.75rem',
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
          background: 'rgba(56, 189, 248, 0.1)',
          borderRadius: '0.75rem',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '2rem',
            color: 'var(--accent-blue)',
            marginBottom: '0.25rem'
          }}>
            📝
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
            {analytics.totalQuizzes}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {t('analytics.totalQuizzes')}
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
