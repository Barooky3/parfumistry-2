import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const SCENT_NOTES_VERSION = 'v18';

interface ScentNotesVisualProps {
  scentNotes: {
    top: string[];
    heart: string[];
    base: string[];
  };
  scentNotesImage?: string;
}

/**
 * Removes white/grey/light backgrounds and checkered artifacts from images.
 * Also lightens dark text for readability on dark backgrounds.
 */
function removeWhiteBackground(img: HTMLImageElement, canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const w = canvas.width;

  // Sample edges to detect background color
  const edgeRows = Math.min(15, Math.floor(canvas.height * 0.04));
  let bgR = 0, bgG = 0, bgB = 0, bgCount = 0;
  for (let y = 0; y < edgeRows; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      if (data[idx + 3] > 200) { bgR += data[idx]; bgG += data[idx+1]; bgB += data[idx+2]; bgCount++; }
    }
  }
  for (let y = canvas.height - edgeRows; y < canvas.height; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      if (data[idx + 3] > 200) { bgR += data[idx]; bgG += data[idx+1]; bgB += data[idx+2]; bgCount++; }
    }
  }
  if (bgCount > 0) { bgR = Math.round(bgR/bgCount); bgG = Math.round(bgG/bgCount); bgB = Math.round(bgB/bgCount); }

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
    if (a === 0) continue;

    const brightness = r * 0.299 + g * 0.587 + b * 0.114;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const saturation = max === 0 ? 0 : (max - min) / max;

    // Distance to detected background
    const distBg = Math.sqrt((r-bgR)**2 + (g-bgG)**2 + (b-bgB)**2);

    // Remove pixels close to background color
    if (distBg < 40 && saturation < 0.2) {
      data[i+3] = 0;
    }
    // Feather near-background
    else if (distBg < 65 && saturation < 0.15) {
      data[i+3] = Math.round(a * ((distBg - 40) / 25));
    }
    // Catch-all: any neutral light pixel
    else if (brightness > 190 && saturation < 0.15) {
      data[i+3] = 0;
    }
    // Grey checkered pattern (~140-210 brightness, near-zero saturation)
    else if (Math.abs(r-g) < 8 && Math.abs(g-b) < 8 && brightness > 140 && saturation < 0.06) {
      data[i+3] = 0;
    }
    // Feather medium greys
    else if (brightness > 160 && saturation < 0.1) {
      const fade = (brightness - 160) / 30;
      data[i+3] = Math.round(a * Math.max(0, 1 - fade));
    }
    // Lighten dark text
    else if (brightness < 80 && saturation < 0.2) {
      data[i] = 230; data[i+1] = 230; data[i+2] = 230;
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
        removeWhiteBackground(img, canvasRef.current);
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
