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

// `frame`: where the window looks in a clip, the source point at its top left and a scale (default: the clip's
// middle at full size)
type Clip = {
  src: string;
  at: number;
  from?: number;
  frame?: { x: number; y: number; s: number };
  place?: string; // the house label: the place in gold caps, the name in cream Cormorant
  name?: string;
};

// Only the 14 hotels in the sale (Bianca, 5 Nov: "we're only spotlighting the 14 for the rest of Nov"), each once.
// The window shows only the middle of a clip, so the stills are slow pushes fitted to the window itself
// (`scripts/window-push.py`, near their own resolution); the full frame shots are footage where there is some.
const F = "campaigns/black-friday-2026/fourteen/";
// the "While you wait" window: two beats a hotel, the last one bursting out on the drop, then a cut on beat 22 under
// "The wait is over" (still in the window's list, so the line stays on top)
const WAIT: Clip[] = [
  { src: F + "burleigh-court.mp4", at: 0, place: "The Cotswolds", name: "Burleigh Court" },
  { src: F + "jockey-club-rooms.mp4", at: 2, place: "Newmarket", name: "Jockey Club Rooms" },
  { src: F + "oaklands-hall.mp4", at: 4, place: "Lincolnshire", name: "Oaklands Hall" },
  { src: F + "the-alfriston.mp4", at: 6, place: "East Sussex", name: "The Alfriston" },
  { src: F + "skipton.mp4", at: 8, place: "North Yorkshire", name: "Skipton Hotel" },
  { src: F + "gomersal-park.mp4", at: 10, place: "West Yorkshire", name: "Gomersal Park" },
  { src: F + "forest-of-arden.mp4", at: 12, place: "Warwickshire", name: "Forest of Arden" },
  { src: F + "whittlebury-park.mp4", at: 14, place: "Northamptonshire", name: "Whittlebury Park" },
  { src: "hotels/dalmahoy/syrup-pour.mp4", at: 16, from: 4, place: "Edinburgh", name: "Dalmahoy" },
  { src: "hotels/ruthin-castle/clips/castle.mp4", at: 22, place: "North Wales", name: "Ruthin Castle" },
];

// full frame after the drop: two beats each, breakfast in bed last, into the campaign's bed photo
const AFTER: Clip[] = [
  { src: F + "holdsworth-house.mp4", at: 24, place: "Halifax, West Yorkshire", name: "Holdsworth House" },
  { src: "hotels/waterton-park/clips/afternoon-tea.mp4", at: 26, from: 2, place: "Wakefield", name: "Waterton Park" },
  { src: F + "oakley-hall.mp4", at: 28, place: "Hampshire", name: "Oakley Hall" }, // the winter sun exterior (the dog clip read as summer)
  { src: F + "the-imperial.mp4", at: 30, place: "Llandudno", name: "The Imperial" },
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
    style={{
      width: "100%",
      height: "100%",
      objectFit: "cover",
      ...(c.frame
        ? {
            transformOrigin: "0 0",
            transform: `translate(${220 - c.frame.s * c.frame.x}px, ${500 - c.frame.s * c.frame.y}px) scale(${c.frame.s})`,
          }
        : null),
      ...style,
    }}
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

// the hotel's name over its shot, in the house order (Scott, 5 Nov: "should we add the location and the hotel name"):
// in the window a small caption at its foot, as part of the queue page; full frame (from Ruthin on, the drop itself
// left clean) the house label low on the left. Each fades in just after its cut and out just before the next.
const labelFor = (list: Clip[], frame: number, until: number, minAt: number, maxAt: number) => {
  for (let i = list.length - 1; i >= 0; i--) {
    const c = list[i];
    if (frame < B(c.at)) continue;
    if (c.at < minAt || c.at >= maxAt || !c.name) return null;
    const next = i + 1 < list.length ? B(list[i + 1].at) : until;
    const on = progress(frame, B(c.at) + 3, 6) * (1 - progress(frame, next - 5, 5));
    return on > 0 ? { c, on } : null;
  }
  return null;
};

const HouseLabel: React.FC<{ c: Clip; on: number; small?: boolean }> = ({ c, on, small }) => {
  const k = small ? 0.72 : 1;
  return (
    <div style={{ opacity: on, transform: `translateY(${(1 - on) * 10 * k}px)`, whiteSpace: "nowrap" }}>
      {/* the place as on Lee's artwork and the carousels (Scott, 5 Nov): tight mauve caps, no underline */}
      <div style={{ ...caps(small ? 25 : 32, MAUVE, 0.02), fontWeight: 700, textShadow: "0 1px 10px rgba(9,9,10,0.9)" }}>{c.place}</div>
      <div style={{ fontFamily: serif, fontSize: 66 * k, lineHeight: 1.1, marginTop: 12 * k, color: colors.cream,
        textShadow: "0 2px 22px rgba(9,9,10,0.6)" }}>{c.name}</div>
    </div>
  );
};

const WindowCaption: React.FC<{ burst: number }> = ({ burst }) => {
  const frame = useCurrentFrame();
  const l = labelFor(WAIT, frame, B(22), 0, 20);
  if (!l) return null;
  const on = l.on * (1 - progress(frame, DROP - 2, 5));
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 250, opacity: on * (1 - burst),
        background: "linear-gradient(to bottom, rgba(9,9,10,0), rgba(9,9,10,0.82) 45%, rgba(9,9,10,0.92))" }} />
      <div style={{ position: "absolute", left: 32, bottom: 28 }}>
        <HouseLabel c={l.c} on={on} small />
      </div>
    </>
  );
};

