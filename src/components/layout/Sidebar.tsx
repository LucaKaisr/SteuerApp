import React from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  Calendar, 
  Receipt, 
  FileStack, 
  Bot, 
  Database, 
  Settings,
  Send,
  ReceiptEuro
} from 'lucide-react';

interface SidebarProps {
  currentModule: string;
  onSelectModule: (id: string) => void;
  isSaving?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentModule, onSelectModule }) => {
  const mainNavItems = [
    { id: 'dashboard', label: 'Steuer-Cockpit', icon: LayoutDashboard },
    { id: 'lohn', label: 'Lohn & Abrechnungen', icon: Briefcase },
    { id: 'werbungskosten', label: 'Werbungskosten', icon: Receipt },
    { id: 'belege', label: 'Belegarchiv & CSV', icon: FileStack },
    { id: 'zeit', label: 'Arbeitstage & Homeoffice', icon: Calendar },
  ];

  const secondaryNavItems = [
    { id: 'assistent', label: 'Steuer-Assistent', icon: Bot, badge: 'KI' },
    { id: 'abschluss', label: 'ELSTER & Export', icon: Send, badge: 'Bereit' },
    { id: 'backup', label: 'Backup & Restore', icon: Database },
    { id: 'settings', label: 'Einstellungen', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 hidden md:flex border-r border-slate-800">
      <div className="p-5 space-y-6">
        {/* App-Branding */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-teal-500/20 border border-teal-500/30 text-teal-400">
            <ReceiptEuro className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base tracking-tight leading-none">
              SteuerApp
            </h1>
            <span className="text-[11px] text-teal-400 font-medium">
              Veranlagung 2026
            </span>
          </div>
        </div>

        {/* Navigation */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 block mb-2">
            Hauptmenü
          </span>
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const active = currentModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectModule(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  active
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Sekundäre Module */}
        <div className="space-y-1 pt-2 border-t border-slate-800/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 block mb-2">
            Abschluss & Tools
          </span>
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            const active = currentModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectModule(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                  active
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                    active ? 'bg-white/20 text-white' : 'bg-teal-500/20 text-teal-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span className="font-mono text-[11px]">ELSTER Schema v26</span>
          <span className="h-2 w-2 rounded-full bg-teal-400" />
        </div>
      </div>
    </aside>
  );
};
