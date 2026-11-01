import { Audio } from "@remotion/media";
import { getLength } from "@remotion/paths";
import React from "react";
import { AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { FilmFinish } from "../components/FilmFinish";
import { CB_B, CB_C } from "../sketch/cb-paths";
import { colors, EASE_IN_OUT, progress, serif } from "../theme";

// "There's a seat by the fire" (Scott, 31 Oct: the candle reel's feel, "with tea or coffee and steam or a
// window with condensation and CB is fingered"). Outside in the cold, looking in through a fogged window at a
// fireside set for tea (Holdsworth House): the glass beaded and misted, the room behind it a warm blur with
// the fire flickering. A finger writes the CB in the condensation, C then B, as the piano plays, and the room
// shows sharp through the letters; drips run from the bottoms of the strokes, and the line comes up.
// No hand is shown: the strokes clear as if a fingertip were drawing them. The cleared shape is the logo's
// own CB (its outlines, revealed along the strokes a finger would make), with soft, slightly wet edges.
// On the last chord the window fades to black as the letters fill with gold where they were wiped (Scott: "fade
// to just black, clean end card and logo shimmer"), the full logo comes up round them (the wordmark beneath, in
// the logo's own frame, so the CB starts exactly where it was written) and the shimmer crosses (Bianca said "not
// all" gold shimmer: a brand moment like this one keeps it); the line fades with the window, leaving the logo
// alone (Scott). It eases back into the centre at the brand moments' logo size (640px wide, like the mosaic,
// circle C and sash window; Scott: "big enough to read Hotels & Resorts", "zoom out into the centre then the
// shimmer like other reels"; over 15s is fine).

const W = 1080;
const H = 1920;
const ROOM = "hotels/holdsworth-house/tea-by-the-fire.jpg";
const ROOM_POS = "42% 50%"; // the fire in the B's bowls, the tablecloth's glare outside the letter

// Music: Autumn Piano (leberch, Pixabay 611124; Ruthin used 7.8-29s), its ending from 119.79s: the C on the
// 121.39s chord, the B's top bowl closing on 124.18s, the line on 126.94s, the last chord ringing out.
const MUSIC = "hotels/ruthin-castle/autumn-piano.mp3";
// The piano's ending is quiet: after rendering, the audio is lifted 3.6 dB through a limiter (ffmpeg
// volume=3.6dB,alimiter=limit=0.84) to -15.5 LUFS.
const MUSIC_FROM = 119.79;
const at = (s: number) => Math.round((s - MUSIC_FROM) * 30);
export const WINDOW_CB_FRAMES = at(136.46); // the last chord (131.12s) rings out under the logo, fading

// The CB in the logo's frame (x 58-476, y 0-451), centred on the glass, 1.5x.
const CB_SCALE = 1.5;
const CY = 840; // the fire sits under the B's bowls
const CB_T = `translate(${540 - 267 * CB_SCALE} ${CY - 225 * CB_SCALE}) scale(${CB_SCALE})`;
const toScreen = (x: number, y: number) => [540 + (x - 267) * CB_SCALE, CY + (y - 225) * CB_SCALE] as const;

// The finger's strokes along the letters' middles (checked over the logo), each with its frames: the C in one
// sweep from its top tip, the B's stem down, then its two bowls from the top of the stem.
const STROKES = [
  { d: "M340 74 C300 22 250 16 215 17 C150 18 100 62 90 140 C82 205 112 262 160 286 C178 294 190 297 198 298", from: at(121.39), to: at(121.39) + 36 },
  { d: "M258 158 L258 446", from: at(121.39) + 42, to: at(121.39) + 58 },
  { d: "M258 162 L350 162 C410 162 436 192 434 224 C432 262 402 290 330 294 L302 294", from: at(121.39) + 62, to: at(124.18) },
  { d: "M302 294 L352 294 C424 296 454 334 452 370 C450 418 410 446 352 446 L258 446", from: at(124.18), to: at(124.18) + 22 },
].map((s) => ({ ...s, len: getLength(s.d) }));
const WIDTH = 80; // wide enough to take in the thickest part of the C

// Drips run from the bottoms of the letters once they are written (screen px), stopping short of the line.
const DRIPS = [
  { o: toScreen(258, 451), len: 120, from: at(124.18) + 40, dur: 130 },
  { o: toScreen(190, 306), len: 150, from: at(124.18) + 62, dur: 100 },
  { o: toScreen(392, 449), len: 90, from: at(124.18) + 86, dur: 110 },
];

// the line on the 126.94s chord (Scott: it came up "too fast" at 129.47s, with too little impact), so it
// holds about four seconds before the window fades
const LINE = at(126.94);
const GOLD = at(131.12); // the last chord: the letters fill with gold, the logo comes up
// The logo files share the CB-only file's 534.25 x 655.69 frame, placed with the same transform.
const LOGO_BOX = { left: 540 - 267 * CB_SCALE, top: CY - 225 * CB_SCALE, width: 534.25 * CB_SCALE, height: 655.69 * CB_SCALE };
// where it settles: 640px wide in the middle of the frame, as the brand moments end
const END_SCALE = 640 / LOGO_BOX.width;
const END_SHIFT = 960 - (LOGO_BOX.top + LOGO_BOX.height / 2);

// Beads of condensation on the glass, fixed: many fine ones, a few larger.
const BEADS = Array.from({ length: 1100 }, (_, i) => {
  const big = i % 28 === 0;
  return {
    x: random(`bx${i}`) * W,
    y: random(`by${i}`) * H,
    r: big ? 5 + random(`br${i}`) * 6 : 1 + random(`br${i}`) ** 2 * 3.2,
  };
});

const strokeMask = (frame: number) =>
  STROKES.map((s) => {
    const p = progress(frame, s.from, s.to - s.from, EASE_IN_OUT);
    return p <= 0
      ? ""
      : `<path d="${s.d}" fill="none" stroke="white" stroke-width="${WIDTH}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${s.len} ${s.len + 1}" stroke-dashoffset="${s.len * (1 - p)}"/>`;
  }).join("");

const dripPaths = (frame: number, colour: string) =>
  DRIPS.map((d, i) => {
    const p = progress(frame, d.from, d.dur, (t) => 1 - (1 - t) ** 2.4);
    if (p <= 0) return "";
    const [x, y] = d.o;
    const wob = 4 * Math.sin(i * 2.1 + 1);
    const y1 = y + d.len * p;
    return `<path d="M${x} ${y - 6} Q${x + wob} ${(y + y1) / 2} ${x - wob * 0.5} ${y1}" fill="none" stroke="${colour}" stroke-width="9" stroke-linecap="round"/><circle cx="${x - wob * 0.5}" cy="${y1 + 2}" r="${6 + 2 * p}" fill="${colour}"/>`;
  }).join("");

// The clear: the logo's CB where the strokes have reached, plus the drips, with soft, slightly ragged
// (wet) edges. Drawn as an SVG data URL used as a CSS mask on the sharp room.
const clearMask = (frame: number) => {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
    `<defs><mask id="p" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><g transform="${CB_T}">${strokeMask(frame)}</g></mask>` +
    `<filter id="w" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" result="n"/>` +
    `<feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G"/><feGaussianBlur stdDeviation="2.2"/></filter></defs>` +
    `<g filter="url(#w)"><g mask="url(#p)"><g transform="${CB_T}"><path d="${CB_C}" fill="white"/><path d="${CB_B}" fill="white"/></g></g>${dripPaths(frame, "white")}</g></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
};

// The room: the photo on a slow push, the fire's light breathing.
const Room: React.FC<{ frame: number; sharp?: boolean }> = ({ frame, sharp }) => {
  const s = interpolate(frame, [0, WINDOW_CB_FRAMES], [1.02, 1.09]);
  const flick = 0.55 + 0.18 * Math.sin(frame * 0.41) + 0.12 * Math.sin(frame * 1.07 + 1.3) + 0.08 * Math.sin(frame * 2.3 + 0.4);
  return (
    <AbsoluteFill style={{ transform: `scale(${s})`, transformOrigin: "50% 48%",
      // seen through the letters, the room a touch warmer and brighter, so it invites
      filter: sharp ? "brightness(1.16) saturate(1.1) sepia(0.08)" : undefined }}>
      <Img src={staticFile(ROOM)} style={{ width: W, height: H, objectFit: "cover", objectPosition: ROOM_POS }} />
      <div style={{ position: "absolute", left: 290, top: 690, width: 760, height: 620, opacity: flick,
        background: "radial-gradient(closest-side, rgba(255,150,60,0.42), rgba(255,120,40,0.12) 55%, rgba(255,120,40,0) 100%)",
        mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};

export const WindowCB: React.FC = () => {
  const frame = useCurrentFrame();
  // a breath on the glass just before the finger: the mist thickens in the middle, then settles
  const breath = progress(frame, 6, 30, EASE_IN_OUT) * (1 - 0.6 * progress(frame, 40, 60, EASE_IN_OUT));
  const mask = clearMask(frame);
  const line = progress(frame, LINE, 46, EASE_IN_OUT);
  const open = progress(frame, 0, 14);
  const dim = progress(frame, GOLD - 6, 36, EASE_IN_OUT);
  const fill = progress(frame, GOLD, 18, EASE_IN_OUT);
  const zoom = progress(frame, GOLD + 22, 45, EASE_IN_OUT);
  const logo = progress(frame, GOLD + 52, 26, EASE_IN_OUT);
  const sweep = interpolate(frame, [GOLD + 88, GOLD + 118], [-60, 160], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const settle = { transform: `translateY(${END_SHIFT * zoom}px) scale(${1 - (1 - END_SCALE) * zoom})`, transformOrigin: "50% 50%" };
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      <AbsoluteFill style={{ opacity: open }}>
        {/* the misted glass: the room blurred, a cool haze and the beads */}
        <AbsoluteFill style={{ filter: "blur(30px) saturate(0.8) brightness(1.08)" }}>
          <Room frame={frame} />
        </AbsoluteFill>
        <AbsoluteFill style={{ background: "rgba(236,228,214,0.30)" }} />
        {/* the cold outside: the glass darker towards its edges */}
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 760px 1150px at 540px 860px, rgba(8,10,14,0) 55%, rgba(8,10,14,0.42) 100%)" }} />
        <AbsoluteFill style={{ opacity: breath, background: "radial-gradient(ellipse 520px 640px at 540px 820px, rgba(232,226,214,0.22), rgba(232,226,214,0) 100%)" }} />
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" />
            <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.09 0" />
          </filter>
          <rect width={W} height={H} filter="url(#grain)" />
          {BEADS.map((b, i) => (
            <g key={i}>
              <circle cx={b.x} cy={b.y} r={b.r} fill="rgba(255,244,228,0.06)" stroke={b.r > 4 ? "rgba(60,40,20,0.16)" : "rgba(60,40,20,0.08)"} strokeWidth={b.r > 4 ? 1.1 : 0.6} />
              {b.r > 4 ? <circle cx={b.x - b.r * 0.3} cy={b.y + b.r * 0.4} r={b.r * 0.3} fill="rgba(255,236,210,0.28)" /> : null}
            </g>
          ))}
        </svg>
        {/* the room, sharp, through the letters and the drips */}
        <AbsoluteFill style={{ WebkitMaskImage: mask, maskImage: mask, WebkitMaskSize: "100% 100%", maskSize: "100% 100%" }}>
          <Room frame={frame} sharp />
        </AbsoluteFill>
        {/* the water pushed to the letters' edges catches the light; the drips' heads */}
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }} dangerouslySetInnerHTML={{ __html:
          `<defs><mask id="rimp" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><g transform="${CB_T}">${strokeMask(frame)}</g></mask>` +
          `<filter id="rimb"><feGaussianBlur stdDeviation="1.4"/></filter></defs>` +
          `<g filter="url(#rimb)" opacity="0.5"><g mask="url(#rimp)"><g transform="${CB_T}"><path d="${CB_C}" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2"/><path d="${CB_B}" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2"/></g></g></g>` +
          `<g opacity="0.35">${dripPaths(frame, "rgba(255,255,255,0.0)")}</g>` +
          DRIPS.map((d, i) => {
            const p = progress(frame, d.from, d.dur, (t) => 1 - (1 - t) ** 2.4);
            if (p <= 0) return "";
            const wob = 4 * Math.sin(i * 2.1 + 1);
            return `<circle cx="${d.o[0] - wob * 0.5 - 2}" cy="${d.o[1] + d.len * p - 1}" r="2.2" fill="rgba(255,255,255,0.6)"/>`;
          }).join("") }} />
        {/* the window fades to black: a clean end card */}
        <AbsoluteFill style={{ backgroundColor: colors.black, opacity: dim }} />
        {/* the wiped letters fill with gold, the full logo comes up round them, the shimmer */}
        <div style={{ position: "absolute", ...LOGO_BOX, ...settle }}>
          <Img src={staticFile("brand/cbh-logo-cb-only.svg")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: fill }} />
          <Img src={staticFile("brand/cbh-logo-on-dark.svg")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: logo }} />
          <div style={{ position: "absolute", inset: 0, WebkitMaskImage: `url(${staticFile("brand/cbh-logo-gold.svg")})`,
            maskImage: `url(${staticFile("brand/cbh-logo-gold.svg")})`, WebkitMaskSize: "100% 100%", maskSize: "100% 100%",
            background: `linear-gradient(110deg, transparent ${sweep - 25}%, rgba(255,246,220,0.95) ${sweep}%, transparent ${sweep + 25}%)` }} />
        </div>
        {/* the line, above the letters, until the window fades: no band behind it (Scott), a soft shadow round
            the letters keeps it on the mist; it comes out of a blur, rising and settling in size. Not by easing
            its letter-spacing: Cormorant's "Th" ligature only forms at zero spacing, so it snapped together as
            the line landed (Scott: "pops out when it lands") */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 210, textAlign: "center", fontFamily: serif, fontSize: 104,
          lineHeight: 1.08, color: colors.cream, opacity: line * (1 - dim),
          transform: `translateY(${(1 - line) * 46}px) scale(${1 + (1 - line) * 0.04})`, filter: `blur(${(1 - line) * 10}px)`,
          textShadow: "0 0 34px rgba(0,0,0,0.6), 0 2px 10px rgba(0,0,0,0.45)" }}>
          There&rsquo;s a seat
          <br />
          by the fire
        </div>
      </AbsoluteFill>
      <Audio src={staticFile(MUSIC)} trimBefore={Math.round(MUSIC_FROM * 30)}
        volume={(f) => 0.9 * interpolate(f, [0, 10, WINDOW_CB_FRAMES - 40, WINDOW_CB_FRAMES], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      <FilmFinish />
    </AbsoluteFill>
  );
};
