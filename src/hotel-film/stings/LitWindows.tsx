import { Audio } from "@remotion/media";
import { getLength, getPointAtLength } from "@remotion/paths";
import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { FilmFinish } from "../components/FilmFinish";
import { CB_B, CB_C } from "../sketch/cb-paths";
import { EASE_IN_OUT, EASE_OUT, progress } from "../theme";

// "The lights are on" (Scott, 15 Nov: more animations for TikTok "like the starry night", "do what you can do best";
// first snow was out: "there's not really snow in the UK"). The starry night's painted world and its figure in the
// charcoal coat and gold scarf, a second scene: they stand at the end of a drive on a clear night, looking across the
// lawn at a dark country house. Its windows light up gold one by one on the beat, slowly, then quicker; as the band
// stops the lights lift off the house and drift up into the sky, gathering along the CB's strokes; on the crash the
// CB flares gold, the front door opens and its light runs down the drive to their feet, and they give a small happy
// bob; then the logo takes the CB's place and the shimmer crosses, as the starry night. Our own drawing.

const W = 1080;
const H = 1920;
const FPS = 30;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// --- music and timeline: "Soul Funky Vibes" by soundoffreedom (Pixabay 578186, public/music/; only an
// AMC sample, in no posted film). Scott: Driving Ambition was "too much like supposed to be fun, not so
// seriously dramatic". 117.5 BPM (2.043s a bar); two stabs at 109.06/109.54s, then the band stops dead,
// a quiet pickup from 111.06s, and the whole band crashes back in at 112.06s. From 101.85s (five bars
// before the crash): the stars gather over the groove and settle as the band stops; the CB flares gold
// on the crash; the logo takes over two bars later and the shimmer lands two bars after that. ---
const MUSIC = "music/soundoffreedom-soul-funky-vibes-578186.mp3";
const MUSIC_FROM = 101.85;
const at = (sec: number) => Math.round((sec - MUSIC_FROM) * 30);
const IMPACT1 = at(112.06);
const IMPACT2 = at(116.15);
const IMPACT3 = at(120.23);
export const LIT_WINDOWS_FRAMES = at(122.3);
const BEAT = (60 / 117.5) * 30; // frames
const LOOK = 44;
const GATHER = 168;
const GLOW = IMPACT1 - 2;
const HAND = IMPACT2 - 8;
const BLACK = HAND + 30;
const SHIMMER = IMPACT3 - 2;

// --- the camera: a slow push in towards the figure's side of the frame, stopping at the hand-over ---
const ORIGIN = { x: 600, y: 1200 };
const zoomAt = (frame: number) =>
  1 + 0.045 * EASE_IN_OUT(Math.min(1, frame / BLACK));

// --- palette ---
const CREAM = "#f5efe3";

// --- the house: drawn in its own coordinates (base line y 1432, door at x 430), set on the lawn at HOUSE ---
const HOUSE = { cx: 360, base: 1436, k: 1.2 };
const hx = (x: number) => HOUSE.cx + (x - 430) * HOUSE.k;
const hy = (y: number) => HOUSE.base + (y - 1432) * HOUSE.k;
type Win = { x: number; y: number; w: number; h: number };
const WIN_RAW: Win[] = [
  ...[282, 332, 382, 430, 478, 528, 578].map((x) => ({ x, y: 1262, w: 26, h: 46 })), // first floor
  ...[282, 332, 382, 478, 528, 578].map((x) => ({ x, y: 1340, w: 26, h: 54 })), // ground floor, either side of the door
  { x: 310, y: 1182, w: 20, h: 28 },
  { x: 430, y: 1174, w: 20, h: 28 },
  { x: 550, y: 1182, w: 20, h: 28 }, // in the gables
  ...[178, 222, 638, 682].flatMap((x) => [
    { x, y: 1302, w: 22, h: 34 },
    { x, y: 1366, w: 22, h: 40 },
  ]), // the wings
];
// they light from the door outwards, a little out of order; one a beat, then two, then four, the last just before
// the band stops
const WINDOWS = WIN_RAW.map((w, i) => ({
  ...w,
  order: Math.hypot(w.x - 430, (w.y - 1400) * 1.4) + random(`lw-o-${i}`) * 70,
}))
  .sort((a, b) => a.order - b.order)
  .map((w, j) => {
    const beats = j < 4 ? 16 - j : j < 12 ? 12 - (j - 4) * 0.5 : 8 - (j - 12) * 0.25;
    return { ...w, lit: Math.round(IMPACT1 - beats * BEAT), sx: hx(w.x), sy: hy(w.y + w.h / 2) };
  });

