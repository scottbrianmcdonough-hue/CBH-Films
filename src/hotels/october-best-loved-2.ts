import type { FootageSpec } from "../hotel-film/footage/types";

// October Best Loved 2: the same six Linktree offers as `october-best-loved`, the same
// spec (hook, one calm block per hotel, one 0.8s crossfade, barely-there pushes on stills,
// the CB mark at the grid-safe reel spec, the link-in-bio end card, silent), on fresh
// footage: nothing from the first reel.
//
// Footage (audio stripped, 1080x1920, 30fps):
// - Fairlawns (Reel Bank phone clips, GPS Aldridge): the chef garnishing a dish outdoors
//   (IMG_7623) under the hook; the slow pan across the copper bath (IMG_7620), slowed to
//   0.83x with motion-interpolated frames so it holds the block. Left out: the hot tub
//   (IMG_7504, purple LED light that fights the black and gold) and the pool (IMG_7358,
//   kept in reserve).
// - Ruthin Castle: the hotel's own "A beautiful day at the Castle..." post, 720x1280, cut
//   every second, no text burned in. Two of its one-second shots, upscaled and slowed to
//   0.33x with motion-interpolated frames (minterpolate mci) so each can carry a
//   crossfade: the sumac flaring red and gold against the castle ruins (1.1s), then the
//   sunlit outdoor hot tub (12.1s).
// Stand-ins until their files arrive (none of them used in the first reel): The Kingfisher's
// aperitivo still (its Reel Bank clips IMG_6941 and copy_68BF2FE2 haven't come through),
// the Holdsworth breakfast-in-bed still (its four 20260527 clips haven't come through).
// Wildes Inns and Haycock Manor still use the first reel's plates until new stills arrive.

const F = "hotels/fairlawns";
const RC = "hotels/ruthin-castle";
const MC = "campaigns/foodie-match-cut";
const PUSH = 0.06;

export const octoberBestLoved2: FootageSpec = {
  id: "october-best-loved-2",
  // Hook 2.8s, a hotel every ~3.7s (Ruthin's two shots 3.6s), the end card 3.6s.
  cuts: [84, 194, 248, 302, 412, 522, 632, 742],
  durationInFrames: 850, // 28.3s
  crossfade: 24, // 0.8s, the one transition
  endFade: 24,
  shots: [
    // 0. Cold open: the chef garnishing outdoors (Fairlawns).
    { kind: "video", src: `${F}/chef-outdoors.mp4`, from: 3.5 },
    // 1. Fairlawns: the copper bath.
    { kind: "video", src: `${F}/copper-bath.mp4`, from: 0 },
    // 2-3. Ruthin Castle: the sumac and the ruins, then the hot tub.
    { kind: "video", src: `${RC}/sumac-and-ruins.mp4`, from: 0 },
    { kind: "video", src: `${RC}/hot-tub.mp4`, from: 0 },
    // 4. The Kingfisher (stand-in): aperitivo on the terrace.
    {
      kind: "still",
      src: "hotels/the-kingfisher/aperitivo.jpg",
      size: [1334, 2000],
      crop: { cx: 667 },
      drift: PUSH,
    },
    // 5. Wildes Inns (the first reel's plate, until a new still arrives).
    {
      kind: "still",
      src: `${MC}/wildes-inns.jpg`,
      size: [1427, 2000],
      crop: { cx: 713 },
      drift: PUSH,
    },
    // 6. Holdsworth House (stand-in): breakfast in bed.
    {
      kind: "still",
      src: "hotels/holdsworth-house/breakfast-in-bed.jpg",
      size: [1920, 1080],
      crop: { cx: 960 },
      drift: PUSH,
    },
    // 7. Haycock Manor (the first reel's plate, until a new still arrives).
    {
      kind: "still",
      src: `${MC}/haycock-manor.jpg`,
      size: [1500, 2000],
      crop: { cx: 735, cy: 1200, h: 1600 },
      drift: PUSH,
    },
  ],
  hook: { eyebrow: "October's", headline: "Best Loved" },
  offers: [
    {
      shots: [1, 1],
      name: "Fairlawns",
      place: "Aldridge",
      offer: "Autumn Escape",
    },
    {
      shots: [2, 3],
      name: "Ruthin Castle",
      place: "Ruthin",
      offer: "Rasul & Relax Spa Break",
    },
    {
      shots: [4, 4],
      name: "The Kingfisher",
      place: "Bedford",
      offer: "Foodie Break",
    },
    {
      shots: [5, 5],
      name: "Wildes Inns",
      place: "Chesterfield",
      offer: "Stay & Dine",
    },
    {
      shots: [6, 6],
      name: "Holdsworth House",
      place: "Halifax",
      offer: "Seasonal Stay",
    },
    {
      shots: [7, 7],
      name: "Haycock Manor",
      place: "Wansford",
      offer: "Dinner, Bed & Breakfast",
    },
  ],
  endCard: {
    lines: ["Find them all"],
    location: "Link in bio",
    logo: "cb-shimmer",
    rule: false,
  },
  watermark: {
    src: "brand/cb-watermark.png",
    size: [100, 108],
    x: 920,
    y: 1452,
  },
};
