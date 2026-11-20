import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/fonts";
import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FilmFinish } from "../components/FilmFinish";
import { colors, EASE_IN_OUT, EASE_OUT, progress, sans, serif } from "../theme";

// "Wish you were here" (Scott, 15 Nov: "your turn", an original for TikTok). Postcards land one on top of another on a
// dark table, photo side up, each in the house label's order (gold caps place, underline, cream Cormorant name). On the
// beat each one flips over: a handwritten note writes itself across the back, addressed to the people stuck at work,
// and the postmark thumps down. Three hotels, the notes only saying what the photo shows (Waterton's island and its
// bridge, Ruthin's castle and its peacock, Holdsworth's tea by the fire). The last note ends "Wish you were here"; the
// camera goes in on its stamp, a gold CB, until the stamp's CB is exactly the logo's, the table falls to black and the
// logo is there, shimmer.
// Music (Scott, 15 Nov: "change the music"; Event Music by prettyjohn1 before): Party Pop by atlasaudio (Pixabay 606271,
// unused till now), 143.6 BPM, from the end of its first break: the first card lands as the kick comes back (15.93s), a
// card every 16 beats (BEATS from librosa).

const HAND = "Caveat";
loadFont({ family: HAND, url: staticFile("fonts/Caveat-SemiBold.woff2"), weight: "600" });

const W = 1080;
const H = 1920;
const MUSIC = "music/atlasaudio-party-pop-606271.mp3";
const BEATS = [15.929, 16.347, 16.788, 17.206, 17.624, 18.042, 18.483, 18.924, 19.342, 19.760, 20.201, 20.619, 21.060, 21.478, 21.920, 22.338, 22.779, 23.197, 23.638, 24.056, 24.497, 24.915, 25.356, 25.774, 26.215, 26.633, 27.051, 27.492, 27.910, 28.352, 28.770, 29.211, 29.629, 30.047, 30.488, 30.906, 31.347, 31.765, 32.206, 32.624, 33.065, 33.483, 33.924, 34.342, 34.783, 35.201, 35.643, 36.061, 36.502, 36.920, 37.338, 37.779, 38.197, 38.638, 39.056, 39.497, 39.915, 40.356, 40.774, 41.192, 41.633, 42.051, 42.493, 42.910];
const LEAD = 8; // the first card is already falling on frame one; it lands on the drop
const MUSIC_FROM = BEATS[0] - LEAD / 30;
// frame of beat k (fractional beats interpolate)
const B = (k: number) => {
  const i = Math.floor(k);
  const t = BEATS[i] + (BEATS[Math.min(i + 1, BEATS.length - 1)] - BEATS[i]) * (k - i);
  return Math.round((t - MUSIC_FROM) * 30);
};
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// the card, landscape, on the table
const CW = 960;
const CH = 640;
const CX = 540;
const CY = 900;
const INK = "#2a2933";

type Card = {
  photo: string;
  pos: string;
  place: string;
  name: string;
  lines: [string, string];
  to: [string, string];
  mark: string;
  rot: number;
  dx: number;
  dy: number;
};
const CARDS: Card[] = [
  {
    photo: "hotels/waterton-park/footbridge-autumn.jpg",
    pos: "50% 50%",
    place: "Wakefield, West Yorkshire",
    name: "Waterton Park",
    lines: ["Our hotel has its own island,", "you cross a bridge to get in x"],
    to: ["The team,", "back at the office"],
    mark: "WAKEFIELD",
    rot: -3,
    dx: -10,
    dy: 0,
  },
  {
    photo: "campaigns/ruthin-friday13/castle-peacock.jpg",
    pos: "45% 50%",
    place: "Ruthin, North Wales",
    name: "Ruthin Castle",
    lines: ["Slept in an actual castle.", "There's a peacock on the wall x"],
    to: ["Everyone still", "at their desks"],
    mark: "RUTHIN",
    rot: 2.2,
    dx: 14,
    dy: 18,
  },
  {
    photo: "hotels/holdsworth-house/tea-by-the-fire.jpg",
    pos: "40% 50%",
    place: "Halifax, West Yorkshire",
    name: "Holdsworth House",
    lines: ["Tea by the fire every afternoon.", "Wish you were here x"],
    to: ["The team,", "Monday morning"],
    mark: "HALIFAX",
    rot: -1.2,
    dx: 0,
    dy: 8,
  },
];
// each card's beats: lands, flips, writes its two lines, the postmark
const timing = (i: number) => {
  const K = 16 * i;
  return {
    land: B(K),
    flip: B(K + 3.5),
    l1: [B(K + 4.5), B(K + 7)] as const,
    l2: [B(K + 7.5), B(K + 10.5)] as const,
    post: B(K + 12),
  };
};
const ZOOM: [number, number] = [B(45), B(48)];
const BLACK = B(48);
const WORD = B(49);
const SHIMMER = B(52);
export const POSTCARDS_FRAMES = B(58);

