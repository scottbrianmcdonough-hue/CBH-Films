import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { TikTokText, TT_TOP } from "../doodle/StickFlip";
import { colors, progress, sans, serif } from "../theme";

// TikTok shorts on the plan's two rules (Scott, 25 Nov: "start building some like this", the explainer's phones): one
// hotel's real footage full frame on hard beat cuts, a hook on frame one, the house label once, and the close: a
// question, then "follow for more stays" in the same caption style (a Follow button mock was dropped). Event Music (steady, 152 BPM) so a trending
// sound can go over it in the app. No logo: the label is the brand.

// `still`: a photo (`${clip}.jpg`) on a slow push, framed by `pos` (landscape photos cropped to the portrait frame)
export type PovShot = { clip: string; beats: number; from?: number; still?: boolean; pos?: string };
// `label: false` leaves the house label off (Scott, 25 Nov: the hotel is tagged in the post instead); `music` swaps the
// track (Scott: "I don't like the track", "Bianca won't like it": Event Music is only the default for the first two)
export type PovMusic = { src: string; from: number; bpm: number };
export type PovSpec = {
  hook: [string, string]; place: string; name: string; shots: PovShot[]; question: [string, string];
  label?: boolean; music?: PovMusic;
  // how many beats the hook holds (default: the first shot); with a quick first cut the hook runs on over the second
  hookBeats?: number;
  // a loop (Scott, 27 Nov: average watch time under five seconds): no tail and no music fades, so the last frame cuts
  // straight back to the first on the bar and the track picks up its own downbeat again
  loop?: boolean;
};

const EVENT_MUSIC: PovMusic = { src: "music/prettyjohn1-event-music-595091.mp3", from: 6.27, bpm: 152.2 };
// Rich Enough (Instrumental), pietix, Pixabay 510327: Scott's pick for Bianca on cbh-screens; from its full drop
export const RICH_ENOUGH: PovMusic = { src: "stings/screens/rich-enough.mp3", from: 142.496, bpm: 112.5 };
const beatOf = (spec: PovSpec) => (60 / (spec.music ?? EVENT_MUSIC).bpm) * 30;
const sum = (s: PovShot[]) => s.reduce((t, x) => t + x.beats, 0);
export const povFrames = (s: PovSpec) => Math.round(sum(s.shots) * beatOf(s)) + (s.loop ? 0 : 10);

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
  hook: ["you can sleep", "in this castle"],
  place: "NORTH WALES",
  name: "Ruthin Castle\nHotel & Spa",
  // attention drops off at two seconds (Scott, 26 Nov): a cut at ~1s, movement from frame one, a short hook held
  // across the first two shots, three beats a shot after that
  shots: [
    // the peacock first (the first frame rule: the most unusual shot opens), the tower second
    { clip: `${RC}/clips/peacock`, beats: 2 },
    { clip: `${RC}/clips/castle`, beats: 3 },
    { clip: `${RC}/sumac-and-ruins`, beats: 3 },
    { clip: `${RC}/clips/fireside-plate`, beats: 3 },
    { clip: `${RC}/hot-tub-lift`, beats: 3, from: 14 },
    { clip: `${RC}/clips/white-bed`, beats: 8 },
  ],
  hookBeats: 5,
  question: ["best bit: the peacock", "or the hot tub?"],
  label: false,
  music: RICH_ENOUGH,
};

