import React, { useState } from 'react';
import { 
  CalendarClock, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Copy, 
  Check, 
  Link as LinkIcon,
  ChevronRight,
  Gavel,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { CaseItem } from '../types';
import { formatDisplayDate, getHearingUrgency } from '../utils/caseUtils';

interface CaseTableProps {
  cases: CaseItem[];
  isAdmin: boolean;
  onViewCase: (c: CaseItem) => void;
  onEditCase: (c: CaseItem) => void;
  onQuickUpdateHearing: (c: CaseItem) => void;
  onDeleteCase: (c: CaseItem) => void;
}

type SortField = 
  | 'serialNumber' 
  | 'case' 
  | 'court' 
  | 'plaintiff' 
  | 'defendant' 
  | 'advocate' 
  | 'nextHearing' 
  | 'stage';

type SortDirection = 'asc' | 'desc';

export const CaseTable: React.FC<CaseTableProps> = ({
  cases,
  isAdmin,
  onViewCase,
  onEditCase,
  onQuickUpdateHearing,
  onDeleteCase
}) => {
  const [copiedCnr, setCopiedCnr] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('serialNumber');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleCopyCnr = (cnr: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(cnr);
    setCopiedCnr(cnr);
    setTimeout(() => setCopiedCnr(null), 2000);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField === field) {
      return sortDirection === 'asc' ? (
        <ArrowUp className="w-3.5 h-3.5 text-court-400 inline ml-1 shrink-0" />
      ) : (
        <ArrowDown className="w-3.5 h-3.5 text-court-400 inline ml-1 shrink-0" />
      );
    }
    return (
      <ArrowUpDown className="w-3 h-3 text-slate-500 inline ml-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
    );
  };

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

  // Sorted list of cases
  const sortedCases = [...cases].sort((a, b) => {
    let result = 0;

    switch (sortField) {
      case 'serialNumber':
        result = (a.serialNumber || 0) - (b.serialNumber || 0);
        break;

      case 'case':
        result = (a.registrationNumber || '').localeCompare(
          b.registrationNumber || '', 
          undefined, 
          { numeric: true, sensitivity: 'base' }
        );
        break;

      case 'court': {
        const courtA = `${a.court || ''} ${a.cch || ''}`;
        const courtB = `${b.court || ''} ${b.cch || ''}`;
        result = courtA.localeCompare(courtB, undefined, { sensitivity: 'base' });
        break;
      }

      case 'plaintiff':
        result = (a.plaintiff1 || '').localeCompare(b.plaintiff1 || '', undefined, { sensitivity: 'base' });
        break;

      case 'defendant':
        result = (a.defendant1 || '').localeCompare(b.defendant1 || '', undefined, { sensitivity: 'base' });
        break;

      case 'advocate':
        result = (a.advocate || '').localeCompare(b.advocate || '', undefined, { sensitivity: 'base' });
        break;

      case 'nextHearing':
        if (!a.nextHearing && !b.nextHearing) result = 0;
        else if (!a.nextHearing) return 1;
        else if (!b.nextHearing) return -1;
        else result = new Date(a.nextHearing).getTime() - new Date(b.nextHearing).getTime();
        break;

      case 'stage': {
        const stageA = `${a.stage || ''} ${a.status || ''}`;
        const stageB = `${b.stage || ''} ${b.status || ''}`;
        result = stageA.localeCompare(stageB, undefined, { sensitivity: 'base' });
        break;
      }

      default:
        result = 0;
    }

    return sortDirection === 'asc' ? result : -result;
  });

  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900/90 text-slate-300 uppercase tracking-wider font-semibold border-b border-slate-700 text-[11px]">
              {/* Master Serial */}
              <th 
                onClick={() => handleSort('serialNumber')}
                title="Sort by Serial Number"
                className="py-3.5 px-3 w-12 text-center cursor-pointer select-none hover:text-white transition-colors group"
              >
                <div className="flex items-center justify-center gap-0.5">
                  <span>#</span>
                  {renderSortIcon('serialNumber')}
                </div>
              </th>

              {/* Case / Reg No & CNR */}
              <th 
                onClick={() => handleSort('case')}
                title="Sort by Case / Registration Number"
                className="py-3.5 px-3 min-w-[170px] cursor-pointer select-none hover:text-white transition-colors group"
              >
                <div className="flex items-center gap-1">
                  <span>Case / Reg No & CNR</span>
                  {renderSortIcon('case')}
                </div>
              </th>

              {/* Court & CCH Hall */}
              <th 
                onClick={() => handleSort('court')}
                title="Sort by Court and Hall"
                className="py-3.5 px-3 min-w-[200px] cursor-pointer select-none hover:text-white transition-colors group"
              >
                <div className="flex items-center gap-1">
                  <span>Court & CCH Hall</span>
                  {renderSortIcon('court')}
                </div>
              </th>

              {/* Complainants / Plaintiffs */}
              <th 
                onClick={() => handleSort('plaintiff')}
                title="Sort by Complainant / Plaintiff"
                className="py-3.5 px-3 min-w-[180px] cursor-pointer select-none hover:text-white transition-colors group"
              >
                <div className="flex items-center gap-1">
                  <span>Complainants / Plaintiffs</span>
                  {renderSortIcon('plaintiff')}
                </div>
              </th>

              {/* Accused / Defendants */}
              <th 
                onClick={() => handleSort('defendant')}
                title="Sort by Accused / Defendant"
                className="py-3.5 px-3 min-w-[190px] cursor-pointer select-none hover:text-white transition-colors group"
              >
                <div className="flex items-center gap-1">
                  <span>Accused / Defendants</span>
                  {renderSortIcon('defendant')}
                </div>
              </th>

              {/* Advocate */}
              <th 
                onClick={() => handleSort('advocate')}
                title="Sort by Advocate Name"
                className="py-3.5 px-3 min-w-[130px] cursor-pointer select-none hover:text-white transition-colors group"
              >
                <div className="flex items-center gap-1">
                  <span>Advocate</span>
                  {renderSortIcon('advocate')}
                </div>
              </th>

              {/* Next Hearing (Moved before Stage column) */}
              <th 
                onClick={() => handleSort('nextHearing')}
                title="Sort by Next Hearing Date"
                className="py-3.5 px-3 min-w-[135px] cursor-pointer select-none hover:text-white transition-colors group"
              >
                <div className="flex items-center gap-1">
                  <span>Next Hearing</span>
                  {renderSortIcon('nextHearing')}
                </div>
              </th>

              {/* Stage & Status */}
              <th 
                onClick={() => handleSort('stage')}
                title="Sort by Stage & Status"
                className="py-3.5 px-3 min-w-[125px] cursor-pointer select-none hover:text-white transition-colors group"
              >
                <div className="flex items-center gap-1">
                  <span>Stage & Status</span>
                  {renderSortIcon('stage')}
                </div>
              </th>

              {/* Actions (Admin only) */}
              {isAdmin && (
                <th className="py-3.5 px-3 text-right sticky right-0 bg-slate-900/95 min-w-[100px] shadow-sm select-none">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {sortedCases.map((c) => {
              const urgency = getHearingUrgency(c.nextHearing);
              const isDisposed = (c.status || '').toLowerCase() === 'disposed';

              // Combine plaintiffs
              const plaintiffs = [c.plaintiff1, c.plaintiff2, c.plaintiff3].filter(Boolean);
              // Combine defendants
              const defendants = [c.defendant1, c.defendant2, c.defendant3, c.defendant4].filter(Boolean);

              return (
                <tr 
                  key={c.id}
                  onClick={() => onViewCase(c)}
                  className="hover:bg-slate-700/40 transition-colors cursor-pointer group"
                >
                  {/* Master Serial */}
                  <td className="py-3 px-3 text-center text-slate-400 font-mono text-xs">
                    {c.serialNumber}
                  </td>

                  {/* Reg No & CNR */}
                  <td className="py-3 px-3">
                    <div className="font-bold text-white tracking-tight flex items-center gap-1.5 group-hover:text-court-300 transition-colors">
                      <span>{c.registrationNumber}</span>
                      {c.linkedCase && (
                        <span 
                          title={`Linked Case: ${c.linkedCase}`}
                          className="inline-flex items-center text-[10px] bg-indigo-950/80 text-indigo-300 border border-indigo-700/60 px-1.5 py-0.2 rounded"
                        >
                          <LinkIcon className="w-2.5 h-2.5 mr-0.5" />
                          Linked
                        </span>
                      )}
                    </div>
                    {c.cnr ? (
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono mt-0.5">
                        <span>{c.cnr}</span>
                        <button
                          onClick={(e) => handleCopyCnr(c.cnr, e)}
                          title="Copy CNR"
                          className="p-0.5 hover:text-white rounded"
                        >
                          {copiedCnr === c.cnr ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-500 hover:text-slate-300" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-500 italic">No CNR listed</span>
                    )}
                  </td>

                  {/* Court & CCH */}
                  <td className="py-3 px-3">
                    <div className="text-slate-200 font-medium line-clamp-1" title={c.court}>
                      {c.court}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {c.cch && (
                        <span className="inline-block px-1.5 py-0.5 bg-slate-700/70 text-slate-300 font-mono text-[10px] rounded border border-slate-600/50">
                          CCH: {c.cch}
                        </span>
                      )}
                      {c.judge && (
                        <span className="text-[10px] text-slate-400 truncate max-w-[140px]" title={c.judge}>
                          {c.judge}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Complainants / Plaintiffs */}
                  <td className="py-3 px-3">
                    <div className="font-medium text-slate-100 line-clamp-1" title={plaintiffs.join(', ')}>
                      {c.plaintiff1}
                    </div>
                    {plaintiffs.length > 1 && (
                      <div className="text-[10px] text-slate-400 line-clamp-1">
                        + {plaintiffs.slice(1).join(', ')}
                      </div>
                    )}
                  </td>

                  {/* Accused / Defendants */}
                  <td className="py-3 px-3">
                    <div className="font-medium text-slate-200 line-clamp-1" title={defendants.join(', ')}>
                      {c.defendant1}
                    </div>
                    {defendants.length > 1 && (
                      <div className="text-[10px] text-slate-400 line-clamp-1">
                        + {defendants.slice(1).join(', ')}
                      </div>
                    )}
                  </td>

                  {/* Advocate */}
                  <td className="py-3 px-3 text-slate-300 font-medium">
                    {c.advocate ? (
                      <span className="truncate block max-w-[130px]" title={c.advocate}>
                        {c.advocate}
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">—</span>
                    )}
                  </td>

                  {/* Next Hearing (Moved before Stage column) */}
                  <td className="py-3 px-3">
                    {c.nextHearing ? (
                      <div>
                        <div className="font-medium text-slate-200">
                          {formatDisplayDate(c.nextHearing)}
                        </div>
                        <span className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] border ${urgency.badgeClass}`}>
                          {urgency.label}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-500 italic">Not set</span>
                    )}
                  </td>

                  {/* Stage & Status */}
                  <td className="py-3 px-3">
                    <div className="flex flex-col gap-1 items-start">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                        isDisposed 
                          ? 'bg-slate-700 text-slate-300 border-slate-600'
                          : 'bg-amber-950/70 text-amber-300 border-amber-800/80'
                      }`}>
                        {c.stage || 'Hearing'}
                      </span>
                      <span className={`text-[10px] font-medium ${
                        isDisposed ? 'text-slate-400' : 'text-emerald-400'
                      }`}>
                        ● {c.status || 'Pending'}
                      </span>
                    </div>
                  </td>

                  {/* Action Buttons (Admin only) */}
                  {isAdmin && (
                    <td 
                      onClick={(e) => e.stopPropagation()} 
                      className="py-3 px-3 text-right sticky right-0 bg-slate-800/95 group-hover:bg-slate-750 transition-colors shadow-sm"
                    >
                      <div className="flex items-center justify-end space-x-1">
                        {/* Quick Update Hearing */}
                        <button
                          onClick={() => onQuickUpdateHearing(c)}
                          title="Quick Update Hearing Details"
                          className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-amber-950/60 rounded-lg transition-colors"
                        >
                          <CalendarClock className="w-4 h-4" />
                        </button>

                        {/* Edit Full Case */}
                        <button
                          onClick={() => onEditCase(c)}
                          title="Edit Full Case"
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete Case */}
                        <button
                          onClick={() => onDeleteCase(c)}
                          title="Delete Case"
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/60 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
