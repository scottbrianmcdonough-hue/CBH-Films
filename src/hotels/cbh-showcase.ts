import type { UnwrapShot, UnwrapSpec } from "../hotel-film/unwrap/types";

// Classic British Hotels showcase reel (Scott: "with everything you got", "we have so many
// other hotels", then "minimal text, visual led", "copy should complement visuals", no
// "unwind" and no cliches). Twenty hotels, one bar each, in four chapters: the way in
// (gardens, sea, castle, ivy, cobbles, lawns), the plates, baths and firesides and grounds,
// then the beds. The gold-ribbon unwrap (the Black Friday reel's move) turns each chapter;
// inside a chapter the hotels hard-cut on the downbeat. It opens straight on footage on the
// track's drop, no opening card. Text kept minimal: each shot carries only the hotel's name
// and place, small, and each chapter one short Cormorant line that plays off its pictures
// (held over its first two shots); the end card is the shimmering CBH logo and the address.
// Never state a hotel count.
//
// Real footage leads where there is some: the Holdsworth House parterre (Scott's gimbal
// clip, calmed for the Holdsworth reel; recovered from git history), the Fairlawns plating
// (0.9x to fill its bar) and the Dalmahoy syrup pour (the hotels' own clips), the Rutland
// Hall spa baths (CBH Reel Bank) and the Oakley Hall cavapoo (Scott's phone clip; from 8s,
// so it runs at the camera as the chapter turns). Stills are the CBH-site photos used in
// earlier reels (Hythe Imperial, Hotels with a History, AA Rosettes, Cosy Escapes, Plate
// to Pillow, Whittlebury Park, The Kingfisher), with the crops agreed there. Names and
// places as recorded in those specs from the hotels' CBH pages. Left out: Hintlesham Hall
// (its photo has lit Christmas trees), and Maids Head (leaving the collection).
//
// Music: "Luxury" by Sub_Clair (Pixabay Content License), reused at Scott's request from a
// later stretch than the Black Friday reel: the file is trimmed from 90s to the track's end
// and peak-limited (alimiter 0.8). The film starts on the drop (the kick at 100.21s) and
// runs bar by bar (a bar every 2.0896s, 62.69 frames): the groove under the first three
// chapters, its kick stopping at 133.1s as the beds arrive, so the last chapter and the end
// card sit in the track's own winding-down outro; the music fades over the last bar.

const P = "campaigns/showcase";

const still = (
  src: string,
  size: [number, number],
  cx: number,
  name: string,
  place: string,
  h?: number,
  cy?: number,
): UnwrapShot => ({
  kind: "photo",
  src: `${P}/${src}`,
  size,
  crop: { cx, h, cy },
  tag: { name, place },
});

const clip = (
  src: string,
  from: number,
  name: string,
  place: string,
  rate?: number,
): UnwrapShot => ({ kind: "video", src, from, rate, tag: { name, place } });

