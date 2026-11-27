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
import { GNContactTrack, gnContactTiming, ringing } from "./gn-contact-timing";

// Great National Customer Contact Centre (Scott, 27 Nov: the LinkedIn post "If you've ever worked a hotel front desk
// in December"). "The lobby's full." / "The phone's ringing." with a navy line drawn phone ringing beside it, then
// the calls stacking up under it, one card a ring, saying why people call (the post's own three: New Year, a gift
// voucher, the Christmas party; Scott: "why would people call"), "Who picks up?", the handset lifting on the track's
// big hit, the answer from GN's own page (the dedicated dial in number, answered in the hotel's name): "We do." /
// "In your hotel's name.", and the end card: Great National Customer Contact Centre, the hours (no rule under the
// name: Scott, a Claude tell). 4:5. GN's look: white ground with a soft diagonal wash, navy type, lime only on the
// card icons, the roundel top left from frame one (LinkedIn's preview). No photo: Chris didn't like the empty lobby.
// No letter spacing, hyphens or em dashes in the text.
//
// Sound: one cut per track (`gn-contact-timing.ts`); `scripts/gn-contact-sfx.py` writes each soundtrack: the track
// held down and a little dull under the ringing, a desk phone's trill on each burst (kept low: Scott, "too loud on the
// ring"), the handset lifted on the hit and the track opening out. Christmas Event Upbeat was dropped (Scott: "don't
// like the music"). `gn-contact-centre-silent` has no sound.

const navy = "#182b3c";
const lime = "#aabb17";
const grey = "#6b7b8a";
const out = Easing.out(Easing.cubic);
const io = Easing.inOut(Easing.cubic);
const RISE = 22; // frames a line takes to rise and fade in

export const gnContactFrames = (track: GNContactTrack) => gnContactTiming(track).FRAMES;

const ramp = (f: number, start: number, len: number, ease = out) =>
  interpolate(f, [start, start + len], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

// rising into place and fading in from `start`, lifting away from `away`
const enter = (f: number, start: number, away: number, y = 36): React.CSSProperties => {
  const p = ramp(f, start, RISE);
  const g = ramp(f, away, 16, io);
  return {
    opacity: p * (1 - g),
    transform: `translateY(${(1 - p) * y - g * 24}px)`,
  };
};

// a clean line drawn handset with two sound arcs (24 unit grid, stroked)
const Handset: React.FC<{ size: number; color: string; env: number }> = ({ size, color, env }) => {
  const angle = env * 9 * Math.sin(env * Math.PI * 4);
  const arcs = 0.35 + 0.65 * env;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: `rotate(${angle}deg)`, transformOrigin: "40% 60%", flex: "none" }}
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
      <path d="M14.05 6A5 5 0 0 1 18 10" opacity={arcs} />
      <path d="M14.05 2a9 9 0 0 1 8 7.94" opacity={arcs * 0.8} />
    </svg>
  );
};

// a line of the big serif type
const Line: React.FC<{ style: React.CSSProperties; top: number; children: React.ReactNode }> = ({
  style,
  top,
  children,
}) => (
  <div
    style={{
      position: "absolute",
      left: 80,
      top,
      display: "flex",
      alignItems: "center",
      gap: 30,
      fontFamily: serif,
      fontWeight: 500,
      fontSize: 96,
      lineHeight: 1.1,
      color: navy,
      ...style,
    }}
  >
    {children}
  </div>
);

// an incoming call: the reason someone rings, on a white card, its lime icon ringing with its burst
const CALLS = ["New Year for a family of four", "A gift voucher for Christmas", "A Christmas party for 40"];

const CallCard: React.FC<{ f: number; start: number; away: number; env: number; text: string; top: number }> = ({
  f,
  start,
  away,
  env,
  text,
  top,
}) => {
  const p = ramp(f, start, 16, Easing.out(Easing.back(1.4)));
  const fade = ramp(f, start, 10);
  const g = ramp(f, away, 16, io);
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        top,
        width: 800,
        height: 116,
        boxSizing: "border-box",
        padding: "0 32px 0 26px",
        display: "flex",
        alignItems: "center",
        gap: 26,
        background: "#ffffff",
        border: "1px solid #e3e8ee",
        borderRadius: 22,
        boxShadow: "0 14px 34px rgba(24, 43, 60, 0.10)",
        opacity: fade * (1 - g),
        transform: `translateY(${(1 - p) * 40 - g * 24}px) scale(${0.96 + 0.04 * p})`,
        transformOrigin: "left center",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          background: lime,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flex: "none",
        }}
      >
        <Handset size={34} color={navy} env={env} />
      </div>
      <div style={{ fontFamily: sans }}>
        <div style={{ fontSize: 22, color: grey, lineHeight: 1.3 }}>Incoming call</div>
        <div style={{ fontSize: 34, fontWeight: 600, color: navy, lineHeight: 1.3 }}>{text}</div>
      </div>
    </div>
  );
};

export const GNContactCentre: React.FC<{ track?: GNContactTrack; sound?: boolean }> = ({
  track = "indie",
  sound = true,
}) => {
  const f = useCurrentFrame();
  const T = gnContactTiming(track);
  const ring = (only?: number) => ringing(T.RINGS, T.PICKUP, f, only);
  const title = ramp(f, T.END, 26);
  const title2 = ramp(f, T.END + 8, 26);
  const hours = ramp(f, T.END + 24, 26);
  const phoneOn = ramp(f, T.L2 + 6, RISE);
  return (
    <AbsoluteFill
      style={{
        // the soft diagonal wash, white top left to a pale grey blue bottom right
        background: "linear-gradient(135deg, #ffffff 0%, #ffffff 36%, #eef1f4 100%)",
      }}
    >
      {sound ? <Audio src={staticFile(`campaigns/gn-contact/soundtrack-${track}.wav`)} /> : null}

      {/* GN roundel */}
      <Img
        src={staticFile("brand/gn/gnh-badge.svg")}
        style={{ position: "absolute", left: 80, top: 80, width: 120, height: 120 }}
      />

      {/* the lines and the calls stacking up between them, all lifting away on the pickup */}
      <Line style={enter(f, T.L1, T.PICKUP)} top={290}>
        The lobby’s full.
      </Line>
      <Line style={enter(f, T.L2, T.PICKUP)} top={410}>
        The phone’s ringing.
        <div style={{ opacity: phoneOn, display: "flex" }}>
          <Handset size={78} color={navy} env={ring(0)} />
        </div>
      </Line>
      {CALLS.map((text, i) => (
        <CallCard key={text} f={f} start={T.CARDS[i]} away={T.PICKUP} env={ring(i + 1)} text={text} top={566 + i * 136} />
      ))}
      <Line style={enter(f, T.L3, T.PICKUP)} top={990}>
        Who picks up?
      </Line>

      {/* the answer */}
      <Line style={enter(f, T.A1, T.A_OUT)} top={500}>
        We do.
      </Line>
      <Line style={enter(f, T.A2, T.A_OUT)} top={620}>
        In your hotel’s name.
      </Line>

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
        <div
          style={{
            fontFamily: sans,
            fontSize: 30,
            lineHeight: 1.6,
            marginTop: 48,
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
