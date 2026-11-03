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
import { FilmFinish } from "../components/FilmFinish";
import { colors, EASE_IN_OUT, EASE_OUT, progress, sans, serif } from "../theme";

// Black Friday 2026, "The queue" (Scott, 2 Nov: "we need some reels around" the campaign's
// assets, "needs to be fresh ideas"). The campaign: THE WAIT IS OVER / Black Friday Sale /
// SAVE UP TO 30%, in its own mauve (#A15272, sampled from the pill) over two photos. The
// idea is the online sale's waiting room, in the CBH black: "You're in the queue", the place
// in line counting down from 2,481, the estimated wait shrinking from "about a year" to "any
// minute now", and a "While you wait" window cycling through the hotels. The music is muffled
// like hold music through the track's build (the trimmed file is band-limited up to the drop,
// queue-music.mp3); in the track's one-beat stop "It's your turn" and an Enter button, the
// tap, and on the drop the window bursts to full frame as the band comes in: "The wait / is
// over". Then the hotels on the beat, the last (Rowton's robe) a match cut into the campaign's
// own robe photo, which takes the offer. No figures beyond the campaign's own "up to 30%".
//
// Music: "Party Dance" by prettyjohn1 (Pixabay 526227; unused before), 110 BPM. The film
// starts on the downbeat at 7.129s of the original; the stop is 16.97-18.04s, the drop on the
// downbeat at 18.045s (beat 20 here). `queue-music.mp3` is 7.129-18.045s band-limited
// (350-2600 Hz, like a phone line) and then the full band from the drop.

const P = "campaigns/black-friday-2026/";
const MAUVE = "#A15272";
const BEAT = 0.54575 * 30; // frames
const B = (k: number) => Math.round(k * BEAT);
const DROP = B(20);
const GAIN = 0.56; // ~-15.2 LUFS over the reel

type Clip = { src: string; at: number; from?: number };

// the "While you wait" window: two beats a hotel, the last one bursting out on the drop (Low Wood Bay out, Scott, 3 Nov:
// it "doesn't need our marketing"; The Mount in, its four poster and conservatory as slow pushes from the stills)
const WAIT: Clip[] = [
  { src: "hotels/rowton-hall/screen-time/log-burner.mp4", at: 0 },
  { src: "hotels/the-mount/screen-time/four-poster.mp4", at: 2 },
  { src: "hotels/gisborough-hall/screen-time/snowy-garden.mp4", at: 4 },
  { src: "hotels/haycock-manor/clips/birdcage-restaurant.mp4", at: 6, from: 0.5 },
  { src: "hotels/rowton-hall/screen-time/cake-by-the-fire.mp4", at: 8 },
  { src: "hotels/waterton-park/clips/afternoon-tea.mp4", at: 10, from: 2 },
  { src: "hotels/rowton-hall/screen-time/welcome-fizz.mp4", at: 12 },
  { src: "hotels/the-mount/screen-time/conservatory.mp4", at: 14 },
  { src: "hotels/haycock-manor/clips/cocktail-smoke.mp4", at: 16 },
];

// full frame after the drop: two beats each, the robe last, into the campaign's robe
const AFTER: Clip[] = [
  { src: "hotels/gisborough-hall/screen-time/misty-sunrise.mp4", at: 24 },
  { src: "hotels/rutland-hall/screen-time/lake-sunset.mp4", at: 26 },
  { src: "hotels/rowton-hall/screen-time/four-poster.mp4", at: 28 },
  { src: "hotels/rowton-hall/screen-time/robe.mp4", at: 30 },
];

type Cut = { after: Clip[]; end: number; len: number };
const CUTS: Record<"reel" | "story", Cut> = {
  reel: { after: AFTER, end: 32, len: 40 },
  story: { after: [], end: 24, len: 32 },
};
export const QUEUE_FRAMES = B(CUTS.reel.len);
export const QUEUE_STORY_FRAMES = B(CUTS.story.len);

// the estimated wait, shortening as the queue moves
const WAITS: [number, string][] = [
  [0, "about a year"],
  [5, "a few months"],
  [9, "a couple of weeks"],
  [12, "a few days"],
  [15, "any minute now"],
];

