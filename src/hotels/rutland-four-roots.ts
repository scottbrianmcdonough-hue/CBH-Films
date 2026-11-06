import type { RippleSpec } from "../hotel-film/ripple/types";

// Rutland Hall Hotel & Spa: the Four Roots Luxury Breaks (Bianca, 5 Nov: one social post for both packages before
// Mon 9 Nov, when the rest of November goes to Black Friday's 14). The Four Roots Journey is the signature of both
// breaks, so the reel walks its four parts, a root on each bar: a bathing ritual (the spa baths), a treatment of
// your choice (the treatment room), meditation (the loungers; "meditation" only, the two pages say quiet and
// guided), lakeside dining (Rutland Water at sunset); then the stay (the candlelit bath, the suite) and the end card.
// Facts from the hotel's two offer pages. No prices or nights on screen (the pages don't say per room or per
// person, and the two night page still lists "a night"): the packages are named in the post.
//
// Timing (Scott, 5 Nov: "one more beat each ... I have to read the yellow and the white lines", "especially roots 3 and 4"):
// the music now starts 16 beats before the bass (164.36s, the breakdown's start): the label and root one over the
// pads and the drop's gap, the bass back on root two; roots two to four seven beats each, the bedroom nine, the end
// card still on the final kick (186.81s). Story from 167.29s: label 4 beats, then six beats a root, bedroom six.
// Music: Deep House Sunset (Sunset House Grooves, Pixabay 538759; only on the 7s Circle C sting and Scott's own
// LinkedIn), 122.9 BPM, its unused opening: the label over the pads, the kick on the first root (15.94s), now one
// continuous stretch, its last phrase: the bass back on the first root (172.17s) and the end card on its final kick
// (186.81s), the pads ringing out (Scott: "stop splicing the music"). Cut on the beat: cut.json -> picture.mp4.
// Beat = 14.65 frames; the kick at frame 117 (reel) / 59 (Story).
export const rutlandFourRoots: RippleSpec = {
  id: "rutland-four-roots",
  picture: "campaigns/rutland-four-roots/picture.mp4",
  frames: 773,
  label: {
    // no gold caps: the name alone in cream Cormorant, then the breaks on the same exterior (Scott, 5 Nov: "get rid of
    // the gold caps and put the name of the hotel in cream Cormorant and then Four Roots Luxury Breaks after, same
    // exterior, then go")
    eyebrow: "",
    name: "Rutland Hall\nHotel & Spa",
    from: 8,
    to: 62,
    top: 540, // in the blue sky under the cloud, above the chimneys (Scott: not over the house; no shade, "storm cloud")
  },
  // the roots counted, not one repeated eyebrow (Scott, 5 Nov: "all the labels say Four Roots Journey, switch those up");
  // the second and third held six beats (Scott: "too fast to read")
  lines: [
    {
      text: "Four Roots\nLuxury Breaks",
      from: 64,
      to: 116,
      top: 540,
      sky: true,
    },
    // the treatment first, under the Four Roots sign straight after the label, then the water on the bass (Scott, 5 Nov:
    // "your treatment then switch off, then the water, then the stars, then supper, then the bed")
    {
      text: "A treatment\nof your choosing",
      from: 120,
      to: 228,
      top: 300,
    }, // above the desk's sign
    {
      text: "Let the water\ntake the weight",
      from: 237,
      to: 331,
    },
    {
      text: "Drift off\nbeneath the stars",
      from: 340,
      to: 433,
    },
    {
      text: "Dinner as the\nlake turns gold",
      from: 442,
      to: 536,
    },
    // the stay (Scott, 5 Nov: the last scene was "just the bedroom"): the two breaks named over the one bedroom shot
    {
      text: "One night,\nor two",
      from: 545,
      to: 665,
    },
  ],
  // the copy lifted (Scott, 5 Nov: "elevate the copy ... you have four opportunities for good copy"): each root named in
  // the eyebrow, a line of its own beneath; and a deeper shade so it reads over the bright pool and desk
  deepScrim: true,
  endCard: { at: 674, line: "Take root\nby Rutland Water", quick: true },
  music: {
    src: "campaigns/rutland-four-roots/music-reel.m4a",
    startAt: 0,
    gain: 0.47, // the raw track is ~-9 LUFS
    seconds: 25.8,
    fadeOut: 30,
  }, // one continuous stretch, no splice
};

// The Story: the label for a bar, the four roots, the candlelit bath, the end card (the stay shots out), 16.0s.
export const rutlandFourRootsStory: RippleSpec = {
  ...rutlandFourRoots,
  id: "rutland-four-roots-story",
  picture: "campaigns/rutland-four-roots/picture-story.mp4",
  frames: 655,
  // the opening a bar longer, as the reel's, so the name and the breaks both get read (music from 165.34s)
  label: rutlandFourRoots.label,
  lines: [
    {
      text: "Four Roots\nLuxury Breaks",
      from: 64,
      to: 116,
      top: 540,
      sky: true,
    },
    {
      text: "A treatment\nof your choosing",
      from: 120,
      to: 198,
      top: 300,
    },
    {
      text: "Let the water\ntake the weight",
      from: 207,
      to: 286,
    },
    {
      text: "Drift off\nbeneath the stars",
      from: 295,
      to: 374,
    },
    {
      text: "Dinner as the\nlake turns gold",
      from: 383,
      to: 462,
    },
    {
      text: "One night,\nor two",
      from: 471,
      to: 549,
    },
  ],
  endCard: { at: 556, line: "Take root\nby Rutland Water", quick: true },
  music: {
    ...rutlandFourRoots.music,
    src: "campaigns/rutland-four-roots/music-story.m4a",
    seconds: 21.9,
  },
};
