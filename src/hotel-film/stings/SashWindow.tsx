import React from "react";
import { Audio, Video } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { FilmFinish } from "../components/FilmFinish";
import { colors } from "../theme";

// "Every window, a different view", a brand moment (Scott picked the sash window from the
// collage ideas): a dark room and a Georgian six-over-six sash window, every pane a
// different hotel's view, swapping one by one like lights coming on; then the panes clear
// in a sweep and the twelve become one view through the glass (Castle Inn's garden under
// the fells, a camera move with depth); the lower sash slides up behind the upper, the
// camera pushes out through the opening into the garden, and it fades to the gold logo
// and its shimmer.

export const SASH_FRAMES = 450;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const GRADE =
  "sepia(0.3) hue-rotate(-14deg) saturate(1.05) contrast(0.98) brightness(0.96)";

// the window, frame px
const OX0 = 116; // the opening (inside the casing)
const OX1 = 964;
const OY0 = 206;
const OY1 = 1714;
const CASING = 36;
const SASH_H = (OY1 - OY0) / 2; // 754
const RAIL = 26; // sash stiles and rails
const BAR = 14; // glazing bars
const GX0 = OX0 + RAIL;
const GW = OX1 - OX0 - RAIL * 2; // 796
const GH = SASH_H - RAIL * 2; // 702
const PW = (GW - BAR * 2) / 3;
const PH = (GH - BAR) / 2;
const PAINT = "#26231f"; // the window's paint, backlit, so its faces fall dark
const PAINT_EDGE = "rgba(255,236,205,0.16)"; // the light catching its edges
const WALL = "#0b0a09";

// the views in the panes: twelve to start, each pane swapping once to another
const A = [
  "hotels/holdsworth-house/exterior.jpg",
  "hotels/the-kingfisher/river.jpg",
  "hotels/hintlesham-hall/facade.jpg",
  "hotels/castle-inn/fell-walker.jpg",
  "hotels/waterton-park/walton-hall.jpg",
  "hotels/ruthin-castle/castle.jpg",
  "hotels/whittlebury-park/golf.jpg",
  "campaigns/departures/hotels/atholl-palace.jpg",
  "campaigns/november/hotels/lakeside-spaniel.jpg",
  "hotels/the-mount/garden-horse.jpg",
  "campaigns/showcase/gisborough-exterior.jpg",
  "hotels/whittlebury-park/exterior.jpg",
];
const B = [
  "hotels/waterton-park/aerial.jpg",
  "hotels/the-mount/golf-course.jpg",
  "campaigns/showcase/speech-house-walk.jpg",
  "hotels/holdsworth-house/aerial.jpg",
  "campaigns/black-friday/dalmahoy-golf.jpg",
  "hotels/castle-inn/cyclists.jpg",
  "hotels/the-mount/aerial-grounds.jpg",
  "hotels/the-mount/golf-club-pavilion.jpg",
  "hotels/the-mount/aerial.jpg",
  "hotels/ruthin-castle/castle.jpg",
  "hotels/the-kingfisher/river.jpg",
  "hotels/castle-inn/fell-walker.jpg",
];
// each pane swaps in its own moment, in this order
const SWAP_ORDER = [4, 9, 1, 7, 11, 2, 6, 0, 10, 5, 3, 8];
const SWAP = (k: number) => 36 + SWAP_ORDER.indexOf(k) * 7;
const FADE = 6;
// the panes clear in a diagonal sweep from the top left, the view showing through
const CLEAR = (k: number) => 132 + ((k % 3) + Math.floor(k / 3)) * 9;
const CLEAR_LEN = 14;
// the lower sash slides up behind the upper; the camera pushes out through the opening
// Cut to Jazz Cocktail Lounge (alex-morgan, Pixabay 556246; Scott sent five), the track's
// last 15s: the panes swap through the band's stop and clear as it comes back in
// (152.43s), the push lands on its last two hits (156.55, 156.90), the garden holds in the
// hush, and the logo arrives on the final chord (160.31s)
const MUSIC = staticFile("stings/jazz-cocktail-lounge.mp3");
const MUSIC_START = Math.round((160.305 - 370 / 30) * 30); // frames into the track at frame 0
const MUSIC_GAIN = 0.53; // about -15.5 LUFS
const OPEN = [186, 230];
const PUSH = [222, 268];
const PIVOT: [number, number] = [540, OY0 + SASH_H * 1.5];
const BLACK = [352, 372];
const LOGO_IN = [370, 396];
const SHIMMER = 400;

