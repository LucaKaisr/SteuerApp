import React from 'react';
import { useTax } from '../../context/TaxContext';
import { formatEuro } from '../../utils/formatters';
import { 
  Briefcase, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  FileCheck2,
  AlertCircle
} from 'lucide-react';

export const DashboardView: React.FC<{ onNavigate: (moduleId: string) => void }> = ({ onNavigate }) => {
  const { state } = useTax();

  // Kennzahlen aggregieren
  const bruttoKumuliert = state.lohnsteuerbescheinigungen.reduce((acc, l) => acc + l.zeile3_bruttoarbeitslohn, 0);
  const lohnsteuerKumuliert = state.lohnsteuerbescheinigungen.reduce((acc, l) => acc + l.zeile4_lohnsteuer, 0);

  // Werbungskosten berechnen (Belege + Fahrten)
  const werbungskostenBelege = state.belege
    .filter(b => b.kategorie !== 'sonderausgaben' && b.kategorie !== 'lohn')
    .reduce((acc, b) => acc + b.betrag, 0);

  // Arbeitstage & Fahrten Schätzung aus Arbeitgeberdaten
  const fahrtkostenGeschaetzt = state.arbeitgeber.reduce((acc, ag) => {
    // 220 Tage / 5 * Arbeitstage pro Woche * 0.30€ * km
    const jahresTage = Math.round((220 / 5) * ag.arbeitstageProWoche);
    return acc + (jahresTage * ag.entfernungKm * state.config.entfernungspauschaleProKm);
  }, 0);

  const gesamtWerbungskosten = werbungskostenBelege + fahrtkostenGeschaetzt;
  const pauschbetrag = state.config.arbeitnehmerPauschbetrag;
  const lohntEinzelnachweis = gesamtWerbungskosten > pauschbetrag;

  // Fortschrittsberechnung
  const totalSteps = 6;
  let completedSteps = 0;
  if (state.onboarding.completed) completedSteps += 1;
  if (state.arbeitgeber.length > 0) completedSteps += 1;
  if (state.lohnsteuerbescheinigungen.length >= 2) completedSteps += 1;
  if (state.monatsabrechnungen.length >= 12) completedSteps += 1;
  if (state.belege.length > 0) completedSteps += 1;
  const progressPercent = Math.round((completedSteps / totalSteps) * 100);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Begrüßung / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 p-6 md:p-8 rounded-3xl border border-slate-800 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Veranlagungsjahr 2026 (Einzelveranlagung)
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Steuer-Cockpit 2026
          </h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Werkstudenten-Status aktiv • 2 Arbeitgeber (pfenning logistics & B.Schmitt mobile GmbH) + Fußball-Amateurvertrag
          </p>
        </div>

        {/* Gesamt-Fortschritt */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 min-w-[240px]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-slate-400">Erfassungs-Fortschritt</span>
            <span className="text-xs font-bold text-emerald-400">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block">
            {completedSteps} von {totalSteps} Hauptbausteinen angelegt
          </span>
        </div>
      </div>

      {/* Wichtige Kennzahlen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Lohn & Steuer */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-medium text-slate-400">Bruttoarbeitslohn (kumuliert)</span>
            <Briefcase className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {bruttoKumuliert > 0 ? formatEuro(bruttoKumuliert) : '0,00 €'}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Bereits einbehaltene Lohnsteuer: <span className="text-slate-300 font-semibold">{formatEuro(lohnsteuerKumuliert)}</span>
          </p>
        </div>

        {/* Werbungskosten vs. Pauschbetrag */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-medium text-slate-400">Werbungskosten (Prognose)</span>
            <TrendingUp className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {formatEuro(gesamtWerbungskosten)}
          </div>
          <div className="mt-2 text-xs flex items-center justify-between">
            <span className="text-slate-500">Pauschbetrag ({formatEuro(pauschbetrag)})</span>
            {lohntEinzelnachweis ? (
              <span className="text-emerald-400 font-medium">✓ Einzelnachweis lohnt sich!</span>
            ) : (
              <span className="text-amber-400 font-medium">Pauschbetrag greift noch</span>
            )}
          </div>
        </div>

        {/* Grundfreibetrag & Erstattungspotenzial */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-medium text-slate-400">Grundfreibetrag 2026</span>
            <FileCheck2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {formatEuro(state.config.grundfreibetrag)}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Liegst du mit zu versteuerndem Einkommen darunter, wird <strong>100%</strong> der Lohnsteuer erstattet.
          </p>
        </div>
      </div>

      {/* Klärungsdialog-Zusammenfassung & Offene To-Dos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Arbeitgeber-Karten */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-400" />
            Hinterlegte Beschäftigungen & Übergänge
          </h2>

          <div className="space-y-3">
            {state.arbeitgeber.map((ag) => (
              <div key={ag.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{ag.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      StKl. {ag.steuerklasse}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Zeitraum: {ag.zeitraumVon} bis {ag.zeitraumBis} • {ag.anschrift} ({ag.entfernungKm} km)
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('lohn')}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors whitespace-nowrap self-start md:self-auto"
                >
                  Zu Abrechnungen →
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-950/30 border border-blue-900/40 rounded-xl text-xs text-blue-300 flex items-start gap-2">
            <Clock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <span>
              <strong>Übergang 16.07. – 31.07.2026:</strong> Lücke ohne Leistungsbezug hinterlegt (keine Steuerklasse-VI-Überschneidung bei Hauptarbeitgebern).
            </span>
          </div>
        </div>

        {/* Offene Punkte aus Klärungsdialog */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              Offene To-Dos (Klärung)
            </h2>
            <div className="space-y-3">
              {state.onboarding.offeneFragen.map((q, idx) => (
                <div key={idx} className="p-3 bg-amber-950/20 border border-amber-900/30 rounded-xl text-xs text-amber-200 flex items-start gap-2">
                  <span className="font-bold text-amber-400 shrink-0">•</span>
                  <span>{q}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={() => onNavigate('backup')}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 px-3 rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Backup erstellen / Daten prüfen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
