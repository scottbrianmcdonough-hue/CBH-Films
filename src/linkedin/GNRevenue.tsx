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
// Christmas, someone can be getting January ready"). The Contact Centre video's look, so the two read as a pair: a
// GN hotel behind in GN navy (Riverside Park, the client the post names; not the Contact Centre photos: Scott), white type, then clear to GN's white for the answer and the end card.
// A wall calendar: December fills up date by date ("December's full."), its page turns over to an empty January
// ("Then comes January."), and January's dates are set one after another, each with a lime tick, until the month is
// ready. Then "You look after Christmas. / We'll get January ready." and the end card (Scott: "do something more with
// that end card"): the roundel travels from its corner to the middle, GN's wordmark under it, Revenue Management,
// "Powered by" Revanista's own logo (cut from the Revanista carousel, recoloured GN navy), and the first week of
// January ticked one date at a time. No rates or figures on the calendar (no pricing claims), no stats (the page's 62%
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

const enter = (
  f: number,
  start: number,
  away: number,
  y = 36,
): React.CSSProperties => {
  const p = ramp(f, start, RISE);
  const g = ramp(f, away, 16, io);
  return {
    opacity: p * (1 - g),
    transform: `translateY(${(1 - p) * y - g * 24}px)`,
  };
};

/* Timing (frames at 30fps), on the track's beat (120 BPM, 15 frames), counted back from END: the end card lands on the
   track's last hit (scripts/gn-revenue-sfx.py lines the music up to it) */
export const BEAT = 15;
export const END = 384;
const beat = (n: number) => END - n * BEAT;
export const T = {
  L1: beat(24), // "December's full."
  DEC: [beat(23), beat(20)] as [number, number], // December's dates fill
  FLIP: beat(18), // the page turns
  L2: beat(17) + 2, // "Then comes January."
  JAN: [beat(15), beat(10)] as [number, number], // January's dates are set, one after another
  CLEAR: beat(9), // the photo and calendar clear to white
  A1: beat(8), // "You look after Christmas."
  A2: beat(6), // "We'll get January ready."
  A_OUT: beat(1) - 4,
  END, // end card: the roundel comes to the middle, the wordmark, the service, Revanista, a week of January ticked
  WEEK: END + 66, // the week's ticks start
};
export const GN_REVENUE_FRAMES = T.END + 140;

/* Layouts */
type Layout = {
  x: number;
  badge: { top: number; size: number };
  line: { size: number; top: number };
  card: {
    left: number;
    top: number;
    cell: number;
    row: number;
    gap: number;
    pad: number;
    head: number;
    days: number;
    num: number;
  };
  answer: { size: number; tops: [number, number] };
  end: {
    cx: number;
    badge: [number, number];
    mark: [number, number];
    service: [number, number];
    logo: [number, number];
    week: [number, number];
  }; // centre x, then [top, size] each
  pos: string; // framing of the photo
  tint: string;
};

