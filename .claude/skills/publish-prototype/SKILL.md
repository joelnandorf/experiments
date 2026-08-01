---
name: publish-prototype
description: >
  Publish a prototype straight to a live public URL on the web-experiments
  GitHub Pages site, end to end: turns pasted HTML, a described idea/design,
  or a local file into a Next.js route at app/(experiments)/<slug>/page.tsx,
  validates the build, commits, pushes to main, and reports back the live
  link — no git or devops steps left for the user to do by hand. Use this
  whenever the user pastes raw HTML and wants it live, asks to "publish
  this", "ship this prototype", "gör detta till ett experiment", "publicera
  denna HTML", "lägg till som experiment och publicera", "släpp den här
  prototypen", describes a small demo/app/idea they want as a working page
  on the site, or points at a local HTML file to put on the site — even if
  they never say the words "skill", "git", "deploy", or "GitHub".
---

# Publish Prototype

## Varför detta flöde finns

web-experiments är byggt för att gå från idé till publicerad prototyp utan
att användaren rör git eller CI/CD. Sedan migreringen till Next.js + shadcn/ui
byggs varje nytt experiment som en React-sida som får det delade
wireframe-temat och komponentbiblioteket gratis, istället för handskriven
HTML/CSS från scratch. Den här skillen packar ihop hela resan (fil →
validering → commit → push → live-URL) i en förutsägbar ordning, så att inget
steg glöms bort eller görs i fel ordning.

## Steg

0. **Säkerställ att du står i `web-experiments`-repot.** Skillen kan triggas
   från en helt annan Claude-chatt/session än den här — en vars
   arbetskatalog är ett annat repo, eller inget repo alls.
   - Kontrollera om aktuell arbetskatalog redan är en checkout av
     `joelnandorf/web-experiments`, t.ex. genom att `scripts/publish-experiment.mjs`
     och `templates/basic/page.tsx` finns relativt cwd, eller att
     `git remote get-url origin` pekar på `joelnandorf/web-experiments`.
   - **Om ja:** fortsätt direkt till steg 1, ingen förändring mot idag.
   - **Om nej:**
     - Rör **aldrig** den befintliga arbetskatalogen/repot i sessionen — jobba
       uteslutande i en ny, fristående katalog för resten av flödet.
     - Om `add_repo`-verktyget finns tillgängligt (Claude Code Remote-miljö):
       anropa det med `owner: "joelnandorf"`, `repo: "web-experiments"`,
       `access: "push"` (push krävs eftersom flödet committar och pushar).
       Klona sedan med kommandot verktyget returnerar till en ny katalog
       (t.ex. i sessionens scratchpad-katalog om en sådan finns, annars en
       tillfällig katalog utanför befintligt repo), och anropa
       `register_repo_root` med den absoluta sökvägen till klonen.
     - Om `add_repo` inte finns (vanlig lokal Claude Code utan CCR-verktyg):
       klona direkt med
       `git clone https://github.com/joelnandorf/web-experiments.git <ny-katalog>`.
     - Kör `npm install` i den klonade katalogen innan något annat steg —
       till skillnad från tidigare krävs nu ett riktigt `node_modules` för att
       bygga/validera (Next.js + Tailwind + shadcn, inte längre beroendefritt).
     - Använd den klonade katalogen som bas för **alla** efterföljande steg i
       den här skill-körningen — räkna sökvägar relativt den katalogen eller
       `cd` dit.

1. **Identifiera källan och bygg den som en Next.js-sida.** Målet är alltid
   `app/(experiments)/<slug>/page.tsx` + `meta.ts` — inte en fristående
   `.html`-fil (se "Att tänka på" om undantaget för legacy-passthrough).
   - Pastad HTML i chatten → konvertera markupen till JSX (`class` →
     `className`, self-closing-taggar, etc.), lägg ev. `<style>`-block rakt av
     i JSX (`<style>{\`...\`}</style>` fungerar direkt), och flytta
     DOM-manipulerande `<script>`-logik till en `"use client"`-komponent med
     `useState`/`useEffect`/event-handlers. Städa upp halvfärdig kod men
     ändra inte designintentionen.
   - En beskrivning av en idé/design (ingen färdig HTML) → bygg sidan med
     `components/ui/*` (shadcn) och det delade wireframe-temat som
     utgångspunkt, om inte användaren uttryckligen vill ha en helt egen look
     (då: skriv egen Tailwind/CSS direkt i den filen, rör inga delade filer).
   - En lokal fil användaren pekar på → läs den och konvertera enligt samma
     princip som pastad HTML ovan.

