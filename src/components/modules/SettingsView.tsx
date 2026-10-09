import React, { useState } from 'react';
import { useTax } from '../../context/TaxContext';
import { formatEuro } from '../../utils/formatters';
import { Settings, Sliders, CheckCircle2 } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { state, updateState } = useTax();
  const [apiKey, setApiKey] = useState(state.einstellungen.geminiApiKey || '');
  const [savedNote, setSavedNote] = useState(false);

  const handleSaveApiKey = () => {
    updateState((prev) => ({
      ...prev,
      einstellungen: {
        ...prev.einstellungen,
        geminiApiKey: apiKey.trim(),
      },
    }));
    setSavedNote(true);
    setTimeout(() => setSavedNote(false), 2500);
  };

  const handleToggleAnlage = (key: keyof typeof state.einstellungen.aktiveAnlagen) => {
    updateState((prev) => ({
      ...prev,
      einstellungen: {
        ...prev.einstellungen,
        aktiveAnlagen: {
          ...prev.einstellungen.aktiveAnlagen,
          [key]: !prev.einstellungen.aktiveAnlagen[key],
        },
      },
    }));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-6 h-6 text-emerald-400" />
          <h2 className="text-xl font-bold text-white">Einstellungen & Konfiguration 2026 (B6)</h2>
        </div>
        <p className="text-sm text-slate-400">
          Zentrale Steuerung aller gesetzlichen Pauschalen, aktiven Steuer-Anlagen und des optionalen Gemini-API-Keys.
        </p>

        {/* Gesetzlicher Hinweis */}
        <div className="mt-4 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400">
          <strong>Rechtlicher Hinweis:</strong> Diese App ersetzt keine Steuerberatung. Maßgeblich sind die amtlichen elektronischen Lohnsteuerbescheinigungen und BMF-Formulare für das Veranlagungsjahr 2026.
        </div>
      </div>

      {/* Aktive Anlagen */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <Sliders className="w-5 h-5 text-indigo-400" />
          Sichtbare / Aktive Steuer-Module
        </h3>
        <p className="text-xs text-slate-400">
          Entsprechend deines Klärungsdialogs sind nicht benötigte Anlagen standardmäßig ausgeblendet und können hier aktiviert werden.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {Object.entries(state.einstellungen.aktiveAnlagen).map(([key, val]) => (
            <label
              key={key}
              className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                val
                  ? 'bg-emerald-950/20 border-emerald-800/50 text-emerald-200'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <span className="text-xs font-medium capitalize">
                {key.replace(/([A-Z])/g, ' $1')}
              </span>
              <input
                type="checkbox"
                checked={val}
                onChange={() => handleToggleAnlage(key as any)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-900 border-slate-700"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Konfigurationstabelle 2026 (B6) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-semibold text-white">Gesetzliche Kennzahlen 2026 (Konfigurationstabelle)</h3>
        <p className="text-xs text-slate-400">
          Diese Werte werden zentral für alle Berechnungen herangezogen und können bei BMF-Änderungen angepasst werden:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[11px] font-sans">Grundfreibetrag:</span>
            <span className="text-white font-bold">{formatEuro(state.config.grundfreibetrag)}</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[11px] font-sans">Arbeitnehmer-Pauschbetrag:</span>
            <span className="text-white font-bold">{formatEuro(state.config.arbeitnehmerPauschbetrag)}</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[11px] font-sans">Entfernungspauschale:</span>
            <span className="text-white font-bold">{state.config.entfernungspauschaleProKm.toFixed(2)} € / km</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[11px] font-sans">Homeoffice-Tagessatz:</span>
            <span className="text-white font-bold">{formatEuro(state.config.homeofficeTagessatz)} (max. {state.config.homeofficeMaxTage} Tage)</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[11px] font-sans">Erststudium Höchstbetrag:</span>
            <span className="text-white font-bold">{formatEuro(state.config.studienkostenErststudiumMax)}</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[11px] font-sans">Werkstudent Max-Std:</span>
            <span className="text-white font-bold">{state.config.werkstudentenMaxStundenWoche} h / Woche</span>
          </div>
        </div>
      </div>

      {/* Gemini API Key */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-semibold text-white">Google Gemini API-Key (Optional für Phase 2 & 4)</h3>
        <p className="text-xs text-slate-400">
          Wird für die automatische Foto-/Belegextraktion (Phase 2) und den Steuer-Assistenten-Chat (Phase 4) benötigt. 
          Der Schlüssel wird ausschließlich lokal in deiner Browser-Datenbank gespeichert.
        </p>

        <div className="flex gap-2">
          <input
            type="password"
            placeholder="AIzaSy..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
          />
          <button
            onClick={handleSaveApiKey}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2 rounded-xl text-sm transition-colors"
          >
            Speichern
          </button>
        </div>
        {savedNote && (
          <div className="text-xs text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Schlüssel lokal gesichert!
          </div>
        )}
      </div>
    </div>
  );
};
