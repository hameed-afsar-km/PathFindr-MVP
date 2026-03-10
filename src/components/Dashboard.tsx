import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp, HomeTab } from '@/context/AppContext';
import { getPaceStatus, generateDailyChallenge } from '@/lib/mockAI';
import { Flame, Target, Clock, TrendingUp, Zap, Trophy, ChevronRight, ArrowRightLeft, CheckCircle2 } from 'lucide-react';
import NewsHeadline from './NewsHeadline';

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
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        className="mb-8 p-8 rounded-3xl relative overflow-hidden glass border-primary/20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10 z-0"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.2),transparent_50%)] z-0"></div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">
            Welcome back, <br className="hidden md:block" />
            <span className="gradient-text">{profile.username || 'Explorer'}</span>
          </h1>
          <p className="text-muted-foreground text-lg mt-3">Ready to conquer your goals today?</p>
        </div>
      </motion.div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Current Focus */}
        <motion.div className="bento-card md:col-span-2 lg:col-span-2 relative overflow-hidden group" custom={0} variants={cardVariants} initial="hidden" animate="visible">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold text-primary uppercase tracking-widest">Current Focus</span>
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-2">{activeCareer.title}</h3>
              <div className="flex items-center gap-4 text-sm mt-2 bg-background/50 inline-flex px-4 py-2 rounded-lg border border-border/50">
                <span className="text-muted-foreground">Level: <span className="text-foreground capitalize font-medium">{activeCareer.level}</span></span>
                <div className="w-1 h-1 rounded-full bg-border"></div>
                <span className="text-muted-foreground">Score: <span className="text-foreground font-medium">{activeCareer.skillScore}%</span></span>
              </div>
            </div>
            <div className="mt-8">
              <div className="flex justify-between text-sm mb-2 font-medium">
                <span className="text-muted-foreground">Progress Completion</span>
                <span className="text-primary">{activeCareer.progress}%</span>
              </div>
              <div className="h-3 bg-background rounded-full overflow-hidden shadow-inner">
                <motion.div className="h-full progress-bar-fill rounded-full" initial={{ width: 0 }} animate={{ width: `${activeCareer.progress}%` }} transition={{ duration: 1, delay: 0.5 }} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Pace Indicator */}
        <motion.div className="bento-card flex flex-col items-center justify-center text-center relative overflow-hidden" custom={3} variants={cardVariants} initial="hidden" animate="visible">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 mb-4">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-2">Pace</span>
          <div className={`px-4 py-1.5 rounded-full ${paceConfig[pace].bg} mb-3`}>
            <span className={`text-sm font-bold ${paceConfig[pace].color}`}>{paceConfig[pace].label}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {pace === 'ahead' ? 'Great work! You have extra time.' :
              pace === 'behind' ? 'Consider increasing your daily pace.' :
                'You\'re perfectly on schedule.'}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div className="bento-card md:col-span-2 lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4 p-0 bg-transparent border-none shadow-none" custom={1} variants={cardVariants} initial="hidden" animate="visible">
          <div className="glass rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-primary/50 transition-colors">
            <Zap className="w-6 h-6 text-xp mb-2" />
            <p className="text-3xl font-bold text-foreground font-mono">{profile.xp}</p>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">Total XP</p>
          </div>
          <div className="glass rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-streak/50 transition-colors">
            <Flame className="w-6 h-6 text-streak mb-2" />
            <p className="text-3xl font-bold text-foreground font-mono">{profile.streak}</p>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">Day Streak</p>
          </div>
          <div className="glass rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-accent/50 transition-colors">
            <Clock className="w-6 h-6 text-accent mb-2" />
            <p className="text-3xl font-bold text-foreground font-mono">{daysRemaining}</p>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">Days Left</p>
          </div>
          <div className="glass rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-primary/50 transition-colors">
            <Target className="w-6 h-6 text-primary mb-2" />
            <p className="text-3xl font-bold text-foreground font-mono">{tasksRemaining}</p>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">Tasks Left</p>
          </div>
        </motion.div>

        {/* Daily Challenge */}
        <motion.div className="bento-card md:col-span-2 lg:col-span-2 transition-all" custom={4} variants={cardVariants} initial="hidden" animate="visible">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-4 h-4 text-xp" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-mono">Daily Challenge</span>
            <span className="ml-auto text-xs text-xp font-mono">+50 XP</span>
          </div>
          {isCompletedToday ? (
            <div className="flex flex-col items-center justify-center py-8 text-center bg-success/5 rounded-2xl border border-success/20">
              <CheckCircle2 className="w-12 h-12 text-success mb-3 animate-bounce" />
              <h4 className="text-xl font-bold text-foreground mb-1">Challenge Completed!</h4>
              <p className="text-sm text-muted-foreground">You've mastered today's insight for this career.</p>
              <p className="text-xs text-success font-medium mt-4 uppercase tracking-[0.2em]">Come back tomorrow</p>
            </div>
          ) : challenge && (
            <>
              <p className="text-foreground font-semibold mb-4">{challenge.question}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
                      className={`text-left glass px-4 py-3 rounded-lg text-sm text-foreground transition-all border ${style}`}
                    >
                      <span className="text-primary font-mono mr-2">{String.fromCharCode(65 + i)}</span>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {challengeAnswer !== null && (
                <motion.p
                  className="mt-4 text-sm text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {challenge.explanation}
                </motion.p>
              )}
            </>
          )}
        </motion.div>

        {/* News Headline Component */}
        <motion.div custom={6} variants={cardVariants} initial="hidden" animate="visible" className="lg:col-span-1">
          <NewsHeadline />
        </motion.div>

        {/* Quick Actions */}
        <motion.div className="bento-card" custom={5} variants={cardVariants} initial="hidden" animate="visible">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-4 block">Quick Actions</span>
          <div className="space-y-2">
            <button
              onClick={() => setHomeTab('roadmap')}
              className="w-full flex items-center justify-between glass px-4 py-3 rounded-lg text-sm text-foreground hover:border-primary/30 transition-all"
            >
              View Roadmap <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => setHomeTab('careers')}
              className="w-full flex items-center justify-between glass px-4 py-3 rounded-lg text-sm text-foreground hover:border-primary/30 transition-all"
            >
              <span className="flex items-center gap-2"><ArrowRightLeft className="w-3 h-3" /> Switch Career</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => setHomeTab('practice')}
              className="w-full flex items-center justify-between glass px-4 py-3 rounded-lg text-sm text-foreground hover:border-primary/30 transition-all"
            >
              Practice Arena <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
