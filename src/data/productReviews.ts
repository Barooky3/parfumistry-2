export interface ProductReview {
  id: number;
  name: string;
  text: string;
  verified: boolean;
  rating: number; // Can be 4, 4.5, or 5
  date: string;
}

// Product-specific reviews for each fragrance with varied ratings
export const productReviews: Record<string, ProductReview[]> = {
  // Bundles
  'evening-sweetheart-bundle': [
    { id: 1, name: 'Jordan', text: 'Perfect bundle for date nights. Every scent in here is a compliment getter.', verified: true, rating: 5, date: '1 week ago' },
    { id: 2, name: 'Marcus', text: 'Bought this for evenings out and haven\'t been disappointed once.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 3, name: 'Ryan', text: 'Great value. These fragrances work amazing together as a rotation.', verified: true, rating: 5, date: '3 weeks ago' },
  ],
  'young-playboy-bundle': [
    { id: 1, name: 'Tyler', text: 'This bundle is fire. Fresh, bold, and versatile - exactly what I needed.', verified: true, rating: 5, date: '1 week ago' },
    { id: 2, name: 'Jake', text: 'Perfect starter pack. Every bottle hits different but they all slap.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 3, name: 'Chris', text: 'Bought this as my first real collection. No regrets, all bangers.', verified: true, rating: 5, date: '1 month ago' },
  ],
  'sleek-and-clean-bundle': [
    { id: 1, name: 'Alex', text: 'Perfect for the office. Clean and professional without being boring.', verified: true, rating: 5, date: '1 week ago' },
    { id: 2, name: 'Michael', text: 'These are my go-to daily drivers now. Fresh and versatile.', verified: true, rating: 4.5, date: '3 weeks ago' },
    { id: 3, name: 'Daniel', text: 'Great bundle for anyone who wants clean, masculine scents.', verified: true, rating: 4, date: '1 month ago' },
  ],

  // Individual Fragrances
  'amore-caffe': [
    { id: 1, name: 'Sophie', text: 'Smells exactly like a vanilla latte from a fancy coffee shop. Obsessed!', verified: true, rating: 5, date: '5 days ago' },
    { id: 2, name: 'Emma', text: 'Everyone asks what I\'m wearing. It\'s sweet but sophisticated.', verified: true, rating: 5, date: '1 week ago' },
    { id: 3, name: 'Lucas', text: 'The coffee note is perfect - not too strong, not too weak. Chef\'s kiss.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 4, name: 'Isabella', text: 'Cozy, warm, and absolutely addictive. My favorite winter scent now.', verified: true, rating: 4, date: '3 weeks ago' },
  ],
  'althair': [
    { id: 1, name: 'Thomas', text: 'The vanilla in this is absolutely divine. Creamy and luxurious.', verified: true, rating: 5, date: '3 days ago' },
    { id: 2, name: 'Noah', text: 'Compliment magnet. Had three people ask me about it the first day I wore it.', verified: true, rating: 5, date: '1 week ago' },
    { id: 3, name: 'Oliver', text: 'Worth every penny. The quality is incredible and it lasts forever.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 4, name: 'Ethan', text: 'Bought this after smelling it on someone. Best decision ever.', verified: true, rating: 4, date: '1 month ago' },
  ],
  'aoud-lemon-mint': [
    { id: 1, name: 'David', text: 'Perfect summer scent. Fresh but with enough depth to be interesting.', verified: true, rating: 5, date: '1 week ago' },
    { id: 2, name: 'Sarah', text: 'The mint is so refreshing! Great for hot days.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 3, name: 'James', text: 'Unique combo of citrus and oud. Not your typical fresh fragrance.', verified: true, rating: 4, date: '3 weeks ago' },
  ],
  'aoud-vanille': [
    { id: 1, name: 'William', text: 'Rich and creamy. The oud adds such an interesting dimension to the vanilla.', verified: true, rating: 5, date: '4 days ago' },
    { id: 2, name: 'Mia', text: 'Cozy winter vibes in a bottle. I can\'t stop smelling my wrist.', verified: true, rating: 5, date: '1 week ago' },
    { id: 3, name: 'Benjamin', text: 'Warm, sensual, and sophisticated. Perfect for date nights.', verified: true, rating: 4.5, date: '3 weeks ago' },
    { id: 4, name: 'Charlotte', text: 'The sillage on this is incredible. People notice it from across the room.', verified: true, rating: 4, date: '1 month ago' },
  ],
  'aventus': [
    { id: 1, name: 'Alexander', text: 'The GOAT. There\'s a reason everyone talks about this one.', verified: true, rating: 5, date: '2 days ago' },
    { id: 2, name: 'Sebastian', text: 'Pineapple opening is iconic. Still holds up after all these years.', verified: true, rating: 5, date: '1 week ago' },
    { id: 3, name: 'Mason', text: 'Got so many compliments I lost count. Absolute beast mode.', verified: true, rating: 5, date: '2 weeks ago' },
    { id: 4, name: 'Henry', text: 'The smoky dry down is phenomenal. Worth the hype 100%.', verified: true, rating: 4.5, date: '3 weeks ago' },
    { id: 5, name: 'Jack', text: 'CEO energy in a bottle. Makes you feel like a million bucks.', verified: true, rating: 4, date: '1 month ago' },
  ],
  'aventus-absolu': [
    { id: 1, name: 'Daniel', text: 'Even better than the original. Deeper and more sophisticated.', verified: true, rating: 5, date: '1 week ago' },
    { id: 2, name: 'Matthew', text: 'The longevity on this is insane. 12+ hours easy.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 3, name: 'Aiden', text: 'If you love Aventus, this takes it to another level.', verified: true, rating: 5, date: '3 weeks ago' },
  ],
  'black-orchid': [
    { id: 1, name: 'Victoria', text: 'Dark, mysterious, and absolutely captivating. Tom Ford knows what\'s up.', verified: true, rating: 5, date: '4 days ago' },
    { id: 2, name: 'Sophia', text: 'The chocolate note makes this so unique. Nothing else smells like this.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 3, name: 'Ava', text: 'Statement fragrance. People remember you when you wear this.', verified: true, rating: 5, date: '3 weeks ago' },
    { id: 4, name: 'Olivia', text: 'Bold and unapologetic. Not for the faint of heart but absolutely stunning.', verified: true, rating: 4, date: '1 month ago' },
  ],
  'born-in-roma': [
    { id: 1, name: 'Leo', text: 'Clean but sexy. Perfect balance for everyday wear.', verified: true, rating: 5, date: '1 week ago' },
    { id: 2, name: 'Caleb', text: 'The violet leaf gives it such a unique vibe. Love it.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 3, name: 'Owen', text: 'Goes from office to club seamlessly. Super versatile.', verified: true, rating: 4, date: '1 month ago' },
  ],
  'cedrat-boise': [
    { id: 1, name: 'Nathan', text: 'Fresh citrus bomb with amazing longevity. Crowd pleaser for sure.', verified: true, rating: 5, date: '5 days ago' },
    { id: 2, name: 'Isaac', text: 'Black currant note is addictive. Keep going back to this one.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 3, name: 'Julian', text: 'Great projection without being obnoxious. Professional but interesting.', verified: true, rating: 4.5, date: '1 month ago' },
  ],
  'delina': [
    { id: 1, name: 'Emily', text: 'Princess vibes in a bottle. Romantic and feminine without being childish.', verified: true, rating: 5, date: '3 days ago' },
    { id: 2, name: 'Amelia', text: 'The rose and lychee combo is perfect. Sweet but sophisticated.', verified: true, rating: 5, date: '1 week ago' },
    { id: 3, name: 'Harper', text: 'Got this for my wedding day. Everyone complimented the scent.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 4, name: 'Evelyn', text: 'Elegant and timeless. This is what luxury smells like.', verified: true, rating: 4, date: '1 month ago' },
  ],
  'erba-gold': [
    { id: 1, name: 'Andrew', text: 'Sunshine in a bottle. So bright and uplifting.', verified: true, rating: 5, date: '1 week ago' },
    { id: 2, name: 'Joshua', text: 'The tropical fruits are so refreshing. Perfect for summer.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 3, name: 'Christopher', text: 'Similar to Erba Pura but with its own golden twist. Love it.', verified: true, rating: 4, date: '3 weeks ago' },
  ],
  'erba-pura': [
    { id: 1, name: 'Ryan', text: 'Smells like an expensive fruity shampoo. Everyone loves it.', verified: true, rating: 5, date: '4 days ago' },
    { id: 2, name: 'Brandon', text: 'This is what clean and fresh should smell like. 10/10.', verified: true, rating: 5, date: '1 week ago' },
    { id: 3, name: 'Aaron', text: 'Bought this for my girlfriend, now I want my own bottle.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 4, name: 'Kevin', text: 'The vanilla base makes it last forever. Beast mode longevity.', verified: true, rating: 4, date: '1 month ago' },
  ],
  'eros-energy': [
    { id: 1, name: 'Jason', text: 'Fresh Aventus vibes! Perfect for summer days.', verified: true, rating: 5, date: '1 week ago' },
    { id: 2, name: 'Justin', text: 'The citrus in this is so bright and energizing.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 3, name: 'Austin', text: 'My new favorite Eros. Fresher and more modern than the original.', verified: true, rating: 4.5, date: '3 weeks ago' },
  ],
  'eros-flame': [
    { id: 1, name: 'Dylan', text: 'Spicy and passionate. The red pepper gives it real heat.', verified: true, rating: 5, date: '5 days ago' },
    { id: 2, name: 'Logan', text: 'Date night essential. Gets compliments every time.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 3, name: 'Gabriel', text: 'Bold and masculine. This one makes a statement.', verified: true, rating: 4, date: '1 month ago' },
  ],
  'eros-parfum': [
    { id: 1, name: 'Tyler', text: 'Club killer. The mint and apple is such an iconic combo.', verified: true, rating: 5, date: '3 days ago' },
    { id: 2, name: 'Jordan', text: 'Sweet but not too sweet. Gets the girls turning heads.', verified: true, rating: 4.5, date: '1 week ago' },
    { id: 3, name: 'Marcus', text: 'The blue bottle is iconic. Scent matches the vibes perfectly.', verified: true, rating: 5, date: '2 weeks ago' },
    { id: 4, name: 'Adrian', text: 'Safe blind buy. Everyone knows Eros for a reason.', verified: true, rating: 4, date: '1 month ago' },
  ],
  'french-riviera': [
    { id: 1, name: 'Nicolas', text: 'Smells like a Mediterranean vacation. So fresh and elegant.', verified: true, rating: 5, date: '1 week ago' },
    { id: 2, name: 'Pierre', text: 'The jasmine gives it a beautiful floral touch. Unique.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 3, name: 'Lucas', text: 'Summer in a bottle. Light but lasts surprisingly long.', verified: true, rating: 4, date: '1 month ago' },
  ],
  'homme-intense': [
    { id: 1, name: 'Vincent', text: 'The iris is so smooth and creamy. Pure sophistication.', verified: true, rating: 5, date: '1 week ago' },
    { id: 2, name: 'Antoine', text: 'Formal events? This is your go-to. Class in a bottle.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 3, name: 'Philippe', text: 'Dior quality is unmatched. This just screams luxury.', verified: true, rating: 4, date: '3 weeks ago' },
  ],
  'imagination': [
    { id: 1, name: 'William', text: 'The MOST versatile fragrance I own. Works literally anywhere.', verified: true, rating: 5, date: '2 days ago' },
    { id: 2, name: 'James', text: 'There\'s a reason everyone calls this the best fragrance. It just IS.', verified: true, rating: 5, date: '1 week ago' },
    { id: 3, name: 'Robert', text: 'Clean tea scent that\'s somehow also complex. LV knows luxury.', verified: true, rating: 5, date: '2 weeks ago' },
    { id: 4, name: 'Charles', text: 'Worth every penny. This is what expensive should smell like.', verified: true, rating: 4.5, date: '3 weeks ago' },
    { id: 5, name: 'Richard', text: 'Bought this for my collection and it immediately became my signature.', verified: true, rating: 4, date: '1 month ago' },
  ],
  'khamrah-parfum': [
    { id: 1, name: 'Omar', text: 'Cinnamon cake vibes. Perfect for cozy winter evenings.', verified: true, rating: 5, date: '4 days ago' },
    { id: 2, name: 'Ahmed', text: 'Sweet and spicy. The dates note is so unique.', verified: true, rating: 5, date: '1 week ago' },
    { id: 3, name: 'Hassan', text: 'Crazy value for money. Smells way more expensive than it costs.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 4, name: 'Yusuf', text: 'Lattafa keeps hitting. This is their best one yet.', verified: true, rating: 4, date: '1 month ago' },
  ],
  'khamrah-qahwa': [
    { id: 1, name: 'Malik', text: 'Coffee lovers will obsess over this. Rich and aromatic.', verified: true, rating: 5, date: '1 week ago' },
    { id: 2, name: 'Rashid', text: 'The oud gives it such depth. Not just a sweet coffee smell.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 3, name: 'Ibrahim', text: 'Perfect evening scent. Warm and inviting.', verified: true, rating: 4, date: '3 weeks ago' },
  ],
  'layton': [
    { id: 1, name: 'Alexander', text: 'Apple pie meets cologne. Absolutely divine.', verified: true, rating: 5, date: '3 days ago' },
    { id: 2, name: 'Maximilian', text: 'Year-round versatility. Spring, summer, fall, winter - doesn\'t matter.', verified: true, rating: 5, date: '1 week ago' },
    { id: 3, name: 'Sebastian', text: 'The vanilla dry down is heavenly. PDM at its finest.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 4, name: 'Theodore', text: 'Got compliments from strangers. That says it all.', verified: true, rating: 4, date: '1 month ago' },
  ],
  'stronger-with-you-intensely': [
    { id: 1, name: 'DanielR', text: 'The chestnut and vanilla combo is absolutely divine. It wraps around you like a warm blanket on a cold night. My girlfriend can\'t stop hugging me when I wear this.', verified: true, rating: 5, date: '1 week ago' },
    { id: 2, name: 'Marco_IT', text: 'I\'ve gone through three bottles of this already. The toffee sweetness balanced by that subtle sage note makes it so addictive. Performance is easily 8+ hours on my skin.', verified: true, rating: 5, date: '2 weeks ago' },
    { id: 3, name: 'ScentLover99', text: 'Perfect cold weather fragrance. The opening is boozy and sweet, then it settles into this gorgeous creamy vanilla. Not for summer though — this is a fall/winter beast.', verified: true, rating: 4.5, date: '3 weeks ago' },
    { id: 4, name: 'Tyler_B', text: 'Wore this on a first date and she literally asked to smell my neck again. The projection in the first two hours is nuclear. Tones down nicely into a skin scent after.', verified: true, rating: 5, date: '1 month ago' },
    { id: 5, name: 'FragHead22', text: 'Slightly cloying in warm weather, but in cooler temps this is easily a 9/10. The cinnamon and vanilla are so well blended. Smells expensive without being pretentious.', verified: true, rating: 4, date: '1 month ago' },
    { id: 6, name: 'Alex_M', text: 'This replaced Spicebomb in my rotation. The sweetness here feels more refined and grown-up. Compliment magnet at the office — even my boss asked what I was wearing.', verified: true, rating: 5, date: '2 months ago' },
    { id: 7, name: 'NightOwl', text: 'Possibly the best designer sweet fragrance for men. The chestnut gives it a unique gourmand edge that you don\'t find in other Armani releases. Absolute must-have.', verified: true, rating: 4.5, date: '2 months ago' },
  ],
  'le-beau-le-parfum': [
    { id: 1, name: 'JulesP', text: 'The coconut milk in the dry down is stunning. Opens fresh and green, then slowly morphs into this creamy tropical paradise. Genuinely unique in the JPG lineup.', verified: true, rating: 5, date: '5 days ago' },
    { id: 2, name: 'BeachBum_23', text: 'I wore this to a beach party and got four compliments within an hour. The pineapple note is natural, not synthetic at all. Lasts a solid 7 hours on my skin.', verified: true, rating: 5, date: '1 week ago' },
    { id: 3, name: 'ScentCritic', text: 'Better than the original Le Beau in every way. The vanilla and coconut base gives it real depth. This works surprisingly well in cooler weather too, not just summer.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 4, name: 'OlivierM', text: 'The green notes up top keep it from being too sweet. It\'s tropical without smelling like sunscreen, which is exactly what I wanted. Great balance overall.', verified: true, rating: 4.5, date: '3 weeks ago' },
    { id: 5, name: 'Chris_NY', text: 'My signature scent for the last year. The sandalwood and tonka in the base give it this warm, creamy finish that people absolutely love. Can\'t recommend enough.', verified: true, rating: 5, date: '1 month ago' },
    { id: 6, name: 'FragReviewer', text: 'Projection is moderate but the trail it leaves is beautiful. People catch whiffs of it as you walk by. The coconut is done tastefully — sophisticated, not tacky.', verified: true, rating: 4, date: '2 months ago' },
  ],
  'spicebomb-extreme': [
    { id: 1, name: 'Viktor', text: 'Explosive entrance, smooth finish. The tobacco is perfect.', verified: true, rating: 5, date: '3 days ago' },
    { id: 2, name: 'Rolf', text: 'Rated most attractive by women for a reason. Trust me.', verified: true, rating: 5, date: '1 week ago' },
    { id: 3, name: 'Hans', text: 'Dark and intense. Makes you feel powerful.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 4, name: 'Franz', text: 'Winter essential. Nothing beats this when it\'s cold.', verified: true, rating: 4, date: '1 month ago' },
  ],
  'born-in-roma-coral-fantasy': [
    { id: 1, name: 'Romeo', text: 'The grapefruit opening is so refreshing. Love this flanker.', verified: true, rating: 5, date: '5 days ago' },
    { id: 2, name: 'Leonardo', text: 'Works for both summer and surprisingly winter. Very versatile.', verified: true, rating: 5, date: '1 week ago' },
    { id: 3, name: 'Alessandro', text: 'Best Born in Roma version. The balance is perfect.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 4, name: 'Matteo', text: 'Contemporary and fresh. Exactly what modern cologne should be.', verified: true, rating: 4, date: '1 month ago' },
  ],
  'le-male-elixir': [
    { id: 1, name: 'Jacques', text: 'Honey and vanilla combo is chef\'s kiss. So cozy.', verified: true, rating: 5, date: '3 days ago' },
    { id: 2, name: 'Francois', text: 'The bottle is iconic, the scent is even better.', verified: true, rating: 5, date: '1 week ago' },
    { id: 3, name: 'Michel', text: 'Lavender and tobacco work surprisingly well together.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 4, name: 'Claude', text: 'JPG never misses with Le Male line. This is the best one.', verified: true, rating: 4, date: '1 month ago' },
  ],
  'the-most-wanted-parfum': [
    { id: 1, name: 'Lucas', text: 'Ginger fizz in the opening is so unique. Love the cozy vibes.', verified: true, rating: 5, date: '4 days ago' },
    { id: 2, name: 'Hugo', text: 'Perfect winter comfort scent. Like a warm vanilla hug.', verified: true, rating: 5, date: '1 week ago' },
    { id: 3, name: 'Felix', text: 'The toffee note makes this so addictive. Can\'t stop sniffing.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 4, name: 'Oscar', text: 'Popular for a reason. Azzaro knocked it out of the park.', verified: true, rating: 4, date: '1 month ago' },
  ],
  'black-opium': [
    { id: 1, name: 'Chloe', text: 'Coffee and vanilla perfection. My signature scent now.', verified: true, rating: 5, date: '2 days ago' },
    { id: 2, name: 'Zoe', text: 'Sweet and sultry. Gets compliments every single time.', verified: true, rating: 5, date: '1 week ago' },
    { id: 3, name: 'Luna', text: 'The orange blossom gives it such a beautiful lift.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 4, name: 'Stella', text: 'Best women\'s fragrance ever made. Fight me on this.', verified: true, rating: 5, date: '3 weeks ago' },
    { id: 5, name: 'Aurora', text: 'Cozy, feminine, and absolutely enchanting. YSL genius.', verified: true, rating: 4, date: '1 month ago' },
  ],
  'le-male-le-parfum': [
    { id: 1, name: 'Marcel', text: 'Oriental masterpiece. The cardamom opening is perfect.', verified: true, rating: 5, date: '1 week ago' },
    { id: 2, name: 'Henri', text: 'Best JPG in my opinion. Complex and sophisticated.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 3, name: 'Gaston', text: 'The leather and vanilla work so well together.', verified: true, rating: 4, date: '3 weeks ago' },
  ],
  'le-male': [
    { id: 1, name: 'Paul', text: 'Classic for a reason. The lavender and vanilla combo is timeless.', verified: true, rating: 5, date: '1 week ago' },
    { id: 2, name: 'Martin', text: 'OG blue fragrance. Still holds up after all these years.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 3, name: 'Simon', text: 'Fresh and sweet. Perfect everyday scent.', verified: true, rating: 4, date: '1 month ago' },
  ],
  'libre': [
    { id: 1, name: 'Emma', text: 'Bold and confident. The lavender is so unique for a feminine scent.', verified: true, rating: 5, date: '4 days ago' },
    { id: 2, name: 'Olivia', text: 'Orange blossom and vanilla - simple but so elegant.', verified: true, rating: 4.5, date: '1 week ago' },
    { id: 3, name: 'Ava', text: 'Modern classic. YSL did it again.', verified: true, rating: 4, date: '2 weeks ago' },
  ],
  'mon-paris': [
    { id: 1, name: 'Marie', text: 'Romantic and sweet. Perfect for date nights.', verified: true, rating: 5, date: '1 week ago' },
    { id: 2, name: 'Claire', text: 'The strawberry note is so playful. Love it!', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 3, name: 'Julie', text: 'Parisian chic in a bottle. Très romantique!', verified: true, rating: 4, date: '1 month ago' },
  ],
  'myself-edp': [
    { id: 1, name: 'David', text: 'Modern masculinity redefined. The orange blossom is beautiful.', verified: true, rating: 5, date: '1 week ago' },
    { id: 2, name: 'Samuel', text: 'Clean and sophisticated. Perfect for any occasion.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 3, name: 'Nathan', text: 'Dolce did something special with this one. Unique.', verified: true, rating: 4, date: '3 weeks ago' },
  ],
  'naxos': [
    { id: 1, name: 'Marco', text: 'Honey and tobacco heaven. Xerjoff quality is unmatched.', verified: true, rating: 5, date: '5 days ago' },
    { id: 2, name: 'Giuseppe', text: 'Sweet and rich. The lavender adds such a nice touch.', verified: true, rating: 5, date: '2 weeks ago' },
    { id: 3, name: 'Lorenzo', text: 'Luxury in every spray. Worth every penny.', verified: true, rating: 4.5, date: '1 month ago' },
  ],
  'pacific-hill': [
    { id: 1, name: 'Tyler', text: 'Beach vibes but sophisticated. Love the coconut.', verified: true, rating: 5, date: '1 week ago' },
    { id: 2, name: 'Brandon', text: 'Fresh and summery. Perfect vacation scent.', verified: true, rating: 4.5, date: '2 weeks ago' },
  ],
  'paradigme': [
    { id: 1, name: 'Charles', text: 'Ambroxan done right. Clean and modern.', verified: true, rating: 5, date: '1 week ago' },
    { id: 2, name: 'Edward', text: 'Great sillage without being overwhelming. Classy.', verified: true, rating: 4, date: '3 weeks ago' },
  ],
  'red-tobacco': [
    { id: 1, name: 'Jack', text: 'The name says it all. Spicy tobacco perfection.', verified: true, rating: 5, date: '4 days ago' },
    { id: 2, name: 'Henry', text: 'Warm and inviting. Perfect for cold weather.', verified: true, rating: 4.5, date: '1 week ago' },
    { id: 3, name: 'George', text: 'Mancera quality at a great price. Beast mode longevity.', verified: true, rating: 4, date: '2 weeks ago' },
  ],
  'sauvage-parfum': [
    { id: 1, name: 'Chris', text: 'The parfum version is next level. Richer and deeper.', verified: true, rating: 5, date: '3 days ago' },
    { id: 2, name: 'Matt', text: 'Dior quality is unmatched. This is the definitive Sauvage.', verified: true, rating: 5, date: '1 week ago' },
    { id: 3, name: 'Andrew', text: 'Everyone knows Sauvage but this version is the best.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 4, name: 'Josh', text: 'Compliment getter guaranteed. Safe blind buy.', verified: true, rating: 4, date: '3 weeks ago' },
  ],
  'silver-mountain-water': [
    { id: 1, name: 'Patrick', text: 'Fresh and clean like mountain air. Creed excellence.', verified: true, rating: 5, date: '1 week ago' },
    { id: 2, name: 'Richard', text: 'Green tea vibes. So refreshing and unique.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 3, name: 'Thomas', text: 'Expensive but worth it. Nothing else smells like this.', verified: true, rating: 4, date: '1 month ago' },
  ],
  'stronger-with-you-absolutely': [
    { id: 1, name: 'Marco', text: 'The leather gives this such an edge. Love it.', verified: true, rating: 5, date: '1 week ago' },
    { id: 2, name: 'Alessio', text: 'Bolder than Intensely. More mature vibes.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 3, name: 'Lorenzo', text: 'The vanilla and lavender combo is perfect.', verified: true, rating: 4, date: '3 weeks ago' },
  ],
  'stronger-with-you-amber': [
    { id: 1, name: 'Paolo', text: 'Amber lovers will obsess over this. Rich and warm.', verified: true, rating: 5, date: '1 week ago' },
    { id: 2, name: 'Andrea', text: 'Perfect cold weather scent. Cozy and inviting.', verified: true, rating: 4.5, date: '2 weeks ago' },
  ],
  'stronger-with-you-parfum': [
    { id: 1, name: 'Riccardo', text: 'The most intense SWY yet. Incredible projection.', verified: true, rating: 5, date: '5 days ago' },
    { id: 2, name: 'Fabio', text: 'Sweet and boozy. Perfect for nights out.', verified: true, rating: 4.5, date: '1 week ago' },
    { id: 3, name: 'Stefano', text: 'Armani keeps outdoing themselves. This is fire.', verified: true, rating: 4, date: '3 weeks ago' },
  ],
  'symphony': [
    { id: 1, name: 'Victoria', text: 'Sweet and fruity. Louis Vuitton elegance in a bottle.', verified: true, rating: 5, date: '1 week ago' },
    { id: 2, name: 'Catherine', text: 'The florals are so beautifully blended. Divine.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 3, name: 'Elizabeth', text: 'Pure luxury. Worth every penny.', verified: true, rating: 4, date: '1 month ago' },
  ],
  'the-most-wanted-edp-intense': [
    { id: 1, name: 'Max', text: 'More intense than the original. Love the depth.', verified: true, rating: 5, date: '1 week ago' },
    { id: 2, name: 'Leo', text: 'Spicy and warm. Perfect for cold weather.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 3, name: 'Felix', text: 'Azzaro keeps hitting. This one is a winner.', verified: true, rating: 4, date: '3 weeks ago' },
  ],
  'elixir-absolu': [
    { id: 1, name: 'Sophie', text: 'Rich and complex. Guerlain craftsmanship at its finest.', verified: true, rating: 5, date: '1 week ago' },
    { id: 2, name: 'Charlotte', text: 'The amber base is intoxicating. Love it.', verified: true, rating: 4.5, date: '2 weeks ago' },
  ],
};

// Default reviews for products without specific reviews
export const defaultReviews: ProductReview[] = [
  { id: 1, name: 'Tyler', text: 'This one hits different, everyone keeps asking what I\'m wearing.', verified: true, rating: 5, date: '1 week ago' },
  { id: 2, name: 'Oliver', text: 'Makes people turn their head when you walk by. Trust.', verified: true, rating: 4.5, date: '3 weeks ago' },
  { id: 3, name: 'Tony', text: 'Walked into a party and instantly got asked about it.', verified: true, rating: 5, date: '1 week ago' },
  { id: 4, name: 'Emma', text: 'The perfect signature scent. Elegant and long-lasting.', verified: true, rating: 4, date: '2 weeks ago' },
  { id: 5, name: 'Sarah', text: 'Absolutely love it. Professional and sophisticated.', verified: true, rating: 4.5, date: '2 weeks ago' },
];

// Helper function to get reviews for a product
export const getProductReviews = (productId: string): ProductReview[] => {
  return productReviews[productId] || defaultReviews;
};
