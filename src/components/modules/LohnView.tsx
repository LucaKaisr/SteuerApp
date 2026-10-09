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
  const monateSummeSteuer = agMonatsabrechnungen.reduce((sum, m) => sum + m.lohnsteuer, 0);

  // Jahresabgleich-Differenz
  const diffBrutto = Math.abs(currentBescheinigung.zeile3_bruttoarbeitslohn - monateSummeBrutto);
  const diffSteuer = Math.abs(currentBescheinigung.zeile4_lohnsteuer - monateSummeSteuer);
  const hatAbweichung = currentBescheinigung.zeile3_bruttoarbeitslohn > 0 && agMonatsabrechnungen.length > 0 && (diffBrutto > 1 || diffSteuer > 1);

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
          bestaetigt: false, // Erst manuell prüfen!
        };

        const exists = prev.lohnsteuerbescheinigungen.some(b => b.arbeitgeberId === selectedAgId);
        return {
          ...prev,
          lohnsteuerbescheinigungen: exists
            ? prev.lohnsteuerbescheinigungen.map(b => b.arbeitgeberId === selectedAgId ? updatedItem : b)
            : [...prev.lohnsteuerbescheinigungen, updatedItem],
        };
      });

      setExtractSuccess('Werte erfolgreich extrahiert! Bitte prüfe die Beträge und bestätige sie mit dem Haken.');
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
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Modul 3.2 & 3.3: Lohn, Bescheinigungen & Abrechnungen</h2>
              <p className="text-sm text-slate-400">
                Lohnsteuerbescheinigungen (Anlage N) und Monatsabrechnungen mit Belegkontrolle & Jahresabgleich
              </p>
            </div>
          </div>

          {/* Arbeitgeber-Auswahl Pills */}
          <div className="flex flex-wrap gap-2">
            {state.arbeitgeber.map((ag) => (
              <button
                key={ag.id}
                onClick={() => setSelectedAgId(ag.id)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
                  selectedAgId === ag.id
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                <span>{ag.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                  StKl. {ag.steuerklasse}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('bescheinigung')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'bescheinigung'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          Lohnsteuerbescheinigung (Zeilen 3–27)
        </button>
        <button
          onClick={() => setActiveTab('monate')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'monate'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Monatsabrechnungen (Papierbelege) & Jahresabgleich
        </button>
      </div>

      {/* Feedback Messages */}
      {extractError && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{extractError}</span>
        </div>
      )}
      {extractSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{extractSuccess}</span>
        </div>
      )}

      {/* TAB 1: Lohnsteuerbescheinigung */}
      {activeTab === 'bescheinigung' && (
        <div className="space-y-6">
          {/* Upload & Gemini Extraktion Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Elektronische Lohnsteuerbescheinigung für {currentAg.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Lade den Beleg (PDF/Foto) hoch – Gemini extrahiert die Beträge automatisch in die amtlichen Zeilen. 
                  Alle Felder bleiben manuell editierbar (B2-Vorgabe).
                </p>
              </div>

              <div>
                <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium py-2 px-4 rounded-xl border border-slate-700 flex items-center gap-2 transition-colors">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>{isExtracting ? 'Analysiere Beleg...' : 'Bescheinigung scannen / hochladen'}</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleLsbUpload}
                    disabled={isExtracting}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Formular Amtliche Zeilennummern */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-300">
                Amtliche Zeilen laut elektronischer Lohnsteuerbescheinigung
              </span>
              <label className="flex items-center gap-2 text-xs text-emerald-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentBescheinigung.bestaetigt}
                  onChange={(e) => handleUpdateBescheinigungField('bestaetigt', e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 bg-slate-950 border-slate-800"
                />
                <span>Bescheinigung geprüft & freigegeben</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Zeile 3 */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <label className="block text-[11px] text-slate-400 mb-1">
                  Zeile 3: Bruttoarbeitslohn einschl. Sachbezüge (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={currentBescheinigung.zeile3_bruttoarbeitslohn || ''}
                  onChange={(e) => handleUpdateBescheinigungField('zeile3_bruttoarbeitslohn', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Zeile 4 */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <label className="block text-[11px] text-slate-400 mb-1">
                  Zeile 4: Einbehaltene Lohnsteuer (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={currentBescheinigung.zeile4_lohnsteuer || ''}
                  onChange={(e) => handleUpdateBescheinigungField('zeile4_lohnsteuer', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Zeile 5 */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <label className="block text-[11px] text-slate-400 mb-1">
                  Zeile 5: Einbehaltener Solidaritätszuschlag (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={currentBescheinigung.zeile5_solidaritaetszuschlag || ''}
                  onChange={(e) => handleUpdateBescheinigungField('zeile5_solidaritaetszuschlag', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Zeile 6 */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <label className="block text-[11px] text-slate-400 mb-1">
                  Zeile 6: Einbehaltene Kirchensteuer (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={currentBescheinigung.zeile6_kirchensteuer || ''}
                  onChange={(e) => handleUpdateBescheinigungField('zeile6_kirchensteuer', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Zeile 22a / 23a RV */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <label className="block text-[11px] text-slate-400 mb-1">
                  Zeile 22a: Arbeitgeberanteil RV (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={currentBescheinigung.zeile22a_rv_arbeitgeber || ''}
                  onChange={(e) => handleUpdateBescheinigungField('zeile22a_rv_arbeitgeber', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <label className="block text-[11px] text-slate-400 mb-1">
                  Zeile 23a: Arbeitnehmeranteil RV (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={currentBescheinigung.zeile23a_rv_arbeitnehmer || ''}
                  onChange={(e) => handleUpdateBescheinigungField('zeile23a_rv_arbeitnehmer', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Zeile 17: Steuerfreie Fahrtkosten */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 md:col-span-2">
                <label className="block text-[11px] text-slate-400 mb-1">
                  Zeile 17: Steuerfreie Arbeitgeberleistungen für Fahrten Wohnung–Tätigkeitsstätte (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={currentBescheinigung.zeile17_steuerfreie_fahrtkosten || ''}
                  onChange={(e) => handleUpdateBescheinigungField('zeile17_steuerfreie_fahrtkosten', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Wichtig: Dieser Betrag mindert in Phase 3 automatisch deine absetzbare Entfernungspauschale!
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Monatsabrechnungen & Jahresabgleich */}
      {activeTab === 'monate' && (
        <div className="space-y-6">
          {/* Jahresabgleich-Box */}
          <div className={`p-5 rounded-2xl border ${
            hatAbweichung
              ? 'bg-amber-950/20 border-amber-800/60 text-amber-200'
              : 'bg-slate-900 border-slate-800 text-slate-300'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {hatAbweichung ? (
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                )}
                <div>
                  <h4 className="text-sm font-bold text-white">Automatischer Jahresabgleich (Monatswerte vs. Bescheinigung)</h4>
                  <p className="text-xs text-slate-400">
                    Summe der erfassten Monate: <strong>{formatEuro(monateSummeBrutto)} Brutto</strong> | <strong>{formatEuro(monateSummeSteuer)} Lohnsteuer</strong>
                  </p>
                </div>
              </div>
              {hatAbweichung && (
                <div className="text-right">
                  <span className="text-xs font-mono text-amber-400 font-bold block">
                    Abweichung: {formatEuro(diffBrutto)}
                  </span>
                  <span className="text-[10px] text-amber-300/80">Bitte Monatsbelege gegen Zeile 3 prüfen</span>
                </div>
              )}
            </div>
          </div>

          {/* Kalenderraster Jan–Dez */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-semibold text-white mb-2">Monatsübersicht 2026 ({currentAg.name})</h3>
            <p className="text-xs text-slate-400 mb-4">
              Für papierhafte Abrechnungen (insbesondere B.Schmitt mobile GmbH). Trage die Monatswerte ein oder nutze die Beleg-Zuordnung.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {monatsNamen.map((mName, idx) => {
                const monatNum = idx + 1;
                const existing = agMonatsabrechnungen.find(m => m.monat === monatNum);

                return (
                  <div key={monatNum} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white">{mName}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded ${
                        existing && existing.brutto > 0
                          ? 'bg-emerald-500/10 text-emerald-400 font-semibold'
                          : 'bg-slate-900 text-slate-500'
                      }`}>
                        {existing && existing.brutto > 0 ? 'Erfasst' : 'Offen'}
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 w-12">Brutto:</span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          defaultValue={existing?.brutto || ''}
                          onBlur={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            handleSaveMonat(monatNum, val, existing?.netto || 0, existing?.lohnsteuer || 0);
                          }}
                          className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 w-12">Netto:</span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          defaultValue={existing?.netto || ''}
                          onBlur={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            handleSaveMonat(monatNum, existing?.brutto || 0, val, existing?.lohnsteuer || 0);
                          }}
                          className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 w-12">LSt:</span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          defaultValue={existing?.lohnsteuer || ''}
                          onBlur={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            handleSaveMonat(monatNum, existing?.brutto || 0, existing?.netto || 0, val);
                          }}
                          className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
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
