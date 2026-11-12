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
// over a bright sky, close and soft so the letters read without darkening the sky round them
const SKY_LIFT =
  "0 1px 2px rgba(9,9,10,0.7), 0 2px 10px rgba(9,9,10,0.45), 0 0 26px rgba(9,9,10,0.3)";
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
// 4:5 (feed): the deep shade from the bottom-left corner of a 1350 frame
const FEED_SCRIM =
  "radial-gradient(ellipse 1150px 640px at 0px 1290px, rgba(9,9,10,0.84) 0%, rgba(9,9,10,0.58) 45%, rgba(9,9,10,0) 100%)";
const MAUVE = "#A15272"; // Lee's Black Friday caps
// the region reels' shade, as the carousel slides: a dark gradient up from the bottom, so the small mauve caps read
const CARD_SCRIM =
  "linear-gradient(to top, rgba(9,9,10,0.9) 0%, rgba(9,9,10,0.72) 26%, rgba(9,9,10,0.3) 46%, rgba(9,9,10,0) 62%)";
const FEED_BOTTOM = 190;
const SCRIM_WIDE =
  "radial-gradient(ellipse 1300px 560px at 0px 1080px, rgba(9,9,10,0.7) 0%, rgba(9,9,10,0.46) 45%, rgba(9,9,10,0) 100%)";

