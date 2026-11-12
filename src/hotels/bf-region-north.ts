import type { RippleSpec } from "../hotel-film/ripple/types";

// Black Friday region reel: The North (Bianca, 10 Nov: "a reel per region to include all cluster hotels, not just one"),
// 4:5 for the feeds. Every hotel in the region's carousel, cheapest first, each on its exterior then a hero shot, a
// bar each; the carousel's card (mauve caps place, cream Cormorant name, the offer in a mauve pill) held across the
// hotel's two shots. Opens on BLACK FRIDAY SALE / The North, ends on Save up to the region's best offer. Built by
// scratchpad build.py (clips by still-push.py, cut by cut-picture.py); the region's spotlight track.
export const bfRegionNorth: RippleSpec = {
  id: "bf-region-north",
  picture: "campaigns/bf-region-north/picture.mp4",
  frames: 1092,
  feed: true,
  label: { eyebrow: "", name: "", from: 0, to: 1 },
  title: { from: 8, to: 156, eyebrow: "Black Friday Sale", line: "The North" },
  cards: [
    { from: 158, to: 312, place: "Laceby, Lincolnshire", name: "Oaklands Hall Hotel", offer: "Save 18%" },
    { from: 314, to: 468, place: "Skipton, North Yorkshire", name: "Skipton Hotel", offer: "Save 20%" },
    { from: 470, to: 624, place: "Gomersal, West Yorkshire", name: "Gomersal Park\nHotel & Spa", offer: "Save 20%" },
    { from: 626, to: 780, place: "Wakefield, West Yorkshire", name: "Waterton Park\nHotel & Spa", offer: "Save 20%" },
    { from: 782, to: 936, place: "Halifax, West Yorkshire", name: "Holdsworth House Hotel", offer: "Save 10%" },
  ],
  lines: [],
  deepScrim: true,
  snap: { beat: 19.500, kicks: [156, 234, 273, 312, 390, 429, 468, 546, 585, 624, 702, 741, 780, 858, 897] },
  endCard: { at: 936, eyebrow: "Black Friday Sale", line: "Save up to 20%", quick: true },
  music: {
    src: "hotels/dalmahoy/leva-eternity.mp3",
    startAt: 55,
    gain: 0.8,
    seconds: 40,
    fadeOut: 45,
  },
};
