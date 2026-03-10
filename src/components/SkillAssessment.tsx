import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { generateSkillQuestions, calculateSkillScore } from '@/lib/mockAI';
import { GlowingEffect } from './ui/glowing-effect';
import { Brain, Sparkles, Timer, CheckCircle2, XCircle } from 'lucide-react';

export default function SkillAssessment() {
  const { setScreen } = useApp();
  const careerId = localStorage.getItem('pathfindr-selected-career') || 'frontend-dev';
  const questions = generateSkillQuestions(careerId);
  const [currentQ, setCurrentQ] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);

  const handleAnswer = (idx: number) => {
    if (answered) return;
    setSelectedIdx(idx);
    setAnswered(true);
    const isCorrect = idx === questions[currentQ].correctIndex;
    if (isCorrect) setCorrect(c => c + 1);

    setTimeout(() => {
      // End immediately if incorrect or is last question
      if (isCorrect && currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1);
        setAnswered(false);
        setSelectedIdx(-1);
      } else {
        const result = calculateSkillScore(correct + (isCorrect ? 1 : 0), questions.length);
        localStorage.setItem('pathfindr-skill-score', JSON.stringify(result));
        setScreen('goal-setting');
      }
    }, 1200); // Slightly longer for "wow" effect of seeing correct/incorrect
  };

  const q = questions[currentQ];
  if (!q) return null;

  const progress = ((currentQ + 1) / questions.length) * 100;

  return (
    <motion.div
      className="fixed inset-0 bg-background flex flex-col overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />

      {/* Progress Bar Header */}
      <div className="relative z-10 w-full p-6 md:p-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-black text-foreground uppercase tracking-widest leading-none">Skill Calibration</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Section {Math.floor(currentQ / 3) + 1} of 3</p>
          </div>
        </div>

        <div className="flex-1 max-w-xs mx-8 hidden md:block">
          <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden p-[2px]">
            <motion.div
              className="h-full gradient-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.3)]"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-primary font-mono text-sm font-bold bg-primary/5 px-4 py-1.5 rounded-full border border-primary/20">
            <Timer className="w-4 h-4" />
            <span>Q {currentQ + 1} / {questions.length}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ}
              initial={{ opacity: 0, x: 40, filter: "blur(10px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -40, filter: "blur(10px)" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div className="relative rounded-[3rem] border border-border/50 p-2 md:p-4">
                <GlowingEffect spread={100} glow={true} disabled={false} proximity={128} inactiveZone={0.01} borderWidth={3} variant={q.level === 'advanced' ? 'default' : 'white'} />
                <div className="relative z-10 p-10 md:p-14 rounded-[2.5rem] bg-background overflow-hidden space-y-10">
                  <div className="space-y-4">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] animate-in fade-in slide-in-from-left-4 ${q.level === 'advanced' ? 'bg-destructive/10 text-destructive border border-destructive/20' :
                        q.level === 'intermediate' ? 'bg-warning/10 text-warning border border-warning/20' :
                          'bg-success/10 text-success border border-success/20'
                      }`}>
                      <Sparkles className="w-3 h-3" />
                      {q.level} proficiency
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-foreground leading-tight tracking-tight">
                      {q.question}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {q.options.map((opt, i) => {
                      let statusStyle = 'border-border/50 bg-secondary/10 hover:border-primary/50 hover:bg-secondary/20';
                      let icon = <div className="w-2 h-2 rounded-full bg-border group-hover:bg-primary transition-colors" />;

                      if (answered) {
                        if (i === q.correctIndex) {
                          statusStyle = 'border-success bg-success/10 ring-2 ring-success/20 cursor-default shadow-lg shadow-success/10';
                          icon = <CheckCircle2 className="w-5 h-5 text-success shrink-0 scale-110" />;
                        }
                        else if (i === selectedIdx) {
                          statusStyle = 'border-destructive bg-destructive/10 ring-2 ring-destructive/20 cursor-default opacity-80';
                          icon = <XCircle className="w-5 h-5 text-destructive shrink-0 scale-110" />;
                        }
                        else {
                          statusStyle = 'border-border/20 opacity-40 cursor-default grayscale';
                        }
                      }

                      return (
                        <motion.button
                          key={i}
                          onClick={() => handleAnswer(i)}
                          disabled={answered}
                          className={`group relative flex items-center gap-5 text-left p-6 rounded-2xl text-sm font-semibold text-foreground transition-all border ${statusStyle}`}
                          whileHover={!answered ? { x: 8 } : {}}
                          whileTap={!answered ? { scale: 0.98 } : {}}
                        >
                          <span className="text-primary font-mono text-[10px] font-black bg-primary/5 w-6 h-6 rounded flex items-center justify-center shrink-0 border border-primary/20">{String.fromCharCode(65 + i)}</span>
                          <span className="flex-1 leading-snug">{opt}</span>
                          {icon}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
