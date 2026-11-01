import type { Hotel } from "../types";

// "Pulse" films: a rhythm edit of full-bleed photos. Hard cuts on the beat, a cold open of
// quick flashes with short phrases, and type that moves with the music. Every scene starts
// on a beat listed in `marks`.

// One cold-open flash: a phrase (use "\n" for a line break) over a full-bleed photo.
export type PulseShot = { src: string; words: string; x?: number; y?: number };

export type PulseSpec = {
  id: string;
  hotel: Hotel;
  music: {
    src: string;
    trimmedSeconds: number;
    fadeFrom: number;
    startAt?: number; // frames to skip into the track (e.g. to its first downbeat)
    gain?: number; // volume multiplier to land around -15 LUFS (default 1)
  };
  durationInFrames: number;
  beats: number[]; // every beat of the excerpt, in frames (scripts/analyze-beats.py)
  marks: {
    hero: number; // the hero shot, after the cold open
    food: number;
    foodSwap: number; // the food caption rolls over to its second line
    spa?: number; // optional scenes (spa, room, closing): set the mark and the scene together
    golf: number;
    room?: number;
    closing?: number;
    end: number;
  };
  coldOpen: PulseShot[]; // from the start until marks.hero
  coldOpenBeats?: number; // beats each cold-open flash holds (default 1)
  hero: { src: string; x?: number; eyebrow: string };
  food: {
    src: string;
    eyebrow: string;
    first: string[]; // caption until foodSwap
    second: string[]; // caption after foodSwap
  };
  spa?: { src: string; eyebrow: string; lines: string[]; x?: number }; // one line per beat
  golf: { src: string; value: number; label: string; x?: [number, number] };
  room?: { src: string; eyebrow: string; lines: string[]; x?: number };
  closing?: { src: string; eyebrow: string; lines: string[]; x?: number }; // one line per beat
};

export const validatePulse = (film: PulseSpec) => {
  const fail = (msg: string) => {
    throw new Error(`${film.id}: ${msg}`);
  };
  const m = film.marks;
  const order = [
    m.hero,
    m.food,
    m.foodSwap,
    m.spa,
    m.golf,
    m.room,
    m.closing,
    m.end,
  ].filter((f): f is number => f !== undefined);
  (["spa", "room", "closing"] as const).forEach((k) => {
    if ((m[k] === undefined) !== (film[k] === undefined))
      fail(`set both marks.${k} and ${k}, or neither`);
  });
  if (
    film.beats.indexOf(m.hero) !==
    film.coldOpen.length * (film.coldOpenBeats ?? 1)
  )
    fail("the cold open must fill exactly the beats before the hero");
  order.reduce((prev, f) => {
    if (f <= prev) fail("marks must be in order");
    if (!film.beats.includes(f)) fail(`mark ${f} is not on a beat`);
    return f;
  }, 0);
  const photos = [
    ...film.coldOpen.map((s) => s.src),
    film.hero.src,
    film.food.src,
    film.golf.src,
    ...[film.spa, film.room, film.closing].flatMap((s) => (s ? [s.src] : [])),
  ];
  const repeat = photos.find((src, i) => photos.indexOf(src) !== i);
  if (repeat) fail(`${repeat} is used twice; every scene needs its own photo`);
  if (film.durationInFrames - m.end < 120)
    fail("the end card needs at least 4s");
  if (
    film.durationInFrames + (film.music.startAt ?? 0) >
    film.music.trimmedSeconds * 30
  )
    fail("the film is longer than the trimmed music; re-trim the track");
};
