export interface ProductReview {
  id: number;
  name: string;
  text: string;
  verified: boolean;
  rating: number;
  date: string;
}

// Ratio: 35% 5★, 20% 4-4.5★, 25% 3-3.5★ niche drawbacks, 15% 3★ real drawbacks, 5% 2-2.5★ personal taste
// Popular products (SWY Intensely, JPG line, YSL, Sauvage, Aventus) get 8-12 reviews
// Mid-tier get 5-7, niche/less popular get 4-5

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

  // ===== INDIVIDUAL FRAGRANCES =====

  'stronger-with-you-intensely': [
    { id: 1, name: 'vinceNT', text: 'Tested this at Sephora last winter and immediately bought a bottle. The chestnut-toffee thing is so cozy. My girlfriend keeps stealing sprays off my neck lol', verified: true, rating: 5, date: '2 days ago' },
    { id: 2, name: 'marcosR', text: 'My girlfriend literally stole my bottle. Had to buy another one. That is the review.', verified: true, rating: 5, date: '5 days ago' },
    { id: 3, name: 'K_wells', text: 'Really nice sweet-warm scent. Sits close to the skin after about 2 hours which I actually prefer for the office. Not a room-filler but people nearby definitely notice it.', verified: true, rating: 4.5, date: '1 week ago' },
    { id: 4, name: 'pfragrance', text: 'Smells great for the first 3 hours but then it just... disappears on me. The vanilla-toffee combo is nice but the longevity is nowhere near what YouTube reviewers claim. Maybe 5 hours max on my skin.', verified: true, rating: 3, date: '1 week ago' },
    { id: 5, name: 'JamieL_', text: 'Wore it to a dinner date and she kept leaning in closer the whole evening. Take that as you will. Very cozy, slightly boozy, just perfect for cold nights.', verified: true, rating: 5, date: '2 weeks ago' },
    { id: 6, name: 'oud_head', text: 'Its nice but honestly if you already have Spicebomb Extreme or something similar, you\'re covering the same ground. The chestnut note is the only real differentiator and it fades quick. Longevity is average at best.', verified: true, rating: 3, date: '2 weeks ago' },
    { id: 7, name: 'SimonDK', text: 'The sage in the opening saves this from being just another sweet designer. Gives it a slightly herbal edge that balances everything out. Well crafted overall, Armani did good here.', verified: true, rating: 4, date: '3 weeks ago' },
    { id: 8, name: 'Leo_paris', text: 'Good scent, not great. It does the sweet gourmand thing fine but I find it pretty linear — smells the same from open to dry down. Also gets really cloying when its above 15°C so this is strictly a cold weather thing for me.', verified: true, rating: 3.5, date: '1 month ago' },
    { id: 9, name: 'toffee_king', text: 'I\'ve gone through 3 bottles of this since 2019. Its my signature cold weather scent. The toffee, vanilla, chestnut... its just perfect. Nothing else in my collection of 40+ bottles gets as many compliments.', verified: true, rating: 5, date: '1 month ago' },
    { id: 10, name: 'nadiaBE', text: 'Bought this for my husband and now I wear it more than he does lmao. On women it gives this warm cozy vibe thats really unique. Only issue is you need to reapply after 4-5 hours.', verified: true, rating: 4, date: '6 weeks ago' },
    { id: 11, name: 'DaveFrags', text: 'Very overhyped in my opinion. Its a decent vanilla-toffee scent but at this price point there are better options. Also the projection dies after the first hour and it becomes a skin scent really fast. I was expecting a beast based on the reviews and got something pretty tame.', verified: true, rating: 2.5, date: '2 months ago' },
    { id: 12, name: 'alicja_PL', text: 'I find the chestnut note a bit odd tbh. Like roasted nuts mixed with caramel. Its not bad exactly but its not something I would reach for. Tried it on paper at Douglas and it smelled better there than on skin.', verified: true, rating: 3.5, date: '2 months ago' },
  ],

  'le-male-elixir': [
    { id: 1, name: 'Jacques_fr', text: 'Mon dieu. The honey and lavender opening is absolutely divine. This dries down into this warm, slightly animalic vanilla thats intoxicating. My favourite from the entire JPG line.', verified: true, rating: 5, date: '3 days ago' },
    { id: 2, name: 'F_boutique', text: 'The bottle alone is iconic but the juice inside is even better. Warm, sweet, slightly dirty. Everything a JPG should be.', verified: true, rating: 5, date: '5 days ago' },
    { id: 3, name: 'Michel42', text: 'Lavender and tobacco work surprisingly well here. This is what I imagined Le Male would evolve into. Very well done, not as fresh as the original but much more interesting.', verified: true, rating: 4.5, date: '1 week ago' },
    { id: 4, name: 'scent_sophie', text: 'Bought this for my boyfriend and honestly I might start wearing it myself. The honey note is addictive. Only complaint is it can be a bit much in warm weather — strictly a fall/winter scent.', verified: true, rating: 4, date: '2 weeks ago' },
    { id: 5, name: 'TomUK_89', text: 'I like it but the vanilla here is quite synthetic smelling to me. The lavender opening is great but the dry down has this slightly plasticky sweetness that I can\'t unsee. Or unsmell I guess.', verified: true, rating: 3, date: '3 weeks ago' },
    { id: 6, name: 'RaulMadrid', text: 'Beast mode projection. Sprayed this at 8am and could still smell it on my jacket at midnight. If you want something that LASTS, this is it. The honey-tobacco base is gorgeous.', verified: true, rating: 5, date: '3 weeks ago' },
    { id: 7, name: 'noseblind99', text: 'Its good but Im not sure its worth the hype. The opening is lovely but after an hour it settles into a generic sweet-vanilla that smells similar to a lot of other things in my collection. Not bad, just not as special as people make it sound.', verified: true, rating: 3.5, date: '1 month ago' },
    { id: 8, name: 'lia_scents', text: 'This gives old money vibes but in a good way. Like expensive tobacco and honey in a library. Absolutely gorgeous for evening wear in autumn.', verified: true, rating: 5, date: '1 month ago' },
    { id: 9, name: 'fraghead_DE', text: 'Solid flanker. The absinth note adds an interesting twist that you don\'t find in other lavender-vanilla combos. Performance is really good too, easily 8+ hours on my skin. 4 sprays is plenty.', verified: true, rating: 4.5, date: '6 weeks ago' },
    { id: 10, name: 'marco_AT', text: 'Smells great in the first 30 minutes then becomes way too sweet for me personally. I find the honey note almost cloying after a while. If you like REALLY sweet fragrances you\'ll love this though.', verified: true, rating: 3, date: '2 months ago' },
  ],

  'le-male-le-parfum': [
    { id: 1, name: 'MarcelFR', text: 'The cardamom opening is what sets this apart from every other Le Male. It gives it this warm, slightly exotic feel that the original never had. Beautiful evolution of the line.', verified: true, rating: 5, date: '4 days ago' },
    { id: 2, name: 'Henri_B', text: 'Best JPG in my opinion. More complex and sophisticated than the original, less in-your-face than Elixir. The vanilla-leather combo in the dry down is chef\'s kiss.', verified: true, rating: 5, date: '1 week ago' },
    { id: 3, name: 'GastonP', text: 'The leather and vanilla work so well together. This smells expensive without being pretentious. Great for date nights when you want something refined.', verified: true, rating: 4, date: '2 weeks ago' },
    { id: 4, name: 'tyler_nyc', text: 'I own the whole Le Male line and this is probably the least exciting one tbh. Its good but it sits in this awkward middle ground — not as fresh as the OG, not as bold as Elixir. Just kind of... there.', verified: true, rating: 3.5, date: '3 weeks ago' },
    { id: 5, name: 'sofia_rose', text: 'Bought this for my partner and he gets compliments constantly. The iris note gives it a powdery elegance that I find really attractive on men. Very classy.', verified: true, rating: 5, date: '1 month ago' },
    { id: 6, name: 'noseBerlin', text: 'Performance is decent — about 6-7 hours on my skin. Not a nuclear projector but it does its job. The spiced vanilla dry down is really pleasant and inoffensive.', verified: true, rating: 4, date: '1 month ago' },
    { id: 7, name: 'ahmed_uae', text: 'For the price point I expected more. Its a nice vanilla-spice scent but it doesn\'t do anything that 10 other fragrances in my collection don\'t already do. Longevity was disappointing too, maybe 5 hours.', verified: true, rating: 3, date: '6 weeks ago' },
    { id: 8, name: 'laura_IT', text: 'Smells incredible on my boyfriend. Has this warm, inviting quality that makes you want to lean in closer. The sillage is moderate which I prefer — not everyone in the room needs to smell you.', verified: true, rating: 4.5, date: '2 months ago' },
  ],

  'le-male': [
    { id: 1, name: 'Paul_90s', text: 'This is what my dad wore and now I wear it. Absolute classic. The lavender-vanilla combo is timeless and still gets compliments 30 years later. If it ain\'t broke...', verified: true, rating: 5, date: '1 week ago' },
    { id: 2, name: 'MartinSE', text: 'OG blue fragrance. Still holds up incredibly well compared to modern releases. The mint in the opening is so refreshing and the dry down is warm without being heavy.', verified: true, rating: 5, date: '1 week ago' },
    { id: 3, name: 'SimonW', text: 'Fresh and sweet. Perfect everyday scent that works for literally any occasion. You can\'t go wrong with this one.', verified: true, rating: 4, date: '2 weeks ago' },
    { id: 4, name: 'nina_scents', text: 'I associate this smell with every guy at the club in 2005 lol. Its fine but SO many people wear it. If you want something that feels "you" this isn\'t it because everyone and their brother has a bottle.', verified: true, rating: 3, date: '3 weeks ago' },
    { id: 5, name: 'CharlieUK', text: 'Bought it for nostalgia. Still smells as good as I remember. The vanilla base keeps it warm and the lavender keeps it fresh. One of the best-balanced fragrances ever made honestly.', verified: true, rating: 5, date: '1 month ago' },
    { id: 6, name: 'frag_collector', text: 'Its a classic for a reason but I find the longevity quite weak on the EDT version. 3-4 hours and it\'s gone. Beautiful scent while it lasts though.', verified: true, rating: 3.5, date: '1 month ago' },
    { id: 7, name: 'BenAU', text: 'Simple, effective, crowd-pleasing. Not the most complex thing in the world but it does what it needs to do. Great value too.', verified: true, rating: 4, date: '6 weeks ago' },
    { id: 8, name: 'alexis_FR', text: 'Wore this to a wedding and got three compliments. For a fragrance this old and this affordable, that says everything.', verified: true, rating: 4.5, date: '2 months ago' },
  ],

  'le-beau-le-parfum': [
    { id: 1, name: 'tropicVibes', text: 'This smells like being on holiday. Coconut, a bit of vanilla, something green up top. Not complicated, just really really nice. My go-to every summer without fail.', verified: true, rating: 5, date: '3 days ago' },
    { id: 2, name: 'samG_', text: 'Solid summer scent but the longevity lets it down. I get maybe 4-5 hours before it becomes a skin scent. The coconut phase is lovely though, doesn\'t go sunscreen at all which I appreciate.', verified: true, rating: 3.5, date: '1 week ago' },
    { id: 3, name: 'Lucas_BE', text: 'Bought this blind based on a friend\'s recommendation and I\'m glad I did. Easygoing, clean, slightly sweet. My kind of fragrance for daily warm weather wear.', verified: true, rating: 5, date: '2 weeks ago' },
    { id: 4, name: 'noseknows22', text: 'Its pleasant but a bit one-dimensional. The coconut part is the best bit but it takes 30 mins to get there, and by then the projection is already dying down. Wish they made it stronger.', verified: true, rating: 3, date: '3 weeks ago' },
    { id: 5, name: 'RyanT', text: 'Wore this every single day last summer. The pineapple-coconut combo works without being tacky. Gets me compliments from people who normally don\'t comment on cologne.', verified: true, rating: 5, date: '1 month ago' },
    { id: 6, name: 'H_berg', text: 'Nice tropical vibe with some depth from the tonka. Works best in warm weather obviously. Not the most unique scent but it\'s well executed for what it is.', verified: true, rating: 4, date: '6 weeks ago' },
    { id: 7, name: 'dani_IT', text: 'The green note in the opening is actually really interesting. Gives it a freshness that you don\'t expect from a coconut fragrance. Dries down into something smooth and warm.', verified: true, rating: 4.5, date: '2 months ago' },
    { id: 8, name: 'KarenSE', text: 'I bought this for my son and he loves it. Its youthful without being childish. Perfect for a guy in his 20s who wants something casual but not boring.', verified: true, rating: 5, date: '2 months ago' },
  ],

  'le-beau-edt': [
    { id: 1, name: 'JulesP', text: 'Lighter than Le Parfum version but honestly I prefer this for daytime. The bergamot and coconut combo is so clean and fresh. Easy reach in summer.', verified: true, rating: 5, date: '1 week ago' },
    { id: 2, name: 'andreas_GR', text: 'Very pleasant but not very unique. Smells like a nice shampoo to be honest. Good for the office but don\'t expect compliments — its more of a "you smell nice" than a "WHAT are you wearing."', verified: true, rating: 3.5, date: '2 weeks ago' },
    { id: 3, name: 'MaxNL', text: 'Great summer daily driver. Light, fresh, inoffensive. The tonka gives it just enough depth to not be boring. Longevity is about 5-6 hours which is fine for an EDT.', verified: true, rating: 4, date: '3 weeks ago' },
    { id: 4, name: 'emma_fraghead', text: 'Bought this for my boyfriend and I love how it smells on him. Clean and slightly sweet without being overwhelming. Perfect for casual dates.', verified: true, rating: 4.5, date: '1 month ago' },
    { id: 5, name: 'rodrigo_BR', text: 'Its fine. Nothing special. In a world where there are so many amazing summer fragrances this just doesn\'t stand out enough for me to reach for it over the alternatives.', verified: true, rating: 3, date: '6 weeks ago' },
    { id: 6, name: 'cologneJP', text: 'Underrated in the JPG line. This is actually really pleasant and I get 6+ hours which is surprising for an EDT. The coconut water note is so refreshing.', verified: true, rating: 5, date: '2 months ago' },
  ],

  'le-male-elixir-absolu': [
    { id: 1, name: 'JeanLuc', text: 'If Elixir is a 9 then this is an 11. The rose addition takes it to another dimension. Absolutely stunning composition, I was not prepared for how good this smells.', verified: true, rating: 5, date: '5 days ago' },
    { id: 2, name: 'fragOslo', text: 'Interesting take on the Elixir formula. The oud adds a niche quality that the original doesn\'t have. Very different from what you\'d expect from JPG.', verified: true, rating: 4.5, date: '1 week ago' },
    { id: 3, name: 'SarahMcG', text: 'Bought this for my husband and its a bit too intense for everyday. The oud is quite prominent and can be polarizing. Beautiful for special occasions though.', verified: true, rating: 3.5, date: '2 weeks ago' },
    { id: 4, name: 'perfumista_CZ', text: 'I find the rose-oud combo a bit generic in 2025. Every niche house does this and JPG doesn\'t do it better than them. Its fine but for the same money I\'d rather get an actual niche fragrance.', verified: true, rating: 3, date: '1 month ago' },
    { id: 5, name: 'danielW', text: 'The longevity on this is insane. 14 hours on skin, no joke. The honey and rose dry down is just gorgeous. Worth every cent.', verified: true, rating: 5, date: '1 month ago' },
    { id: 6, name: 'luka_HR', text: 'Nice but very close to the original Elixir for me. I can\'t justify owning both. If you don\'t have Elixir already, get this one. If you do, skip it.', verified: true, rating: 3.5, date: '6 weeks ago' },
    { id: 7, name: 'mariaBG', text: 'I prefer this on my partner over the regular Elixir. Has more character and depth. The rose saves it from being just another sweet masculine.', verified: true, rating: 4, date: '2 months ago' },
  ],

  'ysl-y-edp': [
    { id: 1, name: 'marlon_fan', text: 'The "marlon" fragrance lives up to the hype. Fresh apple and ginger up top, dries down to something warm and woody. Its the kind of scent where literally everyone around you goes "that smells good."', verified: true, rating: 5, date: '2 days ago' },
    { id: 2, name: 'lukasz_PL', text: 'Blind bought this after seeing it everywhere on TikTok. Honestly? Its good. Not mind-blowing but very very good. Safe, versatile, gets compliments. Thats all you need sometimes.', verified: true, rating: 4, date: '5 days ago' },
    { id: 3, name: 'samirUAE', text: 'In hot weather this is INCREDIBLE. The apple note is so crisp and the ginger gives it just enough spice. 3 sprays and you\'re good for 8 hours minimum.', verified: true, rating: 5, date: '1 week ago' },
    { id: 4, name: 'nina_K', text: 'Bought this for my brother\'s birthday and he wears it every day now. Its clean, masculine, and just really pleasant. Not too sweet, not too sharp.', verified: true, rating: 5, date: '1 week ago' },
    { id: 5, name: 'thomasVIE', text: 'Good fragrance but a bit boring for my taste. Its like the perfectly safe choice that will never offend anyone but also never wow anyone. If that\'s what you want, great. I prefer something with more personality.', verified: true, rating: 3, date: '2 weeks ago' },
    { id: 6, name: 'josh_AU', text: 'This replaced Sauvage as my daily driver. Similar vibe but more refined somehow. The sage gives it a green herbal quality that Sauvage doesn\'t have.', verified: true, rating: 5, date: '3 weeks ago' },
    { id: 7, name: 'LenaDE', text: 'I find this quite generic to be honest. Smells like something Zara could make for €20. Pleasant? Yes. Special? Not really. Longevity is decent though, about 7 hours.', verified: true, rating: 3.5, date: '1 month ago' },
    { id: 8, name: 'omar_scents', text: 'The amberwood base is what makes this special for me. Most fresh fragrances dry down to nothing but this actually develops into something warm and interesting. Great daily scent.', verified: true, rating: 4.5, date: '1 month ago' },
    { id: 9, name: 'carloIT', text: 'Wore it to a job interview. Got the job. Correlation is not causation but I\'m giving Y the credit anyway haha. Clean and professional without being invisible.', verified: true, rating: 5, date: '6 weeks ago' },
    { id: 10, name: 'ella_frag', text: 'My boyfriend wears this and I think its fine. Nothing that makes me go wow. Its pleasant, inoffensive, smells like "cologne." Perfectly adequate if thats what you\'re going for.', verified: true, rating: 3.5, date: '2 months ago' },
  ],

  'black-opium': [
    { id: 1, name: 'Chloe_xo', text: 'Coffee and vanilla PERFECTION. This became my signature scent within a week of buying it. I get stopped by strangers asking what I\'m wearing. Obsessed is an understatement.', verified: true, rating: 5, date: '2 days ago' },
    { id: 2, name: 'ZoeUK', text: 'Sweet and sultry without crossing into childish territory. Gets compliments every single time I wear it which is rare for me. YSL knew what they were doing with this one.', verified: true, rating: 5, date: '5 days ago' },
    { id: 3, name: 'luna_93', text: 'The orange blossom gives it this beautiful lift that saves it from being too dark. The coffee note is realistic and blends gorgeously with the vanilla.', verified: true, rating: 4.5, date: '1 week ago' },
    { id: 4, name: 'stellaNL', text: 'Its the most popular women\'s fragrance for a reason. But that\'s also the problem — literally every other girl at my uni wears this. I switched to something less common because I got tired of smelling like everyone else.', verified: true, rating: 3, date: '2 weeks ago' },
    { id: 5, name: 'aurora_ES', text: 'Cozy, feminine, and enchanting. I layer this with a vanilla body lotion and the result is just *chef\'s kiss*. Perfect for date nights and evenings out.', verified: true, rating: 5, date: '3 weeks ago' },
    { id: 6, name: 'rach_mel', text: 'I find the coffee note a bit synthetic after a few hours. The opening is gorgeous but the dry down has this slightly chemical quality that bothers me. Might be a skin chemistry thing though because everyone else seems to love it.', verified: true, rating: 3.5, date: '1 month ago' },
    { id: 7, name: 'emmaW_23', text: 'Great for cold weather. In summer it becomes overwhelmingly sweet and cloying. But from October to March? Absolute perfection. The pear in the opening is such a nice touch.', verified: true, rating: 4, date: '1 month ago' },
    { id: 8, name: 'jade_fragz', text: 'Longevity is insane on this. I spray it in the morning and can still smell it when I go to bed. The projection calms down after a couple hours but it stays close to the skin forever. Amazing value.', verified: true, rating: 5, date: '6 weeks ago' },
    { id: 9, name: 'valerieParis', text: 'I appreciate the craftsmanship but this is just way too sweet for my nose. I like my fragrances more on the fresh/green side. If you love gourmands you\'ll adore this but its definitely not for everyone.', verified: true, rating: 2.5, date: '2 months ago' },
  ],

  'libre': [
    { id: 1, name: 'emma_scent', text: 'Bold and confident. The lavender in a feminine fragrance is SO unique and it just works. Makes me feel powerful every time I spray it on before heading out.', verified: true, rating: 5, date: '4 days ago' },
    { id: 2, name: 'olivia_AU', text: 'Orange blossom and vanilla — simple but executed so well. This is what modern elegance smells like. Gets me compliments at work constantly.', verified: true, rating: 4.5, date: '1 week ago' },
    { id: 3, name: 'ava_NYC', text: 'Modern classic status already. YSL really nailed the balance between fresh and warm here. I reach for this more than anything else in my collection.', verified: true, rating: 5, date: '2 weeks ago' },
    { id: 4, name: 'claireIE', text: 'The lavender note fades really quickly on me and then it just becomes a generic sweet vanilla. The opening is spectacular but the dry down is underwhelming for the price.', verified: true, rating: 3, date: '3 weeks ago' },
    { id: 5, name: 'mia_CH', text: 'I get maybe 4-5 hours out of this which for an EDP is disappointing. The scent itself is lovely — clean, slightly spicy, warm — but I wish it lasted longer without respraying.', verified: true, rating: 3.5, date: '1 month ago' },
    { id: 6, name: 'sophie_DK', text: 'Wore this to a job interview and got complimented by the interviewer. It gives this aura of quiet confidence that I really love. Not too much, not too little.', verified: true, rating: 5, date: '6 weeks ago' },
    { id: 7, name: 'amelie_FR', text: 'Very safe choice for a gift. Any woman between 20-50 would appreciate this. The lavender-vanilla combo is universally pleasant and the bottle is stunning too.', verified: true, rating: 4, date: '2 months ago' },
  ],

  'mon-paris': [
    { id: 1, name: 'marieFR', text: 'Romantic and sweet without being juvenile. The strawberry note is so well done — it smells real, not like candy. I wore this on my wedding day and it was perfect.', verified: true, rating: 5, date: '1 week ago' },
    { id: 2, name: 'claire_bx', text: 'The strawberry-patchouli combo shouldn\'t work but it does. Its playful up top and grounded in the base. Really well balanced for a fruity floral.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 3, name: 'julie_94', text: 'Très romantique! This gives me main character energy walking through Paris in autumn. Soft, sweet, and sexy at the same time.', verified: true, rating: 5, date: '3 weeks ago' },
    { id: 4, name: 'hannahDE', text: 'Its cute but very linear. Smells exactly the same from start to finish which gets a bit monotonous after a while. Also the longevity is about 4 hours on me which isn\'t great.', verified: true, rating: 3, date: '1 month ago' },
    { id: 5, name: 'rebecaNO', text: 'I find this a bit too sweet for everyday wear. Great for a night out or special occasion but I can\'t imagine wearing this to the office without it being too much.', verified: true, rating: 3.5, date: '6 weeks ago' },
    { id: 6, name: 'lisa_mel', text: 'Got this as a birthday gift and its become one of my top 3. The pear and peony give it a softness that I find really beautiful. Compliment magnet for sure.', verified: true, rating: 4, date: '2 months ago' },
  ],

  'myself-edp': [
    { id: 1, name: 'David_FR', text: 'This is my perfect daily scent. The bergamot and orange blossom opening is so fresh and inviting. Smells like clean laundry but in the most luxurious way possible.', verified: true, rating: 5, date: '1 week ago' },
    { id: 2, name: 'SamuelNL', text: 'Clean and sophisticated. Works for any occasion — office, dinner, weekend errands. The Ambrofix base gives it just enough presence without being loud.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 3, name: 'nathan_CA', text: 'I wanted to love this more than I do. Its pleasant but really safe and a bit boring to be honest. Smells like every other "clean" fragrance on the market. Nothing makes it stand out.', verified: true, rating: 3, date: '3 weeks ago' },
    { id: 4, name: 'KatjaFI', text: 'Bought this for my partner and I love how it smells on him. Modern, fresh, slightly woody. Not trying too hard but definitely noticeable. Perfect gentleman scent.', verified: true, rating: 5, date: '1 month ago' },
    { id: 5, name: 'JoaoLisboa', text: 'The patchouli in the base saves this from being generic. It adds just enough depth and earthiness to make it interesting. Longevity is about 6-7 hours which is perfectly adequate.', verified: true, rating: 4, date: '6 weeks ago' },
    { id: 6, name: 'max_berlin', text: 'Smells exactly like YSL Y to me. Like, nearly identical. If you already own Y EDP I don\'t see the point of buying this as well. Its fine on its own though.', verified: true, rating: 3.5, date: '2 months ago' },
  ],

  'sauvage-parfum': [
    { id: 1, name: 'chris_sauvage', text: 'The parfum version is genuinely a step above the EDT and EDP. Richer, smoother, more refined. The sandalwood is gorgeous and gives it this creamy quality that the other versions lack.', verified: true, rating: 5, date: '3 days ago' },
    { id: 2, name: 'mattCA', text: 'Dior quality is unmatched. Period. This is the definitive version of Sauvage and I will die on this hill. The vanilla in the base makes it so much warmer and more interesting.', verified: true, rating: 5, date: '5 days ago' },
    { id: 3, name: 'AndrewSYD', text: 'Everyone and their dad wears Sauvage but this version at least adds something different. The incense and vanilla depth sets it apart. Still, don\'t expect to be unique wearing this.', verified: true, rating: 3.5, date: '1 week ago' },
    { id: 4, name: 'JoshNZ', text: 'Compliment getter guaranteed. Safe blind buy for anyone who wants to smell good without thinking too much about it. This is basically the Honda Civic of fragrances — reliable, efficient, everyone likes it.', verified: true, rating: 4, date: '2 weeks ago' },
    { id: 5, name: 'omar_cologne', text: 'I\'m so tired of smelling this everywhere. Every uber driver, every gym bro. Its a good scent, I get it, but I\'m over it. If you want to smell like the other 10 million guys who wear this, go ahead.', verified: true, rating: 2.5, date: '3 weeks ago' },
    { id: 6, name: 'erikSE', text: 'The bergamot and sandalwood combo is really smooth. Out of all the Sauvage versions this is the one that feels most luxurious. Longevity is crazy too — easily 10+ hours on skin.', verified: true, rating: 5, date: '1 month ago' },
    { id: 7, name: 'anna_PL', text: 'Bought this for my husband and he smells amazing every day. Not overwhelming, not invisible. Just consistently good. I prefer this over the EDT which always gave me headaches.', verified: true, rating: 5, date: '1 month ago' },
    { id: 8, name: 'kevin_frag', text: 'Solid fragrance but I find it a bit linear. The elemi and bergamot opening is nice but after that it settles into a smooth woody-vanilla that doesn\'t really evolve. Good performance though.', verified: true, rating: 3.5, date: '6 weeks ago' },
    { id: 9, name: 'nicolaBG', text: 'Very office-friendly version of Sauvage. Not as aggressive as the EDT, more smooth and refined. I get about 8 hours with moderate projection which is perfect for work.', verified: true, rating: 4.5, date: '2 months ago' },
    { id: 10, name: 'amelieFR', text: 'Il est bien. Not revolutionary, not bad. Just a solid, well-made sandalwood fragrance. The Dior tax is real though — you\'re paying for the name more than anything special about the juice.', verified: true, rating: 3, date: '2 months ago' },
  ],

  'aventus': [
    { id: 1, name: 'AlexGOAT', text: 'There\'s a reason this is called the GOAT of fragrances. The pineapple, birch, and musk combo is literally iconic. Ive been wearing this since 2014 and it still gets me compliments every single time.', verified: true, rating: 5, date: '2 days ago' },
    { id: 2, name: 'SebastianK', text: 'The pineapple opening is smooth and fruity, then it shifts into this smoky birch dry down thats incredibly addictive. Every bottle smells slightly different which is annoying but also part of the charm I guess.', verified: true, rating: 5, date: '5 days ago' },
    { id: 3, name: 'mason_IL', text: 'Got a recent batch and honestly? Its not as good as it used to be. The pineapple is weaker and the birch is almost gone. Creed has been reformulating and it shows. Still good but not what it was in 2015.', verified: true, rating: 3.5, date: '1 week ago' },
    { id: 4, name: 'HenryUK', text: 'The smoky dry down is what makes this special. Lots of pineapple fragrances now but none of them have that birch-moss combo that Aventus has. Worth the investment.', verified: true, rating: 5, date: '1 week ago' },
    { id: 5, name: 'Jack_frag', text: 'CEO energy in a bottle. I put this on before important meetings and it genuinely makes me feel more confident. The performance is great too — 8+ hours with good projection for the first 3-4.', verified: true, rating: 5, date: '2 weeks ago' },
    { id: 6, name: 'leila_scents', text: 'I dont get the hype honestly. It smells good but its basically a fruity-smoky scent. For the price you can get 5 Mancera bottles that smell equally good. The batch variation issue is also really annoying — you never know what you\'re getting.', verified: true, rating: 3, date: '3 weeks ago' },
    { id: 7, name: 'tomaszPL', text: 'Solid performer. I get 10+ hours on clothes and about 7 on skin. The bergamot and apple notes in the opening are crisp and fresh before it settles into the warmer base. Classic for a reason.', verified: true, rating: 4.5, date: '1 month ago' },
    { id: 8, name: 'rashidKW', text: 'Very good fragrance but overpriced in my opinion. You can find excellent alternatives for a fraction of the cost. CDNIM gets you 80% there for 10% of the price.', verified: true, rating: 3.5, date: '1 month ago' },
    { id: 9, name: 'claire_89', text: 'This smells incredible on my husband. Its confident and masculine without being aggressive. The kind of scent that makes you want to lean in closer. Id buy this for any man in my life.', verified: true, rating: 5, date: '6 weeks ago' },
    { id: 10, name: 'nikolai_CY', text: 'I own both Aventus and the Absolu and honestly prefer the original. Its lighter and more versatile. The fruit-smoke balance here is perfection. One of the best fragrances ever made, period.', verified: true, rating: 4, date: '2 months ago' },
  ],

  'aventus-absolu': [
    { id: 1, name: 'DanielZH', text: 'Even better than the original Aventus. Deeper, richer, more sophisticated. The added oud and spices give it a niche quality that the original lacks. My new favourite from Creed.', verified: true, rating: 5, date: '1 week ago' },
    { id: 2, name: 'MatthewUS', text: 'The longevity on this is insane. Put it on at 7am and I could still smell it the next morning on my shirt. The dark fruit and leather combo is just gorgeous.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 3, name: 'AidenUK', text: 'If you love Aventus, this takes it to another level. More complex, more refined, more "grown up." The black currant and apple are still there but with added depth.', verified: true, rating: 5, date: '3 weeks ago' },
    { id: 4, name: 'sergioMI', text: 'I actually prefer the original. This feels over-engineered — too many notes fighting for attention. The original had an elegant simplicity that this one lacks. Its good but unnecessary if you own Aventus already.', verified: true, rating: 3, date: '1 month ago' },
    { id: 5, name: 'jenny_frag', text: 'The oud note here is really well done. Not harsh or medicinal at all. Just adds this warm, woody depth that makes it smell incredibly luxurious. Worth the premium over the original.', verified: true, rating: 4, date: '6 weeks ago' },
  ],

  'amore-caffe': [
    { id: 1, name: 'caffelatte', text: 'Smells like walking into an Italian coffee shop on a cold morning. Warm espresso, a touch of vanilla, cream. I reach for this constantly from October through March.', verified: true, rating: 5, date: '3 days ago' },
    { id: 2, name: 'EmmK', text: 'The coffee note is actually realistic which I appreciate — not synthetic at all. Only issue is projection dies after the first hour. Becomes very intimate very quickly.', verified: true, rating: 3.5, date: '1 week ago' },
    { id: 3, name: 'Noor_S', text: 'Really cozy and comforting. Reminds me of a vanilla latte. Wore it to work and two people complimented it which basically never happens to me.', verified: true, rating: 5, date: '2 weeks ago' },
    { id: 4, name: 'isabellaR', text: 'Its nice but kind of one-note for me. Coffee and vanilla from start to finish, not much development or evolution. If you love gourmands you\'ll enjoy it but it can feel repetitive after a while.', verified: true, rating: 3, date: '3 weeks ago' },
    { id: 5, name: 'lucasW', text: 'Great scent, poor longevity. I get maybe 4 hours before its completely gone. The coffee-vanilla combo is well done and smells natural and warm, just wish it lasted.', verified: true, rating: 3.5, date: '1 month ago' },
    { id: 6, name: 'danieleM', text: 'Honestly surprised by how much I like this. The espresso note isn\'t bitter at all, it blends into this sweet creamy thing thats really addictive. One of my favourite Mancera releases.', verified: true, rating: 5, date: '2 months ago' },
  ],

  'born-in-roma-intense': [
    { id: 1, name: 'roma_kid', text: 'The smoked vanilla here is gorgeous. Its darker and richer than the original Born in Roma. The ginger adds this unexpected warmth in the opening that I really love. Easily my favourite flanker.', verified: true, rating: 5, date: '5 days ago' },
    { id: 2, name: 'JayFrag', text: 'Warm spicy opening that settles into this deep vanilla-woody thing. Lasts well too — 8+ hours on my skin which is unusual for Valentino. Really impressed with this one.', verified: true, rating: 5, date: '1 week ago' },
    { id: 3, name: 'MikeB_90', text: 'Its good but almost too sweet for my nose. The vanilla is HEAVY and after a few hours it starts to feel a bit cloying. I can only wear this in small doses during very cold weather.', verified: true, rating: 3, date: '2 weeks ago' },
    { id: 4, name: 'scent_sophie', text: 'Wore this on a night out and got asked about it twice. The warm spicy vibe works perfectly in colder months. Not something I\'d reach for in summer though — strictly autumn/winter.', verified: true, rating: 4, date: '3 weeks ago' },
    { id: 5, name: 'TobiasL', text: 'The ginger note gives it a nice kick up top that I wasnt expecting. Dries down into a smoky vanilla thats quite different from anything else I own. Solid pickup, no regrets.', verified: true, rating: 5, date: '1 month ago' },
    { id: 6, name: 'alessio_fr', text: 'Decent but I expected more complexity from the Intense version. Its basically the original but louder and sweeter. If thats what you want, great, but it\'s not more refined or anything.', verified: true, rating: 3.5, date: '1 month ago' },
    { id: 7, name: 'ChrisW_UK', text: 'Really enjoy this for evening wear. The amber and vanilla combo gives it a luxurious feel without being too niche or challenging. Crowd pleaser for sure.', verified: true, rating: 4.5, date: '2 months ago' },
    { id: 8, name: 'fabioRO', text: 'I had high expectations based on the YouTube reviews and this didn\'t quite meet them. Its a nice vanilla-spice scent but I wouldn\'t call it "best date night fragrance ever" like everyone claims. Its fine. Above average. Thats it.', verified: true, rating: 3.5, date: '2 months ago' },
  ],

  'born-in-roma': [
    { id: 1, name: 'LeoIT', text: 'Clean but sexy at the same time. The violet leaf gives it this fresh quality that works perfectly for daytime. Goes from office to dinner seamlessly.', verified: true, rating: 5, date: '1 week ago' },
    { id: 2, name: 'CalebSA', text: 'The violet leaf and vetiver combo is unique in the designer space. Not many fragrances hit this exact sweet spot between fresh and warm. Very versatile.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 3, name: 'OwenIE', text: 'Decent everyday scent. Nothing spectacular but nothing bad either. It does the clean-masculine thing competently. Won\'t turn heads but won\'t offend anyone.', verified: true, rating: 3.5, date: '1 month ago' },
    { id: 4, name: 'sergioES', text: 'I find this really forgettable to be honest. Wore it for a week and not a single person noticed. The opening is pleasant but it dries down to basically nothing after 3-4 hours.', verified: true, rating: 3, date: '6 weeks ago' },
    { id: 5, name: 'anna_milan', text: 'I love this on men. Its fresh, modern, and just really attractive without being overwhelming. Perfect for a guy who wants to smell put-together without trying too hard.', verified: true, rating: 5, date: '2 months ago' },
    { id: 6, name: 'fredrikNO', text: 'Good all-rounder. The sage adds a nice herbal touch that keeps it interesting. Performance is about 6 hours which is adequate for an EDP.', verified: true, rating: 4, date: '2 months ago' },
  ],

  'born-in-roma-green-stravaganza': [
    { id: 1, name: 'LucaRM', text: 'This smells like a walk through an Italian garden. The green notes are so fresh and natural. Really different from the other Born in Roma flankers which I appreciate.', verified: true, rating: 5, date: '5 days ago' },
    { id: 2, name: 'jakobDK', text: 'Interesting take on the Born in Roma DNA. More herbal and green than I expected. Works great in spring and summer. Not something I\'d reach for in winter.', verified: true, rating: 4, date: '2 weeks ago' },
    { id: 3, name: 'chris_MEL', text: 'Its OK. A bit too "green" for my taste. Smells like freshly cut grass mixed with herbs. If you\'re into that vibe its probably great but its not for me.', verified: true, rating: 3, date: '3 weeks ago' },
    { id: 4, name: 'elenaMD', text: 'Surprisingly versatile for how fresh it smells. The vetiver base grounds it nicely. My boyfriend wears this and I think its really attractive. Underrated in the line.', verified: true, rating: 4.5, date: '1 month ago' },
    { id: 5, name: 'paul_frag', text: 'The longevity is disappointing. Maybe 3-4 hours on skin before its completely gone. The scent itself is lovely but at this price I expect it to last longer.', verified: true, rating: 3.5, date: '6 weeks ago' },
  ],

  'born-in-roma-coral-fantasy': [
    { id: 1, name: 'RomeoIT', text: 'The grapefruit opening is so refreshing. This is my go-to summer fragrance now. Has this bright, energetic vibe that just puts me in a good mood.', verified: true, rating: 5, date: '5 days ago' },
    { id: 2, name: 'LeonardoBR', text: 'Works surprisingly well in winter too, not just summer. The vanilla base gives it enough warmth. Very versatile and easy to wear — sprayed this daily for 3 months straight.', verified: true, rating: 5, date: '1 week ago' },
    { id: 3, name: 'AlessandroNA', text: 'Best Born in Roma version honestly. The balance is perfect — fresh without being sharp, sweet without being cloying. Valentino really nailed the formula here.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 4, name: 'matteoMI', text: 'Contemporary and fresh but nothing groundbreaking. It smells good but after an hour it becomes a generic citrus-vanilla skin scent. The opening 30 minutes are great though.', verified: true, rating: 3.5, date: '1 month ago' },
    { id: 5, name: 'oliver_AMS', text: 'Pleasant but unmemorable. In a lineup of citrus fragrances this wouldn\'t stand out. Its fine for everyday wear but don\'t expect to get noticed.', verified: true, rating: 3, date: '6 weeks ago' },
    { id: 6, name: 'KarinaSE', text: 'I bought this for my boyfriend and he gets compliments on it all the time. The coral/grapefruit note is really unique and refreshing. Nice summer scent.', verified: true, rating: 4, date: '2 months ago' },
  ],

  'spicebomb-extreme': [
    { id: 1, name: 'ViktorFan', text: 'Explosive entrance, smooth finish. The tobacco and vanilla dry down is absolutely perfect. This is the scent that made me fall in love with fragrances.', verified: true, rating: 5, date: '3 days ago' },
    { id: 2, name: 'RolfDE', text: 'Rated as one of the most attractive fragrances by multiple surveys for a reason. Trust the data. This thing is an absolute weapon in cold weather.', verified: true, rating: 5, date: '1 week ago' },
    { id: 3, name: 'HansCH', text: 'Dark and intense. The pepper-cinnamon opening punches you in the face (in a good way) then settles into this gorgeous sweet tobacco. Makes you feel powerful.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 4, name: 'FranzAT', text: 'Winter essential for sure, but it can be too much indoors. I made the mistake of wearing 4 sprays to an office party and it was overwhelming. 2 sprays max with this one.', verified: true, rating: 3.5, date: '3 weeks ago' },
    { id: 5, name: 'nataliePL', text: 'My husband wears this and I find it incredibly attractive. The vanilla and tobacco combo is just chef\'s kiss. He gets compliments every time without exception.', verified: true, rating: 5, date: '1 month ago' },
    { id: 6, name: 'mikeToronto', text: 'Good fragrance but it smells very similar to a lot of other spicy-vanilla scents on the market. The grenade bottle is cool though. Performance is solid — 7-8 hours.', verified: true, rating: 4, date: '1 month ago' },
    { id: 7, name: 'lucaBG', text: 'I expected more based on the name "Extreme." Its good but not as spicy or bold as I was hoping. The dry down is actually quite sweet and mild. I wanted something more challenging.', verified: true, rating: 3, date: '6 weeks ago' },
  ],

  'the-most-wanted-parfum': [
    { id: 1, name: 'LucasMad', text: 'The ginger fizz opening is genuinely unique — smells like ginger ale mixed with warm vanilla. I\'ve never smelled anything quite like this. Compliment machine in cold weather.', verified: true, rating: 5, date: '4 days ago' },
    { id: 2, name: 'HugoVIE', text: 'Perfect winter comfort scent. Like a warm vanilla hug on a freezing day. The bourbon vanilla in the base is so well done. Azzaro doesn\'t get enough credit.', verified: true, rating: 5, date: '1 week ago' },
    { id: 3, name: 'FelixDE', text: 'The toffee note makes this so addictive. Like I literally can\'t stop sniffing my wrist. The ginger keeps it from being too sweet which is smart.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 4, name: 'OscarNL', text: 'Popular for a reason but also very linear. Smells the same from start to finish. Good scent but I wish there was more development. Its just ginger-vanilla for 8 hours straight.', verified: true, rating: 3.5, date: '1 month ago' },
    { id: 5, name: 'rebecaSP', text: 'Bought this for my boyfriend after smelling it on a stranger. He wore it on our anniversary and it was perfect. Sweet, warm, inviting. Really well crafted.', verified: true, rating: 5, date: '1 month ago' },
    { id: 6, name: 'danielAR', text: 'Nice scent but I find it too sweet for anything other than winter evenings. In any kind of warmth it becomes sickly and overwhelming. Very seasonal.', verified: true, rating: 3, date: '6 weeks ago' },
    { id: 7, name: 'yuriJP', text: 'The woody notes in the base give it more depth than I expected. This isn\'t just a sweet scent — there\'s actually some complexity in the dry down. Underrated from Azzaro.', verified: true, rating: 4, date: '2 months ago' },
    { id: 8, name: 'christinaGR', text: 'I work at a department store and this is one of the most tested fragrances. Everyone who smells it likes it but not everyone buys it because the bottle looks cheap. The juice is great though.', verified: true, rating: 4, date: '2 months ago' },
  ],

  'the-most-wanted-edp-intense': [
    { id: 1, name: 'MaxBXL', text: 'More intense than the regular TMW and honestly I prefer it. The cardamom-toffee combo is such a vibe. Gives masculine sweetness without being juvenile. One of my most reached for bottles.', verified: true, rating: 5, date: '1 week ago' },
    { id: 2, name: 'LeoTR', text: 'Spicy and warm but in a playful way. Its like Azzaro found the perfect balance between "gym bro sweet" and "date night sophisticated." I get compliments at the gym AND at dinner.', verified: true, rating: 5, date: '2 weeks ago' },
    { id: 3, name: 'FelixAT', text: 'Azzaro keeps releasing bangers and nobody notices because the brand isnt "cool" enough for social media. This deserves way more attention than it gets.', verified: true, rating: 4.5, date: '3 weeks ago' },
    { id: 4, name: 'ryanIE', text: 'Very similar to the regular Parfum version just... louder. I struggle to justify owning both. If you\'re choosing between them, get this one — its better in every way.', verified: true, rating: 4, date: '1 month ago' },
    { id: 5, name: 'laraCA', text: 'I gifted this to my brother and he says its his favourite cologne ever. The amberwood base gives it this warm glow that lasts all day. Really solid performance.', verified: true, rating: 5, date: '1 month ago' },
    { id: 6, name: 'niklasDE', text: 'Pleasant but extremely sweet. Like sticking your nose in a bag of toffees. If thats your thing go for it. Personally I found it a bit one-dimensional and juvenile.', verified: true, rating: 3, date: '6 weeks ago' },
    { id: 7, name: 'evaHU', text: 'The cardamom opening is the star for me. Gives it a Middle Eastern vibe that I really like. It fades into generic sweetness after an hour but that first hour is beautiful.', verified: true, rating: 3.5, date: '2 months ago' },
  ],

  'althair': [
    { id: 1, name: 'ThomasMUC', text: 'The vanilla in this is not your basic vanilla. Its creamy, rich, almost gourmand but with enough freshness to keep it elegant. PDM really know how to do vanilla. This is up there with Layton for me.', verified: true, rating: 5, date: '3 days ago' },
    { id: 2, name: 'NoahUS', text: 'Compliment magnet. Had three people ask me what I\'m wearing the first day I put it on. The pistachio note is subtle but adds something really special that I cant quite describe.', verified: true, rating: 5, date: '1 week ago' },
    { id: 3, name: 'OliverSE', text: 'Worth every penny. The quality of ingredients is obvious — this doesnt smell synthetic or cheap at any stage. Lasts 10+ hours on me with good projection for the first 4-5.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 4, name: 'EthanCA', text: 'Bought this after smelling it on someone at a party. Its nice but for the price I was expecting something more exciting. Its a good vanilla fragrance but I\'ve smelled similar for less.', verified: true, rating: 3.5, date: '1 month ago' },
    { id: 5, name: 'julia_scent', text: 'This is THE vanilla fragrance in my opinion. Forget about all the others. The tonka and almond notes give it depth and complexity that cheap vanillas just don\'t have.', verified: true, rating: 5, date: '6 weeks ago' },
  ],

  'aoud-lemon-mint': [
    { id: 1, name: 'DavidHK', text: 'Perfect summer scent when you want something fresh but interesting. The oud-citrus combo is unexpected and really works. Its not your typical fresh fragrance at all, it has depth.', verified: true, rating: 5, date: '1 week ago' },
    { id: 2, name: 'sarahNZ', text: 'The mint is so refreshing! My go-to for hot days when I still want to smell sophisticated. Not just a "pool day" scent — I wear this to work in summer.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 3, name: 'JamesME', text: 'Unique combo but the oud and citrus fight each other on my skin. Starts nice but after 2 hours I get this weird medicinal quality that I dont love. Might be a skin chemistry thing.', verified: true, rating: 3, date: '3 weeks ago' },
    { id: 4, name: 'karenBE', text: 'Interesting but niche. This is not a crowd pleaser — the oud polarizes people. My husband loves it but his friends think it smells "too exotic." Know your audience.', verified: true, rating: 3.5, date: '1 month ago' },
  ],

  'aoud-vanille': [
    { id: 1, name: 'WilliamLDN', text: 'Rich and creamy. The oud adds such an interesting woody-animalic dimension to the vanilla. Its like vanilla for adults. Nothing else in my collection has this vibe.', verified: true, rating: 5, date: '4 days ago' },
    { id: 2, name: 'MiaCPH', text: 'Cozy winter vibes in a bottle. I literally cannot stop smelling my wrist when I wear this. The oud-vanilla combo is addictive. Gets me through cold Scandinavian winters.', verified: true, rating: 5, date: '1 week ago' },
    { id: 3, name: 'BenjaminZH', text: 'Warm, sensual, and sophisticated. Perfect for dinner dates when you want to leave an impression. The oud isnt harsh at all here — its smooth and well-integrated.', verified: true, rating: 4.5, date: '3 weeks ago' },
    { id: 4, name: 'charlotte_FR', text: 'The sillage is incredible — my colleague asked what perfume I was wearing from across the office. But thats also the downside. 2 sprays max or you\'ll choke everyone around you.', verified: true, rating: 4, date: '1 month ago' },
    { id: 5, name: 'kevinRO', text: 'Nice but a bit too heavy for my taste. The oud overpowers the vanilla on my skin and it just becomes this dense woody cloud. If you have warm skin chemistry this might not work well.', verified: true, rating: 3, date: '6 weeks ago' },
  ],

  '1-million-elixir': [
    { id: 1, name: 'rodrigoBR', text: 'Paco Rabanne finally made a mature 1 Million. The apple and rose combo is gorgeous and the vanilla base gives it this sexy warmth. Way better than the original in every way.', verified: true, rating: 5, date: '3 days ago' },
    { id: 2, name: 'julienFR', text: 'The tuberose here is interesting — gives it a slightly feminine quality that actually works really well on men. Not what I expected from a 1 Million flanker but I\'m pleasantly surprised.', verified: true, rating: 4.5, date: '1 week ago' },
    { id: 3, name: 'alexPT', text: 'Smells good but reminds me too much of the original 1 Million which I associate with high school. I know this is supposed to be different but my brain just goes "1 Million" and I feel 16 again.', verified: true, rating: 3, date: '2 weeks ago' },
    { id: 4, name: 'monicaES', text: 'Bought this for my partner and it smells absolutely divine on him. The lavender and apple opening is fresh and inviting, then it settles into this warm, slightly spicy vanilla. Compliment city.', verified: true, rating: 5, date: '3 weeks ago' },
    { id: 5, name: 'janNL', text: 'Performance is great — 8+ hours with solid projection. The smoky amber in the dry down is really pleasant. Only issue is its a bit too sweet for daytime wear in my opinion.', verified: true, rating: 4, date: '1 month ago' },
    { id: 6, name: 'igorUA', text: 'I wanted to love this but the synthetic quality of the apple note bothers me. It smells artificial in a way that the rest of the composition doesnt. Slightly distracting.', verified: true, rating: 3.5, date: '6 weeks ago' },
    { id: 7, name: 'danielTR', text: 'Great clubbing fragrance. Projects like a beast and the sweet-spicy profile is exactly what you want when you\'re going out. Not subtle at all but thats the point.', verified: true, rating: 5, date: '2 months ago' },
  ],

  '1-million-parfum': [
    { id: 1, name: 'pedroLIS', text: 'Salty and sweet at the same time. The solar notes give this a unique quality thats different from every other 1 Million. Perfect for beach days and summer nights.', verified: true, rating: 5, date: '5 days ago' },
    { id: 2, name: 'markDUB', text: 'I like this more than the original Million but less than the Elixir. Its in this weird middle ground. Good scent though — the tuberose is interesting and the salt accord is unique.', verified: true, rating: 4, date: '1 week ago' },
    { id: 3, name: 'SofiaGR', text: 'My boyfriend wears this and I think it smells amazing in summer. Fresh but with a warmth underneath that keeps it sexy. Very different from the original which I hated.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 4, name: 'tobiasCH', text: 'Its nice but the longevity is disappointing for a "Parfum." Maybe 5 hours on my skin. The scent is good but I expect more staying power when they call it parfum concentration.', verified: true, rating: 3.5, date: '1 month ago' },
    { id: 5, name: 'annaWRS', text: 'Smells a bit like sunscreen to me honestly. The solar-salt thing is interesting on paper but on my skin it just becomes "beach product." Not unpleasant, just not what I wanted from a cologne.', verified: true, rating: 3, date: '6 weeks ago' },
    { id: 6, name: 'yasinTR', text: 'The amber base saves this from being just another fresh scent. Gives it depth and warmth. I get about 7 hours with moderate projection. Good daily summer driver.', verified: true, rating: 5, date: '2 months ago' },
  ],

  'black-orchid': [
    { id: 1, name: 'VictoriaLDN', text: 'Dark, mysterious, and absolutely captivating. Tom Ford understood the assignment. This is the kind of fragrance people remember months after meeting you. Nothing else smells like this.', verified: true, rating: 5, date: '4 days ago' },
    { id: 2, name: 'SophiaBER', text: 'The chocolate note gives it this unexpected twist that makes it so unique. Rich, dark, slightly sweet but never juvenile. Wear this to make a statement.', verified: true, rating: 5, date: '1 week ago' },
    { id: 3, name: 'ava_mel', text: 'Statement fragrance for sure. People either love it or hate it on me. I personally think its gorgeous but I can see how the dark chocolate-truffle vibe isnt for everyone.', verified: true, rating: 4, date: '2 weeks ago' },
    { id: 4, name: 'oliviaPRS', text: 'Bold and unapologetic. Not for the faint of heart or for everyday wear. This is strictly a special occasion, evening, cold weather fragrance. Stunning quality though.', verified: true, rating: 4.5, date: '3 weeks ago' },
    { id: 5, name: 'natashaMOW', text: 'I find this way too heavy and mature-smelling for my taste. It gives "my grandmother\'s closet" vibes which I know is controversial but its how it smells on my skin. The patchouli is overwhelming.', verified: true, rating: 2.5, date: '1 month ago' },
    { id: 6, name: 'james_frag', text: 'As a man who wears this — the compliments are insane. Women love this on men. The orchid and truffle combination is unlike anything else in my collection. Tom Ford genius.', verified: true, rating: 5, date: '6 weeks ago' },
  ],

  'cedrat-boise': [
    { id: 1, name: 'NathanUK', text: 'Fresh citrus bomb with amazing longevity which is rare. Usually fresh scents die in 3 hours but this lasts 8+ easy. The blackcurrant and ginger give it character. A definite crowd pleaser.', verified: true, rating: 5, date: '5 days ago' },
    { id: 2, name: 'IsaacIL', text: 'The black currant note is what keeps me coming back. Its addictive and adds this fruity sweetness thats different from your typical citrus fresh scent. Love it.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 3, name: 'JulianFR', text: 'Great projection without being obnoxious. I wear this to work and its professional but interesting. The woody base keeps it grounded and mature.', verified: true, rating: 4, date: '3 weeks ago' },
    { id: 4, name: 'svenDE', text: 'I know everyone loves this but it smells like a fancier version of shower gel to me. Its well done for what it is but I find it a bit boring and safe. Nothing surprising or exciting here.', verified: true, rating: 3, date: '1 month ago' },
    { id: 5, name: 'andreaIT', text: 'Mancera\'s best seller for a reason. This works 365 days a year in any situation. The cedar base gives it enough warmth for winter and the citrus keeps it fresh for summer. Versatile king.', verified: true, rating: 5, date: '6 weeks ago' },
  ],

  'delina': [
    { id: 1, name: 'EmilyLDN', text: 'Princess vibes in a bottle. The rose-lychee combo is so romantic and feminine without being old-fashioned. I get compliments EVERY time I wear this, without exception.', verified: true, rating: 5, date: '3 days ago' },
    { id: 2, name: 'AmeliaCA', text: 'The rose and lychee together are perfection. Sweet but sophisticated in a way that cheaper rose fragrances just cant achieve. PDM quality is really evident here.', verified: true, rating: 5, date: '1 week ago' },
    { id: 3, name: 'HarperNY', text: 'Got this for my wedding day and everyone asked about it. The vanilla and musk dry down is so soft and beautiful. It lasted from morning until late at night which is amazing.', verified: true, rating: 5, date: '2 weeks ago' },
    { id: 4, name: 'EvelynAU', text: 'Elegant and timeless but overpriced in my opinion. There are similar rose-lychee fragrances from brands like Montale that cost a fraction and smell 80% identical. PDM tax is real.', verified: true, rating: 3.5, date: '1 month ago' },
    { id: 5, name: 'sofiaBA', text: 'I find the lychee note a bit synthetic and screechy in the opening. It calms down after 30 minutes but that initial blast is quite strong and almost headache-inducing for me.', verified: true, rating: 3, date: '6 weeks ago' },
    { id: 6, name: 'juliaVIE', text: 'This has been my signature for 2 years and I still love it. The rhubarb in the opening adds a tartness that balances the sweetness perfectly. So well constructed.', verified: true, rating: 4.5, date: '2 months ago' },
    { id: 7, name: 'rachelTLV', text: 'Beautiful fragrance but the longevity is hit or miss for me. Some days I get 8 hours, other days it fades after 3. Might depend on skin moisture or weather. The scent itself is gorgeous though.', verified: true, rating: 4, date: '2 months ago' },
  ],

  'erba-gold': [
    { id: 1, name: 'andrewMEL', text: 'Sunshine in a bottle. So bright and uplifting. The tropical fruits are beautifully done — not synthetic at all. Smells like a luxury vacation. Xerjoff quality is evident.', verified: true, rating: 5, date: '1 week ago' },
    { id: 2, name: 'JoshuaCT', text: 'Similar to Erba Pura but with this golden warmth that sets it apart. The amber base gives it more depth. Great for summer but also works in early autumn.', verified: true, rating: 4, date: '2 weeks ago' },
    { id: 3, name: 'christopherUS', text: 'Nice but I prefer the original Erba Pura. This one is sweeter and a bit more generic smelling to me. If you own Pura I dont think you need Gold.', verified: true, rating: 3.5, date: '1 month ago' },
    { id: 4, name: 'marinaGR', text: 'Love this for daytime. The mango and blackcurrant combo is so fresh and energizing. Performance is about 6-7 hours with moderate projection. Perfect summer daily.', verified: true, rating: 4.5, date: '6 weeks ago' },
  ],

  'erba-pura': [
    { id: 1, name: 'ryanDUB', text: 'Smells like an expensive fruity shampoo — but like, in the best way possible. Everyone loves it. My most complimented fragrance out of a collection of 30+ bottles.', verified: true, rating: 5, date: '4 days ago' },
    { id: 2, name: 'BrandonVAN', text: 'This is what clean and fresh SHOULD smell like. The fruits are natural and well-blended, not synthetic. 10/10 for summer and spring wear.', verified: true, rating: 5, date: '1 week ago' },
    { id: 3, name: 'AaronATL', text: 'Bought this as a gift and now I want my own bottle. The fruity opening is joyful and the vanilla base gives it longevity. Such a well-made fragrance.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 4, name: 'KevinBER', text: 'The vanilla base makes it last forever which is unusual for a fruity scent. 8+ hours easy. Beast mode longevity but in a pleasant, non-aggressive way.', verified: true, rating: 4, date: '1 month ago' },
    { id: 5, name: 'lilianaRO', text: 'Its nice but VERY sweet. In warm weather it becomes almost cloying. I had to limit this to cooler spring days. On hot days it was giving me a headache from the sweetness.', verified: true, rating: 3, date: '6 weeks ago' },
    { id: 6, name: 'darioIT', text: 'Great performance and pleasant scent but it smells very similar to a bunch of other fruity-musks on the market. Cloud by Ariana Grande gives a similar vibe for 1/5 the price. Just saying.', verified: true, rating: 3.5, date: '2 months ago' },
  ],

  'eros-energy': [
    { id: 1, name: 'JasonMIA', text: 'Fresh Eros for summer — exactly what the line was missing. The citrus is bright and energizing. Like the original Eros had a baby with a fresh scent. Really well done.', verified: true, rating: 5, date: '1 week ago' },
    { id: 2, name: 'JustinTOR', text: 'The citrus opening is really bright and punchy. Lasts about 6 hours which is decent for a fresh fragrance. Good for everyday summer wear.', verified: true, rating: 4, date: '2 weeks ago' },
    { id: 3, name: 'AustinATX', text: 'My new favourite Eros flanker. Fresher and more modern than the original. The mint note gives it a cool, energetic vibe that works great at the gym and for casual wear.', verified: true, rating: 4.5, date: '3 weeks ago' },
    { id: 4, name: 'emileSE', text: 'Its fine but forgettable. Smells like every other fresh-citrus designer scent. Nothing makes it stand out from the crowd. If you want something safe and inoffensive, sure. But there\'s no personality here.', verified: true, rating: 3, date: '1 month ago' },
    { id: 5, name: 'laraDE', text: 'I prefer this over the original Eros honestly. Its less cloying and more wearable. The green apple note gives it a crispness that I find really pleasant. Nice spring/summer option.', verified: true, rating: 5, date: '6 weeks ago' },
  ],

  'eros-flame': [
    { id: 1, name: 'DylanLDN', text: 'Spicy and passionate. The red pepper gives it this warmth that I really love. Different enough from the original Eros to justify owning both. Great for autumn/winter dates.', verified: true, rating: 5, date: '5 days ago' },
    { id: 2, name: 'LoganCHI', text: 'Date night essential. Gets compliments literally every time without exception. The pepper and rose combo is sexy without being overwhelming. Versace nailed this.', verified: true, rating: 5, date: '1 week ago' },
    { id: 3, name: 'GabrielSP', text: 'Bold and masculine but the pepper note can be a bit much in the first 10 minutes. Once it settles down its beautiful. The vanilla and tonka base is really pleasant.', verified: true, rating: 4, date: '2 weeks ago' },
    { id: 4, name: 'emmaLIS', text: 'My partner wears this and I have mixed feelings. The opening is gorgeous but the dry down becomes a bit generic — just another sweet-spicy masculine. Not bad, just nothing special.', verified: true, rating: 3.5, date: '1 month ago' },
    { id: 5, name: 'peterNL', text: 'I already own Spicebomb and this smells too similar on my skin. Different bottles, same vibe. If you have one you dont really need the other. Pick whichever is cheaper.', verified: true, rating: 3, date: '6 weeks ago' },
  ],

  'eros-parfum': [
    { id: 1, name: 'TylerMIA', text: 'The mint and apple combo is iconic for a reason. This is the ultimate club fragrance — sweet, fresh, and projects like crazy. 4 sprays and the entire room knows you arrived.', verified: true, rating: 5, date: '3 days ago' },
    { id: 2, name: 'jordan_xo', text: 'Sweet but balanced. Gets compliments from both men and women which is a good sign. The blue bottle is also gorgeous on the shelf. Versace understood the assignment.', verified: true, rating: 5, date: '1 week ago' },
    { id: 3, name: 'MarcusDC', text: 'The Parfum version is a clear upgrade over the EDT. More depth, better longevity, richer ingredients. If you\'re choosing between versions, get this one 100%.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 4, name: 'AdrianBCN', text: 'Safe blind buy for sure. Everyone knows Eros for a reason. Its THE clubbing fragrance. But thats also the issue — you WILL smell like 5 other guys at the bar.', verified: true, rating: 3.5, date: '3 weeks ago' },
    { id: 5, name: 'nikDE', text: 'Way too sweet for me. After an hour it becomes this candy-like bubble that follows you around. I can see the appeal for younger guys but at 35 I feel ridiculous wearing this.', verified: true, rating: 2.5, date: '1 month ago' },
    { id: 6, name: 'camilaCO', text: 'I bought this for my boyfriend and he wears it every weekend. The vanilla-tonka dry down is really attractive. Makes him smell expensive even in a t-shirt and jeans lol.', verified: true, rating: 5, date: '6 weeks ago' },
    { id: 7, name: 'samPHI', text: 'Solid performer. 10+ hours on clothes, 7-8 on skin. The ambroxan base gives it a modern touch. Not the most original scent in 2025 but its well-executed and crowd-tested.', verified: true, rating: 4, date: '2 months ago' },
  ],

  'prada-paradoxe': [
    { id: 1, name: 'giuliaMI', text: 'This is genuinely unique in the women\'s designer space. The amber and floral notes play off each other beautifully. I\'ve never smelled anything quite like this. Prada took a risk and it paid off.', verified: true, rating: 5, date: '5 days ago' },
    { id: 2, name: 'sarahBOS', text: 'The amber is gorgeous here. Warm, enveloping, slightly sweet. The clean musk in the dry down keeps it modern and wearable. Gets me compliments at work regularly.', verified: true, rating: 4.5, date: '1 week ago' },
    { id: 3, name: 'claraVIE', text: 'Interesting concept but the "paradox" of clean-meets-dark doesn\'t fully work on my skin. The transitions feel jarring rather than harmonious. After 2 hours it just becomes a pleasant amber.', verified: true, rating: 3.5, date: '3 weeks ago' },
    { id: 4, name: 'jennyHEL', text: 'Nice but overpriced for what it is. Its a well-made amber-floral but there are similar scents from brands like Narciso Rodriguez that cost much less. The Prada name is doing a lot of heavy lifting here.', verified: true, rating: 3, date: '1 month ago' },
    { id: 5, name: 'natalieCPH', text: 'I wore this to a dinner party and two women asked what it was. The refillable bottle is a nice touch too. Sustainable and luxurious at the same time.', verified: true, rating: 5, date: '6 weeks ago' },
  ],

  'french-riviera': [
    { id: 1, name: 'NicolasMCO', text: 'Smells like a Mediterranean vacation in a bottle. The jasmine and citrus notes are beautifully blended. Light, elegant, and perfectly suited for warm weather. Mancera at their best.', verified: true, rating: 5, date: '1 week ago' },
    { id: 2, name: 'PierreLYN', text: 'The jasmine gives it this beautiful white floral quality that elevates it above typical fresh scents. Unique in the Mancera lineup. Summer essential.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 3, name: 'LucasTLS', text: 'Summer in a bottle but the longevity is disappointing. Maybe 4 hours before its gone. Mancera usually does better with performance. The scent itself is lovely though.', verified: true, rating: 3.5, date: '1 month ago' },
    { id: 4, name: 'helenaGR', text: 'Light and pretty but very simple. Not much development or complexity — citrus and jasmine from start to finish. Its fine for what it is but I expected more from Mancera.', verified: true, rating: 3, date: '6 weeks ago' },
  ],

  'homme-intense': [
    { id: 1, name: 'VincentPRS', text: 'The iris here is so smooth and creamy. Pure sophistication in a bottle. This is what I wear to important meetings when I need to project quiet confidence. Dior excellence.', verified: true, rating: 5, date: '1 week ago' },
    { id: 2, name: 'AntoineLYN', text: 'Formal events, business dinners, upscale restaurants — this is your scent. Class in a bottle. The leather and iris combo is refined without being stuffy or old-fashioned.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 3, name: 'PhilippeBXL', text: 'Dior quality is evident from the first spray. The opening is rich and warm, the dry down is powdery and elegant. Only complaint is it sits very close to the skin — minimal projection.', verified: true, rating: 4, date: '3 weeks ago' },
    { id: 4, name: 'matthewDUB', text: 'Very mature smelling. I\'m 28 and feel like I\'m too young for this. Its well-made but the iris-leather combo gives "50-year-old CEO at a gala" vibes which isnt really my scene. Maybe in 20 years.', verified: true, rating: 3, date: '1 month ago' },
    { id: 5, name: 'rebecaPL', text: 'Bought this for my father and he absolutely loves it. The powdery iris is elegant and timeless. Perfect for a distinguished gentleman. Not for young guys though.', verified: true, rating: 5, date: '6 weeks ago' },
  ],

  'imagination': [
    { id: 1, name: 'WilliamHK', text: 'The MOST versatile fragrance I own. Works literally anywhere — office, dinner, gym, grocery store. The tea note is so unique and makes this feel effortlessly luxurious. LV at their finest.', verified: true, rating: 5, date: '2 days ago' },
    { id: 2, name: 'JamesSYD', text: 'There\'s a reason every fragrance YouTuber puts this in their top 10. It just IS that good. Clean, slightly floral tea scent with incredible depth and longevity. 10+ hours easy.', verified: true, rating: 5, date: '1 week ago' },
    { id: 3, name: 'RobertLA', text: 'Clean tea scent thats somehow also complex and interesting. Louis Vuitton knows how to do luxury — this doesnt smell like a designer fragrance, it smells like a niche masterpiece.', verified: true, rating: 5, date: '2 weeks ago' },
    { id: 4, name: 'CharlesZH', text: 'Beautiful scent but the price is absurd for what it is. Its a well-crafted tea fragrance but I cant justify the LV markup when similar compositions exist for 1/4 the retail price.', verified: true, rating: 3.5, date: '3 weeks ago' },
    { id: 5, name: 'RichardVIE', text: 'Bought this to celebrate a promotion and it immediately became my signature. The citrus opening is bright and fresh, then it develops into this gorgeous woody-floral. Worth the investment.', verified: true, rating: 5, date: '1 month ago' },
    { id: 6, name: 'danielUS', text: 'Nice fragrance but not the god-tier that people make it seem online. Its a good tea scent. Thats it. The performance is great but the scent itself isnt revolutionary or anything.', verified: true, rating: 3.5, date: '6 weeks ago' },
    { id: 7, name: 'katjaBER', text: 'I love this on my partner. Its clean and refined without being boring. Has this beautiful sophistication that most clean fragrances lack. The only reason I dont rate it higher is the LV tax.', verified: true, rating: 4, date: '2 months ago' },
  ],

  'khamrah-parfum': [
    { id: 1, name: 'OmarDXB', text: 'Cinnamon cake vibes. This is like burying your face in a freshly baked dessert. Perfect for cozy winter evenings by the fire. Lattafa keeps punching above their weight class.', verified: true, rating: 5, date: '4 days ago' },
    { id: 2, name: 'AhmedRUH', text: 'Sweet and spicy in the best way. The dates note is so unique — I\'ve never smelled it in any other fragrance. Gives this middle eastern warmth that western designers cant replicate.', verified: true, rating: 5, date: '1 week ago' },
    { id: 3, name: 'HassanAMM', text: 'Crazy value for money. This smells way more expensive than what you pay. Compare it to niche offerings at 5x the price and Khamrah holds its own. Lattafa genius.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 4, name: 'YusufIST', text: 'Their best release yet but the sweetness can be overwhelming. I had to learn to use 2 sprays max. More than that and its too much for indoor spaces.', verified: true, rating: 4, date: '3 weeks ago' },
    { id: 5, name: 'svenHEL', text: 'Interesting scent but very linear. Smells the same from start to finish — cinnamon, vanilla, dates. No real development or surprises. Some people like that consistency, I prefer evolution.', verified: true, rating: 3.5, date: '1 month ago' },
    { id: 6, name: 'lauraIT', text: 'I find it a bit too exotic for my taste. The spices are heavy and the sweetness is intense. On paper it sounds amazing but on skin it gives "dessert counter at a Middle Eastern bakery" which isnt my vibe.', verified: true, rating: 3, date: '6 weeks ago' },
    { id: 7, name: 'kevinMEL', text: 'Everybody raving about this online and I can see why. The quality at this price point is absolutely ridiculous. If this had a Dior or Chanel label nobody would question paying 5x more for it.', verified: true, rating: 5, date: '2 months ago' },
  ],

  'khamrah-qahwa': [
    { id: 1, name: 'MalikJED', text: 'Coffee lovers will obsess over this. Rich, aromatic, and surprisingly refined for the price. The roasted coffee note is so realistic. Pairs perfectly with cold weather.', verified: true, rating: 5, date: '1 week ago' },
    { id: 2, name: 'RashidABU', text: 'The oud gives it depth that the original Khamrah doesnt have. Its not just a sweet scent — theres this woody, slightly smoky quality underneath that I really appreciate.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 3, name: 'IbrahimCAI', text: 'Good evening scent but the coffee note fades faster than I\'d like. After 2 hours its mostly vanilla and oud. I wanted more coffee throughout. Still enjoyable though.', verified: true, rating: 3.5, date: '3 weeks ago' },
    { id: 4, name: 'chris_AMS', text: 'Smells very similar to Amore Caffe by Mancera but at a fraction of the price. If you\'re on a budget this is a great alternative. The quality gap is smaller than you\'d expect.', verified: true, rating: 4, date: '1 month ago' },
    { id: 5, name: 'mariaRO', text: 'I find the oud note a bit harsh in this one. It overpowers the coffee which is supposed to be the star. On my skin the coffee is gone in 30 minutes and then its just an oudy-woody scent.', verified: true, rating: 3, date: '6 weeks ago' },
  ],

  'layton': [
    { id: 1, name: 'AlexanderVIE', text: 'Apple pie meets luxury cologne. The apple and vanilla combination shouldnt work this well but PDM made magic with this. Ive been wearing it for 3 years and Im still not tired of it.', verified: true, rating: 5, date: '3 days ago' },
    { id: 2, name: 'MaximilianMUC', text: 'Year-round versatility that very few fragrances can match. Spring, summer, fall, winter — doesnt matter. 3 sprays and youre golden for 10+ hours. The performance is elite.', verified: true, rating: 5, date: '1 week ago' },
    { id: 3, name: 'SebastianZH', text: 'The vanilla-cardamom dry down is heavenly. PDM at its finest. This is what I wear when I want to feel like I have my life together even when I absolutely dont lol.', verified: true, rating: 5, date: '2 weeks ago' },
    { id: 4, name: 'TheodoreLDN', text: 'Got compliments from complete strangers multiple times which is honestly rare for me. The mandarin opening is fresh and inviting before it transitions into that warm vanilla heart.', verified: true, rating: 4.5, date: '3 weeks ago' },
    { id: 5, name: 'carolineBA', text: 'My husband wears this and I genuinely think its one of the most attractive scents a man can wear. The guaiac wood gives it a clean, slightly smoky quality thats irresistible.', verified: true, rating: 5, date: '1 month ago' },
    { id: 6, name: 'andreasATH', text: 'Overpriced for what it is. Its a nice apple-vanilla scent but the PDM tax is significant. You can find fragrances that smell 90% similar for a third of the price if you look around.', verified: true, rating: 3, date: '1 month ago' },
    { id: 7, name: 'nickCPH', text: 'The pepper note in the opening is a nice touch — gives it a slight edge before it smooths out. Very well blended. Every ingredient has its place. Professional level composition.', verified: true, rating: 4, date: '6 weeks ago' },
    { id: 8, name: 'paulFI', text: 'Good but I find it a bit sweet and inoffensive for my taste. I keep hearing its a compliment beast but honestly it doesnt stand out much in a crowd of sweet woody fragrances. Its just... pleasant.', verified: true, rating: 3.5, date: '2 months ago' },
  ],

  'phantom-parfum': [
    { id: 1, name: 'mateoBA', text: 'Way better than the original Phantom. The vanilla-lavender combo is creamy and addictive. Very modern smelling — like something a character in a sci-fi movie would wear. I dig it.', verified: true, rating: 5, date: '5 days ago' },
    { id: 2, name: 'luisMEX', text: 'The robot bottle is gimmicky but the juice inside is surprisingly good. Creamy, slightly sweet, with a fresh lavender edge. Good daily driver for someone who wants something different.', verified: true, rating: 4, date: '2 weeks ago' },
    { id: 3, name: 'tomas_CZ', text: 'I wanted to like this more. Its fine but very synthetic smelling on my skin. The lemon-cardamom opening is sharp and then it goes into this generic vanilla that doesnt feel worth the price.', verified: true, rating: 3, date: '1 month ago' },
    { id: 4, name: 'ariannaMI', text: 'Got this for my boyfriend and its actually growing on me. Its different from anything else he owns. The tolu balsam base is interesting — sweet but not gourmand.', verified: true, rating: 4.5, date: '6 weeks ago' },
    { id: 5, name: 'janDE', text: 'Underrated honestly. People dismiss this because of the bottle but the parfum version is genuinely well made. The vetiver in the base gives it just enough earthiness to stay interesting.', verified: true, rating: 5, date: '2 months ago' },
  ],

  'naxos': [
    { id: 1, name: 'MarcoRM', text: 'Honey and tobacco heaven. Xerjoff quality is in a different league — you can smell the difference immediately. This doesnt smell like a fragrance, it smells like an experience. Stunning.', verified: true, rating: 5, date: '5 days ago' },
    { id: 2, name: 'GiuseppeMI', text: 'Sweet and rich with that lavender-tobacco base thats just gorgeous. The cinnamon gives it a festive quality that works amazingly in autumn and winter. One of Xerjoffs best.', verified: true, rating: 5, date: '1 week ago' },
    { id: 3, name: 'LorenzoNA', text: 'Luxury in every spray. The honey note is realistic and not at all cloying. Worth every penny if you appreciate true craftsmanship in fragrance.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 4, name: 'sarahLDN', text: 'I love the concept but on my skin the tobacco is too prominent. It overwhelms the lovely honey-lavender combo. Might be a skin chemistry thing. Beautiful on paper strips though.', verified: true, rating: 3.5, date: '1 month ago' },
    { id: 5, name: 'nilsBER', text: 'Very niche-smelling which is great if thats what you want. But for everyday wear its a bit much. This is an event fragrance, not a daily driver. The tobacco and honey are quite intense.', verified: true, rating: 3.5, date: '6 weeks ago' },
    { id: 6, name: 'aidenUK', text: 'Solid performer — 10+ hours with good projection. The cashmeran gives it a creamy, cozy quality that I find really comforting. My go-to for cold rainy days.', verified: true, rating: 4, date: '2 months ago' },
  ],

  'pacific-chill': [
    { id: 1, name: 'tylerLA', text: 'Super refreshing. The grapefruit and green tea combo is like a spa day in a bottle. Louis Vuitton does fresh scents differently — this has class and depth that cheap fresh scents lack.', verified: true, rating: 5, date: '1 week ago' },
    { id: 2, name: 'BrandonSF', text: 'Smells like premium sparkling water in the best way. Fresh, clean, slightly fruity. Perfect for hot summer days when you want to smell luxurious without anything heavy.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 3, name: 'alexTYO', text: 'The LV price tag is hard to justify for what is essentially a citrus-aquatic scent. Its well done but Im not sure its 5x better than other fresh fragrances. You\'re paying for the label.', verified: true, rating: 3, date: '1 month ago' },
    { id: 4, name: 'helenCPH', text: 'Longevity is only about 4 hours which for LV money is disappointing. The scent is gorgeous — invigorating and clean — but having to reapply a luxury fragrance multiple times per day isnt great.', verified: true, rating: 3.5, date: '6 weeks ago' },
  ],

  'paradigme': [
    { id: 1, name: 'CharlesLDN', text: 'Ambroxan done RIGHT. So many brands overdo it but Prada found the perfect balance here. Clean, modern, slightly woody. This smells like success and good taste.', verified: true, rating: 5, date: '1 week ago' },
    { id: 2, name: 'EdwardDUB', text: 'Great sillage without being overwhelming. I wear this to work and get quiet compliments — people lean in and ask. Classy and refined. Exactly what a Prada scent should be.', verified: true, rating: 4, date: '2 weeks ago' },
    { id: 3, name: 'markusMUC', text: 'Very well made but also very safe. Theres nothing risky or surprising about this. Its a clean woody fragrance. If thats all you want its perfect. I just wish it had more personality.', verified: true, rating: 3.5, date: '1 month ago' },
    { id: 4, name: 'lucaPD', text: 'The geranium and bergamot opening is so smooth. Transitions beautifully into a warm woody base. No harsh edges anywhere. Prada\'s best mens fragrance in my opinion.', verified: true, rating: 5, date: '6 weeks ago' },
  ],

  'red-tobacco': [
    { id: 1, name: 'JackATL', text: 'The name says it all and delivers on the promise. Spicy tobacco perfection. Opens with this gorgeous saffron-cinnamon combo then settles into rich tobacco and vanilla. Cold weather beast.', verified: true, rating: 5, date: '4 days ago' },
    { id: 2, name: 'HenryMEL', text: 'Warm and inviting without being cloying. The tobacco note is smooth, not harsh or ashy at all. Perfect for cold evenings when you want something that wraps around you like a blanket.', verified: true, rating: 4.5, date: '1 week ago' },
    { id: 3, name: 'GeorgeLIS', text: 'Mancera quality at a great price point. Beast mode longevity — easily 12+ hours. The oud in the base gives it depth without being too exotic or challenging for western noses.', verified: true, rating: 4, date: '2 weeks ago' },
    { id: 4, name: 'annaKYIV', text: 'I find the saffron note a bit medicinal on my skin. It clashes with the sweetness of the vanilla. On others it smells gorgeous but my skin chemistry does something weird with it.', verified: true, rating: 3, date: '1 month ago' },
    { id: 5, name: 'paulBER', text: 'Great tobacco scent but VERY strong. 2 sprays is plenty. I made the mistake of doing 4 sprays once and my coworker asked me to tone it down. Use responsibly.', verified: true, rating: 3.5, date: '6 weeks ago' },
    { id: 6, name: 'emirISTR', text: 'One of the best tobacco fragrances under €100. The rose and jasmine in the heart add an unexpected elegance. This isnt just a masculine tobacco bomb — theres sophistication here.', verified: true, rating: 5, date: '2 months ago' },
  ],

  'silver-mountain-water': [
    { id: 1, name: 'PatrickBOS', text: 'Fresh and clean like actual mountain air. Creed does fresh scents better than anyone. The green tea note is so elegant and the blackcurrant adds just a touch of fruity sweetness.', verified: true, rating: 5, date: '1 week ago' },
    { id: 2, name: 'RichardLDN', text: 'Green tea vibes with a silver, almost metallic quality. Nothing else in my collection smells remotely like this. Unique and refreshing. Great for spring and summer.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 3, name: 'ThomasZH', text: 'Beautiful scent but for Creed prices I expect more longevity. I get about 4-5 hours max. The silver birch and tea combo is gorgeous while it lasts but it doesnt last long enough.', verified: true, rating: 3.5, date: '1 month ago' },
    { id: 4, name: 'mariaESP', text: 'Smells incredible on my husband but I find it a bit too "soapy" on women. Very clean and fresh but almost to the point of smelling like a fancy hand wash. Works better on men in my opinion.', verified: true, rating: 3.5, date: '6 weeks ago' },
    { id: 5, name: 'danDUB', text: 'You can get fragrances that smell 85% like this for a fraction of the price. Armaf does a decent version. Unless you need the Creed name on your shelf, save your money.', verified: true, rating: 3, date: '2 months ago' },
  ],

  'stronger-with-you-absolutely': [
    { id: 1, name: 'MarcoMI', text: 'The leather note gives this such an edge that the other SWY versions dont have. Its darker, more mature, slightly boozy. If Intensely is the date night scent, this is the after-party scent.', verified: true, rating: 5, date: '1 week ago' },
    { id: 2, name: 'AlessioRM', text: 'Bolder than Intensely which I appreciate. More mature vibes without being stuffy. The rum accord is really well done — warm and inviting without being too boozy.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 3, name: 'LorenzoNA', text: 'The vanilla and lavender combo in the dry down is really pleasant. Different enough from Intensely to justify owning both. Less sweet, more woody and leathery.', verified: true, rating: 4, date: '3 weeks ago' },
    { id: 4, name: 'juliaHEL', text: 'I actually prefer Intensely over this. The leather note here is a bit too prominent on my partner\'s skin and gives it an almost harsh quality. Intensely is smoother and more crowd-pleasing.', verified: true, rating: 3, date: '1 month ago' },
    { id: 5, name: 'peterPRG', text: 'Good scent but confusing positioning. Its supposed to be more intense than Intensely but I find them very similar on skin. After 2 hours they smell almost identical to me.', verified: true, rating: 3.5, date: '6 weeks ago' },
    { id: 6, name: 'yasminCAI', text: 'This is the grown-up version of SWY. Less sweet, more sophisticated. The chestnut and suede combo is really classy. Perfect for a man in his 30s who outgrew Intensely.', verified: true, rating: 5, date: '2 months ago' },
  ],

  'stronger-with-you-amber': [
    { id: 1, name: 'PaoloRM', text: 'Amber lovers will obsess over this. Rich, warm, and cozy. Its like the SWY DNA wrapped in a warm amber blanket. My favourite for lazy Sunday mornings in winter.', verified: true, rating: 5, date: '1 week ago' },
    { id: 2, name: 'AndreaMI', text: 'Perfect cold weather scent. The cinnamon-amber opening is gorgeous and inviting. Slightly more mature than Intensely which I appreciate. Good for the office too.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 3, name: 'gretaDE', text: 'Its fine but too similar to Intensely in the dry down. The amber twist in the opening is nice but after an hour they converge into the same vanilla-toffee base. Hard to justify owning both.', verified: true, rating: 3.5, date: '1 month ago' },
    { id: 4, name: 'lucaBCN', text: 'I wanted this to be the "amber bomb" the name suggests but its actually quite mild and sweet. More of a tweak on Intensely than a radical departure. Decent but underwhelming.', verified: true, rating: 3, date: '6 weeks ago' },
    { id: 5, name: 'emmaSTK', text: 'My boyfriend alternates between this and Intensely and honestly I find them both lovely. This one has a slightly more spicy opening that I prefer. Really attractive scent.', verified: true, rating: 5, date: '2 months ago' },
  ],

  'stronger-with-you-parfum': [
    { id: 1, name: 'RiccardoPD', text: 'Okay this gets a lot of hate but I actually think its decent. The violet note is unusual for a masculine and gives it an interesting twist. Not the best SWY but far from terrible.', verified: true, rating: 4, date: '5 days ago' },
    { id: 2, name: 'FabioMI', text: 'Sweet and boozy which is fun for nights out. But I agree with the general consensus — Intensely and Absolutely are both better. This feels like a step sideways rather than forward.', verified: true, rating: 3.5, date: '1 week ago' },
    { id: 3, name: 'StefanoRM', text: 'After trying all the SWY versions, this is definitely the weakest link. The composition feels muddled — the violet clashes with the toffee in a way that doesnt quite work. Not bad, just confused.', verified: true, rating: 3, date: '3 weeks ago' },
    { id: 4, name: 'julienFR', text: 'I blind bought this and was disappointed. It smells fine but compared to Intensely (which is cheaper and better) theres no reason to choose this. Save your money for a different SWY.', verified: true, rating: 2.5, date: '1 month ago' },
    { id: 5, name: 'dariaTR', text: 'I actually really like this on my partner. The amber-benzoin base is really warm and comforting. Different from Intensely in a good way. I think people dismiss it too quickly.', verified: true, rating: 5, date: '6 weeks ago' },
  ],

  'symphony': [
    { id: 1, name: 'VictoriaLDN', text: 'Sweet and fruity with that unmistakable LV quality. The rose and peony heart is beautifully done. This feels like music in fragrance form — harmonious, balanced, elegant.', verified: true, rating: 5, date: '1 week ago' },
    { id: 2, name: 'CatherineGVA', text: 'The mandarin-grapefruit opening is so bright and joyful. Transitions into the softest florals. Really uplifting and positive — I reach for this whenever I need a mood boost.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 3, name: 'ElizabethDC', text: 'Pure luxury but the price is insane. Its a beautiful floral but not $300+ beautiful in my opinion. You can find lovely florals from other houses for much less. LV tax at its peak.', verified: true, rating: 3, date: '1 month ago' },
    { id: 4, name: 'ameliePRS', text: 'Gorgeous scent but very subtle — barely projects at all after the first hour. For LV money I want people to notice when I walk into a room. This is more of a personal bubble scent.', verified: true, rating: 3.5, date: '6 weeks ago' },
  ],

  'elixir-absolu': [
    { id: 1, name: 'SophiePRS', text: 'Rich and complex in a way that only Guerlain can achieve. The amber base is intoxicating — warm, sweet, slightly powdery. This smells like old-world French luxury and I am HERE for it.', verified: true, rating: 5, date: '1 week ago' },
    { id: 2, name: 'CharlotteLDN', text: 'The amber is gorgeous but very potent. Two sprays is all you need — any more and its overwhelming. Beautiful for cold weather evening wear when you want something dramatic.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 3, name: 'isabelESP', text: 'Very niche and polarizing. The amber-incense combo is intense and not for everyone. I appreciate the craftsmanship but its not something I\'d wear daily. Strictly special occasions.', verified: true, rating: 3.5, date: '1 month ago' },
    { id: 4, name: 'marinaGR', text: 'Smells very similar to other Guerlain ambers in the range. I cant tell the difference between this and Mon Guerlain Intense after an hour. Nice but not distinct enough to add to a collection.', verified: true, rating: 3, date: '6 weeks ago' },
  ],

  'tonka-cola': [
    { id: 1, name: 'alexBER', text: 'This legitimately smells like cola gummies. Like, EXACTLY like them. Its weird and wonderful and I get the most confused (but positive) reactions when I wear it. So fun.', verified: true, rating: 5, date: '5 days ago' },
    { id: 2, name: 'jakobDK', text: 'The cherry-cinnamon opening is sparkling and festive. Very unusual for a fragrance. The cola accord is surprisingly well done and the vanilla base keeps it wearable.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 3, name: 'hannaFI', text: 'Fun scent but when would you actually wear this? Its too sweet and unusual for work, too casual for a date, too weird for a family gathering. I enjoy smelling it at home but I rarely reach for it.', verified: true, rating: 3.5, date: '1 month ago' },
    { id: 4, name: 'ricardoPT', text: 'The cola note is a novelty that wears off after the first few wears. Once the "oh cool it smells like cola" factor fades, you\'re left with a somewhat generic vanilla-tonka scent. One-trick pony.', verified: true, rating: 3, date: '6 weeks ago' },
    { id: 5, name: 'camilaAR', text: 'I layer this with Khamrah and the result is INCREDIBLE. Sweet, spicy, slightly fizzy. On its own its fun but as a layering piece its amazing. Very unique in my collection.', verified: true, rating: 4, date: '2 months ago' },
  ],

  'xplicit-vanilla': [
    { id: 1, name: 'sophieBER', text: 'Bold vanilla that doesnt mess around. The dark chocolate note gives it this rich, almost edible quality. Not your basic vanilla body spray — this is vanilla for grown-ups. Mancera killed it.', verified: true, rating: 5, date: '1 week ago' },
    { id: 2, name: 'tomUK', text: 'The pink pepper opening gives it a nice kick before settling into that gorgeous creamy vanilla. Longevity is excellent — 10+ hours. Really solid for the price.', verified: true, rating: 4.5, date: '2 weeks ago' },
    { id: 3, name: 'annaMOW', text: 'I wanted a "vanilla bomb" and this delivered. But its almost TOO much vanilla. By hour 4 I was getting a bit nauseous from the sweetness. Need to be careful with spray count.', verified: true, rating: 3.5, date: '1 month ago' },
    { id: 4, name: 'mateuszPL', text: 'If you have Khamrah or any other vanilla-heavy fragrance, this covers very similar ground. Its well made but not different enough to justify adding to a collection that already has gourmands.', verified: true, rating: 3, date: '6 weeks ago' },
    { id: 5, name: 'laraLIS', text: 'My partner and I both wear this — its truly unisex. The sandalwood and musk in the base keep it from being too sweet. Really well balanced dark vanilla. Impressive from Mancera.', verified: true, rating: 5, date: '2 months ago' },
  ],
};

// Default reviews for products without specific reviews
export const defaultReviews: ProductReview[] = [
  { id: 1, name: 'tyler_nyc', text: 'This one hits different. Everyone at the office keeps asking what I\'m wearing. Really pleasant and versatile scent.', verified: true, rating: 5, date: '1 week ago' },
  { id: 2, name: 'OliverSE', text: 'Makes people turn their head when you walk by. Good projection for the first few hours then settles into a nice skin scent.', verified: true, rating: 4.5, date: '3 weeks ago' },
  { id: 3, name: 'TonyMEL', text: 'Walked into a party and instantly got asked about it. Nothing else I own gets this kind of reaction.', verified: true, rating: 5, date: '1 week ago' },
  { id: 4, name: 'EmmaCA', text: 'The perfect signature scent. Elegant, long-lasting, and not something everyone else wears. Really happy with this purchase.', verified: true, rating: 4, date: '2 weeks ago' },
  { id: 5, name: 'sarahLDN', text: 'Absolutely love it. Professional and sophisticated without being boring. Wish the longevity was a bit better but the scent itself is gorgeous.', verified: true, rating: 3.5, date: '2 weeks ago' },
];

// Helper function to get reviews for a product
export const getProductReviews = (productId: string): ProductReview[] => {
  return productReviews[productId] || defaultReviews;
};
