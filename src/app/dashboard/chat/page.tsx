'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Bot,
  User,
  BookOpen,
  Target,
  Search,
  MessageSquare,
  Lock,
  Loader2,
  Sparkles
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasChatAccess, setHasChatAccess] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check if user has chat access
    fetch('/api/subscription')
      .then(res => res.json())
      .then(data => {
        if (data.usage?.features) {
          setHasChatAccess(data.usage.features.chat);
        } else {
          setHasChatAccess(false);
        }
      })
      .catch(() => setHasChatAccess(false));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
      });

      const data = await res.json();

      if (res.status === 403) {
        setHasChatAccess(false);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.reply || data.error || 'Sorry, I encountered an error.',
          timestamp: new Date()
        }]);
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I could not connect. Please check if the chat service is configured.',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
        backgroundImage: `
          radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)
        `
      }} />

      <div className="flex-1 overflow-y-auto px-4 py-6 sm:py-8 relative z-10">
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 && (
            <div className="text-center py-16 sm:py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white mb-6 shadow-xl shadow-purple-500/20">
                <Bot className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-300">
                Hi! I&apos;m Lexa
              </h2>
              <p className="text-white/70 text-base sm:text-lg mb-8 max-w-md mx-auto px-4">
                Your AI assistant for the knowledge base. Ask me anything about your documents!
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto px-4">
                <button
                  onClick={() => setInput("What's in my knowledge base?")}
                  className="p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/10 hover:border-purple-500/30 transition-all text-left group min-h-[80px]"
                  disabled={hasChatAccess === false}
                >
                  <p className="font-medium text-white text-sm sm:text-base group-hover:text-purple-300 flex items-center">
                    <BookOpen className="w-4 h-4 mr-2" /> What&apos;s in my knowledge base?
                  </p>
                  <p className="text-xs sm:text-sm text-white/50 mt-1">Get an overview of your documents</p>
                </button>

                <button
                  onClick={() => setInput("Help me organize my notes")}
                  className="p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/10 hover:border-purple-500/30 transition-all text-left group min-h-[80px]"
                  disabled={hasChatAccess === false}
                >
                  <p className="font-medium text-white text-sm sm:text-base group-hover:text-purple-300 flex items-center">
                    <Target className="w-4 h-4 mr-2" /> Help me organize my notes
                  </p>
                  <p className="text-xs sm:text-sm text-white/50 mt-1">Get tips on PARA categorization</p>
                </button>

                <button
                  onClick={() => setInput("Search for specific information")}
                  className="p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/10 hover:border-purple-500/30 transition-all text-left group min-h-[80px]"
                  disabled={hasChatAccess === false}
                >
                  <p className="font-medium text-white text-sm sm:text-base group-hover:text-purple-300 flex items-center">
                    <Search className="w-4 h-4 mr-2" /> Find specific information
                  </p>
                  <p className="text-xs sm:text-sm text-white/50 mt-1">Search through your documents</p>
                </button>

                <button
                  onClick={() => setInput("What can you help me with?")}
                  className="p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/10 hover:border-purple-500/30 transition-all text-left group min-h-[80px]"
                  disabled={hasChatAccess === false}
                >
                  <p className="font-medium text-white text-sm sm:text-base group-hover:text-purple-300 flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2" /> What can you help with?
                  </p>
                  <p className="text-xs sm:text-sm text-white/50 mt-1">Learn about my capabilities</p>
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4 sm:space-y-6">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 sm:gap-3 max-w-[90%] sm:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 ${msg.role === 'user'
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700'
                    : 'bg-gradient-to-br from-purple-600 to-pink-600'
                    }`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-sm sm:text-base ${msg.role === 'user'
                      ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white'
                      : 'bg-white/10 border border-white/10 text-white backdrop-blur-xl'
                      }`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    <span className="text-[10px] sm:text-xs text-white/40 mt-1 px-2">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-2 sm:gap-3 max-w-[85%]">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white flex-shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white/10 border border-white/10 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl backdrop-blur-xl">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                      <span className="text-purple-400 text-sm">Lexa is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-[#1a1635]/95 backdrop-blur-xl border-t border-white/10 px-4 py-3 sm:py-4 relative z-10">
        {hasChatAccess === false && (
          <div className="absolute inset-0 bg-[#1a1635]/80 backdrop-blur-md z-20 flex flex-col items-center justify-center border-t border-purple-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-pink-400" />
              <p className="text-white font-medium text-sm sm:text-base">AI Chat is a Pro Feature</p>
            </div>
            <a href="/dashboard/pricing" className="text-xs sm:text-sm text-purple-300 hover:text-purple-200 underline underline-offset-2">
              Upgrade to talk to your documents
            </a>
          </div>
        )}

        <form onSubmit={sendMessage} className="max-w-3xl mx-auto">
          <div className="flex gap-2 sm:gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={hasChatAccess === false ? "Upgrade to Pro to chat..." : "Ask Lexa about your documents..."}
              className="flex-1 px-4 sm:px-5 py-2.5 sm:py-3 border-2 border-white/20 rounded-xl bg-white/5 text-white placeholder:text-white/40 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all min-h-[48px] text-sm sm:text-base"
              disabled={loading || hasChatAccess === false}
            />
            <Button
              type="submit"
              disabled={loading || !input.trim() || hasChatAccess === false}
              className="px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 min-h-[48px] text-sm sm:text-base flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </Button>
          </div>
          <p className="text-[10px] sm:text-xs text-white/40 text-center mt-2">
            Powered by AI • Your data stays private
          </p>
        </form>
      </div>
    </div>
  );
}
