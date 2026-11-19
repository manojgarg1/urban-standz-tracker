import React from 'react';
import { 
  Search, 
  X, 
  Filter, 
  ArrowUpDown, 
  RotateCcw,
  Building,
  CalendarDays
} from 'lucide-react';
import { FilterState, CaseItem } from '../types';
import { isMissedUpdate } from '../utils/caseUtils';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  cases: CaseItem[];
  matchedCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  cases,
  matchedCount
}) => {
  const missedCount = cases.filter(isMissedUpdate).length;
  // Extract distinct courts
  const courts = Array.from(new Set(cases.map(c => c.court).filter(Boolean))).sort();

  // Extract distinct stages
  const stages = Array.from(new Set(cases.map(c => c.stage).filter(Boolean))).sort();

  // Extract distinct advocates
  const advocates = Array.from(new Set(cases.map(c => c.advocate).filter(Boolean))).sort();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const clearSearch = () => {
    onFilterChange({ ...filters, search: '' });
  };

  const resetAllFilters = () => {
    onFilterChange({
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
  };

  const hasActiveFilters = 
    Boolean(filters.search) || 
    Boolean(filters.court) || 
    Boolean(filters.status) || 
    Boolean(filters.stage) || 
    Boolean(filters.advocate) || 
    Boolean(filters.category) || 
    filters.hearingRange !== 'all';

  return (
    <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 mb-6 shadow-sm no-print">
      {/* Top Search & Reset Row */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between pb-3 border-b border-slate-700/60">
        {/* Main Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Search by Case No, CNR, Party Name (Tenant/Landlord), Hall (CCH), Advocate, or Judge..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-court-500 focus:ring-1 focus:ring-court-500 transition-all"
          />
          {filters.search && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results Counter & Reset Filter Button */}
        <div className="flex items-center justify-between lg:justify-end gap-3">
          <div className="text-xs text-slate-300">
            Showing <span className="font-bold text-court-300">{matchedCount}</span> of <span className="text-slate-400">{cases.length}</span> cases
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-700/70 hover:bg-slate-700 text-slate-200 border border-slate-600 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-court-400" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Dropdowns Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-3">
        {/* Court Drop Down */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
            <Building className="w-3 h-3 text-court-400" />
            Court Name
          </label>
          <select
            value={filters.court}
            onChange={(e) => onFilterChange({ ...filters, court: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-court-500"
          >
            <option value="">All Courts ({courts.length})</option>
            {courts.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Hearing Schedule Range */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
            <CalendarDays className="w-3 h-3 text-amber-400" />
            Hearing Schedule
          </label>
          <select
            value={filters.hearingRange}
            onChange={(e) => onFilterChange({ ...filters, hearingRange: e.target.value as any })}
            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-court-500"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="this-week">Next 7 Days (Urgent)</option>
            <option value="next-14-days">Next 14 Days</option>
            <option value="next-30-days">Next 30 Days</option>
            <option value="past">Past / Overdue</option>
            <option value="no-date">No Hearing Date</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-court-500"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending (Active)</option>
            <option value="Missed Updates">Missed Updates ({missedCount})</option>
            <option value="Disposed">Disposed / CC</option>
            <option value="Stayed">Stayed</option>
          </select>
        </div>

        {/* Stage */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Stage
          </label>
          <select
            value={filters.stage}
            onChange={(e) => onFilterChange({ ...filters, stage: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-court-500"
          >
            <option value="">All Stages ({stages.length})</option>
            {stages.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

        {/* Advocate */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Advocate
          </label>
          <select
            value={filters.advocate}
            onChange={(e) => onFilterChange({ ...filters, advocate: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-court-500"
          >
            <option value="">All Advocates ({advocates.length})</option>
            {advocates.map(adv => (
              <option key={adv} value={adv}>{adv}</option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
            <span>Sort By</span>
            <button
              onClick={() => onFilterChange({ ...filters, sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })}
              title="Toggle Asc/Desc"
              className="text-court-400 hover:text-court-300"
            >
              <ArrowUpDown className="w-3 h-3 inline" />
            </button>
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value as any })}
            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-court-500"
          >
            <option value="serialNumber">Master Serial #</option>
            <option value="nextHearing">Next Hearing Date</option>
            <option value="filingDate">Filing Date</option>
            <option value="registrationNumber">Case Registration No</option>
            <option value="plaintiff1">Plaintiff Name</option>
          </select>
        </div>
      </div>
    </div>
  );
};
