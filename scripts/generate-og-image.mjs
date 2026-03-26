import fs from 'fs';
import path from 'path';

// This script uses `sharp` to rasterize `public/og-image.svg` into `public/og-image.png` at 1200x630.
// Install sharp first: `pnpm add -D sharp` then run: `pnpm run generate-og`

const svgPath = path.join(process.cwd(), 'public', 'og-image.svg');
const outPath = path.join(process.cwd(), 'public', 'og-image.png');

async function run() {
  if (!fs.existsSync(svgPath)) {
    console.error('SVG not found:', svgPath);
    process.exit(1);
  }

  try {
    const sharp = await import('sharp');
    await sharp.default(svgPath).resize(1200, 630).png().toFile(outPath);
    console.log('Generated', outPath);
  } catch (err) {
    console.error('Failed to generate PNG. Did you install sharp?');
    console.error(err);
    process.exit(1);
  }
}

run();
