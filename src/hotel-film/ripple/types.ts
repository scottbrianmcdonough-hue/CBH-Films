// The ripple reel (Waterton Park, "its own island": a hall on an island in a lake, so every
// cut is a ripple). The picture is one clip made by scripts/ripple-reel.py: each still a
// camera move with real depth (scripts/still-depth-dolly.py), joined by a ring spreading
// across the water from a point in the outgoing shot, the next shot inside it, the last one
// rippling into black. The film lays the grade, the opening label, a line or two, the end
// card and the music over it.

export type RippleSpec = {
  id: string;
  picture: string; // the rippled clip, from scripts/ripple-reel.py
  frames: number; // the film's length (the picture ends in black before it)
  // 16:9 landscape (1920 x 1080; Haycock Manor's meetings and events cut, for screens and the
  // events team): the label and lines sit lower (no app UI to clear), the CB in its corner
  wide?: boolean;
  // 4:5 for the feeds (1080 x 1350; the Black Friday spotlights): the label, lines and shade sit
  // lower than the 9:16's (no Story UI to clear), the CB in the 4:5 corner
  feed?: boolean;
  // the opening label: the place in gold caps with its still underline, the name beneath
  // top: set the label in the sky instead of bottom left (Rutland, Scott: not "slapped over the top of the housing")
  label: {
    eyebrow: string;
    name: string;
    from: number;
    to: number;
    top?: number;
  };
  // cream Cormorant over a shot; top: set the line this many px from the top of the frame
  // instead of the bottom-left (Ruthin: the peacock's head sat under the line)
  // size: a scale on the type (Ruthin: the line was hard to notice at 1)
  // eyebrow: gold caps with its still underline above the line, the label's order (Nailcote's
  // meeting rooms: the room's name and where it sits in the count, "Yew Suite · 3 of 10")
  lines: {
    text: string;
    from: number;
    to: number;
    top?: number;
    size?: number;
    eyebrow?: string;
    // over a bright sky: no shade, a tight shadow on the letters (Rutland's opening)
    sky?: boolean;
  }[];
  // hotel cards (the Black Friday region reels): the place in the campaign's mauve caps, the name in cream Cormorant,
  // the offer in a mauve pill, as on the regional carousels; each held across that hotel's shots
  cards?: { from: number; to: number; place: string; name: string; offer: string }[];
  // snappy cuts (Scott, 11 Nov, the South region reel: "kinda just a flat slideshow"): kicks are the film frames where
  // the picture cuts; each cut is a zoom snap (the old shot pushes in over its last frames, the new one lands large
  // and settles), and the title, cards and end card animate on the beat (beat: frames a beat) instead of fading up
  // soft: kicks at a third of the strength (the opening punch in)
  snap?: { kicks: number[]; beat: number; soft?: number[] };
  // the carousel cover come to life as the opening (Scott, 12 Nov: "like the carousels, a collage first, then the
  // exteriors with the sale percent"): the hotels' tiles above and below a black band, the region in mauve caps,
  // Black Friday Sale in cream Cormorant and the mauve Save up to pill; it holds until `to`, then the first exterior
  collage?: { to: number; caps: string; best: string; tiles: { src: string; pos: string }[] };
  // a title over the opening shot: mauve caps over a cream Cormorant line ("Black Friday Sale" / "The North")
  title?: { from: number; to: number; eyebrow: string; line: string };
  // a counter over the shots (Haycock's meetings cut: MEETING SPACES ticking up as the rooms cut
  // on the beat): the caption in gold caps with its underline (the label's order), the number in
  // cream Cormorant beneath, one more at each tick (film frames), punching in as it changes
  counter?: { caption: string; from: number; to: number; ticks: number[] };
  // a stronger shade behind the lines and label, for photos too bright for the default (Rutland's pool and desk)
  deepScrim?: boolean;
  // the question, rising on black; or, with scene, inside the last shot (Scott: "in the middle
  // layer in the bedroom"): the picture plays on, the words rise from behind its near layer
  // (fg: that shot's near things with alpha, starting at film frame from) and settle at top
  endCard: {
    at: number;
    line: string;
    scene?: { fg: string; from: number; top: number; rise: number };
    // the line rises straight in, not after the picture's fade (Scott, 5 Nov, Rutland: "delayed a full second ... snappy")
    quick?: boolean;
    // a small caps line above it (the Black Friday spotlights: "Black Friday Sale" in Lee's mauve)
    eyebrow?: string;
    // a small one line under it (the spotlights: the live page's offer)
    sub?: string;
  };
  // fadeOut: frames the music fades over at the end (default 12; a Story stops mid-track)
  music: {
    src: string;
    startAt: number;
    gain: number;
    seconds: number;
    fadeOut?: number;
  };
};

export const validateRipple = (f: RippleSpec) => {
  if (f.music.startAt / 30 + f.frames / 30 > f.music.seconds)
    throw new Error(`${f.id}: the film is longer than the music`);
};
