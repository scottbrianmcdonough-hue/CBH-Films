import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { FilmFinish } from "../components/FilmFinish";
import { TikTokText, TT_TOP } from "../doodle/StickFlip";
import { colors, progress, sans, serif } from "../theme";

// Ramside Hall for TikTok (Scott, 19 Nov: "do a ramside tiktok with the new footage"): the reel bank's slider
// shots on hard cuts, a shot every two beats. It opens on the treehouses from the air under the hook, cuts into
// the hotel on the track's drop, and its one piece of craft is a match cut: four lights, a beat each, every one
// hanging in the same place in the frame. Back to the treehouses in the band's stop for the closing line.
// Clips by scripts/ramside-tiktok-clips.py (25fps run 1.2x to 30). No logo: the label is the brand.

const C = "hotels/ramside-hall/tiktok";
// Party Pop (AtlasAudio, Pixabay 606271) from 123.03s: six beats, its three-beat stop, the drop on beat 6, the
// next stop on beats 35-37, the band back on 38. Beats in frames, as detected.
const MUSIC = "music/atlasaudio-party-pop-606271.mp3";
const MUSIC_FROM = 123.026;
const BEATS = [0, 13, 25, 39, 53, 66, 79, 91, 104, 116, 130, 142, 155, 168, 181, 194, 207, 219, 232, 245, 258, 271, 284, 297, 309, 322, 335,
  348, 360, 373, 387, 399, 412, 425, 438, 452, 465, 477, 490, 502, 515, 528, 541, 554, 567];
const b = (n: number) => BEATS[n];
const DROP = 6;
const STOP = 35;
const END = 43;
export const RAMSIDE_TT_FRAMES = b(END);

// [clip, the beat it cuts in on]
const SHOTS: [string, number][] = [
  ["treehouses-1", 0],
  ["terrace", DROP], ["lamp", 8], ["lounge", 10], ["green-chairs", 12],
  ["light-1", 14], ["light-2", 15], ["light-3", 16], ["light-4", 17],
  ["yellow-sofa", 18], ["fairy-lights", 20], ["rib-room", 22], ["glasses", 24], ["table", 25], ["frames", 26],
  ["chalkboard", 28], ["breakfast-1", 30], ["breakfast-2", 32],
  ["treehouses-2", STOP],
];

const Label: React.FC<{ place: string; hotel: string; o: number }> = ({ place, hotel, o }) => (
  <AbsoluteFill style={{ opacity: o }}>
    <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(9,9,10,0) 54%, rgba(9,9,10,0.6) 76%, rgba(9,9,10,0.3) 100%)" }} />
    <div style={{ position: "absolute", left: 72, bottom: 480 }}>
      <div style={{ display: "inline-block" }}>
        <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 28, letterSpacing: "0.24em", color: colors.gold }}>{place}</div>
      </div>
      <div style={{ fontFamily: serif, fontSize: 68, lineHeight: 1.08, marginTop: 14, color: colors.cream, whiteSpace: "pre-line" }}>{hotel}</div>
    </div>
  </AbsoluteFill>
);

export const RamsideTikTok: React.FC = () => {
  const frame = useCurrentFrame();
  // the label once, held across the first three shots inside the hotel
  const labelO = progress(frame, b(DROP) + 4, 8) * (1 - progress(frame, b(12) - 8, 8));
  return (
    <AbsoluteFill style={{ background: "#09090a" }}>
      {SHOTS.map(([clip, at], k) => {
        const next = k + 1 < SHOTS.length ? b(SHOTS[k + 1][1]) : RAMSIDE_TT_FRAMES;
        return (
          <Sequence key={clip} from={b(at)} durationInFrames={next - b(at)}>
            <OffthreadVideo src={staticFile(`${C}/${clip}.mp4`)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </Sequence>
        );
      })}
      {labelO > 0 ? <Label place="DURHAM" hotel="Ramside Hall" o={labelO} /> : null}
      <Audio src={staticFile(MUSIC)} trimBefore={Math.round(MUSIC_FROM * 30)}
        volume={(v) => interpolate(v, [0, 4, RAMSIDE_TT_FRAMES - 16, RAMSIDE_TT_FRAMES], [0, 1, 1, 0], { extrapolateRight: "clamp" })} />
      <FilmFinish />
      <Sequence durationInFrames={b(DROP)} layout="none">
        <TikTokText lines={["POV: your hotel", "has treehouses"]} top={TT_TOP} left={140} still />
      </Sequence>
      <Sequence from={b(STOP) + 3} layout="none">
        <TikTokText lines={["checkout can wait"]} top={TT_TOP} left={140} />
      </Sequence>
    </AbsoluteFill>
  );
};
