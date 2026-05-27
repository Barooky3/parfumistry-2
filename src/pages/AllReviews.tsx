import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, BadgeCheck, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { homeReviews, reviewStats } from '@/data/homeReviews';

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
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(homeReviews.length / PER_PAGE);
  const start = (page - 1) * PER_PAGE;
  const end = Math.min(start + PER_PAGE, homeReviews.length);
  const pageReviews = homeReviews.slice(start, end);
  const maxCount = Math.max(...reviewStats.counts.map((c) => c.count));

  return (
    <div className="min-h-[80vh] bg-background py-10 md:py-14">
      <div className="container max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground mb-3">
          Customer Reviews
        </h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-2xl mb-10">
          See what fragrance lovers around the world are saying about Parfumistry. All reviews are from verified customers.
        </p>

        <div className="mb-10">
          <div className="flex items-end gap-2">
            <span className="font-display text-4xl md:text-5xl font-bold text-foreground leading-none">
              {reviewStats.avg.toString().replace('.', ',')}
            </span>
            <span className="text-muted-foreground text-sm mb-1.5">/ 5</span>
          </div>
          <div className="mt-2">
            <RatingStars rating={reviewStats.avg} />
          </div>
          <p className="text-sm text-muted-foreground mt-2 mb-5">{reviewStats.total} reviews</p>

          <div className="space-y-2 max-w-sm">
            {reviewStats.counts.map(({ star, count }) => (
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
        <div className="text-sm text-muted-foreground mb-6">
          Newest first · Showing {start + 1}–{end} of {reviewStats.total} reviews
        </div>

        <div className="divide-y divide-border">
          {pageReviews.map((review) => (
            <div key={review.id} className="py-5">
              <RatingStars rating={review.rating} />
              <p className={`text-sm mt-2 ${review.text ? 'text-foreground/90' : 'italic text-muted-foreground'}`}>
                {review.text || 'Rating submitted - no written feedback'}
              </p>
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <span className="text-foreground/70">{review.name}</span>
                {review.verified && (
                  <span className="inline-flex items-center gap-1 text-accent">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Verified
                  </span>
                )}
                <span className="ml-auto">{review.date}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 mt-10">
          <Button
            variant="outline"
            size="sm"
            className="rounded-none"
            disabled={page === 1}
            onClick={() => {
              setPage((p) => Math.max(1, p - 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground px-3">
            {page} ... {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="rounded-none"
            disabled={page === totalPages}
            onClick={() => {
              setPage((p) => Math.min(totalPages, p + 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AllReviews;
