import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { palette, sans, serif } from "../hotel-film/theme";
import { CBLogo } from "../hotel-film/components/CBLogo";
import map from "./global-hub/map-wide.json";

// The 16:9 cut for LinkedIn (Scott, 11 Nov: "this is for LinkedIn so landscape", "needs better spacing"): the headline
// and the stats in a column on the left, the door and the world on the right, all text above the bottom quarter (the
// player bar). Otherwise as the 4:5 GlobalHub.tsx.
// CB Global Hub on LinkedIn: the door (Scott, 11 Nov: "do it from scratch, it doesn't have to be like the other ones,
// CB Hub is new"; Phill: "opening the door to new global markets"). A panelled hotel door in gold line on black swings
// open, warm light spills across the floor and the UK shows through the doorway; the camera pushes through and draws
// back to the world, and the lines go out. Before that it followed the GN map (Phill, 11 Nov: "via the CBHub we distribute to global partners ... 8 new strategic
// partnerships this year", "opening the door to new global markets"; Scott: "like the GN animations or the Atholl
// Palace one", the GN map and the journey reel's thread to Pitlochry). 4:5, silent. The world in Equal Earth
// (scripts/global-hub-map.mjs) draws its coast in gold on black, the UK lights, then eight gold lines arc out to world
// markets, each lighting as it lands while the count climbs to 8; light keeps travelling the lines to the end. The
// headline is there from frame one (LinkedIn previews the first frame), and the last frame stands as the still. The
// new CBH palette (Bianca, 10 Nov): black, gold and the pale neutral only. CB GLOBAL HUB in bold, tight caps like Lee's
// "THE WAIT IS OVER" (Scott, 11 Nov). Sound: the soft cinematic piano with a latch and eight bells (no shimmer under the count, Scott). Ends on the
// official logo with its light sweep (Scott: "maybe needs a logo and ending").

export const GLOBAL_HUB_WIDE_FRAMES = 570;
export const GLOBAL_HUB_STORY_MAP_FRAMES = 528; // the noDoor act: 28 frames tighter, the logo 14 frames shorter
const END = 456; // the ending: all to black, the CBH logo rises with its light sweep
const STAT2 = 276; // the second stat: 750,000+ global travel agents (the membership page)
type P = { id: string; x: number; y: number };
const HOME = map.home as P;
const MARKETS = map.markets as P[];
const AGENTS = map.agents as { x: number; y: number; d: number }[];
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (f: number, a: number, b: number, e = Easing.out(Easing.cubic)) =>
  interpolate(f, [a, b], [0, 1], { ...clamp, easing: e });

const DRAW = [40, 100] as const;
const HOME_AT = 64;
const FIRST = 112;
const EVERY = 16;
const ARC = 28;
// the door: the doorway, its opening, the push through
const DW = { x: 1210, y: 320, w: 230, h: 420 };
const DCX = DW.x + DW.w / 2;
const DCY = DW.y + DW.h / 2;
const OPEN = [12, 50] as const;
const PUSH = [48, 96] as const;
const PULL = [52, 116] as const; // the world drawing back from the UK

// a classic six panel door leaf in gold line on near black, a brass knob
const Leaf: React.FC = () => {
  const pw = DW.w - 56;
  const rows = [
    { y: 28, h: 96 },
    { y: 144, h: 118 },
    { y: 282, h: 118 },
  ];
  return (
    <svg width={DW.w} height={DW.h} style={{ display: "block" }}>
      <rect x={0} y={0} width={DW.w} height={DW.h} fill="#0d0c0b" />
      <rect x={6} y={6} width={DW.w - 12} height={DW.h - 12} fill="none" stroke={palette.gold} strokeWidth={1.4} opacity={0.7} />
      {rows.map((r) =>
        [0, 1].map((c) => (
          <g key={`${r.y}-${c}`}>
            <rect x={28 + c * (pw / 2 + 0)} y={r.y} width={pw / 2 - 10} height={r.h} fill="none" stroke={palette.gold} strokeWidth={1.4} opacity={0.75} />
            <rect x={36 + c * (pw / 2 + 0)} y={r.y + 8} width={pw / 2 - 26} height={r.h - 16} fill="none" stroke={palette.gold} strokeWidth={0.8} opacity={0.4} />
          </g>
        )),
      )}
      <circle cx={DW.w - 34} cy={DW.h * 0.53} r={9} fill={palette.gold} />
      <circle cx={DW.w - 34} cy={DW.h * 0.53} r={14} fill="none" stroke={palette.gold} strokeWidth={1} opacity={0.6} />
    </svg>
  );
};

