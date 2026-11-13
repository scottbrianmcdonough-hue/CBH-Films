import { Audio, Video } from "@remotion/media";
import { loadFont } from "@remotion/fonts";
import React from "react";
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
import { colors, progress, sans } from "../theme";

// "Chat": a reel told as a message thread, in CBH's own black and gold (never a real
// messaging app's look). Messages pop in at the foot of the thread and push the older ones
// up; one reply bubble opens out to fill the frame and becomes a run of real footage cut
// on the beat (each shot with its own little reply bubble where that bubble sat), then
// folds back into it, and the thread carries on to the gift and the end card.

export type ChatMessage = {
  at: number; // frame it pops in
  from: "them" | "me";
  text?: string;
  typing?: number; // a typing indicator, cleared at this frame
  voucher?: {
    src: string;
    size: [number, number];
    caption: string;
    title?: string;
  };
  stamp?: string; // a small centred time stamp ("Today")
  time?: string; // the time it was sent, small in the bubble's corner
};

type Still = { src: string; size: [number, number]; cx: number };

export type ChatShot = {
  at: number; // frame it cuts in (the first at the open)
  reply: string;
  tag?: string; // the hotel, small
  clip?: { src: string; from: number; rate?: number };
  still?: Still;
  // A rapid burst of stills, one every `every` frames, each opened by a quick black
  // camera-shutter blink (Scott: "rapid photo effect like shutter shutter shutter")
  burst?: { stills: Still[]; every: number };
};

export type ChatSpec = {
  id: string;
  durationInFrames: number;
  music: {
    src: string;
    startAt: number;
    gain: number;
    fadeIn: number;
    fadeFrom: number;
  };
  contact: string;
  contactPhoto?: string; // a round profile picture beside the name
  messages: ChatMessage[];
  // the bubble that opens out: fully open just after `at`, closed by `close`; `grow` is
  // how many frames the opening (and the folding back) takes
  open: { message: number; at: number; close: number; grow?: number };
  shots: ChatShot[];
  endAt: number;
  endCard: { lines: string[]; location: string; mark?: "cb-white" | "corner" };
  // UI sounds (Scott asked for them; the house rule is none, so a version without them
  // is rendered too): pops on messages, a whoosh as the bubble opens and folds back, a
  // shutter click on every still in a burst, a chime on the voucher. From public/sfx
  // (scripts/make-sfx.py).
  sfx?: { gain: number };
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// A few emoji in the messages (Scott: "make it authentic"): a Noto Color Emoji subset with
// only the ones used (public/fonts/NotoColorEmoji-chat.woff2, OFL), so renders stay offline.
const EMOJI = "Chat Emoji";
loadFont({ family: EMOJI, url: staticFile("fonts/NotoColorEmoji-chat.woff2") });
const FOOT = 1440; // the thread's foot (bottom safe zone above)
const WARM = "sepia(0.12) saturate(1.06) brightness(1.02)";
const GAP = 22;
const TURN_GAP = 46; // more room when the other person replies (Scott: "stacked too close")
const gapBefore = (msgs: ChatMessage[], j: number) =>
  j > 0 && msgs[j - 1].from !== msgs[j].from && !msgs[j - 1].stamp
    ? TURN_GAP
    : GAP;
const FONT = 48;
const LINE = 62;
const PAD_X = 34;
const PAD_Y = 26;
const RADIUS = 38;
const MAX_W = 720;

// Width of a text bubble (Open Sans at 48px averages ~27px a character, a little over).
const CH = 27;
const textWidth = (t: string) => Math.min(MAX_W, t.length * CH) + PAD_X * 2;
const lines = (t: string) => Math.ceil((t.length * CH) / MAX_W);

const height = (m: ChatMessage) => {
  if (m.stamp) return 40;
  if (m.text && m.time && lines(m.text) > 1)
    return lines(m.text) * LINE + PAD_Y * 2 + 30; // the time drops under wrapped text
  if (m.voucher)
    return (
      // padding, the title line and its margin, the card art, the caption line
      PAD_Y * 2 +
      (m.voucher.title ? LINE + 22 : 0) +
      (width(m) - PAD_X * 2) * (m.voucher.size[1] / m.voucher.size[0]) +
      14 +
      LINE
    );
  if (m.typing) return LINE + PAD_Y * 2;
  return lines(m.text ?? "") * LINE + PAD_Y * 2;
};
const TIME_W = 104; // room for "21:48" beside the text
const width = (m: ChatMessage) =>
  m.voucher
    ? 640
    : m.stamp
      ? 960
      : m.typing
        ? 150
        : textWidth(m.text ?? "") +
          (m.time && lines(m.text ?? "") === 1 ? TIME_W : 0);

// How far each message is shown: popping in, and a typing indicator clearing.
const shown = (m: ChatMessage, f: number) =>
  progress(f, m.at, 10) *
  (m.typing ? 1 - interpolate(f, [m.typing, m.typing + 6], [0, 1], clamp) : 1);

// Bottom edge of message i at frame f: every later message pushes it up by its height.
const bottomOf = (msgs: ChatMessage[], i: number, f: number) =>
  FOOT -
  msgs
    .slice(i + 1)
    .reduce(
      (y, m, k) => y + (height(m) + gapBefore(msgs, i + 1 + k)) * shown(m, f),
      0,
    );

const Dots: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", gap: 12, padding: "6px 4px" }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 16,
            height: 16,
            borderRadius: 8,
            background: colors.cream,
            opacity: 0.35 + 0.65 * Math.max(0, Math.sin((frame - i * 5) / 5)),
          }}
        />
      ))}
    </div>
  );
};

