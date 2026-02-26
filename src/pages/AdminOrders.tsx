import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, X, RefreshCw, Package, Mail, Search, Trash2, Pencil, Plus, CalendarIcon } from "lucide-react";
import { startOfDay, endOfDay, subDays, startOfMonth, subMonths, startOfWeek, isWithinInterval, format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { products } from "@/data/products";
import { Product } from "@/types/product";

const ADMIN_EMAILS = ["ewhz3384@gmail.com", "mubarak.elkhabir@gmail.com"];

interface OrderItem {
  name: string;
  brand: string;
  price: number;
  quantity: number;
  selectedMl?: number;
}

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: string;
  order_items: OrderItem[];
  shipping_address: any;
  checkout_reference: string;
  created_at: string;
  order_number: number | null;
  approval_token: string | null;
  gift_card_code: string | null;
  discount_code: string | null;
  discount_percent: number | null;
}

function getPaymentMethod(ref: string): string {
  if (ref?.startsWith("rewarble")) return "Rewarble";
  if (ref?.startsWith("revolut-app") || ref?.startsWith("revolut")) return "Revolut";
  if (ref?.startsWith("bank-transfer")) return "Bank Transfer";
  if (ref?.startsWith("paypal")) return "PayPal";
  return "Other";
}

const PAYMENT_METHODS = ["All", "Rewarble", "PayPal", "Bank Transfer", "Revolut"];

