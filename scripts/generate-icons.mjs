#!/usr/bin/env node
/**
 * Orivon Browser — Icon Generator
 * Creates all icon assets from pure Node.js (no external dependencies).
 *
 * Produces:
 *   build/icons/{16,32,48,64,128,256,512,1024}x{…}.png  — Linux AppImage
 *   build/icon.png           — 1024×1024 master PNG
 *   build/icon.icns          — macOS (ICNS with embedded PNGs)
 *   build/icon.ico           — Windows (ICO with embedded PNGs)
 */
import { deflateSync } from 'zlib';
import { writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, '..');
const ICONS_DIR = path.join(ROOT, 'build', 'icons');
const BUILD_DIR = path.join(ROOT, 'build');

// ─── CRC-32 (required for PNG) ────────────────────────────────────────────────

const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[i] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (const b of buf) crc = (crc >>> 8) ^ crcTable[(crc ^ b) & 0xFF];
  return ((crc ^ 0xFFFFFFFF) >>> 0);
}

// ─── PNG builder ──────────────────────────────────────────────────────────────

function pngChunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const lenBuf    = Buffer.alloc(4); lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf    = Buffer.alloc(4); crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])), 0);
  return Buffer.concat([lenBuf, typeBytes, data, crcBuf]);
}

/**
 * Render one pixel of the Orivon icon at (x,y) for a canvas of `size×size`.
 * Returns [r, g, b, a] 0–255.
 */
function orivonPixel(x, y, size) {
  const cx = (size - 1) / 2;
  const cy = (size - 1) / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Design dimensions (relative to half-size)
  const R         = size * 0.46;   // outer circle radius
  const RING_OUT  = size * 0.385;
  const RING_IN   = size * 0.27;
  const DOT_R     = size * 0.07;
  const LINE_H    = size * 0.042;  // horizontal meridian half-height
  const AA        = Math.max(1, size * 0.008); // anti-alias width

  // Outside the outer circle → transparent
  if (dist > R + AA) return [0, 0, 0, 0];

  // Background colour
  const BG   = [15, 15, 15];
  const GRN  = [0, 255, 135];  // #00FF87

  // Helper: smooth alpha blend at edge
  const edgeAlpha = (d, edge) => Math.max(0, Math.min(1, (edge - d) / AA));

  // Outer circle boundary alpha
  const outerA = edgeAlpha(dist, R);

  // Is this pixel inside the green ring?
  const inRing = dist >= RING_IN && dist <= RING_OUT;

  // Is this pixel inside the center dot?
  const inDot  = dist <= DOT_R;

  // Is this pixel on the horizontal meridian line?
  const inLine = Math.abs(dy) <= LINE_H && dist < RING_IN && dist > DOT_R;

  let r, g, b;
  if (inRing) {
    [r, g, b] = GRN;
    // Inner ring edge AA
    const innerEdge = edgeAlpha(RING_IN - dist, 0) + edgeAlpha(dist - RING_OUT, 0);
    if (innerEdge < 1) {
      r = Math.round(BG[0] + (GRN[0] - BG[0]) * (1 - innerEdge * 0.6));
      g = Math.round(BG[1] + (GRN[1] - BG[1]) * (1 - innerEdge * 0.6));
      b = Math.round(BG[2] + (GRN[2] - BG[2]) * (1 - innerEdge * 0.6));
    }
  } else if (inDot || inLine) {
    [r, g, b] = GRN;
  } else {
    [r, g, b] = BG;
  }

  const a = Math.round(outerA * 255);
  return [r, g, b, a];
}

/**
 * Build a raw RGBA PNG buffer at `size×size` pixels.
 */
function buildPNG(size) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR: width, height, bit-depth=8, color-type=6 (RGBA), compress=0, filter=0, interlace=0
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8]  = 8;  // bit depth
  ihdr[9]  = 6;  // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  // Raw pixel data (scanlines: filter_byte + 4_bytes_per_pixel)
  const rawLen = size * (1 + size * 4);
  const raw    = Buffer.allocUnsafe(rawLen);
  let offset   = 0;

  for (let y = 0; y < size; y++) {
    raw[offset++] = 0; // filter: None
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = orivonPixel(x, y, size);
      raw[offset++] = r;
      raw[offset++] = g;
      raw[offset++] = b;
      raw[offset++] = a;
    }
  }

  const compressed = deflateSync(raw, { level: 9 });

  return Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// ─── ICO builder (Windows) — embeds PNGs directly ─────────────────────────────

