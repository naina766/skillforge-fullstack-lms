import React, { useRef, useEffect, useState } from 'react';
import { Bot, AlertTriangle } from 'lucide-react';
import { AIMentorStructuredResponse } from '../../types';
import { UserMessageBubble } from './UserMessageBubble';
import { AIMessageRenderer } from './AIMessageRenderer';
import { TypingIndicator } from './TypingIndicator';
import { ScrollToBottomButton } from './ScrollToBottomButton';
import { motion, AnimatePresence } from 'framer-motion';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  textPrompt?: string;
  structuredResponse?: AIMentorStructuredResponse;
  errorMessage?: string;
}

interface ChatMessageListProps {
  messages: ChatMessage[];
  isGenerating?: boolean;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({ messages, isGenerating = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isUp = scrollHeight - scrollTop - clientHeight > 100;
    setShowScrollButton(isUp);
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollButton(false);
  };

  useEffect(() => {
    if (!showScrollButton) {
      scrollToBottom();
    }
  }, [messages, isGenerating]);

  return (
    <div className="relative flex-1">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="glass-panel rounded-3xl border border-slate-800/80 p-4 sm:p-6 min-h-[450px] max-h-[650px] overflow-y-auto space-y-6 scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <div key={msg.id} className="space-y-4">
              {/* User Message */}
              {msg.sender === 'user' && msg.textPrompt && (
                <UserMessageBubble text={msg.textPrompt} />
              )}

              {/* AI Error */}
              {msg.errorMessage && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>{msg.errorMessage}</span>
                </div>
              )}

              {/* AI Structured Response */}
              {msg.sender === 'ai' && msg.structuredResponse && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 via-cyan-500 to-purple-500 text-white flex items-center justify-center shrink-0 shadow-glow-blue mt-1">
                    <Bot className="w-4.5 h-4.5" />
                  </div>
                  <AIMessageRenderer response={msg.structuredResponse} />
                </div>
              )}
            </div>
          ))}
        </AnimatePresence>

        {isGenerating && <TypingIndicator />}

        <div ref={bottomRef} />
      </div>

      {/* Floating Scroll to Bottom Button */}
      <ScrollToBottomButton isVisible={showScrollButton} onClick={scrollToBottom} />
    </div>
  );
};
