import type { EditorFontSize } from "@/features/font-builder/types";

const contentBlockSelector = "div, p, li, blockquote, h1, h2, h3, h4, h5, h6";
const rootBlockSelector = `${contentBlockSelector}, ul, ol`;

const wrapRootInlineContent = (editor: HTMLDivElement, range: Range) => {
  let wrapper: HTMLDivElement | null = null;
  const selectedNodes = new Set(
    [...editor.childNodes].filter((node) => range.intersectsNode(node)),
  );
  const selectedWrappers = new Set<HTMLElement>();

  [...editor.childNodes].forEach((node) => {
    if (node instanceof HTMLElement && node.matches(rootBlockSelector)) {
      wrapper = null;
      return;
    }

    if (!wrapper) {
      wrapper = document.createElement("div");
      editor.insertBefore(wrapper, node);
    }
    wrapper.append(node);
    if (selectedNodes.has(node)) selectedWrappers.add(wrapper);
  });

  return selectedWrappers;
};

const clearNestedFontSizes = (block: HTMLElement) => {
  block.querySelectorAll<HTMLElement>("[style]").forEach((element) => {
    if (!element.style.fontSize) return;
    element.style.removeProperty("font-size");
    if (!element.getAttribute("style")) element.removeAttribute("style");
  });
};

export const applyFontSizeToSelectedBlocks = (
  editor: HTMLDivElement,
  range: Range,
  nextSize: EditorFontSize,
) => {
  const selectedWrappers = wrapRootInlineContent(editor, range);

  const blocks = [...editor.querySelectorAll<HTMLElement>(contentBlockSelector)]
    .filter((block) => !block.querySelector(contentBlockSelector))
    .filter((block) => selectedWrappers.has(block) || range.intersectsNode(block));

  blocks.forEach((block) => {
    clearNestedFontSizes(block);
    block.style.fontSize = `${nextSize}px`;
    if (block.matches("li")) {
      block.style.setProperty("--marker-font-size", `${nextSize}px`);
    }
  });

  return blocks.length > 0;
};
