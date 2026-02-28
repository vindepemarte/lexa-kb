'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

interface Document {
  id: number;
  title: string;
  para_category: string;
  file_type: string;
  created_at: string;
}

export default function DocsPage() {
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
    const colors = {
      projects: 'bg-blue-100 text-blue-800',
      areas: 'bg-green-100 text-green-800',
      resources: 'bg-purple-100 text-purple-800',
      archives: 'bg-gray-100 text-gray-800',
    };
    return colors[category as keyof typeof colors] || colors.resources;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Documents 📄</h1>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : documents.length === 0 ? (
        <Card className="p-6">
          <p className="text-gray-500 text-center">
            No documents yet. Go to the main dashboard to upload your first one!
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
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
    </div>
  );
}
