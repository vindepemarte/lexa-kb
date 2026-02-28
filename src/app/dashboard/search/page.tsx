'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Search as SearchIcon,
  Rocket,
  Target,
  Book,
  Archive,
  HelpCircle,
  MessageCircle,
  FileText,
  Lock
} from 'lucide-react';

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
  const [hasSearchAccess, setHasSearchAccess] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/subscription')
      .then(res => res.json())
      .then(data => {
        if (data.usage?.features) {
          setHasSearchAccess(data.usage.features.search);
        } else {
          setHasSearchAccess(false);
        }
      })
      .catch(() => setHasSearchAccess(false));
  }, []);

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
    const colors: Record<string, string> = {
      projects: 'from-blue-500 to-blue-600',
      areas: 'from-green-500 to-green-600',
      resources: 'from-purple-500 to-purple-600',
      archives: 'from-gray-500 to-gray-600',
    };
    return colors[category] || colors.resources;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'projects': return <Rocket className="w-5 h-5" />;
      case 'areas': return <Target className="w-5 h-5" />;
      case 'resources': return <Book className="w-5 h-5" />;
      case 'archives': return <Archive className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] relative overflow-hidden">
      {hasSearchAccess === false && (
        <div className="absolute inset-0 z-50 bg-[#0f0c29]/80 backdrop-blur-md flex flex-col items-center justify-center p-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-600/30 to-pink-600/30 border border-purple-500/30 mb-6">
            <Lock className="w-8 h-8 text-pink-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Search is a Personal Feature</h2>
          <p className="text-white/60 text-center mb-6 max-w-md">Upgrade to Personal (€9/mo) or higher to unlock full-text search across all your documents.</p>
          <a
            href="/dashboard/pricing"
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/20 transition-all"
          >
            Upgrade Now
          </a>
        </div>
      )}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
        backgroundImage: `
          radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)
        `
      }} />

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-pink-600 to-purple-600 text-white mb-4 shadow-xl">
            <SearchIcon className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-300">
            Search Your Knowledge
          </h2>
          <p className="text-white/70 text-base sm:text-lg px-4">
            Find any document, note, or idea in seconds
          </p>
        </div>

        <Card className="p-5 sm:p-8 mb-6 sm:mb-8 bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
          <form onSubmit={handleSearch} className="space-y-4 sm:space-y-6">
            <div className="relative">
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What are you looking for?"
                className="text-base sm:text-lg py-3 sm:py-4 px-4 sm:px-6 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-purple-500 min-h-[48px] sm:min-h-[56px]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-xs sm:text-sm text-white/70 font-medium whitespace-nowrap">Filter:</span>
                <select
                  value={paraCategory}
                  onChange={(e) => setParaCategory(e.target.value)}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 border border-white/20 rounded-lg bg-white/5 text-white focus:border-purple-500 min-h-[44px] text-sm"
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
                className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 min-h-[48px] text-sm sm:text-base"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Searching...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <SearchIcon className="w-4 h-4" />
                    Search
                  </span>
                )}
              </Button>
            </div>
          </form>
        </Card>

        {searched && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <p className="text-white/70 text-sm">
                {results.length === 0 ? (
                  <span className="text-white/50">No results found</span>
                ) : (
                  <span className="font-medium text-purple-300">
                    Found {results.length} result{results.length !== 1 ? 's' : ''}
                  </span>
                )}
              </p>
              {results.length > 0 && (
                <p className="text-xs text-white/40 hidden sm:block">
                  Sorted by relevance
                </p>
              )}
            </div>

            {results.length === 0 ? (
              <Card className="p-8 sm:p-12 bg-white/5 backdrop-blur-xl border-white/10 text-center flex flex-col items-center">
                <HelpCircle className="w-16 h-16 text-white/20 mb-4" />
                <p className="text-white/60 text-base sm:text-lg mb-2">No matching documents found</p>
                <p className="text-white/40 text-sm">Try different keywords or remove filters</p>
              </Card>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {results.map((result, index) => (
                  <Card
                    key={result.id}
                    className="p-4 sm:p-6 bg-white/10 backdrop-blur-xl border-white/10 hover:border-purple-500/30 transition-all cursor-pointer group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br ${getCategoryColor(result.para_category)} flex items-center justify-center text-white flex-shrink-0`}>
                        {getCategoryIcon(result.para_category)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="font-semibold text-base sm:text-lg text-white group-hover:text-purple-300 transition-colors">
                            {result.title}
                          </h3>
                          <span className="text-xs text-white/40 flex-shrink-0 hidden sm:block">
                            {new Date(result.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>

                        {result.highlight && (
                          <div
                            className="text-white/70 text-sm mt-2 prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: result.highlight }}
                          />
                        )}

                        <div className="flex items-center gap-2 mt-3">
                          <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full capitalize">
                            {result.para_category}
                          </span>
                          <span className="text-xs text-white/40">{result.file_type}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {!searched && (
          <div className="text-center py-8 sm:py-12 flex flex-col items-center">
            <MessageCircle className="w-16 h-16 text-white/20 mb-4" />
            <p className="text-white/60 text-base sm:text-lg">Start typing to search your knowledge base</p>
            <p className="text-white/40 text-sm mt-2">Use specific keywords for better results</p>
          </div>
        )}
      </main>
    </div>
  );
}
