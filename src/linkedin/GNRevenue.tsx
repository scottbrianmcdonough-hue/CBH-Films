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
// Christmas, someone can be getting January ready"). This take after Scott's notes on the rate table versions ("too
// fast to know what's going on", "don't make up the UI", "use the info"): nothing invented.
//   - The hook over GN's own hotels at dusk in a navy tint with a light snowfall, the Contact Centre video's look.
//   - Revanista as GN shows it, full bleed (Scott: not a "box thrown on top"): GN's own Revanista carousel cover cleared
//     of its text, logo and red decorations (scripts/revanista-devices-clean.py), the real rate screens on a laptop, a
//     monitor and a phone along the bottom of a white studio; "Powered by Revanista", the wording on GN's page.
//   - What the service gives a hotel, from GN's Revenue Management page, three points, 2.5 seconds apart, the list
//     building so each can be read: account manager, rate loading, price shopping
//     (Scott: "too fast", "maybe too much text").
//   - GN's white: "You look after Christmas. / We'll get January ready.", and the end card: the roundel travelling to
//     the middle, Great National Revenue Management, "Powered by" and Revanista's logo.
// No figures, no hyphens, em dashes or triads in the text. 4:5 and 16:9 (`wide`). Sound: scripts/gn-revenue-sfx.py
// (reads BEAT, END and T from here).

/* Colours */
const navy = "#182b3c";
const navyDeep = "#0f1e2b";
const lime = "#aabb17";
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
export const END = 540;
const beat = (n: number) => END - n * BEAT;
export const T = {
  HOOK1: beat(36), // "While your team is busy with Christmas," (in from the first frame: LinkedIn previews it)
  HOOK2: beat(33), // "someone can be getting January ready."
  HOOK_OUT: beat(27),
  DEVICES: beat(26), // Revanista as GN shows it
  FEATURES: [beat(22), beat(17), beat(12)], // three points, 2.5 seconds apart (Scott: "too fast", "maybe too much text")
  CLEAR: beat(7), // the studio clears to white
  A1: beat(6), // "You look after Christmas."
  A2: beat(5), // "We'll get January ready."
  A_OUT: beat(1) - 4,
  END,
};
export const GN_REVENUE_FRAMES = T.END + 100;

/* What the service gives a hotel, from GN's Revenue Management page */
const FEATURES = [
  "A dedicated Revenue Account Manager",
  "Rates loaded up to 24 months ahead",
  "Competitor price shopping",
];

/* Layouts */
type Layout = {
  x: number;
  badge: { top: number; size: number };
  hook: { size: number; tops: [number, number]; width: number };
  title: { left: number; top: number; size: number; width: number };
  list: { left: number; top: number; step: number; size: number; width: number };
  answer: { size: number; tops: [number, number] };
  end: { cx: number; badge: [number, number]; title: [number, number]; line: [number, number, number]; logo: [number, number] };
  tint: string;
};

const LAYOUTS: Record<"tall" | "wide", Layout> = {
  tall: {
    x: 80,
    badge: { top: 80, size: 120 },
    hook: { size: 88, tops: [330, 540], width: 920 },
    title: { left: 80, top: 250, size: 60, width: 920 },
    list: { left: 80, top: 370, step: 80, size: 40, width: 920 },
    answer: { size: 84, tops: [510, 616] },
    end: { cx: 540, badge: [370, 190], title: [600, 84], line: [846, 26, 960], logo: [892, 230] },
    tint: "linear-gradient(180deg, rgba(24,43,60,0.80) 0%, rgba(24,43,60,0.70) 50%, rgba(24,43,60,0.84) 100%)",
  },
  wide: {
    x: 120,
    badge: { top: 70, size: 110 },
    hook: { size: 88, tops: [360, 470], width: 1500 },
    title: { left: 120, top: 220, size: 60, width: 760 },
    list: { left: 120, top: 340, step: 82, size: 38, width: 760 },
    answer: { size: 92, tops: [380, 490] },
    end: { cx: 960, badge: [190, 170], title: [400, 84], line: [626, 26, 900], logo: [670, 210] },
    tint: "linear-gradient(90deg, rgba(24,43,60,0.88) 0%, rgba(24,43,60,0.76) 45%, rgba(24,43,60,0.62) 100%)",
  },
};

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

/* GN's own hotels behind, tinted GN navy, one at dusk held under the hook
   (Scott: "a weird flicker before each transition": the cuts between dark tinted photos read as flickers). Photos from GN's Our Hotels page (gn-key/hotels) */
const SHOTS: { src: string; tall: string; from: number }[] = [
  { src: "newtown-park", tall: "40% 50%", from: 0 },
];

