import type { RippleSpec } from "../hotel-film/ripple/types";

// Black Friday region reel: The North (Bianca, 10 Nov: "a reel per region to include all cluster hotels, not just one"),
// 4:5 for the feeds. Every hotel in the region's carousel, cheapest first, each on its exterior then a hero shot, a
// bar each; the carousel's card (mauve caps place, cream Cormorant name, the offer in a mauve pill) held across the
// hotel's two shots. Opens on BLACK FRIDAY SALE / The North, ends on Save up to the region's best offer. Built by
// scratchpad build.py (clips by still-push.py, cut by cut-picture.py); the region's spotlight track.
export const bfRegionNorth: RippleSpec = {
  id: "bf-region-north",
  picture: "campaigns/bf-region-north/picture.mp4",
  frames: 644,
  feed: true,
  label: { eyebrow: "", name: "", from: 0, to: 1 },
  collage: { to: 156, caps: "The North", best: "20%", tiles: [{ src: "hotels/oaklands-hall/plate.jpg", pos: "50% 50%" }, { src: "hotels/skipton/afternoon-tea.jpg", pos: "52% 50%" }, { src: "hotels/gomersal-park/afternoon-tea.jpg", pos: "40% 50%" }, { src: "hotels/waterton-park/outdoor-hot-tub.jpg", pos: "57% 50%" }, { src: "hotels/holdsworth-house/breakfast-in-bed.jpg", pos: "50% 50%" }] },
  cards: [
    { from: 158, to: 234, place: "Laceby, Lincolnshire", name: "Oaklands Hall Hotel", offer: "Save 18%" },
    { from: 236, to: 312, place: "Skipton, North Yorkshire", name: "Skipton Hotel", offer: "Save 20%" },
    { from: 314, to: 390, place: "Gomersal, West Yorkshire", name: "Gomersal Park\nHotel & Spa", offer: "Save 20%" },
    { from: 392, to: 468, place: "Wakefield, West Yorkshire", name: "Waterton Park\nHotel & Spa", offer: "Save 20%" },
    { from: 470, to: 546, place: "Halifax, West Yorkshire", name: "Holdsworth House Hotel", offer: "Save 10%" },
  ],
  lines: [],
  deepScrim: true,
  snap: { beat: 19.500, kicks: [] },
  endCard: { at: 546, eyebrow: "Black Friday Sale", line: "Save up to 20%", quick: true },
  music: {
    src: "hotels/dalmahoy/leva-eternity.mp3",
    startAt: 55,
    gain: 0.8,
    seconds: 40,
    fadeOut: 45,
  },
};
