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
  collage: { to: 118, caps: "Scotland & Wales", best: "30%", pill: "Book now", tap: 104, tiles: [{ src: "hotels/ruthin-castle/hot-tub-fizz.jpg", pos: "33% 50%" }, { src: "hotels/the-imperial/sea-view-room-wine.jpg", pos: "62% 50%" }, { src: "hotels/dalmahoy/pool.jpg", pos: "50% 50%" }] },
  cards: [
    { from: 120, to: 237, place: "Ruthin, North Wales", name: "Ruthin Castle\nHotel & Spa", offer: "Save 20%" },
    { from: 239, to: 355, place: "Llandudno, North Wales", name: "The Imperial Hotel", offer: "Save 20%" },
    { from: 357, to: 474, place: "Edinburgh", name: "Dalmahoy Hotel\n& Country Club", offer: "Save 30%" },
  ],
  lines: [],
  deepScrim: true,
  snap: { beat: 14.800, kicks: [] },
  endCard: { at: 474, eyebrow: "Black Friday Sale", line: "Plan your escape\nbefore it's gone", quick: true },
  music: {
    src: "music/berrydeep-funky-summer-house-565437.mp3",
    startAt: 353,
    gain: 0.58,
    seconds: 141,
    fadeOut: 45,
  },
};
