import { GoogleGenAI, Type } from '@google/genai';

export interface ExtractedLohnbescheinigung {
  bruttoarbeitslohn: number;
  lohnsteuer: number;
  solidaritaetszuschlag: number;
  kirchensteuer: number;
  rvArbeitgeber: number;
  rvArbeitnehmer: number;
  kvArbeitnehmer: number;
  pvArbeitnehmer: number;
  avArbeitnehmer: number;
  steuerfreieFahrtkosten: number;
  pauschalBesteuerteBezuege: number;
}

export interface ExtractedMonatsabrechnung {
  monat: number;
  jahr: number;
  brutto: number;
  netto: number;
  lohnsteuer: number;
  soli: number;
  kirchensteuer: number;
  svBeitraegeGesamt: number;
  fahrtkostenzuschuss: number;
  sachbezuege: number;
}

class GeminiService {
  /**
   * Bild zu Base64 data part für Gemini konvertieren
   */
  private async fileToGenerativePart(file: File): Promise<{ inlineData: { data: string; mimeType: string } }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = (reader.result as string).split(',')[1];
        resolve({
          inlineData: {
            data: base64Data,
            mimeType: file.type || 'image/jpeg',
          },
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Extrahiert Daten aus einer elektronischen Lohnsteuerbescheinigung (B4, B5)
   */
  async extractLohnsteuerbescheinigung(file: File, apiKey: string): Promise<ExtractedLohnbescheinigung> {
    if (!apiKey) {
      throw new Error('Kein Gemini-API-Key hinterlegt. Bitte trage deinen Schlüssel in den Einstellungen ein oder nutze die manuelle Eingabe.');
    }

    const ai = new GoogleGenAI({ apiKey });
    const imagePart = await this.fileToGenerativePart(file);

    const prompt = `Analysiere diese deutsche elektronische Lohnsteuerbescheinigung.
Extrahiere die numerischen Euro-Beträge präzise für die amtlichen Zeilennummern.
Liefere das Ergebnis strikt im geforderten JSON-Format. Nicht vorhandene Werte sind 0.0.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            imagePart,
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bruttoarbeitslohn: { type: Type.NUMBER, description: 'Zeile 3: Bruttoarbeitslohn' },
            lohnsteuer: { type: Type.NUMBER, description: 'Zeile 4: Lohnsteuer' },
            solidaritaetszuschlag: { type: Type.NUMBER, description: 'Zeile 5: Solidaritätszuschlag' },
            kirchensteuer: { type: Type.NUMBER, description: 'Zeile 6: Kirchensteuer' },
            rvArbeitgeber: { type: Type.NUMBER, description: 'Zeile 22a: Arbeitgeberanteil Rentenversicherung' },
            rvArbeitnehmer: { type: Type.NUMBER, description: 'Zeile 23a: Arbeitnehmeranteil Rentenversicherung' },
            kvArbeitnehmer: { type: Type.NUMBER, description: 'Zeile 25: Arbeitnehmerbeiträge Krankenversicherung' },
            pvArbeitnehmer: { type: Type.NUMBER, description: 'Zeile 26: Arbeitnehmerbeiträge Pflegeversicherung' },
            avArbeitnehmer: { type: Type.NUMBER, description: 'Zeile 27: Arbeitnehmerbeiträge Arbeitslosenversicherung' },
            steuerfreieFahrtkosten: { type: Type.NUMBER, description: 'Zeile 17: Steuerfreie Verpflegungs-/Fahrtkostenzuschüsse' },
            pauschalBesteuerteBezuege: { type: Type.NUMBER, description: 'Zeile 18: Pauschal besteuerte Bezüge' },
          },
          required: ['bruttoarbeitslohn', 'lohnsteuer'],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error('Gemini lieferte keine Antwort.');
    return JSON.parse(text) as ExtractedLohnbescheinigung;
  }

  /**
   * Extrahiert Daten aus einer Monatsabrechnung (Foto/Scan Papierbeleg)
   */
  async extractMonatsabrechnung(file: File, apiKey: string): Promise<ExtractedMonatsabrechnung> {
    if (!apiKey) {
      throw new Error('Kein Gemini-API-Key hinterlegt. Bitte trage deinen Schlüssel in den Einstellungen ein oder nutze die manuelle Eingabe.');
    }

    const ai = new GoogleGenAI({ apiKey });
    const imagePart = await this.fileToGenerativePart(file);

    const prompt = `Analysiere diesen Gehaltsnachweis / Monatsabrechnung eines Arbeitgebers in Deutschland.
Extrahiere Monat, Jahr, Brutto, Netto, Steuern und Sozialabgaben.
Falls der Beleg unscharf ist oder Beträge nicht eindeutig erkennbar sind, melde sichere Werte und setze unsichere Beträge vorsichtig an.
Liefere das Ergebnis strikt im geforderten JSON-Format.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            imagePart,
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            monat: { type: Type.INTEGER, description: 'Abrechnungsmonat (1-12)' },
            jahr: { type: Type.INTEGER, description: 'Abrechnungsjahr (z.B. 2026)' },
            brutto: { type: Type.NUMBER, description: 'Gesamtbrutto des Monats' },
            netto: { type: Type.NUMBER, description: 'Auszahlungsbetrag / Nettoverdienst' },
            lohnsteuer: { type: Type.NUMBER, description: 'Einbehaltene Lohnsteuer' },
            soli: { type: Type.NUMBER, description: 'Solidaritätszuschlag' },
            kirchensteuer: { type: Type.NUMBER, description: 'Kirchensteuer' },
            svBeitraegeGesamt: { type: Type.NUMBER, description: 'Summe der gesetzlichen SV-Abgaben' },
            fahrtkostenzuschuss: { type: Type.NUMBER, description: 'Steuerfreier Fahrtkostenzuschuss' },
            sachbezuege: { type: Type.NUMBER, description: 'Sachbezüge oder geldwerte Vorteile' },
          },
          required: ['monat', 'brutto', 'netto'],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error('Gemini lieferte keine Antwort.');
    return JSON.parse(text) as ExtractedMonatsabrechnung;
  }
}

export const geminiService = new GeminiService();
