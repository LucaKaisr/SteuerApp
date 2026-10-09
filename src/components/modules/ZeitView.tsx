import React, { useState } from 'react';
import { useTax } from '../../context/TaxContext';
import type { KalenderTagTyp } from '../../types/tax';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  AlertTriangle, 
  Briefcase, 
  Home, 
  GraduationCap, 
  Sun,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const ZeitView: React.FC = () => {
  const { state, updateState } = useTax();
  const [selectedMonth, setSelectedMonth] = useState<number>(0); // 0 = Jan, 11 = Dez 2026
  const [activePreset, setActivePreset] = useState<KalenderTagTyp>('arbeit_vor_ort_a');

  const monatsNamen = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

  const tagTypLabels: Record<KalenderTagTyp, { label: string; color: string; icon: any }> = {
    arbeit_vor_ort_a: { label: 'Arbeit pfenning', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: Briefcase },
    arbeit_vor_ort_b: { label: 'Arbeit B.Schmitt', color: 'bg-teal-500/20 text-teal-300 border-teal-500/30', icon: Briefcase },
    homeoffice: { label: 'Homeoffice', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', icon: Home },
    hochschule: { label: 'TH Mannheim (Uni)', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', icon: GraduationCap },
    auswaertstaetigkeit: { label: 'Auswärtstätigkeit', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', icon: Clock },
    urlaub: { label: 'Urlaub', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30', icon: Sun },
    krank: { label: 'Krank', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30', icon: AlertTriangle },
    frei: { label: 'Frei / Wochenende', color: 'bg-slate-900 text-slate-500 border-slate-800', icon: Sun },
  };

  // Tage im aktuellen Monat 2026 berechnen
  const daysInMonth = new Date(2026, selectedMonth + 1, 0).getDate();
  const firstDayWeekday = (new Date(2026, selectedMonth, 1).getDay() + 6) % 7; // 0 = Mo, 6 = So

  // Aggregationen über das gesamte Jahr 2026
  const allEntries = Object.values(state.kalender);
  const tageArbeitA = allEntries.filter(t => t.primaerTyp === 'arbeit_vor_ort_a').length;
  const tageArbeitB = allEntries.filter(t => t.primaerTyp === 'arbeit_vor_ort_b').length;
  const tageHomeoffice = allEntries.filter(t => t.primaerTyp === 'homeoffice').length;
  const tageUni = allEntries.filter(t => t.primaerTyp === 'hochschule').length;

  // Werkstudenten-Monitor: Berechne durchschnittliche Wochenarbeitsstunden (z.B. 8h pro Arbeitstag)
  const totalArbeitstage = tageArbeitA + tageArbeitB + tageHomeoffice;
  const geschaetzteGesamtstunden = totalArbeitstage * 8;
  const wochenVergangen = Math.max(1, (selectedMonth + 1) * 4);
  const durchschnittWochenstunden = Math.round((geschaetzteGesamtstunden / wochenVergangen) * 10) / 10;
  const istUeber20h = durchschnittWochenstunden > state.config.werkstudentenMaxStundenWoche;

  const handleDayClick = (dayNum: number) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const dateKey = `2026-${pad(selectedMonth + 1)}-${pad(dayNum)}`;

    updateState((prev) => {
      const current = prev.kalender[dateKey];
      const nextTyp: KalenderTagTyp = current && current.primaerTyp === activePreset ? 'frei' : activePreset;
      
      return {
        ...prev,
        kalender: {
          ...prev.kalender,
          [dateKey]: {
            datum: dateKey,
            primaerTyp: nextTyp,
            stunden: nextTyp === 'frei' ? 0 : 8,
            isAusnahme: true,
          },
        },
      };
    });
  };

  // Schnellerfassung: Wochenmuster für den gesamten Monat anwenden
  const applyWeeklyPattern = () => {
    updateState((prev) => {
      const updated = { ...prev.kalender };
      for (let day = 1; day <= daysInMonth; day++) {
        const pad = (n: number) => String(n).padStart(2, '0');
        const dateKey = `2026-${pad(selectedMonth + 1)}-${pad(day)}`;
        const weekday = (new Date(2026, selectedMonth, day).getDay() + 6) % 7; // 0=Mo, 4=Fr, 5=Sa, 6=So

        // Muster basierend auf Klärungsdialog:
        // Jan-Jul: pfenning logistics (Mo, Di Arbeit, Mi Uni, Do Homeoffice, Fr Uni)
        // Aug-Dez: B.Schmitt mobile GmbH
        let typ: KalenderTagTyp = 'frei';
        const isErstesHalbjahr = selectedMonth <= 6; // Bis Juli

        if (weekday === 0 || weekday === 1) { // Mo, Di
          typ = isErstesHalbjahr ? 'arbeit_vor_ort_a' : 'arbeit_vor_ort_b';
        } else if (weekday === 2 || weekday === 4) { // Mi, Fr: Uni
          typ = 'hochschule';
        } else if (weekday === 3) { // Do: 1x Homeoffice pro Woche laut Dialog
          typ = 'homeoffice';
        }

        updated[dateKey] = {
          datum: dateKey,
          primaerTyp: typ,
          stunden: typ === 'frei' ? 0 : 8,
          isAusnahme: false,
        };
      }
      return { ...prev, kalender: updated };
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Modul 3.3a & 3.3b: Tageskalender & Werkstudenten-Monitor</h2>
              <p className="text-sm text-slate-400">
                Verbindliche Zählung aller Arbeitstage, Homeoffice-Tage, Hochschultage und Überwachung der 20h-Grenze
              </p>
            </div>
          </div>

          <button
            onClick={applyWeeklyPattern}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 self-start md:self-auto shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            Wochenmuster für {monatsNamen[selectedMonth]} anwenden
          </button>
        </div>
      </div>

      {/* Werkstudenten-Monitor Box (3.3b) */}
      <div className={`p-5 rounded-2xl border ${
        istUeber20h
          ? 'bg-rose-950/20 border-rose-800/60 text-rose-200'
          : 'bg-slate-900 border-slate-800 text-slate-300'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${istUeber20h ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Werkstudenten-Status & Sozialversicherungs-Check</h3>
              <p className="text-xs text-slate-400">
                Max. 20 Stunden/Woche während der Vorlesungszeit (Ausnahmen: Semesterferien, Wochenendarbeit)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Ø Wochenstunden:</span>
              <span className={`text-base font-bold font-mono ${istUeber20h ? 'text-rose-400' : 'text-emerald-400'}`}>
                {durchschnittWochenstunden} h / Woche
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Status:</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${istUeber20h ? 'bg-rose-950 text-rose-300' : 'bg-emerald-950 text-emerald-300'}`}>
                {istUeber20h ? 'Warnung: Grenze überschritten' : 'Im Werkstudenten-Rahmen'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Zähler-Statistik für Werbungskosten */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 block">Tage pfenning (70 km):</span>
          <span className="text-xl font-bold text-white font-mono">{tageArbeitA} Tage</span>
          <span className="text-[10px] text-slate-500 block mt-1">Einfache Fahrt zur 1. Tätigkeitsstätte</span>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 block">Tage B.Schmitt (6 km):</span>
          <span className="text-xl font-bold text-white font-mono">{tageArbeitB} Tage</span>
          <span className="text-[10px] text-slate-500 block mt-1">Frankfurt Westerbachstr.</span>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 block">Homeoffice-Tage:</span>
          <span className="text-xl font-bold text-blue-400 font-mono">{tageHomeoffice} Tage</span>
          <span className="text-[10px] text-slate-500 block mt-1">6,00 € Pauschale pro Tag</span>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 block">Tage TH Mannheim:</span>
          <span className="text-xl font-bold text-purple-400 font-mono">{tageUni} Tage</span>
          <span className="text-[10px] text-slate-500 block mt-1">Präsenztage Studium</span>
        </div>
      </div>

      {/* Kalender Monatsnavigation & Palette */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedMonth((prev) => Math.max(0, prev - 1))}
              disabled={selectedMonth === 0}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white min-w-[140px] text-center">
              {monatsNamen[selectedMonth]} 2026
            </h3>
            <button
              onClick={() => setSelectedMonth((prev) => Math.min(11, prev + 1))}
              disabled={selectedMonth === 11}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Stempel-Pinsel Palette */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 mr-1">Klick-Stempel:</span>
            {(['arbeit_vor_ort_a', 'arbeit_vor_ort_b', 'homeoffice', 'hochschule', 'urlaub', 'frei'] as KalenderTagTyp[]).map((typ) => (
              <button
                key={typ}
                onClick={() => setActivePreset(typ)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  activePreset === typ
                    ? 'border-emerald-400 bg-emerald-500/20 text-white shadow-sm'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                {tagTypLabels[typ].label}
              </button>
            ))}
          </div>
        </div>

        {/* Kalender Raster (Wochentage + Monatsraster) */}
        <div>
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400 mb-2">
            <div>Mo</div><div>Di</div><div>Mi</div><div>Do</div><div>Fr</div><div>Sa</div><div>So</div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {/* Leere Tage vor Monatsbeginn */}
            {Array.from({ length: firstDayWeekday }).map((_, i) => (
              <div key={`empty-${i}`} className="h-20 bg-slate-950/40 rounded-xl border border-slate-900/40"></div>
            ))}

            {/* Tage des Monats */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const pad = (n: number) => String(n).padStart(2, '0');
              const dateKey = `2026-${pad(selectedMonth + 1)}-${pad(dayNum)}`;
              const dayData = state.kalender[dateKey];
              const typ = dayData?.primaerTyp || 'frei';
              const cfg = tagTypLabels[typ];

              return (
                <button
                  key={dayNum}
                  onClick={() => handleDayClick(dayNum)}
                  className={`h-20 p-2 rounded-xl border text-left flex flex-col justify-between transition-all hover:scale-[1.02] cursor-pointer ${
                    typ !== 'frei'
                      ? `${cfg.color} border-current/40`
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-xs font-bold text-white">{dayNum}</span>
                    {dayData?.isAusnahme && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    )}
                  </div>
                  <div className="text-[10px] font-medium leading-tight truncate">
                    {cfg.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
