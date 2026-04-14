import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useERP } from '@/context/ERPContext';
import type { Institute, Student } from '@/types/saas';
import { INSTITUTE_THEMES } from '@/types/saas';
import StudentModal from '@/components/StudentModal';
import ImportStudentsModal from '@/components/ImportStudentsModal';
import AnnouncementModal from '@/components/AnnouncementModal';
import {
  Users, Sparkles, LogOut, BarChart3, Search, Upload, Plus,
  Trash2, Mail, Zap, Flame, CheckCircle2, ShieldCheck, XCircle, Megaphone, Edit3, MessageCircle, Bell, LayoutDashboard, Check, AlertTriangle, TrendingDown
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import { cn } from '@/lib/utils';

type InstTab = 'overview' | 'students' | 'features' | 'announcements' | 'notifications';

function StudentRow({ student, onEdit, onRemove }: { student: Student; onEdit: () => void; onRemove: () => void }) {
  return (
    <motion.tr
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      className="border-b border-white/5 hover:bg-white/5 transition-all group"
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-xs font-bold text-violet-300 overflow-hidden shrink-0">
            {student.avatarUrl ? <img src={student.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{student.name}</p>
            <p className="text-[10px] text-white/30 font-mono">{student.username}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="flex items-center gap-1.5 text-xs text-white/40 mb-1"><Mail className="w-3 h-3" /> {student.email}</span>
        {student.activeCareer ? (
          <div className="flex flex-wrap gap-1 mt-1">
            {student.activeCareer.split(',').filter(Boolean).map(c => (
              <span key={c} className="text-[9px] px-1.5 py-0.5 bg-violet-500/10 text-violet-300 rounded border border-violet-500/20">{c.trim()}</span>
            ))}
          </div>
        ) : (
          <span className="text-[10px] text-white/30 italic">No trajectories mapped</span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 text-xs text-amber-400">
          <Zap className="w-3 h-3" />{student.xp} XP
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col text-[10px]">
          <span className="text-orange-400 font-bold mb-0.5"><Flame className="w-3 h-3 inline" /> {student.streak} days</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-white/60 text-xs font-mono bg-white/5 px-2 py-1 rounded">
          {student.courseLimit > 100 ? 'Unlimited' : student.courseLimit}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <a href={`mailto:${student.email}`} className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all" title="Contact Student">
            <MessageCircle className="w-4 h-4" />
          </a>
          <button onClick={onEdit} className="p-1.5 rounded-lg bg-white/10 text-white/80 hover:text-white transition-all shadow-sm border border-white/5" title="Edit Student">
            <Edit3 className="w-4 h-4" />
          </button>
          <button onClick={onRemove} className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all shadow-sm" title="Remove Student">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
}

function FeatureStatusRow({ label, enabled, description, onToggle, locked }: { label: string; enabled: boolean; description: string; onToggle: () => void; locked?: boolean }) {
  return (
    <div className={cn(
      "flex items-center justify-between p-4 bg-white/5 border border-white/8 rounded-xl transition-all",
       locked ? "opacity-60 grayscale-[0.5]" : "hover:bg-white/10"
    )}>
      <div className="flex items-center gap-3">
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center transition-all', enabled ? 'bg-violet-500/20' : 'bg-white/5')}>
          {enabled ? <CheckCircle2 className="w-4 h-4 text-violet-400" /> : (locked ? <ShieldCheck className="w-4 h-4 text-white/20" /> : <XCircle className="w-4 h-4 text-white/20" />)}
        </div>
        <div>
          <p className={cn('text-sm font-bold transition-colors', enabled ? 'text-white' : 'text-white/40')}>{label}</p>
          <p className="text-[10px] text-white/30 mt-0.5">{description}</p>
        </div>
      </div>
      
      {locked ? (
        <div className="flex flex-col items-end gap-1 px-1">
           <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">Legacy / Locked</span>
           <button onClick={() => alert("This feature is disabled by PathFindr Global Admin. Contact your account manager to upgrade your institutional subscription.")} className="text-[9px] text-violet-400 font-bold hover:underline">Request Upgrade</button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "w-11 h-6 rounded-full relative transition-all duration-300 shadow-inner",
            enabled ? "bg-violet-500" : "bg-black/30 border border-white/10"
          )}
        >
          <motion.div
            animate={{ x: enabled ? 20 : 2 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
          />
        </button>
      )}
    </div>
  );
}

export default function InstituteDashboard() {
  const erp = useERP();
  const { session, institutes, addStudentsToInstitute, updateStudent, removeStudent, updateInstitute, addAnnouncement, removeAnnouncement, logout, applyInstituteTheme } = erp;
  const inst: Institute | undefined = institutes.find(i => i.id === session?.instituteId);
  const [tab, setTab] = useState<InstTab>('overview');
  const [search, setSearch] = useState('');

  // Modals state
  const [isStudentModalOpen, setStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [isAnnouncementModalOpen, setAnnouncementModalOpen] = useState(false);

  const theme = inst ? INSTITUTE_THEMES.find(t => t.id === inst.theme) : INSTITUTE_THEMES[0];

  useEffect(() => {
    if (inst) applyInstituteTheme(inst.theme);
  }, [inst?.theme]);

  if (!inst) {
    return (
      <div className="min-h-screen bg-[hsl(255_45%_12%)] flex items-center justify-center">
        <div className="text-center text-white/40">
          <ShieldCheck className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="font-bold">Institute not found.</p>
        </div>
      </div>
    );
  }

  const filteredStudents = inst.students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.username.toLowerCase().includes(search.toLowerCase())
  );

  const avgXP = inst.students.length
    ? Math.round(inst.students.reduce((a, s) => a + s.xp, 0) / inst.students.length)
    : 0;

  const handleSaveStudent = (payload: Partial<Student>) => {
    if (editingStudent) {
      updateStudent(inst.id, editingStudent.id, payload);
    } else {
      addStudentsToInstitute(inst.id, [payload as Omit<Student, 'id' | 'instituteId' | 'enrolledAt' | 'xp' | 'streak'>]);
    }
  };

  const handleImportStudents = (students: Partial<Student>[]) => {
    addStudentsToInstitute(inst.id, students as Omit<Student, 'id' | 'instituteId' | 'enrolledAt' | 'xp' | 'streak'>[]);
  };

  // Analytics Mock Data
  const mockPerformanceData = [
    { week: 'Week 1', avgXP: 120, active: 40 },
    { week: 'Week 2', avgXP: 300, active: 65 },
    { week: 'Week 3', avgXP: 450, active: 75 },
    { week: 'Week 4', avgXP: 820, active: 85 },
    { week: 'Week 5', avgXP: 910, active: 92 },
  ];

  // Derive "risk" students
  const riskStudents = inst?.students.filter(s => s.xp < 250 && s.streak < 3) || [];

  const FEATURE_LABELS: Record<string, { label: string; desc: string }> = {
    roadmap: { label: 'AI Roadmap', desc: 'Personalized learning path generation' },
    practice: { label: 'Practice Arena', desc: 'Coding challenges and MCQ tests' },
    chatbot: { label: 'AI Chatbot', desc: 'Real-time chat with PathFindr AI' },
    careers: { label: 'Career Suggestions', desc: 'AI-powered career matching' },
    interview: { label: 'Interview Prep', desc: 'Mock interviews and prep tips' },
    simulations: { label: 'Simulations', desc: 'Real-world scenario simulations' },
  };

  const NAV = [
    { key: 'overview' as InstTab, label: 'Overview', icon: LayoutDashboard },
    { key: 'students' as InstTab, label: 'Students', icon: Users },
    { key: 'notifications' as InstTab, label: 'Notifications', icon: Bell },
    { key: 'features' as InstTab, label: 'Features', icon: Sparkles },
    { key: 'announcements' as InstTab, label: 'Announcements', icon: Megaphone },
  ];

  return (
    <div className="min-h-screen bg-[hsl(255_45%_12%)] text-white flex">
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-white/10 flex flex-col py-6 shrink-0 bg-black/5 gpu">
        {/* Institute Brand */}
        <div className="px-3 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg overflow-hidden bg-[#221b33] shrink-0"
              style={!inst.logoUrl ? { background: `linear-gradient(135deg, hsl(${theme?.primary}), hsl(${theme?.accent}))` } : {}}
            >
              {inst.logoUrl ? <img src={inst.logoUrl} alt="Logo" className="w-full h-full object-cover" /> : inst.logoInitials}
            </div>
            <div>
              <p className="text-sm font-black text-white leading-tight">{inst.name}</p>
              {!inst.whiteLabel && (
                <p className="text-[10px] text-white/30">Powered by PathFindr.AI</p>
              )}
            </div>
          </div>
          <div className="mt-2 px-0">
            <span className="text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/40 font-mono">
              /institute/{inst.slug}
            </span>
          </div>
        </div>

        {NAV.map(n => (
          <button
            key={n.key}
            onClick={() => setTab(n.key)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left',
              tab === n.key
                ? 'bg-white/10 text-white border border-white/20 shadow-inner'
                : 'text-white/40 hover:text-white/70 hover:bg-white/5'
            )}
          >
            <n.icon className={cn("w-4 h-4", tab === n.key ? "text-violet-400" : "")} /> {n.label}
          </button>
        ))}

        <div className="mt-auto border-t border-white/10 pt-4">
          <div className="px-3 mb-3">
            <p className="text-xs font-bold text-white/70 truncate">{session?.username}</p>
            <p className="text-[10px] text-white/30">Institute Admin</p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto w-full p-8 relative gpu">
        <AnimatePresence mode="wait">
          {/* ── OVERVIEW ─────────────────────────────────────────────────── */}
          {tab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div className="mb-8">
                <h1 className="text-3xl font-black text-white">Institute Overview</h1>
                <p className="text-white/40 mt-1">Managing <span className="text-white/70 font-semibold">{inst.name}</span></p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Total Students', value: inst.students.length, icon: Users, color: 'bg-violet-500/20', text: 'text-violet-400' },
                  { label: 'Average XP', value: avgXP, icon: Zap, color: 'bg-amber-500/20', text: 'text-amber-400' },
                  { label: 'Avg Streak', value: Math.round(inst.students.reduce((a, b) => a + b.streak, 0) / (inst.students.length || 1)), icon: Flame, color: 'bg-orange-500/20', text: 'text-orange-400' },
                  { label: 'At Risk', value: riskStudents.length, icon: AlertTriangle, color: 'bg-red-500/20', text: 'text-red-400' },
                ].map(s => (
                  <motion.div key={s.label} whileHover={{ y: -3 }} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center`}>
                      <s.icon className={`w-6 h-6 ${s.text}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-white font-mono">{s.value}</p>
                      <p className="text-xs text-white/40">{s.label}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Analytics Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Chart */}
                <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-bold text-white mb-6">Cohort Performance Trends</h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mockPerformanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="week" stroke="#ffffff30" tick={{ fill: '#ffffff50', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis stroke="#ffffff30" tick={{ fill: '#ffffff50', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#181224', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Bar dataKey="avgXP" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Average XP" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Risk / Action Required */}
                <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingDown className="w-5 h-5 text-red-400" />
                    <h2 className="text-lg font-bold text-red-100">Intervention Required</h2>
                  </div>
                  <p className="text-[10px] text-white/40 mb-4 uppercase tracking-widest font-bold">Students At Risk (Low Engagement)</p>
                  
                  <div className="space-y-3">
                    {riskStudents.length === 0 ? (
                      <p className="text-sm text-white/30 italic">No students currently at risk.</p>
                    ) : (
                      riskStudents.map(rs => (
                        <div key={rs.id} className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-red-500/10">
                          <div>
                            <p className="text-sm font-bold text-white">{rs.name}</p>
                            <p className="text-[10px] text-white/40">XP: {rs.xp} • Streak: {rs.streak}</p>
                          </div>
                          <button className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded text-xs text-red-300 font-bold border border-red-500/20">Review</button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-lg font-bold text-white mb-4">Enabled Features</h2>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(inst.features).map(([key, val]) => (
                      <span
                        key={key}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-xs font-bold border',
                          val
                            ? 'bg-violet-500/15 text-violet-300 border-violet-500/30'
                            : 'bg-white/5 text-white/20 border-white/10 line-through'
                        )}
                      >
                        {FEATURE_LABELS[key]?.label ?? key}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-white mb-4">Recent Announcements</h2>
                  <div className="space-y-3">
                    {inst.announcements?.slice(0, 3).map(a => (
                      <div key={a.id} className="p-3 bg-white/5 border border-white/10 rounded-xl relative overflow-hidden">
                        {a.important && <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />}
                        <div className="flex justify-between items-start pl-2">
                          <div>
                            <h3 className="text-sm font-bold text-white">{a.title}</h3>
                            <p className="text-xs text-white/50 truncate max-w-[200px]">{a.content}</p>
                          </div>
                          <span className="text-[10px] text-white/30 whitespace-nowrap">{new Date(a.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                    {(!inst.announcements || inst.announcements.length === 0) && (
                       <p className="text-xs text-white/30 italic">No announcements posted yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STUDENTS ─────────────────────────────────────────────────── */}
          {tab === 'students' && (
            <motion.div key="students" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl font-black text-white">Students</h1>
                  <p className="text-white/40 mt-1">Manage and track your {inst.students.length} enrolled students.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="Search students..."
                      className="pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                    />
                  </div>
                  <button onClick={() => setImportModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl text-sm font-bold transition-all">
                    <Upload className="w-4 h-4" /> Import CSV
                  </button>
                  <button onClick={() => { setEditingStudent(null); setStudentModalOpen(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-violet-500 text-white hover:bg-violet-600 rounded-xl text-sm font-bold shadow-lg shadow-violet-500/20 transition-all">
                    <Plus className="w-4 h-4" /> Add Student
                  </button>
                </div>
              </div>

              {inst.students.length === 0 ? (
                <div className="text-center py-24 text-white/30">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="font-bold">No students enrolled yet.</p>
                  <p className="text-sm mt-1">Add students individually or import them via CSV.</p>
                </div>
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 bg-black/20">
                        {['Student', 'Contact details', 'XP', 'Performance', 'Limit', ''].map((h, i) => (
                          <th key={i} className={`text-left px-4 py-3 text-xs font-bold text-white/40 uppercase tracking-wider ${!h && 'w-24'}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {filteredStudents.map(s => (
                          <StudentRow
                            key={s.id}
                            student={s}
                            onEdit={() => { setEditingStudent(s); setStudentModalOpen(true); }}
                            onRemove={() => removeStudent(inst.id, s.id)}
                          />
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* ── FEATURES ─────────────────────────────────────────────────── */}
          {tab === 'features' && (
            <motion.div key="features" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div className="mb-8">
                <h1 className="text-3xl font-black text-white">Feature Activation</h1>
                <p className="text-white/40 mt-1">Toggle which modules are accessible to your students.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
                {Object.entries(inst.features).map(([key, val]) => (
                  <FeatureStatusRow
                    key={key}
                    label={FEATURE_LABELS[key]?.label ?? key}
                    enabled={val}
                    description={FEATURE_LABELS[key]?.desc ?? ''}
                    locked={!inst.authorizedFeatures?.[key as keyof typeof inst.authorizedFeatures]}
                    onToggle={() => {
                      updateInstitute(inst.id, {
                        features: { ...inst.features, [key as keyof typeof inst.features]: !val }
                      });
                    }}
                  />
                ))}
              </div>
              <div className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl max-w-4xl text-emerald-300 text-sm">
                <Sparkles className="w-4 h-4 inline mr-2 text-emerald-400" />
                Changes apply instantly for all currently active students.
              </div>
            </motion.div>
          )}

          {/* ── ANNOUNCEMENTS ─────────────────────────────────────────────────── */}
          {tab === 'announcements' && (
            <motion.div key="announcements" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-black text-white">Announcements</h1>
                  <p className="text-white/40 mt-1">Broadcast updates and notices to your students' dashboards.</p>
                </div>
                <button onClick={() => setAnnouncementModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-violet-500 hover:bg-violet-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-violet-500/20">
                  <Megaphone className="w-4 h-4" /> Create Broadcast
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                  {inst.announcements?.map(a => (
                    <motion.div
                      key={a.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={cn(
                        "relative bg-white/5 border rounded-2xl p-5 overflow-hidden",
                        a.important ? "border-red-500/30" : "border-white/10"
                      )}
                    >
                      {a.important && <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/20 blur-2xl" />}
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          {a.important && <Flame className="w-4 h-4 text-red-400" />}
                          {a.title}
                        </h3>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-[10px] text-white/30 whitespace-nowrap bg-black/20 px-2 py-1 rounded">
                            {new Date(a.createdAt).toLocaleString()}
                          </span>
                          <button
                            onClick={() => removeAnnouncement(inst.id, a.id)}
                            className="text-white/20 hover:text-red-400 transition-colors"
                            title="Delete Announcement"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap">{a.content}</p>
                    </motion.div>
                  ))}
                  {(!inst.announcements || inst.announcements.length === 0) && (
                    <div className="col-span-full border-2 border-dashed border-white/10 rounded-2xl p-12 text-center">
                      <Megaphone className="w-12 h-12 text-white/20 mx-auto mb-4" />
                      <h3 className="text-white font-bold mb-1">No active announcements</h3>
                      <p className="text-white/40 text-sm">Create a broadcast to alert all your students.</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* ── NOTIFICATIONS TAB ─────────────────────────────────────────────────── */}
          {tab === 'notifications' && (
            <motion.div key="notifications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-black mb-1 text-white">Activity Notifications</h1>
                  <p className="text-sm text-white/40">Recent updates and changes made by your students.</p>
                </div>
                <button onClick={() => erp.markNotificationsRead(inst.id)} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-all border border-white/10">
                  <Check className="w-4 h-4" /> Mark All Read
                </button>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-4 sm:p-6">
                {!inst.notifications?.length ? (
                  <div className="text-center py-12">
                    <Bell className="w-12 h-12 mx-auto text-white/20 mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">No notifications yet</h3>
                    <p className="text-white/40">You're all caught up!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {inst.notifications.map(notif => (
                      <div key={notif.id} className={`flex items-start gap-4 p-4 rounded-xl border ${notif.read ? 'bg-white/5 border-white/5 opacity-60' : 'bg-violet-500/10 border-violet-500/20 shadow-lg'}`}>
                        <div className={`p-2 rounded-lg ${notif.read ? 'bg-white/5' : 'bg-violet-500/20'}`}>
                          <Bell className={`w-4 h-4 ${notif.read ? 'text-white/30' : 'text-violet-400'}`} />
                        </div>
                        <div>
                          <p className={`text-sm ${notif.read ? 'text-white/60' : 'text-white font-semibold'}`}>{notif.message}</p>
                          <p className="text-[10px] text-white/30 mt-1 uppercase tracking-widest">{new Date(notif.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Modals */}
      <StudentModal
        isOpen={isStudentModalOpen}
        onClose={() => { setStudentModalOpen(false); setEditingStudent(null); }}
        initialData={editingStudent}
        onSave={handleSaveStudent}
      />
      <ImportStudentsModal
        isOpen={isImportModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleImportStudents}
      />
      <AnnouncementModal
        isOpen={isAnnouncementModalOpen}
        onClose={() => setAnnouncementModalOpen(false)}
        onPost={(payload) => addAnnouncement(inst.id, payload)}
      />
    </div>
  );
}
