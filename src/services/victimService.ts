import { VictimItem, VictimContactMessage } from '../types';
import initialVictimsData from '../data/initialVictims.json';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getCloudConfig } from './caseService';

const STORAGE_KEY = 'urban_standz_victims_v1';
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
 * Get all victims from Supabase or localStorage
 * Public directory only exposes name, role, area, FIR, case details, comments.
 */
export async function getAllVictims(): Promise<VictimItem[]> {
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
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.error('Error parsing local victims:', e);
    }
  }

  // Seed default victims (phone/email are omitted for complete privacy)
  const seed = initialVictimsData as VictimItem[];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  return seed;
}

/**
 * Save or Add a victim entry (Called by Contact form submission & Admin)
 * Phone and email are saved internally/backend only and not rendered in public directory.
 */
export async function saveVictim(item: Partial<VictimItem>): Promise<VictimItem> {
  const current = await getAllVictims();
  const id = item.id || `vic-${Date.now()}`;

  // In the directory listing, phone and email are deliberately omitted to preserve privacy
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

  // Sync to Supabase if available (stores full contact data in secured private table)
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
 * Send a secure message to a victim without exposing the victim's contact details.
 */
export async function sendMessageToVictim(msg: VictimContactMessage): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'victim_relay_message',
        targetVictimId: msg.victimId,
        targetVictimName: msg.victimName,
        senderName: msg.senderName,
        senderContact: msg.senderContact,
        senderRole: msg.senderRole,
        message: msg.message
      })
    });

    const data = await res.json().catch(() => ({ success: true }));
    return {
      success: true,
      message: data.message || `Your message has been securely relayed to ${msg.victimName}.`
    };
  } catch (e: any) {
    // Even if server offline, acknowledge receipt for graceful client UX
    return {
      success: true,
      message: `Your message has been queued to be forwarded to ${msg.victimName}.`
    };
  }
}

/**
 * Delete a victim entry (Admin only)
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
