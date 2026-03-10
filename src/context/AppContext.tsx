import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Types
export interface SurveyAnswer {
  questionIndex: number;
  answer: string;
}

export interface CareerPath {
  id: string;
  title: string;
  matchPercentage: number;
  justification: string;
  startDate: string;
  targetDate: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  goal: 'basics' | 'intermediate' | 'job-ready' | 'custom';
  skillScore: number;
  progress: number;
  isActive: boolean;
  phases: Phase[];
}

export interface Phase {
  id: string;
  title: string;
  tasks: Task[];
}

export interface Task {
  id: string;
  day: number;
  title: string;
  description: string;
  objective: string;
  youtubeLink: string;
  completed: boolean;
  phaseId: string;
}

export interface DailyChallenge {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  completedToday: boolean;
}

export interface UserProfile {
  username: string;
  email: string;
  plan: 'free' | 'monthly' | 'yearly';
  memberSince: string;
  xp: number;
  streak: number;
  lastStreakDate: string;
  roadmapUnlocked: boolean;
}

export type AppScreen = 'splash' | 'auth' | 'onboarding' | 'career-match' | 'skill-assessment' | 'goal-setting' | 'home';
export type HomeTab = 'dashboard' | 'roadmap' | 'practice' | 'interview' | 'simulations' | 'careers' | 'profile';

interface AppState {
  screen: AppScreen;
  homeTab: HomeTab;
  profile: UserProfile;
  surveyAnswers: SurveyAnswer[];
  careers: CareerPath[];
  activeCareer: CareerPath | null;
  dailyChallenge: DailyChallenge | null;
  completedQuizzes: Record<string, string>; // careerId -> dateString
}

interface AppContextType extends AppState {
  setScreen: (s: AppScreen) => void;
  setHomeTab: (t: HomeTab) => void;
  updateProfile: (p: Partial<UserProfile>) => void;
  addSurveyAnswer: (a: SurveyAnswer) => void;
  setSurveyAnswers: (a: SurveyAnswer[]) => void;
  addCareer: (c: CareerPath) => void;
  setActiveCareer: (id: string) => void;
  removeCareer: (id: string) => void;
  updateCareer: (id: string, updates: Partial<CareerPath>) => void;
  clearCareerProgress: (id: string) => void;
  completeTask: (careerId: string, taskId: string) => void;
  completeDailyChallenge: () => void;
  resetProgress: () => void;
  deleteAccount: () => void;
}

const defaultProfile: UserProfile = {
  username: '',
  email: '',
  plan: 'free',
  memberSince: new Date().toISOString(),
  xp: 0,
  streak: 0,
  lastStreakDate: '',
  roadmapUnlocked: false,
};

const defaultState: AppState = {
  screen: 'splash',
  homeTab: 'dashboard',
  profile: defaultProfile,
  surveyAnswers: [],
  careers: [],
  activeCareer: null,
  dailyChallenge: null,
  completedQuizzes: {},
};

const AppContext = createContext<AppContextType | null>(null);

function loadState(): AppState {
  try {
    const saved = localStorage.getItem('pathfindr-state');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Always show splash on app launch
      return { ...defaultState, ...parsed, screen: 'splash' };
    }
  } catch (e) {
    console.error('Error loading state:', e);
  }
  return defaultState;
}

