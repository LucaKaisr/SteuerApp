import { GoogleGenAI } from '@google/genai';
import type { AppState } from '../types/tax';

const WERKSTUDENT_SYSTEM_PROMPT = `Du bist der „Steuer-Assistent für Werkstudenten" in einer privaten Erfassungs-App für die deutsche Einkommensteuererklärung. Du bist kein Steuerberater und erteilst keine verbindliche Steuerberatung; du bist eine Informations- und Ausfüllhilfe. Sag das einmal zu Beginn jedes neuen Gesprächs in einem Satz und danach nur, wenn es haftungsrelevant wird.
Dein Schwerpunkt ist die Situation von Werkstudenten in Deutschland: Werkstudentenprivileg in der Sozialversicherung (20-Stunden-Regel, Ausnahmen in Semesterferien), Lohnsteuer und Steuerklassen bei einem oder zwei Arbeitgebern, Abgrenzung Erststudium (Sonderausgaben) vs. Zweitstudium/Studium nach Erstausbildung (Werbungskosten), Verlustfeststellung und Verlustvortrag, Hochschule als erste Tätigkeitsstätte, Semesterticket, Arbeitsmittel und Homeoffice, BAföG und Stipendien (grundsätzlich steuerfrei, Ausnahmen prüfen), Minijob neben Werkstudentenjob, Arbeitgeberwechsel innerhalb eines Jahres mit zwei Lohnsteuerbescheinigungen, Lohnersatzleistungen und Progressionsvorbehalt, Grundfreibetrag und wann sich eine Abgabe lohnt.
Regeln: Antworte auf Deutsch, knapp, zuerst die Kernaussage, dann die Begründung, dann was der Nutzer konkret in der App eintragen soll. Nenne bei Beträgen, Pauschalen und Fristen immer das Veranlagungsjahr und die Quelle (BMF, EStG-Paragraf, ELSTER) und weise darauf hin, dass der aktuelle Wert zu prüfen ist, wenn du ihn nicht sicher kennst. Erfinde keine Paragrafen, Werte oder Fristen. Trenne klar: gesicherte Regel / Einschätzung / Annahme. Bei Sachverhalten mit Auslegungsspielraum oder hohem Betrag (Verlustvortrag über mehrere Jahre, Abfindung, doppelte Haushaltsführung, Auslandsbezug) empfiehl Lohnsteuerhilfeverein oder Steuerberater. Frage nach, wenn dir für eine Einschätzung eine Angabe fehlt, statt zu raten. Nutze die im Kontext übergebenen App-Daten, verlange keine zusätzlichen personenbezogenen Daten (Name, Steuer-ID, Adresse).`;

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export async function askTaxAssistant(
  prompt: string,
  history: ChatMessage[],
  appState: AppState,
  apiKey: string
): Promise<string> {
  if (!apiKey) {
    throw new Error('Kein Gemini-API-Key hinterlegt. Bitte trage deinen Schlüssel in den Einstellungen ein.');
  }

  const ai = new GoogleGenAI({ apiKey });

  // Minimalen, DSGVO-konformen Kontext aus AppState aggregieren (keine sensiblen Rohdaten)
  const kalenderTage = Object.values(appState.kalender);
  const tageArbeitA = kalenderTage.filter(t => t.primaerTyp === 'arbeit_vor_ort_a').length;
  const tageArbeitB = kalenderTage.filter(t => t.primaerTyp === 'arbeit_vor_ort_b').length;
  const tageHomeoffice = kalenderTage.filter(t => t.primaerTyp === 'homeoffice').length;
  const tageHochschule = kalenderTage.filter(t => t.primaerTyp === 'hochschule').length;

  const brutto = appState.lohnsteuerbescheinigungen.reduce((acc, l) => acc + l.zeile3_bruttoarbeitslohn, 0);
  const lohnsteuer = appState.lohnsteuerbescheinigungen.reduce((acc, l) => acc + l.zeile4_lohnsteuer, 0);

  const contextSummary = `
Kontext des Nutzers (Steuerjahr 2026):
- Status: Werkstudent im Bachelor an der TH Mannheim (abgebrochene Vorstudien vorhanden -> steuerlich Erststudium/Sonderausgaben bis 6.000 €).
- Arbeitgeber A: pfenning logistics (01.01. - 15.07.2026, 70 km Distanz, StKl. 1). Erfasste Vor-Ort-Tage: ${tageArbeitA}.
- Arbeitgeber B: B.Schmitt mobile GmbH (01.08.2026 - laufend, 6 km Distanz, StKl. 1). Erfasste Vor-Ort-Tage: ${tageArbeitB}.
- Lücke zwischen AG: 16.07. - 31.07.2026 (ohne Leistungsbezug).
- Fußball-Amateurvertrag: Ab 01.08.2026, 10 Monate à 600 € (steuerliche Einstufung prüfen).
- Doppelte Haushaltsführung: Zweitwohnung Gorxheimertal bis 15.07.2026 aktiv.
- Kalender: ${tageHomeoffice} Homeoffice-Tage, ${tageHochschule} Präsenztage TH Mannheim erfasst.
- Bisher eingetragenes Brutto: ${brutto.toFixed(2)} €, einbehaltene LSt: ${lohnsteuer.toFixed(2)} €.
- Erfasste Belege: ${appState.belege.length} Belege.
`;

  try {
    const contents: any[] = [];

    // Bisherigen Gesprächsverlauf abbilden
    for (const msg of history.slice(-6)) {
      contents.push({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      });
    }

    // Aktuelle Nachricht mit Kontext
    contents.push({
      role: 'user',
      parts: [
        { text: `${contextSummary}\n\nFrage des Nutzers: ${prompt}` }
      ],
    });

    // Timeout-Schutz (25 Sekunden) gegen hängende Netzwerk-Verbindungen
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Zeitüberschreitung (Timeout): Keine Antwort vom KI-Dienst nach 25 Sekunden.')), 25000);
    });

    const generatePromise = ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction: WERKSTUDENT_SYSTEM_PROMPT,
        temperature: 0.2, // Hohe Präzision
      },
    });

    const response = await Promise.race([generatePromise, timeoutPromise]);

    const text = response.text;
    if (!text) {
      throw new Error('Antwort gerade nicht verfügbar, bitte später erneut versuchen.');
    }

    return text;
  } catch (err: any) {
    console.error('Gemini assistant error:', err);
    throw new Error(err.message || 'Antwort gerade nicht verfügbar, bitte später erneut versuchen.');
  }
}
