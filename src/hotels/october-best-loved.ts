import type { FootageSpec } from "../hotel-film/footage/types";

// October Best Loved: the six hotels in the October "Best Loved" section of the CBH
// Linktree, each with its offer name exactly as Scott gave it (no prices, no inclusions,
// no other facts). Footage first: the cold open is the Fairlawns sauce pour with the hook,
// then one calm block per hotel (name, town in gold caps, a static gold rule, the offer
// name) over its one or two shots, the hotels alternating footage and stills so the reel
// never settles into a run of photos. One transition throughout (a 0.8s crossfade); every
// still gets the same barely-there centred push (1.00 -> 1.06); the CB mark sits at the
// grid-safe reel spec position; the end card sets the hook again with the link in bio, then the official
// CBH logo with the house shimmer on the CB.
//
// Two versions from one edit: `october-best-loved` with the funk baked in, and
// `october-best-loved-silent` for Instagram's trending "Hello October" sound (added in-app).
// Music: "Funk Music" by SigmaMusicArt (Pixabay, Content ID registered), ~103.4 BPM (a beat
// every ~17.4 frames), trimmed to its first 55s. No lead line anywhere (pyin on the
// 600-4000Hz band). The film plays 19.48-49.2s, steady groove from a bar downbeat: the
// bar before it carries a stop (silence 17.40-17.58s) that would sound like a glitch at
// the top of the reel; the deepest mid-range dip in the window is 6.6dB. Every cut lands
// on a measured beat and the music fades over the end card's last bar.
//
// Assets: footage from the repo (Fairlawns phone clips, the Holdsworth parterre) and The
// Kingfisher's Reel Bank phone clips (iPhone, Nov 2023, GPS 52.1256 N 0.4303 W, east
// Bedford): 4K 25fps, rotated upright, scaled to 1080x1920 and laid at 30fps one frame for
// one (a gentle 0.83x slow motion, no repeated frames), audio stripped. The tree, garland
// and stocking clips from the same shoot are left out (Christmas in an October reel), as is
// the fire close-up (a blurred object across the lens). Wildes Inns and Haycock Manor are
// stills supplied for earlier films from their CBH pages (a plate for Stay & Dine and for
// the Dinner, Bed & Breakfast). Ruthin Castle is a still (the outdoor hot tub) until its
// Reel Bank footage (Ruthin 1-4, Express Pamper) is attached.

const F = "hotels/fairlawns";
const MC = "campaigns/foodie-match-cut";
const K = "hotels/the-kingfisher";
const PUSH = 0.06;

export const octoberBestLoved: FootageSpec = {
  id: "october-best-loved",
  music: {
    src: "campaigns/october-best-loved/funk-music.mp3",
    trimmedSeconds: 55,
    startAt: 584, // 19.48s, a bar downbeat
    gain: 0.6, // ~-15 LUFS
    fadeFrom: 823, // beat 48: fade over the end card's last bar
  },
  // Beats 6, 12, 18, 22, 26, 32, 38, then the end card on beat 44 (a bar); ends on beat
  // 52 (a bar). Hook 3.4s, a hotel every 3.4s (The Kingfisher's two shots 4.6s), the end
  // card 4.6s.
  cuts: [103, 206, 309, 377, 446, 549, 652, 754],
  durationInFrames: 892, // 29.7s
  crossfade: 24, // 0.8s, the one transition
  endFade: 24, // the same 0.8s, into black, so the end card's line waits for it
  shots: [
    // 0. Cold open: the sauce poured over the asparagus (Fairlawns).
    { kind: "video", src: `${F}/sauce-pour.mp4`, from: 0.2 },
    // 1. Fairlawns: drinks raised across the table in the bar.
    { kind: "video", src: `${F}/afternoon-tea.mp4`, from: 0 },
    // 2. Ruthin Castle: the toast in the outdoor hot tub.
    {
      kind: "still",
      src: "campaigns/black-friday/ruthin-hot-tub.jpg",
      size: [1920, 1280],
      crop: { cx: 660 }, // her face and glass in frame
      drift: PUSH,
    },
    // 3-4. The Kingfisher (Reel Bank phone clips, GPS east Bedford): the slow turn over
    // the roast, from 2.1s once the Christmas tree sprig has left the corner, then the
    // pull-back from the dessert glasses to the log burner.
    { kind: "video", src: `${K}/roast.mp4`, from: 2.5 },
    { kind: "video", src: `${K}/dessert-by-the-fire.mp4`, from: 0.8 },
    // 5. Wildes Inns: a plate on the scrubbed table.
    {
      kind: "still",
      src: `${MC}/wildes-inns.jpg`,
      size: [1427, 2000],
      crop: { cx: 713 },
      drift: PUSH,
    },
    // 6. Holdsworth House: the walk along the parterre to the house.
    { kind: "video", src: "hotels/holdsworth-house/parterre.mp4", from: 0.1 },
    // 7. Haycock Manor: a plate from the restaurant.
    {
      kind: "still",
      src: `${MC}/haycock-manor.jpg`,
      size: [1500, 2000],
      crop: { cx: 735, cy: 1200, h: 1600 }, // the plate lifted off the text
      shade: 0.5, // a pale plate: darken the lower half so the label reads
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
      shots: [2, 2],
      name: "Ruthin Castle",
      place: "Ruthin",
      offer: "Rasul & Relax Spa Break",
    },
    {
      shots: [3, 4],
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
  // The end card sets the hook again: "October's Best Loved, link in bio" (Scott: "Find
  // them all" sounded like Pokemon), over the CBH logo with the shimmer on the CB.
  endCard: {
    lines: ["Best Loved"],
    title: { eyebrow: "October's" }, // no "Link in bio" or gold rule (Scott)
    logo: "cb-shimmer",
  },
  // Grid-safe reel spec: 100px wide, bottom edge at y=1560, 60px right margin.
  watermark: {
    src: "brand/cb-watermark.png",
    size: [100, 108],
    x: 920,
    y: 1452,
  },
};

// The same edit, silent, for the trending sound added in-app.
export const octoberBestLovedSilent: FootageSpec = {
  ...octoberBestLoved,
  id: "october-best-loved-silent",
  music: undefined,
};

// The Stories cut (15s, silent: Scott adds the trending sound in-app): the hook, then all six
// hotels in the reel's order, one shot each, rapid (1.6s each on a short 10-frame dissolve,
// Scott: "do all Best Loved rapid, don't leave any out"), each with its offer block, then
// the same end card.
const s = octoberBestLoved.shots;

export const octoberBestLovedStory: FootageSpec = {
  ...octoberBestLoved,
  id: "october-best-loved-story",
  music: undefined,
  crossfade: 10,
  endFade: 24,
  cuts: [60, 108, 156, 204, 252, 300, 348],
  durationInFrames: 450, // 15s
  // The logo wipes up with the title so it holds for over a second before the end.
  endCard: { ...octoberBestLoved.endCard!, logoDelay: 6 },
  // The hook, Fairlawns, Ruthin Castle, The Kingfisher (the roast), Wildes Inns,
  // Holdsworth House, Haycock Manor.
  shots: [s[0], s[1], s[2], s[3], s[5], s[6], s[7]],
  offers: octoberBestLoved.offers!.map((o, i) => ({
    ...o,
    shots: [i + 1, i + 1] as [number, number],
  })),
};
