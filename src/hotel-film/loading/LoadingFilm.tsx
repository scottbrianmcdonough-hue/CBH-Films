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
import { FilmFinish } from "../components/FilmFinish";
import { EndCard } from "../footage/FootageFilm";
import { colors, EASE_OUT, progress, sans, serif } from "../theme";
import type { LoadingSpec } from "./types";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const SHADOW = "0 2px 28px rgba(9,9,10,0.75)";
const JUMP = 12; // frames for the bar to jump to its next percentage
const FIRST_JUMP = 10; // on the first shot the bar shows 0% for a moment first
const BAR_W = 800;
// Scott: "keep the energy up". The rod overshoots a touch and settles (the readout never
// shows the overshoot), and every cut after the first is a wipe in step with the jump: the
// next shot sweeps in from the left behind a soft warm light as the bar climbs.
const SPRING = Easing.out(Easing.back(1.7));
export const WIPE = JUMP; // the channel runs x 80 -> 880, clear of the CB mark and the buttons

// A line rising out of its own mask.
const Rise: React.FC<{
  text: string;
  start: number;
  style: React.CSSProperties;
}> = ({ text, start, style }) => {
  const frame = useCurrentFrame();
  const p = progress(frame, start, 16);
  return (
    <div style={{ overflow: "hidden", paddingBottom: 6 }}>
      <div style={{ ...style, transform: `translateY(${(1 - p) * 105}%)` }}>
        {text}
      </div>
    </div>
  );
};

// The frame each shot's jump starts on.
const jumpAt = (film: LoadingSpec, i: number) =>
  film.shots[i].at + (i === 0 ? FIRST_JUMP : 0);

// Where the bar is at `frame` (`pct`, overshoot included) and the percentage it is heading
// for (`target`): it holds each shot's percentage and springs to the next on the cut.
const level = (film: LoadingSpec, frame: number) => {
  let pct = 0;
  let target = 0;
  let held = 0;
  for (const [i, s] of film.shots.entries()) {
    const from = jumpAt(film, i);
    if (frame < from) break;
    pct = interpolate(frame, [from, from + JUMP], [held, s.pct], {
      ...clamp,
      easing: SPRING,
    });
    held = target = s.pct;
  }
  return { pct: Math.min(pct, 100), target };
};

