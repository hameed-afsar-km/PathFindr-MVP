import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { useERP } from '@/context/ERPContext';
import { 
  User, Shield, AlertTriangle, Trash2, Key, BookOpen, Upload, Save, X, 
  Sparkles, Brain, Check, Plus, Cpu, Eye, EyeOff, RotateCcw, UserMinus, 
  Settings2, Hash, Mail, CreditCard, ChevronRight, HelpCircle, MessageSquare, 
  LifeBuoy, ExternalLink, Info, Book
} from 'lucide-react';
import { GlowingEffect } from './ui/glowing-effect';
import { cn } from '@/lib/utils';

// Student Profile Edit in ERP Mode
function ERPProfileTab({ student, institute, erp }: { student: any, institute: any, erp: any }) {
  const [formData, setFormData] = useState({
    name: student.name,
    username: student.username,
    password: student.password,
    avatarUrl: student.avatarUrl || '',
    activeCareer: student.activeCareer || '',
  });

  const [saving, setSaving] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const limit = student.courseLimit || 1;
  const currentCareers = formData.activeCareer.split(',').filter(Boolean).map(c => c.trim());

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return alert("Image size must be less than 2MB.");
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) setFormData(f => ({ ...f, avatarUrl: evt.target!.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      erp.updateStudent(institute.id, student.id, {
        password: formData.password,
        avatarUrl: formData.avatarUrl,
      });
      erp.addNotification(institute.id, {
        studentId: student.id,
        message: `${student.name} updated their private profile (Avatar/Security).`,
      });
      setSaving(false);
      alert("Profile synchronized successfully.");
    }, 800);
  };

  const handleReset = () => {
    erp.updateStudent(institute.id, student.id, { xp: 0, streak: 0 });
    erp.addNotification(institute.id, {
      studentId: student.id,
      message: `${student.name} performed a full account progress reset.`,
    });
    alert("Account progress has been reset to defaults.");
    setShowResetConfirm(false);
  };

  const handleDeleteRequest = () => {
    erp.addNotification(institute.id, {
      studentId: student.id,
      message: `URGENT: ${student.name} has submitted an account deletion request.`,
    });
    alert("Deletion request sent to the institute administration for verification.");
    setShowDeleteConfirm(false);
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* ── IDENTITY & BRANDING ────────────────────────────────────────────────── */}
      <section className="bg-[#181224] border border-white/10 rounded-[2.5rem] p-8 lg:p-10 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-600 to-fuchsia-600" />
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10">
          <div className="relative group shrink-0">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-28 h-28 rounded-[2.5rem] border-4 border-white/5 bg-black/40 overflow-hidden flex items-center justify-center cursor-pointer hover:border-violet-500/50 transition-all shadow-2xl relative"
            >
              {formData.avatarUrl ? (
                <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-white/20" />
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Upload className="w-6 h-6 text-white" />
              </div>
            </div>
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center justify-center md:justify-start gap-2">
              Professional Identity <Settings2 className="w-5 h-5 text-violet-400/50" />
            </h2>
            <p className="text-white/40 text-sm mt-1">Manage your public persona and administrative credentials.</p>
            
            <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
              <span className="px-3 py-1 bg-white/5 rounded-lg border border-white/5 text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5"><Mail className="w-3 h-3" /> {student.email}</span>
              <span className="px-3 py-1 bg-violet-500/10 rounded-lg border border-violet-500/20 text-[10px] font-bold text-violet-400 uppercase tracking-widest flex items-center gap-1.5"><Shield className="w-3 h-3" /> Student ID: {student.id.slice(0, 8)}</span>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-2xl text-sm font-black shadow-xl shadow-violet-500/30 transition-all flex items-center gap-2"
          >
            {saving ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Sync'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Full Legal Name</label>
              <button 
                onClick={() => {
                  erp.addNotification(institute.id, { studentId: student.id, message: `${student.name} requested a legal name change.` });
                  alert("Name change request submitted to administration.");
                }}
                className="text-[9px] font-bold text-violet-400 hover:text-white transition-colors uppercase tracking-widest"
              >
                Request Change
              </button>
            </div>
            <div className="relative group/field">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within/field:text-violet-500 transition-colors" />
              <input
                readOnly
                value={formData.name}
                className="w-full bg-black/20 border border-white/5 cursor-not-allowed rounded-2xl pl-12 pr-5 py-4 text-sm text-white/40 font-semibold"
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Universal Username</label>
              <button 
                onClick={() => {
                  erp.addNotification(institute.id, { studentId: student.id, message: `${student.name} requested a username change (Current: ${student.username}).` });
                  alert("Username change request submitted to administration.");
                }}
                className="text-[9px] font-bold text-violet-400 hover:text-white transition-colors uppercase tracking-widest"
              >
                Request Change
              </button>
            </div>
            <div className="relative group/field">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within/field:text-violet-500 transition-colors" />
              <input
                readOnly
                value={formData.username}
                className="w-full bg-black/20 border border-white/5 cursor-not-allowed rounded-2xl pl-12 pr-5 py-4 text-sm text-white/40 font-semibold"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── SECURITY & ACCESS ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 bg-[#181224] border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-violet-600/10 flex items-center justify-center border border-violet-600/20">
              <Key className="w-5 h-5 text-violet-400" />
            </div>
            <h3 className="font-black text-white text-lg">Access Gateway</h3>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Platform Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData(f => ({ ...f, password: e.target.value }))}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white font-mono focus:outline-none focus:border-violet-500 transition-all"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-violet-400/50" />
                <span className="text-xs text-white/60 font-medium">Locked out or forgot your credentials?</span>
              </div>
              <button 
                onClick={() => alert("Password reset protocol initiated. Please check your institutional email for the recovery link.")}
                className="text-[10px] font-black uppercase tracking-widest text-violet-400 hover:text-violet-300 transition-colors"
              >
                Reset via Email
              </button>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-br from-violet-600/20 to-transparent border border-white/10 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden group">
          <Sparkles className="w-12 h-12 text-violet-400 mb-4 animate-pulse" />
          <h3 className="font-black text-white mb-2">Refine Trajectory</h3>
          <p className="text-xs text-white/40 mb-6 leading-relaxed">Is your current path no longer aligned? Re-run the core analysis to discover new horizons.</p>
          <button 
            onClick={() => erp.logout()} 
            className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-all flex items-center justify-center gap-2 group-hover:border-violet-500/50"
          >
            Switch Career Path <ChevronRight className="w-3 h-3" />
          </button>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-violet-600/10 blur-3xl rounded-full" />
        </section>
      </div>

      {/* ── ACTIVE GOALS ────────────────────────────────────────────────────────── */}
      <section className="bg-[#181224] border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl">
         <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                 <Brain className="w-5 h-5 text-emerald-400" />
               </div>
               <div>
                 <h3 className="font-black text-white text-lg">AI-Strategized Trajectories</h3>
                 <p className="text-white/40 text-[10px] uppercase tracking-widest mt-0.5">Authorized Professional Paths</p>
               </div>
             </div>
             <div className="bg-black/30 px-3 py-1.5 rounded-xl border border-white/10 font-mono text-xs font-bold">
               <span className="text-emerald-400">{currentCareers.length}</span> <span className="text-white/20 mx-1">/</span> <span className="text-white/40">{limit > 100 ? '∞' : limit}</span>
             </div>
          </div>
          
          <div className="flex flex-wrap gap-2 min-h-[50px]">
            {currentCareers.length === 0 ? (
               <div className="p-4 border border-dashed border-white/10 rounded-2xl text-white/20 text-xs w-full text-center">No authorized paths detected.</div>
            ) : (
              currentCareers.map(c => (
                <div key={c} className="px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-sm font-bold shadow-lg flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  {c}
                </div>
              ))
            )}
          </div>
      </section>

      {/* ── SUPPORT & ASSISTANCE ────────────────────────────────────────────────── */}
      <section className="bg-[#181224] border border-white/10 rounded-[2.5rem] p-8 lg:p-10 relative overflow-hidden shadow-2xl">
         <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-violet-600/10 flex items-center justify-center border border-violet-600/20">
              <LifeBuoy className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h3 className="font-black text-white text-lg">Support & Assistance</h3>
              <p className="text-white/40 text-[10px] uppercase tracking-widest mt-0.5">Official Help Channels</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Institute Support */}
            <div className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/[0.07] transition-all group">
               <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-6 h-6 text-violet-400" />
               </div>
               <h4 className="text-white font-bold mb-2">Institute Support</h4>
               <p className="text-[11px] text-white/40 mb-5 leading-relaxed">Reach out to your institutional admins for course-related queries or enrollment issues.</p>
               <button 
                onClick={() => alert(`A support ticket has been opened with ${institute.name}. Their administration will contact you at ${student.email}.`)}
                className="w-full py-2.5 bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-violet-500/20 transition-all flex items-center justify-center gap-2"
               >
                 Open Ticket <ChevronRight className="w-3 h-3" />
               </button>
            </div>

            {/* Technical Support */}
            <div className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/[0.07] transition-all group">
               <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6 text-blue-400" />
               </div>
               <h4 className="text-white font-bold mb-2">Admin Support</h4>
               <p className="text-[11px] text-white/40 mb-5 leading-relaxed">Contact PathFindr.AI global technical support for platform glitches or security concerns.</p>
               <button 
                onClick={() => alert("Connecting to PathFindr Global Support... (support@pathfindr.ai)")}
                className="w-full py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-blue-500/20 transition-all flex items-center justify-center gap-2"
               >
                 Contact Admin <ExternalLink className="w-3 h-3" />
               </button>
            </div>

            {/* Help Center */}
            <div className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/[0.07] transition-all group">
               <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Book className="w-6 h-6 text-emerald-400" />
               </div>
               <h4 className="text-white font-bold mb-2">Help Center</h4>
               <p className="text-[11px] text-white/40 mb-5 leading-relaxed">Explore official documentation, video tutorials, and platform feature guides.</p>
               <button 
                className="w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-emerald-500/20 transition-all flex items-center justify-center gap-2"
               >
                 View Docs <Info className="w-3 h-3" />
               </button>
            </div>
          </div>
      </section>

      {/* ── DANGER ZONE ─────────────────────────────────────────────────────────── */}
      <section className="bg-red-500/5 border border-red-500/20 rounded-[2.5rem] p-8 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center border border-red-600/20">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="font-black text-white text-lg">Management & Security</h3>
            <p className="text-red-500/50 text-[10px] uppercase tracking-widest font-bold">Critical Operations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:border-red-500/30 transition-all">
            <h4 className="text-white font-bold mb-1 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-red-400" /> Reset Progress
            </h4>
            <p className="text-xs text-white/40 mb-6">Wipe all XP, streaks, and assessment scores. Career allotments remain.</p>
            {!showResetConfirm ? (
              <button 
                onClick={() => setShowResetConfirm(true)}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-red-500/20 transition-all"
              >
                Initiate Reset
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={handleReset} className="px-4 py-2 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">Confirm Wipe</button>
                <button onClick={() => setShowResetConfirm(false)} className="px-4 py-2 bg-white/5 text-white/60 text-[10px] uppercase rounded-lg">Cancel</button>
              </div>
            )}
          </div>

          <div className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:border-red-500/30 transition-all">
            <h4 className="text-white font-bold mb-1 flex items-center gap-2">
              <UserMinus className="w-4 h-4 text-red-400" /> Delete Request
            </h4>
            <p className="text-xs text-white/40 mb-6">Terminate your institutional account. This requires admin approval.</p>
            {!showDeleteConfirm ? (
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-red-500/20 transition-all"
              >
                Request Deletion
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={handleDeleteRequest} className="px-4 py-2 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">Submit Request</button>
                <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 bg-white/5 text-white/60 text-[10px] uppercase rounded-lg">Keep Account</button>
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}

// Fallback for standard users
function StandardProfileTab() {
  const { profile, updateProfile } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(profile.username);

  const handleSave = () => { updateProfile({ username: editedName }); setIsEditing(false); };
  const handleCancel = () => { setEditedName(profile.username); setIsEditing(false); };

  return (
    <div className="space-y-6">
      <motion.section className="relative">
        <div className="relative rounded-[2rem] border border-border/50 p-2 md:p-3">
          <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
          <div className="relative z-10 p-6 md:p-8 rounded-[1.75rem] bg-background">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-xl"><User className="w-5 h-5 text-primary" /></div>
                <h2 className="text-xl font-bold text-foreground">User Information</h2>
              </div>
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="px-3 py-1.5 glass rounded-lg text-[10px] font-bold text-primary uppercase border border-primary/20">Edit Details</button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleSave} className="px-3 py-1.5 bg-primary text-white rounded-lg text-[10px] font-bold uppercase">Save</button>
                  <button onClick={handleCancel} className="px-3 py-1.5 glass rounded-lg text-[10px] font-bold text-muted-foreground uppercase">Cancel</button>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Username</label>
              {isEditing ? (
                <input value={editedName} onChange={(e) => setEditedName(e.target.value)} className="w-full bg-secondary/30 border border-primary/30 rounded-xl px-4 py-3 text-foreground" />
              ) : (
                <div className="glass px-4 py-3 rounded-xl border border-border/50"><p className="text-foreground">{profile.username}</p></div>
              )}
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

export default function ProfileTab() {
  const erp = useERP();
  
  if (erp.session?.role === 'student' && erp.session.instituteId) {
    const inst = erp.getInstituteById(erp.session.instituteId);
    if (inst) {
      const student = inst.students.find(s => s.username === erp.session?.username || s.email === erp.session?.email);
      if (student) {
        return (
          <div className="p-4 md:p-6 lg:p-10 max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col gap-2 mb-2">
              <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter">Strategic Command Center</h1>
              <p className="text-white/40 font-medium text-lg">Personalized oversight of your identity, security, and professional trajectory.</p>
            </div>
            <ERPProfileTab student={student} institute={inst} erp={erp} />
          </div>
        );
      }
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-extrabold text-white tracking-tight mb-8">Profile Settings</h1>
      <StandardProfileTab />
    </div>
  );
}
