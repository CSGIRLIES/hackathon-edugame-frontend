import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUser } from '../contexts/UserContext.tsx';
import { supabase } from '../utils/supabaseClient.ts';
import { fetchProfile } from '../utils/profileService.ts';

const AuthPage: React.FC = () => {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { setUser } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!supabase) {
      setError(t('auth.authError'));
      return;
    }

    try {
      setIsSubmitting(true);

      if (isLogin) {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError || !data.session || !data.user) {
          throw new Error(signInError?.message || t('errors.unauthorized'));
        }

        // Fetch the user's companion profile from Supabase
        const profile = await fetchProfile(data.user.id);

        if (!profile) {
          // No profile found - user signed up but didn't complete onboarding
          navigate('/onboarding');
          return;
        }

        const appUser = {
          id: profile.user_id,
          name: profile.name,
          animalType: profile.animal_type,
          animalName: profile.animal_name,
          animalColor: profile.animal_color,
          xp: profile.xp,
          level: (profile.level === 'adolescent' || profile.level === 'teen' ? 'adolescent' : profile.level) as 'baby' | 'adolescent' | 'adult',
          currentStreak: profile.current_streak,
          maxStreak: profile.max_streak,
          lastStudyDate: profile.last_study_date,
          parentEmail: profile.parent_email,
          studyGoalMinutes: profile.study_goal_minutes,
          totalStudyTime: profile.total_study_time,
          completedLearningCycles: profile.completed_learning_cycles,
        };

        setUser(appUser);
        navigate('/dashboard');
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError || !data.user) {
          throw new Error(signUpError?.message || t('errors.generic'));
        }

        // After sign up, we send the user to onboarding to configure their companion.
        navigate('/onboarding');
      }
    } catch (err: any) {
      console.error('[AuthPage] Auth error', err);
      setError(err.message || t('auth.errorOccurred'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">{t('app.title')} ✨</h1>
        <p className="page-subtitle">
          {t('app.subtitle')}
        </p>
      </header>

      <main>
        <section className="card auth-card">
          <div className="card-header">
            <h2 className="card-title">{isLogin ? t('auth.loginTitle') : t('auth.signupTitle')}</h2>
            <p className="card-subtitle">
              {isLogin ? t('auth.loginSubtitle') : t('auth.signupSubtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label" htmlFor="email">
                {t('auth.email')}
              </label>
              <input
                id="email"
                className="input"
                type="email"
                placeholder="toi@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="password">
                {t('auth.password')}
              </label>
              <input
                id="password"
                className="input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="helper-text">{t('auth.passwordHint')}</p>
            </div>

            {error && (
              <p className="helper-text" style={{ color: '#fb7185' }}>
                {error}
              </p>
            )}

            <div className="btn-row">
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting
                  ? isLogin
                    ? t('auth.loggingIn')
                    : t('auth.signingUp')
                  : isLogin
                  ? t('auth.signInButton')
                  : t('auth.signUpButton')}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? t('auth.switchToSignup') : t('auth.switchToLogin')}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};

export default AuthPage;
