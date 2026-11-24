import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { CBLogo } from "../components/CBLogo";
import { FilmFinish } from "../components/FilmFinish";
import { colors, EASE_IN_OUT, EASE_OUT, progress, sans, serif } from "../theme";

// Hatherley Manor Hotel & Spa, "Christmas In The Country" (Scott's brief, 24 Nov): the Christmas stay walked
// through day by day. There is little festive footage, so the one festive clip (the lounge tree, panning to the
// "Christmas Magic" sofa) opens it, then warm, cosy real footage from the Reel Bank and two CBH site stills carry
// the days, the overlays and the festive grade telling the Christmas story: arrival (the lounge bar), Christmas Eve
// (the spa, dinner), Christmas morning (breakfast), Christmas lunch, the dog, Boxing Day (the fizz), end card.
// Shots cut and graded by scripts/hatherley-festive-clips.py (warm candlelit grade, a glow from the highlights,
// short Instagram cuts slowed with minterpolate; stills the same 1.00 -> 1.04 push, Pillow frame by frame).
// One transition throughout: a soft crossfade centred on each cut. Text: one calm block bottom left, a gold Open
// Sans eyebrow over a cream Cormorant headline on a soft scrim that stays put (no underline, no boxes).
// Facts only from the CBH booking engine (Scott's brief): spa access, mulled wine and a festive sharing platter on
// arrival, buffet dinner with musical entertainment (Christmas Eve); breakfast, spa time, a traditional three course
// Christmas lunch (Christmas Day); a Gala Dinner and a disco (Boxing Day, the three night package); dog friendly.

const P = "hotels/hatherley-manor/festive";
const XF = 12; // crossfade frames, centred on each cut
const H = XF / 2;

type Shot = { src: string; at: number; len: number };
// slot starts and lengths (frames); a 3s grid until the track is in, then the cuts move onto its beats
export const SHOTS: Shot[] = [
  { src: "tree", at: 0, len: 120 },
  { src: "lounge-bar", at: 120, len: 90 },
  { src: "spa", at: 210, len: 90 },
  { src: "thyme", at: 300, len: 90 },
  { src: "breakfast", at: 390, len: 45 },
  { src: "egg", at: 435, len: 45 },
  { src: "lunch", at: 480, len: 90 },
  { src: "dog-table", at: 570, len: 45 },
  { src: "dog-walk", at: 615, len: 45 },
  { src: "fizz", at: 660, len: 90 },
];
const END_AT = 750;
const END_FADE = 24; // the fizz settles into black
export const HATHERLEY_XMAS_FRAMES = END_AT + 120;

type Block = { at: number; to: number; eyebrow: string; headline: string };
const BLOCKS: Block[] = [
  { at: 0, to: 120, eyebrow: "CHRISTMAS IN THE COUNTRY", headline: "Christmas, all sorted" },
  { at: 120, to: 210, eyebrow: "MULLED WINE ON ARRIVAL", headline: "And a festive sharing platter" },
  { at: 210, to: 300, eyebrow: "CHRISTMAS EVE", headline: "Straight to the spa" },
  { at: 300, to: 390, eyebrow: "CHRISTMAS EVE", headline: "Dinner, with music to follow" },
  { at: 390, to: 480, eyebrow: "CHRISTMAS MORNING", headline: "Breakfast, then spa time" },
  { at: 480, to: 570, eyebrow: "CHRISTMAS LUNCH, SORTED", headline: "Three courses, the traditional way" },
  { at: 570, to: 660, eyebrow: "DOGS WELCOME", headline: "Nobody gets left at home" },
  { at: 660, to: 750, eyebrow: "BOXING DAY", headline: "Gala Dinner and a disco" },
];

const ShotLayer: React.FC<{ s: Shot; i: number }> = ({ s, i }) => {
  const f = useCurrentFrame(); // local: 0 is half a crossfade before the slot (the first shot starts at 0)
  const lead = i === 0 ? 0 : H;
  const fadeIn = i === 0 ? 1 : interpolate(f, [0, XF], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const last = i === SHOTS.length - 1;
  const fadeOut = last
    ? interpolate(f, [lead + s.len - END_FADE / 2, lead + s.len + END_FADE / 2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;
  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut }}>
      <OffthreadVideo src={staticFile(`${P}/${s.src}.mp4`)} muted trimBefore={i === 0 ? H : 0}
        style={{ width: 1080, height: 1920, objectFit: "cover" }} />
    </AbsoluteFill>
  );
};

