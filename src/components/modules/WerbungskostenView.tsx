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

  // Kalender-Tageszählung für automatisierte Pauschalen (3.3a / 3.4)
  const kalenderTage = Object.values(state.kalender);
  const tageArbeitA = kalenderTage.filter(t => t.primaerTyp === 'arbeit_vor_ort_a').length;
  const tageArbeitB = kalenderTage.filter(t => t.primaerTyp === 'arbeit_vor_ort_b').length;
  const tageHomeoffice = kalenderTage.filter(t => t.primaerTyp === 'homeoffice').length;
  const tageHochschule = kalenderTage.filter(t => t.primaerTyp === 'hochschule').length;

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

  // Fahrtkosten AG A (pfenning: 70 km) und AG B (B.Schmitt: 6 km)
  const fahrtkostenA = berechnePendlerpauschale(agA?.entfernungKm || 70, tageArbeitA);
  const fahrtkostenB = berechnePendlerpauschale(agB?.entfernungKm || 6, tageArbeitB);
  const summeFahrtkosten = fahrtkostenA + fahrtkostenB;

  // 2. Homeoffice-Pauschale: 6 € / Tag, max 210 Tage (1.260 €)
  const anrechenbareHoTage = Math.min(tageHomeoffice, state.config.homeofficeMaxTage);
  const summeHomeoffice = anrechenbareHoTage * state.config.homeofficeTagessatz;

  const fahrtkostenUni = tageHochschule * 70 * state.config.entfernungspauschaleProKm; // TH Mannheim

  // Belege filtern nach Kategorie
  const belegeZuKategorie = state.belege.filter(b => b.kategorie === activeKategorie);
  const summeBelegeKategorie = belegeZuKategorie.reduce((acc, b) => acc + b.betrag, 0);

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
      label: 'Wege zur Arbeit (Anlage N)', 
      icon: Car, 
      desc: 'Entfernungspauschale automatisch berechnet aus Kalendertagen und km-Distanz' 
    },
    homeoffice: { 
      label: 'Homeoffice-Pauschale', 
      icon: Home, 
      desc: '6,00 € pro Tag (max. 1.260 €) aus deinen Kalendereinträgen' 
    },
    arbeitsmittel: { 
      label: 'Arbeitsmittel', 
      icon: Laptop, 
      desc: 'Computer, Fachliteratur, Schreibtisch & Software (GWG Grenze bis 800 € netto)' 
    },
    fortbildung_bewerbung: { 
      label: 'Bewerbung & Umzug', 
      icon: FileText, 
      desc: 'Kosten für Jobwechsel von pfenning zu B.Schmitt mobile GmbH' 
    },
    reisekosten: { 
      label: 'Reisekosten & Verpflegung', 
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
      label: 'Sonstige Werbungskosten', 
      icon: Receipt, 
      desc: 'Kontoführung, Berufsverband, Telefon/Internet Anteil' 
    },
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Modul 3.4: Werbungskosten & Pauschalen</h2>
              <p className="text-sm text-slate-400">
                Gegenüberstellung zum Arbeitnehmer-Pauschbetrag ({formatEuro(pauschbetrag)})
              </p>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">Aktuelle Summe:</span>
              <span className="text-emerald-400 font-bold text-sm">{formatEuro(gesamtsummeWerbungskosten)}</span>
            </div>
            <div className="h-6 w-px bg-slate-800"></div>
            <div>
              <span className="text-slate-500 block text-[10px]">Mehrwert vs. Pauschale:</span>
              <span className="text-white font-bold text-sm">+{formatEuro(vorteilGegenueberPauschbetrag)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Kategorien-Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {(Object.keys(kategorienConfig) as WerbungskostenKategorie[]).map((kat) => {
          const cfg = kategorienConfig[kat];
          const Icon = cfg.icon;
          const active = activeKategorie === kat;

          return (
            <button
              key={kat}
              onClick={() => setActiveKategorie(kat)}
              className={`p-3 rounded-xl border text-left transition-all ${
                active
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-sm'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${active ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="text-xs font-semibold truncate">{cfg.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail-Ansicht der aktiven Kategorie */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            {kategorienConfig[activeKategorie].label}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {kategorienConfig[activeKategorie].desc}
          </p>
        </div>

        {/* 1. Spezial-Ansicht für Wege zur Arbeit */}
        {activeKategorie === 'wege_arbeit' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* AG A: pfenning logistics */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white">pfenning logistics (Heddesheim)</span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">{formatEuro(fahrtkostenA)}</span>
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>Einfache Entfernung: <strong>70 km</strong></div>
                  <div>Vor-Ort-Arbeitstage laut Kalender: <strong>{tageArbeitA} Tage</strong></div>
                  <div className="text-[11px] text-slate-500">
                    Berechnung: 20 km × 0,30 € + 50 km × 0,38 € = 25,00 €/Tag
                  </div>
                </div>
              </div>

              {/* AG B: B.Schmitt mobile GmbH */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white">B.Schmitt mobile GmbH (Frankfurt)</span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">{formatEuro(fahrtkostenB)}</span>
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>Einfache Entfernung: <strong>6 km</strong></div>
                  <div>Vor-Ort-Arbeitstage laut Kalender: <strong>{tageArbeitB} Tage</strong></div>
                  <div className="text-[11px] text-slate-500">
                    Berechnung: 6 km × 0,30 € = 1,80 €/Tag
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-950/20 border border-blue-900/30 rounded-xl text-xs text-blue-300">
              💡 <strong>Hinweis zur Steuererklärung:</strong> Steuerfreie Fahrtkostenzuschüsse des Arbeitgebers (aus Zeile 17 der Lohnsteuerbescheinigung) mindern diesen Betrag bei der ELSTER-Übertragung automatisch.
            </div>
          </div>
        )}

        {/* 2. Spezial-Ansicht für Homeoffice-Pauschale */}
        {activeKategorie === 'homeoffice' && (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-white">Berechnete Homeoffice-Tage (Kalender 3.3a)</span>
              <span className="text-base font-mono text-emerald-400 font-bold">{formatEuro(summeHomeoffice)}</span>
            </div>
            <div className="text-xs text-slate-400">
              Erfasste Tage: <strong>{tageHomeoffice} Tage</strong> (max. 210 Tage à 6,00 €) = <strong>{anrechenbareHoTage} anrechenbare Tage</strong>.
            </div>
          </div>
        )}

        {/* 3. Spezial-Ansicht für Doppelte Haushaltsführung */}
        {activeKategorie === 'doppelte_haushaltsfuehrung' && (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-white">Wohnung Gorxheimertal (01.01. – 15.07.2026)</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">Aktiv aus Klärungsdialog</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Für den Zeitraum bis 15.07.2026 können Warmmiete (max. 1.000 €/Monat für die Zweitwohnung), notwendige Einrichtungsgegenstände sowie Familienheimfahrten geltend gemacht werden. Trage hier deine Monatsmieten oder Belege ein:
            </p>
          </div>
        )}

        {/* 4. Spezial-Ansicht für Studium */}
        {activeKategorie === 'studienkosten' && (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-white">Präsenztage TH Mannheim (Fahrten)</span>
              <span className="text-base font-mono text-purple-400 font-bold">{formatEuro(fahrtkostenUni)}</span>
            </div>
            <div className="text-xs text-slate-400">
              Präsenztage laut Kalender: <strong>{tageHochschule} Tage</strong> à 70 km Entfernung = {formatEuro(fahrtkostenUni)} berechneter Fahrtaufwand. 
              (Wegen Erststudium steuerlich als Sonderausgaben bis max. {formatEuro(state.config.studienkostenErststudiumMax)} berücksichtigt).
            </div>
          </div>
        )}

        {/* Belegliste der Kategorie & Schnelleingabe */}
        <div className="space-y-4 pt-2">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-slate-300">
              Erfasste Einzelbelege in dieser Kategorie ({belegeZuKategorie.length})
            </h4>
            <span className="text-xs font-mono text-emerald-400 font-semibold">
              Summe: {formatEuro(summeBelegeKategorie)}
            </span>
          </div>

          {/* Formular für schnellen Beleg-Zukauf */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Bezeichnung (z.B. Monitor, Fachbuch, Miete Jan)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
            <input
              type="date"
              value={newDatum}
              onChange={(e) => setNewDatum(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Betrag (€)"
              value={newBetrag || ''}
              onChange={(e) => setNewBetrag(parseFloat(e.target.value) || 0)}
              className="w-28 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
            <button
              onClick={handleAddBeleg}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium px-4 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> Beleg hinzufügen
            </button>
          </div>

          {/* Liste */}
          {belegeZuKategorie.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
              Noch keine Belege in dieser Kategorie hinterlegt.
            </div>
          ) : (
            <div className="space-y-2">
              {belegeZuKategorie.map((b) => (
                <div key={b.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-white mr-2">{b.titel}</span>
                    <span className="text-slate-500 font-mono">{b.datum}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-white">{formatEuro(b.betrag)}</span>
                    <button
                      onClick={() => handleDeleteBeleg(b.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                      title="Löschen"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
