import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, Ban, Unlock, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const ADMIN_EMAILS = ["ewhz3384@gmail.com", "malikisthebiggestw@gmail.com"];

interface Conversation {
  id: string;
  user_email: string;
  user_name: string | null;
  blocked: boolean;
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

const AdminChat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);

  const invokeAdminChat = async (body: Record<string, any>) => {
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
  };

  useEffect(() => {
    if (!isAdmin) return;
    loadConversations();

    const channel = supabase
      .channel('admin-chat-convos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_conversations' }, () => {
        loadConversations();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, () => {
        loadConversations();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isAdmin]);

  const loadConversations = async () => {
    const data = await invokeAdminChat({ action: 'list_conversations' });
    if (data?.conversations) {
      setConversations(data.conversations);
    }
    setLoading(false);
  };

  // Load messages when selecting conversation
  useEffect(() => {
    if (!selected) return;
    loadMessages(selected.id);

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
    // Mark as read
    await invokeAdminChat({ action: 'mark_read', conversation_id: convId });
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendReply = async () => {
    if (!input.trim() || !selected) return;
    const text = input.trim();
    setInput('');

    await invokeAdminChat({ action: 'send_reply', conversation_id: selected.id, message: text });
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

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-muted-foreground">Access denied.</p>
      </div>
    );
  }

  return (
    <div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[65vh] border border-border rounded-xl overflow-hidden">
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
                    {conv.blocked && <Badge variant="destructive" className="text-[10px] px-1.5">Blocked</Badge>}
                    {hasNewActivity && !conv.blocked && (
                      <Badge className="text-[10px] px-1.5 bg-accent text-accent-foreground">{conv.unread_count}</Badge>
                    )}
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

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${
                      msg.sender_type === 'admin'
                        ? 'bg-accent text-accent-foreground rounded-br-sm'
                        : 'bg-muted text-foreground rounded-bl-sm'
                    }`}>
                      {msg.message}
                    </div>
                  </div>
                ))}
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
                <button onClick={sendReply} disabled={!input.trim()} className="text-accent disabled:opacity-30">
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
