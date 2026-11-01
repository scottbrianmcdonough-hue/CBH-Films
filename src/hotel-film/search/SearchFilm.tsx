import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import {
  AbsoluteFill,
  Img,
  interpolate,
  interpolateColors,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { FilmFinish } from "../components/FilmFinish";
import { Fizz } from "../components/Fizz";
import { EndCard } from "../footage/FootageFilm";
import { colors, EASE_IN_OUT, progress, sans, serif } from "../theme";
import type { SearchShot, SearchSpec } from "./types";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// The bar's two places: centred on black for the query, then (scaled down) in the top
// safe zone over the answer.
const CENTRE_TOP = 810;
const TOP = 250;
const TOP_SCALE = 0.78;
const GLIDE = 28; // frames, centred on the first cut

// A thin gold magnifier: the only mark in the bar.
const Magnifier: React.FC = () => (
  <svg width={46} height={46} viewBox="0 0 46 46" style={{ flexShrink: 0 }}>
    <circle
      cx={19}
      cy={19}
      r={14}
      fill="none"
      stroke={colors.gold}
      strokeWidth={2.5}
    />
    <line
      x1={29.5}
      y1={29.5}
      x2={42}
      y2={42}
      stroke={colors.gold}
      strokeWidth={2.5}
      strokeLinecap="round"
    />
  </svg>
);

// The search bar, drawn over the whole film: it fades up on black, types the query in at
// a steady pace behind a gold caret, then it glides up into the top safe zone. While a
// shot plays, the part of the query that shot answers turns gold (no underline: Scott
// found growing lines in every film); the bar fades out into the end card.
const SearchBar: React.FC<{ film: SearchSpec }> = ({ film }) => {
  const frame = useCurrentFrame();
  const total = film.query.reduce((n, q) => n + q.text.length, 0);
  const typed = Math.floor(
    interpolate(frame, [film.typeFrom, film.typeTo], [0, total], clamp),
  );
  const first = film.cuts[0];
  const endCut = film.cuts[film.cuts.length - 1];
  const glide = progress(frame, first - GLIDE / 2, GLIDE, EASE_IN_OUT);
  const appear = progress(frame, 0, 16);
  const out = 1 - progress(frame, endCut - film.crossfade / 2, film.crossfade);
  // Solid while typing, then a slow blink until the glide.
  const idle = frame > film.typeTo;
  const caretOn =
    frame < first - GLIDE / 2 && (!idle || Math.floor(frame / 15) % 2 === 0);

  // How lit each query part is: the shot answering it lights it after its cut lands and
  // lets it go just before the next cut. Back-to-back shots answering the same part keep
  // it lit across the cut.
  const lit = (part: number) => {
    let h = 0;
    film.shots.forEach((s, i) => {
      // Each run of consecutive shots answering this part is one window.
      if (s.match !== part || film.shots[i - 1]?.match === part) return;
      let last = i;
      while (film.shots[last + 1]?.match === part) last++;
      const from = film.cuts[i];
      const to = film.cuts[last + 1];
      h = Math.max(
        h,
        Math.min(
          progress(frame, from + 8, 16),
          1 - progress(frame, to - 12, 12),
        ),
      );
    });
    return h;
  };

  let used = 0;
  const parts = film.query.map((q, i) => {
    const start = used;
    used += q.text.length;
    const shown = Math.max(0, Math.min(q.text.length, typed - start));
    const caretHere =
      caretOn &&
      typed >= start &&
      typed <= used &&
      (typed < used || i === film.query.length - 1);
    const h = q.match === undefined ? 0 : lit(q.match);
    return (
      <span
        key={i}
        style={{
          color: interpolateColors(h, [0, 1], [colors.cream, colors.gold]),
        }}
      >
        {q.text.slice(0, shown)}
        {caretHere ? (
          <span
            style={{ position: "relative", display: "inline-block", width: 0 }}
          >
            <span
              style={{
                position: "absolute",
                left: 3,
                top: "-0.92em",
                width: 3,
                height: "1.1em",
                background: colors.gold,
              }}
            />
          </span>
        ) : null}
        <span style={{ color: "transparent" }}>{q.text.slice(shown)}</span>
      </span>
    );
  });

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <div
        style={{
          position: "absolute",
          left: 72,
          width: 936,
          top: interpolate(glide, [0, 1], [CENTRE_TOP, TOP]),
          transform: `translateY(${(1 - appear) * 24}px) scale(${interpolate(glide, [0, 1], [1, TOP_SCALE])})`,
          transformOrigin: "50% 0",
          opacity: appear,
        }}
      >
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            gap: 30,
            padding: "36px 46px",
            borderRadius: 46,
            border: `1.5px solid rgba(195,158,85,0.75)`,
            background: "rgba(9,9,10,0.66)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 18px 60px rgba(0,0,0,0.45)",
          }}
        >
          <Magnifier />
          <div
            style={{
              fontFamily: sans,
              fontWeight: 300,
              fontSize: 48,
              lineHeight: 1.3,
              whiteSpace: "pre-wrap",
            }}
          >
            {parts}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// A line rising out of its own mask (the one text move).
