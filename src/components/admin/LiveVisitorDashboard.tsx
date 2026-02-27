import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Eye, ShoppingCart, CreditCard, Globe, Monitor, Smartphone, Tablet,
  RefreshCw, MapPin, ArrowRight, Clock, Users
} from 'lucide-react';

interface VisitorSession {
  id: string;
  session_id: string;
  current_page: string;
  cart_items: any[];
  cart_total: number;
  is_in_checkout: boolean;
  country: string | null;
  city: string | null;
  region: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  screen_width: number | null;
  referrer: string | null;
  pages_viewed: string[];
  last_seen_at: string;
  created_at: string;
}

const PAGE_LABELS: Record<string, string> = {
  '/': 'Home',
  '/shop': 'Shop',
  '/checkout': 'Checkout',
  '/contact': 'Contact',
  '/login': 'Login',
  '/signup': 'Sign Up',
  '/account': 'Account',
};

function getPageLabel(path: string): string {
  if (PAGE_LABELS[path]) return PAGE_LABELS[path];
  if (path.startsWith('/product/')) return 'Product Page';
  if (path.startsWith('/shop/')) return 'Shop Category';
  return path;
}

function getDeviceIcon(type: string | null) {
  if (type === 'mobile') return <Smartphone className="h-3.5 w-3.5" />;
  if (type === 'tablet') return <Tablet className="h-3.5 w-3.5" />;
  return <Monitor className="h-3.5 w-3.5" />;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 10) return 'just now';
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  return `${mins}m ago`;
}

