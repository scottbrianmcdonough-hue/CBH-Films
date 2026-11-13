import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { FilmFinish } from "../components/FilmFinish";
import { colors, EASE_IN_OUT, EASE_OUT, progress, serif } from "../theme";
import { caps, clamp, Mark } from "./common";

// The team's Christmas message (Scott, 13 Nov: "an advent calendar feel, but instead of footage it opens on team
// members saying Merry Christmas or something, then the whole team"). The December calendar's look (charcoal board,
// fine gold frame, DECEMBER in gold caps, gold Cormorant numbers): a door swings open, the camera pushes into it and
// the person's clip plays full frame with their own voice and their name in gold caps, then back out to the board
// for the next door; the big door 24 opens last onto the whole team (the gala team photo), "Merry Christmas / from
// all of us", the white CB. Christmas Jazz (Tunetank, the festive reel's) low under the voices. A mock-up: only
// For now (Scott, 13 Nov: "take out my one and add placeholder shots of the hotels and the team photo") every door
// opens on a festive hotel photo as a stand in until the team send their clips.

type Member = { n: number; name?: string; clip?: string; still?: string; len: number; pos?: string };
// in opening order (clips are each person's few seconds; len in frames)
const F = "campaigns/festive/graded/";
const MEMBERS: Member[] = [
  { n: 1, still: F + "donnington-santa.jpg", len: 40 },
  { n: 3, still: F + "fairlawns-crackers.jpg", len: 40 },
  { n: 7, still: F + "hogarths-entrance.jpg", len: 40 },
  { n: 9, still: F + "langshott-manor-nutcracker.jpg", len: 40, pos: "62% 55%" },
  { n: 12, still: F + "rowton-hall-mantel.jpg", len: 40 },
  { n: 18, still: F + "barnett-hill-staircase.jpg", len: 40 },
];
// the board: three small doors a row, door 24 two rows high across the bottom
const X0 = 110;
const Y0 = 470;
const CW = 270;
const CH = 300;
const GAP = 20;
const GRID: Record<number, [number, number]> = { 7: [0, 0], 1: [1, 0], 12: [2, 0], 3: [0, 1], 18: [1, 1], 9: [2, 1] };
const BIG = { x: X0, y: Y0 + 2 * (CH + GAP), w: 3 * CW + 2 * GAP, h: 2 * CH + GAP };
const doorBox = (n: number) =>
  n === 24 ? BIG : { x: X0 + GRID[n][0] * (CW + GAP), y: Y0 + GRID[n][1] * (CH + GAP), w: CW, h: CH };

// timing: the board settles, then each member: open, push in, the clip, back out
const START = 30;
const OPEN = 16; // the door swings away
const IN = 14; // the push into it
const OUT = 14; // back out to the board
type Slot = { m: Member; open: number; full: number; back: number };
const SLOTS: Slot[] = [];
{
  let t = START;
  for (const m of MEMBERS) {
    const open = t;
    const full = open + OPEN - 2; // the push starts here; the clip plays from it, full frame as the push lands
    const back = full + IN + m.len;
    SLOTS.push({ m, open, full, back });
    t = back + OUT + 6;
  }
}
const TEAM_OPEN = SLOTS[SLOTS.length - 1].back + OUT + 10;
const TEAM_FULL = TEAM_OPEN + OPEN - 2;
const LINE_AT = TEAM_FULL + IN + 16;
export const TEAM_ADVENT_FRAMES = LINE_AT + 120;

