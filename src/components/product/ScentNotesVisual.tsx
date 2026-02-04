import { motion } from 'framer-motion';

interface ScentNotesVisualProps {
  scentNotes: {
    top: string[];
    heart: string[];
    base: string[];
  };
}

// Mapping of ingredient names to their image URLs (from various sources)
const ingredientImages: Record<string, string> = {
  // Common ingredients with images
  'Pink Pepper': 'https://cdn.shopify.com/s/files/1/1026/4186/0946/files/pink-pepper.png?v=1768733957',
  'Juniper': 'https://cdn.shopify.com/s/files/1/1026/4186/0946/files/juniper.png?v=1768733957',
  'Juniper Berries': 'https://cdn.shopify.com/s/files/1/1026/4186/0946/files/juniper.png?v=1768733957',
  'Violet': 'https://cdn.shopify.com/s/files/1/1026/4186/0946/files/violet.png?v=1768733957',
  'Toffee': 'https://cdn.shopify.com/s/files/1/1026/4186/0946/files/toffee.png?v=1768733957',
  'Cinnamon': 'https://cdn.shopify.com/s/files/1/1026/4186/0946/files/cinnamon.png?v=1768733957',
  'Lavender': 'https://cdn.shopify.com/s/files/1/1026/4186/0946/files/lavender.png?v=1768733957',
  'Sage': 'https://cdn.shopify.com/s/files/1/1026/4186/0946/files/sage.png?v=1768733957',
  'Vanilla': 'https://cdn.shopify.com/s/files/1/1026/4186/0946/files/vanilla.png?v=1768733957',
  'Amber': 'https://cdn.shopify.com/s/files/1/1026/4186/0946/files/amber.png?v=1768733957',
  'Tonka Bean': 'https://cdn.shopify.com/s/files/1/1026/4186/0946/files/tonka-bean.png?v=1768733957',
  'Suede': 'https://cdn.shopify.com/s/files/1/1026/4186/0946/files/suede.png?v=1768733957',
  'Coffee': 'https://cdn.shopify.com/s/files/1/1026/4186/0946/files/coffee.png?v=1768733957',
  'Bergamot': 'https://cdn.shopify.com/s/files/1/1026/4186/0946/files/bergamot.png?v=1768733957',
  'Musk': 'https://cdn.shopify.com/s/files/1/1026/4186/0946/files/musk.png?v=1768733957',
  'Sandalwood': 'https://cdn.shopify.com/s/files/1/1026/4186/0946/files/sandalwood.png?v=1768733957',
  'Rose': 'https://cdn.shopify.com/s/files/1/1026/4186/0946/files/rose.png?v=1768733957',
  'Oud': 'https://cdn.shopify.com/s/files/1/1026/4186/0946/files/oud.png?v=1768733957',
  'Patchouli': 'https://cdn.shopify.com/s/files/1/1026/4186/0946/files/patchouli.png?v=1768733957',
  'Coconut': 'https://cdn.shopify.com/s/files/1/1026/4186/0946/files/coconut.png?v=1768733957',
  'Pineapple': 'https://cdn.shopify.com/s/files/1/1026/4186/0946/files/pineapple.png?v=1768733957',
  'Apple': 'https://cdn.shopify.com/s/files/1/1026/4186/0946/files/apple.png?v=1768733957',
  'Lemon': 'https://cdn.shopify.com/s/files/1/1026/4186/0946/files/lemon.png?v=1768733957',
  'Mint': 'https://cdn.shopify.com/s/files/1/1026/4186/0946/files/mint.png?v=1768733957',
  'Jasmine': 'https://cdn.shopify.com/s/files/1/1026/4186/0946/files/jasmine.png?v=1768733957',
  'Saffron': 'https://cdn.shopify.com/s/files/1/1026/4186/0946/files/saffron.png?v=1768733957',
  'Tobacco': 'https://cdn.shopify.com/s/files/1/1026/4186/0946/files/tobacco.png?v=1768733957',
  'Praline': 'https://cdn.shopify.com/s/files/1/1026/4186/0946/files/praline.png?v=1768733957',
  'Cardamom': 'https://cdn.shopify.com/s/files/1/1026/4186/0946/files/cardamom.png?v=1768733957',
  'Iris': 'https://cdn.shopify.com/s/files/1/1026/4186/0946/files/iris.png?v=1768733957',
  'Ginger': 'https://cdn.shopify.com/s/files/1/1026/4186/0946/files/ginger.png?v=1768733957',
  'Orange Blossom': 'https://cdn.shopify.com/s/files/1/1026/4186/0946/files/orange-blossom.png?v=1768733957',
  'Cedar': 'https://cdn.shopify.com/s/files/1/1026/4186/0946/files/cedar.png?v=1768733957',
  'Vetiver': 'https://cdn.shopify.com/s/files/1/1026/4186/0946/files/vetiver.png?v=1768733957',
};

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
    <div className="flex flex-wrap justify-center gap-4 md:gap-6">
      {notes.map((note) => (
        <div key={note} className="flex flex-col items-center gap-2">
          {ingredientImages[note] ? (
            <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center">
              <img 
                src={ingredientImages[note]} 
                alt={note}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="w-14 h-14 md:w-16 md:h-16 bg-secondary/50 rounded-full flex items-center justify-center">
              <span className="text-xl">{note.charAt(0)}</span>
            </div>
          )}
          <span className="text-xs md:text-sm text-muted-foreground">{note}</span>
        </div>
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
    <div className="py-8 space-y-8">
      {hasTop && <NoteSection title="Top Notes" notes={scentNotes.top} delay={0} />}
      {hasHeart && <NoteSection title="Middle Notes" notes={scentNotes.heart} delay={0.1} />}
      {hasBase && <NoteSection title="Base Notes" notes={scentNotes.base} delay={0.2} />}
    </div>
  );
};
