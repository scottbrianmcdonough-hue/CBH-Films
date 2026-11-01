import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { colors, EASE_IN_OUT, sans } from "../theme";

// Split-flap pieces for the Departures reel: a flap cell, a word of cells, and the flap
// turn (the whole frame as a grid of tiles, each turning over on its top hinge from one
// picture to the next, in a wave from an origin).

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const CHARS = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:";

// One split-flap cell: it riffles through `spin` random characters, a flap every 2 frames,
// from `start`, and settles on `ch`. Each change folds the top half down over the old one.
export const Cell: React.FC<{
  ch: string;
  start: number;
  spin: number;
  w: number;
  h: number;
  seed: string;
  color?: string;
}> = ({ ch, start, spin, w, h, seed, color = colors.cream }) => {
  const frame = useCurrentFrame();
  const STEP = 2;
  const t = (frame - start) / STEP;
  const n = Math.max(0, Math.min(spin, Math.floor(t)));
  const at = (k: number) =>
    k >= spin
      ? ch
      : CHARS[Math.floor(random(`${seed}-${k}`) * (CHARS.length - 1)) + 1];
  const cur = frame < start ? " " : at(n);
  const prev = n > 0 ? at(n - 1) : " ";
  const phase = t >= 0 && t < spin ? t - Math.floor(t) : 1;
  const face = (c: string, half: "top" | "bottom") => (
    <div
      style={{
        position: "absolute",
        left: 0,
        width: w,
        height: h / 2,
        top: half === "top" ? 0 : h / 2,
        overflow: "hidden",
        background:
          half === "top"
            ? "linear-gradient(#232326, #1b1b1e)"
            : "linear-gradient(#18181a, #141416)",
        borderRadius: half === "top" ? "6px 6px 0 0" : "0 0 6px 6px",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          width: w,
          height: h,
          top: half === "top" ? 0 : -h / 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: sans,
          fontWeight: 600,
          fontSize: h * 0.66,
          color,
          lineHeight: 1,
        }}
      >
        {c}
      </div>
    </div>
  );
  // the flap falling: the old top half folds down to the hinge, then the new bottom
  // half folds down from it
  const fold = phase < 1 && frame >= start;
  return (
    <div
      style={{
        position: "relative",
        width: w,
        height: h,
        perspective: 400,
        boxShadow: "0 3px 8px rgba(0,0,0,0.6)",
        borderRadius: 6,
      }}
    >
      {face(cur, "top")}
      {face(fold ? prev : cur, "bottom")}
      {fold && phase < 0.5 ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            transformOrigin: `50% ${h / 2}px`,
            transform: `rotateX(${-phase * 180}deg)`,
            backfaceVisibility: "hidden",
          }}
        >
          {face(prev, "top")}
        </div>
      ) : null}
      {fold && phase >= 0.5 ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            transformOrigin: `50% ${h / 2}px`,
            transform: `rotateX(${(1 - phase) * 180}deg)`,
          }}
        >
          {face(cur, "bottom")}
        </div>
      ) : null}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: h / 2 - 1,
          height: 2,
          background: "#050506",
        }}
      />
    </div>
  );
};

export const Word: React.FC<{
  text: string;
  len: number;
  start: number;
  w: number;
  h: number;
  gap?: number;
  color?: string;
  seed: string;
}> = ({ text, len, start, w, h, gap = 6, color, seed }) => (
  <div style={{ display: "flex", gap }}>
    {Array.from({ length: len }, (_, i) => (
      <Cell
        key={i}
        ch={text[i] ?? " "}
        start={start + i * 2}
        spin={3 + Math.floor(random(`${seed}-spin-${i}`) * 5)}
        w={w}
        h={h}
        seed={`${seed}-${i}`}
        color={color}
      />
    ))}
  </div>
);

// The flap turn. `front` and `back` are full 1080x1920 pictures (stills, posters or the
// board; never live video: there are 144 copies). The wave starts at tile `origin`.
const COLS = 9;
const ROWS = 16;
const TILE = 120;
export const FLAP_TURN = 30; // frames from the first tile to the last settling
export const FlapTurn: React.FC<{
  start: number;
  front: React.ReactNode;
  back: React.ReactNode;
  origin?: [number, number];
}> = ({ start, front, back, origin = [4, 7.5] }) => {
  const frame = useCurrentFrame();
  const far = Math.max(
    ...[
      [0, 0],
      [COLS - 1, 0],
      [0, ROWS - 1],
      [COLS - 1, ROWS - 1],
    ].map(([c, r]) => Math.hypot(c - origin[0], r - origin[1])),
  );
  const step = (FLAP_TURN - 9) / far;
  return (
    <AbsoluteFill style={{ backgroundColor: "#050506" }}>
      {Array.from({ length: COLS * ROWS }, (_, k) => {
        const c = k % COLS;
        const r = Math.floor(k / COLS);
        const d = Math.hypot(c - origin[0], r - origin[1]) * step;
        const p = interpolate(frame, [start + d, start + d + 9], [0, 1], {
          ...clamp,
          easing: EASE_IN_OUT,
        });
        const showBack = p >= 0.5;
        const angle = showBack ? (1 - p) * 180 : -p * 180;
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: c * TILE,
              top: r * TILE,
              width: TILE,
              height: TILE,
              perspective: 900,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 1,
                overflow: "hidden",
                transform: `rotateX(${angle}deg)`,
                filter: `brightness(${1 - Math.sin(p * Math.PI) * 0.5})`,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: -c * TILE - 1,
                  top: -r * TILE - 1,
                  width: 1080,
                  height: 1920,
                }}
              >
                {showBack ? back : front}
              </div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
