import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { EASE_OUT, serif } from "../theme";
import { FeltOrnament } from "./FeltOrnament";
import { BAUBLE_FRAMES, BAUBLE_H, BAUBLE_W, DarkBack, GlassBauble } from "./GlassBauble";

// The baubles reel (Scott, 25 Nov: "these are better in motion", "do a track on it", then "the transitions between each
// bauble are rough, needs to be smoothed out and polished"): the glass and felt ornaments hanging along one tree, the
// camera gliding from one to the next on each downbeat (an eased move centred on the beat, a touch of motion blur at its
// fastest), one continuous background under them all drifting slower for depth, so nothing behind jumps. Seven ornaments
// a bar each, felt and glass alternating; in the band's break bar the camera glides to the CB glass bauble, which comes
// up out of the dim as the band returns, face on; then the line (Scott: "a Cormorant line at the end, festive for CBH")
// and a fade over the last bar. An AI assisted 3D render: GlassBauble.tsx and FeltOrnament.tsx, rendered live here.
//
// Music: "Jazz, The Last Table by the Window (Special Christmas Mix)" by OpenMindAudio (Pixabay 628307, Pixabay
// Content License, not Content ID registered: Scott, 25 Nov). ~74.9 BPM (a beat every 0.8011s); downbeats 197.85,
// 201.05, 204.26 ...; the band stops for a bar at ~220.3 and comes back on the 223.49 downbeat. The reel plays 197.85s
// to 229.89s, -14.2 LUFS before the gain.

export const BAUBLES_REEL_W = BAUBLE_W;
export const BAUBLES_REEL_H = BAUBLE_H;
const FROM = 197.85;
const BAR = 4 * 0.8011; // seconds
const cut = (n: number) => Math.round(n * BAR * 30); // frame of the nth downbeat
export const BAUBLES_REEL_FRAMES = cut(10); // 961, 32.0s

type Shot = { kind: "glass" | "felt"; variant: string };
const SHOTS: Shot[] = [
  { kind: "felt", variant: "star" },
  { kind: "glass", variant: "key" },
  { kind: "felt", variant: "manor" },
  { kind: "glass", variant: "tea" },
  { kind: "felt", variant: "stocking" },
  { kind: "glass", variant: "manor" },
  { kind: "felt", variant: "teapot" },
  { kind: "glass", variant: "cb" }, // the eighth: glided to in the break bar
];
const RETURN = 8; // the band comes back: the CB face on
const GLIDE = 24; // frames for each move, centred on its downbeat
const SPACING = 900; // the ornaments hang a little closer than a frame width, so a move reads as drifting along the tree
// the background's own drift per move, slower than the ornaments (depth); centred on the reel and kept inside its 1.15x
// scale, so the background's edge never comes into frame (at 45px a move it did, a vertical seam: Scott, "there's a split")
const BG_DRIFT = 18;
const BG_SCALE = 1.15;

const ease = Easing.bezier(0.45, 0, 0.55, 1);
// how far along the row the camera is at a frame: 0 at the first ornament, 1 at the second ..., gliding on each downbeat
const along = (f: number) => {
  let p = 0;
  for (let i = 1; i < SHOTS.length; i++) p += interpolate(f, [cut(i) - GLIDE / 2, cut(i) + GLIDE / 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  return p;
};

// where each ornament is in its own turn: glass faces on at its frame 175, felt at 155; each bar plays into face on
const startFrame = (s: Shot) => (s.kind === "glass" ? 110 : 100);

const Ornament: React.FC<{ s: Shot; i: number }> = ({ s, i }) => {
  if (s.variant === "cb" && s.kind === "glass") {
    // the CB: face on as the band returns (RETURN), then a slow last turn to the end
    const len = cut(10) - (cut(i) - GLIDE);
    const toFace = cut(RETURN) - (cut(i) - GLIDE);
    const rate = 0.3 / (len - toFace);
    return <GlassBauble variant="cb" bare spin={{ from: -toFace * rate, to: 0.3, span: len }} />;
  }
  return s.kind === "glass" ? <GlassBauble variant={s.variant} bare spin={{ from: -0.95, to: 0.35, span: BAUBLE_FRAMES }} /> : <FeltOrnament variant={s.variant} bare />;
};

const EndLine: React.FC = () => {
  const f = useCurrentFrame();
  const a = interpolate(f, [0, 22], [0, 1], { extrapolateRight: "clamp", easing: EASE_OUT });
  const b = interpolate(f, [8, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1085, textAlign: "center", color: "#f2f0f0" }}>
      <div style={{ fontFamily: serif, fontWeight: 400, fontSize: 70, lineHeight: 1.05, opacity: a, transform: `translateY(${(1 - a) * 16}px)` }}>Merry Christmas,</div>
      <div style={{ fontFamily: serif, fontStyle: "italic", fontWeight: 400, fontSize: 56, lineHeight: 1.25, opacity: 0.94 * b, transform: `translateY(${(1 - b) * 16}px)` }}>
        from our houses to yours
      </div>
    </div>
  );
};

export const BaublesReel: React.FC = () => {
  const frame = useCurrentFrame();
  const total = BAUBLES_REEL_FRAMES;
  const p = along(frame);
  const fade = interpolate(frame, [cut(9) + 24, total - 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {/* one tree under everything, drifting slower than the ornaments */}
      <AbsoluteFill style={{ transform: `translateX(${-(p - (SHOTS.length - 1) / 2) * BG_DRIFT}px) scale(${BG_SCALE})` }}>
        <DarkBack frame={frame} />
      </AbsoluteFill>
      {SHOTS.map((s, i) => {
        const from = i === 0 ? 0 : cut(i) - GLIDE;
        const to = i === SHOTS.length - 1 ? total : cut(i + 1) + GLIDE;
        const x = (i - p) * SPACING;
        const cb = i === SHOTS.length - 1;
        return (
          <Sequence key={i} from={from} durationInFrames={to - from}>
            <AbsoluteFill
              style={{
                transform: `translateX(${x}px)`,

              }}
            >
              {/* each ornament's turn runs from where its bar needs it (it is mounted GLIDE frames early) */}
              <Sequence from={cb ? 0 : -(startFrame(s) - (i === 0 ? 0 : GLIDE))}>
                <Ornament s={s} i={i} />
              </Sequence>
            </AbsoluteFill>
          </Sequence>
        );
      })}
      {/* the light falling away round the edges, over everything, so the ornament sits in a warm pool */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 65% at 50% 55%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 70%, rgba(0,0,0,0.8) 100%)" }} />
      <Sequence from={cut(RETURN) + 24}>
        <EndLine />
      </Sequence>
      <AbsoluteFill style={{ background: "#000", opacity: fade }} />
      <Audio
        src={staticFile("music/festive/openmindaudio-jazz-last-table-by-the-window-christmas-628307.mp3")}
        trimBefore={Math.round(FROM * 30)}
        volume={(v) => 0.88 * interpolate(v, [0, 3, cut(9) + 24, total - 2], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      />
    </AbsoluteFill>
  );
};
