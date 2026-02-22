import { motion } from 'framer-motion';

interface ScentNotesVisualProps {
  scentNotes: {
    top: string[];
    heart: string[];
    base: string[];
  };
  accentColor?: string;
}

const NoteSection = ({ 
  label, 
  notes, 
  delay,
  accentColor,
}: { 
  label: string; 
  notes: string[]; 
  delay: number;
  accentColor?: string;
}) => {
  const pillStyle = accentColor
    ? {
        borderColor: accentColor,
        backgroundColor: `${accentColor}15`,
        color: accentColor,
      }
    : undefined;

  const labelStyle = accentColor
    ? { color: `${accentColor}99` }
    : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay }}
      className="space-y-3"
    >
      <p
        className="text-xs md:text-sm font-semibold tracking-[0.2em] uppercase text-muted-foreground"
        style={labelStyle}
      >
        {label}
      </p>
      <div className="flex flex-wrap gap-2 md:gap-2.5">
        {notes.map((note) => (
          <span
            key={note}
            className="px-4 py-2 md:px-5 md:py-2.5 text-xs md:text-sm font-medium tracking-wide border border-border/60 bg-background/50 rounded-full transition-all duration-200 hover:scale-105"
            style={pillStyle}
          >
            {note}
          </span>
        ))}
      </div>
    </motion.div>
  );
};

export const ScentNotesVisual = ({ scentNotes, accentColor }: ScentNotesVisualProps) => {
  const hasTop = scentNotes.top?.length > 0;
  const hasHeart = scentNotes.heart?.length > 0;
  const hasBase = scentNotes.base?.length > 0;

  if (!hasTop && !hasHeart && !hasBase) return null;

  const titleStyle = accentColor ? { color: accentColor } : undefined;

  return (
    <div className="space-y-6">
      <h3
        className="text-sm md:text-base font-semibold tracking-[0.15em] uppercase text-foreground"
        style={titleStyle}
      >
        Fragrance Notes
      </h3>
      <div className="space-y-5">
        {hasTop && <NoteSection label="Top" notes={scentNotes.top} delay={0} accentColor={accentColor} />}
        {hasHeart && <NoteSection label="Heart" notes={scentNotes.heart} delay={0.08} accentColor={accentColor} />}
        {hasBase && <NoteSection label="Base" notes={scentNotes.base} delay={0.16} accentColor={accentColor} />}
      </div>
    </div>
  );
};
