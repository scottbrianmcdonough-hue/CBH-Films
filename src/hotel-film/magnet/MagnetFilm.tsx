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
import { colors, EASE_IN_OUT, EASE_OUT } from "../theme";
import filings from "./cb-filings.json";
import glints from "./hotel-glints.json";

// Magnet CB (Scott: "a magnet or firework CB logo moment", then "but without a map"):
// gold filings are scattered over black on the first beats, lying every which way. Then
// something under the frame starts to pull: the filings turn, near ones first, to point
// at it, and begin to creep in, one continuous pull that gathers speed the closer they
// get (Scott: the first cut's tugs then snap read as fragmented), each piece brightening
// as it nears ("they get brighter as they come together"), until they rush the
// last of the way and strike the CB on the drop's kick, with a small overshoot, standing up on the
// strokes like filings on a magnet's pole (1202 of them, from scripts/cb-points.py: the
// edge and the strokes filled right to the edge). They bristle there, catching the light,
// then lock together (Scott: "locking them together so it becomes the solid CB", and
// "they are still little magnetised pieces, so they should interlink, not just be painted
// in"): out from the centre, crackling rather than in a clean front, each filing snaps
// round to lie along the stroke (cb-points.py stores the stroke's direction at every
// point) with a click and lights up, staying its own small size (Scott: the swollen,
// streaky pieces were "kinda bad", "keep the little pieces, make them light up and fill
// the CB"); their light runs together inside the mark's outline and fills it, their colours
// even out, each piece melting into its light once it has flashed (Scott: "the individual
// pieces still stay stuck, smooth that out"), the solid gold comes through the light, and
// the CB lifts as the full logo comes in with one shimmer across the CB alone. No whoosh, no hum: only the ticks of the filings
// (scripts/magnet-sfx.py).
// The hotels (Scott, 31 Oct: "got to make it relate to CB somehow, or hotels"): it opens on four of them, a hotel
// every two beats on a hard cut (Low Wood Bay's candles, the fireside whisky at Hogarths, the Kingfisher's
// lanterns, Haycock's gold basin), and the gold in each lifts out of the picture as filings (their places are the
// photo's brightest warm points: flames, lit glass, the gold; scripts/magnet-hotel-glints.py) while the picture dims
// away; the filings of every hotel hang together in the dark, and the magnet pulls the lot into the CB: the mark
// made of the gold from the hotels.

export const MAGNET_FPS = 30;
const W = 1080;
const H = 1920;

// Fine Taste by miyagisama: 123 bpm. Its kicks, measured in the bass (7.70, 8.20, 8.67,
// 9.15s), fall on -0.10s + n beats, so the drop's kick is beat 16 at 7.70s. (The first
// logo reels' grid, from 0.21s, put it at 7.96s: half a beat late, Scott: "match the
// peak".)
const BEAT = 0.4875;
const t = (beat: number) => Math.round((-0.1 + beat * BEAT) * MAGNET_FPS);
const DROP = t(16);
export const MAGNET_FRAMES = t(34) + 12;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const rand = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

// the CB's centre, the magnet under it
const B = { x: 540, y: 930 };
const LIGHT = -0.6; // the angle a filing catches the light at

// the pull: from beat 9, gathering speed all the way in (an exponential, so it creeps,
// then quickens, then rushes), every filing striking within a couple of frames of the kick
const PULL = t(9);
const RUSH = 6;

// Scattered over the frame, then paired with the CB's points by angle around the
// centre, so every filing flies more or less straight in.
const angleOf = (x: number, y: number) => Math.atan2(y - B.y, x - B.x);
const TARGETS = (filings as [number, number, number, number][])
  .map(([x, y, , along]) => ({ x, y, along }))
  .sort((a, b) => angleOf(a.x, a.y) - angleOf(b.x, b.y));
// each filing starts on a glint in one of the hotels (k: which), so it lifts out of that picture
const HOTELS = 4;
const SLOT = 2; // beats a hotel
const STARTS = (glints as [number, number, number][])
  .slice(0, TARGETS.length)
  .map(([x, y, k]) => ({ x, y, k }))
  .sort((a, b) => angleOf(a.x, a.y) - angleOf(b.x, b.y));
