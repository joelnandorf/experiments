import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Page() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-4 px-6 py-12">
      <Card className="wireframe-border w-full items-center text-center">
        <CardHeader>
          <CardTitle>👋 Hello, experiment!</CardTitle>
          <CardDescription>
            Detta är ett exempel-experiment som bevisar att pipelinen fungerar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="link" render={<Link href="/">← Tillbaka till alla experiment</Link>} />
        </CardContent>
      </Card>
    </main>
  );
}
