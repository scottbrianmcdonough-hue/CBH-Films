import React from "react";
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
// Christmas, someone can be getting January ready"). The Contact Centre video's look, so the two read as a pair: a
// GN reception behind in GN navy, white type, then clear to GN's white for the answer and the end card.
// A wall calendar: December fills up date by date ("December's full."), its page turns over to an empty January
// ("Then comes January."), and January's dates are set one after another, each with a lime tick, until the month is
// ready. Then "You look after Christmas. / We'll get January ready." and the end card: Great National Revenue
// Management, powered by Revanista. No rates or figures on the calendar (no pricing claims), no stats (the page's 62%
// vs 2023 is held back: Scott, "old"). No hyphens, em dashes or triads in the text. 4:5 and 16:9 (`wide`).

/* Colours */
const navy = "#182b3c";
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

/* Timing (frames at 30fps) */
const T = {
  L1: 12, // "December's full."
  DEC: [24, 78] as [number, number], // December's dates fill
  FLIP: 108, // the page turns
  L2: 118, // "Then comes January."
  JAN: [148, 232] as [number, number], // January's dates are set, one after another
  CLEAR: 252, // the photo and calendar clear to white
  A1: 270, // "You look after Christmas."
  A2: 300, // "We'll get January ready."
  A_OUT: 372,
  END: 384, // end card
};
export const GN_REVENUE_FRAMES = T.END + 50 + 85;

/* Layouts */
type Layout = {
  x: number;
  badge: { top: number; size: number };
  line: { size: number; top: number };
  card: { left: number; top: number; cell: number; row: number; gap: number; pad: number; head: number; days: number; num: number };
  answer: { size: number; tops: [number, number] };
  end: { top: number; size: number; sub: number };
  pos: string; // framing of the photo
  tint: string;
};

const LAYOUTS: Record<"tall" | "wide", Layout> = {
  tall: {
    x: 80,
    badge: { top: 80, size: 120 },
    line: { size: 96, top: 300 },
    card: { left: 80, top: 470, cell: 112, row: 84, gap: 8, pad: 44, head: 52, days: 22, num: 24 },
    answer: { size: 84, tops: [510, 616] },
    end: { top: 470, size: 88, sub: 30 },
    pos: "50% 50%",
    tint: "linear-gradient(180deg, rgba(24,43,60,0.78) 0%, rgba(24,43,60,0.66) 50%, rgba(24,43,60,0.78) 100%)",
  },
  wide: {
    x: 120,
    badge: { top: 70, size: 110 },
    line: { size: 84, top: 430 },
    card: { left: 1020, top: 236, cell: 100, row: 76, gap: 8, pad: 40, head: 46, days: 20, num: 22 },
    answer: { size: 92, tops: [380, 490] },
    end: { top: 360, size: 88, sub: 30 },
    pos: "50% 50%",
    tint: "linear-gradient(90deg, rgba(24,43,60,0.86) 0%, rgba(24,43,60,0.74) 50%, rgba(24,43,60,0.62) 100%)",
  },
};

/* The months: Mon first. December 2026 starts on a Tuesday, January 2027 on a Friday; both have 31 days */
const MONTHS = {
  dec: { name: "December 2026", offset: 1, days: 31 },
  jan: { name: "January 2027", offset: 4, days: 31 },
};

