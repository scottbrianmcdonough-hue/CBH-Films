import { Audio } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { colors, EASE_IN_OUT, EASE_OUT, progress, sans, serif } from "../theme";

// Shared by the three December drafts (Scott, 4 Nov: "the next reel for December, almost Christmas", then "try
// them all, see what one lands best"): the out of office, door 24 and the drive home. All three run on the same
// stretch of Christmas Jazz (Tunetank, the lights on reel's track) so the ideas can be compared; the one picked
// gets its own festive track (music sites are blocked from here).
//
// Christmas Jazz: 86 BPM (a beat every 0.6859s), from the 14.12s downbeat; the band's full stop is beats 10 to 12.
export const BEAT = 0.6859 * 30; // frames
export const B = (k: number) => Math.round(k * BEAT);
const MUSIC_FROM = Math.round(14.12 * 30);

export const G = "campaigns/festive/graded/";
export const FEST = "campaigns/festive/footage/";
export const KF = "hotels/the-kingfisher/festive/";

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const Music: React.FC<{ len: number }> = ({ len }) => (
  <Audio
    src={staticFile("campaigns/festive/christmas-jazz.mp3")}
    trimBefore={MUSIC_FROM}
    volume={(f) =>
      1.1 * interpolate(f, [0, 3, len - B(3), len - 1], [0, 1, 1, 0], { ...clamp, easing: EASE_IN_OUT })
    }
  />
);

export type Shot = { src: string; pos?: string; from?: number };

// a photo with a slow push, or a clip; place it in a Sequence that starts with the shot (the clip plays from
// the Sequence's own frame 0, plus `from`)
export const ShotView: React.FC<{ s: Shot; len: number; push?: number }> = ({ s, len, push = 0.06 }) => {
  const t = useCurrentFrame();
  const z = 1 + push * Math.min(1, Math.max(0, t / Math.max(1, len)));
  const style: React.CSSProperties = {
    position: "absolute",
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: s.pos ?? "50% 50%",
    transform: `scale(${z})`,
    transformOrigin: s.pos ?? "50% 50%",
  };
  return s.src.endsWith(".mp4") ? (
    <OffthreadVideo src={staticFile(s.src)} muted trimBefore={Math.round((s.from ?? 0) * 30)} style={style} />
  ) : (
    <Img src={staticFile(s.src)} style={style} />
  );
};

// shots on the beat, each until the next; `at` in beats
export const Cuts: React.FC<{ list: (Shot & { at: number })[]; until: number }> = ({ list, until }) => (
  <>
    {list.map((c, i) => {
      const from = B(c.at);
      const to = i + 1 < list.length ? B(list[i + 1].at) : B(until);
      return (
        <Sequence key={c.src + c.at} from={from} durationInFrames={to - from} layout="none">
          <AbsoluteFill>
            <ShotView s={c} len={to - from} />
          </AbsoluteFill>
        </Sequence>
      );
    })}
  </>
);

export const Mark: React.FC<{ opacity?: number }> = ({ opacity = 0.9 }) => (
  <Img
    src={staticFile("brand/cb-watermark.png")}
    style={{ position: "absolute", right: 72, bottom: 480, width: 58, height: 63, opacity }}
  />
);

export const caps = (size: number, color: string, track = 0.24): React.CSSProperties => ({
  fontFamily: sans,
  fontWeight: 600,
  fontSize: size,
  letterSpacing: `${track}em`,
  textTransform: "uppercase",
  color,
});

// the house end card: black, cream Cormorant centred (the second line italic), a small caps line, white CB
export const EndCard: React.FC<{ at: number; line1: string; line2: string; sub?: string }> = ({
  at,
  line1,
  line2,
  sub,
}) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const a = progress(frame, at + 4, 18, EASE_OUT);
  const b = progress(frame, at + 12, 18, EASE_OUT);
  const c = progress(frame, at + 24, 18, EASE_OUT);
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black, alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <div style={{ marginTop: -160 }}>
        <div style={{ fontFamily: serif, fontSize: 104, lineHeight: 1.08, color: colors.cream, opacity: a, transform: `translateY(${(1 - a) * 14}px)` }}>
          {line1}
        </div>
        <div style={{ fontFamily: serif, fontStyle: "italic", fontSize: 92, lineHeight: 1.1, color: colors.cream, opacity: b, transform: `translateY(${(1 - b) * 14}px)` }}>
          {line2}
        </div>
        {sub ? <div style={{ ...caps(24, "rgba(245,239,227,0.78)"), marginTop: 44, opacity: c }}>{sub}</div> : null}
      </div>
      <Mark />
    </AbsoluteFill>
  );
};

// a typed line: the first `n` characters, a blinking caret after the last
export const typed = (text: string, frame: number, at: number, cps = 1.6) =>
  text.slice(0, Math.max(0, Math.min(text.length, Math.floor((frame - at) * cps))));
export const Caret: React.FC<{ on?: boolean; h?: number }> = ({ on = true, h = 46 }) => {
  const frame = useCurrentFrame();
  return (
    <span
      style={{
        display: "inline-block",
        width: 3,
        height: h,
        marginLeft: 4,
        verticalAlign: "-0.15em",
        background: colors.gold,
        opacity: on && Math.floor(frame / 15) % 2 === 0 ? 1 : 0,
      }}
    />
  );
};
