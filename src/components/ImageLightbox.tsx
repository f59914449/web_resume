"use client";

import Image, { ImageProps } from "next/image";
import { useEffect, useState } from "react";

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

type Props = {
  src: string;
  alt: string;
  containerClassName?: string;
  className?: string;
  /** When true, the thumbnail image will use fill mode inside a relative container */
  fill?: boolean;
  quality?: number;
  priority?: boolean;
  sizes?: string;
  blurDataURL?: string;
};

// A subtle neutral blur placeholder to avoid layout jank before the image loads.
const DEFAULT_BLUR =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMTAwJScgaGVpZ2h0PScxMDAlJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnPjxmaWx0ZXIgaWQ9J2EnPjxmZUVnYXVzc2lhbkJsdXIgc3QgY29sb3I9JyM5OTknLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0nMTAwJScgaGVpZ2h0PScxMDAlJyBmaWx0ZXI9InVybCgjYSk";

export default function ImageLightbox({
  src,
  alt,
  containerClassName,
  className,
  fill = true,
  quality = 95,
  priority,
  sizes,
  blurDataURL = DEFAULT_BLUR,
}: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className={cn("relative", containerClassName)}>
      <Image
        src={src}
        alt={alt}
        {...(fill ? { fill: true } : {})}
        className={cn("cursor-zoom-in", className)}
        quality={quality}
        priority={priority}
        sizes={sizes}
        placeholder="blur"
        blurDataURL={blurDataURL}
        onClick={() => setOpen(true)}
      />

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setOpen(false)}
        >
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setOpen(false)}
              className="absolute -top-10 right-0 text-white/90 hover:text-white text-sm"
            >
              Close
            </button>
            <div className="relative w-full aspect-[4/3] md:aspect-[16/10] rounded-lg overflow-hidden">
              <Image
                src={src}
                alt={alt}
                fill
                className="object-contain"
                quality={quality}
                sizes="(max-width: 768px) 100vw, 60vw"
                placeholder="blur"
                blurDataURL={blurDataURL}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}