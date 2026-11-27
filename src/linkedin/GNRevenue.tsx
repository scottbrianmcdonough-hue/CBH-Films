import React from "react";
import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { sans, serif } from "../hotel-film/theme";

// Great National Revenue Management (Scott, 27 Nov: next week's GN LinkedIn post, "While your team is busy with
// Christmas, someone can be getting January ready"). Third take, after Scott's notes ("end card is too busy", "doesn't
// explain Revanista", "doesn't feel like Christmas", "what does the calendar have to do with revenue", then "more
// corporate for GN, not advent calendar stuff"): the whole piece is a revenue screen.
//   - December's rate grid, every date busy, deep shading and high rates: "December's full." Behind it GN's own hotels
//     at dusk cut on the beat in a navy tint (Scott: "creative corporate like that last one"); Christmas comes from the
//     month itself and a light snowfall, nothing more.
//   - The grid slides across to January, like a revenue system moving to the next month: one flat rate on every date,
//     "Then comes January."
//   - Three steps light in turn, Demand, Competitors, Rates set: demand shading washes in, a competitor check sweeps
//     the dates, and the rates move to match, weekends up and quiet midweek dates sharper: "The right rate for every
//     date." Revanista's logo sits in the screen's header (the screen is the system). Rates are illustrative only.
//   - GN's white: "You look after Christmas. / We'll get January ready." End card: the roundel, Great National Revenue
//     Management, one line saying what Revanista is.
// The Contact Centre video's type and colours, so the two posts read as a pair. No hyphens, em dashes or triads in the
// text. 4:5 and 16:9 (`wide`). Sound: scripts/gn-revenue-sfx.py (reads BEAT, END and T from here).

/* Colours */
const navy = "#182b3c";
const navyDeep = "#0f1e2b";
const lime = "#aabb17";
const grey = "#6b7b8a";
const pale = "#eef1f4";
const white = "#ffffff";

/* Motion */
const out = Easing.out(Easing.cubic);
const io = Easing.inOut(Easing.cubic);
const RISE = 22;

