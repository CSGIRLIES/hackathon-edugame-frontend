import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext.tsx';
import { supabase } from '../utils/supabaseClient.ts';
import { createProfile } from '../utils/profileService.ts';

const OnboardingPage: React.FC = () => {
  const [step, setStep] = useState(0);
  const [animalType, setAnimalType] = useState('');
  const [animalColor, setAnimalColor] = useState('');
  const [animalName, setAnimalName] = useState('');
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();
  const { setUser } = useUser();

  const animalOptions = [
    { id: 'cat', label: 'Chaton ailé', hint: 'Curieux, joueur, créatif' },
    { id: 'dragon', label: 'Mini-dragon', hint: 'Brave, puissant, passionné' },
    { id: 'otter', label: 'Loutre érudite', hint: 'Calme, concentrée, studieuse' },
    { id: 'penguin', label: 'Pingouin cosmique', hint: 'Fun, chill, régulier' },
  ];

  const colorOptions = [
    { id: '#38bdf8', label: 'Bleu galaxie' },
    { id: '#a855ff', label: 'Violet magique' },
    { id: '#f97316', label: 'Orange énergie' },
    { id: '#22c55e', label: 'Vert focus' },
  ];

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Get the current authenticated user from Supabase
      if (!supabase) {
        alert('Supabase not configured. Profile cannot be saved.');
        return;
      }

      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        alert('No authenticated user found. Please log in again.');
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
      };

      // Save profile to Supabase
      const success = await createProfile({
        user_id: authUser.id,
        name: userName,
        animal_type: animalType,
        animal_name: animalName,
        animal_color: animalColor,
        xp: 0,
        level: 'baby',
      });

      if (!success) {
        alert('Failed to save profile. Please try again.');
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

  const stepTitle = [
    'D’abord, on fait connaissance',
    'Choisis ton compagnon magique',
    'Choisis sa couleur d’aura',
    'Donne-lui un nom',
  ][step];

  const stepSubtitle = [
    'Comment veux-tu que ton compagnon t’appelle ?',
    'Lequel te ressemble le plus pour apprendre ?',
    'Quelle couleur te motive le plus pour travailler ?',
    'Un nom cute, drôle ou badass, à toi de choisir ✨',
  ][step];

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Crée ton duo légendaire ✨</h1>
        <p className="page-subtitle">
          En quelques étapes, tu adoptes un bébé animal magique qui va réviser, jouer et progresser avec toi.
        </p>
      </header>

      <main>
        <section className="card onboarding-card">
          <div className="card-header">
            <h2 className="card-title">{stepTitle}</h2>
            <p className="card-subtitle">{stepSubtitle}</p>
          </div>

          {step === 0 && (
            <>
              <div className="input-group">
                <label className="input-label" htmlFor="name">
                  Ton prénom ou pseudo
                </label>
                <input
                  id="name"
                  className="input"
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Ex : Lina, ZoéCode, AstroGirl..."
                  required
                />
                <p className="helper-text">
                  C'est comme ça que ton compagnon t'appellera.
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
                Tu pourras toujours en adopter d'autres plus tard dans la version complète.
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
                  Nom de ton compagnon
                </label>
                <input
                  id="animalName"
                  className="input"
                  type="text"
                  value={animalName}
                  onChange={(e) => setAnimalName(e.target.value)}
                  placeholder="Ex : Nova, Pixel, Draco, Mimi..."
                  required
                />
              </div>
            </>
          )}

          <div className="btn-row" style={{ marginTop: '1.5rem' }}>
            {step > 0 && (
              <button type="button" className="btn btn-secondary" onClick={handleBack}>
                Retour
              </button>
            )}
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleNext}
              disabled={!canContinue}
            >
              {step === 3 ? 'Terminer et rencontrer mon compagnon' : 'Continuer'}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default OnboardingPage;
