import { motion } from 'framer-motion';

interface ScentNotesVisualProps {
  scentNotes: {
    top: string[];
    heart: string[];
    base: string[];
  };
  scentNotesImage?: string;
}

const NoteSection = ({ 
  label, 
  notes, 
  delay 
}: { 
  label: string; 
  notes: string[]; 
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.35, delay }}
    className="space-y-2.5"
  >
    <p className="text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">
      {label}
    </p>
    <div className="flex flex-wrap gap-1.5 md:gap-2">
      {notes.map((note) => (
        <span
          key={note}
          className="px-3 py-1.5 md:px-4 md:py-2 text-[11px] md:text-xs font-medium tracking-wide text-foreground border border-border/60 bg-background/50 rounded-full transition-colors hover:border-primary/40"
        >
          {note}
        </span>
      ))}
    </div>
  </motion.div>
);

export const ScentNotesVisual = ({ scentNotes }: ScentNotesVisualProps) => {
  const hasTop = scentNotes.top?.length > 0;
  const hasHeart = scentNotes.heart?.length > 0;
  const hasBase = scentNotes.base?.length > 0;

  if (!hasTop && !hasHeart && !hasBase) return null;

  return (
    <div className="space-y-5">
      <h3 className="text-xs md:text-sm font-semibold tracking-[0.15em] uppercase text-foreground">
        Fragrance Notes
      </h3>
      <div className="space-y-4">
        {hasTop && <NoteSection label="Top" notes={scentNotes.top} delay={0} />}
        {hasHeart && <NoteSection label="Heart" notes={scentNotes.heart} delay={0.08} />}
        {hasBase && <NoteSection label="Base" notes={scentNotes.base} delay={0.16} />}
      </div>
    </div>
  );
};
