import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { FilmFinish } from "../components/FilmFinish";
import { colors, EASE_IN_OUT, serif } from "../theme";
import pile from "./pile.json";

// Autumn leaves (Scott, 25 Oct: "an autumn animation like the gold leaf papers, leaves blow
// into a pile, then blow off and reveal the CB"). Seen from above on dark ground under a warm
// low light: leaves come in on the wind from the left, tumbling as they fall, and settle into
// a pile; it lies still for a breath, the leaves at its edge stir, and on the music's swell a
// gust takes them all off to the right, the top ones first, and the gold CB is lying
// underneath. The ground goes to black, the CB settles into the full logo, one shimmer.
// Leaves, shadows, the ground and the pile's layout (every pixel of the CB covered) from
// scripts/autumn-leaves.py; sounds from scripts/leaves-sfx.py (dry leaves only, no whoosh).
export const LEAVES_FPS = 30;
const W = 1080;
const H = 1920;

// The leaves come in on a 0.5214s pulse (the first cut's Sentimental Autumn; Scott: "change
// the track"), the gust on b(16). Now Fireplace Holiday by villatic_music (Pixabay, Scott
// checked it; also on holdsworth-weekend), 73.0 BPM: its quiet opening under the leaves, the
// bass coming in on the gust (14.907s), and from there the lockup on its own beats (`a`).
const BEAT = 0.5214;
const b = (n: number) => Math.round(n * BEAT * LEAVES_FPS);
const GUST = b(16);
const TRACK_BEAT = 0.8216;
const BASS_IN = 14.907;
const TRACK_START = BASS_IN - GUST / LEAVES_FPS;
const a = (n: number) => GUST + Math.round(n * TRACK_BEAT * LEAVES_FPS);
export const LEAVES_FRAMES = a(10);
export const LEAVES_GUST = GUST;
// frames over which the ground fades in under the arriving leaves, in the `over` mode
const GROUND_IN = [70, 170];

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const rand = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};
const src = (f: string) => staticFile(`campaigns/leaves/${f}`);

// the CB smaller than in the other logo reels (640 wide, centred at 540, 930) so the pile
// over it has ground round it; it settles to the same lockup size (430)
const CB_W = 640;
const LOCK = 430 / CB_W;
const PUSH = 1.035;
const SC = CB_W / 418;
const SVG = { w: 534.25 * SC, h: 655.69 * SC };
const CB_CX = 540;
const CB_CY = 930;
const svgLeft = CB_CX - CB_W / 2 - 58.4 * SC;
const svgTop = CB_CY - (451.5 * SC) / 2;
const CB_SRC = staticFile("brand/cbh-logo-cb-only.svg");
const LOGO_SRC = staticFile("brand/cbh-logo-on-dark.svg");
const cbMask = {
  WebkitMaskImage: `url(${CB_SRC})`,
  maskImage: `url(${CB_SRC})`,
  WebkitMaskSize: `${SVG.w}px ${SVG.h}px`,
  maskSize: `${SVG.w}px ${SVG.h}px`,
  WebkitMaskPosition: `${svgLeft}px ${svgTop}px`,
  maskPosition: `${svgLeft}px ${svgTop}px`,
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
} as const;

