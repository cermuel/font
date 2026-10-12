"use client";

import { Delete02Icon, Undo02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { CHARACTERS } from "@/features/font-builder/constants";
import type { GlyphDraft, Stroke } from "@/features/font-builder/types";
import { GlyphCanvas } from "./glyph-canvas";
import { GlyphCharacterGrid } from "./glyph-character-grid";
import { GlyphCharacterNavigation } from "./glyph-character-navigation";

type GlyphEditorSectionProps = {
  activeCharacter: string;
  fontFamily?: string;
  glyphs: Readonly<Record<string, GlyphDraft>>;
  onCharacterChange: (character: string) => void;
  onStrokesChange: (strokes: readonly Stroke[]) => void;
};

const actionButton =
  "h-9 gap-2 rounded-md border-transparent bg-transparent px-3 text-sm text-muted-foreground shadow-none hover:bg-muted hover:text-foreground disabled:opacity-30";

export const GlyphEditorSection = ({
  activeCharacter,
  fontFamily,
  glyphs,
  onCharacterChange,
  onStrokesChange,
}: GlyphEditorSectionProps) => {
  const strokes = glyphs[activeCharacter]?.strokes ?? [];
  const activeIndex = CHARACTERS.indexOf(activeCharacter);
  const completed = Object.values(glyphs).filter(
    (glyph) => glyph.strokes.length,
  ).length;
  const previousCharacter =
    CHARACTERS[(activeIndex - 1 + CHARACTERS.length) % CHARACTERS.length];
  const nextCharacter = CHARACTERS[(activeIndex + 1) % CHARACTERS.length];

  return (
    <section
      id="build-panel"
      aria-label="Build"
      className="h-full min-h-0 overflow-hidden"
    >
      <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col gap-3 px-3 pt-3 pb-3 sm:px-4 lg:grid lg:grid-cols-[18.75rem_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)] lg:gap-4 lg:px-0 lg:pt-0 lg:pb-6">
        <div className="order-1 flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border/60 bg-card lg:order-2">
          <GlyphCharacterNavigation
            activeCharacter={activeCharacter}
            completed={completed}
            fontFamily={fontFamily}
            glyphs={glyphs}
            nextCharacter={nextCharacter}
            previousCharacter={previousCharacter}
            totalCharacters={CHARACTERS.length}
            onCharacterChange={onCharacterChange}
          />

          <div className="flex min-h-0 flex-1 items-center justify-center bg-muted/30 p-2 @container-size sm:p-4">
            <div className="size-[min(100cqw,100cqh)] max-w-lg overflow-hidden rounded-md border border-border/60 bg-background">
              <GlyphCanvas
                character={activeCharacter}
                strokes={strokes}
                onChange={onStrokesChange}
              />
            </div>
          </div>

          <div
            role="toolbar"
            aria-label="Drawing actions"
            className="flex shrink-0 items-center justify-end gap-1 border-t border-border/60 px-3 py-2"
          >
            <Button
              variant="outline"
              size="default"
              disabled={!strokes.length}
              className={actionButton}
              onClick={() => onStrokesChange(strokes.slice(0, -1))}
            >
              <HugeiconsIcon
                aria-hidden="true"
                icon={Undo02Icon}
                className="size-4"
              />
              Undo
            </Button>
            <Button
              variant="default"
              size="default"
              disabled={!strokes.length}
              className="h-9 gap-2 px-3 text-sm"
              onClick={() => onStrokesChange([])}
            >
              <HugeiconsIcon
                aria-hidden="true"
                icon={Delete02Icon}
                className="size-4"
              />
              Clear
            </Button>
          </div>
        </div>

        <div className="order-2 hidden flex-col overflow-hidden rounded-lg border border-border/60 bg-card lg:order-1 lg:flex lg:h-max lg:max-h-full lg:self-start">
          <div className="shrink-0 border-b border-border/60 px-3 py-2">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-medium">Characters</h2>
              <span className="text-xs tabular-nums text-muted-foreground">
                {completed} / {CHARACTERS.length}
              </span>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            <GlyphCharacterGrid
              activeCharacter={activeCharacter}
              fontFamily={fontFamily}
              glyphs={glyphs}
              onCharacterChange={onCharacterChange}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
