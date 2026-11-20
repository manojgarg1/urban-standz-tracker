import React, { useState, useEffect } from 'react';
import { 
  X, 
  Globe, 
  Video, 
  ExternalLink, 
  Sparkles, 
  Save, 
  Loader2,
  Calendar,
  Tag,
  FileText
} from 'lucide-react';
import { ResourceItem } from '../types';
import { detectPlatformFromUrl, fetchYouTubeOEmbed, getYouTubeThumbnail } from '../utils/resourceUtils';

interface ResourceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<ResourceItem>) => Promise<void>;
  resourceToEdit: ResourceItem | null;
}

export const ResourceFormModal: React.FC<ResourceFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  resourceToEdit
}) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState<string>('News');
  const [category, setCategory] = useState<ResourceItem['category']>('Media Report');
  const [authorOrSource, setAuthorOrSource] = useState('');
  const [publishedDate, setPublishedDate] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (resourceToEdit) {
      setUrl(resourceToEdit.url || '');
      setTitle(resourceToEdit.title || '');
      setPlatform(resourceToEdit.platform || 'News');
      setCategory(resourceToEdit.category || 'Media Report');
      setAuthorOrSource(resourceToEdit.authorOrSource || '');
      setPublishedDate(resourceToEdit.publishedDate || '');
      setDescription(resourceToEdit.description || '');
      setThumbnailUrl(resourceToEdit.thumbnailUrl || '');
    } else {
      setUrl('');
      setTitle('');
      setPlatform('News');
      setCategory('Media Report');
      setAuthorOrSource('');
      setPublishedDate(new Date().toISOString().split('T')[0]);
      setDescription('');
      setThumbnailUrl('');
    }
    setError('');
  }, [resourceToEdit, isOpen]);

  if (!isOpen) return null;

  // Auto-detect and auto-fetch metadata from URL
  const handleUrlBlur = async () => {
    if (!url.trim()) return;

    const detected = detectPlatformFromUrl(url);
    if (!resourceToEdit || platform === 'News') {
      setPlatform(detected);
    }

    // If YouTube and title is empty, auto-fetch oEmbed
    if (detected === 'YouTube') {
      const ytThumb = getYouTubeThumbnail(url);
      if (ytThumb && !thumbnailUrl) {
        setThumbnailUrl(ytThumb);
      }

      if (!title.trim() || !authorOrSource.trim()) {
        setIsFetchingMeta(true);
        try {
          const meta = await fetchYouTubeOEmbed(url);
          if (meta) {
            if (meta.title && !title.trim()) setTitle(meta.title);
            if (meta.author && !authorOrSource.trim()) setAuthorOrSource(meta.author);
            if (meta.thumbnail && !thumbnailUrl) setThumbnailUrl(meta.thumbnail);
          }
        } finally {
          setIsFetchingMeta(false);
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please provide a valid URL for the news/media link.');
      return;
    }
    if (!title.trim()) {
      setError('Please provide a title for the resource.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      let thumb = thumbnailUrl;
      if (!thumb && platform === 'YouTube') {
        thumb = getYouTubeThumbnail(url) || '';
      }

      await onSave({
        ...(resourceToEdit ? { id: resourceToEdit.id } : {}),
        url: url.trim(),
        title: title.trim(),
        platform,
        category,
        authorOrSource: authorOrSource.trim(),
        publishedDate: publishedDate || undefined,
        description: description.trim(),
        thumbnailUrl: thumb || undefined
      });

      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save resource. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-court-600/20 text-court-400 border border-court-500/30">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {resourceToEdit ? 'Edit News / Media Resource' : 'Add News / Media Resource'}
              </h2>
              <p className="text-xs text-slate-400">
                Feature external news broadcasts, YouTube investigative reports, Facebook reels, or articles
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* URL Input */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
              <span>Resource URL (YouTube, Facebook, News Link, etc.) *</span>
              {isFetchingMeta && (
                <span className="text-court-400 flex items-center gap-1 font-normal lowercase">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  fetching info...
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onBlur={handleUrlBlur}
                placeholder="https://www.youtube.com/watch?v=... or https://www.facebook.com/reel/..."
                className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-court-500 focus:ring-1 focus:ring-court-500"
              />
              {url && (
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-court-300"
                  title="Test Link"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Headline / Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. National TV: Special Investigation on Urban Standz Rent Scam"
              className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-court-500 focus:ring-1 focus:ring-court-500"
            />
          </div>

          {/* Platform & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-court-500"
              >
                <option value="YouTube">YouTube</option>
                <option value="Facebook">Facebook Video / Reel</option>
                <option value="TV Media">TV Media Broadcast</option>
                <option value="News">News Website / Article</option>
                <option value="Twitter / X">Twitter / X</option>
                <option value="Document">Official Document / Notice</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Content Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-court-500"
              >
                <option value="Media Report">Media Report / TV Expose</option>
                <option value="Victim Testimonial">Victim Testimonial</option>
                <option value="Legal Analysis">Legal Analysis</option>
                <option value="Police / FIR">Police Action / FIR Coverage</option>
                <option value="Public Advisory">Public Advisory / Caution</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Source/Author & Published Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Source / Channel Name
              </label>
              <input
                type="text"
                value={authorOrSource}
                onChange={(e) => setAuthorOrSource(e.target.value)}
                placeholder="e.g. National TV, TV9 Kannada, Public TV"
                className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-court-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Published Date
              </label>
              <input
                type="date"
                value={publishedDate}
                onChange={(e) => setPublishedDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-court-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Summary / Key Details
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of the report or investigation..."
              className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-court-500"
            />
          </div>

          {/* Thumbnail preview if available */}
          {thumbnailUrl && (
            <div className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-xl border border-slate-700/60">
              <img
                src={thumbnailUrl}
                alt="Thumbnail preview"
                className="w-16 h-12 object-cover rounded-lg border border-slate-600"
              />
              <div className="text-[11px] text-slate-400 flex-1 truncate">
                <span className="font-semibold text-slate-300 block">Preview Thumbnail Attached</span>
                <span className="truncate block font-mono text-[10px]">{thumbnailUrl}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-700/60">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-court-600 hover:bg-court-500 text-white shadow-md shadow-court-900/30 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{resourceToEdit ? 'Update Resource' : 'Add Resource'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
