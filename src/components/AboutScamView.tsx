import React, { useState } from 'react';
import { 
  Building2, 
  AlertCircle, 
  FileWarning, 
  Scale, 
  HelpCircle, 
  CheckCircle2, 
  ExternalLink, 
  Users, 
  ChevronDown, 
  ChevronUp, 
  ShieldAlert, 
  Landmark, 
  Briefcase 
} from 'lucide-react';

export const AboutScamView: React.FC<{ onNavigateToContact: () => void }> = ({ onNavigateToContact }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "What is Urban Standz Private Limited and who is behind it?",
      a: "Urban Standz Private Limited (CIN: U68100KA2023PTC176604) was incorporated on 17 July 2023, registered in Bengaluru South (HSR Layout 1st Sector). Its key directors and promoters are Honne Gowda Nithin and Muniraju Madanraj. The company operated as a property management and sub-leasing firm across Bengaluru hotspots like HSR Layout, BTM Layout, Tavarekere, Koramangala, and Bellandur."
    },
    {
      q: "How did the scam work (Modus Operandi)?",
      a: "The company targeted two distinct parties simultaneously: (1) Property Owners were signed up with guaranteed monthly rental MOUs, offering hassle-free lease management; (2) Tenants (largely young IT professionals, students, and families) were enticed to pay huge lump-sum refundable security deposits (ranging from ₹3 Lakhs to ₹25 Lakhs per flat) or 1-2 years full advance rent under the promise of discounted monthly rent. After collecting crores in aggregate deposits, the company paid owners for only 1 or 2 months before abruptly stopping all payments, bouncing post-dated cheques, locking their offices, and going incommunicado."
    },
    {
      q: "What legal actions have victims taken?",
      a: "Over 83 cases are actively pending across Bengaluru Courts. House owners have filed Original Suits (O.S.) for eviction, arrears, and possession, as well as Criminal Complaints under Section 138 of the Negotiable Instruments Act for bounced cheques. Tenants have filed Original Suits for permanent injunctions against illegal eviction, and dozens of Police FIRs have been lodged under IPC Sections 420 (Cheating), 406 (Criminal Breach of Trust), and 120B (Criminal Conspiracy) across HSR Layout, SG Palya, Madiwala, and Bellandur police stations."
    },
    {
      q: "Can a property owner forcefully evict a tenant or cut electricity/water?",
      a: "No. Under established Supreme Court precedents and the Karnataka Rent Act, no tenant can be dispossessed without due process of law. Several benches of the Bengaluru City Civil Court (e.g. CCH-23 in O.S. 5965/2026 and O.S. 5916/2026) have granted ad-interim temporary injunctions restraining landlords and third parties from forcefully interfering with the tenant's peaceful possession."
    },
    {
      q: "Why should Tenants and House Owners collaborate rather than fight each other?",
      a: "Both the tenant and the landlord are victims of the same organized financial fraud perpetrated by Urban Standz management. Fighting each other in court wastes resources and shields the absconding perpetrators. Coordinating legal strategies allows joint petitions to the police, Central Crime Branch (CCB), and civil courts for urgent attachment of the company's and directors' bank accounts and personal assets."
    }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-court-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-court-500/10 border border-court-500/30 text-court-300 text-xs font-semibold mb-4">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Comprehensive Investigation & Legal Briefing</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            The Urban Standz Real Estate & Rental Deposit Scam
          </h1>
          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            A systemic multi-crore rental fraud executed across Bengaluru, trapping hundreds of tenants and house owners in complex civil and criminal litigation.
          </p>
        </div>
      </div>

      {/* Fast Facts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <Building2 className="w-4 h-4 text-court-400" />
            <span>Corporate Entity</span>
          </div>
          <p className="text-base font-bold text-white leading-snug">Urban Standz Pvt Ltd</p>
          <p className="text-xs text-slate-400 mt-1">CIN: U68100KA2023PTC176604</p>
          <p className="text-[11px] text-slate-400">Inc: 17 July 2023 • RoC Bangalore</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <Briefcase className="w-4 h-4 text-amber-400" />
            <span>Key Promoters</span>
          </div>
          <p className="text-base font-bold text-white leading-snug">Nithin Honnegowda</p>
          <p className="text-sm font-semibold text-slate-200">Muniraju Madanraj</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Named in 80+ Suits & FIRs</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <Landmark className="w-4 h-4 text-emerald-400" />
            <span>Registered Office</span>
          </div>
          <p className="text-sm font-bold text-white leading-snug">#1018/A, 1st Sector</p>
          <p className="text-xs text-slate-300">HSR Layout, Bengaluru - 560102</p>
          <p className="text-[11px] text-rose-400 mt-0.5">Office locked / vacated</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>Estimated Impact</span>
          </div>
          <p className="text-base font-bold text-white leading-snug">₹10+ Crores Fraud</p>
          <p className="text-xs text-slate-300">500+ Affected Victims</p>
          <p className="text-[11px] text-court-300 mt-0.5">83 Active Court Proceedings</p>
        </div>
      </div>

      {/* Modus Operandi Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
          <div className="p-2.5 rounded-xl bg-court-600/20 text-court-400 border border-court-500/30">
            <FileWarning className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">How The Scam Was Executed (Modus Operandi)</h2>
            <p className="text-xs text-slate-400">Step-by-step breakdown of the rental sub-lease fraud</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center space-x-2 text-court-400 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-court-500/20 flex items-center justify-center text-xs">1</span>
              <span>Luring Property Owners with Guaranteed Rental MOUs</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Urban Standz agents approached homeowners across HSR Layout, Koramangala, BTM Layout, and Bellandur offering hassle-free long-term sub-lease contracts. They promised timely fixed monthly payouts, maintenance guarantees, and furnished improvements, signing Master Sub-Lease MOUs with nominal security deposits.
            </p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-xs">2</span>
              <span>Extracting Heavy Lump-Sum Deposits from Tenants</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Simultaneously, the company advertised the properties on portals and social media at discounted rents, contingent upon tenants paying massive upfront deposits ranging from ₹3,00,000 to ₹25,00,000, or paying 11 to 24 months of advance rent upfront via direct bank transfers.
            </p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center text-xs">3</span>
              <span>Siphoning Capital & Defaulting on Owner Rents</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              After collecting crores in tenant deposits, Urban Standz paid rent to homeowners for merely 1 or 2 months. Subsequently, all monthly transfers stopped. Cheques given to owners bounced with bank endorsements like "Funds Insufficient" and "Account Frozen".
            </p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center space-x-2 text-purple-400 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">4</span>
              <span>Office Closure, Eviction Clashes & Mass Litigation</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Directors locked their premises in HSR Layout and SG Palya and went untraceable. Unpaid property owners attempted to evict tenants or lock gates, while tenants holding valid lease agreements and unreturned life savings sought police protection and civil court injunctions.
            </p>
          </div>
        </div>
      </div>

      {/* Legal Provisions Applicable */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
          <div className="p-2.5 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Legal Framework & Key Sections</h2>
            <p className="text-xs text-slate-400">Applicable statutes in the civil and criminal proceedings</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
              Criminal Penal Law
            </span>
            <p className="font-semibold text-white mt-1">IPC Sections 420, 406 & 120B</p>
            <p className="text-slate-400 leading-relaxed">
              Cheating, criminal breach of trust, and criminal conspiracy to misappropriate public funds under disguise of real estate management.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              Banking & Cheque Dishonour
            </span>
            <p className="font-semibold text-white mt-1">Section 138 NI Act</p>
            <p className="text-slate-400 leading-relaxed">
              Criminal proceedings before the Chief Judicial Magistrate (CJM) for dishonour of cheques issued towards guaranteed rent and refunds.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
            <span className="px-2 py-0.5 rounded bg-court-500/20 text-court-300 font-bold border border-court-500/30">
              Civil Protection
            </span>
            <p className="font-semibold text-white mt-1">CPC Order 39 & Order 5 Rule 20</p>
            <p className="text-slate-400 leading-relaxed">
              Temporary injunctions preventing unlawful eviction, and substituted service by newspaper publication against absconding management.
            </p>
          </div>
        </div>
      </div>

      {/* Guidance for Affected Parties */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-court-400" />
          <span>Recommended Action Steps for Victims</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h3 className="font-bold text-sm text-court-300">If You Are a Tenant:</h3>
            <ul className="space-y-2 text-slate-300 list-disc list-inside leading-relaxed">
              <li>Gather all bank transfer proofs, rental agreements, payment receipts, and communications with Urban Standz.</li>
              <li>File a formal police complaint with cyber/economic offenses wing or your local jurisdiction police station.</li>
              <li>If facing harassment or threats of illegal disconnection of utilities, seek an urgent temporary injunction (O.S.) from City Civil Court.</li>
              <li>Do not vacate without written legal protection or escrow arrangement for your deposit.</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h3 className="font-bold text-sm text-amber-300">If You Are a House Owner:</h3>
            <ul className="space-y-2 text-slate-300 list-disc list-inside leading-relaxed">
              <li>Issue statutory demand notice under Section 138 of the NI Act within 30 days of any cheque return memo.</li>
              <li>Terminate the Master Lease Agreement in writing to Urban Standz citing fundamental breach of contract.</li>
              <li>Do not take law into your hands by cutting electricity or locking doors; follow civil court procedures (O.S. for possession & arrears).</li>
              <li>Join hands with the tenant to jointly demand police action and bank account freezing against the directors.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex items-center space-x-2 text-white font-bold text-xl mb-2">
          <HelpCircle className="w-6 h-6 text-court-400" />
          <span>Frequently Asked Questions</span>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-slate-800 rounded-2xl bg-slate-950/50 overflow-hidden transition-colors"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full flex items-center justify-between p-4 text-left text-sm font-semibold text-white hover:text-court-300 transition-colors"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-court-400 shrink-0 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                )}
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-slate-850 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-court-900/80 to-slate-900 border border-court-700/50 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-xl">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white">Have You Been Defrauded by Urban Standz?</h3>
          <p className="text-xs text-slate-300 max-w-xl">
            Register your case details in the Victims Directory to connect with affected tenants and homeowners fighting the same battle.
          </p>
        </div>
        <button
          onClick={onNavigateToContact}
          className="px-5 py-2.5 rounded-xl bg-court-600 hover:bg-court-500 text-white font-semibold text-xs transition-all shadow-lg shadow-court-600/30 shrink-0"
        >
          Register Case in Directory
        </button>
      </div>
    </div>
  );
};
