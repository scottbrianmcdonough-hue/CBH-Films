// The moving collage (Scott: "a dynamic squares, a moving collage", from an ad of rounded
// photo tiles over a scene): one photo fills the frame and rounded tiles of others sit over
// it; on each beat the layout moves: a tile grows to fill the frame and becomes the scene,
// the others slide and resize to new places, new tiles rise in and old ones sink away.
// One hotel a reel. A label over the opening scene, a question on the end card.

export type CollagePhoto = {
  src: string;
  // the point kept in view as the photo is cropped to any tile or the full frame, 0..1
  focus?: [number, number];
};

export type Rect = [number, number, number, number]; // x, y, w, h in frame px

// A tile's place in a layout, landing on the layout's beat or on its own (`at`), so tiles
// can arrive one hit at a time. `shoved`: the tile is knocked along by one sliding into
// its slot (Scott: "shift and slide", "and collide"): it sets off only when the other
// reaches it, at full pace, and slows into its new place on the same hit.
export type TilePlace = Rect | { rect: Rect; at?: number; shoved?: boolean };

export type CollageState = {
  beat: number; // the scene change (and any tile without its own `at`) lands on this beat
  scene: string; // the photo filling the frame
  tiles: Record<string, TilePlace>; // photos in tiles, in paint order (later on top)
  shovedOff?: string[]; // tiles knocked off the frame (rather than sliding off)
};

// (a plain Rect is an array, and arrays have an `at` method: test with Array.isArray)
export const placeRect = (t: TilePlace): Rect =>
  Array.isArray(t) ? t : t.rect;
export const placeAt = (t: TilePlace, beat: number) =>
  Array.isArray(t) ? beat : (t.at ?? beat);
export const placeShoved = (t: TilePlace) => !Array.isArray(t) && !!t.shoved;
// every landing beat in a layout
export const landings = (s: CollageState) => [
  s.beat,
  ...Object.values(s.tiles).map((t) => placeAt(t, s.beat)),
];

export type CollageSpec = {
  id: string;
  beat: number; // frames per beat
  move: number; // frames each move takes, settling 3 frames after its hit
  photos: Record<string, CollagePhoto>;
  states: CollageState[];
  label: { eyebrow: string; name: string; until: number }; // over the opening; beat it leaves
  // The ending: one tile flies up out of the wall to fill the frame (`zoom`: it sets off
  // on `from` and fills the frame on `land`, beats), the wall dropping into shadow behind
  // it; it fades to black, black by `beat`, where the question ("\n" breaks it) rises.
  end: {
    beat: number;
    line: string;
    zoom?: { tile: string; from: number; land: number };
  };
  endBeat: number;
  music?: { src: string; startAt: number; gain: number; seconds: number };
};

export const collageFrames = (f: CollageSpec) => Math.round(f.endBeat * f.beat);

export const validateCollage = (f: CollageSpec) => {
  const fail = (msg: string) => {
    throw new Error(`${f.id}: ${msg}`);
  };
  f.states.forEach((s, i) => {
    if (!f.photos[s.scene]) fail(`no photo ${s.scene}`);
    Object.keys(s.tiles).forEach((k) => !f.photos[k] && fail(`no photo ${k}`));
    if (
      i &&
      Math.min(...landings(s)) * f.beat - f.move <
        Math.max(...landings(f.states[i - 1])) * f.beat
    )
      fail(`layout ${i} starts moving before layout ${i - 1} has landed`);
  });
  if (f.music && f.music.startAt + collageFrames(f) > f.music.seconds * 30)
    fail("the film is longer than the music");
};
