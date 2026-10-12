import type { FontDocument, FontRecord, FontSummary } from "@/features/font-builder/types";

export class FontApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly payload?: unknown,
  ) {
    super(message);
  }
}

const request = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const payload = response.status === 204 ? null : await response.json() as unknown;
  if (!response.ok) {
    const message = typeof payload === "object" && payload && "error" in payload
      ? String(payload.error)
      : "Unable to update this font.";
    throw new FontApiError(message, response.status, payload);
  }
  return payload as T;
};

export const fetchFonts = async () => (
  await request<{ fonts: FontSummary[] }>("/api/fonts", { cache: "no-store" })
).fonts;

export const fetchFont = async (id: string) => (
  await request<{ font: FontRecord }>(`/api/fonts/${id}`, { cache: "no-store" })
).font;

export const createCloudFont = async (input: {
  id?: string;
  name: string;
  document: FontDocument;
}) => (await request<{ font: FontRecord }>("/api/fonts", {
  method: "POST",
  body: JSON.stringify(input),
})).font;

export const updateCloudFont = async (
  id: string,
  input: { expectedRevision: number; name?: string; document?: FontDocument },
) => (await request<{ font: FontRecord }>(`/api/fonts/${id}`, {
  method: "PATCH",
  body: JSON.stringify(input),
})).font;

export const removeCloudFont = async (id: string) => request<null>(`/api/fonts/${id}`, {
  method: "DELETE",
});
