import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { deflateSync } from 'zlib';

const __dirname = dirname(fileURLToPath(import.meta.url));

function createPNG(size) {
  const width = size;
  const height = size;
  const pixels = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const cx = width / 2;
      const cy = height / 2;
      const r = width / 2 - 1;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= r) {
        pixels[idx] = 0x32;
        pixels[idx + 1] = 0x6c;
        pixels[idx + 2] = 0xe5;
        pixels[idx + 3] = 0xff;

        if (size >= 48) {
          const nx = (x - cx) / r;
          const ny = (y - cy) / r;
          const kLeft = nx >= -0.35 && nx <= -0.15 && ny >= -0.5 && ny <= 0.5;
          const kDiagUp = nx >= -0.15 && nx <= 0.35 && ny >= -0.5 && ny <= 0.0 &&
                          Math.abs(ny - (-0.5 + (nx + 0.15) * 1.0)) < 0.12;
          const kDiagDown = nx >= -0.15 && nx <= 0.35 && ny >= 0.0 && ny <= 0.5 &&
                            Math.abs(ny - (0.5 - (0.35 - nx) * 1.0)) < 0.12;
          if (kLeft || kDiagUp || kDiagDown) {
            pixels[idx] = 0xff;
            pixels[idx + 1] = 0xff;
            pixels[idx + 2] = 0xff;
          }
        }
      } else {
        pixels[idx + 3] = 0x00;
      }
    }
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;

  const rawData = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    rawData[y * (1 + width * 4)] = 0;
    pixels.copy(rawData, y * (1 + width * 4) + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressed = deflateSync(rawData);

  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

function makeChunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = crc32(crcData);
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc, 0);
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function crc32(data) {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

for (const size of [16, 48, 128]) {
  const png = createPNG(size);
  writeFileSync(resolve(__dirname, '..', 'public', 'icons', `icon${size}.png`), png);
  console.log(`Generated icon${size}.png (${png.length} bytes)`);
}
