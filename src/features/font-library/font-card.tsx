"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FontSummary } from "@/features/font-builder/types";

type FontCardProps = {
  font: FontSummary;
  onDelete: (font: FontSummary) => Promise<void>;
  onRename: (font: FontSummary, name: string) => Promise<void>;
};

const formatter = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

export const FontCard = ({ font, onDelete, onRename }: FontCardProps) => {
  const [mode, setMode] = useState<"idle" | "rename" | "delete">("idle");
  const [name, setName] = useState(font.name);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const rename = async (event: FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      await onRename(font, name);
      setMode("idle");
    } catch {
      setError("Unable to rename this font. Refresh and try again.");
    } finally {
      setPending(false);
    }
  };

  const remove = async () => {
    setPending(true);
    setError("");
    try {
      await onDelete(font);
    } catch {
      setError("Unable to delete this font. Try again.");
      setPending(false);
    }
  };

  return (
    <article className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
      {mode === "rename" ? (
        <form onSubmit={rename} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor={`font-name-${font.id}`}>Font name</Label>
            <Input id={`font-name-${font.id}`} value={name} maxLength={80} autoFocus onChange={(event) => setName(event.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save name"}</Button>
            <Button type="button" variant="ghost" onClick={() => setMode("idle")}>Cancel</Button>
          </div>
        </form>
      ) : mode === "delete" ? (
        <div className="space-y-3">
          <div>
            <h2 className="font-semibold">Delete “{font.name}”?</h2>
            <p className="mt-1 text-sm text-muted-foreground">This permanently removes the font and its writing.</p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="destructive" disabled={pending} onClick={() => void remove()}>
              {pending ? "Deleting…" : "Delete font"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setMode("idle")}>Cancel</Button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h2 className="truncate text-lg font-semibold">{font.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {font.completedGlyphs} of 62 glyphs · Edited {formatter.format(new Date(font.updatedAt))}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild><Link href={`/fonts/${font.id}`}>Open font</Link></Button>
            <Button type="button" variant="outline" onClick={() => setMode("rename")}>Rename</Button>
            <Button type="button" variant="ghost" onClick={() => setMode("delete")}>Delete</Button>
          </div>
        </>
      )}
      <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>
    </article>
  );
};
