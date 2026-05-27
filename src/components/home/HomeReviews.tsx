import { Link } from 'react-router-dom';
import { Star, BadgeCheck, ArrowRight } from 'lucide-react';
import { homeReviews, reviewStats } from '@/data/homeReviews';

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
  const previewReviews = homeReviews.slice(0, 4);
  const maxCount = Math.max(...reviewStats.counts.map((c) => c.count));

  return (
    <section className="py-14 md:py-20 bg-background">
      <div className="container">
        <div className="mb-8 md:mb-12">
          <h2 className="font-display text-2xl md:text-3xl lg:text-4xl text-foreground mb-3">
            Customer Reviews
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
            See what fragrance lovers around the world are saying about Parfumistry. All reviews are from verified customers.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Left: Summary */}
          <div>
            <div className="flex items-end gap-2 mb-2">
              <span className="font-display text-5xl md:text-6xl font-bold text-foreground leading-none">
                {reviewStats.avg.toString().replace('.', ',')}
              </span>
              <span className="text-muted-foreground text-base mb-2">/ 5</span>
            </div>
            <RatingStars rating={reviewStats.avg} size="lg" />
            <p className="text-sm text-muted-foreground mt-2 mb-5">
              {reviewStats.total} reviews
            </p>

            <div className="space-y-2 max-w-md">
              {reviewStats.counts.map(({ star, count }) => (
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

            <div className="space-y-6">
              {previewReviews.map((review) => (
                <div key={review.id}>
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
    </section>
  );
};

export default HomeReviews;
