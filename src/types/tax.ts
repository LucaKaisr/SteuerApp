// Types & Data Model for Steuer-Cockpit 2026

export type ArbeitgeberId = 'ag_a' | 'ag_b' | 'fussball_amateur';

export interface Arbeitgeber {
  id: ArbeitgeberId;
  name: string;
  zeitraumVon: string; // YYYY-MM-DD
  zeitraumBis: string; // YYYY-MM-DD or 'laufend'
  steuerklasse: number; // 1-6
  kirchensteuerpflicht: boolean;
  anschrift: string;
  entfernungKm: number; // einfache Strecke
  arbeitstageProWoche: number;
  verkehrsmittel: 'pkw' | 'oepnv' | 'fahrrad' | 'mischung';
}

export interface Lohnsteuerbescheinigung {
  id: string;
  arbeitgeberId: ArbeitgeberId;
  jahr: number;
  // Zeilennummern nach amtlicher Bescheinigung
  zeile3_bruttoarbeitslohn: number;
  zeile4_lohnsteuer: number;
  zeile5_solidaritaetszuschlag: number;
  zeile6_kirchensteuer: number;
  zeile22a_rv_arbeitgeber: number;
  zeile23a_rv_arbeitnehmer: number;
  zeile25_kv_arbeitnehmer: number;
  zeile26_pv_arbeitnehmer: number;
  zeile27_av_arbeitnehmer: number;
  zeile17_steuerfreie_fahrtkosten: number;
  zeile18_pauschal_besteuerte_bezuege: number;
  bestaetigt: boolean;
  originalBelegUrl?: string;
  hinweise?: string;
}

export interface Monatsabrechnung {
  id: string;
  arbeitgeberId: ArbeitgeberId;
  monat: number; // 1-12
  jahr: number;
  brutto: number;
  netto: number;
  lohnsteuer: number;
  soli: number;
  kirchensteuer: number;
  svBeitraegeGesamt: number;
  fahrtkostenzuschuss: number;
  sachbezuege: number;
  status: 'offen' | 'extrahiert' | 'bestaetigt';
  belegUrl?: string;
  notizen?: string;
}

export type KalenderTagTyp = 
  | 'arbeit_vor_ort_a'
  | 'arbeit_vor_ort_b'
  | 'homeoffice'
  | 'hochschule'
  | 'auswaertstaetigkeit'
  | 'urlaub'
  | 'krank'
  | 'frei';

export interface KalenderTag {
  datum: string; // YYYY-MM-DD
  primaerTyp: KalenderTagTyp;
  sekundaerTyp?: KalenderTagTyp; // z.B. vormittags Uni, nachmittags Arbeit
  stunden: number;
  notiz?: string;
  isAusnahme?: boolean;
}

export type WerbungskostenKategorie = 
  | 'wege_arbeit'
  | 'homeoffice'
  | 'arbeitsmittel'
  | 'fortbildung_bewerbung'
  | 'reisekosten'
  | 'doppelte_haushaltsfuehrung'
  | 'studienkosten'
  | 'sonstiges';

export interface Beleg {
  id: string;
  datum: string; // YYYY-MM-DD
  titel: string;
  betrag: number;
  kategorie: WerbungskostenKategorie | 'sonderausgaben' | 'lohn' | 'andere';
  arbeitgeberZuordnung?: ArbeitgeberId;
  belegUrl?: string; // base64 or objectUrl
  status: 'offen' | 'extrahiert' | 'bestaetigt';
  ohneNachweis: boolean;
  notiz?: string;
}

export interface OnboardingState {
  completed: boolean;
  abschlussDatum?: string;
  offeneFragen: string[];
}

export interface SteuerConfig2026 {
  jahr: number;
  grundfreibetrag: number; // z.B. 12.096 € für 2026
  arbeitnehmerPauschbetrag: number; // 1.230 €
  sonderausgabenPauschbetrag: number; // 36 €
  entfernungspauschaleProKm: number; // 0,30 € (ab 21. km 0,38 €)
  entfernungspauschaleAb21Km: number;
  homeofficeTagessatz: number; // 6 €
  homeofficeMaxTage: number; // 210 Tage (max 1.260 €)
  verpflegungGross: number; // 30 € (24h)
  verpflegungKlein: number; // 15 € (>8h)
  gwgGrenzeNetto: number; // 800 € (952 € brutto)
  studienkostenErststudiumMax: number; // 6.000 € (Sonderausgaben)
  werkstudentenMaxStundenWoche: number; // 20h
}

export interface AppState {
  version: number;
  letztesUpdate: string;
  config: SteuerConfig2026;
  onboarding: OnboardingState;
  arbeitgeber: Arbeitgeber[];
  lohnsteuerbescheinigungen: Lohnsteuerbescheinigung[];
  monatsabrechnungen: Monatsabrechnung[];
  kalender: Record<string, KalenderTag>; // key: YYYY-MM-DD
  belege: Beleg[];
  einstellungen: {
    theme: 'dark' | 'light';
    autoSaveIntervalMs: number;
    aktiveAnlagen: {
      sonderausgaben: boolean;
      doppelteHaushaltsfuehrung: boolean;
      amateurvertragFussball: boolean;
      kap: boolean;
      kind: boolean;
      v: boolean;
      so: boolean;
    };
    geminiApiKey?: string;
  };
}

export interface BackupMetadata {
  appVersion: number;
  erstelltAm: string;
  dateiname: string;
  checksum: string;
  datensaetzeCount: {
    arbeitgeber: number;
    lohnsteuerbescheinigungen: number;
    monatsabrechnungen: number;
    belege: number;
    kalendertage: number;
  };
}

export interface BackupFileContent {
  metadata: BackupMetadata;
  state: AppState;
}
