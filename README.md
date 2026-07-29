# web-experiments

Publika HTML-prototyper — en mapp per experiment, publicerat automatiskt via GitHub Pages.

**Live:** https://joelnandorf.github.io/web-experiments/

## Lägg till ett nytt experiment

1. Kopiera `templates/basic/index.html` till en ny mapp: `experiments/<mitt-experiment>/index.html`
   (använd kebab-case, t.ex. `experiments/farg-slumpare/index.html`). Lägg ev. CSS/JS/bilder i samma mapp.
2. Sätt `<title>` och `<meta name="description">` i filen — de används för kortet på översiktssidan.
3. Förhandsgranska lokalt:
   ```
   npm run build
   ```
   Öppna `dist/index.html` i en webbläsare för att se resultatet.
4. Committa och pusha till `main`:
   ```
   git add experiments/mitt-experiment
   git commit -m "Lägg till experiment: mitt-experiment"
   git push origin main
   ```

GitHub Actions bygger och publicerar automatiskt inom en minut eller två. Experimentet blir
live på `https://joelnandorf.github.io/web-experiments/experiments/<mitt-experiment>/` och
dyker upp som ett kort på startsidan.

## Hur det fungerar

- `scripts/build-site.mjs` skannar `experiments/*/index.html`, läser titel/beskrivning/taggar
  och genererar `dist/index.html` + kopierar varje experimentmapp till `dist/experiments/...`.
  Ingen extern dependency krävs — ren Node.js.
- `.github/workflows/deploy.yml` körs vid varje push till `main`, kör byggskriptet och
  publicerar `dist/` till GitHub Pages.

## Engångssetup (redan gjort om sajten är live)

I repots inställningar: **Settings → Pages → Build and deployment → Source → GitHub Actions.**

## Använda Claude Code för att skapa & publicera experiment

Se [`CLAUDE.md`](./CLAUDE.md) — be Claude Code "skapa ett experiment som gör X" och det
sköter mapp, filer, build-verifiering, commit och push.
