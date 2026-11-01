import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { colors } from "../theme";

const W = 1080;
const H = 1920;
const SLICES = 3;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const LOCK = Easing.bezier(0.22, 1, 0.36, 1);

// Opening: the first scene arrives as three full-height panels sliding in from alternating
// sides, staggered so the last one locks the full-bleed shot together on `land` (a
// downbeat). The photo inside each panel lags its panel a little, for a sense of depth,
// and fine gold seams between the panels fade out as they lock.
export const SliceIntro: React.FC<{
  land: number;
  children: React.ReactNode;
}> = ({ land, children }) => {
  const frame = useCurrentFrame();
  if (frame > land) return <>{children}</>;
  const travel = land - 20;
  const stagger = 8;
  const seams = interpolate(frame, [land - 10, land], [1, 0], clamp);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      {Array.from({ length: SLICES }, (_, i) => {
        const start = land - travel - (SLICES - 1 - i) * stagger;
        const t = interpolate(frame, [start, start + travel], [0, 1], {
          ...clamp,
          easing: LOCK,
        });
        const dir = i % 2 ? -1 : 1; // outer panels rise from below, the middle drops in
        const offset = dir * H * (1 - t);
        const left = (W / SLICES) * i;
        return (
          <AbsoluteFill
            key={i}
            style={{
              clipPath: `inset(0 ${W - left - W / SLICES}px 0 ${left}px)`,
              transform: `translateY(${offset}px)`,
            }}
          >
            <AbsoluteFill
              style={{ transform: `translateY(${-offset * 0.25}px)` }}
            >
              {children}
            </AbsoluteFill>
          </AbsoluteFill>
        );
      })}
      {Array.from({ length: SLICES - 1 }, (_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: (W / SLICES) * (i + 1) - 1,
            top: 0,
            width: 2,
            height: H,
            background: colors.lightGold,
            boxShadow: `0 0 10px ${colors.lightGold}`,
            opacity: seams,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};