// each line a quadratic arc, bowed up and away from the equator, more for the long ones
const ctrl = (m: P) => {
  const dx = m.x - HOME.x;
  const dy = m.y - HOME.y;
  const len = Math.hypot(dx, dy);
  const lift = Math.min(170, 30 + len * 0.32);
  return { x: (HOME.x + m.x) / 2, y: Math.min(HOME.y, m.y) - lift };
};
const at = (m: P, t: number) => {
  const c = ctrl(m);
  const u = 1 - t;
  return {
    x: u * u * HOME.x + 2 * u * t * c.x + t * t * m.x,
    y: u * u * HOME.y + 2 * u * t * c.y + t * t * m.y,
  };
};

const Light: React.FC<{ x: number; y: number; on: number; ripple: number; r?: number }> = ({
  x,
  y,
  on,
  ripple,
  r = 7,
}) => (
  <g>
    {ripple > 0 && ripple < 1 ? (
      <circle cx={x} cy={y} r={r + 34 * ripple} fill="none" stroke={palette.gold} strokeWidth={2} opacity={1 - ripple} />
    ) : null}
    <circle cx={x} cy={y} r={r * 3.4 * on} fill="url(#hub-glow)" />
    <circle cx={x} cy={y} r={r * on} fill={palette.gold} />
  </g>
);

