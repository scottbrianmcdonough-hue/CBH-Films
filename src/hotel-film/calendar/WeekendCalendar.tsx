import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { FilmFinish } from "../components/FilmFinish";
import { colors, EASE_IN_OUT, EASE_OUT, progress, sans, serif } from "../theme";

// "Weekend: booked" (Scott: a "virtual UI type one again", after the clean animated UI videos
// he sent; picked from four: the weekend calendar): a weekend calendar floats in the dark,
// empty under "Free this weekend?". A thumb picks each plan from the tray below and drags it
// into its slot (Friday check-in, a Saturday massage, afternoon tea and dinner, Sunday
// breakfast in bed); each one, once it lands, opens into a window on the photo, then folds
// back into the calendar. Full, the line turns to "Weekend: booked" and the hotel's label
// comes up where the tray was. One hotel, Holdsworth House (not Fairlawns again, Scott). In
// the CBH black and gold, the UI's lines and blocks in the house cream and gold. The photos
// are landscape, so they open into a 16:9 window over the calendar (sharp, uncropped) on the
// barely-there push. Silent mock-up: the timing is even, to be cut to a track.

const W = 1080;
export const WEEKEND_FRAMES = 650;

type Plan = {
  day: 0 | 1 | 2; // Fri, Sat, Sun
  start: number; // hour, 24h
  dur: number; // hours
  title: string;
  time: string;
  src: string;
};

const HH = "hotels/holdsworth-house";
const PLANS: Plan[] = [
  {
    day: 0,
    start: 15,
    dur: 1.5,
    title: "Check in",
    time: "3pm",
    src: `${HH}/main-hall.jpg`,
  },
  {
    day: 1,
    start: 11,
    dur: 1.5,
    title: "Massage",
    time: "11am",
    src: `${HH}/spa.jpg`,
  },
  {
    day: 1,
    start: 15,
    dur: 1.5,
    title: "Afternoon tea",
    time: "3pm",
    src: `${HH}/afternoon-tea.jpg`,
  },
  {
    day: 1,
    start: 19.5,
    dur: 2,
    title: "Dinner",
    time: "7:30pm",
    src: `${HH}/dinner.jpg`,
  },
  {
    day: 2,
    start: 9,
    dur: 1.5,
    title: "Breakfast in bed",
    time: "9am",
    src: `${HH}/breakfast-in-bed.jpg`,
  },
];

// the calendar card
const CARD = { x: 90, y: 520, w: 900, h: 740 };
const GRID_TOP = CARD.y + 150;
const GRID_BOTTOM = CARD.y + CARD.h - 34;
const HOUR0 = 8;
const HOUR1 = 22;
const PH = (GRID_BOTTOM - GRID_TOP) / (HOUR1 - HOUR0); // px an hour
const GUTTER = 110;
const COL_X = CARD.x + GUTTER;
const COL_W = (CARD.w - GUTTER - 24) / 3;
const DAYS = ["Fri", "Sat", "Sun"];

type Rect = { x: number; y: number; w: number; h: number };
const blockRect = (p: Plan): Rect => ({
  x: COL_X + p.day * COL_W + 5,
  y: GRID_TOP + (p.start - HOUR0) * PH + 2,
  w: COL_W - 10,
  h: p.dur * PH - 4,
});

// the tray: the plans as chips, two rows, clear of the CB in the corner
const CHIP_H = 58;
const chipW = (p: Plan) => 44 + (p.title.length + p.time.length + 3) * 12.4;
const CHIPS: Rect[] = (() => {
  const rows = [PLANS.slice(0, 3), PLANS.slice(3)];
  const out: Rect[] = [];
  rows.forEach((row, r) => {
    const total = row.reduce((s, p) => s + chipW(p), 0) + 16 * (row.length - 1);
    let x = (W - total) / 2;
    row.forEach((p) => {
      out.push({ x, y: 1306 + r * (CHIP_H + 16), w: chipW(p), h: CHIP_H });
      x += chipW(p) + 16;
    });
  });
  return out;
})();

