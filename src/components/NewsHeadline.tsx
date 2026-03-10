import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Newspaper, RefreshCw, ExternalLink, Clock } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface Headline {
    id: string;
    title: string;
    source: string;
    time: string;
    url: string;
}

const MOCK_NEWS: Record<string, Headline[]> = {
    general: [
        { id: '1', title: 'The Future of AI in Modern Workplaces', source: 'Tech Daily', time: '2h ago', url: '#' },
        { id: '2', title: 'Remote Work Trends for 2026', source: 'Global Careers', time: '5h ago', url: '#' },
    ],
    development: [
        { id: '3', title: 'React 20 Released: What You Need to Know', source: 'DevWorld', time: '1h ago', url: '#' },
        { id: '4', title: 'WebAssembly is Taking Over the Browser', source: 'Frontend Weekly', time: '3h ago', url: '#' },
    ],
    data: [
        { id: '5', title: 'New Python Library for Neural Networks', source: 'Data Science Hub', time: '4h ago', url: '#' },
        { id: '6', title: 'Governance in the Age of Big Data', source: 'Insight Mag', time: '6h ago', url: '#' },
    ]
};

export default function NewsHeadline() {
    const { activeCareer } = useApp();
    const [headlines, setHeadlines] = useState<Headline[]>([]);
    const [loading, setLoading] = useState(false);
    const [lastRefreshed, setLastRefreshed] = useState<number>(0);

    const fetchNews = useCallback(async (manual = false) => {
        if (!activeCareer) return;
        setLoading(true);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        const category = activeCareer.title.toLowerCase().includes('dev') ? 'development' :
            activeCareer.title.toLowerCase().includes('data') ? 'data' : 'general';

        // In a real app, this would fetch from an API like NewsAPI
        const news = MOCK_NEWS[category] || MOCK_NEWS.general;

        // Add some random variation for mock purposes
        const withVariation = [...news].map(h => ({
            ...h,
            time: manual ? 'Just now' : h.time
        }));

        setHeadlines(withVariation);
        setLastRefreshed(Date.now());
        setLoading(false);

        // Save to local storage for persistent 1-hour check
        localStorage.setItem(`news_last_fetch_${activeCareer.id}`, Date.now().toString());
        localStorage.setItem(`news_data_${activeCareer.id}`, JSON.stringify(withVariation));
    }, [activeCareer]);

    useEffect(() => {
        if (!activeCareer) return;

        const savedTime = localStorage.getItem(`news_last_fetch_${activeCareer.id}`);
        const savedData = localStorage.getItem(`news_data_${activeCareer.id}`);

        const oneHour = 60 * 60 * 1000;
        const now = Date.now();

        if (savedTime && savedData && (now - parseInt(savedTime)) < oneHour) {
            setHeadlines(JSON.parse(savedData));
            setLastRefreshed(parseInt(savedTime));
        } else {
            fetchNews();
        }
    }, [activeCareer, fetchNews]);

    // Hourly auto-refresh check
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            if (now - lastRefreshed > 60 * 60 * 1000) {
                fetchNews();
            }
        }, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [lastRefreshed, fetchNews]);

    if (!activeCareer) return null;

    return (
        <div className="bento-card relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-lg">
                        <Newspaper className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider">Career Insights</span>
                </div>
                <button
                    onClick={() => fetchNews(true)}
                    disabled={loading}
                    className="p-1.5 hover:bg-secondary rounded-lg transition-colors group/btn"
                >
                    <RefreshCw className={`w-3.5 h-3.5 text-muted-foreground group-hover/btn:text-primary transition-all ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="space-y-3 relative z-10">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-3"
                        >
                            {[1, 2].map(i => (
                                <div key={i} className="animate-pulse flex flex-col gap-2">
                                    <div className="h-4 bg-muted rounded w-3/4"></div>
                                    <div className="h-3 bg-muted rounded w-1/4"></div>
                                </div>
                            ))}
                        </motion.div>
                    ) : (
                        headlines.map((item, idx) => (
                            <motion.a
                                key={item.id}
                                href={item.url}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="block p-3 rounded-xl border border-border/40 bg-background/50 hover:border-primary/30 hover:bg-primary/5 transition-all group/item"
                            >
                                <div className="flex justify-between items-start gap-3">
                                    <h4 className="text-sm font-semibold text-foreground leading-tight group-hover/item:text-primary transition-colors">
                                        {item.title}
                                    </h4>
                                    <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0" />
                                </div>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="text-[10px] font-mono text-primary/80 uppercase">{item.source}</span>
                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                        <Clock className="w-2.5 h-2.5" />
                                        {item.time}
                                    </div>
                                </div>
                            </motion.a>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Background decoration */}
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors pointer-events-none"></div>
        </div>
    );
}
