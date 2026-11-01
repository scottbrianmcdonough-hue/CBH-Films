import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { FilmFinish } from "../components/FilmFinish";
import { colors, EASE_IN_OUT } from "../theme";
import { FLIP_PHOTOS } from "./photos";

// The comic flip (Scott: "like the Marvel movies intro, the comic book flipbooks into the
// logo", but "not ripped", so nobody can say we copied it): our own photographs, never comic
// art, flicked from the top like a stack of prints or the Departures flap board (not
// turned over a left spine like comic pages), the first few held long enough to see with a
// slow push-in, then faster and faster; black and gold, not red, and our monogram, not a
// wordmark. At full speed the CB crossfades in (Scott: "a cross fade into the CB"): the pages keep flipping inside the letters while everything outside
// them dissolves to black, the CB easing back from big to its place in the logo; the
// riffle slows, the pages inside dissolve into gold and the full CBH logo settles round
// it with the shimmer. A silent mock-up for now: timings
// in frames, to be cut to a track with a build and a hit.

export const COMIC_FLIP_FRAMES = 368;

const W = 1080;
const H = 1920;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const GRADE =
  "sepia(0.32) hue-rotate(-15deg) saturate(1.12) contrast(1.02) brightness(0.96)";

// The CB monogram in the official logo's frame (viewBox 534.25 x 655.69): the mask, and the
// logo it must line up with at the end.
const CB = staticFile("brand/cbh-logo-cb-only.svg");
const LOGO = staticFile("brand/cbh-logo-on-dark.svg");
const VB: [number, number] = [534.25, 655.69];
const CENTRE: [number, number] = [267.4, 225.75]; // the middle of the CB's bounding box
const START = 2.4; // the CB's size when it starts to show, x its size in the logo
const LOGO_W = 640;
const LOGO_X = (W - LOGO_W) / 2;
const LOGO_Y = 470;
const LOGO_S = LOGO_W / VB[0];

// Timeline (frames)
const PULL = [160, 244]; // the CB eases back to its place in the logo
const XF = [168, 218]; // the crossfade: outside the CB dissolves to black
const SLOW = 244; // the riffle slows from here to a stop
const GOLD = [264, 290]; // the pages give way to gold inside the CB
const LOGO_IN = [282, 314]; // the rest of the logo fades up round the CB
const SHIMMER = 318;

// The riffle: the first pages hold 28, 24, 20 and 16 frames (Scott: "start the few
// slower"), then each interval is 0.8 of the last down to 2 (full speed by ~143), growing
// again after SLOW; each page flicks up over its top edge as the next shows beneath.
const OPENING = [28, 24, 20, 16];
const schedule = (() => {
  const starts: number[] = [];
  let t = 0;
  let iv = OPENING[0];
  while (t < GOLD[1]) {
    const k = starts.length;
    starts.push(t);
    if (k < OPENING.length) iv = OPENING[k];
    else if (t < SLOW) iv = Math.max(2, iv * 0.8);
    else iv = Math.min(16, iv * 1.45);
    t += iv;
  }
  return starts;
})();

const Page: React.FC<{ src: string; push?: number }> = ({ src, push = 1 }) => (
  <Img
    src={staticFile(src)}
    style={{
      position: "absolute",
      inset: 0,
      width: W,
      height: H,
      objectFit: "cover",
      filter: GRADE,
      transform: `scale(${push})`,
    }}
  />
);

