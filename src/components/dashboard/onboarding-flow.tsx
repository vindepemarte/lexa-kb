'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

export function OnboardingFlow() {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(1);

    useEffect(() => {
        // Only show on first visit after login
        const hasSeenOnboarding = localStorage.getItem('lexa_onboarding_done');
        if (!hasSeenOnboarding) {
            setIsOpen(true);
        }
    }, []);

    const handleClose = () => {
        localStorage.setItem('lexa_onboarding_done', 'true');
        setIsOpen(false);
    };

    const nextStep = () => {
        if (step < 3) setStep(step + 1);
        else handleClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md bg-[#1a1635]/95 backdrop-blur-xl border border-white/10 p-0 overflow-hidden text-white shadow-2xl" aria-describedby={undefined}>
                <DialogTitle className="sr-only">Welcome to Lexa KB</DialogTitle>
                <div className="relative">
                    {/* Decorative background flare */}
                    <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/30 rounded-full blur-[80px]" />
                    <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-pink-500/30 rounded-full blur-[80px]" />

                    <div className="p-8 relative z-10 flex flex-col items-center text-center space-y-6">

                        {/* Step 1 */}
                        {step === 1 && (
                            <div className="animate-fade-in space-y-4">
                                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl shadow-lg border border-white/20">
                                    💜
                                </div>
                                <h2 className="text-2xl font-bold font-sans tracking-tight">Welcome to Lexa KB</h2>
                                <p className="text-white/70 text-base leading-relaxed">
                                    Your intelligent second brain. We use AI to help you organize, search, and chat with all your documents seamlessly.
                                </p>
                            </div>
                        )}

                        {/* Step 2 */}
                        {step === 2 && (
                            <div className="animate-fade-in space-y-4">
                                <div className="grid grid-cols-2 gap-3 mb-2">
                                    <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                                        <div className="text-2xl mb-1">🎯</div>
                                        <div className="font-semibold text-sm">Projects</div>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                                        <div className="text-2xl mb-1">📍</div>
                                        <div className="font-semibold text-sm">Areas</div>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                                        <div className="text-2xl mb-1">📚</div>
                                        <div className="font-semibold text-sm">Resources</div>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                                        <div className="text-2xl mb-1">🗃️</div>
                                        <div className="font-semibold text-sm">Archives</div>
                                    </div>
                                </div>
                                <h2 className="text-xl font-bold font-sans tracking-tight">The P.A.R.A. Method</h2>
                                <p className="text-white/70 text-sm leading-relaxed">
                                    We automatically organize your uploads into Projects, Areas, Resources, or Archives based on Tiago Forte&apos;s proven method.
                                </p>
                            </div>
                        )}

                        {/* Step 3 */}
                        {step === 3 && (
                            <div className="animate-fade-in space-y-4">
                                <div className="w-20 h-20 mx-auto rounded-xl bg-white/5 border border-white/20 flex items-center justify-center text-4xl">
                                    📄
                                </div>
                                <h2 className="text-2xl font-bold font-sans tracking-tight">Let&apos;s Go!</h2>
                                <p className="text-white/70 text-base leading-relaxed">
                                    Start by uploading your first document, article, or note to build your knowledge base.
                                </p>
                            </div>
                        )}

                        {/* Controls */}
                        <div className="w-full pt-4 space-y-3">
                            <button
                                onClick={nextStep}
                                className="w-full min-h-[44px] rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                            >
                                {step === 3 ? "Start Uploading" : "Continue"}
                            </button>

                            <div className="flex justify-center space-x-2 pt-2">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${step === i ? 'w-6 bg-purple-500' : 'w-1.5 bg-white/20'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
