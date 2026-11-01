import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { FilmFinish } from "../components/FilmFinish";
import { Word } from "../departures/flaps";
import { colors, progress, sans } from "../theme";

// "Where next?", a brand moment (Scott: "a whole new take ... like these new logo moments"):
// the Departures board in black and gold, the collection's towns riffling in, every row
// going to BOARDING, then the place flaps riffle once more and settle on WHERE / NEXT?;
// the board gives way to the official logo and its shimmer. A silent mock-up for now.

export const WHERE_NEXT_FRAMES = 360;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ROWS = [
  { time: "09:05", place: "KESWICK" },
  { time: "09:20", place: "WAKEFIELD" },
  { time: "09:40", place: "WINDERMERE" },
  { time: "10:15", place: "RUTHIN" },
  { time: "10:30", place: "WOLVERHAMPTON" },
  { time: "11:00", place: "PITLOCHRY" },
];
const BOARDING = 120; // the rows flip to BOARDING, one after another
const MESSAGE = 190; // the place flaps riffle again, settling on the message
const MESSAGE_ROWS: Record<number, string> = { 2: "WHERE", 3: "NEXT?" };
const OUT = [262, 292]; // the board dims away
const LOGO_IN = [282, 312];
const SHIMMER = 316;

const VB: [number, number] = [534.25, 655.69];
const LOGO_W = 640;

export const WhereNext: React.FC = () => {
  const frame = useCurrentFrame();
  const board = 1 - interpolate(frame, OUT, [0, 1], clamp);
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
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      <AbsoluteFill style={{ opacity: board }}>
        <div style={{ position: "absolute", left: 62, top: 300 }}>
          <div
            style={{
              fontFamily: sans,
              fontWeight: 600,
              fontSize: 40,
              letterSpacing: "0.34em",
              color: colors.gold,
              marginBottom: 40,
              opacity: progress(frame, 0, 16),
            }}
          >
            DEPARTURES
          </div>
          {ROWS.map((r, i) => {
            const s = 8 + i * 9;
            const boarding = frame >= BOARDING + i * 6;
            const msg = frame >= MESSAGE + i * 5;
            const place = msg ? (MESSAGE_ROWS[i] ?? "") : r.place;
            const status = msg ? "" : boarding ? "BOARDING" : "ON TIME ";
            const time = msg ? "" : r.time;
            return (
              <div key={r.place} style={{ marginBottom: 30 }}>
                <div style={{ display: "flex", gap: 26, marginBottom: 10 }}>
                  <Word
                    key={`t${msg}`}
                    text={time}
                    len={5}
                    start={msg ? MESSAGE + i * 5 : s}
                    w={34}
                    h={50}
                    gap={4}
                    seed={`t${i}${msg}`}
                  />
                  <Word
                    key={status}
                    text={status}
                    len={8}
                    start={
                      msg
                        ? MESSAGE + i * 5
                        : boarding
                          ? BOARDING + i * 6
                          : s + 10
                    }
                    w={34}
                    h={50}
                    gap={4}
                    color={
                      status === "BOARDING" ? colors.gold : colors.paleGold
                    }
                    seed={`s${i}-${status}`}
                  />
                </div>
                <Word
                  key={`p${msg}`}
                  text={place}
                  len={13}
                  start={msg ? MESSAGE + i * 5 : s + 4}
                  w={62}
                  h={92}
                  gap={6}
                  seed={`p${i}${msg}`}
                  color={undefined}
                />
              </div>
            );
          })}
        </div>
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
