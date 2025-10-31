import Image from "next/image";
import ThemeToggle from "../../components/ThemeToggle";

// A dedicated Resume page that presents a professional two‑column layout:
// - Left: photo showcase card (uses Next/Image for high‑quality rendering)
// - Right: embedded PDF viewer of the CV with controls (open/download)
// The PDF file lives in /public and is served statically by Next.js.
// Spaces in the filename are URL‑encoded to ensure correct rendering.

const CV_URL = "/Chen%20Sopheakdey%20Resume_241007_130626.pdf";

export default function ResumePage() {
  return (
    <div className="min-h-screen font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="font-display text-xl font-semibold">SC</div>
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="text-sm opacity-80 hover:opacity-100 transition-opacity"
          >
            Home
          </a>
          <ThemeToggle />
        </div>
      </header>

      {/* Main layout */}
      <main className="max-w-6xl mx-auto px-6 pb-12">
        <h1 className="text-2xl md:text-3xl font-semibold mb-6">Resume</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Photo showcase */}
          <section aria-label="Photo" className="rounded-xl border bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-900 dark:to-neutral-800 shadow-sm overflow-hidden">
            <div className="p-4 md:p-6">
              <h2 className="text-lg font-medium mb-3">Profile Photo</h2>
              <p className="text-sm opacity-80 mb-4">
                This portrait is used across your portfolio and resume. For best results,
                provide a high‑resolution image in web/public/photos/ (e.g., profile-1.jpg).
              </p>
              <div className="relative aspect-[4/5] w-full rounded-lg overflow-hidden">
                {/* If the photo is not present yet, Next/Image will show a broken image icon.
                   That's acceptable during setup; replace src below with your actual file name.
                 */}
                <Image
                  src="/photo_2025-10-31%2012.07.38.jpeg"
                  alt="Portrait photo (Oct 31, 2025)"
                  fill
                  className="object-cover"
                  priority
                  quality={95}
                />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="relative aspect-square rounded-md overflow-hidden">
                  <Image
                    src="/dji_mimo_20250413_124142_0_1744526982036_photo.jpg"
                    alt="Secondary portrait (DJI Mimo)"
                    fill
                    className="object-cover"
                    quality={95}
                  />
                </div>
                <div className="rounded-md border p-3 text-xs opacity-80">
                  Tips for a professional look:
                  <ul className="list-disc ml-4 mt-2 space-y-1">
                    <li>Neutral background, good lighting</li>
                    <li>Centered framing, minimal distractions</li>
                    <li>Export at least 1200px on the shortest side</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* CV PDF viewer */}
          <section aria-label="CV" className="rounded-xl border shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-4 md:p-6">
              <h2 className="text-lg font-medium">Curriculum Vitae</h2>
              <div className="flex items-center gap-2">
                <a
                  href={CV_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm px-3 py-1.5 rounded-md border hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  Open in new tab
                </a>
                <a
                  href={CV_URL}
                  download
                  className="text-sm px-3 py-1.5 rounded-md bg-black text-white dark:bg-white dark:text-black"
                >
                  Download PDF
                </a>
              </div>
            </div>
            {/* Embedded PDF: leverage the browser's native high‑quality renderer for crisp text */}
            <div className="h-[70vh] md:h-[76vh]">
              <object data={CV_URL} type="application/pdf" className="w-full h-full">
                <p className="p-4 text-sm">
                  Your browser can’t display the PDF inline. You can
                  <a className="underline ml-1" href={CV_URL} target="_blank" rel="noreferrer">open it in a new tab</a>
                  or use the download button above.
                </p>
              </object>
            </div>
          </section>
        </div>
      </main>

      <footer className="px-6 py-8 text-xs opacity-70">© {new Date().getFullYear()} Sopheakdey Chen</footer>
    </div>
  );
}