const MAX_D = Math.max(
  ...STARTS.map((s, i) => Math.hypot(TARGETS[i].x - s.x, TARGETS[i].y - s.y)),
);

const FILINGS = STARTS.map((s, i) => {
  const tg = TARGETS[i];
  const d = Math.hypot(tg.x - s.x, tg.y - s.y) / MAX_D;
  const dir = Math.atan2(tg.y - s.y, tg.x - s.x);
  return {
    s,
    tg,
    dir,
    angle0: rand(i + 13) * Math.PI,
    // thin tapered needles (Scott, 1 Nov: the short round-ended pieces "could be mistaken for bugs or maggots")
    len: 11 + 9 * rand(i + 17),
    width: 1.5 + 0.6 * rand(i + 19),
    tone: rand(i + 23),
    // lifting out of its hotel through that hotel's two beats
    appear:
      t(SLOT * s.k + 0.25) +
      Math.round(rand(i + 29) * (t(SLOT * s.k + 1.6) - t(SLOT * s.k + 0.25))),
    align: Math.max(
      t(SLOT * s.k + 2.2),
      t(8.5) + Math.round(d * (t(10.5) - t(8.5))),
    ),
    // the nearest a frame or two early, the farthest a frame or two after
    land: DROP - 2 + Math.round(4 * d + rand(i + 7)),
    // standing up on the stroke: pointing the way it came in, give or take
    stand: dir + (rand(i + 31) - 0.5) * 0.6,
  };
});

// nearest equivalent angle for a needle (it looks the same turned half a turn)
const toward = (from: number, to: number) => {
  let d = (to - from) % Math.PI;
  if (d > Math.PI / 2) d -= Math.PI;
  if (d < -Math.PI / 2) d += Math.PI;
  return from + d;
};

// where a filing is, which way it lies, and how long it reads (its streak in flight)
const filing = (i: number, f: number) => {
  const p = FILINGS[i];
  const settle = interpolate(f, [p.appear, p.appear + 8], [0, 1], {
    ...clamp,
    easing: EASE_OUT,
  });
  // a quick mechanical snap into line, not a slow turn
  const aligned = backOut(
    interpolate(f, [p.align, p.align + 5], [0, 1], clamp),
  );
  const facing = toward(p.angle0, p.dir);
  // no turn as they lift (a piece turning on the spot read as something alive)
  let angle = p.angle0 + (facing - p.angle0) * aligned;
  let x = p.s.x;
  let y = p.s.y - 14 * settle; // lifting off the picture
  let len = p.len;
  let near = 0; // how far in it has come, for its brightness
  if (f >= PULL) {
    const span = p.land - PULL;
    const u = Math.min(1, (f - PULL) / span);
    const k = (Math.exp(RUSH * u) - 1) / (Math.exp(RUSH) - 1);
    near = u;
    const dist = Math.hypot(p.tg.x - p.s.x, p.tg.y - p.s.y);
    x = p.s.x + (p.tg.x - p.s.x) * k;
    y += (p.tg.y - p.s.y) * k;
    if (f >= p.land) angle = toward(angle, p.dir) + (p.stand - p.dir);
    // its streak grows with its speed
    const speed =
      ((RUSH * Math.exp(RUSH * u)) / (Math.exp(RUSH) - 1) / span) * dist;
    // (kept short, so the rush reads as pieces flying, not streaks filling the frame)
    if (f < p.land) len = p.len + Math.min(45, speed * 0.8);
    // the strike: a little past the point and back
    const a = f - p.land;
    if (a >= 0) {
      const over = interpolate(a, [0, 2, 7], [0, 6, 0], clamp);
      x += Math.cos(p.dir) * over;
      y += Math.sin(p.dir) * over;
    }
  }
  return { x, y, angle, len, on: settle, near };
};

