import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUser } from '../contexts/UserContext.tsx';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient.ts';
import LanguageSelector from './LanguageSelector.tsx';
import Modal from './Modal.tsx';

const UserHeader: React.FC = () => {
  const { t } = useTranslation();
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isStreakDropdownOpen, setIsStreakDropdownOpen] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const streakDropdownRef = useRef<HTMLDivElement>(null);

  const handleSignOut = () => {
    setIsSignOutModalOpen(true);
  };

  const confirmSignOut = async () => {
    setIsSignOutModalOpen(false);
    await supabase.auth.signOut();
    setUser(null);
    navigate('/');
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleStreakDropdown = () => {
    setIsStreakDropdownOpen(!isStreakDropdownOpen);
  };

  const getStreakEmoji = (streak: number) => {
    if (streak === 0) return '💧';
    if (streak < 3) return '🔥';
    if (streak < 7) return '🔥🔥';
    if (streak < 14) return '🔥🔥🔥';
    if (streak < 30) return '🌟';
    return '👑';
  };

  const getStreakMessage = (streak: number) => {
    if (streak === 0) return t('streaks.restart');
    if (streak === 1) return t('streaks.oneDay');
    if (streak < 7) return t('streaks.keepGoing');
    if (streak < 14) return t('streaks.onFire');
    if (streak < 30) return t('streaks.epic');
    return t('streaks.legendary');
  };

  // Fermer les dropdowns si on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (streakDropdownRef.current && !streakDropdownRef.current.contains(event.target as Node)) {
        setIsStreakDropdownOpen(false);
      }
    };

    if (isDropdownOpen || isStreakDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, isStreakDropdownOpen]);

  const isPersonalRecord = user && user.currentStreak === user.maxStreak && user.currentStreak > 0;

  return (
    <header className="app-header">
      <div className="header-content">
        {user && (
          <>
            {/* Streak Display */}
            <div className="user-menu" ref={streakDropdownRef} style={{ marginRight: '0.75rem' }}>
              <button
                type="button"
                className="user-avatar-btn"
                onClick={toggleStreakDropdown}
                aria-label="Streaks menu"
                style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}
              >
                <span style={{ fontSize: '1rem' }}>{getStreakEmoji(user.currentStreak)}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{user.currentStreak}</span>
              </button>
              {isStreakDropdownOpen && (
                <div className="user-dropdown" style={{ minWidth: '200px', maxWidth: '220px' }}>
                  <div className="user-dropdown-name" style={{ marginBottom: '0.75rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>
                      {getStreakEmoji(user.currentStreak)}
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.2rem' }}>
                      {user.currentStreak}
                    </div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                      {t('streaks.days')}
                      {isPersonalRecord && <span style={{ marginLeft: '0.35rem' }}>🏆</span>}
                    </div>
                  </div>

                  {user.currentStreak > 0 && (
                    <div style={{ marginBottom: '0.5rem', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                      <div style={{ fontSize: '0.75rem', marginBottom: '0.35rem' }}>
                        {getStreakMessage(user.currentStreak)}
                      </div>
                      {user.maxStreak > 0 && (
                        <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                          {t('streaks.personalBest')}: {user.maxStreak} {t('streaks.days')}
                        </div>
                      )}
                    </div>
                  )}

                  {user.currentStreak === 0 && (
                    <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', fontSize: '0.75rem' }}>
                      {t('streaks.getStarted')}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="user-menu" ref={dropdownRef}>
              <button
                type="button"
                className="user-avatar-btn"
                onClick={toggleDropdown}
                aria-label="User menu"
              >
                👤
              </button>
              {isDropdownOpen && (
                <div className="user-dropdown">
                  <div className="user-dropdown-name">
                    <strong>{user.name}</strong>
                  </div>
                  <div className="user-dropdown-section">
                    <LanguageSelector />
                  </div>
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
          </>
        )}

        {/* Sign Out Confirmation Modal */}
        <Modal
          isOpen={isSignOutModalOpen}
          onClose={() => setIsSignOutModalOpen(false)}
          title={t('auth.signOutConfirm')}
          message=""
          icon="😢"
        >
          <div className="btn-row">
            <button
              type="button"
              className="btn btn-secondary"
              style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '10px', margin: '5px' }}
              onClick={() => {
                console.log('Annuler clicked');
                setIsSignOutModalOpen(false);
              }}
            >
              Annuler
            </button>
            <button
              type="button"
              className="btn btn-primary"
              style={{ backgroundColor: 'green', color: 'white', border: 'none', padding: '10px', margin: '5px' }}
              onClick={() => {
                console.log('Confirm Sign Out clicked');
                confirmSignOut();
              }}
            >
              {t('auth.signOut')}
            </button>
          </div>
        </Modal>
      </div>
    </header>
  );
};

export default UserHeader;