// the window a plan opens into: 16:9, over the calendar
const WIN: Rect = { x: 30, y: 640, w: 1020, h: (1020 * 9) / 16 };

// the timeline: one plan every 100 frames
const START = 36;
const PERIOD = 100;
const T = PLANS.map((_, i) => {
  const t0 = START + i * PERIOD;
  return {
    reach: t0, // the thumb travels to the chip
    press: t0 + 12,
    drag: t0 + 16, // 22 frames to the slot
    land: t0 + 38,
    open: t0 + 46, // 14 frames into the window
    close: t0 + 100, // 12 frames back
  };
});
const DONE = T[T.length - 1].close + 14;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpRect = (a: Rect, b: Rect, t: number): Rect => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  w: lerp(a.w, b.w, t),
  h: lerp(a.h, b.h, t),
});

const GOLD = (a: number) => `rgba(195,158,85,${a})`;
const CREAM = (a: number) => `rgba(245,239,227,${a})`;

const PlanBlock: React.FC<{ i: number }> = ({ i }) => {
  const frame = useCurrentFrame();
  const p = PLANS[i];
  const t = T[i];
  const chip = CHIPS[i];
  const block = blockRect(p);
  const drag = progress(frame, t.drag, t.land - t.drag, EASE_IN_OUT);
  const lift = progress(frame, t.press, 4) * (1 - progress(frame, t.land, 6));
  const open =
    progress(frame, t.open, 14, EASE_IN_OUT) *
    (1 - progress(frame, t.close, 12, EASE_IN_OUT));
  let r = lerpRect(chip, block, drag);
  // the drag arcs up a little, like a thumb's path
  r = { ...r, y: r.y - Math.sin(Math.PI * drag) * 90 };
  r = lerpRect(r, WIN, open);
  const radius = lerp(lerp(CHIP_H / 2, 12, drag), 22, open);
  const settle =
    frame >= t.land
      ? 1 + 0.05 * Math.sin(Math.min(1, (frame - t.land) / 8) * Math.PI)
      : 1;
  const scale = (1 + 0.05 * lift) * settle;
  const inGrid = drag > 0.5;
  // the photo, on the barely-there push while it is open
  const push = interpolate(frame, [t.open, t.close + 12], [1.0, 1.05], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const photo =
    progress(frame, t.open, 8) * (1 - progress(frame, t.close + 4, 8));
  return (
    <div
      style={{
        position: "absolute",
        left: r.x,
        top: r.y,
        width: r.w,
        height: r.h,
        borderRadius: radius,
        overflow: "hidden",
        transform: `scale(${scale})`,
        background: inGrid ? GOLD(0.2) : "rgba(30,28,25,0.96)",
        border: `1.5px solid ${GOLD(inGrid ? 0.55 : 0.4)}`,
        boxShadow: `0 ${10 + 20 * lift}px ${30 + 30 * lift}px rgba(0,0,0,${0.35 + 0.25 * lift + 0.3 * open})`,
      }}
    >
      {/* the chip's one line, then the block's two, with its gold edge */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 1 - progress(frame, t.drag + 6, 8),
          fontFamily: sans,
          fontSize: 22,
          fontWeight: 600,
          color: colors.cream,
          whiteSpace: "nowrap",
        }}
      >
        {p.title}
        <span style={{ color: CREAM(0.55), fontWeight: 400 }}>
          &nbsp;·&nbsp;{p.time}
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "8px 12px 0 16px",
          opacity: progress(frame, t.drag + 10, 8) * (1 - open),
          borderLeft: `4px solid ${colors.gold}`,
          fontFamily: sans,
          whiteSpace: "nowrap",
        }}
      >
        <div
          style={{
            fontSize: 21,
            fontWeight: 600,
            color: colors.cream,
            lineHeight: 1.2,
          }}
        >
          {p.title}
        </div>
        <div style={{ fontSize: 17, color: CREAM(0.6), lineHeight: 1.3 }}>
          {p.time}
        </div>
      </div>
      {photo > 0 ? (
        <Img
          src={staticFile(p.src)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: photo,
            transform: `scale(${push})`,
          }}
        />
      ) : null}
    </div>
  );
};

