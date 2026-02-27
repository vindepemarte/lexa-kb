'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';

const plans = [
  {
    id: 'personal',
    name: 'Personal',
    price: '€9',
    priceId: 'price_1T5FC5QyB02WZhhMEg8fFmYe',
    description: 'Perfect for individuals getting organized',
    features: [
      'Up to 10,000 notes',
      'PARA organization',
      'Full-text search',
      'Email support',
      '5GB storage',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '€29',
    priceId: 'price_1T5FCJQyB02WZhhMlMXvSDYb',
    description: 'For power users and small teams',
    features: [
      'Unlimited notes',
      'AI chat assistant',
      'Team sharing (3 users)',
      'Priority support',
      '50GB storage',
      'Advanced search filters',
    ],
    featured: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '€99',
    priceId: 'price_1T5FCTQyB02WZhhMufeyyHwh',
    description: 'For teams and organizations',
    features: [
      'Unlimited team members',
      'API access',
      'Custom integrations',
      'Dedicated support',
      'Unlimited storage',
      'SSO & advanced security',
    ],
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string, planId: string) => {
    setLoading(planId);
    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to subscribe');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
        backgroundImage: `
          radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)
        `
      }} />

      <header className="sticky top-0 z-50 bg-white/10 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-300">
              Choose Your Plan
            </h1>
            <a
              href="/dashboard"
              className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all text-sm min-h-[44px] flex items-center"
            >
              ← Back
            </a>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl font-black mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
            Upgrade Your Knowledge
          </h2>
          <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto px-4">
            Unlock more features and storage to build your second brain
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative p-5 sm:p-6 bg-white/10 backdrop-blur-xl border-0 shadow-2xl ${
                plan.featured
                  ? 'ring-2 ring-purple-500 scale-100 md:scale-105'
                  : ''
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full">
                  Most Popular
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl sm:text-5xl font-black text-white">{plan.price}</span>
                  <span className="text-white/60 text-sm sm:text-base">/mo</span>
                </div>
                <p className="text-white/60 text-xs sm:text-sm mt-2">{plan.description}</p>
              </div>

              <ul className="space-y-2.5 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                    <span className="text-purple-400 mt-0.5 flex-shrink-0">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.priceId, plan.id)}
                disabled={loading === plan.id}
                className={`w-full py-3 rounded-full font-semibold transition-all min-h-[48px] text-sm sm:text-base ${
                  plan.featured
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                } disabled:opacity-50`}
              >
                {loading === plan.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </span>
                ) : (
                  'Get Started'
                )}
              </button>
            </Card>
          ))}
        </div>

        <p className="text-center text-white/50 text-xs sm:text-sm mt-8 px-4">
          Secure payment powered by Stripe. Cancel anytime.
        </p>
      </main>
    </div>
  );
}