const Riffle: React.FC = () => {
  const frame = useCurrentFrame();
  let i = schedule.findIndex((s, k) => frame < (schedule[k + 1] ?? Infinity));
  if (i < 0) i = schedule.length - 1;
  const iv = (schedule[i + 1] ?? schedule[i] + 16) - schedule[i];
  // the page turns over in the last part of its interval (all of it at full speed)
  const dur = Math.max(2, Math.min(9, iv));
  const p = interpolate(
    frame,
    [schedule[i] + iv - dur, schedule[i] + iv],
    [0, 1],
    { ...clamp, easing: Easing.in(Easing.quad) },
  );
  const src = (k: number) => FLIP_PHOTOS[k % FLIP_PHOTOS.length];
  const fast = iv <= 3;
  // a slow push-in on each page while it is on top (only shows on the slow opening ones)
  const push = 1 + 0.05 * Math.min(1, (frame - schedule[i]) / 28);
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      {/* the next page underneath, darkened by the shadow of the one turning */}
      <Page src={src(i + 1)} />
      <AbsoluteFill
        style={{
          backgroundColor: "#000",
          opacity: 0.45 * (1 - p) * (p > 0 ? 1 : 0),
        }}
      />
      {/* the page flicking up over its top edge, catching the light as it lifts */}
      <AbsoluteFill
        style={{
          transformOrigin: "50% 0%",
          transform: `perspective(2600px) rotateX(${p * 100}deg)`,
          filter: fast ? "blur(1.4px)" : undefined,
          boxShadow: p > 0 ? `0 ${30 * p}px 60px rgba(0,0,0,0.5)` : undefined,
        }}
      >
        <Page src={src(i)} push={push} />
        <AbsoluteFill
          style={{
            background: `linear-gradient(to bottom, rgba(0,0,0,${0.5 * p}) 0%, rgba(255,240,210,${0.18 * Math.sin(p * Math.PI)}) 70%, rgba(0,0,0,0) 100%)`,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const ComicFlip: React.FC = () => {
  const frame = useCurrentFrame();
  // the CB eases back from START x to its size in the logo, its centre travelling from the
  // frame's centre to the logo's; the pages fill the frame throughout (and ease back a
  // little with it), so only the outside changes as it dissolves
  const t = interpolate(frame, PULL, [0, 1], { ...clamp, easing: EASE_IN_OUT });
  const masked = frame >= PULL[0];
  const s = LOGO_S * Math.exp(Math.log(START) * (1 - t));
  const fx = interpolate(t, [0, 1], [W / 2, LOGO_X + CENTRE[0] * LOGO_S]);
  const fy = interpolate(t, [0, 1], [H / 2, LOGO_Y + CENTRE[1] * LOGO_S]);
  const mx = fx - CENTRE[0] * s;
  const my = fy - CENTRE[1] * s;
  const outside = interpolate(frame, XF, [1, 0], {
    ...clamp,
    easing: EASE_IN_OUT,
  });
  const pages = 1 + 0.12 * (1 - t);
  const gold = interpolate(frame, GOLD, [0, 1], {
    ...clamp,
    easing: EASE_IN_OUT,
  });
  const logo = interpolate(frame, LOGO_IN, [0, 1], {
    ...clamp,
    easing: EASE_IN_OUT,
  });
  const sweep = interpolate(frame, [SHIMMER, SHIMMER + 30], [-60, 160], clamp);
  const maskStyle = masked
    ? {
        WebkitMaskImage: `url(${CB})`,
        maskImage: `url(${CB})`,
        WebkitMaskSize: `${VB[0] * s}px ${VB[1] * s}px`,
        maskSize: `${VB[0] * s}px ${VB[1] * s}px`,
        WebkitMaskPosition: `${mx}px ${my}px`,
        maskPosition: `${mx}px ${my}px`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
      }
    : {};
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      {/* the pages outside the CB, dissolving to black */}
      {outside > 0 && gold < 1 ? (
        <AbsoluteFill
          style={{ opacity: outside, transform: `scale(${pages})` }}
        >
          <Riffle />
        </AbsoluteFill>
      ) : null}
      {/* the same pages inside the CB, which stay */}
      <AbsoluteFill style={maskStyle}>
        {masked && gold < 1 ? (
          <AbsoluteFill style={{ transform: `scale(${pages})` }}>
            <Riffle />
          </AbsoluteFill>
        ) : null}
        {masked ? (
          <AbsoluteFill
            style={{ backgroundColor: colors.gold, opacity: gold }}
          />
        ) : null}
      </AbsoluteFill>
      {/* the full logo settles round the gold CB, then the shimmer crosses the CB */}
      <Img
        src={LOGO}
        style={{
          position: "absolute",
          left: LOGO_X,
          top: LOGO_Y,
          width: LOGO_W,
          height: LOGO_W * (VB[1] / VB[0]),
          opacity: logo,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: LOGO_X,
          top: LOGO_Y,
          width: LOGO_W,
          height: LOGO_W * (VB[1] / VB[0]),
          WebkitMaskImage: `url(${CB})`,
          maskImage: `url(${CB})`,
          WebkitMaskSize: "100% 100%",
          maskSize: "100% 100%",
          background: `linear-gradient(110deg, transparent ${sweep - 25}%, rgba(255,246,220,0.95) ${sweep}%, transparent ${sweep + 25}%)`,
        }}
      />
      <FilmFinish />
    </AbsoluteFill>
  );
};
