import type { RippleSpec } from "../hotel-film/ripple/types";

// Black Friday region reel: The North (Bianca, 10 Nov: "a reel per region to include all cluster hotels, not just one"),
// 4:5 for the feeds. Every hotel in the region's carousel, cheapest first, each on its exterior then a hero shot, a
// bar each; the carousel's card (mauve caps place, cream Cormorant name, the offer in a mauve pill) held across the
// hotel's two shots. Opens on BLACK FRIDAY SALE / The North, ends on Save up to 30%. Built by
// scripts/bf-region-reels.py (clips by still-push.py, cut by cut-picture.py); the region's spotlight track.
export const bfRegionNorth: RippleSpec = {
  id: "bf-region-north",
  picture: "campaigns/bf-region-north/picture.mp4",
  frames: 936,
  feed: true,
  label: { eyebrow: "", name: "", from: 0, to: 1 },
  title: { from: 8, to: 152, eyebrow: "Black Friday Sale", line: "The North" },
  cards: [
    { from: 159, to: 308, place: "Gomersal, West Yorkshire", name: "Gomersal Park\nHotel & Spa", offer: "Breakfast plus dining savings" },
    { from: 315, to: 464, place: "Skipton, North Yorkshire", name: "Skipton Hotel", offer: "25% off food and drink" },
    { from: 471, to: 620, place: "Wakefield, West Yorkshire", name: "Waterton Park\nHotel & Spa", offer: "Breakfast plus dining savings" },
    { from: 627, to: 776, place: "Halifax, West Yorkshire", name: "Holdsworth House Hotel", offer: "10% off, breakfast included" },
  ],
  lines: [],
  deepScrim: true,
  endCard: { at: 780, eyebrow: "Black Friday Sale", line: "Save up to 30%", quick: true },
  music: {
    src: "hotels/dalmahoy/leva-eternity.mp3",
    startAt: 55,
    gain: 0.8,
    seconds: 40,
    fadeOut: 45,
  },
};
