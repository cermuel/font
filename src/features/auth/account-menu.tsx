"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover } from "@/components/ui/popover";
import { authClient } from "./auth-client";

type AccountUser = {
  name: string;
  email: string;
  image?: string | null;
};

type AccountMenuProps = {
  user: AccountUser;
  onProfileUpdated: () => void;
  onSignOut: () => void;
};

const initials = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

export const AccountMenu = ({
  user,
  onProfileUpdated,
  onSignOut,
}: AccountMenuProps) => {
  const [name, setName] = useState(user.name);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const displayName = user.name.trim() || "Profile";
  const avatarText = initials(user.name || user.email);

  const saveName = async (event: FormEvent) => {
    event.preventDefault();
    const nextName = name.trim();
    setError("");
    if (!nextName) return setError("Enter your name.");
    setPending(true);
    const result = await authClient.updateUser({ name: nextName });
    setPending(false);
    if (result.error) return setError("Unable to save your name. Try again.");
    onProfileUpdated();
  };

  return (
    <Popover
      trigger={
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Open account menu for ${user.name || user.email}`}
        >
          <span
            aria-hidden="true"
            className="flex size-7 items-center justify-center rounded-full bg-primary bg-cover bg-center text-xs font-semibold text-primary-foreground"
            style={user.image ? { backgroundImage: `url(${user.image})` } : undefined}
          >
            {user.image ? null : avatarText}
          </span>
        </Button>
      }
      contentProps={{ align: "end", className: "w-64" }}
      content={
        <div className="flex flex-col gap-2">
          <div className="px-2 py-1">
            <p className="truncate font-medium">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <form className="space-y-2 px-2" onSubmit={saveName}>
            <Label htmlFor="account-name">Name</Label>
            <Input
              id="account-name"
              name="name"
              autoComplete="name"
              placeholder="Your name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "account-name-error" : undefined}
            />
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "Saving…" : "Save name"}
            </Button>
            {error ? (
              <p id="account-name-error" role="alert" className="text-xs text-destructive">
                {error}
              </p>
            ) : null}
          </form>
          <Button asChild variant="ghost" className="justify-start">
            <Link href="/fonts">My fonts</Link>
          </Button>
          <Button type="button" variant="ghost" className="justify-start" onClick={onSignOut}>
            Sign out
          </Button>
        </div>
      }
    />
  );
};
