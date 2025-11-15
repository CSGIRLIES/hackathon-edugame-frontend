import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext.tsx';
import { supabase } from '../utils/supabaseClient';

const AuthPage: React.FC = () => {
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
      setError("L'authentification n'est pas configurée (Supabase manquant).");
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
          throw new Error(signInError?.message || 'Connexion impossible.');
        }

        const appUser = {
          id: data.user.id,
          name: data.user.email?.split('@')[0] || 'Utilisateur',
          animalType: 'cat',
          animalName: 'Lumi',
          animalColor: '#a855ff',
          xp: 0,
          level: 'baby' as const,
        };

        setUser(appUser);
        navigate('/dashboard');
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError || !data.user) {
          throw new Error(signUpError?.message || "Inscription impossible.");
        }

        // After sign up, we send the user to onboarding to configure their companion.
        navigate('/onboarding');
      }
    } catch (err: any) {
      console.error('[AuthPage] Auth error', err);
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">CSGIRLIES ✨</h1>
        <p className="page-subtitle">
          Adopte un compagnon magique qui apprend avec toi, te motive et te félicite.
        </p>
      </header>

      <main>
        <section className="card auth-card">
          <div className="card-header">
            <h2 className="card-title">{isLogin ? 'Connexion' : 'Créer un compte'}</h2>
            <p className="card-subtitle">
              {isLogin
                ? 'Retrouve ton compagnon et continue ta progression.'
                : 'En quelques secondes, adopte ton bébé animal magique.'}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label" htmlFor="email">
                Email
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
                Mot de passe
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
              <p className="helper-text">Pas besoin d'un mot de passe parfait, c'est un prototype 💜</p>
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
                    ? 'Connexion...'
                    : 'Création...'
                  : isLogin
                  ? 'Se connecter'
                  : "Rejoindre l'aventure"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "Nouvelle ici ? Crée ton compte" : 'Déjà un compagnon ? Connexion'}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};

export default AuthPage;