export const GlobalHubWide: React.FC<{ noDoor?: boolean; silent?: boolean }> = ({ noDoor, silent }) => {
  const frame = useCurrentFrame();
  // in the story (noDoor) the map act runs a little tighter so the diagram before it can hold longer (Scott, 11 Nov: "let
  // it register on the CBHUB a little more"): the lines a touch quicker, the stats' hold unchanged
  const every = noDoor ? 12 : EVERY;
  const S2 = noDoor ? STAT2 - 28 : STAT2;
  const E = noDoor ? END - 28 : END;
  const startOfE = (i: number) => FIRST + i * every;
  const landOfE = (i: number) => startOfE(i) + ARC;
  const draw = ramp(frame, DRAW[0], DRAW[1], Easing.inOut(Easing.cubic));
  const open = ramp(frame, OPEN[0], OPEN[1], Easing.inOut(Easing.cubic));
  const push = ramp(frame, PUSH[0], PUSH[1], Easing.in(Easing.cubic));
  const pull = ramp(frame, PULL[0], PULL[1], Easing.inOut(Easing.cubic));
  const count = MARKETS.filter((_, i) => frame >= landOfE(i)).length;
  const lastLand = MARKETS.reduce((a, _, i) => (frame >= landOfE(i) ? landOfE(i) : a), -99);
  const pop = ramp(frame, lastLand, lastLand + 10, Easing.out(Easing.back(2)));
  const countOn = ramp(frame, landOfE(0) - 8, landOfE(0) + 6);
  // the count out first, then the two stats in (no overlap: the labels ghosted, polish 11 Nov)
  const swapOut = ramp(frame, S2, S2 + 8, Easing.in(Easing.cubic));
  const swap = ramp(frame, S2 + 8, S2 + 22, Easing.out(Easing.cubic));
  const agentsCount = ramp(frame, S2 + 6, S2 + 66, Easing.out(Easing.cubic));
  const logo = ramp(frame, S2 + 80, S2 + 104);

  return (
    <AbsoluteFill style={{ backgroundColor: palette.black }}>
      {/* the piano with the latch, the eight bells and the shimmer (scripts/global-hub-sfx.py) */}
      {silent ? null : <Audio src={staticFile("campaigns/global-hub/sound.wav")} volume={0.75} />}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 40% 40% at 68% 52%, rgba(199,171,119,0.10), transparent 72%)`,
        }}
      />
      {/* the world, seen first through the doorway close on the UK, then drawing back */}
      <AbsoluteFill
        style={{
          transformOrigin: `${HOME.x}px ${HOME.y}px`,
          transform: `translate(${(DCX - HOME.x) * (1 - pull)}px, ${(DCY - HOME.y) * (1 - pull)}px) scale(${2.6 - 1.6 * pull})`,
        }}
      >
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <defs>
          <radialGradient id="hub-glow">
            <stop offset="0" stopColor={palette.gold} stopOpacity={0.55} />
            <stop offset="1" stopColor={palette.gold} stopOpacity={0} />
          </radialGradient>
        </defs>
        {/* the land: a faint fill from frame one, the coast drawing in gold */}
        <path d={map.land} fill="#151412" stroke="#2a2723" strokeWidth={0.8} />
        <path
          d={map.land}
          fill="none"
          stroke={palette.gold}
          strokeWidth={0.9}
          strokeOpacity={0.55}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - draw}
        />

        {/* the agents: a dust of gold spreading out from the UK as the second count climbs */}
        {AGENTS.map((a, k) => {
          const t0 = S2 + 4 + a.d * 46;
          const on = ramp(frame, t0, t0 + 12);
          if (on <= 0) return null;
          const tw = 0.45 + 0.4 * Math.sin((frame + k * 37) / 9);
          return <circle key={k} cx={a.x} cy={a.y} r={1.5} fill={palette.gold} opacity={on * tw} />;
        })}
        {MARKETS.map((m, i) => {
          const t = ramp(frame, startOfE(i), landOfE(i), Easing.inOut(Easing.cubic));
          if (t <= 0) return null;
          const c = ctrl(m);
          const d = `M ${HOME.x} ${HOME.y} Q ${c.x} ${c.y} ${m.x} ${m.y}`;
          const landed = frame >= landOfE(i);
          // light keeps travelling out along the line once it has landed
          const period = 54;
          const k = landed ? ((frame - landOfE(i) + i * 7) % period) / period : -1;
          const pulse = k >= 0 ? at(m, k) : null;
          return (
            <g key={m.id}>
              <path
                d={d}
                fill="none"
                stroke={palette.gold}
                strokeWidth={2}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - t}
                opacity={0.85}
              />
              {pulse ? <circle cx={pulse.x} cy={pulse.y} r={3.2} fill={palette.pale} opacity={Math.sin(Math.PI * k)} /> : null}
              {landed ? (
                <Light
                  x={m.x}
                  y={m.y}
                  on={ramp(frame, landOfE(i), landOfE(i) + 8, Easing.out(Easing.back(2)))}
                  ripple={ramp(frame, landOfE(i), landOfE(i) + 24, Easing.out(Easing.quad))}
                />
              ) : null}
            </g>
          );
        })}
        {frame >= HOME_AT ? (
          <Light
            x={HOME.x}
            y={HOME.y}
            r={9}
            on={ramp(frame, HOME_AT, HOME_AT + 10, Easing.out(Easing.back(2)))}
            ripple={((frame - HOME_AT) % 60) / 60}
          />
        ) : null}
      </svg>

      </AbsoluteFill>
      {noDoor ? null : (
        <>
      {/* warm light in the doorway as it opens, fading as we go through */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 34% 30% at ${DCX}px ${DCY}px, rgba(199,171,119,0.42), transparent 70%)`,
          opacity: open * (1 - push),
        }}
      />
      {/* the wall with its doorway, the floor light and the door leaf, pushing past the camera */}
      <AbsoluteFill
        style={{
          transformOrigin: `${DCX}px ${DCY}px`,
          transform: `scale(${1 + 11 * push * push})`,
          opacity: 1 - ramp(frame, PUSH[1] - 14, PUSH[1]),
        }}
      >
        <svg width={1920} height={1080} style={{ position: "absolute" }}>
          <defs>
            <mask id="doorway">
              <rect width={1920} height={1080} fill="white" />
              <rect x={DW.x} y={DW.y} width={DW.w} height={DW.h} fill="black" />
            </mask>
            <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={palette.gold} stopOpacity={0.38} />
              <stop offset="1" stopColor={palette.gold} stopOpacity={0} />
            </linearGradient>
          </defs>
          <rect width={1920} height={1080} fill={palette.black} mask="url(#doorway)" />
          {/* the architrave and a step of floor */}
          <rect x={DW.x - 22} y={DW.y - 22} width={DW.w + 44} height={DW.h + 22} fill="none" stroke={palette.gold} strokeWidth={2} opacity={0.8} />
          <line x1={DW.x - 40} x2={DW.x + DW.w + 40} y1={DW.y - 40} y2={DW.y - 40} stroke={palette.gold} strokeWidth={2} opacity={0.6} />
          <line x1={DW.x - 420} x2={DW.x + DW.w + 420} y1={DW.y + DW.h} y2={DW.y + DW.h} stroke={palette.gold} strokeWidth={1} opacity={0.25} />
          <polygon
            points={`${DW.x},${DW.y + DW.h} ${DW.x + DW.w},${DW.y + DW.h} ${DW.x + DW.w + 150},1080 ${DW.x - 150},1080`}
            fill="url(#floor)"
            opacity={open}
          />
        </svg>
        <div style={{ position: "absolute", left: DW.x, top: DW.y, width: DW.w, height: DW.h, perspective: 1300 }}>
          <div
            style={{
              width: DW.w,
              height: DW.h,
              transformOrigin: "0% 50%",
              transform: `rotateY(${-104 * open}deg)`,
              boxShadow: `0 0 ${40 * open}px rgba(199,171,119,${0.25 * open})`,
            }}
          >
            <Leaf />
          </div>
        </div>
      </AbsoluteFill>
        </>
      )}
      {/* the headline, from frame one */}
      <div style={{ position: "absolute", top: 190, left: 130, width: 900, textAlign: "left", whiteSpace: "nowrap", opacity: noDoor ? ramp(frame, 96, 122) : 1 }}>
        <div style={{ display: "inline-block" }}>
          <div
            style={{
              fontFamily: sans,
              fontWeight: 700,
              fontSize: 46,
              letterSpacing: "0.04em",
              color: palette.gold,
            }}
          >
            CBHub
          </div>
          <div style={{ height: 2, background: palette.gold, marginTop: 10 }} />
        </div>
        <div style={{ fontFamily: serif, fontSize: 92, lineHeight: 1.05, color: palette.pale, marginTop: 30 }}>
          Opening the door
          <br />
          <span style={{ fontStyle: "italic" }}>to new markets</span>
        </div>
      </div>

      {/* the count, climbing as each market lights; then it steps aside for the second stat */}
      <div
        style={{
          position: "absolute",
          top: 540,
          left: 130,
          width: 640,
          textAlign: "left",
          opacity: countOn * (1 - swapOut),
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 130,
            lineHeight: 1,
            color: palette.gold,
            fontVariantNumeric: "lining-nums",
            transform: `scale(${1.12 - 0.12 * pop})`,
            transformOrigin: "left bottom",
          }}
        >
          {Math.max(1, count)}
        </div>
        <div style={{ fontFamily: serif, fontSize: 42, lineHeight: 1.15, color: palette.pale, marginTop: 8 }}>
          new strategic partnerships
          <br />
          this year
        </div>
      </div>
      {/* the two stats side by side, the last frame's still */}
      <div
        style={{
          position: "absolute",
          top: 540,
          left: 130,
          width: 760,
          display: "flex",
          justifyContent: "flex-start",
          gap: 90,
          alignItems: "flex-start",
          textAlign: "left",
          opacity: swap,
          transform: `translateY(${(1 - swap) * 18}px)`,
        }}
      >
        {[
          { n: "8", label: "new partnerships this year" },
          {
            n: `${Math.round(750000 * agentsCount).toLocaleString("en-GB")}${agentsCount >= 1 ? "+" : ""}`,
            label: "global travel agents",
          },
        ].map((st) => (
          <div key={st.label}>
            <div style={{ fontFamily: serif, fontSize: 116, lineHeight: 1, color: palette.gold, fontVariantNumeric: "lining-nums tabular-nums" }}>
              {st.n}
            </div>
            <div style={{ height: 1.5, width: 64, background: palette.gold, opacity: 0.6, margin: "18px 0 14px" }} />
            <div style={{ fontFamily: serif, fontSize: 34, color: palette.pale, whiteSpace: "nowrap" }}>{st.label}</div>
          </div>
        ))}
      </div>
      <Img
        src={staticFile("brand/cb-watermark.png")}
        style={{ position: "absolute", left: 1740, top: 912, width: 100, height: 108, opacity: logo }}
      />
      {/* the ending (Scott, 11 Nov: "maybe needs a logo and ending"): to black, then the official logo */}
      <AbsoluteFill style={{ backgroundColor: palette.black, opacity: ramp(frame, E, E + 22, Easing.inOut(Easing.cubic)) }} />
      {frame >= E + 16 ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <CBLogo start={E + 16} width={340} shimmerAt={E + 62} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
