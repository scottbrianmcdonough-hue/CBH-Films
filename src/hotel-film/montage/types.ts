// "Montage": a rhythm edit of hand-cropped 9:16 stills, hard cuts on the beat, every shot
// with the same gentle push-in, a small name-and-location label per hotel carried across
// its pair of shots, and a campaign end card. Plate to Pillow is the reference.

export type Crop = {
  cx: number; // crop centre in source pixels
  cy?: number; // default: the source's vertical centre
  h?: number; // crop height in source pixels (width is 9:16 of it); default full height
};

export type MontageShot = {
  src: string; // path inside public/
  size: [number, number]; // source width, height in pixels
  crop: Crop;
  // A pre-rendered Ken Burns clip of this still (scripts/kenburns.py: Pillow LANCZOS,
  // subpixel crops). When given, it plays in place of the CSS motion.
  clip?: string;
};

export type MontageHotel = {
  name: string;
  nameLines?: string[]; // how the name breaks in the label (default: one line)
  // When set, the label leads with the region (these lines, large) and the hotel name
  // sits small and gold beneath it, in place of the location.
  region?: string[];
  // Optional label lead-in: a small gold eyebrow above, and headline lines (large) in
  // place of the region or name; the hotel name then sits small and gold beneath.
  eyebrow?: string;
  headline?: string[];
  tier?: number; // for the rosette counter
  location: string;
  shots: MontageShot[]; // e.g. plate then pillow; the label stays up across them
};

export type MontageSpec = {
  id: string;
  // Optional while a track is being chosen: the film then renders silent.
  music?: {
    src: string;
    trimmedSeconds: number;
    startAt: number; // frames into the track where the film starts (a downbeat)
    gain: number;
    fadeFrom: number;
  };
  // Frame where each shot starts, then where the end card starts: beats from
  // scripts/analyze-beats.py, so every hard cut lands on one.
  cuts: number[];
  durationInFrames: number; // end on a beat
  pushIn: number; // zoom gained over each shot, e.g. 0.06
  // "push": a slow push-in across each shot (default). "settle": each still lands a
  // little zoomed in and eases back to dead still in a quarter-second, on the beat.
  // "static": a dead-still hold (when another move, like the iris, does the work).
  motion?: "push" | "settle" | "static";
  hook: { lines: string[]; shots: number }; // on screen from frame one for N shots
  // "cut": hard cuts (default). "iris": each new shot opens out from the centre of the
  // frame through an expanding circle, starting on its beat.
  reveal?: "cut" | "iris";
  // Optional rosette counter (top-left) in place of label eyebrows: each hotel's `tier`
  // drives a rolling numeral and a row of the rosettes awarded (no empty placeholders).
  counter?: { words: [string, string]; hook?: string };
  // Hide the gold rule that draws under each label.
  labelRule?: boolean;
  hotels: MontageHotel[];
  // "all": the label stays up across the hotel's shots. "last": plates stay clean and the
  // label lands on the hotel's last shot (the pillow) only.
  labelOn?: "all" | "last";
  // Optional CB watermark over the shots (not the end card): a transparent PNG placed at
  // x/y in frame pixels. With a watermark, the end card carries no separate CB mark.
  watermark?: { src: string; size: [number, number]; x: number; y: number };
  // End card: the official campaign artwork (preferred), or a lockup set in the house
  // fonts after it. Either way the CB mark sits below and everything stays inside the
  // central 4:5 grid area, above the Reels caption zone.
  endCard: {
    artwork?: {
      src: string; // the official 4:5 creative (rule painted out if `rule` is given)
      size: [number, number];
      // Optional: the artwork's own gold rule, redrawn once after the block lands (source
      // pixels). Leave out to show the artwork exactly as supplied.
      rule?: {
        y: number;
        height: number;
        x0: number;
        x1: number;
        color: string;
      };
    };
    // A brand card instead of an offer: lines on black over the animated CB logo with
    // its gold shimmer (for reels that feature hotels outside the offer).
    brand?: { lines: string[]; sub?: string };
    lockup?: {
      headline: [string, string];
      offer: string;
      price: { from: string; pounds: string; pence: string };
    };
  };
};

export const montageShots = (m: MontageSpec) =>
  m.hotels.flatMap((hotel, h) => hotel.shots.map((shot) => ({ shot, h })));

export const endCardStart = (m: MontageSpec) => m.cuts[m.cuts.length - 1];

export const validateMontage = (m: MontageSpec) => {
  const fail = (msg: string) => {
    throw new Error(`${m.id}: ${msg}`);
  };
  if (m.cuts.length !== montageShots(m).length + 1)
    fail("give one cut per shot plus the end card's start");
  [...m.cuts, m.durationInFrames].reduce((prev, cut, i) => {
    if (i > 0 && cut - prev < 24)
      fail("shots must be at least 0.8s (24 frames)");
    return cut;
  });
  if (m.cuts[0] !== 0) fail("the first shot starts on frame one");
  const srcs = montageShots(m).map(({ shot }) => shot.src);
  if (new Set(srcs).size !== srcs.length) fail("a photo is used twice");
  montageShots(m).forEach(({ shot }) => {
    const [w, h] = shot.size;
    const ch = shot.crop.h ?? h;
    const cw = (ch * 9) / 16;
    const cy = shot.crop.cy ?? h / 2;
    if (shot.crop.cx - cw / 2 < 0 || shot.crop.cx + cw / 2 > w)
      fail(`${shot.src}: crop runs off the side of the photo`);
    if (cy - ch / 2 < 0 || cy + ch / 2 > h)
      fail(`${shot.src}: crop runs off the top or bottom of the photo`);
  });
  const cards = [m.endCard.artwork, m.endCard.lockup, m.endCard.brand];
  if (cards.filter(Boolean).length !== 1)
    fail("give the end card one of: artwork, lockup or brand");
  if (m.durationInFrames - endCardStart(m) < 90)
    fail("the end card needs at least 3s on screen");
  if (m.music && m.music.fadeFrom < endCardStart(m))
    fail("start the music fade under the end card");
  if (
    m.music &&
    m.music.startAt + m.durationInFrames > m.music.trimmedSeconds * 30
  )
    fail("the film is longer than the trimmed music");
};
