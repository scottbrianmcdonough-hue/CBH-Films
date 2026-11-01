import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { FilmFinish } from "../components/FilmFinish";
import { colors, EASE_IN_OUT, EASE_OUT, serif } from "../theme";

// The 12 days of Christmas giveaway teaser (Scott, 31 Oct, after Bianca's "12 days of xmas
// giveaway" idea): an advent calendar in CBH black and gold, 12 doors numbered out of order the way
// a real calendar is, under "12 days of Christmas". The doors swing open on the beat, slowly at
// first and then quicker, each onto a different hotel at Christmas (twelve hotels, none twice);
// the band's stop holds the calendar with one door still shut; door 12 opens on the return, the
// camera pushes into it and the shot opens out to full frame (Ramside's lit tree; Scott: not the Kingfisher again); end
// card "12 days / of giveaways / Starts 1 December" (the dates are a suggestion: confirm with
// Bianca), white CB. A mock-up: the prizes are not named until they are confirmed.
//
// Music: Christmas Jazz by Tunetank (the festive reel's track, so the two read as a set), 86 BPM,
// from the 14.12s downbeat as in festive-lights-on: its full stop (21.06-22.33s) falls on beats
// 10-11, the band back on 12.

export const ADVENT_FPS = 30;
const BEAT = (30 * 60) / 86; // frames
const b = (n: number) => Math.round(n * BEAT);
export const ADVENT_FRAMES = b(24);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const G = "campaigns/festive/graded";

// the grid: 3 x 4 doors, numbered out of order, 12 in the middle of the second row
const COLS = 3;
const GAP = 24;
const LEFT = 90;
const TOP = 420;
const CW = (900 - GAP * (COLS - 1)) / COLS; // 284
const CH = 270;
const LAYOUT = [
  [7, 2, 10],
  [4, 12, 1],
  [9, 5, 11],
  [3, 8, 6],
];
type Media = { still?: string; clip?: string; pos?: string; from?: number };
const INSIDE: Record<number, Media> = {
  1: { still: `${G}/donnington-santa.jpg`, pos: "50% 50%" },
  2: { still: `${G}/fairlawns-crackers.jpg` },
  3: { still: `${G}/barnett-hill-staircase.jpg` },
  4: { still: `${G}/langshott-manor-nutcracker.jpg` },
  5: { still: `${G}/hintlesham-hall-exterior.jpg` },
  6: { still: `${G}/rowton-hall-mantel.jpg` },
  7: { still: `${G}/hogarths-entrance.jpg` },
  8: { still: `${G}/nailcote-hall-snow.jpg` },
  9: { still: "campaigns/aa-rosettes/haycock-prevost-plate.jpg", pos: "50% 55%" }, // Haycock Manor (Scott: not the Kingfisher again)
  10: { still: `${G}/low-wood-bay-columns.jpg` },
  11: { still: `${G}/oakley-hall-exterior.jpg` },
  12: { clip: "campaigns/festive/footage/ramside-tree.mp4" }, // Ramside's lit tree, the camera tilting up it
};
// when each door opens: one a beat, then two a beat, the last on the band's return
const OPEN: Record<number, number> = {
  1: b(2), 2: b(3), 3: b(4), 4: b(5),
  5: b(6), 6: b(6.5), 7: b(7), 8: b(7.5), 9: b(8), 10: b(8.5), 11: b(9),
  12: b(12),
};
const SWING = 12; // frames a door takes to swing open

// door 12, where the camera goes in: its centre, and the push that makes the door as wide as the
// frame, where its inside (the clip at full-frame size, fitted to the door's width) lines up to the
// pixel with the full-frame clip that opens out from it
const cell = (n: number) => {
  const r = LAYOUT.findIndex((row) => row.includes(n));
  const c = LAYOUT[r].indexOf(n);
  return { x: LEFT + c * (CW + GAP), y: TOP + r * (CH + GAP) };
};
const C12 = cell(12);
const CX = C12.x + CW / 2;
const CY = C12.y + CH / 2;
const PUSH_TO = 1080 / CW;
// the push starts once door 12 is fully open and runs two beats (Scott: "smoother", the first
// one-and-a-half-beat push read as jittery)
const PUSH = [b(12.75), b(14.75)];
const OPEN_OUT = [b(14.75), b(15.5)];
const CLIP_AT = OPEN[12]; // the tree clip starts as door 12 opens, in the door and full frame alike
const END = b(18.5);

