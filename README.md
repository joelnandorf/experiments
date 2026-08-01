# web-experiments

En samling snabba webbprototyper — byggda med Next.js + shadcn/ui och ett delat wireframe-tema,
publicerat automatiskt via GitHub Pages.

**Live:** https://experiments.nandorf.dev/

## Lokal utveckling

```
npm install
npm run dev
```

Öppna `http://localhost:3000`. `npm run dev` kör bara lokalt — det påverkar inte produktion.

## Lägg till ett nytt experiment

1. Kopiera `templates/basic/page.tsx` + `templates/basic/meta.ts` till en ny mapp:
   `app/(experiments)/<mitt-experiment>/` (använd kebab-case, t.ex.
   `app/(experiments)/farg-slumpare/`).
2. Bygg UI:t i `page.tsx` — `components/ui/*` (shadcn) och det delade wireframe-temat
   (gråskala, streckade kanter, platshållarblock) används automatiskt via `app/layout.tsx`.
   Vill du ha en helt egen look för just detta experiment, skriv egen Tailwind/CSS direkt i
   filen istället.
3. Sätt `title`, `description`, ev. `tags`, och obligatoriskt `date` i `meta.ts` — de
   används för kortet på översiktssidan.
4. Bygg, committa och pusha i ett steg:
   ```
   npm run ship -- mitt-experiment ["valfritt commit-meddelande"]
   ```
   Detta bygger om sajten (`next build`, statisk export) och verifierar att experimentet
   plockas upp utan fel, committar mappen, och pushar till `origin/main` — oavsett vilken
   lokal branch du står på.

GitHub Actions bygger och publicerar automatiskt inom en minut eller två. Experimentet blir
live på `https://experiments.nandorf.dev/<mitt-experiment>/` och dyker upp som ett kort på
startsidan.

## Hur det fungerar

- `app/page.tsx` upptäcker experiment vid build: skannar `app/(experiments)/*/meta.ts`,
  sorterar på datum, renderar kortgriden.
- `next.config.ts` sätter `output: "export"` — sajten byggs till en helt statisk `out/`-mapp,
  ingen Node-server behövs vid deploy.
- `.github/workflows/deploy.yml` körs vid varje push till `main`, kör `npm run build` och
  publicerar `out/` till GitHub Pages.
- `scripts/publish-experiment.mjs` (kört via `npm run ship -- <slug>`) paketerar build +
  commit + push i ett steg, så att inget av dessa moment glöms bort eller görs i fel ordning.
- `public/` innehåller bara delade statiska assets som inte är experiment-routes, t.ex.
  `public/vendor/leaflet/` (vendorat Leaflet + SunCalc, använt av `furuvagen-23-karta`) och
  `public/CNAME`.

## Engångssetup (redan gjort om sajten är live)

I repots inställningar: **Settings → Pages → Build and deployment → Source → GitHub Actions.**

## Använda Claude Code för att skapa & publicera experiment

Repot har en paketerad skill, [`publish-prototype`](./.claude/skills/publish-prototype/SKILL.md)
— be Claude Code "publicera detta som ett experiment", klistra in HTML, beskriv en idé, eller
peka på en lokal fil, och den går hela vägen till en live-URL. Se även [`CLAUDE.md`](./CLAUDE.md)
för bakgrunden till konventionerna.
