export interface CaseItem {
  id: string;
  serialNumber: number;
  court: string;
  cch: string;
  judge: string;
  cnr: string;
  registrationNumber: string;
  plaintiff1: string;
  plaintiff2?: string;
  plaintiff3?: string;
  defendant1: string;
  defendant2?: string;
  defendant3?: string;
  defendant4?: string;
  advocate: string;
  status: 'Pending' | 'Disposed' | 'Stayed' | string;
  stage: string;
  filingDate: string;
  nextHearing: string;
  lastBusiness: string;
  linkedCase?: string;
  category?: 'Tenant vs Landlord & Urban Standz' | 'Landlord vs Tenant & Urban Standz' | 'Criminal / Cheating / 138 NI Act' | 'Other' | string;
  updatedAt?: string;
}

export interface HearingLogEntry {
  date: string;
  text: string;
  raw: string;
}

export type ViewMode = 'table' | 'cards' | 'calendar' | 'analytics';

export interface FilterState {
  search: string;
  court: string;
  status: string;
  stage: string;
  advocate: string;
  category: string;
  hearingRange: 'all' | 'today' | 'this-week' | 'next-14-days' | 'next-30-days' | 'past' | 'no-date';
  sortBy: 'serialNumber' | 'nextHearing' | 'filingDate' | 'registrationNumber' | 'plaintiff1';
  sortOrder: 'asc' | 'desc';
}

export interface CloudConfig {
  useSupabase: boolean;
  supabaseUrl: string;
  supabaseAnonKey: string;
}
