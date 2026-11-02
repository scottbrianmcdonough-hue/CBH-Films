import type { MESpec } from "../hotel-film/me/MEReel";

// Nailcote Hall, Berkswell: the meetings and events reel (Bianca, 2 Nov: "nailcote m&e reel out on
// Fri"), on the Ramside Hall M&E reel's template (Scott: "like the ramside reel", "for the rooms
// you can do the three panel", landscape first). An earlier depth version with a line for every room
// was dropped (Scott: "kill the depth moves", the room copy "too much").
//
// Photos: the CBH site and nailcotehall.co.uk's conferencing pages (via Scott). Facts from the CBH
// hotel page and Nailcote's CBH meeting rooms page (Scott): NEC 6.07 miles, M42 J6 6.7; the Cromwell
// 9 hole par 3 course, home of the British Par 3 Championship, corporate golf days; the Oak Room;
// built in 1640 (never "Tudor"); 49 bedrooms and suites; a health club with an indoor pool. No
// rosettes (none listed). Room names as the chart spells them.
//
// Music: "Tech House Vibes" (Mixkit 130; in no other film), ~122 BPM, beat n at 0.088 + 0.49181n s,
// from beat 17 (startAt 253): the house over the intro, the rooms' panels on the groove (beat 33),
// every scene on a downbeat, the end card on beat 65, two bars of it.
const B = (beat: number) => Math.round((beat - 17) * 0.49181 * 30);
const P = "hotels/nailcote-hall/";
const R = P + "rooms/";

export const nailcoteHallMeetings: MESpec = {
  id: "nailcote-hall-meetings",
  frames: B(85),
  scenes: [
    // Scott: "too much information on the first", then "it's called a long name": the eyebrow and the
    // full name, nothing else
    {
      at: 0,
      shots: [{ src: P + "exterior.jpg", pos: "50% 50%" }],
      text: { eyebrow: "Meetings & Events", title: "Nailcote Hall Hotel,\nGolf & Country Club", subs: [""] },
    },
    { at: B(29), shots: [{ src: R + "kenilworth-suite-1.jpg", pos: "55% 50%" }] },
    // Scott: "the panels are too fast to read": two bars a split, the panels a second apart
    {
      at: B(33),
      panelBeat: 30,
      panels: [
        { src: R + "lant-suite-1.jpg", name: "Lant Suite", pos: "50% 55%" },
        { src: R + "wellingtonia-suite-1.jpg", name: "Wellingtonia Suite", pos: "50% 60%" },
        { src: R + "clubhouse-pavilion-theatre.jpg", name: "The Clubhouse Pavilion", pos: "50% 45%", widePos: "70% 50%" },
      ],
    },
    {
      at: B(41),
      panelBeat: 30,
      panels: [
        { src: R + "yew-suite.jpg", name: "Yew Suite", pos: "50% 60%", widePos: "55% 50%" },
        { src: R + "boardroom.jpg", name: "Boardroom", pos: "50% 70%", widePos: "45% 50%" },
        { src: R + "marquee-day.jpg", name: "The Marquee", pos: "50% 55%" },
      ],
    },
    {
      at: B(49),
      shots: [{ src: P + "golf-rhododendrons.jpg", wideSrc: P + "golf-green-pond.jpg", pos: "67% 50%" }],
      text: {
        eyebrow: "Corporate golf",
        title: "A par 3 on the doorstep",
        subs: ["Home of the British Par 3 Championship"],
      },
    },
    {
      at: B(57),
      shots: [{ src: P + "oak-room-table.jpg", pos: "66% 50%" }],
      text: { eyebrow: "Dining", title: "Lunch in the Oak Room", subs: ["In a house built in 1640"] },
    },
    {
      at: B(65),
      shots: [
        { src: P + "pool.jpg", pos: "45% 50%" },
        { src: P + "bedroom-four-poster.jpg", pos: "28% 50%" },
      ],
      cuts: [B(71)],
      text: {
        eyebrow: "Stay over",
        title: "Make a night of it",
        subs: ["A health club and indoor pool", "49 bedrooms and suites"],
        subCuts: [B(71)],
      },
    },
  ],
  end: {
    at: B(77),
    name: "Nailcote Hall Hotel,\nGolf & Country Club",
    place: "Berkswell, Warwickshire",
  },
  music: { src: "music/mixkit-tech-house-vibes-130.mp3", startAt: 253, gain: 0.5, fadeOut: 50 },
};

// The 9:16 cut for Instagram: the same film, the panels stacked as strips (Scott, 2 Nov: "just the
// 16:9" for now; kept registered).
export const nailcoteHallMeetingsReel: MESpec = {
  ...nailcoteHallMeetings,
  id: "nailcote-hall-meetings-reel",
};