const GOLD_DARK = [140, 106, 53];
const GOLD_LIGHT = [232, 207, 148];
const HOT = [255, 243, 214];
// The lock: out from the centre of the CB over beats 17 to 19.5, each filing a few
// frames early or late so it crackles into place; then the colours even out, the solid
// gold closes the pinholes under the pieces, and the pieces fuse into it.
const LOCK = t(17);
const LOCK_SPAN = t(19.5) - t(17);
const MAX_R = Math.max(...TARGETS.map((p) => Math.hypot(p.x - B.x, p.y - B.y)));
const LOCKS = FILINGS.map((p, i) =>
  Math.max(
    LOCK,
    LOCK +
      Math.round(
        (Math.hypot(p.tg.x - B.x, p.tg.y - B.y) / MAX_R) * LOCK_SPAN +
          (rand(i + 37) - 0.5) * 12,
      ),
  ),
);
const UNIFY = [t(19.5), t(21)];
const SOLID = [t(19.75), t(21.25)];
const FUSE = [t(21), t(22.5)];
const CB_GOLD = [195, 158, 85];
const WARM = [222, 178, 98];
// a snap with a little overshoot, for the turn into line
function backOut(k: number) {
  return 1 + 2.7 * Math.pow(k - 1, 3) + 1.7 * Math.pow(k - 1, 2);
}

const mix = (a: number[], b: number[], k: number) =>
  a.map((v, j) => Math.round(v + (b[j] - v) * k));
const rgb = (c: number[]) => `rgb(${c[0]},${c[1]},${c[2]})`;

// The filings, either those still loose (bristling, in flight) or those locked into the
// mark (drawn inside the CB's outline); `glow` thickens them for the light layer.
const Filings: React.FC<{ frame: number; locked: boolean; glow?: number }> = ({
  frame,
  locked,
  glow = 1,
}) => {
  if (frame > FUSE[1]) return null;
  const unify = interpolate(frame, UNIFY, [0, 1], {
    ...clamp,
    easing: EASE_IN_OUT,
  });
  const fade = interpolate(frame, FUSE, [1, 0], clamp);
  // brighter as they come together: each piece warms as it nears the mark, and the
  // whole gathering keeps brightening from the strike to the lock
  const gather = interpolate(frame, [PULL, DROP, LOCK], [0.4, 1, 1.6], clamp);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {FILINGS.map((p, i) => {
        if (frame < p.appear || frame >= LOCKS[i] !== locked) return null;
        const q = filing(i, frame);
        const a = frame - LOCKS[i];
        const { x, y, len } = q;
        let { angle } = q;
        let on = 0;
        if (locked) {
          // snap round into line with the stroke, and light up
          const turn = backOut(interpolate(a, [0, 5], [0, 1], clamp));
          angle += (toward(angle, p.tg.along) - angle) * turn;
          on = interpolate(a, [0, 4], [0, 1], clamp);
        }
        // a glint when it turns to the light, a flash as it strikes and as it locks
        const glint =
          Math.pow(Math.abs(Math.cos(angle - LIGHT)), 6) +
          interpolate(frame - p.appear, [0, 2, 12], [0, 0.9, 0], clamp);
        const strike = interpolate(frame - p.land, [0, 1, 8], [0, 1, 0], clamp);
        const click = locked ? interpolate(a, [0, 1, 7], [0, 1, 0], clamp) : 0;
        const base = mix(GOLD_DARK, GOLD_LIGHT, p.tone);
        const lit = mix(
          base,
          HOT,
          Math.min(
            1,
            0.55 * glint +
              0.8 * strike +
              0.7 * click +
              0.4 * on +
              0.5 * gather * q.near,
          ),
        );
        // the light layer is warm gold throughout, flaring pale as each piece clicks in
        const c =
          glow > 1
            ? mix(WARM, HOT, click)
            : mix(lit, CB_GOLD, unify * (1 - click));
        // locked, the sharp piece flashes and then melts into its own light, so the
        // fill reads smooth rather than as sticks on top (the light layer stays)
        const melt =
          locked && glow === 1 ? interpolate(a, [3, 16], [1, 0], clamp) : 1;
        const dx = (Math.cos(angle) * len) / 2;
        const dy = (Math.sin(angle) * len) / 2;
        const opacity = q.on * fade * (0.6 + 0.4 * q.near) * melt;
        if (glow > 1)
          return (
            <line
              key={i}
              x1={x - dx}
              y1={y - dy}
              x2={x + dx}
              y2={y + dy}
              stroke={rgb(c)}
              strokeWidth={p.width * glow}
              strokeLinecap="round"
              opacity={opacity}
            />
          );
        // a sharp needle: pointed at both ends, widest in the middle
        const nx = (-Math.sin(angle) * p.width) / 2;
        const ny = (Math.cos(angle) * p.width) / 2;
        return (
          <polygon
            key={i}
            points={`${(x - dx).toFixed(2)},${(y - dy).toFixed(2)} ${(x + nx).toFixed(2)},${(y + ny).toFixed(2)} ${(x + dx).toFixed(2)},${(y + dy).toFixed(2)} ${(x - nx).toFixed(2)},${(y - ny).toFixed(2)}`}
            fill={rgb(c)}
            opacity={opacity}
          />
        );
      })}
    </svg>
  );
};

