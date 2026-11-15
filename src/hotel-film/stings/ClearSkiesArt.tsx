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

// "Clear skies", the illustrated version (Scott, 1 Nov, after the 3D one: "it looks cool but the graphics
// style can be seen as gimmicky ... less 3D and more art style like the original", "weird round
// polygons"). A painted night in CBH's colours: black and charcoal sky warming to a low gold glow, a
// cream moon upper left, hazy charcoal ridges, a dark lake with the moon's glints, a bank of gold-tipped
// grass moving in the wind, a fine grain over it all. The figure is drawn, not modelled: a smooth A-line
// coat, a gold scarf whose tail lifts in the wind, a beanie; the moon rims their left edges in cream;
// hands in the coat pockets. They look out over the water, then up at a shooting star; the stars gather
// along the CB's strokes over the music's build; the CB flares gold on the first impact (gold glints on
// the water under it) and they give a small happy bob; on the second impact the scene falls away and the official logo takes the CB's place
// exactly, easing to the centre; the shimmer on the third. Our own drawing, not the weather app's art.

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
export const CLEAR_SKIES_ART_FRAMES = at(122.3);
const SHOOT = 70;
const LOOK = 64;
const GATHER = 128;
const LINES = IMPACT1 - 78;
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
const STROKE_LENS = STROKES.map((d) => getLength(d));
const CB_STARS = STROKES.flatMap((d, si) => {
  const len = getLength(d);
  const n = Math.max(2, Math.round(len / 36));
  return Array.from({ length: n + 1 }, (_, k) => {
    const p = getPointAtLength(d, (len * k) / n) ?? { x: 0, y: 0 };
    const [tx, ty] = toScreen(p.x, p.y);
    const s = `ca-${si}-${k}`;
    return {
      tx,
      ty,
      sx: 80 + random(`${s}-x`) * 920,
      sy: 80 + random(`${s}-y`) * 1000,
      r: 1.6 + Math.pow(random(`${s}-r`), 2) * 2.4,
      ph: random(`${s}-p`) * 6.28,
      keep: random(`${s}-k`) > 0.78,
    };
  });
});

// --- the world ---
const HORIZON = 1418;
const MOON = { x: 214, y: 292 };
const FEET = { x: 712, y: 1660 };
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

const ShootingStar: React.FC<{ frame: number }> = ({ frame }) => {
  const p = interpolate(frame, [SHOOT, SHOOT + 24], [0, 1], clamp);
  if (p <= 0 || p >= 1) return null;
  const [x0, y0, x1, y1] = [900, 140, 420, 430];
  const e = EASE_OUT(p);
  const hx = x0 + (x1 - x0) * e;
  const hy = y0 + (y1 - y0) * e;
  const tx = hx - (x1 - x0) * 0.24;
  const ty = hy - (y1 - y0) * 0.24;
  const o = Math.sin(p * Math.PI);
  return (
    <>
      <defs>
        <linearGradient
          id="ca-shoot"
          x1={tx}
          y1={ty}
          x2={hx}
          y2={hy}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#fff6e0" stopOpacity="0" />
          <stop offset="1" stopColor="#fff6e0" stopOpacity={o} />
        </linearGradient>
      </defs>
      <line
        x1={tx}
        y1={ty}
        x2={hx}
        y2={hy}
        stroke="url(#ca-shoot)"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <circle cx={hx} cy={hy} r={3.4} fill="#fffaf0" opacity={o} />
      <circle cx={hx} cy={hy} r={14} fill="url(#ca-star)" opacity={o} />
    </>
  );
};

