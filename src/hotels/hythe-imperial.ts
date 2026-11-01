import type { EditorialSpec } from "../hotel-film/editorial/types";
import type { MotionSpec } from "../hotel-film/motion/types";
import type {
  FilmSpec,
  Hotel,
  SceneSpec,
  WordIntroSpec,
} from "../hotel-film/types";

// Hythe Imperial Hotel, Golf & Spa (Classic British Hotels).
// Copy is from the hotel's own and CBH's listings; every caption is a distinct fact.
// Music: "Night Jazz Club" by Elisaveta Stoycheva (~89 BPM), trimmed to its first
// 45s. Downbeats (scripts/analyze-beats.py), in frames: beat 4 = 89, 8 = 169,
// 12 = 249, 16 = 329, 20 = 409, 24 = 489, 28 = 569, 32 = 649, 36 = 729, 40 = 809,
// 44 = 889, 48 = 969, 52 = 1049.

const P = "hotels/hythe-imperial";

const hotel: Hotel = {
  name: "Hythe Imperial",
  subtitle: "Hotel, Golf & Spa",
  location: "Hythe, Kent",
};

const music = (fadeFrom: number) => ({
  src: `${P}/night-jazz-club.mp3`,
  trimmedSeconds: 45,
  fadeFrom,
});

// HYTHE cut out of black with the sea showing through; the camera flies into the T and
// lands on the aerial on beat 4.
const intro: WordIntroSpec = {
  word: "HYTHE",
  sub: "Imperial",
  zoomStart: 52,
  zoomEnd: 89, // beat 4
  origin: [546, 620], // the stem of the T
};

const aerial: SceneSpec = {
  kind: "photo",
  src: `${P}/aerial.webp`,
  from: { scale: 1.14, x: 40, y: 50 },
  to: { scale: 1.0, x: 44, y: 50 },
  eyebrow: "Hythe, Kent",
  lines: ["Hythe Imperial", "Hotel, Golf & Spa"],
};

const rooms: SceneSpec = {
  kind: "triptych",
  photos: [
    { src: `${P}/room.jpg`, y: 55 },
    { src: `${P}/room-2.jpg`, y: 55 },
    { src: `${P}/room-3.jpg`, y: 50 },
  ],
  eyebrow: "Stay in Style",
  lines: ["92 individually", "designed rooms", "& suites"],
};

const champagne: SceneSpec = {
  kind: "photo",
  src: `${P}/champagne.webp`,
  from: { scale: 1.0, x: 70, y: 50 },
  to: { scale: 1.12, x: 70, y: 45 },
  position: "top",
  eyebrow: "The Champagne Bar",
  lines: ["Kent's only", "Moët & Chandon", "Champagne Bar"],
  overlay: "fizz",
};

const bar: SceneSpec = {
  kind: "photo",
  src: `${P}/champagne-bar.webp`,
  from: { scale: 1.05, x: 25, y: 50 },
  to: { scale: 1.05, x: 55, y: 50 },
};

const dining: SceneSpec = {
  kind: "photo",
  src: `${P}/dining.webp`,
  from: { scale: 1.12, x: 52, y: 60 },
  to: { scale: 1.0, x: 56, y: 60 },
  position: "top",
  eyebrow: "Coast Restaurant",
  lines: ["AA Rosette", "dining with", "Channel views"],
};

const spa: SceneSpec = {
  kind: "photo",
  src: `${P}/spa-whirlpool.jpg`,
  from: { scale: 1.12, x: 70, y: 50 },
  to: { scale: 1.0, x: 62, y: 50 },
  position: "top",
  eyebrow: "The Spa",
  lines: ["Indoor pool,", "sauna &", "steam room"],
};

// Full film, ~35s: Reels / TikTok / feed.
export const hytheImperialFilm: FilmSpec = {
  id: "hythe-imperial",
  hotel,
  music: music(969), // fade over the last bar (beat 48 -> 52)
  durationInFrames: 1049, // beat 52
  cuts: [169, 329, 489, 569, 729, 889], // beats 8, 16, 24, 28, 36, 44
  intro,
  scenes: [
    { ...aerial, captionDelay: 80 }, // caption waits for the intro to land
    rooms,
    champagne,
    bar,
    dining,
    spa,
    { kind: "end" },
  ],
  transitions: [
    { kind: "cover", frames: 40 },
    { kind: "fade", frames: 20 },
    { kind: "fade", frames: 20 },
    { kind: "arch", frames: 40 },
    { kind: "fade", frames: 20 },
    { kind: "rise", frames: 26 },
  ],
};

