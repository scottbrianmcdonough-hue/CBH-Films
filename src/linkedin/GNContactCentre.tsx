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
// in December"). "The lobby's full." / "The phone's ringing." with a line drawn phone ringing beside it, then the calls
// stacking up under it, one card a ring, saying why people call (the post's own three: New Year, a gift voucher, the
// Christmas party; Scott: "why would people call"), "Who picks up?", the handset lifting on the track's big hit, the
// answer from GN's own page (the dedicated dial in number, answered in the hotel's name): "We do." / "In your hotel's
// name.", and the end card: Great National Customer Contact Centre, the hours (no rule under the name: Scott, a
// Claude tell). No letter spacing, hyphens or em dashes in the text.
//
// The opening is over GN's own receptions and lobbies (Scott: "more visual than the simple card", "no stock"; photos
// from GN's SharePoint, only hotels on GN's Our Hotels page), cutting on the rings and tinted GN navy so the white type reads: a busy navy lobby that
// clears to calm white for the answer and the end card (GN's white ground, navy type). The roundel sits top left from
// frame one (LinkedIn's preview). 4:5 for the feed and 16:9 (`wide`), one layout each in LAYOUTS.
//
// Sound: one cut per track (`gn-contact-timing.ts`); `scripts/gn-contact-sfx.py` writes each soundtrack: the track
// held down and a little dull under the ringing, a desk phone's trill on each burst (kept low: Scott, "too loud on the
// ring"), the handset lifted on the hit and the track opening out. `gn-contact-centre-silent` has no sound.

/* Colours */
const navy = "#182b3c";
const lime = "#aabb17";
const grey = "#6b7b8a";
const white = "#ffffff";

/* Motion */
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

/* Layouts: 4:5 for the feed, 16:9 for desktop */
type Layout = {
  x: number; // left edge of the type
  badge: { top: number; size: number };
  line: { size: number; tops: [number, number, number] }; // the three lines
  phone: number; // the handset beside "The phone's ringing."
  cards: { top: number; step: number; width: number; height: number; label: number; text: number; icon: number };
  answer: { size: number; tops: [number, number] };
  end: { top: number; size: number; hours: number };
  pos: "tall" | "wide"; // which framing each photo uses
  tint: string; // the navy over the photos
};

const LAYOUTS: Record<"tall" | "wide", Layout> = {
  tall: {
    x: 80,
    badge: { top: 80, size: 120 },
    line: { size: 96, tops: [290, 410, 990] },
    phone: 78,
    cards: { top: 566, step: 136, width: 800, height: 116, label: 22, text: 34, icon: 64 },
    answer: { size: 96, tops: [500, 620] },
    end: { top: 470, size: 88, hours: 30 },
    pos: "tall",
    tint: "linear-gradient(180deg, rgba(24,43,60,0.74) 0%, rgba(24,43,60,0.62) 50%, rgba(24,43,60,0.74) 100%)",
  },
  wide: {
    x: 120,
    badge: { top: 70, size: 110 },
    line: { size: 84, tops: [210, 312, 806] },
    phone: 68,
    cards: { top: 446, step: 114, width: 700, height: 100, label: 20, text: 30, icon: 56 },
    answer: { size: 92, tops: [380, 490] },
    end: { top: 360, size: 88, hours: 30 },
    pos: "wide",
    // darker under the type on the left, the room showing through on the right
    tint: "linear-gradient(90deg, rgba(24,43,60,0.86) 0%, rgba(24,43,60,0.78) 42%, rgba(24,43,60,0.42) 78%, rgba(24,43,60,0.34) 100%)",
  },
};

/* The GN receptions and lobbies behind the opening, cutting on the rings. Only hotels on GN's own Our Hotels page
   (Scott checked greatnationalhotels.com/our-hotels: Oranmore Lodge and Castle Inn are not listed, so they are out) */
type Shot = {
  src: string;
  tall: string; // framing in 4:5
  wide: string; // framing in 16:9
  zoom?: number; // a closer start
  from: (T: ReturnType<typeof gnContactTiming>) => number;
};

const SHOTS: Shot[] = [
  // staff at the desk, the room behind: "The lobby's full."
  { src: "shannon-springs-reception", tall: "24% 50%", wide: "50% 50%", from: () => 0 },
  { src: "hotel-ballina-lobby", tall: "45% 50%", wide: "50% 50%", from: (T) => T.CARDS[0] },
  { src: "speech-house-reception", tall: "50% 50%", wide: "50% 50%", from: (T) => T.CARDS[1] },
  // back to the desk, closer on him: "Who picks up?" (the cover frame: Scott, Shannon Springs as the cover)
  { src: "shannon-springs-reception", tall: "27% 45%", wide: "30% 45%", zoom: 1.22, from: (T) => T.L3 },
];

const Backdrop: React.FC<{ f: number; T: ReturnType<typeof gnContactTiming>; L: Layout }> = ({ f, T, L }) => {
  const i = SHOTS.reduce((acc, s, k) => (f >= s.from(T) ? k : acc), 0);
  const shot = SHOTS[i];
  const start = shot.from(T);
  const end = i + 1 < SHOTS.length ? SHOTS[i + 1].from(T) : T.PICKUP + 20;
  const push = (shot.zoom ?? 1.04) + 0.05 * Math.min(1, (f - start) / Math.max(1, end - start)); // a slow push in on each shot
  const gone = ramp(f, T.PICKUP, 20, io); // clears to white as the handset lifts
  if (gone >= 1) return null;
  return (
    <AbsoluteFill style={{ opacity: 1 - gone, overflow: "hidden" }}>
      <Img
        src={staticFile(`campaigns/gn-contact/hotels/${shot.src}.jpg`)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: shot[L.pos],
          filter: "blur(1.5px) saturate(0.9)",
          transform: `scale(${push})`,
          transformOrigin: shot[L.pos],
        }}
      />
      <AbsoluteFill style={{ background: L.tint }} />
    </AbsoluteFill>
  );
};

