import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  List,
  ListOrdered,
  Underline,
} from "lucide-react";
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
  icon: typeof Bold;
}>;

const formatActions: readonly ToolbarAction[] = [
  { command: "bold", label: "Bold", icon: Bold },
  { command: "italic", label: "Italic", icon: Italic },
  { command: "underline", label: "Underline", icon: Underline },
  { command: "insertUnorderedList", label: "Bulleted list", icon: List },
  { command: "insertOrderedList", label: "Numbered list", icon: ListOrdered },
];

const alignmentActions: readonly ToolbarAction[] = [
  { command: "justifyLeft", label: "Align left", icon: AlignLeft },
  { command: "justifyCenter", label: "Align center", icon: AlignCenter },
  { command: "justifyRight", label: "Align right", icon: AlignRight },
  { command: "justifyFull", label: "Justify", icon: AlignJustify },
];

type RichTextToolbarProps = {
  activeFormats: Readonly<Record<RichCommand, boolean>>;
  fontSize: EditorFontSize;
  hasTextSelection: boolean;
  onCommand: (command: RichCommand) => void;
  onFontSizeChange: (value: EditorFontSize) => void;
};

const ActionButtons = ({
  actions,
  activeFormats,
  onCommand,
}: Pick<RichTextToolbarProps, "activeFormats" | "onCommand"> & {
  actions: readonly ToolbarAction[];
}) => actions.map(({ command, icon: Icon, label }) => (
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
    <Icon aria-hidden="true" />
  </Button>
));

export const RichTextToolbar = ({
  activeFormats,
  fontSize,
  hasTextSelection,
  onCommand,
  onFontSizeChange,
}: RichTextToolbarProps) => (
  <div className="flex shrink-0 flex-wrap items-center gap-1 border-b p-2">
    <Select
      disabled={!hasTextSelection}
      value={String(fontSize)}
      onValueChange={(next) => onFontSizeChange(Number(next) as EditorFontSize)}
    >
      <SelectTrigger aria-label="Font size for selected text" className="w-24">
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
