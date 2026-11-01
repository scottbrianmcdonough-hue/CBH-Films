import { Audio, Video } from "@remotion/media";
import {
  AbsoluteFill,
  Img,
  interpolate,
  random,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { CBLogo } from "../components/CBLogo";
import { FilmFinish } from "../components/FilmFinish";
import { SCRIM } from "../footage/FootageFilm";
import { colors, EASE_IN_OUT, EASE_OUT, progress, sans, serif } from "../theme";
import type { FestiveShot, FestiveSpec } from "./types";

const H = 1920;
// The push-through on a whip cut: frames each side of the cut, the extra zoom at the cut,
// and the peak motion blur (px).
const WHIP = 6;
const PUNCH = 0.16;
const BLUR = 6;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const LIFT = "0 3px 28px rgba(9,9,10,0.55), 0 1px 3px rgba(9,9,10,0.45)";

// The lights switching on: exposure and colour lift once, at the start, and stay up.
const lightsFilter = (on: number) =>
  `brightness(${0.45 + 0.55 * on}) saturate(${0.75 + 0.25 * on})`;

const Picture: React.FC<{ shot: FestiveShot; frames: number }> = ({
  shot,
  frames,
}) => {
  const frame = useCurrentFrame();
  if (shot.kind === "video") {
    return (
      <AbsoluteFill style={{ backgroundColor: colors.black }}>
        <Video
          src={staticFile(shot.src)}
          trimBefore={Math.round(shot.from * 30)}
          muted
          objectFit="cover"
          style={{ width: "100%", height: "100%" }}
        />
      </AbsoluteFill>
    );
  }
  // A still: the gentle push-in, centred, so the matched shape lands where the solver put it.
  const [sw, sh] = shot.size;
  const ch = shot.crop.h ?? sh;
  const cw = (ch * 9) / 16;
  const cy = shot.crop.cy ?? sh / 2;
  const k = H / ch;
  const zoom = 1 + (shot.push ?? 0) * (frame / frames);
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: colors.black }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <Img
          src={staticFile(shot.src)}
          style={{
            position: "absolute",
            width: sw * k,
            height: sh * k,
            left: -(shot.crop.cx - cw / 2) * k,
            top: -(cy - ch / 2) * k,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// The one opening line, set on frame one over the footage (bottom-left, house type), fading
// before the first crossfade.
const OpeningLine: React.FC<{ text: string; out: number }> = ({
  text,
  out,
}) => {
  const frame = useCurrentFrame();
  const o = 1 - progress(frame, out - 14, 14, EASE_IN_OUT);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ background: SCRIM }} />
      <div style={{ position: "absolute", left: 72, bottom: 480 }}>
        {text.split("\n").map((l) => (
          <div
            key={l}
            style={{
              fontFamily: serif,
              fontSize: 112,
              lineHeight: 1.04,
              color: colors.cream,
              whiteSpace: "nowrap",
              textShadow: LIFT,
            }}
          >
            {l}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// The clean end card: a short line over the official CBH logo with the shimmer on the CB.
// A light fall of soft snowflakes over the opening (the one festive touch): large, slow,
// out of focus, drifting a little; they thin out as the lights come up and are gone by `out`.
const FLAKES = 26;
const Snow: React.FC<{ out: number }> = ({ out }) => {
  const frame = useCurrentFrame();
  const fadeOut = 1 - progress(frame, out - 30, 30, EASE_IN_OUT);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: fadeOut }}>
      {Array.from({ length: FLAKES }, (_, i) => {
        const r = (n: number) => random(`snow-${i}-${n}`);
        const size = 9 + r(1) * 16;
        const speed = 2.2 + r(2) * 2.4; // px per frame
        const x0 = r(3) * 1080;
        const y = -60 + ((r(4) * 2100 + frame * speed) % 2100);
        const x = x0 + Math.sin(frame / (22 + r(5) * 18) + r(6) * 6) * 26;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: "50%",
              background: "rgba(245,239,227,0.85)",
              filter: `blur(${(size / 7).toFixed(1)}px)`,
              opacity: 0.35 + r(7) * 0.45,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// The end card on black, arriving as one calm block: an optional gold caps eyebrow, a large
// Cormorant title and a short still gold rule (the stronger card), then the line in italic;
// the official CBH logo wipes up below with the shimmer on the CB.
const EndCard: React.FC<{
  eyebrow?: string;
  title?: string;
  line?: string;
  delay: number;
}> = ({ eyebrow, title, line, delay }) => {
  const frame = useCurrentFrame();
  const arrive = progress(frame, delay, 22, EASE_OUT);
  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.black,
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: title ? 260 : 0,
      }}
    >
      <div
        style={{
          opacity: arrive,
          transform: `translateY(${(1 - arrive) * 36}px)`,
          textAlign: "center",
        }}
      >
        {eyebrow ? (
          <div
            style={{
              fontFamily: sans,
              fontWeight: 600,
              fontSize: 30,
              letterSpacing: "0.28em",
              paddingLeft: "0.28em",
              textTransform: "uppercase",
              color: colors.gold,
              marginBottom: 14,
            }}
          >
            {eyebrow}
          </div>
        ) : null}
        {title
          ? title.split("\n").map((t) => (
              <div
                key={t}
                style={{
                  fontFamily: serif,
                  fontSize: 132,
                  lineHeight: 1.02,
                  color: colors.cream,
                  whiteSpace: "nowrap",
                }}
              >
                {t}
              </div>
            ))
          : null}

        {line ? (
          <div
            style={{
              fontFamily: serif,
              fontStyle: "italic",
              fontSize: title ? 64 : 72,
              color: colors.cream,
            }}
          >
            {line}
          </div>
        ) : null}
      </div>
      <div style={{ position: "absolute", bottom: 470 }}>
        <CBLogo start={delay + 14} width={190} shimmerAt={delay + 46} cbOnly />
      </div>
    </AbsoluteFill>
  );
};

export const FestiveFilm: React.FC<{ film: FestiveSpec }> = ({ film }) => {
  const frame = useCurrentFrame();
  const bounds = [0, ...film.cuts, film.durationInFrames];
  const n = film.shots.length;
  const cf = film.crossfade;
  // Half the transition into section i (a shot, or the end card at i === n).
  const half = (i: number) =>
    i < n && film.shots[i].cut === "hard" ? 0 : cf / 2;
  const shotsEnd = film.endCard ? bounds[n] : film.durationInFrames;
  const on = progress(frame, film.lightsOn, 24, EASE_IN_OUT);
  const fade = film.fadeOut
    ? interpolate(
        frame,
        [film.durationInFrames - film.fadeOut, film.durationInFrames],
        [1, 0],
        clamp,
      )
    : 1;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      {film.music ? (
        <Audio
          src={staticFile(film.music.src)}
          trimBefore={film.music.startAt}
          volume={(f) =>
            film.music!.gain *
            interpolate(
              f,
              [film.music!.fadeFrom, film.durationInFrames],
              [1, 0],
              clamp,
            )
          }
        />
      ) : null}
      <AbsoluteFill style={{ opacity: fade, filter: lightsFilter(on) }}>
        {film.shots.map((shot, i) => {
          const start = i === 0 ? 0 : bounds[i] - half(i);
          const end =
            i === n - 1 && !film.endCard
              ? bounds[i + 1]
              : bounds[i + 1] + half(i + 1);
          const h = half(i);
          const opacity =
            i === 0 || h === 0
              ? 1
              : interpolate(frame, [start, start + 2 * h], [0, 1], {
                  ...clamp,
                  easing: EASE_IN_OUT,
                });
          // The push-through on a whip cut: out of this shot, and into it.
          const next = film.shots[i + 1];
          let zoom = 1;
          let blur = 0;
          let origin: [number, number] | undefined;
          if (next?.whip && frame >= bounds[i + 1] - WHIP) {
            const t = (frame - (bounds[i + 1] - WHIP)) / WHIP;
            zoom = 1 + PUNCH * t * t;
            blur = BLUR * t;
            origin = next.whip;
          } else if (shot.whip && frame < bounds[i] + WHIP) {
            const t = Math.max(0, (frame - bounds[i]) / WHIP);
            zoom = 1 + PUNCH * (1 - t) * (1 - t);
            blur = BLUR * (1 - t);
            origin = shot.whip;
          }
          return (
            <Sequence key={i} from={start} durationInFrames={end - start}>
              <AbsoluteFill
                style={{
                  opacity,
                  filter:
                    `${shot.grade ?? ""} ${blur > 0 ? `blur(${blur.toFixed(2)}px)` : ""}`.trim() ||
                    undefined,
                  transform: zoom !== 1 ? `scale(${zoom})` : undefined,
                  transformOrigin: origin
                    ? `${origin[0]}px ${origin[1]}px`
                    : undefined,
                }}
              >
                <Picture shot={shot} frames={end - start} />
              </AbsoluteFill>
            </Sequence>
          );
        })}
      </AbsoluteFill>
      {film.snow ? (
        <Sequence durationInFrames={bounds[1]}>
          <Snow out={bounds[1]} />
        </Sequence>
      ) : null}
      <Sequence durationInFrames={bounds[1]}>
        <OpeningLine text={film.line} out={bounds[1] - half(1)} />
      </Sequence>
      {film.endCard ? (
        <Sequence from={bounds[n] - cf / 2}>
          <AbsoluteFill
            style={{
              opacity: interpolate(
                frame,
                [bounds[n] - cf / 2, bounds[n] + cf / 2],
                [0, 1],
                clamp,
              ),
            }}
          >
            <EndCard {...film.endCard} delay={cf} />
          </AbsoluteFill>
        </Sequence>
      ) : null}
      {film.watermark ? (
        <Img
          src={staticFile(film.watermark.src)}
          style={{
            position: "absolute",
            left: film.watermark.x,
            top: film.watermark.y,
            width: film.watermark.size[0],
            height: film.watermark.size[1],
            opacity:
              fade *
              interpolate(frame, [shotsEnd - cf / 2, shotsEnd], [1, 0], clamp),
          }}
        />
      ) : null}
      <FilmFinish />
    </AbsoluteFill>
  );
};
