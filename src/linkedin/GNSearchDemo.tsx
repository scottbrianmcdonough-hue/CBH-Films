import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { c, MARGIN, ramp, rise, sans, serif } from "./GNStats";

// "Be the hotel AI recommends" (Scott: after GN's article on it; he liked the AI search page
// but found the first UI demo hard to follow, so this one is one idea a beat, each beat named
// by a short line over the page): a traveller asks an AI assistant where to stay; it writes
// its answer and gives a shortlist of three hotels; one lights up in lime, the top pick, and
// the thumb taps it; the page draws back to the line. The pick is Crown Quarter, GN's own hotel
// in Wexford (it was "Your hotel"; Scott: the audience isn't all hoteliers, so name a hotel);
// the other two stay unnamed, and there are no figures. 4:5, silent, like the other GN videos.

export const GN_SEARCH_FRAMES = 450;

const QUESTION = "Where should I stay in Wexford this weekend?";
const CARD = { x: 90, y: 300, w: 900, h: 900 };
const TYPE_FROM = 30;
const TYPE_EVERY = 1.5; // frames a letter
const SENT = Math.round(TYPE_FROM + QUESTION.length * TYPE_EVERY) + 10;
const ANSWER = SENT + 10; // the answer starts writing
const LIST = ANSWER + 44; // the shortlist comes in
const PICK = LIST + 50; // one card lights up
const TAP = PICK + 34; // the thumb taps it
const BACK = TAP + 40; // the page draws back, the line lands
const io = Easing.inOut(Easing.cubic);

const navy = (a: number) => `rgba(25,43,64,${a})`;
const lime = (a: number) => `rgba(169,186,29,${a})`;

const Bar: React.FC<{
  w: number;
  h?: number;
  a?: number;
  style?: React.CSSProperties;
}> = ({ w, h = 20, a = 0.12, style }) => (
  <div
    style={{
      width: w,
      height: h,
      borderRadius: h / 2,
      background: navy(a),
      ...style,
    }}
  />
);

const Sparkle: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path
      d="M12 1 C13 8 16 11 23 12 C16 13 13 16 12 23 C11 16 8 13 1 12 C8 11 11 8 12 1 Z"
      fill={c.lime}
    />
  </svg>
);

// the line over the page, one for each beat
const BEATS: { from: number; to: number; text: string }[] = [
  { from: 8, to: SENT + 4, text: "Travellers ask AI where to stay" },
  { from: SENT + 8, to: PICK - 4, text: "It answers with a shortlist" },
  { from: PICK, to: BACK, text: "And picks one" },
];

