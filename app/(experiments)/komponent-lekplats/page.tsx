"use client";

import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Page() {
  const [count, setCount] = useState(0);
  const [progress, setProgress] = useState(40);

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

      <Card className="wireframe-border">
        <CardHeader>
          <CardTitle>Formulärkontroller</CardTitle>
          <CardDescription>Input, Label, Textarea, Checkbox, Switch, RadioGroup.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="lekplats-namn">Namn</Label>
            <Input id="lekplats-namn" placeholder="Ada Lovelace" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="lekplats-meddelande">Meddelande</Label>
            <Textarea id="lekplats-meddelande" placeholder="Skriv något..." />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="lekplats-check" defaultChecked />
            <Label htmlFor="lekplats-check">Jag godkänner villkoren</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="lekplats-switch" defaultChecked />
            <Label htmlFor="lekplats-switch">Aktivera notiser</Label>
          </div>
          <RadioGroup defaultValue="a" className="flex gap-4">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="a" id="lekplats-radio-a" />
              <Label htmlFor="lekplats-radio-a">Alternativ A</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="b" id="lekplats-radio-b" />
              <Label htmlFor="lekplats-radio-b">Alternativ B</Label>
            </div>
          </RadioGroup>
          <div className="grid gap-1.5">
            <Label htmlFor="lekplats-select">Favoritfärg</Label>
            <Select defaultValue="gra">
              <SelectTrigger id="lekplats-select" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gra">Grå</SelectItem>
                <SelectItem value="svart">Svart</SelectItem>
                <SelectItem value="vit">Vit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="wireframe-border">
        <CardHeader>
          <CardTitle>Tabs</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="en">
            <TabsList>
              <TabsTrigger value="en">Flik ett</TabsTrigger>
              <TabsTrigger value="tva">Flik två</TabsTrigger>
            </TabsList>
            <TabsContent value="en" className="text-muted-foreground pt-3 text-sm">
              Innehåll för första fliken.
            </TabsContent>
            <TabsContent value="tva" className="text-muted-foreground pt-3 text-sm">
              Innehåll för andra fliken.
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="wireframe-border">
        <CardHeader>
          <CardTitle>Dialog + Tooltip</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <Dialog>
            <DialogTrigger render={<Button variant="outline">Öppna dialog</Button>} />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Exempeldialog</DialogTitle>
                <DialogDescription>
                  En modal byggd på Base UI:s Dialog-primitiv.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button>Ok</Button>} />
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Tooltip>
            <TooltipTrigger render={<Button variant="ghost">Hovra mig</Button>} />
            <TooltipContent>Det här är en tooltip.</TooltipContent>
          </Tooltip>
        </CardContent>
      </Card>

      <Card className="wireframe-border">
        <CardHeader>
          <CardTitle>Alert + Avatar + Progress</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Alert>
            <AlertTitle>Notera</AlertTitle>
            <AlertDescription>En vanlig informationsruta.</AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertTitle>Fel</AlertTitle>
            <AlertDescription>Något gick fel.</AlertDescription>
          </Alert>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>JN</AvatarFallback>
            </Avatar>
            <div className="flex flex-1 items-center gap-2">
              <Progress value={progress} className="flex-1" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setProgress((p) => (p >= 100 ? 0 : p + 20))}
              >
                +20%
              </Button>
            </div>
          </div>
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
