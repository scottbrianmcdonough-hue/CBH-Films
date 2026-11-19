import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, interpolate, Loop, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { FilmFinish } from "../components/FilmFinish";
import { TikTokText, TT_TOP } from "../doodle/StickFlip";
import { colors, EASE_IN_OUT, progress, sans, serif } from "../theme";

// The camera roll (Scott, 16 Nov: "try something for TikTok"; not the stick figure again, not one event): a
// phone's camera roll of a winter of weekends across the collection, every thumbnail playing, under a TikTok text
// hook; a tap opens one full screen and the roll is swiped through on the beat, each clip tagged with its hotel
// in the house label; a pinch drops the last one back into the grid, "not one photo of my sofa". Real footage
// only, at real speed. No logo ending: the labels are the brand.

const W = 1080;
const H = 1920;
const GAP = 6;
const CELL_W = (W - 2 * GAP) / 3;
const CELL_H = Math.round((CELL_W * 4) / 3);
const GRID_TOP = 270;

type Clip = { src: string; len: number; place?: string; hotel?: string };
const G = "hotels/gisborough-hall/screen-time";
const L = "hotels/low-wood-bay/screen-time";
const R = "hotels/rowton-hall/screen-time";
const U = "hotels/rutland-hall/screen-time";
// the roll, newest last like a phone's; `len` is each file's length in frames (they loop in the grid)
const ROLL: Clip[] = [
  { src: `${L}/misty-lake.mp4`, len: 62 },
  { src: `${R}/welcome-fizz.mp4`, len: 60 },
  { src: `${G}/fireplace.mp4`, len: 62 },
  { src: `${U}/lake-sunset.mp4`, len: 61 },
  { src: `${G}/misty-sunrise.mp4`, len: 60, place: "NORTH YORKSHIRE", hotel: "Gisborough Hall" },
  { src: `${L}/candles.mp4`, len: 62, place: "WINDERMERE, LAKE DISTRICT", hotel: "Low Wood Bay\nResort & Spa" },
  { src: `${R}/cake-by-the-fire.mp4`, len: 58, place: "CHESTER", hotel: "Rowton Hall Hotel & Spa" },
  { src: `${U}/candlelit-bath.mp4`, len: 120, place: "RUTLAND", hotel: "Rutland Hall Hotel & Spa" },
  { src: `${G}/snowy-garden.mp4`, len: 62, place: "NORTH YORKSHIRE", hotel: "Gisborough Hall" },
  { src: `${L}/snowy-rooftops.mp4`, len: 62 },
  { src: `${R}/four-poster.mp4`, len: 60, place: "CHESTER", hotel: "Rowton Hall Hotel & Spa" },
  { src: `${R}/log-burner.mp4`, len: 60 },
];
const OPENED = [4, 5, 6, 7, 8, 10]; // the ones swiped through, in the roll's order
export type RollSpec = { roll: Clip[]; opened: number[]; hook: string[]; end: string[] };
export const winterRoll: RollSpec = { roll: ROLL, opened: OPENED, hook: ["our camera roll:", "this winter"], end: ["0 photos of the sofa"] };
// Regional (Scott: the mixed one was "just random"): the North West, the Lakes then Chester
export const northWestRoll: RollSpec = {
  roll: [
    { src: `${R}/robe.mp4`, len: 60 },
    { src: `${L}/snowy-rooftops.mp4`, len: 62 },
    { src: `${R}/massage.mp4`, len: 60 },
    { src: `${R}/champagne.mp4`, len: 60 },
    { src: `${L}/misty-lake.mp4`, len: 62, place: "WINDERMERE, LAKE DISTRICT", hotel: "Low Wood Bay\nResort & Spa" },
    { src: `${L}/candles.mp4`, len: 62, place: "WINDERMERE, LAKE DISTRICT", hotel: "Low Wood Bay\nResort & Spa" },
    { src: `${L}/quartet-4s.mp4`, len: 120, place: "WINDERMERE, LAKE DISTRICT", hotel: "Low Wood Bay\nResort & Spa" },
    { src: `${R}/dusk-4s.mp4`, len: 120, place: "CHESTER", hotel: "Rowton Hall Hotel & Spa" },
    { src: `${R}/cake-by-the-fire.mp4`, len: 58, place: "CHESTER", hotel: "Rowton Hall Hotel & Spa" },
    { src: `${R}/pool-4s.mp4`, len: 120 },
    { src: `${R}/four-poster.mp4`, len: 60, place: "CHESTER", hotel: "Rowton Hall Hotel & Spa" },
    { src: `${R}/log-burner.mp4`, len: 60 },
  ],
  opened: [4, 5, 6, 7, 8, 10],
  hook: ["our camera roll:", "the North West"], // short; never "dump"; "our", not "my" (Scott)
  end: ["0 photos of the sofa"],
};

