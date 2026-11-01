import type { RippleSpec } from "../hotel-film/ripple/types";

// Ruthin Castle Hotel & Spa, North Wales: a depth reel like Waterton Park's (Scott: "another
// parallax one like Waterton ... mixed with real footage", one of the SEO-sheet hotels; Ruthin
// is rank 19). Stills are camera moves with real depth on hand-drawn depth maps
// (public/hotels/ruthin-castle/make-depth.py: every object one solid block, the sky by colour;
// scripts/still-depth-dolly.py), cut against Ruthin's own autumn phone footage, alternating
// still and footage on hard cuts (scripts/cut-picture.py, cut.json): the clock tower (the
// label), sumac against the ruins, the peacock on the wall ("A castle / since the 1200s"), the
// Tafarn y Ddraig sign, the plate by the fire, the steaming hot tub, the carved white bed fading
// to black for the end card.
//
// Music: "Autumn Piano" by leberch (Pixabay 611124; Scott's pick after Bianca didn't like Lounge
// Soul). Solo piano, played freely (~129 BPM but rubato), so the cuts land on its chords, not a
// grid: the film starts on the first big chord (7.84s; startAt 234), the depth stills hold about
// four seconds each and the footage comes in as glimpses on the quicker chords (12.03, 13.37,
// 17.56, 18.91, 23.10, 24.49s), the bed fades out and the end card rises on the strong chord at
// 28.61s (frame 624), the music fading over the last two seconds.
export const ruthinCastleDepth: RippleSpec = {
  id: "ruthin-castle-depth",
  picture: "hotels/ruthin-castle/picture-cut.mp4",
  frames: 800,
  label: {
    eyebrow: "North Wales",
    name: "Ruthin Castle\nHotel & Spa",
    from: 8,
    to: 118,
  },
  // the line over the castle, clear of the peacock's head (Scott: it sat on the line)
  lines: [
    {
      text: "A castle\nsince the 1200s",
      from: 170,
      to: 290,
      top: 430,
      size: 1.25,
    },
  ],
  // the question inside the bedroom (Scott: "in the middle layer in the bedroom"): it rises from
  // behind the carved headboard (the bed's near layer, white-bed-fg.webm: the bed move with the
  // headboard's traced outline as alpha, make-bed-matte.py) and settles over the red curtains
  // as the camera pushes in, held at the top of the photo so the headboard sinks beneath it
  endCard: {
    at: 535, // on the piano note at 25.84s, a second into the bed (Scott: "come up sooner")
    line: "Fancy a night\nin a castle?",
    scene: {
      fg: "hotels/ruthin-castle/clips/white-bed-fg.webm",
      from: 501,
      top: 250,
      rise: 260,
    },
  },
  music: {
    // solo piano sits quiet (-20.5 LUFS at full volume): autumn-piano-mastered.mp3 is the
    // track 6 dB up through a limiter (peaks -1 dBFS), here brought to -15.5 LUFS
    src: "hotels/ruthin-castle/autumn-piano-mastered.mp3",
    startAt: 234,
    gain: 0.88,
    seconds: 140.04,
    fadeOut: 60,
  },
};
