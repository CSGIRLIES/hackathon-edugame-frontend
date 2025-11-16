import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Animal from '../components/Animal.tsx';

const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark-mode');
  };

  return (
    <div className={`landing-page ${isDarkMode ? 'dark-mode' : ''}`}>
      {/* Header */}
      <div className="landing-header">
        <img
          className="landing-logo"
          src={`/pawfriend_${isDarkMode ? 'night' : 'day'}.png`}
          alt="Pawfriend Logo"
          style={{ height: '2.5rem', width: 'auto' }}
        />
        <button
          type="button"
          onClick={toggleDarkMode}
          className="landing-btn landing-btn-secondary"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>

      {/* Main Content */}
      <main className="landing-main">
        <div className="landing-page-section" style={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <section className="landing-hero">
            <div className="landing-hero-text">
              <h1 className="landing-hero-title">
                <strong style={{ fontSize: '3rem', color: 'black', display: 'block', marginBottom: '0.5rem' }}>
                  PAWFRIEND
                </strong>
                {t('landing.heroTitle')}
              </h1>
              <p className="landing-hero-subtitle">
                {t('landing.heroSubtitle')}
              </p>
              <div className="landing-hero-actions">
                <button
                  type="button"
                  onClick={handleGetStarted}
                  className="landing-btn landing-btn-primary"
                >
                  🌟 {t('landing.getStarted')} 🌟
                </button>
                <button
                  type="button"
                  className="landing-btn landing-btn-secondary"
                >
                  {t('landing.learnMore')}
                </button>
              </div>
            </div>

            <div className="landing-animal-wrapper">
              <div className="landing-animal-card">
                <Animal type="af" color="#ffb3d9" level="baby" context="dashboard" />
                <div className="landing-floating-icon landing-floating-icon--top-right">💖</div>
                <div className="landing-floating-icon landing-floating-icon--bottom-left">✨</div>
              </div>
            </div>
          </section>
        </div>

        <div className="landing-page-section" style={{
          width: '100%',
          minHeight: '100vh',
          paddingBottom: '2rem',
          animation: 'slideInFromBottom 1s ease-out 0.5s both'
        }}>
          {/* Features */}
          <section className="landing-features">
            <h2 className="landing-section-title">{t('landing.whyChoose')}</h2>
            <div className="landing-features-grid">
              <div className="landing-feature-card">
                <h3>🍃 {t('landing.feature1Title')}</h3>
                <p>{t('landing.feature1Desc')}</p>
              </div>
              <div className="landing-feature-card">
                <h3>🐾 {t('landing.feature2Title')}</h3>
                <p>{t('landing.feature2Desc')}</p>
              </div>
              <div className="landing-feature-card">
                <h3>🌈 {t('landing.feature3Title')}</h3>
                <p>{t('landing.feature3Desc')}</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="landing-cta">
            <h2>{t('landing.ctaTitle')}</h2>
            <p>{t('landing.ctaDesc')}</p>
            <button
              type="button"
              onClick={handleGetStarted}
              className="landing-btn landing-btn-primary"
            >
              {t('landing.joinNow')}
            </button>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-icons">
          <span>🌟</span>
          <span>📚</span>
          <span>🐶</span>
          <span>🦊</span>
        </div>
        <p className="landing-footer-text">{t('landing.footer')}</p>
      </footer>
    </div>
  );
};

export default LandingPage;
