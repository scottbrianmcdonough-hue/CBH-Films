import type { MESpec } from "../hotel-film/me/MEReel";

// Coombe Abbey Hotel's meetings and events film (new member, 16 Nov 2026), on the Haycock / Nailcote M&E
// template: plain stills on a slow push, hard cuts on the beat, house captions (gold caps eyebrow, cream
// Cormorant headline, a short fact line) and the house end card. 16:9 for LinkedIn.
//
// Facts from coombeabbey.com only (room pages win over the 2022 brochure). Each figure sits on the room it
// describes, in the layout pictured: the Cloisters set cabaret (64), the Marquee set for dinner on rounds (350).
// History kept light, no Gunpowder Plot (Scott, 16 Nov).
//
// Music: Event Music by prettyjohn1 (Pixabay 595091; tried on the postcards, not on any posted film), 155 BPM,
// from 31.03s (its quieter phrase) so the boardrooms sit in the calm and the band comes back on the Cloisters
// (beat 32, 43.42s); the end card on beat 72 (58.91s), the track's own ending under it.
const B = (k: number) => Math.round(11.6136 * k);
const P = "hotels/coombe-abbey/";

export const coombeAbbeyME: MESpec = {
  id: "coombe-abbey-meetings",
  frames: 1000,
  scenes: [
    {
      at: 0,
      shots: [{ src: P + "hotel-aerial-view-001.jpg", pos: "50% 55%" }],
      text: { eyebrow: "Meetings & Events", title: "Coombe Abbey Hotel", subs: ["Ten minutes from Coventry"] },
    },
    {
      at: B(12),
      cut: true,
      layout: "feature",
      panelBeat: B(2),
      panels: [
        { src: P + "meeting-room-harrington-001.jpg", name: "", widePos: "50% 50%" },
        { src: P + "meeting-room-kellway-001.jpg", name: "", widePos: "55% 50%" },
        { src: P + "meeting-room-walnut-001.jpg", name: "", widePos: "50% 50%" },
      ],
      text: { eyebrow: "Meeting spaces", title: "11 rooms to meet in", subs: ["Just off junction 2 of the M6"] },
    },
    {
      at: B(22),
      cut: true,
      layout: "feature",
      panelBeat: B(2),
      panels: [
        { src: P + "meeting-room-stuart-001.jpg", name: "", widePos: "50% 50%" },
        { src: P + "meeting-room-griffin-001.jpg", name: "", widePos: "60% 50%" },
        { src: P + "meeting-room-de-camville-001.jpg", name: "", widePos: "70% 50%" },
      ],
      text: { eyebrow: "Day delegates", title: "Lunch included", subs: ["Unlimited tea and coffee all day"] },
    },
    {
      at: B(32),
      cut: true,
      shots: [{ src: P + "conference-room-cloisters-002.jpg", pos: "50% 50%" }],
      text: { eyebrow: "The Cloisters", title: "Cabaret for 64", subs: ["With its own function bar"] },
    },
    {
      at: B(40),
      cut: true,
      shots: [
        { src: P + "garden-room-restaurant-001.jpg", pos: "50% 50%" },
        { src: P + "dining-001.jpg", pos: "50% 50%" },
      ],
      cuts: [B(44)],
      text: { eyebrow: "The Garden Room", title: "Dinner in the conservatory", subs: ["Classic dishes, local produce"] },
    },
    {
      at: B(48),
      cut: true,
      shots: [{ src: P + "private-dining-marquee-001.jpg", pos: "50% 50%" }],
      push: { to: 1.12, pos: "50% 45%" },
      text: { eyebrow: "The Marquee", title: "Dinner for 350", subs: ["Or 450 theatre style"] },
    },
    {
      at: B(56),
      cut: true,
      shots: [{ src: P + "gardens-001.jpg", pos: "50% 60%" }],
      text: { eyebrow: "Team building", title: "500 acres of parkland", subs: ["Go Ape in the historic woodland"] },
    },
    {
      at: B(64),
      cut: true,
      shots: [{ src: P + "lady-craven-grand-feature-room-002.jpg", pos: "50% 55%" }],
      text: { eyebrow: "Stay over", title: "121 bedrooms", subs: ["24 hour packages add dinner and a room"] },
    },
  ],
  end: { at: B(72), cut: true, name: "Coombe Abbey Hotel", place: "Coventry, Warwickshire" },
  music: { src: "music/prettyjohn1-event-music-595091.mp3", startAt: 931, gain: 0.9, fadeOut: 30 },
};
