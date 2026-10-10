import React from 'react';
import { Send } from 'lucide-react';

interface HeaderProps {
  onNavigateToAbschluss: () => void;
  isSaving: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onNavigateToAbschluss, isSaving }) => {

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/90 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
          Steuer-Cockpit 2026
        </h2>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
          <span>ELSTER Veranlagung</span>
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-mono">
          <span className={`h-2 w-2 rounded-full ${isSaving ? 'bg-amber-400 animate-pulse' : 'bg-teal-500'}`} />
          <span>{isSaving ? 'Speichere...' : 'Gesichert (IndexedDB)'}</span>
        </div>

        <div className="h-4 w-px bg-slate-200"></div>

        <button
          onClick={onNavigateToAbschluss}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition shadow-2xs cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>ELSTER Export</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <div className="w-7 h-7 rounded-full bg-teal-100 border border-teal-200 text-teal-800 flex items-center justify-center font-bold text-xs">
            L
          </div>
          <span>Luca Kaiser</span>
        </div>
      </div>
    </header>
  );
};
