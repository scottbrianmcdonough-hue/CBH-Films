import { aim, type CraftShot, type CraftSpec } from "../hotel-film/craft/types";

// Classic British Hotels craft reel (Scott: "do some craft this time": simple cuts, done
// well; then "there's no theme": so it runs on a clock, one day across the collection,
// morning to morning). Breakfast at 08:00 opens it and breakfast in bed at 08:00 the next
// day closes it ("Same time tomorrow?"); a clock rolls on at every cut. Every cut that can
// be is a match:
// - 08:00 syrup at Dalmahoy, cut on the pour's accent to 10:00 on the striped lawn at The
//   Alfriston, then 11:00, Oakley Hall's dog on its lawn (colour), running at the camera
//   until it fills the frame (cut on the movement) to 13:00, hands plating at Fairlawns;
// - 16:00, afternoon tea by the fire at Langshott Manor; its flame cuts to a lantern at The
//   Kingfisher (18:30) on the same point, and the lantern's glow to the bright heart of
//   dinner at 19:30: three courses whose circles carry on in that place at the same size
//   (Prevost at Haycock Manor, Hythe Imperial, Speech House), each still pushing in around
//   the plate's centre to exactly the size the next one starts at;
// - the night passes on a carved bedpost held on one line through three four-posters
//   (Whitley Hall 23:00, Nailcote Hall 02:00, Gisborough Hall 05:00);
// - 08:00: breakfast in bed at Holdsworth House; then the CB logo.
// Feature positions measured on gridded crops of each source (plates' centres and widths,
// the fire, the lantern, the bedposts). Small names only; no claims beyond each hotel's
// name and place (as recorded in earlier specs from their CBH pages). Never a count.
//
// Music: "Smooth Soul" (Pixabay; from the on-hold Plate to Pillow B, never published),
// ~92 BPM, a beat every ~19.5 frames. Cuts on beats, quickening through dinner (two beats a
// course) and the night, slowing for breakfast. The brand card on beat 38; fade from beat
// 42 to the end on 46.

const SC = "campaigns/showcase";
const AA = "campaigns/aa-rosettes";

const PLATE: [number, number] = [530, 1240]; // where every circle sits on screen
const FIRE = PLATE; // the flame, the lantern and dinner's bright heart share one point
const POST: [number, number] = [880, 960]; // the bedpost's line

const tag = (name: string, place: string) => ({ name, place });

