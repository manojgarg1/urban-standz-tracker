import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { StatsOverview } from './components/StatsOverview';
import { FilterBar } from './components/FilterBar';
import { CaseTable } from './components/CaseTable';
import { CaseCards } from './components/CaseCards';
import { HearingCalendar } from './components/HearingCalendar';
import { AnalyticsView } from './components/AnalyticsView';
import { ResourcesView } from './components/ResourcesView';
import { AboutScamView } from './components/AboutScamView';
import { OrdersJudgmentsView } from './components/OrdersJudgmentsView';
import { VictimsDirectoryView } from './components/VictimsDirectoryView';
import { LatestNewsView } from './components/LatestNewsView';
import { ContactFormView } from './components/ContactFormView';
import { CaseDetailModal } from './components/CaseDetailModal';
import { CaseFormModal } from './components/CaseFormModal';
import { UpdateHearingModal } from './components/UpdateHearingModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { CloudSettingsModal } from './components/CloudSettingsModal';
import { ResourceFormModal } from './components/ResourceFormModal';
import { OrderFormModal } from './components/OrderFormModal';
import { 
  CaseItem, 
  ViewMode, 
  MainSection, 
  FilterState, 
  ResourceItem, 
  CourtOrder, 
  VictimItem, 
  NewsArticle 
} from './types';
import { 
  getAllCases, 
  saveCase, 
  deleteCase, 
  resetToDefaultSeed, 
  bulkReplaceCases,
  isAdminAuthenticated, 
  setAdminAuthenticated 
} from './services/caseService';
import { 
  getAllResources, 
  saveResource, 
  deleteResource 
} from './services/resourceService';
import { 
  getAllOrders, 
  saveOrder, 
  deleteOrder 
} from './services/orderService';
import { 
  getAllVictims, 
  deleteVictim,
  clearAllVictims 
} from './services/victimService';
import { 
  getAllNews, 
  saveNews, 
  deleteNews 
} from './services/newsService';
import { exportToExcel, exportToCSV, getHearingUrgency, isMissedUpdate } from './utils/caseUtils';
import { Scale, Loader2, Info } from 'lucide-react';

