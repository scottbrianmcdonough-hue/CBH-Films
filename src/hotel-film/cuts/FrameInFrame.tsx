import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { FilmFinish } from "../components/FilmFinish";
import { TikTokText, TT_TOP } from "../doodle/StickFlip";
import { colors, EASE_IN_OUT, progress, sans, serif } from "../theme";

// Frame within a frame (Scott, 19 Nov, for TikTok): one hotel, going further in. Every picture holds a small
// framed picture of the next room; on the beat the camera dives through the frame until that room is the
// picture, which holds the next frame in turn: house, lounge, spa cafe, thermal suite, relaxation room, bed.
// One unbroken zoom, creeping between the dives so it never stands still.

const H = "campaigns/november-best-loved/hatherley-manor";
type Level = { src: string; pos?: string };
const LEVELS: Level[] = [
  { src: `${H}/exterior.jpg`, pos: "40% 50%" },
  { src: `${H}/lounge-bar.jpg`, pos: "38% 50%" },
  { src: `${H}/spa-cafe.jpg`, pos: "20% 50%" },
  { src: `${H}/spa-thermal-suite.jpg`, pos: "70% 50%" },
  { src: `${H}/spa-relaxation-full.jpg`, pos: "30% 50%" },
  { src: `${H}/superior-spa-double.jpg`, pos: "55% 50%" },
];

// Tech House vibes (Mixkit 130, 122 BPM) from 25.66s; only on the parked Whittlebury ticket, never posted
const MUSIC = "music/mixkit-tech-house-vibes-130.mp3";
const MUSIC_FROM = 25.66;
const BEAT = (60 / 122) * 30;
const b = (n: number) => Math.round(n * BEAT);
const PER = 4; // beats a room
const DIVE = 11; // frames a dive takes, ending on the beat
export const FIF_FRAMES = b(LEVELS.length * PER + 3);

const W = 1080;
const HH = 1920;
const F = 0.3; // the inner frame's size, as a share of the picture
const CX = 0.5;
const CY = 0.47; // where the inner frame hangs

// how far into level k the camera is: 0 at rest, 1 once its inner frame fills the picture
const depth = (frame: number) => {
  const k = Math.min(LEVELS.length - 1, Math.floor(frame / b(PER) + 1e-6));
  const start = b(k * PER);
  const next = b((k + 1) * PER);
  if (k === LEVELS.length - 1) return { k, t: 0, creep: Math.min(1, (frame - start) / (b(PER + 3))) };
  const t = progress(frame, next - DIVE, DIVE, EASE_IN_OUT);
  return { k, t, creep: Math.min(1, (frame - start) / (next - start)) };
};

const Room: React.FC<{ k: number; scale: number; nest: number }> = ({ k, scale, nest }) => {
  const lv = LEVELS[k];
  const border = 5 / scale;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: W, height: HH, overflow: "hidden" }}>
      <Img src={staticFile(lv.src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: lv.pos ?? "50% 50%" }} />
      {k + 1 < LEVELS.length && nest > 0 ? (
        <div style={{ position: "absolute", left: W * (CX - F / 2), top: HH * (CY - F / 2), width: W * F, height: HH * F, overflow: "hidden",
          borderRadius: 26 * (1 - Math.min(1, (scale * F - F) / (1 - F))), boxShadow: `0 0 0 ${border}px ${colors.cream}, 0 ${30 / scale}px ${80 / scale}px rgba(9,9,10,0.55)` }}>
          <div style={{ width: W, height: HH, transform: `scale(${F})`, transformOrigin: "0 0" }}>
            <Room k={k + 1} scale={scale * F} nest={nest - 1} />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export const FrameInFrame: React.FC = () => {
  const frame = useCurrentFrame();
  const { k, t, creep } = depth(frame);
  // the camera: a slow creep towards the inner frame, then the dive that makes it the picture
  const rest = 1 + 0.1 * creep;
  const scale = rest * Math.pow(1 / (F * rest), t);
  const labelO = progress(frame, b(PER) + 6, 8) * (1 - progress(frame, b(3 * PER) - DIVE - 6, 8));
  const last = LEVELS.length - 1;
  return (
    <AbsoluteFill style={{ background: "#09090a" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: HH, transform: `scale(${scale})`, transformOrigin: `${CX * 100}% ${CY * 100}%` }}>
        <Room k={k} scale={scale} nest={2} />
      </div>
      {labelO > 0 ? (
        <AbsoluteFill style={{ opacity: labelO }}>
          <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(9,9,10,0) 54%, rgba(9,9,10,0.6) 76%, rgba(9,9,10,0.3) 100%)" }} />
          <div style={{ position: "absolute", left: 72, bottom: 480 }}>
            <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 28, letterSpacing: "0.24em", color: colors.gold }}>COTSWOLDS, GLOUCESTER</div>
            <div style={{ fontFamily: serif, fontSize: 68, lineHeight: 1.08, marginTop: 12, color: colors.cream }}>Hatherley Manor<br />Hotel & Spa</div>
          </div>
        </AbsoluteFill>
      ) : null}
      <Audio src={staticFile(MUSIC)} trimBefore={Math.round(MUSIC_FROM * 30)}
        volume={(v) => interpolate(v, [0, 4, FIF_FRAMES - 16, FIF_FRAMES], [0, 1, 1, 0], { extrapolateRight: "clamp" })} />
      <FilmFinish />
      <Sequence durationInFrames={b(PER) - DIVE + 2} layout="none">
        <TikTokText lines={["POV: you only came", "for a look round"]} top={TT_TOP - 190} left={140} out={b(PER) - DIVE - 6} still />
      </Sequence>
      <Sequence from={b(last * PER) + 8} layout="none">
        <TikTokText lines={["which room would", "you stop in?"]} top={TT_TOP - 190} left={140} />
      </Sequence>
    </AbsoluteFill>
  );
};
