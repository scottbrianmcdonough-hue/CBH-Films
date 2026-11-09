# Gomersal Park: Black Friday spotlight

`gomersal-park-spotlight` (RippleFilm, spec `src/hotels/gomersal-park-spotlight.ts`), 4:5 (1080 x 1350) for the
feeds, 21.0s, -15.7 LUFS. Back to [all films](../README.md).

## Status

First version sent 9 Nov. Goes with the North carousel (Wed 11 Nov); Gomersal Park is the North's cheapest on the live
Black Friday page.

## The film

- Scott (9 Nov): a spotlight for one Black Friday hotel from what's in the repo, "this is 4:5", "for socials", "socials
  not M&E", "do something cool", "like the Rutland Hall roots". So it is built like
  [Rutland Four Roots](rutland-four-roots.md): the hotel's own photos as slow pushes and glides
  (`scripts/still-push.py --hgt 1350`, clips in `public/campaigns/gomersal-park-spotlight/clips/`, cut by
  `scripts/cut-picture.py` with `"size": "1080x1350"`), hard cuts on the bar, a line a shot in cream Cormorant, the
  name in cream Cormorant (no gold caps, as Rutland), the cosy grade.
- Shots: spa pool (label "Gomersal Park / Hotel & Spa", then "A weekend / in West Yorkshire"), afternoon tea
  ("Afternoon tea, / and a little fizz"), burger ("Then dinner, / no rush"), bedroom ("And sleep / till breakfast").
  The exterior photo (grey sky, the road in front) is left out.
- End card: BLACK FRIDAY SALE in Lee's mauve caps, "Come hungry, / stay the night", then the live page's offer on one
  small line, "B&B plus a food and drink discount".
- The engine gained a 4:5 layout (`feed` in RippleSpec: label, lines and shade lower, CB in the 4:5 corner) and
  `endCard.eyebrow` / `endCard.sub`.

## Music

Dirty Thinkin' (Mixkit 989), 120 BPM, from 66.02s: the pool and label over the last two bars of its breakdown, the
band back full on the cut to tea (70.02s), the end card on the bar at 82.02s, ringing out on its last hit (85.52s).
The first try was Inspiring Uplifting Indie Rock, but it is on November Best Loved (Scott: "make sure it's a
different track").

## Notes

- Scott (9 Nov): "don't like supper sorted" (now "Then dinner, / no rush"); "better end card then food discount like a
  one liner" (the line, then the offer small beneath); "the next card has to change" (two lines starting "Then":
  the bedroom is now "And sleep / till breakfast").