const LAYOUTS: Record<"tall" | "wide", Layout> = {
  tall: {
    x: 80,
    badge: { top: 80, size: 120 },
    line: { size: 96, top: 300 },
    card: {
      left: 80,
      top: 470,
      cell: 112,
      row: 84,
      gap: 8,
      pad: 44,
      head: 52,
      days: 22,
      num: 24,
    },
    answer: { size: 84, tops: [510, 616] },
    end: {
      cx: 540,
      badge: [250, 210],
      mark: [500, 560],
      service: [660, 76],
      logo: [790, 200],
      week: [930, 62],
    },
    pos: "50% 50%",
    tint: "linear-gradient(180deg, rgba(24,43,60,0.78) 0%, rgba(24,43,60,0.66) 50%, rgba(24,43,60,0.78) 100%)",
  },
  wide: {
    x: 120,
    badge: { top: 70, size: 110 },
    line: { size: 84, top: 430 },
    card: {
      left: 1020,
      top: 236,
      cell: 100,
      row: 76,
      gap: 8,
      pad: 40,
      head: 46,
      days: 20,
      num: 22,
    },
    answer: { size: 92, tops: [380, 490] },
    end: {
      cx: 960,
      badge: [170, 170],
      mark: [366, 470],
      service: [492, 68],
      logo: [608, 170],
      week: [760, 54],
    },
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
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    style={{ opacity: p }}
  >
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
      <div
        style={{
          fontFamily: serif,
          fontWeight: 500,
          fontSize: c.head,
          color: navy,
          lineHeight: 1.1,
          marginBottom: 22,
        }}
      >
        {m.name}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(7, ${c.cell}px)`,
          columnGap: c.gap,
          marginBottom: 12,
        }}
      >
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div
            key={i}
            style={{
              fontFamily: sans,
              fontSize: c.days,
              color: grey,
              textAlign: "center",
            }}
          >
            {d}
          </div>
        ))}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(7, ${c.cell}px)`,
          gridAutoRows: c.row,
          gap: c.gap,
        }}
      >
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
              <span
                style={{
                  fontFamily: sans,
                  fontSize: c.num,
                  fontWeight: 600,
                  color: p > 0.5 ? white : grey,
                }}
              >
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
export const GNRevenue: React.FC<{ wide?: boolean; sound?: boolean }> = ({
  wide = false,
  sound = true,
}) => {
  const f = useCurrentFrame();
  const L = LAYOUTS[wide ? "wide" : "tall"];
  const c = L.card;

  const decAt = (day: number) =>
    T.DEC[0] + (SCATTER[day] / 30) * (T.DEC[1] - T.DEC[0]);
  const janAt = (day: number) => T.JAN[0] + (day / 30) * (T.JAN[1] - T.JAN[0]);

  // the December page turns up over its top edge, like a wall calendar
  const flip = ramp(f, T.FLIP, 26, Easing.inOut(Easing.cubic));
  const angle = flip * 160; // over the top edge, gone by ~145 degrees
  const cleared = ramp(f, T.CLEAR, 20, io);
  const cardIn = ramp(f, 4, 20);

  const E = L.end;
  const travel = ramp(f, T.END - 10, 30, io); // the roundel from its corner to the middle of the end card
  const mark = ramp(f, T.END + 14, 24);
  const service = ramp(f, T.END + 28, 24);
  const logo = ramp(f, T.END + 44, 24);
  const badgeSize = interpolate(travel, [0, 1], [L.badge.size, E.badge[1]]);
  const badgeLeft = interpolate(travel, [0, 1], [L.x, E.cx - E.badge[1] / 2]);
  const badgeTop = interpolate(travel, [0, 1], [L.badge.top, E.badge[0]]);

  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(135deg, #ffffff 0%, #ffffff 36%, #eef1f4 100%)",
      }}
    >
      {/* the track and the page turn and ticks (scripts/gn-revenue-sfx.py) */}
      {sound ? (
        <Audio src={staticFile("campaigns/gn-revenue/soundtrack.wav")} />
      ) : null}

      {/* a GN reception behind, tinted navy, clearing to white */}
      {cleared < 1 ? (
        <AbsoluteFill style={{ opacity: 1 - cleared, overflow: "hidden" }}>
          <Img
            src={staticFile(
              "campaigns/gn-key/hotels/riverside-park.jpg",
            )}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: L.pos,
              filter: "blur(4px) saturate(0.9)",
              transform: `scale(${1.04 + 0.06 * (f / T.CLEAR)})`,
            }}
          />
          <AbsoluteFill style={{ background: L.tint }} />
        </AbsoluteFill>
      ) : null}

      {/* GN roundel */}
      <Img
        src={staticFile("brand/gn/gnh-badge.svg")}
        style={{
          position: "absolute",
          left: badgeLeft,
          top: badgeTop,
          width: badgeSize,
          height: badgeSize,
        }}
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

      {/* the calendar: January underneath, December on top turning up over its top edge like a wall calendar page
          (Scott: the first flip was "kind of wonky": a filter on this box flattened the 3D, so the page skewed). No
          filter here: each page carries its own shadow, the perspective sits at the hinge so the page swings evenly,
          its paper back shows as it passes over the top, it dims as it tilts from the light and shades January below */}
      <div
        style={{
          position: "absolute",
          left: c.left,
          top: c.top,
          opacity: cardIn * (1 - cleared),
          transform: `translateY(${(1 - cardIn) * 40 - cleared * 30}px)`,
          perspective: 3800,
          perspectiveOrigin: "50% 0%",
        }}
      >
        <div
          style={{
            position: "relative",
            borderRadius: 26,
            boxShadow: "0 20px 44px rgba(0,0,0,0.35)",
          }}
        >
          <Page month="jan" c={c} f={f} fillAt={janAt} ticks />
          {/* the turning page's shadow across January, strongest as the page stands up off it */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 26,
              pointerEvents: "none",
              background:
                "linear-gradient(180deg, rgba(24,43,60,0.55) 0%, rgba(24,43,60,0.15) 45%, rgba(24,43,60,0) 75%)",
              opacity:
                flip > 0 && flip < 1
                  ? Math.sin(Math.PI * Math.min(1, flip * 1.6)) * 0.7
                  : 0,
            }}
          />
        </div>
        {flip < 1 ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              transformOrigin: "50% 0%",
              transformStyle: "preserve-3d",
              transform: `rotateX(${angle}deg)`,
              opacity: 1 - ramp(angle, 100, 45),
            }}
          >
            {/* front: December, dimming as it tilts away from the light (each face shown only on its own side of
                90 degrees: Chrome showed the front mirrored through the back with backface-visibility alone) */}
            {angle < 90 ? (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 26,
                  boxShadow: "0 20px 44px rgba(0,0,0,0.3)",
                }}
              >
                <Page month="dec" c={c} f={f} fillAt={decAt} ticks={false} />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 26,
                    background: navy,
                    opacity:
                      0.35 *
                      Math.sin((Math.min(angle, 90) / 90) * (Math.PI / 2)),
                  }}
                />
              </div>
            ) : (
              /* back: the plain paper back of the page */
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 26,
                  transform: "rotateX(180deg)",
                  background:
                    "linear-gradient(180deg, #dfe4ea 0%, #f2f4f7 100%)",
                }}
              />
            )}
          </div>
        ) : null}
      </div>

      {/* the answer, navy on white */}
      {[
        {
          text: "You look after Christmas.",
          start: T.A1,
          top: L.answer.tops[0],
        },
        {
          text: "We’ll get January ready.",
          start: T.A2,
          top: L.answer.tops[1],
        },
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

      {/* end card: the wordmark, the service and Revanista under the roundel (which travels in from its corner) */}
      <Img
        src={staticFile("brand/gn/gnh-wordmark.svg")}
        style={{
          position: "absolute",
          left: E.cx - E.mark[1] / 2,
          top: E.mark[0],
          width: E.mark[1],
          opacity: mark,
          transform: `translateY(${(1 - mark) * 24}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          width: wide ? 1920 : 1080,
          top: E.service[0],
          textAlign: "center",
          fontFamily: serif,
          fontWeight: 500,
          fontSize: E.service[1],
          lineHeight: 1.1,
          color: navy,
          opacity: service,
          transform: `translateY(${(1 - service) * 30}px)`,
        }}
      >
        Revenue Management
      </div>
      <div
        style={{
          position: "absolute",
          left: E.cx - E.logo[1] / 2,
          top: E.logo[0],
          width: E.logo[1],
          opacity: logo,
          transform: `translateY(${(1 - logo) * 20}px)`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontSize: wide ? 20 : 22,
            color: grey,
            marginBottom: 14,
          }}
        >
          Powered by
        </div>
        <Img
          src={staticFile("brand/revanista-logo-navy.png")}
          style={{ width: E.logo[1] * 0.62 }}
        />
      </div>
      {/* the first week of January, set one date at a time */}
      <div
        style={{
          position: "absolute",
          left: E.cx - (7 * E.week[1] + 6 * 12) / 2,
          top: E.week[0],
          display: "flex",
          gap: 12,
          opacity: ramp(f, T.WEEK - 10, 12),
        }}
      >
        {Array.from({ length: 7 }, (_, i) => {
          const p = ramp(f, T.WEEK + i * 5, 6);
          return (
            <div
              key={i}
              style={{
                position: "relative",
                width: E.week[1],
                height: E.week[1],
                borderRadius: 12,
                background: p > 0.5 ? navy : pale,
                transform: `scale(${1 - 0.08 * Math.sin(Math.PI * p)})`,
                boxSizing: "border-box",
                padding: "6px 8px",
              }}
            >
              <span
                style={{
                  fontFamily: sans,
                  fontSize: Math.round(E.week[1] * 0.3),
                  fontWeight: 600,
                  color: p > 0.5 ? white : grey,
                }}
              >
                {i + 1}
              </span>
              <div style={{ position: "absolute", right: 2, bottom: 0 }}>
                <Tick
                  size={Math.round(E.week[1] * 0.46)}
                  p={ramp(f, T.WEEK + i * 5 + 3, 8)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