const FullLabel: React.FC<{ list: Clip[]; until: number }> = ({ list, until }) => {
  const frame = useCurrentFrame();
  const l = labelFor(list, frame, until, 22, 1000);
  if (!l) return null;
  return (
    <>
      <AbsoluteFill style={{ opacity: l.on, background:
        "linear-gradient(to bottom, rgba(9,9,10,0) 55%, rgba(9,9,10,0.55) 70%, rgba(9,9,10,0.6) 78%, rgba(9,9,10,0) 88%)" }} />
      <div style={{ position: "absolute", left: 72, bottom: 520 }}>
        <HouseLabel c={l.c} on={l.on} />
      </div>
    </>
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
        <div style={{ position: "absolute", top: 250, width: "100%", textAlign: "center", ...caps(32, MAUVE, 0.02) }}>
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
        <WindowCaption burst={burst} />
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
        // the wider crop from the landscape artwork, her elbows and the headboard whole (Scott, 5 Nov: "crop it
        // better"; `scripts/bf-end-9x16.py`), the type over its dark top as on the 4:5 artwork
        src={staticFile(P + "bed-9x16.jpg")}
        style={{ width: "100%", height: "100%", transform: `scale(${push})`, transformOrigin: "50% 55%" }}
      />
      <div style={{ position: "absolute", left: 90, top: 250 }}>
        <Rise at={at + 2} style={{ ...caps(40, MAUVE, 0.02), marginBottom: 26 }}>
          The wait is over
        </Rise>
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
          top: 1370,
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
        <span style={caps(40, colors.cream, 0.02)}>Save up to</span>
        <span style={{ ...caps(62, colors.cream, 0.02), fontWeight: 700 }}>30%</span>
      </div>
      {/* the campaign's lockup, as on the official artwork: the gold CB over Classic British Hotels & Resorts */}
      <Img
        src={staticFile("brand/cbh-logo-on-light.svg")}
        style={{ position: "absolute", right: 90, top: 1298, width: 150, opacity: pill }}
      />
    </AbsoluteFill>
  );
};

// The end card is the campaign's own artwork (Scott, 2 Nov: "use the official assets"): the
// 4:5 bed asset as supplied, its type, pill and gold logo untouched, set in the 9:16 frame so
// its pill and logo clear the bottom 460px (top 170: pill to 1460, its eyebrow at 250), over a
// blurred, darkened copy of the clean photo. A barely-there push. `EndCard` above is the
// rebuilt version (house Cormorant, sampled mauve), kept behind OFFICIAL_END.
// full bleed again (Scott, 3 Nov, on the boxed artwork: "don't like that, it's not full bleed and just a box under"):
// the rebuilt card in the artwork's own layout (mauve THE WAIT IS OVER, Black Friday / Sale, the mauve pill, the
// lockup bottom right) over the clean photo, full frame
const OFFICIAL_END = false;
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
      {/* the full frame labels: Ruthin (still in the window's list) and the shots after it */}
      <FullLabel list={[...WAIT, ...cut.after]} until={end} />
      {frame >= end && !OFFICIAL_END ? <EndCard at={end} len={len} /> : null}
      {/* no white CB (Scott, 3 Nov: "get rid of the watermark CB"): the end card has the lockup */}
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
