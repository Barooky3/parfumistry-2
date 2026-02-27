import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

const SESSION_KEY = 'profparfums-visitor-session';
const HEARTBEAT_INTERVAL = 15000; // 15 seconds

function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function detectBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  return 'Other';
}

function detectOS(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  return 'Other';
}

function detectDeviceType(): string {
  const w = window.innerWidth;
  if (w < 768) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}

function getCountryFromTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // Map common timezones to countries
    const tzMap: Record<string, string> = {
      'Europe/Sofia': 'Bulgaria', 'Europe/Berlin': 'Germany', 'Europe/Paris': 'France',
      'Europe/London': 'United Kingdom', 'Europe/Amsterdam': 'Netherlands', 'Europe/Brussels': 'Belgium',
      'Europe/Madrid': 'Spain', 'Europe/Rome': 'Italy', 'Europe/Vienna': 'Austria',
      'Europe/Warsaw': 'Poland', 'Europe/Prague': 'Czech Republic', 'Europe/Budapest': 'Hungary',
      'Europe/Bucharest': 'Romania', 'Europe/Athens': 'Greece', 'Europe/Helsinki': 'Finland',
      'Europe/Stockholm': 'Sweden', 'Europe/Oslo': 'Norway', 'Europe/Copenhagen': 'Denmark',
      'Europe/Dublin': 'Ireland', 'Europe/Lisbon': 'Portugal', 'Europe/Zurich': 'Switzerland',
      'America/New_York': 'United States', 'America/Chicago': 'United States',
      'America/Denver': 'United States', 'America/Los_Angeles': 'United States',
      'America/Toronto': 'Canada', 'America/Vancouver': 'Canada',
      'Asia/Tokyo': 'Japan', 'Asia/Shanghai': 'China', 'Asia/Seoul': 'South Korea',
      'Asia/Dubai': 'UAE', 'Asia/Riyadh': 'Saudi Arabia', 'Asia/Istanbul': 'Turkey',
      'Australia/Sydney': 'Australia', 'Pacific/Auckland': 'New Zealand',
    };
    // Try exact match first
    if (tzMap[tz]) return tzMap[tz];
    // Try region
    const region = tz.split('/')[0];
    if (region === 'Europe') return 'Europe';
    if (region === 'America') return 'Americas';
    if (region === 'Asia') return 'Asia';
    if (region === 'Africa') return 'Africa';
    return tz;
  } catch {
    return 'Unknown';
  }
}

export const VisitorTracker = () => {
  const location = useLocation();
  const { items, totalPrice } = useCart();
  const { user } = useAuth();
  const pagesViewedRef = useRef<string[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    // Track pages viewed
    const path = location.pathname;
    if (!pagesViewedRef.current.includes(path)) {
      pagesViewedRef.current = [...pagesViewedRef.current, path];
    }
  }, [location.pathname]);

  useEffect(() => {
    const sendHeartbeat = async () => {
      try {
        const cartItems = items.map(item => ({
          name: item.product.name,
          brand: item.product.brand,
          quantity: item.quantity,
          price: item.selectedPrice || item.product.price,
          ml: item.selectedMl,
        }));

        await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-visitor`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: getSessionId(),
              currentPage: location.pathname,
              cartItems,
              cartTotal: totalPrice,
              isInCheckout: location.pathname === '/checkout',
              country: getCountryFromTimezone(),
              deviceType: detectDeviceType(),
              browser: detectBrowser(),
              os: detectOS(),
              screenWidth: window.innerWidth,
              referrer: document.referrer || null,
              pagesViewed: pagesViewedRef.current,
              userEmail: user?.email || null,
            }),
          }
        );
      } catch {
        // Silent fail - don't disrupt user experience
      }
    };

    // Send immediately on mount/navigation
    sendHeartbeat();

    // Set up interval
    intervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [location.pathname, items, totalPrice, user]);

  return null; // Invisible component
};
