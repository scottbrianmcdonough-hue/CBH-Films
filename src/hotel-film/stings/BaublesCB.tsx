import { Audio } from "@remotion/media";
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
import { colors, EASE_IN_OUT, EASE_OUT, progress, serif } from "../theme";

// "Merry Christmas", baubles (Scott, 31 Oct: "the lights with baubles and CB in the middle then move to CB and the
// lights brighten", "with baubles and depth and multicoloured lights"; not the fairy-light string CB another session
// made, cbh-christmas-cb). Glossy baubles hang on their threads at every depth among multicoloured fairy lights, the
// near ones soft, the gold CB hanging in the middle like an ornament; the camera drifts forward through them (real
// perspective: near things pass bigger and faster) and slows into the CB as the band stops; in the hush the lights
// dim, a tap twinkles them, and as the band comes back they brighten and bloom; the CB is already at the logo's
// place, the wordmark comes up round it, "Merry Christmas" above, the shimmer crosses.
// The hotels (Scott: "got to make it relate to CB somehow", "or hotels"): every bauble reflects one of the
// collection at Christmas (the festive reel's graded photos), the picture darkening into the bauble's own colour
// towards its rim under the gloss, so it reads as a reflection in glass; the collection hangs on the tree round the
// CB.
// Music: Christmas Jazz (Tunetank; the festive reel used 14.1-37s, the fairy-light CB its ending from 53.8s) from
// 33.30s: the band stops at 43.20s, a tap at 43.80s, back in full at 44.25s.

const W = 1080;
const H = 1920;
const F = 1000; // focal length, px
const MUSIC = "campaigns/festive/christmas-jazz.mp3";
const MUSIC_FROM = 33.3;
const at = (s: number) => Math.round((s - MUSIC_FROM) * 30);
const STOP = at(43.2);
const TAP = at(43.8);
const HIT = at(44.25);
export const BAUBLES_CB_FRAMES = at(48.3);

// The CB hangs at world z = ZC; the camera travels TRAVEL towards it, ending D_END from it, where the logo box (the
// logo's own frame, the CB-only svg drawn in it) is exactly the brand moments' 640px logo, centred.
const ZC = 1600 + 700;
const TRAVEL = 1600;
const D_END = 700;
const LOGO_W = 640;
const LOGO_H = (LOGO_W * 655.69) / 534.25;
const BOX_W = (LOGO_W * D_END) / F; // world units
const BOX_H = (LOGO_H * D_END) / F;

const PALETTE = [
  "#ff4a3d",
  "#ffb43a",
  "#40d672",
  "#4a8dff",
  "#ff62c8",
  "#fff0c4",
  "#fff0c4",
];
const BAUBLE_COLOURS: [string, string, string][] = [
  ["#f2a39b", "#9b1c1c", "#3a0909"], // red
  ["#f7e3b0", "#c39e55", "#4f3a14"], // gold
  ["#9fd4b4", "#1f5a3c", "#0a2116"], // green
  ["#a9b9e8", "#22356a", "#0a1230"], // midnight blue
  ["#f6ead6", "#b7a68c", "#3d342a"], // champagne
];

type Light = {
  x: number;
  y: number;
  z: number;
  c: string;
  tw: number;
  s: number;
};
const LIGHTS: Light[] = Array.from({ length: 230 }, (_, i) => ({
  x: (random(`lx${i}`) - 0.5) * 5200,
  y: (random(`ly${i}`) - 0.62) * 4600,
  z: 300 + random(`lz${i}`) * 6200,
  c: PALETTE[Math.floor(random(`lc${i}`) * PALETTE.length)],
  tw: random(`lt${i}`) * 6.28,
  s: 0.7 + random(`ls${i}`) * 0.6,
}));

const HOTELS = [
  "hintlesham-hall-exterior",
  "hogarths-entrance",
  "rowton-hall-mantel",
  "langshott-manor-nutcracker",
  "barnett-hill-staircase",
  "oakley-hall-exterior",
  "nailcote-hall-snow",
  "fairlawns-afternoon-tea",
  "low-wood-bay-columns",
  "donnington-santa",
  "hogarths-chef",
  "fairlawns-crackers",
].map((n) => staticFile(`campaigns/festive/graded/${n}.jpg`));

