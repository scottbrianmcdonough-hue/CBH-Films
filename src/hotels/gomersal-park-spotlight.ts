import type { RippleSpec } from "../hotel-film/ripple/types";

// Gomersal Park Hotel & Spa: the Black Friday spotlight for the North (the North carousel's cheapest, out Wed 11 Nov),
// 4:5 for the feeds, in the Rutland Four Roots style (Scott, 9 Nov: "socials not M&E", "like the Rutland Hall roots"):
// cinematic pushes and glides on the hotel's own photos, hard cuts on the bar, a line a shot in cream Cormorant, the name
// in cream Cormorant, a snappy end card with the live page's offer under "Black Friday Sale" in Lee's mauve caps.
// The exterior photo (grey sky, the road) is left out; it opens on the spa pool.
// Music: Dirty Thinkin' (Mixkit 989; on no posted film; the indie rock first tried is on November Best Loved), 120 BPM,
// a bar every 60 frames, from 66.02s: the pool and label over the last two bars of its breakdown, the full band back on
// the cut to tea (70.02s), the end card on the bar at 82.02s, ringing out on the track's own last hit (85.52s). Clips by still-push.py --hgt 1350, cut by cut-picture.py.
export const gomersalParkSpotlight: RippleSpec = {
  id: "gomersal-park-spotlight",
  picture: "campaigns/gomersal-park-spotlight/picture.mp4",
  frames: 630,
  feed: true,
  label: { eyebrow: "", name: "Gomersal Park\nHotel & Spa", from: 8, to: 60 },
  lines: [
    { text: "A weekend\nin West Yorkshire", from: 63, to: 114 },
    { text: "Afternoon tea,\nand a little fizz", from: 124, to: 216 },
    { text: "Then dinner,\nno rush", from: 229, to: 321 },
    { text: "And sleep\ntill breakfast", from: 334, to: 456 },
  ],
  deepScrim: true,
  endCard: {
    at: 480,
    eyebrow: "Black Friday Sale",
    line: "Come hungry,\nstay the night",
    sub: "B&B plus a food and drink discount",
    quick: true,
  },
  music: {
    src: "music/mixkit-dirty-thinkin-989.mp3",
    startAt: 1981,
    gain: 0.9,
    seconds: 89,
    fadeOut: 20,
  },
};
