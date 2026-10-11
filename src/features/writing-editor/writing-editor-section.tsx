"use client";

import type { CSSProperties } from "react";
import { FALLBACK_FONT_STACK } from "@/features/font-builder/constants";
import type {
  EditorFontSize,
  EditorSettings,
} from "@/features/font-builder/types";
import { RichTextEditor } from "./rich-text-editor";

type WritingEditorSectionProps = {
  value: string;
  settings: EditorSettings;
  fontFamily?: string;
  onFontSizeChange: (fontSize: EditorFontSize) => void;
  onValueChange: (value: string) => void;
};

export const WritingEditorSection = ({
  value,
  settings,
  fontFamily,
  onFontSizeChange,
  onValueChange,
}: WritingEditorSectionProps) => {
  const editorStyle: CSSProperties = {
    color: settings.color,
    backgroundColor: "var(--card)",
    fontFamily: fontFamily
      ? `"${fontFamily}", ${FALLBACK_FONT_STACK}`
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
          onFontSizeChange={onFontSizeChange}
          onValueChange={onValueChange}
        />
      </div>
    </section>
  );
};
