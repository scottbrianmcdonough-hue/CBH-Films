import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CBLogo } from "../components/CBLogo";
import { FilmFinish } from "../components/FilmFinish";
import { Fizz } from "../components/Fizz";
import { colors, EASE_IN_OUT, EASE_OUT, progress, sans, serif } from "../theme";
import type { Hotel, Move } from "../types";
import type { MotionCaption, MotionSpec, MotionStat } from "./types";

const W = 1080;
const H = 1920;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const GLOW = `drop-shadow(0 0 12px ${colors.lightGold})`;

// ---------------------------------------------------------------------------
// Kinetic type

// Letters arrive one by one, each sharpening out of a blur as it rises into place.
const KineticLine: React.FC<{
  text: string;
  t: number;
  start: number;
  style: React.CSSProperties;
}> = ({ text, t, start, style }) => (
  <div style={{ ...style, whiteSpace: "nowrap" }}>
    {text.split("").map((ch, i) => {
      const p = progress(t, start + i * 1.4, 22);
      return (
        <span
          key={i}
          style={{
            display: "inline-block",
            opacity: p,
            transform: `translateY(${(1 - p) * 0.35}em)`,
            filter: `blur(${(1 - p) * 10}px)`,
          }}
        >
          {ch === " " ? " " : ch}
        </span>
      );
    })}
  </div>
);

