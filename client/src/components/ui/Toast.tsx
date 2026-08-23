import React from 'react';
import { useUIStore } from '../../store/useUIStore';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl backdrop-blur-md border ${
              toast.type === 'error'
                ? 'bg-red-950/80 border-red-500/30 text-red-200'
                : toast.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-200'
                : 'bg-brand-950/80 border-brand-500/30 text-brand-200'
            }`}
          >
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />}

            <div className="flex-1 text-sm font-medium leading-relaxed">{toast.message}</div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