function saveState(state: AppState) {
  try {
    localStorage.setItem('pathfindr-state', JSON.stringify(state));
  } catch (e) {
    console.error('Error saving state:', e);
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const setScreen = useCallback((screen: AppScreen) => setState(s => ({ ...s, screen })), []);
  const setHomeTab = useCallback((homeTab: HomeTab) => setState(s => ({ ...s, homeTab })), []);
  const updateProfile = useCallback((p: Partial<UserProfile>) => setState(s => ({ ...s, profile: { ...s.profile, ...p } })), []);
  const addSurveyAnswer = useCallback((a: SurveyAnswer) => setState(s => ({ ...s, surveyAnswers: [...s.surveyAnswers.filter(x => x.questionIndex !== a.questionIndex), a] })), []);
  const setSurveyAnswers = useCallback((a: SurveyAnswer[]) => setState(s => ({ ...s, surveyAnswers: a })), []);

  const addCareer = useCallback((c: CareerPath) => setState(s => {
    const existingIdx = s.careers.findIndex(x => x.id === c.id);
    let careers = s.careers.map(x => ({ ...x, isActive: false }));

    if (existingIdx !== -1) {
      // Update existing
      careers[existingIdx] = { ...c, isActive: true };
    } else {
      // Add new
      careers = [...careers, { ...c, isActive: true }];
    }

    return { ...s, careers, activeCareer: c };
  }), []);

  const setActiveCareer = useCallback((id: string) => setState(s => {
    const careers = s.careers.map(c => ({ ...c, isActive: c.id === id }));
    return { ...s, careers, activeCareer: careers.find(c => c.id === id) || null };
  }), []);

  const removeCareer = useCallback((id: string) => setState(s => {
    const careers = s.careers.filter(c => c.id !== id);
    const activeCareer = s.activeCareer?.id === id ? (careers[0] || null) : s.activeCareer;
    if (activeCareer && careers.length > 0) {
      const updated = careers.map(c => ({ ...c, isActive: c.id === activeCareer.id }));
      return { ...s, careers: updated, activeCareer };
    }
    return { ...s, careers, activeCareer };
  }), []);

  const updateCareer = useCallback((id: string, updates: Partial<CareerPath>) => setState(s => {
    const careers = s.careers.map(c => c.id === id ? { ...c, ...updates } : c);
    const activeCareer = s.activeCareer?.id === id ? { ...s.activeCareer, ...updates } : s.activeCareer;
    return { ...s, careers, activeCareer };
  }), []);

  const clearCareerProgress = useCallback((id: string) => setState(s => {
    const careers = s.careers.map(c => {
      if (c.id !== id) return c;
      const phases = c.phases.map(p => ({
        ...p,
        tasks: p.tasks.map(t => ({ ...t, completed: false }))
      }));
      return { ...c, phases, progress: 0 };
    });
    const activeCareer = s.activeCareer?.id === id ? careers.find(c => c.id === id) || null : s.activeCareer;
    return { ...s, careers, activeCareer };
  }), []);

  const completeTask = useCallback((careerId: string, taskId: string) => setState(s => {
    const careers = s.careers.map(c => {
      if (c.id !== careerId) return c;
      const phases = c.phases.map(p => ({
        ...p,
        tasks: p.tasks.map(t => t.id === taskId ? { ...t, completed: true } : t),
      }));
      const totalTasks = phases.reduce((a, p) => a + p.tasks.length, 0);
      const completedTasks = phases.reduce((a, p) => a + p.tasks.filter(t => t.completed).length, 0);
      const progress = Math.round((completedTasks / totalTasks) * 100);
      return { ...c, phases, progress };
    });
    const activeCareer = careers.find(c => c.id === careerId) || s.activeCareer;
    return { ...s, careers, activeCareer, profile: { ...s.profile, xp: s.profile.xp + 25 } };
  }), []);

  const completeDailyChallenge = useCallback(() => setState(s => {
    if (!s.activeCareer) return s;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const newStreak = s.profile.lastStreakDate === yesterday ? s.profile.streak + 1 : s.profile.lastStreakDate === today ? s.profile.streak : 1;

    return {
      ...s,
      completedQuizzes: { ...s.completedQuizzes, [s.activeCareer.id]: today },
      profile: { ...s.profile, xp: s.profile.xp + 50, streak: newStreak, lastStreakDate: today },
    };
  }), []);

  const resetProgress = useCallback(() => setState(s => ({
    ...defaultState,
    screen: 'home',
    profile: { ...s.profile, xp: 0, streak: 0, lastStreakDate: '' },
    careers: [],
    activeCareer: null,
  })), []);

  const deleteAccount = useCallback(() => {
    localStorage.removeItem('pathfindr-state');
    setState(defaultState);
  }, []);

  return (
    <AppContext.Provider value={{
      ...state, setScreen, setHomeTab, updateProfile, addSurveyAnswer, setSurveyAnswers,
      addCareer, setActiveCareer, removeCareer, updateCareer, clearCareerProgress, completeTask,
      completeDailyChallenge, resetProgress, deleteAccount,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