// --- the CB in the sky ---
const S = 1.05;
const CB_CX = 540;
const CB_CY = 560;
const CB_T = `translate(${CB_CX - 267 * S} ${CB_CY - 225 * S}) scale(${S})`;
const toScreen = (x: number, y: number) =>
  [CB_CX + (x - 267) * S, CB_CY + (y - 225) * S] as const;
const STROKES = [
  "M340 74 C300 22 250 16 215 17 C150 18 100 62 90 140 C82 205 112 262 160 286 C178 294 190 297 198 298",
  "M258 158 L258 446",
  "M258 162 L350 162 C410 162 436 192 434 224 C432 262 402 290 330 294 L302 294",
  "M302 294 L352 294 C424 296 454 334 452 370 C450 418 410 446 352 446 L258 446",
];
let ci = 0;
const CB_STARS = STROKES.flatMap((d, si) => {
  const len = getLength(d);
  const n = Math.max(2, Math.round(len / 30));
  return Array.from({ length: n + 1 }, (_, k) => {
    const p = getPointAtLength(d, (len * k) / n) ?? { x: 0, y: 0 };
    const [tx, ty] = toScreen(p.x, p.y);
    const s = `ca-${si}-${k}`;
    const win = WINDOWS[(ci++ * 7) % WINDOWS.length]; // each light leaves from a window
    return {
      tx,
      ty,
      sx: win.sx + (random(`${s}-x`) - 0.5) * 14,
      sy: win.sy + (random(`${s}-y`) - 0.5) * 20,
      lit: win.lit,
      sway: (random(`${s}-s`) - 0.5) * 90,
      r: 1.6 + Math.pow(random(`${s}-r`), 2) * 2.4,
      ph: random(`${s}-p`) * 6.28,
      keep: random(`${s}-k`) > 0.78,
    };
  });
});

// --- the world ---
const HORIZON = 1418;
const MOON = { x: 214, y: 292 };
const FEET = { x: 838, y: 1660 };
const bankTop = (x: number) =>
  1600 -
  46 * Math.sin((x / W) * Math.PI * 0.95) -
  (x / W) * 60 +
  6 * Math.sin(x * 0.03);
const gust = (frame: number, x: number) =>
  Math.sin(frame * 0.05 + x * 0.011) * 0.7 +
  Math.sin(frame * 0.017 + x * 0.004) * 0.5;

const STARS = Array.from({ length: 170 }, (_, i) => ({
  x: random(`as-x-${i}`) * W,
  y: Math.pow(random(`as-y-${i}`), 1.3) * 1320,
  r: 0.5 + Math.pow(random(`as-r-${i}`), 3.4) * 2.0,
  a: 0.35 + random(`as-a-${i}`) * 0.6,
  sp: 0.04 + random(`as-sp-${i}`) * 0.09,
  ph: random(`as-ph-${i}`) * 6.28,
}));

const RIDGES = [
  {
    d: `M0 ${HORIZON - 150} C140 ${HORIZON - 214} 260 ${HORIZON - 236} 380 ${HORIZON - 186} C500 ${HORIZON - 140} 590 ${HORIZON - 132} 700 ${HORIZON - 168} C820 ${HORIZON - 208} 950 ${HORIZON - 222} 1080 ${HORIZON - 160}`,
    top: "#4c4335",
    bot: "#2c2721",
    blur: 1.6,
    drift: 0.25,
  },
  {
    d: `M0 ${HORIZON - 80} C130 ${HORIZON - 112} 240 ${HORIZON - 124} 350 ${HORIZON - 96} C470 ${HORIZON - 64} 600 ${HORIZON - 70} 730 ${HORIZON - 98} C850 ${HORIZON - 124} 970 ${HORIZON - 118} 1080 ${HORIZON - 84}`,
    top: "#2f2a23",
    bot: "#1e1b17",
    blur: 0.8,
    drift: 0.4,
  },
  {
    d: `M0 ${HORIZON - 26} C160 ${HORIZON - 50} 300 ${HORIZON - 40} 450 ${HORIZON - 22} C600 ${HORIZON - 6} 760 ${HORIZON - 34} 900 ${HORIZON - 42} C980 ${HORIZON - 46} 1040 ${HORIZON - 36} 1080 ${HORIZON - 30}`,
    top: "#1c1a16",
    bot: "#121110",
    blur: 0.4,
    drift: 0.55,
  },
];

