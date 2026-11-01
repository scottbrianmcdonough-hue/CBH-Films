import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Background, c, Header, MARGIN, ramp, rise, sans } from "./GNStats";

// GN's +30% shown, not stated (Scott: a fresh one, not the 69% again; his pick of three): two
// hotel booking pages side by side, the industry average and GN's hotels. The same stream of
// guests comes into both and works down the steps (dates, room, pay); some drop away at each
// step, more on the left. Every guest who books adds to a Booked bar under the page; ours ends
// 30% longer and the +30% chip lands on it. Then GN's own words from the gn-conversion card
// (no source line on that card: the figure is GN's, "across the hotels we work with").
// Illustrative: no visitor counts or rates on screen, only the two bars' ratio, as on the card.
// 4:5, silent, like the other GN videos.

export const GN_CONVERSION_FRAMES = 400;

const m = { lime: "#D4E157", average: "#C9CFD6" };
const navy = (a: number) => `rgba(25,43,64,${a})`;

const GUESTS = 26;
const EMIT = 22; // the first guest arrives
const EVERY = 8; // frames between guests
const JOURNEY = 64; // frames from the top of the page to the bar
const PANEL_TOP = 236;
const PANEL_H = 740;
const PANEL_W = 440;
const PANELS = [
  {
    x: 80,
    label: "Industry average",
    booked: 10,
    dot: navy(0.45),
    bar: m.average,
  },
  { x: 560, label: "Our hotels", booked: 13, dot: c.navy, bar: c.navy },
];
const STEPS = ["Dates", "Room", "Pay"];
const STEP_Y = [250, 360, 470]; // inside the panel
const TOP_Y = 168;
const BAR_Y = 640;
const UNIT = 29; // bar px a booking
const DONE = EMIT + (GUESTS - 1) * EVERY + JOURNEY + 6;

// seeded, so every render runs the same guests
const rng = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
};

// who books and, for the rest, at which step they leave
const journeys = PANELS.map((p, pi) => {
  const r = rng(77 + pi * 11);
  const order = Array.from({ length: GUESTS }, (_, i) => ({ i, k: r() }))
    .sort((a, b) => a.k - b.k)
    .map((o) => o.i);
  const books = new Set(order.slice(0, p.booked));
  return Array.from({ length: GUESTS }, (_, i) => ({
    emit: EMIT + i * EVERY,
    quit: books.has(i) ? 0 : 1 + Math.floor(r() * 3), // 0: books; 1-3: leaves at that step
    dx: (r() - 0.5) * 90,
  }));
});

const waypoint = (s: number) =>
  interpolate(
    s,
    [0, 0.25, 0.5, 0.75, 1],
    [TOP_Y, STEP_Y[0], STEP_Y[1], STEP_Y[2], BAR_Y],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.sin),
    },
  );

