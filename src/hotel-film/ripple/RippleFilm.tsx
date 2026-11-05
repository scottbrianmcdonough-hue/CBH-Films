import { Audio, Video } from "@remotion/media";
import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { FilmFinish } from "../components/FilmFinish";
import { SCRIM } from "../footage/FootageFilm";
import { colors, EASE_IN_OUT, EASE_OUT, progress, sans, serif } from "../theme";
import type { RippleSpec } from "./types";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const LIFT = "0 3px 28px rgba(9,9,10,0.55), 0 1px 3px rgba(9,9,10,0.45)";
// Cosy autumn, as Departures (Scott: "grade it cosy autumn"): the summer photos warmed and
// softened toward gold under an amber glow.
const GRADE =
  "sepia(0.34) hue-rotate(-14deg) saturate(1.05) contrast(0.97) brightness(0.97)";
const GLOW = "rgba(255,150,64,0.16)";
// the shade behind lines over bright photos (RippleSpec deepScrim)
const DEEP_SCRIM =
  "radial-gradient(ellipse 1250px 720px at 0px 1330px, rgba(9,9,10,0.86) 0%, rgba(9,9,10,0.62) 45%, rgba(9,9,10,0) 100%)";
// the label's scrim for a landscape frame: the same soft dark from the bottom-left corner
const COUNTER_SCRIM_WIDE =
  "radial-gradient(ellipse 1100px 640px at 0px 1080px, rgba(9,9,10,0.84) 0%, rgba(9,9,10,0.58) 45%, rgba(9,9,10,0) 100%)";
const SCRIM_WIDE =
  "radial-gradient(ellipse 1300px 560px at 0px 1080px, rgba(9,9,10,0.7) 0%, rgba(9,9,10,0.46) 45%, rgba(9,9,10,0) 100%)";

