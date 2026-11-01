import { Audio, Video } from "@remotion/media";
import {
  AbsoluteFill,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { FilmFinish } from "../components/FilmFinish";
import { SCRIM } from "../footage/FootageFilm";
import { colors, EASE_IN_OUT, EASE_OUT, progress, serif } from "../theme";
import {
  beatFrame,
  mixedFrames,
  type MixedShot,
  type MixedSpec,
} from "./types";

const H = 1920;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const LIFT = "0 3px 28px rgba(9,9,10,0.55), 0 1px 3px rgba(9,9,10,0.45)";

// Two looks pushed well apart (Scott: "make the difference more noticeable"). At ours: the
// deck reel's autumn grade (Scott: "give it an autumn grade", summer greens toward gold),
// warmer and richer, with an amber glow. Everywhere else: almost colourless, darker and
// cold, under a blue-grey wash. `look(w)` blends them, 0 cold to 1 warm.
const COLD = { sepia: 0, hue: 0, sat: 0.12, bright: 0.76, contrast: 1.12 };
const WARM = { sepia: 0.32, hue: -14, sat: 1.38, bright: 1.03, contrast: 1.06 };
const look = (w: number) => {
  const m = (k: keyof typeof COLD) => COLD[k] + (WARM[k] - COLD[k]) * w;
  return `sepia(${m("sepia")}) hue-rotate(${m("hue")}deg) saturate(${m("sat")}) brightness(${m("bright")}) contrast(${m("contrast")})`;
};
const COLD_WASH = "rgba(64,88,116,0.42)"; // multiplied
const WARM_WASH = "rgba(255,150,60,0.16)"; // soft light

// Into a hotel shot (Scott: "a crossfade so it warms up"): it dissolves in over the stock
// across DISSOLVE frames centred on the beat, arriving in the cold look and warming up
// until WARM_UP frames after the beat. Back out to the stock is a hard cut on the beat:
// the cold snaps back.
const DISSOLVE = 14;
const WARM_UP = 18;

const Picture: React.FC<{ shot: MixedShot; frames: number }> = ({
  shot,
  frames,
}) => {
  const frame = useCurrentFrame();
  if (shot.kind === "video") {
    return (
      <Video
        src={staticFile(shot.src)}
        trimBefore={Math.round(shot.from * 30)}
        playbackRate={shot.rate ?? 1}
        muted
        objectFit="cover"
        style={{
          width: "100%",
          height: "100%",
          objectPosition: `${(shot.focusX ?? 0.5) * 100}% 50%`,
        }}
      />
    );
  }
  // A still: the barely-there push, centred on the crop.
  const [sw, sh] = shot.size;
  const ch = shot.crop.h ?? sh;
  const cw = (ch * 9) / 16;
  const cy = shot.crop.cy ?? sh / 2;
  const k = H / ch;
  const zoom = 1 + (shot.push ?? 0.05) * (frame / frames);
  return (
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
  );
};

// A line rising out of its own mask.
const Rise: React.FC<{
  text: string;
  at: number;
  out?: number;
  italic?: boolean;
  size: number;
}> = ({ text, at, out, italic, size }) => {
  const frame = useCurrentFrame();
  const p = progress(frame, at, 16);
  const q = out === undefined ? 0 : progress(frame, out, 12, EASE_IN_OUT);
  return (
    <div style={{ overflow: "hidden", paddingBottom: 12 }}>
      <div
        style={{
          fontFamily: serif,
          fontStyle: italic ? "italic" : "normal",
          fontSize: size,
          lineHeight: 1.04,
          color: colors.cream,
          whiteSpace: "nowrap",
          textShadow: LIFT,
          // Travel further than the line's own height, and hide it while it is off its
          // baseline: at 105% a waiting line's ascenders, or a leaving line's descenders
          // (the "y" of "everywhere"), peeked over the mask edge (Scott saw the tail).
          transform: `translateY(${(1 - p) * 140 - q * 140}%)`,
          opacity: Math.min(1, p * 3) * (1 - q),
        }}
      >
        {text}
      </div>
    </div>
  );
};

// "November" set from frame one and held still across the first cut; under it the first
// line drops away a few frames before the cut and the second rises in on it. The block lifts out
// before the second cut.
const Hook: React.FC<{
  hook: MixedSpec["hook"];
  cut: number;
  end: number;
}> = ({ hook, cut, end }) => {
  const frame = useCurrentFrame();
  const o = 1 - progress(frame, end - 14, 14, EASE_IN_OUT);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ background: SCRIM }} />
      <div style={{ position: "absolute", left: 72, bottom: 470 }}>
        <Rise text={hook.top} at={-16} size={120} />
        <div style={{ position: "relative" }}>
          <Rise text={hook.out} at={-16} out={cut - 8} italic size={96} />
          <div style={{ position: "absolute", top: 0, left: 0 }}>
            <Rise text={hook.in} at={cut} italic size={96} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// The end card on black: the question in cream Cormorant, arriving as one calm block (no
