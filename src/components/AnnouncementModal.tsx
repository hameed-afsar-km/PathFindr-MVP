import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';
import type { Announcement } from '@/types/saas';

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPost: (payload: Omit<Announcement, 'id' | 'createdAt'>) => void;
}

export default function AnnouncementModal({ isOpen, onClose, onPost }: AnnouncementModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [important, setImportant] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPost({ title, content, important });
    setTitle('');
    setContent('');
    setImportant(false);
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
          className="relative w-full max-w-lg bg-[hsl(255_35%_22%)] border border-white/10 rounded-2xl shadow-2xl p-6 flex flex-col max-h-[90vh] overflow-hidden"
        >
          <div className="shrink-0 mb-6 relative">
            <button onClick={onClose} className="absolute -top-2 -right-2 text-white/40 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-black text-white">Post Announcement</h2>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-white/50 uppercase mb-1.5">Announcement Title *</label>
              <input
                required value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Schedule Change for Exam"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-white/50 uppercase mb-1.5">Message Content *</label>
              <textarea
                required value={content} rows={4}
                onChange={e => setContent(e.target.value)}
                placeholder="Write your announcement here..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 resize-none"
              />
            </div>

            <div className="flex items-center gap-3 py-2">
              <input
                type="checkbox"
                id="important"
                checked={important}
                onChange={e => setImportant(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500 focus:ring-offset-0"
              />
              <label htmlFor="important" className="text-sm font-semibold text-white/70">
                Mark as Important / High Priority
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10 mt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold text-white/50 hover:text-white hover:bg-white/5">
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-lg text-sm font-black text-white bg-violet-500 hover:bg-violet-600 shadow flex items-center gap-2"
              >
                <Send className="w-4 h-4" /> Broadcast Note
              </button>
            </div>
          </form>
        </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
