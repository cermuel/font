import {
  useEffect,
  type KeyboardEvent,
  type RefObject,
} from "react";

type SignInModalFocusOptions = {
  dialogRef: RefObject<HTMLDivElement | null>;
  onClose: () => void;
  open: boolean;
  step: string;
};

export const useSignInModalFocus = ({
  dialogRef,
  onClose,
  open,
  step,
}: SignInModalFocusOptions) => {
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() =>
      dialogRef.current?.querySelector<HTMLElement>("input")?.focus(),
    );
    return () => window.clearTimeout(timer);
  }, [dialogRef, open, step]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose, open]);

  return (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;
    const focusable = [
      ...(dialogRef.current?.querySelectorAll<HTMLElement>(
        "button:not(:disabled), a[href], input:not(:disabled)",
      ) ?? []),
    ];
    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
};
