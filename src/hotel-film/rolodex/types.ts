// "Rolodex": the collection as a card file. Every hotel is a cream index card, filed A to
// Z on a turning drum (the first card of each letter carries its tab). The drum riffles at
// shutter speed, the names flicking past, then slows and lands on a card, which opens out
// into that hotel's footage; the footage folds back into the card and the riffle runs on.
// The last card in the file is ours (a closing line), then the CB logo.
// The riffle shows the whole collection without a count; landings are on bar starts.

export type RolodexCard = { name: string; place: string; sortAs?: string };

export type RolodexShot = {
  kind: "photo" | "video";
  src: string;
  size?: [number, number]; // photos: source size and 9:16 crop in source pixels
  crop?: { cx: number; cy?: number; h?: number };
  from?: number; // videos (1080x1920): in-point (s)
};

export type RolodexLanding = {
  card: string; // the card's name
  open: number; // the frame the card opens out into the shot (a bar start)
  close: number; // the frame it starts folding back
  shot: RolodexShot;
};

export type RolodexSpec = {
  id: string;
  music: {
    src: string;
    trimmedSeconds: number;
    startAt: number;
    gain: number;
    fadeFrom: number;
  };
  durationInFrames: number;
  cards: RolodexCard[];
  landings: RolodexLanding[];
  last: { line: string; land: number }; // the closing card, landed on at `land`
  endAt: number; // the drum fades and the CB logo comes up
  watermark?: { src: string; size: [number, number]; x: number; y: number };
};

// Cards in filing order: by name, ignoring a leading "The".
export const filed = (cards: RolodexCard[]) =>
  [...cards].sort((a, b) =>
    (a.sortAs ?? a.name.replace(/^The /, "")).localeCompare(
      b.sortAs ?? b.name.replace(/^The /, ""),
    ),
  );

export const OPEN = 14; // frames for a card to open out (and to fold back)
export const SETTLE = 8; // frames a card rests before it opens

export const validateRolodex = (f: RolodexSpec) => {
  const fail = (msg: string) => {
    throw new Error(`${f.id}: ${msg}`);
  };
  const names = filed(f.cards).map((c) => c.name);
  if (new Set(names).size !== names.length) fail("a card is filed twice");
  let at = 0;
  let idx = -1;
  f.landings.forEach((l) => {
    const i = names.indexOf(l.card);
    if (i < 0) fail(`no card for ${l.card}`);
    if (i <= idx) fail("land on the cards in filing order");
    if (l.open - SETTLE - 20 < at) fail(`give the riffle to ${l.card} time`);
    if (l.close - l.open < OPEN + 45)
      fail(`hold ${l.card}'s shot at least 1.5s`);
    if (l.shot.kind === "photo" && (!l.shot.size || !l.shot.crop))
      fail(`${l.card}: a photo needs its size and crop`);
    idx = i;
    at = l.close + OPEN;
  });
  if (f.last.land - 20 < at) fail("give the last riffle time");
  if (f.endAt < f.last.land + 45) fail("let the last card be read");
  if (f.durationInFrames - f.endAt < 75) fail("give the end card 2.5s");
  if (f.music.fadeFrom < f.endAt) fail("start the music fade on the end card");
  if (f.music.startAt + f.durationInFrames > f.music.trimmedSeconds * 30)
    fail("the film is longer than the trimmed music");
};
