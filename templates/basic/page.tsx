// Om experimentet använder hooks/event-handlers/canvas eller andra webbläsar-API:er,
// lägg till "use client" som allra första raden i filen (Server Components stödjer inte det).

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Börja bygga här. components/ui/* (shadcn) + det delade wireframe-temat i app/globals.css
// används automatiskt. Vill du ha ett helt annat utseende för just detta experiment,
// skriv egen Tailwind/CSS direkt i denna fil — rör inte de delade filerna.
export default function Page() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-4 px-6 py-12">
      <Card className="wireframe-border w-full">
        <CardHeader>
          <CardTitle>Nytt experiment</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Börja bygga här. Lägg gärna fler filer i samma mapp om det behövs.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
