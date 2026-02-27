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
    const colors = {
      projects: 'bg-blue-500',
      areas: 'bg-green-500',
      resources: 'bg-purple-500',
      archives: 'bg-gray-500',
    };
    return colors[category as keyof typeof colors] || colors.resources;
  };

  const getCategoryEmoji = (category: string) => {
    const emojis = {
      projects: '🚀',
      areas: '🎯',
      resources: '📚',
      archives: '📦',
    };
    return emojis[category as keyof typeof emojis] || '📄';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-purple-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-xl">
                💜
              </div>
              <div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                  Lexa's Knowledge Base
                </h1>
                <p className="text-xs text-gray-500">Your second brain</p>
              </div>
            </div>
            
            <div className="flex gap-2 sm:gap-3">
              <a
                href="/dashboard/docs"
                className="px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-md hover:shadow-lg text-sm font-medium"
              >
                📄 Docs
              </a>
              <a
                href="/dashboard/search"
                className="px-3 sm:px-4 py-2 bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-lg hover:from-pink-700 hover:to-pink-800 transition-all shadow-md hover:shadow-lg text-sm font-medium"
              >
                🔍 Search
              </a>
              <a
                href="/dashboard/chat"
                className="px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg text-sm font-medium"
              >
                💬 Chat
              </a>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-purple-200 text-purple-700 hover:bg-purple-50 text-sm font-medium"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Docs</p>
                <p className="text-3xl font-bold">{documents.length}</p>
              </div>
              <div className="text-4xl opacity-80">📄</div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-sm">Projects</p>
                <p className="text-3xl font-bold">{documents.filter(d => d.para_category === 'projects').length}</p>
              </div>
              <div className="text-4xl opacity-80">🚀</div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Resources</p>
                <p className="text-3xl font-bold">{documents.filter(d => d.para_category === 'resources').length}</p>
              </div>
              <div className="text-4xl opacity-80">📚</div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Areas</p>
                <p className="text-3xl font-bold">{documents.filter(d => d.para_category === 'areas').length}</p>
              </div>
              <div className="text-4xl opacity-80">🎯</div>
            </div>
          </Card>
        </div>

        {/* Upload Section */}
        <Card className="p-8 mb-8 bg-white/80 backdrop-blur-lg border-purple-100 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-2xl">
              ⚡
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Quick Upload</h2>
              <p className="text-sm text-gray-600">Add new knowledge to your base</p>
            </div>
          </div>

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="title" className="text-gray-700 font-medium">Title (optional)</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Document title..."
                  className="mt-1 border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <Label htmlFor="paraCategory" className="text-gray-700 font-medium">Category</Label>
                <select
                  id="paraCategory"
                  value={paraCategory}
                  onChange={(e) => setParaCategory(e.target.value)}
                  className="mt-1 w-full px-4 py-2 border border-purple-200 rounded-lg focus:border-purple-500 focus:ring-purple-500 bg-white"
                >
                  <option value="projects">🚀 Projects</option>
                  <option value="areas">🎯 Areas</option>
                  <option value="resources">📚 Resources</option>
                  <option value="archives">📦 Archives</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="file" className="text-gray-700 font-medium">File</Label>
                <Input
                  id="file"
                  name="file"
                  type="file"
                  required
                  className="mt-1 border-purple-200 focus:border-purple-500 focus:ring-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
              </div>
            </div>
            
            <Button
              type="submit"
              disabled={uploading}
              className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium shadow-lg hover:shadow-xl transition-all"
            >
              {uploading ? (
                <>
                  <span className="animate-pulse">Uploading...</span>
                </>
              ) : (
                <>Upload Document ⚡</>
              )}
            </Button>
          </form>
        </Card>

        {/* Documents List */}
        <Card className="p-8 bg-white/80 backdrop-blur-lg border-purple-100 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-2xl">
                📚
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Your Knowledge</h2>
                <p className="text-sm text-gray-600">{documents.length} documents</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-500 text-lg">No documents yet</p>
              <p className="text-gray-400 text-sm mt-2">Upload your first document above!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="group flex items-center justify-between p-5 bg-gradient-to-r from-white to-purple-50/30 rounded-xl border border-purple-100 hover:shadow-lg transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg ${getCategoryColor(doc.para_category)} flex items-center justify-center text-white text-xl`}>
                      {getCategoryEmoji(doc.para_category)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                        {doc.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500 capitalize">{doc.para_category}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{doc.file_type}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400">
                      {new Date(doc.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-purple-600">→</span>
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