// December fills in a scattered order (busy), January in date order (set one after another)
const SCATTER = (() => {
  const order = Array.from({ length: 31 }, (_, i) => i);
  let seed = 7;
  for (let i = order.length - 1; i > 0; i--) {
    seed = (seed * 9301 + 49297) % 233280;
    const j = Math.floor((seed / 233280) * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const at: number[] = [];
  order.forEach((day, k) => (at[day] = k));
  return at;
})();

const Tick: React.FC<{ size: number; p: number }> = ({ size, p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ opacity: p }}>
    <path
      d="M5 12.5l4.5 4.5L19 7.5"
      stroke={lime}
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={24}
      strokeDashoffset={24 * (1 - p)}
    />
  </svg>
);

/* One month page: a header, the weekday initials and the dates, each date filling at its own frame */
const Page: React.FC<{
  month: keyof typeof MONTHS;
  c: Layout["card"];
  fillAt: (day: number) => number;
  f: number;
  ticks: boolean;
}> = ({ month, c, fillAt, f, ticks }) => {
  const m = MONTHS[month];
  const width = c.pad * 2 + 7 * c.cell + 6 * c.gap;
  return (
    <div
      style={{
        width,
        boxSizing: "border-box",
        padding: c.pad,
        background: white,
        borderRadius: 26,
      }}
    >
      <div style={{ fontFamily: serif, fontWeight: 500, fontSize: c.head, color: navy, lineHeight: 1.1, marginBottom: 22 }}>
        {m.name}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(7, ${c.cell}px)`, columnGap: c.gap, marginBottom: 12 }}>
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div key={i} style={{ fontFamily: sans, fontSize: c.days, color: grey, textAlign: "center" }}>
            {d}
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(7, ${c.cell}px)`, gridAutoRows: c.row, gap: c.gap }}>
        {Array.from({ length: m.offset }, (_, i) => (
          <div key={`e${i}`} />
        ))}
        {Array.from({ length: m.days }, (_, day) => {
          const p = ramp(f, fillAt(day), 8);
          const tick = ticks ? ramp(f, fillAt(day) + 4, 10) : 0;
          return (
            <div
              key={day}
              style={{
                position: "relative",
                borderRadius: 12,
                background: interpolate(p, [0, 1], [0, 1]) > 0.5 ? navy : pale,
                transform: `scale(${1 - 0.08 * Math.sin(Math.PI * p)})`,
                boxSizing: "border-box",
                padding: "8px 10px",
              }}
            >
              <span style={{ fontFamily: sans, fontSize: c.num, fontWeight: 600, color: p > 0.5 ? white : grey }}>
                {day + 1}
              </span>
              {ticks ? (
                <div style={{ position: "absolute", right: 6, bottom: 4 }}>
                  <Tick size={Math.round(c.row * 0.42)} p={tick} />
                </div>
              ) : p > 0.5 ? (
                <div
                  style={{
                    position: "absolute",
                    right: 12,
                    bottom: 12,
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    background: lime,
                  }}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* The film */
export const GNRevenue: React.FC<{ wide?: boolean }> = ({ wide = false }) => {
  const f = useCurrentFrame();
  const L = LAYOUTS[wide ? "wide" : "tall"];
  const c = L.card;

  const decAt = (day: number) => T.DEC[0] + (SCATTER[day] / 30) * (T.DEC[1] - T.DEC[0]);
  const janAt = (day: number) => T.JAN[0] + (day / 30) * (T.JAN[1] - T.JAN[0]);

  // the December page turns up over its top edge, like a wall calendar
  const flip = ramp(f, T.FLIP, 22, Easing.inOut(Easing.quad));
  const cleared = ramp(f, T.CLEAR, 20, io);
  const cardIn = ramp(f, 4, 20);

  const title = ramp(f, T.END, 26);
  const title2 = ramp(f, T.END + 8, 26);
  const sub = ramp(f, T.END + 24, 26);

  return (
    <AbsoluteFill style={{ background: "linear-gradient(135deg, #ffffff 0%, #ffffff 36%, #eef1f4 100%)" }}>
      {/* a GN reception behind, tinted navy, clearing to white */}
      {cleared < 1 ? (
        <AbsoluteFill style={{ opacity: 1 - cleared, overflow: "hidden" }}>
          <Img
            src={staticFile("campaigns/gn-contact/hotels/speech-house-reception.jpg")}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: L.pos,
              filter: "blur(2px) saturate(0.9)",
              transform: `scale(${1.04 + 0.06 * (f / T.CLEAR)})`,
            }}
          />
          <AbsoluteFill style={{ background: L.tint }} />
        </AbsoluteFill>
      ) : null}

      {/* GN roundel */}
      <Img
        src={staticFile("brand/gn/gnh-badge.svg")}
        style={{ position: "absolute", left: L.x, top: L.badge.top, width: L.badge.size, height: L.badge.size }}
      />

      {/* the lines over the photo */}
      {[
        { text: "December’s full.", start: T.L1, away: T.FLIP - 4 },
        { text: "Then comes January.", start: T.L2, away: T.CLEAR },
      ].map((l) => (
        <div
          key={l.text}
          style={{
            position: "absolute",
            left: L.x,
            top: L.line.top,
            fontFamily: serif,
            fontWeight: 500,
            fontSize: L.line.size,
            lineHeight: 1.1,
            color: white,
            whiteSpace: wide ? "normal" : "nowrap",
            width: wide ? 820 : undefined,
            ...enter(f, l.start, l.away),
          }}
        >
          {l.text}
        </div>
      ))}

      {/* the calendar: January underneath, December on top turning away */}
      <div
        style={{
          position: "absolute",
          left: c.left,
          top: c.top,
          opacity: cardIn * (1 - cleared),
          transform: `translateY(${(1 - cardIn) * 40 - cleared * 30}px)`,
          perspective: 1800,
          filter: "drop-shadow(0 20px 44px rgba(0,0,0,0.35))",
        }}
      >
        <Page month="jan" c={c} f={f} fillAt={janAt} ticks />
        {flip < 1 ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              transformOrigin: "50% 0%",
              transform: `rotateX(${flip * 105}deg)`,
              opacity: 1 - ramp(f, T.FLIP + 12, 10),
              backfaceVisibility: "hidden",
            }}
          >
            <Page month="dec" c={c} f={f} fillAt={decAt} ticks={false} />
          </div>
        ) : null}
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

      {/* end card */}
      <div style={{ position: "absolute", left: L.x, right: L.x, top: L.end.top, color: navy }}>
        <div style={{ fontFamily: serif, fontWeight: 500, fontSize: L.end.size, lineHeight: 1.08, opacity: title, transform: `translateY(${(1 - title) * 36}px)` }}>
          Great National
        </div>
        <div style={{ fontFamily: serif, fontWeight: 500, fontSize: L.end.size, lineHeight: 1.08, opacity: title2, transform: `translateY(${(1 - title2) * 36}px)` }}>
          Revenue Management
        </div>
        <div style={{ fontFamily: sans, fontSize: L.end.sub, lineHeight: 1.6, marginTop: 48, opacity: sub, transform: `translateY(${(1 - sub) * 20}px)` }}>
          Powered by Revanista, our own revenue management system
        </div>
      </div>
    </AbsoluteFill>
  );
};
