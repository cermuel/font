import { redirect } from "next/navigation";
import { WorkspaceNavbar } from "@/components/shared/workspace-navbar";
import { getSession } from "@/features/auth/server/session";
import { FontLibrary } from "@/features/font-library/font-library";
import { listFonts } from "@/features/font-library/font-service";

const FontsPage = async () => {
  const session = await getSession();
  if (!session) redirect("/?signIn=1");
  const fonts = await listFonts(session.user.id);
  return (
    <div className="min-h-dvh bg-background">
      <WorkspaceNavbar />
      <FontLibrary initialFonts={fonts} />
    </div>
  );
};

export default FontsPage;
