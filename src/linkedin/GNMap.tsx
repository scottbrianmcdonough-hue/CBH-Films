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
import map from "./gn-map/map.json";

// "Every hotel on the map", a Great National Group brand moment for LinkedIn (Scott: the
// full-house fill "has to fit ... Great National and Ireland"): 4:5 and silent, like the stat
// videos. Ireland and Britain draw themselves in navy and GN's 26 hotels light up in lime
// where they really are (greatnationalhotels.com/our-hotels; scripts/gn-map.mjs), Ireland
// first, then the UK. Then the lights lift off the map and fly into a circle, and the circle
// closes into the lime ring of GN's badge; the navy fills it, the GN comes up white, and the
// badge lifts over GN's own wordmark. No shimmer (that's CBH's).

const c = {
  navy: "#192B40",
  lime: "#A9BA1D",
  land: "#E9ECEF",
  coastFaint: "#D5DAE0",
  panel: "#EDEEF0",
  panelLight: "#F5F6F7",
  white: "#FFFFFF",
};

export const GN_MAP_FRAMES = 285;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (
  f: number,
  a: number,
  b: number,
  easing = Easing.out(Easing.cubic),
) => interpolate(f, [a, b], [0, 1], { ...clamp, easing });

const RING = 24 / 256; // the badge's ring width over its radius (gn-badge.png)
const LETTERS = staticFile("campaigns/gn-full-house/gn-letters.png");

// the badge, first at the size the lights gather into, then lifted over the wordmark
const CX = GN_WIDTH / 2;
const CY0 = 640;
const D0 = 600;

// timing
const DRAW = [0, 46] as const; // the coastlines
const LIGHT = [40, 118] as const; // the hotels light up, Ireland then the UK
const FLY = [138, 186] as const; // the lights gather into the circle
const CLOSE = [178, 196] as const; // the ring closes through them
const FILL = [194, 214] as const; // the navy fills the badge, the GN comes up
const LIFT = [222, 252] as const;

type Pin = { id: string; country: string; x: number; y: number };
const PINS = map.pins as Pin[];
// light order: Ireland west to east, then the UK west to east, like light crossing the sea
const ORDER = [...PINS].sort(
  (a, b) =>
    (a.country === b.country ? 0 : a.country === "ie" ? -1 : 1) || a.x - b.x,
);
const litAt = (p: Pin) => {
  const i = ORDER.indexOf(p);
  return Math.round(
    LIGHT[0] + ((LIGHT[1] - LIGHT[0]) * i) / (ORDER.length - 1),
  );
};
// each light's place on the ring: the pins taken by angle round their own centre, set
// evenly round the circle in the same order, so the flights fan in without crossing
const PCX = PINS.reduce((a, p) => a + p.x, 0) / PINS.length;
const PCY = PINS.reduce((a, p) => a + p.y, 0) / PINS.length;
const BY_ANGLE = [...PINS].sort(
  (a, b) => Math.atan2(a.y - PCY, a.x - PCX) - Math.atan2(b.y - PCY, b.x - PCX),
);
const ringAngle = (p: Pin) => {
  const i = BY_ANGLE.indexOf(p);
  const a0 = Math.atan2(BY_ANGLE[0].y - PCY, BY_ANGLE[0].x - PCX);
  return a0 + (2 * Math.PI * i) / PINS.length;
};

