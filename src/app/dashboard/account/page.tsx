'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    UserCircle,
    CreditCard,
    Star,
    HardDrive,
    FileText,
    ShieldCheck,
    Zap,
    CheckCircle2
} from 'lucide-react';

interface UserUsage {
    plan: string;
    documents: { used: number; limit: number; percent: number };
    storage: { used: number; limit: number; percent: number };
    features: { search: boolean; chat: boolean };
}

export default function AccountPage() {
    const [usage, setUsage] = useState<UserUsage | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/subscription')
            .then(res => res.json())
            .then(data => {
                if (data.usage) {
                    setUsage(data.usage);
                }
            })
            .catch(err => console.error('Failed to fetch usage:', err))
            .finally(() => setLoading(false));
    }, []);

    const handleStripePortal = async () => {
        try {
            const res = await fetch('/api/stripe/create-portal', { method: 'POST' });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error('Portal error:', error);
            alert('Failed to open billing portal');
        }
    };

    if (loading) {
        return (
            <div className="min-h-full flex flex-col items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mb-4"></div>
                <p className="text-white/50">Loading account details...</p>
            </div>
        );
    }

    const isPro = usage?.plan && ['Pro', 'Enterprise'].includes(usage.plan);

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-6">
            <div className="mb-8 md:hidden">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-300">
                    Account Focus
                </h1>
            </div>

            <div className="mb-10 block md:hidden lg:block">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 shadow-xl shadow-purple-500/20 mb-6 group transition-transform hover:scale-105">
                    <UserCircle className="w-8 h-8 text-white group-hover:animate-pulse" />
                </div>
                <h2 className="text-3xl font-black mb-2 text-white tracking-tight">Your Account</h2>
                <p className="text-white/60 text-lg">Manage your Lexa subscription and usage</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Plan Details */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="bg-[#1a1635]/80 backdrop-blur-xl border border-white/10 p-6 shadow-xl relative overflow-hidden group">
                        {isPro && (
                            <div className="absolute top-0 right-0 p-4">
                                <ShieldCheck className="w-6 h-6 text-pink-400" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <h3 className="text-white/60 text-sm font-semibold uppercase tracking-wider mb-2 relative z-10">Current Plan</h3>
                        <div className="flex items-baseline gap-2 mb-6 relative z-10">
                            <span className="text-4xl font-black text-white">{usage?.plan || 'Free'}</span>
                            {!isPro && <span className="text-white/40 text-sm">Tier</span>}
                        </div>

                        <div className="space-y-3 mb-8 relative z-10">
                            <div className="flex items-center gap-2 text-sm text-white/80">
                                <CheckCircle2 className={`w-4 h-4 ${usage?.features.search ? 'text-green-400' : 'text-white/30'}`} />
                                <span>Full-text Search</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-white/80">
                                <CheckCircle2 className={`w-4 h-4 ${usage?.features.chat ? 'text-green-400' : 'text-white/30'}`} />
                                <span>AI Chat context</span>
                            </div>
                        </div>

                        <Button
                            onClick={handleStripePortal}
                            className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/20 transition-all flex items-center justify-center gap-2 relative z-10"
                        >
                            <CreditCard className="w-4 h-4" />
                            Billing Portal
                        </Button>
                    </Card>

                    {!isPro && (
                        <Card className="bg-gradient-to-br from-purple-600 to-pink-600 border-none p-6 shadow-xl shadow-purple-500/20 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 text-white/10">
                                <Zap className="w-32 h-32" />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                                    <Star className="w-5 h-5" /> Upgrade to Pro
                                </h3>
                                <p className="text-white/80 text-sm mb-6">
                                    Unlock AI Chat, intelligent document retrieval, and higher storage limits.
                                </p>
                                <a
                                    href="/dashboard/pricing"
                                    className="inline-block w-full text-center py-2.5 px-4 bg-white text-purple-600 font-bold rounded-lg hover:bg-white/90 transition-colors shadow-lg"
                                >
                                    View Pricing
                                </a>
                            </div>
                        </Card>
                    )}
                </div>

                {/* Right Column: Usage Stats */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-[#1a1635]/80 backdrop-blur-xl border border-white/10 p-6 shadow-xl">
                        <h3 className="text-xl font-bold text-white mb-6">Usage Statistics</h3>

                        <div className="space-y-8">
                            {/* Documents Usage */}
                            <div>
                                <div className="flex justify-between items-end mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center border border-pink-500/30">
                                            <FileText className="w-5 h-5 text-pink-400" />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">Documents</p>
                                            <p className="text-white/50 text-xs text-left">Files indexed</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-white font-bold">{usage?.documents.used || 0}</span>
                                        <span className="text-white/40 text-sm"> / {usage?.documents.limit === -1 ? '∞' : usage?.documents.limit}</span>
                                    </div>
                                </div>

                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${(usage?.documents.percent || 0) >= 90 ? 'bg-red-500' : 'bg-pink-500'
                                            }`}
                                        style={{ width: `${Math.min(usage?.documents.percent || 0, 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Storage Usage */}
                            <div>
                                <div className="flex justify-between items-end mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                                            <HardDrive className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">Storage Space</p>
                                            <p className="text-white/50 text-xs text-left">Megabytes used</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-white font-bold">{(usage?.storage.used || 0).toFixed(1)}MB</span>
                                        <span className="text-white/40 text-sm"> / {usage?.storage.limit}MB</span>
                                    </div>
                                </div>

                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${(usage?.storage.percent || 0) >= 90 ? 'bg-red-500' : 'bg-purple-500'
                                            }`}
                                        style={{ width: `${Math.min(usage?.storage.percent || 0, 100)}%` }}
                                    />
                                </div>
                            </div>

                        </div>
                    </Card>
                </div>

            </div>
        </div>
    );
}
