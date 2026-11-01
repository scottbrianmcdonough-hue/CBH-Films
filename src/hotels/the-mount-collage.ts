import type { CollageSpec, Rect } from "../hotel-film/collage/types";

// The Mount, as a moving tile wall (Scott: "the collage moving squares" with shots "like
// The Mount"). Scott's photos of The Mount Country Manor Hotel (the name on its own sign),
// Wolverhampton, and its golf club (the pavilion is signed "The Mount Golf and Country
// Club"): the aerial opens with the label, then the house, garden, conservatory
// restaurant, the food, the rooms, the bar, the bathroom and the golf, every photo entering
// once; the chocolate pudding flies up to fill the frame, to black, "Pudding first, / or the
// four-poster?" (was over the blurred wall, which Scott found abrupt; the line was "Which
// square / would you pick?": Scott wasn't sure). Left out: the pizza (generic) and the
// adventure golf (busy, people's faces).
// Music: "Cooking Groove" by kissan4 (Pixabay; Scott's pick; also the Foodie Breaks Story's
// track), from the downbeat after its breakdown (the trimmed WAV, 60 frames in), to the
// end of the file.

const M = "hotels/the-mount";
// Tiles, not cards (Scott: "we did cards already"): a 2 x 3 grid with even 16px gutters
// inside the safe area, every tile one cell, sliding square to square like a puzzle.
const col = [40, 548];
const row = [250, 655, 1060]; // the bottom row ends at 1449, clear of the CB mark (1452)
const R = (r: number, c: number): Rect => [col[c], row[r], 492, 389];

