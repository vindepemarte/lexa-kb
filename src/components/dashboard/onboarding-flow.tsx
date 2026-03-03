'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Upload, Sparkles, X, Check } from 'lucide-react';

interface OnboardingFlowProps {
  onUploadComplete?: () => void;
}

export function OnboardingFlow({ onUploadComplete }: OnboardingFlowProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleSkip = () => {
        handleClose();
    };

    const nextStep = () => {
        if (step < 4) setStep(step + 1);
        else handleClose();
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setSelectedFile(e.dataTransfer.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('title', selectedFile.name.replace(/\.[^/.]+$/, ''));
        formData.append('paraCategory', 'resources');

        try {
            const res = await fetch('/api/documents', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                setUploadSuccess(true);
                setTimeout(() => {
                    if (onUploadComplete) onUploadComplete();
                    handleClose();
                }, 1500);
            } else {
                alert('Upload failed. You can try again later.');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload failed. You can try again later.');
        } finally {
            setUploading(false);
        }
    };

    const steps = [
        { title: "Welcome", completed: step > 1 },
        { title: "Organize", completed: step > 2 },
        { title: "Upload", completed: step > 3 },
        { title: "Done", completed: step > 4 }
    ];

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-lg bg-[#1a1635]/95 backdrop-blur-xl border border-white/10 p-0 overflow-hidden text-white shadow-2xl" aria-describedby={undefined}>
                <DialogTitle className="sr-only">Welcome to Lexa KB</DialogTitle>

                {/* Skip button */}
                <button
                    onClick={handleSkip}
                    className="absolute top-4 right-4 z-20 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    aria-label="Skip onboarding"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="relative">
                    {/* Decorative background flare */}
                    <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/30 rounded-full blur-[80px]" />
                    <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-pink-500/30 rounded-full blur-[80px]" />

                    {/* Progress bar */}
                    <div className="px-8 pt-6 pb-2 relative z-10">
                        <div className="flex items-center justify-between mb-2">
                            {steps.map((s, i) => (
                                <div key={i} className="flex items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                                        s.completed
                                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                            : step === i + 1
                                                ? 'bg-white/20 border-2 border-purple-500 text-white'
                                                : 'bg-white/10 text-white/40'
                                    }`}>
                                        {s.completed ? <Check className="w-4 h-4" /> : i + 1}
                                    </div>
                                    {i < steps.length - 1 && (
                                        <div className={`h-0.5 w-12 transition-all ${
                                            s.completed ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-white/10'
                                        }`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-8 pt-2 relative z-10 flex flex-col items-center text-center space-y-6">

                        {/* Step 1: Welcome */}
                        {step === 1 && (
                            <div className="space-y-4 w-full animate-fade-in">
                                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg border border-white/20 relative">
                                    <Sparkles className="w-10 h-10 text-white" />
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 animate-pulse opacity-50" />
                                </div>
                                <h2 className="text-3xl font-bold font-sans tracking-tight">
                                    Welcome to Lexa KB
                                </h2>
                                <p className="text-white/70 text-base leading-relaxed max-w-md">
                                    Your AI-powered second brain. Upload documents, search instantly, and chat with your knowledge base like never before.
                                </p>
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4 mt-4">
                                    <p className="text-white/60 text-sm">
                                        ✨ Free tier includes <span className="text-purple-400 font-semibold">5 documents</span> and <span className="text-purple-400 font-semibold">100MB storage</span>
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Step 2: PARA Method */}
                        {step === 2 && (
                            <div className="space-y-4 w-full animate-fade-in">
                                <h2 className="text-2xl font-bold font-sans tracking-tight">
                                    The P.A.R.A. Method
                                </h2>
                                <p className="text-white/70 text-sm leading-relaxed">
                                    We organize your knowledge using Tiago Forte&apos;s proven system
                                </p>
                                <div className="grid grid-cols-2 gap-3 mt-4 w-full">
                                    <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 p-4 rounded-xl border border-blue-500/20 hover:border-blue-500/40 transition-all">
                                        <div className="text-3xl mb-2">🎯</div>
                                        <div className="font-bold text-sm text-blue-300">Projects</div>
                                        <div className="text-xs text-white/50 mt-1">Active tasks with deadlines</div>
                                    </div>
                                    <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 p-4 rounded-xl border border-green-500/20 hover:border-green-500/40 transition-all">
                                        <div className="text-3xl mb-2">📍</div>
                                        <div className="font-bold text-sm text-green-300">Areas</div>
                                        <div className="text-xs text-white/50 mt-1">Ongoing responsibilities</div>
                                    </div>
                                    <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 p-4 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all">
                                        <div className="text-3xl mb-2">📚</div>
                                        <div className="font-bold text-sm text-purple-300">Resources</div>
                                        <div className="text-xs text-white/50 mt-1">Reference materials</div>
                                    </div>
                                    <div className="bg-gradient-to-br from-gray-500/10 to-gray-500/5 p-4 rounded-xl border border-gray-500/20 hover:border-gray-500/40 transition-all">
                                        <div className="text-3xl mb-2">🗃️</div>
                                        <div className="font-bold text-sm text-gray-300">Archives</div>
                                        <div className="text-xs text-white/50 mt-1">Completed items</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Upload */}
                        {step === 3 && (
                            <div className="space-y-4 w-full animate-fade-in">
                                {!uploadSuccess ? (
                                    <>
                                        <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                                            <Upload className="w-8 h-8 text-white" />
                                        </div>
                                        <h2 className="text-2xl font-bold font-sans tracking-tight">
                                            Upload Your First Document
                                        </h2>
                                        <p className="text-white/70 text-sm leading-relaxed">
                                            Let&apos;s add your first file to see the magic happen
                                        </p>

                                        <div
                                            className={`w-full border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer ${
                                                dragActive
                                                    ? 'border-purple-500 bg-purple-500/10'
                                                    : selectedFile
                                                        ? 'border-green-500 bg-green-500/10'
                                                        : 'border-white/20 hover:border-purple-500/50 hover:bg-white/5'
                                            }`}
                                            onDragEnter={handleDrag}
                                            onDragLeave={handleDrag}
                                            onDragOver={handleDrag}
                                            onDrop={handleDrop}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                className="hidden"
                                                accept=".pdf,.txt,.md,.doc,.docx,.csv,.json,.html,.xml,.rtf,.log"
                                                onChange={handleFileSelect}
                                            />
                                            {selectedFile ? (
                                                <div className="flex items-center justify-center space-x-2">
                                                    <Check className="w-5 h-5 text-green-400" />
                                                    <span className="text-green-300 font-medium">{selectedFile.name}</span>
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <Upload className="w-10 h-10 mx-auto text-white/40 mb-3" />
                                                    <p className="text-white/60 text-sm">
                                                        Drag & drop or click to select
                                                    </p>
                                                    <p className="text-white/40 text-xs mt-2">
                                                        PDF, TXT, MD, DOC, CSV, JSON supported
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {selectedFile && (
                                            <button
                                                onClick={handleUpload}
                                                disabled={uploading}
                                                className="w-full min-h-[44px] rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50"
                                            >
                                                {uploading ? (
                                                    <span className="flex items-center justify-center">
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                                        Uploading...
                                                    </span>
                                                ) : (
                                                    'Upload & Continue'
                                                )}
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <div className="space-y-4 py-8">
                                        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg animate-bounce">
                                            <Check className="w-10 h-10 text-white" />
                                        </div>
                                        <h2 className="text-2xl font-bold font-sans tracking-tight">
                                            Perfect!
                                        </h2>
                                        <p className="text-white/70 text-sm">
                                            Your document is being processed with AI
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 4: Features */}
                        {step === 4 && (
                            <div className="space-y-4 w-full animate-fade-in">
                                <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                                    <Sparkles className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold font-sans tracking-tight">
                                    You&apos;re All Set!
                                </h2>
                                <div className="space-y-3 text-left w-full mt-6">
                                    <div className="flex items-start space-x-3 bg-white/5 p-3 rounded-lg border border-white/10">
                                        <div className="text-2xl">🔍</div>
                                        <div>
                                            <div className="font-semibold text-sm">Smart Search</div>
                                            <div className="text-white/50 text-xs">Find anything instantly with AI-powered search</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3 bg-white/5 p-3 rounded-lg border border-white/10">
                                        <div className="text-2xl">💬</div>
                                        <div>
                                            <div className="font-semibold text-sm">Chat with Docs</div>
                                            <div className="text-white/50 text-xs">Ask questions about your documents (Pro tier)</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3 bg-white/5 p-3 rounded-lg border border-white/10">
                                        <div className="text-2xl">📊</div>
                                        <div>
                                            <div className="font-semibold text-sm">AI Summaries</div>
                                            <div className="text-white/50 text-xs">Get instant summaries of long documents (Pro tier)</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Controls */}
                        {step !== 3 && (
                            <div className="w-full pt-4 space-y-3">
                                <button
                                    onClick={nextStep}
                                    className="w-full min-h-[44px] rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                                >
                                    {step === 4 ? "Start Using Lexa KB" : "Continue"}
                                </button>

                                {step < 3 && (
                                    <button
                                        onClick={handleSkip}
                                        className="w-full text-white/50 hover:text-white text-sm py-2 transition-colors"
                                    >
                                        Skip for now
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
