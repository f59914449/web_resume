"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

type PhotoItem = {
  url: string;
  filename: string;
  mtime: number; // epoch ms
  size: number; // bytes
  caption?: string;
};

type AlbumsResponse = {
  images: PhotoItem[];
  significant: string[]; // filenames
  count: number;
};

type SortMode = "chronological" | "random" | "algorithm";

export default function AlbumsMemories() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [significant, setSignificant] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [intervalMs, setIntervalMs] = useState(5000); // default 5s
  const [sortMode, setSortMode] = useState<SortMode>("algorithm");

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let active = true;
    async function fetchAlbums() {
      setLoading(true);
      try {
        const res = await fetch("/api/albums");
        const data: AlbumsResponse = await res.json();
        if (!active) return;
        setPhotos(data.images);
        setSignificant(new Set(data.significant));
        setError(null);
      } catch (err) {
        console.error(err);
        if (!active) return;
        setError("Unable to load albums");
      } finally {
        if (active) setLoading(false);
      }
    }
    void fetchAlbums();
    return () => {
      active = false;
    };
  }, []);

  const orderedPhotos = useMemo(() => {
    if (sortMode === "chronological") {
      return [...photos].sort((a, b) => a.mtime - b.mtime);
    }
    if (sortMode === "random") {
      return shuffle([...photos]);
    }
    // algorithm: blend newest + significant
    const newest = [...photos].sort((a, b) => b.mtime - a.mtime);
    const sigList = newest.filter((p) => significant.has(p.filename));
    const rest = newest.filter((p) => !significant.has(p.filename));
    return [...sigList, ...rest];
  }, [photos, significant, sortMode]);

  // Reset current index when order changes
  useEffect(() => {
    // Use functional update to avoid cascading effects
    setCurrent(() => 0);
  }, [sortMode, photos.length]);

  // Auto-advance timer
  useEffect(() => {
    if (!playing || orderedPhotos.length === 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    timerRef.current = setInterval(() => {
      setCurrent((i) => (i + 1) % orderedPhotos.length);
    }, intervalMs);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [playing, intervalMs, orderedPhotos.length]);

  const prev = () => setCurrent((i) => (i - 1 + orderedPhotos.length) % orderedPhotos.length);
  const next = () => setCurrent((i) => (i + 1) % orderedPhotos.length);

  const currentPhoto = orderedPhotos[current];
  const prevPhoto = orderedPhotos[(current - 1 + orderedPhotos.length) % orderedPhotos.length];

  return (
    <section className="my-16">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-2xl font-semibold accent-underline">Memories</h2>
        <div className="flex items-center gap-2 text-sm">
          <label className="opacity-80">Sort:</label>
          <select
            className="bg-transparent border border-white/20 rounded px-2 py-1"
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
          >
            <option value="algorithm">Intelligent</option>
            <option value="chronological">Chronological</option>
            <option value="random">Random</option>
          </select>
        </div>
      </div>

      {/* Carousel */}
      <div className="glass-card rounded-lg overflow-hidden">
        <div className="relative h-64 sm:h-80 md:h-96">
          {/* Previous image for smooth cross-fade */}
          {prevPhoto && (
            <FadeImage key={prevPhoto.filename} photo={prevPhoto} visible={false} />
          )}
          {/* Current image */}
          {currentPhoto && (
            <FadeImage key={currentPhoto.filename} photo={currentPhoto} visible={true} significant={significant.has(currentPhoto.filename)} />
          )}
          {/* Caption overlay */}
          {currentPhoto && (
            <div className="absolute left-0 bottom-0 w-full p-3 sm:p-4 bg-gradient-to-t from-black/50 to-transparent text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <div className="truncate">
                  {currentPhoto.caption ?? currentPhoto.filename}
                </div>
                <div className="opacity-80">
                  {formatDate(currentPhoto.mtime)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 px-4 py-3 border-t border-white/10 text-sm">
          <button className="px-3 py-1 rounded border border-white/20 hover:bg-white/10" onClick={() => setPlaying((p) => !p)}>
            {playing ? "Pause" : "Play"}
          </button>
          <button className="px-3 py-1 rounded border border-white/20 hover:bg-white/10" onClick={prev}>
            Prev
          </button>
          <button className="px-3 py-1 rounded border border-white/20 hover:bg-white/10" onClick={next}>
            Next
          </button>
          <div className="flex items-center gap-2 ml-auto">
            <label htmlFor="speed" className="opacity-80">Speed</label>
            <input
              id="speed"
              type="range"
              min={2000}
              max={10000}
              step={500}
              value={intervalMs}
              onChange={(e) => setIntervalMs(Number(e.target.value))}
            />
            <span className="tabular-nums w-12 text-right opacity-80">{Math.round(intervalMs / 1000)}s</span>
          </div>
        </div>
      </div>

      {/* Grid of thumbnails */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {orderedPhotos.map((p) => (
          <div key={p.filename} className="relative aspect-[4/3] rounded-lg overflow-hidden group">
            <Image src={p.url} alt={p.caption ?? p.filename} fill sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 25vw" className="object-cover transition-transform duration-300 group-hover:scale-105" />
            {significant.has(p.filename) && (
              <span className="absolute top-2 right-2 text-[10px] sm:text-xs bg-accent text-black font-semibold px-2 py-1 rounded">
                Moment
              </span>
            )}
          </div>
        ))}
      </div>

      {loading && (
        <div className="mt-4 text-sm opacity-80">Loading albums…</div>
      )}
      {error && (
        <div className="mt-4 text-sm text-red-400">{error}</div>
      )}
    </section>
  );
}

function FadeImage({ photo, visible, significant }: { photo: PhotoItem; visible: boolean; significant?: boolean }) {
  return (
    <div
      className={`absolute inset-0 transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0"}`}
    >
      <Image
        src={photo.url}
        alt={photo.caption ?? photo.filename}
        fill
        sizes="100vw"
        priority
        className="object-cover"
      />
      {significant && (
        <div className="absolute top-3 left-3">
          <span className="bg-accent text-black font-semibold px-2 py-1 rounded text-xs">Significant</span>
        </div>
      )}
    </div>
  );
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function formatDate(epochMs: number) {
  try {
    const d = new Date(epochMs);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "";
  }
}