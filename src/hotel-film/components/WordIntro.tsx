import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { colors, progress, sans, serif } from "../theme";
import type { WordIntroSpec } from "../types";

const W = 1080;
const H = 1920;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// A black page with the word cut out of it, so the scene underneath shows through the
// letters; the camera then flies into a letter stroke until the scene fills the frame.
export const WordIntro: React.FC<WordIntroSpec> = ({
  word,
  sub,
  zoomStart,
  zoomEnd,
  origin,
  fontSize = 280,
  y = 700,
  maxZoom = 40,
}) => {
  const frame = useCurrentFrame();
  if (frame > zoomEnd + 1) return null;
  const [ox, oy] = origin;
  const drift = 1 + (0.05 * Math.min(frame, zoomStart)) / zoomStart;
  const fly = interpolate(frame, [zoomStart, zoomEnd], [0, 1], clamp);
  // Browsers stop drawing glyphs at extreme scales, so cap the zoom and dissolve the
  // black page over the last stretch of the fly-through instead.
  const scale = drift * Math.exp(Math.log(maxZoom) * fly ** 2);
  const pageOpacity = interpolate(fly, [0.62, 0.95], [1, 0], clamp);
  const subOpacity =
    progress(frame, 10, 30) *
    interpolate(frame, [zoomStart, zoomStart + 12], [1, 0], clamp);

  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <defs>
          <mask id="intro-word">
            <rect width={W} height={H} fill="white" />
            <g
              transform={`translate(${ox} ${oy}) scale(${scale}) translate(${-ox} ${-oy})`}
            >
              <text
                x={W / 2}
                y={y}
                textAnchor="middle"
                fontFamily={serif}
                fontWeight={500}
                fontSize={fontSize}
                letterSpacing={fontSize / 35}
                fill="black"
              >
                {word}
              </text>
            </g>
          </mask>
        </defs>
        <rect
          width={W}
          height={H}
          fill={colors.black}
          mask="url(#intro-word)"
          opacity={pageOpacity}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          top: y + 60,
          width: W,
          textAlign: "center",
          fontFamily: sans,
          fontWeight: 600,
          fontSize: 30,
          letterSpacing: "0.6em",
          paddingLeft: "0.6em",
          textTransform: "uppercase",
          color: colors.gold,
          opacity: subOpacity,
        }}
      >
        {sub}
      </div>
    </AbsoluteFill>
  );
};
