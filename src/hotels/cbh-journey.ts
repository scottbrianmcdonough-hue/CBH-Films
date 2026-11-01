import type { JourneyShot, JourneySpec } from "../hotel-film/journey/types";
import map from "../hotel-film/journey/map-cbh.json";

// Classic British Hotels journey reel (Scott: "needs to wow me", "music video style", "try
// the map and particle effects", then "not all, pick something original we can use", "no
// beat pulse"). One original move: a gold thread travels a dark map of Britain from
// Dartmoor to Pitlochry, and on each downbeat a hotel opens out of its pin. Twenty-one hotels,
// one bar each, in travelling order (south-west, the south coast, the Midlands, Wales, the
// north, Scotland). Minimal text: "From Dartmoor / to Pitlochry" over the map (Ilsington
// sits in Dartmoor National Park; Atholl Palace in Pitlochry is the collection's most
// northerly hotel and where the thread ends, Scott), then only a
// small name and place per hotel. To close, the thread carries on past the last hotel
// to Atholl Palace in Pitlochry (the last stop since 14 Oct, its own shot), where its head
// bursts and sparks fly to the rest of the collection (extras-cbh.json: 37 more hotels,
// each on classicbritishhotels.com/hotels/ or in its Crest Hotels Group news, found by web search on
// 10 Oct 2026 as the site itself is blocked here; Gonville (Scott: out) and Maids Head
// (leaving) left off; Castle Inn, Bassenthwaite, added by Scott; town-level pins), lighting
// the map; then the head becomes the logo. Never state a count. The Kingfisher is its sunny aperitivo shot (Scott's pick
// over the fireside, which ran into Langshott's fireside tea).
//
// Map: Natural Earth 1:10m coastlines (world-atlas, public domain), projected by
// scripts/britain-map.mjs from src/hotel-film/journey/stops-cbh.json. Pins sit at each
// hotel's town (approximate: a stylised map, not navigation). Footage where there is
// some: the Oakley Hall cavapoo (from 8.5s, running at the camera), the Rutland Hall spa
// baths (CBH Reel Bank), the Fairlawns plating and the Holdsworth House parterre; the rest
// are the CBH-site stills used in earlier reels, with their agreed crops. Names and places
// as recorded in those specs from the hotels' CBH pages.
//
// Music: "Luxury" by Sub_Clair (Pixabay Content License), the showcase's stretch: from the
// drop (100.2s) to the track's own end, a bar every 2.0896s (62.69 frames). Two bars of map
// (the coastline draws, the pins pop, the camera dives to Dartmoor), then a hotel per bar
// on its downbeat: the groove under the south and the Midlands, the outro's quieter bars
// under the north and Scotland; the pull-back and logo land in the last bars as the track
// fades out.

const P = "campaigns/showcase";

const still = (
  src: string,
  size: [number, number],
  cx: number,
  h?: number,
  cy?: number,
): JourneyShot => ({ kind: "photo", src, size, crop: { cx, h, cy } });
const clip = (src: string, from: number, rate?: number): JourneyShot => ({
  kind: "video",
  src,
  from,
  rate,
});

