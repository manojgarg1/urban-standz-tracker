import React from 'react';
import { 
  FileCheck2, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  Users 
} from 'lucide-react';
import { CaseItem } from '../types';
import { getHearingUrgency } from '../utils/caseUtils';

interface StatsOverviewProps {
  cases: CaseItem[];
  onSelectHearingRange: (range: 'all' | 'this-week' | 'next-14-days' | 'next-30-days') => void;
  onSelectStatus: (status: string) => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  cases,
  onSelectHearingRange,
  onSelectStatus
}) => {
  const total = cases.length;
  const pending = cases.filter(c => (c.status || '').toLowerCase() === 'pending').length;
  const disposed = cases.filter(c => (c.status || '').toLowerCase() === 'disposed').length;

  // Calculate hearings in next 7 days, 14 days, 30 days
  let urgent7Days = 0;
  let next30Days = 0;
  const uniqueCourts = new Set(cases.map(c => c.court).filter(Boolean)).size;
  const uniqueAdvocates = new Set(cases.map(c => c.advocate).filter(Boolean)).size;

  cases.forEach(c => {
    if (c.status === 'Pending' && c.nextHearing) {
      const urgency = getHearingUrgency(c.nextHearing);
      if (urgency.days !== null && urgency.days >= 0 && urgency.days <= 7) {
        urgent7Days++;
      }
      if (urgency.days !== null && urgency.days >= 0 && urgency.days <= 30) {
        next30Days++;
      }
    }
  });

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6 no-print">
      {/* Total Cases */}
      <div 
        onClick={() => onSelectStatus('all')}
        className="bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl p-3.5 cursor-pointer transition-all hover:border-court-500/50 shadow-sm group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400 group-hover:text-slate-300">Total Cases</span>
          <FileCheck2 className="w-4 h-4 text-court-400" />
        </div>
        <div className="mt-2 flex items-baseline">
          <span className="text-2xl font-bold text-white tracking-tight">{total}</span>
          <span className="ml-2 text-xs text-slate-400">tracked</span>
        </div>
      </div>

      {/* Pending Cases */}
      <div 
        onClick={() => onSelectStatus('Pending')}
        className="bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl p-3.5 cursor-pointer transition-all hover:border-amber-500/50 shadow-sm group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400 group-hover:text-slate-300">Active / Pending</span>
          <Clock className="w-4 h-4 text-amber-400" />
        </div>
        <div className="mt-2 flex items-baseline">
          <span className="text-2xl font-bold text-amber-400 tracking-tight">{pending}</span>
          <span className="ml-2 text-xs text-slate-400">
            {total > 0 ? `${Math.round((pending / total) * 100)}%` : ''}
          </span>
        </div>
      </div>

      {/* Disposed Cases */}
      <div 
        onClick={() => onSelectStatus('Disposed')}
        className="bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl p-3.5 cursor-pointer transition-all hover:border-emerald-500/50 shadow-sm group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400 group-hover:text-slate-300">Disposed / CC</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="mt-2 flex items-baseline">
          <span className="text-2xl font-bold text-emerald-400 tracking-tight">{disposed}</span>
          <span className="ml-2 text-xs text-slate-400">cases</span>
        </div>
      </div>

      {/* Hearings in 7 Days (Urgent Alert) */}
      <div 
        onClick={() => onSelectHearingRange('this-week')}
        className={`bg-slate-800/90 hover:bg-slate-800 border rounded-xl p-3.5 cursor-pointer transition-all shadow-sm group ${
          urgent7Days > 0 ? 'border-rose-600/60 bg-rose-950/20' : 'border-slate-700/80'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400 group-hover:text-slate-300">Next 7 Days</span>
          <AlertTriangle className={`w-4 h-4 ${urgent7Days > 0 ? 'text-rose-400 animate-bounce' : 'text-slate-500'}`} />
        </div>
        <div className="mt-2 flex items-baseline">
          <span className={`text-2xl font-bold tracking-tight ${urgent7Days > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
            {urgent7Days}
          </span>
          <span className="ml-2 text-xs text-slate-400">hearings</span>
        </div>
      </div>

      {/* Hearings in 30 Days */}
      <div 
        onClick={() => onSelectHearingRange('next-30-days')}
        className="bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl p-3.5 cursor-pointer transition-all hover:border-sky-500/50 shadow-sm group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400 group-hover:text-slate-300">Next 30 Days</span>
          <Clock className="w-4 h-4 text-sky-400" />
        </div>
        <div className="mt-2 flex items-baseline">
          <span className="text-2xl font-bold text-sky-300 tracking-tight">{next30Days}</span>
          <span className="ml-2 text-xs text-slate-400">scheduled</span>
        </div>
      </div>

      {/* Courts & Legal Counsel */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-3.5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Courts & Advocates</span>
          <Building2 className="w-4 h-4 text-purple-400" />
        </div>
        <div className="mt-2 flex items-center gap-3">
          <div>
            <span className="text-xl font-bold text-white tracking-tight">{uniqueCourts}</span>
            <span className="text-[10px] text-slate-400 block -mt-0.5">Courts</span>
          </div>
          <span className="text-slate-600">|</span>
          <div>
            <span className="text-xl font-bold text-court-300 tracking-tight">{uniqueAdvocates}</span>
            <span className="text-[10px] text-slate-400 block -mt-0.5">Lawyers</span>
          </div>
        </div>
      </div>
    </div>
  );
};
