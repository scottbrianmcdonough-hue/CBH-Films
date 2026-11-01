// "Match cut": a plate reel where every cut is a match cut on the plate (the Foodie Breaks
// "one plate, ten kitchens" reel is the reference). Each still's plate rim is found
// (scripts/plate-rim.py), levelled and scaled so its width and centre land on the same
// target at frame centre, and the photo's surface is extended and defocused where it
// doesn't reach the 9:16 frame (scripts/plate-match.py). One continuous push-in runs
// across all the plates, so the rim stays put across every hard cut on the beat while the
// food and the hotel change. A small name-and-location label cuts with each plate, an
// opening line sits over the first, and the house end card (offer line over the official
// CBH logo with its shimmer) follows on black.

export type Rim = {
  cx: number; // rim centre in source pixels
  cy: number;
  a: number; // semi-major axis, source pixels
  b: number; // semi-minor axis
  angle: number; // major axis angle from horizontal, degrees (plate-rim.py)
};

export type MatchPlate = {
  hotel: string[]; // the hotel's full name as CBH lists it, broken into lines
  location?: string; // shown under the name (required unless a flick)
  // A quick flick near the end: an eighth note on screen, no label (just plates), and the
  // plate enlarged to fill the frame with the photo (plate-match.py --cover), since at
  // that speed the rim only has to be roughly in place.
  flick?: boolean;
  src: string; // the photo, inside public/
  size: [number, number];
  rim: Rim;
  // Where the photo can't fill the frame at the shared rim size, a plate may sit a little
  // larger (`d`, rim width at zoom 1) or lower (`dy`, px below frame centre) so less of the
  // frame needs the defocused fill. Defaults: the target's d, 0.
  d?: number;
  dy?: number;
  // The pre-rendered shot (scripts/plate-match.py) for this plate's frames.
  clip: string;
};

export type MatchCutSpec = {
  id: string;
  music: {
    src: string;
    trimmedSeconds: number;
    startAt: number; // frames into the trimmed file where the film starts (a downbeat)
    gain: number;
    fadeFrom: number;
  };
  // The shared rim target the clips were rendered to: its width on screen at zoom 1, and
  // the push-in gained over `pushOver` film frames (from frame 0, carried across cuts).
  target: { d: number; push: number; pushOver: number };
  // The spin through each cut between labelled plates (plate-match.py --spin, --punch,
  // --spin-in/--spin-out): degrees each side, push-in at the cut, frames each side. The
  // labels land as it settles.
  spin: { deg: number; punch: number; frames: number };
  opening: { line: string }; // set on frame one over the first plate
  plates: MatchPlate[];
  // Frame where each plate starts, then where the end card starts (measured beats).
  cuts: number[];
  durationInFrames: number;
  // CB watermark over the plates (not the end card), at the vertical reel spec.
  watermark: { src: string; size: [number, number]; x: number; y: number };
  // The house end card: lines in Cormorant over a gold caps line, then the official CBH
  // logo with the shimmer crossing the CB monogram.
  endCard: { lines: string[]; sub: string };
};

export const endCardStart = (m: MatchCutSpec) => m.cuts[m.cuts.length - 1];

export const validateMatchCut = (m: MatchCutSpec) => {
  const fail = (msg: string) => {
    throw new Error(`${m.id}: ${msg}`);
  };
  if (m.cuts.length !== m.plates.length + 1)
    fail("give one cut per plate plus the end card's start");
  if (m.cuts[0] !== 0) fail("the first plate starts on frame one");
  m.cuts.slice(1).forEach((cut, i) => {
    // Plates hold long enough to register (the client dislikes frantic cutting); only the
    // flick (Scott's idea) runs faster, an eighth note a plate.
    const min = m.plates[i].flick ? 8 : 18;
    if (cut - m.cuts[i] < min)
      fail(`${m.plates[i].src} must hold at least ${min} frames`);
  });
  m.plates.forEach((p) => {
    if (!p.flick && !p.location)
      fail(`${p.src}: give the location for its label`);
  });
  const srcs = m.plates.map((p) => p.src);
  if (new Set(srcs).size !== srcs.length) fail("a photo is used twice");
  if (m.target.pushOver !== endCardStart(m))
    fail("the push-in should run to the end card (pushOver = end card start)");
  if (m.durationInFrames - endCardStart(m) < 90)
    fail("the end card needs at least 3s on screen");
  if (m.music.fadeFrom < endCardStart(m))
    fail("start the music fade under the end card");
  if (m.music.startAt + m.durationInFrames > m.music.trimmedSeconds * 30)
    fail("the film is longer than the trimmed music");
};
