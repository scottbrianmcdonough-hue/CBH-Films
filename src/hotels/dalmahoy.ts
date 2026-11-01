import type { FootageSpec } from "../hotel-film/footage/types";

// Dalmahoy Hotel & Country Club, Edinburgh (Classic British Hotels): a real-footage reel in
// the Ilsington pattern. The hotel's own clips (Reel Bank, audio stripped) lead, then
// stills close, then the end card. On-screen lines only from facts verified on the CBH
// Dalmahoy page, in our own words, one per card: 7 miles from Edinburgh; two 18-hole
// courses including the Championship East Course; menus celebrating Scotland's larder; a cosy
// cocktail bar beside a log fire (single malt); character rooms in the original Scottish
// baronial manor house. The breakfast clip carries a one-word feeling line only (no menu
// claims). The closing stills get a proper Ken Burns (12% push with a gentle pan).
// Clips are summery, so every line is season-neutral. No price.
//
// Music: "Leva - Eternity" by lemonmusicstudio (Pixabay, ~92.3 BPM, a beat every ~19.5
// frames), its steady 41.8-70.5s section (no slow intro; melody tracker low throughout),
// trimmed from 40s and peak-limited. The film starts on the bar downbeat at 41.82s; every
// crossfade is centred on a measured beat.

const P = "hotels/dalmahoy";
const C = "campaigns/plate-to-pillow";

export const dalmahoyFilm: FootageSpec = {
  id: "dalmahoy",
  music: {
    src: `${P}/leva-eternity.mp3`,
    trimmedSeconds: 40,
    startAt: 55, // bar downbeat at 41.82s in the full track
    gain: 0.83, // ~-15 LUFS
    fadeFrom: 743, // fade over the end card's last bar (beat 38 -> 42)
  },
  // Beats 8, 12, 16, 22, 28, then the end card on beat 34; ends on beat 42.
  cuts: [156, 235, 312, 430, 547, 665],
  durationInFrames: 822, // 27.4s
  crossfade: 24, // 0.8s, the one transition
  shots: [
    {
      // Hook: the syrup pour (its heaviest pour lands just before the cut).
      kind: "video",
      src: `${P}/syrup-pour.mp4`,
      from: 6.2,
      card: { lines: ["Mornings"], small: "Dalmahoy" },
    },
    {
      // The sunny terrace: a guest with a drink, the course behind (clean 3.5-8.7s).
      kind: "video",
      src: `${P}/terrace-table.mp4`,
      from: 4.4,
      card: { lines: ["Seven miles", "from Edinburgh"] },
    },
    {
      // The outdoor table with the view under the parasols (clean 16.8-21.1s). No card.
      kind: "video",
      src: `${P}/terrace-table.mp4`,
      from: 17.2,
    },
    {
      // A slow pan across the course from the terrace.
      kind: "video",
      src: `${P}/course-view.mp4`,
      from: 1.4,
      card: {
        lines: ["Two 18-hole courses,", "one the Championship", "East Course"],
      },
    },
    {
      kind: "still",
      src: `${C}/dalmahoy-plate.jpg`, // salmon
      size: [1920, 1280],
      crop: { cx: 560 },
      drift: 0.12, // Ken Burns: push in, drifting right
      pan: 50,
      // Not tied to a named room: nothing shows this plate is from the Pentland (the
      // hotel also has a Brasserie). Drawn from "menus celebrating Scotland's larder".
      card: { lines: ["Menus that celebrate", "Scotland's larder"] },
    },
    {
      kind: "still",
      src: `${C}/dalmahoy-pillow.jpg`, // Bridal Suite
      size: [1920, 1280],
      crop: { cx: 1560 },
      drift: 0.12, // Ken Burns: push in, drifting left
      pan: -50,
      card: {
        lines: ["Character rooms in", "the original baronial", "manor house"],
      },
    },
  ],
  // No watermark on the shots; the animated CB logo with its shimmer closes the end card.
  endCard: {
    lines: ["Dalmahoy Hotel", "& Country Club"],
    location: "Edinburgh",
    logo: true,
  },
};
