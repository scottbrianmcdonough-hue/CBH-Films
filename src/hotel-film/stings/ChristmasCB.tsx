import { Audio } from "@remotion/media";
import { getLength, getPointAtLength } from "@remotion/paths";
import React from "react";
import { AbsoluteFill, Img, interpolate, OffthreadVideo, random, staticFile, useCurrentFrame } from "remotion";
import { FilmFinish } from "../components/FilmFinish";
import { colors, EASE_IN_OUT, progress, serif } from "../theme";

// "Merry Christmas" (Scott, 31 Oct: "the merry christmas CB with the lights and depth"). Hintlesham Hall at night,
// its two Christmas trees lit by the door, as a depth move pushing in on the tree; the picture melts out of focus
// into fairy lights hanging in the dark at every depth, the camera drifting forward through them (near ones pass
// big and soft, far ones small; real parallax, drawn in perspective); a string of fairy lights in the plane of
// focus lights up bulb by bulb along the CB, twinkling, and "Merry Christmas" comes up. On the track's big hit the
// lights go dark round a solid gold CB, which eases into the centre at the brand moments' size as the wordmark comes
// up, and the shimmer crosses (as the window CB).

const W = 1080;
const H = 1920;
// the depth push (not committed from this session; rebuild it with):
//   python3 scripts/still-depth-dolly.py public/campaigns/festive/graded/hintlesham-hall-exterior.jpg \
//     public/campaigns/christmas-cb/hintlesham-push.mp4 --cx 960 --frames 150 --z0 1.0 --z1 1.16 \
//     --parallax 40 --dolly 0.06 --ease
const PUSH = "campaigns/christmas-cb/hintlesham-push.mp4";

// Music: Christmas Jazz (Tunetank; festive-lights-on used it from 14.1s to about 37s), its ending from 53.80s:
// the lights take over by 58.0s, the CB's bulbs light from the 58.03s hit to 60.42s, the line on 60.74s, the
// gold on the big hit at 64.53s, the tail to 68.71s. The render's audio is taken down 0.9 dB after (ffmpeg
// volume=-0.9dB) to -15.5 LUFS.
const MUSIC = "campaigns/festive/christmas-jazz.mp3";
const MUSIC_FROM = 53.8;
const at = (s: number) => Math.round((s - MUSIC_FROM) * 30);
export const CHRISTMAS_CB_FRAMES = at(68.71);

const BLUR = at(56.9); // the hall begins to go out of focus
const BULBS = [at(58.03), at(60.42)] as const;
const LINE = at(60.74);
const GOLD = at(64.53);

// The CB in the logo's frame (x 58-476, y 0-451), centred, 1.5x; the light string runs along the letters' middles
// (the window CB's finger strokes), a bulb every 19 units.
const CB_SCALE = 1.5;
const CX = 540;
const CY = 930;
const LOGO_BOX = { left: CX - 267 * CB_SCALE, top: CY - 225 * CB_SCALE, width: 534.25 * CB_SCALE, height: 655.69 * CB_SCALE };
const END_SCALE = 640 / LOGO_BOX.width;
const END_SHIFT = 960 - (LOGO_BOX.top + LOGO_BOX.height / 2);
const toScreen = (x: number, y: number) => [CX + (x - 267) * CB_SCALE, CY + (y - 225) * CB_SCALE] as const;
const STROKES = [
  "M340 74 C300 22 250 16 215 17 C150 18 100 62 90 140 C82 205 112 262 160 286 C178 294 190 297 205 298",
  "M258 158 L258 446",
  "M258 162 L350 162 C410 162 436 192 434 224 C432 262 402 290 330 294 L302 294",
  "M302 294 L352 294 C424 296 454 334 452 370 C450 418 410 446 352 446 L258 446",
];
const BULB_STEP = 19;
const STRING = (() => {
  const pts: { x: number; y: number; k: number; stroke: number }[] = [];
  const total = STROKES.reduce((n, d) => n + getLength(d), 0);
  let run = 0;
  for (const [si, d] of STROKES.entries()) {
    const len = getLength(d);
    for (let l = 0; l <= len; l += BULB_STEP) {
      const p = getPointAtLength(d, l);
      if (!p) continue;
      const [x, y] = toScreen(p.x, p.y);
      pts.push({ x, y, k: (run + l) / total, stroke: si });
    }
    run += len;
  }
  return pts;
})();

