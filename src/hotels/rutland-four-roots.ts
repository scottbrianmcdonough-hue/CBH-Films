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
// LinkedIn), 122.9 BPM, its unused opening: the label over the pads, the kick on the first root (15.94s), a jump of
// 320 beats on the bar to its last phrase so the end card lands on the track's final kick (186.81s) and the pads
// ring out (`music-reel.m4a`, cut 15ms before each kick, 10ms crossfade). Cut on the beat: cut.json -> picture.mp4.
// Beat = 14.65 frames; the kick at frame 117 (reel) / 59 (Story).
export const rutlandFourRoots: RippleSpec = {
  id: "rutland-four-roots",
  picture: "campaigns/rutland-four-roots/picture.mp4",
  frames: 656,
  label: { eyebrow: "Rutland Water", name: "Rutland Hall\nHotel & Spa", from: 10, to: 110 },
  lines: [
    { eyebrow: "The Four Roots Journey", text: "A bathing ritual", from: 120, to: 172 },
    { eyebrow: "The Four Roots Journey", text: "A treatment\nof your choice", from: 179, to: 231 },
    { eyebrow: "The Four Roots Journey", text: "Meditation", from: 237, to: 290 },
    { eyebrow: "The Four Roots Journey", text: "Lakeside dining", from: 296, to: 348 },
  ],
  endCard: { at: 557, line: "Take root\nby the lake" },
  music: { src: "campaigns/rutland-four-roots/music-reel.m4a", startAt: 0, gain: 0.84, seconds: 23.0, fadeOut: 30 },
};

// The Story: the label for a bar, the four roots, the candlelit bath, the end card (the stay shots out), 16.0s.
export const rutlandFourRootsStory: RippleSpec = {
  ...rutlandFourRoots,
  id: "rutland-four-roots-story",
  picture: "campaigns/rutland-four-roots/picture-story.mp4",
  frames: 480,
  label: { ...rutlandFourRoots.label, from: 4, to: 54 },
  lines: rutlandFourRoots.lines.map((l) => ({ ...l, from: l.from - 58, to: l.to - 58 })),
  endCard: { at: 381, line: "Take root\nby the lake" },
  music: { ...rutlandFourRoots.music, src: "campaigns/rutland-four-roots/music-story.m4a", seconds: 17.1 },
};
