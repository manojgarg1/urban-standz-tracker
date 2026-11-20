import { NewsArticle } from '../types';
import initialNewsData from '../data/initialNews.json';

const STORAGE_KEY = 'urban_standz_news_v1';

/**
 * Get all news articles
 */
export async function getAllNews(): Promise<NewsArticle[]> {
  const local = localStorage.getItem(STORAGE_KEY);
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.error('Error parsing local news:', e);
    }
  }

  const seed = initialNewsData as NewsArticle[];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  return seed;
}

/**
 * Save or update news article
 */
export async function saveNews(item: Partial<NewsArticle>): Promise<NewsArticle> {
  const current = await getAllNews();
  const id = item.id || `news-${Date.now()}`;

  const fullItem: NewsArticle = {
    id,
    title: item.title || 'Untitled Update',
    date: item.date || new Date().toISOString().split('T')[0],
    source: item.source || 'Community Bulletin',
    summary: item.summary || '',
    content: item.content || '',
    url: item.url || '',
    category: item.category || 'Victim Action',
    tags: item.tags || []
  };

  const existingIdx = current.findIndex(n => n.id === id);
  let updatedList: NewsArticle[];
  if (existingIdx >= 0) {
    updatedList = [...current];
    updatedList[existingIdx] = fullItem;
  } else {
    updatedList = [fullItem, ...current];
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  return fullItem;
}

/**
 * Delete news article
 */
export async function deleteNews(id: string): Promise<void> {
  const current = await getAllNews();
  const updated = current.filter(n => n.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}