// the thumb: a soft ring, as in a screen recording
const thumbAt = (frame: number) => {
  let pos = { x: 760, y: 1700 };
  for (let i = 0; i < PLANS.length; i++) {
    const t = T[i];
    const chip = CHIPS[i];
    const block = blockRect(PLANS[i]);
    const grab = { x: chip.x + chip.w * 0.35, y: chip.y + chip.h / 2 };
    if (frame < t.reach) break;
    const reach = progress(frame, t.reach, t.press - t.reach, EASE_IN_OUT);
    pos = { x: lerp(pos.x, grab.x, reach), y: lerp(pos.y, grab.y, reach) };
    const drag = progress(frame, t.drag, t.land - t.drag, EASE_IN_OUT);
    if (drag > 0) {
      const to = { x: block.x + block.w * 0.35, y: block.y + block.h / 2 };
      pos = {
        x: lerp(grab.x, to.x, drag),
        y: lerp(grab.y, to.y, drag) - Math.sin(Math.PI * drag) * 90,
      };
    }
    // lifts off after the drop, resting low and to the side
    const away = progress(frame, t.land + 4, 20, EASE_IN_OUT);
    if (away > 0)
      pos = { x: lerp(pos.x, 820, away), y: lerp(pos.y, 1640, away) };
  }
  return pos;
};

