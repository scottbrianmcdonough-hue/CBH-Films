import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { FilmFinish } from "../components/FilmFinish";
import { TikTokText } from "../doodle/StickFlip";
import { colors, EASE_IN_OUT, progress, sans, serif } from "../theme";

// The event ticket (Scott, 16 Nov: TikTok tie-ins to "sports events and music events where our hotels are"; the
// stick figure "been done though"): an event ticket fills the frame under a TikTok text hook, flips over on the
// beat and its back is the hotel's room key, the hotel's photo in the card's window (a frame within a frame);
// the window opens to the full frame for the hotel's shots on hard beat cuts, shuts back into the card, and the
// ticket and the key end side by side. Any event, any hotel: the spec is data. No event logos or footage, the
// ticket is a generic one of ours.

const W = 1080;
const H = 1920;

export type TicketSpec = {
  ticket: { kicker: string; title: string; venue: string; details: [string, string][]; chequered?: boolean };
  key: { place: string; name: string; line: string };
  hook: string[];
  ask: string[];
  answer: string[];
  last: string[]; // over the last shot
  end: string[];
  shots: { src: string; pos?: string; beats: number }[];
  music: { src: string; from: number; bpm: number };
};

// the card: a ticket with a notch each side at the perforation
const CW = 720;
const CH = 1080;
const CX = (W - CW) / 2;
const CY = 440;
const PERF = 790;
const WIN = { x: 40, y: 40, w: 640, h: 700, r: 20 };
const cardPath = (() => {
  const r = 36;
  const n = 26;
  return `M${r} 0 H${CW - r} A${r} ${r} 0 0 1 ${CW} ${r} V${PERF - n} A${n} ${n} 0 0 0 ${CW} ${PERF + n} V${CH - r} A${r} ${r} 0 0 1 ${CW - r} ${CH} H${r} A${r} ${r} 0 0 1 0 ${CH - r} V${PERF + n} A${n} ${n} 0 0 0 0 ${PERF - n} V${r} A${r} ${r} 0 0 1 ${r} 0 Z`;
})();
const INK = "#141412";
const rnd = (n: number) => {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
};

const Front: React.FC<{ t: TicketSpec["ticket"] }> = ({ t }) => (
  <div style={{ position: "absolute", width: CW, height: CH }}>
    <svg width={CW} height={CH} style={{ position: "absolute" }}>
      <clipPath id="ticket-shape"><path d={cardPath} /></clipPath>
      <g clipPath="url(#ticket-shape)">
        <rect width={CW} height={CH} fill={colors.cream} />
        {t.chequered
          ? Array.from({ length: 24 }, (_, k) => {
              const col = k % 12;
              const row = Math.floor(k / 12);
              return (col + row) % 2 === 0 ? <rect key={k} x={col * 60} y={row * 60} width={60} height={60} fill={INK} /> : null;
            })
          : <rect width={CW} height={120} fill={INK} />}
        {/* the barcode on the stub */}
        {(() => {
          let x = 60;
          const bars: React.ReactNode[] = [];
          for (let k = 0; x < 430; k++) {
            const w = 3 + Math.floor(rnd(k + 3) * 4) * 3;
            if (k % 2 === 0) bars.push(<rect key={k} x={x} y={PERF + 70} width={w} height={150} fill={INK} />);
            x += w;
          }
          return bars;
        })()}
        <line x1={34} y1={PERF} x2={CW - 34} y2={PERF} stroke={INK} strokeWidth={3} strokeDasharray="4 14" strokeLinecap="round" opacity={0.55} />
      </g>
    </svg>
    <div style={{ position: "absolute", top: 176, width: CW, textAlign: "center", color: INK }}>
      <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 26, letterSpacing: "0.34em", color: "#9A7A36" }}>{t.kicker}</div>
      <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 168, lineHeight: 1, marginTop: 26 }}>{t.title}</div>
      <div style={{ width: 96, height: 3, background: "#9A7A36", margin: "34px auto 0" }} />
      <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 40, letterSpacing: "0.3em", marginTop: 34, paddingLeft: "0.3em" }}>{t.venue}</div>
    </div>
    <div style={{ position: "absolute", top: 592, left: 70, width: CW - 140, display: "flex", justifyContent: "space-between", color: INK }}>
      {t.details.map(([k, v]) => (
        <div key={k} style={{ textAlign: "center", minWidth: 120 }}>
          <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 20, letterSpacing: "0.26em", color: "#9A7A36" }}>{k}</div>
          <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 76, lineHeight: 1.1 }}>{v}</div>
        </div>
      ))}
    </div>
    <div style={{ position: "absolute", top: PERF + 96, right: 64, textAlign: "right", color: INK }}>
      <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 20, letterSpacing: "0.26em", color: "#9A7A36" }}>ADMIT</div>
      <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 84, lineHeight: 1 }}>One</div>
    </div>
  </div>
);