export const App: React.FC = () => {
  // Navigation State
  const [mainSection, setMainSection] = useState<MainSection>(() => {
    const hash = window.location.hash.replace('#', '') as MainSection;
    const validSections: MainSection[] = ['about', 'cases', 'orders', 'media', 'victims', 'news', 'contact'];
    return validSections.includes(hash) ? hash : 'cases';
  });

  const [currentCaseView, setCurrentCaseView] = useState<ViewMode>('table');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Data States
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [orders, setOrders] = useState<CourtOrder[]>([]);
  const [victims, setVictims] = useState<VictimItem[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(isAdminAuthenticated());

  // Filter State (for Cases Tracker)
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

  // Resources Modals
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
  const [resourceToEdit, setResourceToEdit] = useState<ResourceItem | null>(null);

  // Orders Modals (PDF Upload)
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<CourtOrder | null>(null);

  // Sync hash routing
  useEffect(() => {
    window.location.hash = mainSection;
  }, [mainSection]);

  // Load all initial data on mount
  useEffect(() => {
    async function loadAllData() {
      try {
        const [caseData, resourceData, orderData, victimData, newsData] = await Promise.all([
          getAllCases(),
          getAllResources(),
          getAllOrders(),
          getAllVictims(),
          getAllNews()
        ]);
        setCases(caseData);
        setResources(resourceData);
        setOrders(orderData);
        setVictims(victimData);
        setNews(newsData);
      } catch (e) {
        console.error('Failed to load portal data:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadAllData();
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
      if (filters.status) {
        if (filters.status === 'Missed Updates') {
          if (!isMissedUpdate(c)) return false;
        } else if ((c.status || '').toLowerCase() !== filters.status.toLowerCase()) {
          return false;
        }
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
        } else if (filters.hearingRange === 'tomorrow') {
          if (days !== 1) return false;
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

  // Case Handlers
  const handleSaveCase = async (caseData: Partial<CaseItem>) => {
    const saved = await saveCase(caseData as CaseItem);
    const updatedAll = await getAllCases();
    setCases(updatedAll);
    if (selectedCaseForDetail && selectedCaseForDetail.id === saved.id) {
      setSelectedCaseForDetail(saved);
    }
  };

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

  const handleResetSeed = async () => {
    const seed = await resetToDefaultSeed();
    setCases(seed);
  };

  const handleBulkImport = async (newCases: CaseItem[]) => {
    const updated = await bulkReplaceCases(newCases);
    setCases(updated);
  };

  // Resource Handlers
  const handleSaveResource = async (item: Partial<ResourceItem>) => {
    await saveResource(item);
    const updated = await getAllResources();
    setResources(updated);
  };

  const handleDeleteResource = async (item: ResourceItem) => {
    if (confirm(`Are you sure you want to delete the resource "${item.title}"?`)) {
      await deleteResource(item.id);
      const updated = await getAllResources();
      setResources(updated);
    }
  };

  // Order Handlers (PDF Upload / Edit / Delete)
  const handleSaveOrder = async (item: Partial<CourtOrder>) => {
    await saveOrder(item);
    const updated = await getAllOrders();
    setOrders(updated);
  };

  const handleDeleteOrder = async (item: CourtOrder) => {
    if (confirm(`Are you sure you want to delete order "${item.title}"?`)) {
      await deleteOrder(item.id);
      const updated = await getAllOrders();
      setOrders(updated);
    }
  };

  // Victim Handlers
  const handleDeleteVictim = async (victim: VictimItem) => {
    if (confirm(`Are you sure you want to delete victim entry for "${victim.name}"?`)) {
      await deleteVictim(victim.id);
      const updated = await getAllVictims();
      setVictims(updated);
    }
  };

  const handleClearAllVictims = async () => {
    await clearAllVictims();
    setVictims([]);
  };

  // Linked Case and Registration No Selection
  const handleSelectCaseNumber = (caseRegNo: string) => {
    const cleanTarget = caseRegNo.replace(/[\/\s]/g, '').toLowerCase();
    const match = cases.find(c => {
      const cleanReg = c.registrationNumber.replace(/[\/\s]/g, '').toLowerCase();
      return cleanReg.includes(cleanTarget) || cleanTarget.includes(cleanReg);
    });

    setMainSection('cases');
    if (match) {
      setSelectedCaseForDetail(match);
    } else {
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
          <span className="text-sm font-medium">Loading Urban Standz Legal Action Portal...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* 1. Left Side Menu Bar */}
      <Sidebar
        currentSection={mainSection}
        onSectionChange={setMainSection}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        isAdmin={isAdmin}
        totalCases={cases.length}
        totalVictims={victims.length}
        totalOrders={orders.length}
        totalResources={resources.length}
        totalNews={news.length}
      />

      {/* 2. Main Content Area (offset by Sidebar width on desktop) */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen w-full">
        {/* Top Navbar */}
        <Navbar
          currentSection={mainSection}
          currentCaseView={currentCaseView}
          onCaseViewChange={setCurrentCaseView}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
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

        {/* Main Content Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* TAB 1: About the Scam */}
          {mainSection === 'about' && (
            <AboutScamView onNavigateToContact={() => setMainSection('contact')} />
          )}

          {/* TAB 2: Live Court Cases */}
          {mainSection === 'cases' && (
            <div className="space-y-6">
              {/* Context Summary Banner */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-court-600/20 text-court-400 shrink-0 border border-court-500/30">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      Live Legal Proceedings against M/S Urban Standz Private Limited & Management
                    </p>
                    <p className="text-slate-400 mt-0.5">
                      Tracking 83+ cases across Bengaluru City Civil & Sessions Courts and Chief Judicial Magistrate (CJM).
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Metrics Dashboard */}
              <StatsOverview
                cases={cases}
                onSelectHearingRange={(range) => {
                  setFilters(prev => ({ ...prev, hearingRange: range }));
                  setCurrentCaseView('table');
                }}
                onSelectStatus={(status) => {
                  setFilters(prev => ({ ...prev, status: status === 'all' ? '' : status }));
                  setCurrentCaseView('table');
                }}
              />

              {/* Filter Controls (shown on table and cards view) */}
              {(currentCaseView === 'table' || currentCaseView === 'cards') && (
                <FilterBar
                  filters={filters}
                  onFilterChange={setFilters}
                  cases={cases}
                  matchedCount={filteredCases.length}
                />
              )}

              {/* Views */}
              {currentCaseView === 'table' && (
                <CaseTable
                  cases={filteredCases}
                  isAdmin={isAdmin}
                  onViewCase={(c) => setSelectedCaseForDetail(c)}
                  onSelectLinkedCase={handleSelectCaseNumber}
                  onEditCase={(c) => {
                    setCaseToEdit(c);
                    setIsAddCaseOpen(true);
                  }}
                  onQuickUpdateHearing={(c) => setCaseForQuickHearing(c)}
                  onDeleteCase={handleDeleteCase}
                />
              )}

              {currentCaseView === 'cards' && (
                <CaseCards
                  cases={filteredCases}
                  isAdmin={isAdmin}
                  onViewCase={(c) => setSelectedCaseForDetail(c)}
                  onSelectLinkedCase={handleSelectCaseNumber}
                  onEditCase={(c) => {
                    setCaseToEdit(c);
                    setIsAddCaseOpen(true);
                  }}
                  onQuickUpdateHearing={(c) => setCaseForQuickHearing(c)}
                  onDeleteCase={handleDeleteCase}
                />
              )}

              {currentCaseView === 'calendar' && (
                <HearingCalendar
                  cases={filteredCases}
                  isAdmin={isAdmin}
                  onViewCase={(c) => setSelectedCaseForDetail(c)}
                  onQuickUpdateHearing={(c) => setCaseForQuickHearing(c)}
                />
              )}

              {currentCaseView === 'analytics' && (
                <AnalyticsView cases={cases} />
              )}
            </div>
          )}

          {/* TAB 3: Orders and Judgments (with PDF Upload) */}
          {mainSection === 'orders' && (
            <OrdersJudgmentsView
              orders={orders}
              isAdmin={isAdmin}
              onOpenUpload={() => {
                setOrderToEdit(null);
                setIsOrderModalOpen(true);
              }}
              onEditOrder={(ord) => {
                setOrderToEdit(ord);
                setIsOrderModalOpen(true);
              }}
              onDeleteOrder={handleDeleteOrder}
              onSelectCaseNumber={handleSelectCaseNumber}
            />
          )}

          {/* TAB 4: Media Resources */}
          {mainSection === 'media' && (
            <ResourcesView
              resources={resources}
              isAdmin={isAdmin}
              onOpenAddResource={() => {
                setResourceToEdit(null);
                setIsAddResourceOpen(true);
              }}
              onEditResource={(res) => {
                setResourceToEdit(res);
                setIsAddResourceOpen(true);
              }}
              onDeleteResource={handleDeleteResource}
            />
          )}

          {/* TAB 5: Victims Directory */}
          {mainSection === 'victims' && (
            <VictimsDirectoryView
              victims={victims}
              isAdmin={isAdmin}
              onNavigateToContact={() => setMainSection('contact')}
              onDeleteVictim={handleDeleteVictim}
              onClearAllVictims={handleClearAllVictims}
            />
          )}

          {/* TAB 6: Latest News */}
          {mainSection === 'news' && (
            <LatestNewsView
              news={news}
              isAdmin={isAdmin}
            />
          )}

          {/* TAB 7: Contact & Intake Form */}
          {mainSection === 'contact' && (
            <ContactFormView
              onVictimAdded={(newVic) => {
                setVictims(prev => [newVic, ...prev]);
              }}
              onNavigateToVictims={() => setMainSection('victims')}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="bg-slate-900 border-t border-slate-800 py-6 mt-12 text-center text-xs text-slate-500 no-print">
          <div className="max-w-7xl mx-auto px-4 space-y-2">
            <div className="flex items-center justify-center space-x-2 text-slate-400">
              <Scale className="w-4 h-4 text-court-400" />
              <span className="font-semibold text-slate-300">Urban Standz Legal Victims Action Portal</span>
            </div>
            <p className="max-w-2xl mx-auto leading-relaxed">
              Data sourced from public cause lists and order sheets of Bengaluru City Civil & Sessions Court and CJM Bengaluru.
              Intended for mutual awareness and legal coordination among affected tenants and house owners.
            </p>
            <p className="text-slate-400 font-medium">
              This portal is developed, deployed and maintained by Manoj Garg, who is one of the victims of Urban Standz Real Estate Scam.
            </p>
          </div>
        </footer>
      </div>

      {/* MODALS */}

      {/* Case Detail Modal */}
      {selectedCaseForDetail && (
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
          onSelectLinkedCase={handleSelectCaseNumber}
        />
      )}

      {/* Add / Edit Case Modal (Admin) */}
      {isAddCaseOpen && (
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
      )}

      {/* Quick Update Hearing Modal (Admin) */}
      {caseForQuickHearing && (
        <UpdateHearingModal
          caseItem={caseForQuickHearing}
          isOpen={Boolean(caseForQuickHearing)}
          onClose={() => setCaseForQuickHearing(null)}
          onSave={handleQuickHearingSave}
        />
      )}

      {/* Admin Login Modal */}
      {isAdminLoginOpen && (
        <AdminLoginModal
          isOpen={isAdminLoginOpen}
          onClose={() => setIsAdminLoginOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* Cloud Settings & Backup Modal */}
      {isSettingsOpen && (
        <CloudSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          cases={cases}
          onResetSeed={handleResetSeed}
          onBulkImport={handleBulkImport}
        />
      )}

      {/* Resource Form Modal (Admin) */}
      {isAddResourceOpen && (
        <ResourceFormModal
          isOpen={isAddResourceOpen}
          onClose={() => {
            setIsAddResourceOpen(false);
            setResourceToEdit(null);
          }}
          onSave={handleSaveResource}
          resourceToEdit={resourceToEdit}
        />
      )}

      {/* Order & Judgment Form Modal with PDF Upload (Admin) */}
      {isOrderModalOpen && (
        <OrderFormModal
          isOpen={isOrderModalOpen}
          onClose={() => {
            setIsOrderModalOpen(false);
            setOrderToEdit(null);
          }}
          onSave={handleSaveOrder}
          orderToEdit={orderToEdit}
          cases={cases}
        />
      )}
    </div>
  );
};

export default App;
