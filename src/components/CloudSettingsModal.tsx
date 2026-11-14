import React, { useState } from 'react';
import { 
  X, 
  Cloud, 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  ExternalLink, 
  Key, 
  ShieldCheck, 
  Server,
  FileSpreadsheet,
  Save
} from 'lucide-react';
import { CloudConfig, CaseItem } from '../types';
import { getCloudConfig, saveCloudConfig } from '../services/caseService';
import * as XLSX from 'xlsx';

interface CloudSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cases: CaseItem[];
  onResetSeed: () => Promise<void>;
  onBulkImport: (cases: CaseItem[]) => Promise<void>;
}

export const CloudSettingsModal: React.FC<CloudSettingsModalProps> = ({
  isOpen,
  onClose,
  cases,
  onResetSeed,
  onBulkImport
}) => {
  const currentConfig = getCloudConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(currentConfig.supabaseUrl || '');
  const [supabaseKey, setSupabaseKey] = useState(currentConfig.supabaseAnonKey || '');
  const [useSupabase, setUseSupabase] = useState(currentConfig.useSupabase || false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [adminPass, setAdminPass] = useState(
    localStorage.getItem('urban_standz_admin_pass') || 'Manoj070371@@'
  );
  const [passSaveSuccess, setPassSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveCloud = (e: React.FormEvent) => {
    e.preventDefault();
    saveCloudConfig({
      useSupabase,
      supabaseUrl: supabaseUrl.trim(),
      supabaseAnonKey: supabaseKey.trim()
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPass.trim()) return;
    localStorage.setItem('urban_standz_admin_pass', adminPass.trim());
    setPassSaveSuccess(true);
    setTimeout(() => setPassSaveSuccess(false), 2500);
  };

  const handleDownloadBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(cases, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Urban_Standz_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = event.target?.result;
        let importedCases: CaseItem[] = [];

        if (file.name.endsWith('.json')) {
          importedCases = JSON.parse(data as string);
        } else {
          // Excel / CSV using XLSX
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const rawRows: any[] = XLSX.utils.sheet_to_json(firstSheet);

          importedCases = rawRows.map((r, idx) => ({
            id: `case-${r['Master Serial'] || idx + 1}`,
            serialNumber: parseInt(r['Master Serial'] || `${idx + 1}`, 10),
            court: r['Court'] || '',
            cch: r['CCH'] || r['CCH (Hall)'] || '',
            judge: r['Judge'] || '',
            cnr: r['CNR'] || '',
            registrationNumber: r['Registration No.'] || r['Registration Number'] || `Case-${idx + 1}`,
            plaintiff1: r['Plaintiff-1'] || r['Plaintiff 1'] || 'Complainant',
            plaintiff2: r['Plaintiff-2'] || r['Plaintiff 2'] || '',
            plaintiff3: r['Plaintiff-3'] || r['Plaintiff 3'] || '',
            defendant1: r['Defendant-1'] || r['Defendant 1'] || 'URBAN STANDZ PRIVATE LIMITED',
            defendant2: r['Defendant-2'] || r['Defendant 2'] || '',
            defendant3: r['Defendant-3'] || r['Defendant 3'] || '',
            defendant4: r['Defendant-4'] || r['Defendant 4'] || '',
            advocate: r['Advocate'] || '',
            status: r['Status'] || 'Pending',
            stage: r['Stage'] || 'Summons',
            filingDate: r['Filing Date'] || '',
            nextHearing: r['Next Hearing'] || '',
            lastBusiness: r['Last Business'] || r['Last Business / Court Proceedings'] || '',
            linkedCase: r['Linked Case'] || '',
            category: r['Dispute Category'] || 'Tenant vs Landlord & Urban Standz'
          }));
        }

        if (importedCases.length > 0) {
          if (confirm(`Found ${importedCases.length} cases in file. Import and update database?`)) {
            await onBulkImport(importedCases);
            alert(`Successfully imported ${importedCases.length} cases!`);
          }
        }
      } catch (err) {
        console.error(err);
        alert('Failed to parse uploaded file. Please ensure valid JSON, Excel (.xlsx), or CSV.');
      }
    };

    if (file.name.endsWith('.json')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Cloud Database & Free Hosting Setup
              </h2>
              <p className="text-xs text-slate-400">
                Configure Supabase free tier cloud sync, backups, and security
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Guide Card: Free Cloud Architecture */}
          <div className="bg-gradient-to-br from-court-950/40 via-slate-850 to-slate-900 p-4 rounded-xl border border-court-700/40 space-y-2.5">
            <h3 className="text-xs font-bold text-court-300 uppercase tracking-wider flex items-center gap-1.5">
              <Server className="w-4 h-4 text-court-400" />
              100% Free Cloud Hosting Guide
            </h3>
            <p className="text-slate-300 leading-relaxed">
              This application has no confidential data and is designed to run completely free forever on:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/60">
                <span className="font-bold text-white block">1. Frontend (Free Web Hosting):</span>
                <span>Deploy to <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-court-400 hover:underline">Vercel</a>, <a href="https://netlify.com" target="_blank" rel="noreferrer" className="text-court-400 hover:underline">Netlify</a>, or <a href="https://pages.github.com" target="_blank" rel="noreferrer" className="text-court-400 hover:underline">GitHub Pages</a> in 1-click.</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/60">
                <span className="font-bold text-white block">2. Database (Free PostgreSQL):</span>
                <span>Use <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-court-400 hover:underline">Supabase Free Tier</a>. Run <code className="text-court-300">supabase_schema.sql</code> and paste keys below.</span>
              </div>
            </div>
          </div>

          {/* Supabase Free Cloud Integration */}
          <form onSubmit={handleSaveCloud} className="bg-slate-850/60 p-4 rounded-xl border border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-400" />
                Supabase Free PostgreSQL Cloud Connection
              </h3>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useSupabase}
                  onChange={(e) => setUseSupabase(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-court-600 focus:ring-0"
                />
                <span className="text-slate-300 font-medium">Enable Cloud Sync</span>
              </label>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="block text-slate-400 mb-1">Supabase Project URL:</label>
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-court-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Supabase Anon Public API Key:</label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-court-500 font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {useSupabase && supabaseUrl ? 'Cloud sync configured' : 'Using browser offline storage'}
              </span>
              <button
                type="submit"
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-court-600 hover:bg-court-500 text-white transition-colors"
              >
                {saveSuccess ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Save className="w-3.5 h-3.5" />}
                <span>{saveSuccess ? 'Configuration Saved!' : 'Save Cloud Settings'}</span>
              </button>
            </div>
          </form>

          {/* Change Admin Passcode */}
          <form onSubmit={handleSavePassword} className="bg-slate-850/60 p-4 rounded-xl border border-slate-700/60 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Key className="w-4 h-4 text-amber-400" />
              Change Admin Passcode
            </h3>
            <div className="flex gap-2">
              <input
                type="password"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                placeholder="Set new admin passcode"
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-court-500 font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-white transition-colors shrink-0"
              >
                {passSaveSuccess ? 'Updated!' : 'Update Passcode'}
              </button>
            </div>
          </form>

          {/* Data Backup & Restore */}
          <div className="bg-slate-850/60 p-4 rounded-xl border border-slate-700/60 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              Backup & Data Management
            </h3>

            <div className="flex flex-wrap gap-2.5">
              {/* Download JSON Backup */}
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-court-400" />
                <span>Download JSON Backup</span>
              </button>

              {/* Import Excel / CSV / JSON */}
              <label className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>Import File (Excel / CSV / JSON)</span>
                <input
                  type="file"
                  accept=".json,.csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Reset to Initial Seed Data */}
              <button
                type="button"
                onClick={async () => {
                  if (confirm('Are you sure you want to reset all records back to the original 69 cases from the tracker sheet? Any newly added cases will be replaced.')) {
                    await onResetSeed();
                    alert('Successfully reset database to original spreadsheet seed data!');
                  }
                }}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 border border-rose-800/60 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore Default Spreadsheet Seed</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-850 border-t border-slate-700/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