export default function LiveVisitorDashboard() {
  const [sessions, setSessions] = useState<VisitorSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchSessions = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-visitor`,
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      const json = await res.json();
      if (res.ok) setSessions(json.sessions || []);
    } catch { /* silent */ }
    setLoading(false);
  };

  useEffect(() => {
    fetchSessions();
    if (!autoRefresh) return;
    const interval = setInterval(fetchSessions, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Stats
  const stats = useMemo(() => {
    const total = sessions.length;
    const inCheckout = sessions.filter(s => s.is_in_checkout).length;
    const withCart = sessions.filter(s => s.cart_items && s.cart_items.length > 0).length;
    const totalCartValue = sessions.reduce((sum, s) => sum + (s.cart_total || 0), 0);

    // Country breakdown
    const countries: Record<string, number> = {};
    sessions.forEach(s => {
      const c = s.country || 'Unknown';
      countries[c] = (countries[c] || 0) + 1;
    });

    // Device breakdown
    const devices: Record<string, number> = {};
    sessions.forEach(s => {
      const d = s.device_type || 'unknown';
      devices[d] = (devices[d] || 0) + 1;
    });

    // Page breakdown
    const pages: Record<string, number> = {};
    sessions.forEach(s => {
      const p = getPageLabel(s.current_page);
      pages[p] = (pages[p] || 0) + 1;
    });

    // Browser breakdown
    const browsers: Record<string, number> = {};
    sessions.forEach(s => {
      const b = s.browser || 'Unknown';
      browsers[b] = (browsers[b] || 0) + 1;
    });

    return { total, inCheckout, withCart, totalCartValue, countries, devices, pages, browsers };
  }, [sessions]);

  const sortedCountries = Object.entries(stats.countries).sort((a, b) => b[1] - a[1]);
  const sortedPages = Object.entries(stats.pages).sort((a, b) => b[1] - a[1]);
  const sortedDevices = Object.entries(stats.devices).sort((a, b) => b[1] - a[1]);
  const sortedBrowsers = Object.entries(stats.browsers).sort((a, b) => b[1] - a[1]);

  // Sessions with active carts
  const cartSessions = sessions.filter(s => s.cart_items && s.cart_items.length > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
          </div>
          <h2 className="text-lg font-semibold">Live Visitors</h2>
          <Badge variant="outline" className="text-green-600 border-green-300 font-mono text-lg px-3">
            {stats.total}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
              autoRefresh
                ? 'bg-green-50 text-green-700 border-green-300'
                : 'bg-muted text-muted-foreground border-input'
            }`}
          >
            {autoRefresh ? '● Auto-refresh ON' : '○ Auto-refresh OFF'}
          </button>
          <Button variant="outline" size="sm" onClick={fetchSessions} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="border rounded-lg p-4 bg-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Eye className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wider">Browsing</span>
          </div>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="border rounded-lg p-4 bg-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <ShoppingCart className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wider">Active Carts</span>
          </div>
          <p className="text-2xl font-bold">{stats.withCart}</p>
          {stats.totalCartValue > 0 && (
            <p className="text-xs text-muted-foreground">€{stats.totalCartValue.toFixed(2)} total</p>
          )}
        </div>
        <div className="border rounded-lg p-4 bg-card">
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <CreditCard className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wider">In Checkout</span>
          </div>
          <p className="text-2xl font-bold text-amber-600">{stats.inCheckout}</p>
        </div>
        <div className="border rounded-lg p-4 bg-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Globe className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wider">Countries</span>
          </div>
          <p className="text-2xl font-bold">{sortedCountries.length}</p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Current Pages */}
        <div className="border rounded-lg p-4 bg-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5" /> Currently Viewing
          </p>
          {sortedPages.length === 0 ? (
            <p className="text-sm text-muted-foreground">No visitors</p>
          ) : (
            <div className="space-y-2">
              {sortedPages.map(([page, count]) => (
                <div key={page} className="flex items-center justify-between">
                  <span className="text-sm">{page}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(count / stats.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground w-6 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Countries */}
        <div className="border rounded-lg p-4 bg-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> Visitor Locations
          </p>
          {sortedCountries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data</p>
          ) : (
            <div className="space-y-2">
              {sortedCountries.map(([country, count]) => (
                <div key={country} className="flex items-center justify-between">
                  <span className="text-sm">{country}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(count / stats.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground w-6 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Devices */}
        <div className="border rounded-lg p-4 bg-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Monitor className="h-3.5 w-3.5" /> Devices & Browsers
          </p>
          <div className="space-y-3">
            <div className="flex gap-3">
              {sortedDevices.map(([device, count]) => (
                <div key={device} className="flex items-center gap-1.5 text-sm">
                  {getDeviceIcon(device)}
                  <span className="capitalize">{device}</span>
                  <span className="text-xs font-mono text-muted-foreground">({count})</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-2 flex flex-wrap gap-2">
              {sortedBrowsers.map(([browser, count]) => (
                <Badge key={browser} variant="outline" className="text-xs">
                  {browser} ({count})
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Active Carts */}
        <div className="border rounded-lg p-4 bg-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <ShoppingCart className="h-3.5 w-3.5" /> Active Carts ({cartSessions.length})
          </p>
          {cartSessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active carts</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {cartSessions.map(s => (
                <div key={s.session_id} className="border rounded-md p-3 text-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(s.device_type)}
                      <span className="text-xs text-muted-foreground">{s.country || 'Unknown'}</span>
                      {s.is_in_checkout && (
                        <Badge className="bg-amber-100 text-amber-800 text-[10px]">
                          <CreditCard className="h-2.5 w-2.5 mr-0.5" /> Checkout
                        </Badge>
                      )}
                    </div>
                    <span className="font-semibold">€{(s.cart_total || 0).toFixed(2)}</span>
                  </div>
                  <div className="space-y-0.5">
                    {(s.cart_items || []).map((item: any, i: number) => (
                      <div key={i} className="text-xs text-muted-foreground flex justify-between">
                        <span>{item.brand} — {item.name}{item.ml ? ` (${item.ml}ml)` : ''}{item.quantity > 1 ? ` x${item.quantity}` : ''}</span>
                        <span>€{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Individual Visitors */}
      <div className="border rounded-lg p-4 bg-card">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" /> All Active Sessions ({sessions.length})
        </p>
        {sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No active visitors</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {sessions.map(s => (
              <div key={s.session_id} className="border rounded-md p-3 text-sm flex items-center gap-3">
                {getDeviceIcon(s.device_type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{getPageLabel(s.current_page)}</span>
                    {s.cart_items && s.cart_items.length > 0 && (
                      <Badge variant="outline" className="text-[10px]">
                        <ShoppingCart className="h-2.5 w-2.5 mr-0.5" /> {s.cart_items.length} items
                      </Badge>
                    )}
                    {s.is_in_checkout && (
                      <Badge className="bg-amber-100 text-amber-800 text-[10px]">Checkout</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span>{s.country || 'Unknown'}</span>
                    <span>•</span>
                    <span>{s.browser} / {s.os}</span>
                    <span>•</span>
                    <span>{(s.pages_viewed || []).length} pages</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {timeAgo(s.last_seen_at)}
                  </div>
                  {s.referrer && (
                    <p className="text-[10px] text-muted-foreground truncate max-w-32">{new URL(s.referrer).hostname}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
