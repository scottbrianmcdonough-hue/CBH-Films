import type { RippleSpec } from "../hotel-film/ripple/types";

// Frensham Pond Hotel & Spa, Farnham: a Black Friday spotlight (the South), 4:5 for the feeds, built as the other
// spotlights: the hotel's photos (the bar and suite from the CBH site, Scott, 10 Nov) as slow pushes, a cut every two
// bars, the lines one stay from arriving at dusk to a room with a view, the end card the live page's offer ("Save 20% on
// B&B"). The festive front on the hotel's Christmas page was left out: not Frensham's building.
// Music: Luxury Life (Kulakovka, Pixabay 618587; Scott, 10 Nov, first use), 123 BPM, a bar every 59.1 frames, from
// 11.53s: the hotel at dusk over the last two bars of the intro, the bass in on the cut to the bar (15.56s), the end card
// on the phrase eight bars on (31.33s).
export const frenshamSpotlight: RippleSpec = {
  id: "frensham-spotlight",
  picture: "campaigns/frensham-spotlight/picture.mp4",
  frames: 712,
  feed: true,
  label: { eyebrow: "", name: "Frensham Pond\nHotel & Spa", from: 8, to: 62 },
  lines: [
    { text: "Arrive as\nthe lights come on", from: 66, to: 112 },
    { text: "A drink\nat the copper bar", from: 124, to: 230 },
    { text: "Then down\nto the spa", from: 242, to: 348 },
    { text: "Dinner\nby the window", from: 360, to: 467 },
    { text: "And a room\nwith a view", from: 479, to: 585 },
  ],
  deepScrim: true,
  endCard: {
    at: 594,
    eyebrow: "Black Friday Sale",
    line: "20% off,\nbreakfast included",
    quick: true,
  },
  music: {
    src: "music/kulakovka-luxury-life-618587.mp3",
    startAt: 346,
    gain: 0.78,
    seconds: 145,
    fadeOut: 45,
  },
};
