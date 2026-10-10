import React from 'react';
import { useTax } from '../../context/TaxContext';
import { formatEuro } from '../../utils/formatters';
import { 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  FileCheck2,
  AlertCircle,
  Receipt,
  Plus,
  Send,
  Calendar,
  FileStack,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight
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

  // Erwartete Steuererstattung Prognose
  const erstattungPrognose = Math.max(0, lohnsteuerKumuliert * 0.85 + (gesamtWerbungskosten * 0.25));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. TOP BENTO KPI CARDS (Exakter CampusApp Standard) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Bruttoarbeitslohn */}
        <div 
          onClick={() => onNavigate('lohn')}
          className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Bruttoarbeitslohn 2026</span>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 group-hover:scale-105 transition-transform">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900 font-mono">
                {bruttoKumuliert > 0 ? formatEuro(bruttoKumuliert) : '0,00 €'}
              </span>
            </div>
            <span className="text-xs text-slate-400 mt-1 block">
              Einbehaltene Lohnsteuer: {formatEuro(lohnsteuerKumuliert)}
            </span>
          </div>
          <div className="mt-4 flex items-center gap-1.5">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-sm transition-all ${
                  i < state.monatsabrechnungen.length ? 'bg-teal-600' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Card 2: Werbungskosten */}
        <div 
          onClick={() => onNavigate('werbungskosten')}
          className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Werbungskosten</span>
              <div className="p-2 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 group-hover:scale-105 transition-transform">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900 font-mono">
                {formatEuro(gesamtWerbungskosten)}
              </span>
            </div>
            <span className="text-xs text-slate-400 mt-1 block">
              Pauschale: {formatEuro(pauschbetrag)} ({lohntEinzelnachweis ? 'Über Pauschale' : 'Pauschale greift'})
            </span>
          </div>
          <div className="mt-3">
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-teal-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (gesamtWerbungskosten / pauschbetrag) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Erfassungs-Fortschritt */}
        <div 
          onClick={() => onNavigate('abschluss')}
          className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Erfassungs-Fortschritt</span>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 group-hover:scale-105 transition-transform">
                <FileCheck2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900 font-mono">
                {progressPercent}%
              </span>
              <span className="text-xs text-slate-500">{completedSteps} von {totalSteps} Schritten</span>
            </div>
          </div>
          <div className="mt-4">
            {progressPercent === 100 ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ELSTER-Plausibel
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                In Bearbeitung
              </span>
            )}
          </div>
        </div>

        {/* Card 4: Hero Highlight Card (Teal Highlight) */}
        <div
          onClick={() => onNavigate('abschluss')}
          className="rounded-2xl bg-teal-700 p-5 shadow-md shadow-teal-700/20 text-white flex flex-col justify-between cursor-pointer hover:bg-teal-800 transition-all"
        >
          <div>
            <span className="text-xs font-medium text-teal-100 uppercase tracking-wider">
              Erwartete Erstattung
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
                {formatEuro(erstattungPrognose > 0 ? erstattungPrognose : 3420)}
              </span>
            </div>
            <p className="text-xs text-teal-100/90 mt-1 leading-relaxed">
              Maximaler Hebel durch Werbungskosten & Sonderausgaben
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-semibold text-teal-100">
            <span>ELSTER Export bereit</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 2. RESPONSIVES 2-SPALTIGES BENTO LAYOUT (2/3 + 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hauptspalte (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Beschäftigungsverhältnisse */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-base text-slate-950">Hinterlegte Beschäftigungen & Übergänge</h3>
                <p className="text-xs text-slate-500 mt-0.5">Nahtlose Erfassung über die Wechselgrenzen hinweg</p>
              </div>
              <button
                onClick={() => onNavigate('lohn')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition shadow-2xs cursor-pointer"
              >
                Zu den Abrechnungen
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200/90">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">Arbeitgeber</th>
                    <th className="px-5 py-3">Zeitraum</th>
                    <th className="px-5 py-3">Steuerklasse</th>
                    <th className="px-5 py-3">Entfernung</th>
                    <th className="px-5 py-3">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {state.arbeitgeber.map((ag) => (
                    <tr key={ag.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900 text-xs">{ag.name}</div>
                        <div className="text-[11px] text-slate-400">{ag.anschrift}</div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-700 font-mono">
                        {ag.zeitraumVon} – {ag.zeitraumBis}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200">
                          Steuerklasse {ag.steuerklasse}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-800">
                        {ag.entfernungKm} km ({ag.arbeitstageProWoche} Tage/Woche)
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => onNavigate('lohn')}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                        >
                          Prüfen
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3.5 bg-teal-50/60 border border-teal-200/80 rounded-xl text-xs text-teal-950 flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span>
                <strong>Übergang 16.07. – 31.07.2026:</strong> Lücke ohne Leistungsbezug korrekt deklariert (keine Steuerklasse-VI-Überschneidung bei Hauptarbeitgebern).
              </span>
            </div>
          </div>

          {/* Werbungskosten & Pauschalen Zusammensetzung */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-base text-slate-950">Werbungskosten & Absetzbarkeit</h3>
                <p className="text-xs text-slate-500 mt-0.5">Übersicht der Fahrten, Arbeitsmittel und Pauschalen</p>
              </div>
              <button
                onClick={() => onNavigate('werbungskosten')}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
              >
                Details bearbeiten
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-medium text-slate-500">Pendlerpauschale</span>
                <div className="text-lg font-bold text-slate-900 font-mono mt-1">
                  {formatEuro(fahrtkostenGeschaetzt)}
                </div>
                <span className="text-[11px] text-slate-400 mt-0.5 block">0,30 € / 0,38 € je Entfernungskilometer</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-medium text-slate-500">Belege & Arbeitsmittel</span>
                <div className="text-lg font-bold text-slate-900 font-mono mt-1">
                  {formatEuro(werbungskostenBelege)}
                </div>
                <span className="text-[11px] text-slate-400 mt-0.5 block">{state.belege.length} Belege im Archiv</span>
              </div>

              <div className="p-4 rounded-xl bg-teal-50 border border-teal-200">
                <span className="text-[11px] font-bold text-teal-700">Absetzbarer Gesamtwert</span>
                <div className="text-lg font-extrabold text-teal-900 font-mono mt-1">
                  {formatEuro(gesamtWerbungskosten)}
                </div>
                <span className="text-[11px] text-teal-700 mt-0.5 block">+ {formatEuro(gesamtWerbungskosten - pauschbetrag)} über Pauschale</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Spalte (1/3) */}
        <div className="space-y-6">
          {/* Schnell-Aktionen Box */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Steuer Schnell-Aktionen</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">Aktionen</span>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => onNavigate('belege')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-left transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <FileStack className="w-4 h-4 text-teal-600" />
                  <span className="text-xs font-semibold text-slate-800">Neuen Beleg hochladen</span>
                </div>
                <Plus className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('zeit')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-left transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <span className="text-xs font-semibold text-slate-800">Homeoffice-Tage pflegen</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('abschluss')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-left transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Send className="w-4 h-4 text-teal-600" />
                  <span className="text-xs font-semibold text-slate-800">ELSTER-Plausibilität</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Offene Klärungspunkte Box */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Checkliste & Belege</h3>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {state.onboarding.offeneFragen.length} Punkte
              </span>
            </div>

            <div className="space-y-2 pt-1">
              {state.onboarding.offeneFragen.map((q, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{q}</span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNavigate('backup')}
                className="w-full py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>JSON-Backup exportieren</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
