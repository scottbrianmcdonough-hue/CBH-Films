import type { RippleSpec } from "../hotel-film/ripple/types";

// Gomersal Park Hotel & Spa: the Black Friday spotlight for the North (the North carousel's cheapest, out Wed 11 Nov),
// 4:5 for the feeds, in the Rutland Four Roots style (Scott, 9 Nov: "socials not M&E", "like the Rutland Hall roots"):
// cinematic pushes and glides on the hotel's own photos, hard cuts on the bar, a line a shot in cream Cormorant, the name
// in cream Cormorant, a snappy end card with the live page's offer under "Black Friday Sale" in Lee's mauve caps.
// The exterior photo (grey sky, the road) is left out; it opens on the spa pool.
// Music: Driving Ambition (Mixkit 32; on no posted film), a cinematic build, 99.4 BPM, a bar every 72 frames, from
// 21.80s: two bars on the pool, a bar and a half each for the tea and dinner, two on the bed, the end card on the first
// big impact (38.59s, film frame 504), held two bars as it rings on. Dirty Thinkin' was tried first (Scott: "that track
// needs changing"); the indie rock before it is on November Best Loved.
// The lines are about the hotel and what each shot shows, as Rutland's (Scott, 10 Nov: "don't make it about two
// cities", "complement the visuals like the Rutland reel"): the water falling into the spa pool, the tiered tea and fizz,
// the stacked burger, the berry velvet throw. The end card is the sale and the offer only (Scott: "too much on the
// end card").
export const gomersalParkSpotlight: RippleSpec = {
  id: "gomersal-park-spotlight",
  picture: "campaigns/gomersal-park-spotlight/picture.mp4",
  frames: 648,
  feed: true,
  label: { eyebrow: "", name: "Gomersal Park\nHotel & Spa", from: 8, to: 66 },
  lines: [
    { text: "Where the week\nwashes off", from: 72, to: 135 },
    { text: "Tea in tiers,\na glass of fizz", from: 147, to: 243 },
    { text: "Stacked tall,\nchips on the side", from: 255, to: 351 },
    { text: "Sink into\nberry velvet", from: 363, to: 492 },
  ],
  deepScrim: true,
  endCard: {
    at: 504,
    eyebrow: "Black Friday Sale",
    line: "B&B plus a food\nand drink discount",
    quick: true,
  },
  music: {
    src: "music/mixkit-driving-ambition-32.mp3",
    startAt: 654,
    gain: 0.7,
    seconds: 100,
    fadeOut: 40,
  },
};
