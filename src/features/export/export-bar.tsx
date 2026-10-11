"use client";

import { useState } from "react";
import {
  Download02Icon,
  Image02Icon,
  TextFontIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
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
import { exportWriting, type WritingExportFormat } from "./export-utils";

type ExportBarProps = {
  fontBuffer?: ArrayBuffer;
  fontFamily?: string;
  projectName: string;
  writing: string;
  settings: EditorSettings;
};

const FontExportPopover = () => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <HugeiconsIcon aria-hidden="true" icon={TextFontIcon} />
          Export font
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" align="center" className="w-72 p-4">
        <PopoverHeader>
          <PopoverTitle>Font export isn’t ready</PopoverTitle>
          <PopoverDescription>
            For now, export your writing as PDF or PNG.
          </PopoverDescription>
        </PopoverHeader>
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
          <HugeiconsIcon aria-hidden="true" icon={Image02Icon} />
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
          <HugeiconsIcon aria-hidden="true" icon={Download02Icon} />
          {busy ? "Creating export…" : "Download"}
        </Button>
      </PopoverContent>
    </Popover>
  );
};

export const ExportBar = (props: ExportBarProps) => (
  <footer className="mx-auto flex w-full max-w-6xl shrink-0 justify-end gap-2 px-4 py-3 sm:px-6 sm:py-4">
    <FontExportPopover />
    <WritingExportPopover {...props} />
  </footer>
);