type Bauble = {
  photo: string;
  x: number;
  y: number;
  z: number;
  r: number;
  col: number;
  ph: number;
  amp: number;
};
const BAUBLES: Bauble[] = (() => {
  const out: Bauble[] = [];
  for (let i = 0; out.length < 34 && i < 400; i++) {
    const z = 450 + random(`bz${i}`) * 4200;
    const x = (random(`bx${i}`) - 0.5) * 3000;
    const yy = -1300 + random(`by${i}`) * 2100;
    // keep the way to the CB clear: nothing in front of it near the middle
    if (z < ZC + 300 && Math.abs(x) < 480 && Math.abs(yy) < 620) continue;
    out.push({
      photo: HOTELS[out.length % HOTELS.length],
      x,
      y: yy,
      z,
      r: 90 + random(`br${i}`) * 90,
      col: Math.floor(random(`bc${i}`) * BAUBLE_COLOURS.length),
      ph: random(`bp${i}`) * 6.28,
      amp: 0.02 + random(`ba${i}`) * 0.03,
    });
  }
  return out.sort((a, b) => b.z - a.z);
})();

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Glow: React.FC<{
  x: number;
  y: number;
  r: number;
  o: number;
  c: string;
}> = ({ x, y, r, o, c }) => (
  <div
    style={{
      position: "absolute",
      left: x - r,
      top: y - r,
      width: r * 2,
      height: r * 2,
      borderRadius: "50%",
      opacity: Math.min(1, o),
      background: `radial-gradient(circle, #fff 0%, ${c} 22%, ${c}88 46%, ${c}00 72%)`,
    }}
  />
);

