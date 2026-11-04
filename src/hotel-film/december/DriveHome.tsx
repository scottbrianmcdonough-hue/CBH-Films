import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FilmFinish } from "../components/FilmFinish";
import { colors, EASE_OUT, progress, sans, serif } from "../theme";
import { B, caps, clamp, Cuts, EndCard, FEST, G, KF, Mark, Music } from "./common";

// "Driving home for Christmas" (draft): a sat nav in night mode, in the CBH black and gold, the road running
// towards you with the route in gold, the miles to go dropping fast. Its directions turn festive as it gets
// closer, a hotel cutting in on each: "Leave the work emails behind", "Follow the fairy lights" (Hogarths' lit
// entrance), "Recalculating" through the band's stop, "Turn left at the very big tree" (Ramside's tree) on the
// return, then "You have arrived" over Hintlesham Hall lit up. The banner and the arrival card stay on top of
// the shots throughout, like a phone on the dashboard.
export const DRIVE_FRAMES = B(31);

type Step = { at: number; text: string; sub: string; arrow: "up" | "left" | "right" | "spin" | "pin"; shot?: { src: string; pos?: string } };
const STEPS: Step[] = [
  { at: 0, text: "Continue on the M1", sub: "for 180 miles", arrow: "up" },
  { at: 3, text: "Leave the work emails behind", sub: "at the next exit", arrow: "left" },
  { at: 6, text: "Take the scenic route", sub: "through the snow", arrow: "right", shot: { src: G + "nailcote-hall-snow.jpg", pos: "40% 50%" } },
  { at: 8, text: "Follow the fairy lights", sub: "for 2 miles", arrow: "up", shot: { src: G + "hogarths-entrance.jpg", pos: "50% 45%" } },
  { at: 10, text: "Recalculating…", sub: "", arrow: "spin" },
  { at: 12, text: "Turn left at the very big tree", sub: "in 400 yards", arrow: "left", shot: { src: FEST + "ramside-tree.mp4" } },
  { at: 14, text: "Keep right for the fire", sub: "in 200 yards", arrow: "right", shot: { src: KF + "fire.mp4" } },
  { at: 16, text: "Your destination is ahead", sub: "on the right", arrow: "up", shot: { src: G + "oakley-hall-exterior.jpg", pos: "50% 55%" } },
  { at: 18, text: "You have arrived", sub: "", arrow: "pin", shot: { src: G + "hintlesham-hall-exterior.jpg", pos: "45% 50%" } },
];
const END = 23;

// the miles to go: 214 at the start, dropping fast, slower near the end, nothing on arrival
const MILES: [number, number][] = [
  [0, 214],
  [3, 180],
  [6, 96],
  [8, 31],
  [10, 12],
  [12, 12],
  [14, 3],
  [16, 0.4],
  [18, 0],
];
const milesAt = (f: number) =>
  interpolate(f, MILES.map(([b]) => B(b)), MILES.map(([, m]) => m), clamp);

const Arrow: React.FC<{ kind: Step["arrow"]; frame: number }> = ({ kind, frame }) => {
  const g = colors.gold;
  if (kind === "spin")
    return (
      <svg width="110" height="110" viewBox="0 0 110 110" style={{ transform: `rotate(${frame * 9}deg)` }}>
        <circle cx="55" cy="55" r="38" fill="none" stroke={g} strokeWidth="9" strokeDasharray="170 70" strokeLinecap="round" />
      </svg>
    );
  if (kind === "pin")
    return (
      <svg width="110" height="110" viewBox="0 0 110 110">
        <path d="M55 100 C55 100 22 62 22 42 A33 33 0 0 1 88 42 C88 62 55 100 55 100 Z" fill={g} />
        <circle cx="55" cy="42" r="13" fill={colors.black} />
      </svg>
    );
  return (
    <svg width="110" height="110" viewBox="0 0 110 110">
      {kind === "up" ? (
        <path d="M55 12 L88 52 H66 V98 H44 V52 H22 Z" fill={g} />
      ) : (
        <path
          d={kind === "left" ? "M66 98 V52 Q66 40 54 40 H38 V58 L10 34 L38 10 V28 H54 Q86 28 86 52 V98 Z" : "M44 98 V52 Q44 40 56 40 H72 V58 L100 34 L72 10 V28 H56 Q24 28 24 52 V98 Z"}
          fill={g}
        />
      )}
    </svg>
  );
};

