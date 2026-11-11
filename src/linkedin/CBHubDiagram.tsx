import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";
import { palette, sans, serif } from "../hotel-film/theme";
import { CBLogo } from "../hotel-film/components/CBLogo";

// The CBHUB on LinkedIn, after Phill's diagram ("CB - Distribution Ecosystem - 2026", 11 Nov: "the CBHub refers to the
// Aven/SynXis platform that we use to connect hotels to GDS channels"; Scott: "rework the animation so it's like Phill's
// diagram"). 16:9, the diagram redrawn in the house look (gold line on black, the new palette's core colours): it draws
// itself, the parts outside the hub stay faint (OTA, Book Direct, RFP Tool, Media Hub), the hotel lights, a pulse runs
// through the channel manager into the CBHUB, which glows, and on down to the GDS, IDS and Channel Connect and the partners
// beyond; light keeps flowing as the stats come in (8 new partnerships, 750,000+ global travel agents from the membership
// page), then the logo. All text above the bottom quarter (LinkedIn's player bar).

export const CBHUB_DIAGRAM_FRAMES = 540;
const END = 426;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (f: number, a: number, b: number, e = Easing.out(Easing.cubic)) =>
  interpolate(f, [a, b], [0, 1], { ...clamp, easing: e });

type Box = { id: string; x: number; y: number; w: number; h: number; lines: string[]; at: number; faint?: boolean };
const BOXES: Box[] = [
  { id: "ota", x: 420, y: 300, w: 130, h: 60, lines: ["OTA"], at: 30, faint: true },
  { id: "direct", x: 570, y: 300, w: 150, h: 60, lines: ["Book Direct"], at: 34, faint: true },
  { id: "hotel", x: 120, y: 430, w: 210, h: 100, lines: ["Your hotel"], at: 10 },
  { id: "cm", x: 420, y: 430, w: 300, h: 100, lines: ["Channel", "manager"], at: 18 },
  { id: "hub", x: 840, y: 400, w: 340, h: 160, lines: [], at: 26 },
  { id: "rfp", x: 1310, y: 410, w: 210, h: 56, lines: ["RFP Tool"], at: 38, faint: true },
  { id: "media", x: 1310, y: 494, w: 210, h: 56, lines: ["Media Hub"], at: 42, faint: true },
  { id: "gds", x: 770, y: 640, w: 150, h: 60, lines: ["GDS"], at: 46 },
  { id: "ids", x: 935, y: 640, w: 150, h: 60, lines: ["IDS"], at: 50 },
  { id: "cc", x: 1100, y: 640, w: 230, h: 60, lines: ["Channel Connect"], at: 54 },
  { id: "partners", x: 640, y: 760, w: 820, h: 54, lines: ["Strategic agency partners, global consortia and channel partners"], at: 60 },
];
const B = Object.fromEntries(BOXES.map((b) => [b.id, b]));

