import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteFont, getFont, updateFont } from "@/features/font-library/font-service";
import { updateFontSchema } from "@/features/font-library/font-validation";
import { invalidRequest, readJsonBody, unauthorized } from "@/features/font-library/http";
import { getSession } from "@/features/auth/server/session";

type RouteContext = { params: Promise<{ id: string }> };

const readIdentity = async (context: RouteContext) => {
  const { id } = await context.params;
  return z.uuid().safeParse(id);
};

export const GET = async (_request: Request, context: RouteContext) => {
  const session = await getSession();
  if (!session) return unauthorized();
  const identity = await readIdentity(context);
  if (!identity.success) return NextResponse.json({ error: "Font not found." }, { status: 404 });
  const font = await getFont(session.user.id, identity.data);
  return font
    ? NextResponse.json({ font })
    : NextResponse.json({ error: "Font not found." }, { status: 404 });
};

export const PATCH = async (request: Request, context: RouteContext) => {
  const session = await getSession();
  if (!session) return unauthorized();
  const identity = await readIdentity(context);
  if (!identity.success) return NextResponse.json({ error: "Font not found." }, { status: 404 });
  const body = await readJsonBody(request);
  if (body.error) return invalidRequest(body.error);
  const parsed = updateFontSchema.safeParse(body.data);
  if (!parsed.success) return invalidRequest(parsed.error.issues[0]?.message ?? "Invalid font.");
  const result = await updateFont(session.user.id, identity.data, parsed.data);
  if (result.state === "missing") {
    return NextResponse.json({ error: "Font not found." }, { status: 404 });
  }
  if (result.state === "conflict") {
    return NextResponse.json({ code: "revision_conflict", font: result.font }, { status: 409 });
  }
  return NextResponse.json({ font: result.font });
};

export const DELETE = async (_request: Request, context: RouteContext) => {
  const session = await getSession();
  if (!session) return unauthorized();
  const identity = await readIdentity(context);
  if (!identity.success) return NextResponse.json({ error: "Font not found." }, { status: 404 });
  const deleted = await deleteFont(session.user.id, identity.data);
  return deleted
    ? new NextResponse(null, { status: 204 })
    : NextResponse.json({ error: "Font not found." }, { status: 404 });
};