// The bar: a polished gold rod in a recessed smoked-glass channel, shaded as a cylinder
// (warm highlights only, never white: Scott found pale highlights read as "gold and
// white"), a soft glow at its leading end, a cast shadow and a faint reflection on the
// picture under it, and fine notches at the quarters. After each jump one soft sheen runs
// along the rod.
const Bar: React.FC<{ pct: number; jumpEnd: number }> = ({ pct, jumpEnd }) => {
  const frame = useCurrentFrame();
  const fillW = Math.max(0, ((BAR_W - 10) * pct) / 100);
  const sheen = interpolate(frame, [jumpEnd, jumpEnd + 26], [-0.2, 1.2], clamp);
  const sheenOn = frame >= jumpEnd && frame < jumpEnd + 26;
  return (
    <div style={{ position: "relative", width: BAR_W }}>
      <div
        style={{
          position: "relative",
          height: 34,
          borderRadius: 17,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.72), rgba(20,18,16,0.55) 60%, rgba(60,50,35,0.45))",
          backdropFilter: "blur(14px)",
          boxShadow:
            "inset 0 4px 8px rgba(0,0,0,0.85), inset 0 -1px 0 rgba(195,158,85,0.35), 0 1px 0 rgba(245,225,180,0.18), 0 18px 40px rgba(0,0,0,0.55)",
          border: "1px solid rgba(195,158,85,0.42)",
        }}
      >
        {pct > 0.5 ? (
          <div
            style={{
              position: "absolute",
              left: 5,
              top: 5,
              bottom: 5,
              width: fillW,
              borderRadius: 12,
              overflow: "hidden",
              background: [
                "linear-gradient(to bottom, rgba(255,232,180,0) 0, rgba(255,232,180,0.55) 18%, rgba(255,232,180,0) 34%)",
                "repeating-linear-gradient(90deg, rgba(255,240,200,0.05) 0 2px, rgba(0,0,0,0.05) 2px 5px)",
                "linear-gradient(to bottom, #7d5c25 0%, #d9b46c 20%, #c39e55 46%, #9c7a3b 70%, #5e4418 100%)",
              ].join(", "),
              boxShadow:
                "0 0 18px rgba(195,158,85,0.55), 0 3px 6px rgba(0,0,0,0.6), inset 0 -2px 3px rgba(60,40,10,0.6)",
            }}
          >
            {sheenOn ? (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  width: 120,
                  left: sheen * fillW - 60,
                  background:
                    "linear-gradient(90deg, rgba(255,228,170,0), rgba(255,228,170,0.45), rgba(255,228,170,0))",
                }}
              />
            ) : null}
          </div>
        ) : null}
        {pct > 0.5 ? (
          <div
            style={{
              position: "absolute",
              left: 5 + fillW - 26,
              top: "50%",
              width: 46,
              height: 46,
              transform: "translateY(-50%)",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(255,226,160,0.85) 0, rgba(214,176,100,0.45) 30%, rgba(195,158,85,0) 70%)",
            }}
          />
        ) : null}
        {[25, 50, 75].map((q) => (
          <div
            key={q}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${q}%`,
              width: 1,
              background: "rgba(9,9,10,0.55)",
              boxShadow: "1px 0 0 rgba(245,225,180,0.12)",
            }}
          />
        ))}
      </div>
      <div
        style={{
          height: 30,
          width: fillW + 10,
          marginTop: 6,
          borderRadius: 15,
          opacity: 0.28,
          filter: "blur(7px)",
          background:
            "linear-gradient(to bottom, rgba(195,158,85,0.9), rgba(195,158,85,0))",
        }}
      />
    </div>
  );
};

// Bottom-left block over a lower-third shade: the italic headline (the hook on the first
// shot, the close at 100%), the step name and the percentage, then the bar.
const Block: React.FC<{ film: LoadingSpec }> = ({ film }) => {
  const frame = useCurrentFrame();
  const n = film.shots.length;
  let i = 0;
  while (i < n - 1 && frame >= film.shots[i + 1].at) i++;
  const shot = film.shots[i];
  const { pct, target } = level(film, frame);
  const jumpEnd = shot.at + (i === 0 ? FIRST_JUMP : 0) + JUMP;
  const out = interpolate(
    frame,
    [film.endAt, film.endAt + film.endFade],
    [1, 0],
    clamp,
  );
  const next = film.shots[1]?.at ?? film.endAt;
  const hookOut = interpolate(frame, [next - 12, next], [1, 0], clamp);
  const headline =
    i === 0 ? film.hook : i === n - 1 ? film.close : ([] as string[]);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to top, rgba(9,9,10,0.9) 0%, rgba(9,9,10,0.72) 24%, rgba(9,9,10,0.35) 40%, rgba(9,9,10,0) 54%)",
        }}
      />
      {headline.length ? (
        // a deeper shade behind the headline, so it reads on pale shots (the white robe)
        <AbsoluteFill
          style={{
            opacity: i === 0 ? hookOut : progress(frame, jumpEnd - 4, 14),
            background:
              "radial-gradient(ellipse 80% 22% at 28% 63%, rgba(9,9,10,0.55) 0%, rgba(9,9,10,0.3) 55%, rgba(9,9,10,0) 100%)",
          }}
        />
      ) : null}
      <div
        style={{ position: "absolute", left: 80, bottom: 460, width: BAR_W }}
      >
        <div style={{ opacity: i === 0 ? hookOut : 1, marginBottom: 34 }}>
          {headline.map((t, k) => (
            <Rise
              key={`${i}-${t}`}
              text={t}
              // the hook is there from frame one; the close rises once the bar hits 100%
              start={i === 0 ? -100 : jumpEnd + k * 5}
              style={{
                fontFamily: serif,
                fontStyle: "italic",
                fontWeight: 500,
                fontSize: 124,
                lineHeight: 1.0,
                color: colors.cream,
                textShadow: SHADOW,
              }}
            />
          ))}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 28,
            textShadow: SHADOW,
          }}
        >
          <Rise
            key={shot.label}
            text={shot.label}
            start={shot.at + 2}
            style={{
              fontFamily: sans,
              fontWeight: 600,
              fontSize: 26,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: colors.gold,
            }}
          />
          <div
            style={{
              fontFamily: serif,
              fontWeight: 400,
              fontSize: 100,
              lineHeight: 1,
              color: colors.cream,
              fontVariantNumeric: "lining-nums tabular-nums",
            }}
          >
            {Math.round(Math.min(pct, target))}%
          </div>
        </div>
        <Bar pct={pct} jumpEnd={jumpEnd} />
      </div>
    </AbsoluteFill>
  );
};

// The cut as a wipe: the incoming shot is revealed left to right over the bar's jump (the
// same frames, the same ease, without the overshoot), its edge a soft warm light rather
// than a line, so the bar seems to sweep the next shot in.
const Wipe: React.FC<{ on: boolean; children: React.ReactNode }> = ({
  on,
  children,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, WIPE], [0, 1], {
    ...clamp,
    easing: EASE_OUT,
  });
  if (!on || p >= 1) return <>{children}</>;
  const x = p * 1080;
  const glow = Math.sin(Math.PI * p);
  return (
    <>
      <AbsoluteFill style={{ clipPath: `inset(0 ${(1 - p) * 100}% 0 0)` }}>
        {children}
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: x - 90,
          width: 180,
          opacity: 0.55 * glow,
          mixBlendMode: "screen",
          background:
            "linear-gradient(90deg, rgba(255,226,160,0), rgba(255,214,140,0.45) 50%, rgba(255,226,160,0))",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: x - 3,
          width: 6,
          opacity: 0.6 * glow,
          filter: "blur(3px)",
          background: "rgba(255,230,175,0.8)",
        }}
      />
    </>
  );
};

export const LoadingFilm: React.FC<{ film: LoadingSpec }> = ({ film }) => {
  const frame = useCurrentFrame();
  const n = film.shots.length;
  const cardAt = film.endAt + film.endFade;
  // each shot runs on under the next one's wipe
  const end = (i: number) => (i < n - 1 ? film.shots[i + 1].at + WIPE : cardAt);
  const out = interpolate(frame, [film.endAt, cardAt], [1, 0], clamp);
  const sfx = film.sfx;
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
      {film.shots.map((shot, i) => (
        <Sequence
          key={shot.src}
          from={shot.at}
          durationInFrames={end(i) - shot.at}
        >
          <Wipe on={i > 0}>
            <AbsoluteFill style={{ opacity: i === n - 1 ? out : 1 }}>
              {shot.lift ? (
                // the strip a raised shot uncovers at the foot (the 99% spa clip left a black band under the bar):
                // filled with a blurred, darkened copy of the same clip, so the frame stays full 9:16
                <Video
                  src={staticFile(shot.src)}
                  muted
                  objectFit="cover"
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    filter: "blur(36px) brightness(0.6)",
                    transform: "scale(1.15)",
                  }}
                />
              ) : null}
              <Video
                src={staticFile(shot.src)}
                muted
                objectFit="cover"
                style={{
                  width: "100%",
                  height: "100%",
                  ...(shot.lift
                    ? {
                        transform: `translateY(${-shot.lift}px)`,
                        maskImage:
                          "linear-gradient(to bottom, black 88%, transparent 100%)",
                      }
                    : {}),
                }}
              />
            </AbsoluteFill>
          </Wipe>
        </Sequence>
      ))}
      {sfx
        ? film.shots.map((s, i) =>
            i < n - 1 ? (
              <Sequence key={`sfx-${s.at}`} from={jumpAt(film, i)}>
                <Audio src={staticFile(sfx.jump)} volume={sfx.gain} />
              </Sequence>
            ) : (
              <Sequence key={`sfx-${s.at}`} from={s.at + JUMP - 2}>
                <Audio src={staticFile(sfx.done)} volume={sfx.gain} />
              </Sequence>
            ),
          )
        : null}
      {frame < cardAt ? <Block film={film} /> : null}
      <Sequence from={cardAt}>
        <EndCard
          lines={film.endCard.lines}
          location={film.endCard.location}
          award={film.endCard.award}
          placeFirst
          rule={false}
          delay={2}
        />
      </Sequence>
      {/* Scott: no gold shimmer logo; the white grid-safe CB mark stays put to the end,
          over the end card too */}
      {film.watermark ? (
        <Img
          src={staticFile(film.watermark.src)}
          style={{
            position: "absolute",
            left: film.watermark.x,
            top: film.watermark.y,
            width: film.watermark.size[0],
            height: film.watermark.size[1],
          }}
        />
      ) : null}
      <FilmFinish />
    </AbsoluteFill>
  );
};
