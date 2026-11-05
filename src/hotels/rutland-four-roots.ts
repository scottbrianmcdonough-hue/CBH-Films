import type { RippleSpec } from "../hotel-film/ripple/types";

// Rutland Hall Hotel & Spa: the Four Roots Luxury Breaks (Bianca, 5 Nov: one social post for both packages before
// Mon 9 Nov, when the rest of November goes to Black Friday's 14). The Four Roots Journey is the signature of both
// breaks, so the reel walks its four parts, a root on each bar: a bathing ritual (the spa baths), a treatment of
// your choice (the treatment room), meditation (the loungers; "meditation" only, the two pages say quiet and
// guided), lakeside dining (Rutland Water at sunset); then the stay (the candlelit bath, the suite) and the end card.
// Facts from the hotel's two offer pages. No prices or nights on screen (the pages don't say per room or per
// person, and the two night page still lists "a night"): the packages are named in the post.
//
// Music: Deep House Sunset (Sunset House Grooves, Pixabay 538759; only on the 7s Circle C sting and Scott's own
// LinkedIn), 122.9 BPM, its unused opening: the label over the pads, the kick on the first root (15.94s), now one
// continuous stretch, its last phrase: the bass back on the first root (172.17s) and the end card on its final kick
// (186.81s), the pads ringing out (Scott: "stop splicing the music"). Cut on the beat: cut.json -> picture.mp4.
// Beat = 14.65 frames; the kick at frame 117 (reel) / 59 (Story).
export const rutlandFourRoots: RippleSpec = {
  id: "rutland-four-roots",
  picture: "campaigns/rutland-four-roots/picture.mp4",
  frames: 656,
  label: { eyebrow: "Rutland Water", name: "Rutland Hall\nHotel & Spa", from: 10, to: 110 },
  // the roots counted, not one repeated eyebrow (Scott, 5 Nov: "all the labels say Four Roots Journey, switch those up");
  // the second and third held six beats (Scott: "too fast to read")
  lines: [
    { eyebrow: "Root one · Bathing ritual", text: "Let the water\ntake the weight", from: 120, to: 199 },
    { eyebrow: "Root two · Treatment", text: "Choose it,\nthen switch off", from: 208, to: 287, top: 300 }, // above the desk's sign
    { eyebrow: "Root three · Meditation", text: "Lie back under\na sky of stars", from: 296, to: 346 },
    { eyebrow: "Root four · Lakeside dining", text: "Supper as the\nlake turns gold", from: 355, to: 404 },
    // the stay (Scott, 5 Nov: the last scene was "just the bedroom"): the two breaks named over the one bedroom shot
    { eyebrow: "Four Roots Luxury Breaks", text: "One night,\nor two", from: 414, to: 548 },
  ],
  // the copy lifted (Scott, 5 Nov: "elevate the copy ... you have four opportunities for good copy"): each root named in
  // the eyebrow, a line of its own beneath; and a deeper shade so it reads over the bright pool and desk
  deepScrim: true,
  endCard: { at: 557, line: "Take root\nby the lake" },
  music: { src: "campaigns/rutland-four-roots/music-reel.m4a", startAt: 0, gain: 1, seconds: 23.0, fadeOut: 30 }, // one continuous stretch, no splice
};

// The Story: the label for a bar, the four roots, the candlelit bath, the end card (the stay shots out), 16.0s.
export const rutlandFourRootsStory: RippleSpec = {
  ...rutlandFourRoots,
  id: "rutland-four-roots-story",
  picture: "campaigns/rutland-four-roots/picture-story.mp4",
  frames: 480,
  label: { ...rutlandFourRoots.label, from: 4, to: 54 },
  lines: [
    { eyebrow: "Root one · Bathing ritual", text: "Let the water\ntake the weight", from: 62, to: 126 },
    { eyebrow: "Root two · Treatment", text: "Choose it,\nthen switch off", from: 135, to: 199, top: 300 },
    { eyebrow: "Root three · Meditation", text: "Lie back under\na sky of stars", from: 208, to: 258 },
    { eyebrow: "Root four · Lakeside dining", text: "Supper as the\nlake turns gold", from: 267, to: 316 },
    { eyebrow: "Four Roots Luxury Breaks", text: "One night,\nor two", from: 326, to: 374 },
  ],
  endCard: { at: 381, line: "Take root\nby the lake" },
  music: { ...rutlandFourRoots.music, src: "campaigns/rutland-four-roots/music-story.m4a", seconds: 20.9 },
};