const VB: [number, number] = [534.25, 655.69];
const LOGO_W = 640;

const paneRect = (k: number) => {
  const row = Math.floor(k / 3);
  const col = k % 3;
  const sash = row < 2 ? 0 : 1;
  const r = row % 2;
  return {
    left: GX0 + col * (PW + BAR),
    top: OY0 + sash * SASH_H + RAIL + r * (PH + BAR),
    width: PW,
    height: PH,
  };
};

const Pane: React.FC<{ k: number; frame: number }> = ({ k, frame }) => {
  const swap = interpolate(frame, [SWAP(k), SWAP(k) + FADE], [0, 1], clamp);
  const clear = interpolate(frame, [CLEAR(k), CLEAR(k) + CLEAR_LEN], [1, 0], {
    ...clamp,
    easing: Easing.inOut(Easing.quad),
  });
  if (clear <= 0) return null;
  const drift = 1.06 - 0.04 * (frame / 200);
  const img = (src: string, o: number) => (
    <Img
      src={staticFile(src)}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        transform: `scale(${drift})`,
        filter: GRADE,
        opacity: o,
      }}
    />
  );
  return (
    <div
      style={{
        position: "absolute",
        ...paneRect(k),
        overflow: "hidden",
        opacity: clear,
      }}
    >
      {img(A[k], 1)}
      {swap > 0 ? img(B[k], swap) : null}
    </div>
  );
};

// one sash: its frame and glazing bars over a faint glass sheen
const Sash: React.FC<{ top: number }> = ({ top }) => {
  const bars: React.CSSProperties[] = [
    // stiles and rails
    { left: OX0, top, width: OX1 - OX0, height: RAIL },
    { left: OX0, top: top + SASH_H - RAIL, width: OX1 - OX0, height: RAIL },
    { left: OX0, top, width: RAIL, height: SASH_H },
    { left: OX1 - RAIL, top, width: RAIL, height: SASH_H },
    // glazing bars
    { left: GX0 + PW, top: top + RAIL, width: BAR, height: GH },
    { left: GX0 + PW * 2 + BAR, top: top + RAIL, width: BAR, height: GH },
    { left: GX0, top: top + RAIL + PH, width: GW, height: BAR },
  ];
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: GX0,
          top: top + RAIL,
          width: GW,
          height: GH,
          background:
            "linear-gradient(125deg, rgba(255,250,240,0.07) 0%, rgba(255,250,240,0) 38%, rgba(255,250,240,0.03) 60%, rgba(255,250,240,0) 100%)",
        }}
      />
      {bars.map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            ...b,
            background: PAINT,
            boxShadow: `inset 0 0 0 1px ${PAINT_EDGE}, 0 2px 6px rgba(0,0,0,0.5)`,
          }}
        />
      ))}
    </>
  );
};

