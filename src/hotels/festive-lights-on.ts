import type { FestiveSpec } from "../hotel-film/festive/types";

// Festive "Lights on", professional and minimal (Scott's final call), footage-led: real
// footage opens it and runs through it, the stills fill the gaps and make the match cuts.
// One short opening line on the footage, no text over anything else; every cut after the
// opening is a hard match cut on a beat, the matched shapes lined up in frame (crops solved
// with scripts/match-cuts.py); a gentle 1.00 -> 1.06 push on the stills; one shared grade
// (stills pre-graded by scripts/festive-grade.py, clips nudged with a CSS filter); the clean
// end card (link in bio over the CB logo). Hotel names and towns go in the ticket caption.
//
// Footage:
// - The Kingfisher (Reel Bank, iPhone Nov 2023, GPS east Bedford; laid at 30fps frame for
//   frame, 0.83x): the garland and the inglenook (IMG_6921), the wood burner (IMG_1132), the
//   tree (IMG_6981). The opening sits dim with the line set; the lights switch on once.
// - Ramside Hall (the hotel's Instagram post "It's beginning to look a lot like
//   Christmas", 720x1280, no text in frame): the tilt up the tree to its top.
// - Ramside Hall treehouse (Instagram, no Christmas decor but warm and cosy, Scott OK'd):
//   the canopy hung with warm bulbs over the staircase, 22.9-24.8s, slowed 0.62x with
//   interpolated frames. Left out: Dalmahoy and Hatherley (summer and spring clips, text
//   burned in) and the Langshott clip (pumpkins: kept for a Halloween reel).
// Stills: the CBH site's festive photos (Scott). Maids Head left out (leaving the collection).
//
// The last three stills push through (`whip`, after Scott found them "a bit simple"): a
// quick punch-in with a touch of motion blur about the matched shape, on the beat.
// The match cuts: The Kingfisher's tree -> the Ramside tree (tree to tree, on the band's
// return after its full stop); the Ramside tree's top and the chandelier beside it -> Barnett
// Hill's tree top and chandelier (both points lined up); Barnett Hill's tree over its
// staircase -> the treehouse's lit tree over its staircase; the treehouse's warm bulbs ->
// the lit tree behind Santa (Donnington); the child's hand on the gift -> the chef's hand
// on the spoon (Hogarths); the laid table -> the laid table (Fairlawns, friends with
// crackers); two hands raised -> two hands raised (Fairlawns afternoon tea); the two cake
// trees -> Hintlesham Hall's two lit trees by the door.
//
// Music: "Christmas Jazz - Christmas Holiday" by Tunetank (Pixabay, Content ID registered),
// 86 BPM (a beat every ~20.6 frames), peak-limited. The film starts on the 14.12s downbeat:
// the band's full stop (21.06-22.33s) falls on The Kingfisher's tree and the first match cut
// lands on its return (beat 12). The footage clips hold four beats, the stills two (Scott:
// the stills were slow and drained energy, so they now move faster and come twice as
// often); the end card lands on the beat 32 downbeat and the music fades over its last bar
// (beats 34-38).

const K = "hotels/the-kingfisher/festive";
const F = "campaigns/festive/footage";
const G = "campaigns/festive/graded";
const PUSH = 0.1; // a stronger 1.00 -> 1.10 push over two beats (Scott: the stills drained energy)

