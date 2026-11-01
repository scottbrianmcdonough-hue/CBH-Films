import type { FootageSpec } from "../hotel-film/footage/types";

// November Best Loved (Scott, 30 Oct): the six hotels in the CBH newsletter's Best Loved, each
// with its offer name as the newsletter gives it (no prices, as October). Kept light so it
// scrolls (Scott: "light on the funk and music", "remember the other Best Loved"): the hook,
// then one hotel a shot, the October title card at the end (no gold logo, the white CB stays).
// Photos from the CBH site (Scott's batches, 30 Oct); Forest of Arden is the AMC footage (the
// aerial), Rowton a frame of its Reel Bank bath clip.
// Music: "Inspiring Uplifting Indie Rock" by MusicForCreators (Pixabay 328509; no other film),
// 120 BPM (a beat every 15 frames), from 8.14s: its soft intro under the hook, the band
// building on the first hotel; kept low (Scott). A silent version for a trending sound in-app.

const N = "campaigns/november-best-loved";
const PUSH = 0.05;

export const novemberBestLoved: FootageSpec = {
  id: "november-best-loved",
  music: {
    src: "music/musicforcreators-inspiring-uplifting-indie-rock-328509.mp3",
    trimmedSeconds: 138,
    startAt: 244, // 8.14s, four beats before the band builds
    gain: 0.4, // low under the picture (Scott: "light on the music")
    fadeFrom: 660, // beat 44: fade over the end card
  },
  // Polish (Scott: "too many flash cuts", "get rid of the flags", "better crops", "longer hold on
  // the bath and read"): one calm shot a hotel, six beats each (3s, time to read the label),
  // Forest of Arden the aerial alone (five beats: the clip runs 3.2s), Rowton's bath held seven;
  // softer crossfades. Beats 4, 10, 16, 22, 27, 33, then the end card on 40; ends on 48.
  cuts: [60, 150, 240, 330, 405, 495, 600],
  durationInFrames: 720, // 24s
  crossfade: 16,
  endFade: 20,
  shots: [
    // 0. The hook over Hatherley Manor's fireplace and its log store.
    { kind: "still", src: `${N}/hatherley-manor/lounge-bar.jpg`, size: [1920, 1237], crop: { cx: 1250 }, drift: PUSH },
    // 1. Hatherley Manor: the candlelit spa relaxation room, the reader and the folded throw (the
    // newsletter's own shot, full size; framed on the reader).
    { kind: "still", src: `${N}/hatherley-manor/spa-relaxation-full.jpg`, size: [1920, 1281], crop: { cx: 800 }, drift: PUSH },
    // 2. Ramside Hall: the hydrotherapy pool under its dome (the newsletter's own shot, full size).
    { kind: "still", src: `${N}/ramside-hall/hydrotherapy-pool-full.jpg`, size: [1920, 1282], crop: { cx: 950 }, drift: PUSH },
    // 3. Frensham Pond: the spa pool under its warm lit ceiling (indoors for November, Scott: no summer shots).
    { kind: "still", src: `${N}/frensham-pond/spa-pool.jpg`, size: [1920, 1280], crop: { cx: 1000 }, drift: PUSH },
    // 4. Forest of Arden: the aerial over the course to the hotel (the flags left out).
    { kind: "video", src: `${N}/footage/forest-of-arden-aerial.mp4`, from: 0 },
    // 5. Donnington: guests in robes reading in the relaxation room (the newsletter's own shot, full size).
    { kind: "still", src: `${N}/donnington-valley/robes-reading.jpg`, size: [1334, 2000], crop: { cx: 700 }, drift: PUSH },
    // 6. Rowton Hall: the canopied junior suite, held on a slow push (romantic; the other slides have the pools).
    { kind: "video", src: `${N}/push/rowton-hall.mp4`, from: 0 }, // the push pre-rendered (scripts/still-push.py): no shimmer on the canopy's stripes
  ],
  hook: { eyebrow: "November's", headline: "Best Loved" },
  offersPlaceFirst: true,
  offers: [
    { shots: [1, 1], name: "Hatherley Manor\nHotel", place: "Cotswolds", offer: "A Cosy Night In" },
    { shots: [2, 2], name: "Ramside Hall Hotel,\nGolf & Spa", place: "Durham", offer: "Stay, Spa & Dine" },
    { shots: [3, 3], name: "Frensham Pond\nHotel & Spa", place: "Farnham", offer: "Bubbles & Bliss" },
    { shots: [4, 4], name: "Forest of Arden Hotel\n& Country Club", place: "Warwickshire", offer: "1 Night Golf Package" },
    { shots: [5, 5], name: "Donnington Hotel,\nSpa & Golf", place: "Newbury", offer: "Deluxe Spa & Stay" },
    { shots: [6, 6], name: "Rowton Hall\nHotel & Spa", place: "Chester", offer: "Romantic Spa Package" },
  ],
  endCard: {
    lines: ["Best Loved"],
    title: { eyebrow: "November's" },
    logo: false, // no gold logo (Scott: "no gold logo on this one either"): the white CB stays
  },
  watermark: { src: "brand/cb-watermark.png", size: [100, 108], x: 920, y: 1452 },
  watermarkOnEndCard: true,
};

export const novemberBestLovedSilent: FootageSpec = {
  ...novemberBestLoved,
  id: "november-best-loved-silent",
  music: undefined,
};

// The Stories cut (Scott, 30 Oct): the hook, all six hotels in the reel's order, one shot each
// for four beats (2s, time to read the label), then the same end card; the reel's track from the
// same point, so every cut stays on a beat. 17s.
const s = novemberBestLoved.shots;

export const novemberBestLovedStory: FootageSpec = {
  ...novemberBestLoved,
  id: "november-best-loved-story",
  music: { ...novemberBestLoved.music!, fadeFrom: 450 },
  crossfade: 12,
  cuts: [60, 120, 180, 240, 300, 360, 420],
  durationInFrames: 510, // 17s
  shots: s,
};

export const novemberBestLovedStorySilent: FootageSpec = {
  ...novemberBestLovedStory,
  id: "november-best-loved-story-silent",
  music: undefined,
};
