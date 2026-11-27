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
  DEC: [6, beat(21)] as [number, number], // December fills in from the first second, a column at a time
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
  table: { label: number; labelSize: number; row: number; value: number; day: number; date: number };
  answer: { size: number; tops: [number, number] };
  end: { cx: number; badge: [number, number]; title: [number, number]; line: [number, number, number]; logo: [number, number] };
};

const LAYOUTS: Record<"tall" | "wide", Layout> = {
  tall: {
    x: 80,
    badge: { top: 80, size: 120 },
    line: { size: 84, top: 290 },
    card: { left: 60, top: 440, w: 960, h: 726, pad: 34, head: 50 },
    table: { label: 190, labelSize: 22, row: 88, value: 27, day: 17, date: 20 },
    answer: { size: 84, tops: [510, 616] },
    end: { cx: 540, badge: [360, 190], title: [590, 84], line: [830, 30, 960], logo: [915, 230] },
  },
  wide: {
    x: 120,
    badge: { top: 70, size: 110 },
    line: { size: 80, top: 420, width: 760 },
    card: { left: 960, top: 196, w: 860, h: 690, pad: 32, head: 46 },
    table: { label: 170, labelSize: 20, row: 84, value: 24, day: 15, date: 18 },
    answer: { size: 92, tops: [380, 490] },
    end: { cx: 960, badge: [180, 170], title: [390, 84], line: [620, 30, 900], logo: [700, 210] },
  },
};

/* The two weeks on screen, Revanista's rate table for each (Scott: "use the carousel, it was like a UI in there": the
   Revanista carousel's own screen, dates across the top, rows for suggested rate, base rate, left to sell and
   occupancy). Every figure is illustrative only. */
type Week = { name: string; days: string[]; dates: string[]; base: number[]; suggested: number[]; comp: number[]; left: number[]; occ: number[] };
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DECEMBER: Week = {
  name: "December 2026",
  days: DAYS,
  dates: ["21 Dec", "22 Dec", "23 Dec", "24 Dec", "25 Dec", "26 Dec", "27 Dec"],
  base: [219, 229, 249, 249, 249, 229, 209],
  suggested: [219, 229, 249, 249, 249, 229, 209],
  comp: [205, 215, 239, 245, 239, 219, 199],
  left: [2, 1, 0, 0, 0, 1, 3],
  occ: [98, 99, 100, 100, 100, 99, 97],
};
const FLAT = 139;
const JANUARY: Week = {
  name: "January 2027",
  days: DAYS,
  dates: ["4 Jan", "5 Jan", "6 Jan", "7 Jan", "8 Jan", "9 Jan", "10 Jan"],
  base: [FLAT, FLAT, FLAT, FLAT, FLAT, FLAT, FLAT],
  suggested: [109, 105, 109, 119, 159, 179, 125],
  comp: [115, 112, 115, 125, 152, 169, 129],
  left: [46, 48, 45, 41, 24, 15, 37],
  occ: [31, 28, 32, 38, 64, 76, 41],
};

/* Revanista's own colours, as on its screen in the carousel */
const RV = { head: "#5d6a87", base: "#2c3557", amber: "#f2b632", occ: "#cdd6e4", orange: "#e0802a", row: "#f4f6f9" };

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
   like that last one"): December's two at dusk (South Court's bright blue sign was out, the polish pass), then Riverside Park, the client the post names, for
   January. None of them were in the Contact Centre video. Photos from GN's Our Hotels page (gn-key/hotels) */
