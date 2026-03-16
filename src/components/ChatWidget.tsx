import { useState, useEffect, useRef } from 'react';
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
}

export const ChatWidget = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load or create conversation when user is logged in and chat opens
  useEffect(() => {
    if (!user || !open) return;

    const loadConversation = async () => {
      setLoading(true);
      // Check for existing conversation
      const { data: convos } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (convos && convos.length > 0) {
        const convo = convos[0];
        setBlocked(convo.blocked);
        setConversationId(convo.id);
        // Load messages
        const { data: msgs } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('conversation_id', convo.id)
          .order('created_at', { ascending: true });
        setMessages(msgs || []);
      }
      setLoading(false);
    };

    loadConversation();
  }, [user, open]);

  // Realtime subscription for new messages (always active when conversationId exists)
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
          return [...prev, newMsg];
        });
        // If message is from admin, auto-open the chat widget
        if (newMsg.sender_type === 'admin') {
          setOpen(true);
          setUnreadCount(0);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  // Load conversation even when chat is closed to enable realtime notifications
  useEffect(() => {
    if (!user) return;
    const loadConvoId = async () => {
      const { data: convos } = await supabase
        .from('chat_conversations')
        .select('id, blocked')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);
      if (convos && convos.length > 0) {
        setConversationId(convos[0].id);
        setBlocked(convos[0].blocked);
      }
    };
    if (!conversationId) loadConvoId();
  }, [user]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !user) return;
    const text = input.trim();
    setInput('');

    let convId = conversationId;

    // Create conversation if none exists
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

    // Insert message
    await supabase.from('chat_messages').insert({
      conversation_id: convId,
      sender_type: 'customer',
      message: text,
    });

    // Notify admin via edge function (fire and forget) — skip if blocked
    if (!blocked) {
      supabase.functions.invoke('chat-notify', {
        body: { conversation_id: convId, message: text, user_email: user.email },
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => { setOpen(true); setUnreadCount(0); }}
          className="fixed bottom-5 right-5 z-50 h-14 px-5 rounded-full bg-accent text-accent-foreground shadow-lg flex items-center justify-center gap-2 hover:scale-105 transition-transform"
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

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-5 right-5 z-50 w-[340px] sm:w-[380px] h-[min(480px,calc(100dvh-40px))] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden overscroll-contain">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-accent text-accent-foreground">
            <span className="font-semibold text-sm">Live Support</span>
            <button onClick={() => setOpen(false)} className="hover:opacity-70">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          {!user ? (
            // Not logged in
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
              {/* Messages */}
              <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-3 space-y-2 touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center mt-8">Send a message to start chatting with our team!</p>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender_type === 'customer' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${
                        msg.sender_type === 'customer'
                          ? 'bg-accent text-accent-foreground rounded-br-sm'
                          : 'bg-muted text-foreground rounded-bl-sm'
                      }`}>
                        <ChatMessageContent message={msg.message} />
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Disclaimer */}
              <div className="px-4 py-1.5 bg-muted/50 border-t border-border">
                <p className="text-[10px] text-muted-foreground text-center leading-tight">
                  Replies usually take a few minutes to hours. You'll be notified by email or on the website when we respond.
                </p>
              </div>

              {/* Input */}
              <div className="border-t border-border px-3 py-2 flex gap-2">
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
