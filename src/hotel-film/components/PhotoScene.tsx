import { AbsoluteFill, useCurrentFrame } from "remotion";
import { colors, EASE_IN_OUT, progress, sans, serif } from "../theme";
import { KenBurns } from "./KenBurns";
import { FadeIn, RevealLine } from "./RevealWords";

type Move = { scale: number; x: number; y: number };

// A landscape photo in a gold-edged frame on black, close to its native size so small
// photos stay sharp; the camera still drifts inside the frame.
const FRAME = { x: 60, y: 760, w: 960, h: 720 };
const FramedPhoto: React.FC<{ src: string; from: Move; to: Move }> = ({
  src,
  from,
  to,
}) => {
  const frame = useCurrentFrame();
  const edge = progress(frame, 6, 50, EASE_IN_OUT);
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: FRAME.x,
          top: FRAME.y,
          width: FRAME.w,
          height: FRAME.h,
          overflow: "hidden",
          boxShadow: "0 40px 90px rgba(0,0,0,0.6)",
        }}
      >
        <KenBurns src={src} from={from} to={to} />
      </div>
      <svg
        width={FRAME.w + 40}
        height={FRAME.h + 40}
        style={{ position: "absolute", left: FRAME.x - 20, top: FRAME.y - 20 }}
      >
        <rect
          x={1}
          y={1}
          width={FRAME.w + 38}
          height={FRAME.h + 38}
          fill="none"
          stroke={colors.gold}
          strokeWidth={2}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - edge}
        />
      </svg>
    </>
  );
};

// A full-bleed photo with an optional motion-graphic overlay (drawn between the photo
// and the caption shading) and an optional caption block, top or bottom, left-aligned.
export const PhotoScene: React.FC<{
  src: string;
  from: Move;
  to: Move;
  eyebrow?: string;
  lines?: string[];
  position?: "top" | "bottom";
  overlay?: React.ReactNode;
  captionDelay?: number;
  framed?: boolean;
}> = ({
  src,
  from,
  to,
  eyebrow,
  lines = [],
  position = "bottom",
  overlay,
  captionDelay = 0,
  framed = false,
}) => {
  const atTop = position === "top";
  const shade = atTop
    ? "linear-gradient(180deg, rgba(9,9,10,0.85) 0%, rgba(9,9,10,0.55) 22%, rgba(9,9,10,0) 46%)"
    : "linear-gradient(0deg, rgba(9,9,10,0.92) 0%, rgba(9,9,10,0.75) 32%, rgba(9,9,10,0) 62%)";

  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      {framed ? (
        <FramedPhoto src={src} from={from} to={to} />
      ) : (
        <>
          <KenBurns src={src} from={from} to={to} />
          {overlay}
          {eyebrow || lines.length ? (
            <AbsoluteFill style={{ background: shade }} />
          ) : null}
        </>
      )}
      <AbsoluteFill
        style={{
          justifyContent: atTop ? "flex-start" : "flex-end",
          // Keep clear of the Reels/TikTok UI: top bar, and caption/username at the bottom.
          padding: atTop ? "250px 96px 0" : "0 96px 460px",
        }}
      >
        {eyebrow ? (
          <FadeIn
            start={14 + captionDelay}
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
            {eyebrow}
          </FadeIn>
        ) : null}
        {lines.map((line, i) => (
          <RevealLine
            key={line}
            start={20 + captionDelay + i * 5}
            style={{
              fontFamily: serif,
              fontWeight: 400,
              fontSize: 96,
              lineHeight: 1.02,
              color: colors.cream,
              textShadow: "0 2px 24px rgba(9,9,10,0.5)",
            }}
          >
            {line}
          </RevealLine>
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
