import type { MontageHotel, MontageSpec } from "../hotel-film/montage/types";

// "AA Rosettes", CBH Deliciously Autumn / Foodie Breaks: one reel that climbs from one AA
// Rosette to three. Draft built from stills; the client may add Reel Bank video, so hold
// the final cut until that's confirmed.
//
// Rosettes are counted only where the hotel's own CBH page states them (client sweep of
// all 56 CBH hotel pages, 7 Oct 2026, 5:15 PM BST). Wild Boar has no Foodie Break live,
// so the end card is a brand card rather than the Foodie Breaks offer. Sources:
// - Coast Restaurant, Hythe Imperial: "Coast Restaurant, awarded an AA Rosette"
// - The Wild Boar Grill & Smokehouse: "holds one AA Rosette"
// - Ilsington Restaurant: "The highly acclaimed Ilsington Restaurant holds two AA Rosettes"
// - The Mulberry Restaurant, Langshott Manor: "holds two AA Rosettes"
// - Restaurant 178, Fairlawns: "Restaurant 178 holds two AA Rosettes"
// - Verderers' Restaurant, Speech House: "The hotel holds 2 AA Rosettes for its cooking"
//   + "Verderers' Restaurant serves up Rosette-awarded food"
// Maids Head Hotel (The WinePress Restaurant) was cut on 8 Oct 2026: it is leaving the
// collection. Don't use it in any autumn content.
// - Prévost, Haycock Manor Hotel: "Prévost (3 AA Rosettes)"; the gallery image's file name
//   and alt text name Prévost. (The Haycock Kitchen dish was dropped: mostly empty marble,
//   and a second Haycock dish straight before Prévost.)
// - Murrays, Whittlebury Park: "Murrays restaurant, which holds 3 AA Rosettes". Its dish is
//   the Murrays plate from the Whittlebury film (no plate in the CBH gallery).
// Photos are each hotel's CBH gallery food shot; apart from Prévost, Murrays and the
// Fairlawns plating clip, nothing confirms the pictured dish is from the named restaurant.
//
// Music: "Sweet Life (Luxury Chill)" by AlexGrohl (Pixabay Content License), ~123 BPM (a
// beat every ~14.6 frames), its steady 64.97-86.6s run (the section from 63.3s to 94.5s;
// melody tracker ~0.1, no lead line), trimmed from 63s and peak-limited. One bar per dish,
// the end card on the bar at beat 32, fading over beats 36-40.

const P = "campaigns/aa-rosettes";
const plate = (
  name: string,
  size: [number, number],
  cx: number,
  h?: number,
  cy?: number,
) => ({
  src: `${P}/${name}.jpg`,
  size,
  crop: { cx, h, cy },
  // A barely-there push on every dish so nothing feels frozen (not a Ken Burns): linear
  // 1.00 -> 1.04 over the shot's whole time on screen, centred, no pan, the same on every
  // shot. Pillow LANCZOS with subpixel crops:
  //   scripts/kenburns.py <photo>.jpg kb/<photo>.mp4 --cx <cx> --frames 74 \
  //     --z0 1.0 --z1 1.04 --over 73 --drift 0
  clip: `${P}/kb/${name}.mp4`,
});

