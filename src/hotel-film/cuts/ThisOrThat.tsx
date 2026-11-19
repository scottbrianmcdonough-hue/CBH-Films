import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { FilmFinish } from "../components/FilmFinish";
import { TikTokText, TT_TOP } from "../doodle/StickFlip";
import { colors, progress, serif } from "../theme";

// This or that (Scott, 19 Nov: "a few more for TikTok"): the frame split in two, a hotel in each half, a round
// every eight beats: the top half slams in from the left on the downbeat, the bottom from the right a beat
// on, an "or" between them; both leave together, so two rounds never mix. Four rounds, eight hotels, each once, from photos no reel has shown; "comment your
// picks" over the last. No logo: each half carries its hotel's name.

const N = "campaigns/november-best-loved";
const J = "campaigns/journey-new";
type Side = { src: string; hotel: string; pos?: string };
const ROUNDS: [Side, Side][] = [
  [{ src: `${N}/hatherley-manor/indoor-pool.jpg`, hotel: "Hatherley Manor" }, { src: `${N}/frensham-pond/spa-pool.jpg`, hotel: "Frensham Pond", pos: "50% 62%" }],
  [{ src: `${J}/hythe-moet-bar.jpg`, hotel: "Hythe Imperial", pos: "50% 45%" }, { src: `${J}/speech-house-cabin.jpg`, hotel: "The Speech House" }],
  [{ src: `${N}/donnington-valley/splendid-suite.jpg`, hotel: "Donnington Valley" }, { src: `${J}/whittlebury-suite.jpg`, hotel: "Whittlebury Park" }],
  [{ src: `${J}/whitley-hall-terrace.jpg`, hotel: "Whitley Hall" }, { src: `${N}/ramside-hall/hot-tub-dusk.jpg`, hotel: "Ramside Hall" }],
];

// Event Music (prettyjohn1, Pixabay 595091) from its beat 16 (6.27s), where the band comes in: 152 BPM
const MUSIC = "music/prettyjohn1-event-music-595091.mp3";
const MUSIC_FROM = 6.27;
const BEAT = (60 / 152.2) * 30;
const b = (n: number) => Math.round(n * BEAT);
const PER = 8;
export const TOT_FRAMES = b(ROUNDS.length * PER + 6);

const Half: React.FC<{ side: Side; top: boolean; at: number; out: number | null }> = ({ side, top, at, out }) => {
  const frame = useCurrentFrame();
  const t = progress(frame, at, 9);
  const over = Math.sin(Math.PI * Math.min(1, Math.max(0, (frame - at) / 14))) * 0.012; // a small overshoot as it lands
  const gone = out === null ? 0 : progress(frame, out, 9);
  const dir = top ? -1 : 1;
  const x = dir * (1 - t) * 1080 - dir * gone * 1080 + dir * over * -1080;
  const push = 1.02 + 0.06 * Math.min(1, Math.max(0, (frame - at) / (PER * BEAT + 60)));
  if (frame < at || gone >= 1) return null;
  return (
    <div style={{ position: "absolute", left: 0, top: top ? 0 : 962, width: 1080, height: 958, overflow: "hidden", transform: `translateX(${x}px)` }}>
      <Img src={staticFile(side.src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: side.pos ?? "50% 50%", transform: `scale(${push})` }} />
      <div style={{ position: "absolute", inset: 0, background: top
        ? "linear-gradient(to top, rgba(9,9,10,0.55) 0%, rgba(9,9,10,0) 34%)"
        : "linear-gradient(to top, rgba(9,9,10,0.4) 0%, rgba(9,9,10,0.5) 42%, rgba(9,9,10,0) 66%)" }} />
      <div style={{ position: "absolute", left: 56, bottom: top ? 40 : 430, fontFamily: serif, fontSize: 58, color: colors.cream, opacity: progress(frame, at + 6, 8),
        textShadow: "0 2px 16px rgba(9,9,10,0.6)" }}>{side.hotel}</div>
    </div>
  );
};

const Or: React.FC<{ at: number; out: number | null }> = ({ at, out }) => {
  const frame = useCurrentFrame();
  const t = progress(frame, at, 6);
  if (frame < at || (out !== null && frame >= out)) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 960 - 44, display: "flex", justifyContent: "center" }}>
      <div style={{ fontFamily: "Figtree, sans-serif", fontWeight: 700, fontSize: 52, lineHeight: 1, color: "#fff", background: "#000", padding: "16px 30px 20px",
        borderRadius: 16, transform: `scale(${0.7 + 0.3 * t + 0.08 * Math.sin(Math.PI * t)})`, opacity: Math.min(1, t * 2) }}>or</div>
    </div>
  );
};

export const ThisOrThat: React.FC = () => {
  const last = ROUNDS.length - 1;
  return (
    <AbsoluteFill style={{ background: "#09090a" }}>
      {ROUNDS.map(([a, c], k) => {
        const at = b(k * PER);
        const out = k === last ? null : b((k + 1) * PER);
        return (
          <React.Fragment key={k}>
            {/* the first round is there whole on frame one, under the hook */}
            <Half side={a} top at={k === 0 ? -30 : at} out={out} />
            <Half side={c} top={false} at={k === 0 ? -30 : at + b(1)} out={out} />
            <Or at={k === 0 ? 0 : at + b(1) + 4} out={out} />
          </React.Fragment>
        );
      })}
      <Audio src={staticFile(MUSIC)} trimBefore={Math.round(MUSIC_FROM * 30)}
        volume={(v) => interpolate(v, [0, 4, TOT_FRAMES - 16, TOT_FRAMES], [0, 1, 1, 0], { extrapolateRight: "clamp" })} />
      <FilmFinish />
      <Sequence durationInFrames={b(PER) - 4} layout="none">
        <TikTokText lines={["this or that:", "hotel edition"]} top={TT_TOP - 250} left={140} out={b(PER) - 12} still />
      </Sequence>
      <Sequence from={b(last * PER + 5)} layout="none">
        <TikTokText lines={["which four", "are you picking?"]} top={TT_TOP - 250} left={140} />
      </Sequence>
    </AbsoluteFill>
  );
};
