import React from 'react';
import { 
  FileCheck2, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  Users,
  AlertCircle,
  Calendar,
  CalendarClock
} from 'lucide-react';
import { CaseItem } from '../types';
import { getHearingUrgency, isMissedUpdate } from '../utils/caseUtils';

interface StatsOverviewProps {
  cases: CaseItem[];
  onSelectHearingRange: (range: 'all' | 'today' | 'tomorrow' | 'this-week' | 'next-14-days' | 'next-30-days') => void;
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
  const missedUpdates = cases.filter(isMissedUpdate).length;

  // Calculate hearings for Today, Tomorrow, next 7 days, 30 days
  let urgentToday = 0;
  let urgentTomorrow = 0;
  let urgent7Days = 0;
  let next30Days = 0;
  const uniqueCourts = new Set(cases.map(c => c.court).filter(Boolean)).size;
  const uniqueAdvocates = new Set(cases.map(c => c.advocate).filter(Boolean)).size;

  cases.forEach(c => {
    if ((c.status || '').toLowerCase() === 'pending' && c.nextHearing) {
      const urgency = getHearingUrgency(c.nextHearing);
      if (urgency.days === 0) {
        urgentToday++;
      }
      if (urgency.days === 1) {
        urgentTomorrow++;
      }
      if (urgency.days !== null && urgency.days >= 0 && urgency.days <= 7) {
        urgent7Days++;
      }
      if (urgency.days !== null && urgency.days >= 0 && urgency.days <= 30) {
        next30Days++;
      }
    }
  });

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-1.5 xl:gap-2 mb-6 no-print">
      {/* Total Cases */}
      <div 
        onClick={() => onSelectStatus('all')}
        className="bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl p-2.5 xl:p-3 cursor-pointer transition-all hover:border-court-500/50 shadow-sm group min-w-0"
      >
        <div className="flex items-center justify-between gap-1">
          <span className="text-[11px] xl:text-xs font-medium text-slate-400 group-hover:text-slate-300 truncate">Total Cases</span>
          <FileCheck2 className="w-3.5 h-3.5 text-court-400 shrink-0" />
        </div>
        <div className="mt-1.5 flex items-baseline gap-1">
          <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">{total}</span>
          <span className="text-[10px] xl:text-[11px] text-slate-400 truncate">tracked</span>
        </div>
      </div>

      {/* Pending Cases */}
      <div 
        onClick={() => onSelectStatus('Pending')}
        className="bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl p-2.5 xl:p-3 cursor-pointer transition-all hover:border-amber-500/50 shadow-sm group min-w-0"
      >
        <div className="flex items-center justify-between gap-1">
          <span className="text-[11px] xl:text-xs font-medium text-slate-400 group-hover:text-slate-300 truncate">Active / Pending</span>
          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        </div>
        <div className="mt-1.5 flex items-baseline gap-1">
          <span className="text-xl sm:text-2xl font-bold text-amber-400 tracking-tight">{pending}</span>
          <span className="text-[10px] xl:text-[11px] text-slate-400 truncate">
            {total > 0 ? `${Math.round((pending / total) * 100)}%` : ''}
          </span>
        </div>
      </div>

      {/* Disposed Cases */}
      <div 
        onClick={() => onSelectStatus('Disposed')}
        className="bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl p-2.5 xl:p-3 cursor-pointer transition-all hover:border-emerald-500/50 shadow-sm group min-w-0"
      >
        <div className="flex items-center justify-between gap-1">
          <span className="text-[11px] xl:text-xs font-medium text-slate-400 group-hover:text-slate-300 truncate">Disposed / CC</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        </div>
        <div className="mt-1.5 flex items-baseline gap-1">
          <span className="text-xl sm:text-2xl font-bold text-emerald-400 tracking-tight">{disposed}</span>
          <span className="text-[10px] xl:text-[11px] text-slate-400 truncate">cases</span>
        </div>
      </div>

