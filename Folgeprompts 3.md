# Folgeprompts – Steuer-Cockpit 2026 (Phasen 2–6)

*Neu erstellt am 08.09.2026 zu Prompt_Steuer-App_AI-Studio_v2.md.*

> Diese Datei enthält die Nachrichten, die ich **nacheinander** in denselben AI-Studio-Chat einfüge – jeweils erst, NACHDEM die vorherige Phase geliefert, von mir geprüft und per „weiter" bestätigt wurde. Phase 1 ist bereits im Hauptprompt enthalten. Grund für diese separate Datei: AI Studio soll pro Nachricht immer nur eine Phase bauen (siehe B1) statt eines Mega-Prompts, und lange Sitzungen befolgen Rahmenanweisungen erfahrungsgemäß unzuverlässiger – deshalb wiederholt jeder Folgeprompt die Kernregeln kurz.

---

## Folgeprompt Phase 2 – Lohn

Weiter mit **Phase 2 – Lohn** aus Abschnitt 6 des Hauptprompts „Steuer-Cockpit 2026": Baue jetzt Modul 3.2 (Arbeitgeber & Lohnsteuerbescheinigungen) und Modul 3.3 (Monatsabrechnungen mit Foto-Extraktion und Jahresabgleich). Baue **nur** diese Phase, keine weiteren Module vorgreifen.

Es gelten weiterhin B1 (keine Platzhalter-Buttons ohne Funktion, bei Unklarheit nachfragen statt zu raten oder etwas zu erfinden) und B7 (Abnahmekriterien: lauffähig, Liste „funktioniert/fehlt", Testanleitung mit 3–5 Klickpfaden, bestandener Reload-Test, keine Platzhalter). Prüfe selbst gegen alle fünf B7-Punkte, bevor du die Phase als fertig meldest.

Zeig mir zusätzlich konkret, **welche Dateien/Komponenten in dieser Phase neu erstellt oder geändert wurden** (Liste oder Diff) – melde „erledigt" nur, wenn du das auch tatsächlich zeigen kannst, nicht pauschal.

---

## Folgeprompt Phase 3 – Zeit & Werbungskosten

Weiter mit **Phase 3 – Zeit & Werbungskosten**: Baue jetzt Tageskalender (3.3a), Werkstudenten-Monitor (3.3b), alle Werbungskosten-Kategorien inklusive doppelter Haushaltsführung (3.4) sowie das Belegarchiv **inklusive** CSV-Kontoauszug-Import (3.6) vollständig fertig. Nur diese Phase.

Es gelten weiterhin B1 und B7 wie in Phase 2. Prüfe selbst dagegen, bevor du „fertig" meldest. Wenn eine Anforderung zu Kalender, Werkstudenten-Grenze oder einer Werbungskosten-Kategorie unklar oder widersprüchlich ist, frage nach statt zu raten.

Zeig mir zusätzlich, welche Dateien/Komponenten neu erstellt oder geändert wurden (Liste oder Diff) – nicht nur eine Erfolgsbehauptung.

---

## Folgeprompt Phase 4 – Assistent

Weiter mit **Phase 4 – Assistent**: Baue jetzt den Steuer-Assistenten (3.8) inklusive der wörtlich vorgegebenen Systemanweisung, Kontextzugriff auf die bisher erfassten Daten und den Schnellfragen-Buttons. Nur diese Phase.

Es gelten weiterhin B1 und B7. Prüfe insbesondere, dass der Assistent bei fehlendem Kontext oder nicht erreichbarem Gemini eine klare Fehlermeldung zeigt statt einer erfundenen Antwort (siehe Fehlerfall in 3.8).

Zeig mir zusätzlich, welche Dateien/Komponenten neu erstellt oder geändert wurden, und einen Beispieldialog mit mindestens zwei der Schnellfragen-Buttons.

---

## Folgeprompt Phase 5 – Weitere Anlagen

Weiter mit **Phase 5 – Weitere Anlagen**: Baue jetzt Modul 3.5 vollständig, in der Reihenfolge Lohnersatzleistungen → Sonderausgaben → haushaltsnahe Dienstleistungen/Handwerkerleistungen → außergewöhnliche Belastungen → KAP → Kind → V → SO (private Veräußerungsgeschäfte). Nur diese Phase.

Es gelten weiterhin B1 und B7. Baue nur die Unteranlagen, die laut meiner Antwort auf Frage 10 tatsächlich zutreffen – die übrigen bleiben ausblendbar, aber im Code vorbereitet, nicht als leere Platzhalter sichtbar.

Zeig mir zusätzlich, welche Dateien/Komponenten neu erstellt oder geändert wurden.

---

## Folgeprompt Phase 6 – Abschluss

Weiter mit **Phase 6 – Abschluss**: Baue jetzt die ELSTER-Ausfüllhilfe & Exporte (3.7) inkl. Prüfliste, den Bescheid-Abgleich (3.7a), die Mehrjahresfähigkeit (3.7b) und den PWA/Offline-Feinschliff. Der CSV-Kontoauszug-Import ist bereits Teil von Modul 3.6 aus Phase 3 – hier **nicht** erneut bauen.

Es gelten weiterhin B1 und B7. Prüfe insbesondere die Prüfliste vor Export (fehlende Monate, unbestätigte Extraktionen, Belege ohne Nachweis, Abweichungen) auf Vollständigkeit.

Zeig mir zusätzlich, welche Dateien/Komponenten neu erstellt oder geändert wurden, und führe zum Abschluss einmal alle B7-Kriterien für **alle sechs Phasen gemeinsam** vor (nicht nur Phase 6), damit ich vor dem Jahresabschluss ein Gesamtbild habe.