export const cbhJourney: JourneySpec = {
  id: "cbh-journey",
  music: {
    src: `${P}/luxury-outro.mp3`,
    trimmedSeconds: 60.6,
    startAt: 306, // 100.2s: the drop
    gain: 0.47, // the groove now runs to the end: 0.6 came out -13.7 LUFS, peaking over 0 dB
    fadeIn: 2,
    // Scott, 1 Nov: the ending "loses energy right at the light logo bloom": it sat on the
    // track's thinning outro. On the film's own grid (frame 0 is the drop, file 10.2s, a
    // downbeat; a beat is 15.65 frames), cut on bars: from beat 64 the groove runs on (file
    // 22.72s, 16 bars after the drop) through Atholl Palace; from beat 84, as the camera pulls
    // back, the two-bar breakdown before the drop (file 6.03s), running on into the drop
    // itself on beat 92 (frame 1440), where the lights' CB goes solid (they lift three beats
    // before, `endAt`); the groove then fades under the logo.
    edits: [
      { at: 1002, from: 22.733 },
      { at: 1315, from: 6.04 },
    ],
    fadeFrom: 1497, // as the full logo comes up
  },
  // 50.1s: the lights ending (8.7 beats from the lift) plays out as the track decays
  durationInFrames: 1560, // 52s: the groove fading out under the logo
  map,
  intro: { lines: ["From Dartmoor", "to Pitlochry"], dive: 92 },
  // The downbeats of bars 50 to 56, then the middle run (Whittlebury to Ruthin) quicker,
  // a stop every three beats (Scott: the middle dragged), back to a bar each from Whitley
  // Hall; the film ends two bars before the track does, the music fading over the last bar.
  lands: [
    126, 189, 251, 314, 377, 439, 502, 549, 596, 643, 690, 737, 784, 831, 878,
    941, 1004, 1066, 1129, 1192, 1255,
  ],
  travel: 15, // the thread moves a touch quicker between pins
  zoom: 2.6,
  push: 1.06,
  stops: [
    {
      // Ilsington's own drone shot of the hotel in Dartmoor (Scott, 13 Oct; the plate was in
      // AA Rosettes), 0-2.85s of its "Whole hotel" video, laid at 30fps (0.8x).
      shot: clip("hotels/ilsington/aerial-dartmoor.mp4", 0),
      tag: {
        name: "Ilsington Country House Hotel",
        place: "Dartmoor National Park, Devon",
      },
    },
    {
      // The Verderers' dining room (new, Scott 13 Oct; the walk was in Cosy Escapes).
      shot: still(
        "campaigns/journey-new/speech-house-verderers.jpg",
        [1920, 1278],
        900,
      ),
      tag: { name: "Speech House Hotel", place: "Forest of Dean" },
    },
    {
      // A picnic on the lawn among the topiary (CBH site, Scott 13 Oct; the tomatoes didn't
      // inspire, the dog clip was in the Oakley Hall Story).
      shot: still(
        "campaigns/journey-new/oakley-hall-picnic.jpg",
        [1920, 1280],
        1000,
      ),
      tag: { name: "Oakley Hall Hotel", place: "Hampshire" },
    },
    {
      shot: still(`${P}/alfriston.jpg`, [1920, 1280], 905, 1060, 700),
      tag: { name: "The Alfriston", place: "East Sussex" },
    },
    {
      // The Moët & Chandon champagne bar under its ring of glasses (CBH site, Scott 13 Oct;
      // the Hythe film showed the bar from another angle).
      shot: still(
        "campaigns/journey-new/hythe-moet-bar.jpg",
        [1920, 1519],
        960,
        900, // the ring of glasses up top, the Moët sign below the label
        480,
      ),
      tag: { name: "Hythe Imperial Hotel, Golf & Spa", place: "Hythe, Kent" },
    },
    {
      // The house across the knot garden, framed by leaves (new, Scott 13 Oct; the fireside
      // tea was in Cosy Escapes).
      shot: still(
        "campaigns/journey-new/langshott-garden-leaves.jpg",
        [1920, 1280],
        1000,
      ),
      tag: { name: "Langshott Manor", place: "Surrey" },
    },
    {
      // Tea poured at the table (its own "Interior" clip, 9.7-10.95s, slowed 0.6x; Scott 13
      // Oct: the aperitivo was in The Kingfisher film).
      shot: clip("hotels/the-kingfisher/tea-pour.mp4", 0),
      tag: { name: "The Kingfisher", place: "Bedford" },
    },
    {
      // A toast at the bar among the Silverstone memorabilia (CBH site, Scott 13 Oct; the
      // Murrays dish was in the Whittlebury films).
      shot: still(
        "campaigns/journey-new/whittlebury-silverstone-bar.jpg",
        [1920, 1280],
        1080,
      ),
      tag: { name: "Whittlebury Park", place: "Northamptonshire" },
    },
    {
      // The stone courtyard (new, Scott 13 Oct; the plate was in Best Loved and AA Rosettes).
      shot: still(
        "campaigns/journey-new/haycock-courtyard.jpg",
        [1500, 1000],
        600,
      ),
      tag: { name: "Haycock Manor Hotel", place: "Wansford" },
    },
    {
      shot: clip("hotels/rutland-hall/spa-baths.mp4", 0),
      tag: { name: "Rutland Hall Hotel & Spa", place: "Rutland Water" },
    },
    {
      shot: still(`${P}/nailcote-magnolia.jpg`, [1920, 1281], 1180),
      tag: { name: "Nailcote Hall", place: "Warwickshire" },
    },
    {
      // Two cocktails raised over the terrace table (Scott's IMG_4203, GPS Aldridge; the
      // plating was in Fairlawns Stay & Dine).
      shot: clip("hotels/fairlawns/cocktail-cheers.mp4", 0.3),
      tag: { name: "Fairlawns Hotel & Spa", place: "Aldridge" },
    },
    {
      shot: still(`${P}/prince-rupert.jpg`, [1331, 2000], 535, 1900, 1000),
      tag: { name: "Prince Rupert Hotel", place: "Shrewsbury" },
    },
    {
      // A peacock on the old castle wall, the castle behind (new, Scott 13 Oct; the castle
      // photo was in the Ruthin sketch Story).
      shot: still(
        "campaigns/journey-new/ruthin-castle-peacock.jpg",
        [1500, 1000],
        900,
      ),
      tag: { name: "Ruthin Castle Hotel & Spa", place: "Ruthin, North Wales" },
    },
    {
      // The ivy-covered house across its courtyard (new, Scott 13 Oct; the four-poster was in
      // Cosy Escapes).
      shot: still(
        "campaigns/journey-new/whitley-hall-courtyard.jpg",
        [1500, 1000],
        750,
      ),
      tag: { name: "Whitley Hall Country House Hotel", place: "Sheffield" },
    },
    {
      // The garden walk to the house (Scott's clip 20260527_120749, 1.6-5.2s; the parterre
      // was in Best Loved).
      shot: clip("hotels/holdsworth-house/garden-walk.mp4", 0),
      tag: { name: "Holdsworth House Hotel", place: "Halifax, West Yorkshire" },
    },
    {
      // Gravy poured into the bone marrow on the pie (its own lager post, 30-33.2s; the
      // wide shot was in AA Rosettes).
      shot: clip("hotels/wild-boar/gravy-pour.mp4", 0),
      tag: { name: "Wild Boar Estate", place: "Lake District National Park" },
    },
    {
      shot: still(`${P}/hardwick-premier.jpg`, [1920, 1262], 870),
      tag: { name: "Hardwick Hall Hotel", place: "Sedgefield, County Durham" },
    },
    {
      shot: still(`${P}/gisborough-exterior.jpg`, [1500, 1120], 750),
      tag: { name: "Gisborough Hall", place: "North Yorkshire" },
    },
    {
      shot: still(
        "campaigns/black-friday/dalmahoy-golf.jpg",
        [1920, 1439],
        760,
      ),
      tag: { name: "Dalmahoy Hotel & Country Club", place: "Edinburgh" },
    },
    {
      // The finale (Scott, 14 Oct: "last shot should be Atholl Palace in Pitlochry"): the
      // turrets under the snow-capped hills, where the thread ends (CBH site photo).
      shot: still(
        "campaigns/journey-new/atholl-palace-mountains.webp",
        [1920, 1182],
        500,
      ),
      tag: { name: "Atholl Palace Hotel", place: "Pitlochry, Perthshire" },
    },
  ],
  pullBack: 1302, // three beats on Atholl Palace, then it folds back as the camera pulls out
  // The thread ends at Atholl Palace (Pitlochry), the last stop, and its head bursts:
  // sparks fly out to every other hotel in the collection and light their pins (Scott:
  // "it still looks like only 20... like there's more"); then the head becomes the logo
  // (Scott: "the gold pin morphs to the CB logo"); then (21 Oct: "the CBH lights from the
  // map, not just the logo floating up") every lit pin lifts off the map and flies into the
  // CB, the pins-to-cb finale (LightsToCB.tsx). No words, no address.
  scatter: 1362,
  endAt: 1393, // on the beat, three before the drop (the CB goes solid three beats after the lift)
  beat: 15.65, // Luxury, 0.5217s

  watermark: {
    src: "brand/cb-watermark.png",
    size: [100, 108],
    x: 920,
    y: 1452,
  },
};

