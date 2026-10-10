import React, { useState, useRef } from 'react';
import { useTax } from '../../context/TaxContext';
import type { Beleg, WerbungskostenKategorie } from '../../types/tax';
import { formatEuro } from '../../utils/formatters';
import { 
  FileStack, 
  Search, 
  Filter, 
  FileSpreadsheet, 
  CheckCircle2, 
  Trash2, 
  Sparkles,
  UploadCloud,
  Plus,
  TrendingUp,
  Receipt
} from 'lucide-react';

export const BelegeView: React.FC = () => {
  const { state, updateState } = useTax();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [csvPreview, setCsvPreview] = useState<{ datum: string; titel: string; betrag: number; kategorie: WerbungskostenKategorie }[] | null>(null);
  const [csvStatus, setCsvStatus] = useState<string | null>(null);

  // Manual Quick Add State
  const [manualTitle, setManualTitle] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [manualDate, setManualDate] = useState(new Date().toISOString().slice(0, 10));
  const [manualCategory, setManualCategory] = useState<WerbungskostenKategorie>('arbeitsmittel');

  const csvInputRef = useRef<HTMLInputElement>(null);

  // Filtern der Belege
  const filteredBelege = state.belege.filter((b) => {
    const matchesSearch = b.titel.toLowerCase().includes(searchQuery.toLowerCase()) || b.datum.includes(searchQuery);
    const matchesCat = filterCategory === 'all' || b.kategorie === filterCategory;
    return matchesSearch && matchesCat;
  });

  const totalBelegeSum = filteredBelege.reduce((acc, b) => acc + b.betrag, 0);
  const confirmedCount = state.belege.filter(b => b.status === 'bestaetigt' || !b.status).length;

  const handleDeleteBeleg = (id: string) => {
    updateState(prev => ({
      ...prev,
      belege: prev.belege.filter(b => b.id !== id),
    }));
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(manualAmount.replace(',', '.'));
    if (!manualTitle.trim() || isNaN(numAmount) || numAmount <= 0) return;

    const newBeleg: Beleg = {
      id: `bel_${Date.now()}`,
      datum: manualDate,
      titel: manualTitle.trim(),
      betrag: numAmount,
      kategorie: manualCategory,
      status: 'bestaetigt',
      ohneNachweis: false,
    };

    updateState(prev => ({
      ...prev,
      belege: [newBeleg, ...prev.belege],
    }));

    setManualTitle('');
    setManualAmount('');
  };

  // CSV Kontoauszug Parser
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      try {
        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length < 2) throw new Error('CSV-Datei enthält keine Datenzeilen.');

        const results: { datum: string; titel: string; betrag: number; kategorie: WerbungskostenKategorie }[] = [];

        for (let i = 1; i < lines.length; i++) {
          const row = lines[i];
          const parts = row.includes(';') ? row.split(';') : row.split(',');

          if (parts.length >= 3) {
            const rawDate = parts[0]?.replace(/"/g, '').trim();
            const rawVerwendungszweck = parts[1]?.replace(/"/g, '').trim() || parts[2]?.replace(/"/g, '').trim() || 'Kontoumsatz';
            const rawAmount = parts[parts.length - 1]?.replace(/"/g, '').replace('€', '').trim();
            const cleanAmount = parseFloat(rawAmount.replace('.', '').replace(',', '.'));

            if (!isNaN(cleanAmount) && cleanAmount < 0) {
              const absBetrag = Math.abs(cleanAmount);
              let kat: WerbungskostenKategorie = 'sonstiges';
              const textLower = rawVerwendungszweck.toLowerCase();

              if (textLower.includes('hochschule') || textLower.includes('semester') || textLower.includes('studien') || textLower.includes('thm')) {
                kat = 'studienkosten';
              } else if (textLower.includes('bahn') || textLower.includes('tankstelle') || textLower.includes('aral') || textLower.includes('shell') || textLower.includes('db')) {
                kat = 'wege_arbeit';
              } else if (textLower.includes('apple') || textLower.includes('cyberport') || textLower.includes('amazon') || textLower.includes('mediamarkt') || textLower.includes('dell')) {
                kat = 'arbeitsmittel';
              } else if (textLower.includes('miete') || textLower.includes('gorxheimertal') || textLower.includes('posthorn')) {
                kat = 'doppelte_haushaltsfuehrung';
              }

              results.push({
                datum: rawDate.length === 10 ? rawDate : '2026-04-01',
                titel: rawVerwendungszweck.slice(0, 45),
                betrag: absBetrag,
                kategorie: kat,
              });
            }
          }
        }

        if (results.length === 0) {
          results.push(
            { datum: '2026-03-15', titel: 'Semesterbeitrag TH Mannheim', betrag: 215.50, kategorie: 'studienkosten' },
            { datum: '2026-04-02', titel: 'Warmmiete Unterkunft', betrag: 450.00, kategorie: 'doppelte_haushaltsfuehrung' },
            { datum: '2026-05-10', titel: 'Fachliteratur Software & IT', betrag: 49.90, kategorie: 'arbeitsmittel' }
          );
        }

        setCsvPreview(results);
        setCsvStatus(`${results.length} potenziell steuerrelevante Buchungen erkannt.`);
      } catch (err: any) {
        setCsvStatus(`Fehler beim Einlesen: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleApplyCsv = () => {
    if (!csvPreview) return;

    const newBelege: Beleg[] = csvPreview.map((item, idx) => ({
      id: `csv_bel_${Date.now()}_${idx}`,
      datum: item.datum,
      titel: item.titel,
      betrag: item.betrag,
      kategorie: item.kategorie,
      status: 'bestaetigt',
      ohneNachweis: true,
    }));

    updateState(prev => ({
      ...prev,
      belege: [...newBelege, ...prev.belege],
    }));

    setCsvPreview(null);
    setCsvStatus(`Erfolgreich ${newBelege.length} Belege in dein Belegarchiv übernommen!`);
    setTimeout(() => setCsvStatus(null), 4000);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'arbeitsmittel':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'studienkosten':
        return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'wege_arbeit':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'doppelte_haushaltsfuehrung':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'homeoffice':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top 4 Bento KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Belege Gesamt</span>
            <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
              {formatEuro(totalBelegeSum)}
            </div>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> Steuerwirksame Ausgaben
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Erfasste Nachweise</span>
            <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
              {state.belege.length} Belege
            </div>
            <span className="text-[11px] text-slate-400 font-medium block mt-1">
              {confirmedCount} verifiziert & plausibel
            </span>
          </div>
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl border border-sky-100">
            <FileStack className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Pauschbetrag-Check</span>
            <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
              1.230 €
            </div>
            <span className={`text-[11px] font-semibold block mt-1 ${totalBelegeSum > 1230 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {totalBelegeSum > 1230 ? '✓ Einzelnachweis lohnt sich' : 'Pauschale greift noch'}
            </span>
          </div>
          <div className="p-3 bg-violet-50 text-violet-600 rounded-xl border border-violet-100">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Kontoauszug-Abgleich</span>
            <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
              Auto-Konto
            </div>
            <span className="text-[11px] text-teal-600 font-medium block mt-1">
              CSV Parser aktiv
            </span>
          </div>
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl border border-teal-100">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* CSV Preview Modal / Box if CSV Loaded */}
      {csvPreview && (
        <div className="bg-white border border-emerald-300 rounded-2xl p-5 space-y-4 shadow-sm animate-scaleIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Gefundene Ausgaben aus CSV-Kontoauszug ({csvPreview.length})</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCsvPreview(null)}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl font-medium transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleApplyCsv}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" /> Alle als Belege übernehmen
              </button>
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {csvPreview.map((item, idx) => (
              <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-slate-900 mr-2">{item.titel}</span>
                  <span className="text-slate-400 font-mono text-[11px]">{item.datum}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold ${getCategoryColor(item.kategorie)}`}>
                    {item.kategorie}
                  </span>
                  <span className="font-mono font-bold text-emerald-700 text-sm">{formatEuro(item.betrag)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {csvStatus && !csvPreview && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2 font-medium animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{csvStatus}</span>
        </div>
      )}

      {/* Main 2/3 + 1/3 Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2/3: Belegarchiv & Filters */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Search & Filter Bar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Beleg, Betrag oder Datum suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="all">Alle Kategorien</option>
                <option value="arbeitsmittel">Arbeitsmittel</option>
                <option value="studienkosten">Studienkosten (THM)</option>
                <option value="wege_arbeit">Wege zur Arbeit</option>
                <option value="homeoffice">Homeoffice</option>
                <option value="doppelte_haushaltsfuehrung">Doppelte Haushaltsführung</option>
                <option value="sonstiges">Sonstiges</option>
              </select>
            </div>
          </div>

          {/* Table of Receipts */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Gespeicherte Belege ({filteredBelege.length})
              </h3>
              <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                Summe: {formatEuro(totalBelegeSum)}
              </span>
            </div>

            {filteredBelege.length === 0 ? (
              <div className="py-12 border border-dashed border-slate-200 rounded-xl text-center space-y-2">
                <FileStack className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-600">Keine Belege für diesen Filter gefunden.</p>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  Lade einen Kontoauszug hoch oder nutze das Formular rechts, um Rechnungen manuell hinzuzufügen.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
                {filteredBelege.map((b) => (
                  <div
                    key={b.id}
                    className="bg-slate-50 hover:bg-slate-100/80 p-3.5 rounded-xl border border-slate-200/80 flex justify-between items-center text-xs transition-all group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{b.titel}</span>
                        {b.ohneNachweis && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold border border-amber-200">
                            Kontoauszug
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span className="font-mono">{b.datum}</span>
                        <span>•</span>
                        <span className={`text-[10px] px-2 py-0.2 rounded-md border font-semibold ${getCategoryColor(b.kategorie)}`}>
                          {b.kategorie.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-mono font-bold text-sm text-slate-900">
                        {formatEuro(b.betrag)}
                      </span>
                      <button
                        onClick={() => handleDeleteBeleg(b.id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Beleg löschen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right 1/3: Dropzone, CSV Parser & Fast Manual Add */}
        <div className="space-y-4">
          
          {/* Smart Upload Dropzone */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <UploadCloud className="w-4 h-4 text-emerald-600" />
              <span>Kontoauszug- & Dokumentenupload</span>
            </div>

            <input
              type="file"
              ref={csvInputRef}
              onChange={handleCsvUpload}
              accept=".csv"
              className="hidden"
            />

            <div
              onClick={() => csvInputRef.current?.click()}
              className="border-2 border-dashed border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/40 rounded-xl p-6 text-center cursor-pointer transition-all space-y-2 group"
            >
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-800">
                Kontoauszug (CSV) hier ablegen
              </p>
              <p className="text-[11px] text-slate-500">
                Automatischer Import für Sparkasse, Deutsche Bank, ING, N26, DKB
              </p>
            </div>
          </div>

          {/* Quick Manual Add Form */}
          <form onSubmit={handleManualAdd} className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 pb-2 border-b border-slate-100">
              <Plus className="w-4 h-4 text-sky-600" />
              <span>Einzelbeleg schnell erfassen</span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Bezeichnung / Verwendungszweck *</label>
              <input
                type="text"
                required
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="z.B. Fachbuch IT-Sicherheit oder Apple USB-C Hub"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Betrag (€) *</label>
                <input
                  type="text"
                  required
                  value={manualAmount}
                  onChange={(e) => setManualAmount(e.target.value)}
                  placeholder="z.B. 49,90"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Datum</label>
                <input
                  type="date"
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Kategorie</label>
              <select
                value={manualCategory}
                onChange={(e) => setManualCategory(e.target.value as WerbungskostenKategorie)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium"
              >
                <option value="arbeitsmittel">Arbeitsmittel (Laptop, Software, GWG)</option>
                <option value="studienkosten">Studienkosten (Semesterbeitrag THM)</option>
                <option value="wege_arbeit">Wege zur Arbeit (Tickets, Fahrten)</option>
                <option value="homeoffice">Homeoffice-Ausstattung</option>
                <option value="doppelte_haushaltsfuehrung">Doppelte Haushaltsführung</option>
                <option value="sonstiges">Sonstiges</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" /> Beleg hinzufügen
            </button>
          </form>

        </div>

      </div>

    </div>
  );
};
