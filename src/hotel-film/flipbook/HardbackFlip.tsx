import { Audio } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { FilmFinish } from "../components/FilmFinish";
import { colors, EASE_IN_OUT, progress, sans, serif } from "../theme";

// "Which page would you stay in?" (Scott, 29-30 Oct: the flipbook direction from his r/ClaudeDesign refs,
// "a hardback book on a soft plain background, pages turning to reveal each hotel shot"; his rules:
// photos full-bleed, never small prints on a background, one calm transition, nothing too fast). A black
// cloth hardback with the CB in gold sits on the CBH charcoal; the cover opens, the camera pushes into the
// right-hand page until it is the frame, and from there every page is a full-bleed hotel shot that turns
// on the music (one move throughout: the page folding back towards the spine). Six hotels, each once
// (Scott: "Gisborough twice?"), autumn and winter Reel Bank footage at its own speed, Waterton's snow
// still last; then the camera draws back to the open book and the question comes up, the white CB in its
// corner from the first page to the end (no gold shimmer logo: Bianca).
// The turn is a real page curl drawn in 2D (Scott: the first cut's flat squash "messes up" and "could be
// much more"): the leaf is cut into thin vertical strips laid along a bending page (its outer edge lifting
// first), projected with perspective and shaded by how far each strip faces the light; the paper back shows
// as the page passes upright, and its shadow falls on the page below. No CSS 3D (Chrome drops 3D planes that
// hang over the frame's edge). During each turn the camera eases back a little so the book is seen (the
// spine, the left page, the page edge), then settles full-bleed on the new page.

const W = 1080;
const H = 1920;
const D = "campaigns/flipbook-winter";
const G = "hotels/gisborough-hall/screen-time";

// Music: Happy Feels (MarkJuly), its middle, which no film has used (Departures plays from 121.1s, the Dad
// birthday chat reel from 7.13s): from the 40.79s downbeat (bars start on its chord changes), 129.2 BPM.
export const MUSIC = "campaigns/departures/happy-feels.mp3";
export const BEAT_S = 0.46424;
export const MUSIC_FROM = 40.786;
export const MUSIC_GAIN = 0.52;
export const B = (n: number) => Math.round(n * BEAT_S * 30);

type Clip = { src: string; frames: number };
// `end`: the frame the page's footage stops on as the page starts to turn (pulled from the clip with
// ffmpeg), so the curling leaf is a still image, not a video cut into strips
export type Page = { clips?: Clip[]; still?: string; pos?: string; poster: string; end?: string; place: string; hotel: string };
export const PAGES: Page[] = [
  // Gisborough's misty sunrise then its snowy garden (Scott: the ivy wasn't inspiring)
  { clips: [{ src: `${G}/misty-sunrise.mp4`, frames: 61 }, { src: `${G}/snowy-garden.mp4`, frames: 63 }],
    poster: "campaigns/screen-time/gis-sunrise-poster.jpg", end: `${D}/gis-snow-end.jpg`, place: "NORTH YORKSHIRE", hotel: "Gisborough Hall" },
  { clips: [{ src: `${D}/lake.mp4`, frames: 144 }], poster: `${D}/lake-poster.jpg`, end: `${D}/lake-end.jpg`,
    place: "WINDERMERE, LAKE DISTRICT", hotel: "Low Wood Bay\nResort & Spa" },
  { clips: [{ src: `${D}/bath.mp4`, frames: 144 }], poster: `${D}/bath-poster.jpg`, end: `${D}/bath-end.jpg`,
    place: "RUTLAND", hotel: "Rutland Hall Hotel & Spa" },
  { clips: [{ src: `${D}/rowton-dusk.mp4`, frames: 123 }], poster: `${D}/rowton-dusk-poster.jpg`, end: `${D}/rowton-dusk-end.jpg`,
    place: "CHESTER", hotel: "Rowton Hall Hotel & Spa" },
  { still: "campaigns/screen-time/stills/waterton-park-winter.jpg", pos: "62% 50%",
    poster: "campaigns/screen-time/stills/waterton-park-winter.jpg", place: "WAKEFIELD",
    hotel: "Waterton Park Hotel & Spa" },
];

