"use client";

import { Button } from "@/components/ui/button";

type CloudSaveBannerProps = {
  visible: boolean;
  onReload: () => void;
  onSaveCopy: () => void;
};

export const CloudSaveBanner = ({ visible, onReload, onSaveCopy }: CloudSaveBannerProps) => {
  if (!visible) return null;
  return (
    <div role="alert" className="fixed inset-x-4 top-20 z-50 mx-auto flex max-w-xl flex-wrap items-center gap-2 rounded-xl bg-popover p-3 text-sm shadow-lg ring-1 ring-border">
      <p className="min-w-52 flex-1">
        This font changed elsewhere. Keep your edits as a copy or reload the cloud version.
      </p>
      <Button type="button" variant="outline" onClick={onReload}>Reload cloud</Button>
      <Button type="button" onClick={onSaveCopy}>Save as copy</Button>
    </div>
  );
};
