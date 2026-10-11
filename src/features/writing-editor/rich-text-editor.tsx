"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { EDITOR_FONT_SIZES } from "@/features/font-builder/constants";
import type { EditorFontSize } from "@/features/font-builder/types";
import { RichTextToolbar, type RichCommand } from "./rich-text-toolbar";
import { applyFontSizeToSelectedBlocks } from "./selection-formatting";

type RichTextEditorProps = {
  value: string;
  style: CSSProperties;
  fontSize: EditorFontSize;
  onFontSizeChange: (fontSize: EditorFontSize) => void;
  onValueChange: (value: string) => void;
};

const emptyFormats: Record<RichCommand, boolean> = {
  bold: false,
  italic: false,
  underline: false,
  insertUnorderedList: false,
  insertOrderedList: false,
  justifyLeft: false,
  justifyCenter: false,
  justifyRight: false,
  justifyFull: false,
};

export const RichTextEditor = ({
  value,
  style,
  fontSize,
  onFontSizeChange,
  onValueChange,
}: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const selectionRef = useRef<Range | null>(null);
  const [activeFormats, setActiveFormats] = useState(emptyFormats);
  const [selectionFontSize, setSelectionFontSize] =
    useState<EditorFontSize | null>(null);

  const syncFormats = useCallback(() => {
    const selection = window.getSelection();
    if (!selection?.anchorNode || !editorRef.current?.contains(selection.anchorNode)) return;
    const range = selection.rangeCount ? selection.getRangeAt(0) : null;
    selectionRef.current = range?.cloneRange() ?? null;

    const anchor = selection.anchorNode instanceof Element
      ? selection.anchorNode
      : selection.anchorNode.parentElement;
    if (anchor) {
      const computedSize = Math.round(Number.parseFloat(window.getComputedStyle(anchor).fontSize));
      if (EDITOR_FONT_SIZES.includes(computedSize as EditorFontSize)) {
        setSelectionFontSize(computedSize as EditorFontSize);
      }
    }
    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      insertUnorderedList: document.queryCommandState("insertUnorderedList"),
      insertOrderedList: document.queryCommandState("insertOrderedList"),
      justifyLeft: document.queryCommandState("justifyLeft"),
      justifyCenter: document.queryCommandState("justifyCenter"),
      justifyRight: document.queryCommandState("justifyRight"),
      justifyFull: document.queryCommandState("justifyFull"),
    });
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (editor && editor.innerHTML !== value) editor.innerHTML = value;
  }, [value]);

  useEffect(() => {
    document.addEventListener("selectionchange", syncFormats);
    return () => document.removeEventListener("selectionchange", syncFormats);
  }, [syncFormats]);

  const emitValue = () => {
    if (editorRef.current) onValueChange(editorRef.current.innerHTML);
  };

  const runCommand = (command: RichCommand) => {
    editorRef.current?.focus();
    document.execCommand(command);
    syncFormats();
    emitValue();
  };

  const applyFontSize = (nextSize: EditorFontSize) => {
    const editor = editorRef.current;
    const range = selectionRef.current;
    const hasSelection = Boolean(
      editor &&
      range &&
      !range.collapsed &&
      editor.contains(range.commonAncestorContainer),
    );

    setSelectionFontSize(nextSize);
    onFontSizeChange(nextSize);
    if (!editor || !range || !hasSelection) {
      editor?.focus();
      return;
    }

    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    if (!applyFontSizeToSelectedBlocks(editor, range, nextSize)) return;
    selectionRef.current = null;
    emitValue();
  };

  const handleInput = (event: FormEvent<HTMLDivElement>) => {
    onValueChange(event.currentTarget.innerHTML);
    syncFormats();
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
      <RichTextToolbar
        activeFormats={activeFormats}
        fontSize={selectionFontSize ?? fontSize}
        onCommand={runCommand}
        onFontSizeChange={applyFontSize}
      />

      <div
        ref={editorRef}
        id="writing-surface"
        data-writing-surface
        role="textbox"
        aria-label="Writing surface"
        aria-multiline="true"
        contentEditable
        suppressContentEditableWarning
        spellCheck
        data-placeholder="Start writing…"
        style={style}
        onInput={handleInput}
        onKeyUp={syncFormats}
        onMouseUp={syncFormats}
        onPaste={(event) => {
          event.preventDefault();
          document.execCommand("insertText", false, event.clipboardData.getData("text/plain"));
        }}
        className="min-h-0 flex-1 overflow-y-auto p-6 outline-none dark:!text-foreground empty:before:pointer-events-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)] sm:p-8 [&_ol]:list-decimal [&_ol]:ps-8 [&_ul]:list-disc [&_ul]:ps-8"
      />
    </div>
  );
};