// more for the grid (Scott, 26 Nov: "need some more TikTok reels"): the unusual angle, no label, Rich Enough
const WP = "hotels/waterton-park/clips";
export const watertonIsland: PovSpec = {
  hook: ["this hotel is on", "its own island"],
  place: "WAKEFIELD", name: "Waterton Park\nHotel & Spa",
  // attention drops off at two seconds (Scott, 26 Nov): a cut at ~1s, movement from frame one, a short hook held
  // across the first two shots, three beats a shot after that
  shots: [
    { clip: `${WP}/aerial-story`, beats: 2 },
    { clip: `${WP}/walton-hall-story`, beats: 3 },
    { clip: `${WP}/afternoon-tea`, beats: 3 },
    { clip: `${WP}/indoor-pool-story`, beats: 3 },
    { clip: `${WP}/bedroom`, beats: 8 },
  ],
  hookBeats: 5,
  question: ["would you ever", "leave the island?"],
  label: false, music: RICH_ENOUGH,
};
// not about a hotel at all (Scott: "it doesn't even have to be about hotels all the time"): the scone debate
export const sconeDebate: PovSpec = {
  hook: ["you're doing", "scones wrong"],
  place: "", name: "",
  // attention drops off at two seconds (Scott, 26 Nov): a cut at ~1s, movement from frame one, a short hook held
  // across the first two shots, three beats a shot after that
  shots: [
    { clip: "campaigns/november/hotels/ilsington-scone-slow", beats: 3 },
    // the Kingfisher tea pour is out (Scott: it is already in the pours reel); Holdsworth's tea by the window in its place
    { clip: "hotels/holdsworth-house/afternoon-tea", beats: 3, still: true, pos: "27% 50%" },
    { clip: "campaigns/showcase/langshott-fireside-tea", beats: 3, still: true, pos: "50% 50%" },
    { clip: "hotels/waterton-park/clips/afternoon-tea", beats: 8 },
  ],
  hookBeats: 6,
  question: ["so: jam first", "or cream first?"],
  label: false, music: RICH_ENOUGH,
};
const CA = "hotels/coombe-abbey";
export const coombeAbbey: PovSpec = {
  hook: ["you can sleep in a", "12th century abbey"],
  place: "WARWICKSHIRE", name: "Coombe Abbey",
  // attention drops off at two seconds (Scott, 26 Nov): a cut at ~1s, the banquet first (people, colour), a short hook held
  // across the first two shots, three beats a shot after that
  shots: [
    { clip: `${CA}/banquet-show`, beats: 2, still: true, pos: "55% 50%" },
    { clip: `${CA}/aerial`, beats: 3, still: true },
    { clip: `${CA}/plate`, beats: 3, still: true },
    { clip: `${CA}/garden-front`, beats: 3, still: true },
    { clip: `${CA}/four-poster-room`, beats: 8, still: true },
  ],
  hookBeats: 5,
  question: ["who's getting", "the four poster?"],
  label: false, music: RICH_ENOUGH,
};

// a craft cut (Scott, 26 Nov: "something just craft cut", "need something now"): every shot mid-pour, the stream
// falling from the top of frame in each, a cut every two beats, the smoked cocktail held for the close
export const pours: PovSpec = {
  hook: ["making some", "pour decisions"],
  place: "", name: "",
  shots: [
    { clip: "hotels/the-kingfisher/tea-pour", beats: 2 },
    { clip: "hotels/wild-boar/gravy-pour", beats: 2, from: 15 },
    { clip: "hotels/fairlawns/sauce-pour", beats: 2 },
    { clip: "hotels/dalmahoy/syrup-pour", beats: 2 },
    { clip: "hotels/haycock-manor/clips/cocktail-close", beats: 2 },
    { clip: "hotels/fairlawns/cocktail-cheers", beats: 2, from: 18 },
    { clip: "hotels/haycock-manor/clips/cocktail-smoke", beats: 8 },
  ],
  hookBeats: 4,
  question: ["tag who owes", "you this one"],
  label: false, music: RICH_ENOUGH,
};

// a TikTok Story for the day Ruthin's video goes out (Scott, 27 Nov): three shots, pointing to the full video
export const ruthinStory: PovSpec = {
  hook: ["you can sleep", "in this castle"],
  place: "", name: "",
  shots: [
    { clip: `${RC}/clips/peacock`, beats: 4 },
    { clip: `${RC}/clips/castle`, beats: 4 },
    { clip: `${RC}/clips/white-bed`, beats: 7 },
  ],
  hookBeats: 8,
  question: ["full video", "on our page"],
  label: false, music: RICH_ENOUGH,
};

