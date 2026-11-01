import { Audio } from "@remotion/media";
import { getLength } from "@remotion/paths";
import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FilmFinish } from "../components/FilmFinish";
import { CB_B, CB_C } from "../sketch/cb-paths";
import { colors, EASE_IN_OUT, progress, serif } from "../theme";

// "The kettle's on" (Scott, 31 Oct: "now do the steam version with tea", the window CB's sister). Langshott
// Manor's fireside afternoon tea held still as a cinemagraph, the fire flickering, steam rising from the cup on
// the left; it drifts up into the dark and gathers into the logo's CB, the C then the B, on the same piano chords
// as the window, still curling. The line comes up above it; on the last chord the steam turns to gold as the
// scene fades to black, and the logo eases into the centre at the brand moments' size and the shimmer crosses
// (as the window CB).
// The steam is drawn, not filmed: soft strokes rising from the cup, displaced by fractal noise that drifts
// upwards (the noise is fixed to a coordinate frame that moves up, so the curls travel with the steam).

const W = 1080;
const H = 1920;
const PHOTO = "campaigns/showcase/langshott-fireside-tea.jpg";
const CUP = { x: 369, y: 1398, w: 150 }; // the left cup's rim in the frame (the photo at cover, centred)
const FIRE = { x: 570, y: 1200 };

// Music: Autumn Piano's ending, as the window CB: the C on 121.39s, the B's top bowl on 124.18s, the line on
// 126.94s, the gold on the last chord (131.12s). The audio is lifted 3.6 dB through a limiter after rendering.
const MUSIC = "hotels/ruthin-castle/autumn-piano.mp3";
const MUSIC_FROM = 119.79;
const at = (s: number) => Math.round((s - MUSIC_FROM) * 30);
export const STEAM_CB_FRAMES = at(136.46);

// The CB over the beam and mantel, darkened behind it; 1.3x the logo's frame.
const CB_SCALE = 1.3;
const CX = 540;
const CY = 660;
const CB_T = `translate(${CX - 267 * CB_SCALE} ${CY - 225 * CB_SCALE}) scale(${CB_SCALE})`;

// The steam fills the letters along the strokes a hand would write them (as the window CB's finger).
const STROKES = [
  { d: "M340 74 C300 22 250 16 215 17 C150 18 100 62 90 140 C82 205 112 262 160 286 C178 294 190 297 198 298", from: at(121.39), to: at(121.39) + 40 },
  { d: "M258 158 L258 446", from: at(121.39) + 44, to: at(121.39) + 62 },
  { d: "M258 162 L350 162 C410 162 436 192 434 224 C432 262 402 290 330 294 L302 294", from: at(121.39) + 64, to: at(124.18) },
  { d: "M302 294 L352 294 C424 296 454 334 452 370 C450 418 410 446 352 446 L258 446", from: at(124.18), to: at(124.18) + 24 },
].map((s) => ({ ...s, len: getLength(s.d) }));

const LINE = at(126.94);
const GOLD = at(131.12);
const LOGO_BOX = { left: CX - 267 * CB_SCALE, top: CY - 225 * CB_SCALE, width: 534.25 * CB_SCALE, height: 655.69 * CB_SCALE };
const END_SCALE = 640 / LOGO_BOX.width;
const END_SHIFT = 960 - (LOGO_BOX.top + LOGO_BOX.height / 2);

const RISE = 3.4; // px a frame the steam's noise travels upwards

// Steam is uneven and see-through: the displaced shape ("d") thinned by a finer noise, softened, over a wide
// faint glow of itself.
const TEXTURE = (freq: string, seed: number, blur: number, contrast = 2.6, cut = 0.75) =>
  `<feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="2" seed="${seed}" result="t"/>` +
  `<feColorMatrix in="t" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${contrast} 0 0 0 -${cut}" result="ta"/>` +
  `<feComposite in="d" in2="ta" operator="in" result="dt"/>` +
  `<feGaussianBlur in="dt" stdDeviation="${blur.toFixed(2)}" result="core"/>` +
  `<feGaussianBlur in="d" stdDeviation="16" result="g"/>` +
  `<feComponentTransfer in="g" result="glow"><feFuncA type="linear" slope="0.32"/></feComponentTransfer>` +
  `<feMerge><feMergeNode in="glow"/><feMergeNode in="core"/></feMerge>`;

