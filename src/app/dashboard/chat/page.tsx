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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-purple-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-xl animate-pulse-glow">
                💜
              </div>
              <div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                  Chat with Lexa
                </h1>
                <p className="text-xs text-gray-500">AI-powered assistant</p>
              </div>
            </div>
            
            <a
              href="/dashboard"
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-md hover:shadow-lg text-sm font-medium"
            >
              ← Dashboard
            </a>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white text-5xl mb-6 animate-float">
                💜
              </div>
              <h2 className="text-2xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                Hi! I'm Lexa
              </h2>
              <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                Your AI assistant for the knowledge base. Ask me anything about your documents!
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <button
                  onClick={() => setInput("What's in my knowledge base?")}
                  className="p-4 bg-white/80 backdrop-blur-lg rounded-xl border border-purple-100 hover:shadow-lg transition-all text-left group"
                >
                  <p className="font-medium text-gray-900 group-hover:text-purple-700">📚 What's in my knowledge base?</p>
                  <p className="text-sm text-gray-500 mt-1">Get an overview of your documents</p>
                </button>
                
                <button
                  onClick={() => setInput("Help me organize my notes")}
                  className="p-4 bg-white/80 backdrop-blur-lg rounded-xl border border-purple-100 hover:shadow-lg transition-all text-left group"
                >
                  <p className="font-medium text-gray-900 group-hover:text-purple-700">🎯 Help me organize my notes</p>
                  <p className="text-sm text-gray-500 mt-1">Get tips on PARA categorization</p>
                </button>
                
                <button
                  onClick={() => setInput("Search for specific information")}
                  className="p-4 bg-white/80 backdrop-blur-lg rounded-xl border border-purple-100 hover:shadow-lg transition-all text-left group"
                >
                  <p className="font-medium text-gray-900 group-hover:text-purple-700">🔍 Find specific information</p>
                  <p className="text-sm text-gray-500 mt-1">Search through your documents</p>
                </button>
                
                <button
                  onClick={() => setInput("What can you help me with?")}
                  className="p-4 bg-white/80 backdrop-blur-lg rounded-xl border border-purple-100 hover:shadow-lg transition-all text-left group"
                >
                  <p className="font-medium text-gray-900 group-hover:text-purple-700">💬 What can you help with?</p>
                  <p className="text-sm text-gray-500 mt-1">Learn about my capabilities</p>
                </button>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-blue-600 to-blue-700'
                      : 'bg-gradient-to-br from-purple-600 to-pink-600'
                  }`}>
                    {msg.role === 'user' ? '👤' : '💜'}
                  </div>

                  {/* Message */}
                  <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`px-5 py-3 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white'
                        : 'bg-white border border-purple-100 text-gray-900 shadow-md'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    <span className="text-xs text-gray-400 mt-1 px-2">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start animate-fade-in">
                <div className="flex gap-3 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white flex-shrink-0">
                    💜
                  </div>
                  <div className="bg-white border border-purple-100 px-5 py-3 rounded-2xl shadow-md">
                    <div className="flex gap-1">
                      <span className="animate-bounce text-purple-600" style={{ animationDelay: '0ms' }}>●</span>
                      <span className="animate-bounce text-purple-600" style={{ animationDelay: '150ms' }}>●</span>
                      <span className="animate-bounce text-purple-600" style={{ animationDelay: '300ms' }}>●</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Form */}
      <div className="sticky bottom-0 bg-white/80 backdrop-blur-lg border-t border-purple-100 px-4 py-4">
        <form onSubmit={sendMessage} className="max-w-3xl mx-auto">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-5 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
              disabled={loading}
            />
            <Button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              Send 💬
            </Button>
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">
            Powered by AI • Your data stays private
          </p>
        </form>
      </div>
    </div>
  );
}
