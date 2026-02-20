import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const SCENT_NOTES_VERSION = 'v17';

interface ScentNotesVisualProps {
  scentNotes: {
    top: string[];
    heart: string[];
    base: string[];
  };
  scentNotesImage?: string;
}

/**
 * Removes white/near-white background from an image using canvas pixel manipulation.
 * Similar to remove.bg but runs client-side.
 */
function removeWhiteBackground(img: HTMLImageElement, canvas: HTMLCanvasElement, threshold = 235) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // If the pixel is near-white, make it transparent
    if (r > threshold && g > threshold && b > threshold) {
      data[i + 3] = 0; // Set alpha to 0
    }
    // Feather semi-white pixels for smoother edges
    else if (r > threshold - 30 && g > threshold - 30 && b > threshold - 30) {
      const avgDist = ((threshold - r) + (threshold - g) + (threshold - b)) / 3;
      const alpha = Math.min(255, Math.round((avgDist / 30) * 255));
      data[i + 3] = Math.min(data[i + 3], alpha);
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