// Christmas (Scott, 19 Nov: "a few more for TikTok"): a theme, not a region: the festive footage across the
// collection, three hotels, the label once a hotel
const K = "hotels/the-kingfisher/festive";
const HG = "hotels/hogarths-stone-manor/festive";
const FF = "campaigns/festive/footage";
export const christmasRoll: RollSpec = {
  roll: [
    { src: `${G}/snowy-garden.mp4`, len: 62 },
    { src: `${K}/garland-30.mp4`, len: 343 },
    { src: `${R}/log-burner.mp4`, len: 60 },
    { src: `${FF}/treehouse-canopy.mp4`, len: 89 },
    { src: `${HG}/arrival.mp4`, len: 78, place: "KIDDERMINSTER", hotel: "Hogarths Stone Manor" },
    { src: `${HG}/drinks.mp4`, len: 69, place: "KIDDERMINSTER", hotel: "Hogarths Stone Manor" },
    { src: `${HG}/dinner.mp4`, len: 69, place: "KIDDERMINSTER", hotel: "Hogarths Stone Manor" },
    { src: `${K}/tree.mp4`, len: 79, place: "BEDFORD", hotel: "The Kingfisher" },
    { src: `${K}/fire.mp4`, len: 109, place: "BEDFORD", hotel: "The Kingfisher" },
    { src: `${L}/snowy-rooftops.mp4`, len: 62 },
    { src: `${FF}/ramside-tree.mp4`, len: 168, place: "DURHAM", hotel: "Ramside Hall" },
    { src: `${FF}/treehouse-bath.mp4`, len: 90 },
  ],
  opened: [4, 5, 6, 7, 8, 10],
  hook: ["our camera roll:", "Christmas edition"],
  end: ["0 photos of the sofa"],
};

// What The Funk (Rockot, Pixabay 549053) from 22.94s, where the band is full: its beats, in frames
const MUSIC = "music/rockot-what-the-funk-549053.mp3";
const MUSIC_FROM = 22.9413;
const BEATS = [0, 14, 29, 43, 57, 72, 86, 100, 115, 130, 143, 158, 173, 187, 201, 215, 230, 244, 258, 273, 288, 302, 316, 331, 345, 359, 374, 389,
  403, 417, 431, 446, 460, 475, 489, 504, 518, 532, 547, 561, 575, 590];
const b = (n: number) => BEATS[n];
const OPEN = 6; // the tap lands on this beat
const PER = 4; // beats a clip
const SHUT = OPEN + OPENED.length * PER;
export const ROLL_FRAMES = b(SHUT + 7);

const drift = (frame: number) => -frame * 0.22; // the roll creeping up, as if under a thumb
const cellRect = (i: number, frame: number) => ({
  x: (i % 3) * (CELL_W + GAP),
  y: GRID_TOP + Math.floor(i / 3) * (CELL_H + GAP) + drift(frame),
});

const Label: React.FC<{ place: string; hotel: string; o: number }> = ({ place, hotel, o }) => (
  <AbsoluteFill style={{ opacity: o }}>
    <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(9,9,10,0) 54%, rgba(9,9,10,0.6) 76%, rgba(9,9,10,0.3) 100%)" }} />
    <div style={{ position: "absolute", left: 72, bottom: 480 }}>
      <div style={{ display: "inline-block" }}>
        <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 28, letterSpacing: "0.24em", color: colors.gold }}>{place}</div>
      </div>
      {/* no gold underline under the place (Scott, 19 Nov) */}
      <div style={{ fontFamily: serif, fontSize: 68, lineHeight: 1.08, marginTop: 12, color: colors.cream, whiteSpace: "pre-line" }}>{hotel}</div>
    </div>
  </AbsoluteFill>
);

