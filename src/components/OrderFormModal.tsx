import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { CourtOrder, CaseItem } from '../types';

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: Partial<CourtOrder>) => Promise<void>;
  orderToEdit?: CourtOrder | null;
  cases: CaseItem[];
}

export const OrderFormModal: React.FC<OrderFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  orderToEdit,
  cases
}) => {
  const [title, setTitle] = useState('');
  const [caseRegistrationNumber, setCaseRegistrationNumber] = useState('');
  const [court, setCourt] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [orderType, setOrderType] = useState('Interim Injunction');
  const [parties, setParties] = useState('');
  const [judge, setJudge] = useState('');
  const [orderSummary, setOrderSummary] = useState('');
  const [fullText, setFullText] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfFileName, setPdfFileName] = useState('');
  const [pdfFileSize, setPdfFileSize] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderToEdit) {
      setTitle(orderToEdit.title || '');
      setCaseRegistrationNumber(orderToEdit.caseRegistrationNumber || '');
      setCourt(orderToEdit.court || '');
      setOrderDate(orderToEdit.orderDate || '');
      setOrderType(orderToEdit.orderType || 'Interim Injunction');
      setParties(orderToEdit.parties || '');
      setJudge(orderToEdit.judge || '');
      setOrderSummary(orderToEdit.orderSummary || '');
      setFullText(orderToEdit.fullText || '');
      setPdfUrl(orderToEdit.pdfUrl || '');
      setPdfFileName(orderToEdit.pdfFileName || '');
      setPdfFileSize(orderToEdit.pdfFileSize || '');
    } else {
      setTitle('');
      setCaseRegistrationNumber('');
      setCourt('City Civil Court, Bengaluru');
      setOrderDate(new Date().toISOString().split('T')[0]);
      setOrderType('Interim Injunction');
      setParties('');
      setJudge('');
      setOrderSummary('');
      setFullText('');
      setPdfUrl('');
      setPdfFileName('');
      setPdfFileSize('');
    }
    setError(null);
  }, [orderToEdit, isOpen]);

  // Handle case selection auto-fill
  const handleCaseSelect = (regNo: string) => {
    setCaseRegistrationNumber(regNo);
    const selectedCase = cases.find(c => c.registrationNumber === regNo);
    if (selectedCase) {
      if (!court || court === 'City Civil Court, Bengaluru') {
        setCourt(selectedCase.court || 'City Civil Court, Bengaluru');
      }
      if (!parties) {
        setParties(`${selectedCase.plaintiff1} vs ${selectedCase.defendant1}`);
      }
      if (!judge && selectedCase.judge) {
        setJudge(selectedCase.judge);
      }
    }
  };

  // Handle PDF file upload via FileReader
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a valid PDF document (.pdf)');
      return;
    }

    // Limit to 15MB for local storage safety
    if (file.size > 15 * 1024 * 1024) {
      setError('PDF file size exceeds 15MB limit. Please upload a smaller file or link an external URL.');
      return;
    }

    const fileSizeStr = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    setPdfFileName(file.name);
    setPdfFileSize(fileSizeStr);
    setError(null);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPdfUrl(reader.result);
      }
    };
    reader.onerror = () => {
      setError('Failed to read the PDF file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !caseRegistrationNumber.trim() || !orderSummary.trim()) {
      setError('Title, Case Registration Number, and Order Summary are required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSave({
        id: orderToEdit?.id,
        title: title.trim(),
        caseRegistrationNumber: caseRegistrationNumber.trim(),
        court: court.trim(),
        orderDate,
        orderType,
        parties: parties.trim(),
        judge: judge.trim(),
        orderSummary: orderSummary.trim(),
        fullText: fullText.trim(),
        pdfUrl: pdfUrl.trim() || undefined,
        pdfFileName: pdfFileName || undefined,
        pdfFileSize: pdfFileSize || undefined,
        createdAt: orderToEdit?.createdAt || new Date().toISOString()
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save order');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 text-white shadow-2xl my-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-court-600/20 text-court-400 border border-court-500/30">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {orderToEdit ? 'Edit Court Order / Judgment' : 'Upload Court Order / Judgment (PDF)'}
              </h2>
              <p className="text-xs text-slate-400">
                Add official court rulings, interim injunctions, and order sheets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Title */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Order Title / Heading *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Ad-Interim Temporary Injunction Order under Order 39 CPC"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-court-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Case Registration Number */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Case Registration Number *
              </label>
              <input
                type="text"
                value={caseRegistrationNumber}
                onChange={(e) => setCaseRegistrationNumber(e.target.value)}
                placeholder="e.g. O.S./5965/2026"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-court-500"
                required
              />
              {cases.length > 0 && (
                <div className="mt-1">
                  <select
                    onChange={(e) => handleCaseSelect(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800/80 rounded-lg px-2 py-1 text-[11px] text-slate-400"
                    defaultValue=""
                  >
                    <option value="" disabled>-- Or Select Known Case to Auto-Fill --</option>
                    {cases.slice(0, 30).map(c => (
                      <option key={c.id} value={c.registrationNumber}>
                        {c.registrationNumber} ({c.court})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Order Type */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Order Type / Classification *
              </label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-court-500"
              >
                <option value="Interim Injunction">Interim Injunction (Order 39 CPC)</option>
                <option value="Status Quo">Status Quo Order</option>
                <option value="Suit Summons">Suit Summons & Notice</option>
                <option value="Paper Publication">Paper Publication Order (Order 5 Rule 20)</option>
                <option value="Warrant / SS">Bailable / Criminal Warrant / SS</option>
                <option value="Final Judgment">Final Judgment / Decree</option>
                <option value="Daily Order Sheet">Daily Order Sheet Extract</option>
                <option value="Other">Other Order</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Court */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Court Name *
              </label>
              <input
                type="text"
                value={court}
                onChange={(e) => setCourt(e.target.value)}
                placeholder="e.g. City Civil Court, Bengaluru (CCH-23)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-court-500"
                required
              />
            </div>

            {/* Order Date */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Order Date *
              </label>
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-court-500"
                required
              />
            </div>
          </div>

          {/* Parties & Judge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Parties (Plaintiff vs Defendant)
              </label>
              <input
                type="text"
                value={parties}
                onChange={(e) => setParties(e.target.value)}
                placeholder="e.g. Tenant Plaintiff vs Urban Standz Pvt Ltd & Owner"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-court-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Presiding Judge / CCH
              </label>
              <input
                type="text"
                value={judge}
                onChange={(e) => setJudge(e.target.value)}
                placeholder="e.g. XXIX Additional City Civil Judge"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-court-500"
              />
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Order Summary / Key Relief Granted *
            </label>
            <textarea
              rows={2}
              value={orderSummary}
              onChange={(e) => setOrderSummary(e.target.value)}
              placeholder="e.g. Granted ad-interim temporary injunction restraining defendants from interfering or dispossessing tenant except by due process."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-court-500"
              required
            />
          </div>

          {/* Full Text / Order Sheet Transcript */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Full Order Text / Daily Business Extract
            </label>
            <textarea
              rows={3}
              value={fullText}
              onChange={(e) => setFullText(e.target.value)}
              placeholder="Paste exact order text from court order sheet or certified copy..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-[11px] placeholder-slate-500 focus:outline-none focus:border-court-500"
            />
          </div>

          {/* PDF Upload Section */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300 flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-court-400" />
                <span>Upload PDF File (Certified Copy / Order Sheet)</span>
              </span>
              {pdfFileName && (
                <span className="text-[11px] text-emerald-400 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>PDF Attached</span>
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <label className="w-full sm:w-auto px-4 py-2 rounded-xl bg-court-600 hover:bg-court-500 text-white font-semibold cursor-pointer text-center transition-colors flex items-center justify-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>Choose PDF File</span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <span className="text-slate-500 text-[11px]">or enter online PDF URL below</span>
            </div>

            {pdfFileName ? (
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-700 text-xs">
                <div className="truncate pr-2">
                  <span className="text-white font-medium">{pdfFileName}</span>
                  {pdfFileSize && <span className="text-slate-400 ml-2">({pdfFileSize})</span>}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPdfUrl('');
                    setPdfFileName('');
                    setPdfFileSize('');
                  }}
                  className="text-rose-400 hover:text-rose-300 text-xs"
                >
                  Remove
                </button>
              </div>
            ) : (
              <input
                type="url"
                value={pdfUrl.startsWith('data:') ? '' : pdfUrl}
                onChange={(e) => {
                  setPdfUrl(e.target.value);
                  if (e.target.value) {
                    setPdfFileName('Online Document');
                  }
                }}
                placeholder="https://example.com/order-sheet.pdf"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white placeholder-slate-600 focus:outline-none focus:border-court-500 text-xs"
              />
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-court-600 hover:bg-court-500 text-white font-semibold shadow-lg shadow-court-600/30 transition-all flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : orderToEdit ? 'Update Order' : 'Upload Order'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
