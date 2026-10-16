// Builds dist/clean-link-sharer-<version>.zip for upload to the Chrome Web Store.
// Only the files the extension needs are included (an allow-list), so tests, scripts,
// store notes and local tooling never ship. Zip entries use forward slashes, which the
// Web Store requires (PowerShell's Compress-Archive can produce backslashes).

import { deflateRawSync, crc32 } from 'node:zlib';
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const INCLUDE_FILES = [
  'manifest.json',
  'background.js',
  'offscreen.html',
  'offscreen.js',
  'popup.html',
  'popup.css',
  'popup.js',
  'options.html',
  'options.css',
  'options.js',
];
const INCLUDE_DIRS = ['lib', 'icons', '_locales'];

function listFiles(dir) {
  const result = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) result.push(...listFiles(full));
    else result.push(full);
  }
  return result;
}

function collectFiles() {
  const files = INCLUDE_FILES.map((file) => join(root, file));
  for (const dir of INCLUDE_DIRS) files.push(...listFiles(join(root, dir)));
  return files
    .map((full) => relative(root, full).split(sep).join('/'))
    .sort();
}

function dosDateTime(date) {
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const day = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { time, day };
}

function buildZip(entries) {
  const { time, day } = dosDateTime(new Date());
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const { name, data } of entries) {
    const nameBytes = Buffer.from(name, 'utf8');
    const compressed = deflateRawSync(data, { level: 9 });
    const checksum = crc32(data);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4); // version needed
    local.writeUInt16LE(0x0800, 6); // UTF-8 names
    local.writeUInt16LE(8, 8); // deflate
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(day, 12);
    local.writeUInt32LE(checksum, 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBytes.length, 26);
    localParts.push(local, nameBytes, compressed);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4); // version made by
    central.writeUInt16LE(20, 6); // version needed
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(8, 10);
    central.writeUInt16LE(time, 12);
    central.writeUInt16LE(day, 14);
    central.writeUInt32LE(checksum, 16);
    central.writeUInt32LE(compressed.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(nameBytes.length, 28);
    central.writeUInt32LE(offset, 42);
    centralParts.push(central, nameBytes);

    offset += local.length + nameBytes.length + compressed.length;
  }

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);

  return Buffer.concat([...localParts, ...centralParts, end]);
}

const manifest = JSON.parse(readFileSync(join(root, 'manifest.json'), 'utf8'));
const entries = collectFiles().map((name) => ({ name, data: readFileSync(join(root, name)) }));
const zip = buildZip(entries);

const distDir = join(root, 'dist');
mkdirSync(distDir, { recursive: true });
const outFile = join(distDir, `clean-link-sharer-${manifest.version}.zip`);
writeFileSync(outFile, zip);

console.log(`Packaged ${entries.length} files (${(zip.length / 1024).toFixed(1)} KB):`);
for (const { name } of entries) console.log(`  ${name}`);
console.log(`\n${outFile}`);
