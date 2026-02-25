import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, X, RefreshCw, Package, Mail, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

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

  useEffect(() => {
    if (ADMIN_EMAILS.includes(user?.email || "")) fetchOrders();
  }, [user, statusFilter]);

  const handleAction = async (orderId: string, action: "approve" | "reject" | "request_proof") => {
    setActionLoading(orderId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

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
                    </div>
                  </div>

                  <div className="mt-3 border-t pt-3">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Items</p>
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
                      disabled={actionLoading === order.id}
                    >
                      <Check className="h-4 w-4 mr-1" /> {order.status === "approved" ? "Re-Approve" : "Approve"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleAction(order.id, "reject")}
                      disabled={actionLoading === order.id}
                    >
                      <X className="h-4 w-4 mr-1" /> {order.status === "rejected" ? "Re-Reject" : "Reject"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAction(order.id, "request_proof")}
                      disabled={actionLoading === order.id}
                    >
                      <Mail className="h-4 w-4 mr-1" /> Request Proof
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