// `recess`: on the push, the pictures sit back behind the board, so they grow a little slower than
// the doors and frames in front of them (depth); door 12's picture never recedes, it is where the
// camera goes
const Inside: React.FC<{ n: number; frame: number; recess: number }> = ({ n, frame, recess }) => {
  const m = INSIDE[n];
  if (m.clip) {
    // the clip at full-frame size, fitted to the door's width and centred on it
    const k = CW / 1080;
    const kk = n === 12 ? k : k * recess;
    return (
      <div style={{ position: "absolute", left: (CW - 1080 * kk) / 2, top: (CH - 1920 * kk) / 2, width: 1080, height: 1920,
        transform: `scale(${kk})`, transformOrigin: "0 0" }}>
        <Sequence from={n === 12 ? CLIP_AT : OPEN[n] - SWING} layout="none">
          <OffthreadVideo src={staticFile(m.clip)} startFrom={Math.round((m.from ?? 0) * 30)} muted
            style={{ width: 1080, height: 1920, objectFit: "cover" }} />
        </Sequence>
      </div>
    );
  }
  // stills drift in slowly once their door is open
  const z = interpolate(frame, [OPEN[n], OPEN[n] + b(8)], [1.0, 1.08], clamp);
  return (
    <Img src={staticFile(m.still!)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%",
      objectFit: "cover", objectPosition: m.pos ?? "50% 50%", transform: `scale(${z * recess})` }} />
  );
};

const Door: React.FC<{ n: number; frame: number; recess: number }> = ({ n, frame, recess }) => {
  const { x, y } = cell(n);
  const t = interpolate(frame, [OPEN[n], OPEN[n] + SWING], [0, 1], { ...clamp, easing: EASE_OUT });
  const open = frame >= OPEN[n] - 1;
  // once fully open the door is drawn flat, as the sliver of its edge: a panel turned in 3D shimmered
  // as the camera pushed past it (Scott: "jittery")
  const flat = t >= 1;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: CW, height: CH, perspective: 2600 }}>
      {/* the inside, lit, behind the door */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#050404",
        boxShadow: "inset 0 0 0 1px rgba(195,158,85,0.5)" }}>
        {open ? <Inside n={n} frame={frame} recess={recess} /> : null}
        {/* the door's shadow across the inside, lifting as it swings clear */}
        <div style={{ position: "absolute", inset: 0,
          background: `linear-gradient(to right, rgba(0,0,0,${0.75 * (1 - t)}) 0%, rgba(0,0,0,${0.25 * (1 - t)}) 60%, rgba(0,0,0,0) 100%)` }} />
      </div>
      {flat ? (
        <div style={{ position: "absolute", left: -7, top: -3, width: 9, height: CH + 6, background: "#1a1814",
          boxShadow: "inset 0 0 0 1px rgba(195,158,85,0.6)" }} />
      ) : (
      <div style={{ position: "absolute", inset: 0, transformOrigin: "0% 50%", transformStyle: "preserve-3d",
        transform: `rotateY(${-93 * t}deg)` }}>  {/* edge on once open, so it never covers the next door */}
        <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden",
          background: "linear-gradient(160deg, #15130f 0%, #0b0a08 100%)",
          boxShadow: "inset 0 0 0 2px #C39E55, inset 0 0 0 12px #0d0c0a, inset 0 0 0 13px rgba(195,158,85,0.55)",
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontFamily: serif, fontSize: 132, lineHeight: 1, color: colors.gold, marginTop: -8 }}>{n}</div>
          {/* a small gold knob on the opening edge */}
          <div style={{ position: "absolute", right: 22, top: CH / 2 - 7, width: 14, height: 14, borderRadius: 7,
            background: "radial-gradient(circle at 35% 35%, #f3dca6, #C39E55 55%, #7a5f2c)" }} />
        </div>
        <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)",
          background: "#1a1814", boxShadow: "inset 0 0 0 2px rgba(195,158,85,0.6)" }} />
      </div>
      )}
    </div>
  );
};

