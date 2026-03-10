import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { getSimulationScenarios } from '@/lib/mockAI';
import { Play, Zap, CheckCircle2, XCircle, ArrowLeft, Brain, Sparkles } from 'lucide-react';
import { GlowingEffect } from './ui/glowing-effect';

export default function Simulations() {
  const { updateProfile, profile } = useApp();
  const [started, setStarted] = useState(false);
  const [currentSim, setCurrentSim] = useState(0);
  const [answered, setAnswered] = useState<number | null>(null);
  const [totalXP, setTotalXP] = useState(0);
  const scenarios = getSimulationScenarios();

  const handleAnswer = (idx: number) => {
    if (answered !== null) return;
    setAnswered(idx);
    const option = scenarios[currentSim].options[idx];
    if (option.correct) {
      setTotalXP(x => x + option.xp);
      updateProfile({ xp: profile.xp + option.xp });
    }
  };

  const nextSim = () => {
    if (currentSim < scenarios.length - 1) {
      setCurrentSim(c => c + 1);
      setAnswered(null);
    }
  };

  if (!started) {
    return (
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">Career Simulations</h1>
          <p className="text-muted-foreground max-w-xl">Step into the shoes of a lead developer and navigate high-stakes technical scenarios.</p>
        </div>

        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ y: -4, scale: 1.002 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="relative rounded-[3rem] border border-border/50 p-2 md:p-4">
            <GlowingEffect spread={120} glow={true} disabled={false} proximity={128} inactiveZone={0.01} borderWidth={3} />
            <div className="relative z-10 p-12 md:p-20 rounded-[2.5rem] bg-background overflow-hidden text-center">
              <div className="relative inline-block mb-10 group">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full group-hover:bg-primary/30 transition-all" />
                <div className="relative p-6 bg-primary/10 rounded-2xl border border-primary/20">
                  <Play className="w-12 h-12 text-primary fill-primary/20" />
                </div>
              </div>

              <h2 className="text-2xl md:text-4xl font-extrabold text-foreground mb-4 tracking-tight leading-tight">Interactive Career Architect</h2>
              <p className="max-w-md mx-6 text-muted-foreground mb-12 leading-relaxed">
                Face realistic career scenarios, from system failures to stakeholder conflicts. Earn XP for making strategic decisions.
              </p>

              <button
                onClick={() => setStarted(true)}
                className="px-12 py-5 gradient-primary rounded-2xl text-primary-foreground font-black text-sm uppercase tracking-[0.3em] overflow-hidden group relative shadow-2xl shadow-primary/30"
              >
                <span className="relative z-10">Initialize Simulation</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const sim = scenarios[currentSim];

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setStarted(false)}
            className="p-2 bg-secondary rounded-xl text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <h2 className="text-xl md:text-2xl font-black text-foreground">Scenario {currentSim + 1}</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{currentSim + 1} of {scenarios.length} tasks</p>
          </div>
        </div>

        <div className="bg-primary/10 border border-primary/20 px-4 py-2 rounded-2xl flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          <span className="font-mono text-sm font-black text-primary">{totalXP} XP EARNED</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentSim}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="relative min-h-[450px]"
        >
          <div className="relative h-full rounded-[2.5rem] border border-border/50 p-1 md:p-2">
            <GlowingEffect spread={80} glow={true} disabled={false} proximity={128} inactiveZone={0.01} borderWidth={3} />
            <div className="relative h-full flex flex-col p-8 md:p-12 rounded-[2.25rem] bg-background overflow-hidden">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Brain className="w-5 h-5 text-primary" />
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Context Analysis</span>
              </div>

              <p className="text-xl md:text-2xl font-bold text-foreground leading-relaxed mb-10">
                {sim.scenario}
              </p>

              <div className="grid grid-cols-1 gap-4 flex-1">
                {sim.options.map((opt, i) => {
                  let statusStyle = 'border-border/50 bg-secondary/10 hover:border-primary/50 hover:bg-secondary/20';
                  let icon = <div className="w-2 h-2 rounded-full bg-border group-hover:bg-primary transition-colors" />;

                  if (answered !== null) {
                    if (opt.correct) {
                      statusStyle = 'border-success bg-success/10 cursor-default ring-2 ring-success/20';
                      icon = <CheckCircle2 className="w-5 h-5 text-success shrink-0" />;
                    }
                    else if (i === answered) {
                      statusStyle = 'border-destructive bg-destructive/10 cursor-default ring-2 ring-destructive/20';
                      icon = <XCircle className="w-5 h-5 text-destructive shrink-0" />;
                    }
                    else {
                      statusStyle = 'border-border/20 opacity-40 cursor-default';
                    }
                  }

                  return (
                    <motion.button
                      key={i}
                      whileHover={{ x: 8, scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      onClick={() => handleAnswer(i)}
                      disabled={answered !== null}
                      className={`group relative flex items-center gap-5 text-left p-6 rounded-2xl text-sm font-semibold text-foreground transition-all border ${statusStyle}`}
                    >
                      {icon}
                      <span className="flex-1 leading-snug">{opt.text}</span>
                      {answered !== null && opt.correct && (
                        <span className="text-xp font-mono text-xs font-bold bg-xp/10 px-2 py-1 rounded">+{opt.xp} XP</span>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {answered !== null && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-8 pt-8 border-t border-border/50">
                  <div className="bg-secondary/20 p-5 rounded-2xl border border-border/50 mb-8">
                    <p className="text-sm text-muted-foreground leading-relaxed italic">{sim.options[answered].explanation}</p>
                  </div>

                  {currentSim < scenarios.length - 1 ? (
                    <button
                      onClick={nextSim}
                      className="w-full md:w-auto px-10 py-4 gradient-primary rounded-xl text-primary-foreground font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                    >
                      Analyze Next Scenario →
                    </button>
                  ) : (
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 bg-xp/5 rounded-3xl border border-xp/20">
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Mission Debriefing</p>
                        <p className="text-2xl font-black text-foreground">Total Tactical Gains: <span className="text-xp">{totalXP} XP</span></p>
                      </div>
                      <button
                        onClick={() => setStarted(false)}
                        className="px-8 py-3 glass rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl"
                      >
                        Simulation Log Exit
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
