import { VictimItem } from '../types';
import initialVictimsData from '../data/initialVictims.json';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getCloudConfig } from './caseService';

const STORAGE_KEY = 'urban_standz_victims_v3';
let supabaseClient: SupabaseClient | null = null;

// Initialize Supabase if configured
const config = getCloudConfig();
if (config.useSupabase && config.supabaseUrl && config.supabaseAnonKey) {
  try {
    supabaseClient = createClient(config.supabaseUrl, config.supabaseAnonKey);
  } catch (err) {
    console.error('Failed to init Supabase client for victims:', err);
  }
}

/**
 * Get all victims from Supabase or localStorage.
 * Only genuine submitted cases are stored. Zero mock contacts.
 */
export async function getAllVictims(): Promise<VictimItem[]> {
  // Purge any legacy mock contacts in localStorage from previous sessions
  if (typeof window !== 'undefined') {
    localStorage.removeItem('urban_standz_victims_v1');
    localStorage.removeItem('urban_standz_victims_v2');
  }

  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('victims')
        .select('id, name, role, fir_number, case_details, area, comments, created_at, is_verified')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map(row => ({
          id: row.id,
          name: row.name,
          role: row.role || 'Tenant',
          firNumber: row.fir_number || '',
          caseDetails: row.case_details || '',
          area: row.area || '',
          comments: row.comments || '',
          createdAt: row.created_at || new Date().toISOString(),
          isVerified: row.is_verified ?? true
        }));
      }
    } catch (err) {
      // Gracefully fallback
    }
  }

  // Local storage fallback
  const local = localStorage.getItem(STORAGE_KEY);
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed)) {
        // Filter out any lingering mock IDs
        const cleaned = parsed.filter(v => !['vic-1', 'vic-2', 'vic-3', 'vic-4', 'vic-5', 'vic-6', 'vic-7', 'vic-8'].includes(v.id));
        return cleaned;
      }
    } catch (e) {
      console.error('Error parsing local victims:', e);
    }
  }

  // Default empty list
  const seed = (initialVictimsData || []) as VictimItem[];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  return seed;
}

/**
 * Save or Add a victim entry (Called ONLY when "Add me in Victim's Directory" is checked)
 * Phone and email are strictly omitted from directory listing to preserve privacy.
 */
export async function saveVictim(item: Partial<VictimItem>): Promise<VictimItem> {
  const current = await getAllVictims();
  const id = item.id || `vic-${Date.now()}`;

  const fullItem: VictimItem = {
    id,
    name: item.name || 'Anonymous Victim',
    role: item.role || 'Tenant',
    firNumber: item.firNumber || '',
    caseDetails: item.caseDetails || '',
    area: item.area || '',
    comments: item.comments || '',
    createdAt: item.createdAt || new Date().toISOString(),
    isVerified: item.isVerified ?? true
  };

  const existingIdx = current.findIndex(v => v.id === id);
  let updatedList: VictimItem[];
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
      await supabaseClient.from('victims').upsert({
        id: fullItem.id,
        name: fullItem.name,
        phone: item.phone || null,
        email: item.email || null,
        role: fullItem.role,
        fir_number: fullItem.firNumber || null,
        case_details: fullItem.caseDetails || null,
        area: fullItem.area || null,
        comments: fullItem.comments || null,
        created_at: fullItem.createdAt,
        is_verified: fullItem.isVerified
      });
    } catch (err) {
      // Graceful fallback
    }
  }

  return fullItem;
}

/**
 * Delete a single victim entry (Admin only)
 */
export async function deleteVictim(id: string): Promise<void> {
  const current = await getAllVictims();
  const updated = current.filter(v => v.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  if (supabaseClient) {
    try {
      await supabaseClient.from('victims').delete().eq('id', id);
    } catch (err) {
      // Fail silently
    }
  }
}

/**
 * Clear all victims from directory completely
 */
export async function clearAllVictims(): Promise<void> {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  if (typeof window !== 'undefined') {
    localStorage.removeItem('urban_standz_victims_v1');
    localStorage.removeItem('urban_standz_victims_v2');
  }

  if (supabaseClient) {
    try {
      await supabaseClient.from('victims').delete().neq('id', '___none___');
    } catch (err) {
      // Fail silently
    }
  }
}
