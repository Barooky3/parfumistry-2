import { useState } from 'react';
import { Star, BadgeCheck, Clock, Pencil, Trash2, Check, X, Languages, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UnifiedReview, adminUpdateReview, adminDeleteReview } from '@/hooks/useReviews';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Heuristic: treat text as non-English if it contains common non-English markers
// (diacritics or frequent foreign stop-words). Good enough for review snippets.
const NON_ENGLISH_WORDS = /\b(und|der|die|das|ist|nicht|mit|auch|sehr|schnell|alles|gut|für|über|gerne|wieder|danke|bestellung|versand|qualität|verpackung|empfehlung|bin|hab|ich|merci|livraison|rapide|produit|nickel|tous|excellent|sillage|équipe|discrète|prodotto|consegna|spedizione|ottimo|perfetto|tutto|gentile|comunque|muy|rapido|perfecto|gracias|envío|bardzo|dobra|jakość|szybka|przesyłka|polski)\b/i;
const DIACRITICS = /[äöüßéèêàâçñíóúîôûœ]/i;

const isLikelyNonEnglish = (text: string) => {
  if (!text || text.trim().length < 3) return false;
  return DIACRITICS.test(text) || NON_ENGLISH_WORDS.test(text);
};

const RatingStars = ({
  rating,
  interactive,
  onChange,
}: {
  rating: number;
  interactive?: boolean;
  onChange?: (r: number) => void;
}) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => {
      const filled = i <= Math.round(rating);
      const cls = `h-3.5 w-3.5 ${filled ? 'fill-accent text-accent' : 'text-muted-foreground/30'}`;
      return interactive ? (
        <button key={i} type="button" onClick={() => onChange?.(i)} className="p-0.5">
          <Star className={cls} />
        </button>
      ) : (
        <Star key={i} className={cls} />
      );
    })}
  </div>
);

interface ReviewItemProps {
  review: UnifiedReview;
  isAdmin: boolean;
  onChanged?: () => void;
  showDivider?: boolean;
}

export const ReviewItem = ({ review, isAdmin, onChanged }: ReviewItemProps) => {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(review.name);
  const [editText, setEditText] = useState(review.text);
  const [editRating, setEditRating] = useState(review.rating);
  const [busy, setBusy] = useState(false);
  const [translation, setTranslation] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  const canEdit = isAdmin && review.source === 'db';
  const showTranslateBtn = !!review.text && isLikelyNonEnglish(review.text);

  const handleTranslate = async () => {
    if (translation) {
      setShowTranslation((v) => !v);
      return;
    }
    setTranslating(true);
    try {
      const { data, error } = await supabase.functions.invoke('translate-text', {
        body: { text: review.text },
      });
      if (error) throw error;
      const t = (data as { translation?: string })?.translation?.trim();
      if (!t) throw new Error('Empty translation');
      setTranslation(t);
      setShowTranslation(true);
    } catch (e: any) {
      toast({ title: 'Translation failed', description: e?.message ?? 'Try again', variant: 'destructive' });
    } finally {
      setTranslating(false);
    }
  };

  const handleSave = async () => {
    setBusy(true);
    const res = await adminUpdateReview(review.id, {
      customer_name: editName,
      rating: editRating,
      text: editText || null,
    });
    setBusy(false);
    if (res.error) {
      toast({ title: 'Update failed', description: res.error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Review updated' });
    setEditing(false);
    onChanged?.();
  };

  const handleDelete = async () => {
    if (!confirm('Delete this review permanently?')) return;
    setBusy(true);
    const res = await adminDeleteReview(review.id);
    setBusy(false);
    if (res.error) {
      toast({ title: 'Delete failed', description: res.error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Review deleted' });
    onChanged?.();
  };

  if (editing) {
    return (
      <div className="py-4 space-y-2">
        <RatingStars rating={editRating} interactive onChange={setEditRating} />
        <Input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="rounded-none h-8 text-sm"
          maxLength={80}
        />
        <Textarea
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          rows={3}
          maxLength={1000}
          className="rounded-none text-sm resize-none"
        />
        <div className="flex gap-2">
          <Button size="sm" className="rounded-none h-7" onClick={handleSave} disabled={busy}>
            <Check className="h-3.5 w-3.5 mr-1" /> Save
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="rounded-none h-7"
            onClick={() => setEditing(false)}
            disabled={busy}
          >
            <X className="h-3.5 w-3.5 mr-1" /> Cancel
          </Button>
        </div>
      </div>
    );
  }

  const isPending = review.status === 'pending';

  return (
    <div className="py-4">
      <div className="flex items-center gap-2">
        <RatingStars rating={review.rating} />
        {isPending && (
          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-sm">
            <Clock className="h-3 w-3" />
            {review.isOwn ? 'Pending approval' : 'Pending'}
          </span>
        )}
      </div>
      <p className={`text-sm mt-2 ${review.text ? 'text-foreground/90' : 'italic text-muted-foreground'}`}>
        {review.text || 'Rating submitted - no written feedback'}
      </p>
      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground flex-wrap">
        <span className="text-foreground/70">{review.name}</span>
        {review.verified && (
          <span className="inline-flex items-center gap-1 text-accent">
            <BadgeCheck className="h-3.5 w-3.5" />
            Verified
          </span>
        )}
        <span className="ml-auto">{review.date}</span>
      </div>
      {canEdit && (
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
            disabled={busy}
          >
            <Pencil className="h-3 w-3" /> Edit
          </button>
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive"
            disabled={busy}
          >
            <Trash2 className="h-3 w-3" /> Delete
          </button>
        </div>
      )}
    </div>
  );
};