const caps = (size: number, color: string, track = 0.18): React.CSSProperties => ({
  fontFamily: sans,
  fontWeight: 600,
  fontSize: size,
  letterSpacing: `${track}em`,
  textTransform: "uppercase",
  color,
});

const Video: React.FC<{ c: Clip; style?: React.CSSProperties }> = ({ c, style }) => (
  <OffthreadVideo
    src={staticFile(c.src)}
    muted
    trimBefore={Math.round((c.from ?? 0) * 30)}
    style={{ width: "100%", height: "100%", objectFit: "cover", ...style }}
  />
);

// the clips of a list, each until the next (the last for `last` frames)
const Clips: React.FC<{ list: Clip[]; until: number }> = ({ list, until }) => (
  <>
    {list.map((c, i) => {
      const from = B(c.at);
      const to = i + 1 < list.length ? B(list[i + 1].at) : until;
      return (
        <Sequence key={c.src} from={from} durationInFrames={to - from} layout="none">
          <AbsoluteFill>
            <Video c={c} />
          </AbsoluteFill>
        </Sequence>
      );
    })}
  </>
);

// a line that rises out of its own mask
const Rise: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties; dist?: number }> = ({
  at,
  children,
  style,
  dist = 1,
}) => {
  const frame = useCurrentFrame();
  const p = progress(frame, at, 16, EASE_OUT);
  return (
    <div style={{ overflow: "hidden", ...style }}>
      <div style={{ transform: `translateY(${(1 - p) * 105 * dist}%)`, opacity: p }}>{children}</div>
    </div>
  );
};