const SHOTS: { src: string; tall: string; from: number }[] = [
  { src: "newtown-park", tall: "40% 50%", from: 0 },
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

/* One week of Revanista's rate table. Each cell shows its value from its own frame on (`at`), so the rows fill in
   date by date; a lime outline runs down the column being checked. */
type Cell = { v: string; at?: number; tone?: number; arrow?: number }; // arrow: -1 to 1, a rate on the move
const ROW_LABELS = ["Suggested rate", "Base rate", "Competitors", "Left to sell", "Occupancy"];

const Table: React.FC<{
  f: number;
  w: Week;
  L: Layout;
  rows: Cell[][]; // per row, per day
  scan?: number; // the column being checked (fractional), or -1
}> = ({ f, w, L, rows, scan = -1 }) => {
  const t = L.table;
  const cols = `${t.label}px repeat(7, 1fr)`;
  const band = (i: number) => [undefined, RV.base, RV.row, RV.amber, RV.occ][i];
  const ink = (i: number) => [RV.orange, white, grey, navy, navy][i];
  return (
    <div style={{ position: "relative" }}>
      {/* the date header */}
      <div style={{ display: "grid", gridTemplateColumns: cols, background: RV.head, borderRadius: "10px 10px 0 0" }}>
        <div style={{ fontFamily: sans, fontSize: t.label * 0.11, color: "rgba(255,255,255,0.8)", padding: "10px 12px", fontWeight: 600 }}>Date</div>
        {w.days.map((d, i) => (
          <div key={i} style={{ textAlign: "center", padding: "8px 2px", fontFamily: sans, color: white }}>
            <div style={{ fontSize: t.day, opacity: 0.8 }}>{d}</div>
            <div style={{ fontSize: t.date, fontWeight: 700 }}>{w.dates[i]}</div>
          </div>
        ))}
      </div>
      {/* the rows */}
      {rows.map((row, r) => (
        <div key={r} style={{ display: "grid", gridTemplateColumns: cols, background: band(r) ?? white, borderBottom: "1px solid #e3e7ee", height: t.row, alignItems: "center" }}>
          <div style={{ fontFamily: sans, fontSize: t.labelSize, fontWeight: 600, color: r === 1 ? white : navy, padding: "0 12px" }}>{ROW_LABELS[r]}</div>
          {row.map((c, i) => {
            const p = c.at === undefined ? 1 : ramp(f, c.at, 8);
            return (
              <div key={i} style={{ position: "relative", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {c.arrow !== undefined && Math.abs(c.arrow) > 0.02 ? (
                  <svg
                    width={t.value * 0.55}
                    height={t.value * 0.55}
                    viewBox="0 0 24 24"
                    style={{ position: "absolute", top: 6, right: 4, opacity: Math.abs(c.arrow) }}
                  >
                    <path d={c.arrow > 0 ? "M12 4l8 11H4z" : "M12 20l8-11H4z"} fill={lime} />
                  </svg>
                ) : null}
                {c.tone !== undefined ? (
                  <div style={{ position: "absolute", inset: 3, borderRadius: 6, background: `rgba(44,53,87,${0.75 * c.tone * p})` }} />
                ) : null}
                <span
                  style={{
                    position: "relative",
                    fontFamily: sans,
                    fontSize: t.value,
                    fontWeight: 700,
                    color: c.tone !== undefined && c.tone * p > 0.5 ? white : ink(r),
                    opacity: c.at === undefined ? 1 : p,
                    transform: `translateY(${(1 - p) * 8}px)`,
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  {c.v}
                </span>
              </div>
            );
          })}
        </div>
      ))}
      {/* the column being checked */}
      {scan >= 0 && scan < 7 ? (
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `calc(${t.label}px + (100% - ${t.label}px) * ${Math.floor(scan)} / 7)`,
            width: `calc((100% - ${t.label}px) / 7)`,
            border: `3px solid ${lime}`,
            borderRadius: 8,
            pointerEvents: "none",
          }}
        />
      ) : null}
    </div>
  );
};

/* The revenue screen: the month, Revanista's logo, the three steps, and the week's table sliding December to January */
const STEPS = ["Demand", "Competitors", "Rates set"];

const Screen: React.FC<{ f: number; L: Layout }> = ({ f, L }) => {
  const swipe = ramp(f, T.SWIPE, 18, io);
  const inner = L.card.w - L.card.pad * 2;
  const stepAt = [T.DEMAND, T.COMP, T.RATES[0]];
  const each = (start: number, end: number) => (i: number) => start + (i / 6) * (end - start);

  // December: every row fills in, a column at a time, busy from the first frame of the card
  const dec = each(T.DEC[0], T.DEC[1]);
  const decRows: Cell[][] = [
    DECEMBER.suggested.map((v, i) => ({ v: `€${v}`, at: dec(i) })),
    DECEMBER.base.map((v, i) => ({ v: `€${v}`, at: dec(i) })),
    DECEMBER.comp.map((v, i) => ({ v: `€${v}`, at: dec(i) + 3 })),
    DECEMBER.left.map((v, i) => ({ v: `${v}`, at: dec(i) + 5 })),
    DECEMBER.occ.map((v, i) => ({ v: `${v}%`, at: dec(i) + 7, tone: v / 100 })),
  ];

  // January: one flat rate and the rooms left; then demand, the competitor check, and the rates set to match
  const occAt = each(T.DEMAND, T.DEMAND + 24);
  const compAt = each(T.COMP, T.RATES[0] - 6);
  const rateAt = each(T.RATES[0], T.RATES[1]);
  const janRows: Cell[][] = [
    JANUARY.suggested.map((v, i) => ({ v: `€${v}`, at: rateAt(i) })),
    JANUARY.base.map((_, i) => {
      const p = ramp(f, rateAt(i) + 6, 12, io);
      const v = Math.round(interpolate(p, [0, 1], [FLAT, JANUARY.suggested[i]]));
      const dir = Math.sign(JANUARY.suggested[i] - FLAT);
      return { v: `€${v}`, arrow: dir * Math.sin(Math.PI * Math.min(1, p * 1.15)) };
    }),
    JANUARY.comp.map((v, i) => ({ v: `€${v}`, at: compAt(i) })),
    JANUARY.left.map((v) => ({ v: `${v}` })),
    JANUARY.occ.map((v, i) => ({ v: `${v}%`, at: occAt(i), tone: v / 100 })),
  ];
  const scan = f >= T.COMP && f < T.RATES[0] ? interpolate(f, [T.COMP, T.RATES[0] - 2], [0, 7]) : -1;

  return (
    <div style={{ width: "100%", height: "100%", boxSizing: "border-box", padding: L.card.pad, background: white, borderRadius: 26, overflow: "hidden" }}>
      {/* header: the month, sliding with the table, and Revanista */}
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
        {STEPS.map((st, i) => {
          const on = ramp(f, stepAt[i], 10) > 0.5;
          return (
            <div
              key={st}
              style={{
                fontFamily: sans,
                fontSize: L.table.labelSize,
                fontWeight: 600,
                padding: "7px 16px",
                borderRadius: 999,
                color: on ? navy : grey,
                background: on ? "rgba(170,187,23,0.22)" : pale,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ width: 11, height: 11, borderRadius: 6, background: on ? lime : "#c9d1d9" }} />
              {st}
            </div>
          );
        })}
      </div>
      {/* the week's table, December sliding out to the left as January comes in */}
      <div style={{ position: "relative", height: L.table.row * 5 + L.table.date * 3.4 }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: inner, transform: `translateX(${-swipe * (inner + 60)}px)` }}>
          <Table f={f} w={DECEMBER} L={L} rows={decRows} />
        </div>
        <div style={{ position: "absolute", left: 0, top: 0, width: inner, transform: `translateX(${(1 - swipe) * (inner + 60)}px)` }}>
          <Table f={f} w={JANUARY} L={L} rows={janRows} scan={scan} />
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
  const cardIn = 1; // on screen from the first frame: LinkedIn previews it

  const E = L.end;
  const travel = ramp(f, T.A_OUT, 34, io); // the roundel heads for the middle as the answer leaves
  const title = ramp(f, T.END + 12, 24);
  const title2 = ramp(f, T.END + 20, 24);
  const line = ramp(f, T.END + 38, 24);
  const logo = ramp(f, T.END + 50, 24);
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
      {/* Revanista's own logo (cut from the Revanista carousel, recoloured GN navy; Scott: "put the Revanista logo") */}
      <Img
        src={staticFile("brand/revanista-logo-navy.png")}
        style={{
          position: "absolute",
          left: E.cx - E.logo[1] / 2,
          top: E.logo[0],
          width: E.logo[1],
          opacity: logo,
          transform: `translateY(${(1 - logo) * 20}px)`,
        }}
      />
    </AbsoluteFill>
  );
};
