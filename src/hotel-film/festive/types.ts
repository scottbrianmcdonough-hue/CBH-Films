// "Lights on": the festive reel, professional and minimal (Scott: "too many effects",
// footage first, then match cuts). Real footage leads: it opens dim with one short line,
// the lights switch on once and stay on, the clips crossfade. Then the stills, each a hard
// match cut on the beat (the matched shape lined up in frame across the cut: crops solved
// with scripts/match-cuts.py), a gentle push-in, one shared grade; no text over them. The
// usual clean end card: the CB logo with link in bio.

export type FestiveClip = {
  kind: "video";
  src: string; // path inside public/ (audio stripped; played muted)
  from: number; // seconds into the clip where the shot starts (before its transition in)
};

export type FestiveStill = {
  kind: "still";
  src: string;
  size: [number, number]; // source width, height in pixels
  crop: { cx: number; cy?: number; h?: number }; // 9:16 crop
  push?: number; // zoom gained across the shot, e.g. 0.06
};

// `cut: "hard"`: the shot arrives on a hard cut (a match cut) instead of the crossfade.
// `grade`: a CSS filter to bring a clip into the shared grade (the stills are pre-graded).
// `whip`: a push-through on the hard cut into this shot (Scott: the last cuts were "a bit
// simple"): the outgoing shot punches in over its last frames with a touch of motion blur,
// this one lands punched in and settles, both zooming about this frame point (the matched
// shape), so the match stays lined up while the frame drives through on the beat.
export type FestiveShot = (FestiveClip | FestiveStill) & {
  cut?: "hard";
  grade?: string;
  whip?: [number, number];
};

export type FestiveSpec = {
  id: string;
  // Frame where each shot after the first starts: the crossfade into it is centred on the cut.
  cuts: number[];
  durationInFrames: number;
  crossfade: number; // frames, even
  lightsOn: number; // frame the lights switch on
  line: string; // the one opening line, set on frame one ("\n" breaks it)
  music?: {
    src: string;
    trimmedSeconds: number;
    startAt: number; // frames into the file where the film starts
    gain: number;
    fadeFrom: number;
  };
  // The clean end card from the last cut: "link in bio" over the CB logo.
  // eyebrow (gold caps) and title (large Cormorant, "\n" breaks it) make the stronger card
  // (Scott: "something stronger on the end card"); no gold rule (Scott: it's on every reel).
  endCard?: { eyebrow?: string; title?: string; line?: string };
  // A light fall of soft snowflakes over the opening shot, clearing before the first cut
  // (the one festive touch; Scott didn't want to touch the logo).
  snow?: boolean;
  shots: FestiveShot[];
  fadeOut?: number; // frames to fade to black at the end
  watermark?: { src: string; size: [number, number]; x: number; y: number };
};

export const validateFestive = (f: FestiveSpec) => {
  const fail = (msg: string) => {
    throw new Error(`${f.id}: ${msg}`);
  };
  if (f.cuts.length !== f.shots.length - (f.endCard ? 0 : 1))
    fail("one cut per shot after the first, plus the end card");
  if (f.crossfade % 2) fail("the crossfade needs an even frame count");
  const bounds = [0, ...f.cuts, f.durationInFrames];
  const half = (i: number) =>
    i < f.shots.length && f.shots[i].cut === "hard" ? 0 : f.crossfade / 2;
  bounds.slice(1).forEach((end, i) => {
    const before = i > 0 ? half(i) : 0;
    const after = i < bounds.length - 2 ? half(i + 1) : 0;
    if (end - bounds[i] - before - after < 30)
      fail("every shot needs at least 1s on screen alone");
  });
  if (
    f.music &&
    f.music.startAt + f.durationInFrames > f.music.trimmedSeconds * 30
  )
    fail("the film is longer than the trimmed music");
};