// Stories cut, under 15s: hook, rooms, one signature fact, end card.
export const hytheImperialStory: FilmSpec = {
  id: "hythe-imperial-story",
  hotel,
  music: music(409), // fade over the last bar (beat 20 -> 22)
  durationInFrames: 449, // beat 22, 14.97s
  cuts: [89, 249, 329], // beats 4, 12, 16
  scenes: [aerial, rooms, champagne, { kind: "end" }],
  transitions: [
    { kind: "cover", frames: 40 },
    { kind: "fade", frames: 20 },
    { kind: "rise", frames: 26 },
  ],
};

// "Editorial scroll" take, ~35s: no cuts; the camera glides down one magazine page.
// The aerial holds for two bars; every spread gets two bars.
export const hytheImperialScroll: EditorialSpec = {
  id: "hythe-imperial-scroll",
  hotel,
  music: music(969), // fade over the last bar (beat 48 -> 52)
  durationInFrames: 1049, // beat 52
  intro,

  glides: [249, 409, 569, 729, 889], // beats 12, 20, 28, 36, 44
  glideFrames: 40,
  sections: [
    {
      kind: "hero",
      src: `${P}/aerial.webp`,
      from: { scale: 1.12, x: 42, y: 50 },
      to: { scale: 1.0, x: 44, y: 50 },
      eyebrow: "Hythe, Kent",
      lines: ["Hythe Imperial", "Hotel, Golf & Spa"],
    },
    {
      kind: "collage",
      photos: [`${P}/room.jpg`, `${P}/room-2.jpg`, `${P}/room-3.jpg`],
      eyebrow: "Stay in Style",
      lines: ["92 individually", "designed rooms", "& suites"],
    },
    {
      kind: "arch",
      src: `${P}/champagne.webp`,
      fizz: true,
      eyebrow: "The Champagne Bar",
      lines: ["Kent's only", "Moët & Chandon", "Champagne Bar"],
    },
    {
      kind: "pair",
      band: `${P}/champagne-bar.webp`,
      inset: `${P}/dining.webp`,
      eyebrow: "Coast Restaurant",
      lines: ["AA Rosette", "dining with", "Channel views"],
    },
    {
      kind: "fullbleed",
      src: `${P}/spa-whirlpool.jpg`,
      eyebrow: "The Spa",
      lines: ["Indoor pool,", "sauna &", "steam room"],
    },
    { kind: "end" },
  ],
};

// "Gold Line" motion-graphics take, ~40s: a gold line threads the film and every scene
// enters with its own graphic reveal, landing on a downbeat.
export const hytheImperialGoldLine: MotionSpec = {
  id: "hythe-imperial-gold-line",
  hotel,
  music: music(1129), // fade over the last bar (beat 56 -> 60)
  durationInFrames: 1209, // beat 60
  // aerial, stats, rooms, champagne, restaurant, spa, end card (beats 4-44)
  beats: [89, 249, 409, 569, 729, 889, 1049],
  aerial: {
    src: `${P}/aerial.webp`,
    from: { scale: 1.25, x: 42, y: 50 },
    to: { scale: 1.04, x: 44, y: 50 },
    eyebrow: "Hythe, Kent",
    lines: ["Hythe Imperial", "Hotel, Golf & Spa"],
  },
  stats: [
    { value: 1880, label: "Established" },
    { value: 18, label: "Hole links golf course" },
    { value: 4, suffix: "★", label: "Seaside hotel" },
  ],
  rooms: {
    photos: [`${P}/room.jpg`, `${P}/room-2.jpg`, `${P}/room-3.jpg`],
    eyebrow: "Stay in Style",
    lines: ["92 individually", "designed rooms", "& suites"],
  },
  champagne: {
    src: `${P}/champagne.webp`,
    focus: [800, 760],
    eyebrow: "The Champagne Bar",
    lines: ["Kent's only", "Moët & Chandon", "Champagne Bar"],
  },
  restaurant: {
    src: `${P}/dining.webp`,
    eyebrow: "Coast Restaurant",
    lines: ["AA Rosette", "dining with", "Channel views"],
  },
  spa: {
    src: `${P}/spa-whirlpool.jpg`,
    eyebrow: "The Spa",
    lines: ["Indoor pool,", "sauna &", "steam room"],
  },
};
