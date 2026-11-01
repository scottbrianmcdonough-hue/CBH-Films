import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { CBLogo } from "../components/CBLogo";
import { WordIntro } from "../components/WordIntro";
import { FilmFinish } from "../components/FilmFinish";
import { Fizz } from "../components/Fizz";
import { colors, EASE_IN_OUT, progress, sans, serif } from "../theme";
import type { Hotel } from "../types";
import type { EditorialSection, EditorialSpec } from "./types";

const W = 1080;
const H = 1920;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Camera position (px down the page) at a frame: one eased screen-height glide per entry.
const cameraY = (frame: number, film: EditorialSpec) =>
  film.glides.reduce(
    (y, g) =>
      y +
      H *
        EASE_IN_OUT(
          interpolate(
            frame,
            [g - film.glideFrames / 2, g + film.glideFrames / 2],
            [0, 1],
            clamp,
          ),
        ),
    0,
  );

// ---------------------------------------------------------------------------
// Building blocks. `rel` is how far the section's top is below the top of the screen
// (0 when the spread is at rest). An element with depth d moves d times as fast as the
// page, so d > 1 feels closer to the camera and d < 1 further away.

const Caption: React.FC<{
  t: number; // frames since this spread arrived
  eyebrow: string;
  lines: string[];
  top?: number;
  bottom?: number;
  center?: boolean;
}> = ({ t, eyebrow, lines, top, bottom, center }) => (
  <div
    style={{
      position: "absolute",
      left: 96,
      right: 120,
      top,
      bottom,
      textAlign: center ? "center" : "left",
    }}
  >
    <div
      style={{
        fontFamily: sans,
        fontWeight: 600,
        fontSize: 24,
        letterSpacing: "0.32em",
        textTransform: "uppercase",
        color: colors.gold,
        marginBottom: 26,
        opacity: progress(t, 0, 24),
        transform: `translateY(${(1 - progress(t, 0, 24)) * 12}px)`,
      }}
    >
      {eyebrow}
    </div>
    {lines.map((line, i) => (
      <div
        key={line}
        style={{
          overflow: "hidden",
          padding: "0.06em 0 0.14em",
          margin: "-0.06em 0 -0.14em",
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 96,
            lineHeight: 1.02,
            color: colors.cream,
            textShadow: "0 2px 24px rgba(9,9,10,0.5)",
            transform: `translateY(${(1 - progress(t, 6 + i * 5, 30)) * 110}%)`,
          }}
        >
          {line}
        </div>
      </div>
    ))}
  </div>
);

