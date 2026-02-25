import { useState, useEffect, useCallback, useRef } from 'react';
import { X } from 'lucide-react';
import { products, bestsellerIds } from '@/data/products';
import { motion, AnimatePresence } from 'framer-motion';

const NAMES_BY_COUNTRY: Record<string, { first: string[]; last: string[] }> = {
  'Netherlands': { first: ['Daan', 'Sem', 'Lieke', 'Fleur', 'Thijs', 'Noor', 'Ruben', 'Femke', 'Bram', 'Sanne'], last: ['de Vries', 'Jansen', 'Bakker', 'Visser', 'Smit', 'Meijer', 'Mulder', 'Bos', 'Vos', 'Peters'] },
  'Belgium': { first: ['Wout', 'Lore', 'Tibo', 'Noor', 'Senne', 'Fien', 'Matteo', 'Roos', 'Emile', 'Axelle'], last: ['Peeters', 'Janssens', 'Maes', 'Willems', 'Claes', 'Goossens', 'Wouters', 'De Smedt', 'Hermans', 'Jacobs'] },
  'Germany': { first: ['Lukas', 'Mia', 'Finn', 'Lena', 'Moritz', 'Clara', 'Elias', 'Lea', 'Nico', 'Emilia'], last: ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Wagner', 'Becker', 'Hoffmann', 'Richter', 'Klein'] },
  'France': { first: ['Hugo', 'Léa', 'Louis', 'Manon', 'Jules', 'Camille', 'Arthur', 'Chloé', 'Raphaël', 'Inès'], last: ['Martin', 'Bernard', 'Dubois', 'Laurent', 'Moreau', 'Lefèvre', 'Roux', 'Girard', 'Bonnet', 'Dupont'] },
  'United Kingdom': { first: ['Oliver', 'Amelia', 'George', 'Isla', 'Freddie', 'Florence', 'Archie', 'Ivy', 'Oscar', 'Rosie'], last: ['Smith', 'Taylor', 'Brown', 'Wilson', 'Davies', 'Evans', 'Thomas', 'Roberts', 'Walker', 'Clarke'] },
  'Spain': { first: ['Mateo', 'Lucía', 'Hugo', 'Martina', 'Pablo', 'Sofía', 'Daniel', 'Valeria', 'Álvaro', 'Claudia'], last: ['García', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Ruiz', 'Hernández', 'Díaz'] },
  'Italy': { first: ['Leonardo', 'Sofia', 'Francesco', 'Aurora', 'Alessandro', 'Giulia', 'Lorenzo', 'Alice', 'Matteo', 'Ginevra'], last: ['Rossi', 'Russo', 'Ferrari', 'Esposito', 'Bianchi', 'Romano', 'Colombo', 'Ricci', 'Marino', 'Greco'] },
  'Poland': { first: ['Antoni', 'Zuzanna', 'Jakub', 'Hanna', 'Szymon', 'Maja', 'Filip', 'Lena', 'Mikołaj', 'Alicja'], last: ['Nowak', 'Kowalski', 'Wiśniewski', 'Wójcik', 'Kamiński', 'Lewandowski', 'Zieliński', 'Szymański', 'Woźniak', 'Dąbrowski'] },
  'Sweden': { first: ['Liam', 'Astrid', 'Elias', 'Maja', 'William', 'Ella', 'Hugo', 'Ebba', 'Oscar', 'Wilma'], last: ['Andersson', 'Johansson', 'Karlsson', 'Nilsson', 'Eriksson', 'Larsson', 'Olsson', 'Persson', 'Svensson', 'Gustafsson'] },
  'United States': { first: ['Ethan', 'Sophia', 'Mason', 'Olivia', 'Caleb', 'Ava', 'Noah', 'Mia', 'Logan', 'Harper'], last: ['Johnson', 'Williams', 'Davis', 'Miller', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin'] },
  'Portugal': { first: ['Santiago', 'Leonor', 'Tomás', 'Matilde', 'Martim', 'Beatriz', 'Rodrigo', 'Carolina', 'Afonso', 'Mariana'], last: ['Silva', 'Santos', 'Ferreira', 'Pereira', 'Oliveira', 'Costa', 'Rodrigues', 'Martins', 'Sousa', 'Fernandes'] },
  'Austria': { first: ['Felix', 'Anna', 'Paul', 'Laura', 'David', 'Sarah', 'Jonas', 'Sophie', 'Maximilian', 'Marie'], last: ['Gruber', 'Huber', 'Bauer', 'Wagner', 'Steiner', 'Pichler', 'Moser', 'Berger', 'Mayer', 'Hofer'] },
  'Denmark': { first: ['Noah', 'Alma', 'Oscar', 'Ida', 'William', 'Freja', 'Lucas', 'Clara', 'Emil', 'Ella'], last: ['Nielsen', 'Jensen', 'Hansen', 'Andersen', 'Pedersen', 'Christensen', 'Larsen', 'Sørensen', 'Rasmussen', 'Madsen'] },
  'Norway': { first: ['Nora', 'Jakob', 'Emma', 'Filip', 'Olivia', 'Aksel', 'Ella', 'Henrik', 'Ingrid', 'Theodor'], last: ['Hansen', 'Johansen', 'Olsen', 'Larsen', 'Andersen', 'Pedersen', 'Nilsen', 'Kristiansen', 'Karlsen', 'Eriksen'] },
  'Switzerland': { first: ['Liam', 'Mia', 'Noah', 'Elena', 'Leon', 'Lara', 'Luca', 'Emilia', 'Julian', 'Sara'], last: ['Müller', 'Meier', 'Schmid', 'Keller', 'Weber', 'Huber', 'Schneider', 'Meyer', 'Steiner', 'Fischer'] },
};

const ALL_COUNTRIES = Object.keys(NAMES_BY_COUNTRY);
const inStockProducts = products.filter(p => p.inStock);

function pickRandomProduct(): typeof products[0] {
  const rand = Math.random();
  if (rand < 0.30) {
    const bundles = inStockProducts.filter(p => p.isBundle);
    if (bundles.length > 0) return bundles[Math.floor(Math.random() * bundles.length)];
  }
  if (rand < 0.40) {
    const bestsellers = inStockProducts.filter(p => bestsellerIds.includes(p.id) && !p.isBundle);
    if (bestsellers.length > 0) return bestsellers[Math.floor(Math.random() * bestsellers.length)];
  }
  return inStockProducts[Math.floor(Math.random() * inStockProducts.length)];
}

function randomMinutesAgo(): string {
  const mins = Math.floor(Math.random() * 30) + 1;
  return `${mins} min${mins > 1 ? 's' : ''} ago`;
}

export const SocialProofPopup = () => {
  const [visible, setVisible] = useState(false);
  const [notification, setNotification] = useState<{ product: typeof products[0]; customerName: string; country: string; timeAgo: string } | null>(null);
  const countryIndexRef = useRef(0);
  // Shuffle countries once
  const shuffledCountriesRef = useRef<string[]>([]);

  useEffect(() => {
    const arr = [...ALL_COUNTRIES];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    shuffledCountriesRef.current = arr;
  }, []);

  const showNotification = useCallback(() => {
    const countries = shuffledCountriesRef.current;
    if (countries.length === 0) return;
    const country = countries[countryIndexRef.current % countries.length];
    countryIndexRef.current++;

    const names = NAMES_BY_COUNTRY[country];
    const first = names.first[Math.floor(Math.random() * names.first.length)];
    const last = names.last[Math.floor(Math.random() * names.last.length)];

    const product = pickRandomProduct();
    const timeAgo = randomMinutesAgo();
    setNotification({ product, customerName: `${first} ${last.charAt(0)}.`, country, timeAgo });
    setVisible(true);
    setTimeout(() => setVisible(false), 5000);
  }, []);

  useEffect(() => {
    const initialTimeout = setTimeout(showNotification, 10000);
    const interval = setInterval(showNotification, 20000);
    return () => { clearTimeout(initialTimeout); clearInterval(interval); };
  }, [showNotification]);

  if (!notification) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-5 left-5 z-50 w-[340px] bg-background/95 backdrop-blur-md border border-border/60 rounded-xl shadow-[0_8px_30px_-4px_hsl(var(--accent)/0.15),0_2px_8px_-2px_rgba(0,0,0,0.4)] overflow-hidden"
        >
          {/* Accent top bar */}
          <div className="h-[2px] w-full bg-gradient-to-r from-accent/60 via-accent to-accent/60" />

          <div className="flex items-center gap-3.5 p-4">
            {/* Product image */}
            <div className="w-14 h-16 rounded-lg bg-secondary/40 border border-border/40 overflow-hidden flex-shrink-0">
              <img
                src={notification.product.image}
                alt={notification.product.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-muted-foreground leading-snug">
                <span className="font-semibold text-foreground">{notification.customerName}</span>
                {' '}from <span className="text-foreground">{notification.country}</span>
              </p>
              <p className="text-[13px] font-medium text-foreground mt-0.5 truncate">
                ordered {notification.product.name}
              </p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <span className="text-[11px] text-muted-foreground">{notification.timeAgo}</span>
              </div>
            </div>

            <button
              onClick={() => setVisible(false)}
              className="text-muted-foreground/50 hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted/50 self-start -mt-1 -mr-1"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
