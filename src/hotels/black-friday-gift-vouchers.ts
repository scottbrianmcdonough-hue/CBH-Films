import type { UnwrapSpec } from "../hotel-film/unwrap/types";

// Black Friday gift-voucher reel (Black Friday is Friday 27 November 2026). Scott's
// direction: simple and warm, the whole reel about giving someone a special stay. No sale
// graphics, no percentages, no countdown: there is no Black Friday discount on the site, so
// the reel claims none; it follows CBH's own 2024 Black Friday article, which recommends
// leading on gift vouchers rather than discounts.
//
// Facts, only from classicbritishhotels.com/gift-vouchers/ (checked by Scott, 10 Oct 2026):
// - Vouchers can only be redeemed against experiences that include an overnight stay
// - Valid for 12 months from the date of purchase
// - Redeemed when booking online at classicbritishhotels.com
// - The page sells them on spa, award-winning dining and championship golf (so the shots)
//
// Structure: one calm line over Scott's gift photo (a hand pulling the ribbon on a box,
// gifting-001_web.jpg from the CBH site), then the one signature move into every hotel,
// the unwrap (a gold ribbon draws across the frame, which splits along it and peels back
// like gift wrap, black on the reverse with a gilded cut edge). Scott: "a reel, not a
// slideshow", so each hotel leads with its real footage where there is some, stills in
// support, the shots inside a hotel cut on the beat under one name-and-location line;
// stills that only repeat what a clip shows make way. The last unwrap opens on the real
// CBH voucher artwork (gift-vouchers.png, its white-page shadows turned dark for black),
// then the usual end card.
//
// Hotels, in order (a stay: arrive, spa, dinner, breakfast, golf, hot tub, bed):
// - Rutland Hall: the lake from the grounds, then the spa baths (CBH Reel Bank footage,
//   calmed and slowed for the Rutland Hall Halloween reel; recovered from git history).
//   Scott swapped out the manor frontage, which had a traffic cone and window signs.
// - Fairlawns: the sauce pour, the plating, the dish set down by the wine (Scott's phone
//   clips from the Fairlawns Stay & Dine reel; Restaurant 178 holds two AA Rosettes).
// - Dalmahoy: the syrup pour at breakfast (Dalmahoy reel footage, after its 2.7s edit),
//   then the golf course still.
// - Ruthin Castle: the woodland hot tub still. Gisborough Hall: the four-poster still.
// Made way: the Holdsworth House spa still (the Rutland spa footage carries the spa), the
// Prévost plate (the Fairlawns footage carries dinner), the Fairlawns lamplit drinks (one
// Fairlawns section is enough) and the Holdsworth bedroom footage (a bright daylight room
// straight before the four-poster). Locations as on the hotels' CBH pages (recorded in
// earlier specs: Rutland Hall Halloween, Fairlawns, Plate to Pillow, Hotels with a History).
//
// Music: "Luxury" by Sub_Clair (Pixabay Content License; no Content ID flag on its page),
// a disco groove at ~115 BPM (a beat every ~15.7 frames, a bar every ~62.7), trimmed to
// its first 60s and peak-limited (alimiter 0.8). No lead line anywhere (pyin on the
// harmonic 600-4000Hz band finds almost nothing voiced). The film plays 12.57-52.21s: two
// bars of the bass-less intro under the opening line, the kick landing (16.73s) as the
// first wrap opens, then the groove. Its one-bar bass drop (31.4-33.4s) sits inside the
// syrup pour, and the cut to the golf course lands on the kick's return (33.43s). Every
// peel is centred on a downbeat; cuts inside a hotel land on beats; the end card arrives
// on a downbeat and the music fades over its last bar, ending on the downbeat at 52.21s.

const P = "campaigns/black-friday";

export const blackFridayGiftVouchers: UnwrapSpec = {
  id: "black-friday-gift-vouchers",
  music: {
    src: `${P}/luxury.mp3`,
    trimmedSeconds: 60,
    startAt: 377, // 12.57s, the downbeat of bar 6 (intro)
    gain: 0.6, // ~-15 LUFS
    fadeIn: 6,
    fadeFrom: 1127, // bar 24: fade over the end card's last bar
  },
  durationInFrames: 1189, // 39.6s, ends on the downbeat of bar 25
  ribbon: 18,
  peel: 30, // two beats, centred on the downbeat
  push: 1.05,
  // Downbeats of bars 8, 11, 14, 17, 19, 21: three bars for a hotel with footage, two for
  // a single still.
  lands: [125, 312, 500, 688, 813, 939],
  opening: {
    eyebrow: "This Black Friday",
    lines: ["Give them somewhere", "to slow down"],
    still: {
      kind: "photo",
      src: `${P}/gifting-001.jpg`,
      size: [1920, 1280],
      crop: { cx: 860 }, // the hand pulling the ribbon, the bow centred
    },
  },
  sections: [
    {
      label: { name: ["Rutland Hall", "Hotel & Spa"], place: "Rutland Water" },
      shots: [
        { kind: "video", src: "hotels/rutland-hall/lake-view.mp4" },
        { kind: "video", src: "hotels/rutland-hall/spa-baths.mp4" },
      ],
      cuts: [219], // beat 3 of bar 9
    },
    {
      label: {
        name: ["Fairlawns", "Hotel & Spa"],
        place: "Walsall, West Midlands",
      },
      shots: [
        { kind: "video", src: "hotels/fairlawns/sauce-pour.mp4", from: 0.2 },
        { kind: "video", src: "hotels/fairlawns/chef-plating.mp4", from: 0.2 },
        { kind: "video", src: "hotels/fairlawns/dish-and-wine.mp4", from: 0.2 },
      ],
      cuts: [375, 438], // bars 12 and 13
    },
    {
      label: { name: ["Dalmahoy Hotel", "& Country Club"], place: "Edinburgh" },
      shots: [
        { kind: "video", src: "hotels/dalmahoy/syrup-pour.mp4", from: 4.0 },
        {
          kind: "photo",
          src: `${P}/dalmahoy-golf.jpg`,
          size: [1920, 1439],
          crop: { cx: 760 }, // the bunkers, the lone tree, the hills; off the hazy corner
        },
      ],
      cuts: [626], // bar 16, the kick back after the bass drop
    },
    {
      label: {
        name: ["Ruthin Castle", "Hotel & Spa"],
        place: "Ruthin, North Wales",
      },
      shots: [
        {
          kind: "photo",
          src: `${P}/ruthin-hot-tub.jpg`,
          size: [1920, 1280],
          crop: { cx: 740 }, // her smile and both glasses meeting
        },
      ],
      cuts: [],
    },
    {
      label: { name: ["Gisborough Hall"], place: "North Yorkshire" },
      shots: [
        {
          kind: "photo",
          src: `${P}/gisborough-four-poster.jpg`,
          size: [1920, 1260],
          crop: { cx: 1400 }, // the canopy, the carved headboard
        },
      ],
      cuts: [],
    },
  ],
  gift: {
    art: { src: `${P}/gift-vouchers.png`, size: [1200, 909] },
    card: { eyebrow: "A Classic British Hotels", title: ["gift voucher"] },
    headline: "Valid for 12 months",
    small: "For a stay at one of our hotels",
  },
  endAt: 1064, // bar 23
  endCard: { lines: ["Gift vouchers"], location: "classicbritishhotels.com" },
  watermark: {
    src: "brand/cb-watermark.png",
    size: [100, 108],
    x: 920,
    y: 1452,
  },
};
