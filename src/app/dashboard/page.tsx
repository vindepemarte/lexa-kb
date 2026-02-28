'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UpgradeModal } from '@/components/dashboard/upgrade-modal';
import { OnboardingFlow } from '@/components/dashboard/onboarding-flow';
import {
  FileText,
  HardDrive,
  Plus,
  Trash2,
  AlertTriangle,
  FolderOpen,
  MapPin,
  Book,
  Archive,
  File
} from 'lucide-react';

interface Document {
  id: number;
  title: string;
  para_category: string;
  file_type: string;
  created_at: string;
}

interface Usage {
  documents: {
    used: number;
    limit: number;
    percent: number;
  };
  storage: {
    usedFormatted: string;
    limitFormatted: string;
    percent: number;
  };
  features: {
    search: boolean;
    chat: boolean;
  };
}

export default function Dashboard() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [paraCategory, setParaCategory] = useState('resources');
  const [showUpload, setShowUpload] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [docsRes, usageRes] = await Promise.all([
        fetch('/api/documents'),
        fetch('/api/subscription'),
      ]);

      const docsData = await docsRes.json();
      const usageData = await usageRes.json();

      setDocuments(docsData.documents || []);
      setUsage(usageData.usage || null);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);

    const formData = new FormData(e.currentTarget);
    formData.set('paraCategory', paraCategory);
    if (title) formData.set('title', title);

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setTitle('');
        setShowUpload(false);
        fetchData();
      } else if (res.status === 403) {
        setShowUpgradeModal(true);
      } else {
        alert('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: number) => {
    if (!confirm('Delete this document?')) return;

    setDeleting(docId);
    try {
      const res = await fetch(`/api/documents/${docId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchData();
      } else {
        alert('Failed to delete');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete');
    } finally {
      setDeleting(null);
    }
  };



  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      projects: 'bg-blue-500',
      areas: 'bg-green-500',
      resources: 'bg-purple-500',
      archives: 'bg-gray-500',
    };
    return colors[category] || 'bg-purple-500';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'projects': return <FolderOpen className="w-5 h-5 text-blue-300" />;
      case 'areas': return <MapPin className="w-5 h-5 text-green-300" />;
      case 'resources': return <Book className="w-5 h-5 text-purple-300" />;
      case 'archives': return <Archive className="w-5 h-5 text-gray-300" />;
      default: return <File className="w-5 h-5 text-purple-300" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-6">
        {/* Page Header (Optional context for mobile) */}
        <div className="mb-8 md:hidden">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-300">
            Overview
          </h1>
        </div>
        {/* Usage Stats */}
        {usage && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Documents */}
            <div className="bg-[#1a1635]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-xl shadow-inner border border-purple-500/30">
                    <FileText className="w-5 h-5 text-purple-300" />
                  </div>
                  <span className="text-white font-bold tracking-wide">Documents</span>
                </div>
                <div className="text-right">
                  <span className="text-white font-bold text-lg">{usage.documents.used}</span>
                  <span className="text-white/50 text-sm ml-1">/ {usage.documents.limit === -1 ? '∞' : usage.documents.limit}</span>
                </div>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2 mb-2 overflow-hidden border border-white/5">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                  style={{ width: `${Math.min(usage.documents.percent, 100)}%` }}
                />
              </div>
              {usage.documents.percent >= 80 && (
                <p className="text-pink-400 text-xs mt-3 flex items-center animate-pulse">
                  <AlertTriangle className="w-4 h-4 mr-1" /> Almost at limit.
                  <button onClick={() => setShowUpgradeModal(true)} className="ml-1 underline font-semibold hover:text-pink-300 transition-colors">Upgrade now</button>
                </p>
              )}
            </div>

            {/* Storage */}
            <div className="bg-[#1a1635]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-xl shadow-inner border border-blue-500/30">
                    <HardDrive className="w-5 h-5 text-blue-300" />
                  </div>
                  <span className="text-white font-bold tracking-wide">Storage</span>
                </div>
                <div className="text-right">
                  <span className="text-white font-bold text-lg">{usage.storage.usedFormatted}</span>
                  <span className="text-white/50 text-sm ml-1">/ {usage.storage.limitFormatted}</span>
                </div>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2 mb-2 overflow-hidden border border-white/5">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                  style={{ width: `${Math.min(usage.storage.percent, 100)}%` }}
                />
              </div>
              {usage.storage.percent >= 80 && (
                <p className="text-pink-400 text-xs mt-3 flex items-center animate-pulse">
                  <AlertTriangle className="w-4 h-4 mr-1" /> Almost at limit.
                  <button onClick={() => setShowUpgradeModal(true)} className="ml-1 underline font-semibold hover:text-pink-300 transition-colors">Upgrade now</button>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div className="mb-8">
          {!showUpload ? (
            <button
              onClick={() => setShowUpload(true)}
              className="w-full min-h-[56px] bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-purple-500/20"
              aria-label="Open upload form"
            >
              <Plus className="w-6 h-6" />
              <span>Upload Document</span>
            </button>
          ) : (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Upload Document</h2>
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Title (optional)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
                    placeholder="Document title..."
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    PARA Category
                  </label>
                  <select
                    value={paraCategory}
                    onChange={(e) => setParaCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="projects" className="bg-gray-800">🎯 Projects</option>
                    <option value="areas" className="bg-gray-800">📍 Areas</option>
                    <option value="resources" className="bg-gray-800">📚 Resources</option>
                    <option value="archives" className="bg-gray-800">🗃️ Archives</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    File
                  </label>
                  <input
                    type="file"
                    name="file"
                    accept=".pdf,.txt,.md,.doc,.docx,.csv,.json,.html,.xml,.rtf,.log"
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-500 file:text-white file:cursor-pointer"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 min-h-[44px] bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUpload(false)}
                    className="min-h-[44px] px-6 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Documents Grid */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Your Documents</h2>
          {documents.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center flex flex-col items-center">
              <FileText className="w-16 h-16 text-white/20 mb-4" />
              <p className="text-white/70 text-lg">No documents yet</p>
              <p className="text-white/50 text-sm mt-2">Upload your first document to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => router.push(`/dashboard/docs/${doc.id}`)}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-purple-500/50 transition-all group cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(doc.para_category)}
                      <span className={`px-2 py-1 text-xs font-medium text-white rounded ${getCategoryColor(doc.para_category)}`}>
                        {doc.para_category}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      disabled={deleting === doc.id}
                      className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                      title="Delete document"
                      aria-label={`Delete ${doc.title}`}
                    >
                      {deleting === doc.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <h3 className="text-white font-medium mb-2 line-clamp-2">{doc.title}</h3>
                  <div className="flex items-center justify-between text-sm text-white/50">
                    <span>{doc.file_type || 'document'}</span>
                    <span>{formatDate(doc.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <OnboardingFlow />
      {usage && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          documentUsage={usage.documents}
          storageUsage={usage.storage}
        />
      )}
    </>
  );
}
