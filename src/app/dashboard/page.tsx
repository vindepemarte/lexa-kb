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
      projects: 'bg-blue-100 text-blue-800',
      areas: 'bg-green-100 text-green-800',
      resources: 'bg-purple-100 text-purple-800',
      archives: 'bg-gray-100 text-gray-800',
    };
    return colors[category as keyof typeof colors] || colors.resources;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Lexa&apos;s Knowledge Base</h1>
          <Button onClick={handleLogout} variant="outline">Logout</Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Upload Section */}
        <Card className="p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Upload Document</h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="title">Title (optional)</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Document title"
                />
              </div>
              <div>
                <Label htmlFor="paraCategory">PARA Category</Label>
                <select
                  id="paraCategory"
                  value={paraCategory}
                  onChange={(e) => setParaCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="projects">Projects</option>
                  <option value="areas">Areas</option>
                  <option value="resources">Resources</option>
                  <option value="archives">Archives</option>
                </select>
              </div>
              <div>
                <Label htmlFor="file">File</Label>
                <Input id="file" name="file" type="file" required />
              </div>
            </div>
            <Button type="submit" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </form>
        </Card>

        {/* Documents List */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Your Documents</h2>
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : documents.length === 0 ? (
            <p className="text-gray-500">No documents yet. Upload your first one!</p>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getCategoryColor(doc.para_category)}`}>
                      {doc.para_category}
                    </span>
                    <span className="font-medium">{doc.title}</span>
                    <span className="text-sm text-gray-500">{doc.file_type}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
