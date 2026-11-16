import * as XLSX from 'xlsx';
import { CaseItem, HearingLogEntry } from '../types';

/**
 * Parse multi-line court order sheet (Last Business) into structured entries
 */
export function parseLastBusiness(businessText: string): HearingLogEntry[] {
  if (!businessText || !businessText.trim()) return [];

  const lines = businessText.split(/\r?\n/);
  const entries: HearingLogEntry[] = [];
  let currentDate = '';
  let currentTextLines: string[] = [];

  const dateRegex = /^(\d{1,2}[./-]\d{1,2}(?:[./-]\d{2,4})?|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})\s*[:–-]\s*(.*)$/i;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const match = trimmed.match(dateRegex);
    if (match) {
      if (currentDate || currentTextLines.length > 0) {
        entries.push({
          date: currentDate || 'Entry',
          text: currentTextLines.join(' ').trim(),
          raw: `${currentDate ? currentDate + ': ' : ''}${currentTextLines.join(' ')}`
        });
      }
      currentDate = match[1].trim();
      currentTextLines = [match[2].trim()];
    } else {
      if (currentDate) {
        currentTextLines.push(trimmed);
      } else {
        // If first line doesn't match date pattern
        currentTextLines.push(trimmed);
      }
    }
  }

  if (currentDate || currentTextLines.length > 0) {
    entries.push({
      date: currentDate || 'Entry',
      text: currentTextLines.join(' ').trim(),
      raw: `${currentDate ? currentDate + ': ' : ''}${currentTextLines.join(' ')}`
    });
  }

  return entries;
}

/**
 * Parse a date string found in hearing logs (e.g. DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY, YYYY-MM-DD)
 */
export function parseEntryDate(dateStr: string, referenceYear: number = new Date().getFullYear()): Date | null {
  if (!dateStr || !dateStr.trim()) return null;
  const cleaned = dateStr.trim();
  
  // Try DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const dmyMatch = cleaned.match(/^(\d{1,2})[./-](\d{1,2})(?:[./-](\d{2,4}))?$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    let year = dmyMatch[3] ? parseInt(dmyMatch[3], 10) : referenceYear;
    if (year < 100) year += 2000;
    const d = new Date(year, month, day);
    return isNaN(d.getTime()) ? null : d;
  }
  
  // Try YYYY-MM-DD
  const ymdMatch = cleaned.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})$/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    const d = new Date(year, month, day);
    return isNaN(d.getTime()) ? null : d;
  }
  
  const parsed = new Date(cleaned);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Check if a case qualifies as "Missed Updates":
 * The scheduled hearing date has passed, but there are no updates recorded in Hearing history for that date.
 */
export function isMissedUpdate(c: CaseItem): boolean {
  if ((c.status || '').toLowerCase() === 'disposed') return false;
  if ((c.status || '').toLowerCase() === 'missed updates') return true;
  if (!c.nextHearing || !c.nextHearing.trim()) return false;
  
  const parts = c.nextHearing.trim().split('-');
  if (parts.length !== 3) return false;
  const targetDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  if (isNaN(targetDate.getTime())) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);
  
  // Only applies if the scheduled hearing date is in the past
  if (targetDate.getTime() >= today.getTime()) return false;
  
  // Check if any entry in lastBusiness matches or is after targetDate
  const entries = parseLastBusiness(c.lastBusiness || '');
  if (entries.length === 0) return true;
  
  const hasUpdateOnOrAfterHearing = entries.some(entry => {
    const entryDate = parseEntryDate(entry.date, targetDate.getFullYear());
    if (!entryDate) return false;
    entryDate.setHours(0, 0, 0, 0);
    return entryDate.getTime() >= targetDate.getTime();
  });
  
  return !hasUpdateOnOrAfterHearing;
}

/**
 * Format date nicely e.g. "2026-11-26" to "26 Nov 2026"
 */
export function formatDisplayDate(dateStr?: string): string {
  if (!dateStr || !dateStr.trim()) return '—';
  
  // Handle YYYY-MM-DD
  const parts = dateStr.trim().split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }
  }
  return dateStr;
}

/**
 * Calculate days remaining until next hearing
 */
