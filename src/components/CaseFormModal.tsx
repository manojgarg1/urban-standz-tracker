import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Building2, 
  FileText, 
  Users, 
  User, 
  Briefcase, 
  Calendar, 
  Scale, 
  Plus, 
  History, 
  AlertCircle 
} from 'lucide-react';
import { CaseItem } from '../types';

interface CaseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseToEdit?: CaseItem | null;
  onSave: (caseData: Partial<CaseItem>) => Promise<void>;
  existingCourts: string[];
}

const DEFAULT_COURTS = [
  'Chief Judicial Magistrate, Bengaluru City',
  'Principal City Civil & Sessions Court',
  'Mayo Hall - CCH21',
  'Karnataka High Court, Bengaluru',
  'City Civil Court (Commercial Division)',
  'District Consumer Disputes Redressal Commission'
];

const DEFAULT_STAGES = [
  'Summons',
  'Notice',
  'Written Statement',
  'Objection',
  'Hearing on IA',
  'Hearings',
  'Evidence',
  'Orders',
  'Judgment',
  'SWORN STATEMENT',
  'Call On',
  'Steps',
  'Disposed'
];

const DEFAULT_CATEGORIES = [
  'Tenant vs Landlord & Urban Standz',
  'Landlord vs Tenant & Urban Standz',
  'Criminal / Cheating / 138 NI Act',
  'Other Legal Dispute'
];

