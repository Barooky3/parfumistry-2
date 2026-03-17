import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Send, Ban, Unlock, Trash2, Package, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ChatMessageContent from '@/components/chat/ChatMessageContent';
import { toast } from '@/hooks/use-toast';

const ADMIN_EMAILS = ["ewhz3384@gmail.com"];
const RETURN_REFUND_LINK_MSG = `[button:Return & Refund Policy](/return-policy)`;

const PROOF_IMAGES = [
  '/images/proof/le-male-elixir.webp',
  '/images/proof/le-male-parfum-1.webp',
  '/images/proof/le-male-parfum-2.webp',
  '/images/proof/ysl-y-edp.webp',
  '/images/proof/aventus-absolu.webp',
  '/images/proof/xerjoff-naxos-box.webp',
  '/images/proof/xerjoff-naxos-bottle.webp',
  '/images/proof/pdm-layton.webp',
  '/images/proof/silver-mountain-water.webp',
];

const PROOF_MSG = `Store Policy is that we ask all customers to send photos of the perfumes they get if they want, so I can use as proof, and when you get yours I'll also ask you to send photos of yours too if you don't mind, like these ones I got recently.\n\n${PROOF_IMAGES.map(img => `[img:${img}]`).join('\n')}`;

const CHEAP_MSG = `The perfumes come from a grey market supplier. Shops often have to get rid of old stock to make space for new stock. These shops then sell their old stock in bulk at ridiculously low prices to grey market suppliers. A normal perfume lasts for 8 years before expiry, the ones we sell lasts for 3-6 years before expiry, so these have the same smell and last 7-8 hours on skin just like the original, but with reduced shelf life meaning they expire earlier. Thats why we can sell for so cheap. You get dhl tracking number after ordering and you can also return if you don't like em or have issues, we have a full return and refund policy on the site`;

const SHIPPING_MSG = `Shipping times take around 4–6 business days to all countries in the EU and UK, and 6–8 business days outside of the EU.`;

interface Conversation {
  id: string;
  user_email: string;
  user_name: string | null;
  blocked: boolean;
  updated_at: string;
  unread_count?: number;
  order_count?: number;
  customer_last_seen_at?: string | null;
}

interface Message {
  id: string;
  sender_type: string;
  message: string;
  created_at: string;
  read: boolean;
}

interface Order {
  id: string;
  order_number: number | null;
  status: string;
  total_amount: number;
  created_at: string;
  order_items: any;
}

