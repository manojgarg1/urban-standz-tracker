import React, { useState, useEffect } from 'react';
import { 
  X, 
  CalendarClock, 
  Save, 
  Check, 
  Sparkles,
  CalendarDays,
  ListPlus
} from 'lucide-react';
import { CaseItem } from '../types';
import { formatDisplayDate } from '../utils/caseUtils';

interface UpdateHearingModalProps {
  caseItem: CaseItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    caseId: string, 
    newHearingDate: string, 
    newStage: string, 
    hearingOrderText?: string,
    newStatus?: string
  ) => Promise<void>;
}

const COMMON_STAGES = [
  'Summons',
  'Notice',
  'Written Statement',
  'Objection to IA',
  'Hearing on IA',
  'Evidence',
  'Further Evidence',
  'Cross-Examination',
  'Arguments',
  'Orders',
  'Judgment',
  'Steps',
  'SWORN STATEMENT',
  'Call On',
  'Disposed'
];

const QUICK_SNIPPETS = [
  'PO is on leave. Hence case is adjourned.',
  'PO is on training. Call on.',
  'Issue fresh SS to accused/defendants if PF paid.',
  'Existing T.I is extended till next date of hearing.',
  'Defendant counsel filed vakalath and prays time for Written Statement.',
  'Written statement filed. Copy served. Call on for objections.',
  'Summons returned unserved as addressee left. For steps.',
  'Paper publication allowed under Order V Rule 20 CPC.',
  'Posted for plaintiff evidence.'
];

export const UpdateHearingModal: React.FC<UpdateHearingModalProps> = ({
  caseItem,
  isOpen,
  onClose,
  onSave
}) => {
  // Initial form states
  const [nextHearing, setNextHearing] = useState(caseItem?.nextHearing || '');
  const [stage, setStage] = useState(caseItem?.stage || 'Summons');
  const [status, setStatus] = useState(caseItem?.status || 'Pending');
  
  // Format today's date for hearing entry
  const todayDefault = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const [orderDate, setOrderDate] = useState(todayDefault);
  const [orderText, setOrderText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state when caseItem changes
  useEffect(() => {
    if (caseItem) {
      setNextHearing(caseItem.nextHearing || '');
      setStage(caseItem.stage || 'Summons');
      setStatus(caseItem.status || 'Pending');
      setOrderDate(new Date().toISOString().split('T')[0]);
      setOrderText('');
    }
  }, [caseItem]);

  if (!isOpen || !caseItem) return null;

  // Helper to add days to date
  const handleAddDays = (days: number) => {
    const base = new Date();
    base.setDate(base.getDate() + days);
    setNextHearing(base.toISOString().split('T')[0]);
  };

  const handleApplySnippet = (snippet: string) => {
    setOrderText(prev => prev ? `${prev} ${snippet}` : snippet);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Format order text with specified order date
      let formattedOrderText = '';
      if (orderText.trim()) {
        const [year, month, day] = orderDate.split('-');
        const datePrefix = `${day}/${month}/${year}`;
        formattedOrderText = `${datePrefix}: ${orderText.trim()}`;
      }

      await onSave(caseItem.id, nextHearing, stage, formattedOrderText, status);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to update hearing details. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Update Hearing & Court Order
              </h2>
              <p className="text-xs text-slate-400">
                {caseItem.registrationNumber} • {caseItem.court}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current State Summary */}
        <div className="bg-slate-800/40 px-6 py-2.5 border-b border-slate-700/50 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-slate-400">Current Next Date: </span>
            <span className="font-semibold text-white font-mono">
              {formatDisplayDate(caseItem.nextHearing)}
            </span>
          </div>
          <div>
            <span className="text-slate-400">Current Stage: </span>
            <span className="font-semibold text-amber-300">
              {caseItem.stage || 'Not specified'}
            </span>
          </div>
          <div>
            <span className="text-slate-400">Plaintiff: </span>
            <span className="font-medium text-slate-200 truncate max-w-[150px] inline-block align-bottom">
              {caseItem.plaintiff1}
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Section 1: New Next Hearing Date */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              New Next Hearing Date <span className="text-amber-400">*</span>
            </label>
            <input
              type="date"
              required
              value={nextHearing}
              onChange={(e) => setNextHearing(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-court-500 font-mono"
            />

            {/* Quick Date Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400 mr-1 flex items-center gap-1">
                <CalendarDays className="w-3 h-3 text-amber-400" /> Quick Add:
              </span>
              {[
                { label: '+7 Days', days: 7 },
                { label: '+14 Days', days: 14 },
                { label: '+21 Days', days: 21 },
                { label: '+30 Days', days: 30 },
                { label: '+45 Days', days: 45 },
                { label: '+60 Days', days: 60 }
              ].map(btn => (
                <button
                  key={btn.days}
                  type="button"
                  onClick={() => handleAddDays(btn.days)}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[11px] border border-slate-700/80 transition-colors"
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Stage & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Court Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-court-500"
              >
                {COMMON_STAGES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Case Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-court-500"
              >
                <option value="Pending">Pending (Ongoing)</option>
                <option value="Disposed">Disposed / Converted to CC</option>
                <option value="Stayed">Stayed by High Court / Higher Forum</option>
              </select>
            </div>
          </div>

          {/* Section 3: Today's Hearing Order / Business Entry */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Today's Hearing Order / Business Note (Optional)
              </label>
              <span className="text-[11px] text-slate-400">Appends to "Last Business"</span>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-slate-400">Order Date:</span>
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono"
              />
            </div>

            <textarea
              rows={3}
              value={orderText}
              onChange={(e) => setOrderText(e.target.value)}
              placeholder="e.g. Complainant counsel present. Summons returned unserved as accused left address. Issue fresh summons through speed post returnable by..."
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-court-500 leading-relaxed font-sans"
            />

            {/* Quick snippet buttons */}
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Quick Insert Phrases:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_SNIPPETS.map((snip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplySnippet(snip)}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-md text-[11px] border border-slate-700/60 transition-colors text-left"
                  >
                    + {snip.substring(0, 36)}...
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-semibold bg-court-600 hover:bg-court-500 text-white shadow-lg shadow-court-900/30 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Save & Update Hearing'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
