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
// Music (Bianca, 18 Nov: "change music to the same as social one ... speed the whole thing up"; the Story's Warm Acoustic
// Guitar was the first try, then Scott sent five Pixabay folk tracks, all checked as not Content ID registered): Acoustic
// Indie Folk by JonasBlakewood (Pixabay 619515, the 63s edit; Indie Acoustic 619516 and Indie Folk Acoustic 619517 are the
// same piece at other lengths), 117.5 BPM, a beat every 0.511s; it builds from ~27s to its last hit at 59.05s. The film
// takes the track from beat 56 (29.05s, a downbeat) to the end: the opening ten beats, then a scene every six beats
// (~3s, the cuts alternating downbeats and third beats), the end card on beat 108 (55.05s), the final hit on beat 116 at
// frame 960, and the guitar rings out. Frames measured off librosa's beats.
const F = { a: 150, b: 240, cloisters: 329, garden: 420, dining: 465, marquee: 511, apes: 600, bed: 690, end: 780 };
const P = "hotels/coombe-abbey/";

export const coombeAbbeyME: MESpec = {
  id: "coombe-abbey-meetings",
  frames: 988, // 32.9s: to the track's own end
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
      text: { eyebrow: "The Garden Room", title: "Dinner, with the gardens looking in", subs: ["Or a Medieval Banquet after dark"] },
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
  // the track is hot: -6.7 LUFS at gain 1; 0.37 lands about -15.3
  music: { src: "music/jonasblakewood-acoustic-indie-folk-619515.mp3", startAt: 871, gain: 0.37, fadeOut: 20 },
};
