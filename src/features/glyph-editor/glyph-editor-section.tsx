"use client";

import { useRef, type KeyboardEvent } from "react";
import { ArrowLeft, ArrowRight, Undo2Icon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CHARACTERS } from "@/features/font-builder/constants";
import { getGlyphZone } from "@/features/font-builder/glyph-metrics";
import type { GlyphDraft, Stroke } from "@/features/font-builder/types";
import { cn } from "@/utils/helpers";
import { GlyphCanvas } from "./glyph-canvas";

type GlyphEditorSectionProps = {
  activeCharacter: string;
  glyphs: Readonly<Record<string, GlyphDraft>>;
  onCharacterChange: (character: string) => void;
  onStrokesChange: (strokes: readonly Stroke[]) => void;
};

const toolButton =
  "size-8 rounded-md border-transparent bg-transparent text-muted-foreground shadow-none hover:bg-muted hover:text-foreground disabled:opacity-30";

export const GlyphEditorSection = ({
  activeCharacter,
  glyphs,
  onCharacterChange,
  onStrokesChange,
}: GlyphEditorSectionProps) => {
  const strokes = glyphs[activeCharacter]?.strokes ?? [];
  const activeIndex = CHARACTERS.indexOf(activeCharacter);
  const completed = Object.values(glyphs).filter(
    (glyph) => glyph.strokes.length,
  ).length;
  const zone = getGlyphZone(activeCharacter, strokes);

  const move = (direction: number) => {
    const next =
      (activeIndex + direction + CHARACTERS.length) % CHARACTERS.length;
    onCharacterChange(CHARACTERS[next]);
  };

  const gridRef = useRef<HTMLDivElement>(null);

  const onGridKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const grid = gridRef.current;
    const button = (event.target as HTMLElement).closest("button");
    if (!grid || !button) return;

    const cols = getComputedStyle(grid).gridTemplateColumns.split(" ").length;
    const index = Array.from(grid.children).indexOf(button);
    const step = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -cols,
      ArrowDown: cols,
      Home: -index,
      End: CHARACTERS.length - 1 - index,
    }[event.key];
    if (step === undefined) return;

    event.preventDefault();
    const next = Math.min(Math.max(index + step, 0), CHARACTERS.length - 1);
    onCharacterChange(CHARACTERS[next]);
    (grid.children[next] as HTMLElement).focus();
  };

  return (
    <section
      id="build-panel"
      aria-label="Build"
      className="h-full min-h-0 overflow-y-auto lg:overflow-hidden"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-3 pt-3 pb-20 sm:px-4 lg:grid lg:h-full lg:min-h-0 lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-4 lg:px-0 lg:pt-0 lg:pb-6">
        <div className="order-1 flex flex-col overflow-hidden rounded-lg border border-border/60 bg-card lg:order-2 lg:h-full lg:min-h-0">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border/60 px-3 py-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="grid size-7 place-items-center rounded-md border border-border/60 bg-muted/50 text-sm font-semibold">
                {activeCharacter}
              </span>
              <div className="min-w-0 leading-tight">
                <p className="truncate text-[13px] font-medium">
                  Draw “{activeCharacter}”
                </p>
                <p className="text-xs md:hidden tabular-nums text-muted-foreground">
                  {activeIndex + 1} of {CHARACTERS.length}
                  {strokes.length > 0 &&
                    ` · ${strokes.length} stroke${strokes.length > 1 ? "s" : ""}`}
                </p>
              </div>
            </div>

            <div
              role="toolbar"
              aria-label="Drawing tools"
              className="flex shrink-0 items-center gap-0.5"
            >
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Previous character"
                className={toolButton}
                onClick={() => move(-1)}
              >
                <ArrowLeft aria-hidden="true" className="size-4.5" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Next character"
                className={toolButton}
                onClick={() => move(1)}
              >
                <ArrowRight aria-hidden="true" className="size-4.5" />
              </Button>
              <span aria-hidden="true" className="mx-1 h-4 w-px bg-border" />
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Undo last stroke"
                disabled={!strokes.length}
                className={toolButton}
                onClick={() => onStrokesChange(strokes.slice(0, -1))}
              >
                <Undo2Icon aria-hidden="true" className="size-4.5" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Clear character"
                disabled={!strokes.length}
                className={cn(
                  toolButton,
                  "hover:bg-destructive/10 hover:text-destructive",
                )}
                onClick={() => onStrokesChange([])}
              >
                <Trash2 aria-hidden="true" className="size-4.5" />
              </Button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 items-center justify-center bg-muted/30 p-2 sm:p-4">
            <div className="aspect-square w-full max-w-lg overflow-hidden rounded-md border border-border/60 bg-background lg:h-full lg:w-auto lg:max-w-full">
              <GlyphCanvas
                character={activeCharacter}
                strokes={strokes}
                zone={zone}
                onChange={onStrokesChange}
              />
            </div>
          </div>
        </div>

        <div className="order-2 flex flex-col overflow-hidden rounded-lg border border-border/60 bg-card lg:order-1 lg:h-max lg:max-h-full lg:self-start">
          <div className="shrink-0 border-b border-border/60 px-3 py-2">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-medium">Characters</h2>
              <span className="text-xs tabular-nums text-muted-foreground">
                {completed} / {CHARACTERS.length}
              </span>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            <div
              ref={gridRef}
              onKeyDown={onGridKeyDown}
              className="grid grid-cols-8 gap-1 sm:grid-cols-10 lg:grid-cols-6"
            >
              {CHARACTERS.map((character) => {
                const isActive = character === activeCharacter;
                const isComplete = Boolean(glyphs[character]?.strokes.length);
                return (
                  <button
                    key={character}
                    type="button"
                    aria-pressed={isActive}
                    tabIndex={isActive ? 0 : -1}
                    aria-label={`${character}${isComplete ? ", drawn" : ", not drawn"}`}
                    onClick={() => onCharacterChange(character)}
                    className={cn(
                      "relative grid aspect-square min-h-9 place-items-center rounded-md border text-[13px] font-medium",
                      "transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
                      isActive &&
                        "border-primary/40 bg-primary/10 text-foreground",
                      !isActive &&
                        isComplete &&
                        "border-transparent bg-muted text-foreground hover:bg-muted/70",
                      !isActive &&
                        !isComplete &&
                        "border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    )}
                  >
                    {character}
                    {isComplete && (
                      <span
                        aria-hidden="true"
                        className={cn(
                          "absolute right-1 top-1 size-1 rounded-full",
                          isActive ? "bg-primary" : "bg-muted-foreground/60",
                        )}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
