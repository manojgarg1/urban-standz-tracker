import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { StatsOverview } from './components/StatsOverview';
import { FilterBar } from './components/FilterBar';
import { CaseTable } from './components/CaseTable';
import { CaseCards } from './components/CaseCards';
import { HearingCalendar } from './components/HearingCalendar';
import { AnalyticsView } from './components/AnalyticsView';
import { CaseDetailModal } from './components/CaseDetailModal';
import { CaseFormModal } from './components/CaseFormModal';
import { UpdateHearingModal } from './components/UpdateHearingModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { CloudSettingsModal } from './components/CloudSettingsModal';
import { CaseItem, ViewMode, FilterState } from './types';
import { 
  getAllCases, 
  saveCase, 
  deleteCase, 
  updateHearingDetails, 
  resetToDefaultSeed, 
  bulkReplaceCases,
  isAdminAuthenticated, 
  setAdminAuthenticated 
} from './services/caseService';
import { exportToExcel, exportToCSV, getHearingUrgency } from './utils/caseUtils';
import { Scale, Loader2, Info } from 'lucide-react';

export const App: React.FC = () => {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(isAdminAuthenticated());
  const [currentView, setCurrentView] = useState<ViewMode>('table');

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    court: '',
    status: '',
    stage: '',
    advocate: '',
    category: '',
    hearingRange: 'all',
    sortBy: 'serialNumber',
    sortOrder: 'asc'
  });

  // Modal states
  const [selectedCaseForDetail, setSelectedCaseForDetail] = useState<CaseItem | null>(null);
  const [isAddCaseOpen, setIsAddCaseOpen] = useState(false);
  const [caseToEdit, setCaseToEdit] = useState<CaseItem | null>(null);
  const [caseForQuickHearing, setCaseForQuickHearing] = useState<CaseItem | null>(null);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Load cases on mount
  useEffect(() => {
    async function load() {
      try {
        const data = await getAllCases();
        setCases(data);
      } catch (e) {
        console.error('Failed to load cases:', e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  // Filter and sort cases
  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      // 1. Search Query
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase().trim();
        const fullSearchTarget = [
          c.registrationNumber,
          c.cnr,
          c.court,
          c.cch,
          c.judge,
          c.plaintiff1,
          c.plaintiff2,
          c.plaintiff3,
          c.defendant1,
          c.defendant2,
          c.defendant3,
          c.defendant4,
          c.advocate,
          c.stage,
          c.status,
          c.lastBusiness,
          c.linkedCase
        ].filter(Boolean).join(' ').toLowerCase();

        if (!fullSearchTarget.includes(query)) {
          return false;
        }
      }

      // 2. Court Filter
      if (filters.court && c.court !== filters.court) {
        return false;
      }

      // 3. Status Filter
      if (filters.status && (c.status || '').toLowerCase() !== filters.status.toLowerCase()) {
        return false;
      }

      // 4. Stage Filter
      if (filters.stage && c.stage !== filters.stage) {
        return false;
      }

      // 5. Advocate Filter
      if (filters.advocate && c.advocate !== filters.advocate) {
        return false;
      }

      // 6. Dispute Category Filter
      if (filters.category && c.category !== filters.category) {
        return false;
      }

      // 7. Hearing Range Filter
      if (filters.hearingRange !== 'all') {
        const urgency = getHearingUrgency(c.nextHearing);
        const days = urgency.days;

        if (filters.hearingRange === 'today') {
          if (days !== 0) return false;
        } else if (filters.hearingRange === 'this-week') {
          if (days === null || days < 0 || days > 7) return false;
        } else if (filters.hearingRange === 'next-14-days') {
          if (days === null || days < 0 || days > 14) return false;
        } else if (filters.hearingRange === 'next-30-days') {
          if (days === null || days < 0 || days > 30) return false;
        } else if (filters.hearingRange === 'past') {
          if (days === null || days >= 0) return false;
        } else if (filters.hearingRange === 'no-date') {
          if (c.nextHearing && c.nextHearing.trim()) return false;
        }
      }

      return true;
    }).sort((a, b) => {
      let comparison = 0;

      if (filters.sortBy === 'serialNumber') {
        comparison = (a.serialNumber || 0) - (b.serialNumber || 0);
      } else if (filters.sortBy === 'nextHearing') {
        const timeA = a.nextHearing ? new Date(a.nextHearing).getTime() : 9999999999999;
        const timeB = b.nextHearing ? new Date(b.nextHearing).getTime() : 9999999999999;
        comparison = timeA - timeB;
      } else if (filters.sortBy === 'filingDate') {
        const timeA = a.filingDate ? new Date(a.filingDate).getTime() : 0;
        const timeB = b.filingDate ? new Date(b.filingDate).getTime() : 0;
        comparison = timeA - timeB;
      } else if (filters.sortBy === 'registrationNumber') {
        comparison = a.registrationNumber.localeCompare(b.registrationNumber);
      } else if (filters.sortBy === 'plaintiff1') {
        comparison = a.plaintiff1.localeCompare(b.plaintiff1);
      }

      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [cases, filters]);

  // Auth Handlers
  const handleLoginSuccess = () => {
    setAdminAuthenticated(true);
    setIsAdmin(true);
  };

  const handleLogout = () => {
    setAdminAuthenticated(false);
    setIsAdmin(false);
  };

  // Case Save Handler (Add & Edit)
  const handleSaveCase = async (caseData: Partial<CaseItem>) => {
    const saved = await saveCase(caseData as CaseItem);
    const updatedAll = await getAllCases();
    setCases(updatedAll);
    if (selectedCaseForDetail && selectedCaseForDetail.id === saved.id) {
      setSelectedCaseForDetail(saved);
    }
  };

  // Quick Hearing Update Handler (User Specific Requirement!)
  const handleQuickHearingSave = async (
    caseId: string,
    newHearingDate: string,
    newStage: string,
    hearingOrderText?: string,
    newStatus?: string
  ) => {
    const target = cases.find(c => c.id === caseId);
    if (!target) return;

    let updatedLastBusiness = target.lastBusiness || '';
    if (hearingOrderText && hearingOrderText.trim()) {
      updatedLastBusiness = updatedLastBusiness
        ? `${updatedLastBusiness}\n${hearingOrderText.trim()}`
        : hearingOrderText.trim();
    }

    const updatedItem: CaseItem = {
      ...target,
      nextHearing: newHearingDate || target.nextHearing,
      stage: newStage || target.stage,
      status: (newStatus || target.status) as any,
      lastBusiness: updatedLastBusiness
    };

    const saved = await saveCase(updatedItem);
    const updatedAll = await getAllCases();
    setCases(updatedAll);

    if (selectedCaseForDetail && selectedCaseForDetail.id === saved.id) {
      setSelectedCaseForDetail(saved);
    }
  };

  // Delete Case Handler
  const handleDeleteCase = async (c: CaseItem) => {
    if (confirm(`Are you sure you want to delete case "${c.registrationNumber}"? This action cannot be undone.`)) {
      await deleteCase(c.id);
      const updatedAll = await getAllCases();
      setCases(updatedAll);
      if (selectedCaseForDetail && selectedCaseForDetail.id === c.id) {
        setSelectedCaseForDetail(null);
      }
    }
  };

  // Reset to default seed
  const handleResetSeed = async () => {
    const seed = await resetToDefaultSeed();
    setCases(seed);
  };

  // Bulk import
  const handleBulkImport = async (newCases: CaseItem[]) => {
    const updated = await bulkReplaceCases(newCases);
    setCases(updated);
  };

  // Linked Case click handler
  const handleSelectLinkedCase = (caseRegNo: string) => {
    const match = cases.find(c => 
      c.registrationNumber.toLowerCase().includes(caseRegNo.toLowerCase()) || 
      caseRegNo.toLowerCase().includes(c.registrationNumber.toLowerCase())
    );
    if (match) {
      setSelectedCaseForDetail(match);
    } else {
      // Put in search query
      setFilters(prev => ({ ...prev, search: caseRegNo }));
      setSelectedCaseForDetail(null);
    }
  };

  const existingCourts = useMemo(() => {
    return Array.from(new Set(cases.map(c => c.court).filter(Boolean)));
  }, [cases]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <Scale className="w-12 h-12 text-court-500 animate-pulse mb-4" />
        <div className="flex items-center space-x-2 text-slate-300">
          <Loader2 className="w-5 h-5 animate-spin text-court-400" />
          <span className="text-sm font-medium">Loading Urban Standz Case Tracker...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Main Navigation Header */}
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
        isAdmin={isAdmin}
        onOpenLogin={() => setIsAdminLoginOpen(true)}
        onLogout={handleLogout}
        onOpenAddCase={() => {
          setCaseToEdit(null);
          setIsAddCaseOpen(true);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onExportExcel={() => exportToExcel(filteredCases)}
        onExportCSV={() => exportToCSV(filteredCases)}
        totalCasesCount={cases.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Summary Banner for Context */}
        <div className="mb-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-court-600/20 text-court-400 shrink-0 border border-court-500/30">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-white">
                Legal Proceedings against M/S Urban Standz Private Limited & Management
              </p>
              <p className="text-slate-400 mt-0.5">
                Public community dashboard tracking cases between Tenants, House Owners & Urban Standz across Bengaluru Courts.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 text-[11px] font-medium">
              Free Cloud Hosted • No Login Required to View
            </span>
          </div>
        </div>

        {/* Stats Metrics Dashboard */}
        <StatsOverview
          cases={cases}
          onSelectHearingRange={(range) => {
            setFilters(prev => ({ ...prev, hearingRange: range }));
            setCurrentView('table');
          }}
          onSelectStatus={(status) => {
            setFilters(prev => ({ ...prev, status: status === 'all' ? '' : status }));
            setCurrentView('table');
          }}
        />

        {/* Filter Controls (shown on table and cards view) */}
        {(currentView === 'table' || currentView === 'cards') && (
          <FilterBar
            filters={filters}
            onFilterChange={setFilters}
            cases={cases}
            matchedCount={filteredCases.length}
          />
        )}

        {/* View Switcher Output */}
        {currentView === 'table' && (
          <CaseTable
            cases={filteredCases}
            isAdmin={isAdmin}
            onViewCase={(c) => setSelectedCaseForDetail(c)}
            onEditCase={(c) => {
              setCaseToEdit(c);
              setIsAddCaseOpen(true);
            }}
            onQuickUpdateHearing={(c) => setCaseForQuickHearing(c)}
            onDeleteCase={handleDeleteCase}
          />
        )}

        {currentView === 'cards' && (
          <CaseCards
            cases={filteredCases}
            isAdmin={isAdmin}
            onViewCase={(c) => setSelectedCaseForDetail(c)}
            onEditCase={(c) => {
              setCaseToEdit(c);
              setIsAddCaseOpen(true);
            }}
            onQuickUpdateHearing={(c) => setCaseForQuickHearing(c)}
            onDeleteCase={handleDeleteCase}
          />
        )}

        {currentView === 'calendar' && (
          <HearingCalendar
            cases={filteredCases}
            isAdmin={isAdmin}
            onViewCase={(c) => setSelectedCaseForDetail(c)}
            onQuickUpdateHearing={(c) => setCaseForQuickHearing(c)}
          />
        )}

        {currentView === 'analytics' && (
          <AnalyticsView cases={cases} />
        )}
      </main>

      {/* Community Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 mt-12 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <div className="flex items-center justify-center space-x-2 text-slate-400">
            <Scale className="w-4 h-4 text-court-400" />
            <span className="font-semibold text-slate-300">Urban Standz Legal Victims Action Portal</span>
          </div>
          <p className="max-w-2xl mx-auto leading-relaxed">
            Data sourced from public court daily cause lists and order sheets of Bengaluru City Civil & Sessions Court and CJM Bengaluru.
            Intended for mutual awareness and coordination among affected tenants and house owners.
          </p>
          <p className="text-slate-600">
            Can be deployed to Vercel, Netlify, Cloudflare Pages, or GitHub Pages with zero hosting costs.
          </p>
        </div>
      </footer>

      {/* Case Detail Modal */}
      <CaseDetailModal
        caseItem={selectedCaseForDetail}
        onClose={() => setSelectedCaseForDetail(null)}
        isAdmin={isAdmin}
        onEditCase={(c) => {
          setSelectedCaseForDetail(null);
          setCaseToEdit(c);
          setIsAddCaseOpen(true);
        }}
        onQuickUpdateHearing={(c) => {
          setSelectedCaseForDetail(null);
          setCaseForQuickHearing(c);
        }}
        onSelectLinkedCase={handleSelectLinkedCase}
      />

      {/* Add / Edit Case Modal (Admin) */}
      <CaseFormModal
        isOpen={isAddCaseOpen}
        onClose={() => {
          setIsAddCaseOpen(false);
          setCaseToEdit(null);
        }}
        caseToEdit={caseToEdit}
        onSave={handleSaveCase}
        existingCourts={existingCourts}
      />

      {/* Quick Update Hearing Modal (Admin) */}
      <UpdateHearingModal
        caseItem={caseForQuickHearing}
        isOpen={Boolean(caseForQuickHearing)}
        onClose={() => setCaseForQuickHearing(null)}
        onSave={handleQuickHearingSave}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Cloud Settings & Backup Modal */}
      <CloudSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        cases={cases}
        onResetSeed={handleResetSeed}
        onBulkImport={handleBulkImport}
      />
    </div>
  );
};

export default App;
