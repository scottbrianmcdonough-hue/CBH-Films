import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FilmFinish } from "../components/FilmFinish";
import { colors, EASE_IN_OUT, EASE_OUT, progress, sans } from "../theme";
import { B, Caret, caps, Cuts, EndCard, FEST, G, KF, Mark, Music, typed } from "./common";

// "Out of office" (draft): the automatic replies panel everyone fills in the last week before Christmas, in the
// CBH black and gold. "Thanks for your email. I'm out of the office from 23 December," then on the downbeat the
// panel drops into a card and the reply carries on over the hotels, a line a shot, two beats each: a log fire, a
// long bath (held through the band's stop, the caret blinking), a very tall tree, crackers at dinner, swapping
// presents, Hintlesham lit up for "I'll reply in January." The toggle switches on in gold, then the end card.
export const OOO_FRAMES = B(31);

const OPEN = [
  { at: 1, text: "Thanks for your email." },
  { at: 4, text: "I'm out of the office from 23 December," },
];
const LINES = [
  { at: 8, text: "somewhere with a log fire.", shot: { src: KF + "fire.mp4" } },
  { at: 10, text: "Running a long bath.", shot: { src: FEST + "treehouse-bath.mp4" } },
  { at: 12, text: "Under a very tall tree.", shot: { src: FEST + "ramside-tree.mp4" } },
  { at: 14, text: "Pulling crackers at dinner.", shot: { src: G + "fairlawns-crackers.jpg", pos: "62% 50%" } },
  { at: 16, text: "Swapping presents.", shot: { src: G + "donnington-santa.jpg", pos: "35% 50%" } },
  { at: 18, text: "I'll reply in January.", shot: { src: G + "hintlesham-hall-exterior.jpg", pos: "45% 50%" } },
];
const ON = 21; // the toggle switches on
const END = 24;

const Toggle: React.FC<{ on: number }> = ({ on }) => (
  <div style={{ width: 96, height: 52, borderRadius: 26, background: on > 0.5 ? colors.gold : "#3A3A3E", position: "relative" }}>
    <div style={{ position: "absolute", top: 5, left: 5 + on * 44, width: 42, height: 42, borderRadius: 21, background: colors.cream }} />
  </div>
);

export const OutOfOffice: React.FC = () => {
  const frame = useCurrentFrame();
  const drop = progress(frame, B(8) - 6, 12, EASE_IN_OUT); // the panel drops into a card on the downbeat
  const on = progress(frame, B(ON), 8, EASE_OUT);
  const lift = progress(frame, B(ON) - 10, 14, EASE_IN_OUT); // the card rises to the middle for the switch
  const intro = progress(frame, 0, 14, EASE_OUT);
  const line = [...LINES].reverse().find((l) => frame >= B(l.at));
  const prev = line ? LINES[LINES.indexOf(line) - 1] : undefined;

  // the panel: full screen at first, then a card low in the frame (clear of the bottom 470px)
  const top = interpolate(drop, [0, 1], [470, 1010]) - lift * 380;
  const height = interpolate(drop, [0, 1], [700, 400]);
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      <Cuts list={LINES.map((l) => ({ ...l.shot, at: l.at }))} until={END} />
      <AbsoluteFill style={{ background: `linear-gradient(to bottom, rgba(9,9,10,0) 40%, rgba(9,9,10,${0.55 * drop}) 75%)` }} />
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          top,
          height,
          opacity: intro,
          borderRadius: 28,
          background: `rgba(24,24,26,${interpolate(drop, [0, 1], [1, 0.88])})`,
          border: "1px solid rgba(195,158,85,0.35)",
          boxShadow: `0 30px 80px rgba(0,0,0,${0.5 * drop})`,
          padding: "48px 56px",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={caps(24, colors.gold)}>Automatic replies</div>
            <div style={{ height: 2, background: colors.gold, marginTop: 10, width: 330 }} />
          </div>
          <Toggle on={on} />
        </div>
        <div style={{ fontFamily: sans, fontSize: 28, color: "rgba(245,239,227,0.6)", marginTop: 22 }}>
          {on > 0.5 ? "On" : "Off"} · Wed 23 Dec to Mon 4 Jan
        </div>
        {/* the opening lines, then the line being written over the shots */}
        <div style={{ fontFamily: sans, fontSize: 44, lineHeight: 1.45, color: colors.cream, marginTop: 56 * (1 - drop) + 30 }}>
          {drop < 1 ? (
            OPEN.map((o, k) => (
              <div key={k} style={{ opacity: 1 - drop }}>
                {typed(o.text, frame, B(o.at))}
                {frame < B(8) && (k === 1 ? frame >= B(o.at) : frame < B(OPEN[1].at)) ? <Caret /> : null}
              </div>
            ))
          ) : null}
          {line ? (
            <>
              <div style={{ fontSize: 30, color: "rgba(245,239,227,0.5)", minHeight: 44 }}>{prev ? prev.text : OPEN[1].text}</div>
              <div>
                {typed(line.text, frame, B(line.at) + 2)}
                <Caret on={frame < B(ON)} />
              </div>
            </>
          ) : null}
        </div>
      </div>
      <Mark />
      <FilmFinish />
      <EndCard at={B(END)} line1="Out of office," line2="by the fire" sub="Christmas and New Year breaks" />
      <Music len={OOO_FRAMES} />
    </AbsoluteFill>
  );
};