const Defs: React.FC = () => (
  <defs>
    <linearGradient id="ca-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#050505" />
      <stop offset="0.38" stopColor="#0d0c0b" />
      <stop offset="0.72" stopColor="#1d1914" />
      <stop offset="0.93" stopColor="#3a2f20" />
      <stop offset="1" stopColor="#56442a" />
    </linearGradient>
    <radialGradient id="ca-moonglow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor="#efdcb2" stopOpacity="0.42" />
      <stop offset="0.3" stopColor="#d9bd84" stopOpacity="0.12" />
      <stop offset="1" stopColor="#c39e55" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="ca-star" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor="#fffaf0" stopOpacity="1" />
      <stop offset="0.35" stopColor="#f5ead2" stopOpacity="0.5" />
      <stop offset="1" stopColor="#ecd9a8" stopOpacity="0" />
    </radialGradient>
    <linearGradient id="ca-lake" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#2e261a" />
      <stop offset="0.3" stopColor="#15130f" />
      <stop offset="1" stopColor="#080707" />
    </linearGradient>
    <linearGradient id="ca-bank" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#1d1a15" />
      <stop offset="0.1" stopColor="#11100d" />
      <stop offset="1" stopColor="#060605" />
    </linearGradient>
    <linearGradient id="ca-blade" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stopColor="#0b0a08" />
      <stop offset="0.65" stopColor="#3a3326" />
      <stop offset="1" stopColor="#a8936a" />
    </linearGradient>
    {/* the coat: the moon on its left (upper left), falling off to the right */}
    <linearGradient id="ca-coat" x1="0" y1="0" x2="1" y2="0.1">
      <stop offset="0" stopColor="#2a2621" />
      <stop offset="0.2" stopColor="#141310" />
      <stop offset="1" stopColor="#0c0b0a" />
    </linearGradient>
    <linearGradient id="ca-jeans" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#151412" />
      <stop offset="1" stopColor="#090807" />
    </linearGradient>
    <linearGradient id="ca-scarf" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#e9cf8f" />
      <stop offset="0.5" stopColor="#c39e55" />
      <stop offset="1" stopColor="#8e6d33" />
    </linearGradient>
    <linearGradient id="ca-beanie" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#24211c" />
      <stop offset="1" stopColor="#0c0b0a" />
    </linearGradient>
    <linearGradient id="ca-cbfill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#f3dc9e" />
      <stop offset="0.5" stopColor="#d4af66" />
      <stop offset="1" stopColor="#b08d47" />
    </linearGradient>
    <radialGradient id="lw-spark" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor="#ffe9b0" stopOpacity="1" />
      <stop offset="0.35" stopColor="#f0c878" stopOpacity="0.5" />
      <stop offset="1" stopColor="#d9a94f" stopOpacity="0" />
    </radialGradient>
    <linearGradient id="lw-pane" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#fbe6ac" />
      <stop offset="1" stopColor="#dca850" />
    </linearGradient>
    <linearGradient id="lw-lawn" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#201d15" />
      <stop offset="0.25" stopColor="#13120e" />
      <stop offset="1" stopColor="#080807" />
    </linearGradient>
    <linearGradient id="lw-drive" gradientUnits="userSpaceOnUse" x1={HOUSE.cx} y1={HOUSE.base} x2={HOUSE.cx + 420} y2={HOUSE.base + 150}>
      <stop offset="0" stopColor="#f7d98c" stopOpacity="0.95" />
      <stop offset="0.5" stopColor="#e2b765" stopOpacity="0.5" />
      <stop offset="1" stopColor="#c39e55" stopOpacity="0.18" />
    </linearGradient>
    {/* a painted texture: soft noise laid over the illustration */}
    <filter id="ca-paint" x="0" y="0" width="100%" height="100%">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.012 0.05"
        numOctaves={3}
        seed={7}
      />
      <feColorMatrix type="saturate" values="0" />
    </filter>
  </defs>
);

