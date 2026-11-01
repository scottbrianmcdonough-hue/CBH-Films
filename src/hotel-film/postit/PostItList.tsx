import { Audio } from "@remotion/media";
import { getLength } from "@remotion/paths";
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

// "Which would you tick off first?" (Scott, 29-30 Oct: the to-do direction from his r/ClaudeDesign refs,
// "a sticky note where a line drawing draws itself, then the word writes in, then it ticks off"; his rules:
// photos full-bleed, one calm transition, nothing too fast). The weekend as a to-do list: over each hotel's
// shot, full-bleed but softened and dimmed, a cream sticky note sits slightly askew; a line drawing in
// charcoal ink draws itself, the word writes in, a gold tick lands, and the note peels away as the shot
// clears and plays (the one move throughout), the house label rising. Five hotels, each once, autumn and
// winter Reel Bank footage at its own speed; the white CB in its corner to the end (no gold shimmer: Bianca).
// Under the note the shot holds its first frame, softened: the footage runs once the note peels away.

const W = 1080;
const H = 1920;
const FB = "campaigns/flipbook-winter";

// Music: Bring Back the Swing (EvolvingVibes, Pixabay 617230), 120 BPM; only its 7.4-29.2s stretch was ever
// cut (the Mount collage's swing version, which didn't go out). From the 40.87s downbeat (bars start on its
// chord changes); a note every two bars, the shot clearing on the second bar's downbeat.
const MUSIC = "campaigns/the-mount/bring-back-the-swing.mp3";
const BEAT_S = 0.4996;
const MUSIC_FROM = 40.867;
const MUSIC_GAIN = 0.51;
const B = (n: number) => Math.round(n * BEAT_S * 30);

type Clip = { src: string; frames: number };
type Item = { word: string; d: string; clips: Clip[]; poster: string; place: string; hotel: string };
// single-line drawings in a 160 x 120 box
const ITEMS: Item[] = [
  // Gisborough's snowy garden under a blue sky (Scott: the ivy wasn't inspiring)
  { word: "Snow day", place: "NORTH YORKSHIRE", hotel: "Gisborough Hall",
    d: "M80 12 L80 108 M38 36 L122 84 M38 84 L122 36 M80 28 L70 18 M80 28 L90 18 M80 92 L70 102 M80 92 L90 102 M52 44 L40 48 M52 44 L48 32 M108 76 L120 72 M108 76 L112 88 M52 76 L40 72 M52 76 L48 88 M108 44 L120 48 M108 44 L112 32",
    clips: [{ src: "hotels/gisborough-hall/screen-time/snowy-garden.mp4", frames: 63 }],
    poster: "campaigns/screen-time/gis-snow-poster.jpg" },
  { word: "Lake views", place: "WINDERMERE, LAKE DISTRICT", hotel: "Low Wood Bay\nResort & Spa",
    d: "M4 74 L46 30 L68 52 L88 36 L132 74 M14 88 Q26 82 38 88 T62 88 T86 88 T110 88 T134 88 M40 100 Q52 94 64 100 T88 100 T112 100",
    clips: [{ src: `${FB}/lake.mp4`, frames: 144 }], poster: `${FB}/lake-poster.jpg` },
  { word: "Bath time", place: "RUTLAND", hotel: "Rutland Hall Hotel & Spa",
    d: "M14 52 L146 52 M20 52 L24 84 Q26 96 40 96 L120 96 Q134 96 136 84 L140 52 M40 96 L34 108 M120 96 L126 108 M30 52 L30 22 Q30 12 40 12 Q50 12 50 22 L50 26 M44 26 L56 26",
    clips: [{ src: `${FB}/bath.mp4`, frames: 144 }], poster: `${FB}/bath-poster.jpg` },
  { word: "Evening stroll", place: "CHESTER", hotel: "Rowton Hall Hotel & Spa",
    d: "M118 18 A18 18 0 1 0 140 46 A13 13 0 1 1 118 18 M60 108 L60 42 M50 42 L70 42 L66 28 L54 28 L50 42 M54 28 L60 20 L66 28 M38 108 L82 108",
    clips: [{ src: `${FB}/rowton-dusk.mp4`, frames: 123 }], poster: `${FB}/rowton-dusk-poster.jpg` },
];
const LENGTHS = ITEMS.map((it) => getLength(it.d));
const TICK = "M5 18 L13 26 L29 7";
const TICK_L = getLength(TICK);

// a note every two bars from beat 2
const A = (i: number) => 2 + 8 * i; // the item's first beat (a downbeat)
const N = ITEMS.length;
const END = B(A(N)); // the question
export const POSTIT_FRAMES = B(A(N) + 8);

