// "Weekend loaded": one hotel's weekend as a loading bar (Low Wood Bay is the reference).
// A gold rod in a smoked-glass channel sits in the lower third over full-bleed shots, real
// footage first (Bianca), stills only where there is no clip. On every cut (a downbeat) the
// bar jumps to the shot's percentage and its step name rises in above it: arrival, room,
// evening, the spa stuck at 99%, then breakfast tips it to 100% and "Weekend loaded" rises.
// The bar jumps rather than draws (Scott: the drawing gold line is in every film). Shots
// are pre-cut to their slots (scripts/low-wood-bay-clips.py), so the film plays them in
// order. With no `music` the film renders silent, for a track added in-app.

export type LoadingShot = {
  src: string; // a pre-cut 1080x1920 clip at least as long as its slot
  at: number; // the frame it cuts in, on a downbeat
  label: string; // gold caps step name above the bar
  pct: number; // the bar jumps to this on the cut
  lift?: number; // px to raise the picture when its subject sits under the bar; the
  // strip uncovered at the foot fades to black under the lower-third shade
};

export type LoadingSpec = {
  id: string;
  music?: {
    src: string;
    trimmedSeconds: number;
    startAt: number; // frames into the track
    gain: number;
    fadeFrom: number;
  };
  durationInFrames: number;
  shots: LoadingShot[];
  hook: string[]; // italic headline over the first shot ("Weekend / loading")
  close: string[]; // italic headline when the bar hits 100% ("Weekend / loaded")
  endAt: number; // the last shot starts to fade to black
  endFade: number;
  endCard: { lines: string[]; location: string };
  watermark?: { src: string; size: [number, number]; x: number; y: number };
  // sound effects (scripts/loading-sfx.py): `jump` as the bar climbs (it lands 12 frames
  // in), `done` at 100%. Scott asked for them on Low Wood Bay; the house default is none.
  sfx?: { jump: string; done: string; gain: number };
};

export const validateLoading = (f: LoadingSpec) => {
  const fail = (msg: string) => {
    throw new Error(`${f.id}: ${msg}`);
  };
  if (f.shots[0]?.at !== 0) fail("the first shot starts the film");
  [...f.shots.map((s) => s.at), f.endAt].reduce((a, b) => {
    if (b - a < 24) fail("a shot is under 0.8s");
    return b;
  });
  f.shots.reduce((a, s) => {
    if (s.pct <= a) fail("the bar only goes up");
    return s.pct;
  }, 0);
  if (f.shots[f.shots.length - 1].pct !== 100) fail("the last shot is 100%");
  if (f.durationInFrames - (f.endAt + f.endFade) < 75)
    fail("give the end card at least 2.5s");
  if (f.shots.some((s, i) => i > 0 && s.at - f.shots[i - 1].at < 24 + 12))
    fail("leave room for the wipe");
  if (f.music) {
    if (f.music.fadeFrom < f.endAt) fail("start the music fade on the end");
    if (f.music.startAt + f.durationInFrames > f.music.trimmedSeconds * 30)
      fail("the film is longer than the music");
  }
};
