import type {
  MatchCutSpec,
  MatchPlate,
  Rim,
} from "../hotel-film/matchcut/types";

// "One plate, ten kitchens", CBH Deliciously Autumn / Foodie Breaks: a plate match-cut
// montage. Every cut is a match cut on the plate rim, so the plate stays put while the
// food and the hotel change round it, under one slow push-in carried across the cuts.
// Stills only (Scott: no Fairlawns or Dalmahoy footage, already used in earlier reels).
//
// Plates: 14 supplied by Scott (each hotel's CBH gallery). Seven have their whole rim in
// the photo and carry the labelled match cuts. Six whose rims run off the photo flick
// past near the end, an eighth note each with no label (Scott: "a rapid flick through at
// the end, without text so it's just plates"): Rutland Hall, Frensham Pond, The Wild
// Boar, Imperial Hotel, Haycock Manor (Prévost) and Speech House's dessert. Whittlebury
// Park is out (its plate runs off the bottom of a small photo); Langshott Manor's photo
// never arrived. Batch 2 arrived in
// a different order from the list: the Gisborough Hall menu in shot fixes that plate, and
// the duck is Waterton Park by elimination (to confirm with Scott). Order: alternating
// dark and light plates, the rims going from a tilted oval to round and back, savoury
// into the dessert last.
//
// Names and locations: from each hotel's CBH page, supplied by Scott on 11 Oct 2026 (the
// CBH site is blocked here): the name as the site lists it, the location from the
// hotel's address. Facts on screen: the hotel names and locations, "Dinner's included"
// (Foodie Breaks include dinner) and "Foodie Breaks, from £139" on the end card (Wildes
// Inns Stay & Dine, the cheapest offer on the Foodie Breaks page, checked by Scott on
// 11 Oct 2026). Nothing else.
//
// Music: "Cooking Groove" by kissan4 (Pixabay; no Content ID flag on its page), exactly
// 110 BPM (a 16th every 0.13637s, downbeats at 0.048 + 2.1819n s, found from the entries
// after each breakdown). The film runs from the 72.05s downbeat, the drop after the
// breakdown, through ten bars of the steady groove (no melody line; mid-range never
// dips more than 4dB below its median at half-second resolution). Trimmed to WAV from
// 70.051s (so the film starts 60 frames in, sample-exact) at -15.1 LUFS, peak -3.4dB.
// Cuts are on the eighth-note grid (8.182 frames): the opening plate holds a bar and a
// half under the line, then each named plate three beats (1.64s, on the beat; Scott found
// the labels hard to read at 0.82s), the flick an eighth at a time, Burleigh's dessert a
// full bar from the bar 6 downbeat, and the end card on the downbeat of bar 7, held three
// bars with the music fading over the last.

const P = "campaigns/foodie-match-cut";

// The shared rim target: 1250px wide at zoom 1 (a touch wider than the frame, so the
// portrait photos fill it with no fill at all; Scott found the defocused fill bad on some
// plates at 920px), pushing in 6% across the plates. Rims from scripts/plate-rim.py,
// checked by eye on its overlays. Rebuild a clip with:
//   scripts/plate-match.py public/<src> public/<clip> --rim cx,cy,a,b,angle \
//     --start <cut> --frames <next cut - cut> --d 1250 --dy <dy> --push 0.06 --over 458 \
//     --spin 12 --punch 1.15 [--spin-in 5] [--spin-out 5]
const plate = (
  name: string,
  size: [number, number],
  rim: Rim,
  hotel: string[],
  location?: string,
  dy = 0,
): MatchPlate => ({
  hotel,
  location,
  src: `${P}/${name}.jpg`,
  size,
  rim,
  dy,
  clip: `${P}/clips/${name}.mp4`,
});

// The flick: no label, the plate filling the frame (rims roughly placed by eye where
// plate-rim.py couldn't see the whole rim):
//   scripts/plate-match.py ... --d 1250 --cover --push 0.06 --over 458
const flick = (
  name: string,
  size: [number, number],
  rim: Rim,
  hotel: string,
) => ({
  ...plate(name, size, rim, [hotel]),
  flick: true,
});

