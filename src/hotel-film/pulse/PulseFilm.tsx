import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { CBLogo } from "../components/CBLogo";
import { FilmFinish } from "../components/FilmFinish";
import { colors, EASE_IN_OUT, EASE_OUT, progress, sans, serif } from "../theme";
import type { Hotel } from "../types";
import type { PulseShot, PulseSpec } from "./types";

const W = 1080;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

type SceneProps = { film: PulseSpec; t: number; span: number };

// A full-bleed photo with a slow push from `from` to `to` scale over `span` frames and a
// gentle horizontal drift.
const Shot: React.FC<{
  src: string;
  t: number;
  span: number;
  from?: number;
  to?: number;
  x?: number;
  y?: number;
  drift?: number;
}> = ({ src, t, span, from = 1.14, to = 1.02, x = 50, y = 50, drift = 0 }) => {
  const k = interpolate(t, [0, span], [0, 1], clamp);
  return (
    <Img
      src={staticFile(src)}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: `${x + drift * k}% ${y}%`,
        transform: `scale(${from + (to - from) * k})`,
      }}
    />
  );
};

// Letters arrive one by one, rising and sharpening out of a blur.
const Letters: React.FC<{
  text: string;
  t: number;
  start: number;
  step?: number;
  style: React.CSSProperties;
}> = ({ text, t, start, step = 1.4, style }) => (
  <div style={{ whiteSpace: "nowrap", ...style }}>
    {text.split("").map((ch, i) => {
      const p = progress(t, start + i * step, 20);
      return (
        <span
          key={i}
          style={{
            display: "inline-block",
            opacity: p,
            transform: `translateY(${(1 - p) * 0.4}em)`,
            filter: `blur(${(1 - p) * 10}px)`,
          }}
        >
          {ch === " " ? " " : ch}
        </span>
      );
    })}
  </div>
);

