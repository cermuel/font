import type { FormEvent } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type DetailsFormProps = {
  error: string;
  email: string;
  pending: boolean;
  onEmailChange: (value: string) => void;
  onGoogleSignIn: () => void;
  onSubmit: (event: FormEvent) => void;
};

export const SignInDetailsForm = ({
  error,
  email,
  pending,
  onEmailChange,
  onGoogleSignIn,
  onSubmit,
}: DetailsFormProps) => (
  <form className="space-y-4" onSubmit={onSubmit}>
    <Button
      type="button"
      className="h-10 w-full"
      onClick={onGoogleSignIn}
    >
      <Image src="/google-logo.svg" alt="" width={16} height={16} />
      Continue with Google
    </Button>
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <span className="h-px flex-1 bg-border" />
      <span>OR</span>
      <span className="h-px flex-1 bg-border" />
    </div>
    <div className="space-y-2">
      <Label htmlFor="auth-email">Email</Label>
      <Input
        id="auth-email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="name@example.com"
        value={email}
        onChange={(event) => onEmailChange(event.target.value)}
        aria-describedby={error ? "auth-error" : undefined}
      />
    </div>
    <Button type="submit" className="h-10 w-full" disabled={pending}>
      {pending ? "Sending code…" : "Continue"}
    </Button>
  </form>
);

type CodeFormProps = {
  code: string;
  cooldown: number;
  error: string;
  pending: boolean;
  onBack: () => void;
  onCodeChange: (value: string) => void;
  onResend: () => void;
  onSubmit: (event: FormEvent) => void;
};

export const SignInCodeForm = ({
  code,
  cooldown,
  error,
  pending,
  onBack,
  onCodeChange,
  onResend,
  onSubmit,
}: CodeFormProps) => (
  <form className="space-y-4" onSubmit={onSubmit}>
    <div className="space-y-2">
      <Label htmlFor="auth-code">Sign-in code</Label>
      <Input
        id="auth-code"
        name="code"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        pattern="[0-9]{6}"
        placeholder="123456"
        value={code}
        onChange={(event) =>
          onCodeChange(event.target.value.replace(/\D/g, ""))
        }
        aria-invalid={Boolean(error)}
        aria-describedby={error ? "auth-error" : undefined}
      />
    </div>
    <Button type="submit" className="h-10 w-full" disabled={pending}>
      {pending ? "Signing in…" : "Verify and sign in"}
    </Button>
    <div className="flex items-center justify-between">
      <Button type="button" variant="ghost" onClick={onBack}>
        Back
      </Button>
      <Button
        type="button"
        variant="ghost"
        disabled={cooldown > 0 || pending}
        onClick={onResend}
      >
        {cooldown ? `Resend in ${cooldown}s` : "Resend code"}
      </Button>
    </div>
  </form>
);
