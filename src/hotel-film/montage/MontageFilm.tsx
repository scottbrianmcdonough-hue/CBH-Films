import { Audio, Video } from "@remotion/media";
import {
  AbsoluteFill,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { CBLogo } from "../components/CBLogo";
import { FilmFinish } from "../components/FilmFinish";
import { FadeIn, RevealLine } from "../components/RevealWords";
import { colors, EASE_IN_OUT, EASE_OUT, progress, sans, serif } from "../theme";
import { RosetteCounter } from "./RosetteCounter";
import {
  endCardStart,
  montageShots,
  type MontageShot,
  type MontageSpec,
} from "./types";

const H = 1920;

// The one text move: a line rises out of its own mask and lands, in LAND frames from
// the beat it starts on. Used for the hotel labels and the end card build alike.
const LAND = 7;
const Land: React.FC<{ at?: number; children: React.ReactNode }> = ({
  at = 0,
  children,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + LAND], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
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

// One still, cropped to 9:16 around its subject. "push": a slow push-in across the
// shot. "settle": the one camera move of a static cut, landing 4% in and easing to rest
// in a quarter-second from the beat it cuts on, then holding dead still.
const Shot: React.FC<{
  shot: MontageShot;
  frames: number;
  pushIn: number;
  motion: "push" | "settle" | "static";
}> = ({ shot, frames, pushIn, motion }) => {
  const frame = useCurrentFrame();
  if (shot.clip) {
    return (
      <AbsoluteFill style={{ backgroundColor: colors.black }}>
        <Video
          src={staticFile(shot.clip)}
          muted
          style={{ width: "100%", height: "100%" }}
        />
      </AbsoluteFill>
    );
  }
  const [sw, sh] = shot.size;
  const ch = shot.crop.h ?? sh;
  const cw = (ch * 9) / 16;
  const cy = shot.crop.cy ?? sh / 2;
  const k = H / ch;
  const zoom =
    motion === "static"
      ? 1
      : motion === "settle"
        ? 1 + 0.04 * (1 - progress(frame, 0, 8))
        : 1 + pushIn * (frame / frames);
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: colors.black }}>
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
    </AbsoluteFill>
  );
};

// Hotel name and location, left-aligned in the lower third over a full-width gradient,
// clear of the Reels caption zone. The lines land on the beat the shot cuts on; a thin
// gold rule then draws under the name at a steady pace, completing on the next cut.
const Rule2: React.FC<{ frames: number }> = ({ frames }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, frames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        height: 2,
        width: `${p * 100}%`,
        background: colors.gold,
        marginTop: 18,
      }}
    />
  );
};

const Label: React.FC<{
  eyebrow?: string;
  lines: string[];
  location: string;
  ruleFrames: number;
  rule?: boolean;
}> = ({ eyebrow, lines, location, ruleFrames, rule = true }) => (
  <AbsoluteFill>
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(to bottom, rgba(9,9,10,0) 50%, rgba(9,9,10,0.62) 66%, rgba(9,9,10,0.7) 78%, rgba(9,9,10,0.35) 100%)",
      }}
    />
    <div style={{ position: "absolute", left: 72, bottom: 520 }}>
      {eyebrow ? (
        <Land>
          <div
            style={{
              fontFamily: sans,
              fontWeight: 600,
              fontSize: 40,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: colors.lightGold,
              marginBottom: 16,
              textShadow: "0 2px 16px rgba(9,9,10,0.7)",
            }}
          >
            {eyebrow}
          </div>
        </Land>
      ) : null}
      <div style={{ display: "inline-block" }}>
        {lines.map((line) => (
          <Land key={line}>
            <div
              style={{
                fontFamily: serif,
                fontSize: 84,
                lineHeight: 1.02,
                color: colors.cream,
                whiteSpace: "nowrap",
                textShadow: "0 2px 22px rgba(9,9,10,0.55)",
              }}
            >
              {line}
            </div>
          </Land>
        ))}
        {rule ? <Rule2 frames={ruleFrames} /> : null}
      </div>
      <Land>
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
          {location}
        </div>
      </Land>
    </div>
  </AbsoluteFill>
);

