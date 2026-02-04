import { motion } from 'framer-motion';

interface ScentNotesVisualProps {
  scentNotes: {
    top: string[];
    heart: string[];
    base: string[];
  };
}

const NoteSection = ({ 
  title, 
  notes, 
  delay = 0 
}: { 
  title: string; 
  notes: string[]; 
  delay?: number 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay }}
    className="text-center"
  >
    <h4 className="text-sm md:text-base font-medium text-foreground mb-4">{title}</h4>
    <div className="flex flex-wrap justify-center gap-2 md:gap-3">
      {notes.map((note) => (
        <span 
          key={note} 
          className="px-3 py-1.5 md:px-4 md:py-2 border border-border bg-background text-xs md:text-sm text-foreground rounded-full"
        >
          {note}
        </span>
      ))}
    </div>
  </motion.div>
);

export const ScentNotesVisual = ({ scentNotes }: ScentNotesVisualProps) => {
  const hasTop = scentNotes.top && scentNotes.top.length > 0;
  const hasHeart = scentNotes.heart && scentNotes.heart.length > 0;
  const hasBase = scentNotes.base && scentNotes.base.length > 0;

  if (!hasTop && !hasHeart && !hasBase) return null;

  return (
    <div className="py-6 space-y-6">
      {hasTop && <NoteSection title="Top Notes" notes={scentNotes.top} delay={0} />}
      {hasHeart && <NoteSection title="Middle Notes" notes={scentNotes.heart} delay={0.1} />}
      {hasBase && <NoteSection title="Base Notes" notes={scentNotes.base} delay={0.2} />}
    </div>
  );
};
