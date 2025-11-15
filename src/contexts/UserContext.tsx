import React, { createContext, useContext, useState, ReactNode } from 'react';
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
}

export interface LearningSession {
  topic: string;
  duration: number; // in minutes
  xpGained: number;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  updateXP: (xp: number) => void;
<<<<<<< HEAD
  subtractXP: (xp: number) => Promise<boolean>;
=======
  updateStreak: () => Promise<void>;
  checkStreakExpiry: () => Promise<void>;
>>>>>>> brancheKawthar
  startLearningSession: (topic: string, duration: number) => void;
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

<<<<<<< HEAD
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
=======
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
>>>>>>> brancheKawthar
  };

  const startLearningSession = (topic: string, duration: number) => {
    if (user) {
      // Logic for starting learning session
      // For now, just update XP based on duration
      const xpFromWork = duration; // Assuming 1 min = 1 XP
      updateXP(xpFromWork);
    }
  };

  return (
<<<<<<< HEAD
    <UserContext.Provider value={{ user, setUser, updateXP, subtractXP, startLearningSession }}>
=======
    <UserContext.Provider value={{ user, setUser, updateXP, updateStreak, checkStreakExpiry, startLearningSession }}>
>>>>>>> brancheKawthar
      {children}
    </UserContext.Provider>
  );
};
