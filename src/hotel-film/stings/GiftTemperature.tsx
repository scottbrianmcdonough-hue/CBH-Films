import { Audio } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { colors, EASE_IN_OUT, EASE_OUT, progress, sans, serif } from "../theme";

// The temperature gift voucher Story (Scott, 19 Nov: a new one for TikTok, "yeah"). A phone weather card over rain on a
// window reads OUTSIDE 3° (counting down from 9), the gift voucher rises in, then on every bar a warmer shot with the
// reading counting up: by the fire 22°, the pool 30°, the hot tub 38°, the bath 40°, under the duvet "Just right"; the
// end card "Give them somewhere / warmer this Christmas", the white CB in the corner, no gold rule. The readings are
// playful, not claims. Music: Happy Cheerful Folk Pop by emmraan (Pixabay 264393, not Content ID registered, Scott),
// from beat 64 (32.09s) where the band steps up, a beat every 15 frames (120 BPM), a bar every 60.
const B = 15;
const at = (beat: number) => beat * B;
export const GIFT_TEMPERATURE_FRAMES = at(36);

type Shot = { src: string; from: number; label: string; value: number | string };
const SHOTS: Shot[] = [
  { src: "hotels/gisborough-hall/screen-time/fireplace.mp4", from: 8, label: "By the fire", value: 22 },
  { src: "hotels/rowton-hall/screen-time/pool-4s.mp4", from: 12, label: "The pool", value: 30 },
  { src: "hotels/ruthin-castle/hot-tub.mp4", from: 16, label: "The hot tub", value: 38 },
  { src: "hotels/rutland-hall/spa-baths.mp4", from: 20, label: "The bath", value: 40 },
  { src: "hotels/gisborough-hall/screen-time/bedroom.mp4", from: 24, label: "Under the duvet", value: "Just right" },
];
const END = 28;

const shade = "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 26%, rgba(0,0,0,0) 42%)";

// The weather card: gold caps label, the reading in cream Cormorant, a small line under it
const Reading: React.FC<{ label: string; value: string; sub?: string; enter: number }> = ({ label, value, sub, enter }) => {
  const frame = useCurrentFrame();
  const a = progress(frame, enter, 12, EASE_OUT);
  return (
    <div style={{ position: "absolute", left: 84, top: 270, color: colors.cream, opacity: a, transform: `translateY(${(1 - a) * 24}px)` }}>
      <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 30, letterSpacing: "0.28em", color: colors.gold, textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ fontFamily: serif, fontWeight: 400, fontSize: value.length > 4 ? 150 : 250, lineHeight: 1, marginTop: value.length > 4 ? 24 : 6, textShadow: "0 4px 30px rgba(0,0,0,0.45)" }}>
        {value}
      </div>
      {sub ? <div style={{ fontFamily: serif, fontStyle: "italic", fontSize: 58, marginTop: 26, textShadow: "0 3px 20px rgba(0,0,0,0.5)" }}>{sub}</div> : null}
    </div>
  );
};

// a number that counts from `from` to `to` over `dur` frames, starting at `start`
const count = (frame: number, start: number, dur: number, from: number, to: number) =>
  Math.round(interpolate(frame, [start, start + dur], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IN_OUT }));

export const GiftTemperature: React.FC = () => {
  const frame = useCurrentFrame();
  const voucher = progress(frame, at(4), 18, EASE_OUT);
  const endIn = progress(frame, at(END) + 4, 18, EASE_OUT);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* outside: rain on the window, cold and grey */}
      <Sequence durationInFrames={at(8)}>
        <AbsoluteFill style={{ filter: "saturate(0.55) brightness(0.88) contrast(1.05)" }}>
          <OffthreadVideo src={staticFile("campaigns/november/stock/rain-window.mp4")} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </AbsoluteFill>
        <AbsoluteFill style={{ background: shade }} />
        <Reading label="Outside" value={`${count(frame, 6, 30, 9, 3)}°`} sub="Drizzle, all day" enter={2} />
        {/* the voucher rises in on the second bar */}
        <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 380 }}>
          <Img
            src={staticFile("campaigns/black-friday/gift-vouchers.png")}
            style={{ width: 920, opacity: voucher, transform: `translateY(${(1 - voucher) * 160}px) rotate(${(1 - voucher) * -6}deg)`, filter: "drop-shadow(0 30px 50px rgba(0,0,0,0.6))" }}
          />
        </AbsoluteFill>
      </Sequence>
      {/* inside: a warmer shot every bar, the reading counting up from the last */}
      {SHOTS.map((s, i) => {
        const start = at(s.from);
        const prev = i === 0 ? 3 : (SHOTS[i - 1].value as number);
        const value = typeof s.value === "number" ? `${count(frame, start + 2, 14, prev, s.value)}°` : s.value;
        return (
          <Sequence key={s.src} from={start} durationInFrames={at(4) + (i === SHOTS.length - 1 ? 8 : 0)}>
            <AbsoluteFill style={{ filter: "sepia(0.12) saturate(1.08) brightness(1.03)" }}>
              <OffthreadVideo src={staticFile(s.src)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </AbsoluteFill>
            <AbsoluteFill style={{ background: shade }} />
            <div style={{ position: "absolute", inset: 0 }}>
              <Reading label={s.label} value={value} enter={0} />
            </div>
          </Sequence>
        );
      })}
      {/* end card */}
      <Sequence from={at(END)}>
        <AbsoluteFill style={{ backgroundColor: "#000", opacity: progress(frame, at(END), 8, EASE_OUT), justifyContent: "center", alignItems: "center" }}>
          <div style={{ opacity: endIn, transform: `translateY(${(1 - endIn) * 26}px)`, textAlign: "center", color: colors.cream, fontFamily: serif, fontSize: 96, lineHeight: 1.12 }}>
            Give them somewhere
            <br />
            warmer this Christmas
          </div>
        </AbsoluteFill>
      </Sequence>
      <Img src={staticFile("brand/cb-watermark.png")} style={{ position: "absolute", width: 100, right: 76, bottom: 470, opacity: 0.9 }} />
      <Audio
        src={staticFile("music/emmraan-happy-cheerful-folk-pop-264393.mp3")}
        trimBefore={Math.round(32.09 * 30)}
        volume={(f) => 0.39 * interpolate(f, [0, 4, GIFT_TEMPERATURE_FRAMES - 30, GIFT_TEMPERATURE_FRAMES], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      />
    </AbsoluteFill>
  );
};
