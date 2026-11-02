# Ruthin Castle depth reel

**Status:** Sent (words rising sooner and smoother).  
**Compositions:** `ruthin-castle-depth`  
**Hotels:** Ruthin Castle  
**Music:** Autumn Piano by leberch (Lounge Soul dropped: Bianca)

[All films](../README.md) · [Hotels](../hotels.md) · [Music](../music.md)

## Notes

`ruthin-castle-depth`: a depth reel like Waterton's mixed with real footage (Scott, 20 Oct: "another parallax one like waterton ... mixed with real footage", an SEO-sheet hotel, "choose one you can do best": Ruthin, rank 19). Stills as depth moves on hand-drawn depth maps (`public/hotels/ruthin-castle/make-depth.py`: solid blocks, sky by colour) alternating with Ruthin's own autumn phone footage on hard cuts (`scripts/cut-picture.py`, `cut.json`): clock tower (label NORTH WALES / Ruthin Castle / Hotel & Spa), sumac and ruins, the peacock on the wall ("A castle / since the 1200s"), the Tafarn y Ddraig sign, the plate by the fire, the steaming hot tub, the carved white bed fading out; end card "Fancy a night / in a castle?". Lounge Soul (Kulakovka, Pixabay 614873; not in any posted film) from 4.41s: tower over the quiet intro, band in on the first cut; a still a bar (3.48s), footage half a bar. 27.8s, -15.5 LUFS. First version sent. Bianca didn't like Lounge Soul (20 Oct): never use it again. Now on "Autumn Piano" by leberch (Pixabay 611124, Scott's pick): solo piano, played freely, so the cuts sit on its chords (from 7.84s): stills ~4s, footage as ~1.3s glimpses, end card on the 28.61s chord; the track mastered +6 dB through a limiter (`autumn-piano-mastered.mp3`), 26.7s, -15.5 LUFS. The line sits high over the castle (`top: 450`; it covered the peacock's head). Second version sent. Polish: the tower push tilts up as it goes in (`--glide-y`, new in still-depth-dolly.py) so the tower's top stays in frame; the hot tub clip lifted (contrast, warmth: a per-shot `vf` in cut-picture.py). Polished version sent.

The end card is now inside the bedroom (Scott: "in the middle layer in the bedroom ... or black end card?"): the bed plays on to the end, a push held to the top of the photo so the headboard sinks, the crest framed just left of the words; "Fancy a night / in a castle?" (96/80, top 230) rises from behind the headboard (its traced outline, `make-bed-matte.py`, as the alpha of `clips/white-bed-fg.webm`, played over the words: RippleFilm's `endCard.scene`) and settles over the red curtains. The 1200s line is a quarter bigger with a stronger shade (Scott: "hard to notice"). 26.7s, -15.6 LUFS. Sent. Then (Scott: "come up sooner", "and smoother"): the words rise on the 25.84s note (frame 535), a 66-frame eased glide, the crest framed clear of them.
