import type { RippleSpec } from "../hotel-film/ripple/types";

// Black Friday region reel: East & Midlands (Bianca, 10 Nov: "a reel per region to include all cluster hotels, not just one"),
// 4:5 for the feeds. Every hotel in the region's carousel, cheapest first, each on its exterior then a hero shot, a
// bar each; the carousel's card (mauve caps place, cream Cormorant name, the offer in a mauve pill) held across the
// hotel's two shots. Opens on BLACK FRIDAY SALE / East & Midlands, ends on Save up to 30%. Built by
// scripts/bf-region-reels.py (clips by still-push.py, cut by cut-picture.py); the region's spotlight track.
export const bfRegionEastMidlands: RippleSpec = {
  id: "bf-region-east-midlands",
  picture: "campaigns/bf-region-east-midlands/picture.mp4",
  frames: 810,
  feed: true,
  label: { eyebrow: "", name: "", from: 0, to: 1 },
  title: { from: 8, to: 112, eyebrow: "Black Friday Sale", line: "East & Midlands" },
  cards: [
    { from: 119, to: 227, place: "Laceby, Lincolnshire", name: "Oaklands Hall Hotel", offer: "Room only, breakfast or half board" },
    { from: 234, to: 343, place: "Whittlebury, Northamptonshire", name: "Whittlebury Park", offer: "Breakfast or half board" },
    { from: 350, to: 458, place: "Meriden, Warwickshire", name: "Forest of Arden Hotel", offer: "Breakfast included" },
    { from: 465, to: 574, place: "Bedford, Bedfordshire", name: "The Kingfisher", offer: "30% off, breakfast included" },
    { from: 581, to: 690, place: "Newmarket, Suffolk", name: "Jockey Club Rooms", offer: "Breakfast included" },
  ],
  lines: [],
  deepScrim: true,
  endCard: { at: 694, eyebrow: "Black Friday Sale", line: "Save up to 30%", quick: true },
  music: {
    src: "music/arnaud136-deep-house-instrumental-354596.mp3",
    startAt: 777,
    gain: 0.71,
    seconds: 231,
    fadeOut: 45,
  },
};
