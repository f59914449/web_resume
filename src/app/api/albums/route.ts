import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

type PhotoItem = {
  url: string;
  filename: string;
  mtime: number; // epoch ms
  size: number; // bytes
  caption?: string;
};

export async function GET() {
  try {
    const albumsDir = path.join(process.cwd(), "public", "albums");
    const entries = await fs.readdir(albumsDir, { withFileTypes: true });
    const images: PhotoItem[] = [];

    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const ext = path.extname(entry.name).toLowerCase();
      if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) continue;
      const filePath = path.join(albumsDir, entry.name);
      const stats = await fs.stat(filePath);
      const caption = entry.name
        .replace(/[_-]+/g, " ")
        .replace(/\.(jpg|jpeg|png|webp)$/i, "")
        .trim();

      images.push({
        url: `/albums/${entry.name}`,
        filename: entry.name,
        mtime: stats.mtimeMs,
        size: stats.size,
        caption,
      });
    }

    // Sort newest first by default
    images.sort((a, b) => b.mtime - a.mtime);

    // Mark significant moments: top 3 newest and top 3 largest files
    const newestTop = new Set(images.slice(0, 3).map((i) => i.filename));
    const largestTop = new Set([...images].sort((a, b) => b.size - a.size).slice(0, 3).map((i) => i.filename));
    const significant = new Set<string>([...newestTop, ...largestTop]);

    return NextResponse.json({
      images,
      significant: Array.from(significant),
      count: images.length,
    });
  } catch (err) {
    console.error("/api/albums error", err);
    return NextResponse.json({ error: "Failed to read albums" }, { status: 500 });
  }
}