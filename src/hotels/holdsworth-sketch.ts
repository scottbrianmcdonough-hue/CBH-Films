import type { SketchSpec } from "../hotel-film/sketch/types";

// Holdsworth House sketch reel, redrawn in pen and ink (Scott, after the sketch-to-life
// portrait: "do the Holdsworth House more like that"; "actually pencilling in phases, not
// just a filter, so it looks like pen and ink, maybe a slower colour reveal"). Each still
// is drawn the way an illustrator works (scripts/sketch-to-life.py, from the photo's own
// edges and tones): light pencil roughs and overshooting guidelines, ink outlines growing
// out from the focal point, cross-hatching in the shadows, then a slow translucent
// watercolour wash before it settles into the photo, which holds with a barely-there push.
// Fewer, longer shots so every phase reads: the house (three bars), then the main hall,
// tea by the fire and breakfast in bed (two bars each); hard cuts on downbeats back to
// fresh paper; the usual end card. Clips (scene settings: texture softened, only lines of
// 40px or more, hatching in the darkest tones only):
//   Q="--ink-min 40 --ink-max 1000 --ink-blur 1.8 --hatch-pct 28,14,6 --hatch-run 8"
//   L="--pencil 0 20 --ink 15 65 --hatch 60 85 --colour 80 120 --life 110 170"
//   exterior: --x 35 --focus 540 900 --frames 284 --pencil 0 40 --ink 30 115
//             --hatch 105 145 --colour 140 200 --life 180 258 $Q
// The life phase is long (2-2.5s): the photo develops out from the focal point through
// the watercolour, the lines lifting where it arrives (Scott: it came "in a flash").
//   main-hall: --x 49 --focus 540 1000 --frames 175 $L $Q
//   tea-by-the-fire: --x 87 --focus 540 800 --frames 174 $L $Q
//   breakfast-in-bed: --x 68 --focus 540 1000 --frames 199 $L $Q (+22 to fade out)
//
// Stills: the CBH-site photos supplied by Scott for the earlier Holdsworth reel (9 Oct
// 2026), 1920x1080 (a 9:16 crop is a ~1.8x upscale, sharpened a touch). Copy, from the
// Holdsworth House CBH page as recorded then: a Grade II listed Jacobean manor ("Jacobean,
// and proud of it" was approved by Scott for that reel); The Beatles stayed here (Blue
// Plaque). Two pencilled notes only, written as the drawing appears and washed away by the
// colour.
//
// Music: Holdsworth's own track, "Warm Acoustic Guitar" by Universfield (Pixabay), the
// stretch from 37.85s chosen for the earlier Holdsworth reel (fingerpicked, no lead
// line), a beat every 21.825 frames; downbeats every four beats (87.3 frames). Cuts on
// beats 12, 20 and 28; the end card on beat 36; the film ends on the downbeat at beat 44.

const P = "hotels/holdsworth-house";

// Polish (23 Oct, after Ruthin's: "and Holdsworth"): one steady push a shot (the clips'
// own baked 3% push from the life phase cancelled, `clipPush`), a boil on the lines while
// they draw, the house rising over its sky from the watercolour on (split by the settled
// frame's cut-outs, scripts/sky-parallax.py on clip frame 260, its sky rebuilt from clear
// sky only), and the end card drawn on the paper: the place and the name, then the CB
// pencilled, inked, hatched and washed gold, turning into the real logo, one shimmer. The
// wash lands 6 beats into the end card, the shimmer 9 beats in.
const baked = (from: number, frames: number) => ({
  from,
  rate: 0.03 / (frames - from),
});
const house = {
  push: { scale: [1.01, 1.08] as [number, number], origin: "50% 50%" },
  clipPush: baked(180, 284),
  boil: { px: 1.6, from: 140, to: 200 },
  hold: {
    src: `${P}/sketch/exterior-hold.jpg`,
    fg: `${P}/sketch/exterior-hold-fg.png`,
    bg: `${P}/sketch/exterior-hold-bg.jpg`,
    sky: `${P}/sketch/exterior-hold-sky.png`,
    origin: "50% 95%",
    from: 260,
    depthFrom: 150,
  },
};
const room = (frames: number) => ({
  push: { scale: [1.01, 1.08] as [number, number], origin: "50% 50%" },
  clipPush: baked(110, frames),
  boil: { px: 1.6, from: 80, to: 120 },
});
// a little faster than Ruthin's (Scott: "do the Holdsworth hand-drawn logo a little faster"):
// the wash lands 6 beats in, the shimmer 9 beats in
const drawnEnd = { paper: `${P}/sketch/paper.jpg`, land: 131, shimmer: 196 };