export const CaseFormModal: React.FC<CaseFormModalProps> = ({
  isOpen,
  onClose,
  caseToEdit,
  onSave,
  existingCourts
}) => {
  const isEditing = Boolean(caseToEdit);

  // Available court options (unique union of default and existing)
  const courtOptions = Array.from(new Set([...DEFAULT_COURTS, ...existingCourts])).filter(Boolean);

  // State for all 19 fields
  const [court, setCourt] = useState('');
  const [customCourt, setCustomCourt] = useState('');
  const [cch, setCch] = useState('');
  const [judge, setJudge] = useState('');
  const [cnr, setCnr] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [plaintiff1, setPlaintiff1] = useState('');
  const [plaintiff2, setPlaintiff2] = useState('');
  const [plaintiff3, setPlaintiff3] = useState('');
  const [defendant1, setDefendant1] = useState('URBAN STANDZ PRIVATE LIMITED');
  const [defendant2, setDefendant2] = useState('');
  const [defendant3, setDefendant3] = useState('');
  const [defendant4, setDefendant4] = useState('');
  const [advocate, setAdvocate] = useState('');
  const [status, setStatus] = useState<'Pending' | 'Disposed' | 'Stayed' | string>('Pending');
  const [stage, setStage] = useState('Summons');
  const [filingDate, setFilingDate] = useState('');
  const [nextHearing, setNextHearing] = useState('');
  const [lastBusiness, setLastBusiness] = useState('');
  const [linkedCase, setLinkedCase] = useState('');
  const [category, setCategory] = useState('Tenant vs Landlord & Urban Standz');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newLogDate, setNewLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [newLogText, setNewLogText] = useState('');

  // Load existing case data if editing
  useEffect(() => {
    if (caseToEdit) {
      if (courtOptions.includes(caseToEdit.court)) {
        setCourt(caseToEdit.court);
        setCustomCourt('');
      } else {
        setCourt('OTHER');
        setCustomCourt(caseToEdit.court);
      }
      setCch(caseToEdit.cch || '');
      setJudge(caseToEdit.judge || '');
      setCnr(caseToEdit.cnr || '');
      setRegistrationNumber(caseToEdit.registrationNumber || '');
      setPlaintiff1(caseToEdit.plaintiff1 || '');
      setPlaintiff2(caseToEdit.plaintiff2 || '');
      setPlaintiff3(caseToEdit.plaintiff3 || '');
      setDefendant1(caseToEdit.defendant1 || 'URBAN STANDZ PRIVATE LIMITED');
      setDefendant2(caseToEdit.defendant2 || '');
      setDefendant3(caseToEdit.defendant3 || '');
      setDefendant4(caseToEdit.defendant4 || '');
      setAdvocate(caseToEdit.advocate || '');
      setStatus(caseToEdit.status || 'Pending');
      setStage(caseToEdit.stage || 'Summons');
      setFilingDate(caseToEdit.filingDate || '');
      setNextHearing(caseToEdit.nextHearing || '');
      setLastBusiness(caseToEdit.lastBusiness || '');
      setLinkedCase(caseToEdit.linkedCase || '');
      setCategory(caseToEdit.category || 'Tenant vs Landlord & Urban Standz');
    } else {
      // Defaults for new case
      setCourt(DEFAULT_COURTS[0]);
      setCustomCourt('');
      setCch('');
      setJudge('ADDL CHIEF JUDICIAL MAGISTRATE');
      setCnr('');
      setRegistrationNumber('');
      setPlaintiff1('');
      setPlaintiff2('');
      setPlaintiff3('');
      setDefendant1('URBAN STANDZ PRIVATE LIMITED');
      setDefendant2('');
      setDefendant3('');
      setDefendant4('');
      setAdvocate('');
      setStatus('Pending');
      setStage('Summons');
      setFilingDate(new Date().toISOString().split('T')[0]);
      setNextHearing('');
      setLastBusiness('');
      setLinkedCase('');
      setCategory('Tenant vs Landlord & Urban Standz');
    }
  }, [caseToEdit]);

  const handleAppendHearingEntry = () => {
    if (!newLogText.trim()) return;
    const [year, month, day] = newLogDate.split('-');
    const dateFormatted = `${day}/${month}/${year}`;
    const newEntry = `${dateFormatted}: ${newLogText.trim()}`;
    setLastBusiness(prev => prev ? `${prev}\n${newEntry}` : newEntry);
    setNewLogText('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedCourt = court === 'OTHER' ? customCourt.trim() : court;
    if (!selectedCourt) {
      alert('Please specify a Court Name.');
      return;
    }
    if (!registrationNumber.trim()) {
      alert('Please enter a Registration Number.');
      return;
    }
    if (!plaintiff1.trim()) {
      alert('Plaintiff 1 is required.');
      return;
    }
    if (!defendant1.trim()) {
      alert('Defendant 1 is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Partial<CaseItem> = {
        id: caseToEdit?.id,
        serialNumber: caseToEdit?.serialNumber,
        court: selectedCourt,
        cch: cch.trim(),
        judge: judge.trim(),
        cnr: cnr.trim(),
        registrationNumber: registrationNumber.trim(),
        plaintiff1: plaintiff1.trim(),
        plaintiff2: plaintiff2.trim() || undefined,
        plaintiff3: plaintiff3.trim() || undefined,
        defendant1: defendant1.trim(),
        defendant2: defendant2.trim() || undefined,
        defendant3: defendant3.trim() || undefined,
        defendant4: defendant4.trim() || undefined,
        advocate: advocate.trim(),
        status,
        stage: stage.trim(),
        filingDate: filingDate.trim(),
        nextHearing: nextHearing.trim(),
        lastBusiness: lastBusiness.trim(),
        linkedCase: linkedCase.trim() || undefined,
        category
      };

      await onSave(payload);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to save case. Please check all fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-court-600/20 text-court-400 border border-court-500/30 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {isEditing ? `Edit Case: ${caseToEdit?.registrationNumber}` : 'Add New Court Case'}
              </h2>
              <p className="text-xs text-slate-400">
                Complete record tracking for Urban Standz legal proceedings
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

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          {/* Section 1: Court Information */}
          <div className="bg-slate-850/60 p-4 rounded-xl border border-slate-700/60 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-court-300 flex items-center gap-1.5 border-b border-slate-700/50 pb-2">
              <Building2 className="w-4 h-4 text-court-400" />
              1. Court & Bench Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Field 1: Court Name Dropdown */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Court Name <span className="text-court-400">*</span>
                </label>
                <select
                  value={court}
                  onChange={(e) => setCourt(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-court-500"
                >
                  {courtOptions.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value="OTHER">+ Other Court (Enter below)</option>
                </select>

                {court === 'OTHER' && (
                  <input
                    type="text"
                    required
                    placeholder="Enter court name..."
                    value={customCourt}
                    onChange={(e) => setCustomCourt(e.target.value)}
                    className="w-full mt-2 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-court-500"
                  />
                )}
              </div>

              {/* Field 2: CCH (Hall Number) */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  CCH (Hall Number)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1031-XIX, 17-CCH12"
                  value={cch}
                  onChange={(e) => setCch(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-court-500"
                />
              </div>

              {/* Field 3: Judge */}
              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Judge / Presiding Officer
                </label>
                <input
                  type="text"
                  placeholder="e.g. ADDL CHIEF JUDICIAL MAGISTRATE / ADDL. CITY CIVIL AND SESSIONS JUDGE"
                  value={judge}
                  onChange={(e) => setJudge(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-court-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Case Identifiers & Cross Links */}
          <div className="bg-slate-850/60 p-4 rounded-xl border border-slate-700/60 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-court-300 flex items-center gap-1.5 border-b border-slate-700/50 pb-2">
              <FileText className="w-4 h-4 text-court-400" />
              2. Case Numbers & Dates
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* Field 5: Registration Number */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Registration Number <span className="text-court-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. O.S./7280/2026, C.C./64822/2026"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-semibold focus:outline-none focus:border-court-500"
                />
              </div>

              {/* Field 4: CNR Number */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  CNR Number (eCourts)
                </label>
                <input
                  type="text"
                  placeholder="e.g. KABC030881802026"
                  value={cnr}
                  onChange={(e) => setCnr(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-court-500"
                />
              </div>

              {/* Field 16: Filing Date */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Filing Date
                </label>
                <input
                  type="date"
                  value={filingDate}
                  onChange={(e) => setFilingDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-court-500"
                />
              </div>

              {/* Field 17: Next Hearing */}
              <div>
                <label className="block text-xs font-medium text-amber-300 mb-1">
                  Next Hearing Date
                </label>
                <input
                  type="date"
                  value={nextHearing}
                  onChange={(e) => setNextHearing(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-amber-500/50 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Field 19: Linked Case */}
              <div className="sm:col-span-2 md:col-span-4">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Linked Case (Optional cross-suit or PCR converted case)
                </label>
                <input
                  type="text"
                  placeholder="e.g. O.S./5630/2026 or C.C./51095/2026"
                  value={linkedCase}
                  onChange={(e) => setLinkedCase(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-court-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Plaintiffs & Defendants */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Plaintiffs (Fields 6, 7, 8) */}
            <div className="bg-slate-850/60 p-4 rounded-xl border border-slate-700/60 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 border-b border-slate-700/50 pb-2">
                <User className="w-4 h-4" />
                Plaintiffs / Complainants
              </h3>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Plaintiff 1 <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Full name of primary complainant / plaintiff"
                  value={plaintiff1}
                  onChange={(e) => setPlaintiff1(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Plaintiff 2 (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Second plaintiff (if co-tenant/owner)"
                  value={plaintiff2}
                  onChange={(e) => setPlaintiff2(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-court-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Plaintiff 3 (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Third plaintiff"
                  value={plaintiff3}
                  onChange={(e) => setPlaintiff3(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-court-500"
                />
              </div>
            </div>

            {/* Defendants (Fields 9, 10, 11, 12) */}
            <div className="bg-slate-850/60 p-4 rounded-xl border border-slate-700/60 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5 border-b border-slate-700/50 pb-2">
                <Users className="w-4 h-4" />
                Defendants / Accused
              </h3>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Defendant 1 <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. URBAN STANDZ PRIVATE LIMITED"
                  value={defendant1}
                  onChange={(e) => setDefendant1(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Defendant 2 (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Landlord name / director / tenant"
                  value={defendant2}
                  onChange={(e) => setDefendant2(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-court-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Defendant 3 (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Third defendant"
                  value={defendant3}
                  onChange={(e) => setDefendant3(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-court-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Defendant 4 (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Fourth defendant"
                  value={defendant4}
                  onChange={(e) => setDefendant4(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-court-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Representation, Status & Stage */}
          <div className="bg-slate-850/60 p-4 rounded-xl border border-slate-700/60 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-court-300 flex items-center gap-1.5 border-b border-slate-700/50 pb-2">
              <Briefcase className="w-4 h-4 text-court-400" />
              3. Legal Counsel & Current Status
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* Field 13: Advocate Name */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Advocate Name
                </label>
                <input
                  type="text"
                  placeholder="Advocate representing plaintiff"
                  value={advocate}
                  onChange={(e) => setAdvocate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-court-500"
                />
              </div>

              {/* Field 14: Current Status */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Current Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-court-500"
                >
                  <option value="Pending">Pending (Ongoing)</option>
                  <option value="Disposed">Disposed / CC</option>
                  <option value="Stayed">Stayed</option>
                </select>
              </div>

              {/* Field 15: Stage */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Stage
                </label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-court-500"
                >
                  {DEFAULT_STAGES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Dispute Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-court-500"
                >
                  {DEFAULT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 5: Field 18 - Last Business (Court proceedings running status) */}
          <div className="bg-slate-850/60 p-4 rounded-xl border border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700/50 pb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-court-300 flex items-center gap-1.5">
                <History className="w-4 h-4 text-court-400" />
                4. Last Business (Court Business Running Log)
              </h3>
              <span className="text-[11px] text-slate-400">
                Records court business on each hearing date
              </span>
            </div>

            {/* Quick hearing entry append helper */}
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700/40 space-y-2">
              <span className="text-[11px] font-semibold text-slate-300 block">
                + Quick Append Hearing Entry:
              </span>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="date"
                  value={newLogDate}
                  onChange={(e) => setNewLogDate(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono shrink-0 sm:w-36"
                />
                <input
                  type="text"
                  placeholder="Order text e.g. 'Issue fresh summons to D1. Call on 28.11.2026.'"
                  value={newLogText}
                  onChange={(e) => setNewLogText(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500"
                />
                <button
                  type="button"
                  onClick={handleAppendHearingEntry}
                  className="px-3 py-1.5 bg-court-600 hover:bg-court-500 text-white rounded-lg text-xs font-medium shrink-0 flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Append</span>
                </button>
              </div>
            </div>

            {/* Full text area */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Full Running Court Business Log (Raw Text / Multi-line):
              </label>
              <textarea
                rows={5}
                value={lastBusiness}
                onChange={(e) => setLastBusiness(e.target.value)}
                placeholder="29/07/2026: Case is called out...&#10;31/08/2026: PO IS ON LEAVE. CALL ON."
                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-court-500 leading-relaxed"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
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
              className="flex items-center space-x-2 px-6 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving Case...' : isEditing ? 'Save Changes' : 'Create Case'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
