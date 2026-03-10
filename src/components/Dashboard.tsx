import { useMemo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp, HomeTab } from '@/context/AppContext';
import { getPaceStatus, generateDailyChallenge } from '@/lib/mockAI';
import {
  Flame, Target, Clock, TrendingUp, Zap, Trophy, ChevronRight, ArrowRightLeft,
  CheckCircle2, User, Sparkles, Code, ClipboardList, Briefcase, Brain, ChevronDown
} from 'lucide-react';
import NewsHeadline from './NewsHeadline';
import { GlowingEffect } from './ui/glowing-effect';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { profile, activeCareer, careers, setActiveCareer, completeDailyChallenge, setHomeTab, setScreen, completedQuizzes } = useApp();
  const [challengeAnswer, setChallengeAnswer] = useState<number | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const todayStr = new Date().toDateString();
  const isCompletedToday = activeCareer && completedQuizzes[activeCareer.id] === todayStr;

  const challenge = useMemo(() => {
    if (!activeCareer) return null;
    return generateDailyChallenge(activeCareer.id);
  }, [activeCareer]);

  if (!activeCareer) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center p-12 glass rounded-[3rem] border-primary/20 space-y-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <Target className="w-10 h-10 text-primary animate-pulse" />
          </div>
          <h2 className="text-4xl font-black text-foreground tracking-tighter">No Active Objective</h2>
          <p className="text-muted-foreground font-medium max-w-xs mx-auto">Calibrate your career path to begin the synchronization process.</p>
          <button
            onClick={() => { setScreen('onboarding'); }}
            className="gradient-primary px-10 py-4 rounded-2xl text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
          >
            Initiate Onboarding
          </button>
        </div>
      </div>
    );
  }

  const totalTasks = activeCareer.phases.reduce((a, p) => a + p.tasks.length, 0);
  const completedTasks = activeCareer.phases.reduce((a, p) => a + p.tasks.filter(t => t.completed).length, 0);
  const tasksRemaining = totalTasks - completedTasks;
  const daysRemaining = Math.max(0, Math.ceil((new Date(activeCareer.targetDate).getTime() - Date.now()) / 86400000));
  const pace = getPaceStatus(daysRemaining, tasksRemaining);

  const paceConfig = {
    ahead: { label: 'Ahead of Schedule', color: 'text-success', bg: 'bg-success/5' },
    behind: { label: 'Behind Schedule', color: 'text-destructive', bg: 'bg-destructive/5' },
    'on-track': { label: 'On Track', color: 'text-primary', bg: 'bg-primary/5' },
  };

  const handleChallenge = (idx: number) => {
    if (challengeAnswer !== null) return;
    setChallengeAnswer(idx);
    if (challenge && idx === challenge.correctIndex) {
      completeDailyChallenge();
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4 } }),
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 md:p-8 max-w-7xl mx-auto pt-24 md:pt-16">

      {/* 1. Welcome back (Top Left, 2 cols) */}
      <motion.div
        className={cn("md:col-span-2 relative h-full min-h-[220px]", isDropdownOpen && "z-50")}
        custom={1}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ y: -4, scale: 1.005 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div className="relative h-full rounded-[2.5rem] border border-border/50 p-1 md:p-2">
          <GlowingEffect spread={100} glow={true} disabled={false} proximity={128} inactiveZone={0.01} borderWidth={3} />
          <div className={cn("relative h-full rounded-[2.25rem] bg-background p-8", !isDropdownOpen && "overflow-hidden")}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-primary to-accent p-[3px] shadow-2xl shadow-primary/20">
                  <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                    <User className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tighter mb-2 italic">
                    Welcome Back, <span className="text-primary">{profile.username.split(' ')[0]}</span>.
                  </h2>
                  <p className="text-muted-foreground font-medium mb-4">
                    Ready to level up your skills today?
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60">Currently focusing on:</span>
                    <div className="relative" ref={dropdownRef}>
                      <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-3 px-4 py-2 bg-secondary/30 hover:bg-secondary/50 border border-border/50 rounded-xl transition-all group"
                      >
                        <span className="text-sm font-bold text-primary">{activeCareer.title}</span>
                        <ChevronDown className={cn("w-4 h-4 text-primary/60 transition-transform duration-300", isDropdownOpen && "rotate-180")} />
                      </button>

                      <AnimatePresence>
                        {isDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute top-full left-0 mt-3 w-64 glass rounded-2xl overflow-hidden z-50 border border-border/50 shadow-2xl"
                          >
                            <div className="p-2 space-y-1">
                              {careers.map((career) => (
                                <button
                                  key={career.id}
                                  onClick={() => {
                                    setActiveCareer(career.id);
                                    setIsDropdownOpen(false);
                                  }}
                                  className={cn(
                                    "w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between group",
                                    career.id === activeCareer.id
                                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                      : "hover:bg-secondary text-foreground"
                                  )}
                                >
                                  {career.title}
                                  {career.id === activeCareer.id && <CheckCircle2 className="w-4 h-4" />}
                                </button>
                              ))}
                              <div className="h-px bg-border/50 my-1" />
                              <button
                                onClick={() => {
                                  setScreen('onboarding');
                                  setIsDropdownOpen(false);
                                }}
                                className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold text-accent hover:bg-accent/10 transition-all flex items-center gap-2"
                              >
                                <span>+</span> Add New Path
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Abstract decorative background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full -translate-y-32 translate-x-32" />
          </div>
        </div>
      </motion.div>

      {/* 2. Quick Actions (Top Right, 1 col) */}
      <motion.div
        className="md:col-span-1 relative h-full"
        custom={2}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div className="relative h-full rounded-[2.5rem] border border-border/50 p-1 md:p-2">
          <GlowingEffect spread={80} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
          <div className="relative h-full flex flex-col justify-between rounded-[2.25rem] bg-background p-6 md:p-8 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em]">Quick Access</h3>
              <Zap className="w-4 h-4 text-primary/40" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Practice', icon: Code, tab: 'practice', color: 'text-primary' },
                { label: 'Tasks', icon: ClipboardList, tab: 'roadmap', color: 'text-accent' },
                { label: 'Careers', icon: Briefcase, tab: 'careers', color: 'text-success' },
                { label: 'Profile', icon: User, tab: 'profile', color: 'text-streak' }
              ].map((act) => (
                <button key={act.label} onClick={() => setHomeTab(act.tab as HomeTab)} className="flex flex-col items-center justify-center p-4 glass rounded-2xl hover:bg-secondary/50 transition-all group">
                  <act.icon className={`w-6 h-6 mb-2 ${act.color} group-hover:scale-110 transition-transform`} />
                  <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">{act.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* 3. Daily Quiz (Mid Left, 1 col) */}
      <motion.div
        className="md:col-span-1 relative h-full min-h-[300px]"
        custom={3}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div className="relative h-full rounded-[2.5rem] border border-border/50 p-1 md:p-2">
          <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} variant="white" />
          <div className="relative h-full flex flex-col rounded-[2.25rem] bg-background p-6 md:p-8 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <Brain className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xs font-black text-foreground uppercase tracking-[0.2em]">Daily IQ Quiz</span>
              </div>
              {isCompletedToday && <CheckCircle2 className="w-5 h-5 text-success" />}
            </div>

            {isCompletedToday ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-success" />
                </div>
                <h4 className="text-xl font-black text-foreground">Mission Complete</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">Knowledge base synchronized. Return tomorrow for new insights.</p>
              </div>
            ) : challenge && (
              <div className="flex-1 flex flex-col">
                <p className="text-sm font-semibold text-foreground mb-6 leading-relaxed flex-1">{challenge.question}</p>
                <div className="space-y-2">
                  {challenge.options.map((opt, i) => {
                    let style = 'border-border/50 bg-secondary/10 hover:border-primary/50 hover:bg-secondary/20';
                    if (challengeAnswer !== null) {
                      if (i === challenge.correctIndex) style = 'border-success bg-success/10 ring-2 ring-success/20';
                      else if (i === challengeAnswer) style = 'border-destructive bg-destructive/10 ring-2 ring-destructive/20';
                    }
                    return (
                      <button key={i} onClick={() => handleChallenge(i)} disabled={challengeAnswer !== null} className={`w-full text-left p-3 rounded-xl border ${style} transition-all text-xs font-bold leading-tight flex items-center gap-3 group`}>
                        <span className="text-primary font-mono opacity-50 group-hover:opacity-100">{String.fromCharCode(65 + i)}</span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* 4. Current Focus (Mid Middle, 1 col) */}
      <motion.div
        className="md:col-span-1 relative h-full"
        custom={4}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div className="relative h-full rounded-[2.5rem] border border-border/50 p-1 md:p-2">
          <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
          <div className="relative h-full flex flex-col justify-between rounded-[2.25rem] bg-background p-8 overflow-hidden">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="p-1.5 bg-accent/10 rounded-lg">
                  <Target className="w-5 h-5 text-accent" />
                </div>
                <span className="text-xs font-black text-foreground uppercase tracking-[0.2em]">Active Objective</span>
              </div>
              <h3 className="text-2xl font-black text-foreground mb-4 leading-tight">{activeCareer.title}</h3>
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-primary/5 border border-primary/20 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{activeCareer.level}</span>
                <span className="bg-accent/5 border border-accent/20 text-accent px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">IQ: {typeof activeCareer.skillScore === 'number' ? activeCareer.skillScore.toFixed(2) : activeCareer.skillScore}</span>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em]">
                <span className="text-muted-foreground">Calibration</span>
                <span className="text-primary font-mono">{activeCareer.progress}%</span>
              </div>
              <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden p-[2px]">
                <motion.div className="h-full gradient-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.2)]" initial={{ width: 0 }} animate={{ width: `${activeCareer.progress}%` }} transition={{ duration: 1, delay: 0.5 }} />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 5. Pace (Mid Right, 1 col) */}
      <motion.div
        className="md:col-span-1 relative h-full"
        custom={5}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div className="relative h-full rounded-[2.5rem] border border-border/50 p-1 md:p-2">
          <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
          <div className="relative h-full flex items-center justify-between px-8 rounded-[2.25rem] bg-background overflow-hidden p-8">
            <div className="flex flex-col gap-4">
              <div className={`w-14 h-14 rounded-3xl ${paceConfig[pace].bg} flex items-center justify-center p-3 transition-transform hover:scale-110 duration-500 shadow-xl`}>
                <TrendingUp className={`w-8 h-8 ${paceConfig[pace].color}`} />
              </div>
              <div>
                <h4 className="text-3xl font-black text-foreground font-mono leading-none">{paceConfig[pace].label}</h4>
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black mt-2">Operational Pace</p>
              </div>
            </div>
            <div className="h-px w-16 bg-border/40 rotate-90" />
          </div>
        </div>
      </motion.div>

      {/* 6. Total XP (Lower Left, 1 col) */}
      <motion.div
        className="md:col-span-1 relative h-full"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        whileHover={{ y: -4, scale: 1.01 }}
      >
        <div className="relative h-full rounded-[2rem] border border-border/50 p-1">
          <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} variant="white" />
          <div className="relative h-full flex items-center justify-between px-8 py-6 rounded-[1.75rem] bg-background overflow-hidden">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-xp/10 flex items-center justify-center ring-1 ring-xp/30">
                <Zap className="w-6 h-6 text-xp" />
              </div>
              <div>
                <p className="text-2xl font-black text-foreground font-mono leading-none">{profile.xp}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold mt-2">Tactical Credits</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 7. Streak (Lower Middle, 1 col) */}
      <motion.div
        className="md:col-span-1 relative h-full"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        whileHover={{ y: -4, scale: 1.01 }}
      >
        <div className="relative h-full rounded-[2rem] border border-border/50 p-1">
          <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} variant="white" />
          <div className="relative h-full flex items-center justify-between px-8 py-6 rounded-[1.75rem] bg-background overflow-hidden">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-streak/10 flex items-center justify-center ring-1 ring-streak/30">
                <Flame className="w-6 h-6 text-streak" />
              </div>
              <div>
                <p className="text-2xl font-black text-foreground font-mono leading-none">{profile.streak}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold mt-2">Active Sequence</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 8. Days Left (Lower Right, 1 col) */}
      <motion.div
        className="md:col-span-1 relative h-full"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        whileHover={{ y: -4, scale: 1.01 }}
      >
        <div className="relative h-full rounded-[2rem] border border-border/50 p-1">
          <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} variant="white" />
          <div className="relative h-full flex items-center justify-between px-8 py-6 rounded-[1.75rem] bg-background overflow-hidden">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center ring-1 ring-accent/30">
                <Clock className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-black text-foreground font-mono leading-none">{daysRemaining}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold mt-2">Days Remaining</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 9. Tasks Left (Special Row, 2 cols center) */}
      <motion.div
        className="md:col-span-3 relative h-28"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.9 }}
        whileHover={{ y: -4, scale: 1.005 }}
      >
        <div className="relative h-full rounded-[2.25rem] border border-border/50 p-1 max-w-2xl mx-auto w-full">
          <GlowingEffect spread={120} glow={true} disabled={false} proximity={128} inactiveZone={0.01} borderWidth={3} />
          <div className="relative h-full flex items-center justify-between px-10 rounded-[2.1rem] bg-background overflow-hidden ring-1 ring-primary/5">
            <div className="flex items-center gap-8 flex-1">
              <div className="w-14 h-14 rounded-3xl bg-primary/10 flex items-center justify-center shadow-lg transform rotate-3">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-4xl font-black text-foreground font-mono leading-none tracking-tighter">{tasksRemaining}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.4em] font-black mt-2">Operations to Synchronization Complete</p>
              </div>
            </div>
            <ArrowRightLeft className="w-6 h-6 text-primary/30 animate-pulse hidden md:block" />
          </div>
        </div>
      </motion.div>

      {/* 10. Career Insights (Full Row at the bottom) */}
      <motion.div
        className="md:col-span-3 relative min-h-[450px]"
        custom={10}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ y: -4, scale: 1.002 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div className="relative h-full rounded-[3rem] border border-border/50 p-1 md:p-2 shadow-2xl">
          <GlowingEffect spread={100} glow={true} disabled={false} proximity={128} inactiveZone={0.01} borderWidth={4} />
          <div className="relative h-full rounded-[2.75rem] bg-background overflow-hidden border border-border/20 shadow-inner">
            <NewsHeadline />
          </div>
        </div>
      </motion.div>

    </div>
  );
}
