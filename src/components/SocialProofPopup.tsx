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

const PAYMENT_METHODS = [
  { id: 'card', label: 'Card', icon: '💳', weight: 1 },
  { id: 'revolut', label: 'Revolut', icon: null, iconUrl: '/images/revolut-icon.svg', weight: 1 },
  { id: 'paypal', label: 'PayPal', icon: null, iconUrl: '/images/paypal-icon.svg', weight: 1.15 },
  { id: 'rewarble', label: 'Rewarble', icon: null, iconUrl: '/images/rewarble-icon.svg', weight: 1.40 },
  { id: 'bank_transfer', label: 'Bank Transfer', icon: '🏦', weight: 1 },
  { id: 'paysafecard', label: 'Paysafecard', icon: null, iconUrl: '/images/paysafecard.png', weight: 1 },
];

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

function pickRandomPaymentMethod(): typeof PAYMENT_METHODS[0] {
  const totalWeight = PAYMENT_METHODS.reduce((sum, m) => sum + m.weight, 0);
  let rand = Math.random() * totalWeight;
  for (const method of PAYMENT_METHODS) {
    rand -= method.weight;
    if (rand <= 0) return method;
  }
  return PAYMENT_METHODS[0];
}

function randomMinutesAgo(): string {
  const mins = Math.floor(Math.random() * 30) + 1;
  return `${mins} min${mins > 1 ? 's' : ''} ago`;
}

function randomInterval(): number {
  return (Math.floor(Math.random() * 16) + 15) * 1000; // 15-30 seconds
}

export const SocialProofPopup = () => {
  const [visible, setVisible] = useState(false);
  const [notification, setNotification] = useState<{
    product: typeof products[0];
    customerName: string;
    country: string;
    timeAgo: string;
    paymentMethod: typeof PAYMENT_METHODS[0];
  } | null>(null);
  const countryIndexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shuffledCountriesRef = useRef<string[]>([]);

  useEffect(() => {
    const arr = [...ALL_COUNTRIES];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    shuffledCountriesRef.current = arr;
  }, []);

  const scheduleNext = useCallback((fn: () => void) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(fn, randomInterval());
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
    const paymentMethod = pickRandomPaymentMethod();
    setNotification({ product, customerName: `${first} ${last.charAt(0)}.`, country, timeAgo, paymentMethod });
    setVisible(true);
    setTimeout(() => {
      setVisible(false);
      scheduleNext(showNotification);
    }, 9000);
  }, [scheduleNext]);

  useEffect(() => {
    const initialTimeout = setTimeout(showNotification, 8000);
    return () => {
      clearTimeout(initialTimeout);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [showNotification]);

  if (!notification) return null;

  const pm = notification.paymentMethod;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-5 left-5 z-50 w-[370px] rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, hsl(30 25% 98% / 0.97), hsl(30 20% 96% / 0.95))',
            boxShadow: '0 12px 40px -8px rgba(0,0,0,0.12), 0 4px 16px -4px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
            border: '1px solid hsl(30 15% 88%)',
          }}
        >
          {/* Top accent line */}
          <div className="h-[2.5px] w-full bg-gradient-to-r from-transparent via-accent to-transparent" />

          <div className="flex items-center gap-4 p-5">
            {/* Product image */}
            <div className="w-[72px] h-[82px] rounded-xl overflow-hidden flex-shrink-0 ring-1 ring-border/50"
              style={{ background: 'hsl(30 20% 94%)' }}
            >
              <img
                src={notification.product.image}
                alt={notification.product.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[13.5px] text-muted-foreground leading-snug">
                <span className="font-semibold text-foreground">{notification.customerName}</span>
                {' '}from <span className="text-foreground font-medium">{notification.country}</span>
              </p>
              <p className="text-[13.5px] font-semibold text-foreground mt-1 truncate">
                ordered {notification.product.name}
              </p>

              {/* Payment method + time */}
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md"
                  style={{ background: 'hsl(30 15% 92%)' }}
                >
                  {pm.icon ? (
                    <span className="text-sm">{pm.icon}</span>
                  ) : pm.iconUrl ? (
                    <img src={pm.iconUrl} alt={pm.label} className="w-5 h-5 object-contain" />
                  ) : null}
                  <span className="text-[11px] font-medium text-muted-foreground">{pm.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  <span className="text-[11px] text-muted-foreground">{notification.timeAgo}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setVisible(false)}
              className="text-muted-foreground/40 hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted/60 self-start -mt-1.5 -mr-1.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
