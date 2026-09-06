# Roman-Werkstatt

## Cloud-Sync (gemeinsamer Speicher)
- Projekte und Kapitel werden bei gesetzter Worker-URL + Zugangswort zusätzlich in die Cloudflare KV am `buch-engine` Worker geschrieben
- Beim Start: neuere Cloud-Projekte werden geladen
- Setup: Buttons „Cloud laden“, „In Cloud speichern“, „Fortschritt“
- Lokal bleibt offline-fähig; Sync-Fehler blockieren das Schreiben nicht
- Konflikt (409): Toast + Hinweis „Cloud laden“

## Zuvor
- Alle Original-Funktionen: Werk, Buch, Faeden, Lesen, Setup, Vorlagen, Pipeline, Bibel, Beats, EPUB/Word-Export, IndexedDB
- Kimi-Thinking-Fix (leere Kapitel)
- Apple-Look weiss/orange
- PWA + automatisches Fortsetzen des Laufs nach kurzem Schliessen
