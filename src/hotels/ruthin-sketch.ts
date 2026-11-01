import type { SketchSpec } from "../hotel-film/sketch/types";
import { holdsworthSketchStory } from "./holdsworth-sketch";

// Ruthin Castle one-fact Story (Scott liked the Holdsworth one: "try one, the best photo").
// The clock-tower castle draws itself in pencil while the fact is written in, then the
// colour brings it to life: blue sky, red stone, the garden. Fact from the CBH blog "Our
// Spooktacular Guide to Hotels with a History" (6 Oct 2026, as briefed by Scott for the
// Hotels with a History reel): the castle dates from the 1200s. Photo: the hotel's CBH
// gallery shot (1920x1080, crop on the tower; the colour stage is gently sharpened). The series shares the Holdsworth Story's
// track and timing, so the Stories read as a set.

export const ruthinSketchStory: SketchSpec = {
  ...holdsworthSketchStory,
  id: "ruthin-sketch-story",
  // The series track, from a later phrase than the Holdsworth Story (beat 16).
  music: { ...holdsworthSketchStory.music, startAt: 409, fadeFrom: 349 }, // beat 16
  // its own one-shot timing (the Holdsworth Story has since grown a second shot)
  durationInFrames: 393, // 13.1s, beat 18
  endAt: 262, // beat 12
  shots: [
    {
      src: "hotels/ruthin-castle/sketch/castle.mp4",
      at: 0,
      // Written into the open sky beside the tower; it stays in pencil once the colour
      // arrives (cream was too faint on the pale sky), so the fact is the last thing seen.
      note: {
        lines: ["A castle", "since", "the 1200s"],
        write: [10, 56],
        fade: [84, 108],
        top: 270,
        align: "right",
        size: 82,
        ground: "open",
        stay: "pencil",
      },
    },
  ],
  endCard: {
    lines: ["Ruthin Castle Hotel & Spa"],
    location: "Ruthin, North Wales",
  },
};
