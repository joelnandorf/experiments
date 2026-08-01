"use client";

import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Page() {
  const [count, setCount] = useState(0);

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-4 px-6 py-12">
      <Card className="wireframe-border w-full items-center text-center">
        <CardHeader>
          <CardTitle>Klickräknare</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-6xl font-bold tabular-nums">{count}</p>
        </CardContent>
        <CardFooter className="justify-center">
          <Button onClick={() => setCount((n) => n + 1)}>Klicka mig</Button>
        </CardFooter>
      </Card>
      <Button variant="link" render={<Link href="/">← Tillbaka till alla experiment</Link>} />
    </main>
  );
}
