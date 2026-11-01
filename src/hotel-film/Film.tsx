import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FilmFinish } from "./components/FilmFinish";
import { Fizz } from "./components/Fizz";
import { PhotoScene } from "./components/PhotoScene";
import { ApertureIntro } from "./components/ApertureIntro";
import { SliceIntro } from "./components/SliceIntro";
import { WordIntro } from "./components/WordIntro";
import { EndCard } from "./scenes/EndCard";
import { Triptych } from "./scenes/Triptych";
import { colors } from "./theme";
import {
  archReveal,
  cover,
  parallaxRise,
  seamWipe,
  splitOpen,
} from "./transitions";
import {
  sceneDurations,
  type FilmSpec,
  type SceneSpec,
  type TransitionSpec,
} from "./types";

// The first frames fade up from black so the opening shot doesn't start abruptly.
const FadeUp: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 12], [1, 0], {
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{ backgroundColor: colors.black, opacity }} />;
};

const renderScene = (scene: SceneSpec, film: FilmSpec) => {
  switch (scene.kind) {
    case "photo":
      return (
        <PhotoScene
          src={scene.src}
          from={scene.from}
          to={scene.to}
          eyebrow={scene.eyebrow}
          lines={scene.lines}
          position={scene.position}
          captionDelay={scene.captionDelay}
          framed={scene.framed}
          overlay={
            scene.overlay === "fizz" ? (
              <Fizz
                seed="fizz"
                count={90}
                size={[4, 22]}
                speed={[1.5, 4.5]}
                color="255,234,186"
                fadeAbove={0.28}
              />
            ) : null
          }
        />
      );
    case "triptych":
      return <Triptych spec={scene} />;
    case "end":
      return <EndCard hotel={film.hotel} logo={!film.watermark} />;
  }
};

const EASE = Easing.bezier(0.65, 0, 0.35, 1);

const renderTransition = (t: TransitionSpec, key: string) => {
  const timing = (easing: (n: number) => number) =>
    linearTiming({ durationInFrames: t.frames, easing });
  switch (t.kind) {
    case "fade":
      return (
        <TransitionSeries.Transition
          key={key}
          presentation={fade()}
          timing={timing(EASE)}
        />
      );
    case "cover":
      return (
        <TransitionSeries.Transition
          key={key}
          presentation={cover()}
          timing={timing((n) => n)}
        />
      );
    case "arch":
      // A gentler curve so the arch shape lingers mid-transition.
      return (
        <TransitionSeries.Transition
          key={key}
          presentation={archReveal()}
          timing={timing(Easing.bezier(0.33, 0, 0.67, 1))}
        />
      );
    case "rise":
      return (
        <TransitionSeries.Transition
          key={key}
          presentation={parallaxRise()}
          timing={timing(EASE)}
        />
      );
    case "seam":
      return (
        <TransitionSeries.Transition
          key={key}
          presentation={seamWipe()}
          timing={timing(EASE)}
        />
      );
    case "split":
      return (
        <TransitionSeries.Transition
          key={key}
          presentation={splitOpen()}
          timing={timing(EASE)}
        />
      );
  }
};

export const Film: React.FC<{ film: FilmSpec }> = ({ film }) => {
  const { fps } = useVideoConfig();
  const durations = sceneDurations(film);

  return (
    <>
      <Audio
        src={staticFile(film.music.src)}
        trimBefore={film.music.startAt}
        volume={(f) =>
          (film.music.gain ?? 1) *
          interpolate(f, [film.music.fadeFrom, film.durationInFrames], [1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />
      <TransitionSeries>
        {film.scenes.flatMap((scene, i) => {
          const items = [
            <TransitionSeries.Sequence
              key={`scene-${i}`}
              durationInFrames={durations[i]}
              premountFor={fps}
            >
              {i === 0 && film.slices ? (
                <SliceIntro land={film.slices.land}>
                  {renderScene(scene, film)}
                </SliceIntro>
              ) : (
                renderScene(scene, film)
              )}
            </TransitionSeries.Sequence>,
          ];
          const t = film.transitions[i];
          if (t) items.push(renderTransition(t, `transition-${i}`));
          return items;
        })}
      </TransitionSeries>
      {film.intro ? <WordIntro {...film.intro} /> : null}
      {film.aperture ? <ApertureIntro land={film.aperture.land} /> : null}
      {film.watermark ? (
        // Off before the end card arrives (the last cut, minus half its transition).
        <Sequence
          durationInFrames={
            film.cuts[film.cuts.length - 1] -
            film.transitions[film.transitions.length - 1].frames / 2
          }
        >
          <Img
            src={staticFile(film.watermark.src)}
            style={{
              position: "absolute",
              left: film.watermark.x,
              top: film.watermark.y,
              width: film.watermark.size[0],
              height: film.watermark.size[1],
            }}
          />
        </Sequence>
      ) : null}
      <FadeUp />
      <FilmFinish />
    </>
  );
};
