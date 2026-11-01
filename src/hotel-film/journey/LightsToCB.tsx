import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile } from "remotion";
import { colors, EASE_IN_OUT } from "../theme";
import targets from "../pins/cb-targets.json";

// The journey's ending (Scott, 21 Oct: "the CBH lights from the map, not just the logo
// floating up"): the pins-to-cb finale on the journey's own map. Every lit pin (the 21
// stops and the 36 the burst lit) lifts off the map on the beat, flies trailing light into
// a point of the CB (the pins reel's targets, paired by band and order across so the
// flights don't cross more than they must), lands with a soft pulse; their light grows
// until the halos run into one glow in the CB's shape, the solid CB comes through it, and
// it settles into the full logo, centred, with one shimmer across the CB alone. Timed in
// beats from the lift, tighter than the pins reel (it ends a 48s film).

const W = 1080;
const H = 1920;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const rand = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

// The CB, placed by the whole logo's SVG frame (534.25 x 655.69), the CB the box
// 58.4..476.4 x 0..451.5 inside it, 860 wide, centred at (540, 930), as the targets are.
const CB_W = 860;
const SC = CB_W / 418;
const SVG = { w: 534.25 * SC, h: 655.69 * SC };
const CB_CX = 540;
const CB_CY = 930;
const svgLeft = CB_CX - CB_W / 2 - 58.4 * SC;
const svgTop = CB_CY - (451.5 * SC) / 2;
const CB_SRC = staticFile("brand/cbh-logo-cb-only.svg");
const LOGO_SRC = staticFile("brand/cbh-logo-on-dark.svg");
// settled: the full logo at half size, its centre at y 900 (clear of the bottom safe zone)
const END_SCALE = 0.5;
const LOGO_CY = 900;
const END_Y = LOGO_CY - (svgTop + SVG.h / 2 - CB_CY) * END_SCALE - CB_CY; // the CB's own shift

const byBand = (a: [number, number], b: [number, number]) =>
  Math.round(a[1] / 140) - Math.round(b[1] / 140) || a[0] - b[0];
const TARGETS = (targets as [number, number][]).slice().sort(byBand);

export const lightsLength = (beat: number) => Math.round(8.7 * beat);

