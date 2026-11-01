import type { FlipbookSpec } from "../hotel-film/flipbook/types";

// Cosy Escapes flipbook reel (CBH autumn campaign, from 10 Oct 2026): an autumn journal
// whose pages turn one by one through one cosy day across the collection. Every hotel has
// a Foodie Break live (Bianca, 8 Oct 2026). Photos from each hotel's CBH gallery. Captions
// are written fresh from these verified facts only (CBH hotel pages, supplied by Scott):
// - Speech House Hotel: trails lead directly from the door into the Royal Forest of Dean.
// - Langshott Manor: cosy fireside nooks in the pocket lounges; afternoon tea served.
// - Hardwick Hall Hotel: the Rib Room is the hotel's award-winning steakhouse; steaks are
//   the house speciality, cuts of fine Durham beef matured for 28 to 32 days. (Replaced
//   Ilsington, whose dish was already used; Hardwick's Gourmet Break is live.) The photo
//   is the panelled Rib Room, so the caption names what it shows, plus the beef.
// - Dalmahoy Hotel & Country Club: cosy cocktail bar beside a crackling log fire, single
//   malts.
// - Whitley Hall Country House Hotel: the Peacock Suite's ornate four-poster bed.
// No time-of-day words, no facility labels. Back page: the official Deliciously Autumn
// 4:5 artwork (FROM £139.00). Maids Head is leaving the collection: never use it here.
//
// Music: "Cozy Soulful Music" by andriih (Pixabay Content License), ~80.7 BPM (a beat
// every ~22.3 frames), trimmed to its first 60s. The film plays 34.57-54.85s: no lead line
// until a short keys phrase at ~46s (under the Dalmahoy page); "Autumn Acoustic Guitar
// Music" was the alternative but carries a melodic guitar line almost throughout. Every
// page turn lands on a downbeat (36.80, 39.82, 42.82, 45.84, 48.83, 51.83s) and the film
// ends on the 54.85s downbeat, the music fading over the back page.

const P = "campaigns/cosy-escapes";

export const cosyEscapesFlipbook: FlipbookSpec = {
  id: "cosy-escapes-flipbook",
  music: {
    src: `${P}/cozy-soulful.mp3`,
    trimmedSeconds: 60,
    startAt: 1037, // 34.57s, a beat before the bar
    gain: 1.12, // ~-15 LUFS; the trimmed file is peak-limited (alimiter 0.8)
    fadeFrom: 518, // the back page lands: fade over its bar
  },
  durationInFrames: 608, // 20.3s, ends on the 54.85s downbeat
  turn: 24, // 0.8s, a little over a beat, eased
  lands: [67, 158, 248, 338, 428, 518], // a bar apart; the cover gets three beats
  cover: { eyebrow: "An autumn journal", title: "Cosy Escapes" },
  pages: [
    {
      src: `${P}/page1-speech-house-walk.jpg`,
      size: [1920, 1263],
      crop: { cx: 1000 }, // the bronze stag, the house behind
      caption: ["The forest begins", "at the front door"],
      hotel: "Speech House Hotel",
      location: "Forest of Dean",
    },
    {
      src: `${P}/page2-langshott-fireside-tea.jpg`,
      size: [1920, 1280],
      crop: { cx: 960 },
      caption: ["Tea and cake,", "pulled up to the fire"],
      hotel: "Langshott Manor",
      location: "Surrey",
    },
    {
      src: `${P}/page3-hardwick-rib-room.jpg`,
      size: [1920, 1280],
      crop: { cx: 1150 },
      caption: ["Low beams, panelled walls", "and fine Durham beef"],
      hotel: "Hardwick Hall Hotel",
      location: "Sedgefield, County Durham",
    },
    {
      src: `${P}/page4-dalmahoy-log-fire-bar.jpg`,
      size: [1920, 1080],
      crop: { cx: 830 }, // the fire, the mirror, the armchairs
      caption: ["A single malt, the fire", "crackling beside you"],
      hotel: "Dalmahoy Hotel & Country Club",
      location: "Edinburgh",
    },
    {
      src: `${P}/page5-whitley-peacock-four-poster.jpg`,
      size: [1920, 1277],
      crop: { cx: 1200 }, // the carved headboard and posts
      caption: ["And so to bed, beneath", "an ornate four-poster"],
      hotel: "Whitley Hall Country House Hotel",
      location: "Sheffield",
    },
  ],
  back: {
    src: "campaigns/plate-to-pillow/deliciously-autumn-lockup-4x5.webp",
    size: [1080, 1350],
  },
  watermark: {
    src: "brand/cb-watermark.png",
    size: [100, 108],
    x: 920,
    y: 1452,
  },
};
