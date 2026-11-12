import type { RippleSpec } from "../hotel-film/ripple/types";

// Black Friday region reel: The South (Bianca, 10 Nov: "a reel per region to include all cluster hotels, not just one"),
// 4:5 for the feeds. Every hotel in the region's carousel, cheapest first, each on its exterior then a hero shot, a
// bar each; the carousel's card (mauve caps place, cream Cormorant name, the offer in a mauve pill) held across the
// hotel's two shots. Opens on BLACK FRIDAY SALE / The South, ends on Save up to the region's best offer. Built by
// scratchpad build.py (clips by still-push.py, cut by cut-picture.py); the region's spotlight track.
export const bfRegionSouth: RippleSpec = {
  id: "bf-region-south",
  picture: "campaigns/bf-region-south/picture.mp4",
  frames: 827,
  feed: true,
  label: { eyebrow: "", name: "", from: 0, to: 1 },
  title: { from: 8, to: 118, eyebrow: "Black Friday Sale", line: "The South" },
  cards: [
    { from: 120, to: 236, place: "Arundel, West Sussex", name: "Avisford Park Hotel", offer: "Save 25%" },
    { from: 238, to: 355, place: "Farnham, Surrey", name: "Frensham Pond\nHotel & Spa", offer: "Save 20%" },
    { from: 357, to: 473, place: "Sevenoaks, Kent", name: "Donnington Manor\nHotel", offer: "Save 20%" },
    { from: 475, to: 591, place: "Oakley, Hampshire", name: "Oakley Hall Hotel", offer: "Save 30%" },
    { from: 593, to: 709, place: "Minchinhampton, Gloucestershire", name: "Burleigh Court", offer: "Save 20%" },
  ],
  lines: [],
  deepScrim: true,
  snap: { beat: 14.775, kicks: [118, 177, 207, 236, 296, 325, 355, 414, 443, 473, 532, 561, 591, 650, 680] },
  endCard: { at: 709, eyebrow: "Black Friday Sale", line: "Save up to 30%", quick: true },
  music: {
    src: "music/kulakovka-luxury-life-618587.mp3",
    startAt: 346,
    gain: 0.78,
    seconds: 145,
    fadeOut: 45,
  },
};
