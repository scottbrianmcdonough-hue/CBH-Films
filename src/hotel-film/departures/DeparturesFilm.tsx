import { Audio, Video } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  random,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { FilmFinish } from "../components/FilmFinish";
import { colors, EASE_IN_OUT, EASE_OUT, progress, sans, serif } from "../theme";
import { FlapTurn, Word } from "./flaps";
import {
  layout,
  type DeparturesShot,
  type DeparturesSpec,
  type Face,
} from "./types";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
// Cosy autumn (Scott: "grade it cosy autumn"): warm, soft and golden, a little less
// contrast, under an amber glow and a soft vignette. Stock in the same palette, a touch
// quieter, so the hotels stay the warmest thing on screen.
const GRADE = {
  hotel:
    "sepia(0.38) hue-rotate(-16deg) saturate(1.12) contrast(0.96) brightness(0.96)",
  stock:
    "sepia(0.3) hue-rotate(-12deg) saturate(0.8) contrast(0.96) brightness(0.9)",
};
const GLOW = {
  hotel: "rgba(255,150,64,0.2)",
  stock: "rgba(255,150,64,0.12)",
};

type Status = { frame: number; row: number; text: string };

// The board, on the film's own clock (so it riffles in once, at the start, and is settled
// whenever it comes back): DEPARTURES in gold caps, then each row's time and status small
// on one line and the place large beneath. Statuses change by `status` (BOARDING in gold,
// DEPARTED dimmed), each change riffling from its frame.
const Board: React.FC<{ film: DeparturesSpec; status: Status[] }> = ({
  film,
  status,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      <div style={{ position: "absolute", left: 62, top: 470 }}>
        <div
          style={{
            fontFamily: sans,
            fontWeight: 600,
            fontSize: 44,
            letterSpacing: "0.34em",
            color: colors.gold,
            marginBottom: 46,
            opacity: progress(frame, 0, 16),
          }}
        >
          DEPARTURES
        </div>
        {film.rows.map((r, i) => {
          const s = 8 + i * 10;
          const now = status
            .filter((c) => c.row === i && c.frame <= frame)
            .pop();
          const text = now?.text ?? "ON TIME ";
          return (
            <div key={r.place} style={{ marginBottom: 44 }}>
              <div style={{ display: "flex", gap: 30, marginBottom: 12 }}>
                <Word
                  text={r.time}
                  len={5}
                  start={s}
                  w={38}
                  h={56}
                  gap={4}
                  seed={`t${i}`}
                  color={
                    text === "DEPARTED" ? "rgba(245,239,227,0.45)" : undefined
                  }
                />
                <Word
                  text={text}
                  len={8}
                  start={now ? now.frame : s + 10}
                  w={38}
                  h={56}
                  gap={4}
                  color={
                    text === "BOARDING"
                      ? colors.gold
                      : text === "DEPARTED"
                        ? "rgba(237,226,196,0.45)"
                        : colors.paleGold
                  }
                  seed={`s${i}-${text}`}
                />
              </div>
              <Word
                text={r.place}
                len={13}
                start={s + 4}
                w={68}
                h={104}
                gap={6}
                seed={`p${i}`}
                color={
                  text === "DEPARTED" ? "rgba(245,239,227,0.45)" : undefined
                }
              />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// A shot's picture: a still with the barely-there push, or live video. `poster` swaps a
// video for its still frame (in the flap turns).
const RawPicture: React.FC<{
  shot: DeparturesShot;
  frames: number;
  poster?: "in" | "out";
}> = ({ shot, frames, poster }) => {
  const frame = useCurrentFrame();
  const filter = GRADE[shot.side];
  if (shot.kind === "video") {
    const still =
      poster === "in"
        ? shot.posterIn
        : poster === "out"
          ? shot.posterOut
          : undefined;
    if (poster && still)
      return (
        <Img
          src={staticFile(still)}
          style={{ width: 1080, height: 1920, objectFit: "cover", filter }}
        />
      );
    return (
      <Video
        src={staticFile(shot.src)}
        trimBefore={Math.round(shot.from * 30)}
        muted
        objectFit="cover"
        style={{ width: "100%", height: "100%", filter }}
      />
    );
  }
  const [sw, sh] = shot.size;
  const ch = shot.crop.h ?? sh;
  const cw = (ch * 9) / 16;
  const cy = shot.crop.cy ?? sh / 2;
  const k = 1920 / ch;
  // in a turn the still holds its first (in) or last (out) frame of the push
  const t = poster === "in" ? 0 : poster === "out" ? 1 : frame / frames;
  const pan = shot.panTo !== undefined;
  // Scott: "faster motion on the stills": a clear push and a sideways drift, its
  // direction set by the photo so neighbouring shots differ
  const zoom = pan ? 1.04 : 1 + 0.12 * t;
  const drift = pan ? 0 : (random(shot.src) < 0.5 ? -1 : 1) * 40 * t;
  const cx = pan
    ? interpolate(t, [0, 1], [shot.crop.cx, shot.panTo!], {
        easing: EASE_IN_OUT,
      })
    : shot.crop.cx;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill
        style={{ transform: `translateX(${drift}px) scale(${zoom})` }}
      >
        <Img
          src={staticFile(shot.src)}
          style={{
            position: "absolute",
            width: sw * k,
            height: sh * k,
            left: -(cx - cw / 2) * k,
            top: -(cy - ch / 2) * k,
            filter,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// The picture in its grade: the amber glow in soft light and a soft vignette over it.
const Picture: React.FC<{
  shot: DeparturesShot;
  frames: number;
  poster?: "in" | "out";
}> = (props) => (
  <AbsoluteFill style={{ overflow: "hidden" }}>
    <RawPicture {...props} />
    <AbsoluteFill
      style={{ background: GLOW[props.shot.side], mixBlendMode: "soft-light" }}
    />
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 55%, rgba(30,16,6,0.35) 100%)",
      }}
    />
  </AbsoluteFill>
);

// The arrival label on a trip's first hotel shot: the place on small flaps and the hotel
// in cream Cormorant beneath ("\n" breaks a long name), over a soft shade, high in the
// frame.
const Label: React.FC<{ place: string; hotel: string }> = ({
  place,
  hotel,
}) => {
  const frame = useCurrentFrame();
  const start = 8;
  return (
    <>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(9,9,10,0.5) 0%, rgba(9,9,10,0.3) 24%, rgba(9,9,10,0) 40%)",
          opacity: progress(frame, start - 6, 14),
        }}
      />
      <div style={{ position: "absolute", left: 72, top: 280 }}>
        <Word
          text={place}
          len={place.length}
          start={start}
          w={44}
          h={64}
          gap={4}
          seed={`lab-${place}`}
        />
        <div
          style={{
            marginTop: 18,
            fontFamily: serif,
            fontSize: 76,
            color: colors.cream,
            textShadow: "0 3px 28px rgba(9,9,10,0.6)",
            opacity: progress(frame, start + 20, 16),
            transform: `translateY(${(1 - progress(frame, start + 20, 16, EASE_OUT)) * 20}px)`,
          }}
        >
          {hotel.split("\n").map((l) => (
            <div key={l}>{l}</div>
          ))}
        </div>
      </div>
    </>
  );
};

const EndBoard: React.FC<{ lines: [string, string]; start: number }> = ({
  lines,
  start,
}) => (
  <AbsoluteFill
    style={{
      backgroundColor: colors.black,
      alignItems: "center",
      justifyContent: "center",
      paddingBottom: 160,
      gap: 18,
    }}
  >
    <Word text={lines[0]} len={8} start={start} w={112} h={164} seed="e1" />
    <Word
      text={lines[1]}
      len={8}
      start={start + 8}
      w={112}
      h={164}
      seed="e2"
      color={colors.gold}
    />
  </AbsoluteFill>
);

export const DeparturesFilm: React.FC<{ film: DeparturesSpec }> = ({
  film,
}) => {
  const frame = useCurrentFrame();
  const { segs, status, frames } = layout(film);
  const endStart = segs.find((s) => s.kind === "end")!.from;
  const face = (f: Face) =>
    f.kind === "board" ? (
      <Board film={film} status={status} />
    ) : f.kind === "end" ? (
      <EndBoard lines={film.end.lines} start={endStart - 10} />
    ) : (
      <Picture shot={f.shot} frames={1} poster={f.at} />
    );
  // the flap sounds: a riffle as each row settles and at every status change and label,
  // a fuller cascade with every turn
  const riffles = [
    ...film.rows.map((_, i) => 12 + i * 10),
    ...status.map((s) => s.frame),
    ...segs.filter((s) => s.kind === "shot" && s.label).map((s) => s.from + 8),
    endStart - 10,
    endStart - 2,
  ];
  const turns = segs.filter((s) => s.kind === "turn").map((s) => s.from);
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      {film.music ? (
        <Audio
          src={staticFile(film.music.src)}
          trimBefore={film.music.startAt}
          volume={(f) =>
            film.music!.gain *
            interpolate(
              f,
              [frames - Math.round(4 * film.beat), frames],
              [1, 0],
              clamp,
            )
          }
        />
      ) : null}
      {riffles.map((at, i) => (
        <Sequence key={`r${i}`} from={at} durationInFrames={20}>
          <Audio
            src={staticFile("campaigns/departures/flap-riffle.wav")}
            volume={1}
          />
        </Sequence>
      ))}
      {turns.map((at) => (
        <Sequence key={`t${at}`} from={at} durationInFrames={34}>
          <Audio
            src={staticFile("campaigns/departures/flap-turn.wav")}
            volume={1}
          />
        </Sequence>
      ))}
      {segs.map((s) => {
        if (s.kind === "board")
          return frame >= s.from && frame < s.to ? (
            <Board key={`b${s.from}`} film={film} status={status} />
          ) : null;
        if (s.kind === "turn")
          return frame >= s.from && frame < s.to ? (
            <FlapTurn
              key={`t${s.from}`}
              start={s.from}
              front={face(s.front)}
              back={face(s.back)}
            />
          ) : null;
        if (s.kind === "end")
          return frame >= s.from ? (
            <EndBoard key="end" lines={film.end.lines} start={s.from - 10} />
          ) : null;
        return (
          <Sequence
            key={`s${s.from}`}
            from={s.from}
            durationInFrames={s.to - s.from}
          >
            <Picture shot={s.shot} frames={s.to - s.from} />
            {s.label ? <Label {...s.label} /> : null}
          </Sequence>
        );
      })}
      <Img
        src={staticFile("brand/cb-watermark.png")}
        style={{
          position: "absolute",
          left: 920,
          top: 1452,
          width: 100,
          height: 108,
        }}
      />
      <FilmFinish />
    </AbsoluteFill>
  );
};
