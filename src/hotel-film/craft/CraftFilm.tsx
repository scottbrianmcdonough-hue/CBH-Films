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
import { colors, progress, sans, serif } from "../theme";
import type { CraftShot, CraftSpec } from "./types";

const W = 1080;
const H = 1920;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// One shot, full bleed, pushing in around its matched feature.
const Shot: React.FC<{ shot: CraftShot; frames: number }> = ({
  shot,
  frames,
}) => {
  const frame = useCurrentFrame();
  const [z0, z1] = shot.push ?? [1, 1];
  const z = interpolate(frame, [0, frames], [z0, z1], clamp);
  const [fx, fy] = shot.focus ?? [W / 2, H / 2];
  const inner =
    shot.kind === "video" ? (
      <Video
        src={staticFile(shot.src)}
        trimBefore={Math.round((shot.from ?? 0) * 30)}
        playbackRate={shot.rate ?? 1}
        muted
        objectFit="cover"
        style={{ width: "100%", height: "100%" }}
      />
    ) : (
      (() => {
        const [sw, sh] = shot.size!;
        const crop = shot.crop!;
        const ch = crop.h ?? sh;
        const cw = (ch * W) / H;
        const cy = crop.cy ?? sh / 2;
        const k = H / ch;
        return (
          <Img
            src={staticFile(shot.src)}
            style={{
              position: "absolute",
              width: sw * k,
              height: sh * k,
              left: -(crop.cx - cw / 2) * k,
              top: -(cy - ch / 2) * k,
            }}
          />
        );
      })()
    );
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: colors.black }}>
      <AbsoluteFill
        style={{ transform: `scale(${z})`, transformOrigin: `${fx}px ${fy}px` }}
      >
        {inner}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// The hotel, small, bottom-left over a soft scrim, in from the cut.
const Tag: React.FC<{ name: string; place: string }> = ({ name, place }) => {
  const frame = useCurrentFrame();
  const p = progress(frame, 2, 8);
  return (
    <>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(9,9,10,0) 48%, rgba(9,9,10,0.5) 64%, rgba(9,9,10,0.58) 84%, rgba(9,9,10,0.25) 100%), radial-gradient(ellipse 760px 380px at 280px 1340px, rgba(9,9,10,0.5), rgba(9,9,10,0) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 72,
          bottom: 470,
          opacity: p,
          textShadow: "0 2px 24px rgba(9,9,10,0.7)",
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontWeight: 600,
            fontSize: 25,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: colors.gold,
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontFamily: sans,
            fontSize: 24,
            letterSpacing: "0.04em",
            color: "rgba(245,239,227,0.85)",
            marginTop: 6,
          }}
        >
          {place}
        </div>
      </div>
    </>
  );
};

// The clock above the name: on each cut the digits that change roll up to the new hour
// (the colon and unchanged digits stay put), the later digit a beat behind.
const Clock: React.FC<{ film: CraftSpec; opacity: number }> = ({
  film,
  opacity,
}) => {
  const frame = useCurrentFrame();
  const i = film.shots.reduce((j, s, k) => (s.at <= frame ? k : j), 0);
  const now = film.shots[i].time!;
  const was = film.shots[i - 1]?.time ?? now;
  const at = film.shots[i].at;
  const shadow = "0 2px 28px rgba(9,9,10,0.75)";
  return (
    <div
      style={{
        position: "absolute",
        left: 66,
        bottom: 548,
        display: "flex",
        opacity: opacity * progress(frame, 2, 10),
        fontFamily: serif,
        fontWeight: 600,
        fontSize: 132,
        lineHeight: 1,
        color: colors.gold,
        fontVariantNumeric: "lining-nums tabular-nums",
        textShadow: shadow,
      }}
    >
      {[...now].map((c, k) => {
        const old = was[k];
        if (old === c)
          return (
            <span key={k} style={{ display: "inline-block" }}>
              {c}
            </span>
          );
        const p = progress(frame, at + k * 1.5, 10);
        return (
          <span
            key={k}
            style={{
              position: "relative",
              display: "inline-block",
              overflow: "hidden",
              height: 138,
              verticalAlign: "top",
            }}
          >
            <span style={{ visibility: "hidden" }}>{c}</span>
            <span
              style={{
                position: "absolute",
                left: 0,
                top: `${-100 * p}%`,
                opacity: 1 - p,
              }}
            >
              {old}
            </span>
            <span
              style={{
                position: "absolute",
                left: 0,
                top: `${100 * (1 - p)}%`,
                opacity: p,
              }}
            >
              {c}
            </span>
          </span>
        );
      })}
    </div>
  );
};

// A closing line rising out of a mask above the clock on the last shot.
const Close: React.FC<{ line: string; opacity: number }> = ({
  line,
  opacity,
}) => {
  const frame = useCurrentFrame();
  const p = progress(frame, 0, 18);
  return (
    <div
      style={{
        position: "absolute",
        left: 72,
        bottom: 700,
        overflow: "hidden",
        paddingBottom: 8,
        opacity,
      }}
    >
      <div
        style={{
          fontFamily: serif,
          fontStyle: "italic",
          fontWeight: 500,
          fontSize: 66,
          color: colors.cream,
          transform: `translateY(${(1 - p) * 100}%)`,
          textShadow: "0 2px 28px rgba(9,9,10,0.75)",
        }}
      >
        {line}
      </div>
    </div>
  );
};

export const CraftFilm: React.FC<{ film: CraftSpec }> = ({ film }) => {
  const frame = useCurrentFrame();
  const n = film.shots.length;
  const end = (i: number) =>
    i < n - 1 ? film.shots[i + 1].at : film.endAt + film.endFade;
  const out = interpolate(
    frame,
    [film.endAt, film.endAt + film.endFade],
    [1, 0],
    clamp,
  );
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
      {film.shots.map((shot, i) => (
        <Sequence
          key={shot.src}
          from={shot.at}
          durationInFrames={end(i) - shot.at}
        >
          <AbsoluteFill style={{ opacity: i === n - 1 ? out : 1 }}>
            <Shot shot={shot} frames={end(i) - shot.at} />
            {shot.tag ? <Tag {...shot.tag} /> : null}
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
            opacity: out,
          }}
        />
      ) : null}
      {film.shots[0].time && frame < film.endAt + film.endFade ? (
        <Clock film={film} opacity={out} />
      ) : null}
      {film.close ? (
        <Sequence
          from={film.close.at}
          durationInFrames={film.endAt + film.endFade - film.close.at}
        >
          <Close line={film.close.line} opacity={out} />
        </Sequence>
      ) : null}
      <Sequence from={film.endAt + film.endFade}>
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            paddingBottom: 140,
          }}
        >
          <CBLogo start={2} width={300} shimmerAt={38} cbOnly />
        </AbsoluteFill>
      </Sequence>
      <FilmFinish />
    </AbsoluteFill>
  );
};
