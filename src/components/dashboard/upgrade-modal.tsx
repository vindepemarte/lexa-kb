'use client';

import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

interface UsageStats {
    used: number;
    limit: number;
    percent: number;
}

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    documentUsage?: UsageStats;
    storageUsage?: {
        usedFormatted: string;
        limitFormatted: string;
        percent: number;
    };
}

export function UpgradeModal({ isOpen, onClose, documentUsage, storageUsage }: UpgradeModalProps) {
    const router = useRouter();

    const handleUpgrade = () => {
        onClose();
        router.push('/dashboard/pricing');
    };

    const isLimitReached = (documentUsage?.percent && documentUsage.percent >= 100) ||
        (storageUsage?.percent && storageUsage.percent >= 100);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg bg-[#1a1635]/95 backdrop-blur-xl border border-white/10 p-0 overflow-hidden text-white shadow-2xl">
                <div className="relative">
                    {/* Subtle glowing header background */}
                    <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-purple-600/20 to-transparent" />

                    <div className="p-8 relative z-10 flex flex-col items-center text-center space-y-6 mt-4">

                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(236,72,153,0.3)] animate-float">
                            ⭐
                        </div>

                        <div>
                            <DialogTitle className="text-2xl font-bold font-sans tracking-tight mb-2">
                                {isLimitReached ? "You've reached your limit!" : "Unlock Lexa's Full Power!"}
                            </DialogTitle>
                            <DialogDescription className="text-white/70 text-base leading-relaxed">
                                {isLimitReached
                                    ? "It looks like you've maxed out your current plan. Upgrade now to keep uploading and unlock advanced features."
                                    : "Upgrade your plan to break limits, search with AI, and chat with all your documents."}
                            </DialogDescription>
                        </div>

                        {/* Quick Pricing Preview */}
                        <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-left space-y-3">
                            <div className="flex items-center space-x-3 text-sm">
                                <span className="text-pink-400 text-lg text-center w-6">✓</span>
                                <span className="text-white/90">Up to <strong className="text-white">10,000</strong> Documents</span>
                            </div>
                            <div className="flex items-center space-x-3 text-sm">
                                <span className="text-pink-400 text-lg text-center w-6">✓</span>
                                <span className="text-white/90"><strong className="text-white">5GB</strong> of lightning-fast storage</span>
                            </div>
                            <div className="flex items-center space-x-3 text-sm">
                                <span className="text-purple-400 text-lg text-center w-6">✨</span>
                                <span className="text-white/90">AI Search enabled</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="w-full flex flex-col gap-3 pt-4">
                            <button
                                onClick={handleUpgrade}
                                className="w-full min-h-[48px] rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-lg"
                            >
                                View Plans & Upgrade
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full min-h-[44px] rounded-xl bg-transparent hover:bg-white/5 text-white/50 hover:text-white/80 font-medium transition-colors"
                            >
                                Maybe Later
                            </button>
                        </div>

                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