const Land: React.FC<{ at: number; children: React.ReactNode }> = ({
  at,
  children,
}) => {
  const frame = useCurrentFrame();
  const p = progress(frame, at, 16);
  return (
    <div
      style={{
        overflow: "hidden",
        paddingBottom: "0.1em",
        marginBottom: "-0.1em",
      }}
    >
      <div style={{ transform: `translateY(${(1 - p) * 135}%)` }}>
        {children}
      </div>
    </div>
  );
};

// The answer's caption: bottom-left over a lower-third gradient, a gold caps eyebrow, the
// serif claim and an optional small line. No drawing rule (Scott: it's in every film);
// A still gold underline the width of the eyebrow rises with it (the house default; Scott).
const Caption: React.FC<{
  eyebrow: string;
  lines: string[];
  small?: string;
  at: number;
  rule?: boolean;
}> = ({ eyebrow, lines, small, at, rule }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(9,9,10,0) 44%, rgba(9,9,10,0.66) 62%, rgba(9,9,10,0.76) 78%, rgba(9,9,10,0.4) 100%)",
          opacity: progress(frame, at - 8, 14),
        }}
      />
      <div style={{ position: "absolute", left: 72, bottom: 500 }}>
        <Land at={at}>
          <div
            style={{
              fontFamily: sans,
              fontWeight: 600,
              fontSize: 28,
              letterSpacing: "0.26em",
              textTransform: "uppercase",
              color: colors.gold,
              marginBottom: 14,
              textShadow: "0 2px 14px rgba(9,9,10,0.7)",
              whiteSpace: "nowrap",
            }}
          >
            <span
              style={
                rule
                  ? {
                      display: "inline-block",
                      // The trailing letter-space would overhang the rule.
                      marginRight: "-0.26em",
                      paddingRight: 0,
                      paddingBottom: 8,
                      borderBottom: `2px solid ${colors.gold}`,
                      boxShadow: "0 6px 10px -8px rgba(9,9,10,0.6)",
                    }
                  : undefined
              }
            >
              <span style={rule ? { marginRight: "-0.26em" } : undefined}>
                {eyebrow}
              </span>
            </span>
          </div>
        </Land>
        <div style={{ display: "inline-block" }}>
          {lines.map((line, i) => (
            <Land key={line} at={at + 4 * (i + 1)}>
              <div
                style={{
                  fontFamily: serif,
                  fontSize: 84,
                  lineHeight: 1.04,
                  color: colors.cream,
                  whiteSpace: "nowrap",
                  textShadow: "0 2px 22px rgba(9,9,10,0.55)",
                }}
              >
                {line}
              </div>
            </Land>
          ))}
        </div>
        {small ? (
          <Land at={at + 4 * (lines.length + 1)}>
            <div
              style={{
                fontFamily: sans,
                fontSize: 31,
                letterSpacing: "0.04em",
                color: colors.cream,
                marginTop: 18,
                textShadow: "0 2px 16px rgba(9,9,10,0.7)",
              }}
            >
              {small}
            </div>
          </Land>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

// A full-bleed still with the barely-there push (linear 1.00 -> 1.04, centred).
const Still: React.FC<{ shot: SearchShot; frames: number }> = ({
  shot,
  frames,
}) => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, frames], [1, 1.04], clamp);
  const x = shot.pan
    ? interpolate(frame, [0, frames], shot.pan, {
        ...clamp,
        easing: EASE_IN_OUT,
      })
    : (shot.x ?? 50);
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: colors.black }}>
      <Img
        src={staticFile(shot.src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: `${x}% ${shot.y ?? 50}%`,
          transform: `scale(${zoom})`,
        }}
      />
      {shot.fizz ? (
        <Fizz
          seed="search-fizz"
          count={80}
          size={[4, 20]}
          speed={[1.5, 4.5]}
          color="255,234,186"
          fadeAbove={0.3}
        />
      ) : null}
    </AbsoluteFill>
  );
};

