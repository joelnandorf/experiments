# Instruktioner för Claude Code i detta repo

Detta repo är en samling publika prototyper, byggt med **Next.js (App Router) + shadcn/ui**,
statiskt exporterat och publicerat via GitHub Pages. Varje nytt experiment är en route under
`app/(experiments)/<slug>/` med en `page.tsx` + `meta.ts`, och får automatiskt det delade
"wireframe"-temat (gråskala, streckade kanter, platshållarblock) och `components/ui/*`
(shadcn-komponenter) via `app/layout.tsx`/`app/globals.css`. Att pusha till `main` bygger
(`next build` med `output: "export"`) och publicerar automatiskt via GitHub Actions + GitHub
Pages — inget extra devops-steg krävs.

Alla experiment, inklusive de fyra äldsta (`click-counter`, `hello-world`, `gokur-klocka`,
`furuvagen-23-karta`, migrerade från rå HTML till React 2026-08-01), ligger som routes under
`app/(experiments)/<slug>/`. `public/` innehåller bara delade statiska assets som inte är
routes, t.ex. `public/vendor/leaflet/` (vendorat Leaflet + SunCalc, använt av
`furuvagen-23-karta`) och `public/CNAME`; se "Att inte göra" nedan.

## Att skapa och publicera ett nytt experiment ("skapa ett experiment som gör X")

Detta flöde finns paketerat som skillen [`publish-prototype`](./.claude/skills/publish-prototype/SKILL.md)
— läs den för fullständiga instruktioner (bl.a. hur man hanterar slug-kollisioner och pastad
HTML som ska konverteras till en React-sida). I korthet:

1. Välj ett kebab-case-slug som beskriver experimentet, t.ex. `farg-slumpare`.
   Kopiera `templates/basic/page.tsx` + `templates/basic/meta.ts` till
   `app/(experiments)/<slug>/`.
2. Bygg UI:t i `page.tsx` med `components/ui/*` (redan wireframe-styled) eller egen
   Tailwind/CSS om experimentet vill ha en helt egen look. Lägg till `"use client"` som
   första rad om sidan använder hooks/event-handlers/canvas/andra webbläsar-API:er.
3. Sätt alltid i `meta.ts`:
   - `title` — visas som experimentets namn på översiktssidan.
   - `description` — kort beskrivning på kortet.
   - `tags` (valfritt) — lista med taggar, visas som chips.
   - `date` — obligatoriskt, `"YYYY-MM-DD"`.
4. Bygg, committa och pusha i ett steg med hjälpskriptet — kör inte build/git manuellt, det
   är lätt att glömma valideringssteget eller pusha till fel branch:
   ```
   node scripts/publish-experiment.mjs <slug> ["valfritt commit-meddelande"]
   ```
   Skriptet kör `npm run build` som validering och pushar alltid till `origin/main`
   (oavsett vilken lokal branch som är utcheckad), eftersom det är push till `main` som
   triggar publiceringen.
5. Rapportera till användaren:
   - Den publika URL:en: `https://experiments.nandorf.dev/<slug>/`
   - Att översiktssidan uppdateras på `https://experiments.nandorf.dev/` inom
     en minut eller två (GitHub Actions-byggtid).

## Att ändra ett befintligt experiment

Redigera filerna i `app/(experiments)/<slug>/`, kör därefter samma
`node scripts/publish-experiment.mjs <slug>` för att validera, committa och publicera.

## Det delade wireframe-temat

Design tokens (gråskala, `--radius`, m.m.) bor i `app/globals.css`, konsumerade av
`components/ui/*` via CSS-variabler. Ett enskilt experiment kan avvika utan att röra delade
filer:
- Skriv om CSS-variablerna lokalt i en wrapper-klass i sin egen `page.tsx`, eller
- Hoppa helt över `components/ui/*` och skriv egen Tailwind/CSS i den filen.

## Tillgängliga komponenter i components/ui/*

Byggda på **Base UI** (`@base-ui/react`, inte Radix) + `class-variance-authority`, i shadcn/ui:s
"new-york"-stil (se `components.json`). Alla följer redan wireframe-temat via CSS-variablerna i
`app/globals.css` — importera bara och använd. Ett levande showcase med alla komponenter finns i
`app/(experiments)/komponent-lekplats/page.tsx`.

- **Layout/innehåll**: `Card` (+ `CardHeader`/`CardTitle`/`CardDescription`/`CardContent`/
  `CardFooter`), `Separator`, `Skeleton`, `Badge`, `Avatar` (+ `AvatarImage`/`AvatarFallback`).
- **Formulär**: `Input`, `Label`, `Textarea`, `Checkbox`, `Switch`, `RadioGroup` (+
  `RadioGroupItem`), `Select` (+ `SelectTrigger`/`SelectValue`/`SelectContent`/`SelectItem`/
  `SelectLabel`/`SelectGroup`/`SelectSeparator`).
- **Navigation/disclosure**: `Tabs` (+ `TabsList`/`TabsTrigger`/`TabsContent`).
- **Overlay**: `Dialog` (+ `DialogTrigger`/`DialogContent`/`DialogHeader`/`DialogFooter`/
  `DialogTitle`/`DialogDescription`/`DialogClose`), `Tooltip` (+ `TooltipTrigger`/
  `TooltipContent`/`TooltipProvider`).
- **Feedback**: `Alert` (+ `AlertTitle`/`AlertDescription`), `Progress`.
- **Actions**: `Button`.

Base UI använder en `render`-prop för komposition istället för Radix `asChild`, t.ex.
`<DialogTrigger render={<Button variant="outline">Öppna</Button>} />` — inte
`<DialogTrigger asChild><Button>...</Button></DialogTrigger>`.

Behövs en komponent som inte finns i listan (t.ex. `Accordion`, `Popover`, `Slider`,
`Table`)? Base UI har primitiv för de flesta (`node_modules/@base-ui/react/*`) — bygg den nya
`components/ui/<namn>.tsx` enligt samma mönster som ovan (cva-klasser + Base UI-primitiv,
`data-[checked]`/`data-[open]`-attribut för state, inte Radix `data-state=`).

## Att inte göra

- Lägg inte nya experiment direkt i `public/` — den mappen används bara för delade statiska
  assets (t.ex. vendorade tredjepartsbibliotek), inte för experiment-routes. Allt nytt går via
  `app/(experiments)/<slug>/`, även pastad, fristående HTML (konvertera den till en
  `page.tsx` enligt `publish-prototype`-skillen).
- Ändra inte delade tokens i `app/globals.css`, `app/layout.tsx` eller `components/ui/*` för
  att lösa ett enskilt experiments behov — de ska förbli generiska för alla experiment.
  Override:a på routenivå istället (se ovan).
- Ändra inte `next.config.ts` eller `.github/workflows/deploy.yml` för att lösa ett enskilt
  experiments behov — de ska förbli generiska.
- Lägg inte till npm-dependencies utöver den etablerade Next.js/Tailwind/shadcn-stacken utan
  att användaren efterfrågar det.
