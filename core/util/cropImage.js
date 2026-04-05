const fs = require('fs');
const PNG = require('pngjs').PNG;

function hexToRgb (hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null;
}

async function loadPng (filePath) {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath);
    stream.on('error', reject);
    stream.pipe(new PNG())
      .on('parsed', function () {
        resolve(this);
      })
      .on('error', reject);
  });
}

function savePng (pngData, filePath) {
  return new Promise((resolve, reject) => {
    const outStream = fs.createWriteStream(filePath);
    outStream.on('error', reject);
    outStream.on('finish', resolve);
    pngData.pack().pipe(outStream);
  });
}

/**
 * Trims rows from the bottom of an image that perfectly match a given color.
 */
async function trimWhitespace (filePath, hexColor, padding, logger) {
  try {
    if (!fs.existsSync(filePath)) {
      return;
    }
    const color = hexToRgb(hexColor);
    if (!color) {
      if (logger) logger.warn('reset', `Invalid hex color for trimming: ${hexColor}`);
      return;
    }

    const png = await loadPng(filePath);
    const { width, height, data } = png;

    let trimY = height - 1;

    // Scan from bottom to top
    for (let y = height - 1; y >= 0; y--) {
      let rowIsBackground = true;
      for (let x = 0; x < width; x++) {
        const idx = (width * y + x) << 2;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = data[idx + 3];

        // Ensure strict color match for non-transparent pixels
        if (a > 0 && (r !== color.r || g !== color.g || b !== color.b)) {
          rowIsBackground = false;
          break;
        }
      }

      if (!rowIsBackground) {
        trimY = y;
        break;
      }
    }

    // Add padding
    padding = parseInt(padding, 10) || 0;
    trimY = Math.min(height - 1, trimY + padding);

    const newHeight = trimY + 1;
    if (newHeight >= height) {
      // Nothing to trim
      return;
    }

    if (logger) logger.log('reset', `Trimming ${height - newHeight}px from bottom of ${filePath}`);

    // Create a new PNG with the cropped height
    const dst = new PNG({ width, height: newHeight });
    png.bitblt(dst, 0, 0, width, newHeight, 0, 0);

    await savePng(dst, filePath);
  } catch (e) {
    if (logger) logger.warn('red', `Failed to trim image ${filePath}`, e);
  }
}

/**
 * Crops or extends the test image to exactly match the reference image's height.
 */
async function matchHeight (filePath, referenceFilePath, logger) {
  try {
    if (!fs.existsSync(filePath) || !fs.existsSync(referenceFilePath)) {
      return;
    }

    const [testPng, refPng] = await Promise.all([
      loadPng(filePath),
      loadPng(referenceFilePath)
    ]);

    if (testPng.height === refPng.height) {
      return;
    }

    if (logger) logger.log('reset', `Forcing test image height from ${testPng.height}px to ${refPng.height}px to match reference.`);

    // We create a new PNG initialized to transparent pixels.
    // If the reference is taller than the test image, it pads with transparency.
    // If the reference is shorter, it crops the bottom of the test image.
    const dst = new PNG({ width: testPng.width, height: refPng.height });

    // Copy pixels from test image to the new image
    const copyHeight = Math.min(testPng.height, refPng.height);
    testPng.bitblt(dst, 0, 0, testPng.width, copyHeight, 0, 0);

    await savePng(dst, filePath);
  } catch (e) {
    if (logger) logger.warn('red', `Failed to match image height for ${filePath}`, e);
  }
}

module.exports = {
  trimWhitespace,
  matchHeight
};
