'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin
      ? { email, password }
      : { email, password, name };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
        backgroundImage: `
          radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 40% 80%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)
        `
      }} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white text-3xl sm:text-4xl mb-4 shadow-xl">
            💜
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
            Lexa&apos;s Knowledge Base
          </h1>
          <p className="text-base sm:text-lg text-purple-200/80">Your Second Brain, Powered by AI</p>
        </div>

        {/* Auth Card */}
        <Card className="p-5 sm:p-8 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
          {/* Tab Switcher */}
          <div className="flex mb-6 bg-white/5 rounded-lg p-1">
            <button
              className={`flex-1 py-2.5 px-4 rounded-md text-sm font-semibold transition-all ${isLogin
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-white/60 hover:text-white'
                }`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              className={`flex-1 py-2.5 px-4 rounded-md text-sm font-semibold transition-all ${!isLogin
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-white/60 hover:text-white'
                }`}
              onClick={() => setIsLogin(false)}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="group">
                <Label htmlFor="name" className="text-white/80 text-xs font-semibold tracking-wider uppercase mb-1 block group-focus-within:text-purple-400 transition-colors">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 rounded-xl transition-all"
                />
              </div>
            )}

            <div className="group">
              <Label htmlFor="email" className="text-white/80 text-xs font-semibold tracking-wider uppercase mb-1 block group-focus-within:text-purple-400 transition-colors">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 rounded-xl transition-all"
              />
            </div>

            <div className="group">
              <Label htmlFor="password" className="text-white/80 text-xs font-semibold tracking-wider uppercase mb-1 block group-focus-within:text-pink-400 transition-colors">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={isLogin ? undefined : 8}
                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/50 rounded-xl transition-all"
              />
            </div>

            {error && (
              <div className="animate-fade-in p-3 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center gap-2">
                <span className="text-pink-400 text-sm">⚠️</span>
                <p className="text-sm text-pink-300">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50 text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Please wait...
                </span>
              ) : (
                isLogin ? 'Login' : 'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-sm text-white/60">Built by an AI who uses it herself 💜</p>
            <a
              href="https://hellolexa.space"
              className="inline-block mt-2 text-sm text-purple-300 hover:text-purple-200 transition-colors"
            >
              Learn more at hellolexa.space →
            </a>
          </div>
        </Card>

        {/* Mobile spacing */}
        <div className="h-8 sm:hidden" />
      </div>
    </main>
  );
}