const Sky: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    <rect x={0} y={0} width={W} height={HORIZON + 6} fill="url(#ca-sky)" />
    <circle cx={MOON.x} cy={MOON.y} r={560} fill="url(#ca-moonglow)" />
    {STARS.map((s, i) => {
      const tw = 0.6 + 0.4 * Math.sin(frame * s.sp + s.ph);
      return (
        <g key={i} opacity={s.a * tw}>
          <circle cx={s.x} cy={s.y} r={s.r * 2.8} fill="url(#ca-star)" />
          <circle cx={s.x} cy={s.y} r={s.r * 0.55} fill="#fffaf0" />
        </g>
      );
    })}
    {/* the crescent moon, a soft halo round it */}
    <circle
      cx={MOON.x}
      cy={MOON.y}
      r={58}
      fill="#f2e3c0"
      opacity={0.18}
      style={{ filter: "blur(14px)" }}
    />
    <mask id="ca-crescent">
      <circle cx={MOON.x} cy={MOON.y} r={34} fill="#fff" />
      <circle cx={MOON.x + 15} cy={MOON.y - 9} r={31} fill="#000" />
    </mask>
    <circle
      cx={MOON.x}
      cy={MOON.y}
      r={34}
      fill={CREAM}
      mask="url(#ca-crescent)"
    />
  </>
);

// the CB: the house's lights drifting up into its strokes, the flare and glow
const SkyCB: React.FC<{ frame: number }> = ({ frame }) => {
  const glow = progress(frame, GLOW, 12, EASE_IN_OUT);
  const flare = interpolate(frame, [GLOW, GLOW + 6, GLOW + 40], [0, 0.5, 0], clamp);
  const n = CB_STARS.length;
  return (
    <g>
      <g opacity={glow}>
        <g style={{ filter: "blur(36px)" }} opacity={0.45 + flare}>
          <path d={CB_C} transform={CB_T} fill="#d9b46a" />
          <path d={CB_B} transform={CB_T} fill="#d9b46a" />
        </g>
        <g style={{ filter: "blur(10px)" }} opacity={0.5}>
          <path d={CB_C} transform={CB_T} fill="#e8c780" />
          <path d={CB_B} transform={CB_T} fill="#e8c780" />
        </g>
        <path d={CB_C} transform={CB_T} fill="url(#ca-cbfill)" opacity={0.9} />
        <path d={CB_B} transform={CB_T} fill="url(#ca-cbfill)" opacity={0.9} />
      </g>
      {CB_STARS.map((s, i) => {
        const from = Math.max(GATHER + (i / n) * 72, s.lit + 12);
        if (frame < from) return null;
        const p = progress(frame, from, 62, EASE_IN_OUT);
        // up and across in a soft arc, swaying a little, like a lantern let go
        const arc = Math.sin(p * Math.PI);
        const x = s.sx + (s.tx - s.sx) * p + arc * s.sway;
        const y = s.sy + (s.ty - s.sy) * p - arc * 50;
        const tw = 0.75 + 0.25 * Math.sin(frame * 0.09 + s.ph);
        const r = s.r * (1.1 + 0.3 * p);
        return (
          <g key={i} opacity={Math.min(1, (frame - from) / 6) * tw * (s.keep ? 1 : 1 - glow * 0.85)}>
            <circle cx={x} cy={y} r={r * 4.2} fill="url(#lw-spark)" />
            <circle cx={x} cy={y} r={r * 0.7} fill="#fff1cc" />
          </g>
        );
      })}
    </g>
  );
};

