# Black Friday: region reels

`bf-region-north`, `bf-region-scotland-wales`, `bf-region-east-midlands`, `bf-region-south` (RippleFilm, `feed: true`,
specs `src/hotels/bf-region-*.ts`, built by `scripts/bf-region-reels.py`), 4:5 for the feeds. Back to
[all films](../README.md).

## Status

Built 10 Nov (Bianca: "a reel per region to include all cluster hotels, not just one"); rendering for review. They take
the place of the single spotlights ([Gomersal Park](gomersal-park-spotlight.md), [The Imperial](imperial-spotlight.md),
[The Kingfisher](kingfisher-spotlight.md), [Frensham Pond](frensham-spotlight.md)) and reuse each region's spotlight track,
so a region's spotlight and its region reel shouldn't both go out.

## The films

- Every hotel in the region's carousel, cheapest first, each on its exterior then a hero shot, a bar each; the
  carousel's card held across the hotel's two shots: the place in the campaign's mauve caps, the name in cream
  Cormorant, the offer in a mauve pill (the carousel's wording: breakfast, not B&B). Opens on BLACK FRIDAY SALE / the
  region over a hero shot, ends on BLACK FRIDAY SALE / Save up to 30% (the carousel covers' line). A dark gradient up
  from the bottom, as on the carousel slides, so the small mauve caps read.
- Engine: RippleSpec `cards` and `title` (RippleFilm `HotelCard`, `Title`, `CARD_SCRIM`).
- Lengths: the North 31.2s (Leva Eternity, a bar every 78 frames), Scotland & Wales 19.7s (Funky Summer House), East &
  Midlands 27.0s (deep house instrumental), the South 23.6s (Luxury Life).
- Final offers and order (Scott, 11 Nov, the list): "Save X%" on every card; Oaklands Hall moved to the North (first,
  £77.90), Skipton then Gomersal (both £85); East & Midlands Whittlebury, Forest of Arden, The Kingfisher (kept from its
  booking page, Save 30%; not on Scott's list because it was a late addition, Scott confirmed), Jockey Club Rooms; the South and Scotland & Wales as before.
  Each end card's "Save up to" is the region's best: the North 20%, the rest 30%. No prices on screen. Ruthin's hot tub
  reframed onto the woman on the left and the toast (cx 640). The North now 36.4s, East & Midlands 23.1s.
- Late additions (11 Nov): the Metropole (now 30% off B&B; place confirmed below) into
  Scotland & Wales, and Avisford Park Hotel (place and offer to confirm from the CBH or hotel site) into the South: the reels, the
  cluster posts and carousels, and the countdown (19 hotels). Waiting on photos (exterior and one inside shot each) and
  Avisford's offer card; the CBH site and both hotels' sites are blocked here. The reel moved to Fri 27 Nov (Scott:
  "just in case we get more hotels"). Scotland & Wales' end card stays "Save up to 30%". Post lines name
  the hotels only until their CBH pages are pasted (facts from the CBH or hotel site only; the rolodex places came from a
  web search).
- Confirmed from the CBH pages (Scott, 11 Nov). Avisford Park: Arundel/Chichester, West Sussex (Walberton, on the edge of
  the South Downs National Park), a Georgian manor house in 89 acres with its own 18 hole golf course, the Cedar
  Restaurant; 25% off B&B (from £63.75), first in the South (cheapest). Added to the South
  carousel ("25% off, breakfast included"; exterior, the restaurant as its cover tile) and reel ("Save 25%", the
  end card stays at 30%), 27.6s, -15.0 LUFS. The Metropole: Llandrindod Wells, Mid Wales, built in the Victorian era as
  the town grew into a spa town; Rock Spa with an indoor pool; near the Elan Valley; 30% off B&B (from price to
  confirm; its place in the price order with it). Its five photos (exterior, pool, Elan Valley, afternoon tea, tower room) to be re-sent as files.
  Photos in `public/hotels/avisford-park/` (exterior, golf, pool, restaurant, terrace), from the CBH site.
- The Metropole's offer amended to 30% (Scott, 11 Nov): Scotland & Wales stays "Save up to 30%" (end card, cover, post);
  its card "Save 30%"; the £77.23 from price is void (that was the 35% rate).
- South made snappy (Scott, 11 Nov: "add some dynamic text or snappy transitions ... it's kinda just a flat
  slideshow"): RippleSpec `snap` (beat, kicks). Each hotel is three shots on the beat: exterior two beats... half a bar
  (4 beats), then a hero and a third shot two beats each (Avisford golf, Frensham spa pool, Donnington twin bedroom,
  Oakley bedroom, Burleigh fireside), every cut a zoom snap (the old shot pushes in over 4 frames, the new one lands
  10% large and settles in 9, a touch of blur across it), a punch in on the opening as "The South" slams in. Text on
  the beat: caps wipe in, the name rises line by line, the pill pops a beat later with its percentage counting up;
  the title's line slams in two beats after its caps; the end card's 30% counts up over two beats. 27.6s, -15.0 LUFS.
  The other three region reels are unchanged until Scott signs this one off.
- A notch gentler (Scott, 11 Nov: "turn it back a notch with the pulsing, especially the first one"): the snap's push
  3.5% (was 7%), the landing 5% large (was 10%), blur 2px (was 5); the opening punch in at a third of that (`soft`).
- No punch in on the opening (Scott, 11 Nov: "don't do it on the first, the South"): the title shot holds steady; the snaps start at the first cut.
- Offers confirmed on the CBH pages (Scott, 12 Nov): Avisford Park B&B only (the room only offer disabled), 25% off
  B&B, still first in the South at £63.75; its pill now "25% off, breakfast included". The Metropole 30% off B&B (was
  35%): Scotland & Wales stays "up to 30%" everywhere. No 35% left in the code, slides or notes.