// The CB, placed as in the pins reel: 860 wide, centred at (540, 930).
const CB_W = 860;
const SC = CB_W / 418;
const SVG = { w: 534.25 * SC, h: 655.69 * SC };
const svgLeft = B.x - CB_W / 2 - 58.4 * SC;
const svgTop = B.y - (451.5 * SC) / 2;
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
const cbBox = {
  position: "absolute",
  left: svgLeft,
  top: svgTop,
  width: SVG.w,
  height: SVG.h,
} as const;

export const MagnetFilm: React.FC = () => {
  const frame = useCurrentFrame();

  // a warmth in the CB's shape once the filings are on it, growing so the gathering only
  // gets brighter (nothing before the drop: the filings alone reveal the mark)
  const field = interpolate(frame, [DROP, LOCK], [0, 0.22], {
    ...clamp,
    easing: EASE_IN_OUT,
  });
  // the strike: a small punch in as the bulk of the filings land
  const punch = interpolate(
    frame,
    [DROP - 1, DROP + 3, DROP + 18],
    [0, 1, 0],
    clamp,
  );
  const bloom = interpolate(
    frame,
    [PULL, DROP, LOCK, LOCK + LOCK_SPAN],
    [0.25, 0.65, 0.85, 1],
    clamp,
  );
  // the solid gold closing the last pinholes under the locked pieces
  const solid = interpolate(frame, SOLID, [0, 1], {
    ...clamp,
    easing: EASE_IN_OUT,
  });
  const fused = interpolate(frame, [LOCK, SOLID[1]], [0, 1], clamp);
  const settle = interpolate(frame, [t(24), t(26.5)], [0, 1], {
    ...clamp,
    easing: EASE_IN_OUT,
  });
  const full = interpolate(frame, [t(26.5), t(28)], [0, 1], {
    ...clamp,
    easing: EASE_IN_OUT,
  });
  const shimmer = interpolate(frame, [t(28.5), t(30.5)], [-0.6, 1.6], clamp);
  const out = interpolate(
    frame,
    [MAGNET_FRAMES - 24, MAGNET_FRAMES - 2],
    [1, 0],
    clamp,
  );

  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      {/* the hotels, a hotel every two beats on a hard cut, dimming away as their gold lifts out */}
      {Array.from({ length: HOTELS }, (_, k) => {
        const a = t(SLOT * k);
        const b = t(SLOT * (k + 1));
        if (
          frame < a ||
          frame >= (k === HOTELS - 1 ? t(SLOT * HOTELS + 1.5) : b)
        )
          return null;
        const dim = interpolate(frame, [a + 4, b], [1, 0.32], clamp);
        const gone =
          k === HOTELS - 1
            ? interpolate(frame, [b, t(SLOT * HOTELS + 1.5)], [1, 0], clamp)
            : 1;
        return (
          <AbsoluteFill key={k} style={{ opacity: dim * gone }}>
            <Img
              src={staticFile(`campaigns/magnet/hotels/${k}.jpg`)}
              style={{
                width: W,
                height: H,
                transform: `scale(${1.02 + 0.03 * interpolate(frame, [a, b], [0, 1], clamp)})`,
              }}
            />
          </AbsoluteFill>
        );
      })}
      <AbsoluteFill style={{ opacity: out }}>
        <Img
          src={CB_SRC}
          style={{
            ...cbBox,
            opacity: field * (1 - fused),
            filter: "blur(34px) brightness(1.2)",
          }}
        />
        <AbsoluteFill
          style={{
            transform: `scale(${1 + 0.015 * punch})`,
            transformOrigin: `${B.x}px ${B.y}px`,
          }}
        >
          <AbsoluteFill>
            <Filings frame={frame} locked={false} />
          </AbsoluteFill>
          <AbsoluteFill
            style={{
              filter: "blur(7px)",
              mixBlendMode: "screen",
              opacity: bloom,
            }}
          >
            <Filings frame={frame} locked={false} />
          </AbsoluteFill>
        </AbsoluteFill>
        {/* the solid CB through the filings, then the full logo and a shimmer on the CB */}
        <AbsoluteFill
          style={{
            transform: `translateY(${-75 * settle}px) scale(${1 - 0.5 * settle})`,
            transformOrigin: `${B.x}px ${B.y}px`,
          }}
        >
          <Img
            src={CB_SRC}
            style={{
              ...cbBox,
              opacity: solid,
              filter: `drop-shadow(0 0 ${30 * solid}px rgba(195,158,85,0.35))`,
            }}
          />
          <Img src={LOGO_SRC} style={{ ...cbBox, opacity: full }} />
          <AbsoluteFill
            style={{
              ...cbMask,
              opacity: full,
              background: `linear-gradient(115deg, rgba(255,245,220,0) ${shimmer * 100 - 18}%, rgba(255,245,220,0.75) ${shimmer * 100}%, rgba(255,245,220,0) ${shimmer * 100 + 18}%)`,
            }}
          />
        </AbsoluteFill>
        {/* the locked pieces lit inside the CB's outline: their light, drawn thick and
            blurred, runs together and fills the mark, the small pieces sharp over it */}
        <AbsoluteFill style={cbMask}>
          <AbsoluteFill
            style={{
              filter: "blur(28px)",
              mixBlendMode: "screen",
              opacity: 0.7 * (1 - 0.85 * solid),
            }}
          >
            <Filings frame={frame} locked glow={12} />
          </AbsoluteFill>
          <AbsoluteFill
            style={{
              filter: "blur(14px)",
              mixBlendMode: "screen",
              opacity: 0.75 * (1 - 0.85 * solid),
            }}
          >
            <Filings frame={frame} locked glow={6} />
          </AbsoluteFill>
          <AbsoluteFill>
            <Filings frame={frame} locked />
          </AbsoluteFill>
        </AbsoluteFill>
      </AbsoluteFill>
      <FilmFinish />
      <Audio
        src={staticFile("campaigns/deck/music-fine-taste.mp3")}
        volume={(f) =>
          interpolate(f, [MAGNET_FRAMES - 30, MAGNET_FRAMES], [1.07, 0], clamp)
        }
      />
      {Array.from({ length: HOTELS }, (_, k) => (
        <Sequence
          key={k}
          from={t(SLOT * k + 0.25)}
          durationInFrames={t(SLOT * k + 2) - t(SLOT * k + 0.25)}
          layout="none"
        >
          <Audio
            src={staticFile("campaigns/magnet/sprinkle.wav")}
            volume={0.13}
          />
        </Sequence>
      ))}
      <Sequence from={PULL} layout="none">
        <Audio src={staticFile("campaigns/magnet/creep.wav")} volume={0.2} />
      </Sequence>
      <Sequence from={LOCK} layout="none">
        <Audio src={staticFile("campaigns/magnet/lock.wav")} volume={0.3} />
      </Sequence>
      <Sequence from={DROP} layout="none">
        <Audio src={staticFile("campaigns/magnet/snap.wav")} volume={0.45} />
      </Sequence>
    </AbsoluteFill>
  );
};
