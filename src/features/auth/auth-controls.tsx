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
import { SignInModal, type SignInStep } from "./sign-in-modal";

const getSignInStep = (): SignInStep =>
  new URLSearchParams(window.location.search).get("signIn") === "code" &&
  window.sessionStorage.getItem("sign-in-email")
    ? "code"
    : "email";

const replaceSignInParam = (step?: SignInStep) => {
  const url = new URL(window.location.href);
  if (step) url.searchParams.set("signIn", step);
  else url.searchParams.delete("signIn");
  window.history.replaceState(window.history.state, "", url);
};

export const AuthControls = () => {
  const { data: session, isPending, refetch } = authClient.useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [signInStep, setSignInStep] = useState<SignInStep>("email");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const migrationStarted = useRef(false);

  useEffect(() => {
    const syncFromUrl = () => {
      const signIn = new URLSearchParams(window.location.search).get("signIn");
      const step = getSignInStep();
      if (signIn === "1" || (signIn === "code" && step === "email")) {
        replaceSignInParam(step);
      }
      setModalOpen(signIn === "1" || signIn === "email" || signIn === "code");
      setSignInStep(step);
    };
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
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
    replaceSignInParam();
    setModalOpen(false);
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  };

  const openModal = () => {
    replaceSignInParam("email");
    setSignInStep("email");
    setModalOpen(true);
  };

  const changeSignInStep = (step: SignInStep) => {
    replaceSignInParam(step);
    setSignInStep(step);
  };

  if (isPending)
    return <div className="h-8 w-24 animate-pulse rounded-lg bg-muted" />;

  if (!session?.user) {
    return (
      <>
        <Button
          ref={triggerRef}
          type="button"
          onClick={openModal}
        >
          Sign in<span className="hidden sm:inline"> to save</span>
        </Button>
        <SignInModal
          open={modalOpen}
          step={signInStep}
          onClose={closeModal}
          onStepChange={changeSignInStep}
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
