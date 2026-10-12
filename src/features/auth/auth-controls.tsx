"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  clearProject,
  isMeaningfulProject,
  loadProject,
  projectToDocument,
} from "@/features/font-builder/project-storage";
import { createCloudFont } from "@/features/font-library/font-api";
import { AccountMenu } from "./account-menu";
import { authClient } from "./auth-client";
import { SignInModal } from "./sign-in-modal";

export const AuthControls = () => {
  const { data: session, isPending, refetch } = authClient.useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const migrationStarted = useRef(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("signIn") !== "1")
      return;
    const timer = window.setTimeout(() => setModalOpen(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!session?.user || pathname !== "/" || migrationStarted.current) return;
    migrationStarted.current = true;
    const migrate = async () => {
      const project = loadProject();
      if (!isMeaningfulProject(project)) {
        router.replace("/fonts");
        router.refresh();
        return;
      }
      try {
        const font = await createCloudFont({
          id: project.id,
          name: project.name,
          document: projectToDocument(project),
        });
        clearProject();
        router.replace(`/fonts/${font.id}`);
        router.refresh();
      } catch {
        migrationStarted.current = false;
      }
    };
    void migrate();
  }, [pathname, router, session?.user]);

  const closeModal = () => {
    setModalOpen(false);
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  };

  if (isPending)
    return <div className="h-8 w-24 animate-pulse rounded-lg bg-muted" />;

  if (!session?.user) {
    return (
      <>
        <Button
          ref={triggerRef}
          type="button"
          onClick={() => setModalOpen(true)}
        >
          Sign in<span className="hidden sm:inline"> to save</span>
        </Button>
        <SignInModal
          open={modalOpen}
          onClose={closeModal}
          onSignedIn={() => {
            closeModal();
            void refetch();
          }}
        />
      </>
    );
  }

  return (
    <AccountMenu
      user={session.user}
      onProfileUpdated={() => void refetch()}
      onSignOut={() =>
        void authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              router.push("/");
              router.refresh();
            },
          },
        })
      }
    />
  );
};
