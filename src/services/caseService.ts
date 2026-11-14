import { CaseItem, CloudConfig } from '../types';
import initialCasesData from '../data/initialCases.json';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY = 'urban_standz_cases_v2';
const CONFIG_KEY = 'urban_standz_cloud_config';
const ADMIN_AUTH_KEY = 'urban_standz_admin_auth';

let supabaseClient: SupabaseClient | null = null;

// Initialize Supabase if env vars exist or if saved in localStorage
export function getCloudConfig(): CloudConfig {
  const saved = localStorage.getItem(CONFIG_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }

  // Fallback to Vite env variables if set
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  return {
    useSupabase: Boolean(envUrl && envKey),
    supabaseUrl: envUrl,
    supabaseAnonKey: envKey
  };
}

export function saveCloudConfig(config: CloudConfig) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  if (config.useSupabase && config.supabaseUrl && config.supabaseAnonKey) {
    supabaseClient = createClient(config.supabaseUrl, config.supabaseAnonKey);
  } else {
    supabaseClient = null;
  }
}

// Initialize client
const initialConfig = getCloudConfig();
if (initialConfig.useSupabase && initialConfig.supabaseUrl && initialConfig.supabaseAnonKey) {
  try {
    supabaseClient = createClient(initialConfig.supabaseUrl, initialConfig.supabaseAnonKey);
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
  }
}

/**
 * Get all cases (from Supabase if configured, otherwise localStorage, falling back to initial seed)
 */
export async function getAllCases(): Promise<CaseItem[]> {
  // If Supabase is active
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('cases')
        .select('*')
        .order('serial_number', { ascending: true });

      if (!error && data && data.length > 0) {
        // Map database snake_case columns to camelCase CaseItem
        return data.map(dbRowToCaseItem);
      }
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to local storage:', err);
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
      console.error('Error parsing local storage cases:', e);
    }
  }

  // Seed default data
  const seedCases = initialCasesData as CaseItem[];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seedCases));
  return seedCases;
}

/**
 * Save / Update a case
 */
export async function saveCase(caseItem: CaseItem): Promise<CaseItem> {
  const cases = await getAllCases();
  const existingIndex = cases.findIndex(c => c.id === caseItem.id);
  
  const updatedItem: CaseItem = {
    ...caseItem,
    updatedAt: new Date().toISOString()
  };

  let updatedList: CaseItem[];
  if (existingIndex >= 0) {
    updatedList = [...cases];
    updatedList[existingIndex] = updatedItem;
  } else {
    // New case
    if (!updatedItem.serialNumber) {
      const maxSerial = cases.reduce((max, c) => Math.max(max, c.serialNumber || 0), 0);
      updatedItem.serialNumber = maxSerial + 1;
    }
    if (!updatedItem.id) {
      updatedItem.id = `case-${Date.now()}`;
    }
    updatedList = [updatedItem, ...cases];
  }

  // Save to Supabase if active
  if (supabaseClient) {
    try {
      const dbRow = caseItemToDbRow(updatedItem);
      const { error } = await supabaseClient
        .from('cases')
        .upsert(dbRow, { onConflict: 'id' });

      if (error) {
        console.error('Supabase upsert error:', error);
      }
    } catch (err) {
      console.error('Supabase save error:', err);
    }
  }

  // Always update local storage for offline capability
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  return updatedItem;
}

/**
 * Delete a case
 */
