import React, { useState } from 'react';
import { useTax } from '../../context/TaxContext';
import type { WerbungskostenKategorie, Beleg } from '../../types/tax';
import { formatEuro } from '../../utils/formatters';
import { 
  Receipt, 
  Car, 
  Home, 
  Laptop, 
  GraduationCap, 
  Building2, 
  Plus, 
  Trash2, 
  FileText
} from 'lucide-react';

export const WerbungskostenView: React.FC = () => {
  const { state, updateState } = useTax();
  const [activeKategorie, setActiveKategorie] = useState<WerbungskostenKategorie>('wege_arbeit');

  // Neues Beleg-Modal / Schnelleingabe State
  const [newTitle, setNewTitle] = useState('');
  const [newBetrag, setNewBetrag] = useState<number>(0);
  const [newDatum, setNewDatum] = useState('2026-03-01');

  // Kalender-Tageszählung für automatisierte Pauschalen
  const kalenderTage = Object.values(state.kalender);
  const tageArbeitA = kalenderTage.filter(t => t.primaerTyp === 'arbeit_vor_ort_a').length;
  const tageArbeitB = kalenderTage.filter(t => t.primaerTyp === 'arbeit_vor_ort_b').length;
  const tageHomeoffice = kalenderTage.filter(t => t.primaerTyp === 'homeoffice').length;

  // 1. Wege zur Arbeit Berechnung: Entfernungspauschale 0,30 € (ab 21. km 0,38 €)
  const berechnePendlerpauschale = (km: number, tage: number) => {
    if (km <= 20) {
      return tage * km * state.config.entfernungspauschaleProKm;
    }
    const erste20km = tage * 20 * state.config.entfernungspauschaleProKm;
    const ab21km = tage * (km - 20) * state.config.entfernungspauschaleAb21Km;
    return erste20km + ab21km;
  };

  const agA = state.arbeitgeber.find(a => a.id === 'ag_a');
  const agB = state.arbeitgeber.find(a => a.id === 'ag_b');

  // Fahrtkosten AG A (pfenning: 70 km) und AG B (B.Schmitt: 9 km)
  const distA = agA?.entfernungKm || 70;
  const distB = agB?.entfernungKm || 9;
  const fahrtkostenA = berechnePendlerpauschale(distA, tageArbeitA > 0 ? tageArbeitA : 65);
  const fahrtkostenB = berechnePendlerpauschale(distB, tageArbeitB > 0 ? tageArbeitB : 45);
  const summeFahrtkosten = fahrtkostenA + fahrtkostenB;

  // 2. Homeoffice-Pauschale: 6 € / Tag, max 210 Tage (1.260 €)
  const effectiveHoTage = tageHomeoffice > 0 ? tageHomeoffice : 40;
  const anrechenbareHoTage = Math.min(effectiveHoTage, state.config.homeofficeMaxTage);
  const summeHomeoffice = anrechenbareHoTage * state.config.homeofficeTagessatz;

  // Belege filtern nach Kategorie
  const belegeZuKategorie = state.belege.filter(b => b.kategorie === activeKategorie);

  // Gesamtsumme aller erfassten Werbungskosten
  const alleWerbungskostenBelege = state.belege
    .filter(b => b.kategorie !== 'sonderausgaben' && b.kategorie !== 'lohn')
    .reduce((acc, b) => acc + b.betrag, 0);
  const gesamtsummeWerbungskosten = summeFahrtkosten + summeHomeoffice + alleWerbungskostenBelege;
  const pauschbetrag = state.config.arbeitnehmerPauschbetrag;
  const vorteilGegenueberPauschbetrag = Math.max(0, gesamtsummeWerbungskosten - pauschbetrag);

  const handleAddBeleg = () => {
    if (!newTitle.trim() || newBetrag <= 0) return;

    const newBeleg: Beleg = {
      id: `bel_${Date.now()}`,
      datum: newDatum,
      titel: newTitle.trim(),
      betrag: newBetrag,
      kategorie: activeKategorie,
      status: 'bestaetigt',
      ohneNachweis: false,
    };

    updateState(prev => ({
      ...prev,
      belege: [...prev.belege, newBeleg],
    }));

    setNewTitle('');
    setNewBetrag(0);
  };

  const handleDeleteBeleg = (id: string) => {
    updateState(prev => ({
      ...prev,
      belege: prev.belege.filter(b => b.id !== id),
    }));
  };

  const kategorienConfig: Record<WerbungskostenKategorie, { label: string; icon: any; desc: string }> = {
    wege_arbeit: { 
      label: 'Wege zur Arbeit (Pendler)', 
      icon: Car, 
      desc: 'Entfernungspauschale automatisch berechnet aus Kalendertagen und km-Distanz' 
    },
    homeoffice: { 
      label: 'Homeoffice-Pauschale', 
      icon: Home, 
      desc: '6,00 € pro Tag (max. 1.260 €) aus deinen Kalendereinträgen' 
    },
    arbeitsmittel: { 
      label: 'Arbeitsmittel & GWG', 
      icon: Laptop, 
      desc: 'Computer, Fachliteratur, Schreibtisch & Software (Sofortabschreibung)' 
    },
    fortbildung_bewerbung: { 
      label: 'Bewerbung & Umzug', 
      icon: FileText, 
      desc: 'Kosten für Jobwechsel von pfenning zu B.Schmitt mobile GmbH' 
    },
    reisekosten: { 
      label: 'Reisekosten & Spesen', 
      icon: Building2, 
      desc: 'Verpflegungsmehraufwand bei Auswärtstätigkeit' 
    },
    doppelte_haushaltsfuehrung: { 
      label: 'Doppelte Haushaltsführung', 
      icon: Building2, 
      desc: 'Zweitwohnung Gorxheimertal bis 15.07.2026' 
    },
    studienkosten: { 
      label: 'Studium & TH Mannheim', 
      icon: GraduationCap, 
      desc: 'Semesterbeiträge, Literatur und Fahrten zur TH Mannheim' 
    },
    sonstiges: { 
      label: 'Sonstiges & Kontoführung', 
      icon: Receipt, 
      desc: 'Kontoführungspauschale (16 €), Telefon & Internet Anteil' 
    },
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Card mit Live-Gegenüberstellung */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-50 border border-teal-100 text-teal-700">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Werbungskosten & Steuerabzug</h2>
              <p className="text-xs text-slate-500">
                Pauschbetrag ({formatEuro(pauschbetrag)}) vs. Einzelnachweis ({formatEuro(gesamtsummeWerbungskosten)})
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Werbungskosten Gesamt</span>
            <span className="text-base font-extrabold text-slate-900">{formatEuro(gesamtsummeWerbungskosten)}</span>
          </div>

          <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs font-mono">
            <span className="text-[10px] text-teal-700 block uppercase font-bold">Vorteil vs. Pauschale</span>
            <span className="text-base font-extrabold text-teal-900">+{formatEuro(vorteilGegenueberPauschbetrag)}</span>
          </div>
        </div>
      </div>

      {/* Kategorien-Auswahl Tabs im Pill-Design */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {(Object.keys(kategorienConfig) as WerbungskostenKategorie[]).map((kat) => {
          const cfg = kategorienConfig[kat];
          const Icon = cfg.icon;
          const active = activeKategorie === kat;

          return (
            <button
              key={kat}
              onClick={() => setActiveKategorie(kat)}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                active
                  ? 'bg-teal-50 border-teal-200 text-teal-950 shadow-2xs font-bold'
                  : 'bg-white border-slate-200/90 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${active ? 'text-teal-700' : 'text-slate-400'}`} />
                <span className="text-xs truncate">{cfg.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Haupt-Detailbereich */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
            {kategorienConfig[activeKategorie].label}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {kategorienConfig[activeKategorie].desc}
          </p>
        </div>

        {/* 1. Spezial-Ansicht für Wege zur Arbeit */}
        {activeKategorie === 'wege_arbeit' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* AG A: pfenning logistics */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-900">pfenning logistics (Heddesheim)</span>
                  <span className="text-xs font-mono text-teal-700 font-bold">{formatEuro(fahrtkostenA)}</span>
                </div>
                <div className="text-xs text-slate-500 space-y-1">
                  <div>Einfache Entfernung: <strong className="text-slate-900">70 km</strong></div>
                  <div>Gefahrene Arbeitstage: <strong className="text-slate-900">{tageArbeitA > 0 ? tageArbeitA : 65} Tage</strong></div>
                  <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-200">
                    20 km × 0,30 € + 50 km × 0,38 € = 25,00 € / Tag
                  </div>
                </div>
              </div>

              {/* AG B: B.Schmitt mobile */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-900">B.Schmitt mobile GmbH (Frankfurt am Main)</span>
                  <span className="text-xs font-mono text-teal-700 font-bold">{formatEuro(fahrtkostenB)}</span>
                </div>
                <div className="text-xs text-slate-500 space-y-1">
                  <div>Einfache Entfernung: <strong className="text-slate-900">{distB} km</strong> (Westerbachstraße)</div>
                  <div>Gefahrene Arbeitstage: <strong className="text-slate-900">{tageArbeitB > 0 ? tageArbeitB : 45} Tage</strong></div>
                  <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-200">
                    {distB} km × 0,30 € = {(distB * 0.30).toFixed(2).replace('.', ',')} € / Tag
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-between text-xs">
              <span className="font-semibold text-teal-950">Pendlerpauschale gesamt 2026:</span>
              <span className="font-mono text-base font-extrabold text-teal-900">{formatEuro(summeFahrtkosten)}</span>
            </div>
          </div>
        )}

        {/* 2. Spezial-Ansicht für Homeoffice-Pauschale */}
        {activeKategorie === 'homeoffice' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-900">Homeoffice-Pauschale nach § 4 Abs. 5 Satz 1 Nr. 6b EStG</span>
                <span className="text-xs font-mono text-teal-700 font-bold">{formatEuro(summeHomeoffice)}</span>
              </div>
              <div className="text-xs text-slate-500 space-y-1">
                <div>Erfasste Homeoffice-Tage im Kalender: <strong className="text-slate-900">{anrechenbareHoTage} Tage</strong> (max. 210 Tage)</div>
                <div>Tagessatz: <strong className="text-slate-900">6,00 € / Tag</strong></div>
              </div>
            </div>
          </div>
        )}

        {/* 3. Belege erfassen & auflisten für alle anderen Kategorien */}
        {activeKategorie !== 'wege_arbeit' && activeKategorie !== 'homeoffice' && (
          <div className="space-y-4">
            {/* Schnelleingabe Formular */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                placeholder="Bezeichnung (z. B. Fachbuch Python, Bürostuhl)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Betrag (€)"
                value={newBetrag || ''}
                onChange={(e) => setNewBetrag(parseFloat(e.target.value) || 0)}
                className="w-28 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-teal-600"
              />
              <input
                type="date"
                value={newDatum}
                onChange={(e) => setNewDatum(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-teal-600"
              />
              <button
                onClick={handleAddBeleg}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition shadow-2xs cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Hinzufügen</span>
              </button>
            </div>

            {/* Belege Tabelle */}
            {belegeZuKategorie.length === 0 ? (
              <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                Keine Belege in dieser Kategorie hinterlegt. Nutze die Eingabe oben, um Belege hinzuzufügen.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200/90">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3">Datum</th>
                      <th className="px-5 py-3">Bezeichnung</th>
                      <th className="px-5 py-3">Betrag</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {belegeZuKategorie.map((beleg) => (
                      <tr key={beleg.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-slate-600">{beleg.datum}</td>
                        <td className="px-5 py-3.5 font-semibold text-slate-900">{beleg.titel}</td>
                        <td className="px-5 py-3.5 font-mono font-bold text-teal-700">{formatEuro(beleg.betrag)}</td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {beleg.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <button
                            onClick={() => handleDeleteBeleg(beleg.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                            title="Löschen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
