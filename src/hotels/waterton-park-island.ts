import type { RippleSpec } from "../hotel-film/ripple/types";

// Waterton Park Hotel & Spa, Wakefield: "its own island" (ripple reel). Walton Hall stands
// on an island in a lake, reached by a footbridge (to confirm with Scott: the CBH site is
// blocked here), so every cut is a ripple across the water. Scott's five photos from the CBH
// site (public/hotels/waterton-park/), each a camera move with real depth
// (scripts/still-depth-dolly.py, settings in ripple.json's clips): the aerial drawing back
// from the hall to the island in its lake (the label), the garden path to the footbridge
// ("Its own island, / one bridge in"), afternoon tea, the indoor pool over the lake, prosecco
// in the outdoor hot tub, rippling into black for the end card. Picture joined by
// scripts/ripple-reel.py from public/hotels/waterton-park/ripple.json.
//
// Music: Jazz Corporate Cafe by alex-morgan (Pixabay 556232; sent by Scott for the mosaic,
// unused there, so in no other film), 103.4 BPM, bars of 2.322s. The film starts at 58.07s
// (startAt 1742): a bar of the band, then its bass drops out for a bar under the label; the
// first ripple lands as the band comes back (62.71s, frame 139), then one every two bars
// (67.35, 72.00, 76.64: just after its second short bass break, 81.29 into the end card);
// the track's own ending (a stop, then a last hit at 83.9s) plays out under the end card.
export const watertonParkIsland: RippleSpec = {
  id: "waterton-park-island",
  picture: "hotels/waterton-park/picture-cut.mp4",
  frames: 838,
  label: {
    eyebrow: "Wakefield",
    name: "Waterton Park\nHotel & Spa",
    from: 10,
    to: 125,
  },
  lines: [{ text: "Its own island,\none bridge in", from: 160, to: 265 }],
  endCard: { at: 697, line: "Shall we cross\nthe bridge?" },
  music: {
    src: "hotels/waterton-park/jazz-corporate-cafe.mp3",
    startAt: 1742,
    gain: 0.49, // -15.5 LUFS
    seconds: 87.74,
  },
};

// The Story (Scott: "can go over", so every shot keeps its beat): the aerial with the label
// for two bars, then a bar each for the footbridge (the line), the afternoon tea, the indoor
// pool and the four-poster bedroom (Scott's photo, 18 Oct: the stay ends in the room), hard
// cuts on the downbeats (cut-story.json -> picture-story-bedroom.mp4); no hot tub: its photo
// reads as summer for an October post (Scott: "not sure they'll do hot tub in October"). The
// end card on the seventh bar, the music fading under it (the track plays on here, no stop).
export const watertonParkIslandStory: RippleSpec = {
  ...watertonParkIsland,
  id: "waterton-park-island-story",
  picture: "hotels/waterton-park/picture-story-bedroom.mp4",
  frames: 530,
  label: { ...watertonParkIsland.label, to: 125 },
  lines: [{ text: "Its own island,\none bridge in", from: 143, to: 207 }],
  endCard: { at: 418, line: "Shall we cross\nthe bridge?" },
  music: { ...watertonParkIsland.music, fadeOut: 60 },
};