const SPRITE = 320;
const N = pile.leaves.length;
const ARRIVE_FROM = 12;
const ARRIVE_TO = b(12.5); // the last leaf down
// the leaves in the order they were dealt (bottom first), each with its flight in and out
const LEAVES = pile.leaves.map((l, i) => {
  const r = (k: number) => rand(i * 17 + k);
  // landing times keep the dealing order (a leaf never lands under one already down), in
  // three loose waves on the wind
  const u = i / (N - 1);
  const wave = u + 0.035 * Math.sin(u * Math.PI * 6);
  const land = Math.round(
    ARRIVE_FROM + 40 + wave * (ARRIVE_TO - ARRIVE_FROM - 40),
  );
  const dur = 34 + Math.round(26 * r(1));
  // from the left, a little from the top of the frame, out of the air
  const sx = l.x - 1000 - 500 * r(2);
  const sy = l.y - 260 - 520 * r(3);
  const z0 = 0.45 + 0.5 * r(4);
  // the gust: off to the right, the top of the pile first, sweeping left to right
  const top = l.a === 0;
  const out = Math.round(
    GUST - 5 + (l.x / W) * 16 + l.a * 2.2 + 5 * r(5) + (l.y > 1300 ? 2 : 0),
  );
  return {
    ...l,
    i,
    land,
    start: land - dur,
    dur,
    sx,
    sy,
    z0,
    flips: r(6) < 0.4 ? (r(7) < 0.5 ? 1 : -1) : 0,
    spinZ: (r(8) - 0.5) * 520,
    ax: 30 + 50 * r(9),
    ay: 25 + 45 * r(10),
    wx: 0.18 + 0.2 * r(11),
    wy: 0.15 + 0.22 * r(12),
    ph: r(13) * 6.28,
    sway: 40 + 80 * r(14),
    shade: 1.04 - 0.085 * Math.min(l.a, 4) - 0.04 * r(15),
    top,
    out,
    outDur: 30 + Math.round(20 * r(16)),
    outDx: 1500 + 900 * r(17),
    outDy: -700 * r(18) + 150,
    outSpin: (r(19) - 0.5) * 900,
  };
});
// a few on top of the CB hang on: they slide a little, then go after the rest
const STRAGGLER_IDS = LEAVES.filter(
  (l) => l.top && Math.abs(l.x - CB_CX) < 300 && Math.abs(l.y - CB_CY) < 360,
)
  .slice(-4)
  .map((l) => l.i);
const STRAGGLERS = new Set(STRAGGLER_IDS);
STRAGGLER_IDS.forEach((id, k) => {
  LEAVES[id].out = GUST + 20 + 5 * k;
  LEAVES[id].outDur = 44;
});

type Pose = {
  x: number;
  y: number;
  z: number; // height above the ground, 0 lying on it
  rz: number;
  rx: number;
  ry: number;
};

// lying in the pile; in the breath before the gust the leaves on top at its left edge stir,
// and the stragglers on the CB slide a little once the gust has started
const rest = (l: (typeof LEAVES)[number], f: number): Pose => {
  const stir = l.top
    ? interpolate(f, [GUST - 14, GUST], [0, 1], clamp) *
      Math.max(0, 1 - l.x / 700)
    : 0;
  const slide = STRAGGLERS.has(l.i)
    ? interpolate(f, [GUST + 2, l.out], [0, 60], {
        ...clamp,
        easing: EASE_IN_OUT,
      })
    : 0;
  return {
    x: l.x + slide,
    y: l.y - slide * 0.2,
    z: 0.02 * stir,
    rz: l.r + stir * 3 * Math.sin(f * 0.7 + l.ph),
    rx: stir * 14 * (0.5 + 0.5 * Math.sin(f * 0.9 + l.ph)),
    ry: 0,
  };
};

const pose = (l: (typeof LEAVES)[number], f: number): Pose | null => {
  if (f < l.start) return null;
  if (f < l.land) {
    // in: decelerating on the wind, falling, tumbling less and less as it settles
    const u = (f - l.start) / l.dur;
    const e = 1 - Math.pow(1 - u, 2.2);
    const calm = Math.pow(1 - u, 1.4);
    return {
      x: l.sx + (l.x - l.sx) * e + Math.sin(f * 0.11 + l.ph) * l.sway * calm,
      y:
        l.sy +
        (l.y - l.sy) * e +
        Math.cos(f * 0.09 + l.ph) * l.sway * 0.6 * calm,
      z: l.z0 * Math.pow(1 - u, 1.5),
      rz: l.r + l.spinZ * (1 - e),
      rx: l.ax * calm * Math.sin(f * l.wx + l.ph),
      ry: l.flips * 360 * (1 - e) + l.ay * calm * Math.sin(f * l.wy + l.ph * 2),
    };
  }
  if (f < l.out) return rest(l, f);
  // out: lifted and carried off, faster and faster, tumbling, picking up from wherever the
  // stir left it (no jump on its first frame)
  const r0 = rest(l, l.out);
  const u = (f - l.out) / l.outDur;
  if (u > 1.4) return null;
  const e = u * u;
  const k = Math.min(1, u * 2);
  return {
    x: r0.x + l.outDx * e,
    y: r0.y + l.outDy * e - 120 * u,
    z: Math.max(r0.z, Math.min(1, 0.9 * Math.pow(u, 0.7))),
    rz: r0.rz + l.outSpin * e,
    rx: r0.rx * (1 - k) + l.ax * 1.3 * u * Math.sin(f * l.wx * 1.6 + l.ph),
    ry: l.flips * 300 * e + l.ay * 1.4 * u * Math.sin(f * l.wy * 1.6 + l.ph),
  };
};

