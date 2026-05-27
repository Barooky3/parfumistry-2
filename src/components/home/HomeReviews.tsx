import { useMemo, useState } from 'react';
import { Star, Plus, ChevronLeft, ChevronRight, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useReviews } from '@/hooks/useReviews';
import { ReviewItem } from '@/components/reviews/ReviewItem';
import { ReviewSubmitDialog } from '@/components/reviews/ReviewSubmitDialog';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

const PAGE_SIZE = 6;

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
  const [filter, setFilter] = useState<number | 'all'>('all');
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    return [...visibleReviews].sort((a, b) => {
      if (a.isOwn && a.status === 'pending' && !(b.isOwn && b.status === 'pending')) return -1;
      if (b.isOwn && b.status === 'pending' && !(a.isOwn && a.status === 'pending')) return 1;
      if (a.source === 'db' && b.source === 'seed') return -1;
      if (b.source === 'db' && a.source === 'seed') return 1;
      return 0;
    });
  }, [visibleReviews]);

  const filtered = useMemo(() => {
    if (filter === 'all') return sorted;
    return sorted.filter((r) => r.rating === filter);
  }, [sorted, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageReviews = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

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

  const handleFilter = (val: number | 'all') => {
    setFilter(val);
    setPage(1);
  };

  return (
    <section className="py-14 md:py-20 bg-background">
      <div className="container">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 md:mb-12">
          <div>
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl text-foreground mb-3">
              Customer Reviews
            </h2>
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
                <button
                  key={star}
                  onClick={() => handleFilter(star)}
                  className={`w-full flex items-center gap-3 text-sm group transition-opacity ${
                    filter !== 'all' && filter !== star ? 'opacity-50 hover:opacity-100' : ''
                  }`}
                >
                  <span className="text-muted-foreground w-3">{star}</span>
                  <Star className="h-3.5 w-3.5 fill-accent text-accent shrink-0" />
                  <div className="flex-1 h-2 bg-muted/40 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full"
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-muted-foreground w-6 text-right">{count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Reviews list */}
          <div>
            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <button
                onClick={() => handleFilter('all')}
                className={`px-3 py-1.5 text-xs uppercase tracking-wider border transition-colors ${
                  filter === 'all'
                    ? 'bg-accent text-accent-foreground border-accent'
                    : 'bg-transparent text-muted-foreground border-border hover:border-accent hover:text-foreground'
                }`}
              >
                All
              </button>
              {[5, 4, 3, 2, 1].map((star) => (
                <button
                  key={star}
                  onClick={() => handleFilter(star)}
                  className={`px-3 py-1.5 text-xs uppercase tracking-wider border inline-flex items-center gap-1 transition-colors ${
                    filter === star
                      ? 'bg-accent text-accent-foreground border-accent'
                      : 'bg-transparent text-muted-foreground border-border hover:border-accent hover:text-foreground'
                  }`}
                >
                  {star}
                  <Star
                    className={`h-3 w-3 ${
                      filter === star ? 'fill-accent-foreground text-accent-foreground' : 'fill-accent text-accent'
                    }`}
                  />
                </button>
              ))}
            </div>

            {pageReviews.length === 0 ? (
              <p className="text-sm text-muted-foreground py-10 text-center">
                No reviews match this filter.
              </p>
            ) : (
              <div className="divide-y divide-border">
                {pageReviews.map((review) => (
                  <ReviewItem
                    key={review.id}
                    review={review}
                    isAdmin={isAdmin}
                    onChanged={refresh}
                  />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8 pt-4 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-none"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-none"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ReviewSubmitDialog open={submitOpen} onOpenChange={setSubmitOpen} onSubmitted={refresh} />
    </section>
  );
};

export default HomeReviews;
