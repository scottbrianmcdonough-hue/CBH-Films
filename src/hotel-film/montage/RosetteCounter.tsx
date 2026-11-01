import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { colors, EASE_OUT, sans, serif } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ROLL = 12; // frames for the numeral to roll and the new rosette to bloom

// The client's red rosette, traced to a clean vector (public/brand/aa-rosette-red.svg,
// potrace from their 120px PNG) so it stays crisp at any size; its red is kept as supplied.
// Only the rosettes awarded are drawn, never empty placeholders: the AA forbids layouts that
// read as a score out of three. A new one blooms out from its centre with a slight overshoot.
const ROSETTE = staticFile("brand/aa-rosette-red.svg");

const Rosette: React.FC<{ size: number; fill: number }> = ({ size, fill }) => {
  const s =
    fill <= 0 ? 0 : fill < 1 ? 1.12 * Math.sin((Math.PI / 2) * fill) : 1;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <Img
        src={ROSETTE}
        style={{
          position: "absolute",
          width: size,
          height: size,
          transform: `scale(${s})`,
          opacity: fill > 0 ? 1 : 0,
          filter: "drop-shadow(0 2px 8px rgba(9,9,10,0.45))",
        }}
      />
    </div>
  );
};

// The rosette counter, top-left: a large serif numeral with "AA Rosette(s)" beside it and
// a row of the rosettes awarded beneath. When the tier steps up on a cut, the numeral rolls up
// to the new number and the next rosette blooms in red.
export const RosetteCounter: React.FC<{
  tierAt: (frame: number) => number; // tier on screen at a film frame (0 = hidden)
  changes: number[]; // frames where the tier steps up
  words: [string, string]; // singular, plural
  hook?: { text: string; until: number }; // a line under the counter, from frame one
  hideFrom: number; // the counter leaves as the end card arrives
}> = ({ tierAt, changes, words, hook, hideFrom }) => {
  const frame = useCurrentFrame();
  const tier = tierAt(frame);
  const last = [...changes].reverse().find((c) => c <= frame);
  const p =
    last === undefined
      ? 1
      : interpolate(frame, [last, last + ROLL], [0, 1], {
          ...clamp,
          easing: EASE_OUT,
        });
  const prev = last === undefined ? tier : tierAt(last - 1);
  const out = interpolate(frame, [hideFrom - 6, hideFrom + 4], [1, 0], clamp);
  const word = (n: number) => (n === 1 ? words[0] : words[1]);
  const num = (n: number, y: number) => (
    <div
      style={{
        position: "absolute",
        transform: `translateY(${y * 100}%)`,
        fontFamily: serif,
        fontWeight: 500,
        fontSize: 260,
        lineHeight: 1,
        color: colors.cream,
        fontVariantNumeric: "lining-nums",
        fontFeatureSettings: '"lnum" 1',
      }}
    >
      {n}
    </div>
  );
  const rolling = prev !== tier && p < 1;
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(9,9,10,0.62) 0%, rgba(9,9,10,0.3) 24%, rgba(9,9,10,0) 36%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 64,
          top: 210,
          display: "flex",
          alignItems: "flex-end",
          gap: 26,
          textShadow: "0 2px 24px rgba(9,9,10,0.5)",
        }}
      >
        <div
          style={{
            position: "relative",
            width: 150,
            height: 260,
            overflow: "hidden",
          }}
        >
          {rolling ? (
            <>
              {num(prev, -p)}
              {num(tier, 1 - p)}
            </>
          ) : (
            num(tier, 0)
          )}
        </div>
        <div style={{ paddingBottom: 40 }}>
          <div
            style={{
              fontFamily: sans,
              fontWeight: 600,
              fontSize: 34,
              letterSpacing: "0.24em",
              color: colors.lightGold,
            }}
          >
            AA
          </div>
          <div
            style={{
              fontFamily: serif,
              fontSize: 72,
              lineHeight: 1,
              color: colors.cream,
              whiteSpace: "nowrap",
            }}
          >
            {word(rolling && p < 0.5 ? prev : tier).replace(/^AA /, "")}
          </div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 72,
          top: 490,
          display: "flex",
          gap: 16,
        }}
      >
        {Array.from({ length: tier }, (_, k) => (
          <Rosette key={k} size={64} fill={k === tier - 1 && rolling ? p : 1} />
        ))}
      </div>
      {hook && frame < hook.until ? (
        <div
          style={{
            position: "absolute",
            left: 72,
            top: 572,
            fontFamily: serif,
            fontStyle: "italic",
            fontSize: 52,
            color: colors.cream,
            opacity: interpolate(
              frame,
              [hook.until - 10, hook.until],
              [1, 0],
              clamp,
            ),
            textShadow: "0 2px 22px rgba(9,9,10,0.6)",
          }}
        >
          {hook.text}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