export const GNSearchDemo: React.FC = () => {
  // frame one is the finished end card (LinkedIn previews the first frame, which was empty navy),
  // then the film plays from the start
  const now = useCurrentFrame();
  const frame = now === 0 ? GN_SEARCH_FRAMES - 1 : now;
  const intro = ramp(frame, 4, 22);
  const typed = Math.max(
    0,
    Math.min(QUESTION.length, Math.floor((frame - TYPE_FROM) / TYPE_EVERY)),
  );
  const caretOn =
    frame < SENT &&
    (Math.floor(frame / 15) % 2 === 0 || typed < QUESTION.length);
  // the question, once sent, becomes a bubble at the top of the chat
  const sent = ramp(frame, SENT, 14, io);
  const pick = ramp(frame, PICK, 16, io);
  const tap = ramp(frame, TAP - 4, 4) * (1 - ramp(frame, TAP + 2, 8));
  const back = ramp(frame, BACK, 26, io);
  const thumbIn = ramp(frame, PICK + 6, 22, io);
  const thumbOut = ramp(frame, TAP + 14, 12);
  const line = ramp(frame, BACK + 12, 22);

  // the shortlist: three hotels, the middle one ours
  const LIST_TOP = 470;
  const CARD_H = 108;
  const pickCard = { x: CARD.x + 40, y: CARD.y + LIST_TOP + (CARD_H + 18) * 1 };
  const thumb = {
    x: interpolate(thumbIn, [0, 1], [1010, pickCard.x + 640]),
    y: interpolate(thumbIn, [0, 1], [1300, pickCard.y + CARD_H / 2]),
  };

  return (
    <AbsoluteFill>
      {/* GN navy with a soft light behind the page (Scott: not the white card background with
          the silver bars, "switch it up to the navy") */}
      <AbsoluteFill style={{ backgroundColor: "#152C3D" }} />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 900px 760px at 560px 720px, rgba(70,110,150,0.45) 0%, rgba(40,70,100,0.18) 50%, rgba(21,44,61,0) 80%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 64,
          left: MARGIN,
          display: "flex",
          alignItems: "center",
          gap: 22,
          ...rise(frame, 2, 16),
        }}
      >
        <Img
          src={staticFile("brand/gn-badge.png")}
          style={{ width: 76, height: 76 }}
        />
        <span
          style={{
            fontFamily: sans,
            fontWeight: 600,
            fontSize: 36,
            color: "#FFFFFF",
          }}
        >
          Great National Group
        </span>
      </div>
      {/* the line over the page */}
      {BEATS.map((b) => {
        const o = ramp(frame, b.from, 12) * (1 - ramp(frame, b.to - 8, 8));
        return (
          <div
            key={b.text}
            style={{
              position: "absolute",
              left: MARGIN,
              top: 200,
              fontFamily: sans,
              fontWeight: 600,
              fontSize: 44,
              color: "#FFFFFF",
              opacity: o * (1 - back),
              transform: `translateY(${(1 - ramp(frame, b.from, 12)) * 16}px)`,
            }}
          >
            {b.text}
          </div>
        );
      })}
      {/* the assistant */}
      <div
        style={{
          position: "absolute",
          left: CARD.x,
          top: CARD.y,
          width: CARD.w,
          height: CARD.h,
          borderRadius: 40,
          background: "#FFFFFF",
          boxShadow:
            "0 40px 100px rgba(0,0,0,0.45), 0 6px 18px rgba(0,0,0,0.2)",
          overflow: "hidden",
          transformOrigin: "50% 0%",
          transform: `translateY(${(1 - intro) * 40 - 120 * back}px) scale(${1 - 0.42 * back})`,
          opacity: intro * (1 - 0.15 * back),
        }}
      >
        {/* the question: typed in the box, then sent up as a bubble */}
        <div
          style={{
            position: "absolute",
            right: 40,
            top: interpolate(sent, [0, 1], [CARD.h - 140, 40]),
            maxWidth: interpolate(sent, [0, 1], [CARD.w - 80, 640]),
            minWidth: interpolate(sent, [0, 1], [CARD.w - 80, 0]),
            padding: "24px 30px",
            borderRadius: 30,
            background: sent > 0.5 ? c.navy : "#F1F3F5",
            border: `2px solid ${sent > 0.5 ? c.navy : navy(frame >= TYPE_FROM - 6 ? 0.3 : 0.08)}`,
            fontFamily: sans,
            fontSize: 34,
            lineHeight: 1.3,
            color: sent > 0.5 ? "#FFFFFF" : c.text,
          }}
        >
          {QUESTION.slice(0, typed)}
          <span
            style={{
              display: "inline-block",
              width: 3,
              height: 38,
              marginLeft: 2,
              verticalAlign: "middle",
              background: c.navy,
              opacity: caretOn ? 1 : 0,
            }}
          />
        </div>
        {/* the answer */}
        {frame >= ANSWER ? (
          <div style={{ position: "absolute", left: 40, right: 40, top: 230 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                ...rise(frame, ANSWER, 10),
              }}
            >
              <Sparkle size={36} />
              <span
                style={{
                  fontFamily: sans,
                  fontWeight: 700,
                  fontSize: 30,
                  color: c.navy,
                }}
              >
                AI answer
              </span>
            </div>
            {[1, 0.92, 0.7].map((w, i) => {
              const show = ramp(frame, ANSWER + 10 + i * 8, 12);
              return (
                <Bar
                  key={i}
                  w={(CARD.w - 80) * w * show}
                  h={22}
                  a={0.12}
                  style={{ marginTop: i === 0 ? 30 : 18 }}
                />
              );
            })}
          </div>
        ) : null}
        {/* the shortlist */}
        {[0, 1, 2].map((k) => {
          const show = ramp(frame, LIST + k * 8, 14);
          const ours = k === 1;
          const dim = ours ? 0 : pick;
          const glow = ours ? pick : 0;
          return (
            <div
              key={k}
              style={{
                position: "absolute",
                left: 40,
                right: 40,
                top: LIST_TOP + k * (CARD_H + 18),
                height: CARD_H,
                borderRadius: 24,
                background: ours ? `rgba(244,247,226,${glow})` : "#FFFFFF",
                border: `${ours ? 2 + 2 * glow : 2}px solid ${ours && glow > 0 ? lime(0.4 + 0.6 * glow) : navy(0.1)}`,
                display: "flex",
                alignItems: "center",
                gap: 24,
                padding: "0 24px",
                opacity: show * (1 - 0.6 * dim),
                transform: `translateY(${(1 - show) * 20}px) scale(${1 + 0.03 * glow - 0.02 * tap})`,
                boxShadow: ours
                  ? `0 ${12 * glow}px ${30 * glow}px rgba(25,43,64,${0.12 * glow})`
                  : "none",
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 16,
                  flexShrink: 0,
                  background: ours
                    ? "linear-gradient(135deg, #1F3550 0%, #2E4A68 60%, #6E7F3A 100%)"
                    : "linear-gradient(135deg, #D9DEE4 0%, #C9D0D8 100%)",
                }}
              />
              <div style={{ flex: 1 }}>
                {ours ? (
                  <div style={{ position: "relative", height: 36 }}>
                    <Bar
                      w={300}
                      h={24}
                      a={0.4}
                      style={{
                        position: "absolute",
                        top: 6,
                        opacity: 1 - glow,
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: -2,
                        fontFamily: sans,
                        fontWeight: 700,
                        fontSize: 32,
                        color: c.navy,
                        opacity: glow,
                      }}
                    >
                      Crown Quarter
                    </div>
                  </div>
                ) : (
                  <Bar
                    w={[340, 0, 290][k]}
                    h={24}
                    a={0.4}
                    style={{ marginTop: 6, marginBottom: 6 }}
                  />
                )}
                <Bar
                  w={[200, 230, 180][k]}
                  h={16}
                  a={0.12}
                  style={{ marginTop: 12 }}
                />
              </div>
              {ours ? (
                <div
                  style={{
                    fontFamily: sans,
                    fontWeight: 700,
                    fontSize: 26,
                    color: c.navy,
                    background: c.lime,
                    padding: "6px 18px",
                    borderRadius: 26,
                    opacity: glow,
                    transform: `scale(${0.6 + 0.4 * ramp(frame, PICK + 6, 14, Easing.out(Easing.back(2)))})`,
                  }}
                >
                  Top pick
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      {/* the thumb */}
      <div
        style={{
          position: "absolute",
          left: thumb.x - 36,
          top: thumb.y - 36,
          width: 72,
          height: 72,
          borderRadius: 36,
          border: `3px solid ${c.lime}`,
          background: lime(0.18 + 0.2 * tap),
          boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
          transform: `scale(${1 - 0.14 * tap})`,
          opacity: thumbIn * (1 - thumbOut),
        }}
      />
      {/* the line */}
      <div
        style={{
          position: "absolute",
          left: MARGIN,
          top: 900,
          fontFamily: serif,
          fontWeight: 700,
          fontSize: 92,
          lineHeight: 1.08,
          color: "#FFFFFF",
        }}
      >
        <div
          style={{
            opacity: line,
            transform: `translateY(${(1 - line) * 24}px)`,
          }}
        >
          Be the hotel
        </div>
        <div
          style={{
            display: "inline-block",
            opacity: ramp(frame, BACK + 18, 22),
            transform: `translateY(${(1 - ramp(frame, BACK + 18, 22)) * 24}px)`,
          }}
        >
          AI recommends
          {/* the lime rule the full width of the line (it stopped short at a fixed 470px) */}
          <div
            style={{
              marginTop: 14,
              height: 12,
              width: `${100 * ramp(frame, BACK + 30, 22, io)}%`,
              backgroundColor: c.lime,
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
