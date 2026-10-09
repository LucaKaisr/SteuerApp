import React, { useState } from 'react';
import { formatEuro } from '../../utils/formatters';
import { 
  FileSpreadsheet, 
  HeartHandshake, 
  ShieldAlert, 
  Home, 
  Coins, 
  Plus, 
  Trash2
} from 'lucide-react';

export interface SonderausgabeItem {
  id: string;
  art: 'spende' | 'kirchensteuer' | 'studienkosten_erststudium' | 'vorsorge_privat';
  bezeichnung: string;
  betrag: number;
}

export interface HandwerkerItem {
  id: string;
  art: 'handwerker' | 'haushaltsnah';
  bezeichnung: string;
  rechnungsbetragArbeitslohn: number;
  unbarBezahlt: boolean; // Pflichtfeld nach B1/3.5!
}

export const WeitereAnlagenView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'sonderausgaben' | 'handwerker' | 'belastungen' | 'fussball_so'>('sonderausgaben');

  // Lokale Items / State
  const [sonderausgabenList, setSonderausgabenList] = useState<SonderausgabeItem[]>([
    {
      id: 'sa_1',
      art: 'studienkosten_erststudium',
      bezeichnung: 'Semesterbeiträge & Fachliteratur TH Mannheim (Erststudium)',
      betrag: 450.00,
    },
  ]);

  const [handwerkerList, setHandwerkerList] = useState<HandwerkerItem[]>([
    {
      id: 'hw_1',
      art: 'haushaltsnah',
      bezeichnung: 'Endreinigung / Nebenkostenabrechnung Gorxheimertal',
      rechnungsbetragArbeitslohn: 120.00,
      unbarBezahlt: true,
    },
  ]);

  // Formular-States für Neuanlage
  const [newSaBezeichnung, setNewSaBezeichnung] = useState('');
  const [newSaBetrag, setNewSaBetrag] = useState<number>(0);
  const [newSaArt, setNewSaArt] = useState<'spende' | 'kirchensteuer' | 'studienkosten_erststudium' | 'vorsorge_privat'>('spende');

  const [newHwBezeichnung, setNewHwBezeichnung] = useState('');
  const [newHwLohn, setNewHwLohn] = useState<number>(0);
  const [newHwUnbar, setNewHwUnbar] = useState<boolean>(true);

  // Summen
  const summeSonderausgaben = sonderausgabenList.reduce((acc, item) => acc + item.betrag, 0);
  
  // Handwerker: 20% der reinen Arbeitskosten sind direkt von der Steuerschuld abziehbar (max 1.200 € Handwerker, max 4.000 € haushaltsnah)
  const gueltigeHandwerker = handwerkerList.filter(item => item.unbarBezahlt);
  const summeArbeitslohnGueltig = gueltigeHandwerker.reduce((acc, item) => acc + item.rechnungsbetragArbeitslohn, 0);
  const steuerabzugHandwerker = summeArbeitslohnGueltig * 0.20;

  const handleAddSonderausgabe = () => {
    if (!newSaBezeichnung.trim() || newSaBetrag <= 0) return;
    const newItem: SonderausgabeItem = {
      id: `sa_${Date.now()}`,
      art: newSaArt,
      bezeichnung: newSaBezeichnung.trim(),
      betrag: newSaBetrag,
    };
    setSonderausgabenList(prev => [...prev, newItem]);
    setNewSaBezeichnung('');
    setNewSaBetrag(0);
  };

  const handleAddHandwerker = () => {
    if (!newHwBezeichnung.trim() || newHwLohn <= 0) return;
    const newItem: HandwerkerItem = {
      id: `hw_${Date.now()}`,
      art: 'haushaltsnah',
      bezeichnung: newHwBezeichnung.trim(),
      rechnungsbetragArbeitslohn: newHwLohn,
      unbarBezahlt: newHwUnbar,
    };
    setHandwerkerList(prev => [...prev, newItem]);
    setNewHwBezeichnung('');
    setNewHwLohn(0);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Modul 3.5: Weitere Anlagen</h2>
              <p className="text-sm text-slate-400">
                Sonderausgaben, Haushaltsnahe Aufwendungen, Außergewöhnliche Belastungen & Nebeneinkünfte
              </p>
            </div>
          </div>

          <div className="text-xs bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-400">
            Nur zutreffende Anlagen laut Klärungsdialog aktiv
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('sonderausgaben')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeSubTab === 'sonderausgaben'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          Sonderausgaben & Erststudium
        </button>
        <button
          onClick={() => setActiveSubTab('handwerker')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeSubTab === 'handwerker'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Home className="w-4 h-4" />
          Haushaltsnahe Dienstleistungen
        </button>
        <button
          onClick={() => setActiveSubTab('fussball_so')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeSubTab === 'fussball_so'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Coins className="w-4 h-4" />
          Fußball-Vertrag & Nebeneinkünfte
        </button>
        <button
          onClick={() => setActiveSubTab('belastungen')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeSubTab === 'belastungen'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Außergewöhnliche Belastungen
        </button>
      </div>

      {/* TAB 1: Sonderausgaben */}
      {activeSubTab === 'sonderausgaben' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <HeartHandshake className="w-5 h-5 text-emerald-400" />
                  Sonderausgaben (Anlage Sonderausgaben)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Hierzu zählen Erststudienkosten (max. 6.000 €), Spenden mit Zuwendungsbestätigung und Kirchensteuer.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Summe Sonderausgaben:</span>
                <span className="text-base font-mono font-bold text-emerald-400">{formatEuro(summeSonderausgaben)}</span>
              </div>
            </div>

            {/* Hinweis Erststudium */}
            <div className="p-3.5 bg-blue-950/20 border border-blue-900/40 rounded-xl text-xs text-blue-300 mb-4">
              📘 <strong>Status Erststudium:</strong> Weil die Vorstudien an der DHBW Mannheim und Frankfurt ohne berufsqualifizierenden Abschluss abgebrochen wurden, zählen Kosten des Bachelorstudiums an der TH Mannheim steuerlich als Sonderausgaben bis zu 6.000 € pro Kalenderjahr (§ 10 Abs. 1 Nr. 7 EStG).
            </div>

            {/* Schnelleingabe */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row gap-2 mb-4">
              <select
                value={newSaArt}
                onChange={(e) => setNewSaArt(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2"
              >
                <option value="studienkosten_erststudium">Studienkosten (Erststudium)</option>
                <option value="spende">Spende / Gemeinnützig</option>
                <option value="vorsorge_privat">Private Zusatzversicherung</option>
                <option value="kirchensteuer">Gezahlte Kirchensteuer</option>
              </select>
              <input
                type="text"
                placeholder="Bezeichnung (z.B. Semesterbeitrag SoSe 2026, Spende DRK)"
                value={newSaBezeichnung}
                onChange={(e) => setNewSaBezeichnung(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Betrag (€)"
                value={newSaBetrag || ''}
                onChange={(e) => setNewSaBetrag(parseFloat(e.target.value) || 0)}
                className="w-28 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
              <button
                onClick={handleAddSonderausgabe}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" /> Hinzufügen
              </button>
            </div>

            {/* Liste */}
            <div className="space-y-2">
              {sonderausgabenList.map((item) => (
                <div key={item.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-white mr-2">{item.bezeichnung}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 capitalize">
                      {item.art.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-white">{formatEuro(item.betrag)}</span>
                    <button
                      onClick={() => setSonderausgabenList(prev => prev.filter(i => i.id !== item.id))}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Haushaltsnahe Dienstleistungen & Handwerker */}
      {activeSubTab === 'handwerker' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Home className="w-5 h-5 text-emerald-400" />
                  Haushaltsnahe Dienstleistungen (§ 35a EStG)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  20% der reinen Arbeitskosten mindern direkt deine Einkommensteuer. Gesetzliche Pflicht: <strong>Unbarer Zahlungsnachweis (Überweisung)</strong>.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Direkter Steuerabzug:</span>
                <span className="text-base font-mono font-bold text-emerald-400">-{formatEuro(steuerabzugHandwerker)}</span>
              </div>
            </div>

            {/* Schnelleingabe */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row gap-2 mb-4">
              <input
                type="text"
                placeholder="Bezeichnung (z.B. Treppenhausreinigung, Umzugshelfer)"
                value={newHwBezeichnung}
                onChange={(e) => setNewHwBezeichnung(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Reine Arbeitskosten (€)"
                value={newHwLohn || ''}
                onChange={(e) => setNewHwLohn(parseFloat(e.target.value) || 0)}
                className="w-36 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
              <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newHwUnbar}
                  onChange={(e) => setNewHwUnbar(e.target.checked)}
                  className="rounded text-emerald-500"
                />
                <span>Überwiesen</span>
              </label>
              <button
                onClick={handleAddHandwerker}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" /> Hinzufügen
              </button>
            </div>

            {/* Liste */}
            <div className="space-y-2">
              {handwerkerList.map((item) => (
                <div key={item.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-white mr-2">{item.bezeichnung}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                      item.unbarBezahlt 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {item.unbarBezahlt ? '✓ Überweisung nachgewiesen' : '✗ Barzahlung (nicht absetzbar)'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-slate-400">Arbeitslohn: {formatEuro(item.rechnungsbetragArbeitslohn)}</span>
                    <span className="font-mono font-bold text-emerald-400">Abzug: {formatEuro(item.unbarBezahlt ? item.rechnungsbetragArbeitslohn * 0.20 : 0)}</span>
                    <button
                      onClick={() => setHandwerkerList(prev => prev.filter(i => i.id !== item.id))}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Fußball-Vertrag & Nebeneinkünfte */}
      {activeSubTab === 'fussball_so' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
              <Coins className="w-5 h-5 text-emerald-400" />
              Fußball-Amateurvertrag (10 Monate à 600 €)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Vertrag ab 01.08.2026. Da der Betrag von 600 €/Monat (gesamt 6.000 €) über der Minijob-Grenze und über der steuerfreien Ehrenamtspauschale (840 €) liegt, ist die steuerliche Handhabung entscheidend:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-white block">Szenario 1: Verein rechnet über Lohnsteuerkarte ab</span>
                <p className="text-xs text-slate-400">
                  Da du bereits bei B.Schmitt mobile GmbH hauptbeschäftigt bist, erhält der Fußballverein automatisch <strong>Steuerklasse VI</strong>. Du erhältst dann eine elektronische Lohnsteuerbescheinigung, die wir in Modul 3.2 als 3. Arbeitgeber einpflegen.
                </p>
                <div className="text-[11px] text-amber-300 bg-amber-950/20 p-2 rounded-lg border border-amber-900/30">
                  ⚠️ Bei Steuerklasse VI wird monatlich relativ viel Lohnsteuer einbehalten, die du dir aber über die Steuererklärung komplett zurückholst, wenn dein Gesamteinkommen unter dem Grundfreibetrag liegt!
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-white block">Szenario 2: Aufwandsentschädigung / Sportlervergütung</span>
                <p className="text-xs text-slate-400">
                  Wird die Vergütung als Sportleraufwandsentschädigung ausgezahlt, können nachgewiesene Fahrtkosten zum Training/Spielen sowie Fußballschuhe, Sportkleidung und Trainingslager als Werbungskosten/Betriebsausgaben direkt gegengerechnet werden.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Außergewöhnliche Belastungen */}
      {activeSubTab === 'belastungen' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
            <ShieldAlert className="w-5 h-5 text-emerald-400" />
            Außergewöhnliche Belastungen (§ 33 EStG)
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Krankheitskosten, Brillen, Zahnersatz oder Medikamente können geltend gemacht werden, sobald sie die sogenannte „zumutbare Eigenbelastung" (ca. 5–6% des Gesamtbetrags der Einkünfte) übersteigen.
          </p>

          <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
            Aktuell keine außergewöhnlichen Krankheitskosten aus dem Klärungsdialog erfasst. Bei Bedarf können Belege in Modul 3.4/3.6 angelegt werden.
          </div>
        </div>
      )}
    </div>
  );
};
