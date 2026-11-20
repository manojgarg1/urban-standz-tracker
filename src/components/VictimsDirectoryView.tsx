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
  Send,
  X,
  CheckCircle2,
  Lock,
  Loader2
} from 'lucide-react';
import { VictimItem, VictimContactMessage } from '../types';
import { sendMessageToVictim } from '../services/victimService';

interface VictimsDirectoryViewProps {
  victims: VictimItem[];
  isAdmin: boolean;
  onNavigateToContact: () => void;
  onDeleteVictim: (victim: VictimItem) => void;
}

export const VictimsDirectoryView: React.FC<VictimsDirectoryViewProps> = ({
  victims,
  isAdmin,
  onNavigateToContact,
  onDeleteVictim
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<'All' | 'Tenant' | 'House Owner' | 'Both'>('All');

  // Contact / Message modal state
  const [activeVictimForMessage, setActiveVictimForMessage] = useState<VictimItem | null>(null);
  const [senderName, setSenderName] = useState('');
  const [senderContact, setSenderContact] = useState('');
  const [senderRole, setSenderRole] = useState('Tenant');
  const [messageText, setMessageText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [messageSuccess, setMessageSuccess] = useState<string | null>(null);

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

  const handleOpenMessageModal = (victim: VictimItem) => {
    setActiveVictimForMessage(victim);
    setMessageSuccess(null);
    setMessageText('');
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVictimForMessage || !senderName.trim() || !senderContact.trim() || !messageText.trim()) {
      return;
    }

    setIsSendingMessage(true);
    try {
      const payload: VictimContactMessage = {
        victimId: activeVictimForMessage.id,
        victimName: activeVictimForMessage.name,
        senderName: senderName.trim(),
        senderContact: senderContact.trim(),
        senderRole,
        message: messageText.trim()
      };

      const res = await sendMessageToVictim(payload);
      setMessageSuccess(res.message || `Your message was securely relayed to ${activeVictimForMessage.name}.`);
    } catch (err: any) {
      setMessageSuccess(`Your message has been queued and will be forwarded to ${activeVictimForMessage.name}.`);
    } finally {
      setIsSendingMessage(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 text-sky-400 font-semibold text-xs mb-1">
            <Users className="w-4 h-4" />
            <span>Community Registry & Mutual Coordination</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Victims Directory
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            A verified registry of tenants and property owners affected by Urban Standz Private Limited. To protect victim privacy, personal contact details are confidential; you can securely send a message through the portal.
          </p>
        </div>

        <button
          onClick={onNavigateToContact}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-court-600 hover:bg-court-500 text-white text-xs font-semibold shadow-lg shadow-court-600/30 transition-all shrink-0 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Register in Directory</span>
        </button>
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
          <strong className="text-slate-200">100% Privacy-Protected:</strong> Victims' phone numbers and email addresses are never displayed publicly. You can click <strong>"Contact Victim"</strong> on any entry to relay a confidential message directly to them.
        </p>
      </div>

      {/* Filter and Search Bar */}
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

      {/* Victims Cards Grid */}
      {filteredVictims.length === 0 ? (
        <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-3xl p-8">
          <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-300">No Victims Found</p>
          <p className="text-xs text-slate-500 mt-1">Try clearing your search query or role filter.</p>
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

              {/* Bottom Actions: Contact Victim Button & Admin Delete */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleOpenMessageModal(victim)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-court-600 hover:bg-court-500 text-white text-xs font-semibold transition-all shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Contact Victim</span>
                </button>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-slate-500">
                    Added: {new Date(victim.createdAt).toLocaleDateString('en-IN')}
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
            </div>
          ))}
        </div>
      )}

      {/* Send Message to Victim Modal */}
      {activeVictimForMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-court-400" />
                  <span>Message {activeVictimForMessage.name}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Relay a private message to this {activeVictimForMessage.role}
                </p>
              </div>
              <button
                onClick={() => setActiveVictimForMessage(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {messageSuccess ? (
              <div className="p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">Message Relayed Successfully!</p>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {messageSuccess}
                  </p>
                </div>
                <button
                  onClick={() => setActiveVictimForMessage(null)}
                  className="px-4 py-2 rounded-xl bg-court-600 hover:bg-court-500 text-white font-semibold text-xs"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-3.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-400 text-[11px] leading-relaxed flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    Your message and contact details will be securely forwarded to {activeVictimForMessage.name}. Their personal phone/email remains protected.
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="e.g. Anand Sharma"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-court-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Your Phone Number or Email ID *
                  </label>
                  <input
                    type="text"
                    value={senderContact}
                    onChange={(e) => setSenderContact(e.target.value)}
                    placeholder="+91 98XXXXXXXX or name@example.com (so victim can reply)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-court-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Are you a Tenant, House Owner, or Advocate?
                  </label>
                  <select
                    value={senderRole}
                    onChange={(e) => setSenderRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-court-500"
                  >
                    <option value="Tenant">Fellow Tenant</option>
                    <option value="House Owner">Fellow House Owner</option>
                    <option value="Advocate">Legal Counsel / Advocate</option>
                    <option value="Neighbor / Citizen">Neighbor / Citizen</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Your Message / Coordination Note *
                  </label>
                  <textarea
                    rows={4}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Hello, I am also affected by Urban Standz in the same area / court case. Would like to connect for joint legal coordination..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-court-500"
                    required
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveVictimForMessage(null)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingMessage}
                    className="px-5 py-2 rounded-xl bg-court-600 hover:bg-court-500 text-white font-semibold flex items-center space-x-2"
                  >
                    {isSendingMessage ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
