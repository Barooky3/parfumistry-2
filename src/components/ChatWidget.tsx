import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import ChatMessageContent from '@/components/chat/ChatMessageContent';

interface Message {
  id: string;
  sender_type: string;
  message: string;
  created_at: string;
  isLocal?: boolean;
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

  // Update customer_last_seen_at every time chat opens
  useEffect(() => {
    if (!user || !open || !conversationId) return;
    supabase
      .from('chat_conversations')
      .update({ customer_last_seen_at: new Date().toISOString() })
      .eq('id', conversationId)
      .then();
  }, [user, open, conversationId]);

  // Load or create conversation when user is logged in and chat opens
  useEffect(() => {
    if (!user || !open) return;
    if (loadedRef.current && conversationId) return;

    const loadConversation = async () => {
      setLoading(true);
      // Fetch ALL conversations to check if any are blocked
      const { data: convos } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (convos && convos.length > 0) {
        // If ANY conversation is blocked, the user is blocked
        const anyBlocked = convos.some(c => c.blocked === true);
        if (anyBlocked) {
          setIsBlocked(true);
          loadedRef.current = true;
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

        // Mark customer as having seen messages now
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

  // Realtime subscription
  useEffect(() => {
    if (!conversationId) return;

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
          // Replace local optimistic duplicate
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
          // Mark as seen immediately if chat is open
          if (conversationId) {
            supabase
              .from('chat_conversations')
              .update({ customer_last_seen_at: new Date().toISOString() })
              .eq('id', conversationId);
          }
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  // Load convo ID when closed for realtime notifications
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

  const sendMessage = useCallback(async () => {
    if (!input.trim() || !user) return;
    const text = input.trim();
    setInput('');

    // Optimistic local message (shown even if blocked for silent blocking)
    const localMsg: Message = {
      id: crypto.randomUUID(),
      sender_type: 'customer',
      message: text,
      created_at: new Date().toISOString(),
      isLocal: true,
    };
    setMessages(prev => [...prev, localMsg]);

    // Silently block: don't send, don't create new conversations
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

    await Promise.all([
      supabase.from('chat_messages').insert({
        conversation_id: convId,
        sender_type: 'customer',
        message: text,
      }),
      supabase
        .from('chat_conversations')
        .update({ customer_last_seen_at: new Date().toISOString() })
        .eq('id', convId),
    ]);

    supabase.functions.invoke('chat-notify', {
      body: { conversation_id: convId, message: text, user_email: user.email },
    });
  }, [input, user, isBlocked, conversationId]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

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

          {!user ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
              <LogIn className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Please log in or create an account to start chatting with our support team.</p>
              <div className="flex gap-2">
                <Button asChild size="sm">
                  <Link to="/login" onClick={() => setOpen(false)}>Log In</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link to="/signup" onClick={() => setOpen(false)}>Sign Up</Link>
                </Button>
              </div>
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

              <div className="border-t border-border px-3 py-2 flex gap-2 shrink-0 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  maxLength={1000}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="text-accent disabled:opacity-30 hover:opacity-70 transition-opacity"
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
