// Generates icons/icon-{16,32,48,128}.png: a white chain link with a sparkle on a green tile.
// No dependencies: shapes are drawn with signed distance functions, supersampled, and
// written out as PNG using node:zlib.

import { deflateSync, crc32 } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SIZES = [16, 32, 48, 128];
const SUPERSAMPLE = 4;
const GREEN_TOP = [67, 160, 71];
const GREEN_BOTTOM = [36, 112, 42];

const sdRoundedSquare = (x, y, half, radius) => {
  const qx = Math.abs(x) - (half - radius);
  const qy = Math.abs(y) - (half - radius);
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - radius;
};

const sdHorizontalCapsule = (x, y, centerX, halfLength) => {
  const dx = Math.max(Math.abs(x - centerX) - halfLength, 0);
  return Math.hypot(dx, y);
};

function shade(u, v) {
  // Returns [r, g, b, a] (0-255, a in 0-1) for a point in unit coordinates.
  const x = u - 0.5;
  const y = v - 0.5;

  if (sdRoundedSquare(x, y, 0.5, 0.22) > 0) return [0, 0, 0, 0];

  // Chain links lie along the "/" diagonal: rotate into the links' own frame.
  const cos = Math.SQRT1_2;
  const lx = (x * cos) + (-y * cos);
  const ly = (x * cos) + (y * cos);
  const linkRadius = 0.115;
  const stroke = 0.062;
  for (const centerX of [-0.135, 0.135]) {
    const d = sdHorizontalCapsule(lx, ly, centerX, 0.09);
    if (d <= linkRadius && d > linkRadius - stroke) return [255, 255, 255, 1];
  }

  // Four-point sparkle (astroid) off the chain axis, top-left.
  const sx = u - 0.26;
  const sy = v - 0.26;
  if (Math.sqrt(Math.abs(sx)) + Math.sqrt(Math.abs(sy)) <= Math.sqrt(0.1)) return [255, 255, 255, 1];

  const mix = (a, b) => Math.round(a + (b - a) * v);
  return [mix(GREEN_TOP[0], GREEN_BOTTOM[0]), mix(GREEN_TOP[1], GREEN_BOTTOM[1]), mix(GREEN_TOP[2], GREEN_BOTTOM[2]), 1];
}

function render(size) {
  const pixels = Buffer.alloc(size * size * 4);
  const samples = SUPERSAMPLE * SUPERSAMPLE;
  for (let py = 0; py < size; py += 1) {
    for (let px = 0; px < size; px += 1) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let sy = 0; sy < SUPERSAMPLE; sy += 1) {
        for (let sx = 0; sx < SUPERSAMPLE; sx += 1) {
          const u = (px + (sx + 0.5) / SUPERSAMPLE) / size;
          const v = (py + (sy + 0.5) / SUPERSAMPLE) / size;
          const [sr, sg, sb, sa] = shade(u, v);
          r += sr * sa;
          g += sg * sa;
          b += sb * sa;
          a += sa;
        }
      }
      const offset = (py * size + px) * 4;
      if (a > 0) {
        pixels[offset] = Math.round(r / a);
        pixels[offset + 1] = Math.round(g / a);
        pixels[offset + 2] = Math.round(b / a);
        pixels[offset + 3] = Math.round((a / samples) * 255);
      }
    }
  }
  return pixels;
}

function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, checksum]);
}

function encodePng(size, rgba) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8; // bit depth
  header[9] = 6; // RGBA

  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y += 1) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// Web Store icon: 128x128 canvas, 96x96 artwork centred, 16px transparent margin.
function renderStoreIcon() {
  const canvas = 128;
  const artwork = 96;
  const margin = (canvas - artwork) / 2;
  const art = render(artwork);
  const pixels = Buffer.alloc(canvas * canvas * 4);
  for (let y = 0; y < artwork; y += 1) {
    art.copy(pixels, ((y + margin) * canvas + margin) * 4, y * artwork * 4, (y + 1) * artwork * 4);
  }
  return encodePng(canvas, pixels);
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'icons');
mkdirSync(outDir, { recursive: true });
for (const size of SIZES) {
  const file = join(outDir, `icon-${size}.png`);
  writeFileSync(file, encodePng(size, render(size)));
  console.log(`wrote ${file}`);
}

const storeIconFile = join(root, 'store', 'store-icon-128.png');
mkdirSync(dirname(storeIconFile), { recursive: true });
writeFileSync(storeIconFile, renderStoreIcon());
console.log(`wrote ${storeIconFile}`);
