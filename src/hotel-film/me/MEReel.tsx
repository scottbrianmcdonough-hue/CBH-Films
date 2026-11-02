import { Audio } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FilmFinish } from "../components/FilmFinish";
import { colors, EASE_IN_OUT, EASE_OUT, progress, sans, serif } from "../theme";

// The CBH meetings and events reel, after the Ramside Hall M&E reel Scott sent as the model (2 Nov:
// "like the ramside reel"): calm, natural colour (no grade), slow pushes and crossfades, ~27s,
// 16:9 first. An opening shot with MEETINGS & EVENTS in gold caps over the hotel's name and one
// line on getting there; the rooms full frame, then side by side in panels, each named; then
// sections that each take a gold caps eyebrow, a short serif headline and a small fact line; the
// end card on CBH charcoal with the events address. The 9:16 cut stacks the panels as strips.

export type MEShot = {
  src: string;
  pos?: string;
  widePos?: string;
  wideSrc?: string;
};
export type MEPanel = {
  src: string;
  name: string;
  pos?: string;
  widePos?: string;
};
export type MEScene = {
  at: number; // film frame the scene's crossfade is centred on
  shots?: MEShot[]; // one after another, crossfading, each at its `cut` (film frames)
  cuts?: number[];
  panels?: MEPanel[]; // side by side (16:9), stacked (9:16), each sliding in a beat apart
  panelBeat?: number;
  text?: { eyebrow: string; title: string; subs: string[]; subCuts?: number[] };
  // a hard cut on the downbeat instead of the crossfade (Scott: "more engaging, just little touches")
  cut?: boolean;
  // the camera pushes into a point of the photo, gathering speed into the next cut (Kenilworth's
  // screen, so the rooms' panels open out of it)
  push?: { to: number; pos: string };
};
export type MESpec = {
  id: string;
  frames: number;
  scenes: MEScene[];
  end: { at: number; name: string; place: string; cut?: boolean };
  music: { src: string; startAt: number; gain: number; fadeOut: number };
};

const X = 14; // crossfade frames
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const LIFT = "0 2px 18px rgba(9,9,10,0.6), 0 1px 3px rgba(9,9,10,0.5)";

const Photo: React.FC<{
  src: string;
  pos: string;
  z: number;
  dx?: number;
  dy?: number;
}> = ({ src, pos, z, dx = 0, dy = 0 }) => (
  <Img
    src={staticFile(src)}
    style={{
      position: "absolute",
      width: "100%",
      height: "100%",
      objectFit: "cover",
      objectPosition: pos,
      transform: `translate(${dx}px, ${dy}px) scale(${z})`,
      transformOrigin: pos,
    }}
  />
);

