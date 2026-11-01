import type { SearchSpec } from "../hotel-film/search/types";

// Hardwick Hall Hotel, Sedgefield, County Durham: a "search" reel for the foodie push. The
// hook is a CBH-styled search bar (never a real search engine's or assistant's look, and
// no claim that any AI recommended the hotel) typing a foodie query; the answer is the
// hotel, each shot lighting up the part of the query it answers.
// Facts, from the Hardwick Hall CBH page (as verified for the Cosy Escapes flipbook): the
// Rib Room is the hotel's award-winning steakhouse; steaks are the house speciality, cuts
// of fine Durham beef matured for 28 to 32 days; the Gourmet Break is live. The plate is
// the CBH gallery's lamb, so its caption names no dish, only what the photo shows (a plate
// and a glass of red).
// Photos: the CBH gallery shots already in the repo (the Rib Room from the flipbook, the
// plate from Plate to Pillow). More food shots (a steak above all) would strengthen it.
//
// Music: "Soul Retro Groove" (AlexGuz, Pixabay, ~92.3 BPM, a beat every ~19.65 frames),
// kept by Scott (11 Oct 2026; Plate to Pillow has since changed, so no clash). Same window as Plate to Pillow
// (from the bar downbeat at 92.16s, no lead line); downbeats every 4 beats from frame 0:
// 0, 79, 157, 236, 314, 393, 472, 550, 629.

const P = "campaigns";
const music = (fadeFrom: number) => ({
  src: `${P}/plate-to-pillow/soul-retro-groove.mp3`,
  trimmedSeconds: 40,
  startAt: 65,
  gain: 0.76,
  fadeFrom,
});

const query: SearchSpec["query"] = [
  { text: "County Durham steakhouse", match: 0 },
  { text: "\n" },
  { text: "with a good red", match: 1 },
];

const ribRoom = {
  src: `${P}/cosy-escapes/page3-hardwick-rib-room.jpg`,
  x: 58, // down the room to the panelled booths
  match: 0,
  caption: {
    eyebrow: "Top result",
    lines: ["The Rib Room,", "Hardwick Hall"],
    small: "Award-winning steakhouse",
  },
};

const plate = {
  src: `${P}/plate-to-pillow/hardwick-plate.jpg`,
  // Wider than 9:16 can hold: a slow pan from the plate across to the glass of red.
  pan: [44, 78] as [number, number],
  match: 1,
  caption: {
    eyebrow: "Say when",
    lines: ["Pull up a chair,", "the red's poured"],
  },
};

const endCard = {
  lines: ["Hardwick Hall Hotel"],
  location: "Sedgefield, County Durham",
};

const watermark = {
  src: "brand/cb-watermark.png",
  size: [100, 108] as [number, number],
  x: 920,
  y: 1452,
};

// Full film, 21s: the query over two bars, two bars per answer, the end card on bar 6.
export const hardwickHallSearch: SearchSpec = {
  id: "hardwick-hall-search",
  music: music(550), // fade over the last bar
  query,
  typeFrom: 14,
  typeTo: 100,
  cuts: [157, 314, 472],
  durationInFrames: 629, // bar 8, 21.0s
  crossfade: 20,
  shots: [ribRoom, plate],
  endCard,
  watermark,
  eyebrowRule: false, // rendered before the underline became the default (Story scheduled)
};

// Stories cut, 14.4s: the same query typed a little quicker, then the answer.
export const hardwickHallSearchStory: SearchSpec = {
  id: "hardwick-hall-search-story",
  music: music(393), // fade over the last bar
  query,
  typeFrom: 10,
  typeTo: 76,
  cuts: [118, 236, 314], // beats 6, 12, 16
  durationInFrames: 432, // beat 22, 14.4s
  crossfade: 20,
  shots: [ribRoom, plate],
  endCard,
  watermark,
  eyebrowRule: false, // rendered before the underline became the default (Story scheduled)
};
