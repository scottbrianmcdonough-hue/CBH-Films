import type { RippleSpec } from "../hotel-film/ripple/types";

// The Kingfisher, Bedford: a Black Friday spotlight (East & Midlands), 4:5 for the feeds, built as Gomersal Park's (the
// Rutland Four Roots style): the hotel's photos as slow pushes, a cut on every other bar, the lines one stay from arriving
// by the river to a slow morning in bed, the end card the offer from its booking page ("Black Friday Bed & Breakfast:
// Save 30%").
// Music: deep house instrumental (arnaud136, Pixabay 354596; Scott, 10 Nov, first use), 123 BPM, a bar every 57.8 frames,
// from 25.91s: the exterior over the last two bars of the build, the band in on the cut to the terrace (29.77s), the end
// card on the phrase eight bars on (45.18s).
export const kingfisherSpotlight: RippleSpec = {
  id: "kingfisher-spotlight",
  picture: "campaigns/kingfisher-spotlight/picture.mp4",
  frames: 694,
  feed: true,
  label: { eyebrow: "", name: "The Kingfisher", from: 8, to: 62 },
  lines: [
    { text: "Arrive\nby the river", from: 66, to: 107 },
    { text: "Drinks out\non the terrace", from: 119, to: 222 },
    { text: "A table\nby the fire", from: 234, to: 338 },
    { text: "Stay for\none more course", from: 350, to: 453 },
    { text: "Then a slow\nmorning in bed", from: 465, to: 566 },
  ],
  deepScrim: true,
  endCard: {
    at: 578,
    eyebrow: "Black Friday Sale",
    line: "30% off,\nbreakfast included",
    quick: true,
  },
  music: {
    src: "music/arnaud136-deep-house-instrumental-354596.mp3",
    startAt: 777,
    gain: 0.71,
    seconds: 231,
    fadeOut: 45,
  },
};
