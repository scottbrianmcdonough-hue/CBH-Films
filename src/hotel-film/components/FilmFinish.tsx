import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

// Cinematic finish over the whole film: a soft vignette and fine, moving grain.
export const FilmFinish: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 85% 75% at 50% 50%, transparent 55%, rgba(0,0,0,0.38) 100%)",
        }}
      />
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", mixBlendMode: "overlay", opacity: 0.07 }}
      >
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves={2}
            seed={frame % 24}
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={width} height={height} filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};