const Back: React.FC<{ k: TicketSpec["key"]; photo: React.ReactNode }> = ({ k, photo }) => (
  <div style={{ position: "absolute", width: CW, height: CH, transform: "rotateY(180deg)" }}>
    <svg width={CW} height={CH} style={{ position: "absolute" }}>
      <path d={cardPath} fill="#151513" stroke={colors.gold} strokeWidth={3} />
      <line x1={34} y1={PERF} x2={CW - 34} y2={PERF} stroke={colors.gold} strokeWidth={3} strokeDasharray="4 14" strokeLinecap="round" opacity={0.6} />
    </svg>
    <div style={{ position: "absolute", left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h, borderRadius: WIN.r, overflow: "hidden", background: "#000" }}>{photo}</div>
    <div style={{ position: "absolute", top: PERF + 50, left: 56, right: 56 }}>
      <div style={{ display: "inline-block" }}>
        <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 24, letterSpacing: "0.24em", color: colors.gold }}>{k.place}</div>
        <div style={{ height: 2, marginTop: 10, background: colors.gold }} />
      </div>
      <div style={{ fontFamily: serif, fontSize: 80, lineHeight: 1.05, marginTop: 12, color: colors.cream }}>{k.name}</div>
      <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 21, letterSpacing: "0.2em", marginTop: 16, color: colors.cream, opacity: 0.8 }}>{k.line}</div>
    </div>
    <Img src={staticFile("brand/cb-watermark.png")} style={{ position: "absolute", right: 50, top: 66 + WIN.h - 110, width: 56, height: 60, opacity: 0.9 }} />
  </div>
);

const Photo: React.FC<{ src: string; pos?: string; from: number; len: number }> = ({ src, pos, from, len }) => {
  const frame = useCurrentFrame();
  const s = interpolate(frame, [from, from + len], [1.02, 1.09]);
  return <Img src={staticFile(src)} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", objectPosition: pos ?? "50% 50%", transform: `scale(${s})` }} />;
};

export const ticketFrames = (spec: TicketSpec) => Math.round((END_AT(spec) + 7) * (1800 / spec.music.bpm));
const OPEN = 12; // the beat the window opens on
const END_AT = (spec: TicketSpec) => OPEN + spec.shots.reduce((n, s) => n + s.beats, 0);