export function getHearingUrgency(nextHearingStr?: string): {
  days: number | null;
  label: string;
  badgeClass: string;
} {
  if (!nextHearingStr || !nextHearingStr.trim()) {
    return { days: null, label: 'Not Scheduled', badgeClass: 'bg-slate-800 text-slate-400 border-slate-700' };
  }

  const parts = nextHearingStr.trim().split('-');
  if (parts.length !== 3) {
    return { days: null, label: nextHearingStr, badgeClass: 'bg-slate-800 text-slate-300 border-slate-700' };
  }

  const targetDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  if (isNaN(targetDate.getTime())) {
    return { days: null, label: nextHearingStr, badgeClass: 'bg-slate-800 text-slate-300 border-slate-700' };
  }

  // Use midnight today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      days: diffDays,
      label: `${Math.abs(diffDays)}d ago`,
      badgeClass: 'bg-rose-950/80 text-rose-300 border-rose-800/80'
    };
  } else if (diffDays === 0) {
    return {
      days: 0,
      label: 'TODAY',
      badgeClass: 'bg-red-600 text-white font-bold animate-pulse shadow-sm shadow-red-500/50'
    };
  } else if (diffDays === 1) {
    return {
      days: 1,
      label: 'Tomorrow',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-semibold'
    };
  } else if (diffDays <= 7) {
    return {
      days: diffDays,
      label: `In ${diffDays} days`,
      badgeClass: 'bg-amber-950/70 text-amber-300 border-amber-800/60'
    };
  } else if (diffDays <= 14) {
    return {
      days: diffDays,
      label: `In ${diffDays} days`,
      badgeClass: 'bg-sky-950/70 text-sky-300 border-sky-800/60'
    };
  } else {
    return {
      days: diffDays,
      label: formatDisplayDate(nextHearingStr),
      badgeClass: 'bg-slate-800/90 text-slate-300 border-slate-700'
    };
  }
}

/**
 * Export cases to Excel (.xlsx) file
 */
export function exportToExcel(cases: CaseItem[], filename: string = 'Urban_Standz_Court_Cases.xlsx') {
  const exportData = cases.map(c => ({
    'Master Serial': c.serialNumber,
    'Court': c.court,
    'CCH (Hall)': c.cch,
    'Judge': c.judge,
    'CNR': c.cnr,
    'Registration No.': c.registrationNumber,
    'Plaintiff 1': c.plaintiff1,
    'Plaintiff 2': c.plaintiff2 || '',
    'Plaintiff 3': c.plaintiff3 || '',
    'Defendant 1': c.defendant1,
    'Defendant 2': c.defendant2 || '',
    'Defendant 3': c.defendant3 || '',
    'Defendant 4': c.defendant4 || '',
    'Advocate': c.advocate,
    'Status': c.status,
    'Stage': c.stage,
    'Filing Date': c.filingDate,
    'Next Hearing': c.nextHearing,
    'Last Business / Court Proceedings': c.lastBusiness,
    'Linked Case': c.linkedCase || '',
    'Dispute Category': c.category || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Court Tracker');
  XLSX.writeFile(workbook, filename);
}

/**
 * Export cases to CSV string or download file
 */
export function exportToCSV(cases: CaseItem[], filename: string = 'Urban_Standz_Court_Cases.csv') {
  const exportData = cases.map(c => ({
    'Master Serial': c.serialNumber,
    'Court': c.court,
    'CCH': c.cch,
    'Judge': c.judge,
    'CNR': c.cnr,
    'Registration No.': c.registrationNumber,
    'Plaintiff-1': c.plaintiff1,
    'Plaintiff-2': c.plaintiff2 || '',
    'Plaintiff-3': c.plaintiff3 || '',
    'Defendant-1': c.defendant1,
    'Defendant-2': c.defendant2 || '',
    'Defendant-3': c.defendant3 || '',
    'Defendant-4': c.defendant4 || '',
    'Advocate': c.advocate,
    'Status': c.status,
    'Stage': c.stage,
    'Filing Date': c.filingDate,
    'Next Hearing': c.nextHearing,
    'Last Business': c.lastBusiness,
    'Linked Case': c.linkedCase || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
  
  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
