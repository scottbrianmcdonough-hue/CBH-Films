import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { FilmFinish } from "../components/FilmFinish";
import { colors, EASE_IN_OUT, EASE_OUT, serif } from "../theme";

// The Phantom CB (Halloween logo reel; Scott: "try it", with two Pexels clips he chose):
// a candle burning in the dark, its flame bending in a draught through the music's quiet
// bars and going out on the band's return. In the dark after it, the smoke curls up off
// the wick, "Happy Halloween" over "Stay if you dare" (the Phantom Guests sign-off) in
// the air above it, together, and drifts across the frame; wherever it passes
// through the CB it catches gold light, more each time (Scott: "the smoke can highlight
// it, something gradual"), until the mark reads whole in the smoke and turns solid gold,
// the gold light fading in place (sliding it off left a ghost CB: Scott's "glitch"). The
// lockup: the gold CB holds a beat with a soft bloom, eases into place as the wordmark
// draws down beneath it, faint smoke still drifting behind, one shimmer across the CB
// alone. Real footage for the flame and every wisp:
// the flame is Pexels 3344052 (trimmed from 34s), the smoke Pexels 12025939 (100fps, so
// it plays at a third speed with every frame its own).

export const PHANTOM_FPS = 30;

// Spooky Halloween Guitar (the Phantom Guests track; the repo has a 60s excerpt): the
// bass out for 46.0-48.8s and the band back on 48.946s, a beat every 0.4511s. The flame
// dies on that return. Scott: no need to keep it to 15s, so the music runs on past the
// excerpt's end: phantom-cb/music.mp3 is the excerpt from 43.43s to the downbeat at
// 57.965s, then back 16 beats to the matching downbeat at 50.668s and on to 60s (the
// bars either side of the join correlate at 0.96/0.94; a 20ms crossfade):
//   ffmpeg -i spooky-halloween-guitar.mp3 -filter_complex "[0]atrim=43.43:57.965,
//     asetpts=PTS-STARTPTS[a];[0]atrim=50.668:60,asetpts=PTS-STARTPTS[b];
//     [a][b]acrossfade=d=0.02:c1=tri:c2=tri" -b:a 256k music.mp3
// The film starts with the file, so the return is at 5.516s and the beats run straight
// through the join.
const RETURN = 48.946 - 43.43;
const BEAT = 0.4511;
const b = (k: number) => Math.round((RETURN + k * BEAT) * PHANTOM_FPS);
const OUT = b(0); // the flame is gone
export const PHANTOM_FRAMES = b(32);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// The two candles are different candles (a cream stub, 132px wide, its top centred at
// (1046, 700) in the flame clip; a white pillar, 342px wide, top at (961, 920) in the
// smoke clip), so both are scaled to the same width, 230px, their tops on the same spot
// low in the frame (the CB floats clear above), and the smoke shot dissolves in under the
// dying flame, graded warm to match (Scott: "the candles look different").
const TOP = { x: 540, y: 1560 };
// the flame clip is 24fps: interpolated to 30 (ffmpeg minterpolate, mci) so it doesn't repeat every
// fifth frame and judder (polish, 30 Oct)
const FLAME = { src: "campaigns/phantom-cb/candle-flame-30.mp4", out: 6.95 };
const FLAME_S = 230 / 132;
const SMOKE = "campaigns/phantom-cb/candle-smoke-100fps.mp4";
const SMOKE_S = 230 / 342;
// The clip is only 4.02s long: at 0.3x the wick's own take runs 13.4s, to 18.9s in the
// film. The two extra takes start a little in and run slower, so each lasts past the
// film's end (Scott: "the smoke on the C gets stuck": they used to run out of clip at
// 11.6s and 15s and freeze on their last frame); the faint smoke left behind the lockup
// fades before the wick's take runs out.
const SLOW = 0.3;
const EDGE_FADE =
  "radial-gradient(ellipse 50% 50% at 50% 50%, #000 70%, transparent 100%)";

