import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { aiApi } from '../../api/aiApi';
import { AIMentorHeader } from '../../components/ai/AIMentorHeader';
import { AIMentorEmptyState } from '../../components/ai/AIMentorEmptyState';
import { SuggestedPromptChips } from '../../components/ai/SuggestedPromptChips';
import { ChatMessageList, ChatMessage } from '../../components/ai/ChatMessageList';
import { ChatComposer } from '../../components/ai/ChatComposer';
import { motion } from 'framer-motion';

export const AIMentorPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const aiMutation = useMutation({
    mutationFn: (prompt: string) => aiApi.chatMentor(prompt),
    onSuccess: (res) => {
      const aiReply: ChatMessage = {
        id: Math.random().toString(),
        sender: 'ai',
        structuredResponse: res.data,
      };
      setMessages((prev) => [...prev, aiReply]);
    },
    onError: (err: any) => {
      const errorMsg =
        err.response?.data?.message || 'AI Mentor is temporarily unavailable. Please try again in a moment.';
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'ai',
          errorMessage: errorMsg,
        },
      ]);
    },
  });

  const handleSendPrompt = (promptText: string) => {
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      textPrompt: promptText,
    };

    setMessages((prev) => [...prev, userMsg]);
    aiMutation.mutate(promptText);
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <div className="ai-mesh-bg min-h-[calc(100vh-5rem)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <AIMentorHeader onClearChat={handleClearChat} isGenerating={aiMutation.isPending} />

        {/* Empty Onboarding State or Chat List */}
        {messages.length === 0 ? (
          <AIMentorEmptyState onSelectPrompt={handleSendPrompt} />
        ) : (
          <ChatMessageList messages={messages} isGenerating={aiMutation.isPending} />
        )}

        {/* Suggested Starter Chips */}
        <SuggestedPromptChips onSelectPrompt={handleSendPrompt} />

        {/* Composer Input */}
        <ChatComposer onSendPrompt={handleSendPrompt} isPending={aiMutation.isPending} />
      </div>
    </div>
  );
};
