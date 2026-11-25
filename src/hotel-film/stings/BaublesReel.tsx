import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { EASE_IN_OUT } from "../theme";
import { FeltOrnament } from "./FeltOrnament";
import { BAUBLE_H, BAUBLE_W, GlassBauble } from "./GlassBauble";

// The baubles reel (Scott, 25 Nov: "these are better in motion", "do a track on it"): the glass and felt ornaments in
// one piece, cut on the downbeat, every ornament turning on its cord in the same dark tree, so on each cut only the
// ornament changes. Seven ornaments a bar each, felt and glass alternating; then the band's break bar, where the CB
// glass bauble rises out of the dark, landing face on as the band comes back in; a fade over the last bar.
// An AI assisted 3D render: GlassBauble.tsx and FeltOrnament.tsx, rendered live here (three.js).
//
// Music: "Jazz, The Last Table by the Window (Special Christmas Mix)" by OpenMindAudio (Pixabay 628307, Pixabay
// Content License, not Content ID registered: Scott, 25 Nov). ~74.9 BPM (a beat every 0.8011s); its downbeats run
// 197.85, 201.05, 204.26 ... (librosa, the bass onsets fall on that phase); the band stops for a bar at ~220.3 and comes
// back on the 223.49 downbeat. The reel plays 197.85s to 229.89s, -14.2 LUFS before the gain.

export const BAUBLES_REEL_W = BAUBLE_W;
export const BAUBLES_REEL_H = BAUBLE_H;
const FROM = 197.85;
const BAR = 4 * 0.8011; // seconds
const cut = (n: number) => Math.round(n * BAR * 30); // frame of the nth downbeat
export const BAUBLES_REEL_FRAMES = cut(10); // 961, 32.0s

type Shot = { kind: "glass" | "felt"; variant: string; at: number };
// felt and glass alternating, each a bar, turning towards face on through its bar (glass from internal frame 110, felt
// from 100: both meet face on near the end of the bar)
const SHOTS: Shot[] = [
  { kind: "felt", variant: "star", at: 0 },
  { kind: "glass", variant: "key", at: 1 },
  { kind: "felt", variant: "manor", at: 2 },
  { kind: "glass", variant: "tea", at: 3 },
  { kind: "felt", variant: "stocking", at: 4 },
  { kind: "glass", variant: "manor", at: 5 },
  { kind: "felt", variant: "teapot", at: 6 },
];
const CB_AT = 7; // the break bar
const RETURN = 8; // the band comes back: the CB face on

const CbEnding: React.FC = () => {
  const f = useCurrentFrame(); // from the break bar
  const len = cut(10) - cut(CB_AT);
  // out of the dark through the break bar, fully lit as the band returns
  const dark = interpolate(f, [0, cut(RETURN) - cut(CB_AT)], [1, 0], { extrapolateRight: "clamp", easing: EASE_IN_OUT });
  // face on at the band's return, then a slow last turn
  const toFace = cut(RETURN) - cut(CB_AT);
  const rate = 0.3 / (len - toFace);
  return (
    <AbsoluteFill>
      <GlassBauble variant="cb" spin={{ from: -toFace * rate, to: 0.3, span: len }} />
      <AbsoluteFill style={{ background: "#000", opacity: dark }} />
    </AbsoluteFill>
  );
};

export const BaublesReel: React.FC = () => {
  const frame = useCurrentFrame();
  const total = BAUBLES_REEL_FRAMES;
  const fade = interpolate(frame, [cut(9), total - 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {SHOTS.map((s, i) => (
        <Sequence key={i} from={cut(s.at)} durationInFrames={cut(s.at + 1) - cut(s.at)}>
          <Sequence from={-(s.kind === "glass" ? 110 : 100)}>
            {s.kind === "glass" ? <GlassBauble variant={s.variant} /> : <FeltOrnament variant={s.variant} />}
          </Sequence>
        </Sequence>
      ))}
      <Sequence from={cut(CB_AT)} durationInFrames={total - cut(CB_AT)}>
        <CbEnding />
      </Sequence>
      <AbsoluteFill style={{ background: "#000", opacity: fade }} />
      <Audio
        src={staticFile("music/festive/openmindaudio-jazz-last-table-by-the-window-christmas-628307.mp3")}
        trimBefore={Math.round(FROM * 30)}
        volume={(v) => 0.88 * interpolate(v, [0, 3, cut(9), total - 2], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      />
    </AbsoluteFill>
  );
};
