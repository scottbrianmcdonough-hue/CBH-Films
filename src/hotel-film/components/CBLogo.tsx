import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { EASE_IN_OUT, progress } from "../theme";

// The official CBH primary logo for dark backgrounds (vector), and its gold paths alone
// (the CB and "Hotels & Resorts") as the mask for the light sweep; or the CB alone, for a
// sweep across the monogram only.
const LOGO = staticFile("brand/cbh-logo-on-dark.svg");
const GOLD_LAYER = staticFile("brand/cbh-logo-gold.svg");
const CB_ONLY = staticFile("brand/cbh-logo-cb-only.svg");
const CB_LOGO_ASPECT = 655.69 / 534.25;

// The Classic British Hotels logo: wipes up into view, then a light sweep crosses the gold CB.
export const CBLogo: React.FC<{
  start: number;
  width: number;
  shimmerAt: number;
  cbOnly?: boolean; // the light sweep crosses the CB monogram only
  revealFrames?: number; // how long the wipe up takes (else 40)
}> = ({ start, width, shimmerAt, cbOnly, revealFrames = 40 }) => {
  const mask = cbOnly ? CB_ONLY : GOLD_LAYER;
  const frame = useCurrentFrame();
  const reveal = progress(frame, start, revealFrames, EASE_IN_OUT);
  const sweep = interpolate(frame, [shimmerAt, shimmerAt + 30], [-60, 160], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const height = width * CB_LOGO_ASPECT;

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        clipPath: `inset(${(1 - reveal) * 100}% 0 0 0)`,
        transform: `translateY(${(1 - reveal) * 30}px)`,
      }}
    >
      <Img src={LOGO} style={{ width, height, display: "block" }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          WebkitMaskImage: `url(${mask})`,
          maskImage: `url(${mask})`,
          WebkitMaskSize: "100% 100%",
          maskSize: "100% 100%",
          background: `linear-gradient(110deg, transparent ${sweep - 25}%, rgba(255,246,220,0.95) ${sweep}%, transparent ${sweep + 25}%)`,
        }}
      />
    </div>
  );
};
