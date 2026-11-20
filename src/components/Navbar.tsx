import React from 'react';
import { 
  Scale, 
  Table, 
  LayoutGrid, 
  Calendar, 
  BarChart3, 
  FileSpreadsheet, 
  FileText, 
  Lock, 
  Unlock, 
  PlusCircle, 
  Settings, 
  Printer,
  Menu
} from 'lucide-react';
import { ViewMode, MainSection } from '../types';

interface NavbarProps {
  currentSection: MainSection;
  currentCaseView: ViewMode;
  onCaseViewChange: (view: ViewMode) => void;
  onToggleMobileSidebar: () => void;
  isAdmin: boolean;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenAddCase: () => void;
  onOpenSettings: () => void;
  onExportExcel: () => void;
  onExportCSV: () => void;
  totalCasesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentSection,
  currentCaseView,
  onCaseViewChange,
  onToggleMobileSidebar,
  isAdmin,
  onOpenLogin,
  onLogout,
  onOpenAddCase,
  onOpenSettings,
  onExportExcel,
  onExportCSV,
  totalCasesCount
}) => {
  const getSectionTitle = () => {
    switch (currentSection) {
      case 'about':
        return 'About the Urban Standz Scam';
      case 'cases':
        return 'Live Court Cases';
      case 'orders':
        return 'Orders and Judgments';
      case 'media':
        return 'Media Resources';
      case 'victims':
        return 'Victims Directory';
      case 'news':
        return 'Latest News & Updates';
      case 'contact':
        return 'Contact & Case Intake';
      default:
        return 'Urban Standz Legal Tracker';
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-lg no-print">
      {/* Top Banner for Admin Mode */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white text-xs py-1 px-4 text-center font-medium flex items-center justify-center gap-2 shadow-inner">
          <span className="inline-block w-2 h-2 rounded-full bg-white animate-ping"></span>
          <span>ADMIN MODE ACTIVE: You can add cases, upload court order PDFs, and manage portal records.</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Hamburger & Current Section Title */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleMobileSidebar}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden border border-slate-800"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-xl bg-court-600 hidden sm:flex items-center justify-center text-white shadow-md shadow-court-600/30 shrink-0">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {getSectionTitle()}
                  </h1>
                  {currentSection === 'cases' && (
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-800 text-court-300 border border-court-500/30 hidden sm:inline-block">
                      {totalCasesCount} Cases
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 hidden md:block">
                  Bengaluru Courts • Affected Tenants & House Owners Coordination
                </p>
              </div>
            </div>
          </div>

          {/* Center: Case Sub-Views (When on Live Cases) */}
          {currentSection === 'cases' && (
            <nav className="hidden md:flex items-center space-x-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
              <button
                onClick={() => onCaseViewChange('table')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  currentCaseView === 'table'
                    ? 'bg-court-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>

              <button
                onClick={() => onCaseViewChange('cards')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  currentCaseView === 'cards'
                    ? 'bg-court-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>

              <button
                onClick={() => onCaseViewChange('calendar')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  currentCaseView === 'calendar'
                    ? 'bg-court-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Hearings</span>
              </button>

              <button
                onClick={() => onCaseViewChange('analytics')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  currentCaseView === 'analytics'
                    ? 'bg-court-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Analytics</span>
              </button>
            </nav>
          )}

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-2">
            {currentSection === 'cases' && (
              <div className="hidden lg:flex items-center space-x-1.5 border-r border-slate-700/80 pr-2 mr-1">
                <button
                  onClick={onExportExcel}
                  title="Download Excel (.xlsx)"
                  className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/60 transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Excel</span>
                </button>

                <button
                  onClick={onExportCSV}
                  title="Download CSV"
                  className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>

                <button
                  onClick={() => window.print()}
                  title="Print Summary"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Admin Actions */}
            {isAdmin ? (
              <div className="flex items-center space-x-2">
                {currentSection === 'cases' && (
                  <button
                    onClick={onOpenAddCase}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/30 transition-all transform active:scale-95"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Case</span>
                  </button>
                )}

                <button
                  onClick={onOpenSettings}
                  title="Cloud Database & Settings"
                  className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </button>

                <button
                  onClick={onLogout}
                  title="Logout Admin"
                  className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-rose-950/60 text-rose-300 border border-rose-800/60 hover:bg-rose-900/60 transition-colors"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700 hover:border-court-500 hover:text-court-300 transition-colors shadow-sm"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Admin Login</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile View Sub-Navigation for Cases */}
        {currentSection === 'cases' && (
          <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800">
            <button
              onClick={() => onCaseViewChange('table')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs ${
                currentCaseView === 'table' ? 'bg-court-600 text-white' : 'text-slate-400'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => onCaseViewChange('cards')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs ${
                currentCaseView === 'cards' ? 'bg-court-600 text-white' : 'text-slate-400'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => onCaseViewChange('calendar')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs ${
                currentCaseView === 'calendar' ? 'bg-court-600 text-white' : 'text-slate-400'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Hearings</span>
            </button>
            <button
              onClick={() => onCaseViewChange('analytics')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs ${
                currentCaseView === 'analytics' ? 'bg-court-600 text-white' : 'text-slate-400'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Stats</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
