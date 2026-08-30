import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CodeNexus",
  description: "Competitive Programming Social Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">{children}</body>
    </html>
  );
}
