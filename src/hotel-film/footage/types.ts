// "Footage": a real-footage reel (the Ilsington pattern): the hotel's own clips lead,
// muted, then a few stills close, then a calm end card. One transition type throughout
// (a crossfade centred on each cut), calm text blocks that land after each crossfade with
// a thin gold rule drawing under them across the shot. Dalmahoy is the reference.

export type FootageClip = {
  kind: "video";
  src: string; // path inside public/ (audio stripped; played muted)
  from: number; // seconds into the clip where the shot starts (before its crossfade)
};

export type FootageStill = {
  kind: "still";
  src: string;
  size: [number, number]; // source width, height in pixels
  crop: { cx: number; cy?: number; h?: number }; // 9:16 crop, as in montage
  drift?: number; // Ken Burns: zoom gained across the shot, e.g. 0.12
  pan?: number; // Ken Burns: horizontal travel across the shot, in frame pixels
  shade?: number; // darken the lower half (0-1) so a label reads over a pale photo
};

export type FootageShot = (FootageClip | FootageStill) & {
  card?: { lines: string[]; small?: string }; // one fact (or a feeling line) per card
};

export type FootageSpec = {
  id: string;
  // Leave out for a silent render (the music is added in-app).
  music?: {
    src: string;
    trimmedSeconds: number;
    startAt: number; // frames into the trimmed file where the film starts (a downbeat)
    gain: number;
    fadeFrom: number;
  };
  // Frame where each shot after the first starts (a crossfade is centred on it), then the
  // end card's start (if any): measured beats, so every transition is on the music.
  cuts: number[];
  durationInFrames: number;
  crossfade: number; // frames, even
  shots: FootageShot[];
  // No price. logo: the official CBH logo, wiping up with its gold shimmer under the name;
  // "cb-shimmer" sweeps the CB monogram only, not the "Hotels & Resorts" line. rule: the gold rule drawing
  // under the name (default on). A Story can leave the end card off and carry the name in
  // `block` instead.
  endCard?: {
    lines: string[];
    location?: string;
    logo?: boolean | "cb-shimmer";
    // Frames after the card's text before the logo wipes up (default 30); a short card (a
    // Story) brings it in sooner so it holds before the end.
    logoDelay?: number;
    rule?: boolean;
    // The house label order (Scott, 20 Oct): the place in gold caps with its gold underline on
    // top, then the name in cream Cormorant.
    placeFirst?: boolean;
    // A title card instead of name and location: gold caps eyebrow, `lines` large, a
    // still gold rule, the tagline in italic (October Best Loved: the hook set again).
    title?: { eyebrow: string; tagline?: string };
  };
  // Frames (even) for the last shot to fade into the end card, if not `crossfade`: a slower
  // settle into black, the card's text arriving once the fade has finished.
  endFade?: number;
  watermark?: { src: string; size: [number, number]; x: number; y: number }; // shots only
  // Keep the watermark on through the end card (the white CB in the corner there too, with no
  // gold logo: Scott, 30 Oct, November Best Loved).
  watermarkOnEndCard?: boolean;
  // One text block held over every shot instead of per-shot cards: bottom-left over a
  // dark scrim pocket, arriving once at `at` (a rise and fade) with a static gold rule;
  // with `until`, it fades out from that frame (to clear the picture for a final beat).
  block?: {
    eyebrow: string;
    headline: string;
    line: string;
    at: number;
    until?: number;
  };
  // Small gold paw prints trotting from `from` to `to` (frame pixels) on the opening shot
  // (for a dog-friendly film), gone by frame ~80: start any `block` after them.
  paws?: { from: [number, number]; to: [number, number] };
  // A multi-hotel offer reel: the hook set on frame one over the opening shot (gone before
  // the first cut), then one block per hotel over its shots (`shots`: first and last shot
  // index): name, town in gold caps, a static gold rule, the offer name. Each block rises
  // and fades in as one piece once the hotel's first crossfade is mostly through, and fades
  // out before its last shot starts crossfading away, so it only sits over its own hotel.
  // The scrim pocket under them stays on across every shot (no pumping).
  hook?: { eyebrow: string; headline: string };
  // The house label order for the offer blocks: place in gold caps over its underline, the
  // name in cream Cormorant, the offer beneath (Scott, 30 Oct).
  offersPlaceFirst?: boolean;
  offers?: {
    shots: [number, number];
    name: string;
    place: string;
    offer: string;
  }[];
};

export const validateFootage = (f: FootageSpec) => {
  const fail = (msg: string) => {
    throw new Error(`${f.id}: ${msg}`);
  };
  if (f.cuts.length !== f.shots.length - (f.endCard ? 0 : 1))
    fail(
      "give one cut per shot after the first, plus the end card if there is one",
    );
  if (f.crossfade % 2 || (f.endFade ?? 0) % 2)
    fail("the crossfade and end fade need even frame counts");
  const bounds = [0, ...f.cuts, f.durationInFrames];
  // The transition after each section: the last one into an end card may be `endFade`.
  const tx = (i: number) =>
    f.endCard && f.endFade && i === bounds.length - 3 ? f.endFade : f.crossfade;
  bounds.slice(1).forEach((cut, i) => {
    const before = i > 0 ? tx(i - 1) / 2 : 0;
    const after = i < bounds.length - 2 ? tx(i) / 2 : 0;
    if (cut - bounds[i] - before - after < 30)
      fail("every shot needs at least 1s on screen alone");
  });
  if (f.music && f.endCard && f.music.fadeFrom < f.cuts[f.cuts.length - 1])
    fail("start the music fade under the end card");
  if (
    f.music &&
    f.music.startAt + f.durationInFrames > f.music.trimmedSeconds * 30
  )
    fail("the film is longer than the trimmed music");
  f.offers?.forEach(({ shots: [a, b], name }) => {
    if (a > b || b >= f.shots.length) fail(`${name}: shots out of range`);
    if (a === 0 && f.hook) fail(`${name}: the hook has the opening shot`);
  });
};
