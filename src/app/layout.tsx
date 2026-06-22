import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "nest-nexus :: auth harness",
  description: "Frontend test harness for nest-nexus auth methods",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <div className="crt-vignette" />
        <div className="crt-overlay" />
        <div className="crt-grain" />
        <header className="border-b px-6 py-3 flex items-center justify-between text-xs uppercase tracking-[0.2em]">
          <Link href="/" className="flex items-center gap-2 text-[var(--accent)] hover:opacity-80">
            <span>nest-nexus</span>
            <span className="text-[var(--fg-dim)]">::</span>
            <span className="text-[var(--fg)]">auth_harness</span>
          </Link>
          <span className="text-[var(--fg-dim)] blink-caret">root@localhost</span>
        </header>
        {children}
      </body>
    </html>
  );
}