export const cbhShowcase: UnwrapSpec = {
  id: "cbh-showcase",
  music: {
    src: `${P}/luxury-outro.mp3`,
    trimmedSeconds: 60,
    startAt: 306, // 100.2s: the drop
    gain: 0.6,
    fadeIn: 2,
    fadeFrom: 1379, // bar 70: fade over the last bar
  },
  durationInFrames: 1442, // 48.1s, ends on the downbeat of bar 71
  ribbon: 18,
  peel: 30,
  push: 1.05,
  // Chapter turns on the downbeats of bars 54, 60 and 65; the end card on bar 68.
  lands: [376, 753, 1066, 1254],
  sections: [
    {
      // The way in: bars 48-53.
      line: { text: ["Before you've even", "found your room"], until: 126 },
      shots: [
        clip(
          "hotels/holdsworth-house/parterre.mp4",
          2.0,
          "Holdsworth House Hotel",
          "Halifax, West Yorkshire",
        ),
        still(
          "hythe-aerial.webp",
          [1920, 1440],
          870,
          "Hythe Imperial",
          "Hythe, Kent",
        ),
        still(
          "ruthin-castle.jpg",
          [1920, 1080],
          450,
          "Ruthin Castle Hotel & Spa",
          "Ruthin, North Wales",
        ),
        still(
          "gisborough-exterior.jpg",
          [1500, 1120],
          750,
          "Gisborough Hall",
          "North Yorkshire",
        ),
        still(
          "prince-rupert.jpg",
          [1331, 2000],
          535,
          "Prince Rupert Hotel",
          "Shrewsbury",
          1900,
          1000,
        ),
        still(
          "alfriston.jpg",
          [1920, 1280],
          905,
          "The Alfriston",
          "East Sussex",
          1060,
          700,
        ),
      ],
      cuts: [63, 126, 188, 251, 314],
    },
    {
      // The plates: bars 54-59.
      line: { text: ["Plates worth", "staying for"], until: 502 },
      shots: [
        clip(
          "hotels/fairlawns/chef-plating.mp4",
          0,
          "Fairlawns Hotel & Spa",
          "Walsall, West Midlands",
          0.9,
        ),
        still(
          "haycock-prevost.jpg",
          [1500, 2000],
          750,
          "Haycock Manor Hotel",
          "Peterborough",
        ),
        still(
          "whittlebury-murrays.jpg",
          [1904, 1428],
          1150,
          "Whittlebury Park",
          "Northamptonshire",
        ),
        still(
          "ilsington-plate.jpg",
          [1920, 1280],
          900,
          "Ilsington Country House Hotel",
          "Dartmoor National Park, Devon",
        ),
        still(
          "wild-boar.jpg",
          [1080, 1920],
          540,
          "Wild Boar Estate",
          "Lake District National Park",
        ),
        clip(
          "hotels/dalmahoy/syrup-pour.mp4",
          6.2,
          "Dalmahoy Hotel & Country Club",
          "Edinburgh",
        ),
      ],
      cuts: [439, 502, 565, 627, 690],
    },
    {
      // Baths, firesides and grounds: bars 60-64.
      line: { text: ["Baths run,", "fires lit"], until: 878 },
      shots: [
        clip(
          "hotels/rutland-hall/spa-baths.mp4",
          0,
          "Rutland Hall Hotel & Spa",
          "Rutland Water",
        ),
        still(
          "langshott-fireside-tea.jpg",
          [1920, 1280],
          960,
          "Langshott Manor",
          "Surrey",
        ),
        still(
          "kingfisher-fireside.jpg",
          [1920, 1440],
          700,
          "The Kingfisher",
          "Bedford",
        ),
        still(
          "speech-house-walk.jpg",
          [1920, 1263],
          1000,
          "Speech House Hotel",
          "Forest of Dean",
        ),
        clip(
          "hotels/oakley-hall/dog-on-the-lawn.mp4",
          8.0,
          "Oakley Hall Hotel",
          "Hampshire",
        ),
      ],
      cuts: [815, 878, 941, 1003],
    },
    {
      // The beds, in the track's outro: bars 65-67.
      line: { text: ["Sleep on it"], until: 1191 },
      shots: [
        still(
          "whitley-peacock.jpg",
          [1920, 1277],
          1200,
          "Whitley Hall Country House Hotel",
          "Sheffield",
        ),
        still(
          "nailcote-magnolia.jpg",
          [1920, 1281],
          1180,
          "Nailcote Hall",
          "Warwickshire",
        ),
        still(
          "hardwick-premier.jpg",
          [1920, 1262],
          870,
          "Hardwick Hall Hotel",
          "Sedgefield, County Durham",
        ),
      ],
      cuts: [1129, 1191],
    },
  ],
  endAt: 1270, // as the last peel clears
  endCard: { lines: [], location: "classicbritishhotels.com" },
  watermark: {
    src: "brand/cb-watermark.png",
    size: [100, 108],
    x: 920,
    y: 1452,
  },
};
