import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

import AuthPage from './pages/AuthPage.tsx';
import OnboardingPage from './pages/OnboardingPage.tsx';
import DashboardPage from './pages/DashboardPage.tsx';
import QuizPage from './pages/QuizPage.tsx';
import QuizThemesPage from './pages/QuizThemesPage.tsx';
import LearningPage from './pages/LearningPage.tsx';
import LandingPage from './pages/LandingPage.tsx';
import WolframCompanionPage from './pages/WolframCompanionPage.tsx';
import UserHeader from './components/UserHeader.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import SoundConsentBanner from './components/SoundConsentBanner.tsx';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark-mode');
  };

  return (
    <div className="App">
      <UserHeader />
      <SoundConsentBanner />
      <button
        type="button"
        onClick={toggleDarkMode}
        className="mode-toggle"
        aria-label="Toggle dark mode"
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '24px',
          background: 'rgba(255, 255, 255, 0.8)',
          color: '#000',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
        }}
      >
        {isDarkMode ? '☀️' : '🌙'}
      </button>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/quiz/themes" element={<QuizThemesPage />} />
          <Route path="/learning" element={<LearningPage />} />
          <Route path="/wolfram" element={<WolframCompanionPage />} />
        </Routes>
      </ErrorBoundary>
    </div>
  );
}

export default App;
