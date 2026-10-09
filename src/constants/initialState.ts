import type { AppState, SteuerConfig2026 } from '../types/tax';

export const DEFAULT_CONFIG_2026: SteuerConfig2026 = {
  jahr: 2026,
  grundfreibetrag: 12096, // Vorläufiger Richtwert 2026 (BMF)
  arbeitnehmerPauschbetrag: 1230,
  sonderausgabenPauschbetrag: 36,
  entfernungspauschaleProKm: 0.30,
  entfernungspauschaleAb21Km: 0.38,
  homeofficeTagessatz: 6.00,
  homeofficeMaxTage: 210, // Max 1.260 €
  verpflegungGross: 30,
  verpflegungKlein: 15,
  gwgGrenzeNetto: 800,
  studienkostenErststudiumMax: 6000,
  werkstudentenMaxStundenWoche: 20,
};

export const INITIAL_APP_STATE: AppState = {
  version: 1,
  letztesUpdate: new Date().toISOString(),
  config: DEFAULT_CONFIG_2026,
  onboarding: {
    completed: true, // Durch den Klärungsdialog vorab bestätigt
    abschlussDatum: new Date().toISOString(),
    offeneFragen: [
      'Genaue Steuerklasse & Kirchensteuermerkmal bei Arbeitgeber A & B noch auf Bescheinigung prüfen',
      'Abrechnungsart Amateurvertrag Fußball (Minijob vs. Steuerklasse VI vs. Aufwandsentschädigung) prüfen'
    ]
  },
  arbeitgeber: [
    {
      id: 'ag_a',
      name: 'pfenning logistics',
      zeitraumVon: '2026-01-01',
      zeitraumBis: '2026-07-15',
      steuerklasse: 1,
      kirchensteuerpflicht: false,
      anschrift: 'Heddesheim (Start: Eppingen)',
      entfernungKm: 70,
      arbeitstageProWoche: 2,
      verkehrsmittel: 'pkw'
    },
    {
      id: 'ag_b',
      name: 'B.Schmitt mobile GmbH',
      zeitraumVon: '2026-08-01',
      zeitraumBis: 'laufend',
      steuerklasse: 1,
      kirchensteuerpflicht: false,
      anschrift: 'Westerbachstraße Frankfurt (Start: Am Posthorn FFM)',
      entfernungKm: 6,
      arbeitstageProWoche: 3,
      verkehrsmittel: 'pkw'
    },
    {
      id: 'fussball_amateur',
      name: 'Fußballverein (Amateurvertrag)',
      zeitraumVon: '2026-08-01',
      zeitraumBis: 'laufend',
      steuerklasse: 6, // Bei 2. AG bzw. Verein vorläufig als Zweitbeschäftigung geführt
      kirchensteuerpflicht: false,
      anschrift: 'Vereinsgelände',
      entfernungKm: 5,
      arbeitstageProWoche: 3,
      verkehrsmittel: 'pkw'
    }
  ],
  lohnsteuerbescheinigungen: [],
  monatsabrechnungen: [],
  kalender: {},
  belege: [],
  einstellungen: {
    theme: 'dark',
    autoSaveIntervalMs: 2000,
    aktiveAnlagen: {
      sonderausgaben: true, // Bachelor nach abgebrochenen Studiengängen
      doppelteHaushaltsfuehrung: true, // Wohnung Gorxheimertal bis 15.07.2026
      amateurvertragFussball: true, // 10 Monate à 600 €
      kap: false,
      kind: false,
      v: false,
      so: false,
    },
    geminiApiKey: ''
  }
};
