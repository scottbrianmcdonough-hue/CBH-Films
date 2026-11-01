// The mixed format engine (Scott: "call these mixed reels"): stock clips (Pexels) mixed
// with the hotels' own images and footage. The stock shows the everyday version of a moment
// and cuts on the action into a hotel doing the same thing, nicer. The two sides get
// opposite looks: stock ("out") cold and drained, hotels ("in") in a warm autumn grade.
// Each hotel shot dissolves in on the beat and warms up from the cold look; cuts back to
// stock stay hard. One text block over the first pair: a top line held still across the cut
// while its second line swaps (e.g. "November" / "everywhere else" -> "at ours"); then no
// text until the end card's question. The first reel is `november-out-there`.

export type MixedClip = {
  kind: "video";
  src: string; // path inside public/ (played muted)
  from: number; // seconds into the clip where the shot starts
  rate?: number; // playback rate (slow a short clip to fill its slot)
  // where the 9:16 window sits across a wider clip, 0 (left) to 1 (right); default centre
  focusX?: number;
};

export type MixedStill = {
  kind: "still";
  src: string;
  size: [number, number]; // source width, height in pixels
  crop: { cx: number; cy?: number; h?: number }; // 9:16 window, source pixels
  push?: number; // zoom gained across the shot (default 0.05)
};

export type MixedShot = (MixedClip | MixedStill) & {
  side: "out" | "in";
  at: number; // beat the shot cuts in on
};

export type MixedSpec = {
  id: string;
  beat: number; // frames per beat
  downbeat: number; // frame of beat 0 (the first shot starts on frame 0)
  shots: MixedShot[];
  hook: { top: string; out: string; in: string }; // over the first two shots
  endCard: { at: number; line: string }; // beat; "\n" breaks the line
  endBeat: number; // the film ends on this beat
  music?: {
    src: string;
    seconds: number; // length of the file
    startAt: number; // frames into the file where the film starts
    gain: number;
    fadeFromBeat: number;
  };
};

export const beatFrame = (f: MixedSpec, b: number) =>
  Math.round(f.downbeat + b * f.beat);

export const mixedFrames = (f: MixedSpec) => beatFrame(f, f.endBeat);

export const validateMixed = (f: MixedSpec) => {
  const fail = (msg: string) => {
    throw new Error(`${f.id}: ${msg}`);
  };
  if (f.shots[0]?.at !== 0) fail("the first shot starts on beat 0");
  if (f.shots[0].side !== "out" || f.shots[1]?.side !== "in")
    fail("the hook needs an out shot then an in shot");
  const ats = [...f.shots.map((s) => s.at), f.endCard.at, f.endBeat];
  ats.slice(1).forEach((b, i) => {
    if (b <= ats[i]) fail("shots must be in beat order");
    const len = beatFrame(f, b) - beatFrame(f, ats[i]);
    if (len < 24) fail(`shot ${i} is under 0.8s`);
  });
  const srcs = f.shots.map((s) => s.src);
  if (new Set(srcs).size !== srcs.length) fail("a shot is used twice");
  if (f.music && f.music.startAt + mixedFrames(f) > f.music.seconds * 30)
    fail("the film is longer than the music");
};