const Ridges: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    <defs>
      {RIDGES.map((r, i) => (
        <linearGradient
          key={i}
          id={`ca-ridge-${i}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0" stopColor={r.top} />
          <stop offset="1" stopColor={r.bot} />
        </linearGradient>
      ))}
    </defs>
    {RIDGES.map((r, i) => (
      <g
        key={i}
        transform={`translate(${-frame * 0.05 * r.drift} 0)`}
        style={{ filter: `blur(${r.blur}px)` }}
      >
        <path
          d={`${r.d} L1100 ${HORIZON + 6} L-20 ${HORIZON + 6} Z`}
          fill={`url(#ca-ridge-${i})`}
        />
        <path
          d={r.d}
          fill="none"
          stroke="#e8d3a6"
          strokeOpacity={0.14 - i * 0.04}
          strokeWidth={2}
        />
      </g>
    ))}
    {/* the haze where the hills meet the water */}
    <rect
      x={0}
      y={HORIZON - 70}
      width={W}
      height={84}
      fill="#6b5a3e"
      opacity={0.18}
      style={{ filter: "blur(22px)" }}
    />
  </>
);

// the trees either side of the house, the lawn, the drive from the door down to the bank
const Lawn: React.FC<{ frame: number }> = ({ frame }) => {
  const lit = WINDOWS.filter((w) => frame >= w.lit).length / WINDOWS.length;
  const door = progress(frame, IMPACT1 - 2, 14, EASE_OUT);
  const dx = HOUSE.cx;
  const dy = HOUSE.base;
  const drive = `M${dx - 16} ${dy} C${dx + 6} ${dy + 34} ${dx + 150} ${dy + 62} ${dx + 262} ${dy + 150} L${dx + 520} ${dy + 150} C${dx + 290} ${dy + 60} ${dx + 70} ${dy + 26} ${dx + 18} ${dy} Z`;
  return (
    <>
      {[
        [-20, 1420, 74], [52, 1384, 66], [128, 1408, 50],
        [760, 1398, 56], [846, 1372, 78], [948, 1398, 64], [1046, 1380, 76],
      ].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#0b0b09" />
      ))}
      <rect x={0} y={HORIZON - 2} width={W} height={H - HORIZON} fill="url(#lw-lawn)" />
      <ellipse cx={540} cy={HORIZON + 8} rx={720} ry={22} fill="#f2e3c0" opacity={0.05} style={{ filter: "blur(12px)" }} />
      {/* the windows' light on the lawn, growing as they come on */}
      <ellipse cx={dx} cy={dy + 22} rx={340} ry={30} fill="#e2b765" opacity={0.2 * lit} style={{ filter: "blur(20px)" }} />
      <path d={drive} fill="#2b261b" opacity={0.75} />
      {/* the door's light running down the drive */}
      <path d={drive} fill="url(#lw-drive)" opacity={door * 0.85} />
    </>
  );
};

const House: React.FC<{ frame: number }> = ({ frame }) => {
  const door = progress(frame, IMPACT1 - 2, 14, EASE_OUT);
  return (
    <g transform={`translate(${HOUSE.cx} ${HOUSE.base}) scale(${HOUSE.k}) translate(-430 -1432)`}>
      {/* chimneys, roofs, gables, the centre and its wings: one dark shape against the hills */}
      <g fill="#0c0b0a">
        {[[330, 1112, 22, 96], [508, 1112, 22, 96], [188, 1212, 18, 44], [664, 1212, 18, 44]].map(([x, y, w, h], i) => (
          <g key={i}>
            <rect x={x} y={y} width={w} height={h} />
            <rect x={x - 3} y={y - 5} width={w + 6} height={6} />
          </g>
        ))}
        <path d="M144 1282 L160 1252 L250 1252 L250 1282 Z" />
        <path d="M610 1282 L610 1252 L700 1252 L716 1282 Z" />
        <rect x={150} y={1280} width={100} height={152} />
        <rect x={610} y={1280} width={100} height={152} />
        <path d="M244 1224 L262 1186 L598 1186 L616 1224 Z" />
        <path d="M250 1224 L310 1150 L370 1224 Z" />
        <path d="M370 1224 L430 1140 L490 1224 Z" />
        <path d="M490 1224 L550 1150 L610 1224 Z" />
        <rect x={250} y={1222} width={360} height={210} />
        <rect x={400} y={1430} width={60} height={5} fill="#1a1814" />
      </g>
      {/* the moon on its left edges */}
      <path
        d="M250 1224 L310 1150 M370 1224 L430 1140 M490 1224 L550 1150 M150 1432 L150 1282 L160 1252 M330 1208 L330 1112"
        fill="none"
        stroke="#e8d3a6"
        strokeOpacity={0.3}
        strokeWidth={1.3}
        strokeLinecap="round"
      />
      {WINDOWS.map((w, i) => {
        const on = progress(frame, w.lit, 9, EASE_OUT);
        const flick = 0.9 + 0.1 * Math.sin(frame * 0.21 + i * 1.7);
        return (
          <g key={i}>
            <rect x={w.x - w.w / 2} y={w.y} width={w.w} height={w.h} fill="#1b1a17" />
            {on > 0 ? (
              <>
                <rect x={w.x - w.w / 2 - 6} y={w.y - 6} width={w.w + 12} height={w.h + 12} fill="#e8b65c" opacity={0.5 * on * flick} style={{ filter: "blur(7px)" }} />
                <rect x={w.x - w.w / 2} y={w.y} width={w.w} height={w.h} fill="url(#lw-pane)" opacity={on * flick} />
              </>
            ) : null}
            {/* glazing bars */}
            <path
              d={`M${w.x} ${w.y} V${w.y + w.h} M${w.x - w.w / 2} ${w.y + w.h * 0.45} H${w.x + w.w / 2}`}
              stroke="#0c0b0a"
              strokeWidth={1.6}
              fill="none"
            />
          </g>
        );
      })}
      {/* the front door: dark, then open on the crash */}
      <path d="M414 1432 V1388 Q430 1366 446 1388 V1432 Z" fill="#161411" />
      {door > 0 ? (
        <>
          <ellipse cx={430} cy={1404} rx={46} ry={56} fill="#f0c36a" opacity={0.55 * door} style={{ filter: "blur(14px)" }} />
          <path d="M414 1432 V1388 Q430 1366 446 1388 V1432 Z" fill="url(#lw-pane)" opacity={door} />
        </>
      ) : null}
    </g>
  );
};