type Pt = [number, number];
type Line = { pts: Pt[]; at: number; faint?: boolean; dotted?: boolean };
const HUB = B.hub;
const hubBottom: Pt = [HUB.x + HUB.w / 2, HUB.y + HUB.h];
const mid = (b: Box): number => b.x + b.w / 2;
const LINES: Record<string, Line> = {
  hotelCm: { pts: [[330, 480], [420, 480]], at: 20 },
  cmHub: { pts: [[720, 480], [840, 480]], at: 28 },
  cmOta: { pts: [[485, 430], [485, 360]], at: 36, faint: true },
  cmDirect: { pts: [[645, 430], [645, 360]], at: 38, faint: true },
  hubRfp: { pts: [[1180, 438], [1310, 438]], at: 42, faint: true },
  hubMedia: { pts: [[1180, 522], [1310, 522]], at: 44, faint: true },
  hubGds: { pts: [hubBottom, [hubBottom[0], 605], [mid(B.gds), 605], [mid(B.gds), 640]], at: 48 },
  hubIds: { pts: [hubBottom, [hubBottom[0], 605], [mid(B.ids), 605], [mid(B.ids), 640]], at: 48 },
  hubCc: { pts: [hubBottom, [hubBottom[0], 605], [mid(B.cc), 605], [mid(B.cc), 640]], at: 48 },
  gdsP: { pts: [[mid(B.gds), 700], [mid(B.gds), 760]], at: 58, dotted: true },
  idsP: { pts: [[mid(B.ids), 700], [mid(B.ids), 760]], at: 58, dotted: true },
  ccP: { pts: [[mid(B.cc), 700], [mid(B.cc), 760]], at: 58, dotted: true },
};
const ptsD = (p: Pt[]) => "M " + p.map((q) => q.join(" ")).join(" L ");
const along = (p: Pt[], t: number): Pt => {
  const seg = p.slice(1).map((q, i) => Math.hypot(q[0] - p[i][0], q[1] - p[i][1]));
  const total = seg.reduce((a, b) => a + b, 0);
  let d = t * total;
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i] || i === seg.length - 1) {
      const u = seg[i] ? Math.min(1, d / seg[i]) : 0;
      return [p[i][0] + (p[i + 1][0] - p[i][0]) * u, p[i][1] + (p[i + 1][1] - p[i][1]) * u];
    }
    d -= seg[i];
  }
  return p[p.length - 1];
};

// the flow: the hotel lights, the pulse reaches the hub, the hub lights, then out to the channels and partners
const HOTEL_ON = 76;
const TO_HUB = [84, 118] as const;
const HUB_ON = 118;
const TO_CH = [132, 160] as const;
const CH_ON = 160;
const TO_P = [166, 184] as const;
const P_ON = 184;
const STAT1 = 206; // 8 new strategic partnerships, ticking
const STAT2 = 300; // 750,000+ global travel agents
const TICKS = Array.from({ length: 8 }, (_, i) => STAT1 + 10 + i * 9);
// light keeps flowing from the hotel to the partners once the route is lit
const ROUTES = [
  [LINES.hotelCm, LINES.cmHub, LINES.hubGds, LINES.gdsP],
  [LINES.hotelCm, LINES.cmHub, LINES.hubIds, LINES.idsP],
  [LINES.hotelCm, LINES.cmHub, LINES.hubCc, LINES.ccP],
].map((ls) => ls.flatMap((l, i) => (i ? l.pts.slice(1) : l.pts)) as Pt[]);

const NodeBox: React.FC<{ b: Box; frame: number; lit: number }> = ({ b, frame, lit }) => {
  const draw = ramp(frame, b.at, b.at + 22, Easing.inOut(Easing.cubic));
  const op = b.faint ? 0.38 : 1;
  const per = 2 * (b.w + b.h);
  return (
    <g opacity={op}>
      <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={8} fill="none" stroke={palette.gold} strokeWidth={1} opacity={0.16} />
      <rect
        x={b.x}
        y={b.y}
        width={b.w}
        height={b.h}
        rx={8}
        fill={b.id === "hotel" ? palette.gold : "#0b0a09"}
        fillOpacity={b.id === "hotel" ? lit : draw}
        stroke={palette.gold}
        strokeWidth={b.id === "hub" ? 2.4 : 1.6}
        strokeDasharray={per}
        strokeDashoffset={per * (1 - draw)}
      />
    </g>
  );
};

