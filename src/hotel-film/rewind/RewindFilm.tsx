import { Audio, Video } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { CBLogo } from "../components/CBLogo";
import { FilmFinish } from "../components/FilmFinish";
import { colors, progress, sans, serif } from "../theme";
import type { RewindShot, RewindSpec } from "./types";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const SHADOW = "0 2px 28px rgba(9,9,10,0.75)";

// A line rising out of its own mask.
const Rise: React.FC<{
  text: string;
  start: number;
  style: React.CSSProperties;
}> = ({ text, start, style }) => {
  const frame = useCurrentFrame();
  const p = progress(frame, start, 18);
  return (
    <div style={{ overflow: "hidden", paddingBottom: 8 }}>
      <div style={{ ...style, transform: `translateY(${(1 - p) * 100}%)` }}>
        {text}
      </div>
    </div>
  );
};

// Bottom-left: the shot's line (or the closing lines) over the hotel's name and place.
const Caption: React.FC<{ shot: RewindShot; lines?: string[] }> = ({
  shot,
  lines,
}) => {
  const frame = useCurrentFrame();
  const text = lines ?? (shot.line ? [shot.line] : []);
  if (!text.length && !shot.tag) return null;
  return (
    <>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(9,9,10,0) 46%, rgba(9,9,10,0.5) 64%, rgba(9,9,10,0.6) 84%, rgba(9,9,10,0.25) 100%)",
        }}
      />
      <div style={{ position: "absolute", left: 72, bottom: 460, right: 160 }}>
        {text.map((t, i) => (
          <Rise
            key={t}
            text={t}
            start={4 + i * 5}
            style={{
              fontFamily: serif,
              fontStyle: "italic",
              fontWeight: 500,
              fontSize: 70,
              lineHeight: 1.05,
              color: colors.cream,
              textShadow: SHADOW,
            }}
          />
        ))}
        {shot.tag ? (
          <div
            style={{
              marginTop: 18,
              opacity: progress(frame, 10, 12),
              textShadow: SHADOW,
            }}
          >
            <div
              style={{
                fontFamily: sans,
                fontWeight: 600,
                fontSize: 24,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: colors.gold,
              }}
            >
              {shot.tag.name}
            </div>
            <div
              style={{
                fontFamily: sans,
                fontSize: 23,
                letterSpacing: "0.04em",
                color: "rgba(245,239,227,0.85)",
                marginTop: 4,
              }}
            >
              {shot.tag.place}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
};

const minutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
const hhmm = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

// Top centre: the date, the clock and a line. The clock holds on `before`, then runs
// backwards a minute at a time (02:00, 01:59, 01:58 ...) like an odometer: slowly at
// first, spinning through the middle, slowing again so it lands on `after` exactly on the
// snap, where the line under it gives way to the next. Every digit that changes on a tick
// rolls downwards (time going back).
const Clock: React.FC<{ clock: RewindSpec["clock"] }> = ({ clock }) => {
  const frame = useCurrentFrame();
  const { snapAt } = clock;
  const fade = interpolate(
    frame,
    [clock.until - 16, clock.until],
    [1, 0],
    clamp,
  );
  const eyebrowIn = progress(frame, 0, 14);
  const lineOut = progress(frame, snapAt - 6, 10);
  const from = minutes(clock.before);
  const to = minutes(clock.after);
  const t =
    from -
    (from - to) *
      interpolate(frame, [clock.countFrom, snapAt], [0, 1], {
        ...clamp,
        easing: Easing.inOut(Easing.sin),
      });
  const cur = Math.max(Math.ceil(t - 1e-6), to); // the reading leaving
  const next = Math.max(cur - 1, to); // the reading arriving
  const roll = cur === to ? 0 : cur - t; // 0 -> 1 across the tick
  const was = hhmm(cur);
  const now = hhmm(next);
  return (
    <>
      <AbsoluteFill
        style={{
          opacity: fade,
          background:
            "linear-gradient(to bottom, rgba(9,9,10,0.62) 0%, rgba(9,9,10,0.45) 30%, rgba(9,9,10,0) 50%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 270,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: fade,
          textShadow: SHADOW,
        }}
      >
        <div
          style={{
            display: "inline-block",
            fontFamily: sans,
            fontWeight: 600,
            fontSize: 26,
            letterSpacing: "0.3em",
            paddingLeft: "0.3em",
            textTransform: "uppercase",
            color: colors.gold,
            opacity: eyebrowIn,
            transform: `translateY(${(1 - eyebrowIn) * 14}px)`,
            borderBottom: `2px solid ${colors.gold}`,
            paddingBottom: 8,
          }}
        >
          {clock.eyebrow}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: 18,
            fontFamily: serif,
            fontWeight: 500,
            fontSize: 230,
            lineHeight: 1,
            color: colors.gold,
            fontVariantNumeric: "lining-nums tabular-nums",
            opacity: progress(frame, 4, 14),
          }}
        >
          {[...was].map((old, k) => {
            const c = now[k];
            if (old === c || roll === 0) return <span key={k}>{old}</span>;
            return (
              <span
                key={k}
                style={{
                  position: "relative",
                  display: "inline-block",
                  overflow: "hidden",
                  clipPath: "inset(0)",
                  height: 236,
                  verticalAlign: "top",
                }}
              >
                <span style={{ visibility: "hidden" }}>{old}</span>
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    top: `${100 * roll}%`,
                  }}
                >
                  {old}
                </span>
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    top: `${-100 * (1 - roll)}%`,
                  }}
                >
                  {c}
                </span>
              </span>
            );
          })}
        </div>
        <div style={{ position: "relative", height: 96, marginTop: 6 }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 1 - lineOut,
              transform: `translateY(${lineOut * 30}px)`,
            }}
          >
            <Rise text={clock.lines[0]} start={10} style={lineStyle} />
          </div>
          {frame >= snapAt - 2 ? (
            <div style={{ position: "absolute", inset: 0 }}>
              <Rise
                text={clock.lines[1]}
                start={snapAt + 2}
                style={lineStyle}
              />
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};

const lineStyle: React.CSSProperties = {
  fontFamily: serif,
  fontStyle: "italic",
  fontWeight: 500,
  fontSize: 72,
  lineHeight: 1.1,
  color: colors.cream,
};

// A subtle tape-rewind look over the reversed footage (Scott: "a subtle rewind effect"):
// faint scanlines, a slightly washed-out tint and two soft tracking bands sliding up the
// frame. Under the clock, so its text stays sharp; it clears in a few frames before the
// snap, no flashes.
const RewindFX: React.FC<{ snapAt: number }> = ({ snapAt }) => {
  const frame = useCurrentFrame();
  const k = interpolate(frame, [snapAt - 5, snapAt], [1, 0], clamp);
  const band = (period: number, offset: number, height: number) => {
    const p = ((frame + offset) % period) / period;
    const y = 1920 + 200 - p * (1920 + 400);
    return (
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: y,
          height,
          backdropFilter: "blur(2.5px) brightness(1.12)",
          transform: `translateX(${Math.sin(frame * 1.7 + offset) * 6}px)`,
          background:
            "linear-gradient(to bottom, rgba(245,239,227,0) 0%, rgba(245,239,227,0.07) 50%, rgba(245,239,227,0) 100%)",
        }}
      />
    );
  };
  return (
    <AbsoluteFill style={{ opacity: k, pointerEvents: "none" }}>
      <AbsoluteFill
        style={{ backdropFilter: "saturate(0.82) contrast(1.04)" }}
      />
      {band(46, 0, 90)}
      {band(46, 23, 34)}
      <AbsoluteFill
        style={{
          background:
            "repeating-linear-gradient(to bottom, rgba(9,9,10,0.07) 0px, rgba(9,9,10,0.07) 2px, rgba(9,9,10,0) 2px, rgba(9,9,10,0) 5px)",
        }}
      />
    </AbsoluteFill>
  );
};