const shots: CraftShot[] = [
  {
    kind: "video",
    src: "hotels/dalmahoy/syrup-pour.mp4",
    from: 6.2,
    at: 0,
    time: "08:00",
    tag: tag("Dalmahoy Hotel & Country Club", "Edinburgh"),
  },
  {
    kind: "photo",
    src: `${SC}/alfriston.jpg`,
    size: [1920, 1280],
    crop: { cx: 905, h: 1060, cy: 700 },
    at: 76, // beat 4
    push: [1, 1.06],
    time: "10:00",
    tag: tag("The Alfriston", "East Sussex"),
  },
  {
    kind: "video",
    src: "hotels/oakley-hall/dog-on-the-lawn.mp4",
    from: 8.0,
    at: 136, // beat 7
    time: "11:00",
    tag: tag("Oakley Hall Hotel", "Hampshire"),
  },
  {
    kind: "video",
    src: "hotels/fairlawns/chef-plating.mp4",
    from: 0,
    at: 217, // beat 11
    time: "13:00",
    tag: tag("Fairlawns Hotel & Spa", "Walsall, West Midlands"),
  },
  {
    kind: "photo",
    src: `${SC}/langshott-fireside-tea.jpg`,
    size: [1920, 1280],
    crop: aim([1920, 1280], [955, 850, 100], [...FIRE, 180]),
    at: 276, // beat 14
    push: [1, 1.06],
    focus: FIRE,
    time: "16:00",
    tag: tag("Langshott Manor", "Surrey"),
  },
  {
    kind: "photo",
    src: "hotels/the-kingfisher/fireside.jpg",
    size: [1920, 1440],
    crop: aim([1920, 1440], [375, 870, 100], [...FIRE, 191]),
    at: 336, // beat 17
    push: [1, 1.05],
    focus: FIRE,
    time: "18:30",
    tag: tag("The Kingfisher", "Bedford"),
  },
  {
    // The food ring (830px across, centred 800,960); its white heart where the lantern glowed.
    kind: "photo",
    src: `${SC}/haycock-prevost.jpg`,
    size: [1500, 2000],
    crop: aim([1500, 2000], [800, 960, 830], [...PLATE, 1079]),
    at: 397, // beat 20
    push: [1, 1284 / 1079],
    focus: PLATE,
    time: "19:30",
    tag: tag("Haycock Manor Hotel", "Peterborough"),
  },
  {
    kind: "photo",
    src: `${AA}/hythe-plate.jpg`,
    size: [1920, 1822],
    crop: aim([1920, 1822], [980, 896, 917], [...PLATE, 1284]),
    at: 437, // beat 22
    push: [1, 1345 / 1284],
    focus: PLATE,
    time: "20:15",
    tag: tag("Hythe Imperial", "Hythe, Kent"),
  },
  {
    kind: "photo",
    src: `${AA}/speech-house-plate.jpg`,
    size: [1920, 1281],
    crop: aim([1920, 1281], [981, 704, 747], [...PLATE, 1345]),
    at: 478, // beat 24
    push: [1, 1.05],
    focus: PLATE,
    time: "21:00",
    tag: tag("Speech House Hotel", "Forest of Dean"),
  },
  {
    kind: "photo",
    src: `${SC}/whitley-peacock.jpg`,
    size: [1920, 1277],
    crop: aim([1920, 1277], [1535, 638.5, 100], [...POST, 150.4]),
    at: 518, // beat 26
    push: [1, 1.04],
    focus: POST,
    time: "23:00",
    tag: tag("Whitley Hall Country House Hotel", "Sheffield"),
  },
  {
    kind: "photo",
    src: `${SC}/nailcote-magnolia.jpg`,
    size: [1920, 1281],
    crop: aim([1920, 1281], [1285, 640.5, 100], [...POST, 156.4]),
    at: 559, // beat 28
    push: [1, 1.04],
    focus: POST,
    time: "02:00",
    tag: tag("Nailcote Hall", "Warwickshire"),
  },
  {
    kind: "photo",
    src: "campaigns/black-friday/gisborough-four-poster.jpg",
    size: [1920, 1260],
    crop: aim([1920, 1260], [1704, 630, 100], [...POST, 162.7]),
    at: 600, // beat 30
    push: [1, 1.04],
    focus: POST,
    time: "05:00",
    tag: tag("Gisborough Hall", "North Yorkshire"),
  },
  {
    kind: "photo",
    src: "hotels/holdsworth-house/breakfast-in-bed.jpg",
    size: [1920, 1080],
    crop: { cx: 960 },
    at: 661, // beat 33
    push: [1, 1.05],
    time: "08:00",
    tag: tag("Holdsworth House Hotel", "Halifax, West Yorkshire"),
  },
];

export const cbhCraft: CraftSpec = {
  id: "cbh-craft",
  music: {
    src: "campaigns/plate-to-pillow/smooth-soul.mp3",
    trimmedSeconds: 35,
    startAt: 0,
    gain: 0.78, // ~-14.4 LUFS
    fadeFrom: 832, // beat 42
  },
  durationInFrames: 912, // 30.4s, beat 46
  shots,
  endAt: 759, // beat 38: breakfast settles into black, then the logo
  endFade: 20,
  close: { line: "Same time tomorrow?", at: 691 }, // beat 34.5, once the clock has landed
  watermark: {
    src: "brand/cb-watermark.png",
    size: [100, 108],
    x: 920,
    y: 1452,
  },
};