export const SashWindow: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 20], [0, 1], clamp);
  const open = interpolate(frame, OPEN, [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const push = interpolate(frame, PUSH, [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });
  const roomScale = 1 + push * 6;
  const viewScale = 1 + push * 0.22; // the garden is far: it grows much less (parallax)
  const black = interpolate(frame, BLACK, [0, 1], clamp);
  const logo = interpolate(frame, LOGO_IN, [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.quad),
  });
  const sweep = interpolate(frame, [SHIMMER, SHIMMER + 30], [-60, 160], clamp);
  const box = {
    position: "absolute" as const,
    left: (1080 - LOGO_W) / 2,
    top: 470,
    width: LOGO_W,
    height: LOGO_W * (VB[1] / VB[0]),
  };
  const pivot = `${PIVOT[0]}px ${PIVOT[1]}px`;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      <Audio
        src={MUSIC}
        trimBefore={MUSIC_START}
        volume={(f) =>
          MUSIC_GAIN *
          interpolate(
            f,
            [0, 6, SASH_FRAMES - 15, SASH_FRAMES],
            [0, 1, 1, 0],
            clamp,
          )
        }
      />
      <AbsoluteFill style={{ opacity: fadeIn * (1 - black) }}>
        {/* the view through the window */}
        <AbsoluteFill
          style={{
            transform: `scale(${viewScale})`,
            transformOrigin: pivot,
            filter: GRADE,
          }}
        >
          <Sequence from={30}>
            <Video
              src={staticFile("stings/window-view.mp4")}
              muted
              style={{ width: "100%", height: "100%" }}
            />
          </Sequence>
        </AbsoluteFill>
        {/* the room and the window, pushed past as the camera goes out through it */}
        <AbsoluteFill
          style={{ transform: `scale(${roomScale})`, transformOrigin: pivot }}
        >
          {/* the lower sash (behind the upper), sliding up */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              transform: `translateY(${-open * (SASH_H - 18)}px)`,
            }}
          >
            {[6, 7, 8, 9, 10, 11].map((k) => (
              <Pane key={k} k={k} frame={frame} />
            ))}
            <Sash top={OY0 + SASH_H} />
          </div>
          {[0, 1, 2, 3, 4, 5].map((k) => (
            <Pane key={k} k={k} frame={frame} />
          ))}
          <Sash top={OY0} />
          {/* the wall round the opening, the casing and the sill */}
          {[
            { left: 0, top: 0, width: 1080, height: OY0 },
            { left: 0, top: OY1, width: 1080, height: 1920 - OY1 },
            { left: 0, top: OY0, width: OX0, height: OY1 - OY0 },
            { left: OX1, top: OY0, width: 1080 - OX1, height: OY1 - OY0 },
          ].map((r, i) => (
            <div
              key={i}
              style={{ position: "absolute", ...r, background: WALL }}
            />
          ))}
          <div
            style={{
              position: "absolute",
              left: OX0 - CASING,
              top: OY0 - CASING,
              width: OX1 - OX0 + CASING * 2,
              height: OY1 - OY0 + CASING * 2,
              boxShadow: `inset 0 0 0 ${CASING}px ${PAINT}, inset 0 0 0 ${CASING + 1}px ${PAINT_EDGE}`,
              borderRadius: 2,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: OX0 - CASING - 30,
              top: OY1 + CASING,
              width: OX1 - OX0 + CASING * 2 + 60,
              height: 44,
              background: "linear-gradient(#3a352f, #1c1a17)",
              boxShadow: "0 18px 40px rgba(0,0,0,0.7)",
            }}
          />
          {/* the light from the window spilling into the dark room */}
          <AbsoluteFill
            style={{
              background: `radial-gradient(ellipse 760px 1100px at 540px ${(OY0 + OY1) / 2}px, rgba(255,196,130,0.10), rgba(255,196,130,0) 70%)`,
              mixBlendMode: "screen",
            }}
          />
        </AbsoluteFill>
      </AbsoluteFill>
      <Img
        src={staticFile("brand/cbh-logo-on-dark.svg")}
        style={{ ...box, opacity: logo }}
      />
      <div
        style={{
          ...box,
          WebkitMaskImage: `url(${staticFile("brand/cbh-logo-cb-only.svg")})`,
          maskImage: `url(${staticFile("brand/cbh-logo-cb-only.svg")})`,
          WebkitMaskSize: "100% 100%",
          maskSize: "100% 100%",
          background: `linear-gradient(110deg, transparent ${sweep - 25}%, rgba(255,246,220,0.95) ${sweep}%, transparent ${sweep + 25}%)`,
        }}
      />
      <FilmFinish />
    </AbsoluteFill>
  );
};
