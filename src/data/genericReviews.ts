import { ProductReview } from './productReviews';

// Pool of generic-but-varied reviews appended to each product to reach 40+ total.
// Mix of ratings to keep the overall average realistic (skewed positive but with grit).
const POOL: Omit<ProductReview, 'id' | 'date'>[] = [
  { name: 'Liam', text: 'Arrived faster than expected and well packaged. Scent is close to the original, maybe 85% accurate to my nose. Happy with the purchase overall.', verified: true, rating: 4.5 },
  { name: 'Emma', text: 'Bought for my partner and he wears it almost every day now. Projection is moderate but the scent itself is really nice and warm.', verified: true, rating: 5 },
  { name: 'Noah', text: 'Solid for the price. Not 1:1 with the designer but honestly close enough that nobody can tell unless they have a trained nose.', verified: true, rating: 4 },
  { name: 'Olivia', text: 'I expected it to be a bit stronger out the bottle. Application takes a few dabs to really build up. Once it does though it lasts a long time.', verified: true, rating: 3.5 },
  { name: 'Mateo', text: 'Compliment magnet. Wore it once to work and three different people asked what I was wearing. Worth every euro.', verified: true, rating: 5 },
  { name: 'Sophie', text: 'It is fine. Smells pleasant but nothing extraordinary. I wouldn\'t say it stands out from the dozens of similar fragrances on the market.', verified: true, rating: 3 },
  { name: 'Lucas', text: 'Top notes are spot on. The dry down is where it differs slightly from the retail version but it\'s still very enjoyable.', verified: true, rating: 4 },
  { name: 'Mia', text: 'Longevity is the standout for me. Still smelling it on my hoodie the next day. Crazy for the price point.', verified: true, rating: 5 },
  { name: 'Ethan', text: 'Was skeptical ordering oils online but this exceeded my expectations. Will definitely come back for more from the catalogue.', verified: true, rating: 5 },
  { name: 'Ava', text: 'A bit too sweet for my taste personally but my boyfriend loves it. So your mileage will vary depending on what you usually wear.', verified: true, rating: 3.5 },
  { name: 'Hugo', text: 'Performance is the weak point. About 4 hours on skin for me. Smells great while it lasts though, no complaints there.', verified: true, rating: 3.5 },
  { name: 'Chloe', text: 'Bottle is small but a little goes a long way. I\'ve had mine for two months and barely made a dent. Excellent value.', verified: true, rating: 5 },
  { name: 'Felix', text: 'Tried this side by side with my designer bottle and the difference is minimal. The opening is slightly different but the heart and base are essentially identical.', verified: true, rating: 4.5 },
  { name: 'Zara', text: 'Smells nice but on me it goes a little powdery after the first hour. Not what I expected from the description but still wearable.', verified: true, rating: 3 },
  { name: 'Oscar', text: 'My go-to evening scent now. Warm, slightly sweet, and people always lean in when I\'m wearing it. Great pickup.', verified: true, rating: 5 },
  { name: 'Isla', text: 'Decent but I think the hype online is a little inflated. It\'s a solid fragrance, not a life-changing one. Glad I tried it though.', verified: true, rating: 3.5 },
  { name: 'Adrien', text: 'Honestly impressed. The accuracy is the best I\'ve found from any oil house I\'ve tried, and I\'ve tried a lot over the years.', verified: true, rating: 5 },
  { name: 'Nora', text: 'Smelled exactly like the description. Shipping was quick to the Netherlands. Will be ordering more samples in my next batch.', verified: true, rating: 4.5 },
  { name: 'Pablo', text: 'I had a small issue with my order and the support team responded within a few hours. They sorted it out without any fuss. Great service.', verified: true, rating: 5 },
  { name: 'Greta', text: 'Not bad but I prefer the spray format. Oils don\'t project as much which is fine for intimate settings but if you want to fill a room this won\'t do it.', verified: true, rating: 3 },
  { name: 'Theo', text: 'Beautiful scent. Reminds me of a fragrance I wore years ago that got discontinued. Glad I found something similar at this price.', verified: true, rating: 5 },
  { name: 'Camille', text: 'The packaging was simple but functional. The product itself is what matters and that delivered. No complaints.', verified: true, rating: 4 },
  { name: 'Viktor', text: 'Pleasant scent but I wish it had more projection. You really have to be close to someone for them to smell it on you.', verified: true, rating: 3.5 },
  { name: 'Lena', text: 'Got this on the buy 3 get 1 free deal. Insane value for what you get. Four oils for the price of less than one designer bottle.', verified: true, rating: 5 },
  { name: 'Marcus', text: 'Quality is there. The scent profile matches what was advertised. Nothing more to say, it does exactly what it claims.', verified: true, rating: 4 },
  { name: 'Anya', text: 'A little disappointed honestly. The opening is great but it fades fast on my skin. Maybe my chemistry isn\'t right for this one.', verified: true, rating: 3 },
  { name: 'Jonas', text: 'Excellent fragrance. Wore it on a date and got an immediate compliment within five minutes of meeting. That alone makes it worth it.', verified: true, rating: 5 },
  { name: 'Freya', text: 'It\'s good. Not great, not bad. Solid daily driver if you want something inoffensive and pleasant for work or casual settings.', verified: true, rating: 3.5 },
  { name: 'Dario', text: 'Surprised by the depth of the scent. I expected a flat oil but this has actual evolution from open to dry down. Well done.', verified: true, rating: 4.5 },
  { name: 'Hanna', text: 'My third order from this site. Consistency is excellent across the catalogue. Every product I\'ve tried has matched expectations.', verified: true, rating: 5 },
  { name: 'Bastien', text: 'The scent is close but I can tell it\'s not the original if I sniff carefully. For casual use though absolutely nobody can tell the difference.', verified: true, rating: 4 },
  { name: 'Maja', text: 'Wore this for a week straight to test. Got compliments on three separate days from strangers. That\'s a win in my book.', verified: true, rating: 5 },
  { name: 'Cristian', text: 'Performance varies day to day for me. Some days it lasts 8 hours, others closer to 4. Might be humidity related, not sure.', verified: true, rating: 3.5 },
  { name: 'Saskia', text: 'Bought as a gift for my brother\'s birthday. He texted me asking where I got it because he wants to buy more. Mission accomplished.', verified: true, rating: 5 },
  { name: 'Ivo', text: 'Reasonable but not exceptional. It\'s a decent rendition of the original but I\'ve smelled better clones from other sources. Still fair for the price.', verified: true, rating: 3 },
  { name: 'Petra', text: 'I love the warm cozy vibe of this one. Perfect for cooler evenings. Wouldn\'t wear it in summer but for autumn it\'s spot on.', verified: true, rating: 4.5 },
  { name: 'Rafael', text: 'Smells expensive. That\'s the best compliment I can give a fragrance at this price point. Doesn\'t smell cheap or synthetic at all.', verified: true, rating: 5 },
  { name: 'Klara', text: 'Decent but I had to apply more than I expected to get the projection I wanted. Bottle should last a while though so not a dealbreaker.', verified: true, rating: 3.5 },
  { name: 'Sven', text: 'Honestly the best discovery I\'ve made this year. Way better than I expected and I\'ll be coming back for more of the catalogue.', verified: true, rating: 5 },
  { name: 'Ines', text: 'It\'s alright. Doesn\'t blow me away but doesn\'t disappoint either. Sits in that middle ground where I wouldn\'t recommend it strongly but wouldn\'t warn anyone off.', verified: true, rating: 3.5 },
  { name: 'Aleks', text: 'Great fragrance, great price, great service. Three for three. Will be ordering again next month.', verified: true, rating: 5 },
];

