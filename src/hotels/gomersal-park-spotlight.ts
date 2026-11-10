import type { RippleSpec } from "../hotel-film/ripple/types";

// Gomersal Park Hotel & Spa: the Black Friday spotlight for the North (the North carousel's cheapest, out Wed 11 Nov),
// 4:5 for the feeds, in the Rutland Four Roots style (Scott, 9 Nov: "socials not M&E", "like the Rutland Hall roots"):
// cinematic pushes and glides on the hotel's own photos, hard cuts on the bar, a line a shot in cream Cormorant, the name
// in cream Cormorant, a snappy end card with the live page's offer under "Black Friday Sale" in Lee's mauve caps.
// The exterior photo (grey sky, the road) is left out; it opens on the spa pool.
// Music: Leva Eternity (lemonmusicstudio, Pixabay; the Dalmahoy film's track, Scott's pick, 10 Nov: Driving Ambition was
// "kinda too dramatic", Dirty Thinkin' before it "needs changing", the indie rock first tried is on November Best Loved),
// 92.3 BPM, a bar every 78 frames, from its first downbeat (1.83s in the trimmed file): two bars on the pool, five
// beats each on the tea and burger, six on the bed, the end card on the phrase start (film frame 468), held a bar and a
// half under the fade.
// The lines run as one evening, arrival to the morning's breakfast on the end card (Scott, 10 Nov: "needs something
// cohesive", "tell a story"); before that they were about the hotel and what each shot shows, as Rutland's (Scott, 10 Nov: "don't make it about two
// cities", "complement the visuals like the Rutland reel"): the water falling into the spa pool, the tiered tea and fizz,
// the stacked burger, the berry velvet throw. The end card is the sale and the offer only (Scott: "too much on the
// end card").
export const gomersalParkSpotlight: RippleSpec = {
  id: "gomersal-park-spotlight",
  picture: "campaigns/gomersal-park-spotlight/picture.mp4",
  frames: 585,
  feed: true,
  label: { eyebrow: "", name: "Gomersal Park\nHotel & Spa", from: 8, to: 70 },
  lines: [
    { text: "Leave the week\nin the water", from: 78, to: 147 },
    { text: "Stay on for tea,\na glass of fizz", from: 159, to: 245 },
    { text: "Then dinner,\nstacked tall", from: 257, to: 342 },
    { text: "And stay the night\nin berry velvet", from: 354, to: 456 },
  ],
  deepScrim: true,
  endCard: {
    at: 468,
    eyebrow: "Black Friday Sale",
    line: "Breakfast included,\nplus food and drink savings",
    quick: true,
  },
  music: {
    src: "hotels/dalmahoy/leva-eternity.mp3",
    startAt: 55,
    gain: 0.8,
    seconds: 40,
    fadeOut: 45,
  },
};
