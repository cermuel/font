import type { Metadata } from "next";
import { ThemeProvider } from "@/features/theme/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Make My Font",
  description: "Draw your own typeface and use it to write.",
  icons: { icon: "/logo.png", apple: "/logo.png" },
};

const themeScript = `
  try {
    const storedTheme = localStorage.getItem("font-theme");
    const theme = storedTheme === "light" || storedTheme === "dark" ? storedTheme : "system";
    const isDark = theme === "dark" || (theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  } catch {}
`;

const RootLayout = ({ children }: LayoutProps<"/">) => {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
