import type { FilmSpec, Hotel, SceneSpec } from "../hotel-film/types";

// Whittlebury Park "Stay & Dine" for the CBH Cosy Escapes campaign (from 10 Oct 2026),
// food and spa angle. Facts are from the CBH Whittlebury travel guide and the Stay & Dine
// offer (https://classicbritishhotels.com/?p=36267 and /offer-category/foodie-breaks/).
// Campaign rules: no price in the film; Murrays is "on the estate", never "in your
// package" (the offer's three-course dinner isn't said to be at Murrays); the spa is an
// extra, the Leisure Club is included. Shots run included-first (room, Leisure Club),
// then the extras (spa, Murrays), so nothing reads as part of the package that isn't.
//
// Music: "Food Cooking Music" by GR0ZA (~103 BPM), the track already licensed for the
// Whittlebury film, played from its first bar start (70 frames in) and turned down
// ~2.5dB to sit near -15 LUFS. Bar starts (scripts/analyze-beats.py), in film frames:
// 0, 69, 137, 205, 274, 342, 411, 480, 549, 617, 686, 754, 822, 891, 960, 1029, 1097.

const P = "hotels/whittlebury-park";

const hotel: Hotel = {
  name: "Whittlebury Park",
  subtitle: "Hotel, Spa & Golf Resort",
  location: "Northamptonshire",
};

const music = (fadeFrom: number) => ({
  src: `${P}/food-cooking-music.mp3`,
  trimmedSeconds: 50,
  startAt: 70,
  gain: 0.75,
  fadeFrom,
});

const sauna: SceneSpec = {
  kind: "photo",
  src: `${P}/salt-sauna.jpg`,
  from: { scale: 1.14, x: 30, y: 50 },
  to: { scale: 1.0, x: 38, y: 50 },
  eyebrow: "Cosy Escapes",
  lines: ["Whittlebury Park", "Stay & Dine"],
};

const suite: SceneSpec = {
  kind: "photo",
  src: `${P}/suite.jpg`,
  from: { scale: 1.0, x: 60, y: 50 },
  to: { scale: 1.12, x: 66, y: 50 },
  eyebrow: "Lights low, feet up",
  lines: ["Dinner, a room", "& breakfast in", "one booking"],
};

const pool: SceneSpec = {
  kind: "photo",
  src: `${P}/pool.jpg`,
  from: { scale: 1.12, x: 40, y: 50 },
  to: { scale: 1.0, x: 50, y: 50 },
  position: "top",
  eyebrow: "Leisure Club included",
  lines: ["Lengths in a", "19-metre pool", "before dinner"],
};

const spa: SceneSpec = {
  kind: "photo",
  src: `${P}/spa-scrub.jpg`,
  from: { scale: 1.0, x: 20, y: 45 },
  to: { scale: 1.1, x: 26, y: 45 },
  position: "top",
  eyebrow: "Add the spa",
  lines: ["One of only 29", "5-Bubble spas", "in the UK"],
};

const murrays: SceneSpec = {
  kind: "photo",
  // 2x Lanczos upscale + unsharp mask of the 952x714 original, for full-bleed use.
  src: `${P}/murrays-dish-2x.jpg`,
  from: { scale: 1.12, x: 50, y: 50 },
  to: { scale: 1.0, x: 46, y: 50 },
  position: "top",
  eyebrow: "Murrays, on the estate",
  // Kept generic: the photo isn't a specific menu dish.
  lines: ["Three AA", "Rosettes for", "local & seasonal"],
};

const parkland: SceneSpec = {
  kind: "photo",
  src: `${P}/golf.jpg`,
  from: { scale: 1.12, x: 70, y: 50 },
  to: { scale: 1.0, x: 60, y: 50 },
  position: "top",
  eyebrow: "Walk it off",
  lines: ["700 acres of", "parkland &", "old oaks"],
};

// Full film, ~36.6s: Reels / TikTok / feed. Two bars a scene; the scene splits open onto
// Murrays.
export const whittleburyParkStayDine: FilmSpec = {
  id: "whittlebury-park-stay-dine",
  hotel,
  music: music(1029), // fade over the last bar
  durationInFrames: 1097, // bar 16
  cuts: [274, 411, 549, 686, 822, 960], // bars 4, 6, 8, 10, 12, 14
  // Opening: the sauna slides in as three panels that lock together on bar 1.
  slices: { land: 69 },
  scenes: [
    { ...sauna, captionDelay: 69 }, // caption waits for the panels to lock
    suite,
    pool,
    spa,
    murrays,
    parkland,
    { kind: "end" },
  ],
  transitions: [
    { kind: "fade", frames: 20 },
    { kind: "fade", frames: 20 },
    { kind: "fade", frames: 20 },
    { kind: "split", frames: 40 },
    { kind: "fade", frames: 20 },
    { kind: "rise", frames: 26 },
  ],
};

// Stories cut, 13.7s: hook, Murrays, end card.
export const whittleburyParkStayDineStory: FilmSpec = {
  id: "whittlebury-park-stay-dine-story",
  hotel,
  music: music(342), // fade over the last bar
  durationInFrames: 411, // bar 6
  cuts: [137, 274], // bars 2, 4
  slices: { land: 69 },
  scenes: [{ ...sauna, captionDelay: 69 }, murrays, { kind: "end" }],
  transitions: [
    { kind: "fade", frames: 20 },
    { kind: "rise", frames: 26 },
  ],
};
