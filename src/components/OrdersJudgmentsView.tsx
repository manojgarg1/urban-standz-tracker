import React, { useState, useMemo } from 'react';
import { 
  Gavel, 
  FileText, 
  Download, 
  ExternalLink, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Calendar, 
  Building2, 
  Scale, 
  Eye, 
  CheckCircle2, 
  ShieldAlert, 
  X 
} from 'lucide-react';
import { CourtOrder, CaseItem } from '../types';

interface OrdersJudgmentsViewProps {
  orders: CourtOrder[];
  isAdmin: boolean;
  onOpenUpload: () => void;
  onEditOrder: (order: CourtOrder) => void;
  onDeleteOrder: (order: CourtOrder) => void;
  onSelectCaseNumber?: (regNo: string) => void;
}

export const OrdersJudgmentsView: React.FC<OrdersJudgmentsViewProps> = ({
  orders,
  isAdmin,
  onOpenUpload,
  onEditOrder,
  onDeleteOrder,
  onSelectCaseNumber
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCourt, setSelectedCourt] = useState('all');
  const [pdfPreviewModal, setPdfPreviewModal] = useState<{ url: string; title: string } | null>(null);

  // Distinct courts
  const courts = useMemo(() => {
    return Array.from(new Set(orders.map(o => o.court).filter(Boolean)));
  }, [orders]);

  // Distinct types
  const types = useMemo(() => {
    return Array.from(new Set(orders.map(o => o.orderType).filter(Boolean)));
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const fullTarget = [
          o.title,
          o.caseRegistrationNumber,
          o.court,
          o.orderType,
          o.parties,
          o.judge,
          o.orderSummary,
          o.fullText
        ].filter(Boolean).join(' ').toLowerCase();

        if (!fullTarget.includes(q)) return false;
      }

      if (selectedType !== 'all' && o.orderType !== selectedType) {
        return false;
      }

      if (selectedCourt !== 'all' && o.court !== selectedCourt) {
        return false;
      }

      return true;
    });
  }, [orders, searchQuery, selectedType, selectedCourt]);

  // Download PDF handler
  const handleDownloadPdf = (order: CourtOrder) => {
    if (!order.pdfUrl) return;

    if (order.pdfUrl.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = order.pdfUrl;
      link.download = order.pdfFileName || `${order.caseRegistrationNumber.replace(/[\/\s]/g, '_')}_Order.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.open(order.pdfUrl, '_blank');
    }
  };

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'Interim Injunction':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Status Quo':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      case 'Paper Publication':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Warrant / SS':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'Final Judgment':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 text-court-400 font-semibold text-xs mb-1">
            <Gavel className="w-4 h-4" />
            <span>Bengaluru Courts Repository</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Orders and Judgments
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Certified order sheet extracts, ad-interim injunctions, paper publication directives, and judicial rulings in Urban Standz matters.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={onOpenUpload}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-court-600 hover:bg-court-500 text-white text-xs font-semibold shadow-lg shadow-court-600/30 transition-all shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Order / Judgment (PDF)</span>
          </button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
          <p className="text-xl font-bold text-white">{orders.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Total Orders</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
          <p className="text-xl font-bold text-emerald-400">
            {orders.filter(o => o.orderType === 'Interim Injunction' || o.orderType === 'Status Quo').length}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Injunctions & Status Quo</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
          <p className="text-xl font-bold text-amber-400">
            {orders.filter(o => o.orderType === 'Paper Publication').length}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Paper Publications</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
          <p className="text-xl font-bold text-court-400">
            {orders.filter(o => Boolean(o.pdfUrl)).length}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">PDF Documents</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by case number, judge, keywords (e.g. Injunction, Summons, Status Quo)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-court-500"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full sm:w-auto bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-court-500"
          >
            <option value="all">All Order Types</option>
            {types.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* Court Filter */}
          <select
            value={selectedCourt}
            onChange={(e) => setSelectedCourt(e.target.value)}
            className="w-full sm:w-auto bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-court-500"
          >
            <option value="all">All Courts</option>
            {courts.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span>Showing {filteredOrders.length} of {orders.length} orders & rulings</span>
          {(searchQuery || selectedType !== 'all' || selectedCourt !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('all');
                setSelectedCourt('all');
              }}
              className="text-court-400 hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-3xl p-8">
          <Gavel className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-300">No Orders Found</p>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search keywords or filter criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <div
              key={order.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all space-y-4 shadow-sm"
            >
              {/* Order Card Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getBadgeStyle(order.orderType)}`}>
                      {order.orderType}
                    </span>
                    <button
                      onClick={() => onSelectCaseNumber?.(order.caseRegistrationNumber)}
                      className="text-xs font-bold text-court-300 hover:text-court-200 hover:underline flex items-center space-x-1"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>Case: {order.caseRegistrationNumber}</span>
                    </button>
                  </div>
                  <h3 className="text-base font-bold text-white pt-1">
                    {order.title}
                  </h3>
                </div>

                {/* Date & Court */}
                <div className="flex sm:flex-col items-end gap-1 text-[11px] text-slate-400 shrink-0">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Order Date: <strong className="text-slate-300">{order.orderDate}</strong></span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>{order.court}</span>
                  </span>
                </div>
              </div>

              {/* Parties & Judge */}
              {(order.parties || order.judge) && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  {order.parties && (
                    <div>
                      <span className="text-slate-500 font-medium">Parties: </span>
                      <span className="font-semibold">{order.parties}</span>
                    </div>
                  )}
                  {order.judge && (
                    <div>
                      <span className="text-slate-500 font-medium">Judge: </span>
                      <span className="text-slate-400">{order.judge}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Order Summary */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Summary of Relief / Judicial Direction
                </p>
                <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                  {order.orderSummary}
                </p>
              </div>

              {/* Full Text / Business Extract (Collapsible or visible) */}
              {order.fullText && (
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Order Sheet Transcript
                  </p>
                  <pre className="text-[11px] text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800/80 font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto">
                    {order.fullText}
                  </pre>
                </div>
              )}

              {/* Footer Actions (PDF download, view, admin edit/delete) */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
                <div className="flex items-center space-x-2">
                  {order.pdfUrl ? (
                    <>
                      <button
                        onClick={() => {
                          if (order.pdfUrl?.startsWith('data:')) {
                            setPdfPreviewModal({ url: order.pdfUrl, title: order.title });
                          } else {
                            window.open(order.pdfUrl, '_blank');
                          }
                        }}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-court-600 hover:bg-court-500 text-white text-xs font-semibold transition-colors shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View PDF Document</span>
                      </button>

                      <button
                        onClick={() => handleDownloadPdf(order)}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-400" />
                        <span>Download PDF {order.pdfFileSize && `(${order.pdfFileSize})`}</span>
                      </button>
                    </>
                  ) : (
                    <span className="text-[11px] text-slate-500 italic">
                      Certified extract transcribed from public cause list
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onSelectCaseNumber?.(order.caseRegistrationNumber)}
                    className="text-xs text-court-300 hover:text-white flex items-center space-x-1 py-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-750 transition-colors"
                  >
                    <span>View in Case Tracker</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  {isAdmin && (
                    <div className="flex items-center space-x-1 border-l border-slate-800 pl-2">
                      <button
                        onClick={() => onEditOrder(order)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                        title="Edit Order"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteOrder(order)}
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40"
                        title="Delete Order"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PDF Inline Viewer Modal */}
      {pdfPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center space-x-2 truncate">
                <FileText className="w-5 h-5 text-court-400 shrink-0" />
                <h3 className="text-sm font-bold text-white truncate">{pdfPreviewModal.title}</h3>
              </div>
              <button
                onClick={() => setPdfPreviewModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 bg-slate-950 p-2">
              <iframe
                src={pdfPreviewModal.url}
                className="w-full h-full rounded-xl border border-slate-800"
                title="Court Order PDF Document"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
