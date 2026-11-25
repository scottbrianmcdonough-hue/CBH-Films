import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { TikTokText, TT_TOP } from "../doodle/StickFlip";
import { colors, progress, sans, serif } from "../theme";

// TikTok shorts on the plan's two rules (Scott, 25 Nov: "start building some like this", the explainer's phones): one
// hotel's real footage full frame on hard beat cuts, a hook on frame one, the house label once, and the close: a
// question, then "follow for more stays" in the same caption style (a Follow button mock was dropped). Event Music (steady, 152 BPM) so a trending
// sound can go over it in the app. No logo: the label is the brand.

export type PovShot = { clip: string; beats: number; from?: number };
// `label: false` leaves the house label off (Scott, 25 Nov: the hotel is tagged in the post instead); `music` swaps the
// track (Scott: "I don't like the track", "Bianca won't like it": Event Music is only the default for the first two)
export type PovMusic = { src: string; from: number; bpm: number };
export type PovSpec = {
  hook: [string, string]; place: string; name: string; shots: PovShot[]; question: [string, string];
  label?: boolean; music?: PovMusic;
};

const EVENT_MUSIC: PovMusic = { src: "music/prettyjohn1-event-music-595091.mp3", from: 6.27, bpm: 152.2 };
// Rich Enough (Instrumental), pietix, Pixabay 510327: Scott's pick for Bianca on cbh-screens; from its full drop
export const RICH_ENOUGH: PovMusic = { src: "stings/screens/rich-enough.mp3", from: 142.496, bpm: 112.5 };
const beatOf = (spec: PovSpec) => (60 / (spec.music ?? EVENT_MUSIC).bpm) * 30;
const sum = (s: PovShot[]) => s.reduce((t, x) => t + x.beats, 0);
export const povFrames = (s: PovSpec) => Math.round(sum(s.shots) * beatOf(s)) + 10;

const R = "hotels/rowton-hall/screen-time";
const LW = "hotels/low-wood-bay/screen-time";
export const rowtonSpa: PovSpec = {
  hook: ["save this for your", "next spa weekend"],
  place: "CHESTER",
  name: "Rowton Hall\nHotel & Spa",
  shots: [
    { clip: `${R}/dusk-4s`, beats: 6 },
    { clip: `${R}/robe`, beats: 4 },
    { clip: `${R}/massage`, beats: 4 },
    { clip: `${R}/facial`, beats: 4 },
    { clip: `${R}/champagne`, beats: 4 },
    { clip: `${R}/four-poster`, beats: 5 },
    // the close plays over the longest clip, so the question and the Follow tap have room
    { clip: `${R}/pool-4s`, beats: 10 },
  ],
  question: ["who are you", "taking?"],
};
export const lowWoodWinter: PovSpec = {
  hook: ["POV: winter on", "Windermere"],
  place: "WINDERMERE, LAKE DISTRICT",
  name: "Low Wood Bay\nResort & Spa",
  shots: [
    { clip: `${LW}/misty-lake-4s`, beats: 8 },
    { clip: `${LW}/snowy-rooftops`, beats: 5 },
    { clip: `${LW}/candles`, beats: 5 },
    { clip: `${LW}/cello`, beats: 5 },
    { clip: `${LW}/quartet-4s`, beats: 10 },
  ],
  question: ["who's coming", "with you?"],
};

// the unusual angle first (Scott, 25 Nov: ours stall at ~220 views while Coombe Abbey's banquet got 516k): a castle
const RC = "hotels/ruthin-castle";
export const ruthinCastle: PovSpec = {
  hook: ["you can actually", "sleep in this castle"],
  place: "NORTH WALES",
  name: "Ruthin Castle\nHotel & Spa",
  shots: [
    // Rich Enough is slower (112.5 BPM, 16 frames a beat): a shot every four beats, the hook held five
    { clip: `${RC}/clips/castle`, beats: 5 },
    { clip: `${RC}/clips/peacock`, beats: 4 },
    { clip: `${RC}/sumac-and-ruins`, beats: 4 },
    { clip: `${RC}/clips/fireside-plate`, beats: 4 },
    { clip: `${RC}/hot-tub-lift`, beats: 4, from: 14 },
    { clip: `${RC}/clips/white-bed`, beats: 8 },
  ],
  question: ["best bit: the peacock", "or the hot tub?"],
  label: false,
  music: RICH_ENOUGH,
};

