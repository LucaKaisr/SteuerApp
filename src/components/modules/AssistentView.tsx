import React, { useState } from 'react';
import { useTax } from '../../context/TaxContext';
import { askTaxAssistant } from '../../services/assistantService';
import type { ChatMessage } from '../../services/assistantService';
import { 
  Bot, 
  Send, 
  Sparkles, 
  AlertCircle, 
  User, 
  Trash2, 
  Pin, 
  ExternalLink
} from 'lucide-react';

export const AssistentView: React.FC<{ onNavigateToSettings: () => void }> = ({ onNavigateToSettings }) => {
  const { state, updateState } = useTax();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init_msg',
      sender: 'assistant',
      text: 'Ich bin dein Steuer-Assistent für Werkstudenten. Ich bin kein Steuerberater und erteile keine verbindliche Steuerberatung, sondern helfe dir beim Verstehen, Erfassen und Strukturieren deiner Daten für die Erklärung 2026. Wie kann ich dir helfen?',
      timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Schnellfragen-Buttons aus Modul 3.8
  const quickQuestions = [
    'Lohnt sich der Einzelnachweis?',
    'Ist dieser Beleg absetzbar?',
    'Was fehlt mir noch?',
    'Wie wirkt sich mein Fußballvertrag steuerlich aus?',
    'Verlustvortrag – sinnvoll für mich?',
  ];

  const handleSendMessage = async (queryText: string) => {
    const textToSend = queryText.trim();
    if (!textToSend || isLoading) return;

    setErrorMsg(null);
    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const apiKey = state.einstellungen.geminiApiKey;
      if (!apiKey) {
        throw new Error('Kein Gemini-API-Key hinterlegt. Bitte trage deinen API-Key in den Einstellungen ein, um den KI-Assistenten zu nutzen.');
      }

      const answer = await askTaxAssistant(textToSend, messages, state, apiKey);

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'assistant',
        text: answer,
        timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setErrorMsg(err.message || 'Antwort gerade nicht verfügbar, bitte später erneut versuchen.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinAsTodo = (noteText: string) => {
    const shortSummary = noteText.slice(0, 100) + '...';
    updateState((prev) => ({
      ...prev,
      onboarding: {
        ...prev.onboarding,
        offeneFragen: [...prev.onboarding.offeneFragen, `Notiz aus Assistent: ${shortSummary}`],
      },
    }));
    alert('Als To-Do im Dashboard angeheftet!');
  };

  const handleClearChat = () => {
    if (confirm('Gesprächsverlauf leeren?')) {
      setMessages([
        {
          id: 'init_msg_reset',
          sender: 'assistant',
          text: 'Ich bin dein Steuer-Assistent für Werkstudenten. Ich bin kein Steuerberater und erteile keine verbindliche Steuerberatung. Wie kann ich dir helfen?',
          timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto h-[calc(100vh-5rem)] flex flex-col">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shrink-0 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Modul 3.8: Steuer-Assistent für Werkstudenten
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                Gemini 2.5
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Kontextsensitiv • Kennt deine Arbeitsorte (Heddesheim/Frankfurt), TH Mannheim, Fußballvertrag & Belege
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearChat}
            className="p-2 text-slate-400 hover:text-rose-400 bg-slate-950 rounded-xl border border-slate-800 transition-colors"
            title="Chat leeren"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* API Key Hinweis, falls nicht hinterlegt */}
      {!state.einstellungen.geminiApiKey && (
        <div className="p-4 bg-amber-950/30 border border-amber-900/40 rounded-2xl flex items-center justify-between text-xs text-amber-200 shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Du hast noch keinen Gemini-API-Key hinterlegt. Hinterlege ihn, um direkt mit dem Assistenten zu chatten.</span>
          </div>
          <button
            onClick={onNavigateToSettings}
            className="bg-amber-600 hover:bg-amber-500 text-white font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <span>Zu den Einstellungen</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Schnellfragen Leiste */}
      <div className="flex flex-wrap gap-2 shrink-0">
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            disabled={isLoading}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 text-xs px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>{q}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages Verlauf */}
      <div className="flex-1 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 overflow-y-auto space-y-4">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div key={m.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-2 shadow-sm ${
                isUser 
                  ? 'bg-emerald-600 text-white rounded-tr-none' 
                  : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
              }`}>
                <div className="whitespace-pre-wrap">{m.text}</div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/40 text-[10px] text-slate-400">
                  <span>{m.timestamp}</span>
                  {!isUser && (
                    <button
                      onClick={() => handlePinAsTodo(m.text)}
                      className="hover:text-emerald-400 flex items-center gap-1 transition-colors text-slate-400"
                      title="Als To-Do im Dashboard anheften"
                    >
                      <Pin className="w-3 h-3" /> In To-Do übernehmen
                    </button>
                  )}
                </div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-slate-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Assistent formuliert Antwort mit Kontext deiner Daten...
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="shrink-0 flex gap-2">
        <input
          type="text"
          placeholder="Frage zur Steuererklärung 2026, Pauschalen, Werkstudenten-Grenzen..."
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage(inputPrompt);
            }
          }}
          disabled={isLoading}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans"
        />
        <button
          onClick={() => handleSendMessage(inputPrompt)}
          disabled={isLoading || !inputPrompt.trim()}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-medium px-5 py-3 rounded-xl transition-colors flex items-center gap-2 text-xs shrink-0"
        >
          <Send className="w-4 h-4" />
          <span>Senden</span>
        </button>
      </div>
    </div>
  );
};
