"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FontProject, FontRecord } from "@/features/font-builder/types";
import { FontBuilderWorkspace } from "@/features/font-builder/font-builder-workspace";
import {
  projectToDocument,
  recordToProject,
  recoveryKey,
} from "@/features/font-builder/project-storage";
import { FontApiError, updateCloudFont } from "./font-api";

type CloudFontWorkspaceProps = { initialFont: FontRecord; userId: string };

const statusLabel = {
  idle: "",
  saving: "Saving…",
  saved: "Saved",
  offline: "Offline — changes kept here",
} as const;

export const CloudFontWorkspace = ({ initialFont, userId }: CloudFontWorkspaceProps) => {
  const key = recoveryKey(userId, initialFont.id);
  const [workspaceKey, setWorkspaceKey] = useState(0);
  const [project, setProject] = useState(() => recordToProject(initialFont));
  const [status, setStatus] = useState<keyof typeof statusLabel>("saved");
  const [ready, setReady] = useState(false);
  const [retry, setRetry] = useState(0);
  const revision = useRef(initialFont.revision);
  const firstChange = useRef(true);

  const onProjectChange = useCallback((next: FontProject) => setProject(next), []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const recovered = JSON.parse(localStorage.getItem(key) ?? "null") as FontProject | null;
        if (recovered) {
          setProject(recovered);
          setStatus("offline");
          setWorkspaceKey(1);
        }
      } catch {
        localStorage.removeItem(key);
      }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [key]);

  useEffect(() => {
    if (!ready) return;
    if (firstChange.current) {
      firstChange.current = false;
      return;
    }
    localStorage.setItem(key, JSON.stringify(project));
    setStatus("saving");
    let retryTimer: number | undefined;
    const timer = window.setTimeout(async () => {
      try {
        const saved = await updateCloudFont(initialFont.id, {
          expectedRevision: revision.current,
          name: project.name,
          document: projectToDocument(project),
        });
        revision.current = saved.revision;
        localStorage.removeItem(key);
        setStatus("saved");
        setRetry(0);
      } catch (error) {
        if (error instanceof FontApiError && error.status === 409) {
          const payload = error.payload as { font?: FontRecord } | undefined;
          if (payload?.font) {
            revision.current = payload.font.revision;
            setRetry((value) => value + 1);
            return;
          }
        }
        setStatus("offline");
        retryTimer = window.setTimeout(
          () => setRetry((value) => value + 1),
          Math.min(30_000, 2 ** Math.min(retry + 1, 5) * 1000),
        );
      }
    }, 750);
    return () => {
      window.clearTimeout(timer);
      if (retryTimer) window.clearTimeout(retryTimer);
    };
  }, [initialFont.id, key, project, ready, retry]);

  useEffect(() => {
    const retryOnline = () => setRetry((value) => value + 1);
    window.addEventListener("online", retryOnline);
    return () => window.removeEventListener("online", retryOnline);
  }, []);

  if (!ready) return <div className="h-dvh bg-background" />;

  return (
    <FontBuilderWorkspace
      key={workspaceKey}
      initialProject={project}
      localPersistence={false}
      onProjectChange={onProjectChange}
      saveStatus={statusLabel[status]}
    />
  );
};