// TikTok's own Follow button, popped in, tapped and turned to Following (not used: see the close)
export const Follow: React.FC<{ at: number; tap: number }> = ({ at, tap }) => {
  const f = useCurrentFrame();
  const inT = progress(f, at, 9);
  const pop = 1 + 0.12 * Math.sin(Math.PI * Math.min(1, Math.max(0, (f - at) / 9)));
  const press = f >= tap && f < tap + 8 ? 1 - 0.08 * Math.sin((Math.PI * (f - tap)) / 8) : 1;
  const done = f >= tap + 4;
  const ring = Math.max(0, Math.min(1, (f - tap) / 14));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 560, display: "flex", justifyContent: "center", opacity: inT }}>
      <div style={{ position: "relative", transform: `scale(${pop * press})` }}>
        <div style={{ background: done ? "rgba(22,24,35,0.72)" : "#FE2C55", color: "#fff", fontFamily: sans, fontWeight: 700, fontSize: 44,
          padding: "20px 84px", borderRadius: 12, border: done ? "2px solid rgba(255,255,255,0.35)" : "2px solid transparent" }}>
          {done ? "Following" : "Follow"}
        </div>
        {f >= tap ? (
          <div style={{ position: "absolute", left: "50%", top: "50%", width: 70 + 120 * ring, height: 70 + 120 * ring, borderRadius: "50%",
            transform: "translate(-50%,-50%)", background: `rgba(255,255,255,${0.45 * (1 - ring)})` }} />
        ) : null}
      </div>
    </div>
  );
};

const Label: React.FC<{ place: string; name: string; o: number }> = ({ place, name, o }) => (
  <AbsoluteFill style={{ opacity: o }}>
    <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(9,9,10,0) 55%, rgba(9,9,10,0.55) 78%, rgba(9,9,10,0.25) 100%)" }} />
    <div style={{ position: "absolute", left: 72, bottom: 480 }}>
      <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 28, letterSpacing: "0.24em", color: colors.gold }}>{place}</div>
      <div style={{ fontFamily: serif, fontSize: 68, lineHeight: 1.08, marginTop: 12, color: colors.cream, whiteSpace: "pre-line" }}>{name}</div>
    </div>
  </AbsoluteFill>
);

export const PovShort: React.FC<{ spec?: PovSpec }> = ({ spec = rowtonSpa }) => {
  const frame = useCurrentFrame();
  const music = spec.music ?? EVENT_MUSIC;
  const BEAT = beatOf(spec);
  const b = (n: number) => Math.round(n * BEAT);
  const total = povFrames(spec);
  const n = spec.shots.length;
  const starts = spec.shots.map((_, i) => sum(spec.shots.slice(0, i)));
  const last = starts[n - 1], hookEnd = b(spec.shots[0].beats) - 4;
  const qAt = b(last), followAt = b(last + 3);
  // the label comes up on the second shot and holds two shots
  const lab = progress(frame, b(starts[1]) + 4, 8) * (1 - progress(frame, b(starts[Math.min(3, n - 1)]) - 6, 6));
  return (
    <AbsoluteFill style={{ background: "#09090a" }}>
      {spec.shots.map((s, i) => {
        const from = b(starts[i]);
        const len = (i === n - 1 ? total : b(starts[i] + s.beats)) - from;
        return (
          <Sequence key={s.clip} from={from} durationInFrames={len}>
            <OffthreadVideo src={staticFile(`${s.clip}.mp4`)} muted startFrom={s.from ?? 0} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </Sequence>
        );
      })}
      {lab > 0 && spec.label !== false ? <Label place={spec.place} name={spec.name} o={lab} /> : null}
      {frame >= qAt ? <AbsoluteFill style={{ background: "rgba(9,9,10,0.18)" }} /> : null}
      <Sequence durationInFrames={hookEnd} layout="none">
        <TikTokText lines={spec.hook} top={TT_TOP} left={140} still />
      </Sequence>
      <Sequence from={qAt} layout="none">
        <TikTokText lines={spec.question} top={TT_TOP} left={140} />
      </Sequence>
      {/* the follow ask in the caption style, not a fake button (Scott, 25 Nov: a fake Follow button can fail TikTok's ad review
          when the reel is boosted, and looks tappable when it isn't) */}
      <Sequence from={followAt} layout="none">
        <TikTokText lines={["follow for more stays"]} top={1240} left={140} />
      </Sequence>
      <Audio src={staticFile(music.src)} trimBefore={Math.round(music.from * 30)}
        volume={(v) => interpolate(v, [0, 3, total - 14, total], [0, 1, 1, 0], { extrapolateRight: "clamp" })} />
    </AbsoluteFill>
  );
};