// the stamp, in card coordinates (back face), and the CB inside it
const STAMP = { x: 770, y: 40, w: 150, h: 180 };
const CB_W = 100; // the CB's width in the stamp
const STAMP_K = CB_W / 418; // the logo's CB spans 418 of its 534.25 units
const STAMP_CB = { cx: STAMP.x + STAMP.w / 2, cy: STAMP.y + STAMP.h / 2 - 4 };
// the logo at the end (640 wide, centred), and where its CB's centre sits
const LOGO_K = 640 / 534.25;
const LOGO = { left: (W - 640) / 2, top: 960 - (655.69 * LOGO_K) / 2, w: 640, h: 655.69 * LOGO_K };
const LOGO_CB = { x: LOGO.left + 267 * LOGO_K, y: LOGO.top + 225.5 * LOGO_K };
const Z_END = (418 * LOGO_K) / CB_W; // the stamp's CB as wide as the logo's

// the camera: a slow push over the table, then in on the last card's stamp until its CB is the logo's
const camera = (f: number) => {
  const e = progress(f, ZOOM[0], ZOOM[1] - ZOOM[0], EASE_IN_OUT);
  const base = 1 + 0.035 * Math.min(1, f / ZOOM[0]);
  const c = CARDS[2];
  // the stamp's CB centre on the table (the last card straightens as the camera comes in)
  const px = CX + c.dx + STAMP_CB.cx - CW / 2;
  const py = CY + c.dy + STAMP_CB.cy - CH / 2;
  const z = base * Math.pow(Z_END / base, e);
  // with no zoom, the push is about the frame's centre
  const sx0 = 540 + (px - 540) * base;
  const sy0 = 960 + (py - 960) * base;
  const sx = sx0 + (LOGO_CB.x - sx0) * e;
  const sy = sy0 + (LOGO_CB.y - sy0) * e;
  return { z, tx: sx - z * px, ty: sy - z * py, e };
};

const Paper: React.FC<{ children?: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: "linear-gradient(160deg, #f4eee2 0%, #ece4d4 100%)",
      borderRadius: 6,
      overflow: "hidden",
      ...style,
    }}
  >
    <svg width={CW} height={CH} style={{ position: "absolute", inset: 0, opacity: 0.09, mixBlendMode: "multiply" }}>
      <filter id="pc-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves={2} seed={4} />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width={CW} height={CH} filter="url(#pc-grain)" />
    </svg>
    {children}
  </div>
);

const Front: React.FC<{ c: Card }> = ({ c }) => (
  <Paper>
    <div style={{ position: "absolute", left: 22, top: 22, right: 22, bottom: 22, overflow: "hidden", borderRadius: 2 }}>
      <Img src={staticFile(c.photo)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: c.pos }} />
      <AbsoluteFill style={{ background: "linear-gradient(to top, rgba(9,9,10,0.72) 0%, rgba(9,9,10,0.3) 30%, rgba(9,9,10,0) 52%)" }} />
      <div style={{ position: "absolute", left: 34, bottom: 30 }}>
        <div style={{ display: "inline-block" }}>
          <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 21, letterSpacing: "0.24em", textTransform: "uppercase", color: colors.gold }}>
            {c.place}
          </div>
        </div>
        <div style={{ fontFamily: serif, fontSize: 62, lineHeight: 1.05, color: colors.cream, marginTop: 10, textShadow: "0 2px 16px rgba(9,9,10,0.6)" }}>
          {c.name}
        </div>
      </div>
    </div>
  </Paper>
);

const Stamp: React.FC = () => {
  const holes = [];
  const r = 6.5;
  const step = 15;
  for (let x = 0; x <= STAMP.w; x += step) holes.push([x, 0], [x, STAMP.h]);
  for (let y = step; y < STAMP.h; y += step) holes.push([0, y], [STAMP.w, y]);
  return (
    <div style={{ position: "absolute", left: STAMP.x, top: STAMP.y, width: STAMP.w, height: STAMP.h, filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.25))" }}>
      <svg width={STAMP.w} height={STAMP.h} style={{ position: "absolute", inset: 0 }}>
        <mask id="pc-perf">
          <rect width={STAMP.w} height={STAMP.h} fill="#fff" />
          {holes.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill="#000" />
          ))}
        </mask>
        <g mask="url(#pc-perf)">
          <rect width={STAMP.w} height={STAMP.h} fill="#f1ebdf" />
          <rect x={10} y={10} width={STAMP.w - 20} height={STAMP.h - 20} fill="#1d1c19" />
          <rect x={16} y={16} width={STAMP.w - 32} height={STAMP.h - 32} fill="none" stroke="#c39e55" strokeOpacity={0.55} strokeWidth={1.2} />
        </g>
      </svg>
      <Img
        src={staticFile("brand/cbh-logo-cb-only.svg")}
        style={{
          position: "absolute",
          left: STAMP.w / 2 - 267 * STAMP_K,
          top: STAMP_CB.cy - STAMP.y - 225.5 * STAMP_K,
          width: 534.25 * STAMP_K,
          height: 655.69 * STAMP_K,
        }}
      />
    </div>
  );
};

