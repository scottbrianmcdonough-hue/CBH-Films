import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { EASE_IN_OUT } from "../theme";

// scale is a zoom factor; x/y are the CSS object-position (%) used to pan within the photo.
type Move = { scale: number; x: number; y: number };

// Full-bleed photo with a slow push/pan across the whole scene.
export const KenBurns: React.FC<{ src: string; from: Move; to: Move }> = ({
  src,
  from,
  to,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = interpolate(frame, [0, durationInFrames], [0, 1], {
    easing: EASE_IN_OUT,
  });
  const lerp = (a: number, b: number) => a + (b - a) * t;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: `${lerp(from.x, to.x)}% ${lerp(from.y, to.y)}%`,
          transform: `scale(${lerp(from.scale, to.scale)})`,
        }}
      />
    </AbsoluteFill>
  );
};
