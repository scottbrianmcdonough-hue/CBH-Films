import { loadFont } from "@remotion/fonts";
import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";

// Great National Group LinkedIn stat videos: 4:5, silent, the static stat cards
// animated (count-ups, bars, a 100-traveller grid). Not a CBH film, so none of
// the hotel-film house style applies; colours are matched to GN's own cards.

export const GN_FPS = 30;
export const GN_WIDTH = 1080;
export const GN_HEIGHT = 1350;

export const serif = "Source Serif 4";
export const sans = "Open Sans";

loadFont({
  family: serif,
  url: staticFile("fonts/SourceSerif4-Bold.woff2"),
  weight: "700",
});
loadFont({
  family: sans,
  url: staticFile("fonts/OpenSans.woff2"),
  weight: "300 800",
});

export const c = {
  navy: "#192B40",
  lime: "#A9BA1D",
  text: "#1F2F42",
  muted: "#5F6872",
  empty: "#DDE1E6",
  panel: "#EDEEF0",
  panelLight: "#F5F6F7",
  white: "#FFFFFF",
};

export const MARGIN = 72;
const out = Easing.out(Easing.cubic);

export const ramp = (
  frame: number,
  start: number,
  length: number,
  easing = out,
) =>
  interpolate(frame, [start, start + length], [0, 1], {
    easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

// Rise-and-fade entrance shared by every text element.
export const rise = (
  frame: number,
  start: number,
  distance = 30,
): React.CSSProperties => {
  const p = ramp(frame, start, 18);
  return { opacity: p, transform: `translateY(${(1 - p) * distance}px)` };
};

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const p = ramp(frame, 0, 24);
  const shift = (1 - p) * 260;
  return (
    <AbsoluteFill style={{ backgroundColor: c.white }}>
      <svg width={GN_WIDTH} height={GN_HEIGHT} style={{ position: "absolute" }}>
        <polygon
          points={`${745 + shift},0 ${920 + shift},0 ${800 + shift},${GN_HEIGHT} ${550 + shift},${GN_HEIGHT}`}
          fill={c.panel}
        />
        <polygon
          points={`${920 + shift},0 ${GN_WIDTH + shift},0 ${GN_WIDTH + shift},${GN_HEIGHT} ${800 + shift},${GN_HEIGHT}`}
          fill={c.panelLight}
        />
      </svg>
    </AbsoluteFill>
  );
};

// GN's badge (navy disc, lime ring, white GN; letters from the logo master)
// with the group name beside it, as on GN's static cards.
export const Header: React.FC<{ centred?: boolean }> = ({
  centred = false,
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        top: 64,
        left: centred ? 0 : MARGIN,
        right: centred ? 0 : undefined,
        display: "flex",
        justifyContent: centred ? "center" : "flex-start",
        alignItems: "center",
        gap: 22,
        ...rise(frame, 2, 16),
      }}
    >
      <Img
        src={staticFile("brand/gn-badge.png")}
        style={{ width: 76, height: 76 }}
      />
      <span
        style={{
          fontFamily: sans,
          fontWeight: 600,
          fontSize: 36,
          color: c.navy,
        }}
      >
        Great National Group
      </span>
    </div>
  );
};

const Rule: React.FC<{ top: number; start: number; width?: number }> = ({
  top,
  start,
  width = 470,
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: MARGIN,
        top,
        height: 12,
        width: width * ramp(frame, start, 22, Easing.inOut(Easing.cubic)),
        backgroundColor: c.lime,
      }}
    />
  );
};

export const Source: React.FC<{ text: string; start: number }> = ({
  text,
  start,
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: MARGIN,
        top: 1250,
        fontFamily: sans,
        fontSize: 26,
        color: c.muted,
        opacity: ramp(frame, start, 18),
      }}
    >
      {text}
    </div>
  );
};

// Source Serif's % sits loose after the figures; pull it in.
export const Pct: React.FC = () => (
  <span style={{ marginLeft: "-0.07em" }}>%</span>
);

const Person: React.FC<{
  x: number;
  y: number;
  fill: number;
  show: number;
}> = ({ x, y, fill, show }) => (
  <g transform={`translate(${x} ${y})`} opacity={show}>
    <circle cx={13} cy={8} r={7} fill={c.empty} />
    <path d="M2 44 V28 a11 11 0 0 1 22 0 V44 Z" fill={c.empty} />
    <g
      opacity={fill}
      transform={`translate(13 26) scale(${0.6 + 0.4 * fill}) translate(-13 -26)`}
    >
      <circle cx={13} cy={8} r={7} fill={c.navy} />
      <path d="M2 44 V28 a11 11 0 0 1 22 0 V44 Z" fill={c.navy} />
    </g>
  </g>
);

