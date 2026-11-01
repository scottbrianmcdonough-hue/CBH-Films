// "Craft": plain cuts, executed well (Scott: "better executions of simple cuts"). Every
// cut is a match: a shape, a position, a colour or a movement carries from one hotel to
// the next. Stills are cropped so the matched feature lands on the same point of the
// frame at the same size (`aim`), and push in around that point (`focus`), so it stays
// put through the cut; footage plays as it is. Hard cuts on the beat or the accent, a
// small name per hotel, the brand card to close.
// A reel can run on a clock (`time` on every shot): the hours roll on at each cut, so the
// cuts tell a day (the craft reel runs morning to morning), with an optional closing line.

export type CraftShot = {
  kind: "photo" | "video";
  src: string;
  size?: [number, number]; // photos: source size
  crop?: { cx: number; cy?: number; h?: number }; // photos: 9:16 crop in source pixels
  from?: number; // videos: in-point (s) and speed
  rate?: number;
  at: number; // the frame it cuts in
  push?: [number, number]; // zoom across the shot (around `focus`)
  focus?: [number, number]; // screen point the push holds still (the matched feature)
  tag?: { name: string; place: string };
  time?: string; // "HH:MM" on the clock while this shot plays
};

export type CraftSpec = {
  id: string;
  music: {
    src: string;
    trimmedSeconds: number;
    startAt: number;
    gain: number;
    fadeFrom: number;
  };
  durationInFrames: number;
  shots: CraftShot[];
  endAt: number; // the last shot starts to fade into the brand card
  endFade: number;
  close?: { line: string; at: number }; // a line over the last shot, from frame `at`
  watermark?: { src: string; size: [number, number]; x: number; y: number };
};

// Crop a still so a feature at source (fx, fy), `fd` pixels across, lands at screen
// (sx, sy) at `sd` pixels across. Throws if the crop would run off the photo.
export const aim = (
  size: [number, number],
  feature: [number, number, number],
  screen: [number, number, number],
): { cx: number; cy: number; h: number } => {
  const [sw, sh] = size;
  const [fx, fy, fd] = feature;
  const [sx, sy, sd] = screen;
  const k = sd / fd;
  const h = 1920 / k;
  const w = 1080 / k;
  const cx = fx - (sx - 540) / k;
  const cy = fy - (sy - 960) / k;
  if (
    cx - w / 2 < -1 ||
    cx + w / 2 > sw + 1 ||
    cy - h / 2 < -1 ||
    cy + h / 2 > sh + 1
  )
    throw new Error(
      `aim: crop ${Math.round(cx - w / 2)},${Math.round(cy - h / 2)} ${Math.round(w)}x${Math.round(h)} runs off a ${sw}x${sh} photo`,
    );
  return { cx: Math.round(cx), cy: Math.round(cy), h: Math.round(h) };
};

export const validateCraft = (f: CraftSpec) => {
  const fail = (msg: string) => {
    throw new Error(`${f.id}: ${msg}`);
  };
  if (f.shots[0]?.at !== 0) fail("the first shot starts the film");
  [...f.shots.map((s) => s.at), f.endAt].reduce((a, b) => {
    if (b - a < 24) fail("a shot is under 0.8s");
    return b;
  });
  const srcs = f.shots.map((s) => s.src);
  if (new Set(srcs).size !== srcs.length) fail("never use a picture twice");
  const times = f.shots.filter((s) => s.time);
  if (times.length && times.length !== f.shots.length)
    fail("a clock needs a time on every shot");
  times.forEach((s) => {
    if (!/^\d\d:\d\d$/.test(s.time!)) fail(`time ${s.time} is not HH:MM`);
  });
  const last = f.shots[f.shots.length - 1];
  if (f.close && (f.close.at < last.at + 12 || f.close.at > f.endAt - 30))
    fail("the closing line needs a second on the last shot");
  if (f.durationInFrames - f.endAt < 90) fail("give the end card at least 3s");
  if (f.music.fadeFrom < f.endAt) fail("start the music fade on the end card");
  if (f.music.startAt + f.durationInFrames > f.music.trimmedSeconds * 30)
    fail("the film is longer than the trimmed music");
};
