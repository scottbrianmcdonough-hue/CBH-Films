import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { colors, EASE_IN_OUT, progress } from "../theme";

const W = 1080;
const H = 1920;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const GLOW = `drop-shadow(0 0 12px ${colors.lightGold})`;

// Opening: a gold line draws across the black, then splits into two edges that part
// like an aperture onto the first scene, fully open on `land` (a downbeat).
export const ApertureIntro: React.FC<{ land: number }> = ({ land }) => {
  const frame = useCurrentFrame();
  if (frame > land + 6) return null;
  const draw = progress(frame, 4, 30, EASE_IN_OUT);
  const open = progress(frame, 30, land - 30, EASE_IN_OUT);
  const half = (H / 2) * open;
  const lineWidth = interpolate(open, [0, 0.4], [900 * draw, W], clamp);
  const edges = interpolate(frame, [land - 10, land + 4], [1, 0], clamp);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: W,
          height: H / 2 - half,
          backgroundColor: colors.black,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: W,
          height: H / 2 - half,
          backgroundColor: colors.black,
        }}
      />
      {[-1, 1].map((dir) => (
        <div
          key={dir}
          style={{
            position: "absolute",
            left: (W - lineWidth) / 2,
            top: H / 2 + dir * half - 1,
            width: lineWidth,
            height: 2,
            background: colors.lightGold,
            filter: GLOW,
            opacity: edges,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};
