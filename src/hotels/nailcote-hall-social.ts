import type { MESpec } from "../hotel-film/me/MEReel";

// Nailcote Hall for Instagram, 9:16 (Scott, 3 Nov: "the reel and need the story too for social, less
// M&E"): the M&E film's look (natural colour, slow pushes, hard cuts on the beat, house captions) on
// the leisure side of the hotel, no meeting rooms. The house (label WARWICKSHIRE / Nailcote Hall),
// afternoon tea by the leaded window, the par 3 course, dinner as three stacked plates, the pool, the
// four poster, the house end card. Facts as the M&E spec (the CBH pages, via Scott): built in 1640,
// the Cromwell par 3 course (home of the British Par 3 Championship), the Oak Room, a health club with
// an indoor pool. Same track as the M&E film (Tech House Vibes, Mixkit 130), beat n at 0.088 +
// 0.49181n s; every scene on a downbeat.
const P = "hotels/nailcote-hall/";
const at = (from: number) => (beat: number) =>
  Math.round((beat - from) * 0.49181 * 30);
const start = (beat: number) => Math.round((0.088 + beat * 0.49181) * 30);

const house = { src: P + "exterior.jpg", pos: "50% 50%" };
const tea = { src: P + "afternoon-tea.jpg", pos: "50% 45%" };
const golf = { src: P + "golf-rhododendrons.jpg", pos: "67% 50%" };
const pool = { src: P + "pool.jpg", pos: "45% 50%" };
const bed = { src: P + "bedroom-four-poster.jpg", pos: "28% 50%" };
const plates = [
  { src: P + "oak-room-table.jpg", name: "", pos: "62% 60%" },
  { src: P + "scallops.jpg", name: "", pos: "45% 50%" },
  { src: P + "terrine-jar.jpg", name: "", pos: "70% 50%" },
];
const end = {
  name: "Nailcote Hall Hotel,\nGolf & Country Club",
  place: "Berkswell, Warwickshire",
  cut: true,
};
const music = {
  src: "music/mixkit-tech-house-vibes-130.mp3",
  gain: 0.5,
  fadeOut: 40,
};

// the reel: from beat 25 (the house 4s, Scott: "the first scene is too long"), the groove on 33, the end card on
// the crash at 73
const R = at(25);
export const nailcoteHallSocial: MESpec = {
  id: "nailcote-hall-social",
  frames: R(81),
  scenes: [
    {
      at: 0,
      shots: [house],
      text: {
        eyebrow: "Warwickshire",
        title: "Nailcote Hall Hotel,\nGolf & Country Club",
        subs: [""],
      },
    },
    {
      at: R(33),
      cut: true,
      shots: [tea],
      text: {
        eyebrow: "Afternoon tea",
        title: "By the leaded window",
        subs: [""],
      },
    },
    {
      at: R(41),
      cut: true,
      shots: [golf],
      text: {
        eyebrow: "On the doorstep",
        title: "A round on the par 3",
        subs: ["Home of the British Par 3 Championship"],
      },
    },
    {
      at: R(49),
      cut: true,
      panelBeat: 15,
      panels: plates,
      text: {
        eyebrow: "The Oak Room",
        title: "Dinner with some history",
        subs: ["In a house built in 1640"],
      },
    },
    {
      at: R(57),
      cut: true,
      shots: [pool],
      text: {
        eyebrow: "Health club",
        title: "A swim before dinner",
        subs: [""],
      },
    },
    {
      at: R(65),
      cut: true,
      shots: [bed],
      text: { eyebrow: "Stay over", title: "Then the four poster", subs: [""] },
    },
  ],
  end: { ...end, at: R(73) },
  music: { ...music, startAt: start(25) },
};

// the Story (Scott, 3 Nov: "need more scenes in the Story cut, the second scene is too fast, do it like the Haycock
// Manor personality"): six shots a bar or two each, the house with its label, then short cream lines over the shots
// (no eyebrows, the second line italic, as Haycock's Story), ending on a question like Haycock's ("Cocktail first,
// or the gold bath?"), then a line instead (Scott: "it doesn't have to be the or question all the time"); from beat 25, the groove on 33, every cut on a downbeat, 20.7s
const S = at(25);
const line = (title: string) => ({ eyebrow: "", title, subs: [""] });
export const nailcoteHallSocialStory: MESpec = {
  id: "nailcote-hall-social-story",
  frames: S(67),
  scenes: [
    {
      at: 0,
      shots: [house],
      text: {
        eyebrow: "Warwickshire",
        title: "Nailcote Hall Hotel,\nGolf & Country Club",
        subs: [""],
      },
    },
    {
      at: S(33),
      cut: true,
      shots: [tea],
      text: line("Afternoon tea,\nall afternoon"),
    },
    {
      at: S(41),
      cut: true,
      shots: [golf],
      text: line("Then a round\non the par 3"),
    },
    {
      at: S(45),
      cut: true,
      shots: [{ src: P + "oak-room-table.jpg", pos: "62% 55%" }],
      text: line("Dinner in a house\nbuilt in 1640"),
    },
    {
      at: S(53),
      cut: true,
      shots: [bed],
      text: line("And the four poster\nto finish"),
    },
  ],
  end: { ...end, at: S(61), question: "Tee off,\nthen turn in" },
  music: { ...music, startAt: start(25) },
};
