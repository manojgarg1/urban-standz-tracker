import { CourtOrder } from '../types';
import initialOrdersData from '../data/initialOrders.json';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getCloudConfig } from './caseService';

const STORAGE_KEY = 'urban_standz_orders_v1';
let supabaseClient: SupabaseClient | null = null;

// Initialize Supabase if configured
const config = getCloudConfig();
if (config.useSupabase && config.supabaseUrl && config.supabaseAnonKey) {
  try {
    supabaseClient = createClient(config.supabaseUrl, config.supabaseAnonKey);
  } catch (err) {
    console.error('Failed to init Supabase client for orders:', err);
  }
}

/**
 * Get all court orders and judgments
 */
export async function getAllOrders(): Promise<CourtOrder[]> {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('orders')
        .select('*')
        .order('order_date', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map(row => ({
          id: row.id,
          title: row.title || 'Court Order',
          caseRegistrationNumber: row.case_registration_number || '',
          court: row.court || '',
          orderDate: row.order_date || '',
          orderType: row.order_type || 'Interim Injunction',
          parties: row.parties || '',
          judge: row.judge || '',
          orderSummary: row.order_summary || '',
          fullText: row.full_text || '',
          pdfUrl: row.pdf_url || '',
          pdfFileName: row.pdf_file_name || '',
          pdfFileSize: row.pdf_file_size || '',
          linkedCaseId: row.linked_case_id || '',
          createdAt: row.created_at || new Date().toISOString()
        }));
      }
    } catch (err) {
      // Graceful fallback
    }
  }

  const local = localStorage.getItem(STORAGE_KEY);
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.error('Error parsing local orders:', e);
    }
  }

  const seed = initialOrdersData as CourtOrder[];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  return seed;
}

/**
 * Save or Update a Court Order / Judgment
 */
export async function saveOrder(item: Partial<CourtOrder>): Promise<CourtOrder> {
  const current = await getAllOrders();
  const id = item.id || `ord-${Date.now()}`;

  const fullItem: CourtOrder = {
    id,
    title: item.title || 'Court Order / Judgment',
    caseRegistrationNumber: item.caseRegistrationNumber || '',
    court: item.court || 'City Civil Court Bengaluru',
    orderDate: item.orderDate || new Date().toISOString().split('T')[0],
    orderType: item.orderType || 'Interim Injunction',
    parties: item.parties || '',
    judge: item.judge || '',
    orderSummary: item.orderSummary || '',
    fullText: item.fullText || '',
    pdfUrl: item.pdfUrl || '',
    pdfFileName: item.pdfFileName || '',
    pdfFileSize: item.pdfFileSize || '',
    linkedCaseId: item.linkedCaseId || '',
    createdAt: item.createdAt || new Date().toISOString()
  };

  const existingIdx = current.findIndex(o => o.id === id);
  let updatedList: CourtOrder[];
  if (existingIdx >= 0) {
    updatedList = [...current];
    updatedList[existingIdx] = fullItem;
  } else {
    updatedList = [fullItem, ...current];
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

  // Sync with Supabase if available
  if (supabaseClient) {
    try {
      await supabaseClient.from('orders').upsert({
        id: fullItem.id,
        title: fullItem.title,
        case_registration_number: fullItem.caseRegistrationNumber,
        court: fullItem.court,
        order_date: fullItem.orderDate,
        order_type: fullItem.orderType,
        parties: fullItem.parties || null,
        judge: fullItem.judge || null,
        order_summary: fullItem.orderSummary,
        full_text: fullItem.fullText || null,
        pdf_url: fullItem.pdfUrl || null,
        pdf_file_name: fullItem.pdfFileName || null,
        pdf_file_size: fullItem.pdfFileSize || null,
        linked_case_id: fullItem.linkedCaseId || null,
        created_at: fullItem.createdAt
      });
    } catch (err) {
      // Ignore
    }
  }

  return fullItem;
}

/**
 * Delete a Court Order
 */
export async function deleteOrder(id: string): Promise<void> {
  const current = await getAllOrders();
  const updated = current.filter(o => o.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  if (supabaseClient) {
    try {
      await supabaseClient.from('orders').delete().eq('id', id);
    } catch (err) {
      // Ignore
    }
  }
}