const lin = (f: number, a: number, d: number) => interpolate(f, [a, a + d], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
const ease = (f: number, a: number, d: number) => progress(f, a, d, EASE_IN_OUT);

const Shot: React.FC<{ it: Item; i: number }> = ({ it, i }) => {
  const frame = useCurrentFrame();
  const a = B(A(i));
  const on = i === 0 ? 1 : ease(frame, a - 8, 14);
  const off = i === N - 1 ? progress(frame, END - 6, 18) : ease(frame, B(A(i + 1)) - 8, 14);
  const peel = B(A(i) + 3.75); // the note lifts, the shot starts to clear
  const clear = ease(frame, peel, B(0.75));
  if (frame < a - 10 || off >= 1) return null;
  let at = peel;
  return (
    <AbsoluteFill style={{ opacity: on * (1 - off) }}>
      <AbsoluteFill style={{ filter: `blur(${(1 - clear) * 22}px) brightness(${0.45 + 0.55 * clear})`, transform: `scale(${1.06 - 0.02 * clear})` }}>
        <Img src={staticFile(it.poster)} style={{ position: "absolute", width: W, height: H, objectFit: "cover" }} />
        {it.clips.map((c) => {
          const start = at;
          at += c.frames;
          return frame >= start && frame < start + c.frames + 1 ? (
            <Sequence key={c.src} from={start} durationInFrames={c.frames} layout="none">
              <OffthreadVideo src={staticFile(c.src)} muted style={{ position: "absolute", width: W, height: H }} />
            </Sequence>
          ) : null;
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Note: React.FC<{ it: Item; i: number }> = ({ it, i }) => {
  const frame = useCurrentFrame();
  const a = B(A(i));
  const inn = ease(frame, a, B(0.75));
  const draw = ease(frame, a + B(0.5), B(2));
  const write = lin(frame, a + B(2.5), B(1));
  const tick = ease(frame, a + B(3.4), B(0.4));
  const peel = ease(frame, B(A(i) + 3.75), B(0.75));
  if (frame < a || peel >= 1) return null;
  return (
    <div style={{ position: "absolute", left: 195, top: 500, width: 690, height: 690, background: "#F1E9D8",
      boxShadow: `0 ${50 + 40 * peel}px ${110 + 60 * peel}px rgba(0,0,0,0.5), 0 6px 14px rgba(0,0,0,0.25)`,
      opacity: inn * (1 - lin(frame, B(A(i) + 3.75) + B(0.35), B(0.4))),
      transformOrigin: "50% 0",
      transform: `translateY(${(1 - inn) * 160 - peel * 140}px) rotate(${-2 + peel * 9}deg) perspective(1400px) rotateX(${peel * 38}deg)` }}>
      {/* the gummed strip along the top */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 80, background: "linear-gradient(rgba(0,0,0,0.06), rgba(0,0,0,0))" }} />
      <svg viewBox="0 0 160 120" style={{ position: "absolute", left: 105, top: 70, width: 480, height: 360, overflow: "visible" }}>
        <path d={it.d} fill="none" stroke="#282825" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray={LENGTHS[i]} strokeDashoffset={LENGTHS[i] * (1 - draw)} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 455, textAlign: "center", fontFamily: serif, fontStyle: "italic",
        fontWeight: 500, fontSize: 104, lineHeight: 1, color: "#282825", clipPath: `inset(0 ${100 - write * 100}% 0 0)` }}>
        {it.word}
      </div>
      <svg viewBox="0 0 34 34" style={{ position: "absolute", right: 46, bottom: 36, width: 100, height: 100, overflow: "visible" }}>
        <path d={TICK} fill="none" stroke={colors.gold} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray={TICK_L} strokeDashoffset={TICK_L * (1 - tick)} />
      </svg>
    </div>
  );
};

// the house label: gold caps place over its underline, the name in cream Cormorant
const Label: React.FC<{ it: Item; i: number }> = ({ it, i }) => {
  const frame = useCurrentFrame();
  const on = progress(frame, B(A(i) + 4.5), 14) * (1 - progress(frame, B(A(i) + 7.4), 10));
  if (on <= 0) return null;
  return (
    <AbsoluteFill style={{ opacity: on }}>
      <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(9,9,10,0) 52%, rgba(9,9,10,0.6) 72%, rgba(9,9,10,0.66) 86%, rgba(9,9,10,0.35) 100%)" }} />
      <div style={{ position: "absolute", left: 72, bottom: 500, transform: `translateY(${(1 - on) * 18}px)` }}>
        <div style={{ display: "inline-block" }}>
          <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 28, letterSpacing: "0.24em", color: colors.gold,
            textShadow: "0 2px 16px rgba(9,9,10,0.7)" }}>{it.place}</div>
          <div style={{ height: 2, marginTop: 12, background: colors.gold }} />
        </div>
        <div style={{ fontFamily: serif, fontSize: 64, lineHeight: 1.1, marginTop: 14, color: colors.cream,
          whiteSpace: "pre", textShadow: "0 2px 22px rgba(9,9,10,0.55)" }}>{it.hotel}</div>
      </div>
    </AbsoluteFill>
  );
};

export const PostItList: React.FC = () => {
  const frame = useCurrentFrame();
  const title = 1 - progress(frame, END - 10, 16);
  const line = progress(frame, END + 6, 24);
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      {ITEMS.map((it, i) => <Shot key={i} it={it} i={i} />)}
      {ITEMS.map((it, i) => <Label key={i} it={it} i={i} />)}
      {/* the list's title, over every note */}
      <div style={{ position: "absolute", top: 300, width: "100%", textAlign: "center", fontFamily: serif, fontSize: 88,
        color: colors.cream, opacity: title, textShadow: "0 2px 22px rgba(9,9,10,0.5)" }}>
        This weekend
      </div>
      {ITEMS.map((it, i) => <Note key={i} it={it} i={i} />)}
      <div style={{ position: "absolute", top: 780, width: "100%", textAlign: "center", fontFamily: serif, fontSize: 96,
        lineHeight: 1.12, color: colors.cream, opacity: line, transform: `translateY(${(1 - line) * 22}px)` }}>
        Which would you
        <br />
        tick off first?
      </div>
      <Img src={staticFile("brand/cb-watermark.png")} style={{ position: "absolute", left: 920, top: 1452, width: 100, height: 108 }} />
      <Audio
        src={staticFile(MUSIC)}
        trimBefore={Math.round(MUSIC_FROM * 30)}
        volume={(f) =>
          MUSIC_GAIN * interpolate(f, [0, 6, B(A(N) + 4), POSTIT_FRAMES], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
        }
      />
      <FilmFinish />
    </AbsoluteFill>
  );
};
