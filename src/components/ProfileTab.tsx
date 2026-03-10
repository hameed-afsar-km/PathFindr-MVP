import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { User, Shield, AlertTriangle, Trash2, Key, Smartphone, RefreshCw, CheckCircle2 } from 'lucide-react';
import { GlowingEffect } from './ui/glowing-effect';

export default function ProfileTab() {
  const { profile, updateProfile, resetProgress, deleteAccount } = useApp();
  const [showReset, setShowReset] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-8">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account and data preferences</p>
      </div>

      <div className="space-y-6">
        {/* User Info Section */}
        <motion.section
          className="relative"
          whileHover={{ y: -4, scale: 1.005 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="relative rounded-[2rem] border border-border/50 p-2 md:p-3">
            <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
            <div className="relative z-10 p-6 md:p-8 rounded-[1.75rem] bg-background overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-primary/10 rounded-xl">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">User Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Username</label>
                  <div className="glass px-4 py-3 rounded-xl border-border/50 flex items-center justify-between">
                    <p className="text-foreground font-medium">{profile.username}</p>
                    <span className="text-[10px] text-primary/50 font-mono">Verified</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Member Since</label>
                  <div className="glass px-4 py-3 rounded-xl border-border/50">
                    <p className="text-foreground font-medium font-mono">
                      {new Date(profile.memberSince).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Account Stats</label>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="glass p-3 rounded-xl text-center">
                      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-tighter">Total XP</p>
                      <p className="text-lg font-bold text-xp font-mono">{profile.xp}</p>
                    </div>
                    <div className="glass p-3 rounded-xl text-center">
                      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-tighter">Streak</p>
                      <p className="text-lg font-bold text-streak font-mono">{profile.streak}</p>
                    </div>
                    <div className="glass p-3 rounded-xl text-center">
                      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-tighter">Plan</p>
                      <p className="text-lg font-bold text-primary capitalize">{profile.plan}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Security Section */}
        <motion.section
          className="relative"
          whileHover={{ y: -4, scale: 1.005 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="relative rounded-[2rem] border border-border/50 p-2 md:p-3">
            <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
            <div className="relative z-10 p-6 md:p-8 rounded-[1.75rem] bg-background overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-accent/10 rounded-xl">
                  <Shield className="w-5 h-5 text-accent" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Security & Privacy</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 glass rounded-xl border-border/50 group hover:border-accent/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-accent/10 rounded-lg group-hover:scale-110 transition-transform">
                      <Key className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Local Encryption</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Advanced AES-256</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-success/10 px-3 py-1 rounded-full border border-success/20">
                    <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                    <span className="text-[8px] font-bold text-success uppercase tracking-widest">Active</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 glass rounded-xl border-border/50 transition-all cursor-not-allowed group opacity-60">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-muted rounded-lg group-hover:rotate-12 transition-transform">
                      <Smartphone className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">Sync with App</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Mobile Exclusive</p>
                    </div>
                  </div>
                  <span className="text-[8px] font-bold text-muted-foreground bg-secondary px-2 py-1 rounded uppercase tracking-[0.2em]">Locked</span>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Danger Zone */}
        <motion.section
          className="relative"
          whileHover={{ y: -4, scale: 1.005 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="relative rounded-[2rem] border border-destructive/20 p-2 md:p-3">
            <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} variant="white" />
            <div className="relative z-10 p-6 md:p-8 rounded-[1.75rem] bg-background overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-destructive/10 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <h2 className="text-xl font-bold text-destructive">Danger Zone</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button onClick={() => setShowReset(true)} className="flex items-center justify-center gap-3 p-4 glass rounded-xl text-destructive hover:bg-destructive/10 transition-all border border-destructive/20 group">
                  <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Reset Data</span>
                </button>
                <button onClick={() => setShowDelete(true)} className="flex items-center justify-center gap-3 p-4 glass rounded-xl text-foreground hover:bg-destructive hover:text-white transition-all border border-border group whitespace-nowrap">
                  <Trash2 className="w-4 h-4 text-destructive group-hover:text-white" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Delete Account</span>
                </button>
              </div>

              <AnimatePresence>
                {showReset && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="mt-6 p-4 bg-warning/5 rounded-xl border border-warning/20 space-y-3">
                      <p className="text-xs text-foreground/80 leading-relaxed font-mono">This will wipe all progress. Type <span className="text-warning font-black">RESET</span> to confirm.</p>
                      <input
                        type="text"
                        placeholder="RESET"
                        value={resetConfirmText}
                        onChange={e => setResetConfirmText(e.target.value.toUpperCase())}
                        className="w-full bg-background border border-warning/30 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-warning/50 text-foreground font-mono placeholder:text-muted-foreground/30"
                      />
                      <div className="flex gap-2">
                        <button
                          disabled={resetConfirmText !== 'RESET'}
                          onClick={() => { resetProgress(); setShowReset(false); setResetConfirmText(''); }}
                          className="flex-1 py-2.5 bg-warning text-warning-foreground rounded-lg text-[10px] font-bold uppercase tracking-widest disabled:opacity-50 transition-all"
                        >
                          Execute Reset
                        </button>
                        <button onClick={() => { setShowReset(false); setResetConfirmText(''); }} className="flex-1 py-2.5 glass text-[10px] font-bold text-foreground uppercase tracking-widest">Abord</button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {showDelete && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="mt-6 p-4 bg-destructive/5 rounded-xl border border-destructive/20 space-y-3">
                      <p className="text-xs text-foreground/80 leading-relaxed font-mono">Permanent deletion. Type <span className="text-destructive font-black">DELETE</span> to confirm.</p>
                      <input
                        type="text"
                        placeholder="DELETE"
                        value={deleteConfirmText}
                        onChange={e => setDeleteConfirmText(e.target.value.toUpperCase())}
                        className="w-full bg-background border border-destructive/30 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-destructive/50 text-foreground font-mono placeholder:text-muted-foreground/30"
                      />
                      <div className="flex gap-2">
                        <button
                          disabled={deleteConfirmText !== 'DELETE'}
                          onClick={() => { deleteAccount(); setShowDelete(false); setDeleteConfirmText(''); }}
                          className="flex-1 py-2.5 bg-destructive text-white rounded-lg text-[10px] font-bold uppercase tracking-widest disabled:opacity-50 transition-all"
                        >
                          Delete Everything
                        </button>
                        <button onClick={() => { setShowDelete(false); setDeleteConfirmText(''); }} className="flex-1 py-2.5 glass text-[10px] font-bold text-foreground uppercase tracking-widest">Cancel</button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <p className="text-center text-[8px] text-muted-foreground mt-8 uppercase tracking-[0.3em] font-mono opacity-40">
                Data Persistence: Local Storage (W3C Standard)
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
