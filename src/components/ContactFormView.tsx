import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  User, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  FileText, 
  Loader2,
  Lock,
  Tag
} from 'lucide-react';
import { VictimItem } from '../types';
import { saveVictim } from '../services/victimService';

interface ContactFormViewProps {
  onVictimAdded: (newVictim: VictimItem) => void;
  onNavigateToVictims: () => void;
}

export const ContactFormView: React.FC<ContactFormViewProps> = ({
  onVictimAdded,
  onNavigateToVictims
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState('Tenant');
  const [subject, setSubject] = useState('Legal Coordination / Case Inquiry');
  const [firNumber, setFirNumber] = useState('');
  const [caseDetails, setCaseDetails] = useState('');
  const [area, setArea] = useState('');
  const [message, setMessage] = useState('');
  const [listInDirectory, setListInDirectory] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim() || !email.trim() || !message.trim()) {
      setErrorMessage('Please fill in your Name, Phone Number, Email ID, and Message.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // 1. Dispatch secure email to admin via serverless /api/contact without exposing admin's email to client
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          userType,
          subject: subject.trim(),
          firNumber: firNumber.trim() || undefined,
          caseDetails: caseDetails.trim() || undefined,
          message: message.trim()
        })
      });

      // 2. If visitor chose to list their case in the Victims Directory, record it cleanly without phone/email
      if (listInDirectory) {
        const victimData: Partial<VictimItem> = {
          name: name.trim(),
          role: (userType === 'Tenant' || userType === 'House Owner') ? userType : 'Tenant',
          firNumber: firNumber.trim() || undefined,
          caseDetails: caseDetails.trim() || undefined,
          area: area.trim() || undefined,
          comments: message.trim() || undefined,
          isVerified: true
        };
        const saved = await saveVictim(victimData);
        onVictimAdded(saved);
      }

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err?.message || 'An error occurred while sending your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setName('');
    setPhone('');
    setEmail('');
    setUserType('Tenant');
    setSubject('Legal Coordination / Case Inquiry');
    setFirNumber('');
    setCaseDetails('');
    setArea('');
    setMessage('');
    setListInDirectory(false);
    setIsSuccess(false);
    setErrorMessage(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm text-center sm:text-left">
        <div className="inline-flex items-center space-x-2 text-court-400 font-semibold text-xs mb-2">
          <Mail className="w-4 h-4" />
          <span>Confidential Communication</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Admin Contact
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
          Send a confidential message directly to the portal administrator and legal coordination team (Manoj Garg). Your message is securely routed to the administrator.
        </p>

        {/* Security / Privacy pill */}
        <div className="mt-4 inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
          <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Encrypted Server Relay • Administrator Email Kept Strictly Confidential</span>
        </div>
      </div>

      {/* Success State */}
      {isSuccess ? (
        <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-8 text-center space-y-5 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-xl font-bold text-white">Message Sent to Admin Successfully!</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your message has been securely delivered to the administrator. We have recorded your contact details and will get back to you shortly.
            </p>
            {listInDirectory && (
              <p className="text-xs text-emerald-300 font-medium pt-1">
                Your case summary has also been added to the Victims Directory.
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {listInDirectory && (
              <button
                onClick={onNavigateToVictims}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-court-600 hover:bg-court-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-court-600/30"
              >
                View in Victims Directory
              </button>
            )}
            <button
              onClick={handleReset}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
            >
              Send Another Message
            </button>
          </div>
        </div>
      ) : (
        /* Form Card */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-2 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {/* Full Name */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Your Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Anand Sharma"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-court-500"
                  required
                />
              </div>
            </div>

            {/* Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  Your Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98XXXXXXXX"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-court-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  Your Email ID *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-court-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Who Are You? */}
            <div>
              <label className="block font-semibold text-slate-300 mb-2">
                Who Are You? *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'Tenant', label: 'Tenant' },
                  { id: 'House Owner', label: 'House Owner' },
                  { id: 'Advocate', label: 'Advocate / Lawyer' },
                  { id: 'Media / Other', label: 'Media / Citizen' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setUserType(opt.id)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      userType === opt.id
                        ? 'bg-court-600/20 border-court-500 text-court-300 font-bold shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject / Topic */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Subject / Purpose of Contact *
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-white focus:outline-none focus:border-court-500"
                >
                  <option value="Legal Coordination / Case Inquiry">Legal Coordination & Joint Action</option>
                  <option value="Deposit Refund / Cheque Bounce">Deposit Refund / Cheque Bounce (Sec 138 NI Act)</option>
                  <option value="Eviction Threat / Injunction Inquiry">Eviction Threat / Injunction Inquiry</option>
                  <option value="FIR & Police Complaint Details">FIR & Police Complaint Sharing</option>
                  <option value="Media & Press Inquiry">Media & Press Inquiry</option>
                  <option value="General Question / Feedback">General Question / Feedback</option>
                </select>
              </div>
            </div>

            {/* Optional FIR & Case Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  FIR Number (Optional)
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={firNumber}
                    onChange={(e) => setFirNumber(e.target.value)}
                    placeholder="e.g. FIR 0342/2026, HSR Layout PS"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-court-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  Court Case Details (Optional)
                </label>
                <input
                  type="text"
                  value={caseDetails}
                  onChange={(e) => setCaseDetails(e.target.value)}
                  placeholder="e.g. O.S. 5965/2026 or CC 58978/2026"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-court-500"
                />
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Your Message / Details for Admin *
              </label>
              <div className="relative">
                <MessageSquare className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message here... You can describe your situation, property location, questions, or how you wish to coordinate."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-court-500"
                  required
                />
              </div>
            </div>

            {/* "Add me in Victim's Directory" Checkbox */}
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2.5">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={listInDirectory}
                  onChange={(e) => setListInDirectory(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-court-600 focus:ring-court-500 cursor-pointer"
                />
                <span className="text-sm font-semibold text-white">
                  Add me in Victim's Directory
                </span>
              </label>
              <p className="text-[11px] text-slate-400 pl-7 leading-relaxed">
                If checked, your name, role, and case dispute summary will be listed in the public Victims Directory. Your phone number and email will strictly remain confidential.
              </p>

              {listInDirectory && (
                <div className="pt-2 pl-7">
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="Your Locality / Area in Bengaluru (Optional, e.g. HSR Layout, BTM Layout, Tavarekere)"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-court-500"
                  />
                </div>
              )}
            </div>

            {/* Privacy Guarantee */}
            <div className="flex items-center space-x-2 text-[11px] text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Your communication is confidential. It is routed directly to the administrator's mailbox via secure backend relay.
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-6 rounded-xl bg-court-600 hover:bg-court-500 text-white font-bold text-sm transition-all shadow-lg shadow-court-600/30 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Message to Admin...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Message to Admin</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
