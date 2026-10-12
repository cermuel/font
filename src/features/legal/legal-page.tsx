import Link from "next/link";
import { WorkspaceNavbar } from "@/components/shared/workspace-navbar";
import { legalConfig } from "./legal-config";

type LegalSection = Readonly<{ title: string; paragraphs: readonly string[] }>;
type LegalPageProps = {
  title: string;
  introduction: string;
  sections: readonly LegalSection[];
};

export const LegalPage = ({ title, introduction, sections }: LegalPageProps) => (
  <div className="min-h-dvh bg-background">
    <WorkspaceNavbar />
    <main id="main-content" className="mx-auto max-w-3xl px-5 pb-20 pt-24 sm:px-8">
      <div className="mb-10 border-b pb-8">
        <p className="text-sm font-medium text-muted-foreground">Legal draft</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-4 leading-7 text-muted-foreground">{introduction}</p>
        <p className="mt-4 text-sm text-muted-foreground">
          Effective <time dateTime="2026-10-12">{legalConfig.effectiveDate}</time>
        </p>
      </div>
      <div className="space-y-10">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-xl font-semibold">{section.title}</h2>
            <div className="mt-3 space-y-3 leading-7 text-muted-foreground">
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </section>
        ))}
      </div>
      <footer className="mt-14 flex flex-wrap gap-4 border-t pt-6 text-sm">
        <Link href="/" className="underline underline-offset-4">Open the font builder</Link>
        <Link href="/terms" className="underline underline-offset-4">Terms of Service</Link>
        <Link href="/privacy" className="underline underline-offset-4">Privacy Policy</Link>
      </footer>
    </main>
  </div>
);
