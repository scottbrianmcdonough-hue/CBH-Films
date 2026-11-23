import React from "react";
import { AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { FilmFinish } from "../components/FilmFinish";
import { colors, EASE_IN_OUT, progress, sans, serif } from "../theme";

// "Plan your year of micro breaks" (Bianca, 23 Nov: a hotel a month for the 1 Jan post). A wall calendar for
// 2027 hung on a gold wire binding: every page is a month, its hotel full bleed, the month name and the week
// of the break beneath with that weekend ringed in gold, like a plan pencilled in. The one move: on the beat
// each page lifts up over the binding and away, showing its dark back, and the next month is underneath.
// Cover "2027 / Plan your year of micro breaks", back page the question and the white CB.
// MOCK-UP: stills only (frame grabs where there is footage) to agree the look before the build.

const W = 1080;
const H = 1920;
const FLIP = 16; // frames for a page to lift away

type Month = {
  month: string;
  theme: string;
  place: string;
  hotel: string[];
  img: string;
  pos?: string;
  // the Monday of the week shown, and the break's days within it (0 = Monday)
  monday: [number, number]; // [day of month, days in previous month]
  ring: [number, number];
  daysInMonth: number;
};

export const MONTHS: Month[] = [
  { month: "January", theme: "A spa reset", place: "WINDERMERE, LAKE DISTRICT", hotel: ["Low Wood Bay", "Resort & Spa"],
    img: "campaigns/year-2027/mock/low-wood-bay-candles.jpg", monday: [11, 31], ring: [4, 6], daysInMonth: 31 },
  { month: "February", theme: "Fires and canopied beds", place: "GUISBOROUGH, NORTH YORKSHIRE", hotel: ["Gisborough Hall"],
    img: "campaigns/year-2027/mock/gisborough-hall-fireplace.jpg", monday: [8, 31], ring: [4, 6], daysInMonth: 28 },
  { month: "March", theme: "Mother's Day lunch", place: "WANSFORD, PETERBOROUGH", hotel: ["Haycock Manor"],
    img: "hotels/haycock-manor/prevost-plate.jpg", monday: [1, 28], ring: [4, 6], daysInMonth: 31 },
  { month: "August", theme: "Summer by the sea", place: "HYTHE, KENT", hotel: ["Hythe Imperial Hotel,", "Golf & Spa"],
    img: "campaigns/year-2027/mock/hythe-aerial.jpg", pos: "50% 50%", monday: [23, 31], ring: [4, 6], daysInMonth: 31 },
];

const days = ["M", "T", "W", "T", "F", "S", "S"];

const Binding: React.FC = () => {
  // a twin loop wire across the top: a punched black strip, gold loops through it
  const loops = 28;
  const gap = W / loops;
  return (
    <svg width={W} height={140} style={{ position: "absolute", left: 0, top: 0 }}>
      <defs>
        <linearGradient id="wire" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7d6431" />
          <stop offset="0.45" stopColor={colors.lightGold} />
          <stop offset="1" stopColor="#6e5629" />
        </linearGradient>
        <linearGradient id="strip" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.85" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={W} height={140} fill="url(#strip)" />
      {Array.from({ length: loops }, (_, i) => {
        const x = gap * (i + 0.5);
        return (
          <g key={i}>
            <rect x={x - 7} y={66} width={14} height={14} rx={7} fill="#050505" />
            <path d={`M${x - 6} 74 C ${x - 6} 30, ${x - 6} 26, ${x - 3} 22`} stroke="url(#wire)" strokeWidth={4} fill="none" strokeLinecap="round" />
            <path d={`M${x + 4} 74 C ${x + 4} 30, ${x + 4} 26, ${x + 7} 22`} stroke="url(#wire)" strokeWidth={4} fill="none" strokeLinecap="round" />
          </g>
        );
      })}
      <rect x={0} y={18} width={W} height={5} fill="url(#wire)" opacity={0.9} />
    </svg>
  );
};

// the hotel label: gold caps place over its underline, the name in cream Cormorant (the house rule)
const Label: React.FC<{ place: string; hotel: string[]; o: number }> = ({ place, hotel, o }) => (
  <div style={{ position: "absolute", left: 80, top: 270, opacity: o }}>
    <div style={{ display: "inline-block", fontFamily: sans, fontWeight: 600, fontSize: 26, letterSpacing: 5, color: colors.gold,
      paddingBottom: 10, borderBottom: `2px solid ${colors.gold}` }}>{place}</div>
    {hotel.map((l) => (
      <div key={l} style={{ fontFamily: serif, fontWeight: 400, fontSize: 70, lineHeight: 1.05, color: colors.cream, marginTop: 8,
        textShadow: "0 2px 24px rgba(0,0,0,0.55)" }}>{l}</div>
    ))}
  </div>
);

const Week: React.FC<{ m: Month; ring: number }> = ({ m, ring }) => {
  const cell = 120;
  const x0 = (W - cell * 7) / 2;
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = m.monday[0] + i;
    return d > m.daysInMonth ? d - m.daysInMonth : d;
  });
  const [a, b] = m.ring;
  const rx = (cell * (b - a + 1)) / 2 + 6;
  const cx = x0 + cell * (a + b + 1) / 2;
  const cy = 112;
  // a hand-drawn ring round the break, slightly off true, overlapping its own start
  const pts: string[] = [];
  for (let k = 0; k <= 40; k++) {
    const t = (k / 36) * Math.PI * 2 - 2.6;
    const wob = 1 + 0.04 * Math.sin(k * 1.7);
    pts.push(`${cx + Math.cos(t) * rx * wob},${cy + Math.sin(t) * 58 * wob - k * 0.25}`);
  }
  const path = `M${pts.join(" L")}`;
  return (
    <svg width={W} height={200} style={{ position: "absolute", left: 0, top: 1240 }}>
      {days.map((d, i) => (
        <text key={i} x={x0 + cell * (i + 0.5)} y={40} textAnchor="middle" fontFamily={sans} fontWeight={600} fontSize={22}
          letterSpacing={3} fill={colors.cream} opacity={0.6}>{d}</text>
      ))}
      {dates.map((d, i) => (
        <text key={i} x={x0 + cell * (i + 0.5)} y={130} textAnchor="middle" fontFamily={serif} fontWeight={500} fontSize={60}
          fill={colors.cream} opacity={i >= a && i <= b ? 1 : 0.55}>{d}</text>
      ))}
      <path d={path} stroke={colors.gold} strokeWidth={4} fill="none" strokeLinecap="round" pathLength={1}
        strokeDasharray={1} strokeDashoffset={1 - ring} />
    </svg>
  );
};

