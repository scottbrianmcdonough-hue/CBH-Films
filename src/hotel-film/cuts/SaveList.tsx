import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, interpolate, Loop, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { FilmFinish } from "../components/FilmFinish";
import { TikTokText, TT_TOP, TT_TOP_CARD } from "../doodle/StickFlip";
import { colors, progress, sans, serif } from "../theme";

// "Save for later" lists for TikTok (Scott, 23 Nov: "start making reels like save for later"; the plan's biggest
// pillar, 40% of posts). Hotels from one CBH collection on hard beat cuts, real footage only, each with its house
// label; the signature is TikTok's own save: as each hotel ends, a gold bookmark pops in the corner and the count
// ticks (1/5, 2/5 ...), and the list closes on the saved collection, every hotel's clip playing in a grid, under
// the closing question. Hook on frame one over footage (the low reach review: never a title card or text on black).
// A list, never a vote: no hotel is set against another (Scott, 19 Nov). Names and places as CBH lists them
// (src/hotels/cbh-collections.ts). No logo: the label is the brand.

export type SaveHotel = { place: string; name: string; clips: [clip: string, beats: number][] };
export type SaveSpec = { hook: [string, string]; collection: string; hotels: SaveHotel[]; question: string[]; endBeats: number };

// Event Music (prettyjohn1, Pixabay 595091) from its beat 16 (6.27s), where the band comes in: 152 BPM, steady,
// so a trending sound can go over it in the app (the plan's rule) and the cuts still sit on a beat
const MUSIC = "music/prettyjohn1-event-music-595091.mp3";
const MUSIC_FROM = 6.27;
const BEAT = (60 / 152.2) * 30;
const b = (n: number) => Math.round(n * BEAT);

const R = "hotels/rowton-hall/screen-time";
const RH = "hotels/rutland-hall";
const LW = "hotels/low-wood-bay/screen-time";
const G = "hotels/gisborough-hall/screen-time";
export const spaList: SaveSpec = {
  hook: ["save this for your", "next spa weekend"],
  collection: "Spa weekends",
  hotels: [
    { place: "CHESTER", name: "Rowton Hall\nHotel & Spa", clips: [[`${R}/pool-4s`, 4], [`${R}/massage`, 2]] },
    { place: "RUTLAND WATER", name: "Rutland Hall", clips: [[`${RH}/spa-baths`, 4], [`${RH}/screen-time/candlelit-bath`, 2]] },
    { place: "LAKE WINDERMERE", name: "Low Wood Bay\nResort & Spa", clips: [[`${LW}/misty-lake-4s`, 4], [`${LW}/candles`, 2]] },
    { place: "WALSALL", name: "Fairlawns\nHotel & Spa", clips: [["hotels/fairlawns/copper-bath", 6]] },
    { place: "RUTHIN, NORTH WALES", name: "Ruthin Castle\nHotel & Spa", clips: [["hotels/ruthin-castle/hot-tub", 6]] },
  ],
  question: ["who are you", "taking?"],
  endBeats: 10,
};
export const cosyList: SaveSpec = {
  hook: ["save this for a", "cosy winter break"],
  collection: "Cosy winter breaks",
  hotels: [
    { place: "NORTH YORK MOORS", name: "Gisborough Hall", clips: [[`${G}/misty-sunrise`, 3], [`${G}/fireplace`, 3]] },
    { place: "CHESTER", name: "Rowton Hall\nHotel & Spa", clips: [[`${R}/log-burner`, 3], [`${R}/cake-by-the-fire`, 3]] },
    { place: "RUTHIN, NORTH WALES", name: "Ruthin Castle\nHotel & Spa", clips: [["hotels/ruthin-castle/clips/fireside-plate", 6]] /* not the castle: blue sky and green, summer */ },
    { place: "LAKE WINDERMERE", name: "Low Wood Bay\nResort & Spa", clips: [[`${LW}/snowy-rooftops`, 3], [`${LW}/quartet-4s`, 3]] },
    { place: "BEDFORD", name: "The Kingfisher", clips: [["hotels/the-kingfisher/screen-time/dessert-pots", 3], ["hotels/the-kingfisher/screen-time/cocktail", 3]] },
  ],
  question: ["who's coming", "with you?"],
  endBeats: 10,
};

const segs = (s: SaveSpec) => {
  let at = 0;
  return s.hotels.map((h) => {
    const len = h.clips.reduce((t, [, n]) => t + n, 0);
    const seg = { h, at, len };
    at += len;
    return seg;
  });
};
export const saveFrames = (s: SaveSpec) => b(segs(s).reduce((t, x) => t + x.len, 0) + s.endBeats);

const Label: React.FC<{ place: string; name: string; o: number }> = ({ place, name, o }) => (
  <AbsoluteFill style={{ opacity: o }}>
    <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(9,9,10,0) 54%, rgba(9,9,10,0.6) 76%, rgba(9,9,10,0.3) 100%)" }} />
    <div style={{ position: "absolute", left: 72, bottom: 480 }}>
      <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 28, letterSpacing: "0.24em", color: colors.gold }}>{place}</div>
      <div style={{ fontFamily: serif, fontSize: 68, lineHeight: 1.08, marginTop: 12, color: colors.cream, whiteSpace: "pre-line" }}>{name}</div>
    </div>
  </AbsoluteFill>
);

