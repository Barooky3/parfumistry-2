import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ChatMessageContent from '@/components/chat/ChatMessageContent';

interface Message {
  id: string;
  sender_type: string;
  message: string;
  created_at: string;
  isLocal?: boolean;
}

const GUEST_STORAGE_KEY = 'chat_guest_session';

function getGuestSession(): { guestId: string; email: string } | null {
  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.guestId && parsed.email) return parsed;
  } catch {}
  return null;
}

function saveGuestSession(guestId: string, email: string) {
  localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify({ guestId, email }));
}

export const ChatWidget = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  // Guest state
  const [guestEmail, setGuestEmail] = useState('');
  const [guestSession, setGuestSession] = useState<{ guestId: string; email: string } | null>(getGuestSession());
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isGuest = !user && !!guestSession;

  // Update customer_last_seen_at every time chat opens (authenticated)
  useEffect(() => {
    if (!user || !open || !conversationId) return;
    supabase
      .from('chat_conversations')
      .update({ customer_last_seen_at: new Date().toISOString() })
      .eq('id', conversationId)
      .then();
  }, [user, open, conversationId]);

  // Load conversation for authenticated users
  useEffect(() => {
    if (!user || !open) return;
    if (loadedRef.current && conversationId) return;

    const loadConversation = async () => {
      setLoading(true);
      const { data: convos } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (convos && convos.length > 0) {
        const anyBlocked = convos.some(c => c.blocked === true);
        if (anyBlocked) {
          setIsBlocked(true);
          loadedRef.current = true;
          setMessages([]);
          setLoading(false);
          return;
        }

        const convo = convos[0];
        setConversationId(convo.id);
        setIsBlocked(false);
        const { data: msgs } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('conversation_id', convo.id)
          .order('created_at', { ascending: true });
        setMessages(msgs || []);

        await supabase
          .from('chat_conversations')
          .update({ customer_last_seen_at: new Date().toISOString() })
          .eq('id', convo.id);
      }
      loadedRef.current = true;
      setLoading(false);
    };

    loadConversation();
  }, [user, open, conversationId]);

  // Load conversation for guest users
  useEffect(() => {
    if (user || !guestSession || !open) return;
    if (loadedRef.current && conversationId) return;

    const loadGuestConversation = async () => {
      setLoading(true);
      try {
        const { data } = await supabase.functions.invoke('guest-chat', {
          body: { action: 'load', guest_id: guestSession.guestId, email: guestSession.email },
        });

        if (data?.blocked) {
          setIsBlocked(true);
          setMessages([]);
        } else {
          setIsBlocked(false);
          setConversationId(data?.conversation_id || null);
          setMessages(data?.messages || []);
        }
      } catch (err) {
        console.error('Guest load error:', err);
      }
      loadedRef.current = true;
      setLoading(false);
    };

    loadGuestConversation();
  }, [user, guestSession, open, conversationId]);

  // Poll for new messages (guest only, since no realtime)
  useEffect(() => {
    if (!isGuest || !conversationId || !open) {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }

    const poll = async () => {
      try {
        const { data } = await supabase.functions.invoke('guest-chat', {
          body: { action: 'poll', guest_id: guestSession!.guestId, email: guestSession!.email, conversation_id: conversationId },
        });
        if (data?.messages) {
          setMessages(data.messages);
        }
      } catch {}
    };

    pollRef.current = setInterval(poll, 8000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [isGuest, conversationId, open, guestSession]);

  // Realtime subscription (authenticated only)
  useEffect(() => {
    if (!user || !conversationId) return;

    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        const newMsg = payload.new as Message;
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          const localDupe = prev.findIndex(m =>
            m.isLocal &&
            m.sender_type === newMsg.sender_type &&
            m.message === newMsg.message &&
            Math.abs(new Date(m.created_at).getTime() - new Date(newMsg.created_at).getTime()) < 10000
          );
          if (localDupe !== -1) {
            const updated = [...prev];
            updated[localDupe] = newMsg;
            return updated;
          }
          return [...prev, newMsg];
        });
        if (newMsg.sender_type === 'admin') {
          setOpen(true);
          setUnreadCount(0);
          if (conversationId) {
            supabase
              .from('chat_conversations')
              .update({ customer_last_seen_at: new Date().toISOString() })
              .eq('id', conversationId);
          }
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_conversations',
        filter: `id=eq.${conversationId}`,
      }, (payload) => {
        const updated = payload.new as any;
        if (updated.blocked) {
          setIsBlocked(true);
          setConversationId(null);
          loadedRef.current = true;
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, conversationId]);

  // Load convo ID when closed for realtime notifications (authenticated)
  useEffect(() => {
    if (!user || conversationId) return;
    const loadConvoId = async () => {
      const { data: convos } = await supabase
        .from('chat_conversations')
        .select('id, blocked')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (convos && convos.length > 0) {
        if (convos.some(c => c.blocked)) {
          setIsBlocked(true);
          return;
        }
        setConversationId(convos[0].id);
      }
    };
    loadConvoId();
  }, [user, conversationId]);

  // Auto-scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    }
  }, [messages]);

  // Send message (authenticated)
  const sendAuthMessage = useCallback(async () => {
    if (!input.trim() || !user) return;
    const text = input.trim();
    setInput('');

    const localMsg: Message = {
      id: crypto.randomUUID(),
      sender_type: 'customer',
      message: text,
      created_at: new Date().toISOString(),
      isLocal: true,
    };
    setMessages(prev => [...prev, localMsg]);

    if (isBlocked) return;

    let convId = conversationId;

    if (!convId) {
      const { data: newConvo, error } = await supabase
        .from('chat_conversations')
        .insert({
          user_id: user.id,
          user_email: user.email || '',
          user_name: user.user_metadata?.full_name || user.email || '',
        })
        .select()
        .single();

      if (error || !newConvo) return;
      convId = newConvo.id;
      setConversationId(convId);
    }

    const { error: msgError } = await supabase.from('chat_messages').insert({
      conversation_id: convId,
      sender_type: 'customer',
      message: text,
    });

    if (msgError) {
      console.error('Failed to send message:', msgError);
    }

    await supabase
      .from('chat_conversations')
      .update({ customer_last_seen_at: new Date().toISOString() })
      .eq('id', convId);

    supabase.functions.invoke('chat-notify', {
      body: { conversation_id: convId, message: text, user_email: user.email },
    });
  }, [input, user, isBlocked, conversationId]);

  // Send message (guest)
  const sendGuestMessage = useCallback(async () => {
    if (!input.trim() || !guestSession) return;
    const text = input.trim();
    setInput('');

    const localMsg: Message = {
      id: crypto.randomUUID(),
      sender_type: 'customer',
      message: text,
      created_at: new Date().toISOString(),
      isLocal: true,
    };
    setMessages(prev => [...prev, localMsg]);

    if (isBlocked) return;

    try {
      const { data } = await supabase.functions.invoke('guest-chat', {
        body: {
          action: 'send',
          guest_id: guestSession.guestId,
          email: guestSession.email,
          message: text,
          conversation_id: conversationId,
        },
      });

      if (data?.conversation_id && !conversationId) {
        setConversationId(data.conversation_id);
      }
    } catch (err) {
      console.error('Guest send error:', err);
    }
  }, [input, guestSession, isBlocked, conversationId]);

  const sendMessage = user ? sendAuthMessage : sendGuestMessage;

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const handleGuestStart = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = guestEmail.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return;
    const guestId = crypto.randomUUID();
    saveGuestSession(guestId, trimmed);
    setGuestSession({ guestId, email: trimmed });
    loadedRef.current = false;
  };

  const canChat = user || isGuest;

  return (
    <>
      {!open && (
        <button
          onClick={() => { setOpen(true); setUnreadCount(0); }}
          className="fixed bottom-5 right-5 z-50 h-14 px-5 rounded-full bg-accent text-accent-foreground shadow-lg flex items-center justify-center gap-2 hover:scale-105 transition-transform will-change-transform"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="font-semibold text-sm">Chat</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {open && (
        <div className="fixed bottom-0 right-0 sm:bottom-5 sm:right-5 z-50 w-full sm:w-[380px] h-[100dvh] sm:h-[min(480px,calc(100dvh-40px))] bg-card border border-border sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden overscroll-contain">
          <div className="flex items-center justify-between px-4 py-3 bg-accent text-accent-foreground shrink-0">
            <span className="font-semibold text-sm">Live Support</span>
            <button onClick={() => setOpen(false)} className="hover:opacity-70 p-1">
              <X className="h-5 w-5" />
            </button>
          </div>

          {!canChat ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
              <Mail className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Enter your email to start chatting with our support team. We'll notify you by email when we reply.</p>
              <form onSubmit={handleGuestStart} className="w-full space-y-3">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={guestEmail}
                  onChange={e => setGuestEmail(e.target.value)}
                  className="h-11 bg-background border-border rounded-lg focus:border-accent text-sm"
                  required
                  maxLength={255}
                />
                <Button type="submit" size="sm" className="w-full">
                  Start Chat
                </Button>
              </form>
            </div>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col">
              <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-3 space-y-2 touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender_type === 'customer' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${
                        msg.sender_type === 'customer'
                          ? 'bg-accent text-accent-foreground rounded-br-sm'
                          : 'bg-muted text-foreground rounded-bl-sm'
                      } ${msg.isLocal ? 'opacity-70' : ''}`}>
                        <ChatMessageContent message={msg.message} />
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="px-4 py-1.5 bg-muted/50 border-t border-border shrink-0">
                <p className="text-[10px] text-muted-foreground text-center leading-tight">
                  Replies usually take a few minutes to hours. Type out your full question so we can answer it as soon as we get back to you. You'll be notified by email when we respond.
                </p>
              </div>

              <div className="border-t border-border px-3 py-2 flex gap-2 shrink-0 bg-card pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1 bg-muted/50 text-sm outline-none placeholder:text-muted-foreground rounded-lg px-3 py-2 border border-border focus:border-accent transition-colors"
                  maxLength={1000}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="text-accent disabled:opacity-30 hover:opacity-70 transition-opacity self-center"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