// the CB: its stars drifting into the strokes, gold lines, the flare and glow, the shimmer
const SkyCB: React.FC<{ frame: number }> = ({ frame }) => {
  const glow = progress(frame, GLOW, 12, EASE_IN_OUT);
  const flare = interpolate(
    frame,
    [GLOW, GLOW + 6, GLOW + 40],
    [0, 0.5, 0],
    clamp,
  );
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
      <g transform={CB_T} opacity={1 - glow * 0.85}>
        {STROKES.map((d, i) => {
          const p = progress(frame, LINES + i * 14, 36, EASE_IN_OUT);
          const len = STROKE_LENS[i];
          return (
            <path
              key={i}
              d={d}
              fill="none"
              stroke="#ecd49a"
              strokeOpacity={0.45}
              strokeWidth={1.1 / S}
              strokeLinecap="round"
              strokeDasharray={len}
              strokeDashoffset={len * (1 - p)}
            />
          );
        })}
      </g>
      {CB_STARS.map((s, i) => {
        const from = GATHER + (i / n) * 72;
        const p = progress(frame, from, 62, EASE_IN_OUT);
        const x = s.sx + (s.tx - s.sx) * p;
        const y = s.sy + (s.ty - s.sy) * p;
        const tw = 0.7 + 0.3 * Math.sin(frame * 0.09 + s.ph);
        const warm = progress(frame, from + 40, 30);
        const r = s.r * (0.7 + 0.5 * p);
        return (
          <g
            key={i}
            opacity={(0.6 + 0.4 * p) * tw * (s.keep ? 1 : 1 - glow * 0.85)}
          >
            <circle cx={x} cy={y} r={r * 3.4} fill="url(#ca-star)" />
            <circle
              cx={x}
              cy={y}
              r={r * 0.6}
              fill={warm > 0.5 ? "#ffe9b8" : "#fffaf0"}
            />
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

const Lake: React.FC<{ frame: number }> = ({ frame }) => {
  const g = progress(frame, GLOW + 4, 24);
  const glint = (
    key: string,
    cx: number,
    i: number,
    col: string,
    amt: number,
    spread: number,
  ) => {
    const t = Math.pow(random(`${key}-t-${i}`), 1.3);
    const y = HORIZON + 4 + t * 190;
    const w = 8 + random(`${key}-w-${i}`) * 40 * (0.4 + t);
    const x =
      cx +
      (random(`${key}-x-${i}`) - 0.5) * (spread + t * spread * 2.2) +
      Math.sin(frame * 0.07 + i * 2.1) * (3 + t * 8);
    const tw = Math.max(
      0,
      Math.sin(
        (frame / FPS) * (2 + random(`${key}-v-${i}`) * 3) +
          random(`${key}-p-${i}`) * 6.28,
      ),
    );
    return (
      <rect
        key={`${key}${i}`}
        x={x - w / 2}
        y={y}
        width={w}
        height={1.3 + t * 2.2}
        rx={1}
        fill={col}
        opacity={amt * tw * (1 - t * 0.5)}
      />
    );
  };
  return (
    <>
      <rect
        x={0}
        y={HORIZON}
        width={W}
        height={H - HORIZON}
        fill="url(#ca-lake)"
      />
      {/* the ridges in the water, softened */}
      <g
        transform={`translate(0 ${HORIZON * 2}) scale(1 -1)`}
        opacity={0.55}
        style={{ filter: "blur(3px)" }}
      >
        {RIDGES.slice(1).map((r, i) => (
          <path
            key={i}
            d={`${r.d} L1100 ${HORIZON + 6} L-20 ${HORIZON + 6} Z`}
            fill={r.bot}
          />
        ))}
      </g>
      {Array.from({ length: 40 }, (_, i) =>
        glint("mg", MOON.x, i, "#f2e6c8", 0.75, 30),
      )}
      {g > 0
        ? Array.from({ length: 46 }, (_, i) =>
            glint("cg", CB_CX, i, "#e8c27a", 0.9 * g, 50),
          )
        : null}
      {/* faint ripples */}
      {Array.from({ length: 30 }, (_, i) => {
        const y = HORIZON + 10 + Math.pow(i / 30, 1.3) * 200;
        const x =
          ((random(`rp-${i}`) * 1300 + frame * (0.4 + random(`rpv-${i}`))) %
            1300) -
          110;
        return (
          <rect
            key={`r${i}`}
            x={x}
            y={y}
            width={60 + random(`rpw-${i}`) * 200}
            height={1.2}
            rx={1}
            fill="#cdb98e"
            opacity={0.06}
          />
        );
      })}
    </>
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
  // the head: down to the water at first, up to the sky with the shooting star
  const headRot = 9 * (1 - up) - 22 * up + Math.sin(frame * 0.03) * 1.2;
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

export const ClearSkiesArt: React.FC = () => {
  const frame = useCurrentFrame();
  const fade = progress(frame, 0, 30, EASE_IN_OUT);
  const dark = progress(frame, HAND + 4, BLACK - HAND - 4, EASE_IN_OUT);
  const z = zoomAt(frame);
  const total = CLEAR_SKIES_ART_FRAMES;
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
            <ShootingStar frame={frame} />
            <SkyCB frame={frame} />
            <Ridges frame={frame} />
            <Lake frame={frame} />
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
