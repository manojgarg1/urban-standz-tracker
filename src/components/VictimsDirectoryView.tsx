import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  MapPin, 
  FileText, 
  Scale, 
  PlusCircle, 
  Trash2, 
  MessageSquare,
  Lock,
  ArrowRight
} from 'lucide-react';
import { VictimItem } from '../types';

interface VictimsDirectoryViewProps {
  victims: VictimItem[];
  isAdmin: boolean;
  onNavigateToContact: () => void;
  onDeleteVictim: (victim: VictimItem) => void;
  onClearAllVictims?: () => void;
}

export const VictimsDirectoryView: React.FC<VictimsDirectoryViewProps> = ({
  victims,
  isAdmin,
  onNavigateToContact,
  onDeleteVictim,
  onClearAllVictims
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<'All' | 'Tenant' | 'House Owner' | 'Both'>('All');

  // Filtered victims
  const filteredVictims = useMemo(() => {
    return victims.filter(v => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const fullTarget = [
          v.name,
          v.role,
          v.firNumber,
          v.caseDetails,
          v.area,
          v.comments
        ].filter(Boolean).join(' ').toLowerCase();

        if (!fullTarget.includes(q)) return false;
      }

      if (selectedRole !== 'All' && v.role !== selectedRole) {
        return false;
      }

      return true;
    });
  }, [victims, searchQuery, selectedRole]);

  const tenantsCount = useMemo(() => victims.filter(v => v.role === 'Tenant' || v.role === 'Both').length, [victims]);
  const ownersCount = useMemo(() => victims.filter(v => v.role === 'House Owner' || v.role === 'Both').length, [victims]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 text-sky-400 font-semibold text-xs mb-1">
            <Users className="w-4 h-4" />
            <span>Community Registry</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Victims Directory
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            A registry of tenants and property owners affected by Urban Standz Private Limited. To protect victim privacy, contact details are kept strictly confidential.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0 self-start sm:self-auto">
          {isAdmin && victims.length > 0 && onClearAllVictims && (
            <button
              onClick={() => {
                if (confirm('Are you sure you want to remove ALL victim records from the directory?')) {
                  onClearAllVictims();
                }
              }}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 text-xs font-semibold transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Directory</span>
            </button>
          )}

          <button
            onClick={onNavigateToContact}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-court-600 hover:bg-court-500 text-white text-xs font-semibold shadow-lg shadow-court-600/30 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Admin Contact Form</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
          <p className="text-xl font-bold text-white">{victims.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Total Victims Registered</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
          <p className="text-xl font-bold text-court-400">{tenantsCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Tenants</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
          <p className="text-xl font-bold text-amber-400">{ownersCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">House Owners</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
          <p className="text-xl font-bold text-emerald-400">
            {victims.filter(v => Boolean(v.firNumber || v.caseDetails)).length}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">With FIR / Court Case</p>
        </div>
      </div>

      {/* Privacy Notice Banner */}
      <div className="bg-slate-900/60 border border-slate-800/80 px-4 py-3 rounded-2xl text-xs text-slate-300 flex items-center space-x-3">
        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
          <Lock className="w-4 h-4" />
        </div>
        <p className="text-slate-400 leading-relaxed text-[11px]">
          <strong className="text-slate-200">Privacy Safeguard:</strong> Personal phone numbers and email addresses are never displayed in the public directory. Only verified case dispute summaries, FIR numbers, and court references are shared for collective awareness.
        </p>
      </div>

      {/* Filter and Search Bar (shown when entries exist) */}
      {victims.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search victims by name, area, FIR number, court case details..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-court-500"
              />
            </div>

            <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
              {(['All', 'Tenant', 'House Owner', 'Both'] as const).map(role => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedRole === role
                      ? 'bg-court-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {role === 'All' ? 'All Roles' : role}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>Showing {filteredVictims.length} of {victims.length} victims</span>
            {(searchQuery || selectedRole !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedRole('All');
                }}
                className="text-court-400 hover:underline"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Victims Cards Grid */}
      {filteredVictims.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/80 text-slate-500 flex items-center justify-center mx-auto border border-slate-700/60">
            <Users className="w-8 h-8 text-court-400/60" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base font-bold text-white">Victim's Directory is Empty</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No entries are currently listed. When sending a message to the Admin, check <strong>"Add me in Victim's Directory"</strong> to have your case dispute summary listed here for mutual awareness.
            </p>
          </div>
          <button
            onClick={onNavigateToContact}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-court-600 hover:bg-court-500 text-white text-xs font-semibold shadow-lg shadow-court-600/30 transition-all cursor-pointer"
          >
            <span>Go to Admin Contact Form</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredVictims.map(victim => (
            <div
              key={victim.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all space-y-3.5 shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Top Row: Name, Badge, Verified */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-bold text-white">{victim.name}</h3>
                      {victim.isVerified && (
                        <span title="Verified Victim Submission">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        </span>
                      )}
                    </div>
                    {victim.area && (
                      <p className="text-xs text-slate-400 flex items-center space-x-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{victim.area}</span>
                      </p>
                    )}
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border shrink-0 ${
                      victim.role === 'Tenant'
                        ? 'bg-court-500/20 text-court-300 border-court-500/30'
                        : victim.role === 'House Owner'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                    }`}
                  >
                    {victim.role}
                  </span>
                </div>

                {/* Case & FIR Details */}
                {(victim.firNumber || victim.caseDetails) && (
                  <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 space-y-1.5 text-xs">
                    {victim.firNumber && (
                      <div className="flex items-start space-x-2">
                        <FileText className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-slate-400 font-medium">FIR: </span>
                          <span className="text-slate-200 font-semibold">{victim.firNumber}</span>
                        </div>
                      </div>
                    )}
                    {victim.caseDetails && (
                      <div className="flex items-start space-x-2">
                        <Scale className="w-3.5 h-3.5 text-court-400 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-slate-400 font-medium">Court Case: </span>
                          <span className="text-slate-200 font-semibold">{victim.caseDetails}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Comments / Description */}
                {victim.comments && (
                  <div className="text-xs text-slate-300 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 leading-relaxed">
                    <p className="text-slate-400 text-[10px] uppercase font-semibold tracking-wider mb-1 flex items-center space-x-1">
                      <MessageSquare className="w-3 h-3" />
                      <span>Case Details / Dispute</span>
                    </p>
                    <p>{victim.comments}</p>
                  </div>
                )}
              </div>

              {/* Bottom Row: Date & Admin Delete */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Registered: {new Date(victim.createdAt).toLocaleDateString('en-IN')}
                </span>

                {isAdmin && (
                  <button
                    onClick={() => onDeleteVictim(victim)}
                    className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-950/40"
                    title="Delete victim entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