const hotels: MontageHotel[] = [
  {
    name: "Hythe Imperial Hotel, Golf & Spa",
    location: "Kent",
    tier: 1,
    headline: ["Coast Restaurant"],
    shots: [plate("hythe-plate", [1920, 1822], 960)],
  },
  {
    name: "Wild Boar Estate",
    location: "Lake District National Park",
    tier: 1,
    headline: ["The Wild Boar", "Grill & Smokehouse"],
    // Pulled back so the whole pudding, ice cream and plate rim read: the gallery shot at
    // full width, feathered into a soft, darkened blur of its own 9:16 slice
    // (wild-boar-wide.jpg, composed with Pillow from wild-boar-plate.jpg).
    shots: [plate("wild-boar-wide", [1080, 1920], 540)],
  },
  {
    name: "Fairlawns Hotel & Spa",
    location: "Walsall",
    tier: 2,
    headline: ["Restaurant 178"],
    // A still grabbed from the Reel Bank plating clip (4.1s, sauce just poured), so every
    // dish is treated the same: stills only, no live video in this reel.
    shots: [plate("fairlawns-plate", [1080, 1920], 540)],
  },
  {
    name: "Ilsington Country House Hotel & Spa",
    location: "Dartmoor National Park, Devon",
    tier: 2,
    headline: ["Ilsington", "Restaurant"],
    shots: [plate("ilsington-plate", [1920, 1280], 900)],
  },
  {
    name: "Langshott Manor",
    location: "Surrey",
    tier: 2,
    headline: ["The Mulberry", "Restaurant"],
    shots: [plate("langshott-plate", [1920, 1279], 960)],
  },
  {
    name: "Speech House Hotel",
    location: "Forest of Dean",
    tier: 2,
    headline: ["Verderers'", "Restaurant"],
    shots: [plate("speech-house-plate", [1920, 1281], 980)],
  },
  {
    name: "Whittlebury Park",
    location: "Northamptonshire",
    tier: 3,
    headline: ["Murrays"],
    shots: [plate("murrays-plate", [1904, 1428], 1150)],
  },
  {
    // Prévost: "Prévost (3 AA Rosettes)" (hotel page); the gallery image's file name and
    // alt text both name Prévost. The finale: pin-sharp, where Murrays (a small source
    // upscaled) is soft at full size.
    name: "Haycock Manor Hotel",
    location: "Peterborough",
    tier: 3,
    headline: ["Prévost"],
    shots: [plate("haycock-prevost-plate", [1500, 2000], 780, 1700, 1150)],
  },
];

export const aaRosettes: MontageSpec = {
  id: "aa-rosettes",
  music: {
    src: `${P}/sweet-life.mp3`,
    trimmedSeconds: 26,
    startAt: 59, // bar downbeat at 64.97s in the full track
    gain: 0.68, // the trimmed file is peak-limited; ~-15 LUFS
    fadeFrom: 532, // fade over the end card's last bar (beat 36 -> 40)
  },
  // One bar (four beats, ~1.95s) a dish: each iris opens on a downbeat and its label lands
  // on beat two (IRIS = 14 frames, one beat). The end card arrives on the bar at beat 32.
  cuts: [0, 59, 119, 177, 236, 295, 355, 414, 472],
  durationInFrames: 590, // beat 40, 19.7s
  pushIn: 0,
  // Motion: no gold line, no Ken Burns. Each dish opens out of the last through an
  // expanding circle on its downbeat with a barely-there push; its label rises in on the next
  // beat; a rosette counter (top-left) rolls 1 -> 2 -> 3 as the tiers climb, the client's
  // red rosette blooming at each step; labels carry no rule.
  // No Ken Burns: each photo plays its barely-there push clip; the graphics carry the motion.
  motion: "static",
  hook: { lines: [], shots: 1 },
  reveal: "iris",
  // No hook line and no empty rosettes: AA rules forbid speculating on future ratings or a
  // layout that reads as a score out of three. Only the rosettes awarded are shown.
  counter: { words: ["AA Rosette", "AA Rosettes"] },
  labelOn: "all",
  labelRule: false,
  hotels,
  // A brand card, not the Foodie Breaks offer (Wild Boar has no Foodie Break live), so no
  // price. The CB logo already names Classic British Hotels. The line picks up the counter's
  // climb and sells the collection (a dinner-and-room line could come from any hotel).
  endCard: {
    brand: { lines: ["Find your", "next Rosette"] },
  },
};

// Stories cut (13.8s, under 15s): the climb in five dishes (one rosette, two, two, three,
// three: Coast, Restaurant 178, Ilsington, Murrays, Prévost), then the end card on the bar
// at beat 20, fading over beats 24-28. Wild Boar makes way for Prévost (only five fit).
export const aaRosettesStory: MontageSpec = {
  ...aaRosettes,
  id: "aa-rosettes-story",
  hotels: hotels.filter((h) =>
    [
      "Coast Restaurant",
      "Restaurant 178",
      "Ilsington",
      "Prévost",
      "Murrays",
    ].includes(h.headline?.[0] ?? ""),
  ),
  music: { ...aaRosettes.music!, fadeFrom: 355 },
  cuts: [0, 59, 119, 177, 236, 295],
  durationInFrames: 414, // beat 28, 13.8s
};
