import { notFound, redirect } from "next/navigation";
import { getSession } from "@/features/auth/server/session";
import { CloudFontWorkspace } from "@/features/font-library/cloud-font-workspace";
import { getFont } from "@/features/font-library/font-service";

type FontPageProps = { params: Promise<{ id: string }> };

const FontPage = async ({ params }: FontPageProps) => {
  const session = await getSession();
  if (!session) redirect("/?signIn=1");
  const { id } = await params;
  const font = await getFont(session.user.id, id);
  if (!font) notFound();
  return <CloudFontWorkspace key={font.id} initialFont={font} userId={session.user.id} />;
};

export default FontPage;
