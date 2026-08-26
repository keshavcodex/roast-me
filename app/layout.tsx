import type { Metadata } from "next";
// TypeScript may not have a declaration for side-effect CSS imports in some setups.
// @ts-expect-error CSS is processed by Next.js at build time.
import "./globals.css";

export const metadata: Metadata = {
  title: "Roast Me — Emotional Damage, On Demand",
  description: "Give us your excuse. We'll make you regret saying it.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1724554567829867"
     crossOrigin="anonymous"></script>
    </html>
  );
}