const Bubble: React.FC<{ m: ChatMessage; style?: React.CSSProperties }> = ({
  m,
  style,
}) => {
  const me = m.from === "me";
  if (m.stamp) {
    return (
      <div
        style={{
          position: "absolute",
          width: width(m),
          textAlign: "center",
          fontFamily: sans,
          fontSize: 26,
          letterSpacing: "0.08em",
          color: "rgba(245,239,227,0.5)",
          ...style,
        }}
      >
        {m.stamp}
      </div>
    );
  }
  return (
    <div
      style={{
        position: "absolute",
        width: width(m),
        whiteSpace: m.text && lines(m.text) === 1 ? "nowrap" : undefined,
        padding: `${PAD_Y}px ${PAD_X}px`,
        boxSizing: "border-box",
        borderRadius: RADIUS,
        borderBottomRightRadius: me ? 10 : RADIUS,
        borderBottomLeftRadius: me ? RADIUS : 10,
        background: me ? colors.gold : "#1C1C1F",
        color: me ? colors.black : colors.cream,
        fontFamily: `${sans}, "${EMOJI}"`,
        fontSize: FONT,
        lineHeight: `${LINE}px`,
        ...style,
      }}
    >
      {m.typing ? <Dots /> : null}
      {m.text}
      {m.time && m.text ? (
        <span
          style={{
            position: "absolute",
            right: PAD_X - 6,
            bottom: 12,
            fontSize: 24,
            lineHeight: 1,
            opacity: me ? 0.6 : 0.5,
          }}
        >
          {m.time}
        </span>
      ) : null}
      {m.voucher ? (
        <>
          {m.voucher.title ? (
            <div
              style={{
                fontFamily: sans,
                fontWeight: 600,
                fontSize: 30,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: colors.gold,
                marginBottom: 22,
              }}
            >
              {m.voucher.title}
            </div>
          ) : null}
          <Img
            src={staticFile(m.voucher.src)}
            style={{ width: "100%", display: "block", borderRadius: 14 }}
          />
          <div
            style={{
              marginTop: 14,
              fontSize: 38,
              color: colors.cream,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            {m.voucher.caption}
            {m.time ? (
              <span style={{ fontSize: 24, opacity: 0.5 }}>{m.time}</span>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
};

const Thread: React.FC<{ spec: ChatSpec }> = ({ spec }) => {
  const frame = useCurrentFrame();
  const { messages, open } = spec;
  const { pre, post } = growth(open);
  // The thread steps aside while the footage plays.
  const away =
    interpolate(frame, [open.at - pre, open.at + post / 2], [0, 1], clamp) *
    (1 -
      interpolate(
        frame,
        [open.close - post / 2, open.close + pre],
        [0, 1],
        clamp,
      ));
  return (
    <AbsoluteFill style={{ opacity: 1 - away }}>
      <div
        style={{
          position: "absolute",
          top: 262,
          left: 60,
          right: 60,
          display: "flex",
          alignItems: "center",
          gap: 22,
          paddingBottom: 26,
          borderBottom: "1px solid rgba(195,158,85,0.35)",
          opacity: progress(frame, 0, 12),
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            background: colors.gold,
            color: colors.black,
            fontFamily: sans,
            fontWeight: 600,
            fontSize: 34,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {spec.contactPhoto ? (
            <Img
              src={staticFile(spec.contactPhoto)}
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                objectFit: "cover",
              }}
            />
          ) : (
            spec.contact[0]
          )}
        </div>
        <div
          style={{
            fontFamily: sans,
            fontWeight: 600,
            fontSize: 38,
            color: colors.cream,
          }}
        >
          {spec.contact}
        </div>
      </div>
      <AbsoluteFill
        style={{
          // old messages fade out under the header rather than cutting off hard
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 372px, #000 470px)",
          maskImage:
            "linear-gradient(to bottom, transparent 372px, #000 470px)",
        }}
      >
        {messages.map((m, i) => {
          const s = shown(m, frame);
          if (s <= 0.001) return null;
          const me = m.from === "me";
          const bottom = bottomOf(messages, i, frame);
          // the bubble that opens out is hidden while it is the footage
          const hidden =
            i === open.message && frame > open.at - pre && frame < open.close;
          return (
            <Bubble
              key={i}
              m={m}
              style={{
                top: bottom - height(m),
                ...(m.stamp ? { left: 60 } : me ? { right: 60 } : { left: 60 }),
                opacity: hidden ? 0 : s,
                // a new message rises from below as the thread moves up to make room,
                // so it never overlaps the one above
                transform: `translateY(${(1 - s) * (height(m) + gapBefore(messages, i))}px) scale(${0.85 + 0.15 * s})`,
                transformOrigin: me ? "bottom right" : "bottom left",
              }}
            />
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Reply: React.FC<{ text: string; tag?: string }> = ({ text, tag }) => {
  const frame = useCurrentFrame();
  const s = progress(frame, 4, 10);
  const m: ChatMessage = { at: 0, from: "me", text };
  return (
    <>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(9,9,10,0) 58%, rgba(9,9,10,0.45) 78%, rgba(9,9,10,0.3) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 60,
          top: FOOT - height(m) - 46,
          fontFamily: sans,
          fontWeight: 600,
          fontSize: 22,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: colors.cream,
          textShadow: "0 2px 18px rgba(9,9,10,0.8)",
          opacity: progress(frame, 10, 10),
        }}
      >
        {tag}
      </div>
      <Bubble
        m={m}
        style={{
          top: FOOT - height(m),
          right: 60,
          opacity: s,
          transform: `scale(${0.85 + 0.15 * s})`,
          transformOrigin: "bottom right",
          boxShadow: "0 8px 40px rgba(9,9,10,0.45)",
        }}
      />
    </>
  );
};

const Footage: React.FC<{ spec: ChatSpec }> = ({ spec }) => {
  const frame = useCurrentFrame();
  const { open, messages, shots } = spec;
  const { pre, post } = growth(open);
  // The bubble's box at the moment it opens (it is the newest message then).
  const m = messages[open.message];
  const b = bottomOf(messages, open.message, open.at);
  const box = {
    top: b - height(m),
    right: 60,
    bottom: 1920 - b,
    left: 1080 - 60 - width(m),
  };
  const o =
    interpolate(frame, [open.at - pre, open.at + post], [0, 1], clamp) *
    (1 -
      interpolate(frame, [open.close - post, open.close + pre], [0, 1], clamp));
  const e = o * o * (3 - 2 * o); // eased
  const inset = (k: keyof typeof box) => box[k] * (1 - e);
  const r = RADIUS * (1 - e);
  return (
    <AbsoluteFill
      style={{
        clipPath: `inset(${inset("top")}px ${inset("right")}px ${inset("bottom")}px ${inset("left")}px round ${r}px)`,
        opacity: o > 0 ? 1 : 0,
      }}
    >
      {shots.map((s, i) => {
        const end = shots[i + 1]?.at ?? open.close + pre;
        const start = i === 0 ? open.at - pre : s.at;
        return (
          <Sequence key={s.reply} from={start} durationInFrames={end - start}>
            {/* one gentle warm grade over all the footage so the shots sit together */}
            <AbsoluteFill style={{ filter: WARM }}>
              <Shot shot={s} frames={end - start} />
            </AbsoluteFill>
            {/* the reply waits for the bubble to open, and leaves as it closes */}
            <Sequence from={i === 0 ? pre + post - 4 : 0}>
              {frame < open.close - post ? (
                <Reply text={s.reply} tag={s.tag} />
              ) : null}
            </Sequence>
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
          opacity: e,
        }}
      />
    </AbsoluteFill>
  );
};

// The small CB from the footage, kept in the same corner over a clean end card (Scott:
// "just keep it in the corner and then the end card clean").
const CornerMark: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Img
      src={staticFile("brand/cb-watermark.png")}
      style={{
        position: "absolute",
        left: 920,
        top: 1452,
        width: 100,
        height: 108,
        opacity: progress(frame, 4, 18),
      }}
    />
  );
};

const Shot: React.FC<{ shot: ChatShot; frames: number }> = ({
  shot,
  frames,
}) => {
  const frame = useCurrentFrame();
  if (shot.burst) {
    const { stills, every } = shot.burst;
    const i = Math.min(Math.floor(frame / every), stills.length - 1);
    const t = frame - i * every;
    const shut = interpolate(t, [0, 2], [0.85, 0], clamp); // a quick blink: blades open over 2 frames
    return (
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <StillView
          still={stills[i]}
          zoom={interpolate(t, [0, every], [1.08, 1.02], clamp)}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: 960 * shut,
            background: colors.black,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 960 * shut,
            background: colors.black,
          }}
        />
      </AbsoluteFill>
    );
  }
  if (shot.clip) {
    return (
      <Video
        src={staticFile(shot.clip.src)}
        trimBefore={Math.round(shot.clip.from * 30)}
        playbackRate={shot.clip.rate ?? 1}
        muted
        objectFit="cover"
        style={{ width: "100%", height: "100%" }}
      />
    );
  }
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <StillView
        still={shot.still!}
        zoom={interpolate(frame, [0, frames], [1, 1.05], clamp)}
      />
    </AbsoluteFill>
  );
};

// A still filling 9:16 around its chosen centre, at a zoom.
const StillView: React.FC<{ still: Still; zoom: number }> = ({
  still,
  zoom,
}) => {
  const k = 1920 / still.size[1];
  return (
    <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
      <Img
        src={staticFile(still.src)}
        style={{
          position: "absolute",
          height: 1920,
          width: still.size[0] * k,
          left: Math.min(
            0,
            Math.max(1080 - still.size[0] * k, 540 - still.cx * k),
          ),
        }}
      />
    </AbsoluteFill>
  );
};

const Sfx: React.FC<{ spec: ChatSpec }> = ({ spec }) => {
  if (!spec.sfx) return null;
  const g = spec.sfx.gain;
  const ev: [number, string, number][] = [];
  spec.messages.forEach((m) => {
    if (m.text) ev.push([m.at, m.from === "me" ? "pop-me" : "pop-them", 1]);
    if (m.voucher) ev.push([m.at, "chime", 0.8]);
  });
  ev.push([spec.open.at - growth(spec.open).pre, "whoosh-in", 0.7]);
  ev.push([spec.open.close - growth(spec.open).post, "whoosh-out", 0.6]);
  spec.shots.forEach((s) =>
    s.burst?.stills.forEach((_, i) =>
      ev.push([s.at + i * s.burst!.every, "shutter", 0.9]),
    ),
  );
  return (
    <>
      {ev.map(([at, name, level], i) => (
        <Sequence key={i} from={Math.max(0, at)} durationInFrames={30}>
          <Audio src={staticFile(`sfx/${name}.wav`)} volume={g * level} />
        </Sequence>
      ))}
    </>
  );
};

// The opening window around `at`: it starts `pre` frames before and ends `post` after.
const growth = (open: ChatSpec["open"]) => {
  const g = open.grow ?? 22;
  const pre = Math.round(g * 0.4);
  return { pre, post: g - pre };
};

export const ChatReel: React.FC<{ spec: ChatSpec }> = ({ spec }) => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [spec.endAt - 12, spec.endAt], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      <Audio
        src={staticFile(spec.music.src)}
        trimBefore={spec.music.startAt}
        volume={(f) =>
          spec.music.gain *
          interpolate(f, [0, spec.music.fadeIn], [0, 1], clamp) *
          interpolate(
            f,
            [spec.music.fadeFrom, spec.durationInFrames],
            [1, 0],
            clamp,
          )
        }
      />
      <Sfx spec={spec} />
      <AbsoluteFill style={{ opacity: out }}>
        <Thread spec={spec} />
        <Footage spec={spec} />
      </AbsoluteFill>
      <Sequence from={spec.endAt}>
        <EndCard
          lines={spec.endCard.lines}
          location={spec.endCard.location}
          logo={
            spec.endCard.mark === "corner"
              ? false
              : spec.endCard.mark === "cb-white"
                ? true
                : "cb-shimmer"
          }
          rule={false}
          delay={4}
        />
        {spec.endCard.mark === "corner" ? <CornerMark /> : null}
      </Sequence>
      <FilmFinish />
    </AbsoluteFill>
  );
};

export const validateChat = (s: ChatSpec) => {
  const fail = (msg: string) => {
    throw new Error(`${s.id}: ${msg}`);
  };
  [...s.shots.map((x) => x.at), s.open.close].reduce((a, b) => {
    if (b - a < 24) fail("a shot is under 0.8s");
    return b;
  });
  if (s.shots[0]?.at !== s.open.at)
    fail("the first shot opens with the bubble");
  if (s.messages[s.open.message].from !== "me") fail("only a reply opens out");
  if (s.durationInFrames - s.endAt < 90) fail("give the end card 3s");
};

// The reel's cover (Scott: "a better cover"): the opening of the thread over a hotel shot,
// darkened so the bubbles read, everything inside the centre 4:5 the profile grid shows.
export const ChatCover: React.FC<{
  spec: ChatSpec;
  still: Still;
  messages: ChatMessage[];
}> = ({ spec, still, messages }) => {
  let y = 1240; // the last bubble's foot, inside the 4:5 grid crop (y 285-1635)
  const placed = [...messages]
    .reverse()
    .map((m, k, arr) => {
      const top = y - height(m);
      const next = arr[k + 1];
      y = top - (next && next.from !== m.from ? TURN_GAP : GAP);
      return { m, top };
    })
    .reverse();
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black, overflow: "hidden" }}>
      <AbsoluteFill style={{ filter: WARM }}>
        <StillView still={still} zoom={1.02} />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(9,9,10,0.35) 0%, rgba(9,9,10,0.62) 40%, rgba(9,9,10,0.72) 70%, rgba(9,9,10,0.45) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: placed[0].top - 130,
          left: 60,
          display: "flex",
          alignItems: "center",
          gap: 22,
        }}
      >
        {spec.contactPhoto ? (
          <Img
            src={staticFile(spec.contactPhoto)}
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              objectFit: "cover",
            }}
          />
        ) : null}
        <div
          style={{
            fontFamily: sans,
            fontWeight: 600,
            fontSize: 38,
            color: colors.cream,
            textShadow: "0 2px 18px rgba(9,9,10,0.7)",
          }}
        >
          {spec.contact}
        </div>
      </div>
      {placed.map(({ m, top }, i) => (
        <Bubble
          key={i}
          m={m}
          style={{
            top,
            ...(m.from === "me" ? { right: 60 } : { left: 60 }),
            boxShadow: "0 10px 40px rgba(9,9,10,0.5)",
          }}
        />
      ))}
    </AbsoluteFill>
  );
};
