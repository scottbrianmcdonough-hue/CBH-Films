import React from "react";
import { AbsoluteFill, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { FilmFinish } from "../components/FilmFinish";
import { colors, EASE_IN_OUT, EASE_OUT, progress, serif } from "../theme";
import { B, caps, clamp, EndCard, FEST, G, Mark, Music, ShotView } from "./common";

// "Door 24" (draft): an advent calendar in the CBH black and gold, its doors ripping off on the beat, each onto a
// hotel at Christmas. One a beat to the band's stop, held through it, then the rest tumbling open on the return,
// faster and faster; door 24, the big double door, opens last, the camera pushes in and cuts on the beat to its
// shot full frame (Ramside Hall's tree, the tilt up to its top), then the end card.
export const DOOR_FRAMES = B(31);

// a 4 x 7 grid in the safe area; door 24 two by two, door 1 two wide
const X0 = 55;
const Y0 = 250;
const CW = 235;
const CH = 162;
const GAP = 10;
type Door = { n: number; c: number; r: number; w?: number; h?: number; src: string; pos?: string };
const P = (src: string) => G + src;
// numbers shuffled across the board, as on a real calendar; each door looks onto a different corner of the
// festive photos
const DOORS: Door[] = [
  { n: 1, c: 0, r: 0, w: 2, src: P("hintlesham-hall-exterior.jpg"), pos: "50% 60%" },
  { n: 17, c: 2, r: 0, src: P("barnett-hill-staircase.jpg"), pos: "15% 20%" },
  { n: 9, c: 3, r: 0, src: P("donnington-santa.jpg"), pos: "35% 60%" },
  { n: 5, c: 0, r: 1, src: P("rowton-hall-mantel.jpg"), pos: "10% 20%" },
  { n: 21, c: 1, r: 1, src: P("fairlawns-afternoon-tea.jpg"), pos: "40% 60%" },
  { n: 12, c: 2, r: 1, src: P("langshott-manor-nutcracker.jpg"), pos: "62% 55%" },
  { n: 3, c: 3, r: 1, src: P("hogarths-entrance.jpg"), pos: "50% 30%" },
  { n: 14, c: 0, r: 2, src: P("oakley-hall-exterior.jpg"), pos: "45% 50%" },
  { n: 7, c: 1, r: 2, src: P("fairlawns-crackers.jpg"), pos: "55% 30%" },
  { n: 19, c: 2, r: 2, src: P("hogarths-chef.jpg"), pos: "75% 60%" },
  { n: 10, c: 3, r: 2, src: P("nailcote-hall-snow.jpg"), pos: "35% 40%" },
  { n: 2, c: 0, r: 3, src: P("barnett-hill-staircase.jpg"), pos: "55% 60%" },
  { n: 24, c: 1, r: 3, w: 2, h: 2, src: FEST + "ramside-tree.mp4" },
  { n: 16, c: 3, r: 3, src: P("donnington-santa.jpg"), pos: "80% 30%" },
  { n: 22, c: 0, r: 4, src: P("rowton-hall-mantel.jpg"), pos: "60% 40%" },
  { n: 6, c: 3, r: 4, src: P("langshott-manor-nutcracker.jpg"), pos: "10% 40%" },
  { n: 11, c: 0, r: 5, src: P("fairlawns-afternoon-tea.jpg"), pos: "80% 50%" },
  { n: 4, c: 1, r: 5, src: P("hintlesham-hall-exterior.jpg"), pos: "20% 70%" },
  { n: 18, c: 2, r: 5, src: P("hogarths-entrance.jpg"), pos: "85% 60%" },
  { n: 13, c: 3, r: 5, src: P("fairlawns-crackers.jpg"), pos: "15% 50%" },
  { n: 8, c: 0, r: 6, src: P("hogarths-chef.jpg"), pos: "30% 40%" },
  { n: 20, c: 1, r: 6, src: P("oakley-hall-exterior.jpg"), pos: "80% 40%" },
  { n: 15, c: 2, r: 6, src: P("nailcote-hall-snow.jpg"), pos: "75% 50%" },
  { n: 23, c: 3, r: 6, src: P("rowton-hall-mantel.jpg"), pos: "90% 80%" },
];

// when each door opens (frames): 1 to 8 a beat apart from beat 2, held through the stop (10 to 12), 9 to 23
// tumbling open from the return, each a little sooner than the last; 24 on beat 19
const opensAt = (n: number) => {
  if (n <= 8) return B(1 + n);
  if (n === 24) return B(19);
  const k = n - 9; // 0..14 across beats 12 to 18
  return B(12) + Math.round(B(6.2) * (1 - Math.pow(1 - k / 14, 1.35)));
};

// a door rips off (Scott: the open doors have to disappear, "slot in or ripped off"): it pops open on its hinge,
// tears free on the far side and tumbles away towards you and out of frame, leaving the photo in its window
const POP = 5; // frames on the hinge before it tears
const FALL = 18; // frames to tumble out
const Leaf: React.FC<{ w: number; h: number; t: number; side: "left" | "right"; n?: number }> = ({ w, h, t, side, n }) => {
  if (t > POP + FALL) return null;
  const s = side === "left" ? -1 : 1;
  const pop = progress(t, 0, POP, EASE_OUT);
  const f = Math.min(1, Math.max(0, (t - POP) / FALL)); // the fall, accelerating
  const angle = s * (38 * pop + 70 * f);
  const style: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: side === "left" ? 0 : w,
    width: w,
    height: h,
    transformOrigin: side === "left" ? "0 50%" : "100% 50%",
    // off the hinge: towards the camera, out to the side, and down under gravity, turning as it goes
    transform: `translate3d(${-s * 140 * f}px, ${1500 * f * f}px, ${380 * f}px) rotateZ(${-s * 55 * f}deg) rotateY(${angle}deg)`,
    background: "linear-gradient(135deg, #1E1E21, #121214)",
    border: "2px solid rgba(195,158,85,0.75)",
    borderRadius: 6,
    boxShadow: `inset 0 0 0 6px rgba(9,9,10,0.6), inset 0 0 0 7px rgba(195,158,85,0.25), 0 ${20 + 60 * f}px ${30 + 50 * f}px rgba(0,0,0,${0.35 + 0.3 * pop})`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    filter: `brightness(${1 - 0.3 * pop})`,
  };
  return (
    <div style={style}>
      {n ? <div style={{ fontFamily: serif, fontSize: 84, color: colors.gold, lineHeight: 1 }}>{n}</div> : null}
    </div>
  );
};

