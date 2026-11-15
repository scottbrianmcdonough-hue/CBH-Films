import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { FilmFinish } from "../components/FilmFinish";
import { CB_B, CB_C } from "../sketch/cb-paths";
import { colors, EASE_IN_OUT, EASE_OUT, progress, sans, serif } from "../theme";

// "Going up" (Scott, 15 Nov: "now do an original idea", for TikTok). A hotel lift in black lacquer and brass, the CB
// inlaid across its two doors so it splits down the middle each time they open. A brass dial above counts the floors;
// a soft bell, the doors part and the camera goes in through them onto that floor, real footage: ground floor,
// arrivals; first floor, the spa; second floor, dinner; top floor, do not disturb. The doors close on the last floor,
// the CB whole again; it turns to gold as the lift falls dark, becomes the logo on the track's final chord, shimmer.
// Lift music, played straight: Jazz Cocktail Lounge (alex-morgan, Pixabay 556246), its last 21 seconds, every cue on
// the track's own beats (BEATS, from librosa): the doors closed through the band's stop (150.7 to 152s), open again
// as it comes back, the logo on its final chord (160.31s). The bell is synthesised on the track's G
// (public/stings/lift/ding.wav), a sound effect Scott's brief allows here: the lift's own.

const W = 1080;
const H = 1920;
const MUSIC = "stings/jazz-cocktail-lounge.mp3";
const START = 142.64;
const BEATS = [
  142.64, 143.2, 143.75, 144.29, 144.85, 145.4, 145.96, 146.52, 147.08, 147.63, 148.17, 148.72, 149.28, 149.84, 150.4,
  150.95, 151.51, 152.07, 152.62, 153.18, 153.74, 154.32, 154.88, 155.41, 155.99, 156.53, 157.11, 157.69, 158.24, 158.8,
  159.36, 159.85, 160.31,
];
const B = (i: number) => Math.round((BEATS[i] - START) * 30);
export const LIFT_FRAMES = Math.round((164.2 - START) * 30);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// the doorway, and the CB across the doors' seam
const DOOR = { x: 160, y: 400, w: 760, h: 1300 };
const MID = DOOR.x + DOOR.w / 2;
const CB_S = 0.93;
const CB_CY = 960;
const CB_T = `translate(${MID - 267 * CB_S} ${CB_CY - 225 * CB_S}) scale(${CB_S})`;
const LOGO_BOX = { left: MID - 267 * CB_S, top: CB_CY - 225 * CB_S, width: 534.25 * CB_S, height: 655.69 * CB_S };
const END_SCALE = 640 / LOGO_BOX.width;
const END_SHIFT = 960 - (LOGO_BOX.top + LOGO_BOX.height / 2);

// the floors: when the doors open and close (beats), what is behind them
const FLOORS = [
  { open: B(3), close: B(8), mark: "G", caps: "Ground floor", name: "Arrivals", clip: "hotels/rowton-hall/screen-time/dusk-4s.mp4" },
  { open: B(10), close: B(15), mark: "1", caps: "First floor", name: "The spa", clip: "hotels/rowton-hall/screen-time/pool-4s.mp4" },
  { open: B(17), close: B(22), mark: "2", caps: "Second floor", name: "Dinner", clip: "hotels/fairlawns/food-spread.mp4" },
  { open: B(24), close: B(29) + 6, mark: "3", caps: "Top floor", name: "Do not disturb", clip: "hotels/rutland-hall/screen-time/suite-4s.mp4" },
];
const OPEN_LEN = 13;
const GOLD = B(31);
const CHORD = B(32);

const openness = (f: number) =>
  Math.max(...FLOORS.map((fl) => progress(f, fl.open, OPEN_LEN, EASE_IN_OUT) * (1 - progress(f, fl.close, OPEN_LEN, EASE_IN_OUT))));
// the camera goes in through the doors as they part and comes back out as they close
const zoomAt = (f: number) =>
  1 + 0.42 * Math.max(...FLOORS.map((fl) => progress(f, fl.open + 2, 18, EASE_IN_OUT) * (1 - progress(f, fl.close - 10, 17, EASE_IN_OUT))));
// the dial's needle: at rest on a floor, travelling between the doors closing and the next bell
const ANGLES = [-60, -20, 20, 60];
const needleAt = (f: number) => {
  let a = ANGLES[0];
  for (let i = 1; i < FLOORS.length; i++) {
    const from = FLOORS[i - 1].close + 8;
    a += (ANGLES[i] - ANGLES[i - 1]) * progress(f, from, FLOORS[i].open - 5 - from, EASE_IN_OUT);
  }
  return a;
};