// 69%: the number counts up while 69 of 100 travellers fill in.
export const GNAiSearch: React.FC = () => {
  const frame = useCurrentFrame();
  const target = 69;
  const fillStart = 34;
  const filled = target * ramp(frame, fillStart, 54, Easing.inOut(Easing.quad));
  const cols = 20;
  const rows = 5;
  const lines = [
    "Of travellers now rely on AI",
    "search summaries alone, often",
    "without clicking through at all.",
  ];
  return (
    <AbsoluteFill>
      <Background />
      <Header />
      <div
        style={{
          position: "absolute",
          left: MARGIN - 6,
          top: 150,
          fontFamily: serif,
          fontWeight: 700,
          fontSize: 300,
          lineHeight: 1.1,
          color: c.navy,
          ...rise(frame, 10, 40),
        }}
      >
        {Math.round(filled)}
        <Pct />
      </div>
      <Rule top={500} start={22} />
      <svg
        width={cols * 37}
        height={rows * 58}
        style={{ position: "absolute", left: MARGIN, top: 570 }}
      >
        {Array.from({ length: cols * rows }, (_, i) => (
          <Person
            key={i}
            x={Math.floor(i / rows) * 37}
            y={(i % rows) * 58}
            fill={Math.min(Math.max(filled - i, 0), 1)}
            show={ramp(frame, 24 + (i % rows) * 2, 12)}
          />
        ))}
      </svg>
      <div
        style={{
          position: "absolute",
          left: MARGIN,
          top: 920,
          fontFamily: sans,
          fontSize: 46,
          lineHeight: 1.36,
          color: c.text,
        }}
      >
        {lines.map((line, i) => (
          <div key={line} style={rise(frame, 92 + i * 7, 20)}>
            {line}
          </div>
        ))}
      </div>
      <Source text="Source: Amadeus Travel Dreams 2026" start={130} />
    </AbsoluteFill>
  );
};

const reasons = [
  { pct: 74, label: ["Greater control over their", "booking and any changes"] },
  { pct: 66, label: ["Better service, dealing with", "the hotel directly"] },
  { pct: 62, label: ["Better value through rates", "and package deals"] },
];

const Reason: React.FC<{
  pct: number;
  label: string[];
  top: number;
  start: number;
}> = ({ pct, label, top, start }) => {
  const frame = useCurrentFrame();
  const p = ramp(frame, start + 6, 36, Easing.inOut(Easing.quad));
  const track = GN_WIDTH - MARGIN * 2;
  return (
    <div style={{ position: "absolute", left: MARGIN, top, width: track }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          ...rise(frame, start, 24),
        }}
      >
        <div
          style={{
            width: 250,
            fontFamily: serif,
            fontWeight: 700,
            fontSize: 112,
            lineHeight: 1,
            color: c.navy,
          }}
        >
          {Math.round(pct * p)}
          <Pct />
        </div>
        <div
          style={{
            fontFamily: sans,
            fontSize: 40,
            lineHeight: 1.3,
            color: c.text,
          }}
        >
          {label.map((l) => (
            <div key={l}>{l}</div>
          ))}
        </div>
      </div>
      <div
        style={{
          marginTop: 26,
          height: 14,
          width: track,
          backgroundColor: c.empty,
          opacity: ramp(frame, start, 14),
        }}
      >
        <div
          style={{
            height: "100%",
            width: track * (pct / 100) * p,
            backgroundColor: c.lime,
          }}
        />
      </div>
    </div>
  );
};

// Why guests book direct: three reasons, each counting up with its bar.
export const GNBookDirect: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Background />
      <Header />
      <div
        style={{
          position: "absolute",
          left: MARGIN,
          top: 180,
          fontFamily: serif,
          fontWeight: 700,
          fontSize: 116,
          lineHeight: 1.08,
          color: c.navy,
        }}
      >
        <div style={rise(frame, 8, 36)}>Why guests</div>
        <div style={rise(frame, 16, 36)}>book direct</div>
      </div>
      <Rule top={462} start={30} />
      {reasons.map((r, i) => (
        <Reason key={r.pct} {...r} top={560 + i * 225} start={48 + i * 30} />
      ))}
      <Source text="Source: SiteMinder Changing Traveller Report" start={140} />
    </AbsoluteFill>
  );
};

// Market Insight card (GN's own 30% design): blob, rings and dots build in,
// the number counts up, then two bars show what 30% higher looks like.
const m = {
  lime: "#D4E157",
  pale: "#E8EE9C",
  average: "#C9CFD6",
};

const Ring: React.FC<{
  cx: number;
  cy: number;
  r: number;
  stroke: string;
  width: number;
  opacity?: number;
  start: number;
}> = ({ cx, cy, r, stroke, width, opacity = 1, start }) => {
  const frame = useCurrentFrame();
  const p = ramp(frame, start, 40, Easing.inOut(Easing.cubic));
  return (
    <circle
      cx={cx}
      cy={cy}
      r={r}
      fill="none"
      stroke={stroke}
      strokeWidth={width}
      opacity={opacity}
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - p}
      transform={`rotate(-90 ${cx} ${cy})`}
    />
  );
};

