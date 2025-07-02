import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Palestinian Kufiya Store",
  description:
    "Authentic Palestinian Kufiya - Traditional handmade cultural heritage",
  icons: {
    icon: [
      { url: "/images/palestine-flag.png", sizes: "32x32", type: "image/png" },
      { url: "/images/palestine-flag.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/images/palestine-flag.png",
    shortcut: "/images/palestine-flag.png",
  },
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      </body>
    </html>
  );
}
