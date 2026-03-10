import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { generateCareerMatches, generateMoreCareers, searchCareers } from '@/lib/mockAI';
import { Search } from 'lucide-react';

const loadingTexts = [
  'Synthesizing career paths...',
  'Mapping skill gaps...',
  'Analyzing market trends...',
  'Calculating match scores...',
  'Finalizing recommendations...',
];

export default function CareerMatcher() {
  const { surveyAnswers, setScreen } = useApp();
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState(loadingTexts[0]);
  const [matches, setMatches] = useState<ReturnType<typeof generateCareerMatches>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ title: string; id: string }[]>([]);
  const [excluded, setExcluded] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      if (i < loadingTexts.length) setLoadingText(loadingTexts[i]);
    }, 500);

    const timer = setTimeout(() => {
      setMatches(generateCareerMatches(surveyAnswers));
      setLoading(false);
      clearInterval(interval);
    }, 2500);

    return () => { clearTimeout(timer); clearInterval(interval); };
  }, [surveyAnswers]);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (q.length >= 2) setSearchResults(searchCareers(q));
    else setSearchResults([]);
  };

  const handleGenerateMore = () => {
    const newExcluded = [...excluded, ...matches.map(m => m.id)];
    setExcluded(newExcluded);
    setMatches(generateMoreCareers(newExcluded));
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
    // Store selected career ID temporarily
    localStorage.setItem('pathfindr-selected-career', id);
    setScreen('skill-assessment');
  };

  if (loading) {
    return (
      <motion.div
        className="fixed inset-0 bg-background flex flex-col items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="relative w-20 h-20 mb-8">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-2 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent"
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-4 rounded-full border-2 border-accent/50"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>
        <motion.h2
          className="text-xl font-semibold text-foreground mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Deep Analysis
        </motion.h2>
        <AnimatePresence mode="wait">
          <motion.p
            key={loadingText}
            className="text-primary font-mono text-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {loadingText}
          </motion.p>
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="fixed inset-0 bg-background overflow-y-auto scrollbar-thin"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-3xl mx-auto px-6 py-12">
        <motion.h1
          className="text-3xl md:text-4xl font-bold text-foreground mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Your Career Matches
        </motion.h1>
        <motion.p
          className="text-muted-foreground mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Based on your responses, here are your top career paths.
        </motion.p>

        {/* Search */}
        <motion.div
          className="relative mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search for a specific career..."
            className="w-full bg-secondary border border-border rounded-xl pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 glass rounded-xl overflow-hidden z-10">
              {searchResults.map(r => (
                <button
                  key={r.id}
                  onClick={() => handleSelect(r.id)}
                  className="w-full text-left px-4 py-3 text-foreground hover:bg-secondary/50 transition-colors border-b border-border last:border-0"
                >
                  {r.title}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Career cards */}
        <div className="space-y-4 mb-8">
          {matches.map((match, i) => (
            <motion.div
              key={match.id}
              className="bento-card cursor-pointer group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.15 }}
              whileHover={{ scale: 1.01 }}
              onClick={() => handleSelect(match.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {match.title}
                </h3>
                <span className="text-2xl font-bold gradient-text font-mono">
                  {match.matchPercentage}%
                </span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {match.justification}
              </p>
              <div className="mt-3 h-1.5 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full progress-bar-fill rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${match.matchPercentage}%` }}
                  transition={{ delay: 0.8 + i * 0.15, duration: 0.8 }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        <motion.button
          onClick={handleGenerateMore}
          className="w-full glass py-4 rounded-xl text-muted-foreground hover:text-primary font-semibold transition-colors"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          Generate 3 More ↻
        </motion.button>
      </div>
    </motion.div>
  );
}
