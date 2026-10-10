import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, 
  GraduationCap, 
  ReceiptEuro, 
  Calendar, 
  UtensilsCrossed, 
  Shirt, 
  Palmtree, 
  ChevronDown, 
  ExternalLink,
  Layers
} from 'lucide-react';

interface AppItem {
  id: string;
  name: string;
  shortName: string;
  port: number;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  border: string;
}

const ECOSYSTEM_APPS: AppItem[] = [
  {
    id: 'hub',
    name: 'Ecosystem Hub',
    shortName: 'Hub',
    port: 3000,
    url: 'http://localhost:3000',
    icon: LayoutDashboard,
    color: 'text-slate-900',
    bg: 'bg-slate-100',
    border: 'border-slate-300',
  },
  {
    id: 'campus',
    name: 'Campus Cockpit',
    shortName: 'Campus THM',
    port: 3004,
    url: 'http://localhost:3004',
    icon: GraduationCap,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
  },
  {
    id: 'finance',
    name: 'SteuerApp & Finanzen',
    shortName: 'Steuern',
    port: 3003,
    url: 'http://localhost:3003',
    icon: ReceiptEuro,
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
  },
  {
    id: 'calendar',
    name: 'Schedule & Kalender',
    shortName: 'Kalender',
    port: 3006,
    url: 'http://localhost:3006',
    icon: Calendar,
    color: 'text-sky-600',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
  },
  {
    id: 'nutrition',
    name: 'Wochenkoch & Ernährung',
    shortName: 'Ernährung',
    port: 3001,
    url: 'http://localhost:3001',
    icon: UtensilsCrossed,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  {
    id: 'wardrobe',
    name: 'Garderobe & Verkauf',
    shortName: 'Garderobe',
    port: 3002,
    url: 'http://localhost:3002',
    icon: Shirt,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
  },
  {
    id: 'vacation',
    name: 'Thailand Urlaub 2026',
    shortName: 'Thailand',
    port: 3005,
    url: 'http://localhost:3005',
    icon: Palmtree,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
];

export const EcosystemAppSwitcher: React.FC<{ currentAppId: string }> = ({ currentAppId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative flex items-center gap-1.5" ref={menuRef}>
      {/* 1. Direct Hub Button */}
      <a
        href="http://localhost:3000"
        title="Zum Active Master Hub wechseln"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
      >
        <LayoutDashboard className="w-3.5 h-3.5 text-slate-300" />
        <span className="hidden sm:inline">Hub</span>
      </a>

      {/* 2. Ecosystem Dropdown Switcher */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold border border-slate-200 transition-all cursor-pointer"
        title="Alle Ecosystem Apps anzeigen"
      >
        <Layers className="w-3.5 h-3.5 text-slate-500" />
        <span className="hidden md:inline">Apps</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl p-2.5 z-50 animate-fadeIn space-y-1">
          <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Active Ecosystem Suite
            </span>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-bold">
              7 Apps
            </span>
          </div>

          <div className="max-h-80 overflow-y-auto space-y-1 pt-1">
            {ECOSYSTEM_APPS.map((app) => {
              const Icon = app.icon;
              const isActive = app.id === currentAppId;

              return (
                <a
                  key={app.id}
                  href={app.url}
                  className={`w-full flex items-center justify-between p-2 rounded-xl transition-all ${
                    isActive
                      ? 'bg-slate-50 border border-slate-200 shadow-2xs'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg ${app.bg} border ${app.border} ${app.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{app.name}</span>
                        {isActive && (
                          <span className="text-[9px] bg-slate-900 text-white px-1.5 py-0.2 rounded font-semibold">
                            Hier
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">Port {app.port}</span>
                    </div>
                  </div>

                  <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500" />
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
