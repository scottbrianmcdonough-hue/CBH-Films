import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { GN_HEIGHT, GN_WIDTH } from "./GNStats";

// "Full house", a Great National Group brand moment for LinkedIn (Scott: "a cool animation
// for GN too ... do what you can execute best"): 4:5 and silent, like the stat videos. GN's
// badge is a lime ring round a navy disc, so the ring draws itself round like a gauge while
// the navy rises inside the circle like a glass filling, its surface rippling, and the GN,
// there from the first frame in navy, turns white wherever the navy has risen past it. Full,
// the ring settles with a pulse, the badge lifts and the official wordmark comes up beneath
// it; no light sweep (Scott: the shimmer is CBH's). (A 0-100% count was dropped, Scott: "why does the 100 percent represent"; on GN's
// LinkedIn a number reads as a claim.) GN's own pieces: the badge's letters cut from
// gn-badge.png, the wordmark from the centred logo.

const c = {
  navy: "#192B40",
  lime: "#A9BA1D",
  track: "#DDE1E6",
  panel: "#EDEEF0",
  panelLight: "#F5F6F7",
  white: "#FFFFFF",
};

export const GN_FULL_HOUSE_FRAMES = 200;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (
  f: number,
  a: number,
  b: number,
  easing = Easing.out(Easing.cubic),
) => interpolate(f, [a, b], [0, 1], { ...clamp, easing });

// the badge's proportions (gn-badge.png, 512px): ring 24px wide, disc radius 232
const RING = 24 / 256;
const FILL_START = 14;
const FULL = 118; // the circle is full here
const LIFT = [140, 172] as const;
const LETTERS = staticFile("campaigns/gn-full-house/gn-letters.png");

export const GNFullHouse: React.FC = () => {
  const frame = useCurrentFrame();

  // the fill: quick through the middle, slowing as it tops out
  const g = interpolate(frame, [FILL_START, FULL], [0, 1], {
    ...clamp,
    // (a shorter tail: with 0.2 the last few percent crawled for over a second)
    easing: Easing.bezier(0.45, 0, 0.35, 1),
  });

  // the badge: big while it fills, lifting and shrinking to sit over the wordmark
  const lift = ramp(frame, LIFT[0], LIFT[1], Easing.inOut(Easing.cubic));
  const D = interpolate(lift, [0, 1], [640, 400]);
  const cx = GN_WIDTH / 2;
  const cy = interpolate(lift, [0, 1], [640, 500]);
  // a pulse as it tops out
  const pulse =
    1 + 0.045 * Math.sin(Math.PI * ramp(frame, FULL, FULL + 14, Easing.linear));
  const R = (D / 2) * pulse;
  const ringW = R * RING;
  const rIn = R - ringW; // the disc
  const rMid = R - ringW / 2;
  const circ = 2 * Math.PI * rMid;

  // the level rises with the gauge, its surface a soft travelling wave that calms to flat as
  // it tops out
  // (it rises a little past the top, so the disc is solid navy before it is swapped in)
  const level = cy + rIn + 4 - 2 * (rIn + 8) * g;
  const amp = 14 * Math.sin(Math.PI * Math.min(1, g * 1.05)) * (D / 640);
  const ph = frame * 0.16;
  const pts: string[] = [];
  for (let x = cx - rIn - 4; x <= cx + rIn + 4; x += 6) {
    const u = (x - cx) / rIn;
    const y =
      level +
      amp * Math.sin(u * 2.6 + ph) +
      amp * 0.45 * Math.sin(u * 5.1 - ph * 1.3);
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  const liquid = `M ${cx - rIn - 4},${cy + rIn + 4} L ${pts.join(" L ")} L ${cx + rIn + 4},${cy + rIn + 4} Z`;
  const full = level < cy - rIn - 2;
  // the ring's round ends touch here: from then on it is drawn as one closed circle (switching
  // the ends to square opened a hairline gap for a few frames: Scott, "a click")
  const closed = circ * (1 - g) <= ringW;

  const word = ramp(frame, LIFT[0] + 16, LIFT[1] + 12);
  // the first frame is LinkedIn's preview, so it opens on the empty ring and the navy GN,
  // the panels already half in
  const bg = interpolate(ramp(frame, 0, 20), [0, 1], [0.5, 1]);
  const intro = 1;
  const sh = (1 - bg) * 260;

  return (
    <AbsoluteFill style={{ backgroundColor: c.white }}>
      {/* GN's card background: two slanted grey panels sliding in from the right */}
      <svg width={GN_WIDTH} height={GN_HEIGHT} style={{ position: "absolute" }}>
        <polygon
          points={`${745 + sh},0 ${920 + sh},0 ${800 + sh},${GN_HEIGHT} ${550 + sh},${GN_HEIGHT}`}
          fill={c.panel}
        />
        <polygon
          points={`${920 + sh},0 ${GN_WIDTH + 260},0 ${GN_WIDTH + 260},${GN_HEIGHT} ${800 + sh},${GN_HEIGHT}`}
          fill={c.panelLight}
        />
      </svg>

      <svg width={GN_WIDTH} height={GN_HEIGHT} style={{ position: "absolute" }}>
        <defs>
          <clipPath id="disc">
            <circle cx={cx} cy={cy} r={rIn + 2} />
          </clipPath>
          <clipPath id="liquid">
            {full ? <circle cx={cx} cy={cy} r={rIn} /> : <path d={liquid} />}
          </clipPath>
          <mask id="gn-letters" maskUnits="userSpaceOnUse">
            <image
              href={LETTERS}
              x={cx - R}
              y={cy - R}
              width={2 * R}
              height={2 * R}
            />
          </mask>
        </defs>
        {/* the gauge's empty track, then the navy rising inside it */}
        <circle
          cx={cx}
          cy={cy}
          r={rMid}
          fill="none"
          stroke={c.track}
          strokeWidth={ringW}
          opacity={intro}
        />
        <g clipPath="url(#disc)">
          {full ? (
            <circle cx={cx} cy={cy} r={rIn + 2} fill={c.navy} />
          ) : (
            <path d={liquid} fill={c.navy} />
          )}
        </g>
        {/* the GN: navy over the empty glass, white wherever the navy has risen past it */}
        <rect
          x={cx - R}
          y={cy - R}
          width={2 * R}
          height={2 * R}
          fill={c.navy}
          mask="url(#gn-letters)"
          opacity={intro}
        />
        <g clipPath="url(#liquid)">
          <image
            href={LETTERS}
            x={cx - R}
            y={cy - R}
            width={2 * R}
            height={2 * R}
          />
        </g>
        {/* the lime ring drawing round from the top, clockwise */}
        <circle
          cx={cx}
          cy={cy}
          r={rMid}
          fill="none"
          stroke={c.lime}
          strokeWidth={ringW}
          strokeDasharray={closed ? undefined : `${circ * g} ${circ}`}
          strokeLinecap={g < 0.005 ? "butt" : "round"}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </svg>

      {/* the official wordmark, coming up beneath */}
      <Img
        src={staticFile("campaigns/gn-full-house/gn-wordmark-navy.png")}
        style={{
          position: "absolute",
          left: (GN_WIDTH - 760) / 2,
          top: 760 + (1 - word) * 30,
          width: 760,
          opacity: word,
        }}
      />
    </AbsoluteFill>
  );
};
