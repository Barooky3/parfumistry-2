import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Send, Plus, Trash2, ArrowLeft } from 'lucide-react';
import ChatMessageContent from '@/components/chat/ChatMessageContent';

const PRIMARY_ADMIN = "ewhz3384@gmail.com";

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

const FakeChatSender = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [creating, setCreating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isPrimary = user?.email === PRIMARY_ADMIN;

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
    if (data?.conversations) setConversations(data.conversations);
    setLoading(false);
  }, [invokeFakeChat]);

  useEffect(() => {
    if (!isPrimary) return;
    loadConversations();

    const channel = supabase
      .channel('primary-fake-inbox')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fake_chat_conversations' }, () => loadConversations())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'fake_chat_messages' }, () => loadConversations())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isPrimary, loadConversations]);

  useEffect(() => {
    if (!selected) return;
    loadMessages(selected.id);
    invokeFakeChat({ action: 'mark_read', conversation_id: selected.id });

    const channel = supabase
      .channel(`primary-fake-msgs-${selected.id}`)
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

  const createConversation = async () => {
    setCreating(true);
    const data = await invokeFakeChat({ action: 'create_conversation' });
    if (data?.conversation) {
      await loadConversations();
      setSelected(data.conversation);
    }
    setCreating(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || !selected || sending) return;
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

    await invokeFakeChat({
      action: 'send_customer_message',
      conversation_id: selected.id,
      message: text,
    });
    setSending(false);
  };

  const deleteConversation = async (conv: Conversation) => {
    await invokeFakeChat({ action: 'delete', conversation_id: conv.id });
    if (selected?.id === conv.id) { setSelected(null); setMessages([]); }
    loadConversations();
  };

  if (!isPrimary) return null;

  const goBack = () => { setSelected(null); setMessages([]); loadConversations(); };

  return (
    <div className="h-[calc(100dvh-120px)] md:h-[75vh] md:min-h-[520px]">
      <div className="flex h-full min-h-0 border border-border rounded-xl overflow-hidden">
        {/* Conversation list */}
        <div className={`${selected ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 lg:w-96 flex-shrink-0 min-h-0 border-r border-border bg-card`}>
          <div className="px-3 py-2 border-b border-border flex-shrink-0">
            <Button size="sm" onClick={createConversation} disabled={creating} className="w-full gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" />
              {creating ? 'Creating...' : 'New Fake Chat'}
            </Button>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
              </div>
            ) : conversations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No fake chats yet. Create one above.</p>
            ) : (
              conversations.map((conv) => {
                const hasUnread = (conv.unread_count ?? 0) > 0;
                const isSelected = selected?.id === conv.id;
                return (
                  <div
                    key={conv.id}
                    className={`flex items-center border-b border-border transition-colors ${
                      isSelected ? 'bg-muted' : hasUnread ? 'bg-card' : 'bg-transparent opacity-50 hover:opacity-75'
                    }`}
                  >
                    <button
                      onClick={() => setSelected(conv)}
                      className="flex-1 text-left px-4 py-3"
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
                    <button
                      onClick={() => deleteConversation(conv)}
                      className="px-2 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Message area */}
        <div className={`${selected ? 'flex' : 'hidden md:flex'} flex-col flex-1 min-h-0 min-w-0 bg-background`}>
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm text-center px-4">
              <div>
                <p className="font-medium mb-1">Malik's Fake Chat Control</p>
                <p className="text-xs">Create a chat, send messages as "customers". Malik sees them as real messages and can reply.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-card flex-shrink-0">
                <button onClick={goBack} className="md:hidden p-1 -ml-1 text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">{selected.fake_name}</p>
                  <p className="text-[11px] text-muted-foreground">Sending as this "customer" to Malik</p>
                </div>
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 py-3 space-y-2 touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>
                {messages.map((msg) => {
                  const isCustomer = msg.sender_type === 'customer';
                  const isTemp = msg.id.startsWith('temp-');
                  return (
                    <div key={msg.id} className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] sm:max-w-[75%] px-3 py-2 rounded-xl text-sm break-words ${
                        isCustomer
                          ? 'bg-accent text-accent-foreground rounded-br-sm'
                          : 'bg-muted text-foreground rounded-bl-sm'
                      } ${isTemp ? 'opacity-60' : ''}`}>
                        <ChatMessageContent message={msg.message} />
                        {!isCustomer && (
                          <p className="text-[10px] text-muted-foreground mt-1 italic">Malik's reply</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input */}
              <div className="border-t border-border px-3 py-2 flex gap-2 items-end flex-shrink-0 bg-card pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder={`Send as "${selected.fake_name}"...`}
                  className="flex-1 bg-muted/50 text-sm outline-none placeholder:text-muted-foreground resize-none max-h-[100px] min-h-[36px] rounded-lg px-3 py-2 border border-border focus:border-accent transition-colors"
                  maxLength={2000}
                  rows={input.length > 100 ? 3 : 1}
                />
                <button onClick={sendMessage} disabled={!input.trim() || sending} className="text-accent disabled:opacity-30 self-end pb-1">
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

export default FakeChatSender;