// Small gold capitals whose letter-spacing settles as they fade in.
const Eyebrow: React.FC<{ text: string; t: number; start: number }> = ({
  text,
  t,
  start,
}) => {
  const p = progress(t, start, 34);
  return (
    <div
      style={{
        fontFamily: sans,
        fontWeight: 600,
        fontSize: 24,
        letterSpacing: `${0.9 - 0.58 * p}em`,
        textTransform: "uppercase",
        color: colors.gold,
        opacity: p,
        marginBottom: 26,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
};

const Caption: React.FC<
  MotionCaption & { t: number; start: number; top?: number; bottom?: number }
> = ({ eyebrow, lines, t, start, top, bottom }) => (
  <div style={{ position: "absolute", left: 96, right: 120, top, bottom }}>
    <Eyebrow text={eyebrow} t={t} start={start} />
    {lines.map((line, i) => (
      <KineticLine
        key={line}
        text={line}
        t={t}
        start={start + 6 + i * 8}
        style={{
          fontFamily: serif,
          fontSize: 96,
          lineHeight: 1.04,
          color: colors.cream,
          textShadow: "0 2px 24px rgba(9,9,10,0.55)",
        }}
      />
    ))}
  </div>
);

const TopShade: React.FC<{ t: number; start: number }> = ({ t, start }) => (
  <AbsoluteFill
    style={{
      background:
        "linear-gradient(180deg, rgba(9,9,10,0.88) 0%, rgba(9,9,10,0.55) 24%, rgba(9,9,10,0) 48%)",
      opacity: progress(t, start - 10, 30),
    }}
  />
);

// A full-frame photo with a slow camera move across the scene.
const Photo: React.FC<{
  src: string;
  t: number;
  duration: number;
  from: Move;
  to: Move;
}> = ({ src, t, duration, from, to }) => {
  const k = interpolate(t, [0, duration], [0, 1], clamp);
  const lerp = (a: number, b: number) => a + (b - a) * k;
  return (
    <Img
      src={staticFile(src)}
      style={{
        position: "absolute",
        width: W,
        height: H,
        objectFit: "cover",
        objectPosition: `${lerp(from.x, to.x)}% ${lerp(from.y, to.y)}%`,
        transform: `scale(${lerp(from.scale, to.scale)})`,
      }}
    />
  );
};

// ---------------------------------------------------------------------------
// Scenes. Each receives its local frame `t`; `land` is the local frame of its downbeat.

// 1. A gold line draws across the black, then splits into two edges that open like an
// aperture onto the aerial.
const ApertureScene: React.FC<{
  spec: MotionSpec["aerial"];
  land: number;
  duration: number;
}> = ({ spec, land, duration }) => {
  const t = useCurrentFrame();
  const draw = progress(t, 4, 30, EASE_IN_OUT);
  const open = progress(t, 30, land - 30, EASE_IN_OUT);
  const half = (H / 2) * open;
  const lineWidth = interpolate(open, [0, 0.4], [900 * draw, W], clamp);
  const edges = interpolate(t, [land - 10, land + 4], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      <AbsoluteFill
        style={{ clipPath: `inset(${H / 2 - half}px 0 ${H / 2 - half}px 0)` }}
      >
        <Photo
          src={spec.src}
          t={t}
          duration={duration}
          from={spec.from}
          to={spec.to}
        />
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(0deg, rgba(9,9,10,0.92) 0%, rgba(9,9,10,0.75) 32%, rgba(9,9,10,0) 62%)",
            opacity: progress(t, land, 30),
          }}
        />
      </AbsoluteFill>
      {[-1, 1].map((dir) => (
        <div
          key={dir}
          style={{
            position: "absolute",
            left: (W - lineWidth) / 2,
            top: H / 2 + dir * half - 1,
            width: lineWidth,
            height: 2,
            background: colors.lightGold,
            filter: GLOW,
            opacity: edges,
          }}
        />
      ))}
      <Caption
        eyebrow={spec.eyebrow}
        lines={spec.lines}
        t={t}
        start={land + 6}
        bottom={460}
      />
    </AbsoluteFill>
  );
};

// One digit column of an odometer: rolls through a full cycle to land on its digit.
// Cells are taller than the type so neighbouring digits never peek into view.
const Digit: React.FC<{ digit: number; p: number; size: number }> = ({
  digit,
  p,
  size,
}) => {
  const cell = size * 1.3;
  const cells = Array.from({ length: 20 }, (_, i) => i % 10);
  const target = 10 + digit;
  return (
    <span
      style={{
        display: "inline-block",
        height: cell,
        overflow: "hidden",
        verticalAlign: "top",
      }}
    >
      <span
        style={{
          display: "block",
          transform: `translateY(${-target * p * cell}px)`,
        }}
      >
        {cells.map((d, i) => (
          <span
            key={i}
            style={{ display: "block", height: cell, lineHeight: `${cell}px` }}
          >
            {d}
          </span>
        ))}
      </span>
    </span>
  );
};

const Odometer: React.FC<{ stat: MotionStat; t: number; start: number }> = ({
  stat,
  t,
  start,
}) => {
  const size = 180;
  const digits = String(stat.value).split("").map(Number);
  return (
    <div
      style={{
        fontFamily: serif,
        fontWeight: 500,
        fontSize: size,
        fontVariantNumeric: "lining-nums tabular-nums",
        color: colors.lightGold,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        height: size * 1.3,
      }}
    >
      {digits.map((d, i) => (
        <span key={i} style={{ opacity: progress(t, start + i * 4 - 2, 10) }}>
          <Digit
            digit={d}
            size={size}
            p={progress(t, start + i * 4, 40, EASE_IN_OUT)}
          />
        </span>
      ))}
      {stat.suffix ? (
        <span
          style={{
            fontSize: size * 0.5,
            lineHeight: `${size * 1.3}px`,
            marginLeft: 12,
            opacity: progress(t, start + 30, 20),
          }}
        >
          {stat.suffix}
        </span>
      ) : null}
    </div>
  );
};

// 2. A black page rises over the aerial, led by the gold line; three counters roll in
// on successive beats, with gold rules drawing between them.
const StatsScene: React.FC<{ stats: MotionStat[]; land: number }> = ({
  stats,
  land,
}) => {
  const t = useCurrentFrame();
  const rise = progress(t, 0, land, EASE_IN_OUT);
  const rows = [290, 720, 1150]; // last label ends above the 460px bottom safe zone
  return (
    <AbsoluteFill style={{ transform: `translateY(${(1 - rise) * 100}%)` }}>
      <AbsoluteFill style={{ backgroundColor: colors.black }} />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: W,
          height: 2,
          background: colors.lightGold,
          filter: GLOW,
          opacity: 1 - progress(t, land - 4, 12),
        }}
      />
      {stats.map((stat, i) => {
        const start = land + i * 20; // one beat apart
        return (
          <div
            key={stat.label}
            style={{
              position: "absolute",
              top: rows[i],
              width: W,
              textAlign: "center",
            }}
          >
            <Odometer stat={stat} t={t} start={start} />
            <div
              style={{
                fontFamily: sans,
                fontWeight: 600,
                fontSize: 26,
                letterSpacing: "0.32em",
                textTransform: "uppercase",
                color: colors.cream,
                marginTop: 18,
                opacity: progress(t, start + 20, 24),
              }}
            >
              {stat.label}
            </div>
          </div>
        );
      })}
      {[652, 1082].map((y, i) => (
        <div
          key={y}
          style={{
            position: "absolute",
            top: y,
            left: W / 2 - 180,
            width: 360,
            height: 2,
            background: colors.gold,
            transform: `scaleX(${progress(t, land + 14 + i * 20, 30, EASE_IN_OUT)})`,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

// 3. The rooms glide in from alternating sides, turning flat out of a slight 3D angle,
// into an overlapping editorial layout; each photo keeps drifting inside its frame.
const RoomsScene: React.FC<{
  spec: MotionSpec["rooms"];
  land: number;
  duration: number;
}> = ({ spec, land, duration }) => {
  const t = useCurrentFrame();
  const k = interpolate(t, [0, duration], [0, 1], clamp);
  const cards = [
    { src: spec.photos[0], x: 0, y: 690, w: 760, h: 510, from: -1, delay: 0 },
    {
      src: spec.photos[2],
      x: 96,
      y: 1500,
      w: 560,
      h: 370,
      from: -1,
      delay: 10,
    },
    { src: spec.photos[1], x: 380, y: 1110, w: 700, h: 460, from: 1, delay: 5 },
  ];
  return (
    <AbsoluteFill
      style={{ backgroundColor: colors.black, opacity: progress(t, 0, 12) }}
    >
      <AbsoluteFill style={{ perspective: 2000 }}>
        {cards.map((c) => {
          const p = progress(t, 2 + c.delay, land + 8 - c.delay, EASE_OUT);
          return (
            <div
              key={c.src}
              style={{
                position: "absolute",
                left: c.x,
                top: c.y,
                width: c.w,
                height: c.h,
                overflow: "hidden",
                boxShadow: "0 40px 90px rgba(0,0,0,0.6)",
                transform: [
                  `translateX(${c.from * (1 - p) * 115}%)`,
                  `translateY(${-24 * k}px)`,
                  `rotateY(${c.from * -22 * (1 - p)}deg)`,
                ].join(" "),
              }}
            >
              <Img
                src={staticFile(c.src)}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: `scale(${1.16 - 0.12 * k}) translateX(${c.from * -2.5 * k}%)`,
                }}
              />
            </div>
          );
        })}
      </AbsoluteFill>
      <Caption
        eyebrow={spec.eyebrow}
        lines={spec.lines}
        t={t}
        start={land + 10}
        top={250}
      />
    </AbsoluteFill>
  );
};

// 4. A circle opens out from the glass, ringed in gold, with the fizz rising.
const IrisScene: React.FC<{
  spec: MotionSpec["champagne"];
  land: number;
  duration: number;
}> = ({ spec, land, duration }) => {
  const t = useCurrentFrame();
  const [cx, cy] = spec.focus;
  const p = progress(t, 0, land, EASE_IN_OUT);
  const r = 2400 * p ** 1.4;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `circle(${r}px at ${cx}px ${cy}px)` }}>
        <Photo
          src={spec.src}
          t={t}
          duration={duration}
          from={{ scale: 1.0, x: 70, y: 50 }}
          to={{ scale: 1.1, x: 70, y: 46 }}
        />
        <Fizz
          seed="iris-fizz"
          count={80}
          size={[4, 22]}
          speed={[1.5, 4.5]}
          color="255,234,186"
          fadeAbove={0.3}
        />
        <TopShade t={t} start={land} />
      </AbsoluteFill>
      <svg width={W} height={H} style={{ position: "absolute", filter: GLOW }}>
        <circle
          cx={cx}
          cy={cy}
          r={r + 8}
          fill="none"
          stroke={colors.lightGold}
          strokeWidth={3}
          opacity={interpolate(p, [0, 0.1, 0.7, 1], [0, 1, 1, 0])}
        />
      </svg>
      <Caption
        eyebrow={spec.eyebrow}
        lines={spec.lines}
        t={t}
        start={land + 6}
        top={250}
      />
    </AbsoluteFill>
  );
};

// 5. The photo assembles from vertical slices sliding in from alternating directions.
const SLICES = 6;
const SlicesScene: React.FC<{
  spec: MotionSpec["restaurant"];
  land: number;
  duration: number;
}> = ({ spec, land, duration }) => {
  const t = useCurrentFrame();
  const sliceW = W / SLICES;
  const each = land - (SLICES - 1) * 2;
  return (
    <AbsoluteFill>
      {Array.from({ length: SLICES }).map((_, i) => {
        const p = progress(t, i * 2, each, EASE_OUT);
        const dir = i % 2 ? -1 : 1;
        return (
          <AbsoluteFill
            key={i}
            style={{
              clipPath: `inset(0 ${W - (i + 1) * sliceW}px 0 ${i * sliceW}px)`,
              transform: `translateY(${dir * (1 - p) * 100}%)`,
            }}
          >
            <Photo
              src={spec.src}
              t={t}
              duration={duration}
              from={{ scale: 1.12, x: 52, y: 60 }}
              to={{ scale: 1.0, x: 56, y: 60 }}
            />
          </AbsoluteFill>
        );
      })}
      {Array.from({ length: SLICES - 1 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: (i + 1) * sliceW - 1,
            top: 0,
            width: 2,
            height: H,
            background: colors.gold,
            opacity: interpolate(t, [land - 6, land + 10], [0.8, 0], clamp),
          }}
        />
      ))}
      <TopShade t={t} start={land} />
      <Caption
        eyebrow={spec.eyebrow}
        lines={spec.lines}
        t={t}
        start={land + 6}
        top={250}
      />
    </AbsoluteFill>
  );
};

