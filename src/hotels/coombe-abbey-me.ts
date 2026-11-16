import type { MESpec } from "../hotel-film/me/MEReel";

// Coombe Abbey Hotel's meetings and events film (new member, 16 Nov 2026), on the Haycock / Nailcote M&E
// template: plain stills on a slow push, hard cuts on the beat, house captions (gold caps eyebrow, cream
// Cormorant headline, a short fact line) and the house end card. 16:9 for LinkedIn.
//
// Facts from coombeabbey.com only (room pages win over the 2022 brochure). Each figure sits on the room it
// describes, in the layout pictured: the Cloisters set cabaret (64), the Marquee set for dinner on rounds (350).
// History kept light, no Gunpowder Plot (Scott, 16 Nov).
//
// Music (Scott, 16 Nov: Event Music "definitely needs new music", "more housey jazzy"): Jazz Cocktail Lounge Music by
// alex-morgan (Pixabay 556246; on two brand stings, no hotel film), 110.6 BPM, edited by scripts/coombe-me-music.py
// into public/music/edits/coombe-me-jazz-cocktail.m4a: from 39.31s (beat 73), the band stopping under the second set
// of rooms and coming back on the Cloisters (52.2s), then a jump on the bar to the ending at the bedroom (152.6s), so
// the end card lands on the final hits (156.5s) and the last chord (160.3s) rings out. Frames measured off the beats.
const F = { a: 129, b: 257, cloisters: 386, garden: 483, dining: 531, marquee: 579, park: 676, bed: 773, end: 890 };
const P = "hotels/coombe-abbey/";

export const coombeAbbeyME: MESpec = {
  id: "coombe-abbey-meetings",
  frames: 1110,
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
      panelBeat: 32,
      panels: [
        { src: P + "meeting-room-harrington-001.jpg", name: "", widePos: "50% 50%" },
        { src: P + "meeting-room-kellway-001.jpg", name: "", widePos: "55% 50%" },
        { src: P + "meeting-room-walnut-001.jpg", name: "", widePos: "50% 50%" },
      ],
      text: { eyebrow: "Meeting spaces", title: "11 rooms, none of them beige", subs: ["Just off junction 2 of the M6"] },
    },
    {
      at: F.b,
      cut: true,
      layout: "feature",
      panelBeat: 32,
      panels: [
        { src: P + "meeting-room-stuart-001.jpg", name: "", widePos: "50% 50%" },
        { src: P + "meeting-room-griffin-001.jpg", name: "", widePos: "60% 50%" },
        { src: P + "meeting-room-de-camville-001.jpg", name: "", widePos: "70% 50%" },
      ],
      text: { eyebrow: "Day delegates", title: "The coffee doesn't run out", subs: ["Lunch included on day packages"] },
    },
    {
      at: F.cloisters,
      cut: true,
      shots: [{ src: P + "conference-room-cloisters-002.jpg", pos: "50% 50%" }],
      text: { eyebrow: "The Cloisters", title: "Cabaret for 64", subs: ["And the bar is next door"] },
    },
    {
      at: F.garden,
      cut: true,
      shots: [
        { src: P + "garden-room-restaurant-001.jpg", pos: "50% 50%" },
        { src: P + "dining-001.jpg", pos: "50% 50%" },
      ],
      cuts: [F.dining],
      text: { eyebrow: "The Garden Room", title: "Dinner under glass", subs: ["Classic dishes, local produce"] },
    },
    {
      at: F.marquee,
      cut: true,
      shots: [{ src: P + "private-dining-marquee-001.jpg", pos: "50% 50%" }],
      push: { to: 1.12, pos: "50% 45%" },
      text: { eyebrow: "The Marquee", title: "Bring the whole company", subs: ["Up to 350 for dinner"] },
    },
    {
      at: F.park,
      cut: true,
      shots: [{ src: P + "gardens-001.jpg", pos: "50% 60%" }],
      text: { eyebrow: "Team building", title: "500 acres of breakout space", subs: ["Go Ape is in the woods"] },
    },
    {
      at: F.bed,
      cut: true,
      shots: [{ src: P + "lady-craven-grand-feature-room-002.jpg", pos: "50% 55%" }],
      text: { eyebrow: "Stay over", title: "121 bedrooms", subs: ["So nobody's late for the 9am"] },
    },
  ],
  end: { at: F.end, cut: true, name: "Coombe Abbey Hotel", place: "Coventry, Warwickshire" },
  music: { src: "music/edits/coombe-me-jazz-cocktail.m4a", startAt: 0, gain: 0.9, fadeOut: 20 },
};
