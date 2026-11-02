import type { RippleSpec } from "../hotel-film/ripple/types";

// Nailcote Hall, Berkswell: the meetings and events film (Bianca, 2 Nov: "nailcote m&e reel out
// on Fri"; Scott: "a nailcote reel like the haycock manor", both 9:16 for Instagram and 16:9 for
// LinkedIn and the website). Haycock's meetings cut, on Nailcote's own photos (the CBH site and
// nailcotehall.co.uk's conferencing pages, via Scott): every still a depth move on a hand-made
// depth map (public/hotels/nailcote-hall/make-clips.py, which also writes both cut lists).
//
// The house on the track's intro (label WARWICKSHIRE / Nailcote Hall), the pad and pencil, then
// on the groove all ten event spaces, smallest to largest, a bar each, the camera pushing in at
// one speed with every table in the same place: each room named in gold caps with its place in
// the count ("Yew Suite · 3 of 10") over a line (Scott: copy that sells the room, the number
// worked in, never "U-shape 32"; every figure the capacity chart's, for the layout pictured).
// Then where it is (over the clubhouse), lunch in the Oak Room, the scallops and the terrine,
// afternoon tea, Charley's Bar, the golf, the four poster fading to the end card.
//
// Facts (Scott, from the CBH hotel page and Nailcote's CBH meeting rooms page): 10 event
// spaces; Boardroom 10, Library 12, Yew 18 boardroom, Wellingtonia 20 boardroom, Dudley 28
// cabaret, Kenilworth 32 U-shape, Terrace 42 cabaret (pictured: rounds; its doors folded back,
// visible), the Clubhouse Pavilion 60 theatre (its balcony over the golf course: CBH page), Lant
// 150 theatre and 70 cabaret (both its photos show rounds, so both figures), the Marquee 280 for
// dinner (its LED dancefloor: CBH FAQ). NEC 6.07 miles, M42 J6 6.7 miles. Built in 1640 (never
// "Tudor"). The Oak Room is named; rosettes never (none listed; the old plates in the hall are
// kept out of the cut). Charley's Bar is spelt as its sign.
//
// Music: "Tech House Vibes" (Mixkit 130; in no other film), ~122 BPM, beat n at 0.088 +
// 0.49181n s. From beat 21 (startAt 312): three bars of the intro under the house and the pad,
// the full groove on beat 33 (frame 177) with the first room, a bar a room to beat 73, the end
// card on beat 103 (frame 1210, after the four poster's fade), two bars of it to beat 111.
const ROOM = (from: number, eyebrow: string, text: string) => ({
  text,
  eyebrow,
  from: from + 2,
  to: from + 59,
  size: 0.82,
});

export const nailcoteHallMeetingsReel: RippleSpec = {
  id: "nailcote-hall-meetings-reel",
  picture: "hotels/nailcote-hall/picture-tall.mp4",
  frames: 1328,
  label: { eyebrow: "Warwickshire", name: "Nailcote Hall", from: 8, to: 112 },
  lines: [
    { text: "Ten event spaces\nTake your pick", from: 120, to: 177, size: 0.82 },
    ROOM(177, "Boardroom · 1 of 10", "Ten seats\nZero distractions"),
    ROOM(236, "Library · 2 of 10", "Twelve round the table\nBooks for company"),
    ROOM(295, "Yew Suite · 3 of 10", "18 for the board\nA tapestry for the backdrop"),
    ROOM(354, "Wellingtonia Suite · 4 of 10", "20 down one long table\nEvery eye on the screen"),
    ROOM(413, "Dudley Suite · 5 of 10", "28 in cabaret\nNobody stuck at the back"),
    ROOM(472, "Kenilworth Suite · 6 of 10", "A U for 32\nEveryone face to face"),
    ROOM(531, "Terrace Suite · 7 of 10", "Fold back the doors\nMake room for 42"),
    ROOM(590, "The Clubhouse Pavilion · 8 of 10", "60 facing the screen\nThe golf course at the break"),
    ROOM(649, "Lant Suite · 9 of 10", "Room for the big pitch\n150 in rows, 70 round tables"),
    ROOM(708, "The Marquee · 10 of 10", "Dinner for 280\nThen the dancefloor lights up"),
    { text: "6 miles from the NEC\n7 from M42 J6", from: 769, to: 826, size: 0.82 },
    { text: "Minutes approved\nDrinks at Charley’s", from: 1005, to: 1062, size: 0.82 },
    { text: "Swap the slides\nfor the par 3", from: 1064, to: 1121, size: 0.82 },
  ],
  endCard: { at: 1192, line: "The agenda’s new\nThe house is from 1640" },
  music: {
    src: "music/mixkit-tech-house-vibes-130.mp3",
    startAt: 312,
    gain: 0.5, // ~-15.6 LUFS
    seconds: 101.9,
    fadeOut: 50,
  },
};

// The 16:9 cut for LinkedIn and the website: the same edit and timings, its own picture (each move
// rendered at 1920 x 1080; the tea standing whole over its soft copy, the golf on the green by the
// pond), the type at full size and placed for a landscape frame (`wide`).
export const nailcoteHallMeetings: RippleSpec = {
  ...nailcoteHallMeetingsReel,
  id: "nailcote-hall-meetings",
  wide: true,
  picture: "hotels/nailcote-hall/picture-wide.mp4",
  lines: nailcoteHallMeetingsReel.lines.map((l) => ({ ...l, size: 0.9 })),
};
