import type { RippleSpec } from "../hotel-film/ripple/types";

// The Imperial Hotel, Llandudno: a Black Friday spotlight (Scotland & Wales), 4:5 for the feeds, built as Gomersal Park's
// and The Kingfisher's: the hotel's photos (Scott pulled the new ones from the CBH site, 10 Nov) as slow pushes, a cut
// every two bars, the lines one stay by the sea from the front door to breakfast in bed, the end card its offer ("Save
// up to 30%", the live page).
// Music: Funky Summer House (BerryDeep, Pixabay 565437; Scott, 10 Nov, first use), 123 BPM, a bar every 59.2 frames,
// from 11.77s: the entrance over the last two bars of the intro, the bass in on the cut to the bar (15.68s), the end card
// on the phrase eight bars on (31.47s).
export const imperialSpotlight: RippleSpec = {
  id: "imperial-spotlight",
  picture: "campaigns/imperial-spotlight/picture.mp4",
  frames: 710,
  feed: true,
  label: { eyebrow: "", name: "The Imperial Hotel", from: 8, to: 60 },
  lines: [
    { text: "The sea\nat the front door", from: 64, to: 109 },
    { text: "First,\na long pink gin", from: 121, to: 228 },
    { text: "Then a window\nonto the bay", from: 240, to: 346 },
    { text: "A table for two\nas the day ends", from: 358, to: 464 },
    { text: "And breakfast,\nserved in bed", from: 476, to: 582 },
  ],
  deepScrim: true,
  endCard: {
    at: 592,
    eyebrow: "Black Friday Sale",
    line: "Save up to 30%,\nby the sea",
    quick: true,
  },
  music: {
    src: "music/berrydeep-funky-summer-house-565437.mp3",
    startAt: 353,
    gain: 0.58,
    seconds: 141,
    fadeOut: 45,
  },
};
