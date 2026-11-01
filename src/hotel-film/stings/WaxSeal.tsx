import React from "react";
import { Video } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { FilmFinish } from "../components/FilmFinish";
import { colors } from "../theme";

// "Sealed", a brand moment (Scott asked for "something else entirely than photos or tiles";
// he picked the wax seal of the three offered): a cream envelope on a dark table under a warm
// light, gold sealing wax pooling on the tip of its flap, a brass seal coming down from above
// the camera, pressing, lifting off to leave the CB in the wax; the light moves across the
// relief so it glints (the scene is drawn and lit from height maps by scripts/wax-seal.py,
// nothing is a photo). Then the pressed CB turns flat gold as the scene falls to black and
// settles into the logo, with its shimmer. A silent mock-up for now.

export const WAX_SEAL_FRAMES = 375;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// where the CB sits on the scene's last frames (printed by scripts/wax-seal.py)
const WAX_SCALE = 0.6423; // screen px per logo viewBox unit
const WAX_ORIGIN: [number, number] = [368.25, 815.0];

const VB: [number, number] = [534.25, 655.69];
const LOGO_W = 640;
const LOGO_S = LOGO_W / VB[0];
const LOGO_X = (1080 - LOGO_W) / 2;
const LOGO_Y = (1920 - VB[1] * LOGO_S) / 2;

const GILD = [240, 262]; // the pressed CB turns flat gold
const DARK = [250, 276]; // the scene falls to black round it
const SETTLE = [270, 304]; // the CB settles into the logo
const WORDMARK = [298, 322];
const SHIMMER = 326;

export const WaxSeal: React.FC = () => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, SETTLE, [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const k = WAX_SCALE + (LOGO_S - WAX_SCALE) * t;
  const box = {
    position: "absolute" as const,
    left: interpolate(t, [0, 1], [WAX_ORIGIN[0], LOGO_X]),
    top: interpolate(t, [0, 1], [WAX_ORIGIN[1], LOGO_Y]),
    width: VB[0] * k,
    height: VB[1] * k,
  };
  const gild = interpolate(frame, GILD, [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.quad),
  });
  const dark = interpolate(frame, DARK, [0, 1], clamp);
  const word = interpolate(frame, WORDMARK, [0, 1], clamp);
  const sweep = interpolate(frame, [SHIMMER, SHIMMER + 30], [-60, 160], clamp);
  const mask = (src: string) => ({
    WebkitMaskImage: `url(${staticFile(src)})`,
    maskImage: `url(${staticFile(src)})`,
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
  });
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      {frame < DARK[1] ? (
        <AbsoluteFill style={{ opacity: 1 - dark }}>
          <Video src={staticFile("stings/wax-seal.mp4")} muted />
        </AbsoluteFill>
      ) : null}
      {frame >= GILD[0] ? (
        <>
          <Img
            src={staticFile("brand/cbh-logo-on-dark.svg")}
            style={{ ...box, opacity: word }}
          />
          <div
            style={{
              ...box,
              ...mask("brand/cbh-logo-cb-only.svg"),
              backgroundColor: colors.gold,
              opacity: gild * (1 - word),
            }}
          />
          <div
            style={{
              ...box,
              ...mask("brand/cbh-logo-cb-only.svg"),
              background: `linear-gradient(110deg, transparent ${sweep - 25}%, rgba(255,246,220,0.95) ${sweep}%, transparent ${sweep + 25}%)`,
            }}
          />
        </>
      ) : null}
      <FilmFinish />
    </AbsoluteFill>
  );
};