export default function AdminOrders() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending_approval");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [approvedOrders, setApprovedOrders] = useState<Order[]>([]);

  // Date range for revenue tally
  const [datePreset, setDatePreset] = useState<string>("all");
  const [customFrom, setCustomFrom] = useState<Date | undefined>();
  const [customTo, setCustomTo] = useState<Date | undefined>();

  // Edit state
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editItems, setEditItems] = useState<OrderItem[]>([]);
  const [editSaving, setEditSaving] = useState(false);
  const [catalogueSearch, setCatalogueSearch] = useState("");
  const [showCatalogue, setShowCatalogue] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !ADMIN_EMAILS.includes(user.email || ""))) {
      navigate("/", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const fetchOrders = async () => {
    if (!user || !ADMIN_EMAILS.includes(user.email || "")) return;
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-orders?status=${statusFilter}`,
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      const json = await res.json();
      if (res.ok) {
        setOrders(json.orders || []);
      } else {
        toast.error(json.error || "Failed to fetch orders");
      }
    } catch {
      toast.error("Failed to fetch orders");
    }
    setLoading(false);
  };

  // Fetch all approved orders for revenue tally
  const fetchApprovedOrders = async () => {
    if (!user || !ADMIN_EMAILS.includes(user.email || "")) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-orders?status=approved`,
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      const json = await res.json();
      if (res.ok) setApprovedOrders(json.orders || []);
    } catch { /* silent */ }
  };

  useEffect(() => {
    if (ADMIN_EMAILS.includes(user?.email || "")) fetchOrders();
  }, [user, statusFilter]);

  useEffect(() => {
    if (ADMIN_EMAILS.includes(user?.email || "")) fetchApprovedOrders();
  }, [user]);

  // Compute date range from preset or custom
  const dateRange = useMemo<{ from: Date; to: Date } | null>(() => {
    const now = new Date();
    switch (datePreset) {
      case "today": return { from: startOfDay(now), to: endOfDay(now) };
      case "yesterday": return { from: startOfDay(subDays(now, 1)), to: endOfDay(subDays(now, 1)) };
      case "7days": return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) };
      case "30days": return { from: startOfDay(subDays(now, 29)), to: endOfDay(now) };
      case "this_month": return { from: startOfMonth(now), to: endOfDay(now) };
      case "last_month": { const lm = subMonths(now, 1); return { from: startOfMonth(lm), to: endOfDay(subDays(startOfMonth(now), 1)) }; }
      case "this_week": return { from: startOfWeek(now, { weekStartsOn: 1 }), to: endOfDay(now) };
      case "custom": return customFrom && customTo ? { from: startOfDay(customFrom), to: endOfDay(customTo) } : null;
      default: return null; // "all"
    }
  }, [datePreset, customFrom, customTo]);

  // Revenue tally from approved orders filtered by date
  const revenueTally = useMemo(() => {
    const byMethod: Record<string, number> = {};
    let total = 0;
    let count = 0;
    for (const o of approvedOrders) {
      if (dateRange) {
        const d = new Date(o.created_at);
        if (!isWithinInterval(d, { start: dateRange.from, end: dateRange.to })) continue;
      }
      const pm = getPaymentMethod(o.checkout_reference);
      byMethod[pm] = (byMethod[pm] || 0) + o.total_amount;
      total += o.total_amount;
      count++;
    }
    return { byMethod, total, count };
  }, [approvedOrders, dateRange]);

  const handleDismiss = async (orderId: string) => {
    if (!confirm("Remove this order from the list? This cannot be undone.")) return;
    setActionLoading(orderId + "-dismiss");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Not authenticated");
        setActionLoading(null);
        return;
      }
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-orders`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, action: "dismiss" }),
        }
      );
      const json = await res.json();
      if (res.ok) {
        toast.success("Order removed");
        setOrders(prev => prev.filter(o => o.id !== orderId));
        setApprovedOrders(prev => prev.filter(o => o.id !== orderId));
      } else {
        toast.error(json.error || "Failed to remove order");
      }
    } catch {
      toast.error("Failed to remove order");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAction = async (orderId: string, action: "approve" | "reject" | "request_proof") => {
    setActionLoading(orderId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Not authenticated");
        setActionLoading(null);
        return;
      }

      if (action === "request_proof") {
        const order = orders.find(o => o.id === orderId);
        if (!order) {
          toast.error("Order not found");
          setActionLoading(null);
          return;
        }
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/request-proof-of-payment?id=${orderId}&token=${order.approval_token || ""}`,
          { method: "GET", headers: { "Accept": "application/json" } }
        );
        if (res.ok) {
          toast.success("Proof of payment request sent.");
        } else {
          toast.error("Failed to send proof request");
        }
      } else {
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-orders`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ orderId, action }),
          }
        );
        const json = await res.json();
        if (res.ok) {
          toast.success(json.message);
          fetchOrders();
        } else {
          toast.error(json.error || "Action failed");
        }
      }
    } catch {
      toast.error("Action failed");
    }
    setActionLoading(null);
  };

  // Edit helpers
  const openEditDialog = (order: Order) => {
    const items = Array.isArray(order.order_items) ? order.order_items : [];
    setEditItems(JSON.parse(JSON.stringify(items)));
    setEditingOrder(order);
    setCatalogueSearch("");
    setShowCatalogue(false);
  };

  const removeEditItem = (index: number) => {
    setEditItems(prev => prev.filter((_, i) => i !== index));
  };

  const changeVariant = (index: number, product: Product, ml: number) => {
    const variant = product.variants?.find(v => v.ml === ml);
    if (!variant) return;
    setEditItems(prev => {
      const next = [...prev];
      next[index] = { ...next[index], selectedMl: ml, price: variant.price };
      return next;
    });
  };

  const addProductToOrder = (product: Product) => {
    const defaultVariant = product.variants?.[0];
    const newItem: OrderItem = {
      name: product.name,
      brand: product.brand,
      price: defaultVariant?.price ?? product.price,
      quantity: 1,
      selectedMl: defaultVariant?.ml,
    };
    setEditItems(prev => [...prev, newItem]);
    setShowCatalogue(false);
    setCatalogueSearch("");
  };

  const swapProduct = (index: number, product: Product) => {
    const defaultVariant = product.variants?.[0];
    setEditItems(prev => {
      const next = [...prev];
      next[index] = {
        name: product.name,
        brand: product.brand,
        price: defaultVariant?.price ?? product.price,
        quantity: next[index].quantity,
        selectedMl: defaultVariant?.ml,
      };
      return next;
    });
  };

  const editTotal = editItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Find matching product from catalogue for an order item
  const findProduct = (item: OrderItem): Product | undefined => {
    return products.find(p => 
      p.name.toLowerCase() === item.name.toLowerCase() && 
      p.brand.toLowerCase() === item.brand.toLowerCase()
    );
  };

  const filteredCatalogue = useMemo(() => {
    if (!catalogueSearch.trim()) return products.slice(0, 15);
    const q = catalogueSearch.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
    ).slice(0, 15);
  }, [catalogueSearch]);

  const saveEditItems = async () => {
    if (!editingOrder) return;
    if (editItems.length === 0) {
      toast.error("Order must have at least one item");
      return;
    }
    setEditSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-orders`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: editingOrder.id,
            action: "update_items",
            orderItems: editItems,
            totalAmount: editTotal,
          }),
        }
      );
      const json = await res.json();
      if (res.ok) {
        toast.success("Order items updated");
        setEditingOrder(null);
        fetchOrders();
      } else {
        toast.error(json.error || "Failed to update");
      }
    } catch {
      toast.error("Failed to update");
    }
    setEditSaving(false);
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><RefreshCw className="animate-spin h-8 w-8 text-muted-foreground" /></div>;
  }

  if (!user || !ADMIN_EMAILS.includes(user.email || "")) return null;

  const statusColors: Record<string, string> = {
    pending_approval: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    pending: "bg-gray-100 text-gray-800",
  };

  const pmColors: Record<string, string> = {
    "Rewarble": "bg-purple-100 text-purple-800",
    "PayPal": "bg-blue-100 text-blue-800",
    "Bank Transfer": "bg-emerald-100 text-emerald-800",
    "Revolut": "bg-cyan-100 text-cyan-800",
    "Other": "bg-gray-100 text-gray-800",
  };

  const filteredOrders = orders.filter(o => {
    const pm = getPaymentMethod(o.checkout_reference);
    const matchesPayment = paymentFilter === "All" || pm === paymentFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      o.customer_name.toLowerCase().includes(query) ||
      o.customer_email.toLowerCase().includes(query) ||
      (o.order_number && o.order_number.toString().includes(query));
    return matchesPayment && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Order Management</h1>
            <p className="text-sm text-muted-foreground mt-1">Approve or reject pending orders</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>

        {/* Status Filter */}
        <div className="mb-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Status</p>
          <div className="flex gap-2 flex-wrap">
            {["pending_approval", "approved", "rejected", "all"].map((s) => (
              <Button
                key={s}
                variant={statusFilter === s ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(s)}
                className="capitalize"
              >
                {s === "pending_approval" ? "Pending" : s === "all" ? "All" : s}
              </Button>
            ))}
          </div>
        </div>

        {/* Payment Method Filter */}
        <div className="mb-6">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Payment Method</p>
          <div className="flex gap-2 flex-wrap">
            {PAYMENT_METHODS.map((pm) => (
              <Button
                key={pm}
                variant={paymentFilter === pm ? "default" : "outline"}
                size="sm"
                onClick={() => setPaymentFilter(pm)}
              >
                {pm}
              </Button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or order number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Revenue Tally */}
        {approvedOrders.length > 0 && (
          <div className="mb-6 border rounded-lg p-4 bg-card">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Revenue (Approved Orders) — {revenueTally.count} orders
              </p>
            </div>
            {/* Date presets */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {[
                { key: "all", label: "All Time" },
                { key: "today", label: "Today" },
                { key: "yesterday", label: "Yesterday" },
                { key: "this_week", label: "This Week" },
                { key: "7days", label: "Last 7 Days" },
                { key: "this_month", label: "This Month" },
                { key: "last_month", label: "Last Month" },
                { key: "30days", label: "Last 30 Days" },
                { key: "custom", label: "Custom" },
              ].map(p => (
                <button
                  key={p.key}
                  onClick={() => setDatePreset(p.key)}
                  className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                    datePreset === p.key
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-input hover:bg-accent"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {/* Custom date pickers */}
            {datePreset === "custom" && (
              <div className="flex flex-wrap gap-2 mb-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="text-xs">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      {customFrom ? format(customFrom, "dd/MM/yyyy") : "From"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={customFrom} onSelect={setCustomFrom} className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="text-xs">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      {customTo ? format(customTo, "dd/MM/yyyy") : "To"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={customTo} onSelect={setCustomTo} className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
            )}
            {dateRange && (
              <p className="text-xs text-muted-foreground mb-2">
                {format(dateRange.from, "dd MMM yyyy")} – {format(dateRange.to, "dd MMM yyyy")}
              </p>
            )}
            <div className="flex flex-wrap gap-4 items-end">
              {Object.entries(revenueTally.byMethod).sort((a, b) => b[1] - a[1]).map(([method, amount]) => (
                <div key={method} className="text-center">
                  <p className="text-xs text-muted-foreground">{method}</p>
                  <p className="text-sm font-semibold">€{amount.toFixed(2)}</p>
                </div>
              ))}
              <div className="text-center border-l pl-4 ml-2">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-lg font-bold text-primary">€{revenueTally.total.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-muted-foreground">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const items = (Array.isArray(order.order_items) ? order.order_items : []) as OrderItem[];
              const date = new Date(order.created_at);
              const pm = getPaymentMethod(order.checkout_reference);

              return (
                <div key={order.id} className="border rounded-lg p-5 bg-card">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">#{order.order_number || '—'}</span>
                        <h3 className="font-semibold text-base">{order.customer_name}</h3>
                        <Badge className={statusColors[order.status] || "bg-gray-100 text-gray-800"}>
                          {order.status.replace("_", " ")}
                        </Badge>
                        <Badge className={pmColors[pm] || "bg-gray-100 text-gray-800"}>
                          {pm}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} at {date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">EUR {order.total_amount.toFixed(2)}</p>
                      {order.discount_code && (
                        <Badge variant="outline" className="text-green-600 border-green-300 mt-1 text-[10px]">
                          {order.discount_code} ({order.discount_percent}% off)
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 border-t pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Items</p>
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => openEditDialog(order)}>
                        <Pencil className="h-3 w-3 mr-1" /> Edit Items
                      </Button>
                    </div>
                    <div className="space-y-1">
                      {items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span>
                            <span className="font-medium">{item.brand}</span> — {item.name}
                            {item.selectedMl ? ` (${item.selectedMl}ml)` : ""}
                            {item.quantity > 1 ? ` x${item.quantity}` : ""}
                          </span>
                          <span className="text-muted-foreground">EUR {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    {order.discount_code && order.discount_percent ? (() => {
                      const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
                      const discountAmount = subtotal * (order.discount_percent / 100);
                      return (
                        <div className="mt-2 pt-2 border-t border-dashed space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>EUR {subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm text-green-600">
                            <span>Discount ({order.discount_code} — {order.discount_percent}%)</span>
                            <span>−EUR {discountAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm font-semibold">
                            <span>Total</span>
                            <span>EUR {order.total_amount.toFixed(2)}</span>
                          </div>
                        </div>
                      );
                    })() : null}
                  </div>

                  {order.gift_card_code && (
                    <div className="mt-3 border-t pt-3">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Gift Card Code</p>
                      <p className="font-mono text-sm font-bold text-purple-700 bg-purple-50 inline-block px-3 py-1.5 rounded border border-purple-200">{order.gift_card_code}</p>
                    </div>
                  )}

                  <div className="mt-4 flex gap-3 flex-wrap">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleAction(order.id, "approve")}
                      disabled={!!actionLoading}
                    >
                      <Check className="h-4 w-4 mr-1" /> {order.status === "approved" ? "Re-Approve" : "Approve"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleAction(order.id, "reject")}
                      disabled={!!actionLoading}
                    >
                      <X className="h-4 w-4 mr-1" /> {order.status === "rejected" ? "Re-Reject" : "Reject"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAction(order.id, "request_proof")}
                      disabled={!!actionLoading}
                    >
                      <Mail className="h-4 w-4 mr-1" /> Request Proof
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground"
                      onClick={() => handleDismiss(order.id)}
                      disabled={!!actionLoading}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Remove
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Order Items Dialog */}
      <Dialog open={!!editingOrder} onOpenChange={(open) => { if (!open) { setEditingOrder(null); setShowCatalogue(false); } }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Order — #{editingOrder?.order_number || '—'}</DialogTitle>
            <DialogDescription>Remove, swap, or add items. Save then re-approve to send updated email.</DialogDescription>
          </DialogHeader>

          {/* Current items */}
          <div className="space-y-3 py-2">
            {editItems.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No items. Add from catalogue below.</p>
            )}
            {editItems.map((item, i) => {
              const catalogueProduct = findProduct(item);
              return (
                <div key={i} className="border rounded-md p-3 relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 text-destructive"
                    onClick={() => removeEditItem(i)}
                    title="Remove item"
                  >
                    <X className="h-3 w-3" />
                  </Button>

                  <p className="text-sm font-medium pr-8">
                    {item.brand} — {item.name}
                    {item.quantity > 1 ? ` x${item.quantity}` : ""}
                  </p>

                  {/* Variant selector */}
                  {catalogueProduct?.variants && catalogueProduct.variants.length > 0 ? (
                    <div className="flex gap-2 mt-2">
                      {catalogueProduct.variants.map(v => (
                        <button
                          key={v.ml}
                          onClick={() => changeVariant(i, catalogueProduct, v.ml)}
                          className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                            item.selectedMl === v.ml
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-muted/50 border-border hover:bg-muted"
                          }`}
                        >
                          {v.ml}ml — €{v.price.toFixed(2)}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.selectedMl ? `${item.selectedMl}ml` : ""} — EUR {item.price.toFixed(2)}
                    </p>
                  )}

                  {/* Swap button */}
                  <SwapSearch item={item} index={i} onSwap={swapProduct} />
                </div>
              );
            })}
          </div>

          {/* Add from catalogue */}
          <div className="border-t pt-3">
            {!showCatalogue ? (
              <Button variant="outline" size="sm" className="w-full" onClick={() => setShowCatalogue(true)}>
                <Plus className="h-3 w-3 mr-1" /> Add Item from Catalogue
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={catalogueSearch}
                    onChange={(e) => setCatalogueSearch(e.target.value)}
                    className="h-8 text-sm pl-8"
                    autoFocus
                  />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {filteredCatalogue.map(p => (
                    <button
                      key={p.id}
                      onClick={() => addProductToOrder(p)}
                      className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors flex justify-between items-center"
                    >
                      <span><span className="font-medium">{p.brand}</span> — {p.name}</span>
                      <span className="text-xs text-muted-foreground">€{p.price.toFixed(2)}</span>
                    </button>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => { setShowCatalogue(false); setCatalogueSearch(""); }}>
                  Cancel
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <p className="text-sm font-semibold">New Total: EUR {editTotal.toFixed(2)}</p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingOrder(null)}>Cancel</Button>
            <Button onClick={saveEditItems} disabled={editSaving || editItems.length === 0}>
              {editSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Inline swap search for a single item */
function SwapSearch({ item, index, onSwap }: { item: OrderItem; index: number; onSwap: (i: number, p: Product) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) return products.slice(0, 10);
    const q = query.toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)).slice(0, 10);
  }, [query]);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs text-primary hover:underline mt-2 block">
        Swap for different product
      </button>
    );
  }

  return (
    <div className="mt-2 space-y-1">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
        <Input
          placeholder="Search to swap..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-7 text-xs pl-7"
          autoFocus
        />
      </div>
      <div className="max-h-32 overflow-y-auto space-y-0.5">
        {results.map(p => (
          <button
            key={p.id}
            onClick={() => { onSwap(index, p); setOpen(false); setQuery(""); }}
            className="w-full text-left px-2 py-1 text-xs rounded hover:bg-muted transition-colors"
          >
            <span className="font-medium">{p.brand}</span> — {p.name} (€{p.price.toFixed(2)})
          </button>
        ))}
      </div>
      <button onClick={() => { setOpen(false); setQuery(""); }} className="text-xs text-muted-foreground hover:underline">Cancel</button>
    </div>
  );
}
