"use client";

import { Laptop, Moon, Sun, type LucideIcon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/utils/helpers";
import { useTheme, type Theme } from "./theme-provider";

const themeOptions: readonly {
  value: Theme;
  label: string;
  icon: LucideIcon;
}[] = [
  { value: "system", label: "System", icon: Laptop },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
];

export const ThemeTabs = ({ className }: { className?: string }) => {
  const { theme, setTheme } = useTheme();

  return (
    <Tabs
      value={theme}
      onValueChange={(value) => setTheme(value as Theme)}
      className={cn("block", className)}
    >
      <TabsList
        aria-label="Color theme"
        className="h-9 bg-background/70 p-1 shadow-sm"
      >
        {themeOptions.map(({ value, label, icon: Icon }) => (
          <TabsTrigger
            key={value}
            value={value}
            aria-label={label}
            className="aspect-square gap-1.5 w-8! cursor-pointer outline-none! data-active:bg-muted"
          >
            <Icon aria-hidden="true" className="size-3.5" strokeWidth={2} />
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};
