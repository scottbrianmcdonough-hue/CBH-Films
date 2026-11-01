import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { AbsoluteFill, Composition, useVideoConfig } from "remotion";

const FPS = 30;
const SLIDE_DURATION = 160;
const TRANSITION_DURATION = 15;

// 3 slides minus 2 overlapping fades = 450 frames = 15s at 30fps.
const DURATION_IN_FRAMES = 3 * SLIDE_DURATION - 2 * TRANSITION_DURATION;

export const MyComposition = () => {
  return (
    <Composition
      id="MyComp"
      component={MyComponent}
      durationInFrames={DURATION_IN_FRAMES}
      fps={FPS}
      width={1080}
      height={1920}
    />
  );
};

const Slide: React.FC<{ text: string }> = ({ text }) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0b0b0f",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          color: "white",
          fontFamily: "Helvetica, Arial, sans-serif",
          fontSize: 120,
          fontWeight: 700,
          textAlign: "center",
          padding: 80,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

export const MyComponent: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <TransitionSeries>
      <TransitionSeries.Sequence
        durationInFrames={SLIDE_DURATION}
        premountFor={fps}
      >
        <Slide text="Slide one" />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
      />
      <TransitionSeries.Sequence
        durationInFrames={SLIDE_DURATION}
        premountFor={fps}
      >
        <Slide text="Slide two" />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
      />
      <TransitionSeries.Sequence
        durationInFrames={SLIDE_DURATION}
        premountFor={fps}
      >
        <Slide text="Slide three" />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
