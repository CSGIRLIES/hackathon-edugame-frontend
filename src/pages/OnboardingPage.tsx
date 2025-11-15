import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUser } from '../contexts/UserContext.tsx';
import { supabase } from '../utils/supabaseClient.ts';
import { createProfile } from '../utils/profileService.ts';

const OnboardingPage: React.FC = () => {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [animalType, setAnimalType] = useState('');
  const [animalColor, setAnimalColor] = useState('');
  const [animalName, setAnimalName] = useState('');
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();
  const { setUser } = useUser();

  const animalOptions = [
    { id: 'cat', label: t('onboarding.animalCat'), hint: t('onboarding.animalCatHint') },
    { id: 'dragon', label: t('onboarding.animalDragon'), hint: t('onboarding.animalDragonHint') },
    { id: 'otter', label: t('onboarding.animalOtter'), hint: t('onboarding.animalOtterHint') },
    { id: 'penguin', label: t('onboarding.animalPenguin'), hint: t('onboarding.animalPenguinHint') },
  ];

  const colorOptions = [
    { id: '#38bdf8', label: t('onboarding.colorBlue') },
    { id: '#a855ff', label: t('onboarding.colorPurple') },
    { id: '#f97316', label: t('onboarding.colorOrange') },
    { id: '#22c55e', label: t('onboarding.colorGreen') },
  ];

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      if (!supabase) {
        alert(t('onboarding.noSupabase'));
        return;
      }

      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        alert(t('onboarding.noUser'));
        navigate('/');
        return;
      }

      const newUser = {
        id: authUser.id,
        name: userName,
        animalType,
        animalName,
        animalColor,
        xp: 0,
        level: 'baby' as const,
        currentStreak: 0,
        maxStreak: 0,
        lastStudyDate: undefined,
        parentEmail: undefined,
        studyGoalMinutes: 0,
        totalStudyTime: 0,
      };

      const success = await createProfile({
        user_id: authUser.id,
        name: userName,
        animal_type: animalType,
        animal_name: animalName,
        animal_color: animalColor,
        xp: 0,
        level: 'baby',
        current_streak: 0,
        max_streak: 0,
        last_study_date: null,
        parent_email: null,
        study_goal_minutes: 0,
        total_study_time: 0,
      });

      if (!success) {
        alert(t('onboarding.profileSaveFailed'));
        return;
      }

      setUser(newUser);
      navigate('/dashboard');
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const canContinue =
    (step === 0 && !!userName.trim()) ||
    (step === 1 && !!animalType) ||
    (step === 2 && !!animalColor) ||
    (step === 3 && !!animalName.trim());

  const stepTitles = [
    t('onboarding.step1Title'),
    t('onboarding.step2Title'),
    t('onboarding.step3Title'),
    t('onboarding.step4Title'),
  ];

  const stepSubtitles = [
    t('onboarding.step1Subtitle'),
    t('onboarding.step2Subtitle'),
    t('onboarding.step3Subtitle'),
    t('onboarding.step4Subtitle'),
  ];

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">{t('onboarding.title')}</h1>
        <p className="page-subtitle">
          {t('onboarding.subtitle')}
        </p>
      </header>

      <main>
        <section className="card onboarding-card">
          <div className="card-header">
            <h2 className="card-title">{stepTitles[step]}</h2>
            <p className="card-subtitle">{stepSubtitles[step]}</p>
          </div>

          {step === 0 && (
            <>
              <div className="input-group">
                <label className="input-label" htmlFor="name">
                  {t('onboarding.nameLabel')}
                </label>
                <input
                  id="name"
                  className="input"
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder={t('onboarding.namePlaceholder')}
                  required
                />
                <p className="helper-text">
                  {t('onboarding.nameHint')}
                </p>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="chip-row">
                {animalOptions.map((animal) => (
                  <button
                    key={animal.id}
                    type="button"
                    className={
                      'chip' + (animalType === animal.id ? ' chip--selected' : '')
                    }
                    onClick={() => setAnimalType(animal.id)}
                  >
                    <div style={{ fontWeight: 600 }}>{animal.label}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{animal.hint}</div>
                  </button>
                ))}
              </div>
              <p className="helper-text" style={{ marginTop: '0.75rem' }}>
                {t('onboarding.adoptHint')}
              </p>
            </>
          )}

          {step === 2 && (
            <>
              <div className="chip-row">
                {colorOptions.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={'chip' + (animalColor === c.id ? ' chip--selected' : '')}
                    onClick={() => setAnimalColor(c.id)}
                    style={{
                      borderColor: animalColor === c.id ? 'transparent' : undefined,
                      background:
                        animalColor === c.id
                          ? `linear-gradient(135deg, ${c.id}, #f472b6)`
                          : undefined,
                    }}
                  >
                    <span
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: '999px',
                        background: c.id,
                        display: 'inline-block',
                        marginRight: 6,
                      }}
                    />
                    {c.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="input-group">
                <label className="input-label" htmlFor="animalName">
                  {t('onboarding.animalNameLabel')}
                </label>
                <input
                  id="animalName"
                  className="input"
                  type="text"
                  value={animalName}
                  onChange={(e) => setAnimalName(e.target.value)}
                  placeholder={t('onboarding.animalNamePlaceholder')}
                  required
                />
              </div>
            </>
          )}

          <div className="btn-row" style={{ marginTop: '1.5rem' }}>
            {step > 0 && (
              <button type="button" className="btn btn-secondary" onClick={handleBack}>
                {t('onboarding.back')}
              </button>
            )}
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleNext}
              disabled={!canContinue}
            >
              {step === 3 ? t('onboarding.finish') : t('onboarding.continue')}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default OnboardingPage;
