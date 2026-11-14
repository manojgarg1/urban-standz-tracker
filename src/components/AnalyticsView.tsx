import React from 'react';
import { 
  BarChart3, 
  Building2, 
  Scale, 
  Users, 
  Briefcase, 
  Layers, 
  Calendar 
} from 'lucide-react';
import { CaseItem } from '../types';

interface AnalyticsViewProps {
  cases: CaseItem[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ cases }) => {
  // Court counts
  const courtCounts: { [court: string]: number } = {};
  cases.forEach(c => {
    const ct = c.court || 'Other Court';
    courtCounts[ct] = (courtCounts[ct] || 0) + 1;
  });

  // Stage counts
  const stageCounts: { [stage: string]: number } = {};
  cases.forEach(c => {
    const st = c.stage || 'Unspecified';
    stageCounts[st] = (stageCounts[st] || 0) + 1;
  });

  // Advocate counts
  const advocateCounts: { [adv: string]: number } = {};
  cases.forEach(c => {
    if (c.advocate && c.advocate.trim()) {
      advocateCounts[c.advocate.trim()] = (advocateCounts[c.advocate.trim()] || 0) + 1;
    }
  });

  // Category counts
  const categoryCounts: { [cat: string]: number } = {};
  cases.forEach(c => {
    const cat = c.category || 'Tenant vs Landlord & Urban Standz';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  // Sort courts
  const sortedCourts = Object.entries(courtCounts).sort((a, b) => b[1] - a[1]);
  // Sort stages
  const sortedStages = Object.entries(stageCounts).sort((a, b) => b[1] - a[1]);
  // Sort advocates (top 8)
  const sortedAdvocates = Object.entries(advocateCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

  const maxCourt = sortedCourts[0]?.[1] || 1;
  const maxStage = sortedStages[0]?.[1] || 1;
  const maxAdvocate = sortedAdvocates[0]?.[1] || 1;

  return (
    <div className="space-y-6">
      {/* Analytics Overview Banner */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-court-400" />
            Legal Analytics & Court Distribution
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Breakdown of cases filed by tenants and house owners against Urban Standz Pvt Ltd
          </p>
        </div>
        <div className="text-xs text-slate-300 font-medium bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700/60">
          Dataset: <span className="font-bold text-white">{cases.length}</span> Total Cases
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Court Breakdown */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-4">
          <h3 className="text-xs font-bold text-court-300 uppercase tracking-wider flex items-center gap-2 border-b border-slate-700/60 pb-3">
            <Building2 className="w-4 h-4 text-court-400" />
            Cases by Court Forum
          </h3>

          <div className="space-y-3">
            {sortedCourts.map(([courtName, count]) => {
              const pct = Math.round((count / cases.length) * 100);
              const barWidth = Math.round((count / maxCourt) * 100);

              return (
                <div key={courtName} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-200 truncate max-w-[280px]" title={courtName}>
                      {courtName}
                    </span>
                    <span className="text-slate-400 font-mono">
                      <strong className="text-white">{count}</strong> cases ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-court-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stage Breakdown */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-4">
          <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2 border-b border-slate-700/60 pb-3">
            <Layers className="w-4 h-4 text-amber-400" />
            Cases by Legal Stage
          </h3>

          <div className="space-y-3">
            {sortedStages.map(([stageName, count]) => {
              const pct = Math.round((count / cases.length) * 100);
              const barWidth = Math.round((count / maxStage) * 100);

              return (
                <div key={stageName} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-200">
                      {stageName}
                    </span>
                    <span className="text-slate-400 font-mono">
                      <strong className="text-white">{count}</strong> ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Advocates Representing Parties */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-4">
          <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2 border-b border-slate-700/60 pb-3">
            <Briefcase className="w-4 h-4 text-emerald-400" />
            Advocates Handling Multiple Cases
          </h3>

          <div className="space-y-3">
            {sortedAdvocates.map(([advName, count]) => {
              const barWidth = Math.round((count / maxAdvocate) * 100);

              return (
                <div key={advName} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-200 truncate max-w-[260px]">
                      {advName}
                    </span>
                    <span className="text-slate-400 font-mono">
                      <strong className="text-emerald-400">{count}</strong> cases
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dispute Types */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-4">
          <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2 border-b border-slate-700/60 pb-3">
            <Scale className="w-4 h-4 text-purple-400" />
            Dispute Classification
          </h3>

          <div className="space-y-3">
            {Object.entries(categoryCounts).map(([catName, count]) => {
              const pct = Math.round((count / cases.length) * 100);

              return (
                <div key={catName} className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/40">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{catName}</span>
                    <span className="text-court-300 font-mono font-bold">{count} cases ({pct}%)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {catName.includes('Criminal')
                      ? 'Cases filed u/s 138 Negotiable Instruments Act or criminal breach of trust under BNSS / IPC.'
                      : catName.includes('Landlord')
                      ? 'Civil Original Suits filed by house owners against tenant and Urban Standz for possession & rent.'
                      : 'Civil Injunction suits filed by tenants restraining dispossession without due process of law.'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