const ramp = (f: number, start: number, len: number, ease = out) =>
  interpolate(f, [start, start + len], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

const enter = (f: number, start: number, away: number, y = 36): React.CSSProperties => {
  const p = ramp(f, start, RISE);
  const g = ramp(f, away, 16, io);
  return { opacity: p * (1 - g), transform: `translateY(${(1 - p) * y - g * 24}px)` };
};

// a seeded random, so every render is the same
const rand = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/* Timing (frames at 30fps), on the track's beat (120 BPM, 15 frames), counted back from END: the end card lands on the
   track's last hit */
export const BEAT = 15;
export const END = 384;
const beat = (n: number) => END - n * BEAT;
export const T = {
  L1: beat(24), // "December's full."
  DEC: [beat(23), beat(20)] as [number, number], // December's dates fill up
  SWIPE: beat(18), // the grid slides across to January
  L2: beat(17), // "Then comes January."
  DEMAND: beat(16), // demand shading washes in
  COMP: beat(14), // the competitor check sweeps the dates
  RATES: [beat(12), beat(10)] as [number, number], // the rates move, date by date
  L3: beat(12), // "The right rate for every date."
  CLEAR: beat(9), // the navy clears to white
  A1: beat(8), // "You look after Christmas."
  A2: beat(6), // "We'll get January ready."
  A_OUT: beat(1) - 4,
  END,
};
export const GN_REVENUE_FRAMES = T.END + 120;

/* Layouts */
type Layout = {
  x: number;
  badge: { top: number; size: number };
  line: { size: number; top: number; width?: number };
  card: { left: number; top: number; w: number; h: number; pad: number; head: number };
  date: { w: number; h: number; gap: number; num: number; rate: number };
  answer: { size: number; tops: [number, number] };
  end: { cx: number; badge: [number, number]; title: [number, number]; line: [number, number, number] };
};

const LAYOUTS: Record<"tall" | "wide", Layout> = {
  tall: {
    x: 80,
    badge: { top: 80, size: 120 },
    line: { size: 84, top: 290 },
    card: { left: 80, top: 440, w: 920, h: 740, pad: 40, head: 50 },
    date: { w: 112, h: 94, gap: 8, num: 20, rate: 27 },
    answer: { size: 84, tops: [510, 616] },
    end: { cx: 540, badge: [380, 190], title: [610, 84], line: [850, 30, 960] },
  },
  wide: {
    x: 120,
    badge: { top: 70, size: 110 },
    line: { size: 80, top: 420, width: 760 },
    card: { left: 1000, top: 200, w: 800, h: 680, pad: 36, head: 46 },
    date: { w: 96, h: 84, gap: 8, num: 18, rate: 24 },
    answer: { size: 92, tops: [380, 490] },
    end: { cx: 960, badge: [200, 170], title: [410, 84], line: [640, 30, 900] },
  },
};

/* The months (Mon first) and their illustrative rates */
type Month = { name: string; offset: number; days: number; rate: (d: number) => number };
const DECEMBER: Month = {
  name: "December 2026",
  offset: 1, // starts on a Tuesday
  days: 31,
  rate: (d) => {
    if (d >= 23 && d <= 25) return 249; // Christmas
    if (d === 30) return 239; // New Year's Eve
    const wd = (1 + d) % 7;
    return [169, 165, 169, 179, 209, 229, 185][wd] + Math.round((rand(d + 60) - 0.5) * 10);
  },
};
const FLAT = 139;
const JANUARY: Month = {
  name: "January 2027",
  offset: 4, // starts on a Friday
  days: 31,
  rate: (d) => {
    if (d === 0) return 189; // New Year's Day
    if (d === 1) return 169;
    const wd = (4 + d) % 7;
    return [109, 105, 109, 119, 159, 179, 125][wd] + Math.round((rand(d + 3) - 0.5) * 8);
  },
};
const heatOf = (rate: number) => Math.min(1, Math.max(0, (rate - 100) / 100)); // 0 quiet, 1 busy

/* Light snow over the navy: the only festive touch */
const Snow: React.FC<{ f: number; w: number; h: number }> = ({ f, w, h }) => (
  <AbsoluteFill style={{ overflow: "hidden" }}>
    {Array.from({ length: 70 }, (_, i) => {
      const speed = 0.7 + rand(i + 1) * 1.2;
      const size = 2 + rand(i + 2) * 4;
      const y = ((rand(i + 4) * (h + 60) + f * speed) % (h + 60)) - 30;
      const x = rand(i + 3) * w + Math.sin(f / 45 + i) * 14;
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: size,
            height: size,
            borderRadius: "50%",
            background: white,
            opacity: 0.18 + rand(i + 5) * 0.3,
          }}
        />
      );
    })}
  </AbsoluteFill>
);

/* GN's own hotels behind, tinted GN navy, cutting on the beat like the Contact Centre video (Scott: "creative corporate
   like that last one"): December's three at dusk and after dark, then Riverside Park, the client the post names, for
   January. None of them were in the Contact Centre video. Photos from GN's Our Hotels page (gn-key/hotels) */
const SHOTS: { src: string; tall: string; from: number }[] = [
  { src: "newtown-park", tall: "40% 50%", from: 0 },
  { src: "south-court", tall: "45% 50%", from: beat(22) },
  { src: "abbeyleix-manor", tall: "45% 50%", from: beat(20) },
  { src: "riverside-park", tall: "35% 50%", from: beat(18) },
];

