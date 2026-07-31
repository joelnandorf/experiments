import type { ExperimentMeta } from "@/lib/types";

/**
 * De experiment som fanns som fristående HTML-mappar innan migreringen till Next.js.
 * De ligger orörda i public/<slug>/ och serveras rakt av av Next static export.
 *
 * Detta är en STÄNGD, FRUSEN lista — lägg aldrig till ett nytt experiment här. Nya
 * experiment ska alltid skapas under app/(experiments)/<slug>/, se templates/basic/.
 * Om ett av dessa fyra filer redigeras substantiellt igen, uppdatera dess `date` för hand.
 */
export interface LegacyExperiment extends ExperimentMeta {
  slug: string;
}

export const legacyExperiments: LegacyExperiment[] = [
  {
    slug: "click-counter",
    title: "Klickräknare",
    description:
      "En minimal klickräknare — bevisar att publish-prototype-flödet fungerar end-to-end.",
    tags: ["exempel", "demo"],
    date: "2026-07-29",
  },
  {
    slug: "hello-world",
    title: "Hello World",
    description: "Ett minimalt exempel-experiment som visar hur en prototyp-mapp ser ut.",
    tags: ["exempel", "demo"],
    date: "2026-07-29",
  },
  {
    slug: "gokur-klocka",
    title: "Gökur",
    description:
      "En analog klocka i form av ett gökur — göken flyger ut och gökar varje heltimme, eller när du trycker på knappen.",
    tags: ["klocka", "animation", "ljud", "css"],
    date: "2026-07-29",
  },
  {
    slug: "furuvagen-23-karta",
    title: "Furuvägen 23 – karta & solbana",
    description:
      "Karta över vårt hus på Furuvägen 23 i Holmsund med solens bana under dagen och årstiderna — för att bedöma placering av solceller.",
    tags: ["karta", "holmsund", "hus", "sol", "solceller"],
    date: "2026-07-29",
  },
];