export const GNMap: React.FC = () => {
  const frame = useCurrentFrame();

  const draw = ramp(frame, DRAW[0], DRAW[1], Easing.inOut(Easing.cubic));
  const mapAway = ramp(
    frame,
    FLY[0] + 4,
    FLY[0] + 30,
    Easing.inOut(Easing.cubic),
  );
  const fly = ramp(frame, FLY[0], FLY[1], Easing.inOut(Easing.cubic));
  const close = ramp(frame, CLOSE[0], CLOSE[1], Easing.inOut(Easing.cubic));
  const fill = ramp(frame, FILL[0], FILL[1], Easing.out(Easing.cubic));
  const lift = ramp(frame, LIFT[0], LIFT[1], Easing.inOut(Easing.cubic));
  const word = ramp(frame, LIFT[0] + 14, LIFT[1] + 10);
  const bg = interpolate(ramp(frame, 0, 20), [0, 1], [0.5, 1]);
  const sh = (1 - bg) * 260;

  const D = interpolate(lift, [0, 1], [D0, 400]);
  const cy = interpolate(lift, [0, 1], [CY0, 500]);
  const R = D / 2;
  const ringW = R * RING;
  const rIn = R - ringW;
  const rMid = R - ringW / 2;

  // the map shrinks a touch and falls away under the rising lights
  const mapScale = 1 - 0.06 * mapAway;
  const onMap = (x: number, y: number) => ({
    x: CX + (x - CX) * mapScale,
    y: 620 + (y - 620) * mapScale,
  });

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
          <mask id="gn-letters" maskUnits="userSpaceOnUse">
            <image
              href={LETTERS}
              x={CX - R}
              y={cy - R}
              width={2 * R}
              height={2 * R}
            />
          </mask>
          <radialGradient id="glow">
            <stop offset="0" stopColor={c.lime} stopOpacity={0.55} />
            <stop offset="1" stopColor={c.lime} stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* the islands: faint from the first frame (LinkedIn's preview), then the coast
            drawn in navy round them */}
        <g
          opacity={1 - mapAway}
          transform={`translate(${CX * (1 - mapScale)} ${620 * (1 - mapScale)}) scale(${mapScale})`}
        >
          {[map.ireland, map.uk].map((d, k) => (
            <g key={k}>
              <path
                d={d}
                fill={c.land}
                stroke={c.coastFaint}
                strokeWidth={1.2}
              />
              <path
                d={d}
                fill="none"
                stroke={c.navy}
                strokeWidth={2}
                strokeLinejoin="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - draw}
              />
            </g>
          ))}
        </g>

        {/* the ring closing through the gathered lights */}
        <circle
          cx={CX}
          cy={cy}
          r={rMid}
          fill="none"
          stroke={c.lime}
          strokeWidth={ringW}
          opacity={close}
        />
        {/* the navy filling the badge from the centre, the GN in white */}
        {fill > 0 ? (
          <>
            <circle cx={CX} cy={cy} r={(rIn + 2) * fill} fill={c.navy} />
            <rect
              x={CX - R}
              y={cy - R}
              width={2 * R}
              height={2 * R}
              fill={c.white}
              mask="url(#gn-letters)"
              opacity={ramp(frame, FILL[0] + 6, FILL[1] + 6)}
              transform={`translate(0 ${(1 - ramp(frame, FILL[0] + 6, FILL[1] + 10)) * 24})`}
            />
          </>
        ) : null}

        {/* the hotels: lit where they are, then lifting off to the circle */}
        {PINS.map((p) => {
          const lit = litAt(p);
          const on = ramp(frame, lit, lit + 8, Easing.out(Easing.back(2)));
          if (on <= 0) return null;
          const ripple = ramp(frame, lit, lit + 22, Easing.out(Easing.quad));
          const a = ringAngle(p);
          const home = onMap(p.x, p.y);
          const tx = CX + rMid * Math.cos(a);
          const ty = CY0 + rMid * Math.sin(a);
          // a gentle bow on the way in, all turning the same way
          const mx = (home.x + tx) / 2 - (ty - home.y) * 0.18;
          const my = (home.y + ty) / 2 + (tx - home.x) * 0.18;
          const u = 1 - fly;
          const x = u * u * home.x + 2 * u * fly * mx + fly * fly * tx;
          const y = u * u * home.y + 2 * u * fly * my + fly * fly * ty;
          // landed, each light settles to the ring's width and melts into it
          const r = interpolate(fly, [0, 1], [9, ringW / 2]) * on;
          const fade = 1 - ramp(frame, CLOSE[0] + 4, CLOSE[1] + 4);
          return (
            <g key={p.id} opacity={fade}>
              {ripple < 1 ? (
                <circle
                  cx={x}
                  cy={y}
                  r={9 + 30 * ripple}
                  fill="none"
                  stroke={c.lime}
                  strokeWidth={2.5}
                  opacity={1 - ripple}
                />
              ) : null}
              <circle
                cx={x}
                cy={y}
                r={r * 3.2}
                fill="url(#glow)"
                opacity={1 - fly}
              />
              <circle cx={x} cy={y} r={r} fill={c.lime} />
            </g>
          );
        })}
      </svg>

      {/* GN's own wordmark, coming up beneath */}
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