const AdminChat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const readIdsRef = useRef<Set<string>>(new Set());
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showOrders, setShowOrders] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<Conversation | null>(null);
  const reloadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep refs in sync
  useEffect(() => { selectedRef.current = selected; }, [selected]);
  useEffect(() => { readIdsRef.current = readIds; }, [readIds]);

  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);

  const invokeAdminChat = useCallback(async (body: Record<string, any>) => {
    let { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      const { data: refreshData } = await supabase.auth.refreshSession();
      session = refreshData?.session ?? null;
    }
    if (!session) return null;

    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-chat`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );
    if (!res.ok) return null;
    return await res.json();
  }, []);

  const sortConversations = useCallback((convs: Conversation[], readSet: Set<string>) => {
    return [...convs].sort((a, b) => {
      const aUnread = (a.unread_count ?? 0) > 0 && !readSet.has(a.id) ? 1 : 0;
      const bUnread = (b.unread_count ?? 0) > 0 && !readSet.has(b.id) ? 1 : 0;
      if (aUnread !== bUnread) return bUnread - aUnread;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  }, []);

  const loadConversations = useCallback(async () => {
    const data = await invokeAdminChat({ action: 'list_conversations' });
    if (data?.conversations) {
      const currentReadIds = readIdsRef.current;
      // Clear readIds for conversations that are now actually 0 unread
      const newRead = new Set(currentReadIds);
      for (const conv of data.conversations) {
        if ((conv.unread_count ?? 0) === 0) newRead.delete(conv.id);
      }
      setReadIds(newRead);
      setConversations(sortConversations(data.conversations, newRead));
    }
    setLoading(false);
  }, [invokeAdminChat, sortConversations]);

  // Debounced reload for realtime events
  const debouncedReload = useCallback(() => {
    if (reloadTimerRef.current) clearTimeout(reloadTimerRef.current);
    reloadTimerRef.current = setTimeout(() => {
      loadConversations();
    }, 500);
  }, [loadConversations]);

  // Load conversations + realtime
  useEffect(() => {
    if (!isAdmin) return;
    loadConversations();

    // Listen to both conversations AND messages for instant updates
    const channel = supabase
      .channel('admin-inbox-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_conversations' }, debouncedReload)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, debouncedReload)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (reloadTimerRef.current) clearTimeout(reloadTimerRef.current);
    };
  }, [isAdmin, loadConversations, debouncedReload]);

  // Load messages when selecting conversation + realtime
  useEffect(() => {
    if (!selected) return;
    loadMessages(selected.id);
    loadOrders(selected.user_email);
    setShowOrders(false);

    const channel = supabase
      .channel(`admin-msgs-${selected.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `conversation_id=eq.${selected.id}`,
      }, (payload) => {
        const newMsg = payload.new as Message;
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          const tempIdx = prev.findIndex(m => m.id.startsWith('temp-') && m.message === newMsg.message);
          if (tempIdx !== -1) {
            const updated = [...prev];
            updated[tempIdx] = newMsg;
            return updated;
          }
          return [...prev, newMsg];
        });
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_conversations',
        filter: `id=eq.${selected.id}`,
      }, (payload) => {
        const updated = payload.new as any;
        if (updated.customer_last_seen_at) {
          setSelected(prev => prev ? { ...prev, customer_last_seen_at: updated.customer_last_seen_at } : prev);
        }
      })
      .subscribe();

    // Backup poll every 15s
    const interval = setInterval(() => {
      if (selectedRef.current?.id === selected.id) {
        loadMessages(selected.id);
      }
    }, 15000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [selected?.id]);

  const loadMessages = async (convId: string) => {
    const [data] = await Promise.all([
      invokeAdminChat({ action: 'get_messages', conversation_id: convId }),
      invokeAdminChat({ action: 'mark_read', conversation_id: convId }),
    ]);
    if (data?.messages) {
      setMessages(data.messages);
    }
  };

  const loadOrders = async (email: string) => {
    setOrdersLoading(true);
    const data = await invokeAdminChat({ action: 'get_orders', user_email: email });
    setOrders(data?.orders || []);
    setOrdersLoading(false);
  };

  // Auto-scroll on new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    }
  }, [messages]);

  const sendReply = async () => {
    if (!input.trim() || !selected || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);

    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      sender_type: 'admin',
      message: text,
      created_at: new Date().toISOString(),
      read: true,
    };
    setMessages(prev => [...prev, optimisticMsg]);

    const result = await invokeAdminChat({ action: 'send_reply', conversation_id: selected.id, message: text, user_email: selected.user_email });

    if (result?.message_id) {
      setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? { ...m, id: result.message_id } : m));
    }
    setSending(false);
  };

  const draftQuickReply = (msg: string) => {
    setInput(msg);
  };

  const toggleBlock = async (conv: Conversation) => {
    const action = conv.blocked ? 'unblock' : 'block';
    await invokeAdminChat({ action, conversation_id: conv.id });
    toast({ title: conv.blocked ? 'User unblocked' : 'User blocked from chat' });
    loadConversations();
    if (selected?.id === conv.id) {
      setSelected({ ...conv, blocked: !conv.blocked });
    }
  };

  const deleteConversation = async (conv: Conversation) => {
    await invokeAdminChat({ action: 'delete', conversation_id: conv.id });
    toast({ title: 'Conversation deleted' });
    if (selected?.id === conv.id) {
      setSelected(null);
      setMessages([]);
      setOrders([]);
    }
    loadConversations();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-400';
      case 'rejected': return 'bg-red-500/20 text-red-400';
      default: return 'bg-yellow-500/20 text-yellow-400';
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-muted-foreground">Access denied.</p>
      </div>
    );
  }

  const handleSelectConversation = (conv: Conversation) => {
    setSelected(conv);
    if ((conv.unread_count ?? 0) > 0) {
      const newReadIds = new Set(readIds);
      newReadIds.add(conv.id);
      setReadIds(newReadIds);
      setConversations(prev => sortConversations(prev, newReadIds));
    }
  };

  const goBack = () => {
    setSelected(null);
    setMessages([]);
    setOrders([]);
    // Refresh conversations to get updated unread counts
    loadConversations();
  };

  return (
    <div className="h-[calc(100dvh-120px)] md:h-[75vh] md:min-h-[520px]">
      <div className="flex h-full min-h-0 border border-border rounded-xl overflow-hidden">
        {/* Conversation list */}
        <div className={`${selected ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 lg:w-96 flex-shrink-0 min-h-0 border-r border-border bg-card`}>
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
              </div>
            ) : conversations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No conversations yet</p>
            ) : (
              conversations.map((conv) => {
                const isRead = readIds.has(conv.id);
                const hasNewActivity = (conv.unread_count ?? 0) > 0 && !isRead;
                const hasOrders = (conv.order_count ?? 0) > 0;
                const isSelected = selected?.id === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`w-full text-left px-4 py-3 border-b border-border transition-colors ${
                      isSelected
                        ? 'bg-muted'
                        : hasNewActivity
                          ? 'bg-card hover:bg-muted/50'
                          : 'bg-transparent opacity-50 hover:opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-sm truncate ${hasNewActivity ? 'font-semibold text-foreground' : 'font-normal text-muted-foreground'}`}>
                        {conv.user_name || conv.user_email}
                      </span>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {hasOrders && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 gap-0.5 cursor-pointer hover:bg-accent transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/orders?email=${encodeURIComponent(conv.user_email)}`);
                            }}
                          >
                            <Package className="h-2.5 w-2.5" />
                            {conv.order_count}
                          </Badge>
                        )}
                        {conv.blocked && <Badge variant="destructive" className="text-[10px] px-1.5">Blocked</Badge>}
                        {hasNewActivity && !conv.blocked && (
                          <Badge className="text-[10px] px-1.5 bg-accent text-accent-foreground">{conv.unread_count}</Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{conv.user_email}</p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Message area */}
        <div className={`${selected ? 'flex' : 'hidden md:flex'} flex-col flex-1 min-h-0 min-w-0 bg-background`}>
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              Select a conversation
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-card flex-shrink-0">
                <button onClick={goBack} className="md:hidden p-1 -ml-1 text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">{selected.user_name || selected.user_email}</p>
                  <p className="text-xs text-muted-foreground truncate">{selected.user_email}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => navigate(`/admin/orders?email=${encodeURIComponent(selected.user_email)}`)}
                    className="h-8 w-8 text-muted-foreground"
                    title="All Orders"
                  >
                    <Package className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowOrders(!showOrders)}
                    className="gap-1 text-muted-foreground text-xs hidden sm:inline-flex"
                  >
                    Orders ({orders.length})
                    {showOrders ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setShowOrders(!showOrders)}
                    className="h-8 w-8 text-muted-foreground sm:hidden"
                    title="Quick View Orders"
                  >
                    <ChevronDown className={`h-4 w-4 transition-transform ${showOrders ? 'rotate-180' : ''}`} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteConversation(selected)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={selected.blocked ? 'outline' : 'destructive'}
                    onClick={() => toggleBlock(selected)}
                    className="gap-1 text-xs h-8 px-2"
                  >
                    {selected.blocked ? <Unlock className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                    <span className="hidden sm:inline">{selected.blocked ? 'Unblock' : 'Block'}</span>
                  </Button>
                </div>
              </div>

              {/* Orders panel */}
              {showOrders && (
                <div className="border-b border-border bg-muted/50 px-3 py-2 max-h-[180px] overflow-y-auto flex-shrink-0">
                  {ordersLoading ? (
                    <p className="text-xs text-muted-foreground py-2">Loading orders...</p>
                  ) : orders.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2">No orders found.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {orders.map((order) => (
                        <button
                          key={order.id}
                          onClick={() => navigate(`/admin/orders?search=${order.order_number}`)}
                          className="w-full flex items-center justify-between bg-card rounded-lg px-3 py-2 text-xs hover:bg-muted transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold text-foreground">#{order.order_number}</span>
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <span>€{Number(order.total_amount).toFixed(2)}</span>
                            <span className="hidden sm:inline">{new Date(order.created_at).toLocaleDateString()}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 py-3 space-y-2 touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>
                {messages.map((msg, idx) => {
                  const isAdmin = msg.sender_type === 'admin';
                  const isLastAdminMsg = isAdmin && !messages.slice(idx + 1).some(m => m.sender_type === 'admin');
                  const isSeen = isAdmin && selected?.customer_last_seen_at && new Date(msg.created_at) <= new Date(selected.customer_last_seen_at);
                  return (
                    <div key={msg.id}>
                      <div className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] sm:max-w-[75%] px-3 py-2 rounded-xl text-sm break-words ${
                          isAdmin
                            ? 'bg-accent text-accent-foreground rounded-br-sm'
                            : 'bg-muted text-foreground rounded-bl-sm'
                        } ${msg.id.startsWith('temp-') ? 'opacity-60' : ''}`}>
                          <ChatMessageContent message={msg.message} />
                        </div>
                      </div>
                      {isAdmin && isLastAdminMsg && isSeen && (
                        <p className="text-[10px] text-muted-foreground text-right mt-0.5 pr-1">Seen</p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Quick replies */}
              <div className="border-t border-border px-2 py-1.5 flex gap-1 flex-wrap flex-shrink-0">
                <button onClick={() => draftQuickReply(RETURN_REFUND_LINK_MSG)} className="text-[10px] px-2 py-1 rounded-md bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">
                  📋 Return
                </button>
                <button onClick={() => draftQuickReply(PROOF_MSG)} className="text-[10px] px-2 py-1 rounded-md bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">
                  📸 Proof
                </button>
                <button onClick={() => draftQuickReply(CHEAP_MSG)} className="text-[10px] px-2 py-1 rounded-md bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">
                  💰 Cheap
                </button>
                <button onClick={() => draftQuickReply(SHIPPING_MSG)} className="text-[10px] px-2 py-1 rounded-md bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">
                  📦 Shipping
                </button>
              </div>

              {/* Input */}
              <div className="border-t border-border px-2 py-2 flex gap-2 flex-shrink-0 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                  placeholder="Type a reply..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground resize-none max-h-[100px] min-h-[36px]"
                  maxLength={2000}
                  rows={input.length > 100 ? 3 : 1}
                />
                <button onClick={sendReply} disabled={!input.trim() || sending} className="text-accent disabled:opacity-30 self-end pb-1">
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChat;
