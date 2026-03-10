import { AnimatePresence } from 'framer-motion';
import { AppProvider, useApp } from '@/context/AppContext';
import SplashScreen from '@/components/SplashScreen';
import AuthScreen from '@/components/AuthScreen';
import OnboardingSurvey from '@/components/OnboardingSurvey';
import CareerMatcher from '@/components/CareerMatcher';
import SkillAssessment from '@/components/SkillAssessment';
import GoalSetting from '@/components/GoalSetting';
import HomeScreen from '@/components/HomeScreen';

function AppContent() {
  const { screen } = useApp();

  return (
    <AnimatePresence mode="wait">
      {screen === 'splash' && <SplashScreen key="splash" />}
      {screen === 'auth' && <AuthScreen key="auth" />}
      {screen === 'onboarding' && <OnboardingSurvey key="onboarding" />}
      {screen === 'career-match' && <CareerMatcher key="career-match" />}
      {screen === 'skill-assessment' && <SkillAssessment key="skill-assessment" />}
      {screen === 'goal-setting' && <GoalSetting key="goal-setting" />}
      {screen === 'home' && <HomeScreen key="home" />}
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
