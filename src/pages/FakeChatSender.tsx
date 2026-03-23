import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Send, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChatMessageContent from '@/components/chat/ChatMessageContent';

const PRIMARY_ADMIN = "ewhz3384@gmail.com";

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

const FakeChatSender = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [creating, setCreating] = useState(false);
  const [customName, setCustomName] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const tokenRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isPrimary = user?.email === PRIMARY_ADMIN;
  const selected = useMemo(() => conversations.find(c => c.id === selectedId) ?? null, [conversations, selectedId]);

  const getToken = useCallback(async () => {
    if (tokenRef.current) return tokenRef.current;
    let { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      const { data } = await supabase.auth.refreshSession();
      session = data?.session ?? null;
    }
    tokenRef.current = session?.access_token ?? null;
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

  const loadConversations = useCallback(async () => {
    const data = await invoke({ action: 'list_conversations' });
    if (data?.conversations) setConversations(data.conversations);
    setLoading(false);
  }, [invoke]);

  // Boot + realtime
  useEffect(() => {
    if (!isPrimary) return;
    loadConversations();

    const channel = supabase
      .channel('primary-fake-rt')
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
        // Admin replies bump unread for primary
        if (msg.sender_type === 'admin') {
          setConversations(prev => prev.map(c =>
            c.id === msg.conversation_id
              ? { ...c, unread_count: (c.unread_count || 0) + 1, updated_at: new Date().toISOString() }
              : c
          ).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isPrimary, loadConversations]);

  // Messages for selected
  useEffect(() => {
    if (!selectedId) return;

    invoke({ action: 'get_messages', conversation_id: selectedId }).then(data => {
      if (data?.messages) setMessages(data.messages);
    });
    invoke({ action: 'mark_read', conversation_id: selectedId });
    setConversations(prev => prev.map(c => c.id === selectedId ? { ...c, unread_count: 0 } : c));

    const channel = supabase
      .channel(`primary-fake-msgs-${selectedId}`)
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
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedId, invoke]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) requestAnimationFrame(() => { el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' }); });
  }, [messages]);

  const createConversation = async () => {
    setCreating(true);
    const payload: any = { action: 'create_conversation' };
    if (customName.trim()) payload.fake_name = customName.trim();
    const data = await invoke(payload);
    if (data?.conversation) {
      setSelectedId(data.conversation.id);
      setCustomName('');
    }
    setCreating(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedId || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);

    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      sender_type: 'customer',
      message: text,
      created_at: new Date().toISOString(),
      read: false,
    };
    setMessages(prev => [...prev, optimisticMsg]);

    await invoke({ action: 'send_customer_message', conversation_id: selectedId, message: text });
    setSending(false);
    inputRef.current?.focus();
  };

  const deleteConversation = async (conv: Conversation) => {
    // Optimistic remove
    setConversations(prev => prev.filter(c => c.id !== conv.id));
    if (selectedId === conv.id) { setSelectedId(null); setMessages([]); }
    await invoke({ action: 'delete', conversation_id: conv.id });
  };

  if (!isPrimary) return null;

  const goBack = () => { setSelectedId(null); setMessages([]); };

  return (
    <div className="h-[calc(100dvh-120px)] md:h-[75vh] md:min-h-[520px]">
      <div className="flex h-full min-h-0 border border-border rounded-xl overflow-hidden">
        {/* Sidebar */}
        <div className={`${selectedId ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 lg:w-96 flex-shrink-0 min-h-0 border-r border-border bg-card`}>
          <div className="px-3 py-2 border-b border-border flex-shrink-0">
            <Button size="sm" onClick={createConversation} disabled={creating} className="w-full gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" />
              {creating ? 'Creating...' : 'New Fake Chat'}
            </Button>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
              </div>
            ) : conversations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No fake chats yet. Create one above.</p>
            ) : (
              conversations.map((conv) => {
                const hasUnread = conv.unread_count > 0;
                const active = selectedId === conv.id;
                return (
                  <div
                    key={conv.id}
                    className={`flex items-center border-b border-border transition-all duration-150 ${
                      active ? 'bg-muted' : hasUnread ? 'bg-card' : 'opacity-50 hover:opacity-75'
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
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm text-center px-4">
              <div>
                <p className="font-medium mb-1">Malik's Fake Chat Control</p>
                <p className="text-xs">Create a chat, send messages as "customers". Malik sees them as real messages and can reply.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border bg-card flex-shrink-0">
                <button onClick={goBack} className="md:hidden p-1.5 -ml-1 text-muted-foreground hover:text-foreground active:scale-95 transition-transform">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">{selected.fake_name}</p>
                  <p className="text-[11px] text-muted-foreground">Sending as this "customer" to Malik</p>
                </div>
              </div>

              <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 py-3 space-y-1.5 [-webkit-overflow-scrolling:touch]">
                {messages.map((msg) => {
                  const isCustomer = msg.sender_type === 'customer';
                  const isTemp = msg.id.startsWith('temp-');
                  return (
                    <div key={msg.id} className={`flex ${isCustomer ? 'justify-end' : 'justify-start'} animate-in fade-in-0 duration-200`}>
                      <div className={`max-w-[85%] sm:max-w-[75%] px-3 py-2 rounded-2xl text-sm break-words ${
                        isCustomer
                          ? 'bg-accent text-accent-foreground rounded-br-md'
                          : 'bg-muted text-foreground rounded-bl-md'
                      } ${isTemp ? 'opacity-50' : ''}`}>
                        <ChatMessageContent message={msg.message} />
                        {!isCustomer && (
                          <p className="text-[10px] text-muted-foreground mt-1 italic">Malik's reply</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-border px-3 py-2 flex gap-2 items-end flex-shrink-0 bg-card pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder={`Send as "${selected.fake_name}"...`}
                  className="flex-1 bg-muted/50 text-sm outline-none placeholder:text-muted-foreground resize-none max-h-[120px] min-h-[38px] rounded-xl px-3 py-2 border border-border focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                  maxLength={2000}
                  rows={input.split('\n').length > 2 ? 3 : 1}
                />
                <button
                  onClick={sendMessage}
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

export default FakeChatSender;
