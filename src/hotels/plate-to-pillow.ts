import type { MontageSpec } from "../hotel-film/montage/types";

// "Plate to pillow", CBH Deliciously Autumn / Foodie Breaks campaign: one plate and one
// pillow from each of five hotels with a Foodie Break live on the CBH Foodie Breaks page.
// Photos are from each hotel's own CBH page gallery. Copy rules: hotel names and
// locations (exact from the Foodie Breaks page) are the only facts on screen; the only
// price is the campaign floor on the end card (FROM £139, Wildes Inns, checked on the live
// page). No restaurant names, Rosettes, awards or package lines.
//
// Music: "Soul Retro Groove" by AlexGuz (Pixabay, ~92.3 BPM, a beat every ~19.5 frames),
// trimmed from 90s and peak-limited. The film runs 92.16-118.40s, the steady groove /
// rhythm section: a melody tracker (pyin on the harmonic 600-4000 Hz band) shows the
// lead guitar solo at 128-172s (voiced 0.5-0.9) and nothing sustained here (~0.1). It
// starts on the strong bar downbeat at 92.16s. Shots are three beats (~2s) so the photos
// register, every shot the same (the hook sits on the opener without stretching it). The
// end card lands on beat 30 and holds ten beats so the fade ends on a downbeat. Cuts are
// measured beats, in film frames.
// End card: the official Deliciously Autumn 4:5 creative (FROM £139.00), run full
// width with its own top and bottom edges extended to fill the frame.

const P = "campaigns/plate-to-pillow";
const shot = (
  name: string,
  size: [number, number],
  cx: number,
  h?: number,
  cy?: number,
) => ({
  src: `${P}/${name}.jpg`,
  size,
  crop: { cx, h, cy },
  clip: `${P}/kb/${name}.mp4`,
});

// Version A: Soul Retro Groove.
export const plateToPillow: MontageSpec = {
  id: "plate-to-pillow",
  music: {
    src: `${P}/soul-retro-groove.mp3`,
    trimmedSeconds: 40,
    startAt: 65, // strong bar downbeat at 92.16s in the full track
    gain: 0.76, // the trimmed file is peak-limited (it peaked over 0 dBTP); ~-15 LUFS
    fadeFrom: 709, // fade over the last bar (beat 36 -> 40)
  },
  // Every three beats, then the end card at beat 30.
  cuts: [0, 60, 119, 177, 235, 296, 355, 414, 472, 531, 589],
  durationInFrames: 787, // beat 40, 26.2s
  pushIn: 0.06,
  // One camera move: every shot is a pre-rendered Ken Burns clip (scripts/kenburns.py,
  // Pillow LANCZOS frame by frame with subpixel crops): the same gentle linear push-in
  // from 1.04 to ~1.12, with a small drift that is always the same way (the window moves
  // 12 source px left per 60 frames, so the picture drifts right). Rebuild with:
  //   scripts/kenburns.py <photo>.jpg kb/<photo>.mp4 --cx <crop cx> --frames 64
  // One text move: labels and the end card rise and land on the beat.
  hook: {
    lines: ["Dinner and a bed,", "from Edinburgh", "to Hampshire"],
    shots: 1,
  },
  // Plates stay clean; the name lands on each pillow shot.
  labelOn: "last",
  // The client's CB watermark (cropped from their 9:16 overlay) to the grid-safe vertical
  // reel spec: 100px wide, bottom edge at y=1560, 60px right margin, on every shot; the
  // end card stays the clean official artwork.
  watermark: {
    src: `${P}/cb-watermark.png`,
    size: [100, 108],
    x: 920,
    y: 1452,
  },
  // North to south, so the spread of the collection is the story. Each pillow leads with
  // the region (from the location on the Foodie Breaks page), the hotel name beneath.
  hotels: [
    {
      name: "Dalmahoy Hotel & Country Club",
      location: "Edinburgh",
      region: ["Edinburgh"],
      shots: [
        shot("dalmahoy-plate", [1920, 1280], 560), // salmon
        shot("dalmahoy-pillow", [1920, 1280], 1560), // Bridal Suite
      ],
    },
    {
      name: "Hardwick Hall Hotel",
      location: "Sedgefield, County Durham",
      region: ["Sedgefield,", "County Durham"],
      shots: [
        shot("hardwick-plate", [1920, 1280], 930), // lamb
        shot("hardwick-pillow", [1920, 1262], 870), // Premier Room
      ],
    },
    {
      name: "Ruthin Castle Hotel & Spa",
      location: "Ruthin, North Wales",
      region: ["Ruthin,", "North Wales"],
      shots: [
        shot("ruthin-plate", [1920, 1275], 900), // Dragon Tavern burger by the fire
        shot("ruthin-pillow", [1920, 1274], 790), // Glyndwr Suite
      ],
    },
    {
      name: "Nailcote Hall",
      location: "Warwickshire",
      region: ["Warwickshire"],
      shots: [
        shot("nailcote-plate", [1920, 1280], 860), // scallops
        shot("nailcote-pillow", [1920, 1281], 1180), // Magnolia Suite
      ],
    },
    {
      name: "Oakley Hall Hotel",
      location: "Hampshire",
      region: ["Hampshire"],
      shots: [
        shot("oakley-plate", [1920, 1280], 980), // dessert
        shot("oakley-pillow", [1920, 1280], 940), // Four Poster Suite
      ],
    },
  ],

  endCard: {
    // The official Deliciously Autumn 4:5 creative (FROM £139.00), its gold rule painted
    // out so the rule can draw once in its original place after the block lands.
    artwork: {
      src: `${P}/deliciously-autumn-lockup-4x5-norule.png`,
      size: [1080, 1350],
      rule: { y: 1098, height: 5, x0: 78, x1: 1002, color: "#C9AA78" },
    },
  },
};

// Version B: the same edit to "Smooth Soul" by NverAvetyanMusic (Pixabay), a calmer track
// for comparison. Its pulse is 60 BPM with a triplet (shuffle) feel: onsets sit on a 1.0s
// grid subdivided in thirds (beat trackers misread it as ~90 BPM). Trimmed from 58s and
// peak-limited; the film runs 59.51-85.71s, from the bar downbeat at the section change
// (kick on 1 and 3). Two beats (2.0s) per shot, the end card on the downbeat at beat 20,
// held six beats with the fade over the last four. The melody tracker puts its busiest
// lead line at 110-150s (0.45-0.87); this window stays around 0.2.
export const plateToPillowB: MontageSpec = {
  ...plateToPillow,
  id: "plate-to-pillow-b",
  music: {
    src: `${P}/smooth-soul.mp3`,
    trimmedSeconds: 35,
    startAt: 45, // bar downbeat at 59.51s in the full track
    gain: 0.72, // ~-15 LUFS, matched to version A
    fadeFrom: 667,
  },
  cuts: [0, 60, 121, 181, 241, 301, 361, 423, 483, 544, 606],
  durationInFrames: 786, // beat 26, 26.2s
};
