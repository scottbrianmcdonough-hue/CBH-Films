import type { MixedSpec } from "../hotel-film/mixed/types";

// "November everywhere else / at ours" (Scott: like the Bonfire Night reel, stock clips with
// hotel images and footage, but a new theme and take). Each stock shot of a grim British
// November cuts on the action into a hotel doing the same thing, nicer: rain in a street
// puddle (the hook) -> jam spread on a scone; rain down a window -> tea poured; a wet dog shaking off
// -> a springer spaniel with its people by a lake; a bus through the rain at night -> steam
// off a hot tub; rain dripping off an umbrella -> a map unfolded at a bright window (the
// payoff). No hotel names on screen (they go in the ticket). Scott: a car on the same street
// then the bus read as a duplicate, so the car (dark-street) is out, and with it Langshott's
// fireside tea (the second tea after the Kingfisher pour), keeping Ilsington's map.
//
// Stock: Pexels (free licence, no credit needed), sent by Scott, in campaigns/november/stock/:
// rain-window = Pexels 12742709; wet-dog = Pexels 10914653 (a wet poodle in a towel, looking
// down the lens, into the lakeside spaniel looking down it too); umbrella-drip = Pexels
// 13666287 (1920x1080 23.976fps: cropped 9:16 round the umbrella's tip, interpolated to 30fps,
// first 6s; a drop falls on the cut into the map), in place of snowy-mirror (Pexels 19555153,
// a wing mirror through sleet: Scott, less snow);
// puddle = Pexels 14880665 (rain rippling a street puddle at ground level, a church spire and
// passers-by reflected upside down), the opener under the hook; it replaced snowy-car
// (Pexels 13272962, a car in slush; Scott: "less snow shots, as this is the UK ... we don't
// get much snow"), its passers-by moving through the reflection on the cut;
// dark-street = Pexels 5687585 (a London street at night in the rain, landscape: 13-16s
// cropped 9:16 at its left edge round a car coming at the camera, headlights into
// Langshott's fire; its plate is unreadable; was 29.5-32.5s, which had a red bus behind the
// car, so with the night bus there were two bus shots: Scott); night-bus = the same Pexels 5687585 at 19.5-23.5s
// (a red London bus sweeping past through the rain, cropped 9:16, plate unreadable), cut as
// it turns past into the hot tub's steam; in place of frozen-face (Pexels 11120675, a man
// frosted over: Scott and Bianca, "we don't have a big freeze in the UK", so no snow left).
// Hotel footage (Reel Bank / Dropbox):
// - Ilsington Country House: scone and jam, map at the window (from the deck reel's clips).
// - The Kingfisher: tea pour (its own Instagram).
// - Ruthin Castle: the hot tub at night, steaming.
// Hotel stills: a springer spaniel with a couple in fleeces on a rock by a lake, autumn
// trees (Scott's photo: the Wild Boar estate), in place of the Oakley Hall dog (used three times
// already) and then Burleigh Court's spaniel (its terrace is short-sleeve weather);
// Langshott Manor's fireside afternoon tea (CBH site).
//
// Music: "Deep Classy House" by meditativetiger (Pixabay, track 376796; not Content ID
// registered; tried on the clocks reel and replaced, so in no posted film). 117.5 BPM, a beat
// every 15.32 frames. The film starts at 142.6s (startAt 4278), inside its second breakdown
// (bass out), not the first at 40.97s, where a woman sings (Scott: "not sure about the music
// start with the singing woman"): the cold opener sits on the thin bars, and the bass comes
// back sliding in just before 146.68s (as the first one did before 45.06s), the beat put on
// beat 8, exactly on the first "at ours" cut. After that every pair is an out shot for two beats
// and an in shot for four; the end card lands on beat 42 and the music fades over its last
// bar.

const S = "campaigns/november/stock";
const N = "campaigns/november/hotels";

