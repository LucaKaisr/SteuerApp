import React, { useState } from 'react';
import { useTax } from '../../context/TaxContext';
import type { ArbeitgeberId, Lohnsteuerbescheinigung } from '../../types/tax';
import { formatEuro } from '../../utils/formatters';
import { 
  Briefcase, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Calendar, 
  ExternalLink, 
  ShieldCheck 
} from 'lucide-react';

export const LohnView: React.FC = () => {
  const { state, updateState } = useTax();
  const [selectedAgId, setSelectedAgId] = useState<ArbeitgeberId>('ag_a');
  const [activeTab, setActiveTab] = useState<'bescheinigung' | 'monate'>('bescheinigung');
  const [extractError] = useState<string | null>(null);
  const [extractSuccess] = useState<string | null>(null);

  const currentAg = state.arbeitgeber.find(a => a.id === selectedAgId) || state.arbeitgeber[0];

  const currentBescheinigung: Lohnsteuerbescheinigung = state.lohnsteuerbescheinigungen.find(b => b.arbeitgeberId === selectedAgId) || {
    id: `lsb_${selectedAgId}`,
    arbeitgeberId: selectedAgId,
    jahr: 2026,
    zeile3_bruttoarbeitslohn: 0,
    zeile4_lohnsteuer: 0,
    zeile5_solidaritaetszuschlag: 0,
    zeile6_kirchensteuer: 0,
    zeile22a_rv_arbeitgeber: 0,
    zeile23a_rv_arbeitnehmer: 0,
    zeile25_kv_arbeitnehmer: 0,
    zeile26_pv_arbeitnehmer: 0,
    zeile27_av_arbeitnehmer: 0,
    zeile17_steuerfreie_fahrtkosten: 0,
    zeile18_pauschal_besteuerte_bezuege: 0,
    bestaetigt: false,
  };

  // Monatsabrechnungen filtern
  const agMonatsabrechnungen = state.monatsabrechnungen.filter(m => m.arbeitgeberId === selectedAgId);
  const monateSummeBrutto = agMonatsabrechnungen.reduce((sum, m) => sum + m.brutto, 0);

  // Speichern der Bescheinigung
  const handleUpdateBescheinigungField = (field: keyof Lohnsteuerbescheinigung, value: number | boolean | string) => {
    updateState((prev) => {
      const exists = prev.lohnsteuerbescheinigungen.some(b => b.arbeitgeberId === selectedAgId);
      const updatedItem: Lohnsteuerbescheinigung = {
        ...currentBescheinigung,
        [field]: value,
      };

      return {
        ...prev,
        lohnsteuerbescheinigungen: exists
          ? prev.lohnsteuerbescheinigungen.map(b => b.arbeitgeberId === selectedAgId ? updatedItem : b)
          : [...prev.lohnsteuerbescheinigungen, updatedItem],
      };
    });
  };

  const monatsNamen = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-7xl mx-auto">
      
      {/* Top Header Card mit Arbeitgeber-Auswahl */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-100 text-teal-700">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Lohnsteuerbescheinigungen & Abrechnungen</h2>
              <p className="text-xs text-slate-500">
                Amtliche Zeilen 3–27 (Anlage N) und Monatsabrechnungen mit centgenauer Nachberechnung
              </p>
            </div>
          </div>
        </div>

        {/* Arbeitgeber-Auswahl Switcher Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {state.arbeitgeber.map((ag) => {
            const isSelected = selectedAgId === ag.id;
            return (
              <button
                key={ag.id}
                type="button"
                onClick={() => setSelectedAgId(ag.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-teal-600 text-white shadow-xs scale-102'
                    : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{ag.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  StKl. {ag.steuerklasse}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub-Tabs: Bescheinigung vs. Monatsabrechnungen */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <button
            type="button"
            onClick={() => setActiveTab('bescheinigung')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'bescheinigung'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Lohnsteuerbescheinigung (Zeilen 3–27)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('monate')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'monate'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Monatsabrechnungen ({agMonatsabrechnungen.length} Monate)</span>
          </button>
        </div>

        <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl hidden sm:inline-block">
          Aktuell gewählt: {currentAg.name}
        </span>
      </div>

      {/* Feedback Alerts */}
      {extractError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{extractError}</span>
        </div>
      )}
      {extractSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{extractSuccess}</span>
        </div>
      )}

      {/* TAB 1: Lohnsteuerbescheinigung */}
      {activeTab === 'bescheinigung' && (
        <div key={`tab_lsb_${selectedAgId}`} className="space-y-6 animate-fadeIn">
          
          {/* Document Vault Notice */}
          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-950">
                <ShieldCheck className="w-4 h-4 text-teal-700" />
                <span>Originalbeleg im Dokumenten-Tresor hinterlegt</span>
              </div>
              <p className="text-xs text-slate-600">
                {selectedAgId === 'ag_a'
                  ? 'Amtliche elektronische Lohnsteuerbescheinigung 2026 von pfenning logistics (Stand 30.07.2026)'
                  : 'DATEV Entgelt- & Verdienstbescheinigung von B.Schmitt mobile GmbH (Stand September 2026)'}
              </p>
            </div>

            <a
              href={selectedAgId === 'ag_a' ? '/documents/pfenning/1000020_3009514_202607_Lohnsteuerbescheinigung202607_lsb_301501786042268042.pdf' : '/documents/bschmitt/Gehaltsnachweise _09_26.pdf'}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white text-teal-900 border border-teal-200 hover:bg-teal-50 text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 shrink-0 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" /> PDF-Original öffnen
            </a>
          </div>

          {/* 2-Spalten Formular für Zeilen 3–27 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Linke Spalte: Steuerabzüge */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
              <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                <span>Steuerdaten (Zeilen 3–6)</span>
                <span className="text-xs text-teal-700 font-mono font-normal">Anlage N</span>
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Zeile 3: Bruttoarbeitslohn (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={currentBescheinigung.zeile3_bruttoarbeitslohn}
                    onChange={(e) => handleUpdateBescheinigungField('zeile3_bruttoarbeitslohn', parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold font-mono text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Zeile 4: Einbehaltene Lohnsteuer (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={currentBescheinigung.zeile4_lohnsteuer}
                    onChange={(e) => handleUpdateBescheinigungField('zeile4_lohnsteuer', parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold font-mono text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Zeile 5: Soli (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={currentBescheinigung.zeile5_solidaritaetszuschlag}
                      onChange={(e) => handleUpdateBescheinigungField('zeile5_solidaritaetszuschlag', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Zeile 6: Kirchensteuer rk (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={currentBescheinigung.zeile6_kirchensteuer}
                      onChange={(e) => handleUpdateBescheinigungField('zeile6_kirchensteuer', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Rechte Spalte: Sozialabgaben */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
              <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                <span>Vorsorgeaufwand (Zeilen 22–27)</span>
                <span className="text-xs text-teal-700 font-mono font-normal">Sonderausgaben</span>
              </h4>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Zeile 22a: RV Arbeitgeber (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={currentBescheinigung.zeile22a_rv_arbeitgeber}
                      onChange={(e) => handleUpdateBescheinigungField('zeile22a_rv_arbeitgeber', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Zeile 23a: RV Arbeitnehmer (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={currentBescheinigung.zeile23a_rv_arbeitnehmer}
                      onChange={(e) => handleUpdateBescheinigungField('zeile23a_rv_arbeitnehmer', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                  <div className="flex justify-between items-center">
                    <span>Werkstudenten-Status (KV/PV/AV):</span>
                    <span className="font-bold text-emerald-700">Beitragsfrei (0,00 €)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Als immatrikulierter Student (PGR 106) fallen keine Pflichtbeiträge zu Zeilen 25, 26 und 27 an.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: Monatsabrechnungen */}
      {activeTab === 'monate' && (
        <div key={`tab_monate_${selectedAgId}`} className="space-y-6 animate-fadeIn">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-4 gap-2">
              <div>
                <h3 className="font-bold text-base text-slate-950">
                  Monatliche Abrechnungen für {currentAg.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Centgenaue Monatsbezüge inklusive Nachberechnungen & Überstundenabgeltung
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200">
                Summe erfasst: {formatEuro(monateSummeBrutto)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {monatsNamen.map((name, idx) => {
                const monatNum = idx + 1;
                const existing = agMonatsabrechnungen.find(m => m.monat === monatNum);

                return (
                  <div
                    key={`${selectedAgId}_monat_${monatNum}`}
                    className={`p-4 rounded-xl border transition-all space-y-2 ${
                      existing
                        ? 'border-slate-200 bg-white shadow-xs'
                        : 'border-slate-100 bg-slate-50/40 opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                      <span>{name} 2026</span>
                      {existing ? (
                        <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          {formatEuro(existing.brutto)}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-normal">Nicht relevant</span>
                      )}
                    </div>

                    {existing ? (
                      <div className="space-y-1 text-xs text-slate-600 font-mono pt-1 border-t border-slate-100">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Netto:</span>
                          <span className="font-bold text-slate-800">{formatEuro(existing.netto)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Lohnsteuer:</span>
                          <span className="font-semibold text-slate-700">{formatEuro(existing.lohnsteuer)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">RV-Beitrag:</span>
                          <span className="font-semibold text-slate-700">{formatEuro(existing.svBeitraegeGesamt)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 italic py-2 text-center">
                        Kein Beschäftigungszeitraum
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
