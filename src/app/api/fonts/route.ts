import { NextResponse } from "next/server";
import { createFont, listFonts } from "@/features/font-library/font-service";
import { createFontSchema } from "@/features/font-library/font-validation";
import { invalidRequest, readJsonBody, unauthorized } from "@/features/font-library/http";
import { getSession } from "@/features/auth/server/session";

export const GET = async () => {
  const session = await getSession();
  if (!session) return unauthorized();
  return NextResponse.json({ fonts: await listFonts(session.user.id) });
};

export const POST = async (request: Request) => {
  const session = await getSession();
  if (!session) return unauthorized();
  const body = await readJsonBody(request);
  if (body.error) return invalidRequest(body.error);
  const parsed = createFontSchema.safeParse(body.data);
  if (!parsed.success) return invalidRequest(parsed.error.issues[0]?.message ?? "Invalid font.");
  const font = await createFont(session.user.id, parsed.data);
  return NextResponse.json({ font }, { status: 201 });
};
