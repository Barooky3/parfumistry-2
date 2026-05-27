import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { submitReview, adminAddReview, ADMIN_EMAIL } from '@/hooks/useReviews';
import { toast } from '@/hooks/use-toast';

interface ReviewSubmitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted?: () => void;
}

export const ReviewSubmitDialog = ({ open, onOpenChange, onSubmitted }: ReviewSubmitDialogProps) => {
  const { user } = useAuth();
  const isAdmin = user?.email === ADMIN_EMAIL;
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    // Logged-out prompt
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Sign in to write a review</DialogTitle>
            <DialogDescription>
              You need a Parfumistry account to leave a review. It only takes a moment.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 mt-2">
            <Button asChild className="rounded-none" onClick={() => onOpenChange(false)}>
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-none" onClick={() => onOpenChange(false)}>
              <Link to="/signup">Create account</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const displayName =
    name.trim() ||
    (user.user_metadata?.full_name as string | undefined) ||
    (user.email ? user.email.split('@')[0] : 'Anonymous');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) return;
    if (!text.trim() && rating < 4) {
      toast({ title: 'Please add a short note for ratings under 4 stars.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    const res = isAdmin
      ? await adminAddReview({ customer_name: displayName, rating, text })
      : await submitReview({
          user_id: user.id,
          customer_name: displayName,
          customer_email: user.email || '',
          rating,
          text,
        });
    setSubmitting(false);
    if (res.error) {
      toast({ title: 'Could not submit review', description: res.error.message, variant: 'destructive' });
      return;
    }
    toast({
      title: isAdmin ? 'Review published' : 'Thanks for your review!',
      description: isAdmin
        ? 'Your review is now live.'
        : 'It will appear publicly once approved. You can still see it while logged in.',
    });
    setText('');
    setName('');
    setRating(5);
    onOpenChange(false);
    onSubmitted?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isAdmin ? 'Add a review (admin)' : 'Write a review'}</DialogTitle>
          <DialogDescription>
            {isAdmin
              ? 'Admin-added reviews are published immediately.'
              : 'Reviews are checked before going live, usually within 24 hours.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2 block">
              Your rating
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  onMouseEnter={() => setHoverRating(i)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(i)}
                  className="p-0.5"
                  aria-label={`${i} star${i > 1 ? 's' : ''}`}
                >
                  <Star
                    className={`h-7 w-7 transition-colors ${
                      i <= (hoverRating || rating)
                        ? 'fill-accent text-accent'
                        : 'text-muted-foreground/40'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2 block">
              Display name {isAdmin ? '' : '(optional)'}
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isAdmin ? 'e.g. Anonymous or Jean-Pierre D.' : displayName}
              maxLength={80}
              className="rounded-none"
              required={isAdmin}
            />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2 block">
              Your review
            </label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share your experience with Parfumistry..."
              rows={5}
              maxLength={1000}
              className="rounded-none resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">{text.length}/1000</p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-none"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="rounded-none" disabled={submitting}>
              {submitting ? 'Submitting...' : isAdmin ? 'Publish' : 'Submit review'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
