import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { HalloweenAtmosphere } from "@/components/ui/HalloweenAtmosphere";
import "./globals.css";

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-barlow",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "VELVT — It starts as a thought, ends as a memory",
    template: "%s — VELVT",
  },
  description:
    "VELVT is an event organization focused on creating immersive experiences, bringing communities together, and turning creative ideas into memorable events.",
  keywords: ["VELVT", "events", "experiences", "community", "velvt.in"],
  openGraph: {
    type: "website",
    siteName: "VELVT",
    title: "VELVT — It starts as a thought, ends as a memory",
    description:
      "Curating experiences, building communities, and turning ideas into unforgettable moments.",
  },
  twitter: {
    card: "summary_large_image",
    title: "VELVT — It starts as a thought, ends as a memory",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${barlowCondensed.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col bg-black text-white relative">
        {/* UNTOLDSURI Texture Layers: Film Grain & Scanlines */}
        <div className="film-grain" aria-hidden="true" />
        <div className="scanlines" aria-hidden="true" />

        {/* Interactive Custom Cursor */}
        <CustomCursor />

        {/* Ambient Floating Embers (Halloween Touch) */}
        <HalloweenAtmosphere />

        {/* Floating Pill Glass Navigation */}
        <Navigation />

        {/* Page Content */}
        <main className="flex-1 pt-24">{children}</main>

        <Footer />
      </body>
    </html>
  );
}
