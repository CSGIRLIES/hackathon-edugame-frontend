import React from 'react';
import { useTranslation } from 'react-i18next';
import { useUser } from '../contexts/UserContext.tsx';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient.ts';
import LanguageSelector from './LanguageSelector.tsx';

const UserHeader: React.FC = () => {
  const { t } = useTranslation();
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const confirm = window.confirm(t('auth.signOutConfirm'));
    if (confirm) {
      await supabase.auth.signOut();
      setUser(null);
      navigate('/');
    }
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <LanguageSelector />
        {user && (
          <div className="user-menu">
            <span className="user-name">👤 {user.name}</span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleSignOut}
            >
              {t('auth.signOut')}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default UserHeader;
