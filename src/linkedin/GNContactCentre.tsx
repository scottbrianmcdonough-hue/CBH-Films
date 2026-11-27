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

// Great National Customer Contact Centre (Scott, 27 Nov: the LinkedIn post "If you've ever worked a hotel front desk
// in December"): three calm beats, a line at a time ("The lobby's full." / "The phone's ringing." / "Who picks
// up?"), a navy line drawn phone ringing beside the second, then the end card: Great National Customer Contact
// Centre, the lime rule, the hours. 4:5, silent (Scott adds sound when posting). GN's look: white ground with a soft
// diagonal wash, navy type, lime only as a thin rule, the roundel top left from frame one (LinkedIn's preview). No
// photo: Chris didn't like the empty lobby. No letter spacing, hyphens or em dashes in the text.

export const GN_CONTACT_FRAMES = 360; // 12s at 30fps

const navy = "#182b3c";
const lime = "#aabb17";
const out = Easing.out(Easing.cubic);
const io = Easing.inOut(Easing.cubic);

const ramp = (f: number, start: number, len: number, ease = out) =>
  interpolate(f, [start, start + len], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

// the three beats, then the end card
const L1 = 14;
const L2 = 58;
const L3 = 104;
const OUT = 196; // the lines lift away
const END = 216; // the end card comes in
const RISE = 26; // frames a line takes to rise and fade in

// a line rising into place and fading in, and lifting away together at OUT
const lineStyle = (f: number, start: number): React.CSSProperties => {
  const p = ramp(f, start, RISE);
  const gone = ramp(f, OUT, 18, io);
  return {
    opacity: p * (1 - gone),
    transform: `translateY(${(1 - p) * 36 - gone * 24}px)`,
  };
};

// a clean line drawn handset with two sound arcs (24 unit grid, stroked), ringing in short bursts: a quick wobble while
// the arcs pulse, then a rest
const Phone: React.FC<{ f: number }> = ({ f }) => {
  const on = ramp(f, L2 + 8, RISE);
  const gone = ramp(f, OUT, 18, io);
  const t = f - (L2 + 20);
  const cycle = 34; // frames: 18 ringing, 16 resting
  const inCycle = ((t % cycle) + cycle) % cycle;
  const ringing = t >= 0 && f < OUT && inCycle < 18;
  const env = ringing ? Math.sin((Math.PI * inCycle) / 18) : 0;
  const angle = ringing ? 9 * env * Math.sin((2 * Math.PI * inCycle) / 6) : 0;
  const arcs = ringing ? 0.35 + 0.65 * env : 0.35;
  return (
    <svg
      width={78}
      height={78}
      viewBox="0 0 24 24"
      fill="none"
      stroke={navy}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        opacity: on * (1 - gone),
        transform: `rotate(${angle}deg)`,
        transformOrigin: "40% 60%",
        flex: "none",
      }}
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
      <path d="M14.05 6A5 5 0 0 1 18 10" opacity={arcs} />
      <path d="M14.05 2a9 9 0 0 1 8 7.94" opacity={arcs * 0.8} />
    </svg>
  );
};

const Line: React.FC<{ f: number; start: number; children: React.ReactNode }> = ({
  f,
  start,
  children,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 30,
      fontFamily: serif,
      fontWeight: 500,
      fontSize: 96,
      lineHeight: 1.1,
      color: navy,
      marginBottom: 34,
      ...lineStyle(f, start),
    }}
  >
    {children}
  </div>
);

export const GNContactCentre: React.FC = () => {
  const f = useCurrentFrame();
  const title = ramp(f, END, RISE);
  const title2 = ramp(f, END + 8, RISE);
  const rule = ramp(f, END + 22, 22, io);
  const hours = ramp(f, END + 32, RISE);
  return (
    <AbsoluteFill
      style={{
        // the soft diagonal wash, white top left to a pale grey blue bottom right
        background: "linear-gradient(135deg, #ffffff 0%, #ffffff 36%, #eef1f4 100%)",
      }}
    >
      {/* GN roundel */}
      <Img
        src={staticFile("brand/gn/gnh-badge.svg")}
        style={{ position: "absolute", left: 80, top: 80, width: 120, height: 120 }}
      />

      {/* the three beats */}
      <div style={{ position: "absolute", left: 80, right: 60, top: 470 }}>
        <Line f={f} start={L1}>The lobby’s full.</Line>
        <Line f={f} start={L2}>
          The phone’s ringing.
          <Phone f={f} />
        </Line>
        <Line f={f} start={L3}>Who picks up?</Line>
      </div>

      {/* end card */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 470, color: navy }}>
        <div
          style={{
            fontFamily: serif,
            fontWeight: 500,
            fontSize: 88,
            lineHeight: 1.08,
            opacity: title,
            transform: `translateY(${(1 - title) * 36}px)`,
          }}
        >
          Great National
        </div>
        <div
          style={{
            fontFamily: serif,
            fontWeight: 500,
            fontSize: 88,
            lineHeight: 1.08,
            opacity: title2,
            transform: `translateY(${(1 - title2) * 36}px)`,
          }}
        >
          Customer Contact Centre
        </div>
        <div style={{ width: 140 * rule, height: 4, background: lime, margin: "54px 0 46px" }} />
        <div
          style={{
            fontFamily: sans,
            fontSize: 30,
            lineHeight: 1.6,
            opacity: hours,
            transform: `translateY(${(1 - hours) * 20}px)`,
          }}
        >
          Mon to Fri, 9:00 AM to 8:00 PM
          <br />
          Sat and Irish bank holidays, 10:00 AM to 4:00 PM
        </div>
      </div>
    </AbsoluteFill>
  );
};
