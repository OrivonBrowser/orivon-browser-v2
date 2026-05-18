#!/usr/bin/env node
/**
 * Orivon Browser — Icon Generator
 * Source: public/logo.jpg  (1254×1254 PNG-encoded file)
 *
 * macOS: uses built-in `sips` to resize — no extra npm deps needed.
 * Fallback (Windows/Linux CI): exits with a clear error — install `sharp`
 * or pre-supply the icon files manually.
 *
 * Produces:
 *   build/icons/{16,32,48,64,128,256,512}x{…}.png  — Linux AppImage
 *   build/icon.png          — 1024×1024 master PNG
 *   build/icon.icns         — macOS
 *   build/icon.ico          — Windows
 */

import { execSync, spawnSync }    from 'child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { deflateSync }            from 'zlib';
import os                         from 'os';
import path                       from 'path';
import { fileURLToPath }          from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, '..');
const ICONS_DIR = path.join(ROOT, 'build', 'icons');
const BUILD_DIR = path.join(ROOT, 'build');
const SOURCE    = path.join(ROOT, 'public', 'logo.jpg');

// ─── Guards ───────────────────────────────────────────────────────────────────

if (!existsSync(SOURCE)) {
  console.error(`✗ Source image not found: ${SOURCE}`);
  process.exit(1);
}

mkdirSync(ICONS_DIR, { recursive: true });
mkdirSync(BUILD_DIR, { recursive: true });

// ─── sips-based resizer (macOS) ───────────────────────────────────────────────

function hasSips() {
  return spawnSync('sips', ['--version'], { stdio: 'ignore' }).status === 0;
}

/**
 * Use macOS `sips` to resize SOURCE to `size×size` PNG.
 * Returns the PNG file contents as a Buffer.
 */
function resizeWithSips(size) {
  const tmp = path.join(os.tmpdir(), `orivon-icon-${size}-${Date.now()}.png`);
  execSync(
    `sips -Z ${size} "${SOURCE}" --out "${tmp}" -s format png`,
    { stdio: 'pipe' }
  );
  const buf = readFileSync(tmp);
  // cleanup temp file (best-effort)
  try { execSync(`rm -f "${tmp}"`, { stdio: 'ignore' }); } catch {}
  return buf;
}

// ─── ICO builder (Windows) — embeds PNGs directly ─────────────────────────────

function buildICO(pngBySize) {
  const sizes   = [16, 24, 32, 48, 64, 128, 256];
  const entries = sizes.map(s => ({ size: s, png: pngBySize.get(s) || pngBySize.get(32) }));

  const headerSize = 6;
  const dirSize    = entries.length * 16;
  let   dataOffset = headerSize + dirSize;

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);

  const dirs = entries.map(({ size, png }) => {
    const dir = Buffer.alloc(16);
    dir[0] = size >= 256 ? 0 : size;
    dir[1] = size >= 256 ? 0 : size;
    dir[2] = 0;
    dir[3] = 0;
    dir.writeUInt16LE(1,          4);
    dir.writeUInt16LE(32,         6);
    dir.writeUInt32LE(png.length, 8);
    dir.writeUInt32LE(dataOffset, 12);
    dataOffset += png.length;
    return dir;
  });

  return Buffer.concat([header, ...dirs, ...entries.map(e => e.png)]);
}

// ─── ICNS builder (macOS) — modern format with embedded PNGs ─────────────────

function buildICNS(pngBySize) {
  const iconTypes = [
    { code: 'icp4', size: 16   },
    { code: 'icp5', size: 32   },
    { code: 'icp6', size: 64   },
    { code: 'ic07', size: 128  },
    { code: 'ic08', size: 256  },
    { code: 'ic09', size: 512  },
    { code: 'ic10', size: 1024 },
    { code: 'ic11', size: 32   }, // 16@2x
    { code: 'ic12', size: 64   }, // 32@2x
    { code: 'ic13', size: 256  }, // 128@2x
    { code: 'ic14', size: 512  }, // 256@2x
  ];

  const iconEntries = iconTypes.map(({ code, size }) => {
    const png = pngBySize.get(size);
    if (!png) return null;
    const head = Buffer.alloc(8);
    Buffer.from(code, 'ascii').copy(head, 0);
    head.writeUInt32BE(png.length + 8, 4);
    return Buffer.concat([head, png]);
  }).filter(Boolean);

  const body   = Buffer.concat(iconEntries);
  const header = Buffer.alloc(8);
  Buffer.from('icns', 'ascii').copy(header, 0);
  header.writeUInt32BE(body.length + 8, 4);
  return Buffer.concat([header, body]);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

if (!hasSips()) {
  // On Windows/Linux CI: use pre-built icons committed to the repo from macOS
  const iconsExist =
    existsSync(path.join(BUILD_DIR, 'icon.png'))  &&
    existsSync(path.join(BUILD_DIR, 'icon.ico'))  &&
    existsSync(path.join(BUILD_DIR, 'icon.icns')) &&
    existsSync(path.join(ICONS_DIR, '256x256.png'));

  if (iconsExist) {
    process.stdout.write(
      'ℹ  sips not available (non-macOS). Using pre-built icons from build/\n' +
      '   (generated on macOS and committed to the repo — OK for CI)\n'
    );
    process.exit(0);
  }

  process.stderr.write(
    '✗  sips not found and no pre-built icons in build/.\n' +
    '   Fix: run `npm run icons` on macOS, then `git add build/ && git commit`.\n'
  );
  process.exit(1);
}

const SIZES_PNG  = [16, 24, 32, 48, 64, 128, 256, 512, 1024];
const pngBySize  = new Map();

process.stdout.write(`Source: ${SOURCE}\n`);
process.stdout.write('Resizing icon PNGs with sips…\n');

for (const size of SIZES_PNG) {
  process.stdout.write(`  → ${size}×${size}…`);
  const buf = resizeWithSips(size);
  pngBySize.set(size, buf);

  // Write individual sizes for Linux AppImage
  if ([16, 32, 48, 64, 128, 256, 512].includes(size)) {
    writeFileSync(path.join(ICONS_DIR, `${size}x${size}.png`), buf);
  }
  process.stdout.write(` ✓ (${buf.length} bytes)\n`);
}

// Master 1024×1024
writeFileSync(path.join(BUILD_DIR, 'icon.png'), pngBySize.get(1024));
process.stdout.write('  ✓ build/icon.png (master 1024×1024)\n');

// Windows ICO
process.stdout.write('Building icon.ico (Windows)…\n');
writeFileSync(path.join(BUILD_DIR, 'icon.ico'), buildICO(pngBySize));
process.stdout.write('  ✓ build/icon.ico\n');

// macOS ICNS
process.stdout.write('Building icon.icns (macOS)…\n');
writeFileSync(path.join(BUILD_DIR, 'icon.icns'), buildICNS(pngBySize));
process.stdout.write('  ✓ build/icon.icns\n');

process.stdout.write('\nAll icons generated from logo.jpg in build/\n');