// rule, no gold logo: the white CB stays on in its corner, Scott's default for most reels).
// It dissolves in over the last shot (DISSOLVE frames centred on its beat), the line
// following as the black settles.
const EndCard: React.FC<{ line: string }> = ({ line }) => {
  const frame = useCurrentFrame();
  const bg = interpolate(frame, [0, DISSOLVE], [0, 1], {
    ...clamp,
    easing: EASE_IN_OUT,
  });
  const a = progress(frame, DISSOLVE / 2 + 4, 22, EASE_OUT);
  return (
    <AbsoluteFill
      style={{
        backgroundColor: `rgba(9,9,10,${bg})`,
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: 120,
      }}
    >
      <div
        style={{
          opacity: a,
          transform: `translateY(${(1 - a) * 36}px)`,
          textAlign: "center",
        }}
      >
        {line.split("\n").map((l, i) => (
          <div
            key={l}
            style={{
              fontFamily: serif,
              fontStyle: i ? "italic" : "normal",
              fontSize: i ? 92 : 124,
              lineHeight: 1.08,
              color: colors.cream,
              whiteSpace: "nowrap",
            }}
          >
            {l}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// A shot in its look: stock cold throughout; a hotel shot that dissolves in warms up as it
// arrives (the first frame of its Sequence is the start of the dissolve).
const Graded: React.FC<{
  shot: MixedShot;
  frames: number;
  fadeIn: boolean;
}> = ({ shot, frames, fadeIn }) => {
  const frame = useCurrentFrame();
  const w =
    shot.side === "out"
      ? 0
      : fadeIn
        ? interpolate(frame, [0, DISSOLVE / 2 + WARM_UP], [0, 1], {
            ...clamp,
            easing: EASE_IN_OUT,
          })
        : 1;
  const opacity = fadeIn
    ? interpolate(frame, [0, DISSOLVE], [0, 1], {
        ...clamp,
        easing: EASE_IN_OUT,
      })
    : 1;
  return (
    <AbsoluteFill style={{ overflow: "hidden", opacity }}>
      <AbsoluteFill style={{ filter: look(w) }}>
        <Picture shot={shot} frames={frames} />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background: COLD_WASH,
          mixBlendMode: "multiply",
          opacity: 1 - w,
        }}
      />
      <AbsoluteFill
        style={{
          background: WARM_WASH,
          mixBlendMode: "soft-light",
          opacity: w,
        }}
      />
    </AbsoluteFill>
  );
};

export const MixedFilm: React.FC<{ film: MixedSpec }> = ({ film }) => {
  const total = mixedFrames(film);
  const starts = film.shots.map((s, i) => (i ? beatFrame(film, s.at) : 0));
  const card = beatFrame(film, film.endCard.at);
  const ends = [...starts.slice(1), card];
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      {film.music ? (
        <Audio
          src={staticFile(film.music.src)}
          trimBefore={film.music.startAt}
          volume={(f) =>
            film.music!.gain *
            interpolate(f, [0, 6], [0, 1], clamp) *
            interpolate(
              f,
              [beatFrame(film, film.music!.fadeFromBeat), total],
              [1, 0],
              clamp,
            )
          }
        />
      ) : null}
      {film.shots.map((shot, i) => {
        const fadeIn = i > 0 && shot.side === "in";
        const next = film.shots[i + 1];
        const from = starts[i] - (fadeIn ? DISSOLVE / 2 : 0);
        // the last shot runs on under the end card's dissolve
        const to = ends[i] + (!next || next.side === "in" ? DISSOLVE / 2 : 0);
        return (
          <Sequence key={shot.src} from={from} durationInFrames={to - from}>
            <Graded shot={shot} frames={to - from} fadeIn={fadeIn} />
          </Sequence>
        );
      })}
      <Sequence durationInFrames={ends[1]}>
        <Hook hook={film.hook} cut={starts[1]} end={ends[1]} />
      </Sequence>
      <Sequence from={card - DISSOLVE / 2}>
        <EndCard line={film.endCard.line} />
      </Sequence>
      <Img
        src={staticFile("brand/cb-watermark.png")}
        style={{
          position: "absolute",
          left: 920,
          top: 1452,
          width: 100,
          height: 108,
        }}
      />
      <FilmFinish />
    </AbsoluteFill>
  );
};
