import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { toast } from "sonner";
import { RefreshCw, ChevronDown, Trash2, Plus, Zap, Settings2, ChevronsUpDown, X } from "lucide-react";
import { format, formatDistanceToNowStrict } from "date-fns";
import { products as CATALOG } from "@/data/products";
import { applyPriceOverride, fetchAllProductPriceOverrides } from "@/hooks/useProductPrice";

const PRIMARY_ADMIN = "ewhz3384@gmail.com";
const ADMIN_EMAILS = [PRIMARY_ADMIN, "elkhabirmalik@gmail.com"];
const DEFAULT_ANCHOR = "2020-01-01T00:00:00.000Z";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

type ContribOrder = {
  id: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  credit: number;
  kind: string;
  method: string;
  approvedAt: string;
};
type HistoryEntry = {
  id: string;
  resetAt: string;
  periodStart: string;
  periodEnd: string;
  gross: number;
  adSpend: number;
  net: number;
  count: number;
  orders?: ContribOrder[];
};
type Snapshot = { gross: number; count: number; net: number; orders: ContribOrder[]; adSpend: number; resetAt: string; history: HistoryEntry[] };

type CustomItem = { brand: string; name: string; price: number; quantity: number; selectedMl?: number };

const TIMER_MODES: { value: string; label: string; range: string }[] = [
  { value: "hyper_aggressive", label: "Hyper Aggressive", range: "1–5 min" },
  { value: "aggressive", label: "Aggressive", range: "10–20 min" },
  { value: "hard", label: "Hard", range: "30–45 min" },
  { value: "normal", label: "Normal", range: "40–60 min" },
  { value: "relaxed", label: "Relaxed", range: "65–90 min" },
  { value: "hyper_relaxed", label: "Hyper Relaxed", range: "95–120 min" },
];