const TextBlock: React.FC<{ b: Block; first: boolean }> = ({ b, first }) => {
  const f = useCurrentFrame() + b.at; // global frame
  const inP = first ? 1 : progress(f, b.at + H, 16, EASE_OUT);
  const outP = progress(f, b.to - H - 10, 10, EASE_IN_OUT);
  const o = inP * (1 - outP);
  const y = (1 - inP) * 26 - outP * 10;
  return (
    <div style={{ position: "absolute", left: 80, right: 160, bottom: 470, opacity: o, transform: `translateY(${y}px)` }}>
      <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 30, letterSpacing: 5, color: colors.gold, marginBottom: 14,
        textShadow: "0 1px 14px rgba(0,0,0,0.5)" }}>{b.eyebrow}</div>
      <div style={{ fontFamily: serif, fontWeight: 400, fontSize: 80, lineHeight: 1.04, color: colors.cream,
        textShadow: "0 2px 26px rgba(0,0,0,0.5)" }}>{b.headline}</div>
    </div>
  );
};

const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  // the fizz is still fading to black for the first END_FADE / 2 frames: the words come in once it has gone
  const t = progress(f, 16, 24, EASE_OUT);
  const place = progress(f, 26, 24, EASE_OUT);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 640, width: "100%", textAlign: "center", opacity: t, transform: `translateY(${(1 - t) * 20}px)` }}>
        <div style={{ fontFamily: serif, fontWeight: 400, fontSize: 92, lineHeight: 1.05, color: colors.cream }}>Hatherley Manor</div>
        <div style={{ fontFamily: serif, fontWeight: 400, fontSize: 92, lineHeight: 1.05, color: colors.cream }}>Hotel &amp; Spa</div>
      </div>
      <div style={{ position: "absolute", top: 890, width: "100%", textAlign: "center", opacity: place, fontFamily: sans, fontWeight: 600,
        fontSize: 28, letterSpacing: 7, color: colors.gold }}>COTSWOLDS</div>
      <div style={{ position: "absolute", top: 1040, left: (1080 - 240) / 2 }}>
        <CBLogo start={40} width={240} shimmerAt={84} cbOnly />
      </div>
    </AbsoluteFill>
  );
};

export const HatherleyChristmas: React.FC<{ music?: { src: string; from: number; gain: number } }> = ({ music }) => {
  const frame = useCurrentFrame();
  const scrim = interpolate(frame, [END_AT - 10, END_AT + 4], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const mark = interpolate(frame, [END_AT - END_FADE / 2, END_AT], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const total = HATHERLEY_XMAS_FRAMES;
  return (
    <AbsoluteFill style={{ background: colors.black }}>
      {SHOTS.map((s, i) => (
        <Sequence key={s.src} from={i === 0 ? 0 : s.at - H} durationInFrames={s.len + XF + (i === SHOTS.length - 1 ? END_FADE : 0)}>
          <ShotLayer s={s} i={i} />
        </Sequence>
      ))}
      {/* a soft scrim under the text, on across every shot so it never pumps */}
      <AbsoluteFill style={{ opacity: scrim, background: "linear-gradient(180deg, rgba(0,0,0,0) 52%, rgba(0,0,0,0.38) 66%, rgba(0,0,0,0.5) 78%, rgba(0,0,0,0.2) 100%)" }} />
      {BLOCKS.map((b, i) => (
        <Sequence key={i} from={b.at} durationInFrames={b.to - b.at}>
          <TextBlock b={b} first={i === 0} />
        </Sequence>
      ))}
      <Img src={staticFile("brand/cb-watermark.png")} style={{ position: "absolute", left: 920, top: 1452, width: 100, height: 108, opacity: mark }} />
      <Sequence from={END_AT}><EndCard /></Sequence>
      {music && (
        <Audio src={staticFile(music.src)} trimBefore={Math.round(music.from * 30)}
          volume={(v) => music.gain * interpolate(v, [0, 4, total - 45, total - 2], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      )}
      <FilmFinish />
    </AbsoluteFill>
  );
};