const Caption: React.FC<{
  eyebrow: string;
  title: string;
  sub: string;
  t: number;
  subT: number;
  wide: boolean;
}> = ({ eyebrow, title, sub, t, subT, wide }) => {
  const a = progress(t, 6, 18, EASE_OUT);
  const b = progress(t, 12, 18, EASE_OUT);
  const c = progress(subT, 0, 14, EASE_OUT);
  return (
    <div
      style={{
        position: "absolute",
        left: wide ? 96 : 72,
        bottom: wide ? 92 : 470,
        right: wide ? 700 : 150,
      }}
    >
      <div
        style={{
          display: "inline-block",
          opacity: a,
          transform: `translateY(${(1 - a) * 12}px)`,
          marginBottom: wide ? 14 : 18,
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontWeight: 600,
            fontSize: wide ? 20 : 26,
            letterSpacing: "0.28em",
            color: colors.gold,
            textTransform: "uppercase",
            textShadow: LIFT,
          }}
        >
          {eyebrow}
        </div>
        <div style={{ height: 2, background: colors.gold, marginTop: 8 }} />
      </div>
      <div
        style={{
          fontFamily: serif,
          fontWeight: 400,
          fontSize: wide ? 70 : 72,
          lineHeight: 1.02,
          color: colors.cream,
          textShadow: LIFT,
          fontVariantNumeric: "lining-nums",
        }}
      >
        {/* each line rises out of its own mask, a few frames apart (the house reveal) */}
        {title.split("\n").map((l, i) => {
          const r = progress(t, 10 + i * 5, 18, EASE_OUT);
          return (
            <div
              key={l}
              style={{ overflow: "hidden", paddingBottom: 6, marginBottom: -6 }}
            >
              <div
                style={{
                  transform: `translateY(${(1 - r) * 105}%)`,
                  opacity: Math.min(1, r * 3),
                }}
              >
                {l}
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          fontFamily: sans,
          // Scott: "the subtitle text needs to be shorter and bigger"
          fontSize: wide ? 32 : 38,
          lineHeight: 1.3,
          color: "rgba(245,239,227,0.88)",
          textShadow: LIFT,
          marginTop: wide ? 12 : 16,
          opacity: Math.min(b, c),
        }}
      >
        {sub}
      </div>
    </div>
  );
};

const Scene: React.FC<{ scene: MEScene; len: number; wide: boolean }> = ({
  scene,
  len,
  wide,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const push = scene.push;
  // a push gathers speed (ease in) toward the next cut; otherwise the slow, even drift
  const z = push
    ? 1 + (push.to - 1) * Math.pow(Math.min(1, frame / len), 2.2)
    : interpolate(frame, [0, len], [1.0, 1.05], clamp);
  const cuts = scene.cuts ?? [];
  const off = scene.cut ? 0 : X / 2; // a crossfading scene starts half a fade early
  let body: React.ReactNode = null;
  if (scene.shots) {
    body = scene.shots.map((s, i) => {
      const from = i === 0 ? 0 : cuts[i - 1] - scene.at;
      const o = i === 0 ? 1 : progress(frame, from - X / 2, X, EASE_IN_OUT);
      if (frame < from - X / 2) return null;
      const zz = interpolate(frame, [from, from + len], [1.0, 1.05], clamp);
      return (
        <AbsoluteFill key={s.src} style={{ opacity: o }}>
          <Photo
            src={wide && s.wideSrc ? s.wideSrc : s.src}
            pos={
              push && i === 0
                ? push.pos
                : ((wide ? s.widePos : s.pos) ?? "50% 50%")
            }
            z={i === 0 ? z : zz}
          />
        </AbsoluteFill>
      );
    });
  } else if (scene.panels) {
    const n = scene.panels.length;
    const G = 6;
    const pw = wide ? (width - G * (n - 1)) / n : width;
    const ph = wide ? height : (height - G * (n - 1)) / n;
    body = (
      <AbsoluteFill style={{ backgroundColor: colors.black }}>
        {scene.panels.map((p, i) => {
          const at = off + i * (scene.panelBeat ?? 15);
          // each panel drifts its own way (Scott: "more engaging"): up, down, up across a split
          const drift =
            interpolate(frame, [0, len], [1, -1], clamp) * (i % 2 ? -14 : 14);
          const s = progress(frame, at, 16, EASE_OUT);
          const left = wide ? i * (pw + G) : 0;
          const top = wide ? 0 : i * (ph + G);
          const pos = (wide ? p.widePos : p.pos) ?? "50% 55%";
          return (
            <div
              key={p.src}
              style={{
                position: "absolute",
                left,
                top,
                width: pw,
                height: ph,
                overflow: "hidden",
                opacity: s,
                transform: wide
                  ? `translateY(${(1 - s) * 60}px)`
                  : `translateX(${(1 - s) * 80}px)`,
              }}
            >
              <Photo
                src={p.src}
                pos={pos}
                z={1.04 + 0.02 * (frame / len)}
                dy={wide ? drift : 0}
                dx={wide ? 0 : drift}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(9,9,10,0.62), rgba(9,9,10,0) 34%)",
                }}
              />
              {p.name ? (
                <div
                  style={{
                    position: "absolute",
                    left: wide ? 28 : 48,
                    bottom: wide ? 30 : 26,
                    fontFamily: sans,
                    fontWeight: 600,
                    fontSize: wide ? 17 : 22,
                    letterSpacing: "0.26em",
                    textTransform: "uppercase",
                    color: colors.cream,
                    textShadow: LIFT,
                    opacity: progress(frame, at + 8, 14),
                  }}
                >
                  {p.name}
                </div>
              ) : null}
            </div>
          );
        })}
      </AbsoluteFill>
    );
  }
  const subCuts = scene.text?.subCuts ?? [];
  const k = subCuts.filter((c) => frame >= c - scene.at).length;
  const subT = k ? frame - (subCuts[k - 1] - scene.at) : 20;
  return (
    <AbsoluteFill>
      {body}
      {scene.text ? (
        <>
          <AbsoluteFill
            style={{
              background: wide
                ? // a deeper soft shade from the text's corner, so the gold caps read over busy photos
                  "radial-gradient(ellipse 1250px 620px at 0px 1080px, rgba(9,9,10,0.82) 0%, rgba(9,9,10,0.5) 45%, rgba(9,9,10,0) 100%)"
                : "linear-gradient(to top, rgba(9,9,10,0) 12%, rgba(9,9,10,0.55) 24%, rgba(9,9,10,0.15) 42%, rgba(9,9,10,0) 55%)",
            }}
          />
          <Caption
            eyebrow={scene.text.eyebrow}
            title={scene.text.title}
            sub={scene.text.subs[Math.min(k, scene.text.subs.length - 1)]}
            t={frame}
            subT={subT}
            wide={wide}
          />
        </>
      ) : null}
    </AbsoluteFill>
  );
};