/* A clean line drawn handset with two sound arcs (24 unit grid, stroked) */
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

/* A line of the big serif type */
const Line: React.FC<{
  style: React.CSSProperties;
  x: number;
  top: number;
  size: number;
  color: string;
  children: React.ReactNode;
}> = ({ style, x, top, size, color, children }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top,
      display: "flex",
      alignItems: "center",
      gap: Math.round(size * 0.31),
      fontFamily: serif,
      fontWeight: 500,
      fontSize: size,
      lineHeight: 1.1,
      color,
      ...style,
    }}
  >
    {children}
  </div>
);

/* An incoming call: the reason someone rings, on a white card, its lime icon ringing with its burst */
const CALLS = ["New Year for a family of four", "A gift voucher for Christmas", "A Christmas party for 40"];

const CallCard: React.FC<{
  f: number;
  start: number;
  away: number;
  env: number;
  text: string;
  x: number;
  top: number;
  c: Layout["cards"];
}> = ({ f, start, away, env, text, x, top, c }) => {
  const p = ramp(f, start, 16, Easing.out(Easing.back(1.4)));
  const fade = ramp(f, start, 10);
  const g = ramp(f, away, 16, io);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top,
        width: c.width,
        height: c.height,
        boxSizing: "border-box",
        padding: "0 32px 0 26px",
        display: "flex",
        alignItems: "center",
        gap: 26,
        background: white,
        borderRadius: 22,
        boxShadow: "0 16px 40px rgba(0, 0, 0, 0.28)",
        opacity: fade * (1 - g),
        transform: `translateY(${(1 - p) * 40 - g * 24}px) scale(${0.96 + 0.04 * p})`,
        transformOrigin: "left center",
      }}
    >
      <div
        style={{
          width: c.icon,
          height: c.icon,
          borderRadius: c.icon / 2,
          background: lime,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flex: "none",
        }}
      >
        <Handset size={Math.round(c.icon * 0.53)} color={navy} env={env} />
      </div>
      <div style={{ fontFamily: sans }}>
        <div style={{ fontSize: c.label, color: grey, lineHeight: 1.3 }}>Incoming call</div>
        <div style={{ fontSize: c.text, fontWeight: 600, color: navy, lineHeight: 1.3 }}>{text}</div>
      </div>
    </div>
  );
};

/* The film */
export const GNContactCentre: React.FC<{ track?: GNContactTrack; sound?: boolean; wide?: boolean }> = ({
  track = "indie",
  sound = true,
  wide = false,
}) => {
  const f = useCurrentFrame();
  const T = gnContactTiming(track);
  const L = LAYOUTS[wide ? "wide" : "tall"];
  const ring = (only?: number) => ringing(T.RINGS, T.PICKUP, f, only);
  const title = ramp(f, T.END, 26);
  const title2 = ramp(f, T.END + 8, 26);
  const hours = ramp(f, T.END + 24, 26);
  const phoneOn = ramp(f, T.L2 + 6, RISE);
  return (
    <AbsoluteFill
      style={{
        // GN's white ground with a soft diagonal wash, under everything once the photos clear
        background: "linear-gradient(135deg, #ffffff 0%, #ffffff 36%, #eef1f4 100%)",
      }}
    >
      {sound ? <Audio src={staticFile(`campaigns/gn-contact/soundtrack-${track}.wav`)} /> : null}

      <Backdrop f={f} T={T} L={L} />

      {/* GN roundel */}
      <Img
        src={staticFile("brand/gn/gnh-badge.svg")}
        style={{ position: "absolute", left: L.x, top: L.badge.top, width: L.badge.size, height: L.badge.size }}
      />

      {/* the lines (white over the photos) and the calls stacking up between them, all lifting away on the pickup */}
      <Line style={enter(f, T.L1, T.PICKUP)} x={L.x} top={L.line.tops[0]} size={L.line.size} color={white}>
        The lobby’s full.
      </Line>
      <Line style={enter(f, T.L2, T.PICKUP)} x={L.x} top={L.line.tops[1]} size={L.line.size} color={white}>
        The phone’s ringing.
        <div style={{ opacity: phoneOn, display: "flex" }}>
          <Handset size={L.phone} color={white} env={ring(0)} />
        </div>
      </Line>
      {CALLS.map((text, i) => (
        <CallCard
          key={text}
          f={f}
          start={T.CARDS[i]}
          away={T.PICKUP}
          env={ring(i + 1)}
          text={text}
          x={L.x}
          top={L.cards.top + i * L.cards.step}
          c={L.cards}
        />
      ))}
      <Line style={enter(f, T.L3, T.PICKUP)} x={L.x} top={L.line.tops[2]} size={L.line.size} color={white}>
        Who picks up?
      </Line>

      {/* the answer, navy on white */}
      <Line style={enter(f, T.A1, T.A_OUT)} x={L.x} top={L.answer.tops[0]} size={L.answer.size} color={navy}>
        We do.
      </Line>
      <Line style={enter(f, T.A2, T.A_OUT)} x={L.x} top={L.answer.tops[1]} size={L.answer.size} color={navy}>
        In your hotel’s name.
      </Line>

      {/* end card */}
      <div style={{ position: "absolute", left: L.x, right: L.x, top: L.end.top, color: navy }}>
        <div
          style={{
            fontFamily: serif,
            fontWeight: 500,
            fontSize: L.end.size,
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
            fontSize: L.end.size,
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
            fontSize: L.end.hours,
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
