"use client";

import { useEffect, useRef, useState } from "react";
import { WorkspaceNavbar } from "@/components/shared/workspace-navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExportBar } from "@/features/export/export-bar";
import { GlyphEditorSection } from "@/features/glyph-editor/glyph-editor-section";
import { WritingEditorSection } from "@/features/writing-editor/writing-editor-section";
import { CHARACTERS, USER_FONT_FAMILY } from "./constants";
import { buildFontBuffer } from "./font-engine";
import { createProject, loadProject, saveProject } from "./project-storage";
import type { FontProject, Stroke } from "./types";

type FontBuilderWorkspaceProps = {
  initialProject?: FontProject;
  localPersistence?: boolean;
  onProjectChange?: (project: FontProject) => void;
  saveStatus?: string;
};

export const FontBuilderWorkspace = ({
  initialProject,
  localPersistence = true,
  onProjectChange,
  saveStatus,
}: FontBuilderWorkspaceProps) => {
  const [activeTab, setActiveTab] = useState<"build" | "write">("build");
  const [project, setProject] = useState<FontProject>(() => initialProject ?? createProject());
  const [activeCharacter, setActiveCharacter] = useState(CHARACTERS[0]);
  const [fontFamily, setFontFamily] = useState<string>();
  const [fontBuffer, setFontBuffer] = useState<ArrayBuffer>();
  const [hydrated, setHydrated] = useState(false);
  const fontFaceRef = useRef<FontFace | undefined>(undefined);
  const fontRevisionRef = useRef(0);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (localPersistence) setProject(loadProject());
      setHydrated(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [localPersistence]);

  useEffect(() => {
    if (!hydrated) return;
    if (localPersistence) saveProject(project);
    onProjectChange?.(project);
  }, [hydrated, localPersistence, onProjectChange, project]);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      const buffer = buildFontBuffer(project.glyphs);
      if (!buffer) {
        setFontBuffer(undefined);
        setFontFamily(undefined);
        return;
      }

      setFontBuffer(buffer);
      fontRevisionRef.current += 1;
      const familyName = `${USER_FONT_FAMILY}-${fontRevisionRef.current}`;
      const fontFace = new FontFace(familyName, buffer);
      await fontFace.load();
      if (cancelled) return;
      if (fontFaceRef.current) document.fonts.delete(fontFaceRef.current);
      document.fonts.add(fontFace);
      fontFaceRef.current = fontFace;
      setFontFamily(familyName);
    }, 180);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [project.glyphs]);

  useEffect(() => {
    return () => {
      if (fontFaceRef.current) document.fonts.delete(fontFaceRef.current);
    };
  }, []);

  const updateProject = (changes: Partial<FontProject>) => {
    setProject((current) => ({
      ...current,
      ...changes,
      updatedAt: new Date().toISOString(),
    }));
  };

  const updateStrokes = (strokes: readonly Stroke[]) => {
    setProject((current) => {
      const glyphs = { ...current.glyphs };
      if (strokes.length) {
        glyphs[activeCharacter] = {
          character: activeCharacter,
          strokes,
          updatedAt: new Date().toISOString(),
        };
      } else {
        delete glyphs[activeCharacter];
      }
      return { ...current, glyphs, updatedAt: new Date().toISOString() };
    });
  };

  return (
    <div className="relative flex h-dvh w-dvw flex-col overflow-hidden bg-background">
      <a
        href="#main-content"
        className="fixed left-3 top-2 z-50 -translate-y-16 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground focus:translate-y-0"
      >
        Skip to content
      </a>
      <WorkspaceNavbar saveStatus={saveStatus} />
      <main id="main-content" className="min-h-0 flex-1 overflow-hidden">
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            if (value === "build" || value === "write") setActiveTab(value);
          }}
          className="h-full min-h-0 overflow-hidden px-4 pt-20 sm:px-6"
        >
          <TabsList
            variant="default"
            aria-label="Workspace view"
            className="mx-auto mb-4 shrink-0"
          >
            <TabsTrigger value="build" className="min-w-20">
              Build
            </TabsTrigger>
            <TabsTrigger value="write" className="min-w-20">
              Write
            </TabsTrigger>
          </TabsList>
          <TabsContent value="build" className="min-h-0 overflow-hidden">
            <GlyphEditorSection
              activeCharacter={activeCharacter}
              fontFamily={fontFamily}
              glyphs={project.glyphs}
              onCharacterChange={setActiveCharacter}
              onStrokesChange={updateStrokes}
            />
          </TabsContent>
          <TabsContent value="write" className="min-h-0 overflow-hidden">
            <WritingEditorSection
              value={project.writing}
              settings={project.editor}
              fontFamily={fontFamily}
              onFontSizeChange={(fontSize) =>
                updateProject({
                  editor: { ...project.editor, fontSize },
                })
              }
              onValueChange={(writing) => updateProject({ writing })}
            />
          </TabsContent>
        </Tabs>
      </main>
      {activeTab === "write" ? (
        <ExportBar
          fontBuffer={fontBuffer}
          fontFamily={fontFamily}
          projectName={project.name}
          writing={project.writing}
          settings={project.editor}
        />
      ) : null}
    </div>
  );
};
