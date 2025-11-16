import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { updateProfile } from '../utils/profileService.ts';

export interface User {
  id: string;
  name: string;
  animalType: string;
  animalName: string;
  animalColor: string;
  xp: number;
  level: 'baby' | 'adolescent' | 'adult';
  currentStreak: number;
  maxStreak: number;
  lastStudyDate?: string;
  parentEmail?: string;
  studyGoalMinutes: number;
  totalStudyTime: number;
  completedLearningCycles: number;
}

export interface LearningSession {
  topic: string;
  duration: number; // in minutes
  xpGained: number;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  updateXP: (xp: number) => void;
  subtractXP: (xp: number) => Promise<boolean>;
  updateStreak: () => Promise<void>;
  checkStreakExpiry: () => Promise<void>;
  startLearningSession: (topic: string, duration: number) => void;
  incrementLearningCycle: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on initial mount (simple session persistence)
  useEffect(() => {
    const initializeUser = () => {
      try {
        const stored = localStorage.getItem('csGirliesUser');
        if (stored) {
          const parsed: User = JSON.parse(stored);
          setUser(parsed);
        }
      } catch (error) {
        console.error('Error restoring user from localStorage', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, []);

  // Persist user to localStorage whenever it changes (after initial load)
  useEffect(() => {
    if (user) {
      localStorage.setItem('csGirliesUser', JSON.stringify(user));
    } else if (!isLoading) {
      // Only clear storage when user is explicitly cleared (e.g. logout), not during initial load
      localStorage.removeItem('csGirliesUser');
    }
  }, [user, isLoading]);

  const updateXP = async (xp: number) => {
    if (user) {
      const newXP = user.xp + xp;
      let newLevel: 'baby' | 'adolescent' | 'adult';
      if (newXP < 20) {
        newLevel = 'baby';
      } else if (newXP < 60) {
        newLevel = 'adolescent';
      } else {
        newLevel = 'adult';
      }

      const updatedUser = { ...user, xp: newXP, level: newLevel };
      setUser(updatedUser);

      // Persist XP and level to Supabase
      await updateProfile(user.id, {
        xp: newXP,
        level: newLevel,
      });
    }
  };

  const subtractXP = async (xp: number): Promise<boolean> => {
    if (!user || user.xp < xp) {
      return false;
    }

    const newXP = user.xp - xp;
    let newLevel: 'baby' | 'adolescent' | 'adult';
    if (newXP < 20) {
      newLevel = 'baby';
    } else if (newXP < 60) {
      newLevel = 'adolescent';
    } else {
      newLevel = 'adult';
    }

    const updatedUser = { ...user, xp: newXP, level: newLevel };
    setUser(updatedUser);

    // Persist XP and level to Supabase
    await updateProfile(user.id, {
      xp: newXP,
      level: newLevel,
    });

    return true;
  };

  const updateStreak = async () => {
    if (!user) return;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let newStreak = user.currentStreak;
    let streakUpdated = false;

    if (user.lastStudyDate) {
      const lastStudy = new Date(user.lastStudyDate);
      const lastStudyDay = new Date(lastStudy.getFullYear(), lastStudy.getMonth(), lastStudy.getDate());
      
      // Calculate difference in days
      const diffTime = today.getTime() - lastStudyDay.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        // Same day - don't increment streak
        return;
      } else if (diffDays === 1) {
        // Yesterday - increment streak
        newStreak = user.currentStreak + 1;
        streakUpdated = true;
      } else {
        // More than 1 day gap - reset streak to 1
        newStreak = 1;
        streakUpdated = true;
      }
    } else {
      // First study session ever
      newStreak = 1;
      streakUpdated = true;
    }

    if (streakUpdated) {
      const newMaxStreak = Math.max(newStreak, user.maxStreak);
      const updatedUser = {
        ...user,
        currentStreak: newStreak,
        maxStreak: newMaxStreak,
        lastStudyDate: now.toISOString(),
      };
      
      setUser(updatedUser);
      
      // Persist to Supabase
      await updateProfile(user.id, {
        current_streak: newStreak,
        max_streak: newMaxStreak,
        last_study_date: now.toISOString(),
      });
    }
  };

  const checkStreakExpiry = async () => {
    if (!user || !user.lastStudyDate) return;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastStudy = new Date(user.lastStudyDate);
    const lastStudyDay = new Date(lastStudy.getFullYear(), lastStudy.getMonth(), lastStudy.getDate());
    
    // Calculate difference in days
    const diffTime = today.getTime() - lastStudyDay.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // If more than 1 day has passed, reset streak to 0
    if (diffDays > 1 && user.currentStreak > 0) {
      const updatedUser = {
        ...user,
        currentStreak: 0,
      };
      
      setUser(updatedUser);
      
      // Persist to Supabase
      await updateProfile(user.id, {
        current_streak: 0,
      });
    }
  };

  const startLearningSession = (topic: string, duration: number) => {
    if (user) {
      // Logic for starting learning session
      // For now, just update XP based on duration
      const xpFromWork = duration; // Assuming 1 min = 1 XP
      updateXP(xpFromWork);
    }
  };

  const incrementLearningCycle = async () => {
    if (!user) return;

    const newCycleCount = user.completedLearningCycles + 1;
    const updatedUser = {
      ...user,
      completedLearningCycles: newCycleCount,
    };

    setUser(updatedUser);

    // Persist to Supabase
    await updateProfile(user.id, {
      completed_learning_cycles: newCycleCount,
    });
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        setUser,
        updateXP,
        subtractXP,
        updateStreak,
        checkStreakExpiry,
        startLearningSession,
        incrementLearningCycle,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
