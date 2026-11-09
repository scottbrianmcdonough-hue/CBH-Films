# Gomersal Park: Black Friday spotlight

`gomersal-park-spotlight` (RippleFilm, spec `src/hotels/gomersal-park-spotlight.ts`), 4:5 (1080 x 1350) for the
feeds, 21.6s, -15.5 LUFS. Back to [all films](../README.md).

## Status

Second version sent 9 Nov (new lines, new track). Goes with the North carousel (Wed 11 Nov); Gomersal Park is the North's cheapest on the live
Black Friday page.

## The film

- Scott (9 Nov): a spotlight for one Black Friday hotel from what's in the repo, "this is 4:5", "for socials", "socials
  not M&E", "do something cool", "like the Rutland Hall roots". So it is built like
  [Rutland Four Roots](rutland-four-roots.md): the hotel's own photos as slow pushes and glides
  (`scripts/still-push.py --hgt 1350`, clips in `public/campaigns/gomersal-park-spotlight/clips/`, cut by
  `scripts/cut-picture.py` with `"size": "1080x1350"`), hard cuts on the bar, a line a shot in cream Cormorant, the
  name in cream Cormorant (no gold caps, as Rutland), the cosy grade.
- Shots: spa pool (label "Gomersal Park / Hotel & Spa", then "Step down / into the warm"), afternoon tea ("Three
  tiers / and a little fizz"), burger ("The evening, / something hearty"), bedroom ("Sink in / and stay a while").
  The exterior photo (grey sky, the road in front) is left out.
- End card: BLACK FRIDAY SALE in Lee's mauve caps, "Eat well, / rest easy", then the live page's offer on one small
  line, "B&B plus a food and drink discount".
- The engine gained a 4:5 layout (`feed` in RippleSpec: label, lines and shade lower, CB in the 4:5 corner) and
  `endCard.eyebrow` / `endCard.sub`.

## Music

Driving Ambition (Mixkit 32; on no posted film), a cinematic build, 99.4 BPM, from 21.80s: two bars on the pool, a bar
and a half each on the tea and dinner, two on the bed, the end card on the first big impact (38.59s), held two bars.
Tried first: Inspiring Uplifting Indie Rock (on November Best Loved), then Dirty Thinkin' (Scott: "that track needs
changing"). New tracks can't be downloaded here (Mixkit and Pixabay unreachable), so picks come from `public/music/`
or Scott's uploads.

## Notes

- Scott (9 Nov): "don't like supper sorted" (now "Then dinner, / no rush"); "better end card then food discount like a
  one liner" (the line, then the offer small beneath); "the next card has to change" (two lines starting "Then":
  the bedroom is now "And sleep / till breakfast").
- Scott (9 Nov): "copy needs elevating and that track needs changing": the lines rewritten (above, the first set was
  "A weekend / in West Yorkshire", "Afternoon tea, / and a little fizz", "Then dinner, / no rush", "And sleep / till
  breakfast", end "Come hungry, / stay the night"), recut to Driving Ambition.
