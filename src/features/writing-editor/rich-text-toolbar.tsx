import {
  LeftToRightListBulletIcon,
  LeftToRightListNumberIcon,
  TextAlignCenterIcon,
  TextAlignJustifyIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon,
  TextBoldIcon,
  TextItalicIcon,
  TextUnderlineIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EDITOR_FONT_SIZES } from "@/features/font-builder/constants";
import type { EditorFontSize } from "@/features/font-builder/types";

export type RichCommand =
  | "bold"
  | "italic"
  | "underline"
  | "insertUnorderedList"
  | "insertOrderedList"
  | "justifyLeft"
  | "justifyCenter"
  | "justifyRight"
  | "justifyFull";

type ToolbarAction = Readonly<{
  command: RichCommand;
  label: string;
  icon: IconSvgElement;
}>;

const formatActions: readonly ToolbarAction[] = [
  { command: "bold", label: "Bold", icon: TextBoldIcon },
  { command: "italic", label: "Italic", icon: TextItalicIcon },
  { command: "underline", label: "Underline", icon: TextUnderlineIcon },
  {
    command: "insertUnorderedList",
    label: "Bulleted list",
    icon: LeftToRightListBulletIcon,
  },
  {
    command: "insertOrderedList",
    label: "Numbered list",
    icon: LeftToRightListNumberIcon,
  },
];

const alignmentActions: readonly ToolbarAction[] = [
  { command: "justifyLeft", label: "Align left", icon: TextAlignLeftIcon },
  {
    command: "justifyCenter",
    label: "Align center",
    icon: TextAlignCenterIcon,
  },
  { command: "justifyRight", label: "Align right", icon: TextAlignRightIcon },
  { command: "justifyFull", label: "Justify", icon: TextAlignJustifyIcon },
];

type RichTextToolbarProps = {
  activeFormats: Readonly<Record<RichCommand, boolean>>;
  fontSize: EditorFontSize;
  onCommand: (command: RichCommand) => void;
  onFontSizeChange: (value: EditorFontSize) => void;
};

const ActionButtons = ({
  actions,
  activeFormats,
  onCommand,
}: Pick<RichTextToolbarProps, "activeFormats" | "onCommand"> & {
  actions: readonly ToolbarAction[];
}) => actions.map(({ command, icon, label }) => (
  <Button
    key={command}
    type="button"
    size="icon"
    variant={activeFormats[command] ? "secondary" : "ghost"}
    aria-label={label}
    aria-pressed={activeFormats[command]}
    onMouseDown={(event) => event.preventDefault()}
    onClick={() => onCommand(command)}
  >
    <HugeiconsIcon aria-hidden="true" icon={icon} />
  </Button>
));

export const RichTextToolbar = ({
  activeFormats,
  fontSize,
  onCommand,
  onFontSizeChange,
}: RichTextToolbarProps) => (
  <div className="flex shrink-0 flex-wrap items-center gap-1 border-b p-2">
    <Select
      value={String(fontSize)}
      onValueChange={(next) => onFontSizeChange(Number(next) as EditorFontSize)}
    >
      <SelectTrigger aria-label="Font size" className="w-24">
        <SelectValue placeholder="Size" />
      </SelectTrigger>
      <SelectContent>
        {EDITOR_FONT_SIZES.map((size) => (
          <SelectItem key={size} value={String(size)}>{size}px</SelectItem>
        ))}
      </SelectContent>
    </Select>

    <span aria-hidden="true" className="mx-1 h-5 w-px bg-border" />
    <ActionButtons actions={formatActions} activeFormats={activeFormats} onCommand={onCommand} />
    <span aria-hidden="true" className="mx-1 h-5 w-px bg-border" />
    <div role="group" aria-label="Text alignment" className="flex items-center gap-1">
      <ActionButtons actions={alignmentActions} activeFormats={activeFormats} onCommand={onCommand} />
    </div>
  </div>
);