const Queue: React.FC<{ cut: Cut }> = ({ cut }) => {
  const frame = useCurrentFrame();
  const turn = B(18); // the track's stop
  const enter = B(18.5);
  const tap = B(19.5);
  // the place in line: 2,481 down to 1 by the stop, the queue speeding up as it goes
  const q = Math.min(1, frame / B(17.5));
  const place = Math.max(1, Math.round(1 + 2480 * Math.pow(1 - q, 1.7)));
  const waitIdx = WAITS.filter(([k]) => frame >= B(k)).length - 1;
  const waitIn = progress(frame, B(WAITS[waitIdx][0]), 8);
  const bar = interpolate(frame, [0, turn], [0.02, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const queueOut = 1 - progress(frame, turn - 4, 8);
  const turnIn = progress(frame, turn + 2, 12, EASE_OUT);
  const button = progress(frame, enter, 10, EASE_OUT);
  const press = interpolate(frame, [tap, tap + 3, tap + 9], [1, 0.93, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ring = progress(frame, tap, 14, EASE_OUT);
  // the drop: the window bursts to full frame, the page falls away
  const burst = progress(frame, DROP, 10, EASE_OUT);
  const page = 1 - progress(frame, DROP, 6);
  const win = { x: 220, y: 500, w: 640, h: 660, r: 28 };
  const box = {
    left: win.x * (1 - burst),
    top: win.y * (1 - burst),
    width: win.w + (1080 - win.w) * burst,
    height: win.h + (1920 - win.h) * burst,
    radius: win.r * (1 - burst),
  };
  const intro = progress(frame, 0, 10);
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      {/* the page: a soft light behind the window */}
      <AbsoluteFill
        style={{
          opacity: page * intro,
          background: "radial-gradient(ellipse 70% 40% at 50% 42%, rgba(161,82,114,0.16), transparent 70%)",
        }}
      />
      <AbsoluteFill style={{ opacity: page * intro }}>
        <div style={{ position: "absolute", top: 250, width: "100%", textAlign: "center", ...caps(30, MAUVE, 0.22) }}>
          Black Friday Sale
        </div>
        <div
          style={{
            position: "absolute",
            top: 296,
            width: "100%",
            textAlign: "center",
            fontFamily: serif,
            fontWeight: 400,
            fontSize: 96,
            color: colors.cream,
          }}
        >
          You&apos;re in the queue
        </div>
        <div style={{ position: "absolute", top: 450, width: "100%", textAlign: "center", ...caps(22, "rgba(245,239,227,0.55)", 0.24) }}>
          While you wait
        </div>
        {/* the place in line, then your turn */}
        <div style={{ position: "absolute", top: 1196, width: "100%", textAlign: "center", opacity: queueOut }}>
          <div style={caps(22, "rgba(245,239,227,0.55)", 0.24)}>Your place in line</div>
          <div
            style={{
              fontFamily: serif,
              fontWeight: 500,
              fontSize: 112,
              lineHeight: 1.05,
              color: colors.cream,
              fontVariantNumeric: "lining-nums tabular-nums",
            }}
          >
            {place.toLocaleString("en-GB")}
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            top: 1222,
            width: "100%",
            textAlign: "center",
            fontFamily: serif,
            fontWeight: 400,
            fontSize: 104,
            color: colors.cream,
            opacity: turnIn,
            transform: `translateY(${(1 - turnIn) * 30}px)`,
          }}
        >
          It&apos;s your turn
        </div>
        {/* the progress bar, filling to the stop */}
        <div
          style={{
            position: "absolute",
            left: win.x,
            top: 1372,
            width: win.w,
            height: 6,
            borderRadius: 3,
            backgroundColor: "rgba(245,239,227,0.14)",
            opacity: queueOut,
          }}
        >
          <div style={{ width: `${bar * 100}%`, height: "100%", borderRadius: 3, backgroundColor: MAUVE }} />
        </div>
        <div
          style={{
            position: "absolute",
            top: 1400,
            width: "100%",
            textAlign: "center",
            fontFamily: sans,
            fontSize: 30,
            color: "rgba(245,239,227,0.8)",
            opacity: queueOut * waitIn,
          }}
        >
          Estimated wait: {WAITS[waitIdx][1]}
        </div>
        {/* Enter, and the tap */}
        <div
          style={{
            position: "absolute",
            left: 540 - 150,
            top: 1366,
            width: 300,
            height: 88,
            borderRadius: 44,
            backgroundColor: MAUVE,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: button,
            transform: `translateY(${(1 - button) * 24}px) scale(${press})`,
            ...caps(32, colors.cream, 0.2),
          }}
        >
          Enter
        </div>
        {frame >= tap ? (
          <div
            style={{
              position: "absolute",
              left: 600 - 40 - ring * 40,
              top: 1410 - 40 - ring * 40,
              width: 80 + ring * 80,
              height: 80 + ring * 80,
              borderRadius: "50%",
              border: "3px solid rgba(245,239,227,0.8)",
              backgroundColor: `rgba(245,239,227,${0.35 * (1 - ring)})`,
              opacity: 1 - ring,
            }}
          />
        ) : null}
      </AbsoluteFill>
      {/* the window */}
      <div
        style={{
          position: "absolute",
          ...box,
          borderRadius: box.radius,
          overflow: "hidden",
          opacity: intro,
          boxShadow: burst < 1 ? "0 30px 80px rgba(0,0,0,0.6)" : undefined,
          outline: burst < 1 ? `1px solid rgba(245,239,227,${0.16 * (1 - burst)})` : undefined,
        }}
      >
        <div style={{ position: "absolute", left: -box.left, top: -box.top, width: 1080, height: 1920 }}>
          <Clips list={WAIT} until={B(cut.after.length ? cut.after[0].at : cut.end)} />
        </div>
      </div>
      {/* The wait / is over, on the drop */}
      {frame >= DROP ? (
        <>
          <AbsoluteFill
            style={{
              background: "linear-gradient(to bottom, rgba(0,0,0,0.55), transparent 42%)",
              opacity: progress(frame, DROP + 4, 10),
            }}
          />
          <div style={{ position: "absolute", top: 270, width: "100%", textAlign: "center" }}>
            {["The wait", "is over"].map((l, i) => (
              <Rise
                key={l}
                at={DROP + 6 + i * 5}
                style={{ fontFamily: serif, fontWeight: 400, fontSize: 132, lineHeight: 1.08, color: colors.cream }}
              >
                {l}
              </Rise>
            ))}
          </div>
        </>
      ) : null}
    </AbsoluteFill>
  );
};

const EndCard: React.FC<{ at: number; len: number }> = ({ at, len }) => {
  const frame = useCurrentFrame();
  const push = interpolate(frame, [at, len], [1.0, 1.05]);
  const pill = progress(frame, at + 22, 14, EASE_OUT);
  return (
    <AbsoluteFill>
      <Img
        src={staticFile(P + "bed-clean.jpg")}
        style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${push})`, transformOrigin: "60% 45%" }}
      />
      <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(9,9,10,0.62), rgba(9,9,10,0.2) 34%, transparent 50%)" }} />
      <div style={{ position: "absolute", left: 90, top: 250 }}>
        {["Black Friday", "Sale"].map((l, i) => (
          <Rise
            key={l}
            at={at + 4 + i * 5}
            style={{ fontFamily: serif, fontWeight: 400, fontSize: 170, lineHeight: 1.0, color: colors.cream }}
          >
            {l}
          </Rise>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 1310,
          height: 104,
          padding: "0 46px",
          borderRadius: 52,
          backgroundColor: MAUVE,
          display: "flex",
          alignItems: "center",
          gap: 26,
          opacity: pill,
          transform: `translateY(${(1 - pill) * 24}px)`,
          boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
        }}
      >
        <span style={caps(40, colors.cream, 0.06)}>Save up to</span>
        <span style={{ ...caps(62, colors.cream, 0.02), fontWeight: 700 }}>30%</span>
      </div>
    </AbsoluteFill>
  );
};

// The end card is the campaign's own artwork (Scott, 2 Nov: "use the official assets"): the
// 4:5 bed asset as supplied, its type, pill and gold logo untouched, set in the 9:16 frame so
// its pill and logo clear the bottom 460px (top 170: pill to 1460, its eyebrow at 250), over a
// blurred, darkened copy of the clean photo. A barely-there push. `EndCard` above is the
// rebuilt version (house Cormorant, sampled mauve), kept behind OFFICIAL_END.
const OFFICIAL_END = true;
const ART = { src: P + "campaign/bed-4x5.jpg", w: 1080, h: 1350, top: 170 };

const OfficialEnd: React.FC<{ at: number; len: number }> = ({ at, len }) => {
  const frame = useCurrentFrame();
  const push = interpolate(frame, [at, len], [1.0, 1.02]);
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      <Img
        src={staticFile(P + "bed-clean.jpg")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: "scale(1.1)",
          filter: "blur(36px) brightness(0.45)",
        }}
      />
      <Img
        src={staticFile(ART.src)}
        style={{
          position: "absolute",
          left: 0,
          top: ART.top,
          width: ART.w,
          height: ART.h,
          transform: `scale(${push})`,
          transformOrigin: "50% 50%",
          boxShadow: "0 0 60px rgba(0,0,0,0.5)",
        }}
      />
    </AbsoluteFill>
  );
};

export const QueueReel: React.FC<{ story?: boolean }> = ({ story = false }) => {
  const frame = useCurrentFrame();
  const cut = CUTS[story ? "story" : "reel"];
  const end = B(cut.end);
  const len = B(cut.len);
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      <Queue cut={cut} />
      <Clips list={cut.after} until={end} />
      {frame >= end && !OFFICIAL_END ? <EndCard at={end} len={len} /> : null}
      {frame < end || !OFFICIAL_END ? (
        <Img
          src={staticFile("brand/cb-watermark.png")}
          style={{
            position: "absolute",
            left: 920,
            top: 1452,
            width: 100,
            height: 108,
            opacity: frame >= DROP ? progress(frame, DROP + 6, 12) : 0,
          }}
        />
      ) : null}
      {frame < end || !OFFICIAL_END ? <FilmFinish /> : null}
      {/* the official artwork has no grain or vignette over it */}
      {frame >= end && OFFICIAL_END ? <OfficialEnd at={end} len={len} /> : null}
      <Audio
        src={staticFile(P + "queue-music.mp3")}
        volume={(f) =>
          GAIN *
          interpolate(f, [0, 4, len - B(4), len - 1], [0, 1, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: EASE_IN_OUT,
          })
        }
      />
    </AbsoluteFill>
  );
};
