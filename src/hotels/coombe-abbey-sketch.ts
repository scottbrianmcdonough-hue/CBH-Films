import type { SketchSpec } from "../hotel-film/sketch/types";
import { holdsworthSketchStory } from "./holdsworth-sketch";

// Coombe Abbey Hotel launch Story (Scott, 18 Nov: "since you got photos and such can you do a story"), in the sketch
// Story series (Holdsworth, Ruthin): same track and timing, so the Stories read as a set. The abbey from the air draws
// itself in pencil with the launch post's hook written in ("Not every hotel comes with its own moat"), the colour brings
// the moat and the courtyard to life; then The Lady Craven's canopied bed drawn with "Sleep inside / the moat"; then the
// drawn end card. Clips by scripts/sketch-to-life.py (the Holdsworth settings):
//   Q="--ink-min 40 --ink-max 1000 --ink-blur 1.8 --hatch-pct 28,14,6 --hatch-run 8"
//   aerial:      --x 50 --focus 540 1000 --frames 284 --pencil 0 40 --ink 30 115 --hatch 105 145 --colour 140 200 --life 180 258 $Q
//   lady-craven: --x 72 --focus 600 900 --frames 174 --pencil 0 20 --ink 15 65 --hatch 60 85 --colour 80 120 --life 110 170 $Q
// Holds: clip frames 260 and 172. Facts from coombeabbey.com (the moat, the canopied beds).
const P = "hotels/coombe-abbey";
const baked = (from: number, frames: number) => ({ from, rate: 0.03 / (frames - from) });
const push = { scale: [1.01, 1.08] as [number, number], origin: "50% 50%" };

export const coombeAbbeySketchStory: SketchSpec = {
  ...holdsworthSketchStory,
  id: "coombe-abbey-sketch-story",
  shots: [
    {
      src: `${P}/sketch/aerial.mp4`,
      at: 0,
      note: {
        lines: ["Not every hotel", "comes with", "its own moat"],
        write: [20, 80],
        fade: [165, 200],
        top: 1290, // over the moat and the bridge at the foot of the frame (over the trees it lost itself in the autumn colour)
        size: 84,
        ground: "clear",
        stay: "cream",
      },
      push,
      clipPush: baked(180, 284),
      boil: { px: 1.6, from: 140, to: 200 },
      hold: { src: `${P}/sketch/aerial-hold.jpg`, from: 260 },
    },
    {
      src: `${P}/sketch/lady-craven.mp4`,
      at: 262, // beat 12
      note: {
        lines: ["Sleep inside", "the moat"],
        write: [10, 50],
        fade: [84, 108],
        top: 1400, // on the dark carpet at the foot of the frame, above the safe zone
        inset: 110,
        size: 88,
        ground: "open",
        stay: "cream",
      },
      push,
      clipPush: baked(110, 174),
      boil: { px: 1.6, from: 80, to: 120 },
      hold: { src: `${P}/sketch/lady-craven-hold.jpg`, from: 172 },
    },
  ],
  endCard: { lines: ["Coombe Abbey Hotel"], location: "Coventry, Warwickshire" },
  drawnEnd: { ...holdsworthSketchStory.drawnEnd!, paper: `${P}/sketch/paper.jpg` },
};
