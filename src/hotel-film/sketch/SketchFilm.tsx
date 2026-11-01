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
import { EndCard } from "../footage/FootageFilm";
import { colors, EASE_OUT, progress, sans, serif } from "../theme";
import { CB_B, CB_C, CB_VIEWBOX } from "./cb-paths";
import type { SketchNote, SketchShot, SketchSpec } from "./types";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// A note pencilled onto the paper: written on left to right as the drawing appears (a
// soft-edged reveal, like a hand moving across). Then either the colour washes it away, or
// (`stay`) it holds over the photo, in pencil or turned to cream.
const Note: React.FC<{ note: SketchNote }> = ({ note }) => {
  const frame = useCurrentFrame();
  const write = interpolate(frame, note.write, [0, 1], clamp);
  const turn = interpolate(frame, note.fade, [0, 1], clamp);
  const edge = write * 120 - 10; // percent, with a soft 10% leading edge
  const mask = `linear-gradient(90deg, #000 ${edge - 10}%, transparent ${edge}%)`;
  const top = note.top ?? 300;
  const size = note.size ?? 92;
  const right = note.align === "right";
  const text = (color: string, opacity: number, shadow?: string) => (
    <div
      style={{
        position: "absolute",
        ...(right ? { right: note.inset ?? 84 } : { left: note.inset ?? 84 }),
        top,
        transform: "rotate(-2.5deg)",
        transformOrigin: right ? "100% 50%" : "0 50%",
        textAlign: right ? "right" : "left",
        fontFamily: serif,
        fontStyle: "italic",
        fontWeight: 500,
        fontSize: size,
        lineHeight: 1.0,
        color,
        textShadow: shadow,
        // Lining figures: Cormorant's old-style "1200s" reads like "12oos".
        fontVariantNumeric: "lining-nums",
        opacity,
        WebkitMaskImage: mask,
        maskImage: mask,
      }}
    >
      {note.lines.map((l) => (
        <div key={l}>{l}</div>
      ))}
    </div>
  );
  return (
    <>
      {note.ground !== "open" ? (
        // A clearing in the drawing for the note, as if the artist left the space.
        <div
          style={{
            position: "absolute",
            ...(right ? { right: -60 } : { left: -60 }),
            top: top - 90,
            width: 860,
            height: note.lines.length * size + 180,
            background:
              "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(243,236,223,0.94) 45%, rgba(243,236,223,0) 100%)",
            // with `stay: "pencil"` the clearing stays too, paler, as a soft scrim so the
            // handwriting reads over a busy or mid-toned photo (Scott: "no halo, just a scrim")
            opacity:
              (note.stay === "pencil" ? 1 - 0.3 * turn : 1 - turn) *
              Math.min(1, write * 3),
          }}
        />
      ) : null}
      {note.stay === "cream" ? (
        // a scrim from the foot of the frame up past the note, so the cream reads over the
        // photo without a glow around it (Scott: "no halo, just a scrim or shadow")
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: top - 260,
            bottom: 0,
            background:
              "linear-gradient(to bottom, rgba(9,9,10,0) 0%, rgba(9,9,10,0.42) 45%, rgba(9,9,10,0.5) 100%)",
            opacity: turn,
          }}
        />
      ) : null}
      {text("#3a332b", note.stay === "pencil" ? 0.9 : 0.88 * (1 - turn))}
      {note.stay === "cream"
        ? text(
            colors.cream,
            turn,
            // a tight shadow only, no glow round the letters (Scott: "get rid of the halos")
            "0 2px 5px rgba(9,9,10,0.55), 0 1px 2px rgba(9,9,10,0.45)",
          )
        : null}
    </>
  );
};

