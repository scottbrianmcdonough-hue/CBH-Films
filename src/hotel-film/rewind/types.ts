// "Rewind": the clocks-go-back reel ("This Sunday has 25 hours"). The opening shots run
// backwards (a pour flows back up into the jug, a plate lifts away) while a clock runs back
// a minute at a time from 02:00; it lands on 01:00 on the downbeat as the footage snaps forward,
// carrying straight on from the same frame. Then the extra hour, spent slowly: one shot a
// bar, each with a short line and the hotel's name, a closing line on the last, and the CB
// logo. Shots are pre-cut by scripts/clocks-clips.py (trimmed, reversed, retimed to fill
// their slot), so the film only plays them in order.

export type RewindShot = {
  src: string; // a pre-cut clip, exactly as long as its slot (or longer)
  at: number; // the frame it cuts in
  line?: string; // italic line bottom-left, from the cut
  tag?: { name: string; place: string };
};

export type RewindSpec = {
  id: string;
  music: {
    src: string;
    trimmedSeconds: number;
    startAt: number; // frames into the track
    gain: number;
    fadeFrom: number;
  };
  durationInFrames: number;
  shots: RewindShot[];
  clock: {
    eyebrow: string;
    before: string; // "02:00" over the rewind
    after: string; // "01:00" from the snap
    lines: [string, string]; // under the clock, before and after the snap
    countFrom: number; // the clock starts running back (holding `before` until then)
    snapAt: number; // it lands on `after` here, as the footage turns forward
    until: number; // the clock block has faded by here
  };
  close: { lines: string[] }; // replaces the last shot's line
  endAt: number; // the last shot starts to fade into the logo
  endFade: number;
  watermark?: { src: string; size: [number, number]; x: number; y: number };
};

export const validateRewind = (f: RewindSpec) => {
  const fail = (msg: string) => {
    throw new Error(`${f.id}: ${msg}`);
  };
  if (f.shots[0]?.at !== 0) fail("the first shot starts the film");
  [...f.shots.map((s) => s.at), f.endAt].reduce((a, b) => {
    if (b - a < 24) fail("a shot is under 0.8s");
    return b;
  });
  if (!f.shots.some((s) => s.at === f.clock.snapAt))
    fail("the snap must land on a cut");
  if (!/^\d\d:\d\d$/.test(f.clock.before) || !/^\d\d:\d\d$/.test(f.clock.after))
    fail("clock readings are HH:MM");
  if (f.clock.snapAt - f.clock.countFrom < 60)
    fail("give the clock at least 2s to run back");
  if (f.durationInFrames - (f.endAt + f.endFade) < 75)
    fail("give the logo at least 2.5s");
  if (f.music.fadeFrom < f.endAt) fail("start the music fade on the end");
  if (f.music.startAt + f.durationInFrames > f.music.trimmedSeconds * 30)
    fail("the film is longer than the music");
};
