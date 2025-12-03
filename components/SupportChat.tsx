'use client';

import { useState, useRef, useEffect } from 'react';
import { sparkChat } from '@/lib/spark-bot';
import { useAuth } from '@/context/AuthContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestedActions?: Array<{ label: string; action: string; }>;
}

export default function SupportChat() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hey! 👋 I'm SPARK, your AI support assistant. Need help with anything?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Build conversation history
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      conversationHistory.push({
        role: 'user',
        content: input,
      });

      // Get SPARK response
      const response = await sparkChat(input, {
        userId: user?.uid,
        userTier: (user as any)?.tier || 'free',
        conversationHistory: conversationHistory,
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        suggestedActions: response.suggestedActions?.map(action => ({
          label: action,
          action: action,
        })),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Auto-escalate if needed
      if (response.escalateToHuman) {
        setTimeout(() => {
          const escalationMessage: Message = {
            role: 'assistant',
            content: "I've escalated your issue to our support team. They'll reach out within 24 hours! 🚀",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, escalationMessage]);
        }, 1000);
      }
    } catch (error) {
      console.error('SPARK chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: "Oops! Something went wrong. Try again or email us at support@litlabs.ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: string) => {
    if (action.startsWith('/')) {
      window.location.href = action;
    } else if (action.startsWith('http')) {
      window.open(action, '_blank');
    } else {
      setInput(action);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className='fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-2xl shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transition-all hover:scale-110'
        >
          💬
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className='fixed bottom-6 right-6 z-50 w-96 h-[600px] rounded-2xl border border-white/10 bg-slate-900 shadow-2xl flex flex-col'>
          {/* Header */}
          <div className='flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-pink-500/10 to-purple-500/10'>
            <div className='flex items-center gap-3'>
              <div className='h-10 w-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-xl'>
                ⚡
              </div>
              <div>
                <h3 className='font-bold text-white'>SPARK Support</h3>
                <p className='text-xs text-white/60'>Always here to help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className='text-white/60 hover:text-white transition'
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className='flex-1 overflow-y-auto p-4 space-y-4'>
            {messages.map((message, idx) => (
              <div key={idx} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${message.role === 'user' ? 'bg-pink-500/20 text-white' : 'bg-white/5 text-white/90'} rounded-2xl px-4 py-3`}>
                  <p className='text-sm whitespace-pre-wrap'>{message.content}</p>
                  {message.suggestedActions && message.suggestedActions.length > 0 && (
                    <div className='mt-3 flex flex-wrap gap-2'>
                      {message.suggestedActions.map((action, actionIdx) => (
                        <button
                          key={actionIdx}
                          onClick={() => handleActionClick(action.action)}
                          className='px-3 py-1 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 text-xs font-semibold transition'
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                  <p className='text-[10px] text-white/40 mt-2'>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className='flex justify-start'>
                <div className='bg-white/5 rounded-2xl px-4 py-3'>
                  <div className='flex gap-1'>
                    <div className='h-2 w-2 rounded-full bg-pink-500 animate-bounce' style={{ animationDelay: '0s' }}></div>
                    <div className='h-2 w-2 rounded-full bg-purple-500 animate-bounce' style={{ animationDelay: '0.1s' }}></div>
                    <div className='h-2 w-2 rounded-full bg-pink-500 animate-bounce' style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className='p-4 border-t border-white/10'>
            <div className='flex gap-2'>
              <input
                type='text'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder='Type your message...'
                className='flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-pink-500/50 transition'
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className='px-5 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-pink-500/30 transition'
              >
                →
              </button>
            </div>
            <p className='text-[10px] text-white/40 mt-2 text-center'>
              Press <kbd className='px-1 py-0.5 rounded bg-white/10'>Enter</kbd> to send • <kbd className='px-1 py-0.5 rounded bg-white/10'>Shift+Enter</kbd> for new line
            </p>
          </div>
        </div>
      )}
    </>
  );
}
