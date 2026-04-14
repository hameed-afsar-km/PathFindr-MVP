import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Upload, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import type { Student } from '@/types/saas';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: Partial<Student>) => void;
  initialData?: Student | null;
  institute?: any;
  allInstitutes?: any[];
}

export default function StudentModal({ isOpen, onClose, onSave, initialData, institute, allInstitutes }: StudentModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    contactNumber: '',
    activeCareer: '',
    avatarUrl: '',
    courseLimit: 1,
    instituteId: institute?.id || '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        email: initialData.email,
        username: initialData.username,
        password: initialData.password,
        contactNumber: initialData.contactNumber || '',
        activeCareer: initialData.activeCareer || '',
        avatarUrl: initialData.avatarUrl || '',
        courseLimit: initialData.courseLimit || 1,
        instituteId: initialData.instituteId,
      });
    } else {
      setFormData({ name: '', email: '', username: '', password: 'student123', contactNumber: '', activeCareer: '', avatarUrl: '', courseLimit: 1, instituteId: institute?.id || '' });
    }
  }, [initialData, isOpen, institute]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image size must be less than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setFormData(f => ({ ...f, avatarUrl: evt.target!.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl bg-[#231b34] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-5 border-b border-white/10 bg-black/20 flex items-center justify-between shrink-0">
             <h2 className="text-lg font-black text-white">
                {initialData ? 'Edit Student Details' : 'Add New Student'}
             </h2>
             <button onClick={onClose} className="text-white/40 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
            {/* Avatar Upload Section */}
            <div className="flex flex-col items-center justify-center pb-6">
               <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-full bg-white/5 border-4 border-white/10 flex items-center justify-center cursor-pointer hover:border-violet-500 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all overflow-hidden relative group"
                >
                  {formData.avatarUrl ? (
                     <>
                       <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                         <Upload className="w-6 h-6 text-white" />
                       </div>
                     </>
                  ) : (
                    <>
                      <UserIcon className="w-8 h-8 text-white/30" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity">
                         <Upload className="w-5 h-5 text-white mb-1" />
                         <span className="text-[8px] uppercase tracking-widest font-bold text-white">Upload</span>
                       </div>
                    </>
                  )}
                </div>
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                {formData.avatarUrl && (
                  <button type="button" onClick={() => setFormData(f => ({...f, avatarUrl: ''}))} className="text-xs text-red-400 font-bold hover:text-red-300 mt-3 uppercase tracking-widest">Remove Picture</button>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-white/50 uppercase mb-1.5 focus-within:text-violet-400">Full Name *</label>
                <input
                  required value={formData.name}
                  onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-[#181224] border border-white/5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-white/50 uppercase mb-1.5 focus-within:text-violet-400">Email Address *</label>
                <input
                  required type="email" value={formData.email}
                  onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                  className="w-full bg-[#181224] border border-white/5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-white/50 uppercase mb-1.5 focus-within:text-violet-400">Username *</label>
                <input
                  required value={formData.username}
                  onChange={e => setFormData(f => ({ ...f, username: e.target.value }))}
                  className="w-full bg-[#181224] border border-white/5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-white/50 uppercase mb-1.5 focus-within:text-violet-400">Platform Password *</label>
                <div className="relative">
                  <input
                    required minLength={4} 
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={e => setFormData(f => ({ ...f, password: e.target.value }))}
                    className="w-full bg-[#181224] border border-white/5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white font-mono focus:outline-none focus:ring-2 focus:ring-violet-500/40 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-white/50 uppercase mb-1.5 focus-within:text-violet-400">Contact Number</label>
                <input
                  value={formData.contactNumber}
                  onChange={e => setFormData(f => ({ ...f, contactNumber: e.target.value }))}
                  placeholder="+1 234 567 8900"
                  className="w-full bg-[#181224] border border-white/5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-white/50 uppercase mb-1.5 focus-within:text-violet-400">Active Career Goal</label>
                <input
                  value={formData.activeCareer}
                  onChange={e => setFormData(f => ({ ...f, activeCareer: e.target.value }))}
                  placeholder="e.g. Software Engineering"
                  className="w-full bg-[#181224] border border-white/5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                />
              </div>
            </div>

            {allInstitutes && !initialData && (
              <div>
                <label className="block text-[10px] font-bold text-white/50 uppercase mb-1.5 focus-within:text-violet-400">Assigned Institute *</label>
                <select
                  required
                  value={formData.instituteId}
                  onChange={e => setFormData(f => ({ ...f, instituteId: e.target.value }))}
                  className="w-full bg-[#181224] border border-white/5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 appearance-none"
                >
                  <option value="" disabled>Select an Institute</option>
                  {allInstitutes.map(inst => (
                    <option key={inst.id} value={inst.id}>{inst.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-white/50 uppercase mb-1.5 focus-within:text-violet-400">Course Limit (Subscription Configured)</label>
              <select
                value={formData.courseLimit}
                onChange={e => setFormData(f => ({ ...f, courseLimit: parseInt(e.target.value, 10) }))}
                className="w-full bg-[#181224] border border-white/5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 appearance-none"
              >
                <option value={1}>1 Course Limit (Base)</option>
                <option value={2}>2 Courses Limit</option>
                <option value={3}>3 Courses Limit (Pro)</option>
                <option value={5}>5 Courses Limit (Premium)</option>
                <option value={999}>Unlimited</option>
              </select>
            </div>

            {initialData && (
              <div className="bg-gradient-to-r from-black/40 to-black/10 rounded-xl p-4 mt-4 border border-white/5 flex gap-4 text-xs">
                <div className="flex-1">
                  <span className="text-white/40 block mb-1 uppercase tracking-widest text-[9px] font-bold">XP Points</span>
                  <span className="text-amber-400 font-black text-lg">{initialData.xp}</span>
                </div>
                <div className="flex-1 border-l border-white/5 pl-4">
                  <span className="text-white/40 block mb-1 uppercase tracking-widest text-[9px] font-bold">Current Streak</span>
                  <span className="text-orange-400 font-black text-lg">{initialData.streak}</span> <span className="text-white/30 text-[10px]">days</span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-6">
              <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white/50 hover:text-white hover:bg-white/10 transition-colors">
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-sm font-black text-white bg-violet-600 hover:bg-violet-700 shadow-xl shadow-violet-500/20 flex items-center gap-2 transition-all"
              >
                <Check className="w-5 h-5" /> {initialData ? 'Update Account' : 'Provision User'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