export const theMountCollage: CollageSpec = {
  id: "the-mount-collage",
  beat: 16.364, // Cooking Groove, 110 BPM
  move: 10, // a quick slide, fastest just before the hit, settled 3 frames after it
  photos: {
    aerial: { src: `${M}/aerial.jpg`, focus: [0.55, 0.45] },
    entrance: { src: `${M}/entrance.jpg`, focus: [0.48, 0.6] },
    horse: { src: `${M}/garden-horse.jpg`, focus: [0.2, 0.6] },
    conservatory: {
      src: `${M}/conservatory-restaurant.jpg`,
      focus: [0.5, 0.45],
    },
    steak: { src: `${M}/steak-dinner.jpg`, focus: [0.62, 0.7] },
    fondant: { src: `${M}/chocolate-fondant.jpg`, focus: [0.42, 0.5] },
    breakfast: { src: `${M}/full-breakfast.jpg`, focus: [0.45, 0.6] },
    bed: { src: `${M}/four-poster.jpg`, focus: [0.7, 0.5] },
    fish: { src: `${M}/fish-and-chips.jpg`, focus: [0.5, 0.4] },
    grounds: { src: `${M}/aerial-grounds.jpg`, focus: [0.5, 0.5] },
    bar: { src: `${M}/bar-lounge.jpg`, focus: [0.45, 0.55] },
    attic: { src: `${M}/attic-suite.jpg`, focus: [0.35, 0.6] },
    bath: { src: `${M}/bathroom.jpg`, focus: [0.35, 0.6] },
    gold: { src: `${M}/bedroom-gold-wallpaper.jpg`, focus: [0.55, 0.5] },
    golfer: { src: `${M}/golfer.jpg`, focus: [0.33, 0.5] },
    course: { src: `${M}/golf-course.jpg`, focus: [0.5, 0.55] },
    striped: { src: `${M}/attic-bedroom.jpg`, focus: [0.3, 0.55] },
    pavilion: { src: `${M}/golf-club-pavilion.jpg`, focus: [0.45, 0.42] },
    grey: { src: `${M}/bedroom-grey.jpg`, focus: [0.3, 0.5] },
    round: { src: `${M}/bedroom-round-table.jpg`, focus: [0.4, 0.55] },
  },
  // Shift, slide and collide to Cooking Groove's own accents (Scott: "more matched to the
  // music", "shift and slide", "and collide"): a tile slides in from the side and shoves
  // its row along, sometimes knocking the end tile off the frame; a tile grows into the
  // scene on the big hits; everything holds through the stop (9.5-11) and the quiet bar
  // (13.5-15); the bottom row stays clear while the label is up. The track runs on to
  // the end of the file (Scott: "it doesn't have to be 15 seconds"), and every photo
  // enters once (Scott sent more: rooms, the bar, the bathroom, the golf club).
  states: [
    { beat: 0, scene: "aerial", tiles: {} },
    { beat: 1, scene: "aerial", tiles: { entrance: R(0, 0) } },
    { beat: 2, scene: "aerial", tiles: { entrance: R(0, 0), horse: R(1, 1) } },
    {
      beat: 3.5,
      scene: "aerial",
      tiles: {
        conservatory: R(0, 0),
        entrance: { rect: R(0, 1), shoved: true },
        horse: R(1, 1),
      },
    },
    {
      beat: 4.5,
      scene: "entrance",
      tiles: {
        conservatory: R(0, 0),
        horse: { rect: R(1, 0), shoved: true },
        steak: R(1, 1),
      },
    },
    {
      beat: 5.5,
      scene: "entrance",
      tiles: {
        fondant: R(0, 0),
        conservatory: { rect: R(0, 1), shoved: true },
        horse: R(1, 0),
        steak: R(1, 1),
      },
    },
    {
      beat: 7.5,
      scene: "conservatory",
      tiles: {
        fondant: R(0, 0),
        steak: { rect: R(1, 0), shoved: true },
        breakfast: R(1, 1),
      },
      shovedOff: ["horse"],
    },
    {
      beat: 9,
      scene: "conservatory",
      tiles: {
        fondant: R(0, 0),
        steak: R(1, 0),
        breakfast: R(1, 1),
        bed: R(2, 0),
      },
    },
    {
      beat: 12,
      scene: "steak",
      tiles: {
        fondant: R(0, 0),
        breakfast: R(1, 1),
        fish: R(2, 0),
        bed: { rect: R(2, 1), shoved: true },
      },
    },
    {
      beat: 15.5,
      scene: "breakfast",
      tiles: {
        fondant: R(0, 0),
        fish: R(2, 0),
        bed: R(2, 1),
        bar: { rect: R(0, 1), at: 16.5 },
      },
    },
    {
      beat: 17.5,
      scene: "fish",
      tiles: {
        fondant: R(0, 0),
        bar: R(0, 1),
        bed: R(2, 1),
        attic: { rect: R(1, 0), at: 18 },
      },
    },
    {
      beat: 20.5,
      scene: "bed",
      tiles: {
        fondant: R(0, 0),
        bar: R(0, 1),
        attic: R(1, 0),
        bath: { rect: R(2, 0), at: 21.5 },
        gold: { rect: R(1, 1), at: 22 },
      },
    },
    {
      beat: 23.5,
      scene: "bed",
      tiles: {
        course: R(0, 0),
        fondant: { rect: R(0, 1), shoved: true },
        attic: R(1, 0),
        gold: R(1, 1),
        bath: R(2, 0),
      },
      shovedOff: ["bar"],
    },
    {
      beat: 26,
      scene: "course",
      tiles: {
        fondant: R(0, 1),
        attic: R(1, 0),
        gold: R(1, 1),
        bath: R(2, 0),
      },
    },
    {
      beat: 28,
      scene: "course",
      tiles: {
        golfer: R(0, 0),
        fondant: R(0, 1),
        attic: R(1, 0),
        gold: R(1, 1),
        bath: R(2, 0),
        striped: { rect: R(2, 1), at: 28.5 },
      },
    },
    {
      beat: 29.5,
      scene: "course",
      tiles: {
        golfer: R(0, 0),
        fondant: R(0, 1),
        attic: R(1, 0),
        gold: R(1, 1),
        pavilion: R(2, 0),
        bath: { rect: R(2, 1), shoved: true },
      },
      shovedOff: ["striped"],
    },
    {
      beat: 31.5,
      scene: "gold",
      tiles: {
        golfer: R(0, 0),
        fondant: R(0, 1),
        attic: R(1, 0),
        pavilion: R(2, 0),
        bath: R(2, 1),
        grey: { rect: R(1, 1), at: 32.5 },
      },
    },
    {
      beat: 34,
      scene: "pavilion",
      tiles: {
        golfer: R(0, 0),
        fondant: R(0, 1),
        attic: R(1, 0),
        grey: R(1, 1),
        bath: R(2, 1),
        round: { rect: R(2, 0), at: 35.5 },
      },
    },
    {
      beat: 37.5,
      scene: "pavilion",
      tiles: {
        golfer: R(0, 0),
        fondant: R(0, 1),
        grounds: R(1, 0),
        attic: { rect: R(1, 1), shoved: true },
        round: R(2, 0),
        bath: R(2, 1),
      },
      shovedOff: ["grey"],
    },
  ],
  label: {
    eyebrow: "Wolverhampton",
    // the full name (Scott): The Mount Country Manor Hotel & Golf, on three lines
    name: "The Mount\nCountry Manor\nHotel & Golf",
    until: 5.5, // held about 3s (Scott: "too quick to read")
  },
  // The ending (Scott: the blurred wall was "kind of abrupt"): the fondant flies up out of
  // the wall from 38.5 and fills the frame on the 39.5 kick, holds a beat, then to black on
  // 40.5, where the question rises.
  end: {
    beat: 40.5,
    line: "Pudding first,\nor the four-poster?", // not "Fondant": the photo may not be one (Scott)
    zoom: { tile: "fondant", from: 38.5, land: 39.5 },
  },
  endBeat: 43.5, // 23.7s, to the end of the trimmed track (the music fades over the last bar)
  music: {
    src: "campaigns/foodie-match-cut/cooking-groove.wav",
    startAt: 60,
    gain: 1, // already ~-15 LUFS
    seconds: 26,
  },
};