// The opening label (the text rule): the place in gold caps with its still underline, the
// hotel's name in cream Cormorant beneath, bottom-left over the scrim.
const Label: React.FC<{
  eyebrow: string;
  name: string;
  out: number;
  wide?: boolean;
}> = ({ eyebrow, name, out, wide }) => {
  const frame = useCurrentFrame();
  const a = progress(frame, 0, 20, EASE_OUT);
  const o = 1 - progress(frame, out - 12, 12, EASE_IN_OUT);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ background: wide ? SCRIM_WIDE : SCRIM }} />
      <div
        style={{
          position: "absolute",
          left: wide ? 110 : 72,
          bottom: wide ? 120 : 470,
          opacity: a,
          transform: `translateY(${(1 - a) * 30}px)`,
        }}
      >
        <div style={{ display: "inline-block", marginBottom: 18 }}>
          <div
            style={{
              fontFamily: sans,
              fontWeight: 600,
              fontSize: 30,
              letterSpacing: "0.28em",
              color: colors.gold,
              textTransform: "uppercase",
            }}
          >
            {eyebrow}
          </div>
          <div style={{ height: 2, background: colors.gold, marginTop: 8 }} />
        </div>
        {name.split("\n").map((l) => (
          <div
            key={l}
            style={{
              fontFamily: serif,
              fontSize: 92,
              lineHeight: 1.04,
              color: colors.cream,
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

// A line over a shot: cream Cormorant, each line rising out of its own mask a few frames
// apart, lifting away before the next ripple.
const Line: React.FC<{
  text: string;
  out: number;
  top?: number;
  size?: number;
  wide?: boolean;
  eyebrow?: string;
  deep?: boolean;
}> = ({ text, out, top, size = 1, wide, eyebrow, deep }) => {
  const frame = useCurrentFrame();
  const o = 1 - progress(frame, out - 12, 12, EASE_IN_OUT);
  const e = progress(frame, 0, 14, EASE_OUT);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill
        style={{
          background:
            top === undefined
              ? wide
                ? SCRIM_WIDE
                : deep
                  ? DEEP_SCRIM
                  : SCRIM
              : `radial-gradient(ellipse 1150px 520px at 0px ${top + 110}px, rgba(9,9,10,${deep ? 0.78 : 0.56}) 0%, rgba(9,9,10,${deep ? 0.52 : 0.34}) 45%, rgba(9,9,10,0) 100%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: wide ? 110 : 72,
          ...(top === undefined ? { bottom: wide ? 108 : 470 } : { top }),
        }}
      >
        {eyebrow ? (
          <div
            style={{
              display: "inline-block",
              marginBottom: 14,
              opacity: e,
              transform: `translateY(${(1 - e) * 16}px)`,
            }}
          >
            <div
              style={{
                fontFamily: sans,
                fontWeight: 600,
                fontSize: 32 * Math.max(size, 0.9),
                letterSpacing: "0.26em",
                color: colors.gold,
                textTransform: "uppercase",
                textShadow: LIFT,
                whiteSpace: "nowrap",
              }}
            >
              {eyebrow}
            </div>
            <div style={{ height: 2, background: colors.gold, marginTop: 8 }} />
          </div>
        ) : null}
        {text.split("\n").map((l, i) => {
          const p = progress(frame, (eyebrow ? 3 : 0) + i * 5, 18);
          return (
            <div key={l} style={{ overflow: "hidden", paddingBottom: 12 }}>
              <div
                style={{
                  fontFamily: serif,
                  fontStyle: i ? "italic" : "normal",
                  fontSize: (i ? 88 : 104) * size,
                  lineHeight: 1.04,
                  color: colors.cream,
                  // lining figures: Cormorant's old-style ones read "60" as "6o" (Nailcote's capacities)
                  fontVariantNumeric: "lining-nums",
                  whiteSpace: "nowrap",
                  textShadow: LIFT,
                  transform: `translateY(${(1 - p) * 140}%)`,
                  opacity: Math.min(1, p * 3),
                }}
              >
                {l}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// The counter (the label's order: gold caps and underline, then cream Cormorant): the number
// goes up by one at each tick, punching in from a touch larger and settling in 8 frames.
const Counter: React.FC<{
  caption: string;
  ticks: number[];
  out: number;
  wide?: boolean;
}> = ({ caption, ticks, out, wide }) => {
  const frame = useCurrentFrame();
  const n = ticks.filter((t) => frame >= t).length;
  const a = progress(frame, 0, 12, EASE_OUT);
  const o = 1 - progress(frame, out - 12, 12, EASE_IN_OUT);
  const p = n ? progress(frame, ticks[n - 1], 8, EASE_OUT) : 0;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      {/* deeper than the label's: the counter sits over bright white rooms */}
      <AbsoluteFill style={{ background: wide ? COUNTER_SCRIM_WIDE : SCRIM }} />
      <div
        style={{
          position: "absolute",
          left: wide ? 110 : 72,
          bottom: wide ? 110 : 470,
          opacity: a,
        }}
      >
        <div style={{ display: "inline-block", marginBottom: 6 }}>
          <div
            style={{
              fontFamily: sans,
              fontWeight: 600,
              fontSize: 30,
              letterSpacing: "0.28em",
              color: colors.gold,
              textTransform: "uppercase",
              textShadow: LIFT,
            }}
          >
            {caption}
          </div>
          <div style={{ height: 2, background: colors.gold, marginTop: 8 }} />
        </div>
        <div
          style={{
            fontFamily: serif,
            fontSize: 210,
            lineHeight: 1,
            color: colors.cream,
            textShadow: LIFT,
            transform: `scale(${1.16 - 0.16 * p})`,
            transformOrigin: "left bottom",
            opacity: n ? 0.35 + 0.65 * p : 0,
          }}
        >
          {Math.max(1, n)}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// The end card: the picture has rippled into black; the question rises as one calm block,
// centred, the white CB staying on in its corner.
const EndCard: React.FC<{ line: string; wide?: boolean }> = ({
  line,
  wide,
}) => {
  const frame = useCurrentFrame();
  const a = progress(frame, 18, 24, EASE_OUT);
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: wide ? 0 : 120,
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
              fontSize: i ? 92 : 112,
              lineHeight: 1.08,
              color: colors.cream,
              fontVariantNumeric: "lining-nums",
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

// The end card inside the last shot: the question rises from behind the shot's near layer
// (drawn over it by the film) and settles over the far wall, centred, lifted off it by a soft
// shadow; the white CB stays on in its corner.
const SceneEndCard: React.FC<{ line: string; top: number; rise: number }> = ({
  line,
  top,
  rise,
}) => {
  const frame = useCurrentFrame();
  // a slow glide, easing in and out (Scott: "smoother"), fading in over its first half
  const a = progress(frame, 0, 66, EASE_IN_OUT);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top,
        textAlign: "center",
        opacity: Math.min(1, a * 2.2),
        transform: `translateY(${(1 - a) * rise}px)`,
      }}
    >
      {line.split("\n").map((l, i) => (
        <div
          key={l}
          style={{
            fontFamily: serif,
            fontStyle: i ? "italic" : "normal",
            fontSize: i ? 80 : 96,
            lineHeight: 1.08,
            color: colors.cream,
            whiteSpace: "nowrap",
            textShadow: LIFT,
          }}
        >
          {l}
        </div>
      ))}
    </div>
  );
};

export const RippleFilm: React.FC<{ film: RippleSpec }> = ({ film }) => {
  const { music } = film;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      <Audio
        src={staticFile(music.src)}
        trimBefore={music.startAt}
        volume={(f) =>
          music.gain *
          interpolate(f, [0, 4], [0, 1], clamp) *
          interpolate(
            f,
            [film.frames - (music.fadeOut ?? 12), film.frames],
            [1, 0],
            clamp,
          )
        }
      />
      <AbsoluteFill style={{ filter: GRADE }}>
        <Video
          src={staticFile(film.picture)}
          muted
          style={{ width: "100%", height: "100%" }}
        />
      </AbsoluteFill>
      {film.endCard.scene ? null : (
        <AbsoluteFill
          style={{ background: GLOW, mixBlendMode: "soft-light" }}
        />
      )}
      <Sequence
        from={film.label.from}
        durationInFrames={film.label.to - film.label.from}
      >
        <Label
          eyebrow={film.label.eyebrow}
          name={film.label.name}
          out={film.label.to - film.label.from}
          wide={film.wide}
        />
      </Sequence>
      {film.counter ? (
        <Sequence
          from={film.counter.from}
          durationInFrames={film.counter.to - film.counter.from}
        >
          <Counter
            caption={film.counter.caption}
            ticks={film.counter.ticks.map((t) => t - film.counter!.from)}
            out={film.counter.to - film.counter.from}
            wide={film.wide}
          />
        </Sequence>
      ) : null}
      {film.lines.map((l) => (
        <Sequence key={l.text} from={l.from} durationInFrames={l.to - l.from}>
          <Line
            text={l.text}
            out={l.to - l.from}
            top={l.top}
            size={l.size}
            wide={film.wide}
            eyebrow={l.eyebrow}
            deep={film.deepScrim}
          />
        </Sequence>
      ))}
      {film.endCard.scene ? (
        <>
          <Sequence from={film.endCard.at}>
            <SceneEndCard
              line={film.endCard.line}
              top={film.endCard.scene.top}
              rise={film.endCard.scene.rise}
            />
          </Sequence>
          {/* the shot's near layer over the words, graded as the picture */}
          <Sequence from={film.endCard.scene.from}>
            <AbsoluteFill style={{ filter: GRADE }}>
              <OffthreadVideo
                src={staticFile(film.endCard.scene.fg)}
                transparent
                muted
                style={{ width: "100%", height: "100%" }}
              />
            </AbsoluteFill>
          </Sequence>
        </>
      ) : (
        <Sequence from={film.endCard.at}>
          <EndCard line={film.endCard.line} wide={film.wide} />
        </Sequence>
      )}
      {/* with the end card in the scene, the glow goes over the near layer too (last) */}
      {film.endCard.scene ? (
        <AbsoluteFill
          style={{ background: GLOW, mixBlendMode: "soft-light" }}
        />
      ) : null}
      <Img
        src={staticFile("brand/cb-watermark.png")}
        style={{
          position: "absolute",
          left: film.wide ? 1740 : 920,
          top: film.wide ? 912 : 1452,
          width: 100,
          height: 108,
        }}
      />
      <FilmFinish />
    </AbsoluteFill>
  );
};
