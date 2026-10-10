import React, { useState } from 'react';
import { useTax } from '../../context/TaxContext';
import type { KalenderTagTyp } from '../../types/tax';
import { 
  Clock, 
  AlertTriangle, 
  Briefcase, 
  Home, 
  GraduationCap, 
  Sun,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Building2,
  ShieldCheck
} from 'lucide-react';

export const ZeitView: React.FC = () => {
  const { state, updateState } = useTax();
  const [selectedMonth, setSelectedMonth] = useState<number>(9); // 9 = Oktober 2026
  const [activePreset, setActivePreset] = useState<KalenderTagTyp>('arbeit_vor_ort_b');

  const monatsNamen = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

  const tagTypLabels: Record<KalenderTagTyp, { label: string; color: string; icon: any }> = {
    arbeit_vor_ort_a: { label: 'Pfenning', color: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: Briefcase },
    arbeit_vor_ort_b: { label: 'B.Schmitt (FFM)', color: 'bg-sky-50 text-sky-800 border-sky-200', icon: Building2 },
    homeoffice: { label: 'Homeoffice (6€)', color: 'bg-blue-50 text-blue-800 border-blue-200', icon: Home },
    hochschule: { label: 'THM (Auswärts)', color: 'bg-violet-50 text-violet-800 border-violet-200', icon: GraduationCap },
    auswaertstaetigkeit: { label: 'Exkursion', color: 'bg-amber-50 text-amber-800 border-amber-200', icon: Clock },
    urlaub: { label: 'Urlaub', color: 'bg-teal-50 text-teal-800 border-teal-200', icon: Sun },
    krank: { label: 'Krank', color: 'bg-rose-50 text-rose-800 border-rose-200', icon: AlertTriangle },
    frei: { label: 'Frei / WE', color: 'bg-slate-50 text-slate-400 border-slate-200', icon: Sun },
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

        let typ: KalenderTagTyp = 'frei';
        const isErstesHalbjahr = selectedMonth <= 6; // Bis Juli (Gorxheimertal / Pfenning)

        if (weekday === 0 || weekday === 1) { // Mo, Di: Arbeit
          typ = isErstesHalbjahr ? 'arbeit_vor_ort_a' : 'arbeit_vor_ort_b';
        } else if (weekday === 2 || weekday === 4) { // Mi, Fr: Uni
          typ = 'hochschule';
        } else if (weekday === 3) { // Do: Homeoffice
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
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top 4 Bento KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">B.Schmitt Tage (FFM)</span>
            <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
              {tageArbeitB} Tage
            </div>
            <span className="text-[11px] text-sky-600 font-medium block mt-1">
              9 km Pendlerpauschale
            </span>
          </div>
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl border border-sky-100">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Homeoffice-Tage</span>
            <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
              {tageHomeoffice} Tage
            </div>
            <span className="text-[11px] text-blue-600 font-medium block mt-1">
              6,00 € / Tag ({(tageHomeoffice * 6).toFixed(0)} € gesamt)
            </span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            <Home className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">THM Vor-Ort Tage</span>
            <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
              {tageUni} Tage
            </div>
            <span className="text-[11px] text-violet-600 font-medium block mt-1">
              Auswärtstätigkeit: 110 km + 14 €
            </span>
          </div>
          <div className="p-3 bg-violet-50 text-violet-600 rounded-xl border border-violet-100">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Werkstudenten-Check</span>
            <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
              {durchschnittWochenstunden} h / W
            </div>
            <span className={`text-[11px] font-bold block mt-1 ${istUeber20h ? 'text-rose-600' : 'text-emerald-600'}`}>
              {istUeber20h ? '⚠️ Über 20h Grenze' : '✓ Im Rahmen (max 20h)'}
            </span>
          </div>
          <div className={`p-3 rounded-xl border ${istUeber20h ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Calendar Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6">
        
        {/* Navigation & Pinsel Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          
          {/* Month Stepper */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedMonth((prev) => Math.max(0, prev - 1))}
              disabled={selectedMonth === 0}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h3 className="text-base font-bold text-slate-900 min-w-[150px] text-center">
              {monatsNamen[selectedMonth]} 2026
            </h3>
            <button
              onClick={() => setSelectedMonth((prev) => Math.min(11, prev + 1))}
              disabled={selectedMonth === 11}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Pattern Action */}
          <button
            onClick={applyWeeklyPattern}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Wochenmuster für {monatsNamen[selectedMonth]} anwenden
          </button>

          {/* Stamp Palette */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(['arbeit_vor_ort_b', 'homeoffice', 'hochschule', 'arbeit_vor_ort_a', 'urlaub', 'frei'] as KalenderTagTyp[]).map((typ) => {
              const info = tagTypLabels[typ];
              const isSelected = activePreset === typ;

              return (
                <button
                  key={typ}
                  onClick={() => setActivePreset(typ)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs scale-105'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {info.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Calendar Matrix */}
        <div>
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 mb-2">
            <div>Mo</div><div>Di</div><div>Mi</div><div>Do</div><div>Fr</div><div>Sa</div><div>So</div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {/* Empty padding before 1st day */}
            {Array.from({ length: firstDayWeekday }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[85px] bg-slate-50/40 rounded-xl border border-slate-100"></div>
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const pad = (n: number) => String(n).padStart(2, '0');
              const dateKey = `2026-${pad(selectedMonth + 1)}-${pad(dayNum)}`;
              const tagInfo = state.kalender[dateKey];
              const typ: KalenderTagTyp = tagInfo?.primaerTyp || 'frei';
              const labelConfig = tagTypLabels[typ];

              return (
                <div
                  key={dayNum}
                  onClick={() => handleDayClick(dayNum)}
                  className={`min-h-[85px] p-2 rounded-xl border transition-all flex flex-col justify-between cursor-pointer group hover:shadow-xs ${
                    typ === 'frei'
                      ? 'bg-slate-50/60 border-slate-200 hover:bg-white hover:border-slate-300'
                      : `${labelConfig.color} hover:opacity-90`
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800">
                      {dayNum}
                    </span>
                    {tagInfo?.isAusnahme && (
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500" title="Manuell angepasst"></span>
                    )}
                  </div>

                  {typ !== 'frei' ? (
                    <div className="text-[10px] font-bold truncate mt-1">
                      {labelConfig.label}
                    </div>
                  ) : (
                    <div className="text-[9px] text-slate-400 font-medium">Frei</div>
                  )}

                  <div className="text-[9px] text-slate-400 font-mono">
                    {dateKey >= '2026-07-15' ? 'FFM' : 'Gorx'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
