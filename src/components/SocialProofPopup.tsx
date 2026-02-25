import { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, X } from 'lucide-react';
import { products } from '@/data/products';
import { bestsellerIds } from '@/data/products';
import { motion, AnimatePresence } from 'framer-motion';

// Names by region – believable, non-cliché
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
};

const ALL_COUNTRIES = Object.keys(NAMES_BY_COUNTRY);

const bundleIds = products.filter(p => p.isBundle).map(p => p.id);
const inStockProducts = products.filter(p => p.inStock);

function pickRandomProduct(): typeof products[0] {
  const rand = Math.random();
  
  // 30% chance bundle
  if (rand < 0.30) {
    const bundles = inStockProducts.filter(p => p.isBundle);
    if (bundles.length > 0) return bundles[Math.floor(Math.random() * bundles.length)];
  }
  
  // 10% increased chance bestseller
  if (rand < 0.40) {
    const bestsellers = inStockProducts.filter(p => bestsellerIds.includes(p.id) && !p.isBundle);
    if (bestsellers.length > 0) return bestsellers[Math.floor(Math.random() * bestsellers.length)];
  }
  
  // Regular random
  return inStockProducts[Math.floor(Math.random() * inStockProducts.length)];
}

function pickRandomCustomer() {
  const country = ALL_COUNTRIES[Math.floor(Math.random() * ALL_COUNTRIES.length)];
  const names = NAMES_BY_COUNTRY[country];
  const first = names.first[Math.floor(Math.random() * names.first.length)];
  const last = names.last[Math.floor(Math.random() * names.last.length)];
  return { name: `${first} ${last.charAt(0)}.`, country };
}

function randomMinutesAgo(): string {
  const mins = Math.floor(Math.random() * 30) + 1;
  return `${mins} min${mins > 1 ? 's' : ''} ago`;
}

export const SocialProofPopup = () => {
  const [visible, setVisible] = useState(false);
  const [notification, setNotification] = useState<{ product: typeof products[0]; customer: { name: string; country: string }; timeAgo: string } | null>(null);

  const showNotification = useCallback(() => {
    const product = pickRandomProduct();
    const customer = pickRandomCustomer();
    const timeAgo = randomMinutesAgo();
    setNotification({ product, customer, timeAgo });
    setVisible(true);
    
    // Auto-hide after 5 seconds
    setTimeout(() => setVisible(false), 5000);
  }, []);

  useEffect(() => {
    // First popup after 10 seconds
    const initialTimeout = setTimeout(showNotification, 10000);
    
    // Then every 20 seconds
    const interval = setInterval(showNotification, 20000);
    
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [showNotification]);

  if (!notification) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: 0 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed bottom-4 left-4 z-50 max-w-[320px] bg-card border border-border rounded-lg shadow-xl overflow-hidden"
        >
          <div className="flex items-start gap-3 p-3">
            {/* Product image */}
            <div className="w-12 h-14 rounded bg-secondary/50 overflow-hidden flex-shrink-0">
              <img
                src={notification.product.image}
                alt={notification.product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground leading-snug">
                <span className="font-semibold">{notification.customer.name}</span>
                {' '}from {notification.customer.country} ordered
              </p>
              <p className="text-xs font-medium text-foreground mt-0.5 truncate">
                {notification.product.name}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {notification.timeAgo}
              </p>
            </div>

            <button
              onClick={() => setVisible(false)}
              className="text-muted-foreground hover:text-foreground transition-colors p-0.5 -mt-0.5 -mr-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
