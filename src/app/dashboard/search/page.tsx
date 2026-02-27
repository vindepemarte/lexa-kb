'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SearchResult {
  id: number;
  title: string;
  para_category: string;
  file_type: string;
  highlight?: string;
  created_at: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [paraCategory, setParaCategory] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, paraCategory: paraCategory || undefined }),
      });

      const data = await res.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Search failed:', error);
      alert('Search failed');
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
      <h1 className="text-3xl font-bold mb-6">Search Your Knowledge 🔍</h1>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your documents..."
              className="text-lg py-3"
            />
          </div>
          <Button type="submit" disabled={loading} className="px-8">
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </div>

        <div className="flex gap-4 items-center">
          <Label htmlFor="category">Filter by category:</Label>
          <select
            id="category"
            value={paraCategory}
            onChange={(e) => setParaCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">All categories</option>
            <option value="projects">Projects</option>
            <option value="areas">Areas</option>
            <option value="resources">Resources</option>
            <option value="archives">Archives</option>
          </select>
        </div>
      </form>

      {searched && (
        <div>
          <p className="text-gray-600 mb-4">
            {results.length === 0
              ? 'No results found. Try different keywords.'
              : `Found ${results.length} result${results.length !== 1 ? 's' : ''}`}
          </p>

          <div className="space-y-4">
            {results.map((result) => (
              <div
                key={result.id}
                className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getCategoryColor(result.para_category)}`}>
                      {result.para_category}
                    </span>
                    <h3 className="font-semibold text-lg">{result.title}</h3>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(result.created_at).toLocaleDateString()}
                  </span>
                </div>

                {result.highlight && (
                  <div
                    className="text-gray-600 mt-2"
                    dangerouslySetInnerHTML={{ __html: result.highlight }}
                  />
                )}

                <p className="text-sm text-gray-500 mt-2">{result.file_type}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
