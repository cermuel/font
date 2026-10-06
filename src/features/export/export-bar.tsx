"use client";

import { useState } from "react";
import { Download, FileImage, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EditorSettings } from "@/features/font-builder/types";
import {
  exportFont,
  exportWriting,
  type FontExportFormat,
  type WritingExportFormat,
} from "./export-utils";

type ExportBarProps = {
  fontBuffer?: ArrayBuffer;
  fontFamily?: string;
  projectName: string;
  writing: string;
  settings: EditorSettings;
};

const FontExportPopover = ({
  buffer,
  projectName,
}: {
  buffer?: ArrayBuffer;
  projectName: string;
}) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(projectName);
  const [format, setFormat] = useState<FontExportFormat>("otf");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          // disabled={!buffer}
          disabled
          className="disabled:cursor-not-allowed!"
        >
          <Type aria-hidden="true" />
          Export font
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" align="end" className="w-80 gap-4 p-4">
        <PopoverHeader>
          <PopoverTitle>Export font</PopoverTitle>
          <PopoverDescription>
            Choose a name and font package. Font files cannot include fallback
            glyphs, so use a CSS fallback stack in your app.
          </PopoverDescription>
        </PopoverHeader>
        <div className="grid gap-2">
          <Label htmlFor="font-export-name">File name</Label>
          <Input
            id="font-export-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="font-export-format">Format</Label>
          <Select
            value={format}
            onValueChange={(value) => setFormat(value as FontExportFormat)}
          >
            <SelectTrigger id="font-export-format" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="otf">OpenType font (.otf)</SelectItem>
              <SelectItem value="css">Embedded webfont (.css)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          className="w-full"
          onClick={() => {
            if (!buffer) return;
            exportFont(buffer, name, format);
            setOpen(false);
          }}
        >
          <Download aria-hidden="true" />
          Download
        </Button>
      </PopoverContent>
    </Popover>
  );
};

const WritingExportPopover = ({
  writing,
  settings,
  fontBuffer,
  fontFamily,
}: Pick<
  ExportBarProps,
  "writing" | "settings" | "fontBuffer" | "fontFamily"
>) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("my-writing");
  const [format, setFormat] = useState<WritingExportFormat>("pdf");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleExport = async () => {
    setBusy(true);
    setError("");
    try {
      await exportWriting(
        { html: writing, settings, fontBuffer, fontFamily },
        name,
        format,
      );
      setOpen(false);
    } catch {
      setError("The export could not be created. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="default">
          <FileImage aria-hidden="true" />
          Export writing
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" align="end" className="w-80 gap-4 p-4">
        <PopoverHeader>
          <PopoverTitle>Export writing</PopoverTitle>
          <PopoverDescription>
            Download the formatted page as a document or image.
          </PopoverDescription>
        </PopoverHeader>
        <div className="grid gap-2">
          <Label htmlFor="writing-export-name">File name</Label>
          <Input
            id="writing-export-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="writing-export-format">Format</Label>
          <Select
            value={format}
            onValueChange={(value) => setFormat(value as WritingExportFormat)}
          >
            <SelectTrigger id="writing-export-format" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF document (.pdf)</SelectItem>
              <SelectItem value="png">PNG image (.png)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {error ? (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        ) : null}
        <Button className="w-full" disabled={busy} onClick={handleExport}>
          <Download aria-hidden="true" />
          {busy ? "Creating export…" : "Download"}
        </Button>
      </PopoverContent>
    </Popover>
  );
};

export const ExportBar = (props: ExportBarProps) => (
  <footer className="mx-auto flex w-full max-w-6xl shrink-0 justify-end gap-2 px-4 py-3 sm:px-6 sm:py-4">
    <FontExportPopover
      buffer={props.fontBuffer}
      projectName={props.projectName}
    />
    <WritingExportPopover {...props} />
  </footer>
);
