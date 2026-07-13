import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "URIZEN Skill — the fund, as an API",
  description:
    "A headless skill: read the fund's live book and buy $URI on Robinhood Chain. No UI — API + manifest only.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
