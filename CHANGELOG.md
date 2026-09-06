# Roman-Werkstatt

## In-App: Fleisch & Thron + Page-Flip-Lesen
- Auto-Import: Cloud-Pull von `isekai-6a9dc73e` inkl. aller Kapitel; Fallback `./fleisch-thron.json`
- Kontinuierlicher Sync: beim Öffnen von Lesen/Buch (30s Debounce), Fokus/Visibility, Minuten-Poll
- Toast bei neuen Cloud-Kapiteln; Kapitel text→body Normalisierung
- Lesen-Tab: iBooks-ähnlicher 3D-Page-Flip (Swipe/Tap), Seitenzahl, Kapitelwechsel am Ende
- `fleisch-thron.html` bleibt optionale Backup-Ansicht im Setup
- Service-Worker rw-v7 (Bootstrap-JSON network-first)

## Fix: App wieder klickbar
- CloudSync nach Store verschoben (Crash-Fix)
- Service-Worker rw-v6: alter Offline-Cache wird verworfen, index.html network-first
- SW-Registrierung wieder aktiv, damit Handys das Update bekommen

## Cloud-Sync
- Gemeinsamer Speicher am buch-engine Worker
