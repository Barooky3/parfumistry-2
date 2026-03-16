import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Send, Ban, Unlock, Trash2, Package, ChevronDown, ChevronUp } from 'lucide-react';
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

interface Conversation {
  id: string;
  user_email: string;
  user_name: string | null;
  blocked: boolean;
  updated_at: string;
  unread_count?: number;
  order_count?: number;
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

  // Keep ref in sync
  useEffect(() => { selectedRef.current = selected; }, [selected]);

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

  // Load conversations
  useEffect(() => {
    if (!isAdmin) return;
    loadConversations();

    const channel = supabase
      .channel('admin-chat-convos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_conversations' }, () => {
        loadConversations();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
        // If new message is for the currently selected conversation, add it
        const newMsg = payload.new as Message & { conversation_id: string };
        if (selectedRef.current && newMsg.conversation_id === selectedRef.current.id) {
          setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          // Mark as read
          invokeAdminChat({ action: 'mark_read', conversation_id: selectedRef.current.id });
        }
        loadConversations();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isAdmin]);

  const loadConversations = async () => {
    const data = await invokeAdminChat({ action: 'list_conversations' });
    if (data?.conversations) {
      const sorted = [...data.conversations].sort((a: Conversation, b: Conversation) => {
        const aUnread = (a.unread_count ?? 0) > 0 ? 1 : 0;
        const bUnread = (b.unread_count ?? 0) > 0 ? 1 : 0;
        if (aUnread !== bUnread) return bUnread - aUnread;
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });
      setConversations(sorted);
    }
    setLoading(false);
  };

  // Load messages when selecting conversation
  useEffect(() => {
    if (!selected) return;
    loadMessages(selected.id);
    loadOrders(selected.user_email);
    setShowOrders(false);

    // Dedicated channel for this conversation's messages
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
          return [...prev, newMsg];
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selected?.id]);

  const loadMessages = async (convId: string) => {
    const data = await invokeAdminChat({ action: 'get_messages', conversation_id: convId });
    if (data?.messages) {
      setMessages(data.messages);
    }
    await invokeAdminChat({ action: 'mark_read', conversation_id: convId });
  };

  const loadOrders = async (email: string) => {
    setOrdersLoading(true);
    const data = await invokeAdminChat({ action: 'get_orders', user_email: email });
    setOrders(data?.orders || []);
    setOrdersLoading(false);
  };

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendReply = async () => {
    if (!input.trim() || !selected || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);

    // Optimistic update
    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      sender_type: 'admin',
      message: text,
      created_at: new Date().toISOString(),
      read: true,
    };
    setMessages(prev => [...prev, optimisticMsg]);

    const result = await invokeAdminChat({ action: 'send_reply', conversation_id: selected.id, message: text });
    
    // Replace optimistic message with real one if we got it back, or reload
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

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 h-[75vh] border border-border rounded-xl overflow-hidden">
        {/* Conversation list */}
        <div className="md:col-span-1 border-r border-border overflow-y-auto bg-card">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No conversations yet</p>
          ) : (
            conversations.map((conv) => {
              const hasNewActivity = (conv.unread_count ?? 0) > 0;
              const hasOrders = (conv.order_count ?? 0) > 0;
              const isSelected = selected?.id === conv.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => setSelected(conv)}
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
                    <div className="flex items-center gap-1.5">
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

        {/* Message area */}
        <div className="md:col-span-2 flex flex-col bg-background">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              Select a conversation
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
                <div>
                  <p className="font-semibold text-sm text-foreground">{selected.user_name || selected.user_email}</p>
                  <p className="text-xs text-muted-foreground">{selected.user_email}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowOrders(!showOrders)}
                    className="gap-1 text-muted-foreground"
                  >
                    <Package className="h-3.5 w-3.5" />
                    Orders ({orders.length})
                    {showOrders ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteConversation(selected)}
                    className="gap-1 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant={selected.blocked ? 'outline' : 'destructive'}
                    onClick={() => toggleBlock(selected)}
                    className="gap-1"
                  >
                    {selected.blocked ? <Unlock className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                    {selected.blocked ? 'Unblock' : 'Block'}
                  </Button>
                </div>
              </div>

              {/* Orders panel */}
              {showOrders && (
                <div className="border-b border-border bg-muted/50 px-4 py-2 max-h-[200px] overflow-y-auto">
                  {ordersLoading ? (
                    <p className="text-xs text-muted-foreground py-2">Loading orders...</p>
                  ) : orders.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2">No orders found for this customer.</p>
                  ) : (
                    <div className="space-y-2">
                      {orders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between bg-card rounded-lg px-3 py-2 text-xs">
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-semibold text-foreground">#{order.order_number}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <span>€{Number(order.total_amount).toFixed(2)}</span>
                            <span>{new Date(order.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${
                      msg.sender_type === 'admin'
                        ? 'bg-accent text-accent-foreground rounded-br-sm'
                        : 'bg-muted text-foreground rounded-bl-sm'
                    } ${msg.id.startsWith('temp-') ? 'opacity-60' : ''}`}>
                      <ChatMessageContent message={msg.message} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick replies */}
              <div className="border-t border-border px-3 py-2 flex gap-1.5 flex-wrap">
                <button
                  onClick={() => sendQuickReply(RETURN_REFUND_LINK_MSG)}
                  disabled={sending}
                  className="text-[10px] px-2 py-1 rounded-md bg-muted text-muted-foreground hover:bg-muted/80 transition-colors disabled:opacity-50"
                >
                  📋 Return & Refund Policy
                </button>
                <button
                  onClick={() => sendQuickReply(PROOF_MSG)}
                  disabled={sending}
                  className="text-[10px] px-2 py-1 rounded-md bg-muted text-muted-foreground hover:bg-muted/80 transition-colors disabled:opacity-50"
                >
                  📸 Proof Photos
                </button>
              </div>

              {/* Input */}
              <div className="border-t border-border px-3 py-2 flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                  placeholder="Type a reply..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  maxLength={2000}
                />
                <button onClick={sendReply} disabled={!input.trim() || sending} className="text-accent disabled:opacity-30">
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
