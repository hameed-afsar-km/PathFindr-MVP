import { useState } from 'react';
import { motion } from 'framer-motion';
import { getPracticeQuestions } from '@/lib/mockAI';
import { Search, CheckCircle2, XCircle } from 'lucide-react';

const topics = ['JavaScript', 'React', 'TypeScript', 'Python', 'SQL', 'System Design', 'Data Structures', 'Algorithms'];

export default function PracticeArena() {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [questions, setQuestions] = useState<ReturnType<typeof getPracticeQuestions>>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answered, setAnswered] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const filteredTopics = topics.filter(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

  const startPractice = (topic: string) => {
    setSelectedTopic(topic);
    setQuestions(getPracticeQuestions(topic));
    setCurrentQ(0);
    setAnswered(null);
    setScore(0);
  };

  const handleAnswer = (idx: number) => {
    if (answered !== null) return;
    setAnswered(idx);
    if (idx === questions[currentQ].correctIndex) setScore(s => s + 1);
  };

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(c => c + 1);
      setAnswered(null);
    }
  };

  if (!selectedTopic) {
    return (
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-foreground mb-1">Practice Arena</h2>
        <p className="text-muted-foreground text-sm mb-6">Select a topic to start practicing</p>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search topics..."
            className="w-full bg-secondary border border-border rounded-xl pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredTopics.map((topic, i) => (
            <motion.button
              key={topic}
              onClick={() => startPractice(topic)}
              className="bento-card text-center py-6 hover:border-primary/50"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.02 }}
            >
              <span className="text-foreground font-semibold">{topic}</span>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  const q = questions[currentQ];

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <button onClick={() => setSelectedTopic('')} className="text-muted-foreground text-sm hover:text-foreground mb-1">← Back</button>
          <h2 className="text-xl font-bold text-foreground">{selectedTopic}</h2>
        </div>
        <span className="font-mono text-sm text-muted-foreground">{currentQ + 1}/{questions.length} • Score: {score}</span>
      </div>

      <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bento-card">
        <p className="text-foreground font-semibold mb-6">{q.question}</p>
        <div className="space-y-3">
          {q.options.map((opt, i) => {
            let icon = null;
            let style = '';
            if (answered !== null) {
              if (i === q.correctIndex) { style = 'border-success bg-success/10'; icon = <CheckCircle2 className="w-4 h-4 text-success shrink-0" />; }
              else if (i === answered) { style = 'border-destructive bg-destructive/10'; icon = <XCircle className="w-4 h-4 text-destructive shrink-0" />; }
            }
            return (
              <button key={i} onClick={() => handleAnswer(i)} className={`w-full flex items-center gap-3 text-left glass px-4 py-3 rounded-lg text-sm text-foreground transition-all border ${style || 'border-border hover:border-primary/30'}`}>
                {icon}
                <span><span className="text-primary font-mono mr-2">{String.fromCharCode(65 + i)}</span>{opt}</span>
              </button>
            );
          })}
        </div>
        {answered !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
            <p className="text-sm text-muted-foreground mb-3">{q.explanation}</p>
            {currentQ < questions.length - 1 ? (
              <button onClick={nextQuestion} className="glass px-6 py-2 rounded-lg text-primary text-sm font-semibold hover:border-primary/30">
                Next Question →
              </button>
            ) : (
              <div>
                <p className="text-primary font-semibold">Complete! Score: {score}/{questions.length}</p>
                <button onClick={() => setSelectedTopic('')} className="mt-2 text-sm text-muted-foreground hover:text-foreground">Back to topics</button>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
