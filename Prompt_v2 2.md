# Prompt für Google AI Studio (Build-Modus) – Steuer-Cockpit 2026

*Version 2, überarbeitet am 08.09.2026. Überarbeitungsgrundlage: Original-Prompt `Prompt_Steuer-App_AI-Studio.md` + gemeinsame Bausteine `Gemeinsame_Bausteine.md`. Vollständige Änderungsliste siehe separates Dokument.*

> Kopieren Sie den Block unten ab „## Der Prompt" 1:1 als **erste** Nachricht in AI Studio (Build-Modus). Der Block „Gemeinsame Bausteine" (B1–B7) ist bereits vollständig eingefügt – Sie müssen nichts mehr manuell ergänzen (B8 betrifft nur die Apps „Verkaufsassistent"/„Kleiderschrank-Inventar" und ist für diese App nicht relevant).
> Anders als in Version 1 müssen vor dem Absenden praktisch keine `[ECKIGEN KLAMMERN]` mehr manuell ausgefüllt werden: Alle situationsabhängigen Werte (Zeiträume, Kilometer, Beträge, zutreffende Anlagen …) werden ausschließlich **live im Klärungsdialog** (Abschnitt 0) erhoben – so entstehen keine Widersprüche zwischen vorab ausgefüllten Platzhaltern und späteren Dialogantworten.
> Mit `[PRÜFEN]` markierte Werte vor Nutzung gegen aktuelle Quellen (BMF, ELSTER-Formulare 2026, ai.google.dev) prüfen – nicht raten (siehe B1).
> Bauen Sie **eine Phase pro Chat-Nachricht** (siehe B1, Abschnitt 6 und die separate Datei `Folgeprompts_Steuer-App.md`) – kein Mega-Prompt für alle Phasen auf einmal, auch wenn AI Studio das technisch anbieten würde.

---

## Der Prompt

Erstelle eine Web-App (React + TypeScript, deutsche Oberfläche, responsiv) namens **„Steuer-Cockpit 2026"**. Sie soll mich das ganze Jahr über beim Sammeln, Prüfen und Strukturieren aller Daten für meine Einkommensteuererklärung 2026 (Deutschland) unterstützen, sodass ich am Jahresende alles vollständig und übersichtlich in ELSTER übertragen kann. Die App gibt **keine Steuerberatung**; sie ist ein Erfassungs-, Rechen- und Ausfüllhilfe-Werkzeug.

### 0. Klärungsdialog – ZUERST durchführen, bevor Code entsteht

Es gilt zusätzlich und uneingeschränkt die Rückfrage- und Ausführungsregel **B1** (siehe eingefügter Block in Abschnitt 2): jede Frage einzeln in einer eigenen Nachricht stellen, auf meine Antwort warten, keine Frage überspringen, am Ende alle Antworten in einer Tabelle zusammenfassen und von mir bestätigen lassen. Erst nach dieser Bestätigung beginnst du mit Abschnitt 6.

