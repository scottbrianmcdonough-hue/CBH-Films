import type { FilmSpec, Hotel, SceneSpec } from "../hotel-film/types";

// The Kingfisher, Bedford (Classic British Hotels): Autumn Foodie Break for the CBH Cosy
// Escapes campaign (from 10 Oct 2026), food angle. Every on-screen line was checked by the
// client against the live CBH pages (Autumn Foodie Break offer, updated 6 Oct 2026; the
// Kingfisher hotel page and FAQs): riverside walks, a bottle of Prosecco in the room on
// arrival, full English breakfast for two, a £25 per person dinner allowance in the
// hotel's restaurant, log fire, wines from nearby Warden Abbey Vineyard at the bar. "40+
// wines by the glass" and the WineGlass Restaurant are NOT on the live pages: don't use
// them. No price in the film. Photos supplied by the client.
// Signed-off source wording (live offer page and booking engine):
// - "River walks by day", "back at the hotel": "Spend the day exploring Bedford's riverside
//   walks and local attractions before returning to the hotel for a delicious evening meal"
// - Dinner allowance: "£25 dinner allowance per person to enjoy in the hotel's restaurant"
//   (food from the restaurant menu only, so the line sits on the food shot alone)
//
// Music: "Warm Acoustic Guitar" by Universfield (Pixabay, ~80.7 BPM, ~87-frame bars),
// trimmed to its first 45s and played from its first downbeat (7 frames in). Raised to land
// near -15 LUFS like the other films (the track itself is -17.3 LUFS). Bar starts in film frames
// (scripts/analyze-beats.py): 0, 84, 169, 256, 347 (phrase), 433, 518, 605, 699 (phrase),
// 790, 873 (section change), 954, 1041.

const P = "hotels/the-kingfisher";

// End card: the hotel name and location only.
const hotel: Hotel = {
  name: "The Kingfisher",
  location: "Bedford",
};

// The client's CB watermark on every shot (grid-safe reel spec). The end card then carries
// no CB logo: the brand appears once, as the watermark.
const watermark = {
  src: "brand/cb-watermark.png",
  size: [100, 108] as [number, number],
  x: 920,
  y: 1452,
};

const music = (fadeFrom: number, gain: number) => ({
  src: `${P}/warm-acoustic-guitar.mp3`,
  trimmedSeconds: 45,
  startAt: 7,
  gain,
  fadeFrom,
});

const river: SceneSpec = {
  kind: "photo",
  src: `${P}/river.jpg`,
  from: { scale: 1.14, x: 6, y: 50 },
  to: { scale: 1.0, x: 16, y: 50 },
  eyebrow: "Cosy Escapes",
  lines: ["The Kingfisher", "River walks by day"],
};

const aperitivo: SceneSpec = {
  kind: "photo",
  src: `${P}/aperitivo.jpg`,
  from: { scale: 1.0, x: 10, y: 50 },
  to: { scale: 1.12, x: 20, y: 45 },
  position: "top",
  eyebrow: "Pour decisions",
  // Hotel page: "the bar stocks Bedfordshire guest ales and wines from nearby Warden Abbey
  // Vineyard". Kept general: the pictured drinks aren't shown to be either.
  lines: ["Bedfordshire ales,", "wines from a", "nearby vineyard"],
};

// A one-bar breather on the lanterns, no caption.
const fireside: SceneSpec = {
  kind: "photo",
  src: `${P}/fireside.jpg`,
  from: { scale: 1.08, x: 4, y: 60 },
  to: { scale: 1.0, x: 8, y: 60 },
};

const diningRoom: SceneSpec = {
  kind: "photo",
  src: `${P}/dining-room.jpg`,
  from: { scale: 1.12, x: 52, y: 70 },
  to: { scale: 1.0, x: 64, y: 70 },
  eyebrow: "Autumn Foodie Break",
  lines: ["Prosecco on", "arrival, breakfast", "for two"],
};

const beetroot: SceneSpec = {
  kind: "photo",
  src: `${P}/beetroot.jpg`,
  from: { scale: 1.0, x: 50, y: 50 },
  to: { scale: 1.12, x: 50, y: 55 },
  position: "top",
  eyebrow: "Dinner, sorted",
  // The allowance is for food from the restaurant menu only, so this line sits on the
  // food shot alone, never over or beside a drinks shot.
  lines: ["A dinner", "allowance each,", "back at the hotel"],
};

// Full film, 34.7s: Reels / TikTok / feed. Day into night: river walk, aperitivo, the
// dining room, a quick one-bar beat by the fire, then dinner wiped in by the gold seam on
// the phrase change, and the end card rising on the section change. The dinner allowance
// caption sits between the caption-free fireside and the end card, away from any drinks.
export const theKingfisherFilm: FilmSpec = {
  id: "the-kingfisher",
  hotel,
  watermark,
  music: music(954, 1.44), // fade over the last bar; ~+3.2dB
  durationInFrames: 1041, // bar 12
  cuts: [256, 433, 605, 699, 873], // bars 3, 5, 7, 8, 10
  slices: { land: 84 }, // bar 1
  scenes: [
    { ...river, captionDelay: 84 }, // caption waits for the panels to lock
    aperitivo,
    diningRoom,
    fireside,
    { ...beetroot, captionDelay: 26 }, // caption waits until the seam has finished
    { kind: "end" },
  ],
  transitions: [
    { kind: "fade", frames: 20 },
    { kind: "fade", frames: 20 },
    { kind: "fade", frames: 12 },
    { kind: "seam", frames: 40 },
    { kind: "rise", frames: 26 },
  ],
};

// Stories cut, 14.4s: the fireside hook, dinner, end card. No drinks shot, so nothing sits
// beside the dinner allowance line.
export const theKingfisherStory: FilmSpec = {
  id: "the-kingfisher-story",
  hotel,
  watermark,
  music: music(347, 1.54), // fade over the last bar, under the end card; ~+3.7dB
  durationInFrames: 433, // bar 5
  cuts: [169, 347], // bars 2, 4
  slices: { land: 84 }, // bar 1
  scenes: [
    {
      ...fireside,
      from: { scale: 1.14, x: 2, y: 60 },
      to: { scale: 1.0, x: 10, y: 60 },
      eyebrow: "Cosy Escapes",
      // Three lines so the last one clears the CB watermark bottom-right.
      lines: ["The Kingfisher", "Autumn", "Foodie Break"],
      captionDelay: 84,
    },
    { ...beetroot, captionDelay: 6 }, // caption waits until the crossfade has finished
    { kind: "end" },
  ],
  transitions: [
    { kind: "fade", frames: 20 },
    { kind: "rise", frames: 26 },
  ],
};
