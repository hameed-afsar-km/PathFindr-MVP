import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface Message {
    id: string;
    isBot: boolean;
    content: string;
}

export default function Chatbot() {
    const { activeCareer } = useApp();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            isBot: true,
            content: "Hello! I'm your PathFindr AI guide. Ask me anything about your current career focus, study strategies, or technical concepts!",
        }
    ]);
    const [inputStr, setInputStr] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    // In a real application, keep VITE_GEMINI_API_KEY in .env
    // For safety and out-of-the-box operations here, we will mock if key is entirely missing but
    // use it if it exists in local storage / environment.
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('GEMINI_API_KEY');

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputStr.trim() || isLoading) return;

        const userMessage = inputStr.trim();
        setInputStr('');
        setMessages(prev => [...prev, { id: Date.now().toString(), isBot: false, content: userMessage }]);
        setIsLoading(true);

        try {
            if (API_KEY) {
                const genAI = new GoogleGenerativeAI(API_KEY);
                // Using the recommended gemini-1.5 model
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const contextPrompt = `You are a helpful AI mentor in PathFindr.AI. The user is currently focusing on the career path: ${activeCareer?.title || 'Unknown'}. Try to frame your advice relevant to this career. User asks: ${userMessage}`;

                const result = await model.generateContent(contextPrompt);
                const responseText = result.response.text();

                setMessages(prev => [...prev, { id: Date.now().toString(), isBot: true, content: responseText }]);
            } else {
                // Fallback mock if no API key is set
                setTimeout(() => {
                    setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        isBot: true,
                        content: `[Mock AI Response for ${activeCareer?.title || 'General'}] To truly master ${userMessage}, you should start by breaking down the fundamentals. (Note: Add VITE_GEMINI_API_KEY to your env or localStorage['GEMINI_API_KEY'] to unlock true Gemini powers.)`
                    }]);
                    setIsLoading(false);
                }, 1500);
                return;
            }
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { id: Date.now().toString(), isBot: true, content: "I'm having trouble connecting to my cognitive cores right now. Please verify my API keys or try again later." }]);
        }
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col h-[600px] w-full max-w-lg overflow-hidden glass rounded-t-2xl shadow-2xl fixed bottom-0 right-4 md:right-8 z-50">
            <div className="flex items-center gap-3 p-4 bg-primary/20 border-b border-primary/30 shrink-0">
                <Sparkles className="w-5 h-5 text-primary" />
                <div>
                    <h3 className="font-bold text-foreground leading-tight">Career Mentor AI</h3>
                    <p className="text-xs text-muted-foreground">Focus: {activeCareer?.title || 'General'}</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin bg-background/50">
                {messages.map((m) => (
                    <div key={m.id} className={`flex gap-3 max-w-[85%] ${m.isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.isBot ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                            {m.isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        </div>
                        <div className={`p-3 rounded-2xl text-sm leading-relaxed ${m.isBot ? 'bg-secondary text-foreground rounded-tl-sm' : 'bg-primary text-primary-foreground rounded-tr-sm'}`}>
                            {/* Note: In a real app, use ReactMarkdown here to parse the response format */}
                            {m.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex gap-3 max-w-[85%] mr-auto">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-primary/20 text-primary">
                            <Bot className="w-4 h-4" />
                        </div>
                        <div className="p-3 bg-secondary rounded-2xl rounded-tl-sm text-sm flex gap-1 items-center">
                            <motion.div className="w-1.5 h-1.5 bg-primary rounded-full" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} />
                            <motion.div className="w-1.5 h-1.5 bg-primary rounded-full" animate={{ y: [0, -4, 0] }} transition={{ delay: 0.2, repeat: Infinity, duration: 0.6 }} />
                            <motion.div className="w-1.5 h-1.5 bg-primary rounded-full" animate={{ y: [0, -4, 0] }} transition={{ delay: 0.4, repeat: Infinity, duration: 0.6 }} />
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 bg-background border-t border-border shrink-0">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={inputStr}
                        onChange={e => setInputStr(e.target.value)}
                        placeholder="Ask your mentor..."
                        className="w-full bg-secondary border border-border rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                    />
                    <button type="submit" disabled={!inputStr.trim() || isLoading} className="absolute right-2 p-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:bg-secondary disabled:text-muted-foreground">
                        <Send className="w-4 h-4 ml-0.5" />
                    </button>
                </div>
            </form>
        </div>
    );
}