export const BaublesCB: React.FC = () => {
  const frame = useCurrentFrame();
  // the drift forward, slowing into the CB as the band stops
  const t = Math.min(1, frame / STOP);
  const camZ = TRAVEL * (1 - Math.pow(1 - t, 2.4));
  const dFocus = ZC - camZ;
  const open = progress(frame, 0, 24, EASE_OUT);
  // the lights: dimming in the hush, a twinkle on the tap, brightening and blooming as the band returns
  const hush =
    progress(frame, STOP - 4, 10, EASE_IN_OUT) *
    (1 - progress(frame, HIT - 2, 6, EASE_OUT));
  const tap = Math.exp(-Math.max(0, frame - TAP) / 5) * (frame >= TAP ? 1 : 0);
  const bright = progress(frame, HIT - 2, 14, EASE_OUT);
  const glow = (1 - 0.45 * hush) * (1 + 0.9 * bright) + 0.5 * tap;
  const bloom = 1 + 0.35 * bright;
  const logo = progress(frame, HIT + 10, 28, EASE_IN_OUT);
  const line = progress(frame, HIT + 26, 26, EASE_OUT);
  const sweep = interpolate(frame, [HIT + 62, HIT + 92], [-60, 160], clamp);
  const ribbon = 1 - progress(frame, HIT, 20, EASE_IN_OUT);

  const lights = LIGHTS.map((l, i) => {
    const d = l.z - camZ;
    if (d < 80) return null;
    const s = F / d;
    const x = W / 2 + l.x * s;
    const y = H / 2 + l.y * s;
    const blur = Math.min(1, Math.abs(d - dFocus) / dFocus);
    const r =
      Math.max(5, (6 + 50 * blur) * Math.min(2.6, s * 1.5) * l.s) * bloom;
    if (x < -r || x > W + r || y < -r || y > H + r) return null;
    const near = Math.min(1, (d - 80) / 260);
    const tw = 0.72 + 0.28 * Math.sin(frame * 0.11 + l.tw);
    // keep the middle calm behind the logo once it is up
    const mid = Math.hypot(x - W / 2, y - H / 2) < 380 ? 1 - 0.55 * logo : 1;
    return (
      <Glow
        key={i}
        x={x}
        y={y}
        r={r}
        o={(0.9 - 0.55 * blur) * near * tw * glow * 0.8 * mid}
        c={l.c}
      />
    );
  });

  const baubles = BAUBLES.map((b, i) => {
    const d = b.z - camZ;
    if (d < 120) return null;
    const s = F / d;
    const x = W / 2 + b.x * s;
    const y = H / 2 + b.y * s;
    const r = b.r * s;
    if (x < -r * 2 || x > W + r * 2 || y < -r * 3 || y > H + r * 2) return null;
    const blur = Math.min(26, 30 * Math.abs(1 - d / dFocus) * Math.min(1.6, s));
    const near = Math.min(1, (d - 120) / 300);
    const [hi, mid, lo] = BAUBLE_COLOURS[b.col];
    const swing = b.amp * Math.sin(frame * 0.035 + b.ph) * (180 / Math.PI);
    const top = -60; // the thread runs up out of the frame
    return (
      <div
        key={i}
        style={{
          position: "absolute",
          left: x - r,
          top,
          width: r * 2,
          height: y + r - top,
          transformOrigin: "50% 0",
          transform: `rotate(${swing}deg)`,
          opacity: near * open,
          filter: `blur(${blur.toFixed(1)}px) brightness(${(0.85 + 0.35 * bright + 0.25 * tap).toFixed(2)})`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: r - Math.max(0.6, 1.4 * s) / 2,
            top: 0,
            width: Math.max(0.6, 1.4 * s),
            height: y - top - r * 1.05,
            background: "rgba(214,186,128,0.55)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: r * 0.78,
            top: y - top - r * 1.18,
            width: r * 0.44,
            height: r * 0.24,
            borderRadius: r * 0.05,
            background: "linear-gradient(90deg, #6e5527, #e3c27a 45%, #8a6a2e)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: y - top - r,
            width: r * 2,
            height: r * 2,
            borderRadius: "50%",
            // a hotel reflected in the glass: the photo fills the sphere, darkening into the bauble's colour
            // towards the rim, the gloss on top
            background: [
              `radial-gradient(circle at 34% 30%, rgba(255,255,255,0.95) 0%, ${hi}cc 6%, ${hi}00 13%)`,
              `radial-gradient(circle at 46% 44%, ${mid}00 34%, ${mid}aa 70%, ${lo} 98%)`,
              `url(${b.photo}) 50% 50% / auto 135% no-repeat`,
            ].join(", "),
            backgroundColor: mid,
            boxShadow: `inset ${-r * 0.18}px ${-r * 0.22}px ${r * 0.4}px rgba(0,0,0,0.45)`,
          }}
        />
      </div>
    );
  });

  // the CB ornament: its logo box in the world, hanging on a gold ribbon, swaying less and less as it is reached
  const dC = ZC - camZ;
  const sC = F / dC;
  const bw = BOX_W * sC;
  const bh = BOX_H * sC;
  const sway = 2.2 * Math.sin(frame * 0.05) * (1 - t);
  const boxLeft = W / 2 - bw / 2;
  const boxTop = H / 2 - bh / 2;
  const cbTop = boxTop; // the CB's top is the logo frame's top (y 0 of 655.69)
  const cbBlur = Math.max(0, 6 * (1 - t) - 2);
  const flare = 0.35 * tap + 0.6 * bright * (1 - logo);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      <AbsoluteFill style={{ opacity: open, mixBlendMode: "screen" }}>
        {lights}
      </AbsoluteFill>
      <AbsoluteFill>{baubles}</AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: W / 2 - 2,
          top: -20,
          width: 4 * Math.max(0.6, sC),
          height: cbTop + 20 + bh * 0.04,
          opacity: open * ribbon,
          background: "linear-gradient(90deg, #6e5527, #e3c27a, #6e5527)",
          transformOrigin: "50% 0",
          transform: `rotate(${sway}deg)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: boxLeft,
          top: boxTop,
          width: bw,
          height: bh,
          transformOrigin: `50% ${-boxTop}px`,
          transform: `rotate(${sway}deg)`,
          opacity: open,
        }}
      >
        <Img
          src={staticFile("brand/cbh-logo-cb-only.svg")}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            filter: `blur(${cbBlur.toFixed(1)}px) drop-shadow(0 0 ${(10 + 40 * flare).toFixed(0)}px rgba(255,200,120,${(0.25 + 0.5 * flare).toFixed(2)}))`,
          }}
        />
        <Img
          src={staticFile("brand/cbh-logo-on-dark.svg")}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: logo,
          }}
        />
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
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 330,
          textAlign: "center",
          fontFamily: serif,
          fontSize: 112,
          lineHeight: 1.08,
          color: colors.cream,
          opacity: line,
          transform: `translateY(${(1 - line) * 40}px)`,
          filter: `blur(${(1 - line) * 8}px)`,
          textShadow: "0 0 34px rgba(0,0,0,0.75), 0 2px 10px rgba(0,0,0,0.55)",
        }}
      >
        Merry Christmas
      </div>
      <Audio
        src={staticFile(MUSIC)}
        trimBefore={Math.round(MUSIC_FROM * 30)}
        volume={(f) =>
          interpolate(
            f,
            [0, 10, BAUBLES_CB_FRAMES - 45, BAUBLES_CB_FRAMES],
            [0, 1, 1, 0],
            clamp,
          )
        }
      />
      <FilmFinish />
    </AbsoluteFill>
  );
};