// cos of the turn, kept off zero so an edge-on leaf is a sliver, not nothing
const flat = (deg: number) => {
  const c = Math.cos((deg * Math.PI) / 180);
  return Math.sign(c || 1) * Math.max(0.08, Math.abs(c));
};

const Leaf: React.FC<{ l: (typeof LEAVES)[number]; f: number }> = ({
  l,
  f,
}) => {
  const p = pose(l, f);
  if (!p) return null;
  const size = SPRITE * l.s;
  const flying = p.z > 0.01 || p.rx !== 0 || p.ry !== 0;
  // light from the upper left: the shadow falls down and right, further and softer with height
  const shOff = 10 + 150 * p.z;
  // a leaf turned edge-on or over catches less of the light; its back is paler and duller
  const face =
    Math.cos((p.rx * Math.PI) / 180) * Math.cos((p.ry * Math.PI) / 180);
  // the pile's depth comes in as the leaves above it land
  const aoK = interpolate(f, [l.land, l.land + 70], [0, 1], clamp);
  const lit =
    (1 - aoK + aoK * l.shade) *
    (0.72 + 0.34 * Math.abs(face)) *
    (1 + 0.12 * p.z);
  const back = face < 0;
  const scale = 1 + 0.55 * p.z;
  const base: React.CSSProperties = {
    position: "absolute",
    left: 0,
    top: 0,
    width: size,
    height: size,
  };
  return (
    <>
      {flying ? (
        <Img
          src={src(`shadow-${l.k}.png`)}
          style={{
            ...base,
            opacity:
              0.55 *
              (1 - 0.6 * p.z) *
              Math.max(0.35, Math.abs(face)) *
              interpolate(p.z, [0, 0.12], [0, 1], clamp),
            transform: `translate(${p.x - size / 2 + shOff * 0.55}px, ${p.y - size / 2 + shOff}px) rotate(${p.rz}deg) scale(${(1 + 0.2 * p.z) * Math.max(0.3, Math.abs(Math.cos((p.ry * Math.PI) / 180)))}, ${Math.max(0.3, Math.abs(Math.cos((p.rx * Math.PI) / 180)))})`,
          }}
        />
      ) : null}
      {p.z < 0.08 ? (
        <Img
          src={src(`contact-${l.k}.png`)}
          style={{
            ...base,
            opacity: 1 - p.z / 0.08,
            transform: `translate(${p.x - size / 2 + 5}px, ${p.y - size / 2 + 8}px) rotate(${p.rz}deg)`,
          }}
        />
      ) : null}
      <Img
        src={src(`leaf-${l.k}.png`)}
        style={{
          ...base,
          transform: flying
            ? // seen from straight above, a leaf turning over is a leaf squashing through its
              // turn (and mirrored once it is over), so the flips stay flat 2D transforms: 3D
              // layers for hundreds of leaves at the gust crashed the renderer
              `translate(${p.x - size / 2}px, ${p.y - size / 2}px) rotate(${p.rz}deg) scale(${(scale * flat(p.ry)).toFixed(4)}, ${(scale * flat(p.rx)).toFixed(4)})`
            : `translate(${p.x - size / 2}px, ${p.y - size / 2}px) rotate(${p.rz}deg)`,
          // the leaves nearest the camera (high in the air) a touch out of focus
          filter: `brightness(${lit.toFixed(3)})${back ? " saturate(0.7) sepia(0.25)" : ""}${p.z > 0.45 ? ` blur(${((p.z - 0.45) * 5).toFixed(2)}px)` : ""}`,
        }}
      />
    </>
  );
};

