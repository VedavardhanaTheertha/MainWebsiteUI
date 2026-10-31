import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT_DIR = process.cwd();
const SOURCE_IMAGE = path.join(ROOT_DIR, 'public', 'main-logo.png');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const APP_DIR = path.join(ROOT_DIR, 'src', 'app');

async function createOptimizedSquare(sourcePath) {
  // Trim transparent boundary
  const trimmedBuffer = await sharp(sourcePath)
    .trim()
    .toBuffer();

  const trimmedMeta = await sharp(trimmedBuffer).metadata();
  const maxDim = Math.max(trimmedMeta.width, trimmedMeta.height);
  // Add 6% breathing room around the active logo
  const padding = Math.round(maxDim * 0.06);
  const canvasSize = maxDim + padding * 2;

  // Composite trimmed image centered on a transparent canvas
  const squareBuffer = await sharp({
    create: {
      width: canvasSize,
      height: canvasSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: trimmedBuffer,
        top: Math.round((canvasSize - trimmedMeta.height) / 2),
        left: Math.round((canvasSize - trimmedMeta.width) / 2),
      },
    ])
    .png()
    .toBuffer();

  return squareBuffer;
}

async function createDIBFrame(squareBuffer, size) {
  const { data } = await sharp(squareBuffer)
    .resize(size, size, { kernel: sharp.kernel.lanczos3 })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = size;
  const height = size;
  const xorSize = width * height * 4;
  const andRowBytes = Math.floor((width + 31) / 32) * 4;
  const andSize = andRowBytes * height;
  const biSizeImage = xorSize + andSize;

  const header = Buffer.alloc(40);
  header.writeUInt32LE(40, 0); // biSize
  header.writeInt32LE(width, 4); // biWidth
  header.writeInt32LE(height * 2, 8); // biHeight (XOR + AND mask combined)
  header.writeUInt16LE(1, 12); // biPlanes
  header.writeUInt16LE(32, 14); // biBitCount
  header.writeUInt32LE(0, 16); // biCompression = BI_RGB
  header.writeUInt32LE(biSizeImage, 20); // biSizeImage
  header.writeInt32LE(0, 24); // biXPelsPerMeter
  header.writeInt32LE(0, 28); // biYPelsPerMeter
  header.writeUInt32LE(0, 32); // biClrUsed
  header.writeUInt32LE(0, 36); // biClrImportant

  const xorBuf = Buffer.alloc(xorSize);
  // DIB scanlines must be bottom-up BGRA
  for (let y = 0; y < height; y++) {
    const srcY = height - 1 - y;
    for (let x = 0; x < width; x++) {
      const srcIdx = (srcY * width + x) * 4;
      const dstIdx = (y * width + x) * 4;
      xorBuf[dstIdx] = data[srcIdx + 2]; // Blue
      xorBuf[dstIdx + 1] = data[srcIdx + 1]; // Green
      xorBuf[dstIdx + 2] = data[srcIdx]; // Red
      xorBuf[dstIdx + 3] = data[srcIdx + 3]; // Alpha
    }
  }

  const andBuf = Buffer.alloc(andSize);
  // 1-bit AND mask: 1 = transparent, 0 = opaque, bottom-up
  for (let y = 0; y < height; y++) {
    const srcY = height - 1 - y;
    const rowOffset = y * andRowBytes;
    for (let x = 0; x < width; x++) {
      const srcIdx = (srcY * width + x) * 4;
      const alpha = data[srcIdx + 3];
      if (alpha < 128) {
        const byteIdx = rowOffset + Math.floor(x / 8);
        const bitIdx = 7 - (x % 8);
        andBuf[byteIdx] |= (1 << bitIdx);
      }
    }
  }

  const frameData = Buffer.concat([header, xorBuf, andBuf]);
  return { width, height, frameData };
}

function assembleIco(frames) {
  const count = frames.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // icon type
  header.writeUInt16LE(count, 4); // count

  let currentOffset = 6 + count * 16;
  const dirEntries = [];

  for (const frame of frames) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(frame.width === 256 ? 0 : frame.width, 0);
    entry.writeUInt8(frame.height === 256 ? 0 : frame.height, 1);
    entry.writeUInt8(0, 2); // color count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // planes
    entry.writeUInt16LE(32, 6); // bpp
    entry.writeUInt32LE(frame.frameData.length, 8); // size
    entry.writeUInt32LE(currentOffset, 12); // offset
    dirEntries.push(entry);
    currentOffset += frame.frameData.length;
  }

  return Buffer.concat([
    header,
    ...dirEntries,
    ...frames.map((f) => f.frameData),
  ]);
}

async function main() {
  console.log(`[icons] Reading base logo: ${SOURCE_IMAGE}`);
  const squareBuffer = await createOptimizedSquare(SOURCE_IMAGE);

  // 1. Generate standard PNG sizes
  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-48x48.png', size: 48 },
    { name: 'apple-icon.png', size: 180 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'icon-192.png', size: 192 },
    { name: 'icon-512.png', size: 512 },
    { name: 'icon.png', size: 512 },
  ];

  for (const { name, size } of sizes) {
    const pngBuffer = await sharp(squareBuffer)
      .resize(size, size, { kernel: sharp.kernel.lanczos3 })
      .png({ compressionLevel: 9 })
      .toBuffer();

    fs.writeFileSync(path.join(PUBLIC_DIR, name), pngBuffer);
    console.log(`[icons] Created public/${name} (${size}x${size}, ${pngBuffer.length} bytes)`);

    // Keep app/ in sync for Next.js App Router conventions
    if (['apple-icon.png', 'icon.png'].includes(name)) {
      fs.writeFileSync(path.join(APP_DIR, name), pngBuffer);
      console.log(`[icons] Created src/app/${name}`);
    }
  }

  // 2. Generate multi-size favicon.ico (16, 32, 48)
  const icoSizes = [16, 32, 48];
  const dibFrames = [];
  for (const size of icoSizes) {
    dibFrames.push(await createDIBFrame(squareBuffer, size));
  }
  const icoBuffer = assembleIco(dibFrames);
  fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(APP_DIR, 'favicon.ico'), icoBuffer);
  console.log(`[icons] Created favicon.ico (sizes: 16, 32, 48, ${icoBuffer.length} bytes)`);
  console.log('[icons] Finished generating all website icons.');
}

main().catch((err) => {
  console.error('[icons] Error generating icons:', err);
  process.exit(1);
});
