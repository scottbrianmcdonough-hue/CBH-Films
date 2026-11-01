import type { Hotel, Move } from "../types";

// "Gold Line" films: a motion-graphics treatment. A single CBH-gold line is the thread
// through the film; every scene enters with its own graphic reveal, landing on a downbeat.

export type MotionCaption = { eyebrow: string; lines: string[] };

export type MotionStat = { value: number; suffix?: string; label: string };

export type MotionSpec = {
  id: string;
  hotel: Hotel;
  music: { src: string; trimmedSeconds: number; fadeFrom: number };
  durationInFrames: number;
  // Downbeat frames each scene lands on, in order: aerial (aperture), stats, rooms,
  // champagne, restaurant, spa, end card. The aerial lands on the first.
  beats: [number, number, number, number, number, number, number];
  aerial: { src: string; from: Move; to: Move } & MotionCaption;
  stats: [MotionStat, MotionStat, MotionStat];
  rooms: { photos: [string, string, string] } & MotionCaption;
  champagne: {
    src: string;
    focus: [number, number]; // where the circular reveal opens from (screen px)
  } & MotionCaption;
  restaurant: { src: string } & MotionCaption;
  spa: { src: string } & MotionCaption;
};

export const validateMotion = (film: MotionSpec) => {
  const fail = (msg: string) => {
    throw new Error(`${film.id}: ${msg}`);
  };
  film.beats.reduce((prev, b) => {
    if (b - prev < 75)
      fail("each scene needs at least 2.5s before the next lands");
    return b;
  });
  if (film.durationInFrames - film.beats[6] < 120)
    fail("the end card needs at least 4s");
  if (film.durationInFrames > film.music.trimmedSeconds * 30)
    fail("the film is longer than the trimmed music; re-trim the track");
};