// The fairy lights in the dark: points in a box in front of the camera, warm gold and warm white.
const F = 820; // focal length, px
const FOCUS = 1100; // distance in focus
const LIGHTS = Array.from({ length: 260 }, (_, i) => ({
  x: (random(`lx${i}`) - 0.5) * 3400,
  y: (random(`ly${i}`) - 0.5) * 5200,
  z: 500 + random(`lz${i}`) * 5200,
  warm: random(`lw${i}`) < 0.72,
  tw: random(`lt${i}`) * 6.28,
}));

const Light: React.FC<{ x: number; y: number; r: number; o: number; warm: boolean }> = ({ x, y, r, o, warm }) => {
  const c = warm ? "255,196,120" : "255,236,205";
  return (
    <div style={{ position: "absolute", left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: "50%", opacity: o,
      background: `radial-gradient(circle, rgba(${c},0.95) 0%, rgba(${c},0.7) 38%, rgba(${c},0.18) 70%, rgba(${c},0) 100%)` }} />
  );
};

export const ChristmasCB: React.FC = () => {
  const frame = useCurrentFrame();
  const open = progress(frame, 0, 14);
  // the hall goes soft and dark, its lights becoming the fairy lights
  const soften = progress(frame, BLUR, 40, EASE_IN_OUT);
  const field = progress(frame, BLUR + 8, 44, EASE_IN_OUT);
  // the camera drifts forward through the lights, slowing as the CB lights up
  const camZ = interpolate(frame, [BLUR, BULBS[1] + 40, GOLD + 40], [0, 1500, 1900], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IN_OUT });
  const line = progress(frame, LINE, 46, EASE_IN_OUT);
  const dim = progress(frame, GOLD - 6, 36, EASE_IN_OUT);
  const fill = progress(frame, GOLD - 2, 20, EASE_IN_OUT);
  const zoom = progress(frame, GOLD + 24, 45, EASE_IN_OUT);
  const logo = progress(frame, GOLD + 54, 26, EASE_IN_OUT);
  const sweep = interpolate(frame, [GOLD + 90, GOLD + 120], [-60, 160], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const settle = { transform: `translateY(${END_SHIFT * zoom}px) scale(${1 - (1 - END_SCALE) * zoom})`, transformOrigin: "50% 50%" };
  const lit = interpolate(frame, [BULBS[0], BULBS[1]], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const lights = LIGHTS.map((l, i) => {
    const d = l.z - camZ;
    if (d < 90) return null;
    const s = F / d;
    const x = W / 2 + l.x * s;
    const y = H / 2 + l.y * s;
    // out of focus near and far: bigger and fainter the further from the plane in focus
    const blur = Math.min(1, Math.abs(d - FOCUS) / FOCUS);
    const r = Math.max(4, (5 + 46 * blur) * Math.min(2.4, s * 1.4));
    if (x < -r || x > W + r || y < -r || y > H + r) return null;
    const near = Math.min(1, (d - 90) / 260); // fading as it passes the camera
    const tw = 0.78 + 0.22 * Math.sin(frame * 0.09 + l.tw);
    const o = (0.95 - 0.6 * blur) * near * tw;
    return <Light key={i} x={x} y={y} r={r} o={o} warm={l.warm} />;
  });

  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      <AbsoluteFill style={{ opacity: open }}>
        {/* Hintlesham at night, pushing in on the lit tree, then melting out of focus */}
        <AbsoluteFill style={{ opacity: 1 - field * 0.85, filter: `blur(${soften * 26}px) brightness(${1 - 0.55 * soften})` }}>
          <OffthreadVideo src={staticFile(PUSH)} muted style={{ width: W, height: H }} />
        </AbsoluteFill>
        {/* the fairy lights at every depth */}
        <AbsoluteFill style={{ opacity: field * (1 - dim), mixBlendMode: "screen" }}>{lights}</AbsoluteFill>
        {/* the string along the CB, a faint wire and the bulbs lighting in turn, each twinkling */}
        <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: (1 - dim) * Math.min(1, lit * 4) }}>
          {STRING.map((p, i) => (i > 0 && STRING[i - 1].stroke === p.stroke && STRING[i - 1].k < lit ? (
            <line key={i} x1={STRING[i - 1].x} y1={STRING[i - 1].y} x2={p.x} y2={p.y} stroke="rgba(120,96,60,0.55)" strokeWidth={2} />
          ) : null))}
        </svg>
        <AbsoluteFill style={{ opacity: 1 - dim, mixBlendMode: "screen" }}>
          {STRING.map((p, i) => {
            const on = interpolate(lit, [p.k - 0.01, p.k + 0.02], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            if (on <= 0) return null;
            const tw = 0.82 + 0.18 * Math.sin(frame * 0.13 + i * 1.7);
            return (
              <React.Fragment key={i}>
                <Light x={p.x} y={p.y} r={30} o={0.55 * on * tw} warm />
                <Light x={p.x} y={p.y} r={8} o={on} warm={i % 5 === 0 ? false : true} />
              </React.Fragment>
            );
          })}
        </AbsoluteFill>
        {/* on the hit the lights go dark round a solid gold CB; it eases into the centre, the wordmark comes up,
            the shimmer */}
        <AbsoluteFill style={{ backgroundColor: colors.black, opacity: dim }} />
        <div style={{ position: "absolute", ...LOGO_BOX, ...settle }}>
          <Img src={staticFile("brand/cbh-logo-cb-only.svg")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: fill,
            filter: `drop-shadow(0 0 ${24 * (1 - zoom)}px rgba(255,190,110,${0.5 * (1 - zoom)}))` }} />
          <Img src={staticFile("brand/cbh-logo-on-dark.svg")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: logo }} />
          <div style={{ position: "absolute", inset: 0, WebkitMaskImage: `url(${staticFile("brand/cbh-logo-gold.svg")})`,
            maskImage: `url(${staticFile("brand/cbh-logo-gold.svg")})`, WebkitMaskSize: "100% 100%", maskSize: "100% 100%",
            background: `linear-gradient(110deg, transparent ${sweep - 25}%, rgba(255,246,220,0.95) ${sweep}%, transparent ${sweep + 25}%)` }} />
        </div>
        {/* the line above the letters: out of a blur, rising and settling in size (no letter-spacing move:
            Cormorant's ligatures snap as the spacing reaches zero); it goes with the lights */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", fontFamily: serif, fontSize: 112,
          lineHeight: 1.08, color: colors.cream, opacity: line * (1 - dim),
          transform: `translateY(${(1 - line) * 46}px) scale(${1 + (1 - line) * 0.04})`, filter: `blur(${(1 - line) * 10}px)`,
          textShadow: "0 0 34px rgba(0,0,0,0.7), 0 2px 10px rgba(0,0,0,0.5)" }}>
          Merry Christmas
        </div>
      </AbsoluteFill>
      <Audio src={staticFile(MUSIC)} trimBefore={Math.round(MUSIC_FROM * 30)}
        volume={(f) => 1.1 * interpolate(f, [0, 8, CHRISTMAS_CB_FRAMES - 45, CHRISTMAS_CB_FRAMES], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      <FilmFinish />
    </AbsoluteFill>
  );
};
