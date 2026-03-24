import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Send, ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChatMessageContent from '@/components/chat/ChatMessageContent';

const MALIK_EMAIL = "malikisthebiggestw@gmail.com";

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
  fake_name: string;
  updated_at: string;
  unread_count: number;
}

interface Message {
  id: string;
  sender_type: string;
  message: string;
  created_at: string;
  read: boolean;
}

const MalikChatInbox = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const tokenRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isMalik = user?.email === MALIK_EMAIL;
  const selected = useMemo(() => conversations.find(c => c.id === selectedId) ?? null, [conversations, selectedId]);

  // Keep a fresh token cached
  const getToken = useCallback(async () => {
    if (tokenRef.current) return tokenRef.current;
    let { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      const { data } = await supabase.auth.refreshSession();
      session = data?.session ?? null;
    }
    tokenRef.current = session?.access_token ?? null;
    // Clear after 50 min
    setTimeout(() => { tokenRef.current = null; }, 50 * 60 * 1000);
    return tokenRef.current;
  }, []);

  const invoke = useCallback(async (body: Record<string, any>) => {
    const token = await getToken();
    if (!token) return null;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fake-chat`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      );
      if (!res.ok) return null;
      return await res.json();
    } catch { return null; }
  }, [getToken]);

  // Initial load only
  const loadConversations = useCallback(async () => {
    const data = await invoke({ action: 'list_conversations' });
    if (data?.conversations) setConversations(data.conversations);
    setLoading(false);
  }, [invoke]);

  // Boot: load once, then use realtime for updates
  useEffect(() => {
    if (!isMalik) return;
    loadConversations();

    const channel = supabase
      .channel('malik-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fake_chat_conversations' }, (payload) => {
        const row = payload.new as any;
        if (!row?.id) return;
        if (payload.eventType === 'UPDATE' && row.hidden) {
          setConversations(prev => prev.filter(c => c.id !== row.id));
          return;
        }
        setConversations(prev => {
          const idx = prev.findIndex(c => c.id === row.id);
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], fake_name: row.fake_name, updated_at: row.updated_at };
            updated.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
            return updated;
          }
          if (!row.hidden) {
            return [{ id: row.id, fake_name: row.fake_name, updated_at: row.updated_at, unread_count: 0 }, ...prev];
          }
          return prev;
        });
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'fake_chat_messages' }, (payload) => {
        const msg = payload.new as any;
        if (!msg?.conversation_id) return;
        // If it's a customer message in a conversation we're NOT viewing, bump unread
        if (msg.sender_type === 'customer') {
          setConversations(prev => prev.map(c =>
            c.id === msg.conversation_id
              ? { ...c, unread_count: (c.unread_count || 0) + 1, updated_at: new Date().toISOString() }
              : c
          ).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isMalik, loadConversations]);

  // Messages for selected conversation
  useEffect(() => {
    if (!selectedId) return;

    // Load messages once
    invoke({ action: 'get_messages', conversation_id: selectedId }).then(data => {
      if (data?.messages) setMessages(data.messages);
    });
    invoke({ action: 'mark_read', conversation_id: selectedId });
    // Clear unread count locally
    setConversations(prev => prev.map(c => c.id === selectedId ? { ...c, unread_count: 0 } : c));

    const channel = supabase
      .channel(`malik-msgs-${selectedId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'fake_chat_messages',
        filter: `conversation_id=eq.${selectedId}`,
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
        if (newMsg.sender_type === 'customer') {
          invoke({ action: 'mark_read', conversation_id: selectedId });
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedId, invoke]);

  // Auto-scroll on new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (el) requestAnimationFrame(() => { el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' }); });
  }, [messages]);

  const sendReply = async () => {
    if (!input.trim() || !selectedId || sending) return;
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

    const result = await invoke({ action: 'send_reply', conversation_id: selectedId, message: text });
    if (result?.message_id) {
      setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? { ...m, id: result.message_id } : m));
    }
    setSending(false);
    inputRef.current?.focus();
  };

  const insertQuickReply = (msg: string) => {
    setInput(msg);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const deleteConversation = async (conv: Conversation) => {
    setConversations(prev => prev.filter(c => c.id !== conv.id));
    if (selectedId === conv.id) { setSelectedId(null); setMessages([]); }
    await invoke({ action: 'delete', conversation_id: conv.id });
  };

  const clearAllChats = async () => {
    if (!confirm('Clear ALL chats? This cannot be undone.')) return;
    setConversations([]);
    setSelectedId(null);
    setMessages([]);
    await invoke({ action: 'clear_all' });
  };

  if (!isMalik) {
    return <div className="flex items-center justify-center min-h-[40vh]"><p className="text-muted-foreground">Access denied.</p></div>;
  }

  const goBack = () => { setSelectedId(null); setMessages([]); };

  return (
    <div className="h-[calc(100dvh-120px)] md:h-[75vh] md:min-h-[520px]">
      <div className="flex h-full min-h-0 border border-border rounded-xl overflow-hidden">
        {/* Sidebar */}
        <div className={`${selectedId ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 lg:w-96 flex-shrink-0 min-h-0 border-r border-border bg-card`}>
          {conversations.length > 0 && (
            <div className="px-3 py-2 border-b border-border flex-shrink-0">
              <Button size="sm" variant="destructive" onClick={clearAllChats} className="w-full gap-1 text-xs">
                <Trash2 className="h-3 w-3" /> Clear All Chats
              </Button>
            </div>
          )}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch]">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
              </div>
            ) : conversations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No conversations yet</p>
            ) : (
              conversations.map((conv) => {
                const hasUnread = conv.unread_count > 0;
                const active = selectedId === conv.id;
                return (
                  <div
                    key={conv.id}
                    className={`flex items-center border-b border-border transition-all duration-150 ${
                      active ? 'bg-muted' : hasUnread ? 'bg-card hover:bg-muted/50' : 'opacity-50 hover:opacity-75'
                    }`}
                  >
                    <button
                      onClick={() => setSelectedId(conv.id)}
                      className="flex-1 text-left px-4 py-3 active:scale-[0.98] transition-transform"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-sm truncate ${hasUnread ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                          {conv.fake_name}
                        </span>
                        {hasUnread && (
                          <span className="flex-shrink-0 text-[10px] min-w-[18px] text-center px-1.5 py-0.5 rounded-full bg-accent text-accent-foreground font-medium">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {new Date(conv.updated_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </button>
                    <button
                      onClick={() => deleteConversation(conv)}
                      className="px-3 py-3 text-muted-foreground hover:text-destructive active:scale-90 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className={`${selectedId ? 'flex' : 'hidden md:flex'} flex-col flex-1 min-h-0 min-w-0 bg-background`}>
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">Select a conversation</div>
          ) : (
            <>
              <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border bg-card flex-shrink-0">
                <button onClick={goBack} className="md:hidden p-1.5 -ml-1 text-muted-foreground hover:text-foreground active:scale-95 transition-transform">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <p className="font-semibold text-sm text-foreground truncate flex-1">{selected.fake_name}</p>
              </div>

              <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 py-3 space-y-1.5 [-webkit-overflow-scrolling:touch]">
                {messages.map((msg) => {
                  const isAdmin = msg.sender_type === 'admin';
                  const isTemp = msg.id.startsWith('temp-');
                  return (
                    <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} animate-in fade-in-0 duration-200`}>
                      <div className={`max-w-[85%] sm:max-w-[75%] px-3 py-2 rounded-2xl text-sm break-words ${
                        isAdmin
                          ? 'bg-accent text-accent-foreground rounded-br-md'
                          : 'bg-muted text-foreground rounded-bl-md'
                      } ${isTemp ? 'opacity-50' : ''}`}>
                        <ChatMessageContent message={msg.message} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick replies */}
              <div className="border-t border-border px-2 py-1.5 flex gap-1.5 flex-wrap flex-shrink-0 bg-card/50">
                {[
                  { label: '📋 Return', msg: RETURN_REFUND_LINK_MSG },
                  { label: '📸 Proof', msg: PROOF_MSG },
                  { label: '💰 Cheap', msg: CHEAP_MSG },
                  { label: '📦 Shipping', msg: SHIPPING_MSG },
                ].map(q => (
                  <button
                    key={q.label}
                    onClick={() => insertQuickReply(q.msg)}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground active:scale-95 transition-all duration-150"
                  >
                    {q.label}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="border-t border-border px-3 py-2 flex gap-2 items-end flex-shrink-0 bg-card pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
                <div className="flex gap-1 self-end pb-1">
                  <button onClick={() => setInput(p => p + '🤓')} className="text-lg active:scale-90 transition-transform">🤓</button>
                  <button onClick={() => setInput(p => p + '👍')} className="text-lg active:scale-90 transition-transform">👍</button>
                </div>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                  placeholder="Type a reply..."
                  className="flex-1 bg-muted/50 text-sm outline-none placeholder:text-muted-foreground resize-none max-h-[120px] min-h-[38px] rounded-xl px-3 py-2 border border-border focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                  maxLength={2000}
                  rows={input.split('\n').length > 2 ? 3 : 1}
                />
                <button
                  onClick={sendReply}
                  disabled={!input.trim() || sending}
                  className="p-2 rounded-full bg-accent text-accent-foreground disabled:opacity-30 active:scale-90 transition-all self-end"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MalikChatInbox;
