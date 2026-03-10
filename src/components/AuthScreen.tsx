import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';

export default function AuthScreen() {
    const { updateProfile, setScreen } = useApp();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;
        if (!isLogin && !username) return;

        // Simulate auth
        updateProfile({
            username: isLogin ? email.split('@')[0] : username,
            email,
            memberSince: new Date().toISOString()
        });
        setScreen('onboarding');
    };

    return (
        <motion.div
            className="fixed inset-0 bg-background flex flex-col items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="w-full max-w-md">
                <motion.div
                    className="glass-strong rounded-2xl p-8"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold gradient-text mb-2">
                            {isLogin ? 'Welcome Back' : 'Join PathFindr.AI'}
                        </h2>
                        <p className="text-muted-foreground text-sm">
                            {isLogin ? 'Enter your details to access your roadmap' : 'Start your personalized career journey today'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <AnimatePresence>
                            {!isLogin && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <label className="block text-sm font-medium text-foreground mb-1.5 px-1">Username</label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="e.g. Alex Explorer"
                                        className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all mb-4"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5 px-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="alex@example.com"
                                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5 px-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full glass glow-primary mt-6 py-4 rounded-xl text-primary font-semibold hover:scale-[1.02] transition-transform"
                        >
                            {isLogin ? 'Sign In' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-muted-foreground text-sm hover:text-foreground transition-colors"
                        >
                            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