2. **Välj ett slug** i kebab-case som beskriver experimentet (t.ex.
   `farg-slumpare`, `bounce-ball`). Härled det från titel/ämne när det är
   uppenbart; annars, fråga användaren med en kort fråga i stället för att
   gissa.

3. **Kolla kollision.** Om `app/(experiments)/<slug>/` redan finns, fråga
   användaren om den ska skrivas över eller om ett nytt slug ska väljas i
   stället. Skriv aldrig över tyst — det kan vara någon annans pågående
   prototyp.

4. **Skriv filerna** till `app/(experiments)/<slug>/page.tsx` +
   `app/(experiments)/<slug>/meta.ts`. Utgå från `templates/basic/` i
   repo-roten. Se alltid till att `meta.ts` sätter:
   - `title` — blir experimentets namn på översiktssidan.
   - `description` — en kort mening, visas som kortets text.
   - `tags` — valfri lista med taggar, visas som chips.
   - `date` — obligatoriskt, `"YYYY-MM-DD"` (dagens datum om inget annat är
     naturligt).
   Lägg till `"use client"` som första rad i `page.tsx` om sidan använder
   hooks, event-handlers, canvas eller andra webbläsar-API:er.

5. **Bygg, committa och pusha i ett enda steg** med hjälpskriptet som hör
   till detta repo — kör aldrig build/git manuellt steg för steg för det gör
   det lätt att glömma valideringen eller pusha till fel branch. Kör det från
   den repo-katalog som fastställdes i steg 0 (befintlig cwd, eller den
   nyklonade katalogen):
   ```
   node scripts/publish-experiment.mjs <slug> ["valfritt commit-meddelande"]
   ```
   Skriptet kör `npm run build` (en riktig Next.js-build + typkontroll, inte
   bara en regex-scrape som tidigare — ta detta på allvar, hoppa aldrig över
   det), stagear och committar mappen (hoppar över commit om inget ändrats
   sedan sist), och pushar till `origin/main` oavsett vilken lokal branch som
   råkar vara utcheckad — det är push till `main` som triggar
   GitHub Actions-publiceringen. Skriptet force-pushar aldrig; om push
   avvisas därför att `main` har nya commits du saknar lokalt, kör
   `git fetch origin main && git rebase origin/main` och försök igen.

6. **Rapportera till användaren:**
   - Den publika URL:en: `https://experiments.nandorf.dev/<slug>/`
   - Att översiktssidan (`https://experiments.nandorf.dev/`)
     uppdateras automatiskt med det nya kortet.
   - Att det tar ungefär en minut eller två innan det syns live (tiden det
     tar för GitHub Actions att bygga och deploya).

## Att tänka på

- Vilken lokal branch (eller vilket repo) som råkar vara utcheckat i chatten
  spelar ingen roll — `publish-experiment.mjs` pushar alltid till
  `origin/main` i `web-experiments`, oavsett om du körde skillen i en
  nyklonad katalog (steg 0) eller i en befintlig checkout.
- Detta är ett lågriskigt sandbox-repo — direkt push till `main` är
  avsiktligt och okej, ingen PR-process behövs för vanliga experiment.
- `public/` innehåller bara delade statiska assets som inte är
  experiment-routes (t.ex. vendorade tredjepartsbibliotek, `CNAME`). Lägg
  **aldrig** ett nytt experiment där — även ett pastat, helt fristående
  HTML-dokument ska konverteras till en `page.tsx` enligt steg 1, så att det
  får det delade temat/komponenterna och syns i build-time-upptäckten på
  översiktssidan.
- Om `node scripts/publish-experiment.mjs` felar på byggsteget, fixa felet
  (typfel, trasig JSX, saknad `meta.ts`-fält) och kör om — hoppa aldrig över
  valideringssteget för att "bara pusha ändå".