export const foodieMatchCut: MatchCutSpec = {
  id: "foodie-breaks-match-cut",
  music: {
    src: `${P}/cooking-groove.wav`,
    trimmedSeconds: 26,
    startAt: 60, // 72.051s in the full track: the downbeat after the breakdown
    gain: 1, // already ~-15 LUFS
    fadeFrom: 589, // the last bar (bar 9 -> 10)
  },
  target: { d: 1250, push: 0.06, pushOver: 458 },
  // Scott: "more dynamic, not just static". Each cut between labelled plates whips the
  // frame 12 degrees clockwise round the rim centre with a 15% push, out over the last 5
  // frames and in over the first 5 (motion-blurred), rims meeting at the same size; the
  // opening plate spins in, Oaklands only spins in (the flick hard-cuts), Burleigh
  // spins in out of the flick. Turning only the plate inside its rim broke on tilted
  // plates (the food stands taller than the rim).
  spin: { deg: 12, punch: 1.15, frames: 5 },
  opening: { line: "Dinner’s included" },
  plates: [
    plate(
      "wildes-inns",
      [1427, 2000],
      { cx: 713.4, cy: 980.3, a: 602.1, b: 325.7, angle: 2.15 },
      ["Wildes Inns"],
      "Chesterfield, Derbyshire",
    ),
    plate(
      "waterton-park",
      [1920, 1280],
      { cx: 1094.4, cy: 644.7, a: 768.0, b: 615.4, angle: 4.76 },
      ["Waterton Park Hotel & Spa"],
      "Wakefield, West Yorkshire",
    ),
    plate(
      "hintlesham-hall",
      [1627, 2000],
      { cx: 845.1, cy: 1167.1, a: 671.2, b: 664.0, angle: 0 },
      ["Hintlesham Hall Hotel"],
      "Ipswich, Suffolk",
      130, // a little low, so the photo reaches the foot of the frame
    ),
    plate(
      "gisborough-hall",
      [1600, 2000],
      { cx: 792.3, cy: 990.8, a: 629.6, b: 629.2, angle: 0 },
      ["Gisborough Hall", "Country House Hotel & Spa"],
      "Guisborough, North Yorkshire",
    ),
    plate(
      "the-mount",
      [1210, 825],
      { cx: 576.9, cy: 394.1, a: 397.4, b: 320.1, angle: -2.46 },
      ["The Mount Country Manor", "Hotel & Golf"],
      "Wolverhampton, West Midlands",
      150, // lower, so the toast clears the label (the space above is tablecloth)
    ),
    plate(
      "oaklands-hall",
      [1920, 1280],
      { cx: 957.9, cy: 755.5, a: 891.6, b: 441.6, angle: -6.96 },
      ["Oaklands Hall Hotel"],
      "Grimsby, Lincolnshire",
    ),
    // The flick (Scott): the rest of the plates, an eighth note each, just plates, the
    // dessert last to hand on to Burleigh's.
    flick(
      "rutland-hall",
      [1920, 1447],
      { cx: 1000, cy: 900, a: 1050, b: 780, angle: -5 },
      "Rutland Hall",
    ),
    flick(
      "frensham-pond",
      [1920, 1280],
      { cx: 950, cy: 800, a: 1100, b: 450, angle: 4 },
      "Frensham Pond",
    ),
    flick(
      "wild-boar",
      [1920, 1280],
      { cx: 937, cy: 782, a: 946.2, b: 658.8, angle: -3.47 },
      "The Wild Boar",
    ),
    flick(
      "imperial-hotel",
      [1920, 1918],
      { cx: 920, cy: 820, a: 1100, b: 600, angle: -10 },
      "Imperial Hotel",
    ),
    flick(
      "haycock-manor",
      [1500, 2000],
      { cx: 750, cy: 1000, a: 960, b: 960, angle: 0 },
      "Haycock Manor",
    ),
    flick(
      "speech-house",
      [1920, 1281],
      { cx: 963.9, cy: 643.3, a: 912.7, b: 908.5, angle: 0 },
      "Speech House",
    ),
    plate(
      "burleigh-court",
      [1500, 2000],
      { cx: 690.9, cy: 1524.1, a: 748.3, b: 415.4, angle: 2.22 },
      ["Burleigh Court"],
      "Stroud, Gloucestershire",
      240, // the bowl sits near the foot of the photo
    ),
  ],
  // Eighth notes from the film's first downbeat: 0, 12, 18, 24 (bar 3), 30, 36, then the
  // flick from 42 an eighth at a time to 48, Burleigh on the bar 6 downbeat, and the end
  // card on the bar 7 downbeat (eighth 56); the film ends on bar 10 (eighth 80).
  cuts: [0, 98, 147, 196, 245, 295, 344, 352, 360, 368, 376, 385, 393, 458],
  durationInFrames: 655, // 21.8s
  // The client's CB watermark at the grid-safe vertical reel spec: 100px wide, bottom
  // edge at y=1560, 60px right margin, on every plate; the end card carries the full CBH
  // logo instead.
  watermark: {
    src: "brand/cb-watermark.png",
    size: [100, 108],
    x: 920,
    y: 1452,
  },
  // The house end card (Scott: the CBH logo shimmer card, not the campaign artwork): the
  // offer on black, then the official CBH logo with the shimmer on the CB monogram, as
  // on Fairlawns Stay & Dine.
  endCard: { lines: ["Foodie Breaks"], sub: "From £139" },
};
