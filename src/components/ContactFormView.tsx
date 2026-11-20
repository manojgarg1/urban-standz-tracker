import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  User, 
  Home, 
  FileText, 
  Scale, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ArrowRight,
  Loader2
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
  const [role, setRole] = useState<'Tenant' | 'House Owner' | 'Both'>('Tenant');
  const [firNumber, setFirNumber] = useState('');
  const [caseDetails, setCaseDetails] = useState('');
  const [area, setArea] = useState('');
  const [comments, setComments] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim() || !email.trim()) {
      setErrorMessage('Please fill in your Name, Phone Number, and Email ID.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const victimData: Partial<VictimItem> = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      role,
      firNumber: firNumber.trim() || undefined,
      caseDetails: caseDetails.trim() || undefined,
      area: area.trim() || undefined,
      comments: comments.trim() || undefined,
      isVerified: true
    };

    try {
      // 1. Immediately copy & save to Victims Directory
      const saved = await saveVictim(victimData);
      onVictimAdded(saved);

      // 2. Dispatch secure server-side email without exposing admin email to the client
      try {
        await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim(),
            role,
            firNumber: firNumber.trim(),
            caseDetails: caseDetails.trim(),
            area: area.trim(),
            comments: comments.trim()
          })
        });
      } catch (networkErr) {
        // Even if network/serverless function fails, the victim is already saved in Victims Directory!
        console.warn('Server contact dispatch note:', networkErr);
      }

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err?.message || 'An error occurred while submitting your details. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setName('');
    setPhone('');
    setEmail('');
    setRole('Tenant');
    setFirNumber('');
    setCaseDetails('');
    setArea('');
    setComments('');
    setIsSuccess(false);
    setErrorMessage(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm text-center sm:text-left">
        <div className="inline-flex items-center space-x-2 text-court-400 font-semibold text-xs mb-2">
          <Mail className="w-4 h-4" />
          <span>Victim Intake & Coordination Form</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Join the Collective Legal Action
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
          Whether you are a tenant who paid an unreturned deposit or a house owner facing defaulted rent, submit your details below. Your submission will be recorded in the Victims Directory and forwarded to our legal coordination team.
        </p>
      </div>

      {/* Success State */}
      {isSuccess ? (
        <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-8 text-center space-y-5 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-xl font-bold text-white">Details Successfully Submitted!</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your details have been automatically registered into the <strong className="text-emerald-300">Victims Directory</strong> and forwarded securely to the legal coordination team.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onNavigateToVictims}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-court-600 hover:bg-court-500 text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-court-600/30"
            >
              <span>View In Victims Directory</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
            >
              Submit Another Case
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
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-court-500"
                  required
                />
              </div>
            </div>

            {/* Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  Phone Number *
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
                  Email ID *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-court-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Are you a Tenant or House Owner? */}
            <div>
              <label className="block font-semibold text-slate-300 mb-2">
                Are you a Tenant or House Owner? *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['Tenant', 'House Owner', 'Both'] as const).map(option => (
                  <label
                    key={option}
                    className={`flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${
                      role === option
                        ? 'bg-court-600/20 border-court-500 text-court-300 font-bold shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={option}
                      checked={role === option}
                      onChange={() => setRole(option)}
                      className="hidden"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Area / Locality */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Area / Locality in Bengaluru
              </label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. HSR Layout Sector 1, BTM Layout, Tavarekere, Bellandur"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-court-500"
              />
            </div>

            {/* FIR Number */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                FIR Number (if any)
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={firNumber}
                  onChange={(e) => setFirNumber(e.target.value)}
                  placeholder="e.g. FIR No. 0342/2026, HSR Layout Police Station"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-court-500"
                />
              </div>
            </div>

            {/* Court Case Details */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Court Case details (PCR / CC / OS Number, Court, Case Number)
              </label>
              <div className="relative">
                <Scale className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <textarea
                  rows={2}
                  value={caseDetails}
                  onChange={(e) => setCaseDetails(e.target.value)}
                  placeholder="e.g. O.S. 5965/2026 at City Civil Court (CCH-23) or C.C. 58978/2026 at CJM Court"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-court-500"
                />
              </div>
            </div>

            {/* Comments / Details of Loss */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Comments / Description of Dispute & Loss Amount
              </label>
              <div className="relative">
                <MessageSquare className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <textarea
                  rows={3}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Briefly state your loss amount, agreement date, how payments were defaulted, or any immediate threats..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-court-500"
                />
              </div>
            </div>

            {/* Privacy Promise */}
            <div className="flex items-center space-x-2 text-[11px] text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Your privacy is respected. Contact details are masked in public views and shared only for mutual legal coordination.
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-6 rounded-xl bg-court-600 hover:bg-court-500 text-white font-bold text-sm transition-all shadow-lg shadow-court-600/30 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting & Registering...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Details</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