export const novemberOutThere: MixedSpec = {
  id: "november-out-there",
  beat: 15.318,
  downbeat: 0.1,
  // Was "out there" / "in here"; Scott: the lake and the hot tub are outside shots, so
  // "in here" didn't hold. "At ours" covers indoors and out.
  hook: { top: "November", out: "everywhere else", in: "at ours" },
  shots: [
    { side: "out", at: 0, kind: "video", src: `${S}/puddle.mp4`, from: 0.5 },
    {
      side: "in",
      at: 8,
      kind: "video",
      // 0.53-2.5s, after the clip's own cut at 0.5s (from 0.3 it flashed the jam pot),
      // stretched to 2.4s with motion interpolation to fill the slot and its dissolve
      src: `${N}/ilsington-scone-slow.mp4`,
      from: 0,
    },
    {
      side: "out",
      at: 12,
      kind: "video",
      src: `${S}/rain-window.mp4`,
      from: 0,
    },
    {
      side: "in",
      at: 14,
      kind: "video",
      // the whole pour stretched to 2.37s with motion interpolation (at 1.87s it ran out
      // before the slot and its dissolve did)
      src: `${N}/kingfisher-tea-pour-slow.mp4`,
      from: 0,
    },
    { side: "out", at: 18, kind: "video", src: `${S}/wet-dog.mp4`, from: 2.9 },
    {
      side: "in",
      at: 20,
      kind: "still",
      src: `${N}/lakeside-spaniel.jpg`,
      size: [1920, 1278],
      crop: { cx: 870, h: 1278 },
    },
    {
      side: "out",
      at: 24,
      kind: "video",
      src: `${S}/night-bus.mp4`,
      from: 1.1,
    },
    {
      side: "in",
      at: 26,
      kind: "video",
      src: "hotels/ruthin-castle/hot-tub.mp4",
      from: 0,
    },
    {
      side: "out",
      at: 30,
      kind: "video",
      src: `${S}/umbrella-drip.mp4`,
      from: 1.05,
    },
    {
      side: "in",
      at: 32,
      kind: "video",
      // the payoff (Scott): a drop falls off the umbrella on the cut into the map
      src: `${N}/ilsington-map-window.mp4`,
      from: 0,
    },
  ],
  endCard: { at: 36, line: "Which November\nare you having?" },
  endBeat: 44, // 674 frames, 22.5s
  music: {
    src: "campaigns/november/deep-classy-house.mp3",
    seconds: 254.85,
    startAt: 4278,
    gain: 0.84, // ~-15 LUFS
    fadeFromBeat: 40,
  },
};

// The Story cut: the reel two beats in (so the bass still lands on the "at ours" cut, now
// beat 6), four pairs: the tea pour is out (the scone is already the cosy food moment).
// Puddle -> scone, wet dog -> spaniel, night bus -> hot tub, umbrella -> map, end card.
// 34 beats, 17.4s (Scott: Stories can go over 15s).
const reel = novemberOutThere;
const shot = (src: string) => reel.shots.find((s) => s.src.endsWith(src))!;

export const novemberOutThereStory: MixedSpec = {
  ...reel,
  id: "november-out-there-story",
  shots: [
    { ...shot("puddle.mp4"), at: 0, from: 0.5 + (2 * reel.beat) / 30 },
    { ...shot("ilsington-scone-slow.mp4"), at: 6 },
    { ...shot("wet-dog.mp4"), at: 10 },
    { ...shot("lakeside-spaniel.jpg"), at: 12 },
    { ...shot("night-bus.mp4"), at: 16 },
    { ...shot("hot-tub.mp4"), at: 18 },
    { ...shot("umbrella-drip.mp4"), at: 22 },
    { ...shot("ilsington-map-window.mp4"), at: 24 },
  ] as MixedSpec["shots"],
  endCard: { ...reel.endCard, at: 28 },
  endBeat: 34,
  music: {
    ...reel.music!,
    startAt: reel.music!.startAt + Math.round(2 * reel.beat),
    fadeFromBeat: 30,
  },
};
