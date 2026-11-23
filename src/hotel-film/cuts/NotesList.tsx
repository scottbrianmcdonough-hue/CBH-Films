import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { FilmFinish } from "../components/FilmFinish";
import { TikTokText, TT_TOP_CARD } from "../doodle/StickFlip";
import { colors, EASE_IN_OUT, progress, serif } from "../theme";
import { SaveSpec, spaList } from "./SaveList";

// The save for later list as a phone note (Scott, 23 Nov: "notepad"): a dark note in the phone's Notes look over
// the current hotel's footage, blurred, so there is real footage from frame one (never text on black). Each hotel
// is a line typed into the checklist; on the next beat the line opens to the full frame into that hotel's footage
// with its house label, and on its last beat the picture shrinks back into the line and the box ticks gold. The
// note ends fully ticked under the closing question. Same lists (SaveSpec) and track as SaveList.tsx.

const MUSIC = "music/prettyjohn1-event-music-595091.mp3";
const MUSIC_FROM = 6.27;
const BEAT = (60 / 152.2) * 30;
const b = (n: number) => Math.round(n * BEAT);
const UI = "Figtree"; // loaded by StickFlip with the TikTok captions
const FULL = 4; // beats each hotel holds the full frame
const PER = FULL + 2; // a beat to type the line, the full frame, a beat to shrink back and tick
export const notesFrames = (s: SaveSpec) => b(s.hotels.length * PER + s.endBeats);

// the note's geometry
const CX = 70, CY = 560, CW = 940, ROW = 118, LIST_Y = CY + 230;
const rowY = (i: number) => LIST_Y + i * ROW;
const title = (s: string) => s.toLowerCase().replace(/(^|[\s,])([a-z])/g, (m) => m.toUpperCase());

// the hotel's clips cut to FULL beats
const fullClips = (clips: [string, number][]) => {
  const out: [string, number][] = [];
  let left = FULL;
  for (const [c, n] of clips) {
    if (left <= 0) break;
    out.push([c, Math.min(n, left)]);
    left -= n;
  }
  if (left > 0) out[out.length - 1][1] += left;
  return out;
};

const Label: React.FC<{ place: string; name: string; o: number }> = ({ place, name, o }) => (
  <AbsoluteFill style={{ opacity: o }}>
    <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(9,9,10,0) 54%, rgba(9,9,10,0.6) 76%, rgba(9,9,10,0.3) 100%)" }} />
    <div style={{ position: "absolute", left: 72, bottom: 480 }}>
      <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 28, letterSpacing: "0.24em", color: colors.gold }}>{place}</div>
      <div style={{ fontFamily: serif, fontSize: 68, lineHeight: 1.08, marginTop: 12, color: colors.cream, whiteSpace: "pre-line" }}>{name}</div>
    </div>
  </AbsoluteFill>
);

const Box: React.FC<{ tick: number }> = ({ tick }) => (
  <svg width={54} height={54} viewBox="0 0 54 54">
    <circle cx={27} cy={27} r={23} fill={colors.gold} fillOpacity={tick} stroke={tick > 0 ? colors.gold : "rgba(255,255,255,0.45)"} strokeWidth={3} />
    <path d="M16 28 L24 36 L39 19" fill="none" stroke="#09090a" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round"
      strokeDasharray={40} strokeDashoffset={40 * (1 - tick)} />
  </svg>
);