// A photo in a frame that rises into view with the page: it is revealed bottom-up as it
// scrolls in, and the photo drifts inside its frame for extra depth.
const Framed: React.FC<{
  src: string;
  rel: number;
  x: number;
  y: number;
  w: number;
  h: number;
  d: number;
  position?: string;
  clipPath?: string;
  border?: boolean;
  shadow?: boolean; // soft drop shadow, for photos that overlap others
  children?: React.ReactNode;
}> = ({
  src,
  rel,
  x,
  y,
  w,
  h,
  d,
  position = "50% 50%",
  clipPath,
  border,
  shadow,
  children,
}) => {
  const reveal = interpolate(rel, [H * 0.1, H * 0.85], [1, 0], clamp);
  // The reveal clip leaves room around the frame so a drop shadow isn't cut off.
  const spill = shadow ? -120 : 0;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        transform: `translateY(${rel * (d - 1)}px)`,
        clipPath: `inset(${(1 - reveal) * 100}% ${spill}px ${spill}px ${spill}px)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          clipPath,
          outline: border ? `12px solid ${colors.black}` : undefined,
          boxShadow: shadow ? "0 30px 70px rgba(0,0,0,0.6)" : undefined,
        }}
      >
        <Img
          src={staticFile(src)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: position,
            transform: `translateY(${rel * 0.12}px) scale(1.14)`,
          }}
        />
        {children}
      </div>
    </div>
  );
};

const GoldRule: React.FC<{ t: number; x: number; y: number; w: number }> = ({
  t,
  x,
  y,
  w,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: 2,
      background: colors.gold,
      transformOrigin: "left",
      transform: `scaleX(${progress(t, 14, 30, EASE_IN_OUT)})`,
    }}
  />
);

// ---------------------------------------------------------------------------
// Spreads

const archPath = (w: number, h: number) =>
  `M0 ${h} V${w / 2} A${w / 2} ${w / 2} 0 0 1 ${w} ${w / 2} V${h} Z`;

const Spread: React.FC<{
  section: EditorialSection;
  rel: number;
  t: number;
  frame: number;
  arrival: number;
  hotel: Hotel;
}> = ({ section, rel, t, frame, arrival, hotel }) => {
  switch (section.kind) {
    case "hero": {
      const k = interpolate(frame, [0, 260], [0, 1], clamp);
      const lerp = (a: number, b: number) => a + (b - a) * k;
      return (
        <>
          <AbsoluteFill
            style={{
              overflow: "hidden",
              transform: `translateY(${rel * -0.45}px)`,
            }}
          >
            <Img
              src={staticFile(section.src)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: `${lerp(section.from.x, section.to.x)}% ${lerp(section.from.y, section.to.y)}%`,
                transform: `scale(${lerp(section.from.scale, section.to.scale)})`,
              }}
            />
          </AbsoluteFill>
          <AbsoluteFill
            style={{
              background:
                "linear-gradient(0deg, rgba(9,9,10,0.92) 0%, rgba(9,9,10,0.75) 32%, rgba(9,9,10,0) 62%)",
              opacity: progress(t, -10, 30),
            }}
          />
          <Caption
            t={t}
            eyebrow={section.eyebrow}
            lines={section.lines}
            bottom={460}
          />
        </>
      );
    }
    case "collage": {
      const [a, b, c] = section.photos;
      return (
        <>
          {/* Layout after the Fable 5.1 take: larger photos bleeding off alternate
              edges, gentle depth differences and a soft shadow on the overlap. */}
          <Framed
            src={a}
            rel={rel}
            x={0}
            y={690}
            w={760}
            h={510}
            d={0.95}
            position="50% 55%"
          />
          <Framed src={c} rel={rel} x={96} y={1500} w={560} h={370} d={0.99} />
          <Framed
            src={b}
            rel={rel}
            x={380}
            y={1110}
            w={700}
            h={460}
            d={1.05}
            position="50% 55%"
            shadow
          />
          <Caption
            t={t}
            eyebrow={section.eyebrow}
            lines={section.lines}
            top={250}
          />
          <GoldRule t={t} x={96} y={660} w={160} />
        </>
      );
    }
    case "arch": {
      const w = 700;
      const h = 1090;
      const outline = progress(t, 8, 50, EASE_IN_OUT);
      return (
        <>
          <Framed
            src={section.src}
            rel={rel}
            x={190}
            y={700}
            w={w}
            h={h}
            d={1.15}
            position="66% 50%"
            clipPath={`path('${archPath(w, h)}')`}
          >
            {section.fizz ? (
              <div
                style={{
                  position: "absolute",
                  left: -190,
                  top: -700,
                  width: W,
                  height: H,
                }}
              >
                <Fizz
                  seed="arch-fizz"
                  count={70}
                  size={[4, 20]}
                  speed={[1.5, 4.5]}
                  color="255,234,186"
                  fadeAbove={0.3}
                />
              </div>
            ) : null}
          </Framed>
          <svg
            width={w + 40}
            height={h + 40}
            style={{
              position: "absolute",
              left: 170,
              top: 680,
              transform: `translateY(${rel * 0.15}px)`,
              overflow: "visible",
            }}
          >
            <path
              d={archPath(w + 40, h + 40)}
              fill="none"
              stroke={colors.gold}
              strokeWidth={2}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - outline}
            />
          </svg>
          <Caption
            t={t}
            eyebrow={section.eyebrow}
            lines={section.lines}
            top={250}
          />
        </>
      );
    }
    case "pair":
      return (
        <>
          <Framed
            src={section.band}
            rel={rel}
            x={0}
            y={700}
            w={W}
            h={600}
            d={0.9}
            position="45% 50%"
          />
          <Framed
            src={section.inset}
            rel={rel}
            x={440}
            y={1140}
            w={560}
            h={560}
            d={1.3}
            position="55% 60%"
            border
          />
          <Caption
            t={t}
            eyebrow={section.eyebrow}
            lines={section.lines}
            top={250}
          />
          <GoldRule t={t} x={96} y={660} w={160} />
        </>
      );
    case "fullbleed":
      return (
        <>
          <Framed
            src={section.src}
            rel={rel}
            x={0}
            y={0}
            w={W}
            h={H}
            d={0.7}
            position="66% 50%"
          />
          <AbsoluteFill
            style={{
              background:
                "linear-gradient(180deg, rgba(9,9,10,0.9) 0%, rgba(9,9,10,0.6) 24%, rgba(9,9,10,0) 48%)",
            }}
          />
          <Caption
            t={t}
            eyebrow={section.eyebrow}
            lines={section.lines}
            top={250}
          />
        </>
      );
    case "end":
      return (
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <div style={{ overflow: "hidden", padding: "0.06em 0 0.14em" }}>
            <div
              style={{
                fontFamily: serif,
                fontSize: 104,
                lineHeight: 1,
                color: colors.cream,
                transform: `translateY(${(1 - progress(t, 6, 30)) * 110}%)`,
              }}
            >
              {hotel.name}
            </div>
          </div>
          <div
            style={{
              overflow: "hidden",
              padding: "0.06em 0 0.14em",
              marginTop: 10,
            }}
          >
            <div
              style={{
                fontFamily: serif,
                fontSize: 60,
                lineHeight: 1.2,
                color: colors.cream,
                opacity: 0.9,
                transform: `translateY(${(1 - progress(t, 12, 30)) * 110}%)`,
              }}
            >
              {hotel.subtitle}
            </div>
          </div>
          <div
            style={{
              fontFamily: sans,
              fontSize: 24,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: colors.gold,
              marginTop: 34,
              opacity: progress(t, 20, 30),
            }}
          >
            {hotel.location}
          </div>
          <div style={{ position: "absolute", bottom: 470 }}>
            <CBLogo start={arrival + 34} width={190} shimmerAt={arrival + 66} />
          </div>
        </AbsoluteFill>
      );
  }
};

export const EditorialFilm: React.FC<{ film: EditorialSpec }> = ({ film }) => {
  const frame = useCurrentFrame();
  const camY = cameraY(frame, film);
  // Text reveals start as each glide settles.
  const arrivals = [film.intro.zoomEnd + 4, ...film.glides.map((g) => g + 4)];

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
      {film.sections.map((section, i) => {
        const rel = i * H - camY;
        if (Math.abs(rel) > H * 2) return null;
        return (
          <AbsoluteFill
            key={i}
            // Clip each spread to its own page area, so slower parallax layers
            // never show through on the next spread.
            style={{ transform: `translateY(${rel}px)`, overflow: "hidden" }}
          >
            <Spread
              section={section}
              rel={rel}
              t={frame - arrivals[i]}
              frame={frame}
              arrival={arrivals[i]}
              hotel={film.hotel}
            />
          </AbsoluteFill>
        );
      })}
      <WordIntro {...film.intro} />
      <FilmFinish />
    </AbsoluteFill>
  );
};
