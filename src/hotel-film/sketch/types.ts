// "Sketch": every shot starts as a pencil drawing on cream paper that draws itself on,
// then the photo floods in like a watercolour wash (Holdsworth House is the reference).
// The clips are pre-rendered by scripts/sketch-wash.py; the film cuts them on downbeats,
// pencils a short note onto the paper as it is drawn (written on left to right, washed
// away as the colour arrives), and closes on the usual end card. A Story is the same
// thing with one shot and one fact: the fact is written, and the colour brings it to life.

export type SketchNote = {
  lines: string[];
  write: [number, number]; // frames (in the shot) over which the pencil writes it
  fade: [number, number]; // frames over which the wash takes it away
  top?: number; // px from the top of the frame
  align?: "left" | "right"; // set against the left or right margin
  inset?: number; // its distance from that edge, px (else 84)
  size?: number; // font size, px
  // "clear": a soft clearing in the drawing behind it (for busy areas); "open": written
  // straight onto open paper (sky, wall), no clearing.
  ground?: "clear" | "open";
  // Stay on after the wash so the fact is the last thing seen: "pencil" keeps the
  // handwriting as it is (reads best over light skies and walls); "cream" turns it to
  // cream with a soft shadow (for dark photos). Otherwise the colour washes it away.
  stay?: "pencil" | "cream";
};

export type SketchShot = {
  src: string; // a clip made by scripts/sketch-wash.py
  at: number; // the frame it cuts in (a downbeat)
  note?: SketchNote;
  // A steady push over the whole shot, drawing and photo together (the note stays put):
  // scale from and to at an even speed, about `origin` (CSS transform-origin).
  push?: { scale: [number, number]; origin: string };
  // The push scripts/sketch-to-life.py bakes into the clip from its life phase (scale +rate
  // a frame from clip frame `from`, about the centre), cancelled here so `push` alone sets
  // the speed: baked in, it started with a jolt and doubled the zoom mid-shot.
  clipPush?: { from: number; rate: number };
  // A boil on the lines while they are drawn (a hand-drawn wobble redrawn ten times a
  // second): px of displacement, full until `from`, gone by `to` (shot frames).
  boil?: { px: number; from: number; to: number };
  // Once the photo has settled (`from`, a clip frame with no lines left), a still of that
  // frame takes over; with `fg`/`bg` (scripts/sky-parallax.py) the ground rises and comes
  // closer over the sky, scaling about `origin`, still moving at the cut.
  hold?: {
    src: string;
    fg?: string;
    bg?: string;
    sky?: string; // the inverse of fg's alpha: the clip's own sky while it is split
    origin?: string;
    from: number;
    // with layers, the depth move starts here (a shot frame before `from`, so it is already
    // under way as the photo is revealed): the clip itself is split by the fg cut-out
    // until the stills take over (Scott: it "starts now after and is weird")
    depthFrom?: number;
  };
};

export type SketchSpec = {
  id: string;
  music: {
    src: string;
    trimmedSeconds: number;
    startAt: number;
    gain: number;
    fadeFrom: number;
  };
  durationInFrames: number;
  shots: SketchShot[];
  endAt: number; // the last shot starts to fade into the end card (a downbeat)
  endFade: number; // frames of that fade
  endCard: { lines: string[]; location: string };
  // The end card drawn on the paper instead of the house card on black: the CB inked
  // then washed gold, the place in gold caps, the name written in.
  // The hotel's place and name are written first, then the CB is drawn under them. Its
  // two moments sit on the track: `land`, the frame (from `endAt`) the gold wash lands, and
  // `shimmer`, the frame the shimmer starts; the rest of the timing stretches between them.
  drawnEnd?: { paper: string; land: number; shimmer: number };
  watermark?: { src: string; size: [number, number]; x: number; y: number };
};

export const validateSketch = (f: SketchSpec) => {
  const fail = (msg: string) => {
    throw new Error(`${f.id}: ${msg}`);
  };
  if (f.shots[0]?.at !== 0) fail("the first shot starts the film");
  [...f.shots.map((s) => s.at), f.endAt].reduce((a, b) => {
    if (b - a < 60) fail("give every shot at least 2s to draw and wash");
    return b;
  });
  if (f.durationInFrames - f.endAt < 90) fail("give the end card at least 3s");
  if (f.music.fadeFrom < f.endAt) fail("start the music fade on the end card");
  if (f.music.startAt + f.durationInFrames > f.music.trimmedSeconds * 30)
    fail("the film is longer than the trimmed music");
};