export const LightsToCB: React.FC<{
  frame: number; // frames since the lift began
  beat: number; // frames per beat
  origins: { x: number; y: number }[]; // the pins on screen now
}> = ({ frame, beat, origins }) => {
  const b = (n: number) => n * beat;
  const flight = Math.round(b(1.6));
  // pair each pin with a target by band and order across
  const order = origins
    .map((_, i) => i)
    .sort((i, j) =>
      byBand([origins[i].x, origins[i].y], [origins[j].x, origins[j].y]),
    );
  const lift = (i: number) => Math.round(rand(i + 41) * b(0.5));
  const place = (i: number, f: number) => {
    const p = origins[i];
    const target = TARGETS[order.indexOf(i) % TARGETS.length];
    const k = interpolate(f, [lift(i), lift(i) + flight], [0, 1], {
      ...clamp,
      easing: EASE_IN_OUT,
    });
    if (k <= 0) return { x: p.x, y: p.y, k };
    if (k >= 1) return { x: target[0], y: target[1], k };
    const mx = (p.x + target[0]) / 2;
    const my = (p.y + target[1]) / 2;
    const dx = mx - W / 2;
    const dy = my - H / 2;
    const len = Math.hypot(dx, dy) || 1;
    const bow = 160 + 120 * rand(i + 77);
    const cx = mx + (dx / len) * bow;
    const cy = my + (dy / len) * bow - 120;
    const u = 1 - k;
    return {
      x: u * u * p.x + 2 * u * k * cx + k * k * target[0],
      y: u * u * p.y + 2 * u * k * cy + k * k * target[1],
      k,
    };
  };
  const ease = (a: number, z: number) =>
    interpolate(frame, [b(a), b(z)], [0, 1], { ...clamp, easing: EASE_IN_OUT });
  const bloom = interpolate(frame, [0, 2, 18], [0, 0.45, 0], clamp);
  const lightIn = ease(2.4, 3.5);
  const solid = ease(3.0, 4.5);
  const pinsOut = 1 - ease(3.8, 4.8);
  const settle = ease(4.8, 6.2);
  const full = ease(5.8, 6.8);
  const shimmer = interpolate(frame, [b(7), b(8.6)], [-0.6, 1.6], clamp);
  const cbScale = 1 - (1 - END_SCALE) * settle;
  const cbY = END_Y * settle;
  const pinR = 7;
  const mask = {
    WebkitMaskImage: `url(${CB_SRC})`,
    maskImage: `url(${CB_SRC})`,
    WebkitMaskSize: `${SVG.w}px ${SVG.h}px`,
    maskSize: `${SVG.w}px ${SVG.h}px`,
    WebkitMaskPosition: `${svgLeft}px ${svgTop}px`,
    maskPosition: `${svgLeft}px ${svgTop}px`,
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
  } as const;
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${CB_CX}px ${CB_CY}px, rgba(195,158,85,${bloom}) 0%, rgba(195,158,85,0) 45%)`,
        }}
      />
      {/* the lights in flight with trails, landed and growing into one glow; the second
          copy is clipped to the CB, so the grown light keeps its shape */}
      {[0, 1].map((clipped) => (
        <AbsoluteFill
          key={clipped}
          style={{
            transform: `translateY(${cbY}px) scale(${cbScale})`,
            transformOrigin: `${CB_CX}px ${CB_CY}px`,
            opacity: pinsOut * (clipped ? lightIn : 1 - lightIn),
            ...(clipped ? mask : {}),
          }}
        >
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
            <defs>
              <radialGradient id={`lightglow${clipped}`}>
                <stop offset="0" stopColor="#FFF3D6" stopOpacity={0.9} />
                <stop
                  offset="0.4"
                  stopColor={colors.lightGold}
                  stopOpacity={0.45}
                />
                <stop offset="1" stopColor={colors.gold} stopOpacity={0} />
              </radialGradient>
            </defs>
            {origins.map((_, i) => {
              const pos = place(i, frame);
              const landFlash = interpolate(
                frame,
                [
                  lift(i) + flight - 3,
                  lift(i) + flight + 3,
                  lift(i) + flight + 26,
                ],
                [0, 0.8, 0],
                clamp,
              );
              const glow = Math.max(0.35 * (1 - pos.k), landFlash, lightIn);
              const r = pinR;
              const halo = r * (3 + 3 * glow + 22 * lightIn);
              const trail: React.ReactNode[] = [];
              if (pos.k > 0 && pos.k < 1) {
                for (let k = 1; k <= 12; k++) {
                  const q = place(i, frame - 1.25 * k);
                  trail.push(
                    <circle
                      key={k}
                      cx={q.x}
                      cy={q.y}
                      r={r * (1 - k / 14)}
                      fill={colors.lightGold}
                      opacity={0.45 * (1 - k / 13)}
                    />,
                  );
                }
              }
              return (
                <g key={i}>
                  {trail}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={halo}
                    fill={`url(#lightglow${clipped})`}
                    opacity={Math.min(1, glow)}
                  />
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={r * (1 + 0.6 * lightIn)}
                    fill={colors.gold}
                  />
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={r * (0.45 + 0.4 * lightIn)}
                    fill="#FFF3D6"
                    opacity={0.7 + 0.3 * lightIn}
                  />
                </g>
              );
            })}
          </svg>
        </AbsoluteFill>
      ))}
      {/* the solid CB through the light, then the full logo and one shimmer */}
      <AbsoluteFill
        style={{
          transform: `translateY(${cbY}px) scale(${cbScale})`,
          transformOrigin: `${CB_CX}px ${CB_CY}px`,
        }}
      >
        <Img
          src={CB_SRC}
          style={{
            position: "absolute",
            left: svgLeft,
            top: svgTop,
            width: SVG.w,
            height: SVG.h,
            opacity: solid,
            filter: `blur(${(1 - solid) * 8}px) drop-shadow(0 0 ${30 * solid}px rgba(195,158,85,0.35))`,
          }}
        />
        <Img
          src={LOGO_SRC}
          style={{
            position: "absolute",
            left: svgLeft,
            top: svgTop,
            width: SVG.w,
            height: SVG.h,
            opacity: full,
          }}
        />
        <AbsoluteFill
          style={{
            ...mask,
            opacity: full,
            background: `linear-gradient(115deg, rgba(255,245,220,0) ${shimmer * 100 - 18}%, rgba(255,245,220,0.75) ${shimmer * 100}%, rgba(255,245,220,0) ${shimmer * 100 + 18}%)`,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
