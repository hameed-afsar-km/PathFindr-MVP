import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useERP } from '@/context/ERPContext';
import { AppProvider, useApp } from '@/context/AppContext';
import { INSTITUTE_THEMES } from '@/types/saas';
import type { Institute, Announcement } from '@/types/saas';
import HomeScreen from '@/components/HomeScreen';
import SplashScreen from '@/components/SplashScreen';
import OnboardingSurvey from '@/components/OnboardingSurvey';
import CareerMatcher from '@/components/CareerMatcher';
import SkillAssessment from '@/components/SkillAssessment';
import GoalSetting from '@/components/GoalSetting';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import {
  LogOut, GraduationCap, Sparkles, Shield, BookOpen,
  MessageCircle, Map, Dumbbell, Briefcase, Gamepad2, XCircle, Lock, Megaphone
} from 'lucide-react';
import { cn } from '@/lib/utils';

function FeatureDisabledBanner({ feature }: { feature: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6"
      >
        <Lock className="w-10 h-10 text-white/20" />
      </motion.div>
      <h3 className="text-xl font-black text-white mb-2">{feature} Unavailable</h3>
      <p className="text-sm text-white/40 max-w-xs">
        This feature hasn't been enabled for your institute. Contact your administrator.
      </p>
    </div>
  );
}

function InstituteBadge({ inst }: { inst: Institute }) {
  const theme = INSTITUTE_THEMES.find(t => t.id === inst.theme) ?? INSTITUTE_THEMES[0];
  return (
    <div className="flex items-center gap-3 min-w-0 pr-4">
      <div
        className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-lg overflow-hidden bg-[#221b33]"
        style={!inst.logoUrl ? { background: `linear-gradient(135deg, hsl(${theme.primary}), hsl(${theme.accent}))` } : {}}
      >
        {inst.logoUrl ? <img src={inst.logoUrl} alt="Logo" className="w-full h-full object-cover" /> : inst.logoInitials}
      </div>
      {!inst.whiteLabel ? (
        <div className="hidden sm:flex flex-col min-w-0">
          <span className="text-sm font-bold text-white truncate">{inst.name}</span>
          <span className="text-[10px] text-white/40 font-medium tracking-wide shrink-0">Powered by PathFindr.AI</span>
        </div>
      ) : (
        <div className="hidden sm:flex min-w-0">
          <span className="text-sm font-bold text-white truncate">
            {inst.name}
          </span>
        </div>
      )}
    </div>
  );
}

function ImportantAnnouncements({ announcements }: { announcements?: Announcement[] }) {
  if (!announcements || announcements.length === 0) return null;
  const active = announcements.filter(a => a.important);
  if (active.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-red-500/20 border-b border-red-500/30 text-white px-4 py-2.5 z-40 relative backdrop-blur-md flex items-center justify-center shadow-lg"
    >
      <div className="flex items-center gap-3 w-full max-w-5xl">
        <Megaphone className="w-4 h-4 text-red-400 animate-pulse shrink-0" />
        <p className="text-xs font-bold w-full truncate">
          <span className="text-red-300 uppercase tracking-widest mr-2 text-[10px]">Important</span>
          {active[0].title} — <span className="text-white/70 font-normal">{active[0].content}</span>
        </p>
      </div>
    </motion.div>
  );
}

function StudentAppContent({ inst }: { inst: Institute }) {
  const { screen, setScreen } = useApp();
  const { session, logout } = useERP();

  useEffect(() => {
    if (screen === 'splash') {
      const t = setTimeout(() => setScreen('auth'), 800);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col">
      <AnimatedBackground />

      {/* Top bar */}
      {screen !== 'splash' && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <motion.header
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-2xl border-b border-white/10 shadow-xl"
          >
            <InstituteBadge inst={inst} />
            <div className="flex items-center gap-4 shrink-0">
              {session && (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block text-right">
                    <span className="text-sm text-white font-bold block truncate max-w-[150px]">{session.username}</span>
                    <span className="text-[10px] text-white/40 block tracking-wide">Student Area</span>
                  </div>
                  {(() => {
                    const student = inst.students.find(s => s.username === session.username || s.email === session.email);
                    if (student?.avatarUrl) {
                      return <img src={student.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover border-2 border-white/10 hidden sm:block" />;
                    }
                    return (
                      <div className="w-10 h-10 rounded-full bg-violet-500/20 border border-violet-500/30 font-bold text-violet-300 text-sm hidden sm:flex items-center justify-center">
                        {session.username.substring(0, 2).toUpperCase()}
                      </div>
                    );
                  })()}
                </div>
              )}
              <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />
              <button
                onClick={logout}
                title="Sign out"
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10
                           text-white/60 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10
                           transition-all shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </motion.header>

          <ImportantAnnouncements announcements={inst.announcements} />
        </div>
      )}

      {/* Main app screens offset container */}
      <AnimatePresence mode="wait">
        {screen === 'splash' && <SplashScreen key="splash" />}
        {screen === 'auth' && <ERPStudentAuth key="auth" inst={inst} />}
        {screen === 'onboarding' && <OnboardingSurvey key="onboarding" />}
        {screen === 'career-match' && <CareerMatcher key="career-match" />}
        {screen === 'skill-assessment' && <SkillAssessment key="skill-assessment" />}
        {screen === 'goal-setting' && <GoalSetting key="goal-setting" />}
        {screen === 'home' && <FeatureGatedHome key="home" inst={inst} />}
      </AnimatePresence>
    </div>
  );
}

function ERPStudentAuth({ inst }: { inst: Institute }) {
  const { updateProfile, setScreen } = useApp();
  const { session } = useERP();

  useEffect(() => {
    if (session) {
      updateProfile({
        username: session.username,
        email: session.email,
        memberSince: session.loggedInAt,
      });
      setTimeout(() => setScreen('onboarding'), 400);
    }
  }, []);

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 1.4 }}
        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/30 to-purple-600/30
                   border border-violet-500/30 flex items-center justify-center mb-4"
      >
        <GraduationCap className="w-8 h-8 text-violet-400" />
      </motion.div>
      <p className="text-white/60 text-sm font-medium">Entering Platform…</p>
    </motion.div>
  );
}

