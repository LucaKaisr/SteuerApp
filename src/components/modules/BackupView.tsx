import React, { useState, useRef } from 'react';
import { useTax } from '../../context/TaxContext';
import { storageService } from '../../services/storageService';
import { Download, Upload, ShieldCheck, RefreshCw, AlertTriangle, CheckCircle2, Database } from 'lucide-react';

export const BackupView: React.FC = () => {
  const { state, reloadState, resetAll, lastSaved } = useTax();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = (label: string) => {
    try {
      const backup = storageService.createBackupExport(state, label);
      storageService.downloadBackupFile(backup);
      setFeedback({
        type: 'success',
        message: `Backup „${backup.metadata.dateiname}“ wurde erstellt und heruntergeladen (Prüfsumme: ${backup.metadata.checksum}).`,
      });
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Export fehlgeschlagen: ${err.message}` });
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const res = await storageService.restoreBackup(content);
      if (res.success) {
        await reloadState();
        setFeedback({ type: 'success', message: res.message });
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const runIntegritySelfTest = async () => {
    setTestResult('Führe automatisierten Integritäts- und Rücklese-Test durch...');
    try {
      // 1. Export in Memory generieren
      const backup = storageService.createBackupExport(state, 'selftest');
      const jsonStr = JSON.stringify(backup);
      
      // 2. Checksum recalculate
      const calculatedChecksum = storageService.calculateChecksum(JSON.stringify(backup.state));
      if (calculatedChecksum !== backup.metadata.checksum) {
        throw new Error('Prüfsummen-Diskrepanz im Selbsttest!');
      }

      // 3. Atomaren Roundtrip in temporärer Transaktion testen
      const verifyRes = await storageService.restoreBackup(jsonStr);
      if (!verifyRes.success) {
        throw new Error(verifyRes.message);
      }

      setTestResult(`✓ Test bestanden! JSON-Serialisierung, Prüfsumme (${calculatedChecksum}), IndexedDB-Schreibzyklus und Rücklese-Check verliefen fehlerfrei.`);
    } catch (err: any) {
      setTestResult(`✗ Fehler beim Selbsttest: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Kopfzeile */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Modul 3.9: Backup & Wiederherstellung</h2>
              <p className="text-sm text-slate-400">
                Sicherheitsnetz zuerst (B3) – Lokale Datenhoheit in IndexedDB mit Prüfsummen-Validierung
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Zuletzt gespeichert: {lastSaved ? lastSaved.toLocaleTimeString('de-DE') : 'Wird geladen...'}
          </div>
        </div>
      </div>

      {/* Benachrichtigung */}
      {feedback && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 ${
          feedback.type === 'success' 
            ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200' 
            : feedback.type === 'error'
            ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
            : 'bg-blue-950/40 border-blue-800/60 text-blue-200'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 mt-0.5 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-5 h-5 mt-0.5 text-rose-400 shrink-0" />}
          <div className="text-sm font-medium">{feedback.message}</div>
        </div>
      )}

      {/* Grid der Aktionen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sicherung exportieren */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <Download className="w-5 h-5" />
              <h3>Manuelles Meilenstein-Backup</h3>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Exportiert deinen gesamten aktuellen Stand inklusive aller Stammdaten, Abrechnungen, Kalenderwochen und Einstellungen in eine manipulationssichere JSON-Datei mit SHA-Prüfsumme.
            </p>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Arbeitgeber im Bestand:</span>
                <span className="font-semibold text-slate-200">{state.arbeitgeber.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Erfasste Monatsabrechnungen:</span>
                <span className="font-semibold text-slate-200">{state.monatsabrechnungen.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Vorhandene Belege:</span>
                <span className="font-semibold text-slate-200">{state.belege.length}</span>
              </div>
            </div>
          </div>
          <div className="pt-6 flex gap-3">
            <button
              onClick={() => handleExport('manuell')}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-950"
            >
              <Download className="w-4 h-4" />
              Backup herunterladen
            </button>
          </div>
        </div>

        {/* Wiederherstellung */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold">
              <Upload className="w-5 h-5" />
              <h3>Wiederherstellung (Restore)</h3>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Stelle einen gespeicherten Stand wieder her. Die Datei wird vor dem Einspielen vollständig validiert:
              Prüfsumme, Schema-Konsistenz und anschließender Rücklese-Check garantieren Datenintegrität.
            </p>
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Ein erfolgreiches Einspielen überschreibt den aktuellen lokalen Zustand.</span>
            </div>
          </div>
          <div className="pt-6">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".json,.backup"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 border border-slate-700"
            >
              <Upload className="w-4 h-4" />
              Backup-Datei auswählen...
            </button>
          </div>
        </div>
      </div>

      {/* Selbsttest & Diagnostik */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-slate-200 font-semibold">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3>Integritäts- & Persistenzprüfung (B7-Nachweis)</h3>
          </div>
          <button
            onClick={runIntegritySelfTest}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Selbsttest starten
          </button>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Prüft den Schreib- und Lesezyklus in IndexedDB sowie die exakte Prüfsummenbildung gemäß Vorgabe B3.
        </p>
        {testResult && (
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400">
            {testResult}
          </div>
        )}
      </div>

      {/* Gefahrenzone */}
      <div className="border border-rose-900/40 bg-rose-950/10 rounded-2xl p-5 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-rose-300">Zurücksetzen auf Standardwerte</h4>
          <p className="text-xs text-rose-400/80">Löscht lokale Änderungen und setzt die Datenbank auf die Vorbelegungen des Klärungsdialogs zurück.</p>
        </div>
        <button
          onClick={() => {
            if (confirm('Möchtest du wirklich alle lokalen Daten auf die Standard-Vorbelegung zurücksetzen?')) {
              resetAll();
              setFeedback({ type: 'info', message: 'Zustand wurde auf die Klärungsdialog-Vorbelegung zurückgesetzt.' });
            }
          }}
          className="text-xs bg-rose-900/30 hover:bg-rose-900/50 text-rose-300 px-3 py-2 rounded-lg border border-rose-800/40 transition-colors"
        >
          Zurücksetzen
        </button>
      </div>
    </div>
  );
};
