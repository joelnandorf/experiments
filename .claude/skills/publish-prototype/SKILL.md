---
name: publish-prototype
description: >
  Publish an HTML prototype straight to a live public URL on the
  web-experiments GitHub Pages site, end to end: turns pasted HTML, a
  described idea/design, or a local file into experiments/<slug>/index.html,
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
att användaren rör git eller CI/CD. Den här skillen packar ihop hela resan
(fil → validering → commit → push → live-URL) i en förutsägbar ordning, så
att inget steg glöms bort eller görs i fel ordning.

## Steg

0. **Säkerställ att du står i `web-experiments`-repot.** Skillen kan triggas
   från en helt annan Claude-chatt/session än den här — en vars
   arbetskatalog är ett annat repo, eller inget repo alls.
   - Kontrollera om aktuell arbetskatalog redan är en checkout av
     `joelnandorf/web-experiments`, t.ex. genom att `scripts/publish-experiment.mjs`
     och `templates/basic/index.html` finns relativt cwd, eller att
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
     - Använd den klonade katalogen som bas för **alla** efterföljande steg i
       den här skill-körningen (skriva `experiments/<slug>/index.html`, köra
       `node scripts/publish-experiment.mjs …`) — räkna sökvägar relativt den
       katalogen eller `cd` dit.

1. **Identifiera HTML-källan.**
   - Pastad HTML i chatten → använd den direkt, städa upp den om den är
     halvfärdig men ändra inte designintentionen.
   - En beskrivning av en idé/design (ingen färdig HTML) → bygg ett litet,
     beroendefritt HTML/CSS/JS från grunden. Det måste fungera som en
     fristående statisk fil direkt på GitHub Pages — inga byggsteg, inga
     externa ramverk eller CDN-beroenden om det inte uttryckligen efterfrågas,
     eftersom hela poängen är att slippa devops.
   - En lokal fil användaren pekar på → läs den och använd som grund.

2. **Välj ett slug** i kebab-case som beskriver experimentet (t.ex.
   `farg-slumpare`, `bounce-ball`). Härled det från titel/ämne när det är
   uppenbart; annars, fråga användaren med en kort fråga i stället för att
   gissa.

3. **Kolla kollision.** Om `experiments/<slug>/` redan finns, fråga
   användaren om den ska skrivas över eller om ett nytt slug ska väljas i
   stället. Skriv aldrig över tyst — det kan vara någon annans pågående
   prototyp.

4. **Skriv filerna** till `experiments/<slug>/index.html` (+ ev. `style.css`
   /`script.js`/bilder i samma mapp, om det är naturligt att dela upp
   innehållet). Utgå från `templates/basic/index.html` i repo-roten när du
   bygger från grunden. Se alltid till att:
   - `<title>` är satt — den blir experimentets namn på översiktssidan.
   - `<meta name="description" content="...">` är satt — en kort mening.
   - `<meta name="experiment:tags" content="a, b">` sätts om relevanta
     taggar finns (valfritt).

5. **Bygg, committa och pusha i ett enda steg** med hjälpskriptet som hör
   till detta repo — kör aldrig build/git manuellt steg för steg för det gör
   det lätt att glömma valideringen eller pusha till fel branch. Kör det från
   den repo-katalog som fastställdes i steg 0 (befintlig cwd, eller den
   nyklonade katalogen):
   ```
   node scripts/publish-experiment.mjs <slug> ["valfritt commit-meddelande"]
   ```
   Skriptet bygger om hela sajten och verifierar att experimentet dyker upp
   utan fel, stagear och committar mappen (hoppar över commit om inget
   ändrats sedan sist), och pushar till `origin/main` oavsett vilken lokal
   branch som råkar vara utcheckad — det är push till `main` som triggar
   GitHub Actions-publiceringen. Skriptet force-pushar aldrig; om push
   avvisas därför att `main` har nya commits du saknar lokalt, kör
   `git fetch origin main && git rebase origin/main` och försök igen.

6. **Rapportera till användaren:**
   - Den publika URL:en: `https://joelnandorf.github.io/web-experiments/experiments/<slug>/`
   - Att översiktssidan (`https://joelnandorf.github.io/web-experiments/`)
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
- Håll varje prototyp självständig och beroendefri (öppnas direkt som en
  statisk fil, inget `npm install` krävs för att köra den) — det är just det
  som gör att den fungerar på GitHub Pages utan extra devops-arbete.
- Om `node scripts/publish-experiment.mjs` felar på byggsteget, fixa felet i
  `index.html` (t.ex. trasig HTML som byggskriptet inte kan tolka) och kör
  om — hoppa aldrig över valideringssteget för att "bara pusha ändå".