const Postmark: React.FC<{ mark: string; t: number }> = ({ mark, t }) => {
  if (t < 0) return null;
  const a = progress(t, 0, 5, EASE_OUT);
  const R = 60;
  const id = `pm-${mark}`;
  return (
    <svg
      width={330}
      height={170}
      style={{
        position: "absolute",
        left: STAMP.x - 152,
        top: 52,
        opacity: 0.8 * a,
        transform: `rotate(-11deg) scale(${1.25 - 0.25 * a})`,
        transformOrigin: "110px 85px",
      }}
    >
      <defs>
        <path id={`${id}-t`} d={`M${110 - R + 14} 85 A${R - 14} ${R - 14} 0 0 1 ${110 + R - 14} 85`} />
        <path id={`${id}-b`} d={`M${110 - R + 26} 85 A${R - 26} ${R - 26} 0 0 0 ${110 + R - 26} 85`} />
      </defs>
      <g fill="none" stroke={INK} strokeWidth={2.4} opacity={0.9}>
        <circle cx={110} cy={85} r={R} />
        <circle cx={110} cy={85} r={R - 5} strokeWidth={1.2} />
        {[0, 1, 2, 3].map((k) => (
          <path key={k} d={`M${180} ${58 + k * 18} q18 -8 36 0 t36 0 t36 0 t36 0`} />
        ))}
      </g>
      <text fontFamily={sans} fontWeight={700} fontSize={14} letterSpacing={3} fill={INK} textAnchor="middle">
        <textPath href={`#${id}-t`} startOffset="50%">
          {mark}
        </textPath>
      </text>
      <text x={110} y={92} fontFamily={sans} fontWeight={700} fontSize={13} letterSpacing={2} fill={INK} textAnchor="middle">
        NOV 2026
      </text>
    </svg>
  );
};

const Written: React.FC<{ text: string; from: number; to: number; f: number; style: React.CSSProperties }> = ({ text, from, to, f, style }) => {
  const p = interpolate(f, [from, to], [0, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        fontFamily: HAND,
        fontWeight: 600,
        color: INK,
        whiteSpace: "nowrap",
        clipPath: `inset(-20% ${(1 - p) * 100}% -20% 0)`,
        ...style,
      }}
    >
      {text}
    </div>
  );
};

const Back: React.FC<{ c: Card; i: number; f: number }> = ({ c, i, f }) => {
  const tm = timing(i);
  return (
    <Paper>
      {/* the divide, the address lines */}
      <div style={{ position: "absolute", left: 596, top: 64, width: 2, height: CH - 120, background: "#c7bba5" }} />
      {[402, 482].map((y) => (
        <div key={y} style={{ position: "absolute", left: 630, top: y, width: 290, height: 2, background: "#cfc4b1" }} />
      ))}
      <Stamp />
      {/* the address, already written */}
      {c.to.map((t, k) => (
        <div key={t} style={{ position: "absolute", left: 638, top: 344 + k * 80, fontFamily: HAND, fontWeight: 600, fontSize: 40, color: INK, whiteSpace: "nowrap" }}>
          {t}
        </div>
      ))}
      {/* the note, writing itself */}
      <div style={{ position: "absolute", left: 48, top: 176, transform: "rotate(-2deg)", transformOrigin: "0 0" }}>
        <Written text={c.lines[0]} from={tm.l1[0]} to={tm.l1[1]} f={f} style={{ left: 0, top: 0, fontSize: 42 }} />
        <Written text={c.lines[1]} from={tm.l2[0]} to={tm.l2[1]} f={f} style={{ left: 0, top: 84, fontSize: 42 }} />
      </div>
      <Postmark mark={c.mark} t={f - tm.post} />
    </Paper>
  );
};

