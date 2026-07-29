# web-experiments

Publika HTML-prototyper — en mapp per experiment, publicerat automatiskt via GitHub Pages.

**Live:** https://experiments.nandorf.dev/

## Lägg till ett nytt experiment

1. Kopiera `templates/basic/index.html` till en ny mapp: `experiments/<mitt-experiment>/index.html`
   (använd kebab-case, t.ex. `experiments/farg-slumpare/index.html`). Lägg ev. CSS/JS/bilder i samma mapp.
2. Sätt `<title>` och `<meta name="description">` i filen — de används för kortet på översiktssidan.
3. Bygg, committa och pusha i ett steg:
   ```
   npm run ship -- mitt-experiment ["valfritt commit-meddelande"]
   ```
   Detta bygger om sajten och verifierar att experimentet plockas upp utan fel, committar
   mappen, och pushar till `origin/main` — oavsett vilken lokal branch du står på.

GitHub Actions bygger och publicerar automatiskt inom en minut eller två. Experimentet blir
live på `https://experiments.nandorf.dev/<mitt-experiment>/` och
dyker upp som ett kort på startsidan.

## Hur det fungerar

- `scripts/build-site.mjs` skannar `experiments/*/index.html`, läser titel/beskrivning/taggar
  och genererar `dist/index.html` + kopierar varje experimentmapp till `dist/<slug>/` (dvs.
  direkt på sajtens rot, utan `/experiments/`-prefix). Ingen extern dependency krävs — ren Node.js.
- `.github/workflows/deploy.yml` körs vid varje push till `main`, kör byggskriptet och
  publicerar `dist/` till GitHub Pages.
- `scripts/publish-experiment.mjs` (kört via `npm run ship -- <slug>`) paketerar build +
  commit + push i ett steg, så att inget av dessa moment glöms bort eller görs i fel ordning.

## Engångssetup (redan gjort om sajten är live)

I repots inställningar: **Settings → Pages → Build and deployment → Source → GitHub Actions.**

## Använda Claude Code för att skapa & publicera experiment

Repot har en paketerad skill, [`publish-prototype`](./.claude/skills/publish-prototype/SKILL.md)
— be Claude Code "publicera detta som ett experiment", klistra in HTML, beskriv en idé, eller
peka på en lokal fil, och den går hela vägen till en live-URL. Se även [`CLAUDE.md`](./CLAUDE.md)
för bakgrunden till konventionerna.
