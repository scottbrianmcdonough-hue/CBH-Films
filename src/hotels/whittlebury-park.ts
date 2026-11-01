import type { PulseSpec } from "../hotel-film/pulse/types";

// Whittlebury Park Hotel, Spa & Golf Resort (Classic British Hotels): a "Pulse" rhythm
// edit of full-bleed photos with a food-first angle around Murrays. Captions use the CBH
// page's wording and the hotel's own site/menu
// (https://classicbritishhotels.com/hotels/whittlebury-park/, read via search snippets as
// the site is blocked from the build environment).

const P = "hotels/whittlebury-park";

export const whittleburyParkPulse: PulseSpec = {
  id: "whittlebury-park",
  hotel: {
    name: "Whittlebury Park",
    subtitle: "Hotel, Spa & Golf Resort",
    location: "Northamptonshire",
  },
  music: {
    // "Food Cooking Music" by GR0ZA (~103 BPM), trimmed to its first 50s. It starts
    // 1.77s in, on its first downbeat, and is turned down ~2.5dB to sit near -15 LUFS.
    src: `${P}/food-cooking-music.mp3`,
    trimmedSeconds: 50,
    startAt: 53,
    gain: 0.75,
    fadeFrom: 857, // fade over the last bar (beat 50 -> 54)
  },
  durationInFrames: 926, // beat 54
  // Every beat from the first downbeat (scripts/analyze-beats.py), in film frames.
  beats: [
    0, 17, 34, 52, 68, 86, 102, 120, 137, 154, 171, 189, 205, 222, 240, 257,
    274, 291, 309, 325, 343, 359, 377, 394, 411, 428, 446, 463, 479, 497, 514,
    531, 548, 566, 582, 600, 616, 634, 651, 668, 685, 703, 720, 737, 754, 771,
    789, 805, 823, 839, 857, 874, 891, 908, 926, 942, 960,
  ],
  marks: {
    hero: 137, // beat 8: after four two-beat flashes
    food: 240, // beat 14
    foodSwap: 309, // beat 18
    spa: 377, // beat 22
    golf: 514, // beat 30
    room: 651, // beat 38
    end: 789, // beat 46 (no separate closing scene: every photo is used once)
  },

  // A quick run of words over four shots, each held two beats so it registers.
  coldOpenBeats: 2,
  coldOpen: [
    { src: `${P}/room.jpg`, words: "Slow\nmornings", x: 35, y: 55 },
    { src: `${P}/pool.jpg`, words: "Lazy\nlengths", x: 46, y: 50 },
    { src: `${P}/salt-sauna.jpg`, words: "Salt-wall\nheat", x: 44, y: 50 },
    { src: `${P}/spa-scrub.jpg`, words: "Warm\nhands", x: 18, y: 45 },
  ],
  hero: {
    src: `${P}/exterior.jpg`,
    x: 46,
    eyebrow: "Pole position near Silverstone",
  },
  food: {
    // 2x Lanczos upscale + unsharp mask of the 952x714 original, for full-bleed use.
    src: `${P}/murrays-dish-2x.jpg`,
    eyebrow: "Save room for Murrays",
    first: ["Three AA", "Rosettes"],
    // Kept generic: the photo isn't a specific menu dish, and the film runs in autumn.
    second: ["Autumn,", "on the plate"],
  },
  spa: {
    src: `${P}/spa-pool.jpg`,
    eyebrow: "Hot, cold, repeat",
    lines: ["Heat & ice", "experiences in", "a 5-Bubble spa"],
    x: 50,
  },
  golf: {
    src: `${P}/golf.jpg`,
    value: 36,
    label: "Holes of championship golf",
    x: [22, 38],
  },
  room: {
    src: `${P}/suite.jpg`,
    eyebrow: "Room to sprawl",
    lines: ["Suites with", "sweeping golf", "course views"],
    x: 66,
  },
};

// Stories cut (<=15s): two word flashes, the hotel, Murrays, the golf counter, end card.
export const whittleburyParkStory: PulseSpec = {
  ...whittleburyParkPulse,
  id: "whittlebury-park-story",
  music: { ...whittleburyParkPulse.music, fadeFrom: 377 }, // last bar: beat 22 -> 26
  durationInFrames: 446, // beat 26, 14.9s
  marks: {
    hero: 68, // beat 4
    food: 137, // beat 8
    foodSwap: 189, // beat 11
    golf: 240, // beat 14
    end: 325, // beat 19
  },
  coldOpen: [
    { src: `${P}/pool.jpg`, words: "Lazy\nlengths", x: 46, y: 50 },
    { src: `${P}/salt-sauna.jpg`, words: "Salt-wall\nheat", x: 44, y: 50 },
  ],
  spa: undefined,
  room: undefined,
};