export const SearchFilm: React.FC<{ film: SearchSpec }> = ({ film }) => {
  const frame = useCurrentFrame();
  const bounds = [0, ...film.cuts, film.durationInFrames];
  const n = bounds.length - 1; // the search, the shots, the end card
  const x = film.crossfade;
  const len = (i: number) =>
    bounds[i + 1] - bounds[i] + (i > 0 ? x / 2 : 0) + (i < n - 1 ? x / 2 : 0);
  const first = film.cuts[0];
  const endCut = film.cuts[film.cuts.length - 1];
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
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={len(0) + (GLIDE - x) / 2}>
          <AbsoluteFill style={{ backgroundColor: colors.black }} />
        </TransitionSeries.Sequence>
        {film.shots.flatMap((shot, i) => [
          <TransitionSeries.Transition
            key={`t${i}`}
            presentation={fade()}
            timing={linearTiming({
              // The first shot fades up under the bar's glide.
              durationInFrames: i === 0 ? GLIDE : x,
              easing: EASE_IN_OUT,
            })}
          />,
          <TransitionSeries.Sequence
            key={`s${i}`}
            durationInFrames={len(i + 1) + (i === 0 ? (GLIDE - x) / 2 : 0)}
          >
            <Still shot={shot} frames={len(i + 1)} />
          </TransitionSeries.Sequence>,
        ])}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: x, easing: EASE_IN_OUT })}
        />
        <TransitionSeries.Sequence durationInFrames={len(n - 1)}>
          <EndCard
            lines={film.endCard.lines}
            location={film.endCard.location}
            logo="cb-shimmer"
            rule={false}
            delay={x}
          />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      {film.shots.map((shot, i) => {
        const from = film.cuts[i];
        const to = film.cuts[i + 1];
        // The first caption waits for the bar to settle; the rest land after each fade.
        const at = i === 0 ? GLIDE / 2 + 6 : x / 2 + 2;
        return (
          <Sequence key={`c${i}`} from={from} durationInFrames={to - from}>
            <Caption
              {...shot.caption}
              at={at}
              rule={film.eyebrowRule ?? true}
            />
          </Sequence>
        );
      })}
      <SearchBar film={film} />
      {film.watermark ? (
        <Img
          src={staticFile(film.watermark.src)}
          style={{
            position: "absolute",
            left: film.watermark.x,
            top: film.watermark.y,
            width: film.watermark.size[0],
            height: film.watermark.size[1],
            opacity: Math.min(
              progress(frame, first - GLIDE / 2, GLIDE),
              1 - progress(frame, endCut - x / 2, x),
            ),
          }}
        />
      ) : null}
      <FilmFinish />
    </AbsoluteFill>
  );
};