const Leaf: React.FC<{ t: number; n: number; big?: boolean }> = ({ t, n, big }) => {
  if (t > OPEN + 4) return null;
  const a = progress(t, 0, OPEN, EASE_IN_OUT);
  return (
    <div style={{ position: "absolute", inset: 0, perspective: 1200 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformOrigin: "0 50%",
          transform: `rotateY(${-105 * a}deg)`,
          opacity: 1 - progress(t, OPEN - 4, 6),
          background: "linear-gradient(135deg, #24231F, #141412)",
          border: "2px solid rgba(195,158,85,0.75)",
          borderRadius: 6,
          boxShadow: "inset 0 0 0 6px rgba(9,9,10,0.55), inset 0 0 0 7px rgba(195,158,85,0.22)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          filter: `brightness(${1 - 0.35 * a})`,
        }}
      >
        <div style={{ fontFamily: serif, fontSize: big ? 190 : 110, color: colors.gold, lineHeight: 1 }}>{n}</div>
      </div>
    </div>
  );
};

const Placeholder: React.FC = () => (
  <AbsoluteFill style={{ background: "#16150F", alignItems: "center", justifyContent: "center" }}>
    <div style={{ ...caps(22, colors.gold, 0.2), textAlign: "center" }}>Clip to come</div>
  </AbsoluteFill>
);

const Inside: React.FC<{ m?: Member; team?: boolean }> = ({ m, team }) =>
  team ? (
    <Img
      src={staticFile("campaigns/amc-2026/team-gala-sharp.jpg")}
      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 45%" }}
    />
  ) : m?.still ? (
    <Img
      src={staticFile(m.still)}
      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: m.pos ?? "50% 50%" }}
    />
  ) : m?.clip ? (
    <OffthreadVideo
      src={staticFile(m.clip)}
      muted
      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: m.pos ?? "50% 40%" }}
    />
  ) : (
    <Placeholder />
  );

// how far the camera is pushed into a door at frame f: 0 on the board, 1 filling the frame
const pushOf = (f: number) => {
  for (const s of SLOTS) {
    if (f >= s.open + OPEN - 2 && f < s.back + OUT)
      return { n: s.m.n, p: progress(f, s.open + OPEN - 2, IN, EASE_IN_OUT) * (1 - progress(f, s.back, OUT, EASE_IN_OUT)) };
  }
  if (f >= TEAM_OPEN + OPEN - 2) return { n: 24, p: progress(f, TEAM_OPEN + OPEN - 2, IN + 6, EASE_IN_OUT) };
  return { n: 0, p: 0 };
};