// The CB, placed as in the other logo reels: 860 wide, centred at (540, 930).
const B = { x: 540, y: 930 };
const CB_W = 860;
const SC = CB_W / 418;
const SVG = { w: 534.25 * SC, h: 655.69 * SC };
const svgLeft = B.x - CB_W / 2 - 58.4 * SC;
const svgTop = B.y - (451.5 * SC) / 2;
const CB_SRC = staticFile("brand/cbh-logo-cb-only.svg");
const LOGO_SRC = staticFile("brand/cbh-logo-on-dark.svg");
const cbBox = {
  position: "absolute",
  left: svgLeft,
  top: svgTop,
  width: SVG.w,
  height: SVG.h,
} as const;

export const PhantomCB: React.FC = () => {
  const frame = useCurrentFrame();

  // the flame shot, to the dark; the smoke shot fading up out of it
  // no overlap (Scott: "like footage of two wicks together"): the flame shot goes to black,
  // then the smoke shot comes up out of it, so the two candles are never on screen at once
  const flameOn = interpolate(frame, [OUT - 2, OUT + 3], [1, 0], clamp);
  const smokeUp = interpolate(frame, [OUT + 4, OUT + 22], [0, 1], {
    ...clamp,
    easing: EASE_OUT,
  });
  // a second, larger drift of smoke across the CB's place
  const drift = interpolate(frame, [b(1), b(4)], [0, 1], {
    ...clamp,
    easing: EASE_IN_OUT,
  });
  // the two lines in the smoke, together (Scott)
  const rise = interpolate(frame, [b(1.5), b(3.5)], [14, 0], {
    ...clamp,
    easing: EASE_OUT,
  });
  const words = interpolate(
    frame,
    [b(1.5), b(3.5), b(10), b(12)],
    [0, 1, 1, 0],
    clamp,
  );
  // the CB caught in the smoke (Scott: "the smoke can highlight it, something
  // gradual"): inside the letters the passing smoke takes gold light, more and more,
  // and the light itself gathers in them until the mark reads whole
  const catchLight = interpolate(frame, [b(3), b(15)], [0, 1], {
    ...clamp,
    easing: EASE_IN_OUT,
  });
  const glow = interpolate(frame, [b(8), b(16)], [0, 0.45], {
    ...clamp,
    easing: EASE_IN_OUT,
  });
  // as the gold comes the smoke thins to a faint drift that stays behind the lockup,
  // and the candle's foot sinks into the dark
  const freeOut = interpolate(
    frame,
    [b(16), b(19), b(26), b(29)],
    [1, 0.3, 0.3, 0],
    { ...clamp, easing: EASE_IN_OUT },
  );
  const foot = interpolate(frame, [b(16), b(19)], [0, 1], {
    ...clamp,
    easing: EASE_IN_OUT,
  });
  // gold catches in the smoke; the smoke lifts away off the solid mark
  const gold = interpolate(frame, [b(15), b(18)], [0, 1], {
    ...clamp,
    easing: EASE_IN_OUT,
  });
  const smokeAway = interpolate(frame, [b(17), b(19)], [0, 1], {
    ...clamp,
    easing: EASE_IN_OUT,
  });
  // the lockup: a bloom behind the new gold, a held beat, the ease into place, the
  // wordmark drawing down beneath the CB, one shimmer
  const bloom = interpolate(frame, [b(16), b(18), b(23)], [0, 0.32, 0.1], {
    ...clamp,
    easing: EASE_IN_OUT,
  });
  const settle = interpolate(frame, [b(20), b(24)], [0, 1], {
    ...clamp,
    easing: EASE_IN_OUT,
  });
  const full = interpolate(frame, [b(23), b(26)], [0, 1], {
    ...clamp,
    easing: EASE_IN_OUT,
  });
  const shimmer = interpolate(frame, [b(27), b(30)], [-0.6, 1.6], clamp);
  // the wordmark's draw, down from the CB's foot (929px into the logo's frame) to its
  // last line (1349px)
  const draw = 880 + 620 * full;
  // a slow push in from the first frame, on the flame and on through the smoke, held for the
  // lockup (about the frame's centre)
  const push = interpolate(frame, [0, b(19)], [1, 1.05], {
    ...clamp,
    easing: EASE_IN_OUT,
  });
  const out = interpolate(
    frame,
    [PHANTOM_FRAMES - 16, PHANTOM_FRAMES - 1],
    [1, 0],
    clamp,
  );

  // `look`: plain, or gold, the smoke inside the letters catching the light (its
  // near-black crushed out, toned gold, brightened) and screened over what is under it
  const smokeVideo = (
    from: number,
    s: number,
    x: number,
    y: number,
    look: "plain" | "gold" = "plain",
    smokeOnly = false,
    rate = SLOW,
    wick = false,
  ) => {
    // a take used only for its smoke is cut off well above its own candle and wick (Scott: "you can
    // still see the wick"); the wick's own take fades out just under the ember and is softened a
    // touch, so the specks off the wick melt into the smoke
    const cut = smokeOnly
      ? `linear-gradient(to bottom, #000 ${870 * s - 380}px, transparent ${870 * s - 220}px)`
      : wick
        ? "linear-gradient(to bottom, #000 400px, transparent 480px)"
        : null;
    const masks = [look === "plain" ? EDGE_FADE : null, cut].filter(Boolean);
    return (
      <OffthreadVideo
        src={staticFile(SMOKE)}
        startFrom={from}
        playbackRate={rate}
        muted
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: 1920 * s,
          height: 1080 * s,
          maxWidth: "none",
          ...(wick ? { filter: "blur(2.5px)" } : {}),
          ...(look === "gold"
            ? {
                filter:
                  "grayscale(1) brightness(3.2) contrast(1.3) sepia(1) saturate(2.2) hue-rotate(-8deg)",
                mixBlendMode: "screen" as const,
              }
            : {}),
          // the clip's edges fade, so its box never shows against the black
          ...(masks.length
            ? {
                WebkitMaskImage: masks.join(", "),
                maskImage: masks.join(", "),
                WebkitMaskComposite: "source-in",
                maskComposite: "intersect" as const,
              }
            : {}),
        }}
      />
    );
  };
  // the drifts: the wick's own smoke, a larger take across the CB, and a mirrored one
  const drifts = (look: "plain" | "gold") => (
    <>
      {/* the wick's own take: not in the gold, where the specks off the wick lit up as a sparkly
          trail up the B's stem (Scott: "see it on the B") */}
      {look === "plain"
        ? // lined up on the flame's wick (Scott: "they have to line up"): the smoke clip's wick
          // tip sat 102px lower and 16px left of where the burning wick's tip was (561, 1322)
          smokeVideo(0, SMOKE_S, TOP.x - 961 * SMOKE_S + 16, TOP.y - 920 * SMOKE_S - 102, look, false, SLOW, true)
        : null}
      <AbsoluteFill style={{ opacity: drift, mixBlendMode: "screen" }}>
        {smokeVideo(
          15,
          1.7,
          B.x - 1000 * 1.7,
          B.y - 560 * 1.7,
          look,
          true,
          0.24,
        )}
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          opacity: drift,
          transform: "scaleX(-1)",
          mixBlendMode: "screen",
        }}
      >
        {smokeVideo(
          30,
          1.5,
          B.x - 900 * 1.5,
          B.y - 420 * 1.5,
          look,
          true,
          0.21,
        )}
      </AbsoluteFill>
    </>
  );
  const cbMask = {
    WebkitMaskImage: `url(${CB_SRC})`,
    maskImage: `url(${CB_SRC})`,
    WebkitMaskSize: `${SVG.w}px ${SVG.h}px`,
    maskSize: `${SVG.w}px ${SVG.h}px`,
    WebkitMaskPosition: `${svgLeft}px ${svgTop}px`,
    maskPosition: `${svgLeft}px ${svgTop}px`,
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
  } as const;

  // the smoke shot's candle (a different candle from the one that burned) is never seen: below the
  // wick everything fades into the dark, so the smoke just rises out of the black (Scott: "just do
  // the smoke up")
  // soft on every side (Scott: the smoke read as a box, cut level under the B and at the frame's
  // edges): a long fade at the foot that still hides the candle, and a fade in from left and right
  const edges = `linear-gradient(to bottom, transparent 120px, #000 360px, #000 ${980 - 60 * foot}px, transparent ${1440 - 60 * foot}px), linear-gradient(to right, transparent 0px, #000 220px, #000 860px, transparent 1080px)`;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* a black point for the plain smoke only: the clip's background sits a shade above black, and
          its warm grade lifted it into a faint panel behind the smoke (Scott's phone); the gold and
          the rest of the picture are untouched */}
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id="smoke-black" colorInterpolationFilters="sRGB">
          <feComponentTransfer>
            <feFuncR type="linear" slope={1.1} intercept={-0.06} />
            <feFuncG type="linear" slope={1.1} intercept={-0.06} />
            <feFuncB type="linear" slope={1.1} intercept={-0.06} />
          </feComponentTransfer>
        </filter>
      </svg>
      <AbsoluteFill
        style={{
          opacity: out,
          transform: `scale(${push})`,
          transformOrigin: "540px 960px",
        }}
      >
        {/* the candle burning, bending in the draught, going out */}
        <Sequence durationInFrames={OUT + 3} layout="none">
          <AbsoluteFill style={{ opacity: flameOn }}>
            <OffthreadVideo
              src={staticFile(FLAME.src)}
              startFrom={Math.round(
                (FLAME.out - OUT / PHANTOM_FPS) * PHANTOM_FPS,
              )}
              muted
              style={{
                position: "absolute",
                left: TOP.x - 1046 * FLAME_S,
                top: TOP.y - 700 * FLAME_S,
                width: 1890 * FLAME_S,
                height: 1080 * FLAME_S,
                maxWidth: "none",
              }}
            />
          </AbsoluteFill>
        </Sequence>
        {/* the smoke off the wick, in the cold after the light, drifting across */}
        <Sequence from={OUT} layout="none">
          <AbsoluteFill
            style={{
              opacity: smokeUp * freeOut,
              filter: "sepia(0.45) saturate(0.6) brightness(0.95) url(#smoke-black)",
              // the clip's top and bottom edges (the candle's foot) fade into the dark
              WebkitMaskImage: edges,
              maskImage: edges,
              WebkitMaskComposite: "source-in",
              maskComposite: "intersect",
            }}
          >
            {drifts("plain")}
          </AbsoluteFill>
          {/* the same smoke inside the letters, catching gold light, and the light
              gathering in them */}
          <AbsoluteFill
            style={{
              ...cbMask,
              mixBlendMode: "screen",
              opacity: 1 - smokeAway,
            }}
          >
            <AbsoluteFill style={{ opacity: catchLight }}>
              {drifts("gold")}
            </AbsoluteFill>
            {/* the letters glow with the smoke's own light (a blurred copy of it), over
                only a faint even fill, so the CB reads as lit smoke, not a flat shape */}
            <AbsoluteFill
              style={{
                opacity: Math.min(1, glow * 2),
                filter: "blur(16px)",
                mixBlendMode: "screen",
              }}
            >
              {drifts("gold")}
            </AbsoluteFill>
            <AbsoluteFill
              style={{ backgroundColor: colors.gold, opacity: glow * 0.22 }}
            />
          </AbsoluteFill>
        </Sequence>
        {/* the ember: the wick still glowing as the flame dies, fading over two seconds while the
            smoke rises from it (Scott: "add the ember") */}
        {frame >= OUT - 6 && frame < OUT + 75 ? (
          <AbsoluteFill
            style={{
              opacity:
                interpolate(frame, [OUT - 6, OUT, OUT + 20, OUT + 75], [0, 1, 0.8, 0], {
                  ...clamp,
                  easing: EASE_IN_OUT,
                }) *
                (0.85 + 0.15 * Math.sin(frame * 0.9)),
              background:
                "radial-gradient(circle 7px at 561px 1322px, rgba(255,214,150,1) 0%, rgba(255,120,40,0.95) 55%, rgba(255,90,20,0) 100%), radial-gradient(circle 34px at 561px 1324px, rgba(255,110,30,0.45) 0%, rgba(255,90,20,0) 100%)",
              mixBlendMode: "screen",
            }}
          />
        ) : null}
        <AbsoluteFill
          style={{
            opacity: bloom,
            background: `radial-gradient(ellipse 42% 26% at ${B.x}px ${B.y - 75 * settle}px, rgba(195,158,85,0.9) 0%, rgba(195,158,85,0) 100%)`,
            filter: "blur(30px)",
          }}
        />
        {/* the gold catching in the smoke, then the full logo and one shimmer */}
        <AbsoluteFill
          style={{
            transform: `translateY(${-75 * settle}px) scale(${1 - 0.5 * settle})`,
            transformOrigin: `${B.x}px ${B.y}px`,
          }}
        >
          <Img
            src={CB_SRC}
            style={{
              ...cbBox,
              opacity: gold,
              filter: `blur(${(1 - gold) * 5}px) drop-shadow(0 0 ${30 * gold}px rgba(195,158,85,0.35))`,
            }}
          />
          <Img
            src={LOGO_SRC}
            style={{
              ...cbBox,
              opacity: full,
              WebkitMaskImage: `linear-gradient(to bottom, #000 ${draw - 120}px, transparent ${draw}px)`,
              maskImage: `linear-gradient(to bottom, #000 ${draw - 120}px, transparent ${draw}px)`,
            }}
          />
          <AbsoluteFill
            style={{
              WebkitMaskImage: `url(${CB_SRC})`,
              maskImage: `url(${CB_SRC})`,
              WebkitMaskSize: `${SVG.w}px ${SVG.h}px`,
              maskSize: `${SVG.w}px ${SVG.h}px`,
              WebkitMaskPosition: `${svgLeft}px ${svgTop}px`,
              maskPosition: `${svgLeft}px ${svgTop}px`,
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              opacity: full,
              background: `linear-gradient(115deg, rgba(255,245,220,0) ${shimmer * 100 - 18}%, rgba(255,245,220,0.75) ${shimmer * 100}%, rgba(255,245,220,0) ${shimmer * 100 + 18}%)`,
            }}
          />
        </AbsoluteFill>
      </AbsoluteFill>
      {/* the two lines, outside the push so they sit dead still (rescaling thin type a
          hair each frame made it jitter: Scott, "jumping up and down"); they rise a
          touch as they come in and only fade on the way out */}
      <AbsoluteFill
        style={{
          top: 290,
          height: 260,
          opacity: words * out,
          fontFamily: serif,
          color: colors.cream,
          textAlign: "center",
          letterSpacing: 1,
          lineHeight: 1.15,
          textShadow: "0 0 28px rgba(0,0,0,0.85)",
          transform: `translateY(${rise}px)`,
        }}
      >
        {/* the greeting alone (Scott, 30 Oct: "not stay if you dare, just Happy Halloween") */}
        <div style={{ fontSize: 100, fontWeight: 400, marginTop: 40 }}>Happy Halloween</div>
      </AbsoluteFill>
      <FilmFinish />
      <Audio
        src={staticFile("campaigns/phantom-cb/music.mp3")}
        volume={(f) =>
          interpolate(
            f,
            [0, 10, PHANTOM_FRAMES - 36, PHANTOM_FRAMES],
            [0, 0.86, 0.86, 0],
            clamp,
          )
        }
      />
    </AbsoluteFill>
  );
};
