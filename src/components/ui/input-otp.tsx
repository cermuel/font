"use client";

import { useId, useState, type ChangeEvent } from "react";
import { cn } from "@/utils/helpers";

type InputOtpProps = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  label: string;
  error?: boolean;
  describedBy?: string;
  disabled?: boolean;
  className?: string;
};

export const InputOtp = ({
  value,
  onChange,
  length = 6,
  label,
  error = false,
  describedBy,
  disabled = false,
  className,
}: InputOtpProps) => {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const digits = value.replace(/\D/g, "").slice(0, length);
  const activeIndex = Math.min(digits.length, length - 1);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value.replace(/\D/g, "").slice(0, length));
  };

  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name="code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          value={digits}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          aria-label={label}
          aria-invalid={error}
          aria-describedby={describedBy}
          disabled={disabled}
          className="absolute inset-0 z-10 size-full cursor-text opacity-0 disabled:cursor-not-allowed"
        />
        <div aria-hidden="true" className="grid grid-cols-6 gap-2">
          {Array.from({ length }, (_, index) => (
            <div
              key={index}
              className={cn(
                "grid h-12 min-w-0 place-items-center rounded-xl border bg-background text-lg font-semibold tabular-nums transition-colors",
                error ? "border-destructive" : "border-input",
                focused && index === activeIndex &&
                  "border-ring ring-[3px] ring-ring/20",
                disabled && "opacity-50",
              )}
            >
              {digits[index] ?? ""}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
