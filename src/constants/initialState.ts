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
    completed: true,
    abschlussDatum: new Date().toISOString(),
    offeneFragen: []
  },
  arbeitgeber: [
    {
      id: 'ag_a',
      name: 'pfenning logistics GmbH',
      zeitraumVon: '2026-01-01',
      zeitraumBis: '2026-07-15',
      steuerklasse: 1,
      kirchensteuerpflicht: true, // rk laut amtlicher Lohnsteuerbescheinigung
      anschrift: 'Daimlerstraße 4, 68542 Heddesheim',
      entfernungKm: 70,
      arbeitstageProWoche: 2,
      verkehrsmittel: 'pkw'
    },
    {
      id: 'ag_b',
      name: 'B.Schmitt mobile GmbH',
      zeitraumVon: '2026-08-01',
      zeitraumBis: '2026-12-31',
      steuerklasse: 1,
      kirchensteuerpflicht: true, // rk laut DATEV Entgeltabrechnung
      anschrift: 'Westerbachstraße 124, 65936 Frankfurt am Main',
      entfernungKm: 9,
      arbeitstageProWoche: 3,
      verkehrsmittel: 'pkw'
    },
    {
      id: 'fussball_amateur',
      name: 'Fußballverein (Amateurvertrag)',
      zeitraumVon: '2026-08-01',
      zeitraumBis: 'laufend',
      steuerklasse: 6,
      kirchensteuerpflicht: true,
      anschrift: 'Sportgelände',
      entfernungKm: 5,
      arbeitstageProWoche: 3,
      verkehrsmittel: 'pkw'
    }
  ],
  lohnsteuerbescheinigungen: [
    {
      id: 'lsb_pfenning_2026',
      arbeitgeberId: 'ag_a',
      jahr: 2026,
      zeile3_bruttoarbeitslohn: 7824.50,
      zeile4_lohnsteuer: 293.16,
      zeile5_solidaritaetszuschlag: 0.00,
      zeile6_kirchensteuer: 23.45,
      zeile22a_rv_arbeitgeber: 727.68,
      zeile23a_rv_arbeitnehmer: 727.68,
      zeile25_kv_arbeitnehmer: 0.00,
      zeile26_pv_arbeitnehmer: 0.00,
      zeile27_av_arbeitnehmer: 0.00,
      zeile17_steuerfreie_fahrtkosten: 0.00,
      zeile18_pauschal_besteuerte_bezuege: 0.00,
      bestaetigt: true
    },
    {
      id: 'lsb_bschmitt_2026',
      arbeitgeberId: 'ag_b',
      jahr: 2026,
      zeile3_bruttoarbeitslohn: 6640.00, // Stand Sep 2026 inkl. Nachberechnung Aug
      zeile4_lohnsteuer: 938.32,
      zeile5_solidaritaetszuschlag: 0.00,
      zeile6_kirchensteuer: 84.44,
      zeile22a_rv_arbeitgeber: 617.52,
      zeile23a_rv_arbeitnehmer: 617.52,
      zeile25_kv_arbeitnehmer: 0.00,
      zeile26_pv_arbeitnehmer: 0.00,
      zeile27_av_arbeitnehmer: 0.00,
      zeile17_steuerfreie_fahrtkosten: 0.00,
      zeile18_pauschal_besteuerte_bezuege: 0.00,
      bestaetigt: true
    }
  ],
  monatsabrechnungen: [
    {
      id: 'ma_ag_a_1',
      arbeitgeberId: 'ag_a',
      monat: 1,
      jahr: 2026,
      brutto: 1509.95,
      netto: 1369.52,
      lohnsteuer: 0.00,
      soli: 0.00,
      kirchensteuer: 0.00,
      svBeitraegeGesamt: 140.43,
      fahrtkostenzuschuss: 0,
      sachbezuege: 0,
      status: 'bestaetigt'
    },
    {
      id: 'ma_ag_a_2',
      arbeitgeberId: 'ag_a',
      monat: 2,
      jahr: 2026,
      brutto: 1509.95,
      netto: 1369.52,
      lohnsteuer: 0.00,
      soli: 0.00,
      kirchensteuer: 0.00,
      svBeitraegeGesamt: 140.43,
      fahrtkostenzuschuss: 0,
      sachbezuege: 0,
      status: 'bestaetigt'
    },
    {
      id: 'ma_ag_a_3',
      arbeitgeberId: 'ag_a',
      monat: 3,
      jahr: 2026,
      brutto: 1509.95,
      netto: 1369.52,
      lohnsteuer: 0.00,
      soli: 0.00,
      kirchensteuer: 0.00,
      svBeitraegeGesamt: 140.43,
      fahrtkostenzuschuss: 0,
      sachbezuege: 0,
      status: 'bestaetigt'
    },
    {
      id: 'ma_ag_a_4',
      arbeitgeberId: 'ag_a',
      monat: 4,
      jahr: 2026,
      brutto: 1099.35,
      netto: 997.11,
      lohnsteuer: 0.00,
      soli: 0.00,
      kirchensteuer: 0.00,
      svBeitraegeGesamt: 102.24,
      fahrtkostenzuschuss: 0,
      sachbezuege: 0,
      status: 'bestaetigt'
    },
    {
      id: 'ma_ag_a_5',
      arbeitgeberId: 'ag_a',
      monat: 5,
      jahr: 2026,
      brutto: 826.95,
      netto: 750.04,
      lohnsteuer: 0.00,
      soli: 0.00,
      kirchensteuer: 0.00,
      svBeitraegeGesamt: 76.91,
      fahrtkostenzuschuss: 0,
      sachbezuege: 0,
      status: 'bestaetigt'
    },
    {
      id: 'ma_ag_a_6',
      arbeitgeberId: 'ag_a',
      monat: 6,
      jahr: 2026,
      brutto: 839.85,
      netto: 761.74,
      lohnsteuer: 0.00,
      soli: 0.00,
      kirchensteuer: 0.00,
      svBeitraegeGesamt: 78.11,
      fahrtkostenzuschuss: 0,
      sachbezuege: 0,
      status: 'bestaetigt'
    },
    {
      id: 'ma_ag_a_7',
      arbeitgeberId: 'ag_a',
      monat: 7,
      jahr: 2026,
      brutto: 528.50,
      netto: 479.35,
      lohnsteuer: 293.16,
      soli: 0.00,
      kirchensteuer: 23.45,
      svBeitraegeGesamt: 49.15,
      fahrtkostenzuschuss: 0,
      sachbezuege: 0,
      status: 'bestaetigt'
    },
    {
      id: 'ma_ag_b_8',
      arbeitgeberId: 'ag_b',
      monat: 8,
      jahr: 2026,
      brutto: 3320.00, // 1.720 € Grundgehalt + 1.600 € Überstundenabgeltung (korrigiert lt. 1. NB)
      netto: 2499.86,
      lohnsteuer: 469.16,
      soli: 0.00,
      kirchensteuer: 42.22,
      svBeitraegeGesamt: 308.76, // 9,3% RV (Werkstudent)
      fahrtkostenzuschuss: 0,
      sachbezuege: 0,
      status: 'bestaetigt'
    },
    {
      id: 'ma_ag_b_9',
      arbeitgeberId: 'ag_b',
      monat: 9,
      jahr: 2026,
      brutto: 3320.00, // 1.720 € Grundgehalt + 1.600 € Überstundenabgeltung
      netto: 2499.86,
      lohnsteuer: 469.16,
      soli: 0.00,
      kirchensteuer: 42.22,
      svBeitraegeGesamt: 308.76,
      fahrtkostenzuschuss: 0,
      sachbezuege: 0,
      status: 'bestaetigt'
    }
  ],
  kalender: {},
  belege: [
    {
      id: 'bel_thm_sem_2026',
      datum: '2026-03-15',
      titel: 'Semesterbeitrag TH Mannheim SoSe 2026',
      betrag: 215.50,
      kategorie: 'studienkosten',
      status: 'bestaetigt',
      ohneNachweis: false
    },
    {
      id: 'bel_umzug_pauschale_2026',
      datum: '2026-07-15',
      titel: 'Umzugskostenpauschale (§ 10 BUKG) – Am Posthorn, FFM',
      betrag: 964.00,
      kategorie: 'sonstiges',
      status: 'bestaetigt',
      ohneNachweis: true
    }
  ],
  einstellungen: {
    theme: 'light',
    autoSaveIntervalMs: 2000,
    aktiveAnlagen: {
      sonderausgaben: true,
      doppelteHaushaltsfuehrung: true,
      amateurvertragFussball: true,
      kap: false,
      kind: false,
      v: false,
      so: false,
    },
    geminiApiKey: ''
  }
};
