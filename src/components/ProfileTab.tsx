import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { User, Shield, AlertTriangle } from 'lucide-react';
import { GlowingEffect } from './ui/glowing-effect';

export default function ProfileTab() {
  const { profile, updateProfile, resetProgress, deleteAccount } = useApp();
  const [showReset, setShowReset] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editUsername, setEditUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(profile.username);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-foreground mb-6">Profile</h2>

      {/* User info */}
      <motion.div className="relative overflow-hidden p-6 rounded-[2rem] border border-border/50 bg-background shadow-sm mb-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
        <div className="relative z-10 flex items-center gap-2 mb-4">

          <User className="w-4 h-4 text-primary" />
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-mono">User Details</span>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Username</span>
            {editUsername ? (
              <div className="flex gap-2">
                <input
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                  className="bg-secondary border border-border rounded-lg px-3 py-1 text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
                <button
                  onClick={() => { updateProfile({ username: newUsername }); setEditUsername(false); }}
                  className="text-xs text-primary font-semibold"
                >
                  Save
                </button>
              </div>
            ) : (
              <button onClick={() => setEditUsername(true)} className="text-foreground text-sm hover:text-primary">
                {profile.username} ✎
              </button>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Email</span>
            <span className="text-foreground text-sm">{profile.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Plan</span>
            <span className="text-primary text-sm capitalize font-semibold">{profile.plan}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Member Since</span>
            <span className="text-foreground text-sm">{new Date(profile.memberSince).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Total XP</span>
            <span className="text-xp text-sm font-mono font-bold">{profile.xp}</span>
          </div>
        </div>
      </motion.div>

      {/* Security */}
      <motion.div className="relative overflow-hidden p-6 rounded-[2rem] border border-border/50 bg-background shadow-sm mb-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
        <div className="relative z-10 flex items-center gap-2 mb-4">

          <Shield className="w-4 h-4 text-accent" />
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-mono">Security</span>
        </div>
        <div className="space-y-2">
          <button className="w-full text-left glass px-4 py-3 rounded-lg text-sm text-foreground hover:border-primary/30">
            Change Password
          </button>
          <button className="w-full text-left glass px-4 py-3 rounded-lg text-sm text-foreground hover:border-primary/30">
            Change Email
          </button>
        </div>
      </motion.div>

      {/* Danger zone */}
      <motion.div className="relative overflow-hidden p-6 rounded-[2rem] border border-destructive/20 bg-background shadow-sm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
        <div className="relative z-10 flex items-center gap-2 mb-4">

          <AlertTriangle className="w-4 h-4 text-destructive" />
          <span className="text-xs text-destructive uppercase tracking-wider font-mono">Danger Zone</span>
        </div>
        <div className="space-y-2">
          <button
            onClick={() => setShowReset(true)}
            className="w-full text-left glass px-4 py-3 rounded-lg text-sm text-warning hover:border-warning/30"
          >
            Reset All Progress
          </button>
          <button
            onClick={() => setShowDelete(true)}
            className="w-full text-left glass px-4 py-3 rounded-lg text-sm text-destructive hover:border-destructive/30"
          >
            Delete Account
          </button>
        </div>

        {showReset && (
          <div className="mt-4 p-4 bg-warning/10 rounded-lg border border-warning/20 flex flex-col gap-3">
            <p className="text-sm text-foreground">This will wipe all tasks and career data. Type <strong className="text-warning font-mono">RESET</strong> to confirm. Are you sure?</p>
            <input
              type="text"
              placeholder="Type RESET"
              value={resetConfirmText}
              onChange={e => setResetConfirmText(e.target.value.toUpperCase())}
              className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-warning/50 text-foreground font-mono"
            />
            <div className="flex gap-2">
              <button
                disabled={resetConfirmText !== 'RESET'}
                onClick={() => { resetProgress(); setShowReset(false); setResetConfirmText(''); }}
                className="px-4 py-2 bg-warning text-warning-foreground rounded-lg text-sm font-semibold disabled:opacity-50"
              >
                Yes, Reset
              </button>
              <button onClick={() => { setShowReset(false); setResetConfirmText(''); }} className="px-4 py-2 glass text-sm text-foreground">Cancel</button>
            </div>
          </div>
        )}

        {showDelete && (
          <div className="mt-4 p-4 bg-destructive/10 rounded-lg border border-destructive/20 flex flex-col gap-3">
            <p className="text-sm text-foreground">This will permanently delete your account. This cannot be undone. Type <strong className="text-destructive font-mono">DELETE</strong> to confirm.</p>
            <input
              type="text"
              placeholder="Type DELETE"
              value={deleteConfirmText}
              onChange={e => setDeleteConfirmText(e.target.value.toUpperCase())}
              className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-destructive/50 text-foreground font-mono"
            />
            <div className="flex gap-2">
              <button
                disabled={deleteConfirmText !== 'DELETE'}
                onClick={() => { deleteAccount(); setShowDelete(false); setDeleteConfirmText(''); }}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-semibold disabled:opacity-50"
              >
                Yes, Delete
              </button>
              <button onClick={() => { setShowDelete(false); setDeleteConfirmText(''); }} className="px-4 py-2 glass text-sm text-foreground">Cancel</button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
