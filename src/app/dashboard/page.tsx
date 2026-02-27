'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Document {
  id: number;
  title: string;
  para_category: string;
  file_type: string;
  created_at: string;
}

export default function Dashboard() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [paraCategory, setParaCategory] = useState('resources');
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/documents');
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
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
        fetchDocuments();
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

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      projects: 'from-blue-500 to-blue-600',
      areas: 'from-green-500 to-green-600',
      resources: 'from-purple-500 to-purple-600',
      archives: 'from-gray-500 to-gray-600',
    };
    return colors[category] || colors.resources;
  };

  const getCategoryEmoji = (category: string) => {
    const emojis: Record<string, string> = {
      projects: '🚀',
      areas: '🎯',
      resources: '📚',
      archives: '📦',
    };
    return emojis[category] || '📄';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
        backgroundImage: `
          radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)
        `
      }} />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/10 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex justify-between items-center gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-lg sm:text-xl flex-shrink-0">
                💜
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-300 truncate">
                  Knowledge Base
                </h1>
                <p className="text-xs text-white/50 hidden sm:block">Your second brain</p>
              </div>
            </div>

            <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
              <a
                href="/dashboard/search"
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-lg hover:from-pink-700 hover:to-pink-800 transition-all font-medium min-h-[44px] flex items-center"
              >
                🔍
                <span className="hidden sm:inline ml-1">Search</span>
              </a>
              <a
                href="/dashboard/chat"
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium min-h-[44px] flex items-center"
              >
                💬
                <span className="hidden sm:inline ml-1">Chat</span>
              </a>
              <a
                href="/dashboard/pricing"
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-medium min-h-[44px] flex items-center"
              >
                ⭐
                <span className="hidden sm:inline ml-1">Upgrade</span>
              </a>
              <Button
                onClick={handleLogout}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-white/10 border border-white/20 text-white hover:bg-white/20 min-h-[44px]"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card className="p-4 sm:p-6 bg-gradient-to-br from-purple-600 to-purple-700 text-white border-0 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xs sm:text-sm">Total</p>
                <p className="text-2xl sm:text-3xl font-bold">{documents.length}</p>
              </div>
              <div className="text-2xl sm:text-3xl opacity-80">📄</div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs sm:text-sm">Projects</p>
                <p className="text-2xl sm:text-3xl font-bold">{documents.filter(d => d.para_category === 'projects').length}</p>
              </div>
              <div className="text-2xl sm:text-3xl opacity-80">🚀</div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 bg-gradient-to-br from-green-600 to-green-700 text-white border-0 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs sm:text-sm">Areas</p>
                <p className="text-2xl sm:text-3xl font-bold">{documents.filter(d => d.para_category === 'areas').length}</p>
              </div>
              <div className="text-2xl sm:text-3xl opacity-80">🎯</div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 bg-gradient-to-br from-pink-600 to-pink-700 text-white border-0 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-xs sm:text-sm">Resources</p>
                <p className="text-2xl sm:text-3xl font-bold">{documents.filter(d => d.para_category === 'resources').length}</p>
              </div>
              <div className="text-2xl sm:text-3xl opacity-80">📚</div>
            </div>
          </Card>
        </div>

        {/* Upload Button */}
        {!showUpload && (
          <button
            onClick={() => setShowUpload(true)}
            className="w-full mb-6 sm:mb-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all min-h-[56px] text-base"
          >
            ⚡ Upload New Document
          </button>
        )}

        {/* Upload Form */}
        {showUpload && (
          <Card className="p-5 sm:p-8 mb-6 sm:mb-8 bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-xl sm:text-2xl">
                  ⚡
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">Quick Upload</h2>
                  <p className="text-xs sm:text-sm text-white/60">Add new knowledge</p>
                </div>
              </div>
              <button
                onClick={() => setShowUpload(false)}
                className="text-white/60 hover:text-white text-2xl min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="title" className="text-white/90 text-sm font-medium">Title (optional)</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Document title..."
                    className="mt-1.5 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-purple-500 min-h-[44px]"
                  />
                </div>

                <div>
                  <Label htmlFor="paraCategory" className="text-white/90 text-sm font-medium">Category</Label>
                  <select
                    id="paraCategory"
                    value={paraCategory}
                    onChange={(e) => setParaCategory(e.target.value)}
                    className="mt-1.5 w-full px-3 py-2.5 border border-white/20 rounded-lg bg-white/5 text-white focus:border-purple-500 min-h-[44px]"
                  >
                    <option value="projects">🚀 Projects</option>
                    <option value="areas">🎯 Areas</option>
                    <option value="resources">📚 Resources</option>
                    <option value="archives">📦 Archives</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="file" className="text-white/90 text-sm font-medium">File</Label>
                  <Input
                    id="file"
                    name="file"
                    type="file"
                    required
                    className="mt-1.5 bg-white/5 border-white/20 text-white file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600/30 file:text-purple-200 hover:file:bg-purple-600/50 min-h-[44px]"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={uploading}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 min-h-[48px] text-base"
              >
                {uploading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Uploading...
                  </span>
                ) : (
                  'Upload Document ⚡'
                )}
              </Button>
            </form>
          </Card>
        )}

        {/* Documents List */}
        <Card className="p-5 sm:p-8 bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-xl sm:text-2xl">
              📚
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">Your Knowledge</h2>
              <p className="text-xs sm:text-sm text-white/60">{documents.length} documents</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl sm:text-6xl mb-4">📝</div>
              <p className="text-white/60 text-base sm:text-lg mb-2">No documents yet</p>
              <p className="text-white/40 text-sm">Upload your first document above!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="group flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-purple-500/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br ${getCategoryColor(doc.para_category)} flex items-center justify-center text-white text-lg sm:text-xl flex-shrink-0`}>
                      {getCategoryEmoji(doc.para_category)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm sm:text-base text-white truncate">
                        {doc.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-white/50 capitalize">{doc.para_category}</span>
                        <span className="text-xs text-white/30">•</span>
                        <span className="text-xs text-white/50 truncate">{doc.file_type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <span className="text-xs text-white/40 hidden sm:block">
                      {new Date(doc.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-purple-400">
                      →
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
