import Image from "next/image";
import Link from "next/link";
import { AuthControls } from "@/features/auth/auth-controls";
import { ThemeTabs } from "@/features/theme/theme-tabs";

type WorkspaceNavbarProps = { saveStatus?: string };

export const WorkspaceNavbar = ({ saveStatus }: WorkspaceNavbarProps) => {
  return (
    <header className="absolute inset-x-3 top-3 z-40 mx-auto max-w-6xl rounded-full bg-border/60 shadow-xs backdrop-blur-md sm:inset-x-4">
      <nav
        aria-label="Workspace navigation"
        className="flex h-12 w-full items-center gap-3 px-3"
      >
        <Link href="/" className="flex items-center gap-2 rounded-md text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2">
          <Image
            src="/logo.png"
            alt=""
            width={24}
            height={24}
            className="size-6 rounded-md outline -outline-offset-1 outline-black/10 dark:outline-white/10"
            priority
          />
          <span className="hidden min-[23rem]:inline">make my font</span>
        </Link>
        <div className="ml-auto flex items-center gap-1">
          {saveStatus ? (
            <span role="status" className="hidden text-xs text-muted-foreground sm:inline">
              {saveStatus}
            </span>
          ) : null}
          <AuthControls />
          <ThemeTabs />
        </div>
      </nav>
    </header>
  );
};
