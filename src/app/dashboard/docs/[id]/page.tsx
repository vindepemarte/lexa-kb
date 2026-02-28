'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    FileText,
    Clock,
    BookOpen,
    Trash2,
    FolderOpen,
    MapPin,
    Book,
    Archive,
    Calendar,
    Type
} from 'lucide-react';

interface DocumentData {
    id: number;
    title: string;
    content: string;
    para_category: string;
    file_type: string;
    created_at: string;
    wordCount: number;
    readingTimeMin: number;
}

export default function DocumentViewerPage() {
    const params = useParams();
    const router = useRouter();
    const [doc, setDoc] = useState<DocumentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (!params.id) return;

        fetch(`/api/documents/${params.id}`)
            .then(res => {
                if (!res.ok) throw new Error('Document not found');
                return res.json();
            })
            .then(data => setDoc(data.document))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [params.id]);

    const handleDelete = async () => {
        if (!confirm('Delete this document permanently?')) return;
        setDeleting(true);

        try {
            const res = await fetch(`/api/documents/${params.id}`, { method: 'DELETE' });
            if (res.ok) {
                router.push('/dashboard');
            } else {
                alert('Failed to delete');
            }
        } catch {
            alert('Failed to delete');
        } finally {
            setDeleting(false);
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'projects': return <FolderOpen className="w-4 h-4" />;
            case 'areas': return <MapPin className="w-4 h-4" />;
            case 'resources': return <Book className="w-4 h-4" />;
            case 'archives': return <Archive className="w-4 h-4" />;
            default: return <FileText className="w-4 h-4" />;
        }
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            projects: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
            areas: 'bg-green-500/20 text-green-300 border-green-500/30',
            resources: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
            archives: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
        };
        return colors[category] || colors.resources;
    };

    if (loading) {
        return (
            <div className="min-h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (error || !doc) {
        return (
            <div className="min-h-full flex flex-col items-center justify-center p-8">
                <FileText className="w-16 h-16 text-white/20 mb-4" />
                <p className="text-white/70 text-lg mb-4">{error || 'Document not found'}</p>
                <button
                    onClick={() => router.push('/dashboard')}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
                >
                    ← Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center gap-2 text-white/60 hover:text-white transition-colors min-h-[44px]"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="hidden sm:inline">Back to Dashboard</span>
                </button>

                <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all min-h-[44px] disabled:opacity-50"
                >
                    <Trash2 className="w-4 h-4" />
                    <span>{deleting ? 'Deleting...' : 'Delete'}</span>
                </button>
            </div>

            {/* Document Header */}
            <div className="bg-[#1a1635]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 mb-6 shadow-xl">
                <div className="flex items-start gap-3 mb-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${getCategoryColor(doc.para_category)}`}>
                        {getCategoryIcon(doc.para_category)}
                        {doc.para_category}
                    </span>
                    {doc.file_type && (
                        <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-white/50 border border-white/10">
                            {doc.file_type.split('/').pop()}
                        </span>
                    )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">{doc.title}</h1>

                <div className="flex flex-wrap gap-4 text-sm text-white/50">
                    <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {new Date(doc.created_at).toLocaleDateString('en-US', {
                            month: 'long', day: 'numeric', year: 'numeric'
                        })}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Type className="w-4 h-4" />
                        {doc.wordCount.toLocaleString()} words
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {doc.readingTimeMin} min read
                    </span>
                </div>
            </div>

            {/* Document Content */}
            <div className="bg-[#1a1635]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/10">
                    <BookOpen className="w-5 h-5 text-purple-400" />
                    <h2 className="text-lg font-semibold text-white">Content</h2>
                </div>

                {doc.content ? (
                    <div className="prose prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap text-white/80 text-sm sm:text-base leading-relaxed font-sans bg-transparent p-0 m-0 border-none overflow-visible">
                            {doc.content}
                        </pre>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-white/20 mx-auto mb-3" />
                        <p className="text-white/50">No text content extracted from this file.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