// A wisp from the cup's rim up towards the letters: x sways with height and time.
const wisp = (frame: number, i: number, top: number) => {
  const pts: string[] = [];
  for (let y = CUP.y; y >= top; y -= 24) {
    const k = (CUP.y - y) / (CUP.y - top || 1);
    const drift = (CX - CUP.x) * k ** 1.6; // drawn over towards the middle as it climbs
    const sway = (10 + 46 * k) * Math.sin(y * 0.011 + frame * 0.05 + i * 1.9);
    pts.push(`${(CUP.x + (i - 1) * 26 * (1 - k) + drift + sway).toFixed(1)} ${y}`);
  }
  return `M${pts.join(" L")}`;
};

export const SteamCB: React.FC = () => {
  const frame = useCurrentFrame();
  const open = progress(frame, 0, 16);
  // the steam climbs from the cup, reaching the letters as the C begins
  const top = interpolate(frame, [0, at(121.39)], [CUP.y - 260, CY + 180], { extrapolateRight: "clamp", easing: EASE_IN_OUT });
  const plume = 1 - 0.45 * progress(frame, at(124.18), 60, EASE_IN_OUT); // thinner once the CB has formed
  // the letters settle out of the curls as they fill, and keep a little movement
  const settleCB = progress(frame, at(121.39), 150, EASE_IN_OUT);
  const cbDisp = 70 - 52 * settleCB;
  const cbBlur = 9 - 6 * settleCB;
  const line = progress(frame, LINE, 46, EASE_IN_OUT);
  const dim = progress(frame, GOLD - 6, 36, EASE_IN_OUT);
  const fill = progress(frame, GOLD, 18, EASE_IN_OUT);
  const zoom = progress(frame, GOLD + 22, 45, EASE_IN_OUT);
  const logo = progress(frame, GOLD + 52, 26, EASE_IN_OUT);
  const sweep = interpolate(frame, [GOLD + 88, GOLD + 118], [-60, 160], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const settle = { transform: `translateY(${END_SHIFT * zoom}px) scale(${1 - (1 - END_SCALE) * zoom})`, transformOrigin: "50% 50%" };
  const flick = 0.55 + 0.2 * Math.sin(frame * 0.43) + 0.12 * Math.sin(frame * 1.13 + 1.3) + 0.08 * Math.sin(frame * 2.4 + 0.4);
  const k = frame * RISE; // the noise frame moves up by k
  const strokes = STROKES.map((s) => {
    const p = progress(frame, s.from, s.to - s.from, EASE_IN_OUT);
    return p <= 0
      ? ""
      : `<path d="${s.d}" fill="none" stroke="white" stroke-width="84" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${s.len} ${s.len + 1}" stroke-dashoffset="${s.len * (1 - p)}"/>`;
  }).join("");
  const wisps = [0, 1, 2]
    .map((i) => {
      const w = [70, 34, 16][i];
      const o = [0.34, 0.5, 0.62][i] * plume;
      return `<path d="${wisp(frame, i, top)}" fill="none" stroke="url(#fade)" stroke-opacity="${o}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
    })
    .join("");
  const steam =
    `<defs>` +
    `<linearGradient id="fade" gradientUnits="userSpaceOnUse" x1="0" y1="${CUP.y}" x2="0" y2="${top}">` +
    `<stop offset="0" stop-color="#EEE8DE" stop-opacity="0"/><stop offset="0.08" stop-color="#EEE8DE" stop-opacity="1"/>` +
    `<stop offset="0.75" stop-color="#EEE8DE" stop-opacity="0.8"/><stop offset="1" stop-color="#EEE8DE" stop-opacity="0"/></linearGradient>` +
    // the noise lives in a frame that moves up by k; everything inside is drawn k lower, so it stays put
    `<filter id="curl" filterUnits="userSpaceOnUse" x="-200" y="${-400 + k}" width="1480" height="2800">` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.006 0.014" numOctaves="3" seed="11" result="n"/>` +
    `<feDisplacementMap in="SourceGraphic" in2="n" scale="120" xChannelSelector="R" yChannelSelector="G" result="d"/>` +
    TEXTURE("0.018 0.032", 8, 7) + `</filter>` +
    `<filter id="cbcurl" filterUnits="userSpaceOnUse" x="-200" y="${-400 + k}" width="1480" height="2800">` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.009 0.02" numOctaves="3" seed="5" result="n"/>` +
    `<feDisplacementMap in="SourceGraphic" in2="n" scale="${cbDisp.toFixed(1)}" xChannelSelector="R" yChannelSelector="G" result="d"/>` +
    // in the letters the steam streaks upwards (noise stretched tall), soft and low in contrast
    TEXTURE("0.034 0.008", 3, cbBlur + 1.5, 1.8, 0.42) + `</filter>` +
    `<mask id="written" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><g transform="${CB_T}">${strokes}</g></mask>` +
    `</defs>` +
    `<g transform="translate(0 ${-k})">` +
    `<g filter="url(#curl)"><g transform="translate(0 ${k})">${wisps}</g></g>` +
    `<g filter="url(#cbcurl)"><g transform="translate(0 ${k})"><g mask="url(#written)" opacity="1"><g transform="${CB_T}">` +
    `<path d="${CB_C}" fill="#F1ECE3"/><path d="${CB_B}" fill="#F1ECE3"/></g></g></g></g>` +
    `</g>`;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      <AbsoluteFill style={{ opacity: open }}>
        {/* the tea, still; the room darkened above the fireplace for the evening, so the steam shows */}
        <Img src={staticFile(PHOTO)} style={{ width: W, height: H, objectFit: "cover", objectPosition: "50% 50%" }} />
        <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(6,5,4,0.66) 0%, rgba(6,5,4,0.64) 52%, rgba(6,5,4,0.28) 60%, rgba(6,5,4,0) 68%)" }} />
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 820px 1300px at 540px 900px, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)" }} />
        {/* the fire's light breathing */}
        <div style={{ position: "absolute", left: FIRE.x - 330, top: FIRE.y - 300, width: 660, height: 600, opacity: flick, mixBlendMode: "screen",
          background: "radial-gradient(closest-side, rgba(255,140,50,0.36), rgba(255,110,40,0.1) 55%, rgba(255,110,40,0) 100%)" }} />
        {/* the steam and the CB it gathers into */}
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }} dangerouslySetInnerHTML={{ __html: steam }} />
        {/* the scene fades to black on the last chord; the letters turn gold where the steam wrote them */}
        <AbsoluteFill style={{ backgroundColor: colors.black, opacity: dim }} />
        <div style={{ position: "absolute", ...LOGO_BOX, ...settle }}>
          <Img src={staticFile("brand/cbh-logo-cb-only.svg")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: fill }} />
          <Img src={staticFile("brand/cbh-logo-on-dark.svg")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: logo }} />
          <div style={{ position: "absolute", inset: 0, WebkitMaskImage: `url(${staticFile("brand/cbh-logo-gold.svg")})`,
            maskImage: `url(${staticFile("brand/cbh-logo-gold.svg")})`, WebkitMaskSize: "100% 100%", maskSize: "100% 100%",
            background: `linear-gradient(110deg, transparent ${sweep - 25}%, rgba(255,246,220,0.95) ${sweep}%, transparent ${sweep + 25}%)` }} />
        </div>
        {/* the line in the dark above the letters: out of a blur, rising and settling in size (no letter-spacing
            move: Cormorant's ligatures snap as the spacing reaches zero) */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 190, textAlign: "center", fontFamily: serif, fontSize: 104,
          lineHeight: 1.08, color: colors.cream, opacity: line * (1 - dim),
          transform: `translateY(${(1 - line) * 46}px) scale(${1 + (1 - line) * 0.04})`, filter: `blur(${(1 - line) * 10}px)`,
          textShadow: "0 0 34px rgba(0,0,0,0.6), 0 2px 10px rgba(0,0,0,0.45)" }}>
          The kettle&rsquo;s on
        </div>
      </AbsoluteFill>
      <Audio src={staticFile(MUSIC)} trimBefore={Math.round(MUSIC_FROM * 30)}
        volume={(f) => 0.9 * interpolate(f, [0, 10, STEAM_CB_FRAMES - 40, STEAM_CB_FRAMES], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      <FilmFinish />
    </AbsoluteFill>
  );
};