export const WeekendCalendar: React.FC = () => {
  const frame = useCurrentFrame();
  const intro = progress(frame, 0, 24);
  const dim = Math.max(
    ...T.map(
      (t) =>
        progress(frame, t.open, 14, EASE_IN_OUT) *
        (1 - progress(frame, t.close, 12, EASE_IN_OUT)),
    ),
  );
  const booked = progress(frame, DONE, 14);
  const label = progress(frame, DONE + 14, 20, EASE_OUT);
  const thumb = thumbAt(frame);
  const pressed = T.some((t) => frame >= t.press && frame < t.land + 2);
  const thumbOn =
    progress(frame, START - 6, 8) *
    (1 - progress(frame, T[T.length - 1].land + 10, 12));
  // which plan is on top: the one moving or open
  const order = PLANS.map((_, i) => i).sort((a, b) => {
    const live = (i: number) =>
      frame >= T[i].press && frame < T[i].close + 12 ? 1 : 0;
    return live(a) - live(b);
  });

  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      {/* a warm glow behind the card */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 900px 900px at 540px 900px, ${GOLD(0.13)} 0%, ${GOLD(0.04)} 45%, rgba(0,0,0,0) 75%)`,
        }}
      />
      {/* the line over the calendar */}
      <div
        style={{
          position: "absolute",
          top: 300,
          width: "100%",
          textAlign: "center",
          fontFamily: serif,
          fontSize: 88,
          color: colors.cream,
          opacity: intro,
          transform: `translateY(${(1 - intro) * 20}px)`,
        }}
      >
        <span
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            opacity: 1 - booked,
          }}
        >
          Free this weekend?
        </span>
        <span
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            opacity: booked,
            transform: `translateY(${(1 - booked) * 16}px)`,
          }}
        >
          Weekend: booked
        </span>
      </div>
      {/* the calendar card */}
      <div
        style={{
          position: "absolute",
          left: CARD.x,
          top: CARD.y,
          width: CARD.w,
          height: CARD.h,
          borderRadius: 40,
          background: "linear-gradient(180deg, #19181A 0%, #121113 100%)",
          border: `1.5px solid ${GOLD(0.28)}`,
          boxShadow: "0 40px 90px rgba(0,0,0,0.55)",
          opacity: intro,
          transform: `translateY(${(1 - intro) * 40}px)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 40,
            top: 38,
            fontFamily: sans,
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: "0.26em",
            color: colors.gold,
          }}
        >
          THIS WEEKEND
        </div>
        {DAYS.map((d, i) => (
          <div
            key={d}
            style={{
              position: "absolute",
              left: GUTTER + i * COL_W,
              width: COL_W,
              top: 92,
              textAlign: "center",
              fontFamily: sans,
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: "0.12em",
              color: CREAM(0.8),
            }}
          >
            {d.toUpperCase()}
          </div>
        ))}
        {Array.from({ length: HOUR1 - HOUR0 + 1 }, (_, k) => {
          const h = HOUR0 + k;
          const y = GRID_TOP - CARD.y + k * PH;
          return (
            <React.Fragment key={h}>
              <div
                style={{
                  position: "absolute",
                  left: GUTTER - 6,
                  right: 24,
                  top: y,
                  height: 1,
                  background: CREAM(k % 3 === 1 ? 0.12 : 0.06),
                }}
              />
              {k % 3 === 1 ? (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    width: GUTTER - 18,
                    top: y - 11,
                    textAlign: "right",
                    fontFamily: sans,
                    fontSize: 17,
                    color: CREAM(0.4),
                  }}
                >
                  {h === 12 ? "12pm" : h > 12 ? `${h - 12}pm` : `${h}am`}
                </div>
              ) : null}
            </React.Fragment>
          );
        })}
        {[1, 2].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: GUTTER + i * COL_W,
              top: GRID_TOP - CARD.y - 6,
              bottom: 30,
              width: 1,
              background: CREAM(0.06),
            }}
          />
        ))}
      </div>
      {/* the plans: the dim falls behind the one that is open */}
      {order.map((i) => {
        const live = frame >= T[i].open && frame < T[i].close + 12;
        return (
          <React.Fragment key={i}>
            {live ? (
              <AbsoluteFill
                style={{ background: `rgba(9,9,10,${0.6 * dim})` }}
              />
            ) : null}
            <div style={{ opacity: intro }}>
              <PlanBlock i={i} />
            </div>
          </React.Fragment>
        );
      })}
      {/* the thumb */}
      <div
        style={{
          position: "absolute",
          left: thumb.x - 34,
          top: thumb.y - 34,
          width: 68,
          height: 68,
          borderRadius: 34,
          border: `2px solid ${CREAM(0.7)}`,
          background: CREAM(pressed ? 0.28 : 0.14),
          transform: `scale(${pressed ? 0.86 : 1})`,
          opacity: thumbOn,
          boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
        }}
      />
      {/* the hotel, where the tray was: the place in gold caps over the name */}
      <div
        style={{
          position: "absolute",
          top: 1318,
          width: "100%",
          textAlign: "center",
          opacity: label,
          transform: `translateY(${(1 - label) * 20}px)`,
        }}
      >
        <div style={{ display: "inline-block" }}>
          <div
            style={{
              fontFamily: sans,
              fontWeight: 600,
              fontSize: 26,
              letterSpacing: "0.28em",
              color: colors.gold,
            }}
          >
            HALIFAX, WEST YORKSHIRE
          </div>
          <div style={{ height: 2, background: colors.gold, marginTop: 8 }} />
        </div>
        <div
          style={{
            fontFamily: serif,
            fontSize: 64,
            color: colors.cream,
            marginTop: 10,
          }}
        >
          Holdsworth House Hotel
        </div>
      </div>
      <Img
        src={staticFile("brand/cb-watermark.png")}
        style={{
          position: "absolute",
          left: 920,
          top: 1452,
          width: 100,
          height: 108,
        }}
      />
      <FilmFinish />
    </AbsoluteFill>
  );
};
