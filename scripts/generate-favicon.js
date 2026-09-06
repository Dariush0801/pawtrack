const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Create a 64x64 RGBA circular PawTrack logo PNG in pure Node.js
const width = 64;
const height = 64;
const buffer = Buffer.alloc(width * height * 4);

function setPixel(x, y, r, g, b, a) {
  if (x < 0 || x >= width || y < 0 || y >= height) return;
  const idx = (y * width + x) * 4;
  buffer[idx] = r;
  buffer[idx + 1] = g;
  buffer[idx + 2] = b;
  buffer[idx + 3] = a;
}

const cx = 31.5;
const cy = 31.5;
const r = 30;

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= r) {
      // Circle gradient: #c2410c to #7c2d12
      const t = (y / height) * 0.7 + (x / width) * 0.3;
      let red = Math.round(194 * (1 - t) + 124 * t);
      let green = Math.round(65 * (1 - t) + 45 * t);
      let blue = Math.round(12 * (1 - t) + 18 * t);

      // Gold border on edge (dist between 28 and 30)
      if (dist >= 27.5) {
        red = 254; green = 215; blue = 170;
      }

      setPixel(x, y, red, green, blue, 255);
    } else if (dist <= r + 1) {
      // Antialiasing edge
      const alpha = Math.round((1 - (dist - r)) * 255);
      setPixel(x, y, 254, 215, 170, alpha);
    } else {
      setPixel(x, y, 0, 0, 0, 0);
    }
  }
}

// Draw Paw Print in White
function drawEllipse(ex, ey, rx, ry, angleDeg = 0) {
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - ex;
      const dy = y - ey;
      const nx = (dx * cos + dy * sin) / rx;
      const ny = (-dx * sin + dy * cos) / ry;
      if (nx * nx + ny * ny <= 1.0) {
        setPixel(x, y, 255, 255, 255, 255);
      }
    }
  }
}

// Toe 1 (top center)
drawEllipse(32, 18, 4.5, 6, 0);
// Toe 2 (left)
drawEllipse(21, 23, 4, 5.2, -18);
// Toe 3 (right)
drawEllipse(43, 23, 4, 5.2, 18);
// Toe 4 (far left accent)
drawEllipse(14, 31, 3.2, 4.2, -35);
// Toe 5 (far right accent)
drawEllipse(50, 31, 3.2, 4.2, 35);

// Main center pad
for (let y = 28; y <= 50; y++) {
  for (let x = 18; x <= 46; x++) {
    const dx = x - 32;
    const dy = y - 40;
    // Heart-shaped base
    if ((dx * dx) / 144 + (dy * dy) / 81 <= 1.0 && y <= 48) {
      setPixel(x, y, 255, 255, 255, 255);
    }
  }
}

// Encode to PNG buffer
function createPng(width, height, rgbaBuffer) {
  const signature = Buffer.from([137, 80, 78, 72, 13, 10, 26, 10]);

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.concat([typeBuf, data]);
    const crc = require('zlib').crc32(crcBuf);
    const crcOut = Buffer.alloc(4);
    crcOut.writeUInt32BE(crc >>> 0, 0);
    return Buffer.concat([len, typeBuf, data, crcOut]);
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = chunk('IHDR', ihdr);

  // Scanlines with filter byte 0
  const rawScanlines = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) {
    rawScanlines[y * (width * 4 + 1)] = 0; // filter None
    rgbaBuffer.copy(rawScanlines, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }

  const idatData = zlib.deflateSync(rawScanlines);
  const idatChunk = chunk('IDAT', idatData);
  const iendChunk = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const pngBuffer = createPng(width, height, buffer);

// Save PNG and ICO
fs.writeFileSync(path.join(__dirname, '..', 'images', 'favicon.png'), pngBuffer);
fs.writeFileSync(path.join(__dirname, '..', 'favicon.ico'), pngBuffer);
console.log('Successfully generated images/favicon.png and favicon.ico!');
