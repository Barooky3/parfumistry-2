import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import ultraMaleImg from '@/assets/products/poll-ultra-male.png';
import leBeauParadiseImg from '@/assets/products/poll-le-beau-paradise-garden.png';

const POLL_ID = 'next-arrival-2026-01';
const ADMIN_EMAILS = ['ewhz3384@gmail.com'];

const OPTIONS = [
  {
    key: 'le-beau-paradise-garden',
    label: 'JPG Le Beau Paradise Garden',
    image: leBeauParadiseImg,
  },
  {
    key: 'ultra-male',
    label: 'JPG Ultra Male',
    image: ultraMaleImg,
  },
] as const;

const LAST_WINNER = {
  name: 'Bad Boy Cobalt',
  image: '/images/bad-boy-cobalt.png',
};

function getFingerprint(): string {
  let fp = localStorage.getItem('poll_fp');
  if (!fp) {
    fp = `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
    localStorage.setItem('poll_fp', fp);
  }
  return fp;
}

const NextFragrancePoll = () => {
  const { user } = useAuth();
  const isAdmin = !!user && ADMIN_EMAILS.includes(user.email || '');
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [voted, setVoted] = useState<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem(`poll_voted_${POLL_ID}`) : null
  );
  const [loading, setLoading] = useState(false);

  const total = Object.values(counts).reduce((s, n) => s + n, 0);
  const showResults = !!voted || isAdmin;

  const loadCounts = async () => {
    const { data } = await supabase
      .from('poll_votes')
      .select('choice')
      .eq('poll_id', POLL_ID);
    if (data) {
      const c: Record<string, number> = {};
      for (const row of data) c[row.choice] = (c[row.choice] || 0) + 1;
      setCounts(c);
    }
  };

  useEffect(() => {
    if (showResults) loadCounts();
  }, [showResults]);

  const vote = async (key: string) => {
    if (voted || loading) return;
    setLoading(true);
    const fp = getFingerprint();
    const { error } = await supabase.from('poll_votes').insert({
      poll_id: POLL_ID,
      choice: key,
      voter_fingerprint: fp,
    });
    if (!error) {
      localStorage.setItem(`poll_voted_${POLL_ID}`, key);
      setVoted(key);
      // optimistic
      setCounts((c) => ({ ...c, [key]: (c[key] || 0) + 1 }));
    }
    setLoading(false);
  };

  const pct = (n: number) => (total === 0 ? 0 : Math.round((n / total) * 100));

  return (
    <section className="pt-8 md:pt-12 pb-2 md:pb-4 bg-background">
      <div className="container max-w-3xl">
        <p className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-accent text-center mb-2">
          You Decide
        </p>
        <h2 className="font-display text-xl md:text-2xl lg:text-3xl text-foreground text-center mb-1">
          Which should we add next?
        </h2>
        <p className="text-[11px] md:text-xs text-muted-foreground text-center mb-5 md:mb-7">
          {voted ? 'Thanks for voting — here are the live results' : 'Tap your pick to reveal the results'}
        </p>

        <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-3 md:gap-5">
          {OPTIONS.map((opt, idx) => {
            const count = counts[opt.key] || 0;
            const percent = pct(count);
            const isPick = voted === opt.key;
            return (
              <div key={opt.key} style={{ gridColumn: idx === 0 ? 1 : 3 }}>
                <button
                  type="button"
                  onClick={() => vote(opt.key)}
                  disabled={!!voted || loading}
                  className={cn(
                    'group relative w-full aspect-[3/4] rounded-sm overflow-hidden bg-[#EDE8E1] border transition-all',
                    isPick ? 'border-accent ring-2 ring-accent' : 'border-border/40 hover:border-border',
                    !voted && 'cursor-pointer hover:-translate-y-0.5'
                  )}
                >
                  <img
                    src={opt.image}
                    alt={opt.label}
                    loading="lazy"
                    className="w-full h-full object-contain p-2 md:p-4 transition-transform duration-500 group-hover:scale-105"
                  />
                  {isPick && (
                    <div className="absolute top-1.5 right-1.5 bg-accent text-accent-foreground rounded-full p-1 shadow">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                  <AnimatePresence>
                    {showResults && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute inset-x-0 bottom-0 bg-background/85 backdrop-blur-sm px-2 py-1.5 text-center"
                      >
                        <div className="text-sm md:text-base font-semibold text-foreground">
                          {percent}%
                        </div>
                        {isAdmin && (
                          <div className="text-[9px] tracking-wider uppercase text-muted-foreground">
                            {count} vote{count === 1 ? '' : 's'}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
                <p className="text-[10px] md:text-xs text-center mt-2 text-foreground font-medium leading-tight line-clamp-2">
                  {opt.label}
                </p>
              </div>
            );
          })}

          {/* VS divider */}
          <div className="flex flex-col items-center justify-center" style={{ gridColumn: 2 }}>
            <div className="font-display text-2xl md:text-3xl text-accent italic">vs</div>
          </div>
        </div>

        {isAdmin && showResults && (
          <p className="text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-4">
            Admin · {total} total vote{total === 1 ? '' : 's'}
          </p>
        )}

        {/* Last winner sub-section */}
        <div className="mt-6 md:mt-8 border-t border-border/40 pt-4 md:pt-5">
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center gap-1.5 text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-muted-foreground">
              <Trophy className="h-3 w-3 text-accent" />
              Last Winner
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-10 md:w-10 md:h-12 bg-[#EDE8E1] rounded-sm overflow-hidden flex items-center justify-center">
                <img
                  src={LAST_WINNER.image}
                  alt={LAST_WINNER.name}
                  loading="lazy"
                  className="w-full h-full object-contain p-0.5"
                />
              </div>
              <span className="text-xs md:text-sm font-medium text-foreground">
                {LAST_WINNER.name}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NextFragrancePoll;
