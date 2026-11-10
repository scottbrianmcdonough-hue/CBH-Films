# Gomersal Park: Black Friday spotlight

`gomersal-park-spotlight` (RippleFilm, spec `src/hotels/gomersal-park-spotlight.ts`), 4:5 (1080 x 1350) for the
feeds, 19.5s, -15.1 LUFS. Back to [all films](../README.md).

## Status

Fourth version sent 10 Nov (lines that describe each shot, on Leva Eternity). Goes with the North carousel (Wed 11 Nov); Gomersal Park is the North's cheapest on the live
Black Friday page.

## The film

- Scott (9 Nov): a spotlight for one Black Friday hotel from what's in the repo, "this is 4:5", "for socials", "socials
  not M&E", "do something cool", "like the Rutland Hall roots". So it is built like
  [Rutland Four Roots](rutland-four-roots.md): the hotel's own photos as slow pushes and glides
  (`scripts/still-push.py --hgt 1350`, clips in `public/campaigns/gomersal-park-spotlight/clips/`, cut by
  `scripts/cut-picture.py` with `"size": "1080x1350"`), hard cuts on the bar, a line a shot in cream Cormorant, the
  name in cream Cormorant (no gold caps, as Rutland), the cosy grade.
- The lines describe each shot, as Rutland's (Scott, 10 Nov: "don't make it about two cities", "complement the
  visuals like the Rutland reel"): spa pool (label "Gomersal Park / Hotel & Spa", then "Where the week / washes off"),
  afternoon tea ("Tea in tiers, / a glass of fizz"), burger ("Stacked tall, / chips on the side"; Scott: "don't use
  supper, that ain't natural"), bedroom ("Sink into / berry velvet"; Scott liked "sink into something velvet" with a
  word in place of something). The exterior photo (grey sky, the road in front) is left out.
- End card: BLACK FRIDAY SALE in Lee's mauve caps over the live page's offer in cream Cormorant, reworded without "B&B"
  (Scott, 10 Nov: "sounds so uninviting"): "Breakfast included, / plus food and drink savings"; nothing else.
- The engine gained a 4:5 layout (`feed` in RippleSpec: label, lines and shade lower, CB in the 4:5 corner) and
  `endCard.eyebrow` / `endCard.sub`.

## Music

Leva Eternity (lemonmusicstudio, Pixabay; Scott's pick, 10 Nov), 92.3 BPM, a bar every 78 frames, from its first
downbeat in the trimmed file (1.83s): two bars on the pool, five beats each on the tea and burger, six on the bed, the
end card on the phrase start (frame 468), held a bar and a half under the fade. It is the Dalmahoy film's track, so
Dalmahoy (still waiting on the cocktail bar) will need a new one.
Tried first: Inspiring Uplifting Indie Rock (on November Best Loved), Dirty Thinkin' ("needs changing"), Driving
Ambition ("kinda too dramatic"). New tracks can't be downloaded here (Mixkit and Pixabay unreachable), so picks come
from the repo or Scott's uploads.

## Notes

- Scott (9 Nov): "don't like supper sorted" (now "Then dinner, / no rush"); "better end card then food discount like a
  one liner" (the line, then the offer small beneath); "the next card has to change" (two lines starting "Then":
  the bedroom is now "And sleep / till breakfast").
- Scott (9 Nov): "copy needs elevating and that track needs changing": the lines rewritten (above, the first set was
  "A weekend / in West Yorkshire", "Afternoon tea, / and a little fizz", "Then dinner, / no rush", "And sleep / till
  breakfast", end "Come hungry, / stay the night"), recut to Driving Ambition.
- Scott (10 Nov): "too much on the end card", "dinner and stay happens in a lot of places, what makes Gomersal stand
  out": the v2 lines ("Step down / into the warm", "Three tiers / and a little fizz", "The evening, / something hearty",
  "Sink in / and stay a while", end "Eat well, / rest easy" over the offer line) replaced by the spa hideaway thread;
  the end card is the sale and the offer only.
- Scott (10 Nov): "don't make it about two cities", "complement the visuals like the Rutland reel" (lines above);
  "the music is kinda too dramatic" (Driving Ambition out; the cleared tracks left unused are thin: see Music).
