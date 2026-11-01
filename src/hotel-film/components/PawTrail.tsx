import { interpolate, useCurrentFrame } from "remotion";
import { colors, EASE_OUT } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// One print, pointing up: a main pad and four toes.
const Paw: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <path
      d="M50 50 C33 50 20 66 22 79 C24 92 39 91 50 88 C61 91 76 92 78 79 C80 66 67 50 50 50 Z"
      fill="currentColor"
    />
    <ellipse
      cx="20"
      cy="43"
      rx="8.5"
      ry="11.5"
      transform="rotate(-24 20 43)"
      fill="currentColor"
    />
    <ellipse
      cx="37"
      cy="25"
      rx="9"
      ry="12.5"
      transform="rotate(-9 37 25)"
      fill="currentColor"
    />
    <ellipse
      cx="63"
      cy="25"
      rx="9"
      ry="12.5"
      transform="rotate(9 63 25)"
      fill="currentColor"
    />
    <ellipse
      cx="80"
      cy="43"
      rx="8.5"
      ry="11.5"
      transform="rotate(24 80 43)"
      fill="currentColor"
    />
  </svg>
);

// A trail of small gold paw prints trotting from `from` to `to` (frame pixels): one print
// every `every` frames, alternating either side of the line, each pressing in with a
// small settle and fading `life` frames later, so the trail walks rather than piles up.
// `scale` runs from the first print to the last (bigger nearer the camera).
export const PawTrail: React.FC<{
  from: [number, number];
  to: [number, number];
  steps: number;
  start: number;
  every: number;
  life: number;
  size: number;
  scale?: [number, number];
}> = ({ from, to, steps, start, every, life, size, scale = [1, 1] }) => {
  const frame = useCurrentFrame();
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const len = Math.hypot(dx, dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90; // the print points up
  const [nx, ny] = [-dy / len, dx / len]; // perpendicular, for the left/right gait
  const gait = (len / (steps - 1)) * 0.28;
  return (
    <>
      {Array.from({ length: steps }, (_, i) => {
        const t = i / (steps - 1);
        const at = start + i * every;
        const on = interpolate(frame, [at, at + 6], [0, 1], {
          ...clamp,
          easing: EASE_OUT,
        });
        const off = interpolate(
          frame,
          [at + life, at + life + 14],
          [1, 0],
          clamp,
        );
        if (on === 0 || off === 0) return null;
        const side = i % 2 ? 1 : -1;
        const s = size * (scale[0] + (scale[1] - scale[0]) * t);
        const x = from[0] + dx * t + nx * gait * side;
        const y = from[1] + dy * t + ny * gait * side;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - s / 2,
              top: y - s / 2,
              color: colors.lightGold,
              opacity: 0.95 * on * off,
              transform: `rotate(${angle + side * 8}deg) scale(${1.25 - 0.25 * on})`,
              filter:
                "drop-shadow(0 0 2px rgba(9,9,10,0.55)) drop-shadow(0 2px 6px rgba(9,9,10,0.45))",
            }}
          >
            <Paw size={s} />
          </div>
        );
      })}
    </>
  );
};
