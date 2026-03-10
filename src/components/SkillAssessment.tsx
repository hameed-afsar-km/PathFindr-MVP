import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { generateSkillQuestions, calculateSkillScore } from '@/lib/mockAI';

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
    }, 800);
  };

  const q = questions[currentQ];
  if (!q) return null;

  const progress = ((currentQ + 1) / questions.length) * 100;
  const levelColors: Record<string, string> = {
    basic: 'text-success',
    intermediate: 'text-warning',
    advanced: 'text-destructive',
  };

  return (
    <motion.div
      className="fixed inset-0 bg-background flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="w-full h-1 bg-secondary">
        <motion.div className="h-full progress-bar-fill" animate={{ width: `${progress}%` }} />
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <p className="text-muted-foreground text-sm font-mono mb-1">{currentQ + 1} / {questions.length}</p>
          <span className={`text-xs font-mono uppercase ${levelColors[q.level]} mb-4 inline-block`}>
            {q.level}
          </span>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
            >
              <h2 className="text-2xl font-bold text-foreground mb-8">{q.question}</h2>
              <div className="space-y-3">
                {q.options.map((opt, i) => {
                  let borderClass = 'border-border';
                  if (answered) {
                    if (i === q.correctIndex) borderClass = 'border-success';
                    else if (i === selectedIdx) borderClass = 'border-destructive';
                  }
                  return (
                    <motion.button
                      key={i}
                      onClick={() => handleAnswer(i)}
                      className={`w-full text-left glass px-6 py-4 rounded-xl text-foreground transition-all duration-200 border ${borderClass}`}
                      whileHover={!answered ? { scale: 1.01, x: 4 } : {}}
                      whileTap={!answered ? { scale: 0.99 } : {}}
                    >
                      <span className="text-primary font-mono mr-3 text-sm">{String.fromCharCode(65 + i)}</span>
                      {opt}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