// The boil: the drawing redrawn ten times a second with a small wobble in every line, as
// in hand-drawn animation. An SVG displacement filter whose noise changes every 3 frames.
const Boil: React.FC<{ id: string; px: number; children: React.ReactNode }> = ({
  id,
  px,
  children,
}) => {
  const frame = useCurrentFrame();
  if (px <= 0.05) return <AbsoluteFill>{children}</AbsoluteFill>;
  return (
    <AbsoluteFill style={{ filter: `url(#${id})` }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id={id} x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.022"
            numOctaves={2}
            seed={Math.floor(frame / 3) % 97}
          />
          <feDisplacementMap
            in="SourceGraphic"
            scale={px * 2}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
      {children}
    </AbsoluteFill>
  );
};

const layer = (src: string) => (
  <Img
    src={staticFile(src)}
    style={{ position: "absolute", width: "100%", height: "100%" }}
  />
);

// The depth move: the ground rises and comes closer over the sky, its speed easing in over
// RAMP frames (smoothstep), then steady to the cut. t: frames since it started.
const RAMP = 30;
const depthStyle = (t: number, origin?: string): React.CSSProperties => {
  const r = Math.min(Math.max(t, 0), RAMP) / RAMP;
  const d =
    t < RAMP ? RAMP * (r * r * r - (r * r * r * r) / 2) : RAMP / 2 + (t - RAMP);
  return {
    transformOrigin: origin ?? "50% 85%",
    transform: `translateY(${(-0.005 * d).toFixed(4)}%) scale(${(1 + 0.00045 * d).toFixed(5)})`,
  };
};

// The settled photo as a still. With layers, the depth move is already under way (it began
// on the clip), so the stills carry it on, fading in over the clip's own layers; without,
// the frame simply takes over.
const Hold: React.FC<{ hold: NonNullable<SketchShot["hold"]> }> = ({
  hold,
}) => {
  const frame = useCurrentFrame(); // from the handover
  if (!(hold.fg && hold.bg && hold.sky)) return layer(hold.src);
  const t = frame + hold.from - (hold.depthFrom ?? hold.from);
  return (
    <AbsoluteFill
      style={{ opacity: interpolate(frame, [0, 6], [0, 1], clamp) }}
    >
      {layer(hold.bg)}
      <AbsoluteFill style={depthStyle(t, hold.origin)}>
        {layer(hold.fg)}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const INK = "#2e2924";
const CB_W = 440;
const CB_H = (CB_W * 655.69) / 534.25;
// the place and the name at the top, the logo under them (Scott: "the CB lower and Ruthin
// up top"), leaving the foot of the frame for the Story's link sticker
const NAME_TOP = 330;
const CB_TOP = 560;
const ease = Easing.bezier(0.45, 0, 0.4, 1);
const draw = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], { ...clamp, easing: ease });

// The end card drawn on the paper, in the shots' own layers: the CB roughed in pencil,
// inked, hatched, then washed in gold (landing on the track's accent; grainy and pale as it
// spreads, deepening to the brand gold with a faint shadow on the paper), the lines lifting
// away to the clean mark; the place in gold caps with its underline drawn, the name written
// in ink; one shimmer on the CB. Warm paper with a soft vignette (Scott: "can be stronger").
// The washed CB is then the official logo for light grounds (cbh-logo-on-light.svg, the
// same frame, so its gold CB lies exactly on the drawn one) and its wordmark draws down
// beneath (Scott: "it needs to turn to the real logo").
const DrawnEnd: React.FC<{
  paper: string;
  name: string;
  place: string;
  land: number;
  shimmer: number;
}> = ({ paper, name, place, land, shimmer }) => {
  // the timing below is written for the wash landing at 150 and the shimmer at 210; map the
  // film's frames onto it, before and after the landing
  const f = useCurrentFrame();
  const e =
    f <= land ? (f * 150) / land : 150 + ((f - land) * 60) / (shimmer - land);
  const u = 534.25 / CB_W; // viewBox units per px
  // the place and the name first (Scott: "the hotel line first, then the hand-drawn CB,
  // and it becomes real, and then shimmers")
  const caps = progress(e, 18, 18, EASE_OUT);
  const rule = draw(e, 24, 48);
  const write = interpolate(e, [30, 64], [0, 1], clamp);
  // then the CB: pencil, ink, hatching, the wash landing at 150
  const boil = 2.4 * (1 - draw(e, 140, 160));
  const pencil = draw(e, 50, 74);
  const inkC = draw(e, 60, 90);
  const inkB = draw(e, 76, 108);
  const hatch = draw(e, 96, 118);
  const wash = draw(e, 118, 150);
  const washDeep = draw(e, 134, 166);
  const pencilOut = 1 - draw(e, 120, 146);
  const inkOut = 1 - draw(e, 160, 184);
  const logo = draw(e, 172, 200); // the wordmark drawing down
  const edge = write * 120 - 10;
  const sweep = interpolate(e, [210, 240], [-60, 160], clamp);
  const strokes = (color: string, width: number, c: number, b: number) => (
    <>
      <path
        d={CB_C}
        fill="none"
        stroke={color}
        strokeWidth={width * u}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray="1 1"
        strokeDashoffset={1 - c}
      />
      <path
        d={CB_B}
        fill="none"
        stroke={color}
        strokeWidth={width * u}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray="1 1"
        strokeDashoffset={1 - b}
      />
    </>
  );
  const box = {
    position: "absolute",
    left: 540 - CB_W / 2,
    top: CB_TOP,
    width: CB_W,
    height: CB_H,
  } as const;
  return (
    <AbsoluteFill>
      <Img
        src={staticFile(paper)}
        style={{ position: "absolute", width: "100%", height: "100%" }}
      />
      {/* warm the paper and darken its edges, so the eye sits on the drawing */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 75% 60% at 50% 42%, rgba(255,236,200,0.16) 0%, rgba(255,236,200,0) 55%, rgba(84,62,34,0.22) 100%)",
          mixBlendMode: "multiply",
        }}
      />
      <svg viewBox={CB_VIEWBOX} style={{ ...box, overflow: "visible" }}>
        <defs>
          <filter id="cb-hand" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.02"
              numOctaves={1}
              seed={Math.floor(f / 3) % 97}
            />
            <feDisplacementMap
              in="SourceGraphic"
              scale={boil * 2 * u}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
          <filter id="wash-edge" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.018"
              numOctaves={3}
              seed={11}
            />
            <feDisplacementMap in="SourceGraphic" scale={70} />
          </filter>
          {/* watercolour granulation: fine pigment speckle, gone as the gold deepens */}
          <filter id="grain" x="0" y="0" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves={2}
              seed={4}
            />
            <feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.33  0 0 0 0 0.12  0 0 0 1.6 -0.75" />
          </filter>
          <filter id="cb-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation={5} />
          </filter>
          <clipPath id="cb-clip">
            <path d={CB_C} />
            <path d={CB_B} />
          </clipPath>
          <pattern
            id="hatch"
            patternUnits="userSpaceOnUse"
            width={13}
            height={13}
            patternTransform="rotate(-38)"
          >
            <line x1={3} y1={0} x2={3} y2={13} stroke={INK} strokeWidth={1.6} />
          </pattern>
          <radialGradient id="wash-g">
            <stop offset="0.72" stopColor="#fff" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask
            id="wash-m"
            maskUnits="userSpaceOnUse"
            x={-200}
            y={-200}
            width={934}
            height={1056}
          >
            <circle
              cx={190}
              cy={110}
              r={760 * wash}
              fill="url(#wash-g)"
              filter="url(#wash-edge)"
            />
          </mask>
        </defs>
        {/* pencil roughs, a little off the final line */}
        <g
          filter="url(#cb-hand)"
          opacity={0.42 * pencilOut}
          transform="translate(5 -4) rotate(0.7 267 328)"
        >
          {strokes("#857d72", 1.7, pencil, pencil)}
        </g>
        {/* hatching, laid in a stroke from the left, wobbling with the hand */}
        <g
          filter="url(#cb-hand)"
          clipPath="url(#cb-clip)"
          opacity={0.42 * inkOut}
        >
          <rect
            x={-20}
            y={-20}
            width={600 * hatch}
            height={700}
            fill="url(#hatch)"
          />
        </g>
        {/* a faint shadow under the finished mark, so it sits on the paper */}
        <g
          filter="url(#cb-shadow)"
          opacity={0.22 * washDeep}
          transform="translate(4 7)"
          style={{ mixBlendMode: "multiply" }}
        >
          <path d={CB_C} fill="#6b5226" />
          <path d={CB_B} fill="#6b5226" />
        </g>
        {/* the wash: pale and translucent as it spreads, deepening to the brand gold */}
        <g mask="url(#wash-m)">
          {/* multiplied, so the paper's grain shows through like watercolour */}
          <g opacity={0.85} style={{ mixBlendMode: "multiply" }}>
            <path d={CB_C} fill="#d9bf86" />
            <path d={CB_B} fill="#d9bf86" />
          </g>
          <g
            clipPath="url(#cb-clip)"
            opacity={0.55 * (1 - washDeep)}
            style={{ mixBlendMode: "multiply" }}
          >
            <rect x={0} y={0} width={534} height={656} filter="url(#grain)" />
          </g>
          <g opacity={washDeep}>
            <path d={CB_C} fill={colors.gold} />
            <path d={CB_B} fill={colors.gold} />
          </g>
        </g>
        <g filter="url(#cb-hand)" opacity={0.95 * inkOut}>
          {strokes(INK, 2.8, inkC, inkB)}
        </g>
      </svg>
      {/* the real logo: its CB over the drawn one, the wordmark (from 73% of the frame
          down) revealed top to bottom */}
      {e >= 172 ? (
        <Img
          src={staticFile("brand/cbh-logo-on-light.svg")}
          style={{
            ...box,
            // only the wordmark until the ink has lifted off the drawn CB (184)
            clipPath: `inset(${e < 184 ? 73 : 0}% 0 ${((1 - logo) * 27).toFixed(3)}% 0)`,
          }}
        />
      ) : null}
      {/* one shimmer, on the CB alone */}
      <div
        style={{
          ...box,
          WebkitMaskImage: `url(${staticFile("brand/cbh-logo-cb-only.svg")})`,
          maskImage: `url(${staticFile("brand/cbh-logo-cb-only.svg")})`,
          WebkitMaskSize: "100% 100%",
          maskSize: "100% 100%",
          background: `linear-gradient(110deg, transparent ${sweep - 25}%, rgba(255,246,220,0.95) ${sweep}%, transparent ${sweep + 25}%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: NAME_TOP,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontWeight: 600,
            fontSize: 30,
            letterSpacing: "0.26em",
            textTransform: "uppercase",
            // a deeper gold than on black, to read on the cream paper
            color: "#8a6a2e",
            opacity: caps,
            transform: `translateY(${(1 - caps) * 14}px)`,
          }}
        >
          <span
            style={{
              display: "inline-block",
              position: "relative",
              whiteSpace: "nowrap",
              paddingBottom: 10,
            }}
          >
            <span style={{ marginRight: "-0.26em" }}>{place}</span>
            <span
              style={{
                position: "absolute",
                left: 0,
                bottom: 0,
                height: 2,
                width: "100%",
                background: "#8a6a2e",
                transformOrigin: "0 50%",
                transform: `scaleX(${rule})`,
              }}
            />
          </span>
        </div>
        <div
          style={{
            fontFamily: serif,
            fontWeight: 600,
            fontSize: 84,
            lineHeight: 1.02,
            color: INK,
            marginTop: 24,
            WebkitMaskImage: `linear-gradient(90deg, #000 ${edge - 10}%, transparent ${edge}%)`,
            maskImage: `linear-gradient(90deg, #000 ${edge - 10}%, transparent ${edge}%)`,
          }}
        >
          {name}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// The clip (boiling while it is drawn) and its hold, under the shot's slow push.
const ShotPicture: React.FC<{
  shot: SketchShot;
  index: number;
  len: number;
}> = ({ shot, index, len }) => {
  const frame = useCurrentFrame();
  const push = shot.push
    ? interpolate(frame, [0, len], shot.push.scale, clamp)
    : 1;
  // the clip's own push as far as it has gone (the hold still has it baked in at `from`)
  const baked = (f: number) =>
    shot.clipPush
      ? 1 + shot.clipPush.rate * Math.max(0, f - shot.clipPush.from)
      : 1;
  const hold = shot.hold;
  const at = Math.min(frame, hold?.from ?? Infinity);
  const boil = shot.boil
    ? shot.boil.px * (1 - draw(frame, shot.boil.from, shot.boil.to))
    : 0;
  const clip = (
    <Video
      src={staticFile(shot.src)}
      muted
      objectFit="cover"
      style={{ width: "100%", height: "100%" }}
    />
  );
  const layered = hold?.fg && hold.bg && hold.sky;
  // the clip split by the hold's cut-outs (sized to the clip's push at this frame), so the
  // depth move can start while the drawing is still turning into the photo
  const k = hold ? baked(frame) / baked(hold.from) : 1;
  const cut = (src: string): React.CSSProperties => ({
    WebkitMaskImage: `url(${staticFile(src)})`,
    maskImage: `url(${staticFile(src)})`,
    WebkitMaskSize: `${(k * 100).toFixed(4)}% ${(k * 100).toFixed(4)}%`,
    maskSize: `${(k * 100).toFixed(4)}% ${(k * 100).toFixed(4)}%`,
    WebkitMaskPosition: "50% 50%",
    maskPosition: "50% 50%",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
  });
  const t = frame - (hold?.depthFrom ?? Infinity);
  const split = layered && t >= -1;
  // past the handover the clip runs on a few frames under the stills: hold it at the
  // handover's scale so the two match while they cross
  const video = (
    <AbsoluteFill
      style={{ transform: `scale(${(baked(at) / baked(frame)).toFixed(6)})` }}
    >
      {split ? (
        <>
          {/* behind the rising ground, the photo's rebuilt sky (the clip's own sky has the
              castle in it, which showed as a ghost under the overhang); the whole clip
              lies over it for the first frames so the split never pops */}
          <AbsoluteFill style={{ transform: `scale(${k.toFixed(6)})` }}>
            {layer(hold.bg!)}
          </AbsoluteFill>
          <AbsoluteFill
            style={{ opacity: interpolate(t, [0, 20], [1, 0], clamp) }}
          >
            <Boil id={`boil-${index}`} px={boil}>
              {clip}
            </Boil>
          </AbsoluteFill>
          <Boil id={`boil-sky-${index}`} px={boil}>
            <AbsoluteFill style={cut(hold.sky!)}>{clip}</AbsoluteFill>
          </Boil>
          <AbsoluteFill style={depthStyle(t, hold.origin)}>
            <Boil id={`boil-fg-${index}`} px={boil}>
              <AbsoluteFill style={cut(hold.fg!)}>{clip}</AbsoluteFill>
            </Boil>
          </AbsoluteFill>
        </>
      ) : (
        <Boil id={`boil-${index}`} px={boil}>
          {clip}
        </Boil>
      )}
    </AbsoluteFill>
  );
  return (
    <AbsoluteFill
      style={{
        transformOrigin: shot.push?.origin ?? "50% 50%",
        transform: `scale(${push.toFixed(5)})`,
      }}
    >
      <AbsoluteFill
        style={{ transform: `scale(${(1 / baked(at)).toFixed(6)})` }}
      >
        {hold ? (
          <>
            <Sequence
              durationInFrames={hold.from + (layered ? 7 : 1)}
              layout="none"
            >
              {video}
            </Sequence>
            <Sequence from={hold.from} layout="none">
              <Hold hold={hold} />
            </Sequence>
          </>
        ) : (
          video
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const SketchFilm: React.FC<{ film: SketchSpec }> = ({ film }) => {
  const frame = useCurrentFrame();
  const n = film.shots.length;
  const end = (i: number) =>
    i < n - 1 ? film.shots[i + 1].at : film.endAt + film.endFade;
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
      {film.drawnEnd ? (
        // The paper is already under the last shot as it fades.
        <Sequence from={film.endAt}>
          <DrawnEnd
            paper={film.drawnEnd.paper}
            name={film.endCard.lines.join(" ")}
            place={film.endCard.location}
            land={film.drawnEnd.land}
            shimmer={film.drawnEnd.shimmer}
          />
        </Sequence>
      ) : null}
      {film.shots.map((shot, i) => (
        <Sequence
          key={shot.src}
          from={shot.at}
          durationInFrames={end(i) - shot.at}
        >
          <AbsoluteFill
            style={{
              // The last shot settles into black (or the paper) under the end card.
              opacity:
                i === n - 1
                  ? interpolate(
                      frame,
                      [film.endAt, film.endAt + film.endFade],
                      [1, 0],
                      clamp,
                    )
                  : 1,
            }}
          >
            <ShotPicture shot={shot} index={i} len={end(i) - shot.at} />
            {shot.note ? <Note note={shot.note} /> : null}
          </AbsoluteFill>
        </Sequence>
      ))}
      {film.watermark ? (
        <Img
          src={staticFile(film.watermark.src)}
          style={{
            position: "absolute",
            left: film.watermark.x,
            top: film.watermark.y,
            width: film.watermark.size[0],
            height: film.watermark.size[1],
            opacity: interpolate(
              frame,
              [film.endAt, film.endAt + film.endFade],
              [1, 0],
              clamp,
            ),
          }}
        />
      ) : null}
      {/* The end card has its own black ground, so it arrives once the fade is done. */}
      {film.drawnEnd ? null : (
        <Sequence from={film.endAt + film.endFade}>
          <EndCard {...film.endCard} logo="cb-shimmer" rule={false} delay={0} />
        </Sequence>
      )}
      {/* No vignette or grain: the paper carries its own texture, and they greyed it. */}
    </AbsoluteFill>
  );
};