const DoorView: React.FC<{ d: Door; frame: number }> = ({ d, frame }) => {
  const w = (d.w ?? 1) * CW + ((d.w ?? 1) - 1) * GAP;
  const h = (d.h ?? 1) * CH + ((d.h ?? 1) - 1) * GAP;
  const t = frame - opensAt(d.n);
  const glow = progress(t, 0, 14, EASE_OUT);
  return (
    <div style={{ position: "absolute", left: X0 + d.c * (CW + GAP), top: Y0 + d.r * (CH + GAP), width: w, height: h, perspective: 900, zIndex: t > 0 && t <= POP + FALL ? 5 : 1 }}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: 6, background: colors.black }}>
        {t > 0 ? (
          d.src.endsWith(".mp4") ? (
            <Sequence from={opensAt(d.n)} layout="none">
              <OffthreadVideo src={staticFile(d.src)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </Sequence>
          ) : (
            <Img src={staticFile(d.src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: d.pos ?? "50% 50%", transform: `scale(${1.12 - 0.08 * glow})` }} />
          )
        ) : null}
        <AbsoluteFill style={{ boxShadow: "inset 0 0 24px rgba(0,0,0,0.7)" }} />
      </div>
      {d.n === 24 ? (
        <>
          <Leaf w={w / 2} h={h} t={t} side="left" />
          <Leaf w={w / 2} h={h} t={t} side="right" />
          {t <= 0 ? (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
              <div style={{ fontFamily: serif, fontSize: 170, color: colors.gold, lineHeight: 1 }}>24</div>
            </div>
          ) : null}
        </>
      ) : (
        <Leaf w={w} h={h} t={t} side="left" n={d.n} />
      )}
    </div>
  );
};

const CUT = 21; // the cut to door 24's shot full frame
const END = 25;

export const Door24: React.FC = () => {
  const frame = useCurrentFrame();
  const intro = progress(frame, 0, 18, EASE_OUT);
  // the camera: a slow drift in, then a push into door 24 once it opens
  const d24 = DOORS.find((d) => d.n === 24)!;
  const cx = X0 + d24.c * (CW + GAP) + CW + GAP / 2;
  const cy = Y0 + d24.r * (CH + GAP) + CH + GAP / 2;
  const push = progress(frame, B(19) + 4, B(CUT) - B(19) - 4, EASE_IN_OUT);
  const z = interpolate(frame, [0, B(19)], [1, 1.06], clamp) * (1 + 1.4 * push * push);
  const tx = (540 - cx) * push;
  const ty = (900 - cy) * push;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      <AbsoluteFill
        style={{
          opacity: intro,
          transform: `translate(${tx}px, ${ty}px) scale(${z})`,
          transformOrigin: `${cx}px ${cy}px`,
        }}
      >
        {/* the calendar's case: a warm charcoal board with a fine gold frame */}
        <div style={{ position: "absolute", left: X0 - 30, top: Y0 - 130, width: 4 * CW + 3 * GAP + 60, height: 7 * CH + 6 * GAP + 160, borderRadius: 18, background: "radial-gradient(ellipse at 50% 30%, #222225, #141416)", border: "1px solid rgba(195,158,85,0.5)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: Y0 - 96, textAlign: "center" }}>
          <div style={{ display: "inline-block" }}>
            <div style={caps(26, colors.gold, 0.32)}>December</div>
            <div style={{ height: 2, background: colors.gold, marginTop: 10 }} />
          </div>
        </div>
        {DOORS.map((d) => (
          <DoorView key={d.n} d={d} frame={frame} />
        ))}
      </AbsoluteFill>
      {frame >= B(CUT) && frame < B(END) ? (
        <AbsoluteFill>
          <Sequence from={B(CUT)} layout="none">
            <ShotView s={{ src: FEST + "ramside-tree.mp4", from: (B(CUT) - B(19)) / 30 }} len={B(END) - B(CUT)} push={0.03} />
          </Sequence>
          <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(9,9,10,0) 45%, rgba(9,9,10,0.75) 80%)" }} />
          <div style={{ position: "absolute", left: 76, right: 170, bottom: 520, opacity: progress(frame, B(CUT) + 6, 16, EASE_OUT) }}>
            <div style={{ fontFamily: serif, fontSize: 96, lineHeight: 1.04, color: colors.cream }}>
              The last door
              <br />
              <span style={{ fontStyle: "italic" }}>opens at ours</span>
            </div>
          </div>
        </AbsoluteFill>
      ) : null}
      <Mark />
      <FilmFinish />
      <EndCard at={B(END)} line1="Christmas, Twixmas" line2="and New Year" sub="Breaks bookable now" />
      <Music len={DOOR_FRAMES} />
    </AbsoluteFill>
  );
};
