# 🛡️ MACA Todo - Säkerhetstekniker Uppgiftshanterare

En modern, snabb och helt klientbaserad todo-applikation skräddarsydd för säkerhetstekniker. Appen fungerar som ett digitalt arbetsminne för att hantera installationer, servicejobb och serviceunderhåll helt offline.

## ✨ Egenskaper

- **Offline-ready**: All data lagras lokalt i webbläsaren via IndexedDB.
- **Kategoriserat**: Fördefinierade kategorier för Kamera/CCTV, Brand, Inbrott/Larm, Passage och Lås.
- **Progress-spårning**: Interaktiva progress-ringar för att snabbt se status (0-100%).
- **Deadline-hantering**: Automatisk beräkning av återstående dagar med visuella varningar.
- **Mobilvänlig**: Responsiv design optimerad för både tablet och mobil ute på fältet.
- **Säker**: Implementerad med skydd mot XSS och validering av inmatning.

## 🛠️ Teknisk Stack

- **Frontend**: HTML5, Vanilla JavaScript (ES6+), Tailwind CSS (via CDN)
- **Ikoner**: [Lucide Icons](https://lucide.dev/)
- **Lagring**: [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- **Typsnitt**: Inter (via Google Fonts)

## 🚀 Kom igång

1. Ladda ner eller klona repot.
2. Öppna `index.html` i valfri modern webbläsare.
3. Ingen installation eller build-steg krävs!

## 📂 Filstruktur

- `index.html` - Huvudstruktur och layout.
- `js/app.js` - Applikationslogik och eventhantering.
- `js/ui.js` - DOM-manipulation och rendering.
- `js/db.js` - IndexedDB-hantering och datalagring.

## 🔒 Säkerhet & Robusthet

Projektet har genomgått en säkerhetsgranskning och inkluderar:
- **XSS-skydd**: All användarinput escapas innan rendering.
- **Inputvalidering**: Obligatoriska fält och datatyper kontrolleras.
- **Felsäkring**: Null-checks för DOM-element för att förhindra krascher vid UI-ändringar.
- **Versionering**: CDN-resurser är låsta till specifika versioner.

---
© 2025 MACA Todo