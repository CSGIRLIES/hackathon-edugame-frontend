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

  const startLearningSession = (topic: string, duration: number) => {
    if (user) {
      // Logic for starting learning session
      // For now, just update XP based on duration
      const xpFromWork = duration; // Assuming 1 min = 1 XP
      updateXP(xpFromWork);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, updateXP, startLearningSession }}>
      {children}
    </UserContext.Provider>
  );
};