// Hook: on screen, fully set, from frame one.
const Hook: React.FC<{ lines: string[] }> = ({ lines }) => (
  <AbsoluteFill>
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(to bottom, rgba(9,9,10,0.6) 0%, rgba(9,9,10,0) 30%)",
      }}
    />
    <div style={{ position: "absolute", left: 72, right: 192, top: 250 }}>
      {lines.map((line) => (
        <div
          key={line}
          style={{
            fontFamily: serif,
            fontWeight: 400,
            fontSize: 112,
            lineHeight: 1.02,
            color: colors.cream,
          }}
        >
          {line}
        </div>
      ))}
    </div>
  </AbsoluteFill>
);

// The campaign lockup, after the official Deliciously Autumn artwork, with the CB mark.
// Everything sits inside the central 4:5 area so it survives the profile-grid crop,
// and above the Reels caption area.
const Rule: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const p = progress(frame, start, 24, EASE_IN_OUT);
  return (
    <div
      style={{
        width: 920 * p,
        height: 2,
        background: colors.gold,
        margin: "46px auto 0",
      }}
    />
  );
};

type Lockup = NonNullable<MontageSpec["endCard"]["lockup"]>;
type Artwork = NonNullable<MontageSpec["endCard"]["artwork"]>;

const TypesetLockup: React.FC<{ card: Lockup }> = ({ card }) => (
  <AbsoluteFill
    style={{
      backgroundColor: colors.black,
      alignItems: "center",
      justifyContent: "center",
      paddingBottom: 100,
    }}
  >
    <RevealLine
      start={2}
      style={{
        fontFamily: serif,
        fontWeight: 500,
        fontSize: 186,
        lineHeight: 0.92,
        color: colors.cream,
      }}
    >
      {card.headline[0]}
    </RevealLine>
    <RevealLine
      start={7}
      style={{
        fontFamily: serif,
        fontWeight: 500,
        fontSize: 112,
        lineHeight: 0.95,
        color: colors.cream,
      }}
    >
      {card.headline[1]}
    </RevealLine>
    <Rule start={12} />
    <FadeIn
      start={16}
      style={{
        fontFamily: sans,
        fontWeight: 400,
        fontSize: 46,
        color: colors.cream,
        marginTop: 30,
      }}
    >
      {card.offer}
    </FadeIn>
    <FadeIn
      start={22}
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 16,
        marginTop: 18,
        fontFamily: sans,
        color: colors.gold,
      }}
    >
      <span
        style={{
          fontSize: 30,
          fontWeight: 600,
          letterSpacing: "0.04em",
          color: colors.cream,
        }}
      >
        {card.price.from}
      </span>
      <span style={{ fontSize: 92, fontWeight: 500, letterSpacing: "-0.02em" }}>
        {card.price.pounds}
        <span style={{ fontSize: 58 }}>{card.price.pence}</span>
      </span>
    </FadeIn>
    <div style={{ marginTop: 70 }}>
      <CBLogo start={28} width={100} shimmerAt={62} />
    </div>
  </AbsoluteFill>
);

// The official 4:5 creative at full width, its own top and bottom edges stretched and
// softened to fill the 9:16 frame so it reads as one picture, darkening at the foot. The
// whole card arrives as one calm block on the downbeat (a single gentle rise and fade),
// then the artwork's gold rule draws once, left to right over two beats, and everything
// holds still while the music fades. The headline clears the top safe zone and
// everything sits inside the profile-grid crop.
const ART_TOP = 190;
const EDGE = 30; // source rows stretched to fill each end
const FEATHER = 60;
const ARRIVE = 18; // frames for the block's rise and fade
const RULE_AT = 20; // the next beat after the cut
const RULE_FRAMES = 40; // two beats

