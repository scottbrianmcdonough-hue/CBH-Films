import type { Hotel, Move, WordIntroSpec } from "../types";

// "Editorial scroll" films: no cuts. The film is one tall magazine page that a virtual
// camera glides down, spread by spread, on the music's downbeats.

type Caption = { eyebrow: string; lines: string[] };

export type EditorialSection =
  | ({ kind: "hero"; src: string; from: Move; to: Move } & Caption)
  | ({ kind: "collage"; photos: [string, string, string] } & Caption)
  | ({ kind: "arch"; src: string; fizz?: boolean } & Caption)
  | ({ kind: "pair"; band: string; inset: string } & Caption)
  | ({ kind: "fullbleed"; src: string } & Caption)
  | { kind: "end" };

export type EditorialSpec = {
  id: string;
  hotel: Hotel;
  music: { src: string; trimmedSeconds: number; fadeFrom: number };
  durationInFrames: number;
  // The opening word (e.g. HYTHE) is a window onto the hero photo; the camera flies
  // into one of its letters between zoomStart and zoomEnd (land zoomEnd on a downbeat).
  intro: WordIntroSpec;
  glides: number[]; // frame each glide to the next spread is centred on (downbeats)
  glideFrames: number;
  sections: EditorialSection[]; // hero first, end card last; one more than glides
};

export const validateEditorial = (film: EditorialSpec) => {
  const fail = (msg: string) => {
    throw new Error(`${film.id}: ${msg}`);
  };
  if (film.sections.length !== film.glides.length + 1)
    fail("there must be exactly one more section than glides");
  if (film.sections[0].kind !== "hero")
    fail("the first section must be the hero");
  if (film.sections[film.sections.length - 1].kind !== "end")
    fail("the last section must be the end card");
  if (film.durationInFrames > film.music.trimmedSeconds * 30)
    fail("the film is longer than the trimmed music; re-trim the track");
  // Time each spread spends at rest: from the end of the previous move (the intro zoom
  // or a glide) to the start of the next glide.
  film.glides.forEach((g, i) => {
    const restStart =
      i === 0 ? film.intro.zoomEnd : film.glides[i - 1] + film.glideFrames / 2;
    if (g - film.glideFrames / 2 - restStart < 45)
      fail(`spread ${i} needs at least 1.5s at rest before its glide`);
  });
};
