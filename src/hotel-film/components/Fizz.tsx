import { random, useCurrentFrame, useVideoConfig } from "remotion";

// Champagne fizz drawn over a photo: soft glowing dots rising like bokeh. Larger ones are
// blurred as if out of focus, and all of them fade out before reaching the caption.
export const Fizz: React.FC<{
  seed: string;
  count: number;
  size: [number, number];
  speed: [number, number];
  color?: string; // "r,g,b"
  fadeAbove?: number; // fraction of the frame height where bubbles have faded out
}> = ({
  seed,
  count,
  size,
  speed,
  color = "255,255,255",
  fadeAbove = 0.35,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const bubbles = Array.from({ length: count }).map((_, i) => {
    const r = size[0] + (size[1] - size[0]) * random(`${seed}-s${i}`) ** 2;
    const v = speed[0] + (speed[1] - speed[0]) * random(`${seed}-v${i}`);
    const travel = height + 4 * r;
    // Offset each bubble along its path so the frame starts already populated.
    const y =
      height +
      2 * r -
      ((frame * v + random(`${seed}-o${i}`) * travel) % travel);
    const wobble =
      Math.sin(frame / (12 + 10 * random(`${seed}-w${i}`)) + i) * (4 + r * 0.3);
    const x = random(`${seed}-x${i}`) * width + wobble;
    const fade = Math.min(
      1,
      Math.max(0, (y / height - fadeAbove) / 0.25),
      Math.max(0, (height + r - y) / 120),
    );
    const blurred = r > (size[0] + size[1]) / 2;
    return { i, x, y, r, fade, blurred };
  });

  const draw = (b: (typeof bubbles)[number]) => (
    <circle
      key={b.i}
      cx={b.x}
      cy={b.y}
      r={b.r}
      fill={`url(#${seed}-glow)`}
      opacity={b.fade}
    />
  );

  return (
    <svg
      width={width}
      height={height}
      style={{ position: "absolute", inset: 0 }}
    >
      <defs>
        <radialGradient id={`${seed}-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor={`rgb(${color})`} stopOpacity={0.95} />
          <stop offset="0.5" stopColor={`rgb(${color})`} stopOpacity={0.45} />
          <stop offset="1" stopColor={`rgb(${color})`} stopOpacity={0} />
        </radialGradient>
        <filter
          id={`${seed}-soft`}
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feGaussianBlur stdDeviation={3} />
        </filter>
      </defs>
      <g filter={`url(#${seed}-soft)`}>
        {bubbles.filter((b) => b.blurred).map(draw)}
      </g>
      <g>{bubbles.filter((b) => !b.blurred).map(draw)}</g>
    </svg>
  );
};
