import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { colors, sans, serif } from "../theme";

// Ruthin Castle's "Happy Friday the 13th" GIF brought to the house style (Scott, 13 Nov: "bring this gif up to house
// style and standard"), 4:5 for the Facebook feed (Scott: "it's for Facebook, make the dimensions right"). Four of the hotel's photos dissolve one into the next with a slow
// push, and the last dissolves back into the first, so the GIF loops without a seam: the castle and its peacock, the
// suit of armour at the window, the lounge with its playing card prints (a nod to luck), the burger by the fire. The
// words hold still in the house label order: the place in spaced gold caps with its underline, the line in cream
// Cormorant beneath; the white CB in the corner.

const D = "campaigns/ruthin-friday13/";
const SHOTS = [
  { src: D + "castle-peacock.jpg", pos: "34% 50%" },
  { src: D + "armour.jpg", pos: "66% 45%" },
  { src: D + "lounge.jpg", pos: "70% 55%" },
  { src: D + "burger-fire.jpg", pos: "45% 60%" },
];
const EACH = 66; // frames a photo holds
const FADE = 18; // the dissolve into the next
export const FRIDAY13_FRAMES = SHOTS.length * EACH;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const RuthinFriday13: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      {SHOTS.map((s, i) => {
        // each photo starts dissolving in FADE frames before its slot; the first also dissolves in at the very end,
        // over the last, so frame 0 follows the last frame seamlessly
        const start = i * EACH;
        // frames since this photo's slot began (the first photo's dissolve at the end counts as before frame 0)
        const local = i === 0 && f >= FRIDAY13_FRAMES - FADE ? f - FRIDAY13_FRAMES : f - start;
        const opacity =
          i === 0
            ? f >= FRIDAY13_FRAMES - FADE
              ? interpolate(f, [FRIDAY13_FRAMES - FADE, FRIDAY13_FRAMES], [0, 1], clamp)
              : 1
            : interpolate(f, [start - FADE, start], [0, 1], clamp) * (f < start + EACH ? 1 : 0);
        // a slow push over the photo's time on screen, the same speed for each
        const t = (local + FADE) / (EACH + FADE);
        const z = 1.02 + 0.06 * Math.min(1, Math.max(0, t));
        return (
          <AbsoluteFill key={s.src} style={{ opacity, zIndex: i === 0 && f >= FRIDAY13_FRAMES - FADE ? 10 : i }}>
            <Img
              src={staticFile(s.src)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: s.pos,
                transform: `scale(${z})`,
                transformOrigin: s.pos,
                filter: "saturate(1.04) contrast(1.02)",
              }}
            />
          </AbsoluteFill>
        );
      })}
      {/* a soft dark from the bottom left so the words read on every photo */}
      <AbsoluteFill
        style={{
          zIndex: 20,
          background:
            "radial-gradient(ellipse 1050px 640px at 0% 100%, rgba(9,9,10,0.9) 0%, rgba(9,9,10,0.66) 48%, rgba(9,9,10,0) 100%)",
        }}
      />
      <div style={{ position: "absolute", zIndex: 21, left: 72, bottom: 92 }}>
        <div style={{ display: "inline-block" }}>
          <div
            style={{
              fontFamily: sans,
              fontWeight: 700,
              fontSize: 34,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: colors.gold,
              textShadow: "0 0 2px rgba(9,9,10,0.9), 0 1px 10px rgba(9,9,10,0.7)",
            }}
          >
            Ruthin Castle Hotel &amp; Spa
          </div>
          <div style={{ height: 3, background: colors.gold, marginTop: 14 }} />
        </div>
        {["Happy Friday", "the 13th"].map((l, i) => (
          <div
            key={l}
            style={{
              fontFamily: serif,
              fontStyle: i ? "italic" : "normal",
              fontSize: i ? 88 : 104,
              lineHeight: 1.04,
              color: colors.cream,
              marginTop: i ? 0 : 20,
              textShadow: "0 3px 28px rgba(9,9,10,0.55), 0 1px 3px rgba(9,9,10,0.45)",
            }}
          >
            {l}
          </div>
        ))}
      </div>
      <Img
        src={staticFile("brand/cb-watermark.png")}
        style={{ position: "absolute", zIndex: 21, right: 60, top: 56, width: 84, height: 91, filter: "drop-shadow(0 2px 8px rgba(9,9,10,0.45))" }}
      />
    </AbsoluteFill>
  );
};
