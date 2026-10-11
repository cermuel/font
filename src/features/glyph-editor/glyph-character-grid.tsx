"use client";

import { useRef, type KeyboardEvent } from "react";
import { CHARACTERS } from "@/features/font-builder/constants";
import type { GlyphDraft } from "@/features/font-builder/types";
import { cn } from "@/utils/helpers";

type GlyphCharacterGridProps = {
  activeCharacter: string;
  fontFamily?: string;
  glyphs: Readonly<Record<string, GlyphDraft>>;
  onCharacterChange: (character: string) => void;
};

const characterGroups = [
  { label: "Lowercase", characters: CHARACTERS.slice(0, 26) },
  { label: "Uppercase", characters: CHARACTERS.slice(26, 52) },
  { label: "Numbers", characters: CHARACTERS.slice(52) },
] as const;

export const GlyphCharacterGrid = ({
  activeCharacter,
  fontFamily,
  glyphs,
  onCharacterChange,
}: GlyphCharacterGridProps) => {
  const gridRef = useRef<HTMLDivElement>(null);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const container = gridRef.current;
    const button = (event.target as HTMLElement).closest("button");
    const characterGrid = button?.closest<HTMLElement>("[data-character-grid]");
    if (!container || !button || !characterGrid) return;

    const buttons = [
      ...container.querySelectorAll<HTMLButtonElement>("[data-character]"),
    ];
    const columns =
      getComputedStyle(characterGrid).gridTemplateColumns.split(" ").length;
    const index = buttons.indexOf(button as HTMLButtonElement);
    const step = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -columns,
      ArrowDown: columns,
      Home: -index,
      End: CHARACTERS.length - 1 - index,
    }[event.key];
    if (step === undefined) return;

    event.preventDefault();
    const next = Math.min(Math.max(index + step, 0), CHARACTERS.length - 1);
    onCharacterChange(CHARACTERS[next]);
    buttons[next]?.focus();
  };

  return (
    <div ref={gridRef} onKeyDown={onKeyDown} className="space-y-4">
      {characterGroups.map((group) => (
        <section
          key={group.label}
          aria-labelledby={`character-group-${group.label}`}
        >
          <h3
            id={`character-group-${group.label}`}
            className="mb-2 text-xs font-medium text-muted-foreground"
          >
            {group.label}
          </h3>
          <div
            data-character-grid
            className="grid grid-cols-8 gap-1 sm:grid-cols-10 lg:grid-cols-9"
          >
            {group.characters.map((character) => {
              const isActive = character === activeCharacter;
              const isComplete = Boolean(glyphs[character]?.strokes.length);
              return (
                <button
                  key={character}
                  data-character={character}
                  type="button"
                  aria-pressed={isActive}
                  tabIndex={isActive ? 0 : -1}
                  aria-label={`${character}${isComplete ? ", drawn" : ", not drawn"}`}
                  onClick={() => onCharacterChange(character)}
                  className={cn(
                    "relative grid aspect-square min-h-9 place-items-center border border-border bg-transparent text-[13px] font-medium lg:min-h-0",
                    "transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
                    isActive &&
                      "border-foreground bg-foreground text-background",
                    !isActive &&
                      isComplete &&
                      "text-foreground hover:bg-muted/60",
                    !isActive &&
                      !isComplete &&
                      "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "leading-none",
                      isComplete && "text-lg font-normal",
                    )}
                    style={
                      isComplete && fontFamily
                        ? { fontFamily: `"${fontFamily}"` }
                        : undefined
                    }
                  >
                    {character}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};