const Bank: React.FC<{ frame: number }> = ({ frame }) => {
  const pts = Array.from({ length: 46 }, (_, i) => (i / 45) * W);
  const edge = pts.map((x) => `L${x} ${bankTop(x)}`).join(" ");
  return (
    <>
      <path
        d={`M0 ${H} L0 ${bankTop(0)} ${edge} L${W} ${H} Z`}
        fill="url(#ca-bank)"
      />
      <path
        d={`M0 ${bankTop(0)} ${edge}`}
        fill="none"
        stroke="#bfa676"
        strokeOpacity={0.22}
        strokeWidth={2}
      />
      {Array.from({ length: 200 }, (_, i) => {
        const x = random(`ab-x-${i}`) * W;
        const base = bankTop(x) + 6 + Math.pow(random(`ab-d-${i}`), 0.7) * 60;
        const h = 16 + Math.pow(random(`ab-h-${i}`), 2) * 56;
        const sway = gust(frame, x) * (5 + h * 0.15) + 4;
        const lean = (random(`ab-l-${i}`) - 0.5) * 16;
        const w = 0.7 + random(`ab-w-${i}`) * 0.9;
        return (
          <path
            key={i}
            d={`M${x - w} ${base} Q${x + lean * 0.5} ${base - h * 0.6} ${x + lean + sway} ${base - h} Q${x + lean * 0.5 + w * 0.3} ${base - h * 0.55} ${x + w} ${base} Z`}
            fill="url(#ca-blade)"
            opacity={0.55 + 0.35 * random(`ab-o-${i}`)}
          />
        );
      })}
    </>
  );
};

