import type { Metadata } from "next";
import "./globals.css";
import ThemeRegistry from "@/components/ThemeRegistry";

export const metadata: Metadata = {
  title: "Roast Me — Emotional Damage, On Demand",
  description: "Give us your excuse. We'll make you regret saying it.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><ThemeRegistry>{children}</ThemeRegistry></body>
    </html>
  );
}