// a standalone TikTok Story (Scott, 27 Nov: "a separate story")
const ST = (h: string, c: string) => `hotels/${h}/screen-time/${c}`;
export const fridayStory: PovSpec = {
  // Friday morning (Scott: "but it's Friday morning"): breakfast in bed first (the brightest), the robe held for the close
  hook: ["friday,", "finally"],
  place: "", name: "",
  shots: [
    { clip: "campaigns/departures/hotels/ilsington-breakfast", beats: 3 },
    { clip: ST("gisborough-hall", "misty-sunrise"), beats: 3 },
    { clip: "hotels/ramside-hall/tiktok/breakfast-1", beats: 2 },
    { clip: "hotels/ramside-hall/tiktok/breakfast-2", beats: 3 },
    { clip: ST("rowton-hall", "robe"), beats: 3 },
    { clip: ST("rowton-hall", "robe-still"), beats: 5, still: true },
  ],
  hookBeats: 6,
  question: ["what's the weekend", "looking like?"],
  label: false, music: RICH_ENOUGH,
};

// a Saturday TikTok Story (Scott, 28 Nov): cake by the fire first (the brightest), a winter walk, the bath to close
export const saturdayStory: PovSpec = {
  hook: ["saturday,", "sorted"],
  place: "", name: "",
  shots: [
    { clip: ST("rowton-hall", "cake-by-the-fire"), beats: 3 },
    { clip: ST("rowton-hall", "dusk-4s"), beats: 3 }, // no snow (Scott, 28 Nov)
    { clip: "hotels/low-wood-bay/screen-time/misty-lake", beats: 3 },
    { clip: "hotels/low-wood-bay/screen-time/candles", beats: 3 },
    { clip: ST("rutland-hall", "candlelit-bath"), beats: 7 },
  ],
  hookBeats: 6,
  question: ["what are you", "up to today?"],
  label: false, music: RICH_ENOUGH,
};

// Waterton as a loop: four bars of Rich Enough from its drop (64 beats of 16 frames = 8.5s), the bedroom cutting back to
// the aerial on the downbeat
export const watertonLoop: PovSpec = {
  ...watertonIsland,
  shots: [
    { clip: `${WP}/aerial-story`, beats: 3 },
    { clip: `${WP}/walton-hall-story`, beats: 3 },
    { clip: `${WP}/afternoon-tea`, beats: 2 },
    { clip: `${WP}/indoor-pool-story`, beats: 2 },
    { clip: `${WP}/bedroom`, beats: 6 },
  ],
  hookBeats: 6,
  loop: true,
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

const Push: React.FC<{ len: number; children: React.ReactNode }> = ({ len, children }) => {
  const t = useCurrentFrame() / len;
  return <AbsoluteFill style={{ transform: `scale(${1.03 + 0.07 * t})` }}>{children}</AbsoluteFill>;
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
  const last = starts[n - 1], hookEnd = b(spec.hookBeats ?? spec.shots[0].beats) - 4;
  const qAt = b(last);
  // the label comes up on the second shot and holds two shots
  const lab = progress(frame, b(starts[1]) + 4, 8) * (1 - progress(frame, b(starts[Math.min(3, n - 1)]) - 6, 6));
  return (
    <AbsoluteFill style={{ background: "#09090a" }}>
      {spec.shots.map((s, i) => {
        const from = b(starts[i]);
        const len = (i === n - 1 ? total : b(starts[i] + s.beats)) - from;
        return (
          <Sequence key={`${s.clip}-${i}`} from={from} durationInFrames={len}>
            {s.still ? (
              <Push len={len}><Img src={staticFile(`${s.clip}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: s.pos ?? "50% 50%" }} /></Push>
            ) : (
              <OffthreadVideo src={staticFile(`${s.clip}.mp4`)} muted startFrom={s.from ?? 0} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            )}
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
      <Audio src={staticFile(music.src)} trimBefore={Math.round(music.from * 30)}
        volume={(v) => (spec.loop ? 1 : interpolate(v, [0, 3, total - 14, total], [0, 1, 1, 0], { extrapolateRight: "clamp" }))} />
    </AbsoluteFill>
  );
};