const CardView: React.FC<{ c: Card; i: number; f: number }> = ({ c, i, f }) => {
  const tm = timing(i);
  const drop = i === 0 ? LEAD : 10;
  if (f < tm.land - drop) return null;
  const land = progress(f, tm.land - drop, drop, EASE_OUT);
  const flip = progress(f, tm.flip, 12, EASE_IN_OUT);
  const lift = Math.sin(flip * Math.PI); // the card lifts a little as it turns
  const thump = interpolate(f, [tm.post, tm.post + 2, tm.post + 7], [0, 4, 0], clamp);
  const straight = i === 2 ? progress(f, ZOOM[0] - 10, 24, EASE_IN_OUT) : 0;
  const rot = c.rot * (1 - straight) + (1 - land) * (i % 2 ? 9 : -9);
  const scale = 1 + (1 - land) * 0.22 + lift * 0.05;
  const y = (1 - land) * -140 + thump;
  const shadow = 18 + (1 - land) * 60 + lift * 30;
  return (
    <div
      style={{
        position: "absolute",
        left: CX - CW / 2 + c.dx,
        top: CY - CH / 2 + c.dy,
        width: CW,
        height: CH,
        transform: `translateY(${y}px) rotate(${rot}deg) scale(${scale})`,
        perspective: 2400,
      }}
    >
      <div style={{ position: "absolute", inset: 0, borderRadius: 6, boxShadow: `0 ${shadow * 0.5}px ${shadow}px rgba(0,0,0,${0.5 - 0.15 * (1 - land)})` }} />
      <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: `rotateY(${180 * flip}deg)` }}>
        <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden" }}>
          <Front c={c} />
        </div>
        <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
          <Back c={c} i={i} f={f} />
        </div>
      </div>
    </div>
  );
};

export const Postcards: React.FC = () => {
  const f = useCurrentFrame();
  const cam = camera(f);
  const dark = progress(f, BLACK, 14, EASE_IN_OUT);
  const word = progress(f, WORD, 26, EASE_IN_OUT);
  const sweep = interpolate(f, [SHIMMER, SHIMMER + 30], [-60, 160], clamp);
  const logoBox: React.CSSProperties = { position: "absolute", left: LOGO.left, top: LOGO.top, width: LOGO.w, height: LOGO.h };
  return (
    <AbsoluteFill style={{ backgroundColor: "#0e0d0c" }}>
      <Audio
        src={staticFile(MUSIC)}
        trimBefore={Math.round(MUSIC_FROM * 30)}
        volume={(t) => 0.43 * interpolate(t, [0, 4], [0, 1], clamp) * interpolate(t, [POSTCARDS_FRAMES - 45, POSTCARDS_FRAMES], [1, 0], clamp)}
      />
      {f < BLACK + 16 ? (
        <AbsoluteFill style={{ transform: `translate(${cam.tx}px, ${cam.ty}px) scale(${cam.z})`, transformOrigin: "0 0" }}>
          {/* the table: dark wood under a warm lamp */}
          <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
            <defs>
              <filter id="pc-wood" x="0" y="0" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.0025 0.09" numOctaves={3} seed={9} />
                <feColorMatrix type="matrix" values="0 0 0 0 0.17  0 0 0 0 0.12  0 0 0 0 0.08  0 0 0 1.1 -0.25" />
              </filter>
              <radialGradient id="pc-lamp" cx="0.3" cy="0.28" r="0.75">
                <stop offset="0" stopColor="#3a2e1f" stopOpacity="0.9" />
                <stop offset="0.55" stopColor="#1a1612" stopOpacity="0.4" />
                <stop offset="1" stopColor="#000" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width={W} height={H} fill="#13110e" />
            <rect width={W} height={H} filter="url(#pc-wood)" opacity={0.55} />
            <rect width={W} height={H} fill="url(#pc-lamp)" />
          </svg>
          {CARDS.map((c, i) => (
            <CardView key={c.name} c={c} i={i} f={f} />
          ))}
        </AbsoluteFill>
      ) : null}
      {/* the table falls to black; the stamp's CB is already the logo's, the wordmark comes up round it, shimmer */}
      <AbsoluteFill style={{ backgroundColor: colors.black, opacity: dark }} />
      {f >= BLACK ? (
        <>
          <Img src={staticFile("brand/cbh-logo-cb-only.svg")} style={{ ...logoBox, opacity: 1 - word }} />
          <Img src={staticFile("brand/cbh-logo-on-dark.svg")} style={{ ...logoBox, opacity: word }} />
          <div
            style={{
              ...logoBox,
              WebkitMaskImage: `url(${staticFile("brand/cbh-logo-gold.svg")})`,
              maskImage: `url(${staticFile("brand/cbh-logo-gold.svg")})`,
              WebkitMaskSize: "100% 100%",
              maskSize: "100% 100%",
              background: `linear-gradient(110deg, transparent ${sweep - 25}%, rgba(255,246,220,0.95) ${sweep}%, transparent ${sweep + 25}%)`,
            }}
          />
        </>
      ) : null}
      <FilmFinish />
    </AbsoluteFill>
  );
};
