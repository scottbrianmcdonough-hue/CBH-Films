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
