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
    // the gold caps once, at the start (Scott, 5 Nov: "get rid of the gold lines above and just put it at the beginning")
    eyebrow: "Four Roots Luxury Breaks",
    name: "Rutland Hall\nHotel & Spa",
    from: 10,
    to: 110,
  },
  // the roots counted, not one repeated eyebrow (Scott, 5 Nov: "all the labels say Four Roots Journey, switch those up");
  // the second and third held six beats (Scott: "too fast to read")
  lines: [
    {
      text: "Let the water\ntake the weight",
      from: 120,
      to: 228,
    },
    {
      text: "Choose it,\nthen switch off",
      from: 237,
      to: 331,
      top: 300,
    }, // above the desk's sign
    {
      text: "Lie back under\na sky of stars",
      from: 340,
      to: 433,
    },
    {
      text: "Supper as the\nlake turns gold",
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
  endCard: { at: 674, line: "Take root\nby the lake" },
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
  frames: 597,
  label: { ...rutlandFourRoots.label, from: 4, to: 54 },
  lines: [
    {
      text: "Let the water\ntake the weight",
      from: 62,
      to: 140,
    },
    {
      text: "Choose it,\nthen switch off",
      from: 149,
      to: 228,
      top: 300,
    },
    {
      text: "Lie back under\na sky of stars",
      from: 237,
      to: 316,
    },
    {
      text: "Supper as the\nlake turns gold",
      from: 325,
      to: 404,
    },
    {
      text: "One night,\nor two",
      from: 413,
      to: 491,
    },
  ],
  endCard: { at: 498, line: "Take root\nby the lake" },
  music: {
    ...rutlandFourRoots.music,
    src: "campaigns/rutland-four-roots/music-story.m4a",
    seconds: 19.9,
  },
};