const Page: React.FC<{ m: Month; len: number }> = ({ m, len }) => {
  const f = useCurrentFrame();
  const push = interpolate(f, [0, len], [1, 1.04]);
  const label = progress(f, FLIP + 4, 14);
  const ring = progress(f, FLIP + 14, 18, EASE_IN_OUT);
  return (
    <AbsoluteFill style={{ background: colors.black }}>
      <Img src={staticFile(m.img)} style={{ position: "absolute", inset: 0, width: W, height: H, objectFit: "cover",
        objectPosition: m.pos ?? "50% 50%", transform: `scale(${push})` }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 48%, rgba(0,0,0,0.82) 72%, rgba(0,0,0,0.9) 100%)" }} />
      <Label place={m.place} hotel={m.hotel} o={label} />
      <div style={{ position: "absolute", left: 80, top: 1035, fontFamily: serif, fontWeight: 400, fontSize: 132, color: colors.cream, lineHeight: 1 }}>{m.month}</div>
      <div style={{ position: "absolute", left: 84, top: 1172, fontFamily: serif, fontStyle: "italic", fontWeight: 400, fontSize: 50, color: colors.cream, opacity: 0.85 }}>{m.theme}</div>
      <Week m={m} ring={ring} />
    </AbsoluteFill>
  );
};

const Cover: React.FC = () => (
  <AbsoluteFill style={{ background: colors.black, alignItems: "center", justifyContent: "center" }}>
    <div style={{ fontFamily: serif, fontWeight: 400, fontSize: 300, color: colors.cream, lineHeight: 1, marginTop: -120 }}>2027</div>
    <div style={{ fontFamily: serif, fontStyle: "italic", fontWeight: 400, fontSize: 68, color: colors.cream, textAlign: "center", marginTop: 40, lineHeight: 1.15 }}>
      Plan your year<br />of micro breaks
    </div>
  </AbsoluteFill>
);

const Back: React.FC = () => (
  <AbsoluteFill style={{ background: colors.black, alignItems: "center", justifyContent: "center" }}>
    <div style={{ fontFamily: serif, fontWeight: 400, fontSize: 92, color: colors.cream, textAlign: "center", lineHeight: 1.12, marginTop: -160 }}>
      Which month<br />are you booking?
    </div>
    <Img src={staticFile("brand/cb-watermark.png")} style={{ position: "absolute", left: 920, top: 1452, width: 100, height: 108 }} />
  </AbsoluteFill>
);

// a page lifting up over the binding: it turns about its top edge towards us, darkening, its back seen past 90
const Lift: React.FC<{ total: number; children: React.ReactNode }> = ({ total, children }) => {
  const f = useCurrentFrame();
  const t = progress(f, total - FLIP, FLIP, (x) => x * x * (3 - 2 * x));
  const a = -t * 178;
  const back = a < -90;
  return (
    <AbsoluteFill style={{ transformOrigin: "50% 74px", transform: `perspective(2600px) rotateX(${a}deg)` }}>
      {back ? (
        <AbsoluteFill style={{ background: "#141413", transform: "rotateX(180deg)", filter: `brightness(${0.5 + 0.5 * t})` }} />
      ) : (
        <AbsoluteFill style={{ filter: `brightness(${1 - 0.45 * t})` }}>{children}</AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

const PAGE = 72; // a page on screen (2.4s) before it lifts
export const YEAR_SCENES = [
  { el: <Cover />, len: 60 },
  ...MONTHS.map((m) => ({ el: <Page m={m} len={PAGE + FLIP} />, len: PAGE })),
];
export const YEAR_FRAMES = YEAR_SCENES.reduce((s, x) => s + x.len, 0) + FLIP + 90;

export const YearCalendar: React.FC = () => {
  let at = 0;
  const seqs = YEAR_SCENES.map((s, i) => {
    const from = at;
    at += s.len;
    // each page starts as the one above begins to lift, so it is underneath
    return { ...s, from, i };
  });
  return (
    <AbsoluteFill style={{ background: colors.black }}>
      <Sequence from={at}><Back /></Sequence>
      {[...seqs].reverse().map((s) => (
        <Sequence key={s.i} from={s.from} durationInFrames={s.len + FLIP}>
          <Lift total={s.len + FLIP}>{s.el}</Lift>
        </Sequence>
      ))}
      <Binding />
      <FilmFinish />
    </AbsoluteFill>
  );
};
