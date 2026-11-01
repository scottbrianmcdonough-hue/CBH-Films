import { useCurrentFrame } from "remotion";
import { progress } from "../theme";

// A line of text that rises out of its own mask.
export const RevealLine: React.FC<{
  start: number;
  duration?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ start, duration = 30, style, children }) => {
  const frame = useCurrentFrame();
  const p = progress(frame, start, duration);

  return (
    <div
      style={{
        overflow: "hidden",
        padding: "0.06em 0 0.14em",
        margin: "-0.06em 0 -0.14em",
      }}
    >
      <div style={{ ...style, transform: `translateY(${(1 - p) * 110}%)` }}>
        {children}
      </div>
    </div>
  );
};

export const FadeIn: React.FC<{
  start: number;
  duration?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ start, duration = 30, style, children }) => {
  const frame = useCurrentFrame();
  const p = progress(frame, start, duration);
  return (
    <div
      style={{
        ...style,
        opacity: p,
        transform: `translateY(${(1 - p) * 12}px)`,
      }}
    >
      {children}
    </div>
  );
};