const Hotels: React.FC<{ f: number; L: Layout; wide: boolean }> = ({ f, L, wide }) => {
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
      <AbsoluteFill style={{ background: L.tint }} />
    </AbsoluteFill>
  );
};

/* A point of the service: a lime tick in a ring, the words beside it */
const Feature: React.FC<{ f: number; at: number; text: string; top: number; L: Layout["list"]; away: number }> = ({
  f,
  at,
  text,
  top,
  L,
  away,
}) => {
  const p = ramp(f, at, 16);
  const tick = ramp(f, at + 4, 12);
  const g = ramp(f, away, 16, io);
  const ring = Math.round(L.size * 1.35);
  return (
    <div
      style={{
        position: "absolute",
        left: L.left,
        top,
        width: L.width,
        display: "flex",
        alignItems: "center",
        gap: 20,
        opacity: p * (1 - g),
        transform: `translateX(${(1 - p) * -30}px)`,
      }}
    >
      <svg width={ring} height={ring} viewBox="0 0 24 24" style={{ flex: "none" }}>
        <circle cx="12" cy="12" r="11" fill={navy} />
        <path
          d="M7 12.5l3.2 3.2L17 9"
          fill="none"
          stroke={lime}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={16}
          strokeDashoffset={16 * (1 - tick)}
        />
      </svg>
      <span style={{ fontFamily: sans, fontSize: L.size, color: navy, lineHeight: 1.25 }}>{text}</span>
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
  const dev = ramp(f, T.DEVICES, 16, io);

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
      {/* the track and a soft tap as each point lands (scripts/gn-revenue-sfx.py) */}
      {sound ? <Audio src={staticFile("campaigns/gn-revenue/soundtrack.wav")} /> : null}

      {/* GN's hotels in GN navy with a light snowfall, clearing to white */}
      {cleared < 1 ? (
        <AbsoluteFill style={{ opacity: 1 - cleared }}>
          <AbsoluteFill style={{ background: navyDeep }} />
          <Hotels f={f} L={L} wide={wide} />
          <Snow f={f} w={W} h={H} />
        </AbsoluteFill>
      ) : null}

      {/* the studio, full bleed (Scott: no "box thrown on top"): GN's own carousel cover cleared of its text and logo,
          the real devices along the bottom */}
      <AbsoluteFill style={{ opacity: dev * (1 - cleared), overflow: "hidden" }}>
        {/* a slow, cinematic push (Scott: the depth move went "off the page", "slower, cinematic Ken Burns style"):
            eased over the whole stretch, anchored low so the devices stay in frame */}
        <Img
          src={staticFile(`campaigns/gn-revenue/revanista-plate-${wide ? "wide" : "tall"}.jpg`)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${1 + 0.07 * ramp(f, T.DEVICES, T.CLEAR + 20 - T.DEVICES, Easing.inOut(Easing.sin))})`,
            transformOrigin: wide ? "70% 88%" : "50% 90%",
          }}
        />
      </AbsoluteFill>

      {/* GN roundel, travelling to the middle for the end card */}
      <Img
        src={staticFile("brand/gn/gnh-badge.svg")}
        style={{ position: "absolute", left: badgeLeft, top: badgeTop, width: badgeSize, height: badgeSize }}
      />

      {/* the hook */}
      {[
        { text: "While your team is busy with Christmas,", start: T.HOOK1, top: L.hook.tops[0] },
        { text: "someone can be getting January ready.", start: T.HOOK2, top: L.hook.tops[1] },
      ].map((l) => (
        <div
          key={l.text}
          style={{
            position: "absolute",
            left: L.x,
            top: l.top,
            width: L.hook.width,
            fontFamily: serif,
            fontWeight: 500,
            fontSize: L.hook.size,
            lineHeight: 1.1,
            color: white,
            ...enter(f, l.start, T.HOOK_OUT),
          }}
        >
          {l.text}
        </div>
      ))}

      {/* Revanista, in the words of GN's own page */}
      <div
        style={{
          position: "absolute",
          left: L.title.left,
          top: L.title.top,
          width: L.title.width,
          fontFamily: serif,
          fontWeight: 500,
          fontSize: L.title.size,
          lineHeight: 1.15,
          color: navy,
          ...enter(f, T.DEVICES + 6, T.CLEAR),
        }}
      >
        Powered by Revanista
      </div>
      {/* what the service gives a hotel, the list building a point at a time */}
      {FEATURES.map((text, i) => (
        <Feature key={text} f={f} at={T.FEATURES[i]} text={text} top={L.list.top + i * L.list.step} L={L.list} away={T.CLEAR} />
      ))}

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

      {/* end card: the roundel, the service, "Powered by" and Revanista's logo */}
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
        Powered by
      </div>
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
