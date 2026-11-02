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
// from beat 21 (startAt 312; Scott wanted it "more engaging", so the house holds two bars, not three):
// the push into Kenilworth's screen, the panels on the groove (beat 33), hard cuts on the downbeats
// from there, the end card on the crash at beat 77, two bars of it.
const B = (beat: number) => Math.round((beat - 21) * 0.49181 * 30);
const P = "hotels/nailcote-hall/";
const R = P + "rooms/";

export const nailcoteHallMeetings: MESpec = {
  id: "nailcote-hall-meetings",
  frames: B(97),
  scenes: [
    // Scott: "too much information on the first", then "it's called a long name": the eyebrow and the
    // full name, nothing else
    {
      at: 0,
      shots: [{ src: P + "exterior.jpg", pos: "50% 50%" }],
      text: { eyebrow: "Meetings & Events", title: "Nailcote Hall Hotel,\nGolf & Country Club", subs: [""] },
    },
    // the camera gathers speed into Kenilworth's screen (its Nailcote logo), cutting on the groove to
    // the panels, Wellingtonia's screen in the middle one
    {
      at: B(29),
      shots: [{ src: R + "kenilworth-suite-1.jpg", pos: "55% 50%" }],
      push: { to: 1.9, pos: "79% 27%" },
    },
    // Scott: "the panels are too fast to read": two bars a split
    {
      at: B(33),
      cut: true,
      panelBeat: 15, // a beat apart, then a 3s hold on the full split (Scott: "polish pass")
      layout: "feature",
      panels: [
        { src: R + "wellingtonia-suite-1.jpg", name: "Wellingtonia Suite", pos: "50% 60%", widePos: "50% 50%" },
        { src: R + "lant-suite-1.jpg", name: "Lant Suite", pos: "50% 55%", widePos: "48% 50%" },
        { src: R + "clubhouse-pavilion-theatre.jpg", name: "The Clubhouse Pavilion", pos: "50% 45%", widePos: "66% 50%" },
      ],
    },
    {
      at: B(41),
      cut: true,
      panelBeat: 15, // a beat apart, then a 3s hold on the full split (Scott: "polish pass")
      layout: "feature",
      panels: [
        { src: R + "yew-suite.jpg", name: "Yew Suite", pos: "50% 60%", widePos: "38% 50%" },
        { src: R + "boardroom.jpg", name: "Boardroom", pos: "50% 70%", widePos: "56% 50%" },
        { src: R + "marquee-day.jpg", name: "The Marquee", pos: "50% 55%", widePos: "50% 50%" },
      ],
    },
    // an after hours beat and livelier copy (Scott: "jazz it up"), a notch back ("natural clever")
    {
      at: B(49),
      cut: true,
      shots: [{ src: P + "golf-rhododendrons.jpg", wideSrc: P + "golf-green-pond.jpg", pos: "67% 50%" }],
      text: {
        eyebrow: "Corporate golf",
        title: "Golf days on the par 3",
        subs: ["Home of the British Par 3 Championship"],
      },
    },
    {
      at: B(57),
      cut: true,
      shots: [{ src: P + "oak-room-table.jpg", pos: "66% 50%" }],
      text: { eyebrow: "The Oak Room", title: "Lunch with some history", subs: ["In a house built in 1640"] }, // "DINING as a label is flat"
    },
    {
      at: B(65),
      cut: true,
      shots: [{ src: R + "charleys-bar.jpg", pos: "24% 50%" }],
      text: { eyebrow: "After hours", title: "Drinks at Charley\u2019s Bar", subs: ["In the golf clubhouse"] },
    },
    {
      at: B(73), // Charley's Bar holds 8 beats like the rest (Scott: "too fast to read")
      cut: true,
      shots: [
        { src: P + "pool.jpg", pos: "45% 50%" },
        { src: P + "bedroom-four-poster.jpg", pos: "28% 50%" },
      ],
      cuts: [B(81)],
      text: {
        eyebrow: "Stay over",
        title: "Make a night of it",
        subs: ["A health club and indoor pool", "49 bedrooms and suites"],
        subCuts: [B(81)],
      },
    },
  ],
  end: {
    at: B(89), // a hard cut on the crash at 43.86s
    cut: true,
    name: "Nailcote Hall Hotel,\nGolf & Country Club",
    place: "Berkswell, Warwickshire",
  },
  music: { src: "music/mixkit-tech-house-vibes-130.mp3", startAt: 312, gain: 0.5, fadeOut: 50 },
};

// The 9:16 cut for Instagram: the same film, the panels stacked as strips (Scott, 2 Nov: "just the
// 16:9" for now; kept registered).
export const nailcoteHallMeetingsReel: MESpec = {
  ...nailcoteHallMeetings,
  id: "nailcote-hall-meetings-reel",
};