export const NotesList: React.FC<{ spec?: SaveSpec }> = ({ spec = spaList }) => {
  const frame = useCurrentFrame();
  const total = notesFrames(spec);
  const n = spec.hotels.length;
  const endAt = b(n * PER);
  return (
    <AbsoluteFill style={{ background: "#09090a" }}>
      {/* the current hotel's footage, blurred, under the note */}
      {spec.hotels.map((h, i) => (
        <Sequence key={`bg-${h.name}`} from={b(i * PER)} durationInFrames={i === n - 1 ? total - b(i * PER) : b(PER)}>
          <AbsoluteFill style={{ filter: "blur(34px) brightness(0.55) saturate(1.1)", transform: "scale(1.15)" }}>
            <OffthreadVideo src={staticFile(`${h.clips[0][0]}.mp4`)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </AbsoluteFill>
        </Sequence>
      ))}
      {/* the note */}
      <div style={{ position: "absolute", left: CX, top: CY, width: CW, height: LIST_Y - CY + n * ROW + 50, borderRadius: 34,
        background: "rgba(18,18,20,0.86)", boxShadow: "0 30px 80px rgba(0,0,0,0.45)" }}>
        <div style={{ position: "absolute", left: 50, top: 50, fontFamily: UI, fontWeight: 700, fontSize: 64, color: "#fff" }}>{spec.collection.toLowerCase()}</div>
        <div style={{ position: "absolute", left: 50, top: 140, fontFamily: UI, fontWeight: 700, fontSize: 28, color: "rgba(255,255,255,0.45)" }}>
          {`${n} places to book`}
        </div>
      </div>
      {spec.hotels.map((h, i) => {
        const at = b(i * PER);
        const typed = Math.max(0, Math.min(1, (frame - at) / (b(1) - 2)));
        if (frame < at) return null;
        const text = `${h.name.split("\n")[0]}, ${title(h.place)}`;
        const tick = progress(frame, b(i * PER + PER - 1) + 6, 6);
        return (
          <div key={h.name} style={{ position: "absolute", left: CX + 46, top: rowY(i), display: "flex", alignItems: "center", gap: 26 }}>
            <Box tick={tick} />
            <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 44, color: tick > 0.5 ? "rgba(255,255,255,0.55)" : "#fff" }}>
              {text.slice(0, Math.ceil(text.length * typed))}
              {typed < 1 && frame % 16 < 10 ? <span style={{ color: colors.gold }}>|</span> : null}
            </div>
          </div>
        );
      })}
      {/* each hotel opens out of its line into the full frame, then shrinks back */}
      {spec.hotels.map((h, i) => {
        const open = b(i * PER + 1), close = b(i * PER + PER - 1);
        if (frame < open || frame >= close + 8) return null;
        const g = frame < close ? EASE_IN_OUT(Math.min(1, (frame - open) / 9)) : 1 - EASE_IN_OUT(Math.min(1, (frame - close) / 8));
        const x = interpolate(g, [0, 1], [CX + 46, 0]), y = interpolate(g, [0, 1], [rowY(i) - 10, 0]);
        const w = interpolate(g, [0, 1], [CW - 92, 1080]), hgt = interpolate(g, [0, 1], [74, 1920]);
        const clips = fullClips(h.clips);
        let from = open;
        return (
          <div key={`full-${h.name}`} style={{ position: "absolute", left: x, top: y, width: w, height: hgt, overflow: "hidden",
            borderRadius: interpolate(g, [0, 1], [18, 0]) }}>
            <div style={{ position: "absolute", left: (w - 1080) / 2, top: (hgt - 1920) / 2, width: 1080, height: 1920 }}>
              {clips.map(([c, nb], k) => {
                const f0 = from;
                from = k === clips.length - 1 ? close + 8 : from + b(nb);
                return frame >= f0 && frame < from ? (
                  <Sequence key={c} from={f0} durationInFrames={from - f0} layout="none">
                    <OffthreadVideo src={staticFile(`${c}.mp4`)} muted style={{ width: 1080, height: 1920, objectFit: "cover" }} />
                  </Sequence>
                ) : null;
              })}
              <Label place={h.place} name={h.name} o={progress(frame, open + 8, 6) * (1 - progress(frame, close - 6, 6))} />
            </div>
          </div>
        );
      })}
      <Audio src={staticFile(MUSIC)} trimBefore={Math.round(MUSIC_FROM * 30)}
        volume={(v) => interpolate(v, [0, 4, total - 18, total], [0, 1, 1, 0], { extrapolateRight: "clamp" })} />
      <FilmFinish />
      {/* the hook from frame one, held over the first hotel's footage */}
      <Sequence durationInFrames={b(PER - 1) - 4} layout="none">
        <TikTokText lines={spec.hook} top={TT_TOP_CARD} left={140} still />
      </Sequence>
      <Sequence from={endAt + b(1)} layout="none">
        <TikTokText lines={spec.question} top={TT_TOP_CARD} left={140} />
      </Sequence>
    </AbsoluteFill>
  );
};
