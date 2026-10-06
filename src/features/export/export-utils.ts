import {
  FALLBACK_FONT_FAMILY,
  FALLBACK_FONT_STACK,
  USER_FONT_FAMILY,
} from "@/features/font-builder/constants";
import type { EditorSettings } from "@/features/font-builder/types";

export type FontExportFormat = "otf" | "css";
export type WritingExportFormat = "png" | "pdf";

export type WritingExportData = {
  html: string;
  settings: EditorSettings;
  fontFamily?: string;
  fontBuffer?: ArrayBuffer;
};

const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

const FALLBACK_FACE_CSS = `@font-face {
  font-family: "${FALLBACK_FONT_FAMILY}";
  src: local("Arial"), local("Helvetica Neue"), local("Helvetica"), local("Roboto"), local("Segoe UI"), local("Liberation Sans");
  size-adjust: 83.8%;
}`;

const normalizeFileName = (value: string, fallback: string) => {
  const normalized = value.trim().replace(/[^a-zA-Z0-9-_ ]/g, "").replace(/\s+/g, "-");
  return normalized || fallback;
};

const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let index = 0; index < bytes.length; index += 8192) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 8192));
  }
  return window.btoa(binary);
};

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

export const exportFont = (buffer: ArrayBuffer, name: string, format: FontExportFormat) => {
  const fileName = normalizeFileName(name, "my-hand-font");
  if (format === "otf") {
    downloadBlob(new Blob([buffer], { type: "font/otf" }), `${fileName}.otf`);
    return;
  }

  const familyName = name.trim().replace(/["'\\]/g, "") || "My Hand Font";
  const encodedFont = arrayBufferToBase64(buffer);
  const css = `@font-face {\n  font-family: "${familyName}";\n  src: url("data:font/otf;base64,${encodedFont}") format("opentype");\n  font-style: normal;\n  font-weight: 400;\n  font-display: swap;\n}\n\n${FALLBACK_FACE_CSS}\n\n/* The font file cannot contain fallback glyphs. Keep this stack in your app. */\n.your-text {\n  font-family: "${familyName}", "${FALLBACK_FONT_FAMILY}", sans-serif;\n}\n`;
  downloadBlob(new Blob([css], { type: "text/css;charset=utf-8" }), `${fileName}.css`);
};

const createWritingSurface = ({ html, settings, fontFamily }: WritingExportData) => {
  const surface = document.createElement("div");
  surface.innerHTML = html;
  surface.setAttribute("aria-hidden", "true");
  surface.setAttribute("data-writing-surface", "");
  Object.assign(surface.style, {
    position: "fixed",
    top: "0",
    left: "0",
    zIndex: "-1",
    width: `${A4_WIDTH_PX}px`,
    height: `${A4_HEIGHT_PX}px`,
    boxSizing: "border-box",
    padding: "48px",
    overflow: "hidden",
    overflowWrap: "anywhere",
    background: "#ffffff",
    color: settings.color,
    fontFamily: fontFamily
      ? `"${USER_FONT_FAMILY}", ${FALLBACK_FONT_STACK}`
      : FALLBACK_FONT_STACK,
    fontSize: `${settings.fontSize}px`,
    letterSpacing: `${settings.letterSpacing}em`,
    lineHeight: String(settings.lineHeight),
    wordSpacing: `${settings.wordSpacing}em`,
  });
  surface.querySelectorAll("ul").forEach((list) => {
    list.style.listStyleType = "disc";
    list.style.paddingInlineStart = "2rem";
  });
  surface.querySelectorAll("ol").forEach((list) => {
    list.style.listStyleType = "decimal";
    list.style.paddingInlineStart = "2rem";
  });
  document.body.append(surface);
  return surface;
};

export const exportWriting = async (
  data: WritingExportData,
  name: string,
  format: WritingExportFormat,
) => {
  const surface = createWritingSurface(data);
  try {
    await document.fonts.ready;
    const { toPng } = await import("html-to-image");
    const width = A4_WIDTH_PX;
    const height = A4_HEIGHT_PX;
    const fontEmbedCSS = data.fontBuffer && data.fontFamily
      ? `@font-face { font-family: "${USER_FONT_FAMILY}"; src: url("data:font/otf;base64,${arrayBufferToBase64(data.fontBuffer)}") format("opentype"); }\n${FALLBACK_FACE_CSS}`
      : FALLBACK_FACE_CSS;
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    const image = await toPng(surface, {
      backgroundColor: "#ffffff",
      cacheBust: true,
      fontEmbedCSS,
      height,
      pixelRatio: 2,
      width,
    });
    const fileName = normalizeFileName(name, "my-writing");

    if (format === "png") {
      const response = await fetch(image);
      downloadBlob(await response.blob(), `${fileName}.png`);
      return;
    }

    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    pdf.addImage(image, "PNG", 0, 0, 210, 297);
    pdf.save(`${fileName}.pdf`);
  } finally {
    surface.remove();
  }
};