export const CameraRoll: React.FC<{ spec?: RollSpec }> = ({ spec = winterRoll }) => {
  const { roll: ROLL, opened: OPENED } = spec;
  const frame = useCurrentFrame();
  const openAt = b(OPEN);
  const shutAt = b(SHUT);
  const first = OPENED[0];
  const last = OPENED[OPENED.length - 1];

  // the tap, then the thumbnail growing to the frame; at the end the last clip dropping back into its place
  const grow = progress(frame, openAt - 2, 11, EASE_IN_OUT);
  const drop = progress(frame, shutAt - 2, 12, EASE_IN_OUT);
  const open = grow * (1 - drop);
  const from = cellRect(drop > 0 ? last : first, frame);
  const m = (a: number, c: number) => a + (c - a) * open;
  const tap = progress(frame, openAt - 9, 10, (x) => x);
  const tapC = { x: cellRect(first, frame).x + CELL_W / 2, y: cellRect(first, frame).y + CELL_H / 2 };

  // which clip is up, and the swipe between clips
  const SWIPE = 7;
  const slot = Math.min(OPENED.length - 1, Math.max(0, Math.floor((BEATS.findIndex((x) => x > frame) - 1 - OPEN) / PER)));
  const slotAt = (k: number) => b(OPEN + k * PER);
  const swipe = slot > 0 ? progress(frame, slotAt(slot), SWIPE, EASE_IN_OUT) : 1;
  const full = frame >= openAt - 2 && frame < shutAt + 10;

  const shot = (k: number, x: number) => {
    const c = ROLL[OPENED[k]];
    const at = slotAt(k);
    return (
      <div key={k} style={{ position: "absolute", left: x, top: 0, width: "100%", height: "100%" }}>
        <Sequence from={k === 0 ? openAt - 2 : at} layout="none">
          <OffthreadVideo src={staticFile(c.src)} muted style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover" }} />
        </Sequence>
      </div>
    );
  };

  // the label comes up once a hotel and holds across that hotel's clips (Scott: it flashed up on every clip),
  // changing only when the hotel does; it sits over the swipes, not on them
  const cur = ROLL[OPENED[slot]];
  let runFrom = slot;
  while (runFrom > 0 && ROLL[OPENED[runFrom - 1]].hotel === cur.hotel) runFrom--;
  let runTo = slot;
  while (runTo < OPENED.length - 1 && ROLL[OPENED[runTo + 1]].hotel === cur.hotel) runTo++;
  const runEnd = runTo === OPENED.length - 1 ? shutAt - 2 : slotAt(runTo + 1);
  const labelO = progress(frame, slotAt(runFrom) + 10, 10) * (1 - progress(frame, runEnd - 9, 8));

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* the roll */}
      <AbsoluteFill style={{ opacity: 1 - 0.75 * open }}>
        {ROLL.map((c, i) => {
          const r = cellRect(i, frame);
          return (
            <div key={i} style={{ position: "absolute", left: r.x, top: r.y, width: CELL_W, height: CELL_H, overflow: "hidden", background: "#111" }}>
              <Loop durationInFrames={c.len - 2}>
                <OffthreadVideo src={staticFile(c.src)} muted style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover" }} />
              </Loop>
              <div style={{ position: "absolute", right: 12, bottom: 10, fontFamily: sans, fontWeight: 700, fontSize: 24, color: "#fff",
                textShadow: "0 1px 6px rgba(0,0,0,0.8)" }}>{`0:0${Math.round(c.len / 30)}`}</div>
            </div>
          );
        })}
        {/* the header */}
        <div style={{ position: "absolute", left: 0, top: 0, width: W, height: GRID_TOP, background: "linear-gradient(to bottom, #000 78%, rgba(0,0,0,0))" }} />
        <div style={{ position: "absolute", left: 40, top: 150, fontFamily: sans, fontWeight: 800, fontSize: 64, color: "#fff", letterSpacing: "-0.01em" }}>Recents</div>
        <div style={{ position: "absolute", right: 40, top: 164, fontFamily: sans, fontWeight: 600, fontSize: 30, color: "#fff", background: "rgba(255,255,255,0.16)",
          padding: "10px 26px", borderRadius: 40 }}>Select</div>
        {/* the tap */}
        {tap > 0 && tap < 1 ? (
          <div style={{ position: "absolute", left: tapC.x - 70, top: tapC.y - 70, width: 140, height: 140, borderRadius: 70,
            background: "rgba(255,255,255,0.35)", border: "3px solid rgba(255,255,255,0.7)", opacity: 1 - tap, transform: `scale(${0.5 + 0.7 * tap})` }} />
        ) : null}
      </AbsoluteFill>
      {/* the opened clip, grown from its thumbnail, and the swipes */}
      {full ? (
        <div style={{ position: "absolute", left: m(from.x, 0), top: m(from.y, 0), width: m(CELL_W, W), height: m(CELL_H, H), overflow: "hidden", background: "#000" }}>
          {slot > 0 && swipe < 1 ? shot(slot - 1, -swipe * (W + 40)) : null}
          {shot(slot, (1 - swipe) * (W + 40))}
          {cur.place && cur.hotel && open > 0.98 ? <Label place={cur.place} hotel={cur.hotel} o={labelO} /> : null}
        </div>
      ) : null}
      <Audio src={staticFile(MUSIC)} trimBefore={Math.round(MUSIC_FROM * 30)}
        volume={(v) => interpolate(v, [0, 5, ROLL_FRAMES - 18, ROLL_FRAMES], [0, 1, 1, 0], { extrapolateRight: "clamp" })} />
      <FilmFinish />
      <Sequence durationInFrames={openAt + 2} layout="none">
        <TikTokText lines={spec.hook} top={TT_TOP} left={140} out={openAt - 6} still />
      </Sequence>
      <Sequence from={shutAt + 14} layout="none">
        <TikTokText lines={spec.end} top={TT_TOP} left={140} />
      </Sequence>
    </AbsoluteFill>
  );
};