export const festiveLightsOn: FestiveSpec = {
  id: "festive-lights-on",
  // Footage and stills alternate (Scott: "footage, still, footage, still, otherwise it's
  // tree tree tree, still still still"), every cut a hard cut on a beat: 4, 6, 8 ... 24, the
  // end card on 27. Each shot holds two beats (the opening four, Hintlesham three).
  cuts: [82, 123, 164, 202, 247, 288, 329, 370, 411, 452, 493, 555],
  durationInFrames: 678, // beat 33, 22.6s
  crossfade: 24, // into the end card
  lightsOn: 21, // the first beat
  line: "Come in\nfrom the cold",
  // The one festive touch (Scott; not on the logo): a light fall of snow over the opening
  // line, clearing as the lights come up.
  snow: true,
  music: {
    src: "campaigns/festive/christmas-jazz.mp3",
    trimmedSeconds: 70,
    startAt: 424, // the 14.12s downbeat
    gain: 1.1, // ~-15 LUFS; the file is peak-limited (alimiter 0.8)
    fadeFrom: 596, // beat 29: fade over the end card's last bar
  },
  shots: [
    // Footage: The Kingfisher's garland and stove, the line set, the lights switching on.
    { kind: "video", src: `${K}/garland.mp4`, from: 2.2 },
    // Still: Santa's gift at Donnington.
    {
      kind: "still",
      cut: "hard",
      src: `${G}/donnington-santa.jpg`,
      size: [1920, 1281],
      crop: { cx: 810, cy: 640, h: 1280 },
      push: PUSH,
    },
    // Footage: The Kingfisher's wood burner.
    { kind: "video", cut: "hard", src: `${K}/fire.mp4`, from: 0.5 },
    // Still: the chef saucing a plate at Hogarths.
    {
      kind: "still",
      cut: "hard",
      src: `${G}/hogarths-chef.jpg`,
      size: [1920, 1280],
      crop: { cx: 1013.5, cy: 521.7, h: 1043.5 },
      push: PUSH,
    },
    // Footage: The Kingfisher's tree, ending on its star (the band's stop falls here).
    { kind: "video", cut: "hard", src: `${K}/tree.mp4`, from: 1.1 },
    // Still: Barnett Hill's tree, tip on the footage tree's tip, as the band comes back.
    {
      kind: "still",
      cut: "hard",
      src: `${G}/barnett-hill-staircase.jpg`,
      size: [1920, 1440],
      crop: { cx: 947.1, cy: 571.4, h: 1142.9 },
      push: PUSH,
    },
    // Footage: the Ramside treehouse's lit tree over its staircase (tree over stairs).
    {
      kind: "video",
      cut: "hard",
      src: `${F}/treehouse-canopy.mp4`,
      from: 0.5,
      grade: "saturate(0.82) brightness(1.04)",
    },
    // Still: friends with crackers at Fairlawns.
    {
      kind: "still",
      cut: "hard",
      src: `${G}/fairlawns-crackers.jpg`,
      whip: [560, 700],
      size: [1920, 1440],
      crop: { cx: 1110, cy: 720, h: 1439.9 },
      push: PUSH,
    },
    // Footage: the Ramside Hall tree, tilting up.
    {
      kind: "video",
      cut: "hard",
      src: `${F}/ramside-tree.mp4`,
      from: 2.0,
      grade: "sepia(0.12) saturate(0.95)",
    },
    // Still: Fairlawns afternoon tea.
    {
      kind: "still",
      cut: "hard",
      src: `${G}/fairlawns-afternoon-tea.jpg`,
      whip: [404, 1000],
      size: [1920, 1440],
      crop: { cx: 764.1, cy: 738.7, h: 1402.7 },
      push: PUSH,
    },
    // Footage: the Ramside treehouse's copper bath (Scott: the wide lounge shot with the
    // small fireplace didn't show much).
    {
      kind: "video",
      cut: "hard",
      src: `${F}/treehouse-bath.mp4`,
      from: 0.3,
      grade: "saturate(0.82) brightness(1.04)",
    },
    // Still: Hintlesham Hall's two lit trees by the door, the finale.
    {
      kind: "still",
      cut: "hard",
      src: `${G}/hintlesham-hall-exterior.jpg`,
      whip: [383, 1252],
      size: [1920, 1280],
      crop: { cx: 1237, cy: 640, h: 1280 },
      push: PUSH,
    },
  ],
  // The stronger end card, in the words of the CBH Christmas & New Year Breaks page (Scott;
  // "festive magic" read as corny, no "Link in bio"): "Book your Christmas, Twixmas or New
  // Year Break".
  endCard: {
    eyebrow: "Book your",
    title: "Christmas,\nTwixmas or\nNew Year",
  },
  watermark: {
    src: "brand/cb-watermark.png",
    size: [100, 108],
    x: 920,
    y: 1452,
  },
};

// The Stories cut (15s): the same alternation, footage and stills. It starts on the 18.25s
// downbeat: the garland and the line, the Hogarths chef (the band's stop), The Kingfisher's
// tree, Barnett Hill (tip to tip), the treehouse canopy, the crackers, the Ramside tree,
// Hintlesham Hall, and the end card on beat 17.
const [
  garland,
  ,
  ,
  hogarths,
  ,
  barnett,
  canopy,
  crackers,
  ramside,
  ,
  ,
  hintlesham,
] = festiveLightsOn.shots;

export const festiveLightsOnStory: FestiveSpec = {
  ...festiveLightsOn,
  id: "festive-lights-on-story",
  cuts: [61, 101, 144, 185, 226, 267, 308, 351], // beats 3, 5, 7 ... 15, end card 17
  durationInFrames: 450, // 15s
  music: {
    ...festiveLightsOn.music!,
    startAt: 548, // the 18.25s downbeat
    fadeFrom: 370, // beat 18
  },
  shots: [
    garland,
    hogarths,
    { kind: "video", cut: "hard", src: `${K}/tree.mp4`, from: 1.2 },
    barnett,
    canopy,
    crackers,
    ramside,
    hintlesham,
  ],
};
