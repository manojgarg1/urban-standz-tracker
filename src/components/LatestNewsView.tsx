import React, { useState, useMemo } from 'react';
import { 
  Flame, 
  Search, 
  Calendar, 
  ExternalLink, 
  Tag, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  Radio, 
  Megaphone, 
  Building2 
} from 'lucide-react';
import { NewsArticle } from '../types';

interface LatestNewsViewProps {
  news: NewsArticle[];
  isAdmin: boolean;
  onOpenAddNews?: () => void;
  onDeleteNews?: (item: NewsArticle) => void;
}

export const LatestNewsView: React.FC<LatestNewsViewProps> = ({
  news,
  isAdmin,
  onOpenAddNews,
  onDeleteNews
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = useMemo(() => {
    return Array.from(new Set(news.map(n => n.category).filter(Boolean)));
  }, [news]);

  const filteredNews = useMemo(() => {
    return news.filter(item => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const fullTarget = [
          item.title,
          item.source,
          item.summary,
          item.content,
          item.category,
          ...(item.tags || [])
        ].filter(Boolean).join(' ').toLowerCase();

        if (!fullTarget.includes(q)) return false;
      }

      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [news, searchQuery, selectedCategory]);

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'Police & FIR':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'Court Proceeding':
        return 'bg-court-500/20 text-court-300 border-court-500/30';
      case 'Media Expose':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Advisory':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default:
        return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 text-rose-400 font-semibold text-xs mb-1">
            <Flame className="w-4 h-4" />
            <span>Investigation & Court Bulletins</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Latest News & Developments
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Live updates on police investigations, paper publications, advocate hearings, and media reporting in the Urban Standz scam.
          </p>
        </div>

        {isAdmin && onOpenAddNews && (
          <button
            onClick={onOpenAddNews}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-court-600 hover:bg-court-500 text-white text-xs font-semibold shadow-lg shadow-court-600/30 transition-all shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Post News Update</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search news by keywords, police station, sections, tags..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-court-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-court-500"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span>Showing {filteredNews.length} of {news.length} news items</span>
          {(searchQuery || selectedCategory !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="text-court-400 hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* News Feed Timeline */}
      {filteredNews.length === 0 ? (
        <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-3xl p-8">
          <Megaphone className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-300">No News Articles Found</p>
          <p className="text-xs text-slate-500 mt-1">Try clearing your search query or category filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNews.map(item => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all space-y-3 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getCategoryBadge(item.category)}`}>
                      {item.category}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      Source: <strong className="text-slate-300">{item.source}</strong>
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white pt-1">
                    {item.title}
                  </h3>
                </div>

                <div className="flex items-center space-x-1.5 text-xs text-slate-400 shrink-0">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {item.summary}
              </p>

              {item.content && (
                <div className="text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                  {item.content}
                </div>
              )}

              {/* Tags and Action */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                <div className="flex flex-wrap items-center gap-1.5">
                  {(item.tags || []).map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] text-slate-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center space-x-2">
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-xs text-court-400 hover:text-court-300 font-semibold"
                    >
                      <span>Read Original / Watch Expose</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {isAdmin && onDeleteNews && (
                    <button
                      onClick={() => onDeleteNews(item)}
                      className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-950/40"
                      title="Delete News Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
