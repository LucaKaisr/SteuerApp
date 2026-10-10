import React, { useState } from 'react';
import { useTax } from '../../context/TaxContext';
import type { ArbeitgeberId, Lohnsteuerbescheinigung, Monatsabrechnung } from '../../types/tax';
import { formatEuro } from '../../utils/formatters';
import { geminiService } from '../../services/geminiService';
import { 
  Briefcase, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Calendar, 
  Sparkles
} from 'lucide-react';

export const LohnView: React.FC = () => {
  const { state, updateState } = useTax();
  const [selectedAgId, setSelectedAgId] = useState<ArbeitgeberId>('ag_a');
  const [activeTab, setActiveTab] = useState<'bescheinigung' | 'monate'>('bescheinigung');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [extractSuccess, setExtractSuccess] = useState<string | null>(null);

  const currentAg = state.arbeitgeber.find(a => a.id === selectedAgId) || state.arbeitgeber[0];

  const currentBescheinigung = state.lohnsteuerbescheinigungen.find(b => b.arbeitgeberId === selectedAgId) || {
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

  // Speichern / Updaten einer Monatsabrechnung
  const handleSaveMonat = (monatNum: number, brutto: number, netto: number, lohnsteuer: number) => {
    updateState((prev) => {
      const existingIdx = prev.monatsabrechnungen.findIndex(m => m.arbeitgeberId === selectedAgId && m.monat === monatNum);
      const newItem: Monatsabrechnung = {
        id: `ma_${selectedAgId}_${monatNum}`,
        arbeitgeberId: selectedAgId,
        monat: monatNum,
        jahr: 2026,
        brutto,
        netto,
        lohnsteuer,
        soli: 0,
        kirchensteuer: 0,
        svBeitraegeGesamt: brutto > 0 ? (brutto - netto - lohnsteuer) : 0,
        fahrtkostenzuschuss: 0,
        sachbezuege: 0,
        status: 'bestaetigt',
      };

      if (existingIdx >= 0) {
        const copy = [...prev.monatsabrechnungen];
        copy[existingIdx] = newItem;
        return { ...prev, monatsabrechnungen: copy };
      }
      return { ...prev, monatsabrechnungen: [...prev.monatsabrechnungen, newItem] };
    });
  };

  // Upload & Extraktion Lohnsteuerbescheinigung
  const handleLsbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    setExtractError(null);
    setExtractSuccess(null);

    try {
      const apiKey = state.einstellungen.geminiApiKey;
      if (!apiKey) {
        throw new Error('Bitte hinterlege in den Einstellungen deinen Gemini API-Key für die Belegextraktion.');
      }

      const res = await geminiService.extractLohnsteuerbescheinigung(file, apiKey);
      
      updateState((prev) => {
        const updatedItem: Lohnsteuerbescheinigung = {
          ...currentBescheinigung,
          zeile3_bruttoarbeitslohn: res.bruttoarbeitslohn || 0,
          zeile4_lohnsteuer: res.lohnsteuer || 0,
          zeile5_solidaritaetszuschlag: res.solidaritaetszuschlag || 0,
          zeile6_kirchensteuer: res.kirchensteuer || 0,
          zeile22a_rv_arbeitgeber: res.rvArbeitgeber || 0,
          zeile23a_rv_arbeitnehmer: res.rvArbeitnehmer || 0,
          zeile25_kv_arbeitnehmer: res.kvArbeitnehmer || 0,
          zeile26_pv_arbeitnehmer: res.pvArbeitnehmer || 0,
          zeile27_av_arbeitnehmer: res.avArbeitnehmer || 0,
          zeile17_steuerfreie_fahrtkosten: res.steuerfreieFahrtkosten || 0,
          zeile18_pauschal_besteuerte_bezuege: res.pauschalBesteuerteBezuege || 0,
          bestaetigt: false,
        };

        const exists = prev.lohnsteuerbescheinigungen.some(b => b.arbeitgeberId === selectedAgId);
        return {
          ...prev,
          lohnsteuerbescheinigungen: exists
            ? prev.lohnsteuerbescheinigungen.map(b => b.arbeitgeberId === selectedAgId ? updatedItem : b)
            : [...prev.lohnsteuerbescheinigungen, updatedItem],
        };
      });

      setExtractSuccess('Werte erfolgreich extrahiert! Bitte prüfe die Beträge und bestätige sie.');
    } catch (err: any) {
      setExtractError(err.message || 'Extraktion fehlgeschlagen.');
    } finally {
      setIsExtracting(false);
    }
  };

  const monatsNamen = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Card mit Arbeitgeber-Auswahl */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-50 border border-teal-100 text-teal-700">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Lohnsteuerbescheinigungen & Abrechnungen</h2>
              <p className="text-xs text-slate-500">
                Amtliche Zeilen 3–27 (Anlage N) und Monatsabrechnungen mit Belegkontrolle
              </p>
            </div>
          </div>
        </div>

        {/* Arbeitgeber-Auswahl Pills */}
        <div className="flex items-center gap-2">
          {state.arbeitgeber.map((ag) => (
            <button
              key={ag.id}
              onClick={() => setSelectedAgId(ag.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 cursor-pointer ${
                selectedAgId === ag.id
                  ? 'bg-teal-50 text-teal-900 border border-teal-200 shadow-2xs font-bold'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span>{ag.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                StKl. {ag.steuerklasse}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Sub-Tabs: Bescheinigung vs. Monatsabrechnungen */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <button
            onClick={() => setActiveTab('bescheinigung')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'bescheinigung'
                ? 'bg-teal-50 text-teal-900 border border-teal-200 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-teal-600" />
              <span>Lohnsteuerbescheinigung (Zeilen 3–27)</span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab('monate')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'monate'
                ? 'bg-teal-50 text-teal-900 border border-teal-200 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              <span>Monatsabrechnungen & Jahresabgleich ({agMonatsabrechnungen.length}/12)</span>
            </span>
          </button>
        </div>
      </div>

      {/* Feedback Alerts */}
      {extractError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{extractError}</span>
        </div>
      )}
      {extractSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{extractSuccess}</span>
        </div>
      )}

      {/* TAB 1: Lohnsteuerbescheinigung */}
      {activeTab === 'bescheinigung' && (
        <div className="space-y-6">
          {/* Upload & Gemini OCR Box */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <h3 className="font-bold text-base text-slate-950">
                  Lohnsteuerbescheinigung für {currentAg.name}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Lade die PDF-Bescheinigung hoch – Beträge werden automatisch den Zeilen 3–27 zugeordnet.
              </p>
            </div>

            <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition shadow-2xs cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>{isExtracting ? 'Analysiere...' : 'Bescheinigung hochladen (PDF)'}</span>
              <input type="file" accept=".pdf,image/*" onChange={handleLsbUpload} className="hidden" />
            </label>
          </div>

          {/* Formularfelder in amtlicher Zeilenstruktur */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Linke Spalte: Steuerabzüge */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
              <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
                Steuerabzüge & Bruttolohn (Zeilen 3–6)
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Zeile 3: Bruttoarbeitslohn (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={currentBescheinigung.zeile3_bruttoarbeitslohn || ''}
                    onChange={(e) => handleUpdateBescheinigungField('zeile3_bruttoarbeitslohn', parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Zeile 4: Einbehaltene Lohnsteuer (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={currentBescheinigung.zeile4_lohnsteuer || ''}
                    onChange={(e) => handleUpdateBescheinigungField('zeile4_lohnsteuer', parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-teal-700 focus:outline-none focus:border-teal-600 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                      Zeile 5: Solidaritätszuschlag (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={currentBescheinigung.zeile5_solidaritaetszuschlag || ''}
                      onChange={(e) => handleUpdateBescheinigungField('zeile5_solidaritaetszuschlag', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                      Zeile 6: Kirchensteuer (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={currentBescheinigung.zeile6_kirchensteuer || ''}
                      onChange={(e) => handleUpdateBescheinigungField('zeile6_kirchensteuer', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Rechte Spalte: Sozialabgaben */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
              <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
                Sozialversicherungsbeiträge (Zeilen 22–27)
              </h4>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                      Zeile 22a: RV Arbeitgeber (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={currentBescheinigung.zeile22a_rv_arbeitgeber || ''}
                      onChange={(e) => handleUpdateBescheinigungField('zeile22a_rv_arbeitgeber', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                      Zeile 23a: RV Arbeitnehmer (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={currentBescheinigung.zeile23a_rv_arbeitnehmer || ''}
                      onChange={(e) => handleUpdateBescheinigungField('zeile23a_rv_arbeitnehmer', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Z. 25: KV AN (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={currentBescheinigung.zeile25_kv_arbeitnehmer || ''}
                      onChange={(e) => handleUpdateBescheinigungField('zeile25_kv_arbeitnehmer', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Z. 26: PV AN (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={currentBescheinigung.zeile26_pv_arbeitnehmer || ''}
                      onChange={(e) => handleUpdateBescheinigungField('zeile26_pv_arbeitnehmer', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Z. 27: AV AN (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={currentBescheinigung.zeile27_av_arbeitnehmer || ''}
                      onChange={(e) => handleUpdateBescheinigungField('zeile27_av_arbeitnehmer', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Monatsabrechnungen */}
      {activeTab === 'monate' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-950">Monatliche Abrechnungsbelege 2026</h3>
                <p className="text-xs text-slate-500">Erfasse die Gehaltsabrechnungen für den lückenlosen Jahresabgleich.</p>
              </div>
              <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-xl border border-teal-200">
                Summe: {formatEuro(monateSummeBrutto)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {monatsNamen.map((name, idx) => {
                const monatNum = idx + 1;
                const existing = agMonatsabrechnungen.find(m => m.monat === monatNum);

                return (
                  <div key={monatNum} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                      <span>{name}</span>
                      {existing ? (
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          Erfasst
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-normal">Offen</span>
                      )}
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <input
                        type="number"
                        placeholder="Brutto (€)"
                        defaultValue={existing?.brutto || ''}
                        onBlur={(e) => handleSaveMonat(monatNum, parseFloat(e.target.value) || 0, existing?.netto || 0, existing?.lohnsteuer || 0)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono text-xs focus:outline-none focus:border-teal-600"
                      />
                      <input
                        type="number"
                        placeholder="Lohnsteuer (€)"
                        defaultValue={existing?.lohnsteuer || ''}
                        onBlur={(e) => handleSaveMonat(monatNum, existing?.brutto || 0, existing?.netto || 0, parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono text-xs focus:outline-none focus:border-teal-600"
                      />
                    </div>
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