// `over`: the pile builds over whatever is underneath (the autumn reel's last shot): no black
// fade-in, the ground fading in under the arriving leaves instead, and no sound of its own
// (the reel carries the music; no sound effects in a reel).
// `frame`: drive the pile from a remapped clock instead (the Story cut speeds the leaves in).
// `rustle`: the dry-leaf sounds from scripts/leaves-sfx.py under the music; off by default
// (music only in what goes out, the house rule).
export const LeafPile: React.FC<{
  over?: boolean;
  frame?: number;
  rustle?: boolean;
  // the reveal without the logo (Scott, 1 Nov: "one without the logo", "but the leaves reveal is the best part",
  // "the white mark is just the watermark"): the gold CB under the leaves as ever, but no wordmark and no shimmer
  bare?: boolean;
  // the reveal with no gold at all (Scott, 1 Nov: "without the gold logo, it's too many brand moments, though that's
  // the payoff"): the gust uncovers a line lying on the ground in cream Cormorant instead of the CB; it stays as
  // the end card once the ground goes to black
  line?: string[];
}> = ({
  over = false,
  frame,
  rustle = false,
  bare: bareProp = false,
  line,
}) => {
  const bare = bareProp || !!line;
  const current = useCurrentFrame();
  const f = frame ?? current;
  // the ground goes, the lockup
  const groundOut =
    interpolate(f, [a(3), a(5)], [1, 0], { ...clamp, easing: EASE_IN_OUT }) *
    (over
      ? interpolate(f, [GROUND_IN[0], GROUND_IN[1]], [0, 1], {
          ...clamp,
          easing: EASE_IN_OUT,
        })
      : 1);
  const settle = interpolate(f, [a(3.5), a(5)], [0, 1], {
    ...clamp,
    easing: EASE_IN_OUT,
  });
  const full = interpolate(f, [a(5), a(6)], [0, 1], {
    ...clamp,
    easing: EASE_IN_OUT,
  });
  // the shimmer on the strong seventh beat after the bass
  const shimmer = interpolate(f, [a(7), a(8.25)], [-0.6, 1.6], clamp);
  const fadeIn = over ? 1 : interpolate(f, [0, 14], [0, 1], clamp);
  const out = interpolate(
    f,
    [LEAVES_FRAMES - 20, LEAVES_FRAMES - 2],
    [1, 0],
    clamp,
  );
  // the CB lies on the ground with a shadow until it settles into the lockup
  const lying = 1 - settle;
  // a slow push in over the leaves (about the CB), holding once the CB starts to settle; the
  // lockup undoes it so the logo lands at the usual size and place
  const push =
    1 +
    (PUSH - 1) *
      interpolate(f, [0, a(3.5)], [0, 1], {
        ...clamp,
        easing: (t) => 0.6 * t + 0.4 * (0.5 - 0.5 * Math.cos(Math.PI * t)),
      });
  return (
    <AbsoluteFill style={{ backgroundColor: over ? undefined : colors.black }}>
      {over ? (
        // black comes up under the ground as it fades in, so the shot beneath goes too
        <AbsoluteFill
          style={{
            backgroundColor: colors.black,
            opacity: interpolate(
              f,
              [GROUND_IN[0], GROUND_IN[1]],
              [0, 1],
              clamp,
            ),
          }}
        />
      ) : null}
      <AbsoluteFill
        style={{
          opacity: Math.min(fadeIn, out),
          transform: `scale(${push.toFixed(5)})`,
          transformOrigin: `${CB_CX}px ${CB_CY}px`,
        }}
      >
        <AbsoluteFill style={{ opacity: groundOut }}>
          {/* no warm light on the ground (Scott, 30 Oct: it read as a yellow glow above the CB once
              the leaves had gone) */}
          <Img
            src={src("ground.jpg")}
            style={{ position: "absolute", width: W, height: H }}
          />
        </AbsoluteFill>
        {/* the CB underneath it all */}
        <AbsoluteFill
          style={{
            // bare: no wordmark to make room for, so the CB stays where the leaves leave it
            transform: bare
              ? undefined
              : `translateY(${(-75 / PUSH) * settle}px) scale(${1 - (1 - LOCK / PUSH) * settle})`,
            transformOrigin: `${CB_CX}px ${CB_CY}px`,
          }}
        >
          {line ? (
            <div
              style={{
                position: "absolute",
                left: 0,
                width: W,
                top: CB_CY,
                transform: "translateY(-50%)",
                textAlign: "center",
                fontFamily: serif,
                // one line, as big as it fits (Scott: "a one liner, land hard")
                fontSize: Math.min(
                  150,
                  Math.round(
                    960 / (Math.max(...line.map((t) => t.length)) * 0.45),
                  ),
                ),
                lineHeight: 1.05,
                color: colors.cream,
                // lying on the ground: a soft shadow cast down and right, gone with the ground
                textShadow: `6px 10px 10px rgba(0,0,0,${(0.75 * groundOut).toFixed(3)})`,
                // the line is wider than the pile, so it only shows behind the gust: a soft edge
                // sweeping left to right a few frames behind the leaves going (Scott: "the A
                // appears under the leaves before the reveal")
                ...(() => {
                  const e = ((f - (GUST + 3)) / 18) * (W + 160);
                  const m = `linear-gradient(to right, #000 ${(e - 160).toFixed(1)}px, transparent ${e.toFixed(1)}px)`;
                  return { WebkitMaskImage: m, maskImage: m };
                })(),
                opacity: f >= GUST ? 1 : 0,
              }}
            >
              {line.map((t) => (
                <div key={t}>{t}</div>
              ))}
            </div>
          ) : null}
          {/* its shadow on the ground, a layer of its own: a filter on the CB that faded to
              nothing re-rasterised the CB, a one-frame shift */}
          <Img
            src={CB_SRC}
            style={{
              position: "absolute",
              left: svgLeft + 6,
              top: svgTop + 10,
              width: SVG.w,
              height: SVG.h,
              opacity: line ? 0 : 0.7 * lying * (f >= ARRIVE_TO + 4 ? 1 : 0),
              filter: "brightness(0) blur(8px)",
            }}
          />
          <Img
            src={CB_SRC}
            style={{
              position: "absolute",
              left: svgLeft,
              top: svgTop,
              width: SVG.w,
              height: SVG.h,
              // only there once the pile is over it
              opacity: !line && f >= ARRIVE_TO + 4 ? 1 : 0,
            }}
          />
          {bare ? null : (
            <Img
              src={LOGO_SRC}
              style={{
                position: "absolute",
                left: svgLeft,
                top: svgTop,
                width: SVG.w,
                height: SVG.h,
                opacity: full > 0 ? 1 : 0,
                // the wordmark draws down beneath the CB
                clipPath: `inset(0 0 ${(1 - full) * 31.2}% 0)`,
              }}
            />
          )}
          <AbsoluteFill
            style={{
              ...cbMask,
              opacity: bare ? 0 : full,
              background: `linear-gradient(115deg, rgba(255,245,220,0) ${shimmer * 100 - 18}%, rgba(255,245,220,0.75) ${shimmer * 100}%, rgba(255,245,220,0) ${shimmer * 100 + 18}%)`,
            }}
          />
        </AbsoluteFill>
        {/* the leaves */}
        <AbsoluteFill>
          {LEAVES.map((l) => (
            <Leaf key={l.i} l={l} f={f} />
          ))}
        </AbsoluteFill>
        {/* a soft vignette over the whole ground */}
        <AbsoluteFill
          style={{
            opacity: groundOut,
            background:
              "radial-gradient(ellipse 85% 70% at 50% 46%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)",
          }}
        />
      </AbsoluteFill>
      {over ? null : <FilmFinish />}
      {over ? null : (
        <>
          {rustle ? (
            <>
              <Sequence from={ARRIVE_FROM}>
                <Audio src={src("arrive.wav")} volume={0.28} />
              </Sequence>
              <Sequence from={GUST - 8}>
                <Audio src={src("gust.wav")} volume={0.36} />
              </Sequence>
            </>
          ) : null}
          <Audio
            src={staticFile("campaigns/now-arriving/fireplace-holiday.mp3")}
            startFrom={Math.round(TRACK_START * LEAVES_FPS)}
            volume={(fr) =>
              interpolate(
                fr,
                [0, 10, LEAVES_FRAMES - 26, LEAVES_FRAMES],
                [0, 0.8, 0.8, 0],
                clamp,
              )
            }
          />
        </>
      )}
    </AbsoluteFill>
  );
};
