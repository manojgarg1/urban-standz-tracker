import React from 'react';
import { 
  Info, 
  Scale, 
  Gavel, 
  Video, 
  Users, 
  Flame, 
  Mail, 
  X, 
  ChevronRight, 
  ShieldCheck, 
  AlertTriangle 
} from 'lucide-react';
import { MainSection } from '../types';

interface SidebarProps {
  currentSection: MainSection;
  onSectionChange: (section: MainSection) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isAdmin: boolean;
  totalCases: number;
  totalVictims: number;
  totalOrders: number;
  totalResources: number;
  totalNews: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSectionChange,
  isOpenMobile,
  onCloseMobile,
  isAdmin,
  totalCases,
  totalVictims,
  totalOrders,
  totalResources,
  totalNews
}) => {
  const menuItems: {
    id: MainSection;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
    badgeColor?: string;
    description: string;
  }[] = [
    {
      id: 'about',
      label: 'About the Scam',
      icon: Info,
      badge: 'Expose',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      description: 'Facts, Promoters, Modus Operandi'
    },
    {
      id: 'cases',
      label: 'Live Court Cases',
      icon: Scale,
      badge: totalCases > 0 ? totalCases : '83',
      badgeColor: 'bg-court-500/20 text-court-300 border-court-500/30',
      description: 'Active Bengaluru Court Tracker'
    },
    {
      id: 'orders',
      label: 'Orders and Judgments',
      icon: Gavel,
      badge: totalOrders > 0 ? totalOrders : 'PDFs',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      description: 'Court Orders, Injunctions & PDFs'
    },
    {
      id: 'media',
      label: 'Media Resources',
      icon: Video,
      badge: totalResources > 0 ? totalResources : 'Videos',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      description: 'News Broadcasts, FB Reels & Exposes'
    },
    {
      id: 'victims',
      label: 'Victims Directory',
      icon: Users,
      badge: totalVictims > 0 ? totalVictims : undefined,
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      description: 'Affected Tenants & Property Owners'
    },
    {
      id: 'news',
      label: 'Latest News',
      icon: Flame,
      badge: totalNews > 0 ? totalNews : 'Updates',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      description: 'FIR, Police & Legal Developments'
    },
    {
      id: 'contact',
      label: 'Contact & Intake',
      icon: Mail,
      badge: 'Intake',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      description: 'Register Case & Join Action Group'
    }
  ];

  const handleSelect = (id: MainSection) => {
    onSectionChange(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-court-500 to-court-700 flex items-center justify-center text-white shadow-lg shadow-court-600/30">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Urban Standz</h2>
              <p className="text-[11px] font-medium text-slate-400">Victims Action Portal</p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin Badge if Active */}
        {isAdmin && (
          <div className="mx-3 mt-3 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center space-x-2 text-xs text-amber-300 font-semibold">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Admin Control Active</span>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto custom-scrollbar">
          <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Main Navigation
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all group ${
                  isActive
                    ? 'bg-court-600 text-white shadow-md shadow-court-600/20 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className={`p-2 rounded-lg transition-colors shrink-0 ${
                      isActive
                        ? 'bg-court-700 text-white'
                        : 'bg-slate-800 text-slate-400 group-hover:text-court-300 group-hover:bg-slate-750'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate leading-tight">{item.label}</p>
                    <p
                      className={`text-[10px] truncate leading-tight mt-0.5 ${
                        isActive ? 'text-court-200' : 'text-slate-400'
                      }`}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1 shrink-0 ml-2">
                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                        isActive
                          ? 'bg-white/20 text-white border-white/30'
                          : item.badgeColor || 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform ${
                      isActive ? 'text-white' : 'text-slate-500 group-hover:translate-x-0.5'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </nav>

        {/* Quick Intake Banner Callout */}
        <div className="p-3 border-t border-slate-800">
          <div className="bg-gradient-to-br from-slate-800 to-slate-850 border border-slate-700/80 rounded-xl p-3 text-xs">
            <div className="flex items-center space-x-2 text-amber-400 font-semibold mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span>Are You Defrauded?</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed mb-2.5">
              Tenants & house owners can register FIR & court details to connect with fellow victims.
            </p>
            <button
              onClick={() => handleSelect('contact')}
              className="w-full py-1.5 px-3 rounded-lg bg-court-600 hover:bg-court-500 text-white text-xs font-semibold text-center transition-colors shadow-sm"
            >
              Register Case / Contact
            </button>
          </div>

          <div className="mt-3 text-center">
            <p className="text-[10px] text-slate-400 font-medium">
              Initiative by Manoj Garg (Victim Action)
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
