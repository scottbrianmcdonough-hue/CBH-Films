import React from "react";
import { Audio, Video } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { colors, EASE_OUT, progress } from "../theme";
import { accent, personal } from "./personal-type";
import { Layers3D, mountainBasis } from "./DepthBreakdown";

// A demo of the depth moves for Scott's own LinkedIn (and a 9:16 for vertical feeds), on the
// Pexels photo of a hiker above a mountain lake (Scott: "the mountain looks great, the coffee
// cup is less impressive", "show the map of the mountain because that really pops"): the
// photo; its depth map (MiDaS) sweeping across and holding; the camera move on the music's
// drop; then the photo's layers pulled apart in 3D; "Made from / one photo" (Scott: "No footage / Just depth" was an AI tell). No full stops
// (Scott: "lose the punctuation"). Move from scripts/still-depth-dolly.py, the hillside as its
// own layer (public/demo/). Deep House Sunset (Sunset House Grooves, Pixabay 538759) from
// 27.0s: the map over its kickless bars, the move on the drop (31.40s), the 3D and the end
// card on downbeats.

export const DEPTH_DEMO_FRAMES = 571;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const DROP = 132; // the drop: the camera starts to move
const THREE = 308; // 12 beats later: the layers apart
const END = 483; // 12 more: the end card
const WIPE_IN = [44, 74];
const WIPE_OUT = [116, 130];
const MUSIC_START = Math.round(31.4 * 30) - DROP; // frames into the track at frame 0

const Line: React.FC<{
  text: string;
  from: number;
  to: number;
  bottom: number;
  size: number;
}> = ({ text, from, to, bottom, size }) => {
  const frame = useCurrentFrame();
  const inn = progress(frame, from, 16, EASE_OUT);
  const out = interpolate(frame, [to - 10, to], [1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom,
        textAlign: "center",
        fontFamily: personal,
        fontWeight: 500,
        letterSpacing: "-0.01em",
        fontSize: size,
        lineHeight: 1.1,
        color: accent,
        opacity: inn * out,
        transform: `translateY(${(1 - inn) * 24}px)`,
        textShadow: "0 1px 4px rgba(0,0,0,0.5), 0 0 30px rgba(0,0,0,0.6)",
      }}
    >
      {text}
    </div>
  );
};

export const DepthDemo: React.FC<{ aspect: "45" | "916" }> = ({ aspect }) => {
  const frame = useCurrentFrame();
  const tall = aspect === "916";
  const H = tall ? 1920 : 1350;
  const bottom = tall ? 420 : 150; // clear of a Reel's caption area on the 9:16
  const size = tall ? 66 : 56;
  // the depth map sweeps in from the left, holds, and sweeps back out, a white edge leading
  const wipe =
    frame < WIPE_OUT[0]
      ? interpolate(frame, WIPE_IN, [0, 100], {
          ...clamp,
          easing: Easing.inOut(Easing.cubic),
        })
      : interpolate(frame, WIPE_OUT, [100, 0], {
          ...clamp,
          easing: Easing.inOut(Easing.cubic),
        });
  const endIn = interpolate(frame, [END, END + 12], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black, overflow: "hidden" }}>
      <Audio
        src={staticFile("stings/deep-house-sunset.mp3")}
        trimBefore={MUSIC_START}
        volume={(f) =>
          0.57 *
          interpolate(
            f,
            [0, 3, DEPTH_DEMO_FRAMES - 30, DEPTH_DEMO_FRAMES],
            [0, 1, 1, 0],
            clamp,
          )
        }
      />
      {frame < DROP ? (
        <AbsoluteFill>
          <Img src={staticFile(`demo/mountain-${aspect}-still.jpg`)} />
          <AbsoluteFill style={{ clipPath: `inset(0 ${100 - wipe}% 0 0)` }}>
            <Img src={staticFile(`demo/mountain-${aspect}-depth.jpg`)} />
          </AbsoluteFill>
          {wipe > 0 && wipe < 100 ? (
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: `calc(${wipe}% - 1.5px)`,
                width: 3,
                backgroundColor: accent,
                boxShadow: `0 0 18px ${accent}`,
              }}
            />
          ) : null}
        </AbsoluteFill>
      ) : null}
      <Sequence from={DROP} durationInFrames={THREE - DROP}>
        <Video src={staticFile(`demo/mountain-${aspect}.mp4`)} muted />
      </Sequence>
      {frame >= THREE && frame < END + 12 ? (
        <Layers3D
          frame={frame}
          from={THREE}
          to={END + 30}
          frameH={H}
          basis={mountainBasis(tall)}
          layers={[
            ["demo/bm-far-v3.png", -650],
            ["demo/bm-mid-v6.png", -280],
            ["demo/bm-near-v2.png", 220],
          ]}
        />
      ) : null}
      {frame >= END ? (
        <AbsoluteFill
          style={{ backgroundColor: colors.black, opacity: endIn }}
        />
      ) : null}
      <Line text="One photo" from={6} to={44} bottom={bottom} size={size} />
      <Line
        text="Map its depth"
        from={58}
        to={116}
        bottom={bottom}
        size={size}
      />
      <Line
        text="Move the camera"
        from={DROP + 2}
        to={DROP + 62}
        bottom={bottom}
        size={size}
      />
      <Line
        text="Step inside"
        from={THREE + 2}
        to={THREE + 70}
        bottom={bottom}
        size={size}
      />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          fontFamily: personal,
          fontWeight: 300,
          letterSpacing: "-0.01em",
          color: accent,
          fontSize: tall ? 76 : 64,
          lineHeight: 1.15,
          textAlign: "center",
          opacity: progress(frame, END + 8, 20, EASE_OUT),
        }}
      >
        Made from
        <br />
        one photo
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
