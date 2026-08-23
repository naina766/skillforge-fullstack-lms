import React from 'react';
import { User } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserMessageBubbleProps {
  text: string;
}

export const UserMessageBubble: React.FC<UserMessageBubbleProps> = ({ text }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="flex gap-3 justify-end"
    >
      <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-medium text-xs sm:text-sm rounded-tr-none shadow-md max-w-xl text-left">
        {text}
      </div>

      <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 font-bold border border-slate-700/50 mt-1">
        <User className="w-4 h-4" />
      </div>
    </motion.div>
  );
};