const DATES = [
  '2 days ago', '4 days ago', '6 days ago', '1 week ago', '10 days ago',
  '2 weeks ago', '3 weeks ago', '4 weeks ago', '1 month ago', '5 weeks ago',
  '6 weeks ago', '2 months ago', '9 weeks ago', '10 weeks ago', '3 months ago',
];

// Deterministic shuffle so a given product always sees the same supplemental reviews
function seededShuffle<T>(arr: T[], seedStr: string): T[] {
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) h = (h * 31 + seedStr.charCodeAt(i)) | 0;
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    h = (h * 1103515245 + 12345) & 0x7fffffff;
    const j = h % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function padToTarget(
  existing: ProductReview[],
  productKey: string,
  target = 42
): ProductReview[] {
  if (existing.length >= target) return existing;
  const needed = target - existing.length;
  const shuffledPool = seededShuffle(POOL, productKey);
  const shuffledDates = seededShuffle(DATES, productKey + '_d');
  const maxId = existing.reduce((m, r) => Math.max(m, r.id), 0);
  const extras: ProductReview[] = [];
  for (let i = 0; i < needed; i++) {
    const base = shuffledPool[i % shuffledPool.length];
    extras.push({
      ...base,
      id: maxId + i + 1,
      date: shuffledDates[i % shuffledDates.length],
    });
  }
  return [...existing, ...extras];
}