const Doors: React.FC<{ o: number; gold: number }> = ({ o, gold }) => {
  const slide = o * (DOOR.w / 2 + 6);
  const leaf = (side: -1 | 1) => {
    const x = side < 0 ? DOOR.x : MID;
    return (
      <g transform={`translate(${side * slide} 0)`}>
        <g clipPath={`url(#lift-${side < 0 ? "l" : "r"})`}>
          <rect x={x} y={DOOR.y} width={DOOR.w / 2} height={DOOR.h} fill="url(#lift-lacquer)" />
          {/* a fine brass inlay round each door */}
          <rect x={x + 26} y={DOOR.y + 30} width={DOOR.w / 2 - 52} height={DOOR.h - 60} fill="none" stroke="#c39e55" strokeOpacity={0.55} strokeWidth={2} />
          <rect x={x + 36} y={DOOR.y + 40} width={DOOR.w / 2 - 72} height={DOOR.h - 80} fill="none" stroke="#c39e55" strokeOpacity={0.22} strokeWidth={1} />
          {/* the CB inlaid across the seam: each door carries its half */}
          <g transform={CB_T}>
            <path d={CB_C} fill="url(#lift-brass)" />
            <path d={CB_B} fill="url(#lift-brass)" />
            <path d={CB_C} fill="#f6dc9a" opacity={gold * 0.7} />
            <path d={CB_B} fill="#f6dc9a" opacity={gold * 0.7} />
          </g>
          {/* the lacquer's sheen */}
          <rect x={x} y={DOOR.y} width={DOOR.w / 2} height={DOOR.h} fill="url(#lift-sheen)" opacity={0.5} />
        </g>
        {/* the door's leading edge */}
        <rect x={side < 0 ? MID - 3 : MID} y={DOOR.y} width={3} height={DOOR.h} fill="#000" opacity={0.6} />
      </g>
    );
  };
  return (
    <g clipPath="url(#lift-doorway)">
      {leaf(-1)}
      {leaf(1)}
    </g>
  );
};

const Dial: React.FC<{ frame: number }> = ({ frame }) => {
  const cx = MID;
  const cy = 346;
  const R = 176;
  const a = needleAt(frame);
  const pt = (deg: number, r: number) => [cx + r * Math.sin((deg * Math.PI) / 180), cy - r * Math.cos((deg * Math.PI) / 180)];
  const [x0, y0] = pt(-78, R);
  const [x1, y1] = pt(78, R);
  return (
    <g>
      <path d={`M${x0} ${y0} A${R} ${R} 0 0 1 ${x1} ${y1}`} fill="none" stroke="url(#lift-brass)" strokeWidth={5} strokeLinecap="round" />
      <path d={`M${pt(-78, R - 16)[0]} ${pt(-78, R - 16)[1]} A${R - 16} ${R - 16} 0 0 1 ${pt(78, R - 16)[0]} ${pt(78, R - 16)[1]}`} fill="none" stroke="#c39e55" strokeOpacity={0.35} strokeWidth={1.5} />
      {FLOORS.map((fl, i) => {
        const [tx, ty] = pt(ANGLES[i], R + 44);
        const [m0x, m0y] = pt(ANGLES[i], R - 16);
        const [m1x, m1y] = pt(ANGLES[i], R);
        const here = 1 - Math.min(1, Math.abs(a - ANGLES[i]) / 16);
        return (
          <g key={fl.mark}>
            <line x1={m0x} y1={m0y} x2={m1x} y2={m1y} stroke="#c39e55" strokeWidth={3} />
            <text x={tx} y={ty + 16} textAnchor="middle" fontFamily={serif} fontSize={58} fill={here > 0.5 ? "#f6dc9a" : "#a8894c"} opacity={0.6 + 0.4 * here}>
              {fl.mark}
            </text>
          </g>
        );
      })}
      <g transform={`rotate(${a} ${cx} ${cy})`}>
        <path d={`M${cx - 5} ${cy} L${cx} ${cy - R + 26} L${cx + 5} ${cy} Z`} fill="url(#lift-brass)" />
      </g>
      <circle cx={cx} cy={cy} r={13} fill="url(#lift-brass)" />
      <circle cx={cx} cy={cy} r={4} fill="#3b2f18" />
    </g>
  );
};

