import React, { useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  Building2, 
  User, 
  Briefcase, 
  CalendarClock, 
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { CaseItem } from '../types';
import { formatDisplayDate, getHearingUrgency } from '../utils/caseUtils';

interface HearingCalendarProps {
  cases: CaseItem[];
  isAdmin: boolean;
  onViewCase: (c: CaseItem) => void;
  onQuickUpdateHearing: (c: CaseItem) => void;
}

export const HearingCalendar: React.FC<HearingCalendarProps> = ({
  cases,
  isAdmin,
  onViewCase,
  onQuickUpdateHearing
}) => {
  // Group cases by Next Hearing Date
  const groupedHearings = useMemo(() => {
    const activeCases = cases.filter(c => (c.status || '').toLowerCase() === 'pending');
    const map = new Map<string, CaseItem[]>();
    const noDateCases: CaseItem[] = [];

    activeCases.forEach(c => {
      if (c.nextHearing && c.nextHearing.trim()) {
        const dateKey = c.nextHearing.trim();
        if (!map.has(dateKey)) {
          map.set(dateKey, []);
        }
        map.get(dateKey)!.push(c);
      } else {
        noDateCases.push(c);
      }
    });

    // Sort dates chronologically
    const sortedDates = Array.from(map.keys()).sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime();
    });

    return {
      scheduled: sortedDates.map(date => ({
        date,
        cases: map.get(date)!
      })),
      unscheduled: noDateCases
    };
  }, [cases]);

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-court-400" />
            Upcoming Court Hearings Schedule
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Chronological hearing dates across Bengaluru City Civil Court, Mayo Hall & Chief Judicial Magistrate
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-court-950/80 text-court-300 border border-court-700/60">
            {groupedHearings.scheduled.reduce((acc, curr) => acc + curr.cases.length, 0)} Scheduled Hearings
          </span>
          {groupedHearings.unscheduled.length > 0 && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-700 text-slate-300">
              {groupedHearings.unscheduled.length} Awaiting Date
            </span>
          )}
        </div>
      </div>

      {/* Date Timeline Groups */}
      <div className="space-y-4">
        {groupedHearings.scheduled.map(({ date, cases: dateCases }) => {
          const urgency = getHearingUrgency(date);

          return (
            <div 
              key={date}
              className="bg-slate-800/70 border border-slate-700/80 rounded-2xl overflow-hidden shadow-md"
            >
              {/* Date Header Strip */}
              <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-700/80 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-court-600/20 text-court-400 border border-court-500/30">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      {formatDisplayDate(date)}
                    </h3>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {date} • {dateCases.length} {dateCases.length === 1 ? 'case' : 'cases'} listed
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${urgency.badgeClass}`}>
                    {urgency.label}
                  </span>
                </div>
              </div>

              {/* Cases on this Date */}
              <div className="divide-y divide-slate-700/40">
                {dateCases.map(c => {
                  return (
                    <div
                      key={c.id}
                      onClick={() => onViewCase(c)}
                      className="p-4 hover:bg-slate-700/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer group"
                    >
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-slate-700 font-mono text-[10px] text-slate-300">
                            #{c.serialNumber}
                          </span>
                          <span className="font-bold text-white text-sm group-hover:text-court-300 transition-colors">
                            {c.registrationNumber}
                          </span>
                          {c.stage && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950/70 text-amber-300 border border-amber-800/80 uppercase tracking-wide">
                              {c.stage}
                            </span>
                          )}
                        </div>

                        {/* Court & CCH */}
                        <div className="flex items-center gap-2 text-xs text-slate-300 mt-1.5">
                          <Building2 className="w-3.5 h-3.5 text-court-400 shrink-0" />
                          <span className="font-medium text-slate-200">{c.court}</span>
                          {c.cch && (
                            <span className="bg-slate-700/60 px-1.5 py-0.2 rounded font-mono text-[10px] text-slate-300">
                              CCH: {c.cch}
                            </span>
                          )}
                          {c.judge && (
                            <span className="text-[10px] text-slate-400 hidden sm:inline truncate max-w-[150px]">
                              • {c.judge}
                            </span>
                          )}
                        </div>

                        {/* Parties & Advocate */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-xs text-slate-400">
                          <div className="flex items-center gap-1.5 truncate">
                            <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="truncate">
                              <strong className="text-slate-300 font-medium">Plaintiff:</strong> {c.plaintiff1}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 truncate">
                            <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">
                              <strong className="text-slate-300 font-medium">Advocate:</strong> {c.advocate || 'None'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Action */}
                      <div 
                        onClick={(e) => e.stopPropagation()} 
                        className="flex items-center justify-end space-x-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-700/50"
                      >
                        {isAdmin && (
                          <button
                            onClick={() => onQuickUpdateHearing(c)}
                            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-950/70 text-amber-300 border border-amber-700/70 hover:bg-amber-900/70 transition-colors"
                          >
                            <CalendarClock className="w-3.5 h-3.5" />
                            <span>Update Date / Order</span>
                          </button>
                        )}
                        <button
                          onClick={() => onViewCase(c)}
                          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-700/80 hover:bg-slate-700 text-white transition-colors"
                        >
                          <span>Details</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Unscheduled Cases */}
        {groupedHearings.unscheduled.length > 0 && (
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 mt-6">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-slate-500" />
              Cases with No Next Hearing Date Set ({groupedHearings.unscheduled.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {groupedHearings.unscheduled.map(c => (
                <div
                  key={c.id}
                  onClick={() => onViewCase(c)}
                  className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-700/40 hover:border-slate-600 transition-colors cursor-pointer text-xs flex items-center justify-between"
                >
                  <span className="font-semibold text-white truncate mr-2">{c.registrationNumber}</span>
                  <span className="text-[10px] text-slate-400 shrink-0">{c.plaintiff1}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
