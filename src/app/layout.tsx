import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Font Builder",
  description: "Create a personal font and use it to write.",
};

const RootLayout = ({ children }: LayoutProps<"/">) => {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
};

export default RootLayout;
