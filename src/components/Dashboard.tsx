import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp, HomeTab } from '@/context/AppContext';
import { getPaceStatus, generateDailyChallenge } from '@/lib/mockAI';
import { Flame, Target, Clock, TrendingUp, Zap, Trophy, ChevronRight, ArrowRightLeft } from 'lucide-react';

export default function Dashboard() {
  const { profile, activeCareer, completeDailyChallenge, setHomeTab, setScreen } = useApp();
  const [challengeAnswer, setChallengeAnswer] = useState<number | null>(null);

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
      <motion.div className="mb-6" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Welcome back, <span className="gradient-text">{profile.username || 'Explorer'}</span>
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Your daily progress overview</p>
      </motion.div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Current Focus */}
        <motion.div className="bento-card md:col-span-2 lg:col-span-1" custom={0} variants={cardVariants} initial="hidden" animate="visible">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-mono">Current Focus</span>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">{activeCareer.title}</h3>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">Level: <span className="text-primary capitalize">{activeCareer.level}</span></span>
            <span className="text-muted-foreground">Score: <span className="text-primary">{activeCareer.skillScore}%</span></span>
          </div>
          <div className="mt-4 h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div className="h-full progress-bar-fill rounded-full" initial={{ width: 0 }} animate={{ width: `${activeCareer.progress}%` }} transition={{ duration: 1 }} />
          </div>
          <p className="text-xs text-muted-foreground mt-2">{activeCareer.progress}% complete</p>
        </motion.div>

        {/* XP & Streak */}
        <motion.div className="bento-card" custom={1} variants={cardVariants} initial="hidden" animate="visible">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-xp" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-mono">XP & Streak</span>
            </div>
          </div>
          <div className="flex items-end gap-6">
            <div>
              <p className="text-3xl font-bold text-xp font-mono">{profile.xp}</p>
              <p className="text-xs text-muted-foreground">Total XP</p>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <Flame className="w-5 h-5 text-streak" />
                <p className="text-3xl font-bold text-streak font-mono">{profile.streak}</p>
              </div>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
          </div>
        </motion.div>

        {/* Timeline Stats */}
        <motion.div className="bento-card" custom={2} variants={cardVariants} initial="hidden" animate="visible">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-accent" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-mono">Timeline</span>
          </div>
          <div className="flex items-end gap-6">
            <div>
              <p className="text-3xl font-bold text-foreground font-mono">{daysRemaining}</p>
              <p className="text-xs text-muted-foreground">Days Left</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground font-mono">{tasksRemaining}</p>
              <p className="text-xs text-muted-foreground">Tasks Left</p>
            </div>
          </div>
        </motion.div>

        {/* Pace Indicator */}
        <motion.div className="bento-card" custom={3} variants={cardVariants} initial="hidden" animate="visible">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-mono">Pace</span>
          </div>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${paceConfig[pace].bg}`}>
            <span className={`text-sm font-semibold ${paceConfig[pace].color}`}>{paceConfig[pace].label}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            {pace === 'ahead' ? 'Great work! You have extra time to deepen your knowledge.' :
             pace === 'behind' ? 'Consider increasing your daily pace to hit your target.' :
             'You\'re perfectly on schedule. Keep it up!'}
          </p>
        </motion.div>

        {/* Daily Challenge */}
        <motion.div className="bento-card md:col-span-2 lg:col-span-2" custom={4} variants={cardVariants} initial="hidden" animate="visible">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-4 h-4 text-xp" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-mono">Daily Challenge</span>
            <span className="ml-auto text-xs text-xp font-mono">+50 XP</span>
          </div>
          {challenge && (
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
