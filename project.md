# Projektbeskrivning: Säkerhetstekniker Todo-webapp

## Översikt

En visuellt tilltalande och funktionell todo-webapp anpassad för fysisk säkerhetstekniker. Appen ska fungera som ett digitalt arbetsminne – tänk på det som din "digitala verktygslåda för uppgifter" där du snabbt kan se vad som är akut, pågående och klart.

---

## Teknisk Stack

**Frontend:**
- HTML5 (semantisk markup)
- CSS med Tailwind CSS v4
- Vanilla JavaScript (ES6+)
- Lucide ikoner (via CDN, ej React-versionen)

**Datalagring:**
- IndexedDB för lokal persistent lagring

**Responsivitet:**
- Mobile-first approach
- Breakpoints: Mobil (<640px), Tablet (640-1024px), Desktop (>1024px)

---

## Design & Visuell Stil

### Färgpalett (baserat på referensbild)
- **Primär blågrön:** `#3498db` / `#2980b9` (huvudelement, knappar)
- **Accent orange:** `#e67e22` / `#d35400` (varningar, highlight)
- **Framgång grön:** `#27ae60` (slutförda uppgifter)
- **Varning röd:** `#e74c3c` (brådskande/försenat)
- **Bakgrund:** `#f5f6fa` (ljusgrå)
- **Kort/panels:** `#ffffff` med subtil skugga
- **Text:** `#2c3e50` (mörk), `#7f8c8d` (sekundär)

### Visuella Element
- **Cirkulära progressindikatorer:** Visar procentuell färdigställning per uppgift (0%, 25%, 69%, 100%)
- **Färgkodade sidolinjer:** Vertikal färgmarkering på vänster sida av kort som indikerar status/prioritet
- **Rundade hörn:** Mjuka, moderna former på kort och knappar
- **Tydliga statusbadges:** "1 day left!", "3 days left!", "Assignment completed!", "Unresolved"
- **Skuggeffekter:** Subtila box-shadows för djupkänsla

---

## Funktionella Komponenter

### 1. Header/Dashboard-sektion
Tre statistikblock överst som visar:
- **Antal projekt** (ikon: mapp/folder) - blågrön bakgrund
- **Pågående uppgifter** (ikon: meddelande/chat) - grå/turkos bakgrund
- **Totalt antal uppgifter** (ikon: checklista/dokument) - orange bakgrund

### 2. Aktivitetsflöde (Huvudsektion)
- Rubrik: "Activity feed" med knapp "Assign New Task" (orange text, plus-ikon)
- Scrollbar lista med uppgiftskort

### 3. Uppgiftskort (Task Cards)
Varje kort innehåller:
- **Cirkulär progressring** med procenttal i mitten
- **Titel** (t.ex. "Kamera installation - Lager 3")
- **Beskrivning** (t.ex. "Hikvision DS-2CD2143G2-I, PoE-dragning")
- **Datum** med kalenderikon
- **Tidsuppskattning** med klockikon
- **Statusindikator** längst ner till vänster (röd/gul/grön)
- **Åtgärdsknapp** till höger ("Resume"/"Start"/"Report")
- **Bifogade filer-ikon** (gem/paperclip) med antal

### 4. Kategorier (anpassade för säkerhetsbranschen)
- 📹 Kamera/CCTV
- 🔥 Brand
- 🚨 Inbrott/Larm
- 🚪 Passage/Dörrautomatik
- 🔐 Lås/Mekaniskt

### 5. Diskussionsinbjudningar (valfritt)
Kort som föreslår att gå med i diskussioner/projekt med "Yeah, awesome!" / "Not interested" knappar

---

## Funktionalitet

### CRUD-operationer
- **Skapa:** Modal/formulär för ny uppgift med fält för titel, beskrivning, kategori, prioritet, deadline, tidsuppskattning
- **Läsa:** Visa alla uppgifter sorterade efter deadline/prioritet
- **Uppdatera:** Ändra progress (0-100%), redigera detaljer, ändra status
- **Radera:** Ta bort uppgift (med bekräftelse)