const CompareBar: React.FC<{
  label: string;
  value: number;
  colour: string;
  top: number;
  start: number;
  chip?: string;
}> = ({ label, value, colour, top, start, chip }) => {
  const frame = useCurrentFrame();
  const p = ramp(frame, start + 6, 30, Easing.inOut(Easing.quad));
  const chipIn = ramp(frame, start + 32, 14, Easing.out(Easing.back(2)));
  return (
    <div style={{ position: "absolute", left: MARGIN, top }}>
      <div
        style={{
          fontFamily: sans,
          fontWeight: 600,
          fontSize: 28,
          color: c.navy,
          marginBottom: 12,
          ...rise(frame, start, 16),
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div
          style={{
            height: 44,
            width: 560 * value * p,
            backgroundColor: colour,
          }}
        />
        {chip ? (
          <div
            style={{
              fontFamily: sans,
              fontWeight: 700,
              fontSize: 30,
              color: c.navy,
              backgroundColor: m.lime,
              padding: "4px 16px",
              borderRadius: 30,
              opacity: chipIn,
              transform: `scale(${0.6 + 0.4 * chipIn})`,
            }}
          >
            {chip}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export const GNConversion: React.FC = () => {
  const frame = useCurrentFrame();
  const count = 30 * ramp(frame, 40, 40, Easing.out(Easing.quad));
  const blob = ramp(frame, 0, 30, Easing.out(Easing.back(1.2)));
  const stripe = (frame * 1.2) % 33.94;
  return (
    <AbsoluteFill style={{ backgroundColor: c.white, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: -190,
          top: 250,
          width: 720,
          height: 720,
          borderRadius: "50%",
          backgroundColor: m.pale,
          transform: `scale(${blob})`,
        }}
      />
      <svg
        width={GN_WIDTH}
        height={GN_HEIGHT}
        style={{ position: "absolute", left: 0, top: 0 }}
      >
        <Ring
          cx={1080 + 170}
          cy={600}
          r={250}
          stroke={c.navy}
          width={3}
          opacity={0.4}
          start={12}
        />
        <Ring cx={965} cy={1215} r={78} stroke={m.lime} width={5} start={26} />
        {Array.from({ length: 14 }, (_, i) => {
          const pop = ramp(frame, 10 + i * 2, 10, Easing.out(Easing.back(3)));
          return (
            <circle
              key={i}
              cx={858 + (i % 7) * 25}
              cy={205 + Math.floor(i / 7) * 25}
              r={5.5 * pop}
              fill={c.navy}
            />
          );
        })}
      </svg>
      <Header centred />
      <div
        style={{
          position: "absolute",
          left: MARGIN,
          top: 330,
          fontFamily: sans,
          fontStyle: "italic",
          fontWeight: 500,
          fontSize: 24,
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: c.navy,
          ...rise(frame, 22, 14),
        }}
      >
        — Market Insight —
      </div>
      <div
        style={{
          position: "absolute",
          left: MARGIN - 8,
          top: 380,
          fontFamily: serif,
          fontWeight: 700,
          fontSize: 270,
          lineHeight: 1,
          letterSpacing: "-0.03em",
          color: c.navy,
          ...rise(frame, 34, 40),
        }}
      >
        {Math.round(count)}
        <Pct />
      </div>
      <div
        style={{
          position: "absolute",
          left: MARGIN,
          top: 680,
          fontFamily: sans,
          fontWeight: 500,
          fontSize: 46,
          lineHeight: 1.3,
          color: c.navy,
        }}
      >
        <div style={rise(frame, 70, 20)}>Higher guest conversion</div>
        <div style={rise(frame, 77, 20)}>than the industry average</div>
      </div>
      <CompareBar
        label="Industry average"
        value={1}
        colour={m.average}
        top={900}
        start={96}
      />
      <CompareBar
        label="Our hotels"
        value={1.3}
        colour={c.navy}
        top={1030}
        start={110}
        chip="+30%"
      />
      <div
        style={{
          position: "absolute",
          left: MARGIN,
          top: 1220,
          fontFamily: sans,
          fontSize: 26,
          color: c.navy,
          opacity: 0.75 * ramp(frame, 140, 18),
        }}
      >
        Across the hotels we work with
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 24,
          background: `repeating-linear-gradient(135deg, ${c.navy} 0, ${c.navy} 12px, transparent 12px, transparent 24px)`,
          backgroundPosition: `${stripe}px 0`,
          transform: `translateY(${(1 - ramp(frame, 4, 20)) * 24}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

export const GN_STATS = [
  { id: "gn-ai-search", component: GNAiSearch, durationInFrames: 8 * GN_FPS },
  {
    id: "gn-book-direct",
    component: GNBookDirect,
    durationInFrames: 9 * GN_FPS,
  },
  {
    id: "gn-conversion",
    component: GNConversion,
    durationInFrames: 8 * GN_FPS,
  },
];