export const RewindFilm: React.FC<{ film: RewindSpec }> = ({ film }) => {
  const frame = useCurrentFrame();
  const n = film.shots.length;
  const end = (i: number) =>
    i < n - 1 ? film.shots[i + 1].at : film.endAt + film.endFade;
  const out = interpolate(
    frame,
    [film.endAt, film.endAt + film.endFade],
    [1, 0],
    clamp,
  );
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      <Audio
        src={staticFile(film.music.src)}
        trimBefore={film.music.startAt}
        volume={(f) =>
          film.music.gain *
          interpolate(
            f,
            [film.music.fadeFrom, film.durationInFrames],
            [1, 0],
            clamp,
          )
        }
      />
      {film.shots.map((shot, i) => (
        <Sequence
          key={shot.src}
          from={shot.at}
          durationInFrames={end(i) - shot.at}
        >
          <AbsoluteFill style={{ opacity: i === n - 1 ? out : 1 }}>
            <Video
              src={staticFile(shot.src)}
              muted
              objectFit="cover"
              style={{ width: "100%", height: "100%" }}
            />
            <Caption
              shot={shot}
              lines={i === n - 1 ? film.close.lines : undefined}
            />
          </AbsoluteFill>
        </Sequence>
      ))}
      {frame < film.clock.snapAt ? (
        <RewindFX snapAt={film.clock.snapAt} />
      ) : null}
      {frame < film.clock.until ? <Clock clock={film.clock} /> : null}
      {film.watermark ? (
        <Img
          src={staticFile(film.watermark.src)}
          style={{
            position: "absolute",
            left: film.watermark.x,
            top: film.watermark.y,
            width: film.watermark.size[0],
            height: film.watermark.size[1],
            opacity: out,
          }}
        />
      ) : null}
      <Sequence from={film.endAt + film.endFade}>
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            paddingBottom: 140,
          }}
        >
          <CBLogo start={2} width={300} shimmerAt={38} cbOnly />
        </AbsoluteFill>
      </Sequence>
      <FilmFinish />
    </AbsoluteFill>
  );
};
