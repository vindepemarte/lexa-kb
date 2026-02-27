'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

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
      alert('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center text-white text-xl">
                🔍
              </div>
              <div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600">
                  Search Knowledge
                </h1>
                <p className="text-xs text-gray-500">Find anything instantly</p>
              </div>
            </div>
            
            <a
              href="/dashboard"
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-md hover:shadow-lg text-sm font-medium"
            >
              ← Back to Dashboard
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Search Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-pink-600 to-purple-600 text-white text-4xl mb-4 animate-pulse-glow">
            🔍
          </div>
          <h2 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            Search Your Knowledge
          </h2>
          <p className="text-gray-600 text-lg">
            Find any document, note, or idea in seconds
          </p>
        </div>

        {/* Search Form */}
        <Card className="p-8 mb-8 bg-white/80 backdrop-blur-lg border-purple-100 shadow-xl">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="relative">
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What are you looking for?"
                className="text-lg py-4 px-6 border-2 border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 font-medium">Filter by:</span>
                <select
                  value={paraCategory}
                  onChange={(e) => setParaCategory(e.target.value)}
                  className="px-4 py-2 border border-purple-200 rounded-lg focus:border-purple-500 focus:ring-purple-500 bg-white"
                >
                  <option value="">All Categories</option>
                  <option value="projects">🚀 Projects</option>
                  <option value="areas">🎯 Areas</option>
                  <option value="resources">📚 Resources</option>
                  <option value="archives">📦 Archives</option>
                </select>
              </div>

              <Button
                type="submit"
                disabled={loading || !query.trim()}
                className="ml-auto px-8 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Searching...
                  </span>
                ) : (
                  'Search 🔍'
                )}
              </Button>
            </div>
          </form>
        </Card>

        {/* Results */}
        {searched && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                {results.length === 0 ? (
                  <span className="text-gray-500">No results found</span>
                ) : (
                  <span className="font-medium text-purple-700">
                    Found {results.length} result{results.length !== 1 ? 's' : ''}
                  </span>
                )}
              </p>
              {results.length > 0 && (
                <p className="text-sm text-gray-500">
                  Sorted by relevance
                </p>
              )}
            </div>

            {results.length === 0 ? (
              <Card className="p-12 bg-white/60 backdrop-blur-lg border-purple-100 text-center">
                <div className="text-6xl mb-4">🤔</div>
                <p className="text-gray-600 text-lg mb-2">No matching documents found</p>
                <p className="text-gray-500 text-sm">Try different keywords or remove filters</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {results.map((result, index) => (
                  <Card
                    key={result.id}
                    className="p-6 bg-white/80 backdrop-blur-lg border-purple-100 hover:shadow-xl transition-all cursor-pointer group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg ${getCategoryColor(result.para_category)} flex items-center justify-center text-white text-xl flex-shrink-0`}>
                        {getCategoryEmoji(result.para_category)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900 group-hover:text-purple-700 transition-colors">
                            {result.title}
                          </h3>
                          <span className="text-sm text-gray-400 flex-shrink-0">
                            {new Date(result.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>

                        {result.highlight && (
                          <div
                            className="text-gray-600 mt-2 prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: result.highlight }}
                          />
                        )}

                        <div className="flex items-center gap-3 mt-3">
                          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full capitalize">
                            {result.para_category}
                          </span>
                          <span className="text-xs text-gray-400">{result.file_type}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!searched && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💭</div>
            <p className="text-gray-500 text-lg">Start typing to search your knowledge base</p>
            <p className="text-gray-400 text-sm mt-2">Use specific keywords for better results</p>
          </div>
        )}
      </main>
    </div>
  );
}