### Progresshantering
- Klickbar/draggbar cirkulär progress
- Snabbknappar: 0%, 25%, 50%, 75%, 100%
- Automatisk statusuppdatering baserat på progress och deadline

### Filtrering & Sortering
- Filtrera per kategori (kamera, brand, etc.)
- Filtrera per status (ej påbörjad, pågående, klar, försenad)
- Sortera efter: deadline, prioritet, senast uppdaterad

### Deadline-hantering
- Automatisk beräkning av "X days left"
- Visuell varning när deadline närmar sig (orange) eller passerat (röd)

---

## IndexedDB Struktur

```javascript
// Database: SecurityTodoDB
// Object Store: tasks

{
  id: auto-increment,
  title: string,
  description: string,
  category: "camera" | "fire" | "intrusion" | "access" | "lock",
  progress: number (0-100),
  status: "unresolved" | "in-progress" | "completed" | "overdue",
  priority: "low" | "medium" | "high",
  deadline: Date,
  estimatedTime: number (minuter),
  createdAt: Date,
  updatedAt: Date,
  attachments: number (antal bifogade filer, för framtida användning)
}
```

---

## Responsiv Layout

### Mobil (<640px)
- En kolumn, kort staplade vertikalt
- Statistikblock i horisontell scroll eller staplade
- Hamburger-meny för filter
- Touch-vänliga knappar (minst 44x44px)

### Tablet (640-1024px)
- Två kolumner för uppgiftskort
- Statistikblock i rad
- Sidopanel för filter (kan togglas)

### Desktop (>1024px)
- Tre kolumner eller lista-vy
- Fast sidopanel för filter/kategorier
- Statistikblock alltid synliga överst

---

## Filstruktur

```
/todo-app
├── index.html
├── css/
│   └── styles.css (Tailwind + custom)
├── js/
│   ├── app.js (huvudlogik)
│   ├── db.js (IndexedDB-hantering)
│   └── ui.js (DOM-manipulation, rendering)
└── assets/
    └── (eventuella bilder)
```

---

## Implementation Prioritering

1. **Fas 1:** HTML-struktur, Tailwind-styling, responsiv grid
2. **Fas 2:** IndexedDB setup, CRUD-funktioner
3. **Fas 3:** Cirkulära progressindikatorer, statuslogik
4. **Fas 4:** Filtrering, sortering, deadline-beräkningar
5. **Fas 5:** Polish – animationer, mikro-interaktioner, tillgänglighet

---

## Tillgänglighet (A11y)
- Semantisk HTML (main, section, article, etc.)
- ARIA-labels på interaktiva element
- Keyboard-navigering
- Tillräcklig färgkontrast
- Focus-states på alla klickbara element

---

## Exempeldata för Test

```javascript
const sampleTasks = [
  {
    title: "Kamerainstallation Lager 3",
    description: "Hikvision DS-2CD2143G2-I, PoE-dragning behövs",
    category: "camera",
    progress: 69,
    deadline: "2025-12-14",
    estimatedTime: 480
  },
  {
    title: "Brandlarm årlig service",
    description: "Kontrollera detektorer, batteribyte centralapparat",
    category: "fire",
    progress: 25,
    deadline: "2025-12-16",
    estimatedTime: 240
  },
  {
    title: "Passagesystem uppdatering",
    description: "Firmware-uppdatering AXIS A1001, nya passerkort",
    category: "access",
    progress: 100,
    deadline: "2025-12-10",
    estimatedTime: 120
  }
];
```

---

## Leverans

En fullt fungerande single-page application som:
- Körs helt i webbläsaren utan backend
- Sparar data persistent i IndexedDB
- Fungerar offline efter första laddning
- Ser professionell och modern ut på alla enheter
- Är optimerad för en säkerhetsteknikers dagliga arbetsflöde