export const holdsworthSketch: SketchSpec = {
  id: "holdsworth-sketch",
  music: {
    src: `${P}/warm-acoustic-guitar-37s.mp3`,
    trimmedSeconds: 38,
    startAt: 60, // 37.85s into the track
    gain: 1.2, // the track is -17.3 LUFS; 1.3 put the polished cut at -14.7
    fadeFrom: 982, // beat 45, the shimmer
  },
  durationInFrames: 1048, // 34.9s, beat 48
  shots: [
    {
      src: `${P}/sketch/exterior.mp4`,
      at: 0,
      note: {
        lines: ["Jacobean,", "and proud of it"],
        write: [20, 70],
        fade: [150, 185],
        top: 240,
      },
      ...house,
    },
    {
      src: `${P}/sketch/main-hall.mp4`,
      at: 262,
      note: {
        lines: ["The Beatles", "stayed here"],
        write: [12, 45],
        fade: [85, 115],
        top: 1180,
      },
      ...room(175),
    },
    { src: `${P}/sketch/tea-by-the-fire.mp4`, at: 437, ...room(174) },
    { src: `${P}/sketch/breakfast-in-bed.mp4`, at: 611, ...room(199) },
  ],
  endAt: 786, // beat 36: breakfast settles into black
  endFade: 22,
  endCard: {
    lines: ["Holdsworth House Hotel"],
    location: "Halifax, West Yorkshire",
  },
  drawnEnd,
  watermark: {
    src: "brand/cb-watermark.png",
    size: [100, 108],
    x: 920,
    y: 1452,
  },
};

// The Story: the house drawn while the fact is pencilled in, then the colour brings it to life
// (Scott: "a fact makes it come to life"). Polish (23 Oct): the fact is pencilled on the
// flagstones (the cream over the hedges was "hard to read") and turns to cream with a shadow
// over a scrim from the foot of the frame as the colour arrives (Scott: no halo or paper
// clearing, "just a scrim or shadow"); a second drawing,
// afternoon tea, cuts in on beat 12 with its own pencilled line, "Tea for two?", on the
// tablecloth (from the other session's cut, which Scott liked); then the drawn end card.
export const holdsworthSketchStory: SketchSpec = {
  ...holdsworthSketch,
  id: "holdsworth-sketch-story",
  music: { ...holdsworthSketch.music, fadeFrom: 633 }, // beat 29, the shimmer
  durationInFrames: 699, // 23.3s, beat 32
  shots: [
    {
      src: `${P}/sketch/exterior.mp4`,
      at: 0,
      note: {
        lines: ["The Beatles", "stayed here"],
        write: [20, 70],
        fade: [165, 200],
        // on the open flagstones of the path, clear of the kerb and the lawn's edge (Scott, 27 Oct: "in a
        // weird position still": it straddled the kerb's diagonal), above the CB and the safe zone
        top: 1370,
        align: "left",
        inset: 320,
        size: 88, // as "Tea for two?"
        // written in pencil on the drawing, turning to cream with a shadow over a scrim as
        // the colour arrives (Scott: no halo or paper clearing, "just a scrim or shadow")
        ground: "open",
        stay: "cream",
      },
      ...house,
    },
    {
      src: `${P}/sketch/tea-by-the-fire.mp4`,
      at: 262, // beat 12
      note: {
        lines: ["Tea for two?"],
        write: [10, 50],
        fade: [84, 108],
        top: 1260, // on the tablecloth
        inset: 190,
        size: 88,
        ground: "open",
        stay: "cream",
      },
      ...room(174),
      // the clip ends at 174 frames; the settled frame holds through the fade to the end card
      hold: { src: `${P}/sketch/tea-hold.jpg`, from: 172 },
    },
  ],
  endAt: 437, // beat 20: the tea settles into the paper
};