const ArtworkCard: React.FC<{ art: Artwork; mark: boolean }> = ({
  art,
  mark,
}) => {
  const frame = useCurrentFrame();
  const [aw, ah] = art.size;
  const k = 1080 / aw;
  const h = ah * k;
  const bottom = ART_TOP + h;
  const arrive = progress(frame, 0, ARRIVE, EASE_OUT);
  const draw = interpolate(frame, [RULE_AT, RULE_AT + RULE_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Stretch source rows [r0, r0 + EDGE] over screen rows [y0, y1].
  const strip = (r0: number, y0: number, y1: number) => {
    const sy = (y1 - y0) / (EDGE * k);
    return (
      <div
        style={{
          position: "absolute",
          left: 0,
          top: y0,
          width: 1080,
          height: y1 - y0,
          overflow: "hidden",
        }}
      >
        <Img
          src={staticFile(art.src)}
          style={{
            position: "absolute",
            left: 0,
            top: -r0 * k * sy,
            width: 1080,
            height: h * sy,
            filter: "blur(18px)",
            transform: "scaleX(1.06)",
          }}
        />
      </div>
    );
  };
  const mask = `linear-gradient(to bottom, transparent 0, black ${FEATHER}px, black calc(100% - ${FEATHER}px), transparent 100%)`;
  const { rule } = art;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          opacity: arrive,
          transform: `translateY(${(1 - arrive) * 40}px)`,
        }}
      >
        {strip(0, 0, ART_TOP + FEATHER)}
        {strip(ah - EDGE, bottom - FEATHER, H)}
        <div
          style={{
            position: "absolute",
            top: ART_TOP,
            width: 1080,
            height: h,
            WebkitMaskImage: mask,
            maskImage: mask,
          }}
        >
          <Img
            src={staticFile(art.src)}
            style={{ width: 1080, height: h, display: "block" }}
          />
        </div>
        {rule ? (
          <div
            style={{
              position: "absolute",
              left: rule.x0 * k,
              top: ART_TOP + rule.y * k,
              width: (rule.x1 - rule.x0) * k * draw,
              height: rule.height * k,
              background: rule.color,
            }}
          />
        ) : null}
        <AbsoluteFill
          style={{
            background: `linear-gradient(to bottom, rgba(9,9,10,0) ${bottom - 40}px, rgba(9,9,10,0.85) ${bottom + 90}px, rgba(9,9,10,0.95) 100%)`,
          }}
        />
      </AbsoluteFill>
      {mark ? (
        <div
          style={{
            position: "absolute",
            top: bottom + 12,
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <CBLogo
            start={RULE_AT + RULE_FRAMES}
            width={100}
            shimmerAt={RULE_AT + RULE_FRAMES + 30}
          />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// Brand card: lines on black arriving as one calm block, then the animated CB logo
// reveals with its gold shimmer, and it all holds while the music fades.
const BrandCard: React.FC<{ lines: string[]; sub?: string }> = ({
  lines,
  sub,
}) => {
  const frame = useCurrentFrame();
  const arrive = progress(frame, 0, 18, EASE_OUT);
  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.black,
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: 160,
      }}
    >
      <div
        style={{
          opacity: arrive,
          transform: `translateY(${(1 - arrive) * 40}px)`,
          textAlign: "center",
        }}
      >
        {lines.map((line) => (
          <div
            key={line}
            style={{
              fontFamily: serif,
              fontSize: 104,
              lineHeight: 1.04,
              color: colors.cream,
            }}
          >
            {line}
          </div>
        ))}
        {sub ? (
          <div
            style={{
              fontFamily: sans,
              fontWeight: 600,
              fontSize: 30,
              letterSpacing: "0.3em",
              paddingLeft: "0.3em",
              textTransform: "uppercase",
              color: colors.gold,
              marginTop: 30,
            }}
          >
            {sub}
          </div>
        ) : null}
      </div>
      {/* Sits above the Reels/TikTok caption area. */}
      <div style={{ position: "absolute", bottom: 470 }}>
        <CBLogo start={24} width={190} shimmerAt={56} />
      </div>
    </AbsoluteFill>
  );
};

const EndCard: React.FC<{
  card: MontageSpec["endCard"];
  mark: boolean;
}> = ({ card, mark }) =>
  card.brand ? (
    <BrandCard lines={card.brand.lines} sub={card.brand.sub} />
  ) : card.artwork ? (
    <ArtworkCard art={card.artwork} mark={mark} />
  ) : card.lockup ? (
    <TypesetLockup card={card.lockup} />
  ) : null;

// Iris reveal: the shot opens out from the centre of the frame through an expanding
// circle over IRIS frames from the start of its Sequence (its beat).
const IRIS = 14;
const Iris: React.FC<{ on: boolean; children: React.ReactNode }> = ({
  on,
  children,
}) => {
  const frame = useCurrentFrame();
  if (!on) return <>{children}</>;
  const p = interpolate(frame, [0, IRIS], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_IN_OUT,
  });
  const r = p * Math.hypot(540, 960);
  return (
    <AbsoluteFill style={{ clipPath: `circle(${r}px at 50% 50%)` }}>
      {children}
    </AbsoluteFill>
  );
};

export const MontageFilm: React.FC<{ film: MontageSpec }> = ({ film }) => {
  const shots = montageShots(film);
  const cuts = film.cuts;
  const end = endCardStart(film);
  const total = film.durationInFrames;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      {film.music ? (
        <Audio
          src={staticFile(film.music.src)}
          trimBefore={film.music.startAt}
          volume={(fr) =>
            film.music!.gain *
            interpolate(fr, [film.music!.fadeFrom, total], [1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          }
        />
      ) : null}
      {shots.map(({ shot }, i) => {
        // With the iris, each shot stays under the next while it opens.
        const tail = film.reveal === "iris" && i < shots.length - 1 ? IRIS : 0;
        return (
          <Sequence
            key={shot.src}
            from={cuts[i]}
            durationInFrames={cuts[i + 1] - cuts[i] + tail}
          >
            <Iris on={film.reveal === "iris" && i > 0}>
              <Shot
                shot={shot}
                frames={cuts[i + 1] - cuts[i]}
                pushIn={film.pushIn}
                motion={film.motion ?? "push"}
              />
            </Iris>
          </Sequence>
        );
      })}
      {film.hotels.map((hotel, h) => {
        const first = shots.findIndex((s) => s.h === h);
        const last = first + hotel.shots.length;
        // With the iris, the label lands once the dish has opened out.
        const delay = film.reveal === "iris" && first > 0 ? IRIS : 0;
        const from =
          (film.labelOn === "last" ? cuts[last - 1] : cuts[first]) + delay;
        return (
          <Sequence
            key={`${h}-${hotel.name}`}
            from={from}
            durationInFrames={cuts[last] - from}
          >
            <Label
              eyebrow={hotel.eyebrow}
              lines={
                hotel.headline ??
                hotel.region ??
                hotel.nameLines ?? [hotel.name]
              }
              location={
                hotel.headline || hotel.region ? hotel.name : hotel.location
              }
              rule={film.labelRule ?? true}
              ruleFrames={
                film.labelOn === "last"
                  ? cuts[last] - from
                  : cuts[first + 1] - cuts[first]
              }
            />
          </Sequence>
        );
      })}
      {film.hook.lines.length ? (
        <Sequence durationInFrames={cuts[film.hook.shots]}>
          <Hook lines={film.hook.lines} />
        </Sequence>
      ) : null}
      {film.counter ? (
        <RosetteCounter
          tierAt={(fr) => {
            const i = cuts.filter((c) => c <= fr).length - 1;
            return (
              film.hotels[shots[Math.min(i, shots.length - 1)].h].tier ?? 0
            );
          }}
          changes={cuts.filter(
            (c, i) =>
              i > 0 &&
              i < shots.length &&
              film.hotels[shots[i].h].tier !== film.hotels[shots[i - 1].h].tier,
          )}
          words={film.counter.words}
          hook={
            film.counter.hook
              ? { text: film.counter.hook, until: cuts[1] }
              : undefined
          }
          hideFrom={end}
        />
      ) : null}
      <Sequence from={end} durationInFrames={total - end}>
        <EndCard card={film.endCard} mark={!film.watermark} />
      </Sequence>
      {film.watermark ? (
        <Sequence durationInFrames={end}>
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
        </Sequence>
      ) : null}
      <FilmFinish />
    </AbsoluteFill>
  );
};