// A line that rolls up into place out of its own mask, and can roll out again.
const Roll: React.FC<{
  t: number;
  inAt: number;
  outAt?: number;
  style: React.CSSProperties;
  children: React.ReactNode;
}> = ({ t, inAt, outAt, style, children }) => {
  const enter = progress(t, inAt, 18, EASE_OUT);
  const exit = outAt === undefined ? 0 : progress(t, outAt, 14, EASE_IN_OUT);
  return (
    <div
      style={{
        overflow: "hidden",
        padding: "0.06em 0 0.16em",
        margin: "-0.06em 0 -0.16em",
      }}
    >
      <div
        style={{
          ...style,
          transform: `translateY(${(1 - enter) * 110 - exit * 110}%)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

const eyebrowStyle: React.CSSProperties = {
  fontFamily: sans,
  fontWeight: 600,
  fontSize: 24,
  letterSpacing: "0.32em",
  textTransform: "uppercase",
  color: colors.gold,
};

const headline: React.CSSProperties = {
  fontFamily: serif,
  fontSize: 104,
  lineHeight: 1.02,
  color: colors.cream,
  textShadow: "0 2px 24px rgba(9,9,10,0.55)",
};

const TopShade: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "linear-gradient(180deg, rgba(9,9,10,0.88) 0%, rgba(9,9,10,0.5) 26%, rgba(9,9,10,0) 50%)",
    }}
  />
);

// ---------------------------------------------------------------------------
// Scenes. `t` is frames since the scene's mark; `span` is how long it runs.

// Cold-open flash: a full-bleed photo with a short phrase whose lines fade up and
// sharpen one after another.
const ColdFlash: React.FC<{ shot: PulseShot; t: number; span: number }> = ({
  shot,
  t,
  span,
}) => {
  const lines = shot.words.split("\n");
  const size = Math.max(...lines.map((l) => l.length)) > 8 ? 150 : 200;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      <Shot
        src={shot.src}
        t={t}
        span={span}
        from={1.14}
        to={1.04}
        x={shot.x}
        y={shot.y}
      />
      <AbsoluteFill style={{ backgroundColor: "rgba(9,9,10,0.36)" }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        {lines.map((line, i) => {
          const p = progress(t, 4 + i * 6, 22);
          return (
            <div
              key={line}
              style={{
                fontFamily: serif,
                fontWeight: 500,
                fontSize: size,
                lineHeight: 1,
                textAlign: "center",
                color: colors.cream,
                textShadow: "0 6px 40px rgba(9,9,10,0.55)",
                opacity: p,
                transform: `translateY(${(1 - p) * 0.25}em)`,
                filter: `blur(${(1 - p) * 8}px)`,
              }}
            >
              {line}
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Title: the hotel's front, full-bleed, with a simple heading: the name and subtitle
// rise into place under a small eyebrow.
const Hero: React.FC<SceneProps> = ({ film, t, span }) => (
  <AbsoluteFill style={{ backgroundColor: colors.black }}>
    <Shot
      src={film.hero.src}
      t={t}
      span={span}
      from={1.16}
      to={1.04}
      x={film.hero.x}
      drift={-6}
    />
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(0deg, rgba(9,9,10,0.94) 0%, rgba(9,9,10,0.78) 34%, rgba(9,9,10,0) 64%)",
      }}
    />
    <div style={{ position: "absolute", left: 96, right: 96, bottom: 460 }}>
      <div
        style={{
          ...eyebrowStyle,
          opacity: progress(t, 4, 20),
          marginBottom: 24,
        }}
      >
        {film.hero.eyebrow}
      </div>
      <Roll t={t} inAt={8} style={{ ...headline, fontSize: 112 }}>
        {film.hotel.name}
      </Roll>
      <Roll
        t={t}
        inAt={16}
        style={{ ...headline, fontSize: 56, opacity: 0.9, marginTop: 8 }}
      >
        {film.hotel.subtitle}
      </Roll>
    </div>
  </AbsoluteFill>
);

// Food: the dish full-bleed with a slow push; the caption rolls over on a beat.
const Food: React.FC<SceneProps> = ({ film, t, span }) => {
  const { food, marks } = film;
  const swap = marks.foodSwap - marks.food;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      <Shot
        src={food.src}
        t={t}
        span={span}
        from={1.08}
        to={1.0}
        x={46}
        drift={6}
      />
      <TopShade />
      <div style={{ position: "absolute", left: 96, right: 120, top: 250 }}>
        <div
          style={{
            ...eyebrowStyle,
            opacity: progress(t, 2, 18),
            marginBottom: 22,
          }}
        >
          {food.eyebrow}
        </div>
        <div style={{ position: "relative" }}>
          {food.first.map((line, i) => (
            <Roll
              key={line}
              t={t}
              inAt={6 + i * 6}
              outAt={swap - 4}
              style={headline}
            >
              {line}
            </Roll>
          ))}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0 }}>
            {food.second.map((line, i) => (
              <Roll key={line} t={t} inAt={swap + 4 + i * 6} style={headline}>
                {line}
              </Roll>
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// A full-bleed photo whose caption lands one line per beat (spa, closing).
const LinesScene: React.FC<{
  spec: { src: string; eyebrow: string; lines: string[]; x?: number };
  gap: number;
  t: number;
  span: number;
}> = ({ spec, gap, t, span }) => (
  <AbsoluteFill style={{ backgroundColor: colors.black }}>
    <Shot src={spec.src} t={t} span={span} from={1.16} to={1.04} x={spec.x} />
    <TopShade />
    <div style={{ position: "absolute", left: 96, right: 120, top: 250 }}>
      <div
        style={{
          ...eyebrowStyle,
          opacity: progress(t, 0, 14),
          marginBottom: 22,
        }}
      >
        {spec.eyebrow}
      </div>
      {spec.lines.map((line, i) => (
        <Roll key={line} t={t} inAt={i * gap - 2} style={headline}>
          {line}
        </Roll>
      ))}
    </div>
  </AbsoluteFill>
);

const beatGap = (film: PulseSpec) => film.beats[1] - film.beats[0];

const Spa: React.FC<SceneProps> = ({ film, t, span }) =>
  film.spa ? (
    <LinesScene spec={film.spa} gap={beatGap(film)} t={t} span={span} />
  ) : null;

const Closing: React.FC<SceneProps> = ({ film, t, span }) =>
  film.closing ? (
    <LinesScene spec={film.closing} gap={beatGap(film)} t={t} span={span} />
  ) : null;

// Golf: a giant gold-outline number counts up over the course as the camera pans.
const Golf: React.FC<SceneProps> = ({ film, t, span }) => {
  const { golf } = film;
  const gap = beatGap(film);
  const n = Math.round(
    interpolate(t, [0, gap * 1.4], [0, golf.value], {
      ...clamp,
      easing: EASE_OUT,
    }),
  );
  const [x0, x1] = golf.x ?? [20, 40];
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      <Shot
        src={golf.src}
        t={t}
        span={span}
        from={1.12}
        to={1.04}
        x={x0}
        drift={x1 - x0}
      />
      <AbsoluteFill style={{ backgroundColor: "rgba(9,9,10,0.25)" }} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: 260,
        }}
      >
        <svg width={W} height={560} style={{ overflow: "visible" }}>
          <text
            x={W / 2}
            y={470}
            textAnchor="middle"
            fontFamily={serif}
            fontWeight={500}
            fontSize={560}
            fill="rgba(9,9,10,0.18)"
            stroke={colors.lightGold}
            strokeWidth={4}
            style={{ fontVariantNumeric: "lining-nums tabular-nums" }}
            opacity={progress(t, 0, 8)}
          >
            {n}
          </text>
        </svg>
        <div
          style={{
            ...eyebrowStyle,
            fontSize: 34,
            letterSpacing: "0.36em",
            color: colors.cream,
            textShadow: "0 2px 20px rgba(9,9,10,0.7)",
            marginTop: 10,
            opacity: progress(t, gap, 18),
            transform: `translateY(${(1 - progress(t, gap, 18)) * 20}px)`,
          }}
        >
          {golf.label}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Room: the caption builds letter by letter over a slow push.
const Room: React.FC<SceneProps> = ({ film, t, span }) =>
  film.room ? (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      <Shot
        src={film.room.src}
        t={t}
        span={span}
        from={1.2}
        to={1.04}
        x={film.room.x}
        drift={6}
      />
      <TopShade />
      <div style={{ position: "absolute", left: 96, right: 120, top: 250 }}>
        <div
          style={{
            ...eyebrowStyle,
            opacity: progress(t, 0, 16),
            marginBottom: 22,
          }}
        >
          {film.room.eyebrow}
        </div>
        {film.room.lines.map((line, i) => (
          <Letters
            key={line}
            text={line}
            t={t}
            start={4 + i * 10}
            style={headline}
          />
        ))}
      </div>
    </AbsoluteFill>
  ) : null;

// End card: on black, as across every CBH film.
const End: React.FC<{ hotel: Hotel; t: number; mark: number }> = ({
  hotel,
  t,
  mark,
}) => (
  <AbsoluteFill
    style={{
      backgroundColor: colors.black,
      alignItems: "center",
      justifyContent: "center",
      opacity: progress(t, 0, 10),
    }}
  >
    <Letters
      text={hotel.name}
      t={t}
      start={4}
      style={{
        fontFamily: serif,
        fontSize: 108,
        color: colors.cream,
        lineHeight: 1.05,
      }}
    />
    <Letters
      text={hotel.subtitle ?? ""}
      t={t}
      start={18}
      step={0.9}
      style={{
        fontFamily: serif,
        fontSize: 56,
        color: colors.cream,
        opacity: 0.9,
        lineHeight: 1.3,
      }}
    />
    <div
      style={{ ...eyebrowStyle, marginTop: 30, opacity: progress(t, 30, 24) }}
    >
      {hotel.location}
    </div>
    <div style={{ position: "absolute", bottom: 470 }}>
      <CBLogo start={mark + 40} width={180} shimmerAt={mark + 72} />
    </div>
  </AbsoluteFill>
);

// Scenes overlap by this many frames, dissolving into each other just before each beat.
const DISSOLVE = 8;

export const PulseFilm: React.FC<{ film: PulseSpec }> = ({ film }) => {
  const frame = useCurrentFrame();
  const m = film.marks;
  const per = film.coldOpenBeats ?? 1;
  const flashStarts = film.coldOpen.map((_, i) =>
    i === 0 ? 0 : film.beats[i * per],
  );
  // [start, end, render(t, span)] for every scene in order, cold-open flashes included.
  const scenes: Array<
    [number, number, (t: number, span: number) => React.ReactNode]
  > = [
    ...film.coldOpen.map(
      (shot, i) =>
        [
          flashStarts[i],
          flashStarts[i + 1] ?? m.hero,
          (t: number, span: number) => (
            <ColdFlash shot={shot} t={t} span={span} />
          ),
        ] as [number, number, (t: number, span: number) => React.ReactNode],
    ),
    ...(
      [
        [m.hero, Hero],
        [m.food, Food],
        [m.spa, Spa],
        [m.golf, Golf],
        [m.room, Room],
        [m.closing, Closing],
        [m.end, () => null],
      ] as Array<[number | undefined, React.FC<SceneProps>]>
    )
      // Skip optional scenes the spec leaves out; each scene runs until the next one.
      .filter((s): s is [number, React.FC<SceneProps>] => s[0] !== undefined)
      .flatMap(([a, Scene], i, all) =>
        i < all.length - 1
          ? [
              [a, all[i + 1][0], Scene] as [
                number,
                number,
                React.FC<SceneProps>,
              ],
            ]
          : [],
      )
      .map(
        ([a, b, Scene]) =>
          [
            a,
            b,
            (t: number, span: number) => (
              <Scene film={film} t={t} span={span} />
            ),
          ] as [number, number, (t: number, span: number) => React.ReactNode],
      ),
    [
      m.end,
      film.durationInFrames,
      (t: number) => <End hotel={film.hotel} t={t} mark={m.end} />,
    ],
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      <Audio
        src={staticFile(film.music.src)}
        trimBefore={film.music.startAt}
        volume={(f) =>
          (film.music.gain ?? 1) *
          interpolate(
            f,
            [film.music.fadeFrom, film.durationInFrames],
            [1, 0],
            clamp,
          )
        }
      />
      {scenes.map(([a, b, render], i) => {
        const from = i === 0 ? a : a - DISSOLVE;
        if (frame < from || frame >= b) return null;
        return (
          <AbsoluteFill
            key={i}
            style={{
              opacity:
                i === 0 ? 1 : progress(frame, from, DISSOLVE, EASE_IN_OUT),
            }}
          >
            {render(frame - a, b - a)}
          </AbsoluteFill>
        );
      })}
      <FilmFinish />
    </AbsoluteFill>
  );
};
