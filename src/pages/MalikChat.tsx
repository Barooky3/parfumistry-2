import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Send, ArrowLeft } from 'lucide-react';
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
  unread_count?: number;
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
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<Conversation | null>(null);

  useEffect(() => { selectedRef.current = selected; }, [selected]);

  const isMalik = user?.email === MALIK_EMAIL;

  const invokeFakeChat = useCallback(async (body: Record<string, any>) => {
    let { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      const { data: refreshData } = await supabase.auth.refreshSession();
      session = refreshData?.session ?? null;
    }
    if (!session) return null;

    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fake-chat`,
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

  const loadConversations = useCallback(async () => {
    const data = await invokeFakeChat({ action: 'list_conversations' });
    if (data?.conversations) {
      setConversations(data.conversations);
    }
    setLoading(false);
  }, [invokeFakeChat]);

  useEffect(() => {
    if (!isMalik) return;
    loadConversations();

    const channel = supabase
      .channel('malik-fake-inbox')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fake_chat_conversations' }, () => loadConversations())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'fake_chat_messages' }, () => loadConversations())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isMalik, loadConversations]);

  useEffect(() => {
    if (!selected) return;
    loadMessages(selected.id);
    invokeFakeChat({ action: 'mark_read', conversation_id: selected.id });

    const channel = supabase
      .channel(`malik-msgs-${selected.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'fake_chat_messages',
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
        if (newMsg.sender_type === 'customer') {
          invokeFakeChat({ action: 'mark_read', conversation_id: selected.id });
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selected?.id]);

  const loadMessages = async (convId: string) => {
    const data = await invokeFakeChat({ action: 'get_messages', conversation_id: convId });
    if (data?.messages) setMessages(data.messages);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
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

    const result = await invokeFakeChat({
      action: 'send_reply',
      conversation_id: selected.id,
      message: text,
    });

    if (result?.message_id) {
      setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? { ...m, id: result.message_id } : m));
    }
    setSending(false);
  };

  const draftQuickReply = (msg: string) => setInput(msg);

  if (!isMalik) {
    return <div className="flex items-center justify-center min-h-[40vh]"><p className="text-muted-foreground">Access denied.</p></div>;
  }

  const goBack = () => { setSelected(null); setMessages([]); loadConversations(); };

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
                const hasUnread = (conv.unread_count ?? 0) > 0;
                const isSelected = selected?.id === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelected(conv)}
                    className={`w-full text-left px-4 py-3 border-b border-border transition-colors ${
                      isSelected ? 'bg-muted' : hasUnread ? 'bg-card hover:bg-muted/50' : 'bg-transparent opacity-50 hover:opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-sm truncate ${hasUnread ? 'font-semibold text-foreground' : 'font-normal text-muted-foreground'}`}>
                        {conv.fake_name}
                      </span>
                      {hasUnread && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent text-accent-foreground font-medium">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {new Date(conv.updated_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
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
              {/* Header */}
              <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-card flex-shrink-0">
                <button onClick={goBack} className="md:hidden p-1 -ml-1 text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">{selected.fake_name}</p>
                </div>
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 py-3 space-y-2 touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>
                {messages.map((msg) => {
                  const isAdminMsg = msg.sender_type === 'admin';
                  const isTemp = msg.id.startsWith('temp-');
                  return (
                    <div key={msg.id} className={`flex ${isAdminMsg ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] sm:max-w-[75%] px-3 py-2 rounded-xl text-sm break-words ${
                        isAdminMsg
                          ? 'bg-accent text-accent-foreground rounded-br-sm'
                          : 'bg-muted text-foreground rounded-bl-sm'
                      } ${isTemp ? 'opacity-60' : ''}`}>
                        <ChatMessageContent message={msg.message} />
                      </div>
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
              <div className="border-t border-border px-3 py-2 flex gap-2 items-end flex-shrink-0 bg-card pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
                <div className="flex gap-0.5 self-end pb-1">
                  <button onClick={() => setInput(prev => prev + '🤓')} className="text-lg hover:scale-110 transition-transform">🤓</button>
                  <button onClick={() => setInput(prev => prev + '👍')} className="text-lg hover:scale-110 transition-transform">👍</button>
                </div>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                  placeholder="Type a reply..."
                  className="flex-1 bg-muted/50 text-sm outline-none placeholder:text-muted-foreground resize-none max-h-[100px] min-h-[36px] rounded-lg px-3 py-2 border border-border focus:border-accent transition-colors"
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

export default MalikChatInbox;
