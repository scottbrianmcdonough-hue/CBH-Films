import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from "@remotion/transitions";
import { AbsoluteFill, interpolate } from "remotion";
import { colors } from "./theme";

// Custom, on-brand scene transitions. Each one only styles its own side:
// the entering scene renders above the exiting one.

type Props = Record<string, never>;
type PresentationProps = TransitionPresentationComponentProps<Props>;

const W = 1080;
const H = 1920;
const GLOW = `drop-shadow(0 0 10px ${colors.lightGold})`;

const make = (
  component: React.FC<PresentationProps>,
): TransitionPresentation<Props> => ({ component, props: {} });

// 1. Cover: the next scene builds itself over the previous one, which stays in place
// underneath (the room triptych slides its panels in over the aerial).
const Cover: React.FC<PresentationProps> = ({
  children,
  presentationDirection,
  presentationProgress: p,
}) => (
  <AbsoluteFill
    style={
      presentationDirection === "exiting"
        ? { filter: `brightness(${1 - 0.4 * p})` }
        : undefined
    }
  >
    {children}
  </AbsoluteFill>
);

// 2. Arch reveal: the next scene grows through a Victorian arched window, like the hotel's facade.
const archPath = (p: number) => {
  // Linger at window size (~450-1000px wide) so the arch reads before it overflows the frame.
  const w = interpolate(p, [0, 0.15, 0.7, 1], [0, 450, 1000, 2700]);
  const r = w / 2;
  const h = w * 1.35;
  const left = W / 2 - r;
  const right = W / 2 + r;
  const springY = H - h + r;
  return `M${left} ${H + 10} L${left} ${springY} A${r} ${r} 0 0 1 ${right} ${springY} L${right} ${H + 10} Z`;
};
const ArchReveal: React.FC<PresentationProps> = ({
  children,
  presentationDirection,
  presentationProgress: p,
}) => {
  if (presentationDirection === "exiting") {
    return (
      <AbsoluteFill
        style={{
          transform: `scale(${1 + 0.08 * p})`,
          filter: `brightness(${1 - 0.6 * p})`,
        }}
      >
        {children}
      </AbsoluteFill>
    );
  }
  const d = archPath(Math.max(p, 0.001));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `path('${d}')` }}>
        <AbsoluteFill style={{ transform: `scale(${1.1 - 0.1 * p})` }}>
          {children}
        </AbsoluteFill>
      </AbsoluteFill>
      <svg
        width={W}
        height={H}
        style={{ position: "absolute", filter: GLOW, opacity: 1 - p * p }}
      >
        <path d={d} fill="none" stroke={colors.gold} strokeWidth={3} />
      </svg>
    </AbsoluteFill>
  );
};

// 3. Parallax rise: the end card slides up over the last shot, led by a gold hairline.
const ParallaxRise: React.FC<PresentationProps> = ({
  children,
  presentationDirection,
  presentationProgress: p,
}) => {
  if (presentationDirection === "exiting") {
    return (
      <AbsoluteFill
        style={{
          transform: `translateY(${-p * 30}%)`,
          filter: `brightness(${1 - 0.7 * p})`,
        }}
      >
        {children}
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ transform: `translateY(${(1 - p) * 100}%)` }}>
      {children}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: colors.lightGold,
          filter: GLOW,
          opacity: 1 - p,
        }}
      />
    </AbsoluteFill>
  );
};

// 4. Seam wipe: a gold hairline sweeps across the frame, drawing the next scene in behind
// it with a little parallax while the last one drifts on and dims.
const SeamWipe: React.FC<PresentationProps> = ({
  children,
  presentationDirection,
  presentationProgress: p,
}) => {
  if (presentationDirection === "exiting") {
    return (
      <AbsoluteFill
        style={{
          transform: `translateX(${p * 6}%)`,
          filter: `brightness(${1 - 0.5 * p})`,
        }}
      >
        {children}
      </AbsoluteFill>
    );
  }
  const x = W * p;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `inset(0 ${W - x}px 0 0)` }}>
        <AbsoluteFill style={{ transform: `translateX(${-(1 - p) * 12}%)` }}>
          {children}
        </AbsoluteFill>
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: x - 1,
          width: 2,
          height: H,
          background: colors.lightGold,
          filter: GLOW,
          opacity: interpolate(p, [0, 0.1, 0.85, 1], [0, 1, 1, 0]),
        }}
      />
    </AbsoluteFill>
  );
};

// 5. Split open: the last scene parts along the middle, its halves sliding away on gold
// edges, and the next scene settles into the widening gap.
const SplitOpen: React.FC<PresentationProps> = ({
  children,
  presentationDirection,
  presentationProgress: p,
}) => {
  const shift = (H / 2) * p;
  if (presentationDirection === "exiting") {
    return (
      <AbsoluteFill style={{ filter: `brightness(${1 - 0.3 * p})` }}>
        <AbsoluteFill
          style={{
            clipPath: "inset(0 0 50% 0)",
            transform: `translateY(${-shift}px)`,
          }}
        >
          {children}
        </AbsoluteFill>
        <AbsoluteFill
          style={{
            clipPath: "inset(50% 0 0 0)",
            transform: `translateY(${shift}px)`,
          }}
        >
          {children}
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }
  const inset = H / 2 - shift;
  const edges = interpolate(p, [0, 0.08, 0.8, 1], [0, 1, 1, 0]);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `inset(${inset}px 0 ${inset}px 0)` }}>
        <AbsoluteFill style={{ transform: `scale(${1.12 - 0.12 * p})` }}>
          {children}
        </AbsoluteFill>
      </AbsoluteFill>
      {[inset - 1, H - inset - 1].map((top, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 0,
            top,
            width: W,
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

export const cover = () => make(Cover);
export const archReveal = () => make(ArchReveal);
export const parallaxRise = () => make(ParallaxRise);
export const seamWipe = () => make(SeamWipe);
export const splitOpen = () => make(SplitOpen);
