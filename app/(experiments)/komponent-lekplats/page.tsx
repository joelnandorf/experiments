"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function Page() {
  const [count, setCount] = useState(0);

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-12">
      <header>
        <h1 className="text-2xl font-semibold">Komponentlekplats</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          De delade byggstenarna som varje nytt experiment får gratis via
          components/ui/* och det gemensamma wireframe-temat.
        </p>
      </header>

      <Card className="wireframe-border">
        <CardHeader>
          <CardTitle>Button + state</CardTitle>
          <CardDescription>En vanlig klient-komponent med useState.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <Button onClick={() => setCount((c) => c + 1)}>Klicka mig</Button>
          <Button variant="outline" onClick={() => setCount(0)}>
            Nollställ
          </Button>
          <span className="text-muted-foreground text-sm">{count} klick</span>
        </CardContent>
      </Card>

      <Card className="wireframe-border">
        <CardHeader>
          <CardTitle>Badge-varianter</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge>default</Badge>
          <Badge variant="secondary">secondary</Badge>
          <Badge variant="outline">outline</Badge>
          <Badge variant="destructive">destructive</Badge>
        </CardContent>
      </Card>

      <Card className="wireframe-block">
        <CardHeader>
          <CardTitle>Skeleton + wireframe-block</CardTitle>
          <CardDescription>
            Platshållartextur för innehåll som inte är byggt än.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>

      <Separator />
      <p className="text-muted-foreground text-xs">
        Källa: app/(experiments)/komponent-lekplats/page.tsx
      </p>
    </main>
  );
}
