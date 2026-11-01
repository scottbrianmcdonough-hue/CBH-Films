// "Journey": a gold thread across a dark map of Britain, hotel to hotel (the CBH journey
// reel is the reference). The coastline draws in and the pins pop up; then the thread
// travels the route, the camera following its head and trailing gold sparks. On each
// downbeat it reaches a pin, which bursts, and the hotel's footage or photo opens out of
// the pin to fill the frame; as the thread moves on, the shot folds back into its pin. At
// the end the thread carries on past the last hotel as the camera pulls back to the whole
// route, and its glowing head becomes the CB logo.
// One move, no beat pulse, minimal text (one opening line, a small name per hotel).

export type JourneyShot = {
  kind: "photo" | "video";
  src: string; // path inside public/
  size?: [number, number]; // photos: source size and 9:16 crop in source pixels
  crop?: { cx: number; cy?: number; h?: number };
  from?: number; // videos (1080x1920): in-point (s) and speed
  rate?: number;
};

export type JourneyStop = {
  shot: JourneyShot;
  tag: { name: string; place: string };
};

// Built by scripts/britain-map.mjs: coastlines and pins projected into the frame, and the
// thread sampled as [x, y, running length].
export type JourneyMap = {
  uk: string;
  ireland: string;
  pins: { id: string; x: number; y: number; at: number }[];
  thread: number[][]; // [x, y, running length]
  // More of the collection, lit at the end by sparks from the thread's head.
  extras?: { id: string; x: number; y: number }[];
};

export type JourneySpec = {
  id: string;
  music: {
    src: string;
    trimmedSeconds: number;
    startAt: number;
    gain: number;
    fadeIn: number;
    fadeFrom: number;
    // cuts in the music: from film frame `at`, play the file from `from` seconds (on beats, so
    // the groove runs on; the journey's ending, Scott 1 Nov: it "loses energy right at the light
    // logo bloom", so the outro's thin bars are swapped for more groove and the drop)
    edits?: { at: number; from: number }[];
  };
  durationInFrames: number;
  map: JourneyMap;
  intro: { lines: string[]; dive: number }; // the camera dives to the first pin from `dive`
  lands: number[]; // one per stop: the downbeat its shot opens out of the pin
  travel: number; // frames the thread takes between pins (ending on the next downbeat)
  zoom: number; // camera zoom on the map at a pin
  push: number; // the photos' push-in
  stops: JourneyStop[];
  // A Story on the full map: the pin each stop opens out of (indexes into map.pins); the
  // thread runs through every pin, but only these open a shot.
  stopPins?: number[];
  pullBack: number; // the camera pulls back to the whole map
  // The thread reaches its end and the head bursts, sparks flying out to light every
  // other hotel in the collection (the map's extras).
  scatter: number;
  endAt: number; // the lights lift off the map and fly into the CB
  beat?: number; // frames per beat (the ending is timed in beats)
  watermark?: { src: string; size: [number, number]; x: number; y: number };
};

export const validateJourney = (f: JourneySpec) => {
  const fail = (msg: string) => {
    throw new Error(`${f.id}: ${msg}`);
  };
  if (f.stops.length !== f.lands.length) fail("give one landing per stop");
  if (!f.stopPins && f.stops.length !== f.map.pins.length)
    fail("the map has a pin per stop");
  if (f.stopPins && f.stopPins.length !== f.stops.length)
    fail("give one pin per stop");
  const srcs = f.stops.map((s) => s.shot.src);
  if (new Set(srcs).size !== srcs.length) fail("never use a picture twice");
  f.stops.forEach((s, i) => {
    if (s.shot.kind === "photo" && (!s.shot.size || !s.shot.crop))
      fail(`stop ${i + 1}: a photo needs its size and crop`);
  });
  f.lands.forEach((l, i) => {
    const next = f.lands[i + 1] ?? f.pullBack + f.travel;
    if (next - l - f.travel < 30)
      fail(
        `stop ${i + 1} needs a second full frame before the thread moves on`,
      );
  });
  if (f.intro.dive + 20 > f.lands[0]) fail("give the dive time to land");
  if (f.scatter < f.pullBack + 20 || f.endAt < f.scatter + 30)
    fail("let the thread arrive, then the sparks land, before the logo");
  if (f.durationInFrames - f.endAt < 75) fail("give the end card 2.5s");
  if (f.music.fadeFrom < f.endAt) fail("start the music fade on the end card");
  const last = f.music.edits?.[f.music.edits.length - 1];
  const end = last
    ? last.from * 30 + f.durationInFrames - last.at
    : f.music.startAt + f.durationInFrames;
  if (end > f.music.trimmedSeconds * 30)
    fail("the film is longer than the trimmed music");
};