function FeatureGatedHome({ inst }: { inst: Institute }) {
  const { homeTab } = useApp();
  const hasImportant = (inst.announcements?.filter(a => a.important)?.length || 0) > 0;

  // Create safe padding so content is visible below headers
  const topPadding = hasImportant ? 'pt-[110px]' : 'pt-[80px]';

  const tabFeatureMap: Record<string, keyof typeof inst.features> = {
    roadmap: 'roadmap',
    practice: 'practice',
    interview: 'interview',
    simulations: 'simulations',
    careers: 'careers',
  };

  const featureKey = tabFeatureMap[homeTab];
  if (featureKey && !inst.features[featureKey as keyof typeof inst.features]) {
    return (
      <div className={topPadding}>
        <FeatureDisabledBanner
          feature={featureKey.charAt(0).toUpperCase() + featureKey.slice(1)}
        />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-screen", topPadding)}>
      <HomeScreen />
    </div>
  );
}

export default function StudentERPWrapper() {
  const { session, institutes, applyInstituteTheme } = useERP();
  const inst = institutes.find(i => i.id === session?.instituteId);

  useEffect(() => {
    if (inst) applyInstituteTheme(inst.theme);
  }, [inst?.theme]);

  if (!inst) {
    return (
      <div className="min-h-screen bg-[hsl(255_45%_12%)] flex items-center justify-center">
        <div className="text-center text-white/40">
          <Shield className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-bold text-sm">Session invalid. Please log in again.</p>
        </div>
      </div>
    );
  }

  return (
    <AppProvider>
      <StudentAppContent inst={inst} />
    </AppProvider>
  );
}
