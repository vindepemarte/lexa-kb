'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
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
  Sparkles,
  Plus,
  History,
  Trash2,
  X
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // ISO string for JSON serialization
}

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

const CONVERSATIONS_KEY = 'lexa-chat-conversations';
const ACTIVE_CONV_KEY = 'lexa-chat-active';

function getConversations(): Conversation[] {
  try {
    return JSON.parse(localStorage.getItem(CONVERSATIONS_KEY) || '[]');
  } catch { return []; }
}

function saveConversations(convs: Conversation[]) {
  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(convs));
}

function getMessages(convId: string): Message[] {
  try {
    return JSON.parse(localStorage.getItem(`lexa-chat-${convId}`) || '[]');
  } catch { return []; }
}

function saveMessages(convId: string, msgs: Message[]) {
  localStorage.setItem(`lexa-chat-${convId}`, JSON.stringify(msgs));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function generateTitle(firstMessage: string): string {
  const cleaned = firstMessage.slice(0, 50).trim();
  return cleaned.length < firstMessage.length ? cleaned + '…' : cleaned;
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasChatAccess, setHasChatAccess] = useState<boolean | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load conversations and active conversation on mount
  useEffect(() => {
    const convs = getConversations();
    setConversations(convs);
    const savedActive = localStorage.getItem(ACTIVE_CONV_KEY);
    if (savedActive && convs.find(c => c.id === savedActive)) {
      setActiveConvId(savedActive);
      setMessages(getMessages(savedActive));
    }
  }, []);

  // Check chat access
  useEffect(() => {
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
    if (!showHistory) inputRef.current?.focus();
  }, [showHistory]);

  // Persist messages whenever they change
  const persistMessages = useCallback((convId: string, msgs: Message[]) => {
    saveMessages(convId, msgs);
    setConversations(prev => {
      const updated = prev.map(c =>
        c.id === convId
          ? { ...c, messageCount: msgs.length, updatedAt: new Date().toISOString() }
          : c
      );
      saveConversations(updated);
      return updated;
    });
  }, []);

  const startNewChat = useCallback(() => {
    const id = generateId();
    const conv: Conversation = {
      id,
      title: 'New Conversation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 0,
    };
    setConversations(prev => {
      const updated = [conv, ...prev];
      saveConversations(updated);
      return updated;
    });
    setActiveConvId(id);
    setMessages([]);
    localStorage.setItem(ACTIVE_CONV_KEY, id);
    setShowHistory(false);
  }, []);

  const switchConversation = useCallback((convId: string) => {
    setActiveConvId(convId);
    setMessages(getMessages(convId));
    localStorage.setItem(ACTIVE_CONV_KEY, convId);
    setShowHistory(false);
  }, []);

  const deleteConversation = useCallback((convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations(prev => {
      const updated = prev.filter(c => c.id !== convId);
      saveConversations(updated);
      return updated;
    });
    localStorage.removeItem(`lexa-chat-${convId}`);
    if (activeConvId === convId) {
      setActiveConvId(null);
      setMessages([]);
      localStorage.removeItem(ACTIVE_CONV_KEY);
    }
  }, [activeConvId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');

    // Create conversation if none active
    let convId = activeConvId;
    if (!convId) {
      convId = generateId();
      const conv: Conversation = {
        id: convId,
        title: generateTitle(userMessage),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messageCount: 0,
      };
      setConversations(prev => {
        const updated = [conv, ...prev];
        saveConversations(updated);
        return updated;
      });
      setActiveConvId(convId);
      localStorage.setItem(ACTIVE_CONV_KEY, convId);
    }

    // Update title if it's still "New Conversation"
    const currentConv = conversations.find(c => c.id === convId);
    if (currentConv?.title === 'New Conversation') {
      setConversations(prev => {
        const updated = prev.map(c =>
          c.id === convId ? { ...c, title: generateTitle(userMessage) } : c
        );
        saveConversations(updated);
        return updated;
      });
    }

    const newUserMsg: Message = { role: 'user', content: userMessage, timestamp: new Date().toISOString() };
    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    persistMessages(convId, updatedMessages);
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
        const assistantMsg: Message = {
          role: 'assistant',
          content: data.reply || data.error || 'Sorry, I encountered an error.',
          timestamp: new Date().toISOString()
        };
        const withReply = [...updatedMessages, assistantMsg];
        setMessages(withReply);
        persistMessages(convId, withReply);
      }
    } catch {
      const errorMsg: Message = {
        role: 'assistant',
        content: 'Sorry, I could not connect. Please check if the chat service is configured.',
        timestamp: new Date().toISOString()
      };
      const withError = [...updatedMessages, errorMsg];
      setMessages(withError);
      persistMessages(convId, withError);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
        backgroundImage: `
          radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)
        `
      }} />

      {/* History Sidebar */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-80 max-w-[85vw] bg-[#1a1635]/98 backdrop-blur-xl border-r border-white/10 flex flex-col h-full shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <History className="w-4 h-4 text-purple-400" />
                Conversations
              </h2>
              <button onClick={() => setShowHistory(false)} className="text-white/60 hover:text-white p-1 min-h-[44px] min-w-[44px] flex items-center justify-center">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3">
              <button
                onClick={startNewChat}
                className="w-full flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl text-white text-sm font-medium hover:from-purple-600/30 hover:to-pink-600/30 transition-all min-h-[44px]"
              >
                <Plus className="w-4 h-4" />
                New Conversation
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
              {conversations.length === 0 ? (
                <p className="text-white/40 text-sm text-center py-8">No conversations yet</p>
              ) : (
                conversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => switchConversation(conv.id)}
                    className={`w-full text-left px-3 py-3 rounded-xl transition-all min-h-[44px] group flex items-start justify-between gap-2 ${conv.id === activeConvId
                      ? 'bg-purple-500/20 border border-purple-500/30'
                      : 'hover:bg-white/5 border border-transparent'
                      }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-sm font-medium truncate">{conv.title}</p>
                      <p className="text-white/40 text-xs mt-0.5">
                        {formatDate(conv.updatedAt)} · {conv.messageCount} msg{conv.messageCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <button
                      onClick={(e) => deleteConversation(conv.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-all p-1 flex-shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </button>
                ))
              )}
            </div>
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setShowHistory(false)} />
        </div>
      )}

      {/* Top bar with history toggle and new chat */}
      <div className="sticky top-0 z-30 bg-[#1a1635]/80 backdrop-blur-xl border-b border-white/10 px-4 py-2">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors min-h-[44px] px-2"
          >
            <History className="w-5 h-5" />
            <span className="text-sm hidden sm:inline">History</span>
          </button>

          <div className="flex items-center gap-2">
            {activeConvId && messages.length > 0 && (
              <span className="text-white/40 text-xs hidden sm:block">
                {conversations.find(c => c.id === activeConvId)?.title || 'Chat'}
              </span>
            )}
          </div>

          <button
            onClick={startNewChat}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors min-h-[44px] px-2"
          >
            <Plus className="w-5 h-5" />
            <span className="text-sm hidden sm:inline">New Chat</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 sm:py-8 relative z-10">
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 && (
            <div className="text-center py-12 sm:py-16">
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
            Powered by AI • Your data stays private • Conversations saved locally
          </p>
        </form>
      </div>
    </div>
  );
}

