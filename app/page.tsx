import { readdirSync } from "node:fs";
import path from "node:path";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { legacyExperiments, type LegacyExperiment } from "@/lib/legacy-experiments";
import type { ExperimentMeta } from "@/lib/types";

interface AppExperiment extends ExperimentMeta {
  slug: string;
  kind: "app";
}

interface LegacyExperimentEntry extends LegacyExperiment {
  kind: "legacy";
}

type Experiment = AppExperiment | LegacyExperimentEntry;

async function discoverAppExperiments(): Promise<AppExperiment[]> {
  const experimentsDir = path.join(process.cwd(), "app", "(experiments)");
  let slugs: string[] = [];
  try {
    slugs = readdirSync(experimentsDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
  } catch {
    return [];
  }

  const experiments = await Promise.all(
    slugs.map(async (slug) => {
      const { meta } = (await import(`./(experiments)/${slug}/meta`)) as {
        meta: ExperimentMeta;
      };
      return { slug, kind: "app" as const, ...meta };
    }),
  );

  return experiments;
}

export default async function Home() {
  const appExperiments = await discoverAppExperiments();
  const legacy: LegacyExperimentEntry[] = legacyExperiments.map((experiment) => ({
    ...experiment,
    kind: "legacy" as const,
  }));

  const experiments: Experiment[] = [...appExperiments, ...legacy].sort((a, b) =>
    b.date.localeCompare(a.date),
  );

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <header className="mb-10">
        <h1 className="text-2xl font-semibold">Experiment</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          En samling snabba webbprototyper — {experiments.length} st.
        </p>
      </header>

      {experiments.length === 0 ? (
        <p className="text-muted-foreground">Inga experiment ännu.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {experiments.map((experiment) => (
            <ExperimentCard key={experiment.slug} experiment={experiment} />
          ))}
        </div>
      )}
    </main>
  );
}

function ExperimentCard({ experiment }: { experiment: Experiment }) {
  const href = `/${experiment.slug}/`;
  const content = (
    <Card className="wireframe-border h-full transition-colors hover:bg-accent/40">
      <CardHeader>
        <CardTitle>{experiment.title}</CardTitle>
        {experiment.description ? (
          <CardDescription>{experiment.description}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground text-xs">{experiment.date}</span>
        {experiment.tags?.map((tag) => (
          <Badge key={tag} variant="outline">
            {tag}
          </Badge>
        ))}
      </CardContent>
    </Card>
  );

  // Legacy-experiment är statiska HTML-filer som Next inte känner till som routes —
  // en vanlig länk undviker att next/link försöker prefetcha/intercepta navigeringen.
  if (experiment.kind === "legacy") {
    return (
      <a href={href} className="block">
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className="block">
      {content}
    </Link>
  );
}