// the road in night mode: a plane running away from you, the route a gold band, lane marks moving with the speed
const Road: React.FC<{ frame: number; speed: number; bend: number }> = ({ frame, speed, bend }) => (
  <AbsoluteFill style={{ background: "linear-gradient(to bottom, #0B0B0D 0%, #141418 38%, #101012 100%)" }}>
    {/* a faint glow on the horizon, the town lights ahead */}
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 18% at 50% 36%, rgba(195,158,85,0.22), rgba(195,158,85,0) 70%)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 690, bottom: 0, perspective: 700, perspectiveOrigin: "50% 0%", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: -660,
          width: 2400,
          top: 0,
          height: 3600,
          transformOrigin: "50% 0%",
          transform: `rotateX(72deg) translateX(${bend}px)`,
          background: "#16161A",
        }}
      >
        {/* the road */}
        <div style={{ position: "absolute", left: 800, width: 800, top: 0, bottom: 0, background: "#232328" }} />
        {/* the route */}
        <div style={{ position: "absolute", left: 1155, width: 90, top: 0, bottom: 0, background: "linear-gradient(to right, rgba(195,158,85,0.4), #C39E55 35%, #DAC396 50%, #C39E55 65%, rgba(195,158,85,0.4))", boxShadow: "0 0 30px rgba(195,158,85,0.35)" }} />
        {/* the road's edges */}
        {[800, 1584].map((x) => (
          <div key={x} style={{ position: "absolute", left: x, width: 16, top: 0, bottom: 0, background: "rgba(245,239,227,0.28)" }} />
        ))}
        {/* lane marks */}
        {[1000, 1384].map((x) => (
          <div
            key={x}
            style={{
              position: "absolute",
              left: x,
              width: 16,
              top: 0,
              bottom: 0,
              backgroundImage: "repeating-linear-gradient(to bottom, rgba(245,239,227,0.5) 0 120px, transparent 120px 300px)",
              backgroundPositionY: `${(frame * speed) % 300}px`,
            }}
          />
        ))}
      </div>
    </div>
  </AbsoluteFill>
);

export const DriveHome: React.FC = () => {
  const frame = useCurrentFrame();
  const step = [...STEPS].reverse().find((s) => frame >= B(s.at))!;
  const intro = progress(frame, 0, 14, EASE_OUT);
  const swap = progress(frame, B(step.at), 8, EASE_OUT);
  const miles = milesAt(frame);
  const stopped = frame >= B(10) && frame < B(12);
  const speed = stopped ? 0 : interpolate(frame, [0, B(8), B(16), B(18)], [70, 55, 30, 0], clamp);
  const bend = interpolate(frame, [B(3), B(4.5), B(6)], [0, -260, 0], clamp);
  const arrived = frame >= B(18);
  const shots = STEPS.filter((s) => s.shot).map((s) => ({ ...s.shot!, at: s.at }));
  // the road shows wherever no shot is on (from the start, and through "Recalculating")
  const roadOn = frame < B(6) || stopped;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      {roadOn ? <Road frame={frame} speed={speed} bend={bend} /> : null}
      {!roadOn ? (
        <Cuts list={shots} until={END} />
      ) : null}
      {!roadOn ? <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(9,9,10,0.55) 0%, rgba(9,9,10,0) 28%, rgba(9,9,10,0) 60%, rgba(9,9,10,0.6) 80%)" }} /> : null}

      {/* the direction banner */}
      <div
        style={{
          position: "absolute",
          left: 50,
          right: 50,
          top: 150,
          borderRadius: 30,
          background: "rgba(18,18,20,0.92)",
          border: "1px solid rgba(195,158,85,0.4)",
          padding: "34px 40px",
          display: "flex",
          alignItems: "center",
          gap: 34,
          opacity: intro,
        }}
      >
        <div style={{ flex: "0 0 110px", opacity: swap }}>
          <Arrow kind={step.arrow} frame={frame} />
        </div>
        <div style={{ opacity: swap, transform: `translateY(${(1 - swap) * 10}px)` }}>
          <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 46, lineHeight: 1.15, color: colors.cream }}>{step.text}</div>
          {step.sub ? <div style={{ fontFamily: sans, fontSize: 30, color: "rgba(245,239,227,0.6)", marginTop: 8 }}>{step.sub}</div> : null}
        </div>
      </div>

      {/* the trip card: miles to go and the arrival time, then "Arrived" in gold */}
      <div
        style={{
          position: "absolute",
          left: 50,
          right: 50,
          bottom: 500,
          borderRadius: 30,
          background: "rgba(18,18,20,0.9)",
          border: `1px solid rgba(195,158,85,${arrived ? 0.9 : 0.4})`,
          padding: "30px 44px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          opacity: intro,
        }}
      >
        <div>
          <div style={caps(20, colors.gold, 0.22)}>{arrived ? "Arrived" : "Arriving"}</div>
          <div style={{ fontFamily: serif, fontSize: 64, color: colors.cream, lineHeight: 1.1, marginTop: 6 }}>
            Wed 23 Dec, <span style={{ fontStyle: "italic" }}>4:12pm</span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={caps(20, "rgba(245,239,227,0.6)", 0.22)}>To go</div>
          <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 56, color: arrived ? colors.gold : colors.cream, marginTop: 6, fontVariantNumeric: "tabular-nums" }}>
            {miles >= 1 ? `${Math.round(miles)} mi` : miles > 0 ? `${Math.round(miles * 1760 / 10) * 10} yd` : "0 mi"}
          </div>
        </div>
      </div>
      <Mark opacity={arrived || !roadOn ? 0.9 : 0.6} />
      <FilmFinish />
      <EndCard at={B(END)} line1="Driving home" line2="for Christmas" sub="Christmas and New Year breaks" />
      <Music len={DRIVE_FRAMES} />
    </AbsoluteFill>
  );
};
