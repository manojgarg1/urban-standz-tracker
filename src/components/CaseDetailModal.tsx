import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  User, 
  Users, 
  Briefcase, 
  Calendar, 
  Clock, 
  ExternalLink, 
  Copy, 
  Check, 
  Link as LinkIcon, 
  FileText, 
  Edit3, 
  CalendarClock, 
  Search,
  History,
  ShieldCheck,
  Scale,
  AlertCircle
} from 'lucide-react';
import { CaseItem } from '../types';
import { formatDisplayDate, getHearingUrgency, parseLastBusiness, isMissedUpdate } from '../utils/caseUtils';

interface CaseDetailModalProps {
  caseItem: CaseItem | null;
  onClose: () => void;
  isAdmin: boolean;
  onEditCase: (c: CaseItem) => void;
  onQuickUpdateHearing: (c: CaseItem) => void;
  onSelectLinkedCase: (caseRegNo: string) => void;
}

export const CaseDetailModal: React.FC<CaseDetailModalProps> = ({
  caseItem,
  onClose,
  isAdmin,
  onEditCase,
  onQuickUpdateHearing,
  onSelectLinkedCase
}) => {
  const [copiedCnr, setCopiedCnr] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRawText, setShowRawText] = useState(false);

  if (!caseItem) return null;

  const urgency = getHearingUrgency(caseItem.nextHearing);
  const isDisposed = (caseItem.status || '').toLowerCase() === 'disposed';

  const plaintiffs = [
    { label: 'Plaintiff 1', name: caseItem.plaintiff1 },
    { label: 'Plaintiff 2', name: caseItem.plaintiff2 },
    { label: 'Plaintiff 3', name: caseItem.plaintiff3 },
  ].filter(p => Boolean(p.name));

  const defendants = [
    { label: 'Defendant 1', name: caseItem.defendant1 },
    { label: 'Defendant 2', name: caseItem.defendant2 },
    { label: 'Defendant 3', name: caseItem.defendant3 },
    { label: 'Defendant 4', name: caseItem.defendant4 },
  ].filter(d => Boolean(d.name));

  const parsedBusiness = parseLastBusiness(caseItem.lastBusiness);

  const filteredBusiness = searchQuery.trim()
    ? parsedBusiness.filter(entry => 
        entry.date.toLowerCase().includes(searchQuery.toLowerCase()) || 
        entry.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : parsedBusiness;

  const handleCopyCnr = () => {
    if (!caseItem.cnr) return;
    navigator.clipboard.writeText(caseItem.cnr);
    setCopiedCnr(true);
    setTimeout(() => setCopiedCnr(false), 2000);
  };

  // eCourts CNR verification link
  const ecourtsLink = caseItem.cnr 
    ? `https://services.ecourts.gov.in/ecourtindia_v6/?p=home/index&app_token=eCourts&cno=${encodeURIComponent(caseItem.cnr)}`
    : `https://services.ecourts.gov.in`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-700/80 flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-xs font-semibold border border-slate-700">
                #{caseItem.serialNumber}
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {caseItem.registrationNumber}
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                isDisposed ? 'bg-slate-700 text-slate-300 border-slate-600' : 'bg-amber-950/70 text-amber-300 border-amber-800/80'
              }`}>
                {caseItem.stage || 'Hearing'}
              </span>
              {isMissedUpdate(caseItem) ? (
                <span 
                  title="Scheduled hearing date has passed without hearing history update"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-rose-300 bg-rose-950/80 border border-rose-800/80 px-2.5 py-0.5 rounded-full"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400 animate-pulse shrink-0" />
                  Missed Updates
                </span>
              ) : (
                <span className={`text-xs font-semibold ${isDisposed ? 'text-slate-400' : 'text-emerald-400'}`}>
                  ● {caseItem.status || 'Pending'}
                </span>
              )}
            </div>

            {/* CNR & External Lookups */}
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
              {caseItem.cnr ? (
                <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60 font-mono text-slate-300">
                  <span className="text-slate-500">CNR:</span>
                  <span className="font-semibold text-white">{caseItem.cnr}</span>
                  <button
                    onClick={handleCopyCnr}
                    title="Copy CNR Number"
                    className="p-1 hover:text-white rounded"
                  >
                    {copiedCnr ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-400 hover:text-slate-200" />
                    )}
                  </button>
                </div>
              ) : (
                <span className="text-slate-500 italic">No CNR Number</span>
              )}

              <a
                href={ecourtsLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1 text-court-400 hover:text-court-300 hover:underline"
              >
                <span>Verify on eCourts Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              {caseItem.category && (
                <span className="text-slate-400 bg-slate-800 px-2 py-0.5 rounded text-[11px] border border-slate-700/50">
                  {caseItem.category}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top Two Columns: Court & Schedule + Parties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left: Court & Schedule Details */}
            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/60 space-y-3.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-court-300 flex items-center gap-1.5 border-b border-slate-700/50 pb-2">
                <Building2 className="w-4 h-4 text-court-400" />
                Court & Hearing Details
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[11px]">Court Name:</span>
                  <span className="text-white font-medium">{caseItem.court}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">CCH (Hall No):</span>
                  <span className="font-mono text-slate-200 font-semibold bg-slate-900/80 px-2 py-0.5 rounded inline-block mt-0.5 border border-slate-700/60">
                    {caseItem.cch || '—'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Judge:</span>
                  <span className="text-slate-200 font-medium">{caseItem.judge || '—'}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Filing Date:</span>
                  <span className="text-slate-200 font-medium">{formatDisplayDate(caseItem.filingDate)}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Next Hearing:</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-bold text-white">{formatDisplayDate(caseItem.nextHearing)}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] border ${urgency.badgeClass}`}>
                      {urgency.label}
                    </span>
                  </div>
                </div>

                {caseItem.linkedCase && (
                  <div className="col-span-2 bg-indigo-950/40 p-2.5 rounded-lg border border-indigo-800/40">
                    <span className="text-indigo-300 block text-[11px] font-medium flex items-center gap-1">
                      <LinkIcon className="w-3 h-3" />
                      Linked Cross Case:
                    </span>
                    <button
                      onClick={() => onSelectLinkedCase(caseItem.linkedCase!)}
                      className="text-court-300 hover:text-white font-semibold underline text-xs mt-0.5 flex items-center gap-1"
                    >
                      <span>Linked to Case No {caseItem.linkedCase}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Parties & Advocate */}
            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/60 space-y-3.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-court-300 flex items-center gap-1.5 border-b border-slate-700/50 pb-2">
                <Users className="w-4 h-4 text-court-400" />
                Case Parties & Legal Counsel
              </h3>

              <div className="space-y-3 text-xs">
                {/* Plaintiffs */}
                <div>
                  <span className="text-emerald-400 font-semibold block text-[11px] uppercase tracking-wider flex items-center gap-1 mb-1">
                    <User className="w-3 h-3" />
                    Complainant(s) / Plaintiff(s):
                  </span>
                  <div className="space-y-1 pl-2 border-l-2 border-emerald-500/40">
                    {plaintiffs.map((p, idx) => (
                      <div key={idx} className="text-slate-100 font-medium">
                        <span className="text-slate-400 text-[10px] mr-1.5">{p.label}:</span>
                        {p.name}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Defendants */}
                <div className="pt-1">
                  <span className="text-rose-400 font-semibold block text-[11px] uppercase tracking-wider flex items-center gap-1 mb-1">
                    <Users className="w-3 h-3" />
                    Accused / Defendant(s):
                  </span>
                  <div className="space-y-1 pl-2 border-l-2 border-rose-500/40">
                    {defendants.map((d, idx) => (
                      <div key={idx} className="text-slate-200">
                        <span className="text-slate-400 text-[10px] mr-1.5">{d.label}:</span>
                        <span className="font-medium text-slate-100">{d.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Advocate */}
                <div className="pt-2 border-t border-slate-700/40 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Advocate for Plaintiff:</span>
                    <span className="text-court-300 font-semibold text-xs mt-0.5 block">
                      {caseItem.advocate || 'Not recorded'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: Last Business / Running Court Proceedings Log */}
          <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/60 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/60 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-court-400" />
                  Last Business & Court Proceedings Timeline
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Running chronological record of court orders, notices, appearance, and adjournments on each hearing date.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Search within proceedings */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search orders..."
                    className="pl-8 pr-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-court-500 w-36 sm:w-44"
                  />
                </div>

                {/* Toggle Raw vs Timeline */}
                <button
                  onClick={() => setShowRawText(!showRawText)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-700 hover:bg-slate-650 text-slate-200 border border-slate-600 transition-colors"
                >
                  {showRawText ? 'Timeline View' : 'Raw Text'}
                </button>
              </div>
            </div>

            {/* Content view */}
            {showRawText ? (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto select-all">
                {caseItem.lastBusiness || 'No business records available for this case.'}
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {filteredBusiness.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-xs italic">
                    {searchQuery ? 'No hearing entries match your search.' : 'No business entries recorded yet.'}
                  </div>
                ) : (
                  filteredBusiness.map((entry, idx) => {
                    const isLatest = idx === filteredBusiness.length - 1;
                    return (
                      <div 
                        key={idx}
                        className={`p-3.5 rounded-xl border transition-all text-xs ${
                          isLatest 
                            ? 'bg-slate-800/90 border-court-500/40 shadow-sm' 
                            : 'bg-slate-850/80 border-slate-700/60 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-court-300 font-mono text-xs bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700/50">
                            {entry.date}
                          </span>
                          {isLatest && (
                            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                              Most Recent
                            </span>
                          )}
                        </div>
                        <p className="text-slate-200 leading-relaxed font-sans text-xs">
                          {entry.text}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-850 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400">
            {caseItem.updatedAt && (
              <span>Last Updated: {new Date(caseItem.updatedAt).toLocaleString('en-GB')}</span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {isAdmin && (
              <>
                <button
                  onClick={() => onQuickUpdateHearing(caseItem)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-950/40 transition-colors"
                >
                  <CalendarClock className="w-3.5 h-3.5" />
                  <span>Update Hearing Details</span>
                </button>

                <button
                  onClick={() => onEditCase(caseItem)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-white transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Full Case</span>
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