// The end card in the house style (Scott: "upgrade end card to house style"; the Ramside reel was
// for its panels): black, centred, the place in gold caps with its still underline, then the name
// in cream Cormorant (the order for an end card that names a hotel and its place), the white CB in
// its corner.
const EndCard: React.FC<{ name: string; place: string; wide: boolean }> = ({
  name,
  place,
  wide,
}) => {
  const frame = useCurrentFrame();
  const a = progress(frame, 10, 22, EASE_OUT);
  const b = progress(frame, 18, 24, EASE_OUT);
  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.black,
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        paddingBottom: wide ? 0 : 120,
      }}
    >
      <div
        style={{
          display: "inline-block",
          opacity: a,
          transform: `translateY(${(1 - a) * 14}px)`,
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontWeight: 600,
            fontSize: wide ? 24 : 30,
            letterSpacing: "0.28em",
            color: colors.gold,
            textTransform: "uppercase",
          }}
        >
          {place}
        </div>
        <div style={{ height: 2, background: colors.gold, marginTop: 10 }} />
      </div>
      {name.split("\n").map((l, i) => (
        <div
          key={l}
          style={{
            fontFamily: serif,
            // one name over two even lines (Scott: "it's called a long name")
            fontSize: wide ? 92 : 96,
            lineHeight: 1.08,
            color: colors.cream,
            marginTop: i ? 0 : wide ? 22 : 28,
            overflow: "hidden",
            paddingBottom: 8,
            marginBottom: -8,
          }}
        >
          <div
            style={{
              transform: `translateY(${(1 - progress(frame, 16 + i * 5, 20, EASE_OUT)) * 105}%)`,
              opacity: Math.min(1, b * 3),
            }}
          >
            {l}
          </div>
        </div>
      ))}
    </AbsoluteFill>
  );
};

export const MEReel: React.FC<{ film: MESpec }> = ({ film }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const wide = width > height;
  const starts = film.scenes.map((s) => s.at);
  const endAt = film.end.at;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      {film.scenes.map((s, i) => {
        const from = i === 0 || s.cut ? s.at : s.at - X / 2;
        const to = (i + 1 < starts.length ? starts[i + 1] : endAt) + X / 2;
        const fadeIn =
          i === 0 || s.cut ? 1 : progress(frame, from, X, EASE_IN_OUT);
        return (
          <Sequence
            key={s.at}
            from={from}
            durationInFrames={to - from}
            layout="none"
          >
            <AbsoluteFill style={{ opacity: fadeIn }}>
              <Scene scene={{ ...s, at: from }} len={to - from} wide={wide} />
            </AbsoluteFill>
          </Sequence>
        );
      })}
      <Sequence from={film.end.cut ? endAt : endAt - X / 2} layout="none">
        <AbsoluteFill
          style={{
            opacity: film.end.cut
              ? 1
              : progress(frame, endAt - X / 2, X, EASE_IN_OUT),
          }}
        >
          <EndCard name={film.end.name} place={film.end.place} wide={wide} />
        </AbsoluteFill>
      </Sequence>
      <Img
        src={staticFile("brand/cb-watermark.png")}
        style={{
          position: "absolute",
          left: wide ? 1740 : 920,
          top: wide ? 912 : 1452,
          width: 100,
          height: 108,
          opacity: 0.85,
        }}
      />
      <Audio
        src={staticFile(film.music.src)}
        trimBefore={film.music.startAt}
        volume={(f) =>
          film.music.gain *
          interpolate(
            f,
            [0, 6, film.frames - film.music.fadeOut, film.frames],
            [0, 1, 1, 0],
            clamp,
          )
        }
      />
      <FilmFinish />
    </AbsoluteFill>
  );
};
