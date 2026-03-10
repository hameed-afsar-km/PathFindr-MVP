import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { getSimulationScenarios } from '@/lib/mockAI';
import { Play, Zap, CheckCircle2, XCircle } from 'lucide-react';

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
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        <motion.div className="bento-card text-center py-16" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Play className="w-16 h-16 text-primary mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Career Simulations</h2>
          <p className="text-muted-foreground mb-8">Face realistic career scenarios and earn XP for making the best decisions.</p>
          <button
            onClick={() => setStarted(true)}
            className="glass glow-primary px-8 py-4 rounded-xl text-primary font-semibold hover:scale-105 transition-transform"
          >
            Start Simulation
          </button>
        </motion.div>
      </div>
    );
  }

  const sim = scenarios[currentSim];

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Simulation {currentSim + 1}/{scenarios.length}</h2>
        <span className="flex items-center gap-1 text-xp font-mono text-sm"><Zap className="w-4 h-4" />{totalXP} XP</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={currentSim} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bento-card">
          <p className="text-foreground font-semibold mb-6 text-lg leading-relaxed">{sim.scenario}</p>
          <div className="space-y-3">
            {sim.options.map((opt, i) => {
              let style = 'border-border hover:border-primary/30';
              let icon = null;
              if (answered !== null) {
                if (opt.correct) { style = 'border-success bg-success/10'; icon = <CheckCircle2 className="w-4 h-4 text-success shrink-0" />; }
                else if (i === answered) { style = 'border-destructive bg-destructive/10'; icon = <XCircle className="w-4 h-4 text-destructive shrink-0" />; }
              }
              return (
                <button key={i} onClick={() => handleAnswer(i)} className={`w-full flex items-center gap-3 text-left glass px-4 py-3 rounded-lg text-sm text-foreground border ${style}`}>
                  {icon} <span>{opt.text}</span>
                  {answered !== null && opt.correct && <span className="ml-auto text-xp text-xs font-mono">+{opt.xp} XP</span>}
                </button>
              );
            })}
          </div>
          {answered !== null && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
              <p className="text-sm text-muted-foreground">{sim.options[answered].explanation}</p>
              {currentSim < scenarios.length - 1 ? (
                <button onClick={nextSim} className="mt-3 glass px-6 py-2 rounded-lg text-primary text-sm font-semibold">Next Scenario →</button>
              ) : (
                <p className="mt-3 text-primary font-semibold">Simulation complete! Total XP earned: {totalXP}</p>
              )}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
