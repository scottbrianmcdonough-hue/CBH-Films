import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { TikTokText } from "../doodle/StickFlip";
import { colors, progress, sans, serif } from "../theme";

// Starry Night, but a CBH hotel (Scott, 16 Nov: for TikTok, "animation stuff like the starry night"): Frensham
// Pond's dusk photo repainted in moving brush strokes, stars coming out in their rings, then the paint clears
// from the lit doorway and it is the real photograph. The picture is made by scripts/starry-night.py
// (public/stings/starry-night.mp4, 300 frames: paint to 165, clearing to 213); this adds the TikTok text, the
// house label and the music (Leva's Eternity, the Dalmahoy film's track, never posted).
export const STARRY_FRAMES = 300;
export const StarryNight: React.FC = () => {
  const frame = useCurrentFrame();
  const label = progress(frame, 214, 14);
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      <OffthreadVideo src={staticFile("stings/starry-night.mp4")} muted />
      <AbsoluteFill style={{ opacity: label }}>
        {/* in the sky above the roof: lower down it sat on the hotel's own lit sign */}
        <div style={{ position: "absolute", left: 72, top: 720, textShadow: "0 2px 18px rgba(0,10,40,0.55)" }}>
          <div style={{ display: "inline-block" }}>
            <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 28, letterSpacing: "0.24em", color: colors.gold }}>FARNHAM, SURREY</div>
            <div style={{ height: 2, marginTop: 12, background: colors.gold }} />
          </div>
          <div style={{ fontFamily: serif, fontSize: 68, lineHeight: 1.08, marginTop: 14, color: colors.cream }}>Frensham Pond<br />Hotel & Spa</div>
        </div>
      </AbsoluteFill>
      <Audio src={staticFile("hotels/dalmahoy/leva-eternity.mp3")} trimBefore={55}
        volume={(v) => 0.83 * interpolate(v, [0, 8, STARRY_FRAMES - 30, STARRY_FRAMES], [0, 1, 1, 0], { extrapolateRight: "clamp" })} />
      <Sequence durationInFrames={160} layout="none">
        <TikTokText lines={["Starry Night,", "but make it Surrey"]} top={470} left={140} out={152} still />
      </Sequence>
      <Sequence from={226} layout="none">
        <TikTokText lines={["the real one has", "room service"]} top={470} left={140} />
      </Sequence>
    </AbsoluteFill>
  );
};