// --- the figure ---
const Figure: React.FC<{ frame: number }> = ({ frame }) => {
  const up = progress(frame, LOOK, 40, EASE_IN_OUT);
  const breathe = Math.sin((frame / FPS) * 2.1);
  const wind = gust(frame, 700);
  const hem = wind * 4 + Math.sin(frame * 0.09) * 1.5;
  const tail = (k: number) =>
    Math.sin(frame * 0.15 - k * 0.9) * (3 + k * 3.5) + wind * (3 + k * 5);
  // the head: down at first, across to the house as its windows come on
  const sky = progress(frame, GATHER + 24, 50, EASE_IN_OUT); // then up, after the lights
  const headRot = 9 * (1 - up) - 8 * up * (1 - sky) - 21 * sky + Math.sin(frame * 0.03) * 1.2;
  // a small happy bob on the band's crash, settling
  const bob = interpolate(
    frame,
    [IMPACT1 - 1, IMPACT1 + 4, IMPACT1 + 12, IMPACT1 + 20],
    [0, -9, 2, 0],
    clamp,
  );
  return (
    <g transform={`translate(${FEET.x} ${FEET.y + bob})`}>
      {/* shadow on the grass */}
      <ellipse
        cx={12}
        cy={4}
        rx={92}
        ry={14}
        fill="#030303"
        opacity={0.6}
        style={{ filter: "blur(4px)" }}
      />
      {/* legs and boots */}
      <path
        d="M-46 -176 C-48 -120 -50 -60 -48 -18 L-20 -18 C-18 -60 -14 -120 -8 -172 Z"
        fill="url(#ca-jeans)"
      />
      <path
        d="M8 -172 C14 -120 18 -60 20 -18 L48 -18 C50 -60 48 -120 46 -176 Z"
        fill="url(#ca-jeans)"
      />
      <path
        d="M-56 -22 C-56 -32 -48 -36 -20 -34 C-14 -30 -12 -14 -14 2 L-58 2 C-62 -6 -60 -16 -56 -22 Z"
        fill="#070606"
      />
      <path
        d="M14 -34 C40 -36 52 -30 54 -22 C60 -14 60 -6 58 2 L14 2 C12 -12 12 -26 14 -34 Z"
        fill="#070606"
      />
      {/* the coat: an A-line, breathing, its hem moving */}
      <g transform={`translate(0 ${-breathe * 1})`}>
        <path
          d={`M-74 -462 C-90 -440 -96 -380 -100 -300 C-103 -240 ${-106 + hem * 0.4} -200 ${-112 + hem * 0.6} -166 C-60 ${-154 + hem * 0.2} 60 ${-154 + hem * 0.3} ${112 + hem} -168 C106 -210 102 -262 98 -312 C94 -380 90 -440 76 -462 C42 -480 -42 -480 -74 -462 Z`}
          fill="url(#ca-coat)"
        />
        {/* the moon's rim down the left edge, the back vent, a soft fold */}
        <path
          d={`M-74 -460 C-90 -438 -96 -380 -100 -300 C-103 -240 ${-106 + hem * 0.4} -200 ${-112 + hem * 0.6} -166`}
          fill="none"
          stroke="#e8d3a6"
          strokeOpacity={0.6}
          strokeWidth={1.8}
          strokeLinecap="round"
        />
        {/* the right arm down the coat's side, its hand in the pocket too */}
        <path
          d="M70 -455 C98 -420 108 -344 104 -272 C102 -242 96 -228 86 -226 C80 -238 78 -262 78 -300 C76 -362 70 -412 56 -440 Z"
          fill="#0e0d0c"
        />
        {/* the left arm down the coat's side, the hand in the pocket */}
        <path
          d="M-70 -455 C-98 -420 -108 -344 -104 -272 C-102 -242 -96 -228 -86 -226 C-80 -238 -78 -262 -78 -300 C-76 -362 -70 -412 -56 -440 Z"
          fill="url(#ca-coat)"
        />
        <path
          d="M-72 -452 C-98 -418 -106 -344 -102 -272"
          fill="none"
          stroke="#e8d3a6"
          strokeOpacity={0.55}
          strokeWidth={1.6}
          strokeLinecap="round"
        />
      </g>
      {/* the gold scarf: wrapped at the neck, its tail lifting in the wind */}
      <path
        d={`M-40 -464 C${-50 + tail(0)} -432 ${-56 + tail(1)} -400 ${-54 + tail(2)} -368 L${-34 + tail(2)} -362 C${-34 + tail(1)} -396 ${-28 + tail(0)} -430 -20 -462 Z`}
        fill="url(#ca-scarf)"
      />
      <path
        d="M-44 -480 C-22 -496 24 -496 46 -480 C48 -468 44 -458 36 -456 C14 -466 -14 -466 -38 -456 C-46 -460 -46 -470 -44 -480 Z"
        fill="url(#ca-scarf)"
      />
      {/* the head, from the water up to the sky */}
      <g transform={`translate(2 ${-494 - breathe * 1}) rotate(${headRot})`}>
        {/* one silhouette: neck, head, a beanie; the moon's line on the left */}
        <path d="M-16 6 L16 6 L14 -14 L-14 -14 Z" fill="#0f0e0c" />
        <ellipse cx={0} cy={-48} rx={40} ry={45} fill="#0f0e0c" />
        <path
          d="M-43 -56 C-46 -110 46 -112 44 -58 C24 -64 -24 -64 -43 -56 Z"
          fill="url(#ca-beanie)"
        />
        <path
          d="M-41 -40 C-46 -70 -40 -102 -6 -110"
          fill="none"
          stroke="#e8d3a6"
          strokeOpacity={0.6}
          strokeWidth={1.6}
          strokeLinecap="round"
        />
      </g>
    </g>
  );
};

