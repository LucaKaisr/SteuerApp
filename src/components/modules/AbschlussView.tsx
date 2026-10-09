import React, { useState } from 'react';
import { useTax } from '../../context/TaxContext';
import { formatEuro } from '../../utils/formatters';
import { storageService } from '../../services/storageService';
import { 
  Send, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  FileText, 
  Calculator, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const AbschlussView: React.FC = () => {
  const { state, updateState } = useTax();
  const [activeTab, setActiveTab] = useState<'elster' | 'bescheid' | 'mehrjahre'>('elster');

  // Bescheid-Abgleich State
  const [bescheidDatum, setBescheidDatum] = useState('2027-05-15');
  const [einspruchText, setEinspruchText] = useState<string | null>(null);

  // 1. ELSTER-Werte aggregieren
  const bruttoGesamt = state.lohnsteuerbescheinigungen.reduce((acc, l) => acc + l.zeile3_bruttoarbeitslohn, 0);
  const lohnsteuerGesamt = state.lohnsteuerbescheinigungen.reduce((acc, l) => acc + l.zeile4_lohnsteuer, 0);
  const soliGesamt = state.lohnsteuerbescheinigungen.reduce((acc, l) => acc + l.zeile5_solidaritaetszuschlag, 0);
  const kirchensteuerGesamt = state.lohnsteuerbescheinigungen.reduce((acc, l) => acc + l.zeile6_kirchensteuer, 0);
  const rvArbeitnehmer = state.lohnsteuerbescheinigungen.reduce((acc, l) => acc + l.zeile23a_rv_arbeitnehmer, 0);
  const kvArbeitnehmer = state.lohnsteuerbescheinigungen.reduce((acc, l) => acc + l.zeile25_kv_arbeitnehmer, 0);
  const pvArbeitnehmer = state.lohnsteuerbescheinigungen.reduce((acc, l) => acc + l.zeile26_pv_arbeitnehmer, 0);
  const fahrtkostenZuschussAG = state.lohnsteuerbescheinigungen.reduce((acc, l) => acc + l.zeile17_steuerfreie_fahrtkosten, 0);

  // Kalendertage
  const kalenderTage = Object.values(state.kalender);
  const tageArbeitA = kalenderTage.filter(t => t.primaerTyp === 'arbeit_vor_ort_a').length;
  const tageArbeitB = kalenderTage.filter(t => t.primaerTyp === 'arbeit_vor_ort_b').length;
  const tageHomeoffice = kalenderTage.filter(t => t.primaerTyp === 'homeoffice').length;

  // Pendlerpauschale
  const agA = state.arbeitgeber.find(a => a.id === 'ag_a');
  const agB = state.arbeitgeber.find(a => a.id === 'ag_b');

  const pendlerBetragA = tageArbeitA * (20 * 0.30 + (Math.max(0, (agA?.entfernungKm || 70) - 20) * 0.38));
  const pendlerBetragB = tageArbeitB * ((agB?.entfernungKm || 6) * 0.30);
  const pendlerGesamtBrutto = pendlerBetragA + pendlerBetragB;
  const pendlerNachAbzugZuschuss = Math.max(0, pendlerGesamtBrutto - fahrtkostenZuschussAG);

  const homeofficeBetrag = Math.min(tageHomeoffice, state.config.homeofficeMaxTage) * state.config.homeofficeTagessatz;

  // Belege
  const sonstWerbungskosten = state.belege
    .filter(b => b.kategorie !== 'sonderausgaben' && b.kategorie !== 'lohn')
    .reduce((acc, b) => acc + b.betrag, 0);

  const werbungskostenSumme = pendlerNachAbzugZuschuss + homeofficeBetrag + sonstWerbungskosten;

  // Prüfliste vor Export (3.7)
  const checkliste = [
    {
      titel: 'Lohnsteuerbescheinigungen beider Arbeitgeber erfasst',
      ok: state.lohnsteuerbescheinigungen.length >= 2,
      hinweis: state.lohnsteuerbescheinigungen.length < 2 ? 'Es fehlen noch Bescheinigungen für AG A oder AG B' : 'Vollständig',
    },
    {
      titel: 'Kalender-Tage gepflegt',
      ok: kalenderTage.length >= 20,
      hinweis: kalenderTage.length < 20 ? 'Bisher wenige Tage gestempelt (Wochenmuster nutzen)' : `${kalenderTage.length} Tage erfasst`,
    },
    {
      titel: 'Werbungskosten vs. Pauschbetrag',
      ok: true,
      hinweis: werbungskostenSumme > state.config.arbeitnehmerPauschbetrag ? 'Einzelnachweis lohnt sich' : 'Pauschbetrag 1.230 € greift',
    },
    {
      titel: 'Steuerfreie Fahrtkostenzuschüsse gegengerechnet',
      ok: true,
      hinweis: fahrtkostenZuschussAG > 0 ? `${formatEuro(fahrtkostenZuschussAG)} gekürzt` : 'Kein AG-Zuschuss',
    },
  ];

  // Einspruchsschreiben Entwurf generieren (3.7a)
  const handleGenerateEinspruch = () => {
    const text = `Absender:
Luca Kaiser

An das Finanzamt
[Zuständiges Finanzamt]

Steuernummer / Steuer-ID: [Deine Steuer-ID]
Datum des Bescheids: ${bescheidDatum}

EINSPRUCH gegen den Einkommensteuerbescheid für das Kalenderjahr 2026 vom ${bescheidDatum}

Sehr geehrte Damen und Herren,

hiermit lege ich fristgerecht Einspruch gegen den oben genannten Einkommensteuerbescheid für das Veranlagungsjahr 2026 ein.

Begründung:
Im ergangenen Bescheid weicht die festgesetzte Einkommensteuer / Erstattung von den in meiner Einkommensteuererklärung erklärten Angaben ab:
- Erklärte Werbungskosten / Entfernungspauschale: ${formatEuro(werbungskostenSumme)}
- Berücksichtigte Erststudienkosten (Sonderausgaben nach § 10 Abs. 1 Nr. 7 EStG): Nachgewiesen für TH Mannheim

Ich beantrage die antragsgemäße Festsetzung unter Berücksichtigung der erklärten Werbungskosten und Sonderausgaben.

Mit freundlichen Grüßen
Luca Kaiser`;

    setEinspruchText(text);
  };

  // Fristenrechner (1 Monat Bekanntgabefiktion + Frist nach § 122 AO / § 355 AO)
  const berechneEinspruchsfrist = (datumStr: string) => {
    try {
      const dt = new Date(datumStr);
      // +3 Tage Bekanntgabe + 1 Monat
      dt.setDate(dt.getDate() + 3);
      dt.setMonth(dt.getMonth() + 1);
      return dt.toLocaleDateString('de-DE');
    } catch {
      return 'Ungültiges Datum';
    }
  };

  // Mehrjahresfähigkeit (3.7b): Neues Steuerjahr anlegen
  const handleCreateNextYear = () => {
    if (confirm('Möchtest du das Veranlagungsjahr 2027 mit den übernommenen Stammdaten und Arbeitgebern anlegen?')) {
      updateState((prev) => ({
        ...prev,
        config: {
          ...prev.config,
          jahr: 2027,
        },
        lohnsteuerbescheinigungen: [],
        monatsabrechnungen: [],
        kalender: {},
        belege: [],
      }));
      alert('Steuerjahr 2027 erfolgreich initialisiert! Stammdaten und Arbeitgeber wurden übernommen.');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Send className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Modul 3.7 & 3.7a: ELSTER-Ausfüllhilfe, Bescheid-Abgleich & Abschluss</h2>
              <p className="text-sm text-slate-400">
                Strukturierte Übertragung in amtliche Formulare, Einspruchsfristen & Mehrjahres-Wechsel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const backup = storageService.createBackupExport(state, 'abschluss_2026');
                storageService.downloadBackupFile(backup);
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Jahresabschluss-Backup (JSON)
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('elster')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'elster' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          ELSTER-Ausfüllhilfe (Amtliche Zeilen)
        </button>
        <button
          onClick={() => setActiveTab('bescheid')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'bescheid' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Calculator className="w-4 h-4" />
          Bescheid-Abgleich & Fristen (3.7a)
        </button>
        <button
          onClick={() => setActiveTab('mehrjahre')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'mehrjahre' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Mehrjahresfähigkeit (3.7b)
        </button>
      </div>

      {/* TAB 1: ELSTER-Ausfüllhilfe */}
      {activeTab === 'elster' && (
        <div className="space-y-6">
          {/* Prüfliste vor Export */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Prüfliste vor der ELSTER-Übertragung
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {checkliste.map((c, i) => (
                <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2.5 text-xs">
                  {c.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-semibold text-slate-200 block">{c.titel}</span>
                    <span className="text-slate-400 text-[11px]">{c.hinweis}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Formular-Gegenüberstellung: Anlage N */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Anlage N – Einkünfte aus nichtselbständiger Arbeit</h3>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-mono">
                ESt 2026
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="font-bold text-white block">Zeile 6: Bruttoarbeitslohn laut Lohnsteuerbescheinigungen</span>
                  <span className="text-slate-400 text-[11px]">Summe aller Arbeitgeber (pfenning + B.Schmitt + Fußball)</span>
                </div>
                <span className="font-mono font-bold text-white text-sm">{formatEuro(bruttoGesamt)}</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="font-bold text-white block">Zeile 7: Einbehaltene Lohnsteuer</span>
                  <span className="text-slate-400 text-[11px]">Auf Steuerkarte abgeführte Lohnsteuer</span>
                </div>
                <span className="font-mono font-bold text-white text-sm">{formatEuro(lohnsteuerGesamt)}</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="font-bold text-white block">Zeile 8 & 9: Solidaritätszuschlag & Kirchensteuer</span>
                  <span className="text-slate-400 text-[11px]">Abgeführte Zuschlagsteuern</span>
                </div>
                <span className="font-mono font-bold text-white text-sm">
                  {formatEuro(soliGesamt)} Soli / {formatEuro(kirchensteuerGesamt)} KiSt
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="font-bold text-white block">Zeile 31–38: Entfernungspauschale (Wege zwischen Wohnung & Tätigkeitsstätte)</span>
                  <span className="text-slate-400 text-[11px]">
                    pfenning: {tageArbeitA} Tage à 70 km • B.Schmitt: {tageArbeitB} Tage à 6 km (abzgl. {formatEuro(fahrtkostenZuschussAG)} AG-Zuschuss)
                  </span>
                </div>
                <span className="font-mono font-bold text-emerald-400 text-sm">{formatEuro(pendlerNachAbzugZuschuss)}</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="font-bold text-white block">Zeile 44: Homeoffice-Pauschale</span>
                  <span className="text-slate-400 text-[11px]">{tageHomeoffice} Tage à 6,00 €</span>
                </div>
                <span className="font-mono font-bold text-emerald-400 text-sm">{formatEuro(homeofficeBetrag)}</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="font-bold text-white block">Zeile 46–48: Weitere Arbeitsmittel & Werbungskosten</span>
                  <span className="text-slate-400 text-[11px]">Fachbücher, Arbeitsmittel, Zweitwohnung Gorxheimertal</span>
                </div>
                <span className="font-mono font-bold text-emerald-400 text-sm">{formatEuro(sonstWerbungskosten)}</span>
              </div>
            </div>
          </div>

          {/* Formular-Gegenüberstellung: Anlage Vorsorgeaufwand */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Anlage Vorsorgeaufwand – Sozialversicherungsbeiträge</h3>
            <div className="space-y-2 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">Zeile 4: Arbeitnehmerbeiträge zur gesetzlichen Rentenversicherung</span>
                <span className="font-mono font-bold text-white">{formatEuro(rvArbeitnehmer)}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">Zeile 11: Beiträge zur Krankenversicherung (Basisabsicherung)</span>
                <span className="font-mono font-bold text-white">{formatEuro(kvArbeitnehmer)}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">Zeile 13: Beiträge zur gesetzlichen Pflegeversicherung</span>
                <span className="font-mono font-bold text-white">{formatEuro(pvArbeitnehmer)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Bescheid-Abgleich & Fristen (3.7a) */}
      {activeTab === 'bescheid' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-400" />
              Bescheid-Prüfung & Einspruchsfrist (§ 355 AO)
            </h3>
            <p className="text-xs text-slate-400">
              Trage das Datum deines erhaltenen Steuerbescheids ein. Die App errechnet automatisch das Ende der 1-monatigen Einspruchsfrist inklusive der gesetzlichen 3-Tage-Bekanntgabefiktion (§ 122 Abs. 2 AO).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <label className="block text-xs text-slate-400">Datum des Steuerbescheids:</label>
                <input
                  type="date"
                  value={bescheidDatum}
                  onChange={(e) => setBescheidDatum(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-emerald-500"
                />
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 block">Einspruchsfrist endet am:</span>
                <span className="text-lg font-bold font-mono text-amber-400 block">
                  {berechneEinspruchsfrist(bescheidDatum)}
                </span>
                <span className="text-[10px] text-slate-500">
                  (Inkl. 3 Tage Postlaufzeit gem. § 122 Abs. 2 AO)
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleGenerateEinspruch}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-4 py-2.5 rounded-xl border border-slate-700 flex items-center gap-2 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Muster-Einspruchsschreiben generieren
              </button>
            </div>

            {einspruchText && (
              <div className="mt-4 p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
                  <span>Entwurf: Einspruchsschreiben</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(einspruchText);
                      alert('In Zwischenablage kopiert!');
                    }}
                    className="text-emerald-400 hover:underline"
                  >
                    Kopieren
                  </button>
                </div>
                <pre className="text-[11px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {einspruchText}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Mehrjahresfähigkeit (3.7b) */}
      {activeTab === 'mehrjahre' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              Mehrjahresfähigkeit – Veranlagungsjahr 2027 vorbereiten
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Übertrage deine Stammdaten, Arbeitsorte (z. B. B.Schmitt mobile GmbH und Fußballverein) sowie deine Konfiguration direkt in das Steuerjahr 2027. Monatsbelege und Kalendertage werden für das neue Jahr sauber zurückgesetzt.
            </p>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Aktives Steuerjahr: {state.config.jahr}</span>
                <span className="text-[11px] text-slate-400">Einzelveranlagung • Werkstudent</span>
              </div>
              <button
                onClick={handleCreateNextYear}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
              >
                <span>Jahr 2027 anlegen</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
