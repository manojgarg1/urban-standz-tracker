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
  status: 'Pending' | 'Missed Updates' | 'Disposed' | 'Stayed' | string;
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

export type ViewMode = 'table' | 'cards' | 'calendar' | 'analytics' | 'resources';

export interface ResourceItem {
  id: string;
  title: string;
  url: string;
  platform: 'YouTube' | 'Facebook' | 'News' | 'TV Media' | 'Twitter / X' | 'Document' | 'Other' | string;
  category: 'Media Report' | 'Victim Testimonial' | 'Legal Analysis' | 'Police / FIR' | 'Public Advisory' | 'Other';
  description?: string;
  publishedDate?: string;
  authorOrSource?: string;
  thumbnailUrl?: string;
  createdAt: string;
}

export interface FilterState {
  search: string;
  court: string;
  status: string;
  stage: string;
  advocate: string;
  category: string;
  hearingRange: 'all' | 'today' | 'tomorrow' | 'this-week' | 'next-14-days' | 'next-30-days' | 'past' | 'no-date';
  sortBy: 'serialNumber' | 'nextHearing' | 'filingDate' | 'registrationNumber' | 'plaintiff1';
  sortOrder: 'asc' | 'desc';
}

export type MainSection = 
  | 'about' 
  | 'cases' 
  | 'orders' 
  | 'media' 
  | 'victims' 
  | 'news' 
  | 'contact';

export interface VictimItem {
  id: string;
  name: string;
  role: 'Tenant' | 'House Owner' | 'Both';
  phone?: string;
  email?: string;
  firNumber?: string;
  caseDetails?: string;
  area?: string;
  comments?: string;
  createdAt: string;
  isVerified?: boolean;
}

export interface VictimContactMessage {
  victimId: string;
  victimName: string;
  senderName: string;
  senderContact: string;
  senderRole: string;
  message: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  date: string;
  source: string;
  summary: string;
  content?: string;
  url?: string;
  category: 'Police & FIR' | 'Court Proceeding' | 'Victim Action' | 'Advisory' | 'Media Expose';
  tags?: string[];
}

export interface CourtOrder {
  id: string;
  title: string;
  caseRegistrationNumber: string;
  court: string;
  orderDate: string;
  orderType: 'Interim Injunction' | 'Status Quo' | 'Suit Summons' | 'Paper Publication' | 'Warrant / SS' | 'Final Judgment' | 'Daily Order Sheet' | string;
  parties?: string;
  judge?: string;
  orderSummary: string;
  fullText?: string;
  pdfUrl?: string; // Data URL or external URL
  pdfFileName?: string;
  pdfFileSize?: string;
  linkedCaseId?: string;
  createdAt: string;
}

export interface CloudConfig {
  useSupabase: boolean;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

