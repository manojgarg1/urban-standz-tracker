/**
 * Extract YouTube video ID from various YouTube URL formats
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const cleaned = url.trim();
  
  // Format 1: youtube.com/watch?v=ID or &v=ID
  const watchMatch = cleaned.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i);
  if (watchMatch && watchMatch[1]) {
    return watchMatch[1];
  }

  // Format 2: youtube.com/shorts/ID
  const shortsMatch = cleaned.match(/youtube\.com\/shorts\/([^"&?\/ ]{11})/i);
  if (shortsMatch && shortsMatch[1]) {
    return shortsMatch[1];
  }

  return null;
}

/**
 * Get YouTube thumbnail image URL
 */
export function getYouTubeThumbnail(url: string): string | null {
  const id = extractYouTubeId(url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

/**
 * Auto-detect platform from URL
 */
export function detectPlatformFromUrl(url: string): string {
  if (!url) return 'News';
  const lower = url.toLowerCase();

  if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
    return 'YouTube';
  }
  if (lower.includes('facebook.com') || lower.includes('fb.watch') || lower.includes('fb.com')) {
    return 'Facebook';
  }
  if (lower.includes('twitter.com') || lower.includes('x.com')) {
    return 'Twitter / X';
  }
  if (lower.includes('instagram.com')) {
    return 'Instagram';
  }
  if (lower.includes('tv9') || lower.includes('publictv') || lower.includes('suvarna') || lower.includes('news18')) {
    return 'TV Media';
  }
  if (lower.endsWith('.pdf')) {
    return 'Document';
  }

  return 'News';
}

/**
 * Get badge styling for platform
 */
export function getPlatformBadgeStyle(platform: string): {
  bg: string;
  text: string;
  border: string;
  iconColor: string;
} {
  const p = (platform || '').toLowerCase();

  if (p.includes('youtube')) {
    return {
      bg: 'bg-red-950/70',
      text: 'text-red-300',
      border: 'border-red-700/60',
      iconColor: 'text-red-400'
    };
  }
  if (p.includes('facebook')) {
    return {
      bg: 'bg-blue-950/70',
      text: 'text-blue-300',
      border: 'border-blue-700/60',
      iconColor: 'text-blue-400'
    };
  }
  if (p.includes('twitter') || p.includes('x')) {
    return {
      bg: 'bg-slate-800',
      text: 'text-slate-200',
      border: 'border-slate-600',
      iconColor: 'text-slate-300'
    };
  }
  if (p.includes('tv')) {
    return {
      bg: 'bg-purple-950/70',
      text: 'text-purple-300',
      border: 'border-purple-700/60',
      iconColor: 'text-purple-400'
    };
  }
  if (p.includes('document')) {
    return {
      bg: 'bg-amber-950/70',
      text: 'text-amber-300',
      border: 'border-amber-700/60',
      iconColor: 'text-amber-400'
    };
  }

  return {
    bg: 'bg-emerald-950/70',
    text: 'text-emerald-300',
    border: 'border-emerald-700/60',
    iconColor: 'text-emerald-400'
  };
}

/**
 * Fetch video metadata if available via oEmbed
 */
export async function fetchYouTubeOEmbed(url: string): Promise<{ title?: string; author?: string; thumbnail?: string } | null> {
  const id = extractYouTubeId(url);
  if (!id) return null;

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`;
    const res = await fetch(oembedUrl);
    if (res.ok) {
      const data = await res.json();
      return {
        title: data.title,
        author: data.author_name,
        thumbnail: data.thumbnail_url || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
      };
    }
  } catch (e) {
    console.warn('Could not fetch YouTube oEmbed info:', e);
  }

  return {
    thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
  };
}