export const AdventTeaser: React.FC = () => {
  const frame = useCurrentFrame();
  // the calendar breathes in a touch, then the camera pushes into door 12
  const drift = interpolate(frame, [0, PUSH[0]], [1, 1.03], clamp);
  const p = interpolate(frame, [PUSH[0], PUSH[1]], [0, 1], { ...clamp, easing: EASE_IN_OUT });
  const scale = drift * (1 + (PUSH_TO / drift - 1) * p);
  const title = interpolate(frame, [PUSH[0], PUSH[0] + 12], [1, 0], clamp); // there from frame one, the preview
  // the full-frame tree opening out of the door, top and bottom
  const out = interpolate(frame, OPEN_OUT, [0, 1], { ...clamp, easing: EASE_IN_OUT });
  const bandH = CH * PUSH_TO; // the door's height once it is as wide as the frame
  const inset = ((1920 - bandH) / 2) * (1 - out);
  const toEnd = interpolate(frame, [END - 10, END + 6], [1, 0], clamp);
  const card = interpolate(frame, [END + 4, END + 22], [0, 1], { ...clamp, easing: EASE_OUT });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* the calendar */}
      {frame < OPEN_OUT[1] ? (
        <AbsoluteFill style={{ transformOrigin: `${CX}px ${CY}px`,
          transform: `translate(${(540 - CX) * p}px, ${(960 - CY) * p}px) scale(${scale})` }}>
          {/* the board under the doors */}
          <div style={{ position: "absolute", left: LEFT - 30, top: TOP - 30, width: 960, height: 4 * CH + 3 * GAP + 60,
            background: "#0a0908", boxShadow: "inset 0 0 0 1px rgba(195,158,85,0.35), 0 0 60px rgba(0,0,0,0.8)" }} />
          {LAYOUT.flat().map((n) => <Door key={n} n={n} frame={frame} recess={1 - 0.14 * p} />)}
        </AbsoluteFill>
      ) : null}
      {/* the title above it */}
      <div style={{ position: "absolute", top: 200, width: "100%", textAlign: "center", fontFamily: serif,
        fontSize: 92, color: colors.cream, opacity: title,
        transform: `translateY(${-260 * p}px) scale(${1 + 0.5 * p})` }}>12 days of Christmas</div>
      {/* the tree, full frame, opening out of door 12 */}
      {frame >= OPEN_OUT[0] - 1 && frame < END + 8 ? (
        <AbsoluteFill style={{ clipPath: `inset(${inset}px 0 ${inset}px 0)`, opacity: toEnd }}>
          <Sequence from={CLIP_AT} layout="none">
            <OffthreadVideo src={staticFile(INSIDE[12].clip!)} startFrom={Math.round((INSIDE[12].from ?? 0) * 30)}
              muted style={{ position: "absolute", width: 1080, height: 1920, objectFit: "cover" }} />
          </Sequence>
        </AbsoluteFill>
      ) : null}
      {/* end card: cream Cormorant, centred, the white CB in the corner */}
      {frame >= END ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: card }}>
          <div style={{ fontFamily: serif, color: colors.cream, textAlign: "center", marginTop: -120,
            transform: `translateY(${(1 - card) * 20}px)` }}>
            <div style={{ fontSize: 116, lineHeight: 1.08 }}>12 days</div>
            <div style={{ fontSize: 116, lineHeight: 1.08 }}>of giveaways</div>
            <div style={{ fontSize: 56, marginTop: 36, opacity: 0.85 }}>Starts 1 December</div>
          </div>
          <Img src={staticFile("brand/cb-watermark.png")} style={{ position: "absolute", left: 920, top: 1452, width: 100, height: 108 }} />
        </AbsoluteFill>
      ) : null}
      <FilmFinish />
      <Audio
        src={staticFile("campaigns/festive/christmas-jazz.mp3")}
        trimBefore={424}
        volume={(f) => 0.99 * interpolate(f, [0, 6, b(22), ADVENT_FRAMES], [0, 1, 1, 0], clamp)}
      />
    </AbsoluteFill>
  );
};
