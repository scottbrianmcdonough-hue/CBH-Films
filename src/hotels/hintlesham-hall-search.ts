import type { SearchSpec } from "../hotel-film/search/types";

// Hintlesham Hall Hotel, Hintlesham, Suffolk: a foodie "search" reel (the Hardwick Hall
// pattern). The query types into a CBH-styled search bar; the answer is the hall, then
// Carrier Restaurant, an autumn main and a pudding, each lighting up the part of the
// query it answers.
// Facts, from the Hintlesham Hall CBH page (pasted by Scott, 11 Oct 2026):
// - "This Grade I Listed manor, dating to the 1400s" (the Georgian façade photo)
// - "AA 2 Rosette award / Carrier Restaurant" (Scott: "Carrier Restaurant", not possessive)
// - "Suffolk's finest produce and coastal catches ... cooked with great skill and care"
// Captions name no dish: the autumn main (meat, blackberries, greens, with a red) carries
// "Suffolk's finest produce"; the pudding gets a line with no claim. The fish plate was
// dropped (Scott: it read as an egg dish), and the façade holds longer so its caption
// registers.
// Photos: the hotel's CBH gallery, supplied by Scott. The garden pond, parkland and
// bedroom shots are spare.
//
// Music: "Smooth Soul" by NverAvetyanMusic (Pixabay), the Plate to Pillow B track (Scott
// has since reworked Plate to Pillow): 60 BPM with a shuffle feel, a beat every ~30.2
// frames, the same window as Plate to Pillow B (from the bar downbeat at 59.51s, no lead
// line). Bar downbeats from frame 0: 0, 121, 241, 361, 483, 606, 727, 847, 968.

const P = "hotels/hintlesham-hall";
const music = (fadeFrom: number) => ({
  src: "campaigns/plate-to-pillow/smooth-soul.mp3",
  trimmedSeconds: 35,
  startAt: 45,
  gain: 0.72,
  fadeFrom,
});

const query: SearchSpec["query"] = [
  { text: "Fine dining", match: 0 },
  { text: " in a\n" },
  { text: "Suffolk country manor", match: 1 },
];

const facade = {
  src: `${P}/facade.jpg`,
  x: 48, // the portico, framed by the blossom
  match: 1,
  caption: {
    eyebrow: "Top result",
    lines: ["Hintlesham Hall Hotel"],
    small: "Grade I listed, dating to the 1400s",
  },
};

const carriers = {
  src: `${P}/carriers-restaurant.jpg`,
  x: 53, // the doors between the columns, the chandelier above
  match: 0,
  caption: { eyebrow: "Carrier Restaurant", lines: ["Two AA Rosettes"] },
};

const autumnMain = {
  src: `${P}/autumn-main.jpg`,
  x: 45, // the plate, the glass of red at the edge
  match: 0,
  caption: {
    eyebrow: "Pass the red", // the glass at the edge of the frame
    lines: ["Suffolk's", "finest produce"],
  },
};

const dessert = {
  src: `${P}/dessert.jpg`,
  match: 0,
  caption: { eyebrow: "Save room", lines: ["Then there's", "pudding"] },
};

const endCard = {
  lines: ["Hintlesham Hall Hotel"],
  location: "Hintlesham, Suffolk",
};

const watermark = {
  src: "brand/cb-watermark.png",
  size: [100, 108] as [number, number],
  x: 920,
  y: 1452,
};

// Full film, 32.3s: the query over two bars, the hall for six beats so its caption
// registers, four beats per plate, the end card for six.
export const hintleshamHallSearch: SearchSpec = {
  id: "hintlesham-hall-search",
  music: music(847), // fade over the last four beats
  query,
  typeFrom: 18,
  typeTo: 120,
  cuts: [241, 423, 544, 666, 787], // beats 8, 14, 18, 22, 26
  durationInFrames: 968, // beat 32
  crossfade: 20,
  shots: [facade, carriers, autumnMain, dessert],
  endCard,
  watermark,
};

// Stories cut, 14.1s: the query, the hall, the autumn main, the end card.
export const hintleshamHallSearchStory: SearchSpec = {
  id: "hintlesham-hall-search-story",
  music: music(361), // fade over the last two beats
  query,
  typeFrom: 10,
  typeTo: 72,
  cuts: [121, 241, 331], // beats 4, 8, 11: the hall holds a full bar
  durationInFrames: 423, // beat 14
  crossfade: 20,
  shots: [facade, autumnMain],
  endCard,
  watermark,
};
