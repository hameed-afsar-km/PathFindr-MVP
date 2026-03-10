import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { SURVEY_QUESTIONS } from '@/lib/surveyData';

export default function OnboardingSurvey() {
  const { addSurveyAnswer, surveyAnswers, setScreen } = useApp();
  const [currentQ, setCurrentQ] = useState(0);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherText, setOtherText] = useState('');
  const [constraintText, setConstraintText] = useState('');
  const totalQuestions = SURVEY_QUESTIONS.length + 1; // +1 for constraint question

  const handleAnswer = (answer: string) => {
    addSurveyAnswer({ questionIndex: currentQ, answer });
    setShowOtherInput(false);
    setOtherText('');
    if (currentQ < totalQuestions - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setScreen('career-match');
    }
  };

  const handleOtherSubmit = () => {
    if (otherText.trim()) {
      handleAnswer(otherText.trim());
    }
  };

  const progress = ((currentQ + 1) / totalQuestions) * 100;
  const isConstraintQ = currentQ === SURVEY_QUESTIONS.length;

  return (
    <motion.div
      className="fixed inset-0 bg-background flex flex-col"
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Progress bar */}
      <div className="w-full h-1 bg-secondary">
        <motion.div
          className="h-full progress-bar-fill"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {/* Question counter */}
          <motion.p
            className="text-muted-foreground text-sm mb-2 font-mono"
            key={`counter-${currentQ}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {currentQ + 1} / {totalQuestions}
          </motion.p>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
            >
              {isConstraintQ ? (
                /* Constraint question */
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                    Any unique career drivers? <span className="text-muted-foreground text-lg">(Optional)</span>
                  </h2>
                  <p className="text-muted-foreground mb-8">
                    E.g., "I need a high salary immediately," "I want to work remotely in nature," or any constraints that matter to you.
                  </p>
                  <textarea
                    value={constraintText}
                    onChange={(e) => setConstraintText(e.target.value)}
                    placeholder="Type your unique drivers here..."
                    className="w-full h-40 bg-secondary border border-border rounded-xl p-4 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 mb-6"
                  />
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleAnswer(constraintText || 'No constraints')}
                      className="flex-1 glass glow-primary py-4 rounded-xl text-primary font-semibold hover:scale-[1.02] transition-transform"
                    >
                      {constraintText ? 'Submit & Continue' : 'Skip & Continue'}
                    </button>
                  </div>
                </div>
              ) : (
                /* MCQ question */
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
                    {SURVEY_QUESTIONS[currentQ].question}
                  </h2>
                  <div className="space-y-3">
                    {SURVEY_QUESTIONS[currentQ].options.map((opt, i) => (
                      <motion.button
                        key={i}
                        onClick={() => handleAnswer(opt)}
                        className="w-full text-left glass px-6 py-4 rounded-xl text-foreground hover:border-primary/50 hover:glow-primary transition-all duration-200"
                        whileHover={{ scale: 1.01, x: 4 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <span className="text-primary font-mono mr-3 text-sm">{String.fromCharCode(65 + i)}</span>
                        {opt}
                      </motion.button>
                    ))}

                    {!showOtherInput ? (
                      <motion.button
                        onClick={() => setShowOtherInput(true)}
                        className="w-full text-left border border-dashed border-border px-6 py-4 rounded-xl text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all duration-200"
                        whileHover={{ scale: 1.01 }}
                      >
                        <span className="text-accent font-mono mr-3 text-sm">E</span>
                        Other...
                      </motion.button>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="flex gap-3"
                      >
                        <input
                          type="text"
                          value={otherText}
                          onChange={(e) => setOtherText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleOtherSubmit()}
                          placeholder="Type your answer..."
                          autoFocus
                          className="flex-1 bg-secondary border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <button
                          onClick={handleOtherSubmit}
                          className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity"
                        >
                          →
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {currentQ > 0 && (
            <motion.button
              onClick={() => { setCurrentQ(currentQ - 1); setShowOtherInput(false); }}
              className="mt-8 text-muted-foreground hover:text-foreground text-sm transition-colors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              ← Back
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
