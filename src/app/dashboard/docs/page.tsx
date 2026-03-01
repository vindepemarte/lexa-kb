'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import {
  FileText,
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

export default function DocsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8 md:hidden">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-300">
          Documents
        </h1>
      </div>

      <div className="mb-8 hidden md:block">
        <h1 className="text-3xl font-bold text-white mb-2">Your Documents</h1>
        <p className="text-white/60">Browse and manage all your uploaded files</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      ) : documents.length === 0 ? (
        <Card className="p-8 bg-white/5 backdrop-blur-xl border-white/10 text-center flex flex-col items-center">
          <FileText className="w-16 h-16 text-white/20 mb-4" />
          <p className="text-white/70 text-lg mb-2">No documents yet</p>
          <p className="text-white/50 text-sm mb-4">
            Go to the dashboard to upload your first document!
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium rounded-xl transition-all min-h-[44px]"
          >
            Go to Dashboard
          </button>
        </Card>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => router.push(`/dashboard/docs/${doc.id}`)}
              className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl hover:border-purple-500/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {getCategoryIcon(doc.para_category)}
                  <span className={`px-2 py-1 text-xs font-medium text-white rounded ${getCategoryColor(doc.para_category)}`}>
                    {doc.para_category}
                  </span>
                </div>
                <span className="font-medium text-white group-hover:text-purple-300 transition-colors">{doc.title}</span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-white/50">
                <span className="hidden sm:inline">{doc.file_type || 'document'}</span>
                <span>{formatDate(doc.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