const Panel: React.FC<{ pi: number }> = ({ pi }) => {
  const frame = useCurrentFrame();
  const p = PANELS[pi];
  const intro = ramp(frame, 6 + pi * 6, 22);
  const guests = journeys[pi];
  const booked = guests.filter(
    (g) => g.quit === 0 && frame >= g.emit + JOURNEY,
  ).length;
  const lastBook = Math.max(
    -999,
    ...guests
      .filter((g) => g.quit === 0 && frame >= g.emit + JOURNEY)
      .map((g) => g.emit + JOURNEY),
  );
  const pulse = 1 - ramp(frame, lastBook, 10);
  const chip =
    pi === 1 ? ramp(frame, DONE + 4, 14, Easing.out(Easing.back(2))) : 0;
  return (
    <div
      style={{
        position: "absolute",
        left: p.x,
        top: PANEL_TOP - 52,
        width: PANEL_W,
        opacity: intro,
        transform: `translateY(${(1 - intro) * 30}px)`,
      }}
    >
      <div
        style={{
          fontFamily: sans,
          fontWeight: 600,
          fontSize: 28,
          color: c.navy,
          marginBottom: 16,
        }}
      >
        {p.label}
      </div>
      <div
        style={{
          position: "relative",
          width: PANEL_W,
          height: PANEL_H,
          borderRadius: 32,
          background: "#FFFFFF",
          boxShadow:
            "0 26px 70px rgba(25,43,64,0.14), 0 4px 12px rgba(25,43,64,0.05)",
          overflow: "hidden",
        }}
      >
        {/* the hotel's picture, as a soft block */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: 130,
            background:
              pi === 1
                ? "linear-gradient(135deg, #1F3550 0%, #2E4A68 60%, #6E7F3A 100%)"
                : "linear-gradient(135deg, #D9DEE4 0%, #C9D0D8 100%)",
          }}
        />
        {/* the steps */}
        {STEPS.map((s, k) => {
          // a step lights as a guest passes it
          const near = guests.some((g) => {
            const t = (frame - g.emit) / JOURNEY;
            return (
              Math.abs(t - (k + 1) * 0.25) < 0.04 &&
              (g.quit === 0 || g.quit > k)
            );
          });
          return (
            <div
              key={s}
              style={{
                position: "absolute",
                left: 28,
                right: 28,
                top: STEP_Y[k] - 34,
                height: 68,
                borderRadius: 34,
                background: near ? navy(0.07) : "#F3F4F6",
                border: `2px solid ${near ? navy(0.25) : navy(0.06)}`,
                display: "flex",
                alignItems: "center",
                paddingLeft: 26,
                fontFamily: sans,
                fontSize: 26,
                color: navy(0.7),
              }}
            >
              {s}
            </div>
          );
        })}
        {/* the Booked bar */}
        <div
          style={{
            position: "absolute",
            left: 28,
            top: BAR_Y - 70,
            fontFamily: sans,
            fontWeight: 700,
            fontSize: 24,
            letterSpacing: "0.08em",
            color: c.navy,
          }}
        >
          BOOKED
        </div>
        <div
          style={{
            position: "absolute",
            left: 28,
            top: BAR_Y - 22,
            height: 44,
            width: booked * UNIT,
            background: p.bar,
            borderRadius: 6,
            transform: `scaleY(${1 + 0.12 * pulse})`,
          }}
        />
        {chip > 0 ? (
          <div
            style={{
              position: "absolute",
              left: 28 + 13 * UNIT - 92,
              top: BAR_Y + 34,
              fontFamily: sans,
              fontWeight: 700,
              fontSize: 30,
              color: c.navy,
              background: m.lime,
              padding: "4px 16px",
              borderRadius: 30,
              opacity: chip,
              transform: `scale(${0.6 + 0.4 * chip})`,
            }}
          >
            +30%
          </div>
        ) : null}
        {/* the guests */}
        {guests.map((g, i) => {
          const t = (frame - g.emit) / JOURNEY;
          if (t < 0 || t > 1.02) return null;
          const stop = g.quit === 0 ? 1 : g.quit * 0.25;
          const s = Math.min(t, stop);
          const y = waypoint(s);
          // a guest who leaves drifts off to the side and fades
          const gone = g.quit === 0 ? 0 : Math.max(0, (t - stop) / 0.16);
          if (gone >= 1) return null;
          const x =
            PANEL_W / 2 +
            g.dx * (1 - s * 0.7) +
            (g.dx >= 0 ? 1 : -1) * 120 * gone;
          const merge = g.quit === 0 ? ramp(frame, g.emit + JOURNEY - 6, 6) : 0;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x - 14,
                top: y - 14,
                width: 28,
                height: 28,
                borderRadius: 14,
                background: p.dot,
                border: "3px solid #FFFFFF",
                boxShadow: "0 3px 8px rgba(25,43,64,0.2)",
                opacity: Math.min(1, t * 8) * (1 - gone) * (1 - merge),
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export const GNConversionDemo: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Background />
      <Header />
      <Panel pi={0} />
      <Panel pi={1} />
      <div
        style={{
          position: "absolute",
          left: MARGIN,
          top: 1040,
          fontFamily: sans,
          fontWeight: 500,
          fontSize: 46,
          lineHeight: 1.3,
          color: c.navy,
        }}
      >
        <div style={rise(frame, DONE + 18, 20)}>Higher guest conversion</div>
        <div style={rise(frame, DONE + 25, 20)}>than the industry average</div>
      </div>
      <div
        style={{
          position: "absolute",
          left: MARGIN,
          top: 1220,
          fontFamily: sans,
          fontSize: 26,
          color: c.navy,
          opacity: 0.75 * ramp(frame, DONE + 44, 18),
        }}
      >
        Across the hotels we work with
      </div>
    </AbsoluteFill>
  );
};