export async function deleteCase(id: string): Promise<boolean> {
  const cases = await getAllCases();
  const updatedList = cases.filter(c => c.id !== id);

  if (supabaseClient) {
    try {
      await supabaseClient.from('cases').delete().eq('id', id);
    } catch (err) {
      console.error('Supabase delete error:', err);
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  return true;
}

/**
 * Quick update of hearing details
 */
export async function updateHearingDetails(
  caseId: string,
  newHearingDate: string,
  newStage: string,
  hearingOrderText?: string
): Promise<CaseItem | null> {
  const cases = await getAllCases();
  const target = cases.find(c => c.id === caseId);
  if (!target) return null;

  let updatedLastBusiness = target.lastBusiness || '';
  if (hearingOrderText && hearingOrderText.trim()) {
    const todayFormatted = new Date().toLocaleDateString('en-GB'); // DD/MM/YYYY
    const newEntry = `${todayFormatted}: ${hearingOrderText.trim()}`;
    updatedLastBusiness = updatedLastBusiness
      ? `${updatedLastBusiness}\n${newEntry}`
      : newEntry;
  }

  const updated: CaseItem = {
    ...target,
    nextHearing: newHearingDate || target.nextHearing,
    stage: newStage || target.stage,
    lastBusiness: updatedLastBusiness,
    updatedAt: new Date().toISOString()
  };

  return await saveCase(updated);
}

/**
 * Reset dataset back to initial 69 cases from sheet
 */
export async function resetToDefaultSeed(): Promise<CaseItem[]> {
  const seedCases = initialCasesData as CaseItem[];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seedCases));

  if (supabaseClient) {
    try {
      // Upsert all seed records into Supabase
      const rows = seedCases.map(caseItemToDbRow);
      await supabaseClient.from('cases').upsert(rows);
    } catch (err) {
      console.error('Error syncing seed to Supabase:', err);
    }
  }

  return seedCases;
}

/**
 * Replace all cases (e.g. on bulk Excel / CSV import)
 */
export async function bulkReplaceCases(newCases: CaseItem[]): Promise<CaseItem[]> {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newCases));
  if (supabaseClient) {
    try {
      const rows = newCases.map(caseItemToDbRow);
      await supabaseClient.from('cases').upsert(rows);
    } catch (e) {
      console.error(e);
    }
  }
  return newCases;
}

// Convert DB snake_case row to CaseItem
function dbRowToCaseItem(row: any): CaseItem {
  return {
    id: row.id,
    serialNumber: row.serial_number,
    court: row.court,
    cch: row.cch || '',
    judge: row.judge || '',
    cnr: row.cnr || '',
    registrationNumber: row.registration_number,
    plaintiff1: row.plaintiff_1,
    plaintiff2: row.plaintiff_2 || '',
    plaintiff3: row.plaintiff_3 || '',
    defendant1: row.defendant_1,
    defendant2: row.defendant_2 || '',
    defendant3: row.defendant_3 || '',
    defendant4: row.defendant_4 || '',
    advocate: row.advocate || '',
    status: row.status || 'Pending',
    stage: row.stage || '',
    filingDate: row.filing_date || '',
    nextHearing: row.next_hearing || '',
    lastBusiness: row.last_business || '',
    linkedCase: row.linked_case || '',
    category: row.category || 'Tenant vs Landlord & Urban Standz',
    updatedAt: row.updated_at
  };
}

// Convert CaseItem to DB snake_case row
function caseItemToDbRow(item: CaseItem): any {
  return {
    id: item.id,
    serial_number: item.serialNumber,
    court: item.court,
    cch: item.cch,
    judge: item.judge,
    cnr: item.cnr,
    registration_number: item.registrationNumber,
    plaintiff_1: item.plaintiff1,
    plaintiff_2: item.plaintiff2 || null,
    plaintiff_3: item.plaintiff3 || null,
    defendant_1: item.defendant1,
    defendant_2: item.defendant2 || null,
    defendant_3: item.defendant3 || null,
    defendant_4: item.defendant4 || null,
    advocate: item.advocate,
    status: item.status,
    stage: item.stage,
    filing_date: item.filingDate || null,
    next_hearing: item.nextHearing || null,
    last_business: item.lastBusiness,
    linked_case: item.linkedCase || null,
    category: item.category || 'Tenant vs Landlord & Urban Standz',
    updated_at: new Date().toISOString()
  };
}

// Authentication Helpers
export function isAdminAuthenticated(): boolean {
  return localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
}

export function setAdminAuthenticated(auth: boolean) {
  if (auth) {
    localStorage.setItem(ADMIN_AUTH_KEY, 'true');
  } else {
    localStorage.removeItem(ADMIN_AUTH_KEY);
  }
}
