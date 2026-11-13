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
- North and East & Midlands on the same beat cuts (Scott, 12 Nov: "need the north reel then the East and Midlands",
  "classy, not too snappy, upbeat energy but not nausea or headache"), third shots: Oaklands fireplace, Skipton pool,
  Gomersal bedroom, Waterton afternoon tea, Holdsworth tea by the fire; Whittlebury suite, Forest of Arden chef's
  afternoon tea, The Kingfisher fireside, Jockey Club Rooms blue bedroom. All three reels calmer: no blur, the old shot
  leans in 1.5%, the new lands 2.5% large and eases back over 14 frames; the title slams from 1.16 (was 1.45), the pill
  pops from 0.82 (was 0.55). South re-rendered to match.
- North polish (Scott, 12 Nov: "go ahead and do all five"): Gomersal Park opens on its exterior (the spa crop read as
  a shower wall) and drops its third shot (exterior and afternoon tea half a bar each); Waterton opens on the aerial
  of the island; the opening is one bar on Skipton's canal boats (was two on Holdsworth's robes, Holdsworth closing
  the reel too), the music started a bar later (133) so the hotels sit where they did; "The North" comes in a beat
  after its caps; the end card 1.25 bars (~3s, was ~5s). 31.9s, -15.5 LUFS.
- Restructured (Scott, 12 Nov: "don't really like the pulse", "like the Gomersal and the Rutland one", then "maybe do
  like the carousels, a collage first, then the exteriors with the sale percent"): no zoom pulse at all (kicks empty).
  Each reel opens on the carousel cover come to life (RippleSpec `collage`: the hotels' hero shots as tiles above and
  below the black band, faint from frame one for the preview, settling in a half beat apart; the region in mauve caps,
  Black Friday Sale rising, the Save up to pill popping and counting up on the next bar), two bars; then each hotel's
  exterior alone with a slow push and a sideways glide, left and right in turn (`still-push.py --dx`, the spotlights'
  move), its card (place, name, the pill counting up); the end card as before. North a bar a hotel (92 BPM, music from
  55 again), East & Midlands and the South two bars. North 21.5s, East & Midlands 23.1s, South 27.6s; -15.0 to -15.2 LUFS.
- North polish (Scott, 12 Nov: "doesn't have to go back and forth ... the pans", then "not one way, just not opposite
  each time"): the moves mixed per region (`moves`): Oaklands a straight push in, Skipton and Gomersal glide right,
  Waterton a push in, Holdsworth glides left. Ticket hook and length updated (21.5s).
- North wording (Bianca via Scott, 12 Nov: "wonder if the 20% will cause confusion ... change it to something else to
  create some urgency to book"): the cover's pill reads BOOK NOW (`collage.pill`), the end card "Lock in your dates /
  before they're gone" (Bianca's line), no percentage outside the hotels' own cards; the post drops "up to 20%".
- The Book now tap (Scott, 12 Nov: "do a click on the Book now and a sound effect", "see the original Black Friday
  reel"): the countdown reel's own press on the cover's pill, a beat after it pops (frame 137): the pill dips to 93% and
  back, a soft cream touch swells and fades from its middle, and its `tap.wav` (a bright tick and a small thump) plays
  (`collage.tap`), straight into the first hotel on the next beat. A house rule exception Scott asked for.
- The end card glides in (Scott, 12 Nov: "it just kinda pulses and pops in"): the caps wipe, then each line rises 28px and fades over 26 frames, the second 8 frames after the first; no scale.
- The collage band higher (Scott, 12 Nov: "need to bring it up more"): a 300px top row and a taller bottom one, so the band (308 to 738) and the Book now pill sit clear of the caption and buttons over a reel's lower half.
- Cards, title and CB raised (Scott, 12 Nov: "bring the CB up a bit and the rest"; the feed player's controls covered the pill): region reels only (`cards`), the cards and title 320px off the bottom (was 190), the shade rising with them, the CB at 1060 (was 1176).
- The CB up to 980 (Scott: "CB slightly up"; the player's menu dots sat on it).
- Gomersal back on its spa pool (Bianca, 12 Nov: "replace Gomersal exterior with their spa shot as per feedback on the other post, their exterior is shocking", then G2G), as on the carousel.
- East & Midlands as the North (Scott, 13 Nov: "the next regional reel"): collage with Book now and the tap, the end card "Lock in your dates / before they're gone", the moves mixed (Whittlebury push in, Forest of Arden and The Kingfisher glide right, Jockey Club glides left), the collage's Forest of Arden tile its chef with afternoon tea (two pools side by side otherwise). 23.1s, -15.1 LUFS. Ticket `out/bf-region-east-midlands-ticket.txt`.
- East & Midlands end line freshly worded (Scott, 13 Nov: "the same lock in your dates but fresh worded"): "Claim your dates / while they last", and the post's urgency line to match.
- Lighter (Scott, 13 Nov: "why does it seem so dark"): the region reels take a lighter grade (`GRADE_DAY`: sepia 0.18, brightness 1.06, a touch more contrast and colour) and the shade sits tighter behind the cards (to 58% of the frame, was 70%). North and East & Midlands re-rendered.
- Text readable again (Scott, 13 Nov: "can't read the text now" after the lighter grade): the shade back up behind the cards (0.82 at 36%, to 64%) and a tight dark halo on the mauve place caps (`CAPS_HALO`).
- South and Scotland & Wales as the North and East & Midlands (Scott, 13 Nov: "need the South and the other regional reel now"): collage with Book now and the tap, mixed moves (South push, right, right, push, left; Scotland & Wales right, push, left), freshly worded end lines: South "Make it yours / while it lasts", Scotland & Wales "Plan your escape / before it's gone". Scotland & Wales without the Metropole (its photos never came through as files). South 27.6s, Scotland & Wales 19.7s.