// The timeline in beats: the cover opens over beats 2-6, the camera is in the first page by 8 (a
// downbeat), each page turns over the two beats before a downbeat, a page every two bars.
const OPEN = [B(2), B(6)];
const PUSH = [B(6), B(8)];
const TURN = (i: number) => [B(14 + 8 * i), B(16 + 8 * i)]; // pages 0-4 turn
const LAST = PAGES.length - 1;
const BACK = [B(16 + 8 * LAST), B(19 + 8 * LAST)]; // the camera draws back to the open book
const LINE = B(20 + 8 * LAST);
export const HARDBACK_FRAMES = B(28 + 8 * LAST);

const ease = (f: number, [a, b]: number[]) => progress(f, a, b - a, EASE_IN_OUT);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const PAPER = "#EDE6D7";

// One leaf turning on the spine (x = 0) at progress k: the leaf's angle grows from 0 (flat on the right) to
// pi (flat on the left), its outer part bent further ahead mid-turn, so the edge lifts first and the paper
// curls; each strip is placed by integrating along the bent page and projected with perspective (z towards
// the viewer). Strips facing the viewer show the front, the others the back.
const STRIPS = 48;
const FOCAL = 2200;
const Curl: React.FC<{ k: number; front: React.ReactNode; back: string }> = ({ k, front, back }) => {
  if (k <= 0 || k >= 1) return null;
  const base = Math.PI * k;
  const bend = 1.4 * Math.sin(Math.PI * k);
  const du = W / STRIPS;
  const pts: { x: number; z: number; phi: number }[] = [{ x: 0, z: 0, phi: base }];
  for (let i = 0; i < STRIPS; i++) {
    const u = (i + 0.5) / STRIPS;
    const phi = Math.min(Math.PI, base + bend * u * u);
    const prev = pts[i];
    pts.push({ x: prev.x + du * Math.cos(phi), z: prev.z + du * Math.sin(phi), phi });
  }
  const proj = (q: { x: number; z: number }) => {
    const sc = FOCAL / (FOCAL - q.z);
    return { x: q.x * sc, sc };
  };
  const strips = [];
  for (let i = 0; i < STRIPS; i++) {
    const a = proj(pts[i]);
    const b = proj(pts[i + 1]);
    const phi = pts[i + 1].phi;
    const facing = Math.cos(phi);
    const sc = (a.sc + b.sc) / 2;
    const h = H * sc;
    const top = H / 2 - h / 2;
    const left = Math.min(a.x, b.x);
    const w = Math.abs(b.x - a.x) + 1.2;
    const shade = facing >= 0 ? 0.62 * (1 - facing) : 0.5 * (1 + facing);
    strips.push({ i, z: (pts[i].z + pts[i + 1].z) / 2, left, w, top, h, sx: (b.x - a.x) / du, sy: sc, shade, front: facing >= 0 });
  }
  strips.sort((p, q) => p.z - q.z);
  return (
    <>
      {strips.map((st) => (
        <div key={st.i} style={{ position: "absolute", left: st.left, top: st.top, width: st.w, height: st.h, overflow: "hidden" }}>
          {st.front ? (
            <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transformOrigin: "0 0",
              transform: `scale(${st.sx}, ${st.sy}) translateX(${-st.i * du}px)` }}>{front}</div>
          ) : (
            <div style={{ position: "absolute", inset: 0, background: back }} />
          )}
          <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${st.shade})` }} />
        </div>
      ))}
    </>
  );
};

// the shadow a lifting leaf casts on the page below, reaching as far as the leaf's edge
const CurlShadow: React.FC<{ k: number }> = ({ k }) => {
  if (k <= 0 || k >= 1) return null;
  const a = 0.5 * Math.sin(Math.PI * k);
  const reach = W * Math.max(0.12, Math.cos(Math.PI * k * 0.9));
  return <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H,
    background: `linear-gradient(90deg, rgba(0,0,0,${a}) 0px, rgba(0,0,0,${a * 0.55}) ${reach * 0.7}px, rgba(0,0,0,0) ${reach + 160}px)` }} />;
};

// the house label: gold caps place over its underline, the name in cream Cormorant
export const Label: React.FC<{ p: Page; on: number }> = ({ p, on }) => (
  <AbsoluteFill style={{ opacity: on }}>
    <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(9,9,10,0) 52%, rgba(9,9,10,0.6) 72%, rgba(9,9,10,0.66) 86%, rgba(9,9,10,0.35) 100%)" }} />
    <div style={{ position: "absolute", left: 72, bottom: 500, transform: `translateY(${(1 - on) * 18}px)` }}>
      <div style={{ display: "inline-block" }}>
        <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 28, letterSpacing: "0.24em", color: colors.gold,
          textShadow: "0 2px 16px rgba(9,9,10,0.7)" }}>{p.place}</div>
        <div style={{ height: 2, marginTop: 12, background: colors.gold }} />
      </div>
      <div style={{ fontFamily: serif, fontSize: 64, lineHeight: 1.1, marginTop: 14, color: colors.cream,
        whiteSpace: "pre", textShadow: "0 2px 22px rgba(9,9,10,0.55)" }}>{p.hotel}</div>
    </div>
  </AbsoluteFill>
);

// A page's picture: its footage at its own speed from when the page is first seen (the poster holds only
// while the page is still under the one turning above it), or a still on the barely-there push.
export const Picture: React.FC<{ p: Page; from: number; to: number }> = ({ p, from, to }) => {
  const frame = useCurrentFrame();
  if (p.still) {
    const push = interpolate(frame, [from, to], [1, 1.05], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return <Img src={staticFile(p.still)} style={{ position: "absolute", width: W, height: H, objectFit: "cover",
      objectPosition: p.pos ?? "50% 50%", transform: `scale(${push})` }} />;
  }
  const clips = p.clips!;
  const total = clips.reduce((s, c) => s + c.frames, 0);
  let at = from + Math.max(0, to - from - total);
  return (
    <>
      <Img src={staticFile(p.poster)} style={{ position: "absolute", width: W, height: H, objectFit: "cover" }} />
      {clips.map((c) => {
        const start = at;
        at += c.frames;
        return frame >= start && frame < start + c.frames + 1 ? (
          <Sequence key={c.src} from={start} durationInFrames={c.frames} layout="none">
            <OffthreadVideo src={staticFile(c.src)} muted style={{ position: "absolute", width: W, height: H }} />
          </Sequence>
        ) : null;
      })}
    </>
  );
};

export const HardbackFlip: React.FC = () => {
  const frame = useCurrentFrame();
  const open = ease(frame, OPEN);
  const push = ease(frame, PUSH);
  const back = ease(frame, BACK);
  // the page turning now, if any, and how far
  const turning = PAGES.findIndex((_, i) => i < LAST && frame > TURN(i)[0] && frame < TURN(i)[1]);
  const pull = turning >= 0 ? Math.sin(Math.PI * ease(frame, TURN(turning))) : 0;
  // the camera stays on the right-hand page's centre while the cover opens (the first cut swung across to
  // the spine and back, which read as the book jumping sideways), pushes in until the page is the frame,
  // eases back a little through each turn so the book is seen, and draws back to the open book at the end
  let cx = 540;
  let s = lerp(0.38, 1, push);
  cx -= 70 * pull; // keep the page's lifting edge and the spine both in view
  s -= 0.25 * pull;
  cx = lerp(cx, 0, back);
  s = lerp(s, 0.45, back);
  const line = progress(frame, LINE, 24);
  const end = progress(frame, LINE - 10, 30);
  const mark = progress(frame, PUSH[1] - 6, 12);

  // when each page is first seen, when its footage stops (the turn starts) and when it has turned away
  const seen = (i: number) => (i === 0 ? OPEN[0] : TURN(i - 1)[0]);
  const stops = (i: number) => (i < LAST ? TURN(i)[0] : HARDBACK_FRAMES);
  const gone = (i: number) => (i < LAST ? TURN(i)[1] : HARDBACK_FRAMES);
  const labelOn = (i: number) => {
    const inAt = i === 0 ? PUSH[1] + 4 : TURN(i - 1)[1] + 4;
    const outAt = i < LAST ? TURN(i)[0] - 8 : BACK[0] - 6;
    return progress(frame, inAt, 14) * (1 - progress(frame, outAt, 10));
  };
  const lining = "#1d1c1a";
  const cover = (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 35% 25%, #232221 0%, #0e0e0e 75%)" }}>
      <Img src={staticFile("brand/cbh-logo-cb-only.svg")} style={{ position: "absolute", left: 340, top: 760, width: 400 }} />
    </AbsoluteFill>
  );

  return (
    <AbsoluteFill style={{ background: "#282825" }}>
      <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0",
        transform: `translate(${540 - cx * s}px, ${960 - 960 * s}px) scale(${s})` }}>
        {/* the book's shadow on the table: the right half always, the left as the cover opens */}
        <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H,
          boxShadow: "0 60px 140px rgba(0,0,0,0.55), 0 12px 30px rgba(0,0,0,0.35)" }} />
        <div style={{ position: "absolute", left: -W, top: 0, width: W, height: H, opacity: open,
          boxShadow: "0 60px 140px rgba(0,0,0,0.55), 0 12px 30px rgba(0,0,0,0.35)" }} />
        {/* the left-hand side: the cover's dark lining once it lies open, then the paper back of the last
            page turned (the first cut swapped the lining for cream as soon as the cover passed upright) */}
        {open >= 1 ? <div style={{ position: "absolute", left: -W, top: 0, width: W, height: H, background: lining }} /> : null}
        {frame >= TURN(0)[1] ? <div style={{ position: "absolute", left: -W, top: 0, width: W, height: H, background: PAPER }} /> : null}
        {/* the pages, the top one last so it sits above */}
        {PAGES.map((p, i) => ({ p, i })).reverse().map(({ p, i }) => {
          if (frame < seen(i) - 1 && i > 0) return null;
          if (frame >= gone(i) && i < LAST) return null;
          const k = i < LAST ? ease(frame, TURN(i)) : 0;
          if (k > 0 && p.end) {
            return (
              <React.Fragment key={i}>
                <CurlShadow k={k} />
                <Curl k={k} back={PAPER}
                  front={<Img src={staticFile(p.end)} style={{ position: "absolute", width: W, height: H, objectFit: "cover" }} />} />
              </React.Fragment>
            );
          }
          return (
            <div key={i} style={{ position: "absolute", left: 0, top: 0, width: W, height: H, overflow: "hidden" }}>
              <Picture p={p} from={seen(i)} to={stops(i)} />
              <Label p={p} on={labelOn(i)} />
            </div>
          );
        })}
        {/* the cover: black cloth, the CB in gold; it curls open like the pages */}
        {open <= 0 ? <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H }}>{cover}</div> : null}
        <CurlShadow k={open} />
        <Curl k={open} front={cover} back={lining} />
      </div>
      {/* the end: the question on the charcoal */}
      <AbsoluteFill style={{ background: "#282825", opacity: end }} />
      <div style={{ position: "absolute", top: 780, width: "100%", textAlign: "center", fontFamily: serif, fontSize: 96,
        lineHeight: 1.12, color: colors.cream, opacity: line, transform: `translateY(${(1 - line) * 22}px)` }}>
        Which page
        <br />
        would you stay in?
      </div>
      <Img src={staticFile("brand/cb-watermark.png")} style={{ position: "absolute", left: 920, top: 1452, width: 100, height: 108, opacity: mark }} />
      <Audio
        src={staticFile(MUSIC)}
        trimBefore={Math.round(MUSIC_FROM * 30)}
        volume={(f) =>
          MUSIC_GAIN * interpolate(f, [0, 6, B(24 + 8 * LAST), HARDBACK_FRAMES], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
        }
      />
      <FilmFinish />
    </AbsoluteFill>
  );
};