export const TeamAdvent: React.FC = () => {
  const f = useCurrentFrame();
  const { n, p } = pushOf(f);
  // the camera: scale and move so the door's window covers the frame
  let cam = "none";
  if (n) {
    const d = doorBox(n);
    const s = Math.max(1080 / d.w, 1920 / d.h);
    const k = 1 + (s - 1) * p;
    const cx = d.x + d.w / 2;
    const cy = d.y + d.h / 2;
    const ox = cx + (540 - cx) * (1 - p); // the point that sits at the frame centre
    const oy = cy + (960 - cy) * (1 - p);
    cam = `translate(${540 - ox * k}px, ${960 - oy * k}px) scale(${k})`;
  }
  const slot = SLOTS.find((s) => f >= s.full && f < s.back);
  const teamFull = f >= TEAM_FULL;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      {/* Christmas Jazz under the voices, ducked while someone speaks */}
      <Audio
        src={staticFile("campaigns/festive/christmas-jazz.mp3")}
        trimBefore={Math.round(14.12 * 30)}
        volume={(t) => {
          const talking = SLOTS.some((s) => s.m.clip && t >= s.full - 4 && t < s.back + 2);
          return (
            (talking ? 0.28 : 0.9) *
            interpolate(t, [0, 6, TEAM_ADVENT_FRAMES - 40, TEAM_ADVENT_FRAMES - 1], [0, 1, 1, 0], clamp)
          );
        }}
      />
      {SLOTS.filter((s) => s.m.clip).map((s) => (
        <Sequence key={s.m.n} from={s.full} durationInFrames={s.m.len}>
          <Audio src={staticFile(s.m.clip!)} volume={1.6} />
        </Sequence>
      ))}
      {/* the board */}
      <AbsoluteFill style={{ transform: cam, transformOrigin: "0 0" }}>
        <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #2C2B27 0%, #1A1A17 70%)" }} />
        <div style={{ position: "absolute", left: 70, top: 300, width: 940, height: 1440, border: "2px solid rgba(195,158,85,0.7)", borderRadius: 10 }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", ...caps(40, colors.gold, 0.3) }}>December</div>
        {[...Object.keys(GRID).map(Number), 24].map((dn) => {
          const d = doorBox(dn);
          const s = SLOTS.find((x) => x.m.n === dn);
          const openAt = dn === 24 ? TEAM_OPEN : s?.open;
          const t = openAt === undefined ? -1 : f - openAt;
          return (
            <div key={dn} style={{ position: "absolute", left: d.x, top: d.y, width: d.w, height: d.h }}>
              <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: 6, background: colors.black }}>
                {t >= 0 ? <Inside m={s?.m} team={dn === 24} /> : null}
                <AbsoluteFill style={{ boxShadow: "inset 0 0 24px rgba(0,0,0,0.6)" }} />
              </div>
              {t < OPEN + 4 ? <Leaf t={Math.max(0, t)} n={dn} big={dn === 24} /> : null}
            </div>
          );
        })}
      </AbsoluteFill>
      {/* the clip full frame, its sound, the name */}
      {slot ? (
        <Sequence from={slot.full} durationInFrames={slot.back - slot.full} layout="none">
          <AbsoluteFill style={{ opacity: Math.min(progress(f, slot.full + 2, IN - 2, EASE_IN_OUT), 1 - progress(f, slot.back - 2, 8, EASE_IN_OUT)) }}>
            <Inside m={slot.m} />
            <AbsoluteFill style={{ background: "linear-gradient(to top, rgba(9,9,10,0.75) 0%, rgba(9,9,10,0) 32%)" }} />
            {slot.m.name ? (
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 420,
                  textAlign: "center",
                  ...caps(34, colors.gold, 0.26),
                  opacity: progress(f, slot.full + 6, 12, EASE_OUT),
                }}
              >
                {slot.m.name}
              </div>
            ) : null}
          </AbsoluteFill>
        </Sequence>
      ) : null}
      {/* the whole team, then the line */}
      {teamFull ? (
        <AbsoluteFill style={{ opacity: progress(f, TEAM_FULL + 2, IN, EASE_IN_OUT) }}>
          {/* the whole team in frame (a wide photo): fitted to the width over its own soft, dark copy */}
          <Img
            src={staticFile("campaigns/amc-2026/team-gala-sharp.jpg")}
            style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", filter: "blur(28px) brightness(0.45)", transform: "scale(1.15)" }}
          />
          <Img
            src={staticFile("campaigns/amc-2026/team-gala-sharp.jpg")}
            style={{
              position: "absolute",
              left: 0,
              top: 700,
              width: "100%",
              transform: `scale(${1.06 - 0.06 * progress(f, TEAM_FULL, 150, EASE_OUT)})`,
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          />
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 380, textAlign: "center" }}>
            {["Merry Christmas", "from all of us"].map((l, i) => {
              const a = progress(f, LINE_AT + i * 8, 26, EASE_OUT);
              return (
                <div
                  key={l}
                  style={{
                    fontFamily: serif,
                    fontStyle: i ? "italic" : "normal",
                    fontSize: i ? 92 : 112,
                    lineHeight: 1.1,
                    color: colors.cream,
                    opacity: a,
                    transform: `translateY(${(1 - a) * 26}px)`,
                    textShadow: "0 3px 28px rgba(9,9,10,0.6)",
                  }}
                >
                  {l}
                </div>
              );
            })}
          </AbsoluteFill>
        </AbsoluteFill>
      ) : null}
      <Mark />
      <FilmFinish />
    </AbsoluteFill>
  );
};