// The Stories cut (15s): the same map, line and thread through every hotel's pin (Scott: a
// five-pin map lacked the thread winding through several places). Four shots open, a bar
// apart, with a full second of map between each so the thread is seen winding through the
// pins it passes, lighting each one: Ilsington (Dartmoor); on through Speech House, Oakley,
// Alfriston, Hythe, Langshott and The Kingfisher to Whittlebury Park; through Haycock,
// Rutland, Nailcote, Fairlawns and Prince Rupert to Ruthin Castle; through Whitley Hall and
// Holdsworth, Wild Boar, Hardwick, Gisborough and Dalmahoy to Atholl Palace in Pitlochry
// (the reel's finale too); then the camera pulls back, the burst lights the rest of the
// collection, and the logo.
const STORY_PINS = [0, 7, 13, 20];

export const cbhJourneyStory: JourneySpec = {
  ...cbhJourney,
  id: "cbh-journey-story",
  // The same ending as the reel (Scott, 1 Nov: "and the Story version"): from beat 20, as the
  // camera pulls back, the two-bar breakdown before the drop (file 6.03s), into the drop on
  // beat 28 (frame 438), where the lights' CB goes solid; the groove fades under the logo.
  music: {
    ...cbhJourney.music,
    gain: 0.51, // -15.5 LUFS
    edits: [{ at: 313, from: 6.027 }],
    fadeFrom: 500,
  },
  durationInFrames: 545, // 18.2s
  intro: { ...cbhJourney.intro, dive: 55 },
  // A bar apart, on the reel's beat grid.
  lands: [79, 142, 204, 267],
  travel: 30, // a full second of the thread winding through the map between shots
  stops: STORY_PINS.map((p) => cbhJourney.stops[p]),
  stopPins: STORY_PINS,
  pullBack: 314,
  scatter: 361,
  endAt: 391, // beat 25, three before the drop
};

