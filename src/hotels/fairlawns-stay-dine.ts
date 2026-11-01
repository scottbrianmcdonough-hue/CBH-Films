import type { FootageSpec } from "../hotel-film/footage/types";

// Fairlawns Hotel & Spa, Walsall: a Stay & Dine reel for Deliciously Autumn / Cosy Escapes,
// built from Scott's phone footage (Restaurant 178 and a bedroom), in the Oakley Hall dog
// story's style: real footage only, audio stripped, no Ken Burns, no text over the shots,
// the CB mark bottom-right. Clips transcoded to
// 1080x1920 H.264 (rotated upright, 30fps). The pour and plating clips flickered under
// mains light (a 10Hz flutter in rolling bands): both run through
// scripts/deflicker-rows.py, which evens out each sensor row against its 3-frame average.
// Copy only from the Fairlawns CBH page:
// Restaurant 178 holds two AA Rosettes; menus showcase locally sourced, seasonal produce
// and give British favourites a fresh twist; a Stay & Dine is live on the Foodie Breaks
// page. No price on the asset, no generic dinner-and-a-room line. The close is the usual
// end card (Scott: no monogram or foil sweep): the bedroom settles and fades to black,
// then the hotel name and location (from the address on its CBH page) fade in and the
// official CBH logo wipes up, the house shimmer crossing the CB monogram only (Scott), with
// no other graphics.
//
// Music: "Neo Soul Night" by SunSides (Pixabay Content License), ~76 BPM (a beat every
// ~23.7 frames), trimmed to its first 90s. Its melody comes in short phrases that restart
// on beat one (38.08, 47.44, 53.69s), which places the downbeats. The film plays
// 66.18-84.89s, 24 beats from a downbeat to a downbeat: the steadiest stretch of the track
// (scored every downbeat window at half-second resolution: no mid-range dip deeper than
// 6.9dB before the last bar, where every other window has at least one break of 8dB or
// more). The earlier 31.86s window carried the
// song's breakdown (keys and bass out, a thin bright fill, ~41.4-43.2s), which landed on the
// cut to the spread and sounded like a glitch. Every cut lands on a beat and the music
// fades over the end card's last bar.

const P = "hotels/fairlawns";

export const fairlawnsStayDine: FootageSpec = {
  id: "fairlawns-stay-dine",
  music: {
    src: `${P}/neo-soul-night.mp3`,
    trimmedSeconds: 90,
    startAt: 1985, // 66.18s, a downbeat
    gain: 1.04, // ~-15 LUFS; the trimmed file is peak-limited (alimiter 0.8)
    fadeFrom: 468, // beat 20: fade over the end card's last bar
  },
  // Beats 4 (downbeat), 6, 9, 13, 16 (downbeat), then the end card on beat 19; the film
  // ends on beat 24 (downbeat).
  cuts: [93, 140, 210, 304, 375, 444],
  durationInFrames: 562, // 18.7s
  crossfade: 10, // a short, soft dissolve centred on each beat
  endFade: 24, // the bedroom settles into black
  shots: [
    // Cold open: the sauce poured over the asparagus, then the finished plate.
    { kind: "video", src: `${P}/sauce-pour.mp4`, from: 0.2 },
    { kind: "video", src: `${P}/chef-plating.mp4`, from: 0.3 },
    // The bowl set down in front of the wine glasses.
    { kind: "video", src: `${P}/dish-and-wine.mp4`, from: 0.2 },
    // Overhead across the spread: fish and chips, landing on the steak frites.
    { kind: "video", src: `${P}/food-spread.mp4`, from: 1.0 },
    { kind: "video", src: `${P}/afternoon-tea.mp4`, from: 0.1 },
    // The close on the stay: a slow pan across the bed, fading into the end card.
    { kind: "video", src: `${P}/bedroom.mp4`, from: 0 },
  ],
  // No text over the footage (Scott): the visuals carry it, then the end card names the
  // hotel. (The "Two AA Rosettes / Old favourites, new tricks" block was dropped.)
  endCard: {
    lines: ["Fairlawns Hotel & Spa"],
    location: "Walsall, West Midlands",
    logo: "cb-shimmer",
    // the house order (Scott, 26 Oct: "update to house style with the gold underline"): WALSALL,
    // WEST MIDLANDS in gold caps with its underline drawing on top, the name in cream Cormorant
    placeFirst: true,
  },
  watermark: {
    src: "brand/cb-watermark.png",
    size: [100, 108],
    x: 920,
    y: 1452,
  },
};
