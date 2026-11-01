import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FadeIn, RevealLine } from "../components/RevealWords";
import { colors, EASE_IN_OUT, EASE_OUT, progress, sans, serif } from "../theme";
import type { TriptychSceneSpec } from "../types";

const W = 1080;
const H = 1920;
const HEADER = 640;
const BAND = (H - HEADER) / 3;

const FROM: Array<"left" | "right"> = ["left", "right", "left"];

// Three photos stacked as wide strips under a black caption header, like a magazine
// spread. The header drops in and the strips slide in from alternating sides,
// covering the previous scene (this scene is transparent until they land, so
// enter it with the "cover" transition).
export const Triptych: React.FC<{ spec: TriptychSceneSpec }> = ({ spec }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const drift = interpolate(frame, [0, durationInFrames], [0, 1]);
  const header = progress(frame, 0, 22, EASE_OUT);

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          height: HEADER,
          backgroundColor: colors.black,
          transform: `translateY(${(header - 1) * 100}%)`,
        }}
      />
      {spec.photos.map((band, i) => {
        const p = progress(frame, 6 + i * 6, 22, EASE_OUT);
        const dir = FROM[i] === "left" ? -1 : 1;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              top: HEADER + i * BAND,
              width: W,
              height: BAND,
              overflow: "hidden",
              backgroundColor: colors.black,
              transform: `translateX(${dir * (1 - p) * 100}%)`,
            }}
          >
            <Img
              src={staticFile(band.src)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: `50% ${band.y}%`,
                transform: `scale(${1.14 - 0.1 * drift}) translateX(${dir * -2 * drift}%)`,
              }}
            />
          </div>
        );
      })}
      {[HEADER, HEADER + BAND, HEADER + 2 * BAND].map((y, i) => (
        <div
          key={y}
          style={{
            position: "absolute",
            left: 0,
            top: y - 1,
            width: W,
            height: 2,
            background: colors.gold,
            transform: `scaleX(${progress(frame, 34 + i * 4, 26, EASE_IN_OUT)})`,
          }}
        />
      ))}
      <AbsoluteFill style={{ height: HEADER, padding: "250px 96px 0" }}>
        <FadeIn
          start={36}
          style={{
            fontFamily: sans,
            fontWeight: 600,
            fontSize: 24,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: colors.gold,
            marginBottom: 26,
          }}
        >
          {spec.eyebrow}
        </FadeIn>
        {spec.lines.map((line, i) => (
          <RevealLine
            key={line}
            start={42 + i * 5}
            style={{
              fontFamily: serif,
              fontSize: 96,
              lineHeight: 1.02,
              color: colors.cream,
            }}
          >
            {line}
          </RevealLine>
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
