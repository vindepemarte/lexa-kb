'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply || 'Sorry, I encountered an error.',
        timestamp: new Date()
      }]);
    } catch (error) {
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

      <header className="sticky top-0 z-50 bg-white/10 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex justify-between items-center gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-lg sm:text-xl flex-shrink-0 animate-pulse">
                💜
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-300 truncate">
                  Chat with Lexa
                </h1>
                <p className="text-xs text-white/50 hidden sm:block">AI-powered assistant</p>
              </div>
            </div>

            <a
              href="/dashboard"
              className="px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-md text-xs sm:text-sm font-medium min-h-[44px] flex items-center flex-shrink-0"
            >
              ← Dashboard
            </a>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 sm:py-8 relative z-10">
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 && (
            <div className="text-center py-16 sm:py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white text-4xl sm:text-5xl mb-6 shadow-xl">
                💜
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-300">
                Hi! I'm Lexa
              </h2>
              <p className="text-white/70 text-base sm:text-lg mb-8 max-w-md mx-auto px-4">
                Your AI assistant for the knowledge base. Ask me anything about your documents!
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto px-4">
                <button
                  onClick={() => setInput("What's in my knowledge base?")}
                  className="p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/10 hover:border-purple-500/30 transition-all text-left group min-h-[80px]"
                >
                  <p className="font-medium text-white text-sm sm:text-base group-hover:text-purple-300">📚 What's in my knowledge base?</p>
                  <p className="text-xs sm:text-sm text-white/50 mt-1">Get an overview of your documents</p>
                </button>

                <button
                  onClick={() => setInput("Help me organize my notes")}
                  className="p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/10 hover:border-purple-500/30 transition-all text-left group min-h-[80px]"
                >
                  <p className="font-medium text-white text-sm sm:text-base group-hover:text-purple-300">🎯 Help me organize my notes</p>
                  <p className="text-xs sm:text-sm text-white/50 mt-1">Get tips on PARA categorization</p>
                </button>

                <button
                  onClick={() => setInput("Search for specific information")}
                  className="p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/10 hover:border-purple-500/30 transition-all text-left group min-h-[80px]"
                >
                  <p className="font-medium text-white text-sm sm:text-base group-hover:text-purple-300">🔍 Find specific information</p>
                  <p className="text-xs sm:text-sm text-white/50 mt-1">Search through your documents</p>
                </button>

                <button
                  onClick={() => setInput("What can you help me with?")}
                  className="p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/10 hover:border-purple-500/30 transition-all text-left group min-h-[80px]"
                >
                  <p className="font-medium text-white text-sm sm:text-base group-hover:text-purple-300">💬 What can you help with?</p>
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
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-blue-600 to-blue-700'
                      : 'bg-gradient-to-br from-purple-600 to-pink-600'
                  }`}>
                    {msg.role === 'user' ? '👤' : '💜'}
                  </div>

                  <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-sm sm:text-base ${
                      msg.role === 'user'
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
                    💜
                  </div>
                  <div className="bg-white/10 border border-white/10 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl backdrop-blur-xl">
                    <div className="flex gap-1">
                      <span className="animate-bounce text-purple-400 text-sm" style={{ animationDelay: '0ms' }}>●</span>
                      <span className="animate-bounce text-purple-400 text-sm" style={{ animationDelay: '150ms' }}>●</span>
                      <span className="animate-bounce text-purple-400 text-sm" style={{ animationDelay: '300ms' }}>●</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-white/10 backdrop-blur-xl border-t border-white/10 px-4 py-3 sm:py-4 relative z-10">
        <form onSubmit={sendMessage} className="max-w-3xl mx-auto">
          <div className="flex gap-2 sm:gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 sm:px-5 py-2.5 sm:py-3 border-2 border-white/20 rounded-xl bg-white/5 text-white placeholder:text-white/40 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all min-h-[48px] text-sm sm:text-base"
              disabled={loading}
            />
            <Button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 min-h-[48px] text-sm sm:text-base"
            >
              Send 💬
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
