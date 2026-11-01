import type { RewindShot, RewindSpec } from "../hotel-film/rewind/types";

// Classic British Hotels: "This Sunday has 25 hours". The clocks go back at 02:00 on
// Sunday 25 October 2026. The opening runs backwards (The Kingfisher's pasta drops back
// off the fork, a plate rises away, Dalmahoy's syrup climbs back up) while the clock runs back from 02:00 a minute at a time (Scott:
// "02:00, 01:59, 01:58 ... 01:00"), landing on 01:00 on the downbeat as the syrup pours
// forward again from the same frame ("One extra hour"). Then the hour, spent slowly, a bar
// a shot: Holdsworth House's parterre, Oakley Hall's dog running in, The Kingfisher's
// fireside, Ruthin Castle's hot tub, and Fairlawns' bedroom with the closing line; the CB
// logo. Names and places as recorded in earlier specs from each hotel's CBH page; no
// claims beyond them. Clips cut by scripts/clocks-clips.py (the fork from The
// Kingfisher's own Instagram reel, `hotels/the-kingfisher/autumn-reel.mp4`).
//
// Music: "Lounge Soul" by Kulakovka (Pixabay, kulakovka-lounge-soul-614873.mp3; not
// Content ID registered; used in no other film). Credit: Music by Tony Vodnik from
// Pixabay. ~92 BPM, a beat every ~19.5 frames. Trimmed from 20s of the track. Its quiet
// intro sits under the rewind and the full band comes in on beat 44 (28.12s in the
// track), which is the snap. Beats measured with librosa: main film from beat 36
// (startAt 87), so beats 38, 40, 42, 44 ... land on frames 40, 79, 118, 157, then bars at
// 235, 313, 391, 470, 548, 626 (~704, 782); the Story from beat 38 (startAt 127): beats
// at 39, 78, 117 (snap), 195, 273, 352, 391.

const C = "campaigns/clocks-go-back";
const tag = (name: string, place: string) => ({ name, place });
const MUSIC = `${C}/lounge-soul.mp3`;
const GAIN = 0.9;

const clock = {
  eyebrow: "Sunday 25 October",
  before: "02:00",
  after: "01:00",
  lines: ["The clocks go back", "One extra hour"] as [string, string],
};

const shots: RewindShot[] = [
  // Scott: the sauce pour reversed just looked like plating, so the rewind opens on the
  // clearest reversal (pasta dropping back off the fork) and the syrup climbs for a bar.
  { src: `${C}/fork-rewind.mp4`, at: 0 },
  { src: `${C}/dish-rewind.mp4`, at: 40 },
  { src: `${C}/syrup-rewind-long.mp4`, at: 79 },
  {
    src: `${C}/syrup.mp4`,
    at: 157, // the snap: the band comes in
    tag: tag("Dalmahoy Hotel & Country Club", "Edinburgh"),
  },
  {
    src: `${C}/parterre.mp4`,
    at: 235,
    line: "A slower stroll",
    tag: tag("Holdsworth House Hotel", "Halifax, West Yorkshire"),
  },
  {
    src: `${C}/dog.mp4`,
    at: 313,
    line: "Another lap of the lawn",
    tag: tag("Oakley Hall Hotel", "Hampshire"),
  },
  {
    src: `${C}/fireside.mp4`,
    at: 391,
    line: "One more by the fire",
    tag: tag("The Kingfisher", "Bedford"),
  },
  {
    src: `${C}/hot-tub.mp4`,
    at: 470,
    line: "A longer soak",
    tag: tag("Ruthin Castle Hotel & Spa", "Ruthin, North Wales"),
  },
  {
    src: `${C}/bedroom.mp4`,
    at: 548,
    tag: tag("Fairlawns Hotel & Spa", "Walsall, West Midlands"),
  },
];

// Scott: "worth ..." end lines are used too often; close on a question instead.
const close = { lines: ["Where will you", "spend yours?"] };
const watermark = {
  src: "brand/cb-watermark.png",
  size: [100, 108] as [number, number],
  x: 920,
  y: 1452,
};

export const clocksGoBack: RewindSpec = {
  id: "clocks-go-back",
  music: {
    src: MUSIC,
    trimmedSeconds: 40,
    startAt: 87,
    gain: GAIN,
    fadeFrom: 704,
  },
  durationInFrames: 782,
  shots,
  clock: { ...clock, countFrom: 14, snapAt: 157, until: 232 },
  close,
  endAt: 626,
  endFade: 20,
  watermark,
};

// Stories cut (13.0s): three rewinds, the snap, the bedroom with the closing line, the
// logo. The track starts two beats later so the band still lands on the snap.
const pick = (name: string, at: number) => ({
  ...shots.find((s) => s.src.endsWith(`/${name}.mp4`))!,
  at,
});

export const clocksGoBackStory: RewindSpec = {
  id: "clocks-go-back-story",
  music: {
    src: MUSIC,
    trimmedSeconds: 40,
    startAt: 127,
    gain: GAIN,
    fadeFrom: 312,
  },
  durationInFrames: 391,
  shots: [
    pick("fork-rewind", 0),
    pick("dish-rewind", 39),
    { src: `${C}/syrup-rewind.mp4`, at: 78 },
    pick("syrup", 117),
    pick("bedroom", 195),
  ],
  clock: { ...clock, countFrom: 12, snapAt: 117, until: 190 },
  close,
  endAt: 273,
  endFade: 20,
  watermark,
};