      {/* Missed Updates */}
      <div 
        onClick={() => onSelectStatus('Missed Updates')}
        className={`bg-slate-800/90 hover:bg-slate-800 border rounded-xl p-2.5 xl:p-3 cursor-pointer transition-all shadow-sm group min-w-0 ${
          missedUpdates > 0 ? 'border-rose-600/70 bg-rose-950/20 hover:border-rose-500' : 'border-slate-700/80 hover:border-slate-600'
        }`}
      >
        <div className="flex items-center justify-between gap-1">
          <span className="text-[11px] xl:text-xs font-medium text-slate-400 group-hover:text-slate-300 truncate">Missed Updates</span>
          <AlertCircle className={`w-3.5 h-3.5 shrink-0 ${missedUpdates > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`} />
        </div>
        <div className="mt-1.5 flex items-baseline gap-1">
          <span className={`text-xl sm:text-2xl font-bold tracking-tight ${missedUpdates > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
            {missedUpdates}
          </span>
          <span className="text-[10px] xl:text-[11px] text-slate-400 truncate">cases</span>
        </div>
      </div>

      {/* Today */}
      <div 
        onClick={() => onSelectHearingRange('today')}
        className={`bg-slate-800/90 hover:bg-slate-800 border rounded-xl p-2.5 xl:p-3 cursor-pointer transition-all shadow-sm group min-w-0 ${
          urgentToday > 0 ? 'border-red-600/70 bg-red-950/25 hover:border-red-500' : 'border-slate-700/80 hover:border-slate-600'
        }`}
      >
        <div className="flex items-center justify-between gap-1">
          <span className="text-[11px] xl:text-xs font-medium text-slate-400 group-hover:text-slate-300 truncate">Today</span>
          <Calendar className={`w-3.5 h-3.5 shrink-0 ${urgentToday > 0 ? 'text-red-400 animate-pulse' : 'text-slate-500'}`} />
        </div>
        <div className="mt-1.5 flex items-baseline gap-1">
          <span className={`text-xl sm:text-2xl font-bold tracking-tight ${urgentToday > 0 ? 'text-red-400' : 'text-slate-400'}`}>
            {urgentToday}
          </span>
          <span className="text-[10px] xl:text-[11px] text-slate-400 truncate">hearings</span>
        </div>
      </div>

      {/* Tomorrow */}
      <div 
        onClick={() => onSelectHearingRange('tomorrow')}
        className={`bg-slate-800/90 hover:bg-slate-800 border rounded-xl p-2.5 xl:p-3 cursor-pointer transition-all shadow-sm group min-w-0 ${
          urgentTomorrow > 0 ? 'border-amber-500/70 bg-amber-950/25 hover:border-amber-400' : 'border-slate-700/80 hover:border-slate-600'
        }`}
      >
        <div className="flex items-center justify-between gap-1">
          <span className="text-[11px] xl:text-xs font-medium text-slate-400 group-hover:text-slate-300 truncate">Tomorrow</span>
          <CalendarClock className={`w-3.5 h-3.5 shrink-0 ${urgentTomorrow > 0 ? 'text-amber-400' : 'text-slate-500'}`} />
        </div>
        <div className="mt-1.5 flex items-baseline gap-1">
          <span className={`text-xl sm:text-2xl font-bold tracking-tight ${urgentTomorrow > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
            {urgentTomorrow}
          </span>
          <span className="text-[10px] xl:text-[11px] text-slate-400 truncate">hearings</span>
        </div>
      </div>

      {/* Hearings in 7 Days (Urgent Alert) */}
      <div 
        onClick={() => onSelectHearingRange('this-week')}
        className={`bg-slate-800/90 hover:bg-slate-800 border rounded-xl p-2.5 xl:p-3 cursor-pointer transition-all shadow-sm group min-w-0 ${
          urgent7Days > 0 ? 'border-rose-600/60 bg-rose-950/20 hover:border-rose-500' : 'border-slate-700/80 hover:border-slate-600'
        }`}
      >
        <div className="flex items-center justify-between gap-1">
          <span className="text-[11px] xl:text-xs font-medium text-slate-400 group-hover:text-slate-300 truncate">Next 7 Days</span>
          <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${urgent7Days > 0 ? 'text-rose-400 animate-bounce' : 'text-slate-500'}`} />
        </div>
        <div className="mt-1.5 flex items-baseline gap-1">
          <span className={`text-xl sm:text-2xl font-bold tracking-tight ${urgent7Days > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
            {urgent7Days}
          </span>
          <span className="text-[10px] xl:text-[11px] text-slate-400 truncate">hearings</span>
        </div>
      </div>

      {/* Hearings in 30 Days */}
      <div 
        onClick={() => onSelectHearingRange('next-30-days')}
        className="bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl p-2.5 xl:p-3 cursor-pointer transition-all hover:border-sky-500/50 shadow-sm group min-w-0"
      >
        <div className="flex items-center justify-between gap-1">
          <span className="text-[11px] xl:text-xs font-medium text-slate-400 group-hover:text-slate-300 truncate">Next 30 Days</span>
          <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
        </div>
        <div className="mt-1.5 flex items-baseline gap-1">
          <span className="text-xl sm:text-2xl font-bold text-sky-300 tracking-tight">{next30Days}</span>
          <span className="text-[10px] xl:text-[11px] text-slate-400 truncate">scheduled</span>
        </div>
      </div>

      {/* Courts & Legal Counsel */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-2.5 xl:p-3 shadow-sm min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[11px] xl:text-xs font-medium text-slate-400 truncate">Courts / Adv</span>
          <Building2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
        </div>
        <div className="mt-1.5 flex items-center justify-between gap-1">
          <div className="min-w-0">
            <span className="text-lg sm:text-xl font-bold text-white tracking-tight">{uniqueCourts}</span>
            <span className="text-[10px] text-slate-400 block -mt-0.5 truncate">Courts</span>
          </div>
          <span className="text-slate-600 text-xs shrink-0">|</span>
          <div className="min-w-0">
            <span className="text-lg sm:text-xl font-bold text-court-300 tracking-tight">{uniqueAdvocates}</span>
            <span className="text-[10px] text-slate-400 block -mt-0.5 truncate">Lawyers</span>
          </div>
        </div>
      </div>
    </div>
  );
};
