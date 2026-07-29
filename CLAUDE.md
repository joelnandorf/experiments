# Instruktioner för Claude Code i detta repo

Detta repo är en samling publika HTML-prototyper. Varje experiment är en egen mapp under
`experiments/<slug>/` med en `index.html` (plus ev. CSS/JS/bilder i samma mapp). Att pusha till
`main` bygger och publicerar automatiskt via GitHub Actions + GitHub Pages — inget extra
devops-steg krävs.

## Att skapa och publicera ett nytt experiment ("skapa ett experiment som gör X")

Detta flöde finns paketerat som skillen [`publish-prototype`](./.claude/skills/publish-prototype/SKILL.md)
— läs den för fullständiga instruktioner (bl.a. hur man hanterar slug-kollisioner och HTML
klistrad direkt i chatten). I korthet:

1. Välj ett kebab-case-slug som beskriver experimentet, t.ex. `experiments/farg-slumpare/`.
   Utgå gärna från `templates/basic/index.html` som startpunkt.
2. Bygg experimentet i `experiments/<slug>/index.html` (+ ev. fler filer i samma mapp).
   Sätt alltid:
   - `<title>` — visas som experimentets namn på översiktssidan.
   - `<meta name="description" content="...">` — kort beskrivning på kortet.
   - Valfritt: `<meta name="experiment:tags" content="tag1, tag2">` för chips på kortet.
3. Bygg, committa och pusha i ett steg med hjälpskriptet — kör inte build/git manuellt, det
   är lätt att glömma valideringssteget eller pusha till fel branch:
   ```
   node scripts/publish-experiment.mjs <slug> ["valfritt commit-meddelande"]
   ```
   Skriptet pushar alltid till `origin/main` (oavsett vilken lokal branch som är utcheckad),
   eftersom det är push till `main` som triggar publiceringen.
4. Rapportera till användaren:
   - Den publika URL:en: `https://experiments.nandorf.dev/<slug>/`
   - Att översiktssidan uppdateras på `https://experiments.nandorf.dev/` inom
     en minut eller två (GitHub Actions-byggtid).

## Att ändra ett befintligt experiment

Redigera filerna i `experiments/<slug>/`, kör därefter samma
`node scripts/publish-experiment.mjs <slug>` för att validera, committa och publicera.

## Att inte göra

- Skapa inte enskilda lösa `.html`-filer utanför en mapp under `experiments/` — konventionen är
  alltid en mapp per experiment, även för mycket små prototyper.
- Ändra inte `scripts/build-site.mjs` eller `.github/workflows/deploy.yml` för att lösa ett
  enskilt experiments behov — de ska förbli generiska för alla experiment.
- Lägg inte till npm-dependencies i `package.json` utan att användaren efterfrågar det —
  byggskriptet är avsiktligt beroendefritt för att hålla pipelinen enkel och snabb.
