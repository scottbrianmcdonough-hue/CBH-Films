// "Flipbook": a journal whose pages turn one by one (the Cosy Escapes reel is the
// reference). A cloth cover, then full-bleed photo pages (the whole 1080x1920 frame), each
// with a short Cormorant italic caption bottom-left over a soft scrim and the hotel small
// beneath, then a back page carrying the campaign artwork on the cloth. The page turn is
// the one signature move: the full frame curls away from the bottom-right corner with a
// soft shadow, every turn the same direction and speed, each landing on a downbeat.

export type FlipbookPage = {
  src: string; // path inside public/
  size: [number, number]; // source width, height in pixels
  crop: { cx: number; cy?: number; h?: number }; // 9:16 crop in source pixels
  caption: string[]; // one or two lines, set as written
  hotel: string;
  location: string;
};

export type FlipbookSpec = {
  id: string;
  music: {
    src: string;
    trimmedSeconds: number;
    startAt: number; // frames into the trimmed file where the film starts
    gain: number;
    fadeFrom: number;
  };
  durationInFrames: number;
  turn: number; // frames per page turn (even)
  // Frame each turn lands on (the next page lies flat): a measured downbeat. One per page
  // turned: the cover, then every photo page.
  lands: number[];
  cover: { eyebrow: string; title: string };
  pages: FlipbookPage[];
  back: { src: string; size: [number, number] }; // the campaign artwork, 4:5
  // Grid-safe reel spec, held still over the pages as they turn; off the back page.
  watermark?: { src: string; size: [number, number]; x: number; y: number };
};

export const validateFlipbook = (f: FlipbookSpec) => {
  const fail = (msg: string) => {
    throw new Error(`${f.id}: ${msg}`);
  };
  if (f.lands.length !== f.pages.length + 1)
    fail("give one landing per turn: the cover, then each photo page");
  if (f.turn % 2) fail("the turn needs an even frame count");
  [0, ...f.lands, f.durationInFrames].reduce((prev, land, i) => {
    if (i > 0 && land - prev - f.turn < 30)
      fail("every page needs at least 1s lying still");
    return land;
  });
  if (f.music.fadeFrom < f.lands[f.lands.length - 1])
    fail("start the music fade on the back page");
  if (f.music.startAt + f.durationInFrames > f.music.trimmedSeconds * 30)
    fail("the film is longer than the trimmed music");
};