// a fine painted texture over everything
const Paint: React.FC = () => (
  <rect
    x={0}
    y={0}
    width={W}
    height={H}
    filter="url(#ca-paint)"
    opacity={0.07}
    style={{ mixBlendMode: "soft-light" }}
  />
);

// --- the hand-over to the official logo ---
const LOGO_W = 640;
const LOGO_K = LOGO_W / 534.25;
const LOGO_END = {
  k: LOGO_K,
  left: (W - LOGO_W) / 2,
  top: (H - 655.69 * LOGO_K) / 2,
};
const Logo: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < HAND) return null;
  // where the sky's CB is on screen at the hand-over (the sky doesn't drift, only the push)
  const z = zoomAt(HAND);
  const from = {
    k: S * z,
    left: ORIGIN.x + (CB_CX - 267 * S - ORIGIN.x) * z,
    top: ORIGIN.y + (CB_CY - 225 * S - ORIGIN.y) * z,
  };
  const m = progress(frame, BLACK - 4, 54, EASE_IN_OUT);
  const k = from.k + (LOGO_END.k - from.k) * m;
  const left = from.left + (LOGO_END.left - from.left) * m;
  const top = from.top + (LOGO_END.top - from.top) * m;
  const cb = progress(frame, HAND, 8, EASE_IN_OUT);
  const word = progress(frame, BLACK - 6, 26, EASE_IN_OUT);
  const sweep = interpolate(frame, [SHIMMER, SHIMMER + 30], [-60, 160], clamp);
  const box: React.CSSProperties = {
    position: "absolute",
    left,
    top,
    width: 534.25 * k,
    height: 655.69 * k,
  };
  return (
    <>
      <Img
        src={staticFile("brand/cbh-logo-cb-only.svg")}
        style={{ ...box, opacity: cb * (1 - word) }}
      />
      <Img
        src={staticFile("brand/cbh-logo-on-dark.svg")}
        style={{ ...box, opacity: word }}
      />
      <div
        style={{
          ...box,
          WebkitMaskImage: `url(${staticFile("brand/cbh-logo-gold.svg")})`,
          maskImage: `url(${staticFile("brand/cbh-logo-gold.svg")})`,
          WebkitMaskSize: "100% 100%",
          maskSize: "100% 100%",
          background: `linear-gradient(110deg, transparent ${sweep - 25}%, rgba(255,246,220,0.95) ${sweep}%, transparent ${sweep + 25}%)`,
        }}
      />
    </>
  );
};

export const LitWindows: React.FC = () => {
  const frame = useCurrentFrame();
  const fade = progress(frame, 0, 30, EASE_IN_OUT);
  const dark = progress(frame, HAND + 4, BLACK - HAND - 4, EASE_IN_OUT);
  const z = zoomAt(frame);
  const total = LIT_WINDOWS_FRAMES;
  return (
    <AbsoluteFill style={{ backgroundColor: "#09090a" }}>
      <Audio
        src={staticFile(MUSIC)}
        trimBefore={Math.round(MUSIC_FROM * FPS)}
        volume={(f) =>
          0.62 * // ~-15.5 LUFS
          interpolate(f, [0, 12], [0, 1], clamp) *
          interpolate(f, [total - 36, total], [1, 0], clamp)
        }
      />
      {frame < BLACK + 2 ? (
        <AbsoluteFill
          style={{
            opacity: fade,
            transform: `scale(${z})`,
            transformOrigin: `${ORIGIN.x}px ${ORIGIN.y}px`,
          }}
        >
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
            <Defs />
            <Sky frame={frame} />
            <Ridges frame={frame} />
            <Lawn frame={frame} />
            <House frame={frame} />
            <SkyCB frame={frame} />
            <g transform={`translate(${-frame * 0.05} 0)`}>
              <Bank frame={frame} />
              <Figure frame={frame} />
            </g>
            <Paint />
          </svg>
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill style={{ backgroundColor: "#09090a", opacity: dark }} />
      <Logo frame={frame} />
      <FilmFinish />
    </AbsoluteFill>
  );
};
