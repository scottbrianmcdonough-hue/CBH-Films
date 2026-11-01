// A hotel film is described entirely by data: swap the photos, copy and music
// timings to make a film for another hotel. See .claude/skills/hotel-film/SKILL.md.

// A slow camera move across a photo: scale is a zoom factor; x/y are the CSS
// object-position (%) used to pan within the photo.
export type Move = { scale: number; x: number; y: number };

// Opening title: the word (e.g. HYTHE) is cut out of a black page so the first photo
// shows through its letters, then the camera flies into a letter stroke and the page
// dissolves. Land zoomEnd on a downbeat; origin is a point inside a letter stroke.
export type WordIntroSpec = {
  word: string;
  sub: string;
  zoomStart: number;
  zoomEnd: number;
  origin: [number, number];
  fontSize?: number; // default 280; shrink for long words
  y?: number; // text baseline, default 700
  maxZoom?: number; // default 40; thinner strokes need more to fill the frame
};

export type PhotoSceneSpec = {
  kind: "photo";
  src: string; // path inside public/
  from: Move;
  to: Move;
  eyebrow?: string; // small gold capitals above the caption
  lines?: string[]; // caption, one entry per line (keep to 3 short lines)
  position?: "top" | "bottom"; // where the caption sits (default bottom)
  overlay?: "fizz"; // motion graphic drawn over the photo, under the caption
  captionDelay?: number; // frames to hold the caption back (e.g. until an intro lands)
  // Show the photo inside a gold-edged frame on black instead of full-bleed: for small or
  // landscape photos that would go soft if stretched to fill the screen.
  framed?: boolean;
};

export type TriptychSceneSpec = {
  kind: "triptych";
  // Three landscape photos stacked as wide strips. y is the vertical
  // object-position (%) that frames each one.
  photos: [TriptychPhoto, TriptychPhoto, TriptychPhoto];
  eyebrow: string;
  lines: string[];
};
export type TriptychPhoto = { src: string; y: number };

export type EndCardSpec = { kind: "end" };

export type SceneSpec = PhotoSceneSpec | TriptychSceneSpec | EndCardSpec;

// fade: crossfade. cover: the next scene builds over the previous one (use
// before a triptych). arch: Victorian arch reveal. rise: the end card slides up.
// seam: a gold hairline wipes the next scene in. split: the scene parts along the middle.
export type TransitionKind =
  | "fade"
  | "cover"
  | "arch"
  | "rise"
  | "seam"
  | "split";
export type TransitionSpec = { kind: TransitionKind; frames: number };

export type Hotel = {
  name: string; // "Hythe Imperial"
  subtitle?: string; // "Hotel, Golf & Spa"; leave out for a name-and-location end card
  location: string; // "Hythe, Kent"
};

export type FilmSpec = {
  id: string; // Remotion composition id; the render lands in out/<id>.mp4
  hotel: Hotel;
  music: {
    src: string; // path inside public/
    trimmedSeconds: number; // length of the trimmed file
    fadeFrom: number; // frame where the music starts fading to silence
    startAt?: number; // frames to skip into the track (e.g. to its first bar start)
    gain?: number; // volume multiplier to land around -15 LUFS (default 1)
  };
  durationInFrames: number; // end on a downbeat
  // Frames where each transition is centred: downbeats from scripts/analyze-beats.py.
  cuts: number[];
  scenes: SceneSpec[]; // one more than cuts
  transitions: TransitionSpec[]; // one per cut; even frame counts
  intro?: WordIntroSpec; // optional letter-mask opening over the first scene
  // Optional alternative opening: a gold line that opens like an aperture onto the
  // first scene, fully open on `land` (a downbeat). Use instead of `intro`.
  aperture?: { land: number };
  // Optional alternative opening: the first scene slides in as three full-height panels
  // that lock into one full-bleed shot on `land` (a downbeat). Use instead of the others.
  slices?: { land: number };
  // Optional CB watermark over the shots (not the end card): a transparent PNG placed at
  // x/y in frame pixels. Grid-safe reel spec: 100px wide, bottom edge at y=1560, 60px
  // right margin. With a watermark, the end card leaves off the CB logo (one or the other).
  watermark?: { src: string; size: [number, number]; x: number; y: number };
};

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

// Scene i runs from half a transition before its cut-in to half after its cut-out.
export const sceneDurations = (film: FilmSpec) => {
  const bounds = [0, ...film.cuts, film.durationInFrames];
  return film.scenes.map(
    (_, i) =>
      bounds[i + 1] -
      bounds[i] +
      (i > 0 ? film.transitions[i - 1].frames / 2 : 0) +
      (i < film.cuts.length ? film.transitions[i].frames / 2 : 0),
  );
};

// Fail loudly at load time rather than render a broken film.
export const validateFilm = (film: FilmSpec) => {
  const fail = (msg: string) => {
    throw new Error(`${film.id}: ${msg}`);
  };
  if (film.scenes.length !== film.cuts.length + 1)
    fail("there must be exactly one more scene than cuts");
  if (film.transitions.length !== film.cuts.length)
    fail("there must be one transition per cut");
  film.transitions.forEach((t, i) => {
    if (t.frames % 2) fail(`transition ${i} needs an even frame count`);
  });
  [0, ...film.cuts, film.durationInFrames].reduce((prev, cut) => {
    if (cut <= prev) fail("cuts must increase and end before the film ends");
    return cut;
  });
  sceneDurations(film).forEach((d, i) => {
    const solo =
      d -
      (i > 0 ? film.transitions[i - 1].frames : 0) -
      (i < film.cuts.length ? film.transitions[i].frames : 0);
    if (solo < 30) fail(`scene ${i} is on screen alone for under 1s`);
  });
  if (
    film.durationInFrames + (film.music.startAt ?? 0) >
    film.music.trimmedSeconds * FPS
  )
    fail("the film is longer than the trimmed music; re-trim the track");
  if (film.scenes[film.scenes.length - 1].kind !== "end")
    fail("the last scene must be the end card");
  const opened =
    film.intro?.zoomEnd ?? film.aperture?.land ?? film.slices?.land;
  if ([film.intro, film.aperture, film.slices].filter(Boolean).length > 1)
    fail("use one opening (intro, aperture or slices), not several");
  if (
    opened !== undefined &&
    opened + 45 > film.cuts[0] - film.transitions[0].frames / 2
  )
    fail(
      "the first scene needs at least 1.5s on screen after the opening lands",
    );
};
