import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp, HomeTab } from '@/context/AppContext';
import { getPaceStatus, generateDailyChallenge } from '@/lib/mockAI';
import { Flame, Target, Clock, TrendingUp, Zap, Trophy, ChevronRight, ArrowRightLeft, CheckCircle2 } from 'lucide-react';
import NewsHeadline from './NewsHeadline';
import { GlowingEffect } from './ui/glowing-effect';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { profile, activeCareer, completeDailyChallenge, setHomeTab, setScreen, completedQuizzes } = useApp();
  const [challengeAnswer, setChallengeAnswer] = useState<number | null>(null);

  const todayStr = new Date().toDateString();
  const isCompletedToday = activeCareer && completedQuizzes[activeCareer.id] === todayStr;

  const challenge = useMemo(() => {
    if (!activeCareer) return null;
    return generateDailyChallenge(activeCareer.id);
  }, [activeCareer]);

  if (!activeCareer) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">No active career</h2>
          <button
            onClick={() => { setScreen('onboarding'); }}
            className="glass glow-primary px-8 py-3 rounded-xl text-primary font-semibold"
          >
            Start a new path
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
    ahead: { label: 'Ahead of Schedule', color: 'text-success', bg: 'bg-success/10' },
    behind: { label: 'Behind Schedule', color: 'text-destructive', bg: 'bg-destructive/10' },
    'on-track': { label: 'On Track', color: 'text-primary', bg: 'bg-primary/10' },
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
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Section: Welcome + Quick Actions */}
      <div className="flex flex-col md:flex-row gap-6">
        <motion.div
          className="flex-1 p-8 rounded-[2rem] relative overflow-hidden border border-border/50 bg-background shadow-sm min-h-[180px] flex flex-col justify-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
          <div className="relative z-10">
            <h1 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">
              Welcome back, <br className="hidden md:block" />
              <span className="gradient-text">{profile.username || 'Explorer'}</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-lg mt-3">Ready to conquer your goals today?</p>
          </div>
        </motion.div>

        <motion.div
          className="w-full md:w-[300px] p-6 rounded-[2rem] relative overflow-hidden border border-border/50 bg-background shadow-sm flex flex-col justify-center"
          custom={5} variants={cardVariants} initial="hidden" animate="visible"
        >
          <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
          <div className="relative z-10">
            <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-mono mb-4 block">Quick Actions</span>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
              <button onClick={() => setHomeTab('roadmap')} className="flex items-center justify-between glass px-4 py-2.5 rounded-xl text-xs font-semibold text-foreground hover:border-primary/30 transition-all">
                Roadmap <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
              <button onClick={() => setHomeTab('careers')} className="flex items-center justify-between glass px-4 py-2.5 rounded-xl text-xs font-semibold text-foreground hover:border-primary/30 transition-all">
                <span className="flex items-center gap-2"><ArrowRightLeft className="w-3 h-3" /> Path</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Daily Challenge */}
        <motion.div className="md:col-span-2 p-6 rounded-[2rem] relative overflow-hidden border border-border/50 bg-background shadow-sm transition-all" custom={4} variants={cardVariants} initial="hidden" animate="visible">
          <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
          <div className="relative z-10 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-4 h-4 text-xp" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-mono">Daily Challenge</span>
              <span className="ml-auto text-xs text-xp font-mono">+50 XP</span>
            </div>
            {isCompletedToday ? (
              <div className="flex-1 flex flex-col items-center justify-center py-6 text-center bg-success/5 rounded-2xl border border-success/20">
                <CheckCircle2 className="w-10 h-10 text-success mb-2 animate-bounce" />
                <h4 className="text-lg font-bold text-foreground mb-1">Challenge Completed!</h4>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Come back tomorrow</p>
              </div>
            ) : challenge && (
              <>
                <p className="text-foreground font-semibold mb-4 text-lg">{challenge.question}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {challenge.options.map((opt, i) => {
                    let style = 'border-border hover:border-primary/30';
                    if (challengeAnswer !== null) {
                      if (i === challenge.correctIndex) style = 'border-success bg-success/10';
                      else if (i === challengeAnswer) style = 'border-destructive bg-destructive/10';
                    }
                    return (
                      <button
                        key={i}
                        onClick={() => handleChallenge(i)}
                        className={`text-left glass px-4 py-3 rounded-xl text-sm text-foreground transition-all border ${style}`}
                      >
                        <span className="text-primary font-mono mr-2">{String.fromCharCode(65 + i)}</span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Current Focus */}
        <motion.div className="p-6 rounded-[2rem] relative overflow-hidden border border-border/50 bg-background shadow-sm group" custom={0} variants={cardVariants} initial="hidden" animate="visible">
          <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold text-primary uppercase tracking-widest">Focus</span>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2 leading-tight">{activeCareer.title}</h3>
              <div className="flex flex-wrap items-center gap-3 text-xs mt-4">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full capitalize">{activeCareer.level}</span>
                <span className="bg-accent/10 text-accent px-3 py-1 rounded-full">Score: {activeCareer.skillScore}%</span>
              </div>
            </div>
            <div className="mt-8">
              <div className="flex justify-between text-xs mb-2 font-mono uppercase tracking-widest">
                <span className="text-muted-foreground">Progress</span>
                <span className="text-primary">{activeCareer.progress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div className="h-full progress-bar-fill rounded-full" initial={{ width: 0 }} animate={{ width: `${activeCareer.progress}%` }} transition={{ duration: 1, delay: 0.5 }} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stats Row 1: Pace, XP, Streak */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div className="p-6 rounded-[2rem] relative overflow-hidden border border-border/50 bg-background shadow-sm flex flex-col items-center text-center" custom={3} variants={cardVariants} initial="hidden" animate="visible">
          <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
          <div className="relative z-10">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 mb-3 mx-auto">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-mono mb-2 block">Pace</span>
            <div className={`px-4 py-1 rounded-full ${paceConfig[pace].bg} mb-3 inline-block`}>
              <span className={`text-xs font-bold ${paceConfig[pace].color}`}>{paceConfig[pace].label}</span>
            </div>
          </div>
        </motion.div>

        <motion.div className="p-6 rounded-[2rem] relative overflow-hidden border border-border/50 bg-background shadow-sm flex flex-col items-center text-center">
          <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
          <div className="relative z-10">
            <Zap className="w-6 h-6 text-xp mb-2 mx-auto" />
            <p className="text-3xl font-bold text-foreground font-mono">{profile.xp}</p>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-[0.2em]">Total XP</p>
          </div>
        </motion.div>

        <motion.div className="p-6 rounded-[2rem] relative overflow-hidden border border-border/50 bg-background shadow-sm flex flex-col items-center text-center">
          <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
          <div className="relative z-10">
            <Flame className="w-6 h-6 text-streak mb-2 mx-auto" />
            <p className="text-3xl font-bold text-foreground font-mono">{profile.streak}</p>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-[0.2em]">Streak</p>
          </div>
        </motion.div>
      </div>

      {/* Stats Row 2: Days Left, Tasks Left */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div className="p-6 rounded-[2rem] relative overflow-hidden border border-border/50 bg-background shadow-sm flex items-center justify-between">
          <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
          <div className="relative z-10 flex items-center gap-4">
            <div className="p-3 bg-accent/10 rounded-2xl"><Clock className="w-6 h-6 text-accent" /></div>
            <div className="text-left">
              <p className="text-3xl font-bold text-foreground font-mono">{daysRemaining}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Days Remaining</p>
            </div>
          </div>
        </motion.div>

        <motion.div className="p-6 rounded-[2rem] relative overflow-hidden border border-border/50 bg-background shadow-sm flex items-center justify-between">
          <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
          <div className="relative z-10 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl"><Target className="w-6 h-6 text-primary" /></div>
            <div className="text-left">
              <p className="text-3xl font-bold text-foreground font-mono">{tasksRemaining}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Tasks to go</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Career Insights (Full Row) */}
      <motion.div className="rounded-[2rem] relative overflow-hidden border border-border/50 bg-background shadow-sm" custom={6} variants={cardVariants} initial="hidden" animate="visible">
        <GlowingEffect spread={100} glow={true} disabled={false} proximity={128} inactiveZone={0.01} borderWidth={3} />
        <NewsHeadline />
      </motion.div>
    </div>
  );
}
