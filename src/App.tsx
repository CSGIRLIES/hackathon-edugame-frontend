import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage.tsx';
import OnboardingPage from './pages/OnboardingPage.tsx';
import DashboardPage from './pages/DashboardPage.tsx';
import QuizPage from './pages/QuizPage.tsx';
import QuizThemesPage from './pages/QuizThemesPage.tsx';
import LearningPage from './pages/LearningPage.tsx';
import WolframCompanionPage from './pages/WolframCompanionPage.tsx';
import UserHeader from './components/UserHeader.tsx';

function App() {
  return (
    <div className="App">
      <UserHeader />
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/quiz/themes" element={<QuizThemesPage />} />
        <Route path="/learning" element={<LearningPage />} />
        <Route path="/wolfram" element={<WolframCompanionPage />} />
      </Routes>
    </div>
  );
}

export default App;