// The same wall on Scott's two other tracks (beats are the timeline, so the moves land on
// each track's own beat). Bring Back the Swing (Upbeat Jazz) by EvolvingVibes (Pixabay
// 617230): 120 BPM, from 7.38s where the bass walks in; Funk Jazz Shuffle Groove by
// Catch22Music (Pixabay 358859): 110 BPM, from its phrase start at 3.88s. Both levelled
// to the Cooking Groove cut (~-15 LUFS).
export const theMountCollageSwing: CollageSpec = {
  ...theMountCollage,
  id: "the-mount-collage-swing",
  beat: 15,
  music: {
    src: "campaigns/the-mount/bring-back-the-swing.mp3",
    startAt: 222,
    gain: 0.45,
    seconds: 140,
  },
};

// Funk Jazz Shuffle, retimed to its own hits (Scott's pick of the three after the
// comparison; Cooking Groove already went out on the Foodie Breaks Story). A shuffle
// swings: its off-beats fall two-thirds of the way through the beat (onset strength 0.50
// there against 0.08 halfway), so every half-beat move moves to a strong beat or a swung
// "and" (n + 2/3). The big kicks take the scene changes and collisions (the heaviest, beat
// 32, the pavilion shoving the row), the quieter beats 10-12 and 26-27 are held, and the
// fondant flies up from 39 to fill the frame on the 40 kick, black on 41 2/3.
const T = (n: number) => n + 2 / 3; // the swung "and" after beat n
const SHUFFLE: Record<number, number> = {
  1: 1,
  2: 2,
  3.5: T(3),
  4.5: 5,
  5.5: 6,
  7.5: 9,
  9: T(9),
  12: 13,
  15.5: T(15),
  16.5: 17,
  17.5: 19,
  18: T(19),
  20.5: 21,
  21.5: 22,
  22: T(23),
  23.5: 25,
  26: 28,
  28: 29,
  28.5: 30,
  29.5: 32,
  31.5: 34,
  32.5: 35,
  34: 36,
  35.5: 37,
  37.5: 38,
};
const retime = (
  states: CollageSpec["states"],
  map: Record<number, number>,
): CollageSpec["states"] => {
  const to = (b: number) => {
    if (b === 0) return 0;
    if (map[b] === undefined) throw new Error(`no retimed beat for ${b}`);
    return map[b];
  };
  return states.map((st) => ({
    ...st,
    beat: to(st.beat),
    tiles: Object.fromEntries(
      Object.entries(st.tiles).map(([k, t]) => [
        k,
        Array.isArray(t) || t.at === undefined ? t : { ...t, at: to(t.at) },
      ]),
    ),
  }));
};

export const theMountCollageShuffle: CollageSpec = {
  ...theMountCollage,
  id: "the-mount-collage-shuffle",
  beat: 16.364, // 110 BPM
  states: retime(theMountCollage.states, SHUFFLE),
  end: {
    ...theMountCollage.end,
    beat: T(41),
    zoom: { tile: "fondant", from: 39, land: 40 },
  },
  // the line holds ~3s on black (Scott: "end card needs to hold longer"), the music fading
  // over the last four beats
  endBeat: 47.5,
  music: {
    src: "campaigns/the-mount/funk-jazz-shuffle.mp3",
    startAt: 115, // 3.83s: its phrase start, the kick on beat 0
    gain: 0.81,
    seconds: 193,
  },
};
