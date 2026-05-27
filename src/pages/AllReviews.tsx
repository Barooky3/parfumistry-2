import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useReviews } from '@/hooks/useReviews';
import { ReviewItem } from '@/components/reviews/ReviewItem';
import { ReviewSubmitDialog } from '@/components/reviews/ReviewSubmitDialog';

const PER_PAGE = 8;

const RatingStars = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        className={`h-3.5 w-3.5 ${i <= Math.round(rating) ? 'fill-accent text-accent' : 'text-muted-foreground/30'}`}
      />
    ))}
  </div>
);

const AllReviews = () => {
  const { visibleReviews, isAdmin, refresh } = useReviews();
  const [page, setPage] = useState(1);
  const [submitOpen, setSubmitOpen] = useState(false);

  const sorted = useMemo(() => {
    return [...visibleReviews].sort((a, b) => {
      if (a.isOwn && a.status === 'pending' && !(b.isOwn && b.status === 'pending')) return -1;
      if (b.isOwn && b.status === 'pending' && !(a.isOwn && a.status === 'pending')) return 1;
      if (a.source === 'db' && b.source === 'seed') return -1;
      if (b.source === 'db' && a.source === 'seed') return 1;
      return 0;
    });
  }, [visibleReviews]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PER_PAGE;
  const end = Math.min(start + PER_PAGE, sorted.length);
  const pageReviews = sorted.slice(start, end);

  const stats = useMemo(() => {
    const approved = visibleReviews.filter((r) => r.status === 'approved');
    const total = approved.length;
    const avg = total === 0 ? 0 : approved.reduce((s, r) => s + r.rating, 0) / total;
    const counts = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: approved.filter((r) => r.rating === star).length,
    }));
    return { total, avg: Math.round(avg * 10) / 10, counts };
  }, [visibleReviews]);

  const maxCount = Math.max(...stats.counts.map((c) => c.count), 1);

  return (
    <div className="min-h-[80vh] bg-background py-10 md:py-14">
      <div className="container max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground mb-3">
              Customer Reviews
            </h1>
          </div>
          <Button onClick={() => setSubmitOpen(true)} className="rounded-none whitespace-nowrap" size="sm">
            <Plus className="h-4 w-4 mr-1.5" />
            {isAdmin ? 'Add review' : 'Write a review'}
          </Button>
        </div>

        <div className="mb-10">
          <div className="flex items-end gap-2">
            <span className="font-display text-4xl md:text-5xl font-bold text-foreground leading-none">
              {stats.avg.toString().replace('.', ',')}
            </span>
            <span className="text-muted-foreground text-sm mb-1.5">/ 5</span>
          </div>
          <div className="mt-2">
            <RatingStars rating={stats.avg} />
          </div>
          <p className="text-sm text-muted-foreground mt-2 mb-5">{stats.total} reviews</p>

          <div className="space-y-2 max-w-sm">
            {stats.counts.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground w-3">{star}</span>
                <Star className="h-3.5 w-3.5 fill-accent text-accent shrink-0" />
                <div className="flex-1 h-2 bg-muted/40 rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: `${(count / maxCount) * 100}%` }} />
                </div>
                <span className="text-muted-foreground w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">All ratings</div>
        <div className="text-sm text-muted-foreground mb-2">
          Newest first · Showing {sorted.length === 0 ? 0 : start + 1}–{end} of {sorted.length} reviews
        </div>

        <div className="divide-y divide-border">
          {pageReviews.map((review) => (
            <ReviewItem key={review.id} review={review} isAdmin={isAdmin} onChanged={refresh} />
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 mt-10">
          <Button
            variant="outline"
            size="sm"
            className="rounded-none"
            disabled={safePage === 1}
            onClick={() => {
              setPage((p) => Math.max(1, p - 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground px-3">
            {safePage} ... {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="rounded-none"
            disabled={safePage === totalPages}
            onClick={() => {
              setPage((p) => Math.min(totalPages, p + 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            Next
          </Button>
        </div>
      </div>

      <ReviewSubmitDialog open={submitOpen} onOpenChange={setSubmitOpen} onSubmitted={refresh} />
    </div>
  );
};

export default AllReviews;
