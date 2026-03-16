import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import ChatMessageContent from '@/components/chat/ChatMessageContent';

const ADMIN_EMAILS = ["ewhz3384@gmail.com"];

interface Message {
  id: string;
  sender_type: string;
  message: string;
  created_at: string;
}

export default function ChatReply() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get('id');
  const customerEmail = searchParams.get('email') || '';

  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);

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
    if (!isAdmin || !conversationId) return;
    (async () => {
      const data = await invokeAdminChat({ action: 'get_messages', conversation_id: conversationId });
      if (data?.messages) {
        setMessages(data.messages.slice(-10)); // Show last 10 messages for context
      }
      setLoadingMessages(false);
    })();
  }, [isAdmin, conversationId]);

  const handleSend = async () => {
    if (!reply.trim() || !conversationId || sending) return;
    setSending(true);
    setError('');

    const result = await invokeAdminChat({
      action: 'send_reply',
      conversation_id: conversationId,
      message: reply.trim(),
    });

    if (result?.success) {
      setSent(true);
      setReply('');
    } else {
      setError('Failed to send reply. Please try again.');
    }
    setSending(false);
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Please log in as admin first.</p>
      </div>
    );
  }

  if (!conversationId) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">No conversation specified.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-8 px-4">
      <h1 className="text-xl font-bold text-foreground mb-1">Quick Reply</h1>
      <p className="text-sm text-muted-foreground mb-6">Replying to <strong>{customerEmail}</strong></p>

      {/* Recent messages for context */}
      {!loadingMessages && messages.length > 0 && (
        <div className="mb-6 space-y-2 max-h-[300px] overflow-y-auto border border-border rounded-xl p-3 bg-card">
          <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mb-2">Recent messages</p>
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                msg.sender_type === 'admin'
                  ? 'bg-accent text-accent-foreground rounded-br-sm'
                  : 'bg-muted text-foreground rounded-bl-sm'
              }`}>
                <ChatMessageContent message={msg.message} />
              </div>
            </div>
          ))}
        </div>
      )}

      {sent ? (
        <div className="flex flex-col items-center gap-3 py-8">
          <CheckCircle className="h-10 w-10 text-green-500" />
          <p className="text-foreground font-medium">Reply sent!</p>
          <Button variant="outline" size="sm" onClick={() => setSent(false)}>
            Send another reply
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <Textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Type your reply..."
            rows={4}
            maxLength={2000}
            className="resize-none"
            autoFocus
          />
          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          <Button onClick={handleSend} disabled={!reply.trim() || sending} className="w-full gap-2">
            <Send className="h-4 w-4" />
            {sending ? 'Sending...' : 'Send Reply'}
          </Button>
        </div>
      )}
    </div>
  );
}