// The opening label (the text rule): the place in gold caps with its still underline, the
// hotel's name in cream Cormorant beneath, bottom-left over the scrim.
const Label: React.FC<{
  eyebrow: string;
  name: string;
  out: number;
  wide?: boolean;
  feed?: boolean;
  top?: number;
}> = ({ eyebrow, name, out, wide, feed, top }) => {
  const frame = useCurrentFrame();
  const a = progress(frame, 0, 20, EASE_OUT);
  const o = 1 - progress(frame, out - 12, 12, EASE_IN_OUT);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill
        style={{
          background: top === undefined ? (wide ? SCRIM_WIDE : feed ? FEED_SCRIM : SCRIM) : "none", // no shade in the sky (Scott: "looks like a storm cloud"): a tight shadow on the letters,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: wide ? 110 : 72,
          ...(top === undefined ? { bottom: wide ? 120 : feed ? FEED_BOTTOM : 470 } : { top }),
          opacity: a,
          transform: `translateY(${(1 - a) * 30}px)`,
        }}
      >
        {eyebrow ? (
          <div style={{ display: "inline-block", marginBottom: 18 }}>
            <div
              style={{
                fontFamily: sans,
                fontWeight: 600,
                fontSize: 30,
                letterSpacing: "0.28em",
                color: colors.gold,
                textTransform: "uppercase",
                textShadow: top === undefined ? undefined : SKY_LIFT,
              }}
            >
              {eyebrow}
            </div>
            <div style={{ height: 2, background: colors.gold, marginTop: 8 }} />
          </div>
        ) : null}
        {name.split("\n").map((l) => (
          <div
            key={l}
            style={{
              fontFamily: serif,
              fontSize: 92,
              fontWeight: top === undefined ? undefined : 500, // a touch heavier over a bright sky
              lineHeight: 1.04,
              color: colors.cream,
              textShadow: top === undefined ? LIFT : SKY_LIFT,
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
// One steady shade under all the lines (Scott, 5 Nov: the picture "changes colour when the text fades for a second"):
// with deepScrim the shade no longer fades out and back in with each line; it comes up with the first line, stays on
// to the end card, and swaps between the bottom shade and a top line's shade only on that shot's cuts
const SteadyShade: React.FC<{ film: RippleSpec }> = ({ film }) => {
  const frame = useCurrentFrame();
  const shaded = film.lines.filter((l) => !l.sky); // a line over the sky has no shade
  const first = Math.min(
    shaded[0]?.from ?? Infinity,
    film.cards?.[0]?.from ?? Infinity,
    film.title?.from ?? Infinity,
  );
  const on =
    progress(frame, first, 12, EASE_IN_OUT) *
    (1 - progress(frame, film.endCard.at + 42, 1));
  const top = shaded.find(
    (l) => l.top !== undefined && frame >= l.from - 3 && frame < l.to + 6,
  );
  return (
    <AbsoluteFill
      style={{
        opacity: on,
        background: top
          ? `radial-gradient(ellipse 1150px 520px at 0px ${top.top! + 110}px, rgba(9,9,10,0.78) 0%, rgba(9,9,10,0.52) 45%, rgba(9,9,10,0) 100%)`
          : film.cards
            ? CARD_SCRIM
            : film.feed
              ? FEED_SCRIM
              : DEEP_SCRIM,
      }}
    />
  );
};
const Line: React.FC<{
  text: string;
  out: number;
  top?: number;
  size?: number;
  wide?: boolean;
  feed?: boolean;
  eyebrow?: string;
  deep?: boolean;
  noScrim?: boolean;
  sky?: boolean;
}> = ({ text, out, top, size = 1, wide, feed, eyebrow, deep, noScrim, sky }) => {
  const frame = useCurrentFrame();
  const o = 1 - progress(frame, out - 12, 12, EASE_IN_OUT);
  const e = progress(frame, 0, 14, EASE_OUT);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill
        style={{
          display: noScrim || sky ? "none" : undefined,
          background:
            top === undefined
              ? wide
                ? SCRIM_WIDE
                : feed
                  ? FEED_SCRIM
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
          ...(top === undefined ? { bottom: wide ? 108 : feed ? FEED_BOTTOM : 470 } : { top }),
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
                  textShadow: sky ? SKY_LIFT : LIFT,
                  fontWeight: sky ? 500 : undefined,
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

// A hotel card (the Black Friday region reels), the carousel's order: the place in mauve caps, the name in cream
// Cormorant, the offer in a mauve pill; it rises in, holds across the hotel's shots, and fades as the next comes.
const HotelCard: React.FC<{ place: string; name: string; offer: string; out: number }> = ({
  place,
  name,
  offer,
  out,
}) => {
  const frame = useCurrentFrame();
  const a = progress(frame, 0, 16, EASE_OUT);
  const o = 1 - progress(frame, out - 10, 10, EASE_IN_OUT);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <div
        style={{
          position: "absolute",
          left: 72,
          bottom: FEED_BOTTOM,
          opacity: a,
          transform: `translateY(${(1 - a) * 26}px)`,
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontWeight: 700,
            fontSize: 30,
            letterSpacing: "0.04em",
            color: MAUVE,
            textTransform: "uppercase",
            textShadow: LIFT,
            marginBottom: 10,
          }}
        >
          {place}
        </div>
        {name.split("\n").map((l) => (
          <div
            key={l}
            style={{
              fontFamily: serif,
              fontSize: 88,
              lineHeight: 1.04,
              color: colors.cream,
              textShadow: LIFT,
              whiteSpace: "nowrap",
            }}
          >
            {l}
          </div>
        ))}
        <div
          style={{
            display: "inline-block",
            marginTop: 22,
            fontFamily: sans,
            fontWeight: 700,
            fontSize: 30,
            letterSpacing: "0.02em",
            textTransform: "uppercase",
            color: colors.cream,
            background: MAUVE,
            padding: "10px 22px",
            borderRadius: 40,
            fontVariantNumeric: "lining-nums",
          }}
        >
          {offer}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// The opening title (the region reels): mauve caps over a cream Cormorant line, bottom left like the cards.
const Title: React.FC<{ eyebrow: string; line: string; out: number }> = ({ eyebrow, line, out }) => {
  const frame = useCurrentFrame();
  const a = progress(frame, 0, 18, EASE_OUT);
  const o = 1 - progress(frame, out - 10, 10, EASE_IN_OUT);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <div
        style={{
          position: "absolute",
          left: 72,
          bottom: FEED_BOTTOM,
          opacity: a,
          transform: `translateY(${(1 - a) * 26}px)`,
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontWeight: 700,
            fontSize: 34,
            letterSpacing: "0.04em",
            color: MAUVE,
            textTransform: "uppercase",
            textShadow: LIFT,
            marginBottom: 8,
          }}
        >
          {eyebrow}
        </div>
        <div style={{ fontFamily: serif, fontSize: 120, lineHeight: 1.02, color: colors.cream, textShadow: LIFT }}>
          {line}
        </div>
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
const EndCard: React.FC<{
  line: string;
  wide?: boolean;
  feed?: boolean;
  quick?: boolean;
  eyebrow?: string;
  sub?: string;
}> = ({ line, wide, feed, quick, eyebrow, sub }) => {
  const frame = useCurrentFrame();
  const a = quick
    ? progress(frame, 4, 14, EASE_OUT)
    : progress(frame, 18, 24, EASE_OUT);
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: wide || feed ? 0 : 120,
      }}
    >
      <div
        style={{
          opacity: a,
          transform: `translateY(${(1 - a) * 36}px)`,
          textAlign: "center",
        }}
      >
        {eyebrow ? (
          <div
            style={{
              fontFamily: sans,
              fontWeight: 600,
              fontSize: 44,
              letterSpacing: "0.04em",
              color: MAUVE,
              textTransform: "uppercase",
              marginBottom: 26,
            }}
          >
            {eyebrow}
          </div>
        ) : null}
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
        {sub ? (
          <div
            style={{
              fontFamily: sans,
              fontWeight: 500,
              fontSize: 34,
              letterSpacing: "0.02em",
              color: colors.cream,
              opacity: 0.88,
              marginTop: 40,
              whiteSpace: "nowrap",
            }}
          >
            {sub}
          </div>
        ) : null}
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

// Snappy mode (Scott, 11 Nov, the South region reel: "add some dynamic text or snappy transitions ... it's kinda just a
// flat slideshow"). The zoom snap at each cut: the outgoing shot pushes in over its last 4 frames, the new one lands
// 10% large and settles in 9, a touch of blur across the cut so it reads as one fast move.
const snapAt = (frame: number, kicks: number[], soft: number[] = []) => {
  // classy, not frantic (Scott, 11 to 12 Nov: "turn it back a notch with the pulsing", "classy, not too snappy, upbeat
  // energy but not nausea or headache"): the old shot leans in 1.5% over its last 4 frames, the new one lands 2.5%
  // large and eases back over 14; no blur; a soft kick a third of that
  let scale = 1;
  for (const k of kicks) {
    const d = frame - k;
    const m = soft.includes(k) ? 0.33 : 1;
    if (d >= -4 && d < 0) {
      const t = (d + 4) / 4;
      scale *= 1 + 0.015 * m * t * t;
    } else if (d >= 0 && d < 14) {
      const e = 1 - Math.pow(1 - d / 14, 3);
      scale *= 1 + 0.025 * m * (1 - e);
    }
  }
  return { scale, blur: 0 };
};

// a number in the text counting up to its value from frame `at` over `len` frames ("Save 25%" counts 0 to 25)
const countUp = (text: string, frame: number, at: number, len: number) =>
  text.replace(/\d+/, (n) => String(Math.round(Number(n) * progress(frame, at, len, EASE_OUT))));

// a pop: from small, past full size and back, over n frames
const pop = (frame: number, at: number, n = 12) =>
  interpolate(frame, [at, at + n * 0.6, at + n], [0.82, 1.03, 1], clamp);

// a slam: from large, a touch under and back
const slam = (frame: number, at: number, n = 14) =>
  interpolate(frame, [at, at + n * 0.55, at + n], [1.16, 0.99, 1], clamp);

// a line rising out of its own mask
const Rise: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  at,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const a = progress(frame, at, 11, EASE_OUT);
  return (
    <div style={{ overflow: "hidden", paddingBottom: 8, marginBottom: -8 }}>
      <div style={{ ...style, transform: `translateY(${(1 - a) * 105}%)`, opacity: a > 0 ? 1 : 0 }}>{children}</div>
    </div>
  );
};

// caps wiping in from the left
const wipe = (frame: number, at: number, n = 9) =>
  `inset(-20% ${(1 - progress(frame, at, n, EASE_OUT)) * 100}% -20% 0)`;

const SnapCard: React.FC<{ place: string; name: string; offer: string; out: number; beat: number }> = ({
  place,
  name,
  offer,
  out,
  beat,
}) => {
  const frame = useCurrentFrame();
  const o = 1 - progress(frame, out - 6, 6, EASE_IN_OUT);
  const p = Math.round(beat); // the pill pops on the next beat
  return (
    <AbsoluteFill style={{ opacity: o, transform: `translateX(${(1 - o) * -40}px)` }}>
      <div style={{ position: "absolute", left: 72, bottom: FEED_BOTTOM }}>
        <div
          style={{
            fontFamily: sans,
            fontWeight: 700,
            fontSize: 30,
            letterSpacing: "0.04em",
            color: MAUVE,
            textTransform: "uppercase",
            textShadow: LIFT,
            marginBottom: 10,
            clipPath: wipe(frame, 0),
          }}
        >
          {place}
        </div>
        {name.split("\n").map((l, i) => (
          <Rise
            key={l}
            at={3 + i * 3}
            style={{
              fontFamily: serif,
              fontSize: 88,
              lineHeight: 1.04,
              color: colors.cream,
              textShadow: LIFT,
              whiteSpace: "nowrap",
            }}
          >
            {l}
          </Rise>
        ))}
        <div
          style={{
            display: "inline-block",
            marginTop: 22,
            fontFamily: sans,
            fontWeight: 700,
            fontSize: 30,
            letterSpacing: "0.02em",
            textTransform: "uppercase",
            color: colors.cream,
            background: MAUVE,
            padding: "10px 22px",
            borderRadius: 40,
            fontVariantNumeric: "lining-nums tabular-nums",
            opacity: progress(frame, p, 3),
            transform: `scale(${pop(frame, p)})`,
            transformOrigin: "left center",
          }}
        >
          {countUp(offer, frame, p, 12)}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const SnapTitle: React.FC<{ eyebrow: string; line: string; out: number; beat: number }> = ({
  eyebrow,
  line,
  out,
  beat,
}) => {
  const frame = useCurrentFrame();
  const o = 1 - progress(frame, out - 6, 6, EASE_IN_OUT);
  // the line comes in two beats after the caps, or one when the opening is a single bar (the North, 12 Nov)
  const s = Math.round(beat * (out > beat * 6 ? 2 : 1));
  return (
    <AbsoluteFill style={{ opacity: o, transform: `translateX(${(1 - o) * -40}px)` }}>
      <div style={{ position: "absolute", left: 72, bottom: FEED_BOTTOM }}>
        <div
          style={{
            fontFamily: sans,
            fontWeight: 700,
            fontSize: 34,
            letterSpacing: "0.04em",
            color: MAUVE,
            textTransform: "uppercase",
            textShadow: LIFT,
            marginBottom: 8,
            clipPath: wipe(frame, 0, 10),
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            fontFamily: serif,
            fontSize: 120,
            lineHeight: 1.02,
            color: colors.cream,
            textShadow: LIFT,
            opacity: progress(frame, s, 3),
            transform: `scale(${slam(frame, s)})`,
            transformOrigin: "left bottom",
          }}
        >
          {line}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const SnapEndCard: React.FC<{ line: string; eyebrow?: string; beat: number }> = ({ line, eyebrow, beat }) => {
  const frame = useCurrentFrame();
  const s = Math.round(beat); // the line slams in a beat after the caps, its number counting up over two beats
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        {eyebrow ? (
          <div
            style={{
              fontFamily: sans,
              fontWeight: 600,
              fontSize: 44,
              letterSpacing: "0.04em",
              color: MAUVE,
              textTransform: "uppercase",
              marginBottom: 26,
              clipPath: wipe(frame, 2, 10),
            }}
          >
            {eyebrow}
          </div>
        ) : null}
        <div
          style={{
            fontFamily: serif,
            fontSize: 112,
            lineHeight: 1.08,
            color: colors.cream,
            fontVariantNumeric: "lining-nums tabular-nums",
            whiteSpace: "nowrap",
            opacity: progress(frame, s, 3),
            transform: `scale(${slam(frame, s)})`,
          }}
        >
          {countUp(line, frame, s, Math.round(beat * 2))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const RippleFilm: React.FC<{ film: RippleSpec }> = ({ film }) => {
  const { music } = film;
  const frame = useCurrentFrame();
  const snap = film.snap ? snapAt(frame, film.snap.kicks, film.snap.soft) : null;
  const beat = film.snap?.beat ?? 0;
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
      <AbsoluteFill
        style={{
          filter: snap && snap.blur > 0.05 ? `${GRADE} blur(${snap.blur.toFixed(2)}px)` : GRADE,
          transform: snap ? `scale(${snap.scale})` : undefined,
        }}
      >
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
          feed={film.feed}
          top={film.label.top}
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
      {film.deepScrim ? <SteadyShade film={film} /> : null}
      {film.title ? (
        <Sequence from={film.title.from} durationInFrames={film.title.to - film.title.from}>
          {film.snap ? (
            <SnapTitle eyebrow={film.title.eyebrow} line={film.title.line} out={film.title.to - film.title.from} beat={beat} />
          ) : (
            <Title eyebrow={film.title.eyebrow} line={film.title.line} out={film.title.to - film.title.from} />
          )}
        </Sequence>
      ) : null}
      {(film.cards ?? []).map((c) => (
        <Sequence key={c.name} from={c.from} durationInFrames={c.to - c.from}>
          {film.snap ? (
            <SnapCard place={c.place} name={c.name} offer={c.offer} out={c.to - c.from} beat={beat} />
          ) : (
            <HotelCard place={c.place} name={c.name} offer={c.offer} out={c.to - c.from} />
          )}
        </Sequence>
      ))}
      {film.lines.map((l) => (
        <Sequence key={l.text} from={l.from} durationInFrames={l.to - l.from}>
          <Line
            text={l.text}
            out={l.to - l.from}
            top={l.top}
            size={l.size}
            wide={film.wide}
            feed={film.feed}
            eyebrow={l.eyebrow}
            deep={film.deepScrim}
            noScrim={film.deepScrim}
            sky={l.sky}
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
          {film.snap ? (
            <SnapEndCard line={film.endCard.line} eyebrow={film.endCard.eyebrow} beat={beat} />
          ) : (
          <EndCard
            line={film.endCard.line}
            wide={film.wide}
            feed={film.feed}
            quick={film.endCard.quick}
            eyebrow={film.endCard.eyebrow}
            sub={film.endCard.sub}
          />
          )}
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
          top: film.wide ? 912 : film.feed ? 1176 : 1452,
          width: 100,
          height: 108,
        }}
      />
      <FilmFinish />
    </AbsoluteFill>
  );
};
