import React, { useState } from 'react';
import { X, Lock, KeyRound, ShieldAlert } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const authorizedPass = localStorage.getItem('urban_standz_admin_pass') || 'Manoj070371@@';
    
    if (passcode.trim() === authorizedPass) {
      setError(false);
      onLoginSuccess();
      onClose();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-court-600/20 text-court-400 border border-court-500/30 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">Admin Authentication</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-slate-400 leading-relaxed">
            Public visitors have full read-only access to view cases, calendars, and timelines. Enter the admin passcode to add new cases, edit records, or update hearing logs.
          </p>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-court-400" />
              Admin Passcode
            </label>
            <input
              type="password"
              autoFocus
              required
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                if (error) setError(false);
              }}
              placeholder="Enter admin passcode"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-court-500"
            />
            {error && (
              <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                Incorrect passcode. Access denied.
              </p>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-court-600 hover:bg-court-500 text-white shadow-md shadow-court-900/30 transition-all"
            >
              Unlock Admin Mode
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
