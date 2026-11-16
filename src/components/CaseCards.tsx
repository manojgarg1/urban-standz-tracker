import React from 'react';
import { 
  Building2, 
  User, 
  Users, 
  Calendar, 
  Briefcase, 
  Eye, 
  CalendarClock, 
  Edit3, 
  Trash2, 
  Link as LinkIcon,
  ChevronRight,
  Gavel,
  AlertCircle
} from 'lucide-react';
import { CaseItem } from '../types';
import { formatDisplayDate, getHearingUrgency, parseLastBusiness, isMissedUpdate } from '../utils/caseUtils';

interface CaseCardsProps {
  cases: CaseItem[];
  isAdmin: boolean;
  onViewCase: (c: CaseItem) => void;
  onSelectLinkedCase?: (caseRegNo: string) => void;
  onEditCase: (c: CaseItem) => void;
  onQuickUpdateHearing: (c: CaseItem) => void;
  onDeleteCase: (c: CaseItem) => void;
}

export const CaseCards: React.FC<CaseCardsProps> = ({
  cases,
  isAdmin,
  onViewCase,
  onSelectLinkedCase,
  onEditCase,
  onQuickUpdateHearing,
  onDeleteCase
}) => {
  if (cases.length === 0) {
    return (
      <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-12 text-center">
        <Gavel className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-white">No cases match your filter criteria</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Try clearing or adjusting the search keywords, court filter, or hearing date range.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cases.map((c) => {
        const urgency = getHearingUrgency(c.nextHearing);
        const isDisposed = (c.status || '').toLowerCase() === 'disposed';
        const parsedBusiness = parseLastBusiness(c.lastBusiness);
        const latestBusiness = parsedBusiness.length > 0 ? parsedBusiness[parsedBusiness.length - 1] : null;

        const plaintiffs = [c.plaintiff1, c.plaintiff2, c.plaintiff3].filter(Boolean);
        const defendants = [c.defendant1, c.defendant2, c.defendant3, c.defendant4].filter(Boolean);

        return (
          <div
            key={c.id}
            onClick={() => onViewCase(c)}
            className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-court-500/50 rounded-2xl p-4 flex flex-col justify-between shadow-lg transition-all hover:shadow-xl cursor-pointer group"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-700/50">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-700/90 text-slate-300 font-mono text-[11px] font-bold flex items-center justify-center border border-slate-600/50">
                      #{c.serialNumber}
                    </span>
                    <h3 className="font-bold text-white text-base group-hover:text-court-300 transition-colors">
                      {c.registrationNumber}
                    </h3>
                  </div>
                  {c.cnr && (
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      CNR: {c.cnr}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                    isDisposed 
                      ? 'bg-slate-700 text-slate-300 border-slate-600'
                      : 'bg-amber-950/70 text-amber-300 border-amber-800/80'
                  }`}>
                    {c.stage || 'Hearing'}
                  </span>
                  {isMissedUpdate(c) ? (
                    <span 
                      title="Scheduled hearing date has passed without hearing history update"
                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-300 bg-rose-950/80 border border-rose-800/80 px-2 py-0.5 rounded-full"
                    >
                      <AlertCircle className="w-3 h-3 text-rose-400 animate-pulse shrink-0" />
                      Missed Updates
                    </span>
                  ) : (
                    <span className={`text-[10px] font-medium ${isDisposed ? 'text-slate-400' : 'text-emerald-400'}`}>
                      ● {c.status || 'Pending'}
                    </span>
                  )}
                </div>
              </div>

              {/* Court & Hall */}
              <div className="py-2.5 flex items-start gap-2 text-xs text-slate-300">
                <Building2 className="w-3.5 h-3.5 text-court-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium text-slate-200 line-clamp-1">{c.court}</div>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                    {c.cch && <span className="bg-slate-700/60 px-1.5 py-0.2 rounded font-mono">CCH: {c.cch}</span>}
                    {c.judge && <span className="truncate">{c.judge}</span>}
                  </div>
                </div>
              </div>

              {/* Parties */}
              <div className="bg-slate-900/60 rounded-xl p-2.5 space-y-2 text-xs border border-slate-700/40 my-2">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <User className="w-3 h-3 text-emerald-400" />
                    Plaintiff(s):
                  </div>
                  <div className="font-medium text-slate-200 line-clamp-1 mt-0.5">
                    {plaintiffs.join(', ')}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Users className="w-3 h-3 text-rose-400" />
                    Defendant(s):
                  </div>
                  <div className="font-medium text-slate-300 line-clamp-1 mt-0.5">
                    {defendants.join(', ')}
                  </div>
                </div>
              </div>

              {/* Advocate & Linked Case */}
              <div className="flex items-center justify-between text-xs text-slate-400 py-1">
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-3 h-3 text-slate-400" />
                  <span className="truncate max-w-[150px] text-slate-300 font-medium">
                    {c.advocate || 'No Advocate listed'}
                  </span>
                </div>
                {c.linkedCase && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectLinkedCase) {
                        onSelectLinkedCase(c.linkedCase!);
                      } else {
                        onViewCase(c);
                      }
                    }}
                    title={`Open linked case: ${c.linkedCase}`}
                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-300 hover:text-white bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 hover:border-indigo-400 px-2 py-0.5 rounded transition-all"
                  >
                    <LinkIcon className="w-2.5 h-2.5 mr-0.5 text-indigo-400 shrink-0" />
                    <span>Linked to Case No {c.linkedCase}</span>
                  </button>
                )}
              </div>

              {/* Latest Hearing Note Preview */}
              {latestBusiness && (
                <div className="mt-2 p-2 bg-slate-900/40 rounded-lg border border-slate-700/30 text-[11px] text-slate-300 line-clamp-2">
                  <span className="font-semibold text-court-300">{latestBusiness.date}: </span>
                  {latestBusiness.text}
                </div>
              )}
            </div>

            {/* Card Footer: Next Hearing & Actions */}
            <div className="pt-3 mt-3 border-t border-slate-700/50 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-semibold text-slate-400">Next Hearing</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-bold text-white text-xs">
                    {formatDisplayDate(c.nextHearing)}
                  </span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] border ${urgency.badgeClass}`}>
                    {urgency.label}
                  </span>
                </div>
              </div>

              <div 
                onClick={(e) => e.stopPropagation()} 
                className="flex items-center space-x-1"
              >
                <button
                  onClick={() => onViewCase(c)}
                  title="View Full Case"
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>

                {isAdmin && (
                  <>
                    <button
                      onClick={() => onQuickUpdateHearing(c)}
                      title="Update Hearing"
                      className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-amber-950/60 rounded-lg transition-colors"
                    >
                      <CalendarClock className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEditCase(c)}
                      title="Edit Case"
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteCase(c)}
                      title="Delete Case"
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/60 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