1. Zeitraum Arbeitgeber A (von–bis) und Zeitraum Arbeitgeber B (ab)?
2. Gab es zwischen beiden Arbeitgebern eine Lücke? Falls ja: mit Arbeitslosengeld/Krankengeld oder ohne Bezug? Falls nein: Gab es stattdessen eine zeitliche **Überschneidung** (beide Arbeitgeber gleichzeitig aktiv)? Falls ja: von–bis – das kann beim zweiten Arbeitgeber Steuerklasse VI auslösen.
3. Status: Werkstudent bei beiden Arbeitgebern oder nur bei einem? Erststudium oder Zweitstudium/Master nach abgeschlossener Erstausbildung? (Entscheidet, ob Studienkosten Werbungskosten oder Sonderausgaben sind.)
4. Steuerklasse bei Arbeitgeber A und B? Kirchensteuerpflichtig ja/nein?
5. Fahrten zur Arbeit je Arbeitgeber: einfache Entfernung in km, Verkehrsmittel, Arbeitstage pro Woche?
6. Fahrten zur Hochschule: Entfernung, Präsenztage pro Woche, Semesterticket vorhanden?
7. Homeoffice-Tage pro Monat (geschätzt)?
8. Welche Arbeitsmittel wurden 2026 angeschafft (Gerät, Preis grob, beruflicher/studentischer Nutzungsanteil)?
9. Gab es 2026 Umzug, Bewerbungskosten, Fortbildungen, Fachliteratur, Semesterbeiträge, Studiengebühren?
10. Welche weiteren Anlagen treffen zu: Spenden, private Versicherungen, Krankheitskosten, haushaltsnahe Dienstleistungen, Kapitalerträge (Bank-Steuerbescheinigung vorhanden?), Vermietung, Kind, **private Veräußerungsgeschäfte (z. B. Verkauf von Kryptowährungen oder anderen Wertgegenständen innerhalb der Spekulationsfrist)**?
11. Hast du BAföG, Stipendium oder Minijob-Einkünfte 2026? (Wichtig für Zusammenspiel mit Werkstudentenlohn.)
12. Wurden in Vorjahren Verluste (Studienkosten) festgestellt oder soll ein Verlustvortrag beantragt werden?
13. Datenhaltung: nur lokal im Browser oder später Cloud-Sync gewünscht?
14. Soll die App neben ELSTER-Ausfüllhilfe auch einen CSV-Export für eine Steuersoftware liefern? Falls ja, welche?
15. **[Neu ergänzt]** Gibt es neben deinem Hauptwohnsitz eine zusätzliche Wohnung am Studien- oder Arbeitsort (doppelte Haushaltsführung)? Falls ja: seit wann, grobe monatliche Kosten? (Steuerlich komplexer Fall – die App erfasst ihn nur strukturiert, siehe „Vor der Nutzung prüfen".)

Alle Antworten fließen als Vorbelegung in die Module ein **und ersetzen vollständig die früher hier vorgesehenen Klammer-Platzhalter in Abschnitt 1 und 4** – dort trage ich nichts zusätzlich manuell ein, damit keine widersprüchlichen Doppelangaben entstehen. Wo ich „weiß ich noch nicht" antworte, lege ein offenes To-do im Dashboard an.

### 1. Ausgangslage (feste Rahmenbedingungen)
- Steuerjahr 2026, **Einzelveranlagung** (keine Partner-Erfassung nötig).
- Zwei Arbeitgeber im Jahr 2026, im Regelfall **nacheinander** (nicht gleichzeitig, außer Frage 2 ergibt eine Überschneidung) – konkrete Zeiträume und Art des Übergangs werden ausschließlich über Fragen 1–2 des Klärungsdialogs erhoben und in der Bestätigungstabelle festgehalten.
- Monatsabrechnungen von Arbeitgeber B liegen nur in **Papierform** vor → Erfassung per Foto/Scan.
- Ich bin Werkstudent (Details aus Frage 3). Die App muss die Besonderheiten dieser Situation abbilden: Studienkosten, Fahrten zur Hochschule, Zusammenspiel mit BAföG/Minijob, Verlustvortrag, ggf. doppelte Haushaltsführung (Frage 15).
- Ich kann Werbungskosten geltend machen (Details in Abschnitt 3.4).
- Die App soll die **komplette Einkommensteuererklärung** abdecken: Hauptvordruck, Anlage N, Anlage Vorsorgeaufwand, Sonderausgaben, außergewöhnliche Belastungen, haushaltsnahe Aufwendungen, Anlage Kind, Anlage KAP, Anlage V. Module, die ich nicht brauche, kann ich in den Einstellungen ausblenden – standardmäßig sind alle aktiv.
- Welche der „weiteren Anlagen" bei mir konkret zutreffen (Spenden, Kind, Kapitalerträge, Vermietung, private Veräußerungsgeschäfte …), ergibt sich ausschließlich aus Frage 10 des Klärungsdialogs.

### 2. Architektur, Speicherung, Backup & Ausführungsregeln

**→ HIER WIRD DER BLOCK „GEMEINSAME BAUSTEINE" VOLLSTÄNDIG EINGEFÜGT (Abschnitte B1–B7, B8 nicht relevant für diese App) ←**
*(Wortlaut wörtlich aus `Gemeinsame_Bausteine.md` übernehmen: B1 Rückfrage- und Ausführungsregel, B2 Storage-Interface & Autosave, B3 Backup-Modul, B4 Bildvorverarbeitung und Schwärzung, B5 Gemini-Aufruf, B6 Konfigurationstabellen-Prinzip, B7 Phasen-Abnahmekriterien.)*

App-spezifische Ergänzungen zu diesem Block (stehen **nicht** im gemeinsamen Baustein, gelten nur für Steuer-Cockpit 2026):
- Gemini wird in dieser App ausschließlich für zwei Aufgaben genutzt: (a) Text-/Zahlenextraktion aus hochgeladenen Belegbildern, (b) Erklärungen und Plausibilitätsfragen im Chat (Modul 3.8). Es werden nur die jeweils nötigen Bilder/Werte gesendet, keine vollständigen Datenexporte „zur Sicherheit".
- Zusätzlich zu B2: Alles, was später in der ELSTER-Ausfüllhilfe (3.7) erscheinen soll, muss in der App **manuell erfassbar/korrigierbar** sein – kein Feld darf ausschließlich als „aus Beleg extrahiert" existieren, ohne dass ich es auch von Hand eintragen oder überschreiben kann.
- Zusätzlich zu B3, **optional und nicht abnahmerelevant nach B7**: Als dritter, zusätzlicher Speicherweg neben den zwei B3-Pflichtwegen kann später eine Ablage in Google Drive über die Drive-API angeboten werden (nur nach ausdrücklicher Anmeldung, App-eigener Ordner). Baue das nur, wenn ich es nach Phase 6 ausdrücklich beauftrage – es ersetzt keinen der beiden B3-Pflichtwege und ist keine Voraussetzung für „fertig" in Phase 1.
- Stufe 2 (später, jetzt **nicht** implementieren): Die Speicherschicht wird gemäß B2 so abstrahiert, dass eine Cloud-Synchronisation über ein Google-Konto (z. B. Firebase mit nutzerbezogenen Zugriffsregeln, clientseitige Verschlüsselung vor dem Upload) nachgerüstet werden kann, ohne die Fachmodule zu ändern.
- Beim Start prüfen, ob Daten vorhanden sind; wenn ja direkt ins Dashboard (3.1), wenn nein in den Onboarding-Assistenten (3.0).
- Dauerhaft sichtbarer Hinweis in den Einstellungen: „Diese App ersetzt keine Steuerberatung. Maßgeblich sind die elektronischen Lohnsteuerbescheinigungen und amtlichen Formulare."

### 3. Module (Navigation links, Dashboard als Startseite)

Für jedes Modul gilt zusätzlich zum Fachinhalt: *Fehlerfall* beschreibt, wie sich das Modul bei fehlerhaften/unvollständigen Eingaben verhält (nie raten, nie stillschweigend Nullwerte zeigen); *Fertig* verweist auf die Abnahmekriterien **B7**.

**3.0 Onboarding-Assistent**
*Zweck:* Ersteinrichtung – Antworten aus dem Klärungsdialog (Abschnitt 0) einsammeln und in die Fachmodule vorbelegen.
*Eingaben & Ausgaben/Speicherung:* Erster Start: geführter Dialog, der die Antworten aus Abschnitt 0 abfragt und in die Module vorbelegt (Speicherung siehe B2). Jederzeit unter Einstellungen erneut aufrufbar; ein erneuter Durchlauf überschreibt bestehende Werte nur nach ausdrücklicher Bestätigung je Frage, nicht automatisch.
*Fehlerfall:* Wird der Dialog mitten drin abgebrochen, bleibt der Fortschritt gespeichert und wird beim nächsten Start dort fortgesetzt, nicht neu begonnen.
*Fertig:* siehe B7.

**3.1 Dashboard**
*Zweck:* Zentrale Fortschritts- und Statusübersicht über alle Module.
*Eingaben & Ausgaben/Speicherung:* Fortschrittsbalken „Vollständigkeit der Erklärung" (je Modul: offen/teilweise/vollständig). Jahres-Checkliste mit Fälligkeiten: Lohnsteuerbescheinigungen beider Arbeitgeber erhalten, alle 12 Monatsabrechnungen erfasst, Belege kategorisiert, Pauschalen geprüft, Abgabefrist [PRÜFEN: Frist für 2026 aus BMF/ELSTER übernehmen]. Kennzahlen: Bruttoarbeitslohn kumuliert (getrennt je Arbeitgeber), einbehaltene Lohnsteuer kumuliert, Werbungskosten-Summe vs. Arbeitnehmer-Pauschbetrag [PRÜFEN: Wert 2026], geschätzte Erstattung/Nachzahlung mit Kennzeichnung „grobe Schätzung". Alle Werte werden aus den Fachmodulen aggregiert, nicht separat gepflegt.
*Fehlerfall:* Kann eine Kennzahl mangels Daten in einem Modul (z. B. unvollständiger Tageskalender) nicht verlässlich berechnet werden, zeigt das Dashboard „nicht berechenbar – Grund: …" statt eines geratenen Werts oder einer stillen Null.
*Fertig:* siehe B7.

**3.2 Arbeitgeber & Lohnsteuerbescheinigungen**
*Zweck:* Stammdaten beider Arbeitgeber und deren elektronische Lohnsteuerbescheinigung erfassen – Basis für Anlage N.
*Eingaben & Ausgaben/Speicherung:* Zwei Arbeitgeber-Karten mit Zeitraum, Steuerklasse, Kirchensteuermerkmal [ja/nein] (aus Fragen 1, 2, 4). Pro Arbeitgeber ein Formular, das die Felder der elektronischen Lohnsteuerbescheinigung abbildet (Bruttoarbeitslohn, Lohnsteuer, Solidaritätszuschlag, Kirchensteuer, Arbeitnehmer-/Arbeitgeberanteile RV/KV/PV/AV, steuerfreie Arbeitgeberleistungen wie Fahrtkostenzuschuss, Verpflegungszuschüsse, Sachbezüge). Die Zeilennummern aus der Bescheinigung als Feldbezeichnung anzeigen, aber die Nummerierung erst nach Upload einer echten Bescheinigung übernehmen – nicht erfinden. Upload der Lohnsteuerbescheinigung (PDF/Foto) → Gemini extrahiert die Werte (siehe B4, B5) → Nutzer bestätigt Feld für Feld (Extraktion nie ungeprüft übernehmen). Summenzeile über beide Arbeitgeber.
*Fehlerfall:* Schlägt die Extraktion fehl oder ist das Dokument keine Lohnsteuerbescheinigung, zeigt die App eine klare Fehlermeldung und bietet direkt die manuelle Eingabe aller Felder an – kein stiller Absturz, kein Rateergebnis.
*Fertig:* siehe B7.

**3.3 Monatsabrechnungen (Belegkontrolle)**
*Zweck:* Die nur in Papierform vorliegenden Monatsabrechnungen erfassen und gegen die Lohnsteuerbescheinigung plausibilisieren.
*Eingaben & Ausgaben/Speicherung:* Kalenderraster Jan–Dez 2026 je Arbeitgeber. Pro Monat: Foto/Scan hochladen (siehe B4) → Gemini extrahiert Brutto, Netto, Lohnsteuer, Soli, Kirchensteuer, SV-Beiträge, steuerfreie Zuschläge, Sachbezüge, Fahrtkostenzuschuss (siehe B5) → Nutzer bestätigt. Automatischer Jahresabgleich: Summe der Monatswerte vs. Lohnsteuerbescheinigung; Abweichungen farbig markieren und erklären lassen (z. B. Sonderzahlungen, Korrekturmonate). Für die Erklärung zählt die Lohnsteuerbescheinigung; die Monatsabrechnungen dienen der Kontrolle und der Herleitung von Werbungskosten (z. B. steuerfreie Zuschüsse, die die Entfernungspauschale mindern).
*Fehlerfall:* Ist ein Foto unscharf/unlesbar, kennzeichnet die App das Feld als „nicht sicher erkannt" statt einen geratenen Wert zu übernehmen; der Monat bleibt bis zur manuellen Nacherfassung „offen" und erscheint in der Jahres-Checkliste (3.1).
*Fertig:* siehe B7.

**3.3a Tageskalender (Grundlage aller Zählwerte)**
*Zweck:* Einzige, verbindliche Quelle für alle Tages-/Wochenzählwerte, die in andere Module einfließen (keine doppelte Pflege).
*Eingaben & Ausgaben/Speicherung:* Jahreskalender 2026, pro Tag ein Status: Arbeit vor Ort (Arbeitgeber A/B), Homeoffice, Hochschule, Auswärtstätigkeit, Urlaub, krank, frei. Mehrfachbelegung pro Tag möglich (z. B. vormittags Uni, nachmittags Arbeit). Schnellerfassung per Wochenmuster („Mo/Di Arbeit, Mi Uni, Do Homeoffice") mit Ausnahmen per Klick. Alle Zählwerte (Arbeitstage je Arbeitgeber, Homeoffice-Tage, Präsenztage Hochschule, Reisetage) werden ausschließlich aus diesem Kalender berechnet und in die Werbungskosten (3.4) übernommen.
*Fehlerfall:* Widerspricht eine per Klick gesetzte Ausnahme dem aktiven Wochenmuster für denselben Tag, wird gewarnt/nachgefragt statt den Tag still zu überschreiben.
*Fertig:* siehe B7.

**3.3b Werkstudenten-Monitor**
*Zweck:* Überwachen, ob die sozialversicherungsrechtliche Werkstudentengrenze eingehalten wird, und die Grundfreibetrags-Relevanz im Blick behalten.
*Eingaben & Ausgaben/Speicherung:* Wochenstunden je Arbeitgeber (aus Kalender 3.3a oder manuell); Warnung bei Überschreitung der Werkstudenten-Grenze [PRÜFEN: 20-Stunden-Regel, Ausnahmen Semesterferien/Abend-Wochenende, 26-Wochen-Regel]. Jahresübersicht Bruttolohn kumuliert vs. Grundfreibetrag [PRÜFEN] mit Hinweis, ob eine Erstattung wahrscheinlich ist.
*Fehlerfall:* Fehlen für einen Zeitraum Kalenderdaten, zeigt der Monitor „unvollständige Datenbasis für Zeitraum X" statt eine Grenzüberschreitung fälschlich zu bestätigen oder zu verneinen.
*Fertig:* siehe B7.

**3.4 Werbungskosten**
*Zweck:* Alle Werbungskosten-Kategorien vollständig erfassen und dem Pauschbetrag gegenüberstellen.
*Eingaben & Ausgaben/Speicherung:* Kategorien mit eigener Erfassungslogik; je Beleg Datum, Betrag, Kategorie, Arbeitgeber-Zuordnung, Foto, Notiz:
- **Wege Wohnung – erste Tätigkeitsstätte**, getrennt je Arbeitgeber: Entfernungskilometer (einfache Strecke), Arbeitstage im Zeitraum, Verkehrsmittel; Berechnung mit konfigurierbarem Satz [PRÜFEN: Entfernungspauschale 2026, ggf. Staffelung ab dem 21. km]; Abzug steuerfreier Arbeitgeberzuschüsse; Hinweis auf Höchstbetrag bei ÖPNV/nicht eigenem Pkw [PRÜFEN].
- **Homeoffice-Pauschale**: Tageszähler mit Kalender, konfigurierbarer Tagessatz und Jahreshöchstbetrag [PRÜFEN]; Ausschluss von Tagen mit Fahrt zur ersten Tätigkeitsstätte, sofern nicht zulässig [PRÜFEN].
- **Arbeitsmittel** (Computer, Software, Möbel, Fachliteratur): Sofortabzug vs. Abschreibung mit konfigurierbarer Grenze [PRÜFEN: GWG-Grenze, Sofortabschreibung digitaler Wirtschaftsgüter]; berufliche Nutzungsquote in %.
- **Fortbildung / Bewerbungskosten / Umzug aus beruflichem Anlass** (relevant beim Arbeitgeberwechsel): Freitext + Beleg; Umzugskostenpauschale konfigurierbar [PRÜFEN].
- **Reisekosten / Verpflegungsmehraufwand** bei Auswärtstätigkeit: Datum, Abwesenheitsdauer, Pauschale nach Konfiguration [PRÜFEN], Erstattungen des Arbeitgebers gegenrechnen.
- **Doppelte Haushaltsführung** [neu ergänzt, nur sichtbar/erfassbar, falls Frage 15 mit „ja" beantwortet wurde – sonst Kategorie ausgeblendet]: Unterkunftskosten [PRÜFEN: Höchstbetrag], Erstausstattung, Familienheimfahrten, Verpflegungsmehraufwand in den ersten drei Monaten [PRÜFEN].
- **Studienkosten (Werkstudent)**: Semesterbeiträge, Studiengebühren, Fachliteratur, Exkursionen, Fahrten zur Hochschule, Auslandssemester. Die App ordnet nach Antwort aus Frage 3 automatisch zu: Zweitstudium/nach Erstausbildung → Werbungskosten (unbegrenzt, ggf. Verlustvortrag); Erststudium → Sonderausgaben mit Höchstbetrag [PRÜFEN]. Zuordnung sichtbar begründen und änderbar machen.
- **Sonstiges**: Kontoführung, Berufsverband, Arbeitskleidung, Telefon/Internet (Quote), Steuerberatungskosten (Hinweis: nur beruflicher Anteil).
Laufender Vergleich: Summe Werbungskosten vs. Pauschbetrag mit Hinweis „lohnt sich Einzelnachweis?".
*Fehlerfall:* Ist zu einem erfassten Betrag kein Beleg hinterlegt, wird der Eintrag mit „ohne Beleg" gekennzeichnet und taucht in der Prüfliste vor Export (3.7) auf, wird aber nicht automatisch aus der Summe entfernt (Entscheidung bleibt bei mir).
*Fertig:* siehe B7.

**3.5 Weitere Anlagen (Standardmodule, einzeln ausblendbar)**
*Zweck:* Alle laut Frage 10 zutreffenden weiteren Anlagen strukturiert erfassen.
*Eingaben & Ausgaben/Speicherung:*
- **Sonderausgaben**: Vorsorgeaufwendungen (Übernahme aus Lohnsteuerbescheinigung, private Zusatzversicherungen, Haftpflicht, Riester/Rürup), Spenden mit Belegupload und Zuwendungsbestätigung, gezahlte/erstattete Kirchensteuer, Unterhalt. Hinweis: Bei beitragsfreier Familienversicherung entstehen keine gesonderten KV/PV-Beiträge – Feld dann leer lassen, nicht schätzen.
- **Außergewöhnliche Belastungen**: Krankheitskosten, Pflege, Behinderten-Pauschbetrag; Berechnung der zumutbaren Belastung mit konfigurierbaren Stufen [PRÜFEN].
- **Haushaltsnahe Dienstleistungen / Handwerkerleistungen**: nur Arbeitskosten anrechenbar, Rechnung + unbarer Zahlungsnachweis als Pflichtfelder, Höchstbeträge konfigurierbar [PRÜFEN].
- **Anlage Kind**: Kinderfreibetrag/Kindergeld-Günstigerprüfung, Betreuungskosten, Schulgeld [PRÜFEN].
- **Anlage KAP**: Steuerbescheinigungen der Banken per Upload extrahieren, Sparer-Pauschbetrag [PRÜFEN], Günstigerprüfung anregen.
- **Anlage V**: Einnahmen, Werbungskosten, AfA je Objekt (Objektdaten nur als Kürzel, keine Adressen).
- **Anlage SO (private Veräußerungsgeschäfte)** [neu ergänzt, nur falls laut Frage 10 zutreffend]: Kauf-/Verkaufsdatum, Preise je Vorgang, Freigrenze [PRÜFEN].
- **Lohnersatzleistungen** (bei Lücke zwischen den Arbeitgebern): Arbeitslosengeld/Krankengeld mit Hinweis Progressionsvorbehalt.
Jedes Modul liefert eigenen Vollständigkeitsstatus ans Dashboard und eigene Zeilen in die ELSTER-Ausfüllhilfe.
*Fehlerfall:* Fehlt bei einer Kategorie ein gesetzlich erforderliches Pflichtfeld (z. B. unbarer Zahlungsnachweis bei Handwerkerleistungen), wird der Eintrag **nicht** in die ELSTER-Ausfüllhilfe übernommen, sondern in der Prüfliste (3.7) als unvollständig markiert.
*Fertig:* siehe B7.

**3.6 Belegarchiv**
*Zweck:* Zentrales, durchsuchbares Archiv aller Belege inkl. Kontoauszugs-Import.
*Eingaben & Ausgaben/Speicherung:* Alle Uploads mit Vorschau, Kategorie, Status (extrahiert/bestätigt/offen), Volltextsuche, Filter nach Monat/Arbeitgeber/Kategorie. Massenupload; Duplikaterkennung über Datum+Betrag. CSV-Import von Kontoauszügen (Standardformate deutscher Banken, Spaltenzuordnung per Dialog): Gemini schlägt pro Buchung vor, ob sie steuerlich relevant sein könnte und in welche Kategorie (siehe B5); Nutzer bestätigt oder verwirft. Kontodaten (IBAN, Empfängername) werden nach dem Import nicht gespeichert, nur Datum, Betrag, Verwendungszweck.
*Fehlerfall:* Erkennt die App das Spaltenformat eines importierten CSV nicht automatisch, wird eine manuelle Spaltenzuordnung abgefragt statt zu raten; nicht zuordenbare Zeilen werden übersprungen und aufgelistet, nicht stillschweigend verworfen.
*Fertig:* siehe B7. Dieses Modul (**inklusive** CSV-Kontoauszug-Import) wird vollständig in Phase 3 gebaut – siehe Abschnitt 6.

**3.7 ELSTER-Ausfüllhilfe & Export**
*Zweck:* Alle erfassten Werte in eine manuell übertragbare ELSTER-Ausfüllhilfe überführen.
*Eingaben & Ausgaben/Speicherung:* Ansicht „Übertragung nach ELSTER": strukturierte Gegenüberstellung meiner Werte zu den Formularen Hauptvordruck ESt 1 A, Anlage N, Anlage Vorsorgeaufwand (und aktivierte weitere Anlagen). Zeilenzuordnung aus den aktuellen ELSTER-Formularen 2026 übernehmen und als „[zu prüfen]" markieren, wo unsicher. Export als PDF (Ausfüllhilfe + Belegliste), CSV je Modul, JSON (Vollbackup). Prüfliste vor Export: fehlende Monate, unbestätigte Extraktionen, Werbungskosten ohne Beleg, Abweichung Monatsabrechnungen ↔ Lohnsteuerbescheinigung, fehlende Pflichtfelder aus 3.5.
*Fehlerfall:* Bestehen ungeklärte Abweichungen zwischen Monatsabrechnungen und Lohnsteuerbescheinigung, wird der Export nicht blockiert, aber die betroffenen Werte werden im Export deutlich als „abweichend – vor Nutzung prüfen" markiert statt stillschweigend die Lohnsteuerbescheinigung zu übernehmen.
*Fertig:* siehe B7.

**3.7a Nach der Abgabe: Bescheid-Abgleich**
*Zweck:* Den Steuerbescheid gegen die eigene Erklärung prüfen und Fristen im Blick behalten.
*Eingaben & Ausgaben/Speicherung:* Upload des Steuerbescheids → Gemini extrahiert festgesetzte Werte (siehe B4/B5) → Gegenüberstellung zu meinen erklärten Werten, Abweichungen markieren. Einspruchsfrist-Rechner ab Bescheiddatum [PRÜFEN: Frist und Bekanntgabefiktion] mit Countdown im Dashboard. Entwurf eines Einspruchsschreibens durch den Assistenten, gekennzeichnet als „Entwurf – vor Versand prüfen".
*Fehlerfall:* Ist der Bescheid nicht lesbar extrahierbar, bietet die App direkt die manuelle Eingabe der festgesetzten Werte an; der Fristen-Countdown läuft trotzdem ab dem manuell eingetragenen Bescheiddatum weiter.
*Fertig:* siehe B7.

**3.7b Mehrjahresfähigkeit**
*Zweck:* Die App über das Jahr 2026 hinaus nutzbar machen.
*Eingaben & Ausgaben/Speicherung:* Steuerjahr umschaltbar; 2027 anlegbar mit Übernahme von Stammdaten, Arbeitgeber, Wochenmuster, Konfigurationstabelle (Werte dann als „zu aktualisieren" markiert, siehe B6) und Verlustvortrag aus dem Vorjahr.
*Fehlerfall:* Wird ein neues Jahr angelegt, bevor das Vorjahr laut Dashboard (3.1) vollständig abgeschlossen ist, erscheint eine Warnung, das Anlegen wird aber nicht verhindert.
*Fertig:* siehe B7.

**3.8 Steuer-Assistent für Werkstudenten (Chat-Seitenleiste, Gemini)**
*Zweck:* Kontextsensitive Erklärungs- und Plausibilitätshilfe zur Werkstudenten-Situation, keine verbindliche Steuerberatung.
*Eingaben & Ausgaben/Speicherung:* Eigenständiger Chat, jederzeit erreichbar, mit Zugriff auf meine erfassten Daten (nur Werte, keine Rohbilder, außer ich hänge ausdrücklich einen Beleg an, siehe B4). Kontextsensitiv: erkennt, welches Modul geöffnet ist. Schnellfragen-Buttons: „Lohnt sich der Einzelnachweis?", „Ist dieser Beleg absetzbar?", „Was fehlt mir noch?", „Erklär mir Monat X", „Verlustvortrag – sinnvoll für mich?" Jede Antwort kann per Klick als Notiz an das betroffene Modul angeheftet werden („in Dashboard-To-do übernehmen"). Gesprächsverlauf lokal speichern (siehe B2), löschbar.

**Systemanweisung des Assistenten (wörtlich verwenden):**

> Du bist der „Steuer-Assistent für Werkstudenten" in einer privaten Erfassungs-App für die deutsche Einkommensteuererklärung. Du bist **kein Steuerberater** und erteilst keine verbindliche Steuerberatung; du bist eine Informations- und Ausfüllhilfe. Sag das einmal zu Beginn jedes neuen Gesprächs in einem Satz und danach nur, wenn es haftungsrelevant wird.
> Dein Schwerpunkt ist die Situation von Werkstudenten in Deutschland: Werkstudentenprivileg in der Sozialversicherung (20-Stunden-Regel, Ausnahmen in Semesterferien), Lohnsteuer und Steuerklassen bei einem oder zwei Arbeitgebern, Abgrenzung Erststudium (Sonderausgaben) vs. Zweitstudium/Studium nach Erstausbildung (Werbungskosten), Verlustfeststellung und Verlustvortrag, Hochschule als erste Tätigkeitsstätte, Semesterticket, Arbeitsmittel und Homeoffice, BAföG und Stipendien (grundsätzlich steuerfrei, Ausnahmen prüfen), Minijob neben Werkstudentenjob, Arbeitgeberwechsel innerhalb eines Jahres mit zwei Lohnsteuerbescheinigungen, Lohnersatzleistungen und Progressionsvorbehalt, Grundfreibetrag und wann sich eine Abgabe lohnt.
> Regeln: Antworte auf Deutsch, knapp, zuerst die Kernaussage, dann die Begründung, dann was der Nutzer konkret in der App eintragen soll. Nenne bei Beträgen, Pauschalen und Fristen immer das Veranlagungsjahr und die Quelle (BMF, EStG-Paragraf, ELSTER) und weise darauf hin, dass der aktuelle Wert zu prüfen ist, wenn du ihn nicht sicher kennst. Erfinde keine Paragrafen, Werte oder Fristen. Trenne klar: gesicherte Regel / Einschätzung / Annahme. Bei Sachverhalten mit Auslegungsspielraum oder hohem Betrag (Verlustvortrag über mehrere Jahre, Abfindung, doppelte Haushaltsführung, Auslandsbezug) empfiehl Lohnsteuerhilfeverein oder Steuerberater. Frage nach, wenn dir für eine Einschätzung eine Angabe fehlt, statt zu raten. Nutze die im Kontext übergebenen App-Daten, verlange keine zusätzlichen personenbezogenen Daten (Name, Steuer-ID, Adresse).

*Fehlerfall:* Ist Gemini nicht erreichbar oder liefert keine valide Antwort, zeigt der Assistent eine klare Fehlermeldung („Antwort gerade nicht verfügbar, bitte später erneut versuchen") statt einer erfundenen Antwort.
*Fertig:* siehe B7.

**3.9 Backup & Wiederherstellung**
*Zweck:* Umsetzung des Backup-Konzepts aus B3 als eigenes, in Phase 1 zuerst gebautes Modul.
*Eingaben & Ausgaben/Speicherung:* Statusanzeige, Backup-Liste, manuelles Meilenstein-Backup, Wiederherstellungs- und Testfunktion, jeweils wie in B3 spezifiziert. Dateiname `steuer-cockpit_2026_JJJJ-MM-TT_hhmm.backup`.
*Fehlerfall:* Siehe B3 (Integritätsprüfung, Rücklese-Test); zusätzlich: Schlägt eine Wiederherstellung fehl, bleibt der vor der Wiederherstellung automatisch angelegte Sicherungs-Zustand unangetastet und wird als Rückfalloption angeboten.
*Fertig:* siehe B7.

### 4. Meine konkreten Werbungskosten

Diese Werte werden **nicht** hier vorab eingetragen, sondern ausschließlich über den Klärungsdialog (Abschnitt 0, insbesondere Fragen 4–9 und 15) erhoben und nach meiner Bestätigung in die Konfigurationstabelle bzw. die jeweiligen Werbungskosten-Kategorien (3.4) übernommen. Grund: Ein zusätzliches Vorab-Ausfüllen hier hätte zu Widersprüchen führen können, falls die Angabe von der späteren Dialogantwort abweicht.

### 5. Technische Vorgaben
- React + TypeScript, Tailwind, Zustandsverwaltung mit klarer Trennung Daten/UI, PWA-fähig (offline nutzbar außer Gemini-Funktionen). Persistenz und Storage-Interface wie in B2 beschrieben.
- Gemini-Aufrufe wie in B5 beschrieben (Modellname/JSON-Schema/Konfidenz/Bild-Input/Grounding/Datennutzungshinweis) – hier nicht erneut spezifiziert.
- Beträge im Format 1.234,56 €; Datumsformat TT.MM.JJJJ.
- Barrierefreiheit: Tastaturbedienung, ausreichende Kontraste, Formularlabels.
- Code kommentiert; README mit Hinweis, wie die Konfigurationstabelle (B6) jährlich aktualisiert wird.

### 6. Vorgehen – in Phasen, jede Phase erst nach meinem „weiter" beginnen

Für jede Phase gilt B1 (eine Phase pro Nachricht, erst nach „weiter" beginnen, keine Platzhalter) und B7 (Abnahmekriterien: lauffähig, Liste „funktioniert/fehlt", Testanleitung mit 3–5 Klickpfaden, bestandener Reload-Test, keine Platzhalter) – hier nicht erneut ausformuliert, siehe eingefügter Block. Führe zuerst den Klärungsdialog aus Abschnitt 0 vollständig durch, baue dann in dieser Reihenfolge:

- **Phase 1 – Fundament:** Datenmodell, Storage-Interface mit IndexedDB, Autosave, komplettes Backup-Modul (3.9) inkl. Ordnerwahl, Verschlüsselung, Rücklese-Prüfung und Wiederherstellung – bewusst vor allen Fachmodulen, damit ab dem ersten Beleg nichts verloren gehen kann. Diese Reihenfolge wurde geprüft und **bewusst beibehalten**, da sie zur B1-Philosophie „Sicherheitsnetz zuerst" passt. Außerdem: Navigation, Onboarding (3.0), Dashboard-Grundgerüst (3.1), Konfigurationstabelle (B6).
- **Phase 2 – Lohn:** Arbeitgeber & Lohnsteuerbescheinigungen (3.2), Monatsabrechnungen mit Foto-Extraktion und Jahresabgleich (3.3).
- **Phase 3 – Zeit & Werbungskosten:** Tageskalender (3.3a), Werkstudenten-Monitor (3.3b), Werbungskosten alle Kategorien inkl. doppelter Haushaltsführung (3.4), Belegarchiv **inklusive** CSV-Kontoauszug-Import (3.6) – wird hier vollständig fertiggestellt, nicht erst in Phase 6.
- **Phase 4 – Assistent:** Steuer-Assistent (3.8) mit Kontextzugriff und Schnellfragen.
- **Phase 5 – Weitere Anlagen:** 3.5 in der Reihenfolge Lohnersatzleistungen → Sonderausgaben → haushaltsnahe Dienstleistungen/Handwerkerleistungen → außergewöhnliche Belastungen → KAP → Kind → V → SO (private Veräußerungsgeschäfte).
- **Phase 6 – Abschluss:** ELSTER-Ausfüllhilfe & Exporte (3.7), Bescheid-Abgleich (3.7a), Mehrjahresfähigkeit (3.7b), PWA/Offline-Feinschliff.

---

## Vor der Nutzung prüfen
- **Kosten:** Ein Google-AI-Pro-Abo deckt die Gemini-App ab, nicht automatisch die Gemini API, die diese App nutzt. Die aktuell geltenden kostenlosen Kontingente/Rate-Limits sind laut Recherche (Stand 02.09.2026) nicht mehr statisch dokumentiert – vor Nutzung live im eigenen AI-Studio-Konto (API-Key/Billing) prüfen und dort ein Ausgabenlimit setzen, bevor ein Zahlungskonto verknüpft wird.
- **Betrieb:** Die AI-Studio-Vorschau ist kein dauerhafter Speicherort (siehe B2: `localStorage` in der Vorschau nicht verlässlich persistent). Für die Jahrespflege den Code exportieren und lokal (z. B. `npm run dev`) oder privat deployen. Der Gemini-API-Key liegt clientseitig – die App nicht öffentlich erreichbar machen, Tageslimit für den Key in der Google-Cloud-Konsole setzen, Kosten für Bild-Extraktionen im Blick behalten.
- **Kein direkter ELSTER-Upload:** Eine technische ELSTER-Anbindung (ERiC) ist für eine Privat-App nicht realistisch; die Übertragung erfolgt manuell anhand der Ausfüllhilfe. Das ist so beabsichtigt.
- Im kostenlosen Zugang können Eingaben laut Google zur Produktverbesserung genutzt werden (siehe B5) – deshalb vor Upload sensibler Belege konsequent die Schwärzung (B4) nutzen oder einen bezahlten API-Tarif einsetzen.
- Alle `[PRÜFEN]`-Werte gegen BMF-Schreiben bzw. ELSTER-Formulare für das Veranlagungsjahr 2026 abgleichen.
- Backup-Ordner: Die File System Access API (für den automatischen Speicherort) funktioniert nachweislich nur in Chrome/Edge auf dem Desktop, nicht in Firefox/Safari oder auf Mobilgeräten (siehe B3) – für alle anderen Fälle ist der Download-Fallback keine Notlösung, sondern der reguläre, gleichwertig zu nutzende Weg.
- Die App liefert eine Ausfüllhilfe, keine Aussage zur steuerlichen Richtigkeit; bei komplexeren Sachverhalten (Abfindung, Lücke/Überschneidung zwischen den Arbeitgebern, doppelte Haushaltsführung) Steuerberatung/Lohnsteuerhilfeverein einbeziehen.

## Annahmen in diesem Entwurf
- Einzelveranlagung (bestätigt), Komplettumfang aller gängigen Anlagen (bestätigt).
- Datenhaltung: lokal im Browser als Stufe 1 (verbindlich, siehe B2), Cloud-Sync nur als vorbereitete Option (Entscheidung noch offen, wird in Frage 13 geklärt).
- Der Chat-Assistent heißt bewusst „Steuer-Assistent", nicht „Steuerberater" (geschützte Bezeichnung nach StBerG).
- Übertragung nach ELSTER erfolgt manuell anhand der Ausfüllhilfe (kein direkter ELSTER-Export).
- Eine mögliche zeitliche Überschneidung der beiden Arbeitgeber (statt einer Lücke) wurde als zusätzlicher Klärungsfall ergänzt, ist aber erst durch die Antwort auf Frage 2 zu bestätigen.
- Ob eine doppelte Haushaltsführung vorliegt, ist offen bis Frage 15 beantwortet ist; die zugehörige Werbungskosten-Kategorie in 3.4 bleibt bis dahin ausgeblendet.
