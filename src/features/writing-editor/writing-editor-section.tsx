"use client";

import type { CSSProperties } from "react";
import {
  FALLBACK_FONT_STACK,
  USER_FONT_FAMILY,
} from "@/features/font-builder/constants";
import type { EditorSettings } from "@/features/font-builder/types";
import { RichTextEditor } from "./rich-text-editor";

type WritingEditorSectionProps = {
  value: string;
  settings: EditorSettings;
  fontFamily?: string;
  onValueChange: (value: string) => void;
};

export const WritingEditorSection = ({
  value,
  settings,
  fontFamily,
  onValueChange,
}: WritingEditorSectionProps) => {
  const editorStyle: CSSProperties = {
    color: settings.color,
    backgroundColor: "var(--card)",
    fontFamily: fontFamily
      ? `"${USER_FONT_FAMILY}", ${FALLBACK_FONT_STACK}`
      : FALLBACK_FONT_STACK,
    fontSize: `${settings.fontSize}px`,
    letterSpacing: `${settings.letterSpacing}em`,
    lineHeight: settings.lineHeight,
    wordSpacing: `${settings.wordSpacing}em`,
  };

  return (
    <section
      id="write-panel"
      aria-label="Write"
      className="h-full min-h-0 overflow-hidden"
    >
      <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col">
        <RichTextEditor
          value={value}
          style={editorStyle}
          fontSize={settings.fontSize}
          onValueChange={onValueChange}
        />
      </div>
    </section>
  );
};
