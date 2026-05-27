import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useReviews } from '@/hooks/useReviews';
import { ReviewItem } from '@/components/reviews/ReviewItem';
import { ReviewSubmitDialog } from '@/components/reviews/ReviewSubmitDialog';

const RatingStars = ({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) => {
  const cls = size === 'lg' ? 'h-5 w-5' : 'h-3.5 w-3.5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${cls} ${i <= Math.round(rating) ? 'fill-accent text-accent' : 'text-muted-foreground/30'}`}
        />
      ))}
    </div>
  );
};

const HomeReviews = () => {
  const { visibleReviews, isAdmin, refresh } = useReviews();
  const [submitOpen, setSubmitOpen] = useState(false);

  // Sort: pending-own first (so user sees their own), then by date desc (db before seed naturally)
  const sorted = useMemo(() => {
    return [...visibleReviews].sort((a, b) => {
      if (a.isOwn && a.status === 'pending' && !(b.isOwn && b.status === 'pending')) return -1;
      if (b.isOwn && b.status === 'pending' && !(a.isOwn && a.status === 'pending')) return 1;
      // db approved before seed
      if (a.source === 'db' && b.source === 'seed') return -1;
      if (b.source === 'db' && a.source === 'seed') return 1;
      return 0;
    });
  }, [visibleReviews]);

  const previewReviews = sorted.slice(0, 4);

  const stats = useMemo(() => {
    // Stats include all approved reviews (seed + db approved). Exclude own-pending from public-facing avg.
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
    <section className="py-14 md:py-20 bg-background">
      <div className="container">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 md:mb-12">
          <div>
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl text-foreground mb-3">
              Customer Reviews
            </h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
              See what fragrance lovers around the world are saying about Parfumistry. All reviews are from verified customers.
            </p>
          </div>
          <Button
            onClick={() => setSubmitOpen(true)}
            className="rounded-none whitespace-nowrap"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            {isAdmin ? 'Add review' : 'Write a review'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Left: Summary */}
          <div>
            <div className="flex items-end gap-2 mb-2">
              <span className="font-display text-5xl md:text-6xl font-bold text-foreground leading-none">
                {stats.avg.toString().replace('.', ',')}
              </span>
              <span className="text-muted-foreground text-base mb-2">/ 5</span>
            </div>
            <RatingStars rating={stats.avg} size="lg" />
            <p className="text-sm text-muted-foreground mt-2 mb-5">{stats.total} reviews</p>

            <div className="space-y-2 max-w-md">
              {stats.counts.map(({ star, count }) => (
                <div key={star} className="flex items-center gap-3 text-sm">
                  <span className="text-muted-foreground w-3">{star}</span>
                  <Star className="h-3.5 w-3.5 fill-accent text-accent shrink-0" />
                  <div className="flex-1 h-2 bg-muted/40 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full"
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-muted-foreground w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Preview reviews */}
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-5 uppercase tracking-wider">
              <span>All ratings</span>
              <span>·</span>
              <span>Newest first</span>
            </div>

            <div className="divide-y divide-border">
              {previewReviews.map((review) => (
                <ReviewItem
                  key={review.id}
                  review={review}
                  isAdmin={isAdmin}
                  onChanged={refresh}
                />
              ))}
            </div>

            <Link
              to="/reviews"
              className="inline-flex items-center gap-2 text-accent hover:text-accent/80 text-sm font-medium mt-8 group"
            >
              View all reviews
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      <ReviewSubmitDialog open={submitOpen} onOpenChange={setSubmitOpen} onSubmitted={refresh} />
    </section>
  );
};

export default HomeReviews;
