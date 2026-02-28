'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Sparkles, Crown, Building2 } from 'lucide-react';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '€0',
    priceId: null,
    icon: Sparkles,
    description: 'Get started organizing your knowledge',
    features: [
      'Up to 5 documents',
      'PARA organization system',
      'Document viewer with reading stats',
      'Limited search (3 results)',
      '100MB storage',
    ],
    limitations: [
      'No PDF text extraction',
      'No AI chat',
    ],
    cta: 'Current Plan',
    disabled: true,
  },
  {
    id: 'personal',
    name: 'Personal',
    price: '€9',
    priceId: 'price_1T5FC5QyB02WZhhMEg8fFmYe',
    icon: Crown,
    description: 'Full-text search across all your documents',
    features: [
      'Up to 10,000 documents',
      'Full-text search (unlimited results)',
      'PDF text extraction',
      'PARA organization system',
      'Document viewer with reading stats',
      '5GB storage',
      'Email support',
    ],
    featured: true,
    cta: 'Get Personal',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '€29',
    priceId: 'price_1T5FCJQyB02WZhhMlMXvSDYb',
    icon: Crown,
    description: 'AI-powered knowledge assistant',
    features: [
      'Everything in Personal',
      'AI Chat — ask questions about your docs',
      'Intelligent document context retrieval',
      'Unlimited documents',
      '50GB storage',
      'Priority support',
    ],
    cta: 'Get Pro',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '€99',
    priceId: null,
    icon: Building2,
    description: 'For teams and organizations',
    features: [
      'Everything in Pro',
      'Team sharing & collaboration',
      'API access',
      'Custom integrations',
      'Unlimited storage',
      'Dedicated support',
    ],
    comingSoon: true,
    cta: 'Coming Soon',
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string | null, planId: string) => {
    if (!priceId) return;
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
            Every feature listed here is real and working. No surprises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card
                key={plan.id}
                className={`relative p-5 sm:p-6 bg-white/10 backdrop-blur-xl border-0 shadow-2xl ${plan.featured
                    ? 'ring-2 ring-purple-500 scale-100 lg:scale-105'
                    : ''
                  } ${plan.comingSoon ? 'opacity-75' : ''}`}
              >
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full whitespace-nowrap">
                    Best Value
                  </div>
                )}

                {plan.comingSoon && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-white/20 text-white text-xs font-bold rounded-full whitespace-nowrap">
                    Coming Soon
                  </div>
                )}

                <div className="text-center mb-5">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/20 mb-3">
                    <Icon className="w-5 h-5 text-purple-300" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-white">{plan.price}</span>
                    {plan.price !== '€0' && <span className="text-white/60 text-sm">/mo</span>}
                  </div>
                  <p className="text-white/60 text-xs sm:text-sm mt-2">{plan.description}</p>
                </div>

                <ul className="space-y-2 mb-5">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                      <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {plan.limitations?.map((limitation, i) => (
                    <li key={`lim-${i}`} className="flex items-start gap-2 text-sm text-white/40">
                      <span className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">✕</span>
                      <span>{limitation}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.priceId, plan.id)}
                  disabled={loading === plan.id || plan.disabled || plan.comingSoon}
                  className={`w-full py-3 rounded-full font-semibold transition-all min-h-[48px] text-sm ${plan.featured
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl'
                      : plan.disabled || plan.comingSoon
                        ? 'bg-white/5 text-white/40 border border-white/10 cursor-not-allowed'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                    } disabled:opacity-60`}
                >
                  {loading === plan.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </span>
                  ) : (
                    plan.cta
                  )}
                </button>
              </Card>
            );
          })}
        </div>

        <p className="text-center text-white/50 text-xs sm:text-sm mt-8 px-4">
          Secure payment powered by Stripe. Cancel anytime. All features are real and working.
        </p>
      </main>
    </div>
  );
}
