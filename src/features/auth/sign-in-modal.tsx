"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { MorphingModal } from "@/components/motion/morphing-modal";
import { Button } from "@/components/ui/button";
import { authClient } from "./auth-client";
import { SignInCodeForm, SignInDetailsForm } from "./sign-in-forms";
import { useSignInModalFocus } from "./use-sign-in-modal-focus";
import Image from "next/image";

type SignInModalProps = {
  open: boolean;
  step: SignInStep;
  onClose: () => void;
  onStepChange: (step: SignInStep) => void;
  onSignedIn: () => void;
};

export type SignInStep = "email" | "code";

const EMAIL_STORAGE_KEY = "sign-in-email";

const getSavedEmail = () =>
  typeof window === "undefined"
    ? ""
    : window.sessionStorage.getItem(EMAIL_STORAGE_KEY) ?? "";

const readableError = (code?: string) => {
  if (code === "INVALID_OTP")
    return "Enter the most recent code sent to your email.";
  if (code === "OTP_EXPIRED")
    return "This code has expired. Request a new code.";
  if (code === "TOO_MANY_ATTEMPTS")
    return "Too many attempts. Request a new code.";
  return "Unable to sign in. Check your details and try again.";
};

export const SignInModal = ({
  open,
  step,
  onClose,
  onStepChange,
  onSignedIn,
}: SignInModalProps) => {
  const [email, setEmail] = useState(getSavedEmail);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);

  const trapFocus = useSignInModalFocus({ dialogRef, onClose, open, step });

  useEffect(() => {
    if (!cooldown) return;
    const timer = window.setInterval(
      () => setCooldown((value) => Math.max(0, value - 1)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const sendCode = async (event?: FormEvent) => {
    event?.preventDefault();
    setError("");
    if (!email.trim()) return setError("Enter your email address.");
    setPending(true);
    const result = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "sign-in",
    });
    setPending(false);
    if (result.error) return setError(readableError(result.error.code));
    window.sessionStorage.setItem(EMAIL_STORAGE_KEY, email.trim());
    onStepChange("code");
    setCooldown(30);
  };

  const verifyCode = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (code.length !== 6) return setError("Enter the six-digit code.");
    setPending(true);
    const result = await authClient.signIn.emailOtp({
      email,
      otp: code,
    });
    setPending(false);
    if (result.error) return setError(readableError(result.error.code));
    window.sessionStorage.removeItem(EMAIL_STORAGE_KEY);
    onSignedIn();
  };

  const signInWithGoogle = async () => {
    setError("");
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  };

  const changeEmail = (value: string) => {
    setEmail(value);
    if (error) setError("");
  };

  const changeCode = (value: string) => {
    setCode(value);
    if (error) setError("");
  };

  return (
    <MorphingModal
      viewId={open ? step : null}
      onClose={onClose}
      placement="center"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sign-in-title"
        aria-describedby="sign-in-description"
        onKeyDown={trapFocus}
      >
        <h2 id="sign-in-title" className="sr-only">Sign in</h2>
        <div className="flex items-start justify-end">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close sign-in"
            onClick={onClose}
          >
            <HugeiconsIcon aria-hidden="true" icon={Cancel01Icon} />
          </Button>
        </div>
        <div className="min-w-0 flex-1 mb-4 space-y-1.5 text-center ">
          <Image
            src="/logo.png"
            alt=""
            width={44}
            height={44}
            className="size-11 mx-auto rounded-md"
            priority
          />
          <p
            id="sign-in-description"
            className={`text-sm text-muted-foreground ${step === "email" ? "hidden" : ""}`}
          >
            {step === "email"
              ? "Sign in to keep your fonts available across devices."
              : `We sent a six-digit code to ${email}.`}
          </p>
        </div>

        {step === "email" ? (
          <SignInDetailsForm
            error={error}
            email={email}
            pending={pending}
            onEmailChange={changeEmail}
            onGoogleSignIn={signInWithGoogle}
            onSubmit={sendCode}
          />
        ) : (
          <SignInCodeForm
            code={code}
            cooldown={cooldown}
            error={error}
            pending={pending}
            onBack={() => {
              onStepChange("email");
              setError("");
            }}
            onCodeChange={changeCode}
            onResend={() => sendCode()}
            onSubmit={verifyCode}
          />
        )}

        <p
          id="auth-error"
          role="alert"
          className="mt-3 min-h-5 text-sm text-destructive"
        >
          {error}
        </p>
        <p className="mt-3 justify-center flex gap-3 text-xs text-muted-foreground">
          <Link href="/terms" className="underline underline-offset-2">
            Terms of Service
          </Link>
          <Link href="/privacy" className="underline underline-offset-2">
            Privacy Policy
          </Link>
        </p>
      </div>
    </MorphingModal>
  );
};