export const EventTicket: React.FC<{ spec: TicketSpec }> = ({ spec }) => {
  const frame = useCurrentFrame();
  const B = 1800 / spec.music.bpm; // frames a beat
  const b = (n: number) => Math.round(n * B);
  const shut = END_AT(spec);
  const frames = ticketFrames(spec);

  // which shot is up
  let at = OPEN;
  const cuts = spec.shots.map((s) => {
    const from = b(at);
    at += s.beats;
    return { ...s, from, len: b(at) - from };
  });
  const cur = [...cuts].reverse().find((c) => frame >= c.from) ?? cuts[0];
  const last = cuts[cuts.length - 1];

  // the card: a slight lean, a nudge on each beat, the flip on beat 8, the pair at the end
  const flip = progress(frame, b(8) - 6, 18, EASE_IN_OUT);
  const pulse = frame < b(OPEN) ? 0.014 * Math.exp(-(((frame % B) + B) % B) / 4) : 0;
  const pair = progress(frame, b(shut + 1), 16);
  const lean = -4 * (1 - flip);
  const cardStyle = (side: "key" | "ticket"): React.CSSProperties => ({
    position: "absolute", left: CX, top: CY, width: CW, height: CH, transformStyle: "preserve-3d",
    transform:
      side === "key"
        ? `translate(${150 * pair}px, ${-30 * pair}px) rotate(${lean + 7 * pair}deg) scale(${(1 + pulse + 0.06 * Math.sin(Math.PI * flip)) * (1 - 0.2 * pair)}) rotateY(${180 * flip}deg)`
        : `translate(${-150 * pair}px, ${30 * pair}px) rotate(${-9 * pair}deg) scale(${0.8})`,
  });

  // the window opening to the full frame and shutting back
  const open = progress(frame, b(OPEN) - 2, 14, EASE_IN_OUT) * (1 - progress(frame, b(shut) - 2, 14, EASE_IN_OUT));
  const mixv = (a: number, c: number) => a + (c - a) * open;
  const full = frame >= b(OPEN) - 2 && frame < b(shut) + 12;
  const label = progress(frame, b(OPEN) + 12, 12) * (1 - progress(frame, cuts[0].from + cuts[0].len - 8, 8));

  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 50% at 50% 52%, #1d1c19 0%, #09090A 100%)" }} />
      <AbsoluteFill style={{ perspective: 2200 }}>
        {/* the ticket again, behind the key, for the end */}
        {pair > 0 ? (
          <div style={{ ...cardStyle("ticket"), opacity: Math.min(1, pair * 3), filter: "drop-shadow(0 24px 40px rgba(0,0,0,0.6))" }}>
            <Front t={spec.ticket} />
          </div>
        ) : null}
        <div style={{ ...cardStyle("key"), filter: "drop-shadow(0 30px 50px rgba(0,0,0,0.65))" }}>
          {flip < 0.5 ? <Front t={spec.ticket} /> : null}
          {flip < 0.5 ? null : <Back k={spec.key} photo={<Photo src={(frame >= b(shut) ? last : cuts[0]).src} pos={(frame >= b(shut) ? last : cuts[0]).pos} from={frame >= b(shut) ? last.from : b(8)} len={frame >= b(shut) ? last.len + 40 : b(OPEN) - b(8) + cuts[0].len} />} />}
        </div>
      </AbsoluteFill>
      {/* the window, grown to the frame */}
      {full ? (
        <div style={{ position: "absolute", left: mixv(CX + (CW - WIN.x - WIN.w), 0), top: mixv(CY + WIN.y, 0), width: mixv(WIN.w, W), height: mixv(WIN.h, H),
          borderRadius: mixv(WIN.r, 0), overflow: "hidden", background: "#000" }}>
          <Photo key={cur.src} src={cur.src} pos={cur.pos} from={cur === cuts[0] ? b(8) : cur.from} len={cur === cuts[0] ? b(OPEN) - b(8) + cur.len : cur === last ? cur.len + 40 : cur.len} />
          <AbsoluteFill style={{ opacity: label }}>
            <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(9,9,10,0) 52%, rgba(9,9,10,0.6) 74%, rgba(9,9,10,0.3) 100%)" }} />
            <div style={{ position: "absolute", left: 72, bottom: 500 }}>
              <div style={{ display: "inline-block" }}>
                <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 28, letterSpacing: "0.24em", color: colors.gold }}>{spec.key.place}</div>
                <div style={{ height: 2, marginTop: 12, background: colors.gold }} />
              </div>
              <div style={{ fontFamily: serif, fontSize: 72, lineHeight: 1.1, marginTop: 14, color: colors.cream }}>{spec.key.name}</div>
            </div>
          </AbsoluteFill>
        </div>
      ) : null}
      <Audio src={staticFile(spec.music.src)} trimBefore={Math.round(spec.music.from * 30)}
        volume={(v) => interpolate(v, [0, 5, frames - 20, frames], [0, 1, 1, 0], { extrapolateRight: "clamp" })} />
      <FilmFinish />
      {/* TikTok's own caption look, top third */}
      <Sequence durationInFrames={b(4)} layout="none">
        <TikTokText lines={spec.hook} top={196} left={140} out={b(4) - 5} still />
      </Sequence>
      <Sequence from={b(4)} durationInFrames={b(4)} layout="none">
        <TikTokText lines={spec.ask} top={196} left={140} out={b(4) - 5} />
      </Sequence>
      <Sequence from={b(8) + 6} durationInFrames={b(4) - 8} layout="none">
        <TikTokText lines={spec.answer} top={196} left={140} out={b(4) - 13} />
      </Sequence>
      <Sequence from={last.from + 4} durationInFrames={last.len - 4} layout="none">
        <TikTokText lines={spec.last} top={420} left={140} out={last.len - 10} />
      </Sequence>
      <Sequence from={b(shut + 1) + 8} layout="none">
        <TikTokText lines={spec.end} top={236} left={140} />
      </Sequence>
    </AbsoluteFill>
  );
};

const WP = "hotels/whittlebury-park";
export const whittleburyRaceTicket: TicketSpec = {
  ticket: { kicker: "A DAY AT THE TRACK", title: "Sunday", venue: "SILVERSTONE", details: [["GATE", "4"], ["ROW", "12"], ["SEAT", "7"]], chequered: true },
  key: { place: "NORTHAMPTONSHIRE", name: "Whittlebury Park", line: "NEXT DOOR TO THE CIRCUIT" },
  hook: ["POV: you\u2019re off", "to Silverstone"],
  ask: ["now where are", "you sleeping?"],
  answer: ["flip it over"],
  last: ["and no drive home"],
  end: ["Silverstone: sorted"],
  shots: [
    { src: `${WP}/exterior.jpg`, pos: "33% 50%", beats: 4 },
    { src: `${WP}/pool.jpg`, pos: "49% 50%", beats: 4 },
    { src: `${WP}/spa-pool.jpg`, pos: "58% 50%", beats: 2 },
    { src: `${WP}/murrays-dish-2x.jpg`, pos: "62% 50%", beats: 2 },
    { src: `${WP}/room.jpg`, pos: "40% 50%", beats: 4 },
  ],
  // Not only the big race weekend (Scott: those tickets are hard to get): the words fit any day at the circuit.
  // Tech House vibes (Mixkit 130), 122 BPM, beat 0 at 0.087s: the film's beat 12 (the window opening) on the
  // track's lift at its beat 64
  music: { src: "music/mixkit-tech-house-vibes-130.mp3", from: 0.0873 + 52 * 0.49183, bpm: 121.994 },
};
