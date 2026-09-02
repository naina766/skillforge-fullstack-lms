import React, { useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';

interface ChatComposerProps {
  promptInput?: string;
  setPromptInput?: React.Dispatch<React.SetStateAction<string>>;
  onSendPrompt: (promptText: string) => void;
  isPending: boolean;
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
}

export const ChatComposer: React.FC<ChatComposerProps> = ({
  promptInput: externalPrompt,
  setPromptInput: externalSetPrompt,
  onSendPrompt,
  isPending,
  textareaRef: externalRef,
}) => {
  const [internalPrompt, setInternalPrompt] = React.useState('');
  const promptInput = externalPrompt !== undefined ? externalPrompt : internalPrompt;
  const setPromptInput = externalSetPrompt || setInternalPrompt;

  const localRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = externalRef || localRef;

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promptInput.trim() || promptInput.length > 1000 || isPending) return;

    onSendPrompt(promptInput.trim());
    setPromptInput('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPromptInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  return (
    <form onSubmit={handleSend} className="space-y-2">
      <motion.div
        whileFocus={{ scale: 1.002 }}
        className="relative glass-panel rounded-2xl border border-slate-800 p-2 focus-within:border-brand-500/60 focus-within:shadow-glow-blue transition-all"
      >
        <textarea
          ref={textareaRef}
          rows={2}
          placeholder="Ask AI Career Mentor anything... (e.g. 'I want to become a Senior Backend Engineer in 6 months')"
          value={promptInput}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          maxLength={1000}
          className="w-full bg-transparent text-slate-100 text-xs sm:text-sm p-3 pr-28 resize-none focus:outline-none placeholder:text-slate-500 font-sans"
        />

        <div className="absolute right-3 bottom-3 flex items-center gap-3">
          <span className={`text-[10px] font-mono ${promptInput.length > 900 ? 'text-amber-400 font-bold' : 'text-slate-500'}`}>
            {promptInput.length}/1000
          </span>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isPending}
            disabled={!promptInput.trim() || isPending}
            leftIcon={<Send className="w-3.5 h-3.5" />}
          >
            Send
          </Button>
        </div>
      </motion.div>
    </form>
  );
};