async function invokeFn(name: string, body: any) {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session?.access_token ?? ""}`,
      "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string,
    },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || `Request failed (${res.status})`);
  return json;
}

interface Props {
  userEmail: string;
}

export default function BancontactPanel({ userEmail }: Props) {
  const isPrimary = userEmail === PRIMARY_ADMIN;
  const isAdmin = ADMIN_EMAILS.includes(userEmail);

  const [snapshot, setSnapshot] = useState<Snapshot>({
    gross: 0, count: 0, net: 0, orders: [], adSpend: 0, resetAt: DEFAULT_ANCHOR, history: [],
  });
  const [liveOrdersOpen, setLiveOrdersOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [expandedHistory, setExpandedHistory] = useState<Record<string, boolean>>({});

  const [adSpendDialogOpen, setAdSpendDialogOpen] = useState(false);
  const [adSpendInput, setAdSpendInput] = useState("");

  const [timer, setTimer] = useState<{ enabled: boolean; mode: string; nextAt: string | null; lastAt: string | null }>({
    enabled: false, mode: "normal", nextAt: null, lastAt: null,
  });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick((v) => v + 1), 1000);
    return () => clearInterval(i);
  }, []);

  const [customOpen, setCustomOpen] = useState(false);
  const [customItems, setCustomItems] = useState<CustomItem[]>([{ brand: "Dior", name: "Sauvage", price: 39.99, quantity: 1, selectedMl: 100 }]);
  const [customTotal, setCustomTotal] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const applyCounterRow = useCallback((row: any) => {
    if (!row) return;
    const gross = Number(row.gross) || 0;
    const adSpend = Number(row.ad_spend) || 0;
    setSnapshot({
      gross,
      adSpend,
      net: Number(row.net ?? gross - adSpend) || 0,
      count: Number(row.order_count) || 0,
      orders: Array.isArray(row.contributing_orders) ? row.contributing_orders : [],
      resetAt: row.reset_at || DEFAULT_ANCHOR,
      history: Array.isArray(row.reset_history) ? row.reset_history : [],
    });
  }, []);

  const applyTimerRow = useCallback((row: any) => {
    if (!row) return;
    setTimer({
      enabled: !!row.enabled,
      mode: row.mode || "normal",
      nextAt: row.next_send_at || null,
      lastAt: row.last_send_at || null,
    });
  }, []);

  // Hydrate + subscribe
  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    (async () => {
      const [c, t] = await Promise.all([
        supabase.from("bancontact_live_counter").select("*").eq("id", 1).maybeSingle(),
        supabase.from("bancontact_timer_state").select("*").eq("id", 1).maybeSingle(),
      ]);
      if (cancelled) return;
      if (c.data) applyCounterRow(c.data);
      if (t.data) applyTimerRow(t.data);
    })();
    const ch = supabase
      .channel("bancontact_sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "bancontact_live_counter" }, (p) => applyCounterRow((p as any).new))
      .on("postgres_changes", { event: "*", schema: "public", table: "bancontact_timer_state" }, (p) => applyTimerRow((p as any).new))
      .on("postgres_changes", { event: "*", schema: "public", table: "bancontact_orders" }, async () => {
        // Order changes (approve/reject/split/cron) refresh the counter via DB trigger;
        // re-fetch as a safety net.
        const { data } = await supabase.from("bancontact_live_counter").select("*").eq("id", 1).maybeSingle();
        if (data) applyCounterRow(data);
      })
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(ch); };
  }, [isAdmin, applyCounterRow, applyTimerRow]);

  const persistCounter = useCallback(async (patch: Partial<{ adSpend: number; resetAt: string; history: HistoryEntry[] }>) => {
    const next = {
      id: 1,
      ad_spend: patch.adSpend ?? snapshot.adSpend,
      reset_at: patch.resetAt ?? snapshot.resetAt,
      reset_history: patch.history ?? snapshot.history,
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase.from("bancontact_live_counter").upsert(next).select("*").maybeSingle();
    if (error) { toast.error("Failed to save Bancontact tally"); return; }
    if (data) applyCounterRow(data);
  }, [snapshot, applyCounterRow]);

  const persistTimer = useCallback(async (patch: Partial<{ enabled: boolean; mode: string; nextAt: string | null }>) => {
    const next = {
      id: 1,
      enabled: patch.enabled ?? timer.enabled,
      mode: patch.mode ?? timer.mode,
      next_send_at: patch.nextAt === undefined ? timer.nextAt : patch.nextAt,
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase.from("bancontact_timer_state").upsert(next).select("*").maybeSingle();
    if (error) { toast.error("Failed to save timer state"); return; }
    if (data) applyTimerRow(data);
  }, [timer, applyTimerRow]);

  const handleGenerate = async (mode: "random" | "custom", payload?: any) => {
    setBusy(true);
    try {
      const res = await invokeFn("bancontact-generate", { mode, ...payload });
      toast.success(`Bancontact order sent (€${Number(res.total).toFixed(2)} — ${res.customer})`);
    } catch (e: any) {
      toast.error(e.message || "Generation failed");
    } finally {
      setBusy(false);
    }
  };

  const handleCustomSubmit = async () => {
    const cleaned = customItems
      .map((i) => ({ ...i, price: Number(i.price) || 0, quantity: Math.max(1, Math.floor(Number(i.quantity) || 1)) }))
      .filter((i) => i.name && i.brand && i.price > 0);
    if (cleaned.length === 0) { toast.error("Add at least one item"); return; }
    const totalNum = customTotal.trim() ? Number(customTotal) : NaN;
    await handleGenerate("custom", { items: cleaned, total: isFinite(totalNum) ? totalNum : undefined });
    setCustomOpen(false);
  };

  const toggleTimer = async (on: boolean) => {
    if (on) {
      // Set initial next_send_at ~1 minute out so user sees countdown immediately;
      // tick will reschedule on each fire based on mode.
      const next = new Date(Date.now() + 60_000).toISOString();
      await persistTimer({ enabled: true, nextAt: next });
      toast.success(`Timed generator ON — ${TIMER_MODES.find(m => m.value === timer.mode)?.label}`);
    } else {
      await persistTimer({ enabled: false, nextAt: null });
      toast.success("Timed generator OFF");
    }
  };

  const handleResetDay = () => {
    if (!confirm("Reset Bancontact live tally and ad spend?")) return;
    const now = new Date().toISOString();
    const nextHistory: HistoryEntry[] = [
      {
        id: now,
        resetAt: now,
        periodStart: snapshot.resetAt,
        periodEnd: now,
        gross: snapshot.gross,
        adSpend: snapshot.adSpend,
        net: snapshot.net,
        count: snapshot.count,
        orders: snapshot.orders,
      },
      ...snapshot.history,
    ].slice(0, 200);
    persistCounter({ resetAt: now, adSpend: 0, history: nextHistory });
  };

  const countdown = useMemo(() => {
    if (!timer.enabled || !timer.nextAt) return null;
    const ms = new Date(timer.nextAt).getTime() - Date.now();
    if (ms <= 0) return "any moment";
    return formatDistanceToNowStrict(new Date(timer.nextAt), { addSuffix: true });
    // tick keeps this recalculating every second
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer.enabled, timer.nextAt, tick]);

  if (!isAdmin) return null;

  return (
    <div className="mb-6 border rounded-lg p-4 bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            Live Counter — Bancontact
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Since {format(new Date(snapshot.resetAt), "dd MMM yyyy, HH:mm")} · {snapshot.count} credited entries
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isPrimary && (
            <>
              <Button variant="outline" size="sm" className="text-xs" onClick={() => handleGenerate("random")} disabled={busy}>
                <Zap className="h-3 w-3 mr-1" /> Generate Bancontact Order
              </Button>
              <Button variant="outline" size="sm" className="text-xs" onClick={() => setCustomOpen(true)} disabled={busy}>
                <Plus className="h-3 w-3 mr-1" /> Custom Bancontact Order
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" className="text-xs" onClick={() => { setAdSpendInput(""); setAdSpendDialogOpen(true); }}>
            Ad Budget
          </Button>
          <Button variant="outline" size="sm" className="text-xs" onClick={handleResetDay}>
            <RefreshCw className="h-3 w-3 mr-1" /> Reset Day
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 items-end">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Gross</p>
          <p className="text-sm font-semibold">€{snapshot.gross.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Ad Spend</p>
          <p className="text-sm font-semibold text-destructive">−€{snapshot.adSpend.toFixed(2)}</p>
        </div>
        <div className="text-center border-l pl-4">
          <p className="text-xs text-muted-foreground">Net Total</p>
          <p className={`text-lg font-bold ${snapshot.net < 0 ? "text-destructive" : "text-green-500"}`}>
            €{snapshot.net.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Timer panel — primary admin only */}
      {isPrimary && (
        <div className="mt-4 border-t pt-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Timed Bancontact Generator</p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={timer.mode} onValueChange={async (v) => {
                await persistTimer({ mode: v, nextAt: timer.enabled ? new Date(Date.now() + 60_000).toISOString() : null });
              }}>
                <SelectTrigger className="h-8 w-[200px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMER_MODES.map((m) => (
                    <SelectItem key={m.value} value={m.value} className="text-xs">
                      {m.label} <span className="opacity-60 ml-1">· {m.range}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Switch checked={timer.enabled} onCheckedChange={toggleTimer} />
            </div>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground flex flex-wrap gap-4">
            {timer.enabled ? (
              <>
                <span>Next send: <strong className="text-foreground">{timer.nextAt ? format(new Date(timer.nextAt), "HH:mm:ss") : "—"}</strong> {countdown ? <span className="opacity-70">({countdown})</span> : null}</span>
                {timer.lastAt && <span>Last sent: {format(new Date(timer.lastAt), "HH:mm:ss")}</span>}
              </>
            ) : (
              <span className="opacity-70">Off — flip the switch to start auto-generating.</span>
            )}
          </div>
        </div>
      )}

      {/* Contributing entries */}
      {snapshot.orders.length > 0 && (
        <div className="mt-3 border-t pt-2">
          <button onClick={() => setLiveOrdersOpen(v => !v)} className="w-full flex items-center justify-between text-left hover:bg-muted/30 rounded px-1 py-1 transition-colors">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Credited Entries — {snapshot.orders.length}
            </p>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${liveOrdersOpen ? "rotate-180" : ""}`} />
          </button>
          {liveOrdersOpen && (
            <div className="mt-2 pl-4 border-l border-border/60 space-y-1 max-h-64 overflow-y-auto">
              {snapshot.orders.map((o, i) => (
                <div key={`${o.id}-${o.kind}-${i}`} className="flex items-center justify-between gap-2 py-0.5 text-xs">
                  <div className="text-muted-foreground truncate">
                    <span className="font-mono opacity-70">{o.kind === "full" ? "FULL" : o.kind === "split_1" ? "½₁" : "½₂"}</span>
                    <span className="ml-2">{o.customer_name}</span>
                    <span className="ml-1 opacity-60">· {o.customer_email}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="opacity-60">{format(new Date(o.approvedAt), "HH:mm")}</span>
                    <strong>€{Number(o.credit).toFixed(2)}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reset history */}
      <div className="mt-4 border-t pt-3">
        <button onClick={() => setHistoryOpen(v => !v)} className="w-full flex items-center justify-between text-left hover:bg-muted/30 rounded px-1 py-1 transition-colors">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            Reset History — {snapshot.history.length} {snapshot.history.length === 1 ? "day" : "days"}
          </p>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${historyOpen ? "rotate-180" : ""}`} />
        </button>
        {historyOpen && (
          <div className="mt-2 space-y-1.5 max-h-72 overflow-y-auto">
            {snapshot.history.length === 0 ? (
              <p className="text-xs text-muted-foreground py-3 text-center">No resets yet.</p>
            ) : (
              snapshot.history.map((h) => {
                const isOpen = !!expandedHistory[h.id];
                const hasOrders = !!(h.orders && h.orders.length > 0);
                return (
                  <div key={h.id} className="text-xs border rounded px-2 py-1.5 bg-background/40">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <button type="button" onClick={() => hasOrders && setExpandedHistory(p => ({ ...p, [h.id]: !p[h.id] }))}
                        className={`text-muted-foreground flex items-center gap-1 text-left ${hasOrders ? "hover:text-foreground cursor-pointer" : "cursor-default"}`}>
                        {hasOrders && <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : "-rotate-90"}`} />}
                        <span>{format(new Date(h.periodStart), "dd MMM HH:mm")} → {format(new Date(h.periodEnd), "dd MMM HH:mm")}<span className="ml-2 opacity-70">· {h.count} entries</span></span>
                      </button>
                      <div className="flex gap-3 items-center">
                        <span>Gross <strong>€{Number(h.gross).toFixed(2)}</strong></span>
                        <span className="text-destructive">Ads −€{Number(h.adSpend).toFixed(2)}</span>
                        <span className={Number(h.net) < 0 ? "text-destructive font-semibold" : "text-green-500 font-semibold"}>Net €{Number(h.net).toFixed(2)}</span>
                        <button onClick={() => {
                          if (confirm("Delete this history entry?")) {
                            const nextHistory = snapshot.history.filter(x => x.id !== h.id);
                            persistCounter({ history: nextHistory });
                          }
                        }} className="text-muted-foreground hover:text-destructive" aria-label="Delete entry">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    {isOpen && hasOrders && (
                      <div className="mt-2 pl-4 border-l border-border/60 space-y-1">
                        {h.orders!.map((o, i) => (
                          <div key={`${o.id}-${i}`} className="flex items-center justify-between gap-2 py-0.5">
                            <div className="text-muted-foreground truncate">
                              <span className="ml-2">{o.customer_name}</span>
                              <span className="ml-1 opacity-60">· {o.customer_email}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="opacity-60">{format(new Date(o.approvedAt), "HH:mm")}</span>
                              <strong>€{Number(o.credit ?? o.total_amount).toFixed(2)}</strong>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Ad Budget dialog */}
      <Dialog open={adSpendDialogOpen} onOpenChange={setAdSpendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bancontact Ad Budget</DialogTitle>
            <DialogDescription>Add to or reset the ad spend that subtracts from the net total. Current: €{snapshot.adSpend.toFixed(2)}</DialogDescription>
          </DialogHeader>
          <Input type="number" inputMode="decimal" step="0.01" placeholder="Amount (€)" value={adSpendInput} onChange={(e) => setAdSpendInput(e.target.value)} />
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => { persistCounter({ adSpend: 0 }); setAdSpendDialogOpen(false); }}>Reset to €0</Button>
            <Button onClick={() => {
              const amt = parseFloat(adSpendInput);
              if (!isFinite(amt) || amt <= 0) { toast.error("Enter a positive amount"); return; }
              persistCounter({ adSpend: snapshot.adSpend + amt });
              setAdSpendDialogOpen(false);
            }}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom order dialog */}
      <Dialog open={customOpen} onOpenChange={setCustomOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Custom Bancontact Order</DialogTitle>
            <DialogDescription>Customer details are auto-pulled from older real orders. Set your own items and (optionally) total.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {customItems.map((it, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-1 items-center">
                <Input className="col-span-3 h-8 text-xs" placeholder="Brand" value={it.brand} onChange={(e) => setCustomItems(p => p.map((x, i) => i === idx ? { ...x, brand: e.target.value } : x))} />
                <Input className="col-span-4 h-8 text-xs" placeholder="Name" value={it.name} onChange={(e) => setCustomItems(p => p.map((x, i) => i === idx ? { ...x, name: e.target.value } : x))} />
                <Input className="col-span-2 h-8 text-xs" type="number" placeholder="ML" value={it.selectedMl ?? ""} onChange={(e) => setCustomItems(p => p.map((x, i) => i === idx ? { ...x, selectedMl: Number(e.target.value) || undefined } : x))} />
                <Input className="col-span-1 h-8 text-xs" type="number" placeholder="Qty" value={it.quantity} onChange={(e) => setCustomItems(p => p.map((x, i) => i === idx ? { ...x, quantity: Number(e.target.value) || 1 } : x))} />
                <Input className="col-span-2 h-8 text-xs" type="number" step="0.01" placeholder="€" value={it.price} onChange={(e) => setCustomItems(p => p.map((x, i) => i === idx ? { ...x, price: Number(e.target.value) || 0 } : x))} />
              </div>
            ))}
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setCustomItems(p => [...p, { brand: "", name: "", price: 0, quantity: 1 }])}>
              <Plus className="h-3 w-3 mr-1" /> Add item
            </Button>
          </div>
          <div className="border-t pt-2">
            <label className="text-xs text-muted-foreground">Override total (optional)</label>
            <Input type="number" step="0.01" placeholder="Leave blank to auto-sum" value={customTotal} onChange={(e) => setCustomTotal(e.target.value)} className="h-8 text-xs" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCustomOpen(false)}>Cancel</Button>
            <Button onClick={handleCustomSubmit} disabled={busy}>Send to Bancontact</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
