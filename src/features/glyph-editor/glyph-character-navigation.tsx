"use client";

import { useState } from "react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { Popover } from "@/components/ui/popover";
import type { GlyphDraft } from "@/features/font-builder/types";
import { GlyphCharacterGrid } from "./glyph-character-grid";

type GlyphCharacterNavigationProps = {
  activeCharacter: string;
  completed: number;
  fontFamily?: string;
  glyphs: Readonly<Record<string, GlyphDraft>>;
  nextCharacter: string;
  previousCharacter: string;
  totalCharacters: number;
  onCharacterChange: (character: string) => void;
};

const characterNavButton =
  "h-10 min-w-16 gap-1.5 rounded-md border-border/60 bg-muted/50 px-3 text-sm text-muted-foreground shadow-none transition-transform hover:bg-muted hover:text-foreground active:scale-[0.96]";

export const GlyphCharacterNavigation = ({
  activeCharacter,
  completed,
  fontFamily,
  glyphs,
  nextCharacter,
  previousCharacter,
  totalCharacters,
  onCharacterChange,
}: GlyphCharacterNavigationProps) => {
  const [characterPickerOpen, setCharacterPickerOpen] = useState(false);

  return (
    <div
      role="toolbar"
      aria-label="Character navigation"
      className="grid shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-border/60 px-3 py-2"
    >
      <Button
        variant="outline"
        size="lg"
        aria-label={`Previous character: ${previousCharacter}`}
        className={`${characterNavButton} justify-self-start`}
        onClick={() => onCharacterChange(previousCharacter)}
      >
        <HugeiconsIcon aria-hidden="true" icon={ArrowLeft01Icon} className="size-5" strokeWidth={2} />
        <span aria-hidden="true">{previousCharacter}</span>
      </Button>

      <div className="min-w-12 justify-self-center">
        <div className="lg:hidden">
          <Popover
            open={characterPickerOpen}
            onOpenChange={setCharacterPickerOpen}
            trigger={
              <Button
                variant="outline"
                size="icon-lg"
                aria-label={`Choose character. Current character: ${activeCharacter}`}
                className="size-9 rounded-md bg-muted/50 text-base font-semibold shadow-none"
              >
                {activeCharacter}
              </Button>
            }
            content={
              <>
                <div className="flex items-center justify-between gap-3 px-1">
                  <span className="font-medium">Characters</span>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {completed} / {totalCharacters}
                  </span>
                </div>
                <GlyphCharacterGrid
                  activeCharacter={activeCharacter}
                  fontFamily={fontFamily}
                  glyphs={glyphs}
                  onCharacterChange={(character) => {
                    onCharacterChange(character);
                    setCharacterPickerOpen(false);
                  }}
                />
              </>
            }
            contentProps={{
              align: "center",
              side: "bottom",
              className: "max-h-[min(28rem,calc(100dvh-8rem))] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto p-3",
            }}
          />
        </div>
        <span className="hidden size-9 place-items-center rounded-md border border-border/60 bg-muted/50 text-base font-semibold lg:grid">
          {activeCharacter}
        </span>
      </div>

      <Button
        variant="outline"
        size="lg"
        aria-label={`Next character: ${nextCharacter}`}
        className={`${characterNavButton} justify-self-end`}
        onClick={() => onCharacterChange(nextCharacter)}
      >
        <span aria-hidden="true">{nextCharacter}</span>
        <HugeiconsIcon aria-hidden="true" icon={ArrowRight01Icon} className="size-5" strokeWidth={2} />
      </Button>
    </div>
  );
};
