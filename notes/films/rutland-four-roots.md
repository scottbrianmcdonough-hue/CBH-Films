# Rutland Hall: Four Roots Luxury Breaks

**Status:** Reel and Story rendered (5 Nov) for Fri 6 Nov; ticket in `out/rutland-four-roots-ticket.txt`; prices and nights to confirm with the hotel.  
**Compositions:** `rutland-four-roots`, `rutland-four-roots-story`  
**Hotels:** Rutland Hall Hotel & Spa  
**Music:** Deep House Sunset by Sunset House Grooves (Pixabay 538759)

[All films](../README.md) · [Hotels](../hotels.md) · [Music](../music.md)

## Notes

Bianca (5 Nov, to Lorienne): one social post for Rutland's two packages before Mon 9 Nov (the rest of November is Black
Friday's 14). The Four Roots Journey is the signature of both breaks, so the reel walks its four parts a root a bar
over the hotel's own footage (`src/hotels/rutland-four-roots.ts`, RippleFilm in cut mode, `cut.json` -> `picture.mp4`):
Rutland Water with the label, a bathing ritual (spa baths), a treatment of your choice (treatment room), meditation
(the relaxation room; "meditation" only, the pages say quiet and guided), lakeside dining (Rutland Water at sunset),
then the candlelit bath and the suite, end card "Take root / by the lake" (Scott wasn't sure about "Slow down by the
water"). Each root's line has THE FOUR ROOTS JOURNEY in gold caps above it (house style). No prices or nights on screen.
Deep House Sunset's unused opening: the label over the pads, the kick on the first root (15.94s), a 320 beat jump to
the last phrase so the end card lands on its final kick (186.81s) and the pads ring out. 21.9s, -15.7 LUFS; Story
(the stay shots out) 16.0s.

Rebuilt on the hotel's photos (Scott, 5 Nov: the footage "weird and bubbles", his CBH site photos in
`public/hotels/rutland-hall/photos/`): the house over Rutland Water (label), the pool (bathing ritual), a pan along the
Four Roots Wellbeing desk's sign (a treatment of your choice, the line set above the sign; `scripts/still-pan.py`, the
sign is wider than a 9:16 crop), the starlit relaxation room (meditation), the lake at sunset from the garden (lakeside
dining), the bedroom with the lake in its window. Slow pushes (`still-push.py`). The dog, the family by the lake and the
spring lake view are spare (summer looking).

Light grade (Scott, 5 Nov: "put a light grade so it looks cohesive"): an even base under the film's autumn grade, per shot in cut.json (`vf`): the pool's teal and the starlit room's purple brought well down, the rest a touch less saturated.

Music one continuous stretch (Scott, 5 Nov: the splice "skips a beat at 13 to 14 seconds", "stop splicing the music, just find a good place"): Deep House Sunset from 168.26s, its last phrase, the bass coming back on the first root and the final kick on the end card. The bathing ritual and the treatment held six beats each (Scott: "too fast to read"), meditation and lakeside dining four, the bedroom ten. Eyebrows THE FOUR ROOTS JOURNEY, ROOT TWO, ROOT THREE, ROOT FOUR (Scott: they all said the same). House gold, not the Black Friday mauve: Rutland is not one of the 14 and posts before the sale. 21.9s, -15.4 LUFS; Story 16.0s.

The stay (Scott, 5 Nov: the last scene was "just the bedroom"): the room, then a closer push on the lake in its window, under FOUR ROOTS LUXURY BREAKS / One night, or two (both breaks named, no prices or nights claimed).

The opening moves more (Scott: "pan or stronger push in first two shots"): the house a pan from the lake across to its front, the pool a stronger push in.

The stay back to one shot (Scott: "just do the one night or two over the same shot, not 2 shots of the same bedroom"): the bedroom held 20 to 30 under the line.

Polish pass (5 Nov): the light wall above the Four Roots sign darkened towards the top (a `geq` ramp in cut.json), so ROOT TWO and its line read.
- Booking link (Scott, 5 Nov): https://classicbritishhotels.com/hotels/rutland-hall-hotel-spa/#offers, on the post, bio and the Story sticker.

Copy lifted (Scott, 5 Nov: "elevate the copy", "kinda flat", "four opportunities for good copy"), each root named in the eyebrow with a line from its photo: ROOT ONE · BATHING RITUAL / Let the water take the weight; ROOT TWO · TREATMENT / Choose it, then switch off; ROOT THREE · MEDITATION / Lie back under a sky of stars; ROOT FOUR · LAKESIDE DINING / Supper as the lake turns gold; and a deeper shade behind the lines (RippleSpec `deepScrim`, Scott: "hard to read").
- Each root held longer (Scott, 5 Nov: "one more beat each ... I have to read the yellow and the white lines", "especially roots 3 and 4"): the music from 164.36s (the breakdown's start, 16 beats before the bass), the label and root one over the pads and the drop's gap, the bass back on root two, roots two to four seven beats each (3.4s), the bedroom nine, the end card on the final kick. Story from 167.29s: six beats a root. The new music cuts are the raw track (~-9 LUFS), so gain 0.47. 25.8s, -15.8 LUFS; Story 19.9s, -15.5 LUFS.
- Scott on the Story (5 Nov): "looks good, almost borderline too much text but good enough". Signed off for Fri 6 Nov 10 AM. If it's ever trimmed: drop the eyebrows (Root one · Bathing ritual...) and keep only the lines.
- No gold line over each root (Scott, 5 Nov: "get rid of the gold lines above and just put it at the beginning", after "almost borderline too much text"): the opening label's gold caps read FOUR ROOTS LUXURY BREAKS over Rutland Hall / Hotel & Spa, and the five lines stand alone in cream.
- Root two now "Your treatment, / then switch off" (Scott, 5 Nov: "Choose it, then switch off needs tweaking, choose it what is it").
- Root four now "Dinner as the / lake turns gold" (Scott: "supper?").
- One steady shade (Scott, 5 Nov: the picture "changes colour when the text fades for a second, smooth that out"): with deepScrim, RippleFilm's SteadyShade comes up with the first line and stays on to the end card; the lines no longer carry their own scrim, and the desk's top shade swaps in only on that shot's cuts.
- A touch more movement (Scott, 5 Nov: "a little more cinematic movement, just a touch"): still-push.py's new --dx glides the centre sideways under the push (pool 0.2 and 90px, relaxation room 0.09 and -80, sunset 0.09 and 90, bedroom 0.12 and -70; the desk pan 400 to 740). Order now treatment, water, stars, dinner, bed (Scott): the desk under the label's pads, the pool on the bass. End card line rises straight in (`endCard.quick`: 4 frames in over 14; it waited 18; Scott: "delayed a full second ... nice and snappy").
- Opening exterior swapped for Scott's photo of the house over the lawn (`exterior-lawn.jpg`; Scott, 5 Nov: "the golf buggy is killing me", the buggy on the drive came into the old pan): a pan 380 to 760 along the house (Story 480 to 700), saturation 0.8 for its bright spring lawn.
