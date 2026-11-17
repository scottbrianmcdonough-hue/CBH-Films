import type { LoadingShot, LoadingSpec } from "../hotel-film/loading/types";

// Low Wood Bay Resort & Spa, Windermere: "Weekend loaded". A gold loading bar fills through
// one weekend, a step a shot: arrival along the misty jetty, the lake view from the Hazel
// room, golden hour in the long grass, the candlelit steps, the guitarist, the spa
// treatment on the lake stuck at 99%, and breakfast in bed tips it to 100%. Footage leads
// (Bianca): five Reel Bank clips (Instagram downloads), two stills where there is no clip.
// Scott picked the guitarist over a dinner still; no cocktails (too much alcohol was a note
// on the festive reel). Clips cut by scripts/low-wood-bay-clips.py.
//
// Facts from the hotel's CBH page (Scott, 15 Oct): on the shores of Lake Windermere in the
// Lake District National Park; many rooms have lake, marina and fell views or balconies;
// the spa is rated a 5 Bubble Luxury Spa by the Good Spa Guide.
//
// Music: "Feel Good Groove Funk" by FunkAvenue (Pixabay 572740; not Content ID registered;
// used in no other film). ~123 BPM, a bar every ~58.6 frames. From 7.99s in the track
// (startAt 240, a phrase start), past its melodic intro; no lead line over the stretch used
// (pyin) and no breakdowns. Bars land on film frames 0, 58, 117, 176, 235, 294, 354, 412,
// 471, 530, 589, 648, 707, 767, 826, 884, 944. Every shot is two bars, so the cuts keep a
// steady beat with the track or with Measure (feat. Plu Soul) by Jumbo added in-app over
// the silent version.

const H = "hotels/low-wood-bay/cuts";
const MUSIC = {
  src: "hotels/low-wood-bay/feel-good-groove-funk.mp3",
  trimmedSeconds: 50,
  startAt: 240,
  gain: 0.9,
};
const shot = (
  name: string,
  at: number,
  label: string,
  pct: number,
  lift?: number,
) => ({ src: `${H}/${name}.mp4`, at, label, pct, lift });

const shots: LoadingShot[] = [
  shot("jetty", 0, "Checking in on Windermere", 20),
  shot("room", 117, "Unpacking the lake view", 40),
  shot("grass", 235, "Catching golden hour", 55),
  shot("steps", 354, "Lighting the candles", 70),
  shot("guitarist", 471, "Sound check", 85),
  // the treatment sits at the foot of the clip: raise it clear of the bar
  shot("pontoon", 589, "5 Bubble spa, nearly there", 99, 380),
  shot("breakfast", 707, "Breakfast in bed", 100),
];

// Scott, 17 Nov: the Story goes out midweek, so not "Weekend"; "Relaxation" was too cliche: "Lake mode", loading
// like a phone setting, then on at 100%
const common = {
  hook: ["Lake mode", "loading"],
  close: ["Lake mode", "on"],
  endCard: {
    lines: ["Low Wood Bay", "Resort & Spa"],
    location: "Windermere, Lake District",
  },
  // Scott (preview 1): "add sound effects ... the bar moving up" (the house default is
  // none; the client rejected effects on earlier films, so flagged to him)
  sfx: {
    jump: "hotels/low-wood-bay/sfx/jump.wav",
    done: "hotels/low-wood-bay/sfx/done.wav",
    gain: 0.5,
  },
  watermark: {
    src: "brand/cb-watermark.png",
    size: [100, 108] as [number, number],
    x: 920,
    y: 1452,
  },
};

export const lowWoodBay: LoadingSpec = {
  id: "low-wood-bay",
  music: { ...MUSIC, fadeFrom: 884 },
  durationInFrames: 944,
  shots,
  endAt: 806,
  endFade: 20,
  ...common,
};

// The same edit with no music (the sound effects only), for Measure (feat. Plu Soul) by
// Jumbo added in-app.
export const lowWoodBaySilent: LoadingSpec = {
  ...lowWoodBay,
  id: "low-wood-bay-silent",
  music: undefined,
};

// Stories cut (13.7s, Scott's plan): jetty 25%, steps 70%, the pontoon at 99%, breakfast
// at 100%, the end card. The pontoon and breakfast hold a bar and a half each (cut on the
// beat), so the 99% joke and "Weekend loaded" both have time to read.
const story = (name: string, at: number, pct: number) => ({
  ...shots.find((s) => s.src.endsWith(`/${name}.mp4`))!,
  at,
  pct,
});

export const lowWoodBayStory: LoadingSpec = {
  id: "low-wood-bay-story",
  music: { ...MUSIC, fadeFrom: 354 },
  durationInFrames: 412,
  shots: [
    story("jetty", 0, 25),
    story("steps", 58, 70),
    story("pontoon", 117, 99),
    story("breakfast", 205, 100),
  ],
  endAt: 274,
  endFade: 20,
  ...common,
};

export const lowWoodBayStorySilent: LoadingSpec = {
  ...lowWoodBayStory,
  id: "low-wood-bay-story-silent",
  music: undefined,
};

// The award Story (17 Nov; Scott, from a reviewer's notes): the same loading bar ending on the win. The 100% beat is the
// spa (the infinity pool depth move) with "Best Resort / Spa" and the step "Good Spa Guide Awards 2026"; the end card
// adds BEST RESORT SPA 2026 above the place. The award isn't on the hotel's or CBH's site yet: confirm it before posting.
export const lowWoodBayStoryAward: LoadingSpec = {
  ...lowWoodBayStory,
  id: "low-wood-bay-story-award",
  shots: [
    story("jetty", 0, 25),
    story("steps", 58, 70),
    story("pontoon", 117, 99),
    {
      src: "hotels/low-wood-bay/spa-infinity.mp4",
      at: 205,
      label: "Good Spa Guide Awards 2026",
      pct: 100,
    },
  ],
  close: ["Best Resort", "Spa"],
  endCard: { ...common.endCard, award: "Best Resort Spa 2026" },
};

export const lowWoodBayStoryAwardSilent: LoadingSpec = {
  ...lowWoodBayStoryAward,
  id: "low-wood-bay-story-award-silent",
  music: undefined,
};
