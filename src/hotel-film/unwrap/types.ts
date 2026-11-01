// "Unwrap": a gift reel (the Black Friday gift-voucher reel is the reference). Each reveal
// is the one signature move: a thin gold ribbon draws across the frame, then the frame
// splits along it and both halves peel back like gift wrap (black on the reverse, a gold
// cut edge), uncovering the next hotel underneath. Each peel is centred on a measured
// downbeat. The opening is a calm line (on black, or over a gift photo); each hotel is a
// section led by its real footage where there is some, stills in support, the shots inside
// it cut on the beat under one small name-and-location line; the last unwrap uncovers the
// gift (the voucher), and the usual end card follows on the same black.

export type UnwrapShot = {
  kind: "photo" | "video";
  src: string; // path inside public/
  // Photos: source size and the 9:16 crop in source pixels, pushed in 1.00 -> `push`.
  size?: [number, number];
  crop?: { cx: number; cy?: number; h?: number };
  // Videos (already 1080x1920): where to start (s) and how fast to play.
  from?: number;
  rate?: number;
  // A small name-and-place line for this shot alone (the showcase: one hotel per shot).
  tag?: { name: string; place: string };
};

// One hotel (or one chapter of hotels): its shots in order, hard cuts between them on
// beats (absolute frames).
export type UnwrapSection = {
  // The hotel, large, held over all its shots (the name broken into lines).
  label?: { name: string[]; place: string };
  // A short Cormorant line that plays off the pictures, held until `until` (absolute).
  line?: { text: string[]; until: number };
  shots: UnwrapShot[];
  cuts: number[];
};

export type UnwrapSpec = {
  id: string;
  music: {
    src: string;
    trimmedSeconds: number;
    startAt: number; // frames into the trimmed file where the film starts
    gain: number;
    fadeIn: number; // frames: soften the first note
    fadeFrom: number;
  };
  durationInFrames: number;
  ribbon: number; // frames the gold ribbon takes to draw across
  peel: number; // frames per peel (even), centred on its landing
  push: number; // the photos' push-in, e.g. 1.05
  // The downbeat each peel is centred on: one per unwrap (the opening, if any, into the
  // first section, each section into the next, the last into the gift or the end card).
  lands: number[];
  // Without an opening the film starts straight on the first section.
  opening?: { eyebrow?: string; lines: string[]; still?: UnwrapShot };
  sections: UnwrapSection[];
  gift?: {
    // The voucher: the real CBH artwork when supplied, else the black and gold card.
    art?: { src: string; size: [number, number] };
    card: { eyebrow: string; title: string[] };
    headline: string; // large, beneath the voucher
    small: string; // gold caps under it
  };
  endAt: number; // frame the end card arrives (the gift clears just before)
  // The usual end card; with no lines, the brand card: the shimmering logo and the address.
  endCard: { lines: string[]; location: string };
  // Grid-safe reel spec, over everything until the gift is unwrapped.
  watermark?: { src: string; size: [number, number]; x: number; y: number };
};

export const validateUnwrap = (f: UnwrapSpec) => {
  const fail = (msg: string) => {
    throw new Error(`${f.id}: ${msg}`);
  };
  const first = f.opening ? 1 : 0; // the scene index of the first section
  if (f.lands.length !== first + f.sections.length)
    fail("give one landing per unwrap: out of the opening and every section");
  if (f.peel % 2) fail("the peel needs an even frame count");
  const shots = f.sections.flatMap((s) => s.shots);
  shots.forEach((s, i) => {
    if (s.kind === "photo" && (!s.size || !s.crop))
      fail(`shot ${i + 1}: a photo needs its size and crop`);
    if (shots.some((o, j) => j !== i && o.src === s.src))
      fail(`shot ${i + 1}: never use the same picture twice`);
  });
  f.sections.forEach((sec, i) => {
    const k = first + i;
    const name = sec.label?.name.join(" ") ?? `section ${i + 1}`;
    if (!sec.label && sec.shots.some((s) => !s.tag))
      fail(`${name}: name the hotel, on the section or on every shot`);
    if (sec.cuts.length !== sec.shots.length - 1)
      fail(`${name}: give one cut between each pair of shots`);
    // Every shot holds at least 0.8s between cuts and peels.
    const from = k === 0 ? 0 : f.lands[k - 1] + f.peel / 2;
    const to = f.lands[k] - f.peel / 2;
    [from, ...sec.cuts, to].reduce((a, b) => {
      if (b - a < 24) fail(`${name}: a shot is under 0.8s`);
      return b;
    });
  });
  // Every scene needs a second clear on screen between being uncovered and the next
  // ribbon starting to draw.
  f.lands.forEach((land, k) => {
    const uncovered = k === 0 ? 0 : f.lands[k - 1] + f.peel / 2 + 2;
    const ribbon = land - f.peel / 2 - f.ribbon - 2;
    if (ribbon - uncovered < 30)
      fail(`scene ${k} needs at least 1s clear before its unwrap`);
  });
  const last = f.lands[f.lands.length - 1];
  if (f.gift && f.endAt - last < 90) fail("give the gift at least 3s");
  if (f.endAt < last) fail("the end card can't arrive before the last unwrap");
  if (f.durationInFrames - f.endAt < 90) fail("give the end card at least 3s");
  if (f.music.fadeFrom < f.endAt) fail("start the music fade on the end card");
  if (f.music.startAt + f.durationInFrames > f.music.trimmedSeconds * 30)
    fail("the film is longer than the trimmed music");
};
