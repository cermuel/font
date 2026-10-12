import { NextResponse } from "next/server";

const MAX_BODY_BYTES = 5 * 1024 * 1024;

export const readJsonBody = async (request: Request) => {
  const declaredSize = Number(request.headers.get("content-length") ?? 0);
  if (declaredSize > MAX_BODY_BYTES) return { error: "Font document is larger than 5 MB." };
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) {
    return { error: "Font document is larger than 5 MB." };
  }
  try {
    return { data: JSON.parse(text) as unknown };
  } catch {
    return { error: "Request body must be valid JSON." };
  }
};

export const unauthorized = () => NextResponse.json(
  { error: "Sign in to manage fonts." },
  { status: 401 },
);

export const invalidRequest = (error: string) => NextResponse.json(
  { error },
  { status: 400 },
);