// 6. A glowing gold line sweeps down the screen, revealing the photo behind it.
const ScanScene: React.FC<{
  spec: MotionSpec["spa"];
  land: number;
  duration: number;
}> = ({ spec, land, duration }) => {
  const t = useCurrentFrame();
  const p = progress(t, 0, land, EASE_IN_OUT);
  const y = p * H;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `inset(0 0 ${H - y}px 0)` }}>
        <Photo
          src={spec.src}
          t={t}
          duration={duration}
          from={{ scale: 1.15, x: 68, y: 50 }}
          to={{ scale: 1.0, x: 62, y: 50 }}
        />
        <TopShade t={t} start={land} />
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: y - 1,
          width: W,
          height: 3,
          background: colors.lightGold,
          filter: GLOW,
          opacity: interpolate(p, [0, 0.05, 0.9, 1], [0, 1, 1, 0]),
        }}
      />
      <Caption
        eyebrow={spec.eyebrow}
        lines={spec.lines}
        t={t}
        start={land + 6}
        top={250}
      />
    </AbsoluteFill>
  );
};

// 7. The gold line draws a frame around the hotel name; the CBH logo below.
const EndScene: React.FC<{ hotel: Hotel; land: number }> = ({
  hotel,
  land,
}) => {
  const t = useCurrentFrame();
  const frame = { x: 110, y: 600, w: W - 220, h: 560 };
  return (
    <AbsoluteFill
      style={{ backgroundColor: colors.black, opacity: progress(t, 0, land) }}
    >
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <rect
          x={frame.x}
          y={frame.y}
          width={frame.w}
          height={frame.h}
          fill="none"
          stroke={colors.gold}
          strokeWidth={2}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - progress(t, land - 4, 46, EASE_IN_OUT)}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          top: frame.y,
          height: frame.h,
          width: W,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <KineticLine
          text={hotel.name}
          t={t}
          start={land + 4}
          style={{
            fontFamily: serif,
            fontSize: 104,
            lineHeight: 1.05,
            color: colors.cream,
          }}
        />
        <KineticLine
          text={hotel.subtitle ?? ""}
          t={t}
          start={land + 18}
          style={{
            fontFamily: serif,
            fontSize: 60,
            lineHeight: 1.3,
            color: colors.cream,
          }}
        />
        <div style={{ marginTop: 26 }}>
          <Eyebrow text={hotel.location} t={t} start={land + 30} />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 470,
          width: W,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <CBLogo start={land + 40} width={170} shimmerAt={land + 72} />
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------

// How many frames before its downbeat each scene starts its entrance.
const LEAD = { stats: 24, rooms: 24, iris: 26, slices: 30, scan: 26, end: 18 };

export const MotionFilm: React.FC<{ film: MotionSpec }> = ({ film }) => {
  const { fps } = useVideoConfig();
  const [aerial, stats, rooms, champagne, restaurant, spa, end] = film.beats;
  const leads = [
    LEAD.stats,
    LEAD.rooms,
    LEAD.iris,
    LEAD.slices,
    LEAD.scan,
    LEAD.end,
  ];
  const lands = [stats, rooms, champagne, restaurant, spa, end];
  const starts = lands.map((b, i) => b - leads[i]);
  // Each scene stays until the next one has fully covered it.
  const until = (i: number) =>
    i + 1 < lands.length ? lands[i + 1] : film.durationInFrames;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      <Audio
        src={staticFile(film.music.src)}
        volume={(f) =>
          interpolate(
            f,
            [film.music.fadeFrom, film.durationInFrames],
            [1, 0],
            clamp,
          )
        }
      />
      <Sequence durationInFrames={stats} premountFor={fps}>
        <ApertureScene spec={film.aerial} land={aerial} duration={stats} />
      </Sequence>
      <Sequence
        from={starts[0]}
        durationInFrames={until(0) - starts[0]}
        premountFor={fps}
      >
        <StatsScene stats={film.stats} land={leads[0]} />
      </Sequence>
      <Sequence
        from={starts[1]}
        durationInFrames={until(1) - starts[1]}
        premountFor={fps}
      >
        <RoomsScene
          spec={film.rooms}
          land={leads[1]}
          duration={until(1) - starts[1]}
        />
      </Sequence>
      <Sequence
        from={starts[2]}
        durationInFrames={until(2) - starts[2]}
        premountFor={fps}
      >
        <IrisScene
          spec={film.champagne}
          land={leads[2]}
          duration={until(2) - starts[2]}
        />
      </Sequence>
      <Sequence
        from={starts[3]}
        durationInFrames={until(3) - starts[3]}
        premountFor={fps}
      >
        <SlicesScene
          spec={film.restaurant}
          land={leads[3]}
          duration={until(3) - starts[3]}
        />
      </Sequence>
      <Sequence
        from={starts[4]}
        durationInFrames={until(4) - starts[4]}
        premountFor={fps}
      >
        <ScanScene
          spec={film.spa}
          land={leads[4]}
          duration={until(4) - starts[4]}
        />
      </Sequence>
      <Sequence
        from={starts[5]}
        durationInFrames={until(5) - starts[5]}
        premountFor={fps}
      >
        <EndScene hotel={film.hotel} land={leads[5]} />
      </Sequence>
      <FilmFinish />
    </AbsoluteFill>
  );
};
