import Image from "next/image";
import { ThemeTabs } from "@/features/theme/theme-tabs";

export const WorkspaceNavbar = () => {
  return (
    <header className="absolute inset-x-3 top-3 z-40 mx-auto max-w-6xl rounded-full  bg-border/60  shadow-xs backdrop-blur-md  sm:inset-x-4">
      <nav
        aria-label="Workspace navigation"
        className="flex h-12 w-full items-center gap-3 px-3"
      >
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Image
            src="/logo.png"
            alt=""
            width={24}
            height={24}
            className="size-6 rounded-md outline -outline-offset-1 outline-black/10 dark:outline-white/10"
            priority
          />
          make my font
        </div>
        <ThemeTabs className="ml-auto" />
      </nav>
    </header>
  );
};
