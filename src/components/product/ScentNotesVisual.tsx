import { motion } from 'framer-motion';

// Cache bust version - increment when updating images
const SCENT_NOTES_VERSION = 'v2';

interface ScentNotesVisualProps {
  scentNotes: {
    top: string[];
    heart: string[];
    base: string[];
  };
  scentNotesImage?: string;
}

export const ScentNotesVisual = ({ scentNotes, scentNotesImage }: ScentNotesVisualProps) => {
  const hasTop = scentNotes.top && scentNotes.top.length > 0;
  const hasHeart = scentNotes.heart && scentNotes.heart.length > 0;
  const hasBase = scentNotes.base && scentNotes.base.length > 0;

  if (!hasTop && !hasHeart && !hasBase) return null;

  // If we have a combined scent notes image, show that
  if (scentNotesImage) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="py-4 bg-white rounded-lg p-4"
      >
        <img 
          src={`${scentNotesImage}?${SCENT_NOTES_VERSION}`} 
          alt="Fragrance Notes" 
          className="w-full max-w-md mx-auto"
          loading="lazy"
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
