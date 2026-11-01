import { Audio, Video } from "@remotion/media";
import {
  AbsoluteFill,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { FilmFinish } from "../components/FilmFinish";
import { EndCard } from "../footage/FootageFilm";
import { colors, EASE_IN_OUT, EASE_OUT, progress, sans, serif } from "../theme";
import { endCardStart, type MatchCutSpec, type MatchPlate } from "./types";

// The top text block, left-aligned and clear of the top safe zone: the opening line (first
// plate only) above the hotel name and location. Each line rises from behind its own
// baseline (a masked rise, a few frames apart) as the plate settles out of its spin, then
// holds still to be read, and cuts with its plate.
const LINE_TOP = 250;
const LABEL_TOP = 372;

const Scrim: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "linear-gradient(to bottom, rgba(9,9,10,0.72) 0%, rgba(9,9,10,0.6) 16%, rgba(9,9,10,0.38) 25%, rgba(9,9,10,0) 36%)",
    }}
  />
);

const RISE = 9; // frames for a line to rise into place
const STAGGER = 4; // frames between lines

// One line rising out of its own mask from frame `at` (padded so descenders, italic
// overhang and the soft shadow aren't clipped by the mask).
// With `out`, it carries on up out of the mask over the plate's whip out, from that frame.
const Rise: React.FC<{
  at: number;
  out?: number;
  children: React.ReactNode;
}> = ({ at, out, children }) => {
  const frame = useCurrentFrame();
  // Rises up into place, then carries on up and out.
  const rise = progress(frame, at, RISE, EASE_OUT);
  const exit = out === undefined ? 0 : progress(frame, out, 5, EASE_IN_OUT);
  return (
    <div
      style={{
        overflow: "hidden",
        padding: "0 40px 0.18em 0",
        marginBottom: "-0.18em",
      }}
    >
      <div
        style={{ transform: `translateY(${(1 - rise) * 115 - exit * 145}%)` }}
      >
        {children}
      </div>
    </div>
  );
};

const OpeningLine: React.FC<{ line: string; out?: number }> = ({
  line,
  out,
}) => (
  <div style={{ position: "absolute", left: 72, top: LINE_TOP }}>
    <Rise at={2} out={out}>
      <div
        style={{
          fontFamily: serif,
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: 96,
          lineHeight: 1,
          color: colors.cream,
          whiteSpace: "nowrap",
          textShadow: "0 2px 26px rgba(9,9,10,0.6)",
        }}
      >
        {line}
      </div>
    </Rise>
  </div>
);

const Label: React.FC<{ plate: MatchPlate; at: number; out?: number }> = ({
  plate,
  at,
  out,
}) => (
  <div style={{ position: "absolute", left: 72, top: LABEL_TOP }}>
    {plate.hotel.map((line, n) => (
      <Rise key={line} at={at + n * STAGGER} out={out}>
        <div
          style={{
            fontFamily: serif,
            fontWeight: 500,
            fontSize: 56,
            lineHeight: 1.06,
            color: colors.cream,
            whiteSpace: "nowrap",
            textShadow: "0 2px 18px rgba(9,9,10,0.7)",
          }}
        >
          {line}
        </div>
      </Rise>
    ))}
    <div style={{ marginTop: 14 }}>
      <Rise at={at + plate.hotel.length * STAGGER} out={out}>
        <div
          style={{
            fontFamily: sans,
            fontWeight: 700,
            fontSize: 25,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: colors.lightGold,
            whiteSpace: "nowrap",
            textShadow: "0 2px 14px rgba(9,9,10,0.8)",
          }}
        >
          {plate.location}
        </div>
      </Rise>
    </div>
  </div>
);

export const MatchCutFilm: React.FC<{ film: MatchCutSpec }> = ({ film }) => {
  const { cuts, plates, music } = film;
  const end = endCardStart(film);
  const total = film.durationInFrames;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      <Audio
        src={staticFile(music.src)}
        trimBefore={music.startAt}
        volume={(fr) =>
          music.gain *
          interpolate(fr, [music.fadeFrom, total], [1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />
      {plates.map((plate, i) => (
        <Sequence
          key={plate.src}
          from={cuts[i]}
          durationInFrames={cuts[i + 1] - cuts[i]}
        >
          <AbsoluteFill style={{ backgroundColor: colors.black }}>
            <Video
              src={staticFile(plate.clip)}
              muted
              style={{ width: "100%", height: "100%" }}
            />
          </AbsoluteFill>
          {plate.flick ? null : (
            <>
              <Scrim />
              {i === 0 ? (
                <OpeningLine
                  line={film.opening.line}
                  out={cuts[1] - cuts[0] - film.spin.frames}
                />
              ) : null}
              {/* Lands as the plate settles out of its spin (after the opening line on
                  the first plate), and lifts away over the last spin's worth of
                  frames, as the plate whips out. */}
              <Label
                plate={plate}
                at={i === 0 ? 2 + 2 * STAGGER : film.spin.frames - 1}
                out={cuts[i + 1] - cuts[i] - film.spin.frames}
              />
            </>
          )}
        </Sequence>
      ))}
      <Sequence from={end} durationInFrames={total - end}>
        <EndCard
          lines={film.endCard.lines}
          location={film.endCard.sub}
          logo="cb-shimmer"
          rule={false}
          delay={0}
        />
      </Sequence>
      {/* Steady: one still image over every plate, never re-mounted per shot. */}
      <Sequence durationInFrames={end}>
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
      <FilmFinish />
    </AbsoluteFill>
  );
};
