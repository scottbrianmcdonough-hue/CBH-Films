import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import {
  AbsoluteFill,
  Easing,
  Img,
  OffthreadVideo,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { CBLogo } from "../components/CBLogo";
import { FilmFinish } from "../components/FilmFinish";
import { PawTrail } from "../components/PawTrail";
import { colors, EASE_IN_OUT, EASE_OUT, progress, sans, serif } from "../theme";
import type { FootageShot, FootageSpec } from "./types";

const H = 1920;
const LAND = 7;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// A line rises out of its own mask and lands (the one text move).
const Land: React.FC<{ at: number; children: React.ReactNode }> = ({
  at,
  children,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + LAND], [0, 1], {
    ...clamp,
    easing: EASE_OUT,
  });
  return (
    <div style={{ overflow: "hidden" }}>
      <div style={{ transform: `translateY(${(1 - p) * 110}%)` }}>
        {children}
      </div>
    </div>
  );
};

// A calm text block, left-aligned in the lower third over a full-width gradient. It lands
// once the crossfade in has finished (or is set from frame one for the hook), and a thin
// gold rule draws under it at a steady pace until the next cut.
const Card: React.FC<{
  lines: string[];
  small?: string;
  at: number;
  ruleFrom: number;
  ruleTo: number;
}> = ({ lines, small, at, ruleFrom, ruleTo }) => {
  const frame = useCurrentFrame();
  const rule = interpolate(frame, [ruleFrom, ruleTo], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(9,9,10,0) 50%, rgba(9,9,10,0.62) 66%, rgba(9,9,10,0.7) 78%, rgba(9,9,10,0.35) 100%)",
          opacity: at > 0 ? progress(frame, at - 6, 12) : 1,
        }}
      />
      <div style={{ position: "absolute", left: 72, bottom: 520 }}>
        <div style={{ display: "inline-block" }}>
          {lines.map((line) => (
            <Land key={line} at={at}>
              <div
                style={{
                  fontFamily: serif,
                  fontSize: 78,
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
          <div
            style={{
              height: 2,
              width: `${rule * 100}%`,
              background: colors.gold,
              marginTop: 18,
            }}
          />
        </div>
        {small ? (
          <Land at={at}>
            <div
              style={{
                fontFamily: sans,
                fontWeight: 600,
                fontSize: 30,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: colors.gold,
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

// Gold foil: a metallic gradient (deep gold, bright highlights) rather than flat gold.
const FOIL =
  "linear-gradient(100deg, #B8913F 0%, #F3E3BC 32%, #D4B06A 52%, #FBF0D2 70%, #C39E55 100%)";

// One line rising up from behind an invisible baseline (its own mask), landing at `at`.
const Rise: React.FC<{ at: number; children: React.ReactNode }> = ({
  at,
  children,
}) => {
  const frame = useCurrentFrame();
  const p = progress(frame, at, 22);
  return (
    <div
      style={{
        overflow: "hidden",
        paddingBottom: "0.12em",
        marginBottom: "-0.12em",
      }}
    >
      <div style={{ transform: `translateY(${(1 - p) * 105}%)` }}>
        {children}
      </div>
    </div>
  );
};

// One text block held over the shots: bottom-left over a soft dark scrim pocket, arriving
// once as a calm masked reveal (each line rising from behind its own baseline, a few frames
// apart), lifted off the footage by a soft, wide shadow. The eyebrow and the static rule are
// gold foil. A "\n" in the headline breaks it into two lines. With `until`, it fades out.
const Block: React.FC<{
  eyebrow: string;
  headline: string;
  line: string;
  at: number;
  until?: number;
}> = ({ eyebrow, headline, line, at, until }) => {
  const frame = useCurrentFrame();
  const out = until ? 1 - progress(frame, until, 14, EASE_IN_OUT) : 1;
  const lift = "0 3px 28px rgba(9,9,10,0.55), 0 1px 3px rgba(9,9,10,0.45)";
  const heads = headline.split("\n");
  const step = 4; // frames between lines
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 1150px 640px at 0px 1330px, rgba(9,9,10,0.74) 0%, rgba(9,9,10,0.5) 45%, rgba(9,9,10,0) 100%)",
          opacity: progress(frame, at - 6, 20),
        }}
      />
      <div style={{ position: "absolute", left: 72, bottom: 480 }}>
        <Rise at={at}>
          <div
            style={{
              fontFamily: sans,
              fontWeight: 600,
              fontSize: 29,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              background: FOIL,
              WebkitBackgroundClip: "text",
              color: "transparent",
              filter: "drop-shadow(0 2px 10px rgba(9,9,10,0.6))",
            }}
          >
            {eyebrow}
          </div>
        </Rise>
        <div style={{ marginTop: 14 }}>
          {heads.map((h, i) => (
            <Rise key={h} at={at + step * (i + 1)}>
              <div
                style={{
                  fontFamily: serif,
                  fontSize: 104,
                  lineHeight: 1.05,
                  color: colors.cream,
                  whiteSpace: "nowrap",
                  textShadow: lift,
                }}
              >
                {h}
              </div>
            </Rise>
          ))}
        </div>
        <div
          style={{
            height: 2,
            width: 120,
            background: FOIL,
            margin: "20px 0 22px",
            boxShadow: "0 1px 6px rgba(9,9,10,0.5)",
            transformOrigin: "0 50%",
            transform: `scaleX(${progress(frame, at + step * (heads.length + 1), 22)})`,
          }}
        />
        <Rise at={at + step * (heads.length + 2)}>
          <div
            style={{
              fontFamily: sans,
              fontSize: 31,
              letterSpacing: "0.04em",
              color: colors.cream,
              textShadow: lift,
            }}
          >
            {line}
          </div>
        </Rise>
      </div>
    </AbsoluteFill>
  );
};

// The scrim pocket under the hook and offer blocks: the same soft dark radial as `Block`,
// held still across every shot.
export const SCRIM =
  "radial-gradient(ellipse 1150px 640px at 0px 1330px, rgba(9,9,10,0.74) 0%, rgba(9,9,10,0.5) 45%, rgba(9,9,10,0) 100%)";
const LIFT = "0 3px 28px rgba(9,9,10,0.55), 0 1px 3px rgba(9,9,10,0.45)";

// The whole block arrives as one piece (a gentle rise and fade from `at`) and fades out
// so it has gone by `out`.
const useArrive = (at: number, out: number) => {
  const frame = useCurrentFrame();
  const p = progress(frame, at, 18, EASE_OUT);
  const gone = progress(frame, out - 12, 12, EASE_IN_OUT);
  return {
    opacity: p * (1 - gone),
    transform: `translateY(${(1 - p) * 28}px)`,
  };
};

const Caps: React.FC<{ size: number; children: React.ReactNode }> = ({
  size,
  children,
}) => (
  <div
    style={{
      fontFamily: sans,
      fontWeight: 600,
      fontSize: size,
      letterSpacing: "0.24em",
      textTransform: "uppercase",
      color: colors.gold, // flat brand gold (Scott: no foil highlights)
      textShadow: "0 2px 10px rgba(9,9,10,0.6)",
    }}
  >
    {children}
  </div>
);

// The hook over the cold open, set on frame one (so it reads on the cover frame).
export const Hook: React.FC<{
  eyebrow: string;
  headline: string;
  out: number;
}> = ({ eyebrow, headline, out }) => (
  <AbsoluteFill>
    <div
      style={{
        position: "absolute",
        left: 72,
        bottom: 480,
        ...useArrive(-18, out),
      }}
    >
      <Caps size={32}>{eyebrow}</Caps>
      <div
        style={{
          fontFamily: serif,
          fontSize: 124,
          lineHeight: 1.02,
          marginTop: 10,
          color: colors.cream,
          whiteSpace: "nowrap",
          textShadow: LIFT,
        }}
      >
        {headline}
      </div>
    </div>
  </AbsoluteFill>
);

// One hotel's offer: name, town in gold caps, a static gold rule, the offer name. The gold
// is the flat brand gold, not the foil gradient (its pale highlights read as gold and white).
export const Offer: React.FC<{
  name: string;
  place: string;
  offer: string;
  at: number;
  out: number;
  placeFirst?: boolean;
}> = ({ name, place, offer, at, out, placeFirst }) => (
  <AbsoluteFill>
    <div
      style={{
        position: "absolute",
        left: 72,
        bottom: 480,
        ...useArrive(at, out),
      }}
    >
      {placeFirst ? (
        // the house label order (Scott, 16 and 20 Oct): the place in gold caps over its
        // underline, the name in cream Cormorant, then the offer beneath
        <>
          <div style={{ display: "inline-block" }}>
            <Caps size={28}>{place}</Caps>
            <div
              style={{
                height: 2,
                marginTop: 12,
                background: colors.gold,
                boxShadow: "0 1px 6px rgba(9,9,10,0.5)",
              }}
            />
          </div>
          <div
            style={{
              fontFamily: serif,
              fontSize: 92,
              lineHeight: 1.04,
              marginTop: 16,
              color: colors.cream,
              whiteSpace: "pre",
              textShadow: LIFT,
            }}
          >
            {name}
          </div>
          <div
            style={{
              fontFamily: serif,
              fontStyle: "italic",
              fontSize: 62,
              lineHeight: 1.1,
              marginTop: 14,
              color: colors.cream,
              whiteSpace: "nowrap",
              textShadow: LIFT,
            }}
          >
            {offer}
          </div>
        </>
      ) : (
        <>
          <div
            style={{
              fontFamily: serif,
              fontSize: 92,
              lineHeight: 1.04,
              color: colors.cream,
              whiteSpace: "nowrap",
              textShadow: LIFT,
            }}
          >
            {name}
          </div>
          <div style={{ marginTop: 10 }}>
            <Caps size={28}>{place}</Caps>
          </div>
          <div
            style={{
              height: 2,
              width: 120,
              background: colors.gold,
              margin: "24px 0 20px",
              boxShadow: "0 1px 6px rgba(9,9,10,0.5)",
            }}
          />
          <div
            style={{
              fontFamily: serif,
              fontStyle: "italic",
              fontSize: 62,
              lineHeight: 1.1,
              color: colors.cream,
              whiteSpace: "nowrap",
              textShadow: LIFT,
            }}
          >
            {offer}
          </div>
        </>
      )}
    </div>
  </AbsoluteFill>
);

const Picture: React.FC<{ shot: FootageShot; frames: number }> = ({
  shot,
  frames,
}) => {
  const frame = useCurrentFrame();
  if (shot.kind === "video") {
    return (
      <AbsoluteFill style={{ backgroundColor: colors.black }}>
        {/* frame-accurate (the streaming <Video> skipped and froze a frame or two after a crossfade:
            Scott, "a weird jitter" on Forest of Arden) */}
        <OffthreadVideo
          src={staticFile(shot.src)}
          trimBefore={Math.round(shot.from * 30)}
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>
    );
  }
  const [sw, sh] = shot.size;
  const ch = shot.crop.h ?? sh;
  const cw = (ch * 9) / 16;
  const cy = shot.crop.cy ?? sh / 2;
  const k = H / ch;
  const t = frame / frames;
  const zoom = 1 + (shot.drift ?? 0) * t;
  const shift = (shot.pan ?? 0) * (t - 0.5);
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: colors.black }}>
      <AbsoluteFill
        style={{ transform: `translateX(${shift}px) scale(${zoom})` }}
      >
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
      {shot.shade ? (
        <AbsoluteFill
          style={{
            background: `linear-gradient(to bottom, rgba(9,9,10,0) 45%, rgba(9,9,10,${shot.shade}) 72%, rgba(9,9,10,${shot.shade * 0.7}) 100%)`,
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

// The title end card (October Best Loved): the reel's own hook set again, centred on black,
// as one calm block (a gentle rise and fade): a gold caps eyebrow, the title large in
// Cormorant, an optional line in Cormorant italic (no gold rule, Scott); then the
// official CBH logo wipes up with the shimmer on the CB, and it all holds while the music
// fades. Flat brand gold, no drawing line, no monogram.
const TitleEndCard: React.FC<{
  eyebrow: string;
  tagline?: string;
  lines: string[];
  logo?: boolean | "cb-shimmer";
  logoDelay?: number;
  delay: number;
}> = ({ eyebrow, tagline, lines, logo, logoDelay = 30, delay }) => {
  const frame = useCurrentFrame();
  const arrive = progress(frame, delay, 22, EASE_OUT);
  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.black,
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: 200,
      }}
    >
      <div
        style={{
          opacity: arrive,
          transform: `translateY(${(1 - arrive) * 40}px)`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontWeight: 600,
            fontSize: 34,
            letterSpacing: "0.32em",
            paddingLeft: "0.32em",
            textTransform: "uppercase",
            color: colors.gold,
          }}
        >
          {eyebrow}
        </div>
        {lines.map((line) => (
          <div
            key={line}
            style={{
              fontFamily: serif,
              fontSize: 150,
              lineHeight: 1.02,
              marginTop: 8,
              color: colors.cream,
              whiteSpace: "nowrap",
            }}
          >
            {line}
          </div>
        ))}

        {tagline ? (
          <div
            style={{
              fontFamily: serif,
              fontStyle: "italic",
              fontSize: 64,
              marginTop: 30,
              color: colors.cream,
            }}
          >
            {tagline}
          </div>
        ) : null}
      </div>
      {logo ? (
        <div style={{ position: "absolute", bottom: 470 }}>
          <CBLogo
            start={delay + logoDelay}
            width={190}
            shimmerAt={delay + logoDelay + 32}
            cbOnly={logo === "cb-shimmer"}
          />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// Name and location on black, arriving as one calm block (a single gentle rise and fade,
// from `delay`) with the gold rule drawing once under the name; then, optionally, the
// animated CB logo reveals with its gold shimmer (as on the house end cards; "cb-shimmer"
// keeps the sweep on the CB monogram alone); and it all holds while the music fades.
export const EndCard: React.FC<{
  lines: string[];
  location?: string;
  logo?: boolean | "cb-shimmer";
  rule?: boolean;
  title?: { eyebrow: string; tagline?: string };
  logoDelay?: number;
  clear?: boolean; // no black ground: the card sits over the scene behind it
  // the house label order (Scott, 20 Oct, on Low Wood Bay): the place in small gold caps with
  // its gold underline on top, then the name in cream Cormorant
  placeFirst?: boolean;
  delay: number;
}> = ({
  lines,
  location,
  clear,
  placeFirst,
  logo,
  rule: drawRule = true,
  title,
  logoDelay,
  delay,
}) => {
  const frame = useCurrentFrame();
  if (title) {
    return (
      <TitleEndCard
        {...title}
        lines={lines}
        logo={logo}
        logoDelay={logoDelay}
        delay={delay}
      />
    );
  }
  const arrive = progress(frame, delay, 18, EASE_OUT);
  const rule = interpolate(frame, [delay + 20, delay + 60], [0, 1], clamp);
  const ground = clear ? "transparent" : colors.black;
  if (placeFirst) {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: ground,
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: 120,
        }}
      >
        <div
          style={{
            opacity: arrive,
            transform: `translateY(${(1 - arrive) * 40}px)`,
            textAlign: "center",
          }}
        >
          {location ? (
            <div style={{ display: "inline-block", marginBottom: 34 }}>
              <div
                style={{
                  fontFamily: sans,
                  fontWeight: 600,
                  fontSize: 30,
                  letterSpacing: "0.32em",
                  paddingLeft: "0.32em",
                  textTransform: "uppercase",
                  color: colors.gold,
                }}
              >
                {location}
              </div>
              <div
                style={{
                  height: 2,
                  width: `${rule * 100}%`,
                  background: colors.gold,
                  margin: "14px auto 0",
                }}
              />
            </div>
          ) : null}
          {lines.map((line) => (
            <div
              key={line}
              style={{
                fontFamily: serif,
                fontSize: 96,
                lineHeight: 1.05,
                color: colors.cream,
              }}
            >
              {line}
            </div>
          ))}
        </div>
        {logo ? (
          <div style={{ position: "absolute", bottom: 470 }}>
            <CBLogo
              start={delay + 30}
              width={190}
              shimmerAt={delay + 62}
              cbOnly={logo === "cb-shimmer"}
            />
          </div>
        ) : null}
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill
      style={{
        backgroundColor: ground,
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: 120,
      }}
    >
      <div
        style={{
          opacity: arrive,
          transform: `translateY(${(1 - arrive) * 40}px)`,
          textAlign: "center",
        }}
      >
        <div style={{ display: "inline-block" }}>
          {lines.map((line) => (
            <div
              key={line}
              style={{
                fontFamily: serif,
                fontSize: 96,
                lineHeight: 1.05,
                color: colors.cream,
              }}
            >
              {line}
            </div>
          ))}
          {drawRule ? (
            <div
              style={{
                height: 2,
                width: `${rule * 100}%`,
                background: colors.gold,
                margin: "26px auto 0",
              }}
            />
          ) : null}
        </div>
        <div
          style={{
            fontFamily: sans,
            fontWeight: 600,
            fontSize: 30,
            letterSpacing: "0.32em",
            paddingLeft: "0.32em",
            textTransform: "uppercase",
            color: colors.gold,
            marginTop: 28,
          }}
        >
          {location}
        </div>
      </div>
      {logo ? (
        <div style={{ position: "absolute", bottom: 470 }}>
          <CBLogo
            start={delay + 30}
            width={190}
            shimmerAt={delay + 62}
            cbOnly={logo === "cb-shimmer"}
          />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const FootageFilm: React.FC<{ film: FootageSpec }> = ({ film }) => {
  const frame = useCurrentFrame();
  const bounds = [0, ...film.cuts, film.durationInFrames];
  const n = film.shots.length + (film.endCard ? 1 : 0); // shots plus any end card
  // The transition after section i: the last one into an end card may be `endFade`.
  const tx = (i: number) =>
    film.endCard && film.endFade && i === n - 2 ? film.endFade : film.crossfade;
  const len = (i: number) =>
    bounds[i + 1] -
    bounds[i] +
    (i > 0 ? tx(i - 1) / 2 : 0) +
    (i < n - 1 ? tx(i) / 2 : 0);
  // Where the shots end: the end card's start, or the end of the film.
  const end = film.endCard
    ? film.cuts[film.cuts.length - 1]
    : film.durationInFrames;
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
      <TransitionSeries>
        {film.shots.flatMap((shot, i) => [
          <TransitionSeries.Sequence key={`s${i}`} durationInFrames={len(i)}>
            <Picture shot={shot} frames={len(i)} />
          </TransitionSeries.Sequence>,
          i === n - 1 ? null : (
            <TransitionSeries.Transition
              key={`t${i}`}
              presentation={fade()}
              timing={linearTiming({
                durationInFrames: tx(i),
                easing: Easing.bezier(0.65, 0, 0.35, 1),
              })}
            />
          ),
        ])}
        {film.endCard ? (
          <TransitionSeries.Sequence durationInFrames={len(n - 1)}>
            <EndCard
              {...film.endCard}
              // With a slow end fade, the card's text waits until the fade to black is done.
              delay={film.endFade ?? 0}
            />
          </TransitionSeries.Sequence>
        ) : null}
      </TransitionSeries>
      {film.shots.map((shot, i) => {
        if (!shot.card) return null;
        const from = bounds[i];
        const to = bounds[i + 1];
        const at = i === 0 ? -LAND : tx(i - 1) / 2; // the hook is set on frame one
        return (
          <Sequence key={`c${i}`} from={from} durationInFrames={to - from}>
            <Card
              lines={shot.card.lines}
              small={shot.card.small}
              at={at}
              ruleFrom={Math.max(at, 0)}
              ruleTo={to - from}
            />
          </Sequence>
        );
      })}
      {film.block ? <Block {...film.block} /> : null}
      {film.hook || film.offers ? (
        <Sequence durationInFrames={end}>
          <AbsoluteFill
            style={{
              background: SCRIM,
              opacity:
                film.endCard && !film.watermarkOnEndCard
                  ? interpolate(
                      frame,
                      [end - tx(n - 2) / 2, end],
                      [1, 0],
                      clamp,
                    )
                  : 1,
            }}
          />
        </Sequence>
      ) : null}
      {film.hook ? (
        <Sequence durationInFrames={bounds[1]}>
          <Hook {...film.hook} out={bounds[1] - tx(0) / 2} />
        </Sequence>
      ) : null}
      {film.offers?.map(({ shots: [a, b], ...offer }) => {
        const from = bounds[a];
        const to = bounds[b + 1];
        return (
          <Sequence key={offer.name} from={from} durationInFrames={to - from}>
            <Offer
              {...offer}
              placeFirst={film.offersPlaceFirst}
              at={tx(a - 1) / 2 - 4}
              out={to - from - tx(b) / 2}
            />
          </Sequence>
        );
      })}
      {film.paws ? (
        <Sequence durationInFrames={bounds[1]}>
          <PawTrail
            {...film.paws}
            steps={8}
            start={4}
            every={5}
            life={28}
            size={58}
            scale={[1.3, 0.8]}
          />
        </Sequence>
      ) : null}
      {film.watermark ? (
        <Sequence
          durationInFrames={
            film.watermarkOnEndCard ? film.durationInFrames : end
          }
        >
          <Img
            src={staticFile(film.watermark.src)}
            style={{
              position: "absolute",
              left: film.watermark.x,
              top: film.watermark.y,
              width: film.watermark.size[0],
              height: film.watermark.size[1],
              // Off the end card: it fades with the footage into the card.
              opacity:
                film.endCard && !film.watermarkOnEndCard
                  ? interpolate(
                      frame,
                      [end - tx(n - 2) / 2, end],
                      [1, 0],
                      clamp,
                    )
                  : 1,
            }}
          />
        </Sequence>
      ) : null}
      <FilmFinish />
    </AbsoluteFill>
  );
};