// The 35s cut (Scott, 1 Nov: "maybe 52 seconds is too long", "do the 35s cut, you pick"): the
// thread still winds through all 21 pins, but only 12 open a shot, a bar each, spread from
// Dartmoor to Pitlochry with footage and stills mixed: Ilsington's drone, Hythe's Moët bar,
// Langshott's autumn garden, the Kingfisher's tea pour, Rutland's spa, Fairlawns' cocktails,
// Ruthin's peacock, Holdsworth's garden walk, Wild Boar's gravy, Gisborough, Dalmahoy and
// Atholl Palace. Lands on beats 5, 9 ... 49 (as the Story), the pull back and the breakdown on
// beat 52, the lift on 57 and the drop on 60 under the solid CB, the groove fading after.
const SHORT_PINS = [0, 4, 5, 6, 9, 11, 13, 15, 16, 18, 19, 20];
const onBeat = (n: number) => Math.round(n * 15.65);

export const cbhJourneyShort: JourneySpec = {
  ...cbhJourney,
  id: "cbh-journey-short",
  music: {
    ...cbhJourney.music,
    edits: [{ at: onBeat(52), from: 6.034 }],
    fadeFrom: onBeat(57) + 104,
  },
  durationInFrames: onBeat(57) + 167, // 35.3s
  intro: { ...cbhJourney.intro, dive: 55 },
  lands: SHORT_PINS.map((_, i) => onBeat(5 + 4 * i)),
  travel: 24, // time for the thread to wind through the pins between
  stops: SHORT_PINS.map((p) => cbhJourney.stops[p]),
  stopPins: SHORT_PINS,
  pullBack: onBeat(52),
  scatter: onBeat(57) - 31,
  endAt: onBeat(57),
};
