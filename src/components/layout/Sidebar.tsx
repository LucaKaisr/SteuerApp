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
  Send
} from 'lucide-react';

interface SidebarProps {
  currentModule: string;
  onSelectModule: (id: string) => void;
  isSaving: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentModule, onSelectModule, isSaving }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, phase: 'Phase 1' },
    { id: 'lohn', label: 'Lohn & Abrechnungen', icon: Briefcase, phase: 'Phase 2' },
    { id: 'zeit', label: 'Kalender & Monitor', icon: Calendar, phase: 'Phase 3' },
    { id: 'werbungskosten', label: 'Werbungskosten', icon: Receipt, phase: 'Phase 3' },
    { id: 'belege', label: 'Belegarchiv & CSV', icon: FileStack, phase: 'Phase 3' },
    { id: 'assistent', label: 'Steuer-Assistent', icon: Bot, phase: 'Phase 4' },
    { id: 'anlagen', label: 'Weitere Anlagen', icon: FileStack, phase: 'Phase 5' },
    { id: 'abschluss', label: 'ELSTER & Abschluss', icon: Send, phase: 'Phase 6' },
    { id: 'backup', label: 'Backup & Restore', icon: Database, phase: 'Phase 1' },
    { id: 'settings', label: 'Einstellungen', icon: Settings, phase: 'Phase 1' },
  ];

  return (
    <aside className="w-64 bg-slate-900/95 border-r border-slate-800 flex flex-col justify-between p-4 shrink-0 h-screen sticky top-0">
      <div className="space-y-6">
        {/* App-Branding */}
        <div className="flex items-center gap-3 px-2 pt-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-950 font-bold text-lg">
            S26
          </div>
          <div>
            <div className="font-bold text-white text-base leading-tight tracking-tight">Steuer-Cockpit</div>
            <div className="text-[11px] text-emerald-400 font-medium">Veranlagung 2026</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectModule(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${active ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950/60 text-slate-500 font-mono">
                  {item.phase}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / Status */}
      <div className="space-y-3 pt-4 border-t border-slate-800/80 px-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isSaving ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`}></span>
            {isSaving ? 'Speichert...' : 'Lokal gesichert'}
          </span>
          <span className="font-mono text-[10px] text-slate-500">v1.0-p1</span>
        </div>
      </div>
    </aside>
  );
};
