import { useEffect, useRef, useState } from 'react';
import { Star } from 'lucide-react';

const proofImages = [
  { src: '/images/proof/aventus-absolu.webp', alt: 'Aventus Absolu' },
  { src: '/images/proof/le-male-elixir.webp', alt: 'Le Male Elixir' },
  { src: '/images/proof/le-male-parfum-1.webp', alt: 'Le Male Parfum' },
  { src: '/images/proof/le-male-parfum-2.webp', alt: 'Le Male Parfum' },
  { src: '/images/proof/pdm-layton.webp', alt: 'Parfums de Marly Layton' },
  { src: '/images/proof/silver-mountain-water.webp', alt: 'Silver Mountain Water' },
  { src: '/images/proof/xerjoff-naxos-bottle.webp', alt: 'Xerjoff Naxos' },
  { src: '/images/proof/xerjoff-naxos-box.webp', alt: 'Xerjoff Naxos Box' },
  { src: '/images/proof/ysl-y-edp.webp', alt: 'YSL Y EDP' },
];

const ProofCarousel = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Auto-scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let raf: number;
    let speed = 0.5;

    const step = () => {
      if (!isDragging && el) {
        el.scrollLeft += speed;
        // Loop: reset when reaching the end
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 1) {
          el.scrollLeft = 0;
        }
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeft(scrollRef.current?.scrollLeft || 0);
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 1.5;
    if (scrollRef.current) scrollRef.current.scrollLeft = scrollLeft - walk;
  };
  const handleEnd = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeft(scrollRef.current?.scrollLeft || 0);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - (scrollRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 1.5;
    if (scrollRef.current) scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const rating = 4.7;
  const fullStars = Math.floor(rating);
  const partialFill = (rating - fullStars) * 100;

  return (
    <section className="py-10 md:py-14 bg-background overflow-hidden">
      <div className="container mb-6">
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-foreground/70">Excellent</span>
            <div className="flex items-center gap-[3px]">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-[22px] h-[22px] flex items-center justify-center"
                  style={{
                    background: i < fullStars
                      ? '#00b67a'
                      : i === fullStars
                        ? `linear-gradient(90deg, #00b67a ${partialFill}%, #dcdce6 ${partialFill}%)`
                        : '#dcdce6',
                  }}
                >
                  <Star className="h-3.5 w-3.5 text-white stroke-0" fill="currentColor" />
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Based on <span className="font-medium text-foreground/80">{proofImages.length * 47}+</span> verified orders · <span className="font-medium text-foreground/80">{rating}</span> out of 5
          </p>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing select-none px-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleEnd}
      >
        {/* Double the images for seamless loop feel */}
        {[...proofImages, ...proofImages].map((img, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[200px] md:w-[240px] rounded-lg overflow-hidden shadow-sm border border-border/50"
          >
            <img
              src={img.src}
              alt={img.alt}
              loading="lazy"
              draggable={false}
              className="w-full h-[260px] md:h-[300px] object-cover pointer-events-none"
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProofCarousel;
