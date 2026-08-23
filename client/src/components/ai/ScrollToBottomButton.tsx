import React from 'react';
import { ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScrollToBottomButtonProps {
  isVisible: boolean;
  onClick: () => void;
}

export const ScrollToBottomButton: React.FC<ScrollToBottomButtonProps> = ({ isVisible, onClick }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClick}
          className="absolute bottom-20 right-6 px-3.5 py-2 rounded-full bg-brand-600/90 text-white backdrop-blur-md shadow-glow-blue border border-brand-400/30 text-xs font-bold flex items-center gap-2 z-20"
        >
          <ArrowDown className="w-3.5 h-3.5" />
          <span>New response</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
};
