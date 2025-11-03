/*
  Optimize/compress images in public/albums.
  Usage:
    node scripts/optimize-albums.mjs [--maxWidth=2560] [--maxHeight=2560] [--quality=82] [--pngQuality=80] [--effort=5] [--dry-run] [--backup]
*/

import fs from 'fs';
import { promises as fsp } from 'fs';
import path from 'path';
import sharp from 'sharp';

const args = process.argv.slice(2);
const opts = {
  maxWidth: 2560,
  maxHeight: 2560,
  quality: 82, // for jpeg/webp
  pngQuality: 80, // quantization quality for png
  effort: 5, // webp effort
  dryRun: false,
  backup: false,
};
for (const a of args) {
  if (a === '--dry-run') opts.dryRun = true;
  else if (a === '--backup') opts.backup = true;
  else if (a.startsWith('--maxWidth=')) opts.maxWidth = Number(a.split('=')[1]);
  else if (a.startsWith('--maxHeight=')) opts.maxHeight = Number(a.split('=')[1]);
  else if (a.startsWith('--quality=')) opts.quality = Number(a.split('=')[1]);
  else if (a.startsWith('--pngQuality=')) opts.pngQuality = Number(a.split('=')[1]);
  else if (a.startsWith('--effort=')) opts.effort = Number(a.split('=')[1]);
}

const root = path.join(process.cwd(), 'public', 'albums');

async function* walk(dir) {
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      yield* walk(p);
    } else if (e.isFile()) {
      yield p;
    }
  }
}

function fmtBytes(b) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(2)} MB`;
}

async function optimizeFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) return { skipped: true, reason: 'ext' };

  const origStats = await fsp.stat(filePath);
  const origSize = origStats.size;

  const img = sharp(filePath, { failOn: 'none' });
  const meta = await img.metadata();
  const origW = meta.width || 0;
  const origH = meta.height || 0;

  const willResize = origW > opts.maxWidth || origH > opts.maxHeight;
  let pipeline = sharp(filePath, { failOn: 'none' });
  if (willResize) {
    pipeline = pipeline.resize({
      width: opts.maxWidth,
      height: opts.maxHeight,
      fit: 'inside',
      withoutEnlargement: true,
      fastShrinkOnLoad: true,
    });
  }

  let target = ext.replace('.', ''); // 'jpg' | 'jpeg' | 'png' | 'webp'
  if (target === 'jpg') target = 'jpeg';

  if (target === 'jpeg') {
    pipeline = pipeline.jpeg({ quality: opts.quality, mozjpeg: true, chromaSubsampling: '4:4:4' });
  } else if (target === 'png') {
    pipeline = pipeline.png({ quality: opts.pngQuality, compressionLevel: 9, palette: true });
  } else if (target === 'webp') {
    pipeline = pipeline.webp({ quality: opts.quality, effort: opts.effort });
  }

  const outBuf = await pipeline.toBuffer();
  const outSize = outBuf.length;
  const shrink = origSize - outSize;

  // Only write if resized OR smaller by at least 1% (~safety threshold)
  const smallerEnough = outSize < origSize * 0.99;
  if (opts.dryRun) {
    return {
      dryRun: true,
      path: filePath,
      willResize,
      from: { w: origW, h: origH, size: origSize },
      to: { size: outSize },
      action: willResize || smallerEnough ? 'would-optimize' : 'skip-no-gain',
    };
  }

  if (willResize || smallerEnough) {
    if (opts.backup) {
      await fsp.copyFile(filePath, `${filePath}.bak`);
    }
    await fsp.writeFile(filePath, outBuf);
    return {
      optimized: true,
      path: filePath,
      resized: willResize,
      savedBytes: shrink,
      savedPct: ((shrink / origSize) * 100).toFixed(1) + '%',
    };
  } else {
    return { optimized: false, path: filePath, reason: 'no-meaningful-gain' };
  }
}

(async () => {
  const exists = fs.existsSync(root);
  if (!exists) {
    console.error(`Directory not found: ${root}`);
    process.exit(1);
  }
  console.log(`Scanning ${root} ...`);
  const files = [];
  for await (const p of walk(root)) files.push(p);

  let processed = 0;
  let optimized = 0;
  let totalSaved = 0;

  for (const file of files) {
    try {
      const res = await optimizeFile(file);
      processed++;
      if (res && res.optimized) {
        optimized++;
        totalSaved += Math.max(0, res.savedBytes || 0);
        console.log(`✓ Optimized: ${path.relative(process.cwd(), file)} (${res.savedPct} saved)`);
      } else if (res && res.dryRun) {
        const rel = path.relative(process.cwd(), res.path);
        if (res.action === 'would-optimize') {
          console.log(`• Would optimize: ${rel} (${fmtBytes(res.from.size)} → ${fmtBytes(res.to.size)})`);
        } else {
          console.log(`• Skip (no gain): ${rel}`);
        }
      }
    } catch (err) {
      console.warn(`! Error processing ${file}:`, err?.message || err);
    }
  }

  if (!opts.dryRun) {
    console.log(`Done. Optimized ${optimized}/${processed} files. Total saved: ${fmtBytes(totalSaved)}.`);
  } else {
    console.log(`Dry run complete. ${processed} files scanned.`);
  }
})();
