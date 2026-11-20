import React, { useState, useMemo } from 'react';
import { 
  Newspaper, 
  ExternalLink, 
  Search, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  Play, 
  Video, 
  Globe, 
  Calendar, 
  Building2, 
  Share2,
  X,
  Filter
} from 'lucide-react';
import { ResourceItem } from '../types';
import { extractYouTubeId, getPlatformBadgeStyle } from '../utils/resourceUtils';
import { formatDisplayDate } from '../utils/caseUtils';

interface ResourcesViewProps {
  resources: ResourceItem[];
  isAdmin: boolean;
  onOpenAddResource: () => void;
  onEditResource: (item: ResourceItem) => void;
  onDeleteResource: (item: ResourceItem) => void;
}

export const ResourcesView: React.FC<ResourcesViewProps> = ({
  resources,
  isAdmin,
  onOpenAddResource,
  onEditResource,
  onDeleteResource
}) => {
  const [search, setSearch] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [activeVideoModalUrl, setActiveVideoModalUrl] = useState<string | null>(null);

  // Filtered resources
  const filtered = useMemo(() => {
    return resources.filter(r => {
      if (selectedPlatform !== 'all' && (r.platform || '').toLowerCase() !== selectedPlatform.toLowerCase()) {
        return false;
      }
      if (search.trim()) {
        const query = search.toLowerCase();
        const full = `${r.title} ${r.description} ${r.authorOrSource} ${r.platform} ${r.category}`.toLowerCase();
        if (!full.includes(query)) return false;
      }
      return true;
    });
  }, [resources, search, selectedPlatform]);

  const platforms = useMemo(() => {
    const list = Array.from(new Set(resources.map(r => r.platform).filter(Boolean)));
    return ['all', ...list];
  }, [resources]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-court-600/20 text-court-400 border border-court-500/30">
                <Newspaper className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                News Coverage & Media Expose
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-court-950/80 text-court-300 border border-court-700/60">
                {resources.length} Links
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Curated repository of external investigative journalism, television news reports, victim testimonies, and social media coverage regarding Urban Standz fraud in Bengaluru.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={onOpenAddResource}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40 transition-all transform active:scale-95 shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add News Link</span>
            </button>
          )}
        </div>

        {/* Search & Platform Filter Row */}
        <div className="mt-5 pt-4 border-t border-slate-700/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search news by headline, channel, or keyword..."
              className="w-full pl-9 pr-8 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-court-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Platform Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {platforms.map((p) => {
              const isActive = selectedPlatform === p;
              return (
                <button
                  key={p}
                  onClick={() => setSelectedPlatform(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                    isActive 
                      ? 'bg-court-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                  }`}
                >
                  {p === 'all' ? `All Sources (${resources.length})` : p}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid of Resources */}
      {filtered.length === 0 ? (
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-12 text-center">
          <Newspaper className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No news or media reports match your query</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or clearing the platform filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => {
            const ytId = extractYouTubeId(item.url);
            const badgeStyle = getPlatformBadgeStyle(item.platform);

            return (
              <div
                key={item.id}
                className="bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 hover:border-court-500/50 rounded-2xl overflow-hidden shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Media Thumbnail / Video Banner */}
                  <div className="relative aspect-video bg-slate-950 overflow-hidden border-b border-slate-700/60 flex items-center justify-center">
                    {item.thumbnailUrl ? (
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : ytId ? (
                      <img
                        src={`https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 text-slate-500">
                        {item.platform.toLowerCase().includes('facebook') ? (
                          <div className="w-12 h-12 rounded-full bg-blue-950/80 border border-blue-700/60 flex items-center justify-center text-blue-400">
                            <Video className="w-6 h-6" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                            <Globe className="w-6 h-6" />
                          </div>
                        )}
                        <span className="text-xs font-semibold text-slate-400 mt-2">
                          {item.platform}
                        </span>
                      </div>
                    )}

                    {/* Play Button Overlay for Videos */}
                    {(ytId || item.platform.toLowerCase().includes('facebook') || item.platform.toLowerCase().includes('video')) && (
                      <button
                        onClick={() => {
                          if (ytId) {
                            setActiveVideoModalUrl(ytId);
                          } else {
                            window.open(item.url, '_blank', 'noopener,noreferrer');
                          }
                        }}
                        title="Watch Video"
                        className="absolute inset-0 bg-black/40 hover:bg-black/25 flex items-center justify-center transition-colors group/play"
                      >
                        <div className="w-12 h-12 rounded-full bg-court-600/90 text-white flex items-center justify-center shadow-lg group-hover/play:scale-110 transition-transform">
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        </div>
                      </button>
                    )}

                    {/* Platform Tag Badge Overlay */}
                    <div className="absolute top-2.5 left-2.5">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border shadow-md backdrop-blur-md ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
                        {item.platform}
                      </span>
                    </div>

                    {/* Category Tag */}
                    {item.category && (
                      <div className="absolute top-2.5 right-2.5">
                        <span className="inline-block text-[10px] font-medium bg-slate-900/90 text-slate-200 border border-slate-700 px-2 py-0.5 rounded-md shadow-md backdrop-blur-md">
                          {item.category}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-2.5">
                    {/* Title */}
                    <h3 className="font-bold text-white text-sm leading-snug line-clamp-2 group-hover:text-court-300 transition-colors">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline"
                      >
                        {item.title}
                      </a>
                    </h3>

                    {/* Author / Source & Date */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-medium text-slate-300 truncate max-w-[180px]">
                        {item.authorOrSource || item.platform}
                      </span>
                      {item.publishedDate && (
                        <span>{item.publishedDate}</span>
                      )}
                    </div>

                    {/* Description */}
                    {item.description && (
                      <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-4 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-court-400 hover:text-court-300 transition-colors"
                  >
                    <span>Open Full Report</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {isAdmin && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onEditResource(item)}
                        title="Edit Resource"
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteResource(item)}
                        title="Delete Resource"
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/60 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Community Contribution Callout Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 text-center text-xs text-slate-400 space-y-2">
        <h4 className="font-semibold text-slate-200 text-sm">
          Have more news links, TV media clips, or investigative reports?
        </h4>
        <p className="max-w-xl mx-auto text-slate-400">
          If you have links to news reports covering Urban Standz complaints, please share them with the group admin so they can be archived here for all victims and legal counsels.
        </p>
      </div>

      {/* Video Modal Player for YouTube */}
      {activeVideoModalUrl && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
            <button
              onClick={() => setActiveVideoModalUrl(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="aspect-video w-full">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideoModalUrl}?autoplay=1`}
                title="YouTube Video Player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