function buildICO(pngBySize) {
  const sizes   = [16, 24, 32, 48, 64, 128, 256];
  const entries = sizes.map(s => ({ size: s, png: pngBySize.get(s) || pngBySize.get(32) }));

  const headerSize = 6;
  const dirSize    = entries.length * 16;
  let   dataOffset = headerSize + dirSize;

  // ICO header
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);               // reserved
  header.writeUInt16LE(1, 2);               // type: ICO
  header.writeUInt16LE(entries.length, 4);  // image count

  const dirs = entries.map(({ size, png }) => {
    const dir = Buffer.alloc(16);
    dir[0] = size >= 256 ? 0 : size;  // width  (0 = 256)
    dir[1] = size >= 256 ? 0 : size;  // height (0 = 256)
    dir[2] = 0;                        // color count
    dir[3] = 0;                        // reserved
    dir.writeUInt16LE(1,          4);  // planes
    dir.writeUInt16LE(32,         6);  // bits per pixel
    dir.writeUInt32LE(png.length, 8);  // data size
    dir.writeUInt32LE(dataOffset, 12); // data offset
    dataOffset += png.length;
    return dir;
  });

  return Buffer.concat([header, ...dirs, ...entries.map(e => e.png)]);
}

// ─── ICNS builder (macOS) — modern format with embedded PNGs ─────────────────

function buildICNS(pngBySize) {
  // Modern ICNS icon types with embedded PNG (Retina + standard)
  const iconTypes = [
    { code: 'icp4', size: 16    },
    { code: 'icp5', size: 32    },
    { code: 'icp6', size: 64    },
    { code: 'ic07', size: 128   },
    { code: 'ic08', size: 256   },
    { code: 'ic09', size: 512   },
    { code: 'ic10', size: 1024  },
    { code: 'ic11', size: 32    }, // 16@2x
    { code: 'ic12', size: 64    }, // 32@2x
    { code: 'ic13', size: 256   }, // 128@2x
    { code: 'ic14', size: 512   }, // 256@2x
  ];

  const iconEntries = iconTypes.map(({ code, size }) => {
    const png  = pngBySize.get(size);
    if (!png) return null;
    const head = Buffer.alloc(8);
    Buffer.from(code, 'ascii').copy(head, 0);
    head.writeUInt32BE(png.length + 8, 4); // chunk size including 8-byte header
    return Buffer.concat([head, png]);
  }).filter(Boolean);

  const body   = Buffer.concat(iconEntries);
  const header = Buffer.alloc(8);
  Buffer.from('icns', 'ascii').copy(header, 0);
  header.writeUInt32BE(body.length + 8, 4);

  return Buffer.concat([header, body]);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const SIZES_PNG  = [16, 24, 32, 48, 64, 128, 256, 512, 1024];
const pngBySize  = new Map();

process.stdout.write('Generating icon PNGs…\n');
for (const size of SIZES_PNG) {
  const buf = buildPNG(size);
  pngBySize.set(size, buf);

  // Write individual PNG to build/icons/ (used by Linux AppImage)
  if ([16, 32, 48, 64, 128, 256, 512].includes(size)) {
    writeFileSync(path.join(ICONS_DIR, `${size}x${size}.png`), buf);
  }
  process.stdout.write(`  ✓ ${size}x${size}\n`);
}

// Master 1024×1024 PNG
writeFileSync(path.join(BUILD_DIR, 'icon.png'), pngBySize.get(1024));
process.stdout.write('  ✓ build/icon.png (master)\n');

// Windows ICO
process.stdout.write('Building icon.ico (Windows)…\n');
writeFileSync(path.join(BUILD_DIR, 'icon.ico'), buildICO(pngBySize));
process.stdout.write('  ✓ build/icon.ico\n');

// macOS ICNS
process.stdout.write('Building icon.icns (macOS)…\n');
writeFileSync(path.join(BUILD_DIR, 'icon.icns'), buildICNS(pngBySize));
process.stdout.write('  ✓ build/icon.icns\n');

process.stdout.write('\nAll icons generated in build/\n');
