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
  metadataBase: new URL("https://chensopheakdey.com"),
  title: {
    default: "Chen Sopheakdey · Full-Stack Engineer",
    template: "%s | Chen Sopheakdey",
  },
  description:
    "Full-stack engineer with 10+ years experience building scalable web & mobile apps using Next.js, React, Node.js, FastAPI, Flutter, MongoDB. Specialized in e-commerce, HR systems, and real-time infrastructure.",
  keywords: [
    "Chen Sopheakdey",
    "Full-Stack Engineer",
    "Next.js Developer",
    "React Developer",
    "Node.js Developer",
    "FastAPI",
    "Flutter Developer",
    "MongoDB",
    "PostgreSQL",
    "Cambodia Software Engineer",
    "TypeScript",
    "Web Development",
    "Mobile Development",
    "E-commerce Platform",
    "HR Management System",
  ],
  authors: [{ name: "Chen Sopheakdey", url: "https://chensopheakdey.com" }],
  creator: "Chen Sopheakdey",
  publisher: "Chen Sopheakdey",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://chensopheakdey.com",
    title: "Chen Sopheakdey · Full-Stack Engineer",
    description:
      "10+ years crafting scalable web & mobile applications. Next.js, React, Node.js, FastAPI, Flutter. Focus on performance and modern architectures.",
    siteName: "Chen Sopheakdey Portfolio",
    images: [
      {
        url: "/photo_2025-10-31 12.07.38.jpeg",
        width: 1200,
        height: 630,
        alt: "Chen Sopheakdey - Full-Stack Engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chen Sopheakdey · Full-Stack Engineer",
    description:
      "10+ years crafting scalable web & mobile applications. Next.js, React, Node.js, FastAPI, Flutter.",
    images: ["/photo_2025-10-31 12.07.38.jpeg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Chen Sopheakdey",
    alternateName: "ជិន សុភក្តី",
    url: "https://chensopheakdey.com",
    image: "https://chensopheakdey.com/photo_2025-10-31 12.07.38.jpeg",
    jobTitle: "Full-Stack Engineer",
    description:
      "Full-stack engineer with 10+ years experience building scalable web & mobile applications using Next.js, React, Node.js, FastAPI, Flutter, MongoDB.",
    knowsAbout: [
      "Next.js",
      "React",
      "Node.js",
      "TypeScript",
      "FastAPI",
      "Flutter",
      "MongoDB",
      "PostgreSQL",
      "WebSocket",
      "E-commerce Development",
      "HR Management Systems",
    ],
    sameAs: [
      // Add your social profiles here if available
      // "https://github.com/yourusername",
      // "https://linkedin.com/in/yourusername",
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
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
