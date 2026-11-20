import { ResourceItem } from '../types';
import initialResourcesData from '../data/initialResources.json';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getCloudConfig } from './caseService';

const STORAGE_KEY = 'urban_standz_resources_v1';
let supabaseClient: SupabaseClient | null = null;

// Initialize Supabase if configured
const config = getCloudConfig();
if (config.useSupabase && config.supabaseUrl && config.supabaseAnonKey) {
  try {
    supabaseClient = createClient(config.supabaseUrl, config.supabaseAnonKey);
  } catch (err) {
    console.error('Failed to init Supabase client for resources:', err);
  }
}

/**
 * Get all resources
 */
export async function getAllResources(): Promise<ResourceItem[]> {
  // If Supabase is active, try fetching
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map(row => ({
          id: row.id,
          title: row.title,
          url: row.url,
          platform: row.platform || 'News',
          category: row.category || 'Media Report',
          description: row.description || '',
          publishedDate: row.published_date || '',
          authorOrSource: row.author_or_source || '',
          thumbnailUrl: row.thumbnail_url || '',
          createdAt: row.created_at || new Date().toISOString()
        }));
      }
    } catch (err) {
      // Supabase table might not exist yet, fallback to localStorage
    }
  }

  // Local storage fallback
  const local = localStorage.getItem(STORAGE_KEY);
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.error('Error parsing local resources:', e);
    }
  }

  // Seed default data
  const seed = initialResourcesData as ResourceItem[];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  return seed;
}

/**
 * Save or Update a Resource
 */
export async function saveResource(item: Partial<ResourceItem>): Promise<ResourceItem> {
  const current = await getAllResources();
  const id = item.id || `res-${Date.now()}`;

  const fullItem: ResourceItem = {
    id,
    title: item.title || 'Untitled Resource',
    url: item.url || '',
    platform: item.platform || 'News',
    category: item.category || 'Media Report',
    description: item.description || '',
    publishedDate: item.publishedDate || '',
    authorOrSource: item.authorOrSource || '',
    thumbnailUrl: item.thumbnailUrl || '',
    createdAt: item.createdAt || new Date().toISOString()
  };

  const existingIdx = current.findIndex(r => r.id === id);
  let updatedList: ResourceItem[];
  if (existingIdx >= 0) {
    updatedList = [...current];
    updatedList[existingIdx] = fullItem;
  } else {
    updatedList = [fullItem, ...current];
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

  // Sync to Supabase if available
  if (supabaseClient) {
    try {
      await supabaseClient.from('resources').upsert({
        id: fullItem.id,
        title: fullItem.title,
        url: fullItem.url,
        platform: fullItem.platform,
        category: fullItem.category,
        description: fullItem.description,
        published_date: fullItem.publishedDate || null,
        author_or_source: fullItem.authorOrSource || null,
        thumbnail_url: fullItem.thumbnailUrl || null,
        created_at: fullItem.createdAt
      });
    } catch (err) {
      // Fail silently if table not created
    }
  }

  return fullItem;
}

/**
 * Delete a resource
 */
export async function deleteResource(id: string): Promise<void> {
  const current = await getAllResources();
  const updated = current.filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  if (supabaseClient) {
    try {
      await supabaseClient.from('resources').delete().eq('id', id);
    } catch (err) {
      // Ignore
    }
  }
}

/**
 * Reset to default initial seed
 */
export async function resetResourcesToDefault(): Promise<ResourceItem[]> {
  const seed = initialResourcesData as ResourceItem[];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  return seed;
}