const Hotels: React.FC<{ f: number; wide: boolean }> = ({ f, wide }) => {
  const i = SHOTS.reduce((acc, s, k) => (f >= s.from ? k : acc), 0);
  const shot = SHOTS[i];
  const end = i + 1 < SHOTS.length ? SHOTS[i + 1].from : T.CLEAR + 20;
  const push = 1.06 + 0.05 * Math.min(1, (f - shot.from) / Math.max(1, end - shot.from));
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img
        src={staticFile(`campaigns/gn-key/hotels/${shot.src}.jpg`)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: wide ? "50% 50%" : shot.tall,
          filter: "blur(3px) saturate(0.9)",
          transform: `scale(${push})`,
        }}
      />
      <AbsoluteFill
        style={{
          background: wide
            ? "linear-gradient(90deg, rgba(24,43,60,0.86) 0%, rgba(24,43,60,0.74) 45%, rgba(24,43,60,0.6) 100%)"
            : "linear-gradient(180deg, rgba(24,43,60,0.78) 0%, rgba(24,43,60,0.66) 50%, rgba(24,43,60,0.8) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

/* One month of dates: shading by demand, a rate on each */
const Grid: React.FC<{
  m: Month;
  g: Layout["date"];
  heat: (d: number) => number; // 0 to 1, how deep each date's shading is now
  rate: (d: number) => number; // the rate each date shows now
  arrow?: (d: number) => number; // -1 to 1, an arrow as a rate moves
  scanned?: (d: number) => boolean; // the competitor check passing over
}> = ({ m, g, heat, rate, arrow, scanned }) => (
  <div>
    <div style={{ display: "grid", gridTemplateColumns: `repeat(7, ${g.w}px)`, gap: g.gap, marginBottom: 8 }}>
      {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
        <div key={i} style={{ fontFamily: sans, fontSize: g.num, color: grey, textAlign: "center" }}>
          {d}
        </div>
      ))}
    </div>
    <div style={{ display: "grid", gridTemplateColumns: `repeat(7, ${g.w}px)`, gridAutoRows: g.h, gap: g.gap }}>
      {Array.from({ length: m.offset }, (_, i) => (
        <div key={`e${i}`} />
      ))}
      {Array.from({ length: m.days }, (_, d) => {
        const h = heat(d);
        const dark = h > 0.45;
        const a = arrow ? arrow(d) : 0;
        return (
          <div
            key={d}
            style={{
              position: "relative",
              borderRadius: 12,
              background: `rgba(24,43,60,${0.07 + h * 0.85})`,
              outline: scanned && scanned(d) ? `3px solid ${lime}` : "none",
              outlineOffset: -3,
              boxSizing: "border-box",
              padding: "6px 9px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontFamily: sans, fontSize: g.num, color: dark ? "rgba(255,255,255,0.75)" : grey }}>{d + 1}</span>
            <span
              style={{
                fontFamily: sans,
                fontSize: g.rate,
                fontWeight: 700,
                color: dark ? white : navy,
                display: "flex",
                alignItems: "center",
                gap: 3,
              }}
            >
              €{rate(d)}
              {Math.abs(a) > 0.02 ? (
                <svg width={g.rate * 0.6} height={g.rate * 0.6} viewBox="0 0 24 24" style={{ opacity: Math.abs(a) }}>
                  <path d={a > 0 ? "M12 5l7 9H5z" : "M12 19l7-9H5z"} fill={lime} />
                </svg>
              ) : null}
            </span>
          </div>
        );
      })}
    </div>
  </div>
);

/* The revenue screen: the month in the header, Revanista's logo, the three steps, the grid sliding month to month */
const STEPS = ["Demand", "Competitors", "Rates set"];
const SCATTER = (() => {
  const o = Array.from({ length: 31 }, (_, i) => i);
  for (let i = o.length - 1; i > 0; i--) {
    const j = Math.floor(rand(i + 40) * (i + 1));
    [o[i], o[j]] = [o[j], o[i]];
  }
  const at: number[] = [];
  o.forEach((d, k) => (at[d] = k));
  return at;
})();

const Screen: React.FC<{ f: number; L: Layout }> = ({ f, L }) => {
  const g = L.date;
  const swipe = ramp(f, T.SWIPE, 18, io);
  const inner = L.card.w - L.card.pad * 2;
  const demand = ramp(f, T.DEMAND, 30, io);
  const stepAt = [T.DEMAND, T.COMP, T.RATES[0]];
  const sweep = interpolate(f, [T.COMP, T.RATES[0] - 4], [0, 31], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const decHeat = (d: number) => heatOf(DECEMBER.rate(d)) * ramp(f, T.DEC[0] + (SCATTER[d] / 30) * (T.DEC[1] - T.DEC[0]), 8);
  const janSet = (d: number) => ramp(f, T.RATES[0] + (d / 30) * (T.RATES[1] - T.RATES[0]), 10, io);
  const janRate = (d: number) => Math.round(interpolate(janSet(d), [0, 1], [FLAT, JANUARY.rate(d)]));
  const janHeat = (d: number) => heatOf(JANUARY.rate(d)) * demand;
  const janArrow = (d: number) => {
    const p = janSet(d);
    const dir = Math.sign(JANUARY.rate(d) - FLAT);
    return dir * Math.sin(Math.PI * Math.min(1, p * 1.2));
  };

  return (
    <div style={{ width: "100%", height: "100%", boxSizing: "border-box", padding: L.card.pad, background: white, borderRadius: 26, overflow: "hidden" }}>
      {/* header: the month, sliding with the grid, and Revanista */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div style={{ position: "relative", height: L.card.head * 1.15, flex: 1, overflow: "hidden" }}>
          {[DECEMBER, JANUARY].map((m, i) => (
            <div
              key={m.name}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                fontFamily: serif,
                fontWeight: 500,
                fontSize: L.card.head,
                color: navy,
                lineHeight: 1.1,
                whiteSpace: "nowrap",
                transform: `translateX(${(i - swipe) * (inner + 60)}px)`,
                opacity: i === 0 ? 1 - swipe : swipe,
              }}
            >
              {m.name}
            </div>
          ))}
        </div>
        <Img src={staticFile("brand/revanista-logo-navy.png")} style={{ height: Math.round(L.card.head * 1.15) }} />
      </div>
      {/* the three steps, each lighting as it happens */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {STEPS.map((s, i) => {
          const on = ramp(f, stepAt[i], 10) > 0.5;
          return (
            <div
              key={s}
              style={{
                fontFamily: sans,
                fontSize: Math.round(g.num * 1.05),
                fontWeight: 600,
                padding: "6px 14px",
                borderRadius: 999,
                color: on ? navy : grey,
                background: on ? "rgba(170,187,23,0.22)" : pale,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ width: 10, height: 10, borderRadius: 5, background: on ? lime : "#c9d1d9" }} />
              {s}
            </div>
          );
        })}
      </div>
      {/* the grids, December sliding out to the left as January comes in */}
      <div style={{ position: "relative", height: 6 * (g.h + g.gap) + 30 }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: inner, transform: `translateX(${-swipe * (inner + 60)}px)` }}>
          <Grid m={DECEMBER} g={g} heat={decHeat} rate={DECEMBER.rate} />
        </div>
        <div style={{ position: "absolute", left: 0, top: 0, width: inner, transform: `translateX(${(1 - swipe) * (inner + 60)}px)` }}>
          <Grid
            m={JANUARY}
            g={g}
            heat={janHeat}
            rate={janRate}
            arrow={janArrow}
            scanned={(d) => sweep > d && sweep < d + 2.5}
          />
        </div>
      </div>
    </div>
  );
};

/* The film */
export const GNRevenue: React.FC<{ wide?: boolean; sound?: boolean }> = ({ wide = false, sound = true }) => {
  const f = useCurrentFrame();
  const L = LAYOUTS[wide ? "wide" : "tall"];
  const W = wide ? 1920 : 1080;
  const H = wide ? 1080 : 1350;

  const cleared = ramp(f, T.CLEAR, 20, io);
  const cardIn = ramp(f, 4, 20);

  const E = L.end;
  const travel = ramp(f, T.END - 10, 30, io);
  const title = ramp(f, T.END + 12, 24);
  const title2 = ramp(f, T.END + 20, 24);
  const line = ramp(f, T.END + 38, 24);
  const badgeSize = interpolate(travel, [0, 1], [L.badge.size, E.badge[1]]);
  const badgeLeft = interpolate(travel, [0, 1], [L.x, E.cx - E.badge[1] / 2]);
  const badgeTop = interpolate(travel, [0, 1], [L.badge.top, E.badge[0]]);

  return (
    <AbsoluteFill style={{ background: "linear-gradient(135deg, #ffffff 0%, #ffffff 36%, #eef1f4 100%)" }}>
      {/* the track, the slide and the ticks (scripts/gn-revenue-sfx.py) */}
      {sound ? <Audio src={staticFile("campaigns/gn-revenue/soundtrack.wav")} /> : null}

      {/* GN's hotels in GN navy with a light snowfall, clearing to white */}
      {cleared < 1 ? (
        <AbsoluteFill style={{ opacity: 1 - cleared }}>
          <AbsoluteFill style={{ background: navyDeep }} />
          <Hotels f={f} wide={wide} />
          <Snow f={f} w={W} h={H} />
        </AbsoluteFill>
      ) : null}

      {/* GN roundel, travelling to the middle for the end card */}
      <Img
        src={staticFile("brand/gn/gnh-badge.svg")}
        style={{ position: "absolute", left: badgeLeft, top: badgeTop, width: badgeSize, height: badgeSize }}
      />

      {/* the lines over the navy */}
      {[
        { text: "December’s full.", start: T.L1, away: T.SWIPE - 4 },
        { text: "Then comes January.", start: T.L2, away: T.L3 - 6 },
        { text: "The right rate for every date.", start: T.L3, away: T.CLEAR },
      ].map((l) => (
        <div
          key={l.text}
          style={{
            position: "absolute",
            left: L.x,
            top: L.line.top,
            width: L.line.width,
            fontFamily: serif,
            fontWeight: 500,
            fontSize: L.line.size,
            lineHeight: 1.1,
            color: white,
            whiteSpace: L.line.width ? "normal" : "nowrap",
            ...enter(f, l.start, l.away),
          }}
        >
          {l.text}
        </div>
      ))}

      {/* the revenue screen */}
      <div
        style={{
          position: "absolute",
          left: L.card.left,
          top: L.card.top,
          width: L.card.w,
          height: L.card.h,
          borderRadius: 26,
          boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
          opacity: cardIn * (1 - cleared),
          transform: `translateY(${(1 - cardIn) * 40 - cleared * 30}px)`,
        }}
      >
        <Screen f={f} L={L} />
      </div>

      {/* the answer, navy on white */}
      {[
        { text: "You look after Christmas.", start: T.A1, top: L.answer.tops[0] },
        { text: "We’ll get January ready.", start: T.A2, top: L.answer.tops[1] },
      ].map((l) => (
        <div
          key={l.text}
          style={{
            position: "absolute",
            left: L.x,
            top: l.top,
            fontFamily: serif,
            fontWeight: 500,
            fontSize: L.answer.size,
            lineHeight: 1.1,
            color: navy,
            whiteSpace: "nowrap",
            ...enter(f, l.start, T.A_OUT),
          }}
        >
          {l.text}
        </div>
      ))}

      {/* end card: the roundel, the service, what Revanista is */}
      <div style={{ position: "absolute", left: 0, width: W, top: E.title[0], textAlign: "center", color: navy }}>
        <div style={{ fontFamily: serif, fontWeight: 500, fontSize: E.title[1], lineHeight: 1.08, opacity: title, transform: `translateY(${(1 - title) * 30}px)` }}>
          Great National
        </div>
        <div style={{ fontFamily: serif, fontWeight: 500, fontSize: E.title[1], lineHeight: 1.08, opacity: title2, transform: `translateY(${(1 - title2) * 30}px)` }}>
          Revenue Management
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: E.cx - E.line[2] / 2,
          width: E.line[2],
          top: E.line[0],
          textAlign: "center",
          fontFamily: sans,
          fontSize: E.line[1],
          lineHeight: 1.5,
          color: navy,
          opacity: line,
          transform: `translateY(${(1 - line) * 20}px)`,
        }}
      >
        Run on Revanista, our own revenue management system
      </div>
    </AbsoluteFill>
  );
};
