import type { MESpec } from "../hotel-film/me/MEReel";

// Haycock Manor's meetings and events film, rebuilt on Nailcote's template (Scott, 2 Nov: "what about
// haycock manor", after the Nailcote M&E reel on the Ramside template): natural colour, plain stills on
// a slow push, hard cuts on the band's beats, house captions (gold caps eyebrow with its still
// underline, the headline in cream Cormorant, a short fact line) and the house end card. 16:9. It takes
// over `haycock-manor-meetings` (the depth version, still in haycock-manor-depth.ts, unregistered).
//
// The meeting rooms' own names aren't known (only the Fitzwilliam and the Manor Suite), so the three
// boardrooms' panels go unnamed. Facts from Haycock's CBH pages only: 7 meeting rooms; just off the A1
// and A47; Prevost three AA Rosettes and the Haycock Kitchen two (five between them). Peterborough
// ("Peterborough (Wansford)" on CBH).
//
// Music: Haycock's own "Late Night Big Band Swing" (nickpanek, Pixabay 236168), as its other cuts, from
// 63.92s (startAt 1918); beat k at frame 1.4 + 20.93k; the end card on the 87.70s hit (beat 34), the
// band's last hits ringing out under it.
const B = (k: number) => Math.round(1.4 + 20.93 * k);
const P = "hotels/haycock-manor/";

export const haycockManorMeetingsME: MESpec = {
  id: "haycock-manor-meetings",
  frames: 843,
  scenes: [
    {
      at: 0,
      shots: [{ src: P + "meeting-fitzwilliam.jpg", pos: "50% 50%" }],
      text: { eyebrow: "Meetings & Events", title: "Haycock Manor Hotel", subs: [""] },
    },
    {
      at: B(6),
      cut: true,
      panelBeat: 21,
      panels: [
        { src: P + "meeting-boardroom-stone.jpg", name: "", widePos: "55% 50%" },
        { src: P + "meeting-boardroom-oval.jpg", name: "", widePos: "50% 50%" },
        { src: P + "meeting-boardroom-small.jpg", name: "", widePos: "60% 50%" },
      ],
    },
    // lively copy over the flat lines (Scott: "dining is kind of plain, fix up the flat ones with some
    // lively copy", "jazz it up"); only what the photos show or the CBH pages say
    {
      at: B(10),
      cut: true,
      shots: [{ src: P + "meeting-manor-suite.jpg", pos: "50% 50%" }],
      text: { eyebrow: "Meeting spaces", title: "Seven rooms, no two alike", subs: ["Just off the A1 and A47"] },
    },
    {
      at: B(14),
      cut: true,
      shots: [{ src: P + "blue-lounge.jpg", pos: "50% 50%" }],
      text: { eyebrow: "Between sessions", title: "Break out in blue", subs: [""] },
    },
    {
      at: B(18),
      cut: true,
      shots: [{ src: P + "afternoon-tea.jpg", pos: "50% 45%" }],
      text: { eyebrow: "Afternoon tea", title: "Cake is on the agenda", subs: [""] },
    },
    // dinner on the band's three horn stabs after its stop (beats 21, 21.5, 22), a plate on each
    {
      at: B(21),
      cut: true,
      panels: [
        { src: P + "prevost-plate.jpg", name: "", widePos: "50% 50%", at: 0 },
        { src: P + "plates-marble.jpg", name: "", widePos: "50% 50%", at: B(21.5) - B(21) },
        { src: P + "fish-and-chips.jpg", name: "", widePos: "45% 50%", at: B(22) - B(21) },
      ],
      text: {
        eyebrow: "Dinner",
        title: "Fine dining or fish and chips",
        subs: ["Pr\u00e9vost and the Haycock Kitchen, both AA Rosette restaurants"],
      },
    },
    {
      at: B(26),
      cut: true,
      shots: [{ src: P + "cocktail-smoke.jpg", pos: "50% 45%" }],
      push: { to: 1.22, pos: "50% 55%" },
      text: { eyebrow: "After hours", title: "Any other business?", subs: ["A smoked cocktail to close the day"] },
    },
    {
      at: B(29),
      cut: true,
      shots: [{ src: P + "beamed-bedroom.jpg", pos: "50% 50%" }],
      text: { eyebrow: "Stay over", title: "Sleep on it", subs: ["Then the morning session"] },
    },
  ],
  end: { at: 713, cut: true, name: "Haycock Manor Hotel", place: "Peterborough" },
  music: { src: "music/nickpanek-late-night-big-band-swing-236168.mp3", startAt: 1918, gain: 0.9, fadeOut: 30 },
};