export const CBHubDiagram: React.FC<{ act?: boolean }> = ({ act }) => {
  const frame = useCurrentFrame();
  const hotelLit = ramp(frame, HOTEL_ON, HOTEL_ON + 12);
  const hubLit = ramp(frame, HUB_ON, HUB_ON + 14);
  const chLit = ramp(frame, CH_ON, CH_ON + 12);
  const pLit = ramp(frame, P_ON, P_ON + 14);
  const count = TICKS.filter((t) => frame >= t).length;
  const last = TICKS.filter((t) => frame >= t).pop() ?? -99;
  const pop = ramp(frame, last, last + 10, Easing.out(Easing.back(2)));
  const s1 = ramp(frame, STAT1, STAT1 + 16);
  const s2 = ramp(frame, STAT2, STAT2 + 16);
  const agents = ramp(frame, STAT2 + 4, STAT2 + 64, Easing.out(Easing.cubic));
  const end = ramp(frame, END, END + 22, Easing.inOut(Easing.cubic));
  const labelOn = (b: Box) => ramp(frame, b.at + 12, b.at + 26);

  // a moving pulse along a route between two times
  const pulse = (p: Pt[], a: number, b: number) => {
    if (frame < a || frame > b + 6) return null;
    const t = ramp(frame, a, b, Easing.inOut(Easing.quad));
    const [x, y] = along(p, t);
    return <circle cx={x} cy={y} r={6} fill={palette.pale} />;
  };

  return (
    <AbsoluteFill style={{ backgroundColor: palette.black }}>
      {act ? null : <Audio src={staticFile("campaigns/global-hub/sound-diagram.wav")} volume={0.75} />}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 34% 40% at ${(HUB.x + HUB.w / 2) / 19.2}% ${(HUB.y + HUB.h / 2) / 10.8}%, rgba(199,171,119,${0.05 + 0.13 * hubLit}), transparent 72%)`,
        }}
      />
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <defs>
          <radialGradient id="hubglow">
            <stop offset="0" stopColor={palette.gold} stopOpacity={0.5} />
            <stop offset="1" stopColor={palette.gold} stopOpacity={0} />
          </radialGradient>
        </defs>
        {/* the connectors drawing in, the hub's path brightening as the flow passes */}
        {Object.entries(LINES).map(([k, l]) => {
          const d = ramp(frame, l.at, l.at + 18, Easing.inOut(Easing.cubic));
          const len = l.pts.slice(1).reduce((a, q, i) => a + Math.hypot(q[0] - l.pts[i][0], q[1] - l.pts[i][1]), 0);
          const lit = k.startsWith("hotel") || k === "cmHub" ? hotelLit : k.startsWith("hub") && !l.faint ? chLit : l.dotted ? pLit : 0;
          return (
            <path
              key={k}
              d={ptsD(l.pts)}
              fill="none"
              stroke={palette.gold}
              strokeWidth={1.6 + 1.2 * lit}
              strokeLinejoin="round"
              strokeDasharray={l.dotted ? "2 7" : `${len}`}
              strokeDashoffset={l.dotted ? 0 : len * (1 - d)}
              opacity={(l.faint ? 0.32 : 0.55 + 0.45 * lit) * (l.dotted ? d : 1)}
            />
          );
        })}
        {/* the hub's glow */}
        <circle cx={HUB.x + HUB.w / 2} cy={HUB.y + HUB.h / 2} r={260 * hubLit} fill="url(#hubglow)" opacity={0.55} />
        {BOXES.map((b) => (
          <NodeBox key={b.id} b={b} frame={frame} lit={b.id === "hotel" ? hotelLit : 0} />
        ))}
        {/* the channels and partners lighting */}
        {["gds", "ids", "cc"].map((id) => (
          <rect key={id} x={B[id].x} y={B[id].y} width={B[id].w} height={B[id].h} rx={8} fill={palette.gold} opacity={0.14 * chLit} />
        ))}
        <rect x={B.partners.x} y={B.partners.y} width={B.partners.w} height={B.partners.h} rx={8} fill={palette.gold} opacity={0.12 * pLit} />
        {/* the first flow, then light that keeps on flowing */}
        {pulse([...LINES.hotelCm.pts, ...LINES.cmHub.pts.slice(1)], TO_HUB[0], TO_HUB[1])}
        {[LINES.hubGds, LINES.hubIds, LINES.hubCc].map((l, i) => (
          <React.Fragment key={i}>{pulse(l.pts, TO_CH[0], TO_CH[1])}</React.Fragment>
        ))}
        {[LINES.gdsP, LINES.idsP, LINES.ccP].map((l, i) => (
          <React.Fragment key={i}>{pulse(l.pts, TO_P[0], TO_P[1])}</React.Fragment>
        ))}
        {frame > P_ON
          ? ROUTES.flatMap((r, i) =>
              [0, 1].map((j) => {
                const period = 84;
                const k = ((frame - P_ON + i * 28 + j * 42) % period) / period;
                const [x, y] = along(r, k);
                return <circle key={`${i}-${j}`} cx={x} cy={y} r={3.6} fill={palette.pale} opacity={Math.sin(Math.PI * k) * 0.9} />;
              }),
            )
          : null}
      </svg>

      {/* the box labels */}
      {BOXES.filter((b) => b.id !== "hub").map((b) => (
        <div
          key={b.id}
          style={{
            position: "absolute",
            left: b.x,
            top: b.y,
            width: b.w,
            height: b.h,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: sans,
            fontWeight: b.id === "hotel" ? 700 : 500,
            fontSize: b.id === "partners" ? 22 : b.faint ? 21 : 25,
            lineHeight: 1.15,
            color: b.id === "hotel" && hotelLit > 0.5 ? palette.black : palette.pale,
            opacity: labelOn(b) * (b.faint ? 0.45 : 1),
            textAlign: "center",
          }}
        >
          {b.lines.map((l) => (
            <div key={l}>{l}</div>
          ))}
        </div>
      ))}
      {/* the hub: CBHUB in bold gold caps, what it is beneath */}
      <div
        style={{
          position: "absolute",
          left: HUB.x,
          top: HUB.y,
          width: HUB.w,
          height: HUB.h,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: labelOn(HUB),
          transform: `scale(${1 + 0.05 * Math.sin(Math.PI * hubLit)})`,
        }}
      >
        <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 52, letterSpacing: "0.04em", color: palette.gold }}>CBHUB</div>
        <div style={{ fontFamily: sans, fontSize: 21, color: palette.pale, opacity: 0.85, marginTop: 4 }}>Central distribution hub</div>
      </div>

      {/* the headline, from frame one (in the story it gives way before the push to the map) */}
      <div style={{ position: "absolute", top: 96, left: 120, opacity: act ? 1 - ramp(frame, 204, 220) : 1 }}>
        <div style={{ fontFamily: serif, fontSize: 84, lineHeight: 1.04, color: palette.pale }}>
          Opening the door <span style={{ fontStyle: "italic" }}>to new markets</span>
        </div>
      </div>

      {act ? null : (
        <>
      {/* the stats, right of the diagram */}
      <div style={{ position: "absolute", left: 1530, top: 600, width: 330 }}>
        <div style={{ opacity: s1, transform: `translateY(${(1 - s1) * 16}px)` }}>
          <div
            style={{
              fontFamily: serif,
              fontSize: 96,
              lineHeight: 1,
              color: palette.gold,
              fontVariantNumeric: "lining-nums",
              transform: `scale(${1.1 - 0.1 * pop})`,
              transformOrigin: "left bottom",
            }}
          >
            {Math.max(1, count)}
          </div>
          <div style={{ fontFamily: serif, fontSize: 30, color: palette.pale, marginTop: 4 }}>new partnerships this year</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 1530, top: 300, width: 360, opacity: s2, transform: `translateY(${(1 - s2) * 16}px)` }}>
        <div style={{ fontFamily: serif, fontSize: 96, lineHeight: 1, color: palette.gold, fontVariantNumeric: "lining-nums tabular-nums" }}>
          {Math.round(750000 * agents).toLocaleString("en-GB")}
          {agents >= 1 ? "+" : ""}
        </div>
        <div style={{ fontFamily: serif, fontSize: 30, color: palette.pale, marginTop: 4 }}>global travel agents</div>
      </div>

        </>
      )}
      {act ? null : (
        <>
      {/* the ending: to black, then the official logo */}
      <AbsoluteFill style={{ backgroundColor: palette.black, opacity: end }} />
      {frame >= END + 16 ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <CBLogo start={END + 16} width={340} shimmerAt={END + 62} />
        </AbsoluteFill>
      ) : null}
        </>
      )}
    </AbsoluteFill>
  );
};

export const CBHUB_TICKS = TICKS;
export const PARTNERS_BOX = B.partners;
export const PARTNERS_ON = P_ON;
