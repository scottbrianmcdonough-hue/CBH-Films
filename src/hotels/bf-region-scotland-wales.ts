import type { RippleSpec } from "../hotel-film/ripple/types";

// Black Friday region reel: Scotland & Wales (Bianca, 10 Nov: "a reel per region to include all cluster hotels, not just one"),
// 4:5 for the feeds. Every hotel in the region's carousel, cheapest first, each on its exterior then a hero shot, a
// bar each; the carousel's card (mauve caps place, cream Cormorant name, the offer in a mauve pill) held across the
// hotel's two shots. Opens on BLACK FRIDAY SALE / Scotland & Wales, ends on Save up to the region's best offer. Built by
// scratchpad build.py (clips by still-push.py, cut by cut-picture.py); the region's spotlight track.
export const bfRegionScotlandWales: RippleSpec = {
  id: "bf-region-scotland-wales",
  picture: "campaigns/bf-region-scotland-wales/picture.mp4",
  frames: 592,
  feed: true,
  label: { eyebrow: "", name: "", from: 0, to: 1 },
  title: { from: 8, to: 114, eyebrow: "Black Friday Sale", line: "Scotland & Wales" },
  cards: [
    { from: 121, to: 233, place: "Ruthin, North Wales", name: "Ruthin Castle\nHotel & Spa", offer: "Save 20%" },
    { from: 240, to: 351, place: "Llandudno, North Wales", name: "The Imperial Hotel", offer: "Save 20%" },
    { from: 358, to: 470, place: "Edinburgh", name: "Dalmahoy Hotel\n& Country Club", offer: "Save 30%" },
  ],
  lines: [],
  deepScrim: true,
  endCard: { at: 474, eyebrow: "Black Friday Sale", line: "Save up to 30%", quick: true },
  music: {
    src: "music/berrydeep-funky-summer-house-565437.mp3",
    startAt: 353,
    gain: 0.58,
    seconds: 141,
    fadeOut: 45,
  },
};
