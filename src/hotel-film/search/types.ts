// "Search": a reel built around a search. A CBH-styled search bar on black types one
// query in, a gold line sweeps under it, then the bar glides up into the top safe zone and
// the answer plays out as full-bleed shots of one hotel. Each shot proves one part of the
// query: that part lights up gold in the bar while a calm caption gives the fact. It ends
// on the usual end card (name, location, the shimmering CBH logo). Hythe Imperial is the
// reference. The bar is never a real search engine's or assistant's interface.

export type SearchShot = {
  src: string; // still in public/, full-bleed with the barely-there 1.00 -> 1.04 push
  x?: number; // CSS object-position x (%) for the 9:16 crop, default 50
  y?: number;
  // A slow, eased pan from one x to another instead of a fixed x, to carry the eye
  // across a wide still (e.g. from the plate to the glass beside it).
  pan?: [number, number];
  match?: number; // index of the query part this shot answers (lights up in the bar)
  caption: { eyebrow: string; lines: string[]; small?: string };
  fizz?: boolean; // golden champagne fizz (approved for champagne shots only)
};

export type SearchSpec = {
  id: string;
  music: {
    src: string;
    trimmedSeconds: number;
    startAt: number; // frames into the trimmed file where the film starts
    gain: number;
    fadeFrom: number;
  };
  // The query, in parts: a part with `match` lights up when a shot answers it.
  query: { text: string; match?: number }[];
  typeFrom: number; // frames: the query types in steadily between these
  typeTo: number;
  // Frame where each shot starts (a crossfade centred on it; the first is the bar's
  // glide up), then the end card's start: measured beats.
  cuts: number[];
  durationInFrames: number;
  crossfade: number; // frames, even
  shots: SearchShot[];
  endCard: { lines: string[]; location: string };
  // A still gold underline under each gold caps eyebrow (never a drawing one): on unless
  // set false.
  eyebrowRule?: boolean;
  watermark?: { src: string; size: [number, number]; x: number; y: number };
};

export const validateSearch = (f: SearchSpec) => {
  const fail = (msg: string) => {
    throw new Error(`${f.id}: ${msg}`);
  };
  if (f.cuts.length !== f.shots.length + 1)
    fail("give one cut per shot, plus the end card");
  if (f.crossfade % 2) fail("the crossfade needs an even frame count");
  if (f.typeTo >= f.cuts[0] - 30)
    fail("let the typed query sit for at least 1s before the first cut");
  const bounds = [0, ...f.cuts, f.durationInFrames];
  bounds.slice(1).forEach((cut, i) => {
    const before = i > 0 ? f.crossfade / 2 : 0;
    const after = i < bounds.length - 2 ? f.crossfade / 2 : 0;
    if (cut - bounds[i] - before - after < 30)
      fail("every section needs at least 1s on screen alone");
  });
  const srcs = f.shots.map((s) => s.src);
  if (new Set(srcs).size !== srcs.length) fail("never use a photo twice");
  const parts = new Set(
    f.query.flatMap((q) => (q.match === undefined ? [] : [q.match])),
  );
  f.shots.forEach((s) => {
    if (s.match !== undefined && !parts.has(s.match))
      fail(`shot ${s.src} answers a query part that doesn't exist`);
  });
  if (f.music.fadeFrom < f.cuts[f.cuts.length - 1])
    fail("start the music fade under the end card");
  if (f.music.startAt + f.durationInFrames > f.music.trimmedSeconds * 30)
    fail("the film is longer than the trimmed music");
};
