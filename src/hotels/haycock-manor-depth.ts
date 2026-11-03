import type { RippleSpec } from "../hotel-film/ripple/types";

// Haycock Manor Hotel, Wansford: a depth reel like Ruthin's (Scott, 31 Oct: "need a feature for
// Haycock Manor", with the hotel's own photos). Every photo is a camera move with real depth on a
// hand-drawn depth map (public/hotels/haycock-manor/make-depth.py; scripts/still-depth-dolly.py).
// Warp-free (Scott: "watch the warping": softened block edges bent the bricks, tiles and the bed's
// edge): the pour and the tea stand are traced tight and move as rigid layers standing on the
// table's ramp (the carafe's whole rim inside the trace: Scott, "check the glass rim"); the
// lounge, restaurant, bath and bedroom move on smooth floor ramps only, no edges to bend.
// Cut to the band, not evenly (Scott: "cuts more on the music or it just looks like a slideshow";
// cut.json is built from the track's beat grid, frame = 1.4 + 20.93 x beat): the pour wide (the
// label) on the busy intro, a punch in on the pour into the glass on beat 4; then the quiet passage
// (beats 6-18) in three unhurried shots a bar each, the blue lounge, the birdcage restaurant, tea in
// the oak boxes; a punch in on the tea's top box on the hit at 18; the three horn stabs after the
// band's stop (21, 21.5, 22) as three plates, the Prevost plate, the marble plates (flat overhead
// moves, depth/flat.png), fish and chips held to 25; the gold bath on the build, a punch in on the
// gold basin on the stab run at 28, the beamed bedroom from 30 fading to black for the end card.
// The courtyard and the garden bedroom are left out: a summer garden, and November stays indoors
// (Scott). No dish or room is named on screen.
//
// Music: "Late Night Big Band Swing" by nickpanek (Pixabay 236168; in no other film), 86 BPM,
// from its 63.92s beat (startAt 1918) so the film lands on the band's own ending: the end card on
// the 87.70s hit (beat 34, frame 713), the final hits (35, 36, 37) ringing out under it.
export const haycockManorDepth: RippleSpec = {
  id: "haycock-manor-depth",
  picture: "hotels/haycock-manor/picture-cut.mp4",
  frames: 843,
  label: {
    eyebrow: "Wansford",
    name: "Haycock Manor\nHotel",
    from: 10,
    to: 118,
  },
  lines: [],
  endCard: {
    at: 713,
    line: "Cocktail first,\nor the gold bath?",
  },
  music: {
    src: "music/nickpanek-late-night-big-band-swing-236168.mp3",
    startAt: 1918,
    gain: 0.9, // ~-15.5 LUFS
    seconds: 92.88,
    fadeOut: 30,
  },
};

// The Story (Wed 4 Nov): the reel's beats 17-34: the pour (with the label), the three stabs as the
// Prevost plate, the marble plates and the tea, the gold bath, the basin, the bedroom fading into
// the same end card, cut on the band's beats (cut-story.json -> picture-story.mp4), the music
// started so the end card lands on the same 87.70s hit as the reel. Then (Scott, 3 Nov: "a little more
// length, one more shot", "the drink maybe") the punch in on the pour after the wide, as the reel has it,
// the music two beats earlier so the rest keeps its beats. 17.6s.
export const haycockManorDepthStory: RippleSpec = {
  ...haycockManorDepth,
  id: "haycock-manor-depth-story",
  picture: "hotels/haycock-manor/picture-story.mp4",
  frames: 528,
  label: { ...haycockManorDepth.label, to: 78 },
  // two lines over shots in cream Cormorant (Scott, 3 Nov: "one or two overlays ... for the story")
  lines: [
    { text: "Afternoon tea,\nstacked high", from: 151, to: 208 },
    { text: "Run the bath,\ntake your time", from: 214, to: 312 },
  ],
  endCard: { ...haycockManorDepth.endCard, at: 398 },
  music: { ...haycockManorDepth.music, startAt: 2233 },
};

// The meetings and events cut (Scott, 31 Oct: "a landscape version for meetings and events", "same
// music same style", "not just meetings, after the meetings a drink, convenience, class", "get food
// in there too", then "make it dynamic, beat cut or match cut transitions and overlays, maybe a
// counter"), 16:9 for screens and the events team: the same beats, track, grade and type, led by
// the hotel's own rooms (Scott's photos from the CBH meeting rooms page, moved on smooth room
// depth, make-depth.py room()): the Fitzwilliam private dining room wide (the label), then a cut
// on every beat through the rooms, each framed with its table in the same place and the camera
// pushing in at one speed across the cuts (a match cut on the tables; m-*.mp4): the stone
// boardroom, the oval, the small boardroom (not the Fitzwilliam again: Scott, "beginning two cuts
// look similar", then "you show this room twice"), as MEETING SPACES counts 1 to 3, then 4, 5, 6, 7
// on the half beats as it lands on the U-shape suite and holds; "Just off the / A1 and A47" over the blue
// lounge (its window on the street); the break (afternoon tea) on the hit at 18; dinner on the
// three stabs (the Prevost plate, the marble plates, fish and chips) under "Two AA Rosette /
// restaurants"; the drink after on the build (the pour, a punch in on the stab run); the bedroom.
// Facts from the hotel's CBH pages only (7 meeting rooms, just off the A1 and A47, Prevost three
// AA Rosettes and the Haycock Kitchen two); the meeting page's "up to 350 delegates" is left off,
// its own table tops out at 40 theatre style. The place is Peterborough, as CBH has it
// ("Peterborough (Wansford)"). cut-meetings.json -> picture-meetings.mp4 (clips-wide/).
export const haycockManorMeetings: RippleSpec = {
  ...haycockManorDepth,
  id: "haycock-manor-meetings",
  wide: true,
  picture: "hotels/haycock-manor/picture-meetings.mp4",
  label: { eyebrow: "Peterborough", name: "Haycock Manor Hotel", from: 10, to: 84 },
  counter: {
    caption: "Meeting spaces",
    from: 85,
    to: 263,
    ticks: [85, 106, 127, 148, 158, 169, 179],
  },
  lines: [
    { text: "Just off the\nA1 and A47", from: 279, to: 372 },
    { text: "Two AA Rosette\nrestaurants", from: 447, to: 521 },
    { text: "After the meeting,\na drink", from: 533, to: 623 },
  ],
  endCard: { at: 713, line: "Where\u2019s your\nnext away day?" },
};
