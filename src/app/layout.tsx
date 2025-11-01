import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import BackgroundAnimation from "../components/BackgroundAnimation";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chen Sopheakdey · Full-Stack Engineer",
  description:
    "Cutting-edge 2025 portfolio with Next.js, animations, PWA, and backend APIs.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} antialiased bg-background text-foreground`}>
        {/* Global background animation (respects prefers-reduced-motion) */}
        <div id="background-animation-root" aria-hidden="true">
          {/* Slightly reduced intensity to keep content readable */}
          <BackgroundAnimation speed={1.0} intensity={0.4} />
        </div>
        {/* Contrast scrim layered above background to ensure WCAG readability */}
        <div className="content-scrim" aria-hidden="true" />
        {/* Ensure content sits above the background canvas */}
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
