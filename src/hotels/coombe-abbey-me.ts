import type { MESpec } from "../hotel-film/me/MEReel";

// Coombe Abbey Hotel's meetings and events film (new member, 16 Nov 2026), on the Haycock / Nailcote M&E
// template: plain stills on a slow push, hard cuts on the beat, house captions (gold caps eyebrow, cream
// Cormorant headline, a short fact line) and the house end card. 16:9 for LinkedIn.
//
// Facts from coombeabbey.com only (room pages win over the 2022 brochure). Each figure sits on the room it
// describes; one capacity only (Scott, 17 Nov: "maybe max capacity but not every room"): the Marquee's 500 guests (Bianca, 18 Nov;
// the hotel's private dining page says up to 500, its conference page 450 theatre style).
// History kept light, no Gunpowder Plot (Scott, 16 Nov).
//
// Music (Bianca, 18 Nov: "change music to the same as social one, suits the hotel better. That should then speed the
// whole thing up"): the launch Story's track, Warm Acoustic Guitar by Universfield (Pixabay; the sketch Story series),
// from the same point as the Story (startAt 60 in Holdsworth's trim), a beat every 21.825 frames. Every scene now a bar
// (four beats, ~2.9s), the opening and the end card two; cuts on the downbeats (b(4n)). The Jazz Cocktail edit
// (scripts/coombe-me-music.py) is no longer used here.
const b = (n: number) => Math.round(n * 21.825);
const F = { a: b(8), b: b(12), cloisters: b(16), garden: b(20), dining: b(22), marquee: b(24), apes: b(28), bed: b(32), end: b(36) };
const P = "hotels/coombe-abbey/";

export const coombeAbbeyME: MESpec = {
  id: "coombe-abbey-meetings",
  frames: b(44), // 32.0s
  even: true,
  scenes: [
    {
      at: 0,
      shots: [{ src: P + "hotel-aerial-view-001.jpg", pos: "50% 55%" }],
      text: { eyebrow: "Coventry, Warwickshire", title: "Coombe Abbey Hotel", subs: ["Ten minutes from the city centre"] },
    },
    {
      at: F.a,
      cut: true,
      layout: "feature",
      panelBeat: 5, // all three in on the cut, a quick cascade (no black waiting for a panel)
      panels: [
        { src: P + "meeting-room-harrington-001.jpg", name: "", widePos: "50% 50%" },
        { src: P + "meeting-room-kellway-001.jpg", name: "", widePos: "55% 50%" },
        { src: P + "meeting-room-walnut-001.jpg", name: "", widePos: "50% 50%" },
      ],
      text: { eyebrow: "Meeting spaces", title: "11 spaces, none of them beige", subs: ["Just off the M6"] },
    },
    {
      at: F.b,
      cut: true,
      layout: "feature",
      panelBeat: 5, // all three in on the cut, a quick cascade (no black waiting for a panel)
      panels: [
        { src: P + "meeting-room-stuart-001.jpg", name: "", widePos: "50% 50%" },
        { src: P + "meeting-room-griffin-001.jpg", name: "", widePos: "60% 50%" },
        { src: P + "meeting-room-de-camville-001.jpg", name: "", widePos: "70% 50%" },
      ],
      text: { eyebrow: "Day delegates", title: "The coffee doesn't run out", subs: ["Lunch included"] },
    },
    {
      at: F.cloisters,
      whip: true,
      shots: [{ src: P + "conference-room-cloisters-003.jpg", pos: "50% 50%" }],
      text: { eyebrow: "The Cloisters", title: "Keynote under a chandelier", subs: ["With its own bar next door"] },
    },
    {
      at: F.garden,
      cut: true,
      shots: [
        { src: P + "garden-room-restaurant-001.jpg", pos: "50% 50%" },
        { src: P + "dining-001.jpg", pos: "50% 50%" },
      ],
      cuts: [F.dining],
      text: { eyebrow: "The Garden Room", title: "Dinner, with the gardens looking in", subs: ["Or a Mediaeval Banquet after dark"] },
    },
    {
      at: F.marquee, // a quick crossfade on the beat, not a hard cut (Scott: "a sharp cut at 22": dark steak to the white Marquee)
      shots: [{ src: P + "private-dining-marquee-001.jpg", pos: "50% 50%" }],
      push: { to: 1.12, pos: "50% 45%" },
      text: { eyebrow: "The Marquee", title: "Bring the whole company", subs: ["Up to 500 guests"] },
    },
    {
      at: F.apes, // the team building card (Bianca, 18 Nov): Go Ape on the estate, in place of the formal gardens
      cut: true,
      shots: [{ src: P + "go-ape-001.jpg", pos: "50% 50%" }],
      text: { eyebrow: "Team building", title: "Go Ape is in the woods", subs: ["500 acres for the away day"] },
    },
    {
      at: F.bed,
      whip: true,
      shots: [{ src: P + "lady-craven-grand-feature-room-002.jpg", pos: "50% 55%" }],
      text: { eyebrow: "Stay over", title: "121 unique bedchambers", subs: ["So nobody's late for the 9am"] },
    },
  ],
  end: { at: F.end, cut: true, name: "Coombe Abbey Hotel", place: "Coventry, Warwickshire" },
  music: { src: "hotels/holdsworth-house/warm-acoustic-guitar-37s.mp3", startAt: 60, gain: 1.2, fadeOut: 44 },
};
