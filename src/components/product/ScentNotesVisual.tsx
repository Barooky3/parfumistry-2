import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const SCENT_NOTES_VERSION = 'v23';

interface ScentNotesVisualProps {
  scentNotes: {
    top: string[];
    heart: string[];
    base: string[];
  };
  scentNotesImage?: string;
}

/**
 * Removes white/light/grey backgrounds from scent note images
 * and converts dark text to white for dark-theme readability.
 * Preserves colorful illustration content untouched.
 */
function processImage(img: HTMLImageElement, canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const w = canvas.width;
  const h = canvas.height;

  // Step 1: Sample all 4 edges to find the dominant background color
  let bgR = 0, bgG = 0, bgB = 0, bgCount = 0;
  const samplePixel = (x: number, y: number) => {
    const idx = (y * w + x) * 4;
    if (data[idx + 3] > 200) {
      bgR += data[idx]; bgG += data[idx + 1]; bgB += data[idx + 2]; bgCount++;
    }
  };
  const edgePx = Math.min(20, Math.floor(Math.min(w, h) * 0.05));
  for (let y = 0; y < edgePx; y++) for (let x = 0; x < w; x++) samplePixel(x, y);
  for (let y = h - edgePx; y < h; y++) for (let x = 0; x < w; x++) samplePixel(x, y);
  for (let y = edgePx; y < h - edgePx; y++) {
    for (let x = 0; x < edgePx; x++) samplePixel(x, y);
    for (let x = w - edgePx; x < w; x++) samplePixel(x, y);
  }
  if (bgCount > 0) {
    bgR = Math.round(bgR / bgCount);
    bgG = Math.round(bgG / bgCount);
    bgB = Math.round(bgB / bgCount);
  }

  // Step 2: Determine if bg is light (white-ish)
  const bgBrightness = bgR * 0.299 + bgG * 0.587 + bgB * 0.114;
  const isLightBg = bgBrightness > 180;

  // Step 3: Process every pixel
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    if (a === 0) continue;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const chroma = max - min;
    const brightness = r * 0.299 + g * 0.587 + b * 0.114;

    // Distance to detected background color
    const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);

    // Only remove pixels very close to the background color AND very neutral
    if (dist < 35 && chroma < 15) {
      if (dist < 18) {
        data[i + 3] = 0;
      } else {
        data[i + 3] = Math.round(a * ((dist - 18) / 17));
      }
      continue;
    }

    // Pure white/near-white neutral pixels only (the actual flat background)
    if (isLightBg && brightness > 235 && chroma < 10) {
      data[i + 3] = 0;
      continue;
    }

    // --- DARK PIXEL LIGHTENING (text → white for dark theme) ---
    // Only target very dark, very low-chroma pixels (text/lines, not dark ingredients)
    if (brightness < 50 && chroma < 20) {
      const target = 230 + ((50 - brightness) / 50) * 25;
      data[i] = target; data[i + 1] = target; data[i + 2] = target;
      continue;
    }
    // Grey text
    if (brightness < 120 && chroma < 12) {
      const target = 200 + ((120 - brightness) / 120) * 55;
      data[i] = target; data[i + 1] = target; data[i + 2] = target;
      continue;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

export const ScentNotesVisual = ({ scentNotes, scentNotesImage }: ScentNotesVisualProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isProcessed, setIsProcessed] = useState(false);
  const hasTop = scentNotes.top && scentNotes.top.length > 0;
  const hasHeart = scentNotes.heart && scentNotes.heart.length > 0;
  const hasBase = scentNotes.base && scentNotes.base.length > 0;

  useEffect(() => {
    if (!scentNotesImage || !canvasRef.current) return;
    setIsProcessed(false);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (canvasRef.current) {
        processImage(img, canvasRef.current);
        setIsProcessed(true);
      }
    };
    img.src = `${scentNotesImage}?${SCENT_NOTES_VERSION}`;
  }, [scentNotesImage]);

  if (!hasTop && !hasHeart && !hasBase) return null;

  if (scentNotesImage) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <canvas
          ref={canvasRef}
          className="w-full max-w-md mx-auto"
          style={{ opacity: isProcessed ? 1 : 0, transition: 'opacity 0.3s ease' }}
        />
      </motion.div>
    );
  }

  // Fallback to text-based display
  return (
    <div className="py-6 space-y-6">
      {hasTop && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0 }}
          className="text-center"
        >
          <h4 className="text-sm md:text-base font-medium text-foreground mb-4">Top Notes</h4>
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {scentNotes.top.map((note) => (
              <span 
                key={note} 
                className="px-3 py-1.5 md:px-4 md:py-2 border border-border bg-background text-xs md:text-sm text-foreground rounded-full"
              >
                {note}
              </span>
            ))}
          </div>
        </motion.div>
      )}
      {hasHeart && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-center"
        >
          <h4 className="text-sm md:text-base font-medium text-foreground mb-4">Middle Notes</h4>
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {scentNotes.heart.map((note) => (
              <span 
                key={note} 
                className="px-3 py-1.5 md:px-4 md:py-2 border border-border bg-background text-xs md:text-sm text-foreground rounded-full"
              >
                {note}
              </span>
            ))}
          </div>
        </motion.div>
      )}
      {hasBase && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-center"
        >
          <h4 className="text-sm md:text-base font-medium text-foreground mb-4">Base Notes</h4>
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {scentNotes.base.map((note) => (
              <span 
                key={note} 
                className="px-3 py-1.5 md:px-4 md:py-2 border border-border bg-background text-xs md:text-sm text-foreground rounded-full"
              >
                {note}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