// TikTok's bookmark, in CBH gold: it pops and fills on the hotel's last beat, and the count ticks
const Ribbon: React.FC<{ fill: number; size: number }> = ({ fill, size }) => (
  <svg width={size} height={size * 1.3} viewBox="0 0 40 52" style={{ overflow: "visible" }}>
    <path d="M4 3 H36 V49 L20 37 L4 49 Z" fill={colors.gold} fillOpacity={fill} stroke={colors.gold} strokeWidth={3.2} strokeLinejoin="round" />
  </svg>
);
const Saved: React.FC<{ saves: number[]; total: number }> = ({ saves, total }) => {
  const frame = useCurrentFrame();
  const n = saves.filter((f) => frame >= f).length;
  if (n === 0) return null;
  const last = saves[n - 1];
  const t = Math.min(1, (frame - last) / 9);
  const pop = 1 + 0.35 * Math.sin(Math.PI * t) * (1 - t * 0.3);
  return (
    <div style={{ position: "absolute", right: 70, top: 300, display: "flex", alignItems: "center", gap: 16,
      padding: "14px 22px", borderRadius: 40, background: "rgba(9,9,10,0.55)" }}>
      <div style={{ transform: `scale(${pop})` }}><Ribbon fill={Math.min(1, t * 2)} size={34} /></div>
      <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 34, color: colors.cream, letterSpacing: "0.04em" }}>{`${n}/${total}`}</div>
    </div>
  );
};

// the saved collection: a grid like TikTok's Favourites, every hotel's last clip playing in its tile
const TW = 290, TH = 516, GAP = 16, GX = (1080 - 3 * TW - 2 * GAP) / 2, GY = 560;
const Collection: React.FC<{ s: SaveSpec }> = ({ s }) => {
  const frame = useCurrentFrame();
  const head = progress(frame, 0, 8);
  return (
    <AbsoluteFill style={{ background: "#09090a" }}>
      <div style={{ position: "absolute", left: GX, top: GY - 90, display: "flex", alignItems: "center", gap: 18, opacity: head }}>
        <Ribbon fill={1} size={36} />
        <div style={{ fontFamily: serif, fontSize: 60, color: colors.cream }}>{s.collection}</div>
      </div>
      {s.hotels.map((h, i) => {
        const t = progress(frame, i * 2, 6); // in at once, so the cut from the last hotel never shows black
        const [clip] = h.clips[h.clips.length - 1];
        const row = Math.floor(i / 3), inRow = Math.min(3, s.hotels.length - row * 3); // a short last row sits centred
        const x = (1080 - inRow * TW - (inRow - 1) * GAP) / 2 + (i % 3) * (TW + GAP), y = GY + row * (TH + GAP);
        return (
          <div key={h.name} style={{ position: "absolute", left: x, top: y, width: TW, height: TH, borderRadius: 18, overflow: "hidden",
            opacity: t, transform: `translateY(${(1 - t) * 40}px) scale(${0.94 + 0.06 * t})` }}>
            {/* looped on the shortest clip's length so no tile runs out and goes black */}
            <Loop durationInFrames={56}><OffthreadVideo src={staticFile(`${clip}.mp4`)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} /></Loop>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(9,9,10,0) 55%, rgba(9,9,10,0.75) 100%)" }} />
            <div style={{ position: "absolute", left: 18, right: 14, bottom: 18, fontFamily: serif, fontSize: 34, lineHeight: 1.05,
              color: colors.cream, whiteSpace: "pre-line" }}>{h.name.split("\n")[0]}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const SaveList: React.FC<{ spec?: SaveSpec }> = ({ spec = spaList }) => {
  const frame = useCurrentFrame();
  const S = segs(spec);
  const total = saveFrames(spec);
  const endAt = b(S[S.length - 1].at + S[S.length - 1].len);
  const saves = S.map((x) => b(x.at + x.len - 1));
  return (
    <AbsoluteFill style={{ background: "#09090a" }}>
      {S.map(({ h, at }) =>
        h.clips.map(([clip, n], k) => {
          const from = at + h.clips.slice(0, k).reduce((t, [, m]) => t + m, 0);
          return (
            <Sequence key={`${h.name}-${clip}`} from={b(from)} durationInFrames={b(from + n) - b(from)}>
              <OffthreadVideo src={staticFile(`${clip}.mp4`)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </Sequence>
          );
        }),
      )}
      {S.map(({ h, at, len }) => {
        const o = progress(frame, b(at) + (at === 0 ? 10 : 3), 7) * (1 - progress(frame, b(at + len) - 5, 5));
        return o > 0 ? <Label key={h.name} place={h.place} name={h.name} o={o} /> : null;
      })}
      {frame < endAt ? <Saved saves={saves} total={spec.hotels.length} /> : null}
      <Sequence from={endAt}>
        <Collection s={spec} />
      </Sequence>
      <Audio src={staticFile(MUSIC)} trimBefore={Math.round(MUSIC_FROM * 30)}
        volume={(v) => interpolate(v, [0, 4, total - 18, total], [0, 1, 1, 0], { extrapolateRight: "clamp" })} />
      <FilmFinish />
      <Sequence durationInFrames={b(S[0].len) - 4} layout="none">
        <TikTokText lines={spec.hook} top={TT_TOP} left={140} still />
      </Sequence>
      <Sequence from={endAt + b(3)} layout="none">
        <TikTokText lines={spec.question} top={TT_TOP_CARD} left={140} />
      </Sequence>
    </AbsoluteFill>
  );
};