export const LiftCB: React.FC = () => {
  const frame = useCurrentFrame();
  const o = openness(frame);
  const z = zoomAt(frame);
  const gold = progress(frame, GOLD, 16, EASE_IN_OUT);
  const dark = progress(frame, CHORD - 4, 22, EASE_IN_OUT);
  const settle = progress(frame, CHORD + 14, 40, EASE_IN_OUT);
  const logo = progress(frame, CHORD + 34, 24, EASE_IN_OUT);
  const sweep = interpolate(frame, [CHORD + 62, CHORD + 92], [-60, 160], clamp);
  const hook = 1 - progress(frame, FLOORS[0].open - 8, 8);
  const current = FLOORS.find((fl) => frame >= fl.open - 2 && frame < fl.close + OPEN_LEN + 2);
  return (
    <AbsoluteFill style={{ backgroundColor: "#0c0b0a" }}>
      <Audio
        src={staticFile(MUSIC)}
        trimBefore={Math.round(START * 30)}
        volume={(f) => 0.55 * interpolate(f, [0, 8], [0, 1], clamp) * interpolate(f, [LIFT_FRAMES - 30, LIFT_FRAMES], [1, 0], clamp)}
      />
      {FLOORS.map((fl) => (
        <Sequence key={fl.mark} from={fl.open - 5} durationInFrames={45}>
          <Audio src={staticFile("stings/lift/ding.wav")} volume={0.52} />
        </Sequence>
      ))}
      <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: `${MID}px 1050px` }}>
        {/* what the doors open onto */}
        <div style={{ position: "absolute", left: DOOR.x, top: DOOR.y, width: DOOR.w, height: DOOR.h, overflow: "hidden", background: "#050505" }}>
          {current ? (
            <Sequence from={current.open - 2} durationInFrames={current.close + OPEN_LEN + 4 - current.open} layout="none">
              <OffthreadVideo src={staticFile(current.clip)} muted style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover" }} />
            </Sequence>
          ) : null}
          <AbsoluteFill style={{ boxShadow: "inset 0 0 90px rgba(0,0,0,0.55)" }} />
          <AbsoluteFill style={{ background: "linear-gradient(to top, rgba(9,9,10,0.86) 0%, rgba(9,9,10,0.62) 26%, rgba(9,9,10,0) 46%)" }} />
          {/* the floor, in the house label's order: gold caps with their underline, the name in cream Cormorant */}
          {current ? (
            <div
              style={{
                position: "absolute",
                left: 44,
                bottom: 250,
                opacity: progress(frame, current.open + 12, 12, EASE_OUT) * (1 - progress(frame, current.close - 12, 8)),
                transform: `translateY(${(1 - progress(frame, current.open + 12, 14, EASE_OUT)) * 16}px)`,
              }}
            >
              <div style={{ display: "inline-block" }}>
                <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 21, letterSpacing: "0.24em", textTransform: "uppercase", color: colors.gold }}>
                  {current.caps}
                </div>
                <div style={{ height: 2, background: colors.gold, marginTop: 8 }} />
              </div>
              <div style={{ fontFamily: serif, fontSize: 66, lineHeight: 1.05, color: colors.cream, marginTop: 12, textShadow: "0 2px 20px rgba(9,9,10,0.6)", whiteSpace: "nowrap" }}>
                {current.name}
              </div>
            </div>
          ) : null}
        </div>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <clipPath id="lift-doorway">
              <rect x={DOOR.x} y={DOOR.y} width={DOOR.w} height={DOOR.h} />
            </clipPath>
            <clipPath id="lift-l">
              <rect x={DOOR.x} y={DOOR.y} width={DOOR.w / 2} height={DOOR.h} />
            </clipPath>
            <clipPath id="lift-r">
              <rect x={MID} y={DOOR.y} width={DOOR.w / 2} height={DOOR.h} />
            </clipPath>
            <linearGradient id="lift-lacquer" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#181714" />
              <stop offset="0.5" stopColor="#0f0e0c" />
              <stop offset="1" stopColor="#171613" />
            </linearGradient>
            <linearGradient id="lift-sheen" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.42" stopColor="#fff" stopOpacity="0.07" />
              <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="lift-brass" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#e9cf8f" />
              <stop offset="0.5" stopColor="#c39e55" />
              <stop offset="1" stopColor="#8e6d33" />
            </linearGradient>
            <radialGradient id="lift-wall" cx="0.5" cy="0.42" r="0.75">
              <stop offset="0" stopColor="#2a2823" />
              <stop offset="0.6" stopColor="#1a1916" />
              <stop offset="1" stopColor="#0e0d0c" />
            </radialGradient>
            <radialGradient id="lift-lamp" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#f3d38c" stopOpacity="0.55" />
              <stop offset="1" stopColor="#f3d38c" stopOpacity="0" />
            </radialGradient>
          </defs>
          <Doors o={o} gold={gold} />
          {/* the wall round the doorway, panelled; the floor below */}
          <path d={`M0 0 H${W} V${H} H0 Z M${DOOR.x} ${DOOR.y} H${DOOR.x + DOOR.w} V${DOOR.y + DOOR.h} H${DOOR.x} Z`} fill="url(#lift-wall)" fillRule="evenodd" />
          {[60, 1020].map((x) => (
            <line key={x} x1={x} y1={470} x2={x} y2={1620} stroke="#c39e55" strokeOpacity={0.14} strokeWidth={1.5} />
          ))}
          <rect x={0} y={DOOR.y + DOOR.h} width={W} height={H - DOOR.y - DOOR.h} fill="#0a0a09" />
          <line x1={0} y1={DOOR.y + DOOR.h} x2={W} y2={DOOR.y + DOOR.h} stroke="#c39e55" strokeOpacity={0.3} strokeWidth={2} />
          {/* the light from the open doors on the floor */}
          <ellipse cx={MID} cy={DOOR.y + DOOR.h + 46} rx={360} ry={40} fill="#e2b765" opacity={0.22 * o} style={{ filter: "blur(22px)" }} />
          {/* the brass architrave */}
          <path
            d={`M${DOOR.x - 20} ${DOOR.y - 20} H${DOOR.x + DOOR.w + 20} V${DOOR.y + DOOR.h} H${DOOR.x + DOOR.w} V${DOOR.y} H${DOOR.x} V${DOOR.y + DOOR.h} H${DOOR.x - 20} Z`}
            fill="url(#lift-brass)"
          />
          <path d={`M${DOOR.x} ${DOOR.y + DOOR.h} V${DOOR.y} H${DOOR.x + DOOR.w} V${DOOR.y + DOOR.h}`} fill="none" stroke="#3b2f18" strokeWidth={2} />
          {/* two wall lights */}
          {[76, 1004].map((x) => (
            <g key={x}>
              <circle cx={x} cy={820} r={150} fill="url(#lift-lamp)" opacity={0.5} />
              <rect x={x - 9} y={800} width={18} height={46} rx={4} fill="url(#lift-brass)" />
            </g>
          ))}
          <Dial frame={frame} />
        </svg>
        {/* the hook, there from the first frame */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 1300,
            textAlign: "center",
            fontFamily: serif,
            fontStyle: "italic",
            fontSize: 104,
            color: colors.cream,
            opacity: hook,
            textShadow: "0 3px 24px rgba(0,0,0,0.7)",
          }}
        >
          Going up?
        </div>
      </AbsoluteFill>
      {/* the lift falls dark; the CB where it was on the doors becomes the logo, eases to the centre, the shimmer */}
      <AbsoluteFill style={{ backgroundColor: colors.black, opacity: dark }} />
      <div
        style={{
          position: "absolute",
          ...LOGO_BOX,
          transform: `translateY(${END_SHIFT * settle}px) scale(${1 + (END_SCALE - 1) * settle})`,
          transformOrigin: "50% 50%",
        }}
      >
        <Img src={staticFile("brand/cbh-logo-cb-only.svg")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: progress(frame, CHORD - 6, 10) }} />
        <Img src={staticFile("brand/cbh-logo-on-dark.svg")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: logo }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            WebkitMaskImage: `url(${staticFile("brand/cbh-logo-gold.svg")})`,
            maskImage: `url(${staticFile("brand/cbh-logo-gold.svg")})`,
            WebkitMaskSize: "100% 100%",
            maskSize: "100% 100%",
            background: `linear-gradient(110deg, transparent ${sweep - 25}%, rgba(255,246,220,0.95) ${sweep}%, transparent ${sweep + 25}%)`,
          }}
        />
      </div>
      <FilmFinish />
    </AbsoluteFill>
  );
};
