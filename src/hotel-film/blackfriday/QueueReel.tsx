import { Audio } from "@remotion/media";
import React from "react";
import {
  Easing,
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
// minute now", and a "While you wait" window cycling through the hotels. Now a countdown (Bianca, 5 Nov:
// people don't queue for CBH's Black Friday): "The countdown is on", the sale opening in three days down to zero,
// "The sale is open" and a Book now button in the stop. The music is muffled
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
// the count to 30: moving from its first frame, an even climb, slowing gently into the 30
const COUNT_EASE = Easing.bezier(0.3, 0.3, 0.45, 1);
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
// north to south (Bianca, 5 Nov: "start north to south"), as the carousels run: the window's eight, then Forest of
// Arden bursts out on the drop, and the rest full frame
const WAIT: Clip[] = [
  // north to south, but ending on Dalmahoy, whose 30% off B&B bursts full frame as the capsule lands on 30% (Scott, 5
  // Nov: "end on Dalmahoy if they are doing 30"; Forest of Arden's offer is an advance purchase rate, no percentage)
  {
    src: F + "skipton.mp4",
    at: 0,
    place: "North Yorkshire",
    name: "Skipton Hotel",
  },
  {
    src: F + "holdsworth-pancakes-w.mp4",
    at: 2,
    place: "Halifax",
    name: "Holdsworth House",
  },
  {
    src: F + "gomersal-bedroom-w.mp4",
    at: 4,
    place: "West Yorkshire",
    name: "Gomersal Park",
  },
  {
    src: F + "waterton-plate-w.mp4",
    at: 6,
    place: "Wakefield",
    name: "Waterton Park",
  },
  {
    src: F + "imperial-w.mp4",
    at: 8,
    place: "Llandudno",
    name: "The Imperial",
  },
  {
    src: F + "ruthin-w.mp4",
    at: 10,
    place: "North Wales",
    name: "Ruthin Castle",
  },
  {
    src: F + "oaklands-bedroom-w.mp4",
    at: 12,
    place: "Lincolnshire",
    name: "Oaklands Hall",
  },
  {
    src: F + "forest-of-arden-full.mp4",
    at: 14,
    place: "Warwickshire",
    name: "Forest of Arden",
  },
  {
    src: F + "dalmahoy-full.mp4",
    at: 16,
    place: "Edinburgh",
    name: "Dalmahoy",
  },
  {
    src: F + "jockey-full.mp4",
    at: 22,
    place: "Newmarket",
    name: "Jockey Club Rooms",
  },
];

// full frame after the drop: two beats each, The Alfriston's afternoon tea last; no fireplaces (Scott, 5 Nov: "enough
// fireplaces, get the cosy interiors, beds, food")
const AFTER: Clip[] = [
  {
    src: F + "whittlebury-full.mp4",
    at: 24,
    place: "Northamptonshire",
    name: "Whittlebury Park",
  },
  {
    src: F + "burleigh-plate-full.mp4",
    at: 26,
    place: "The Cotswolds",
    name: "Burleigh Court",
  },
  {
    src: F + "oakley-hall.mp4",
    at: 28,
    place: "Hampshire",
    name: "Oakley Hall",
  },
  {
    src: F + "alfriston-tea-full.mp4",
    at: 30,
    place: "East Sussex",
    name: "The Alfriston",
  },
];

type Cut = { after: Clip[]; end: number; len: number };
const CUTS: Record<"reel" | "story", Cut> = {
  // three beats longer for the slower recap, so the end card keeps its eight beats (the music file runs on to 28s)
  reel: { after: AFTER, end: 32, len: 48 },
  story: { after: [], end: 24, len: 40 },
};
export const QUEUE_FRAMES = B(CUTS.reel.len);
export const QUEUE_STORY_FRAMES = B(CUTS.story.len);

const caps = (
  size: number,
  color: string,
  track = 0.18,
): React.CSSProperties => ({
  fontFamily: sans,
  fontWeight: 600,
  fontSize: size,
  letterSpacing: `${track}em`,
  textTransform: "uppercase",
  color,
});

const Video: React.FC<{ c: Clip; style?: React.CSSProperties }> = ({
  c,
  style,
}) => (
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
        <Sequence
          key={c.src}
          from={from}
          durationInFrames={to - from}
          layout="none"
        >
          <AbsoluteFill>
            <Video c={c} />
          </AbsoluteFill>
        </Sequence>
      );
    })}
  </>
);

// a line that rises out of its own mask
const Rise: React.FC<{
  at: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  dist?: number;
}> = ({ at, children, style, dist = 1 }) => {
  const frame = useCurrentFrame();
  const p = progress(frame, at, 16, EASE_OUT);
  return (
    <div style={{ overflow: "hidden", ...style }}>
      <div
        style={{
          transform: `translateY(${(1 - p) * 105 * dist}%)`,
          opacity: p,
        }}
      >
        {children}
      </div>
    </div>
  );
};

// the hotel's name over its shot, in the house order (Scott, 5 Nov: "should we add the location and the hotel name"):
// in the window a small caption at its foot, as part of the queue page; full frame (from Ruthin on, the drop itself
// left clean) the house label low on the left. Each fades in just after its cut and out just before the next.
const labelFor = (
  list: Clip[],
  frame: number,
  until: number,
  minAt: number,
  maxAt: number,
) => {
  for (let i = list.length - 1; i >= 0; i--) {
    const c = list[i];
    if (frame < B(c.at)) continue;
    if (c.at < minAt || c.at >= maxAt || !c.name) return null;
    const next = i + 1 < list.length ? B(list[i + 1].at) : until;
    const on = progress(frame, B(c.at), 3) * (1 - progress(frame, next - 4, 4)); // with the shot, not after it
    return on > 0 ? { c, on } : null;
  }
  return null;
};

const HouseLabel: React.FC<{ c: Clip; on: number; small?: boolean }> = ({
  c,
  on,
  small,
}) => {
  const k = small ? 0.84 : 1;
  return (
    <div
      style={{
        opacity: on,
        transform: `translateY(${(1 - on) * 10 * k}px)`,
        whiteSpace: "nowrap",
      }}
    >
      {/* the place as on Lee's artwork and the carousels (Scott, 5 Nov): tight mauve caps, no underline */}
      <div
        style={{
          ...caps(small ? 25 : 32, MAUVE, 0.02),
          fontWeight: 700,
          textShadow:
            "0 1px 3px rgba(9,9,10,0.85), 0 2px 14px rgba(9,9,10,0.75)",
        }}
      >
        {c.place}
      </div>
      <div
        style={{
          fontFamily: serif,
          fontSize: 66 * k,
          lineHeight: 1.1,
          marginTop: 12 * k,
          color: colors.cream,
          textShadow:
            "0 1px 4px rgba(9,9,10,0.7), 0 2px 24px rgba(9,9,10,0.85)",
        }}
      >
        {c.name}
      </div>
    </div>
  );
};

const WindowCaption: React.FC<{ burst: number }> = ({ burst }) => {
  const frame = useCurrentFrame();
  const l = labelFor(WAIT, frame, B(22), 0, 20);
  const out = 1 - progress(frame, DROP - 2, 5);
  // the shade stays put under every caption (Scott, 5 Nov: it "disappears and reappears before it changes in the
  // box"); only the words change, and it goes with the burst
  const shade = Math.min(1, frame / 6) * out * (1 - burst);
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 250,
          opacity: shade,
          background:
            "linear-gradient(to top, rgba(9,9,10,0), rgba(9,9,10,0.6) 50%, rgba(9,9,10,0.78))",
        }}
      />
      {l ? (
        // at the top of the window, centred under the capsule (Scott, 5 Nov: "put the location and hotel name higher
        // up so it's not so much eye travel up and down")
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 30,
            display: "flex",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <HouseLabel c={l.c} on={l.on * out} small />
        </div>
      ) : null}
    </>
  );
};

const FullLabel: React.FC<{ list: Clip[]; until: number }> = ({
  list,
  until,
}) => {
  const frame = useCurrentFrame();
  const l = labelFor(list, frame, until, 22, 1000);
  // the vignette held steady from the first full frame label to the recap, so it doesn't blink between shots
  const shade = progress(frame, B(22), 4) * (1 - progress(frame, until - 4, 4));
  if (!l && shade <= 0) return null;
  return (
    <>
      {/* a soft corner vignette behind the label, not a band across the frame (Scott, 5 Nov: "does the black bar
          have to be across the whole width"): darkest behind the words, gone by two thirds across, no edge */}
      <AbsoluteFill
        style={{
          opacity: shade,
          background:
            "radial-gradient(ellipse 820px 380px at 290px 1345px, rgba(9,9,10,0.66) 0%, rgba(9,9,10,0.5) 40%, rgba(9,9,10,0.2) 72%, rgba(9,9,10,0) 100%)",
        }}
      />
      {l ? (
        <div style={{ position: "absolute", left: 72, bottom: 520 }}>
          <HouseLabel c={l.c} on={l.on} />
        </div>
      ) : null}
    </>
  );
};

const Queue: React.FC<{ cut: Cut }> = ({ cut }) => {
  const frame = useCurrentFrame();
  const enter = B(18); // the capsule turns into Book now as 30% has landed
  const tap = B(19.5);
  // already open (Scott, 5 Nov: the reel goes up a day after the sale opens): the page says Now open. No 5 4 3 2 1
  // (Scott: "do we need the 5 4 3 2 1", rerendered without: a countdown to a sale that's already open): the one capsule
  // counts up to 30% (Scott: "a counter up to 30"; "I don't see the counting to 30 by the time I'm done reading"),
  // starting a beat in ("takes too long for the count to start") and climbing evenly to land half a beat before it
  // turns into Book now
  // the offer and Book now cross in the capsule, so it is never an empty pill (polish, 5 Nov)
  const offerOut = 1 - progress(frame, enter - 5, 6, EASE_IN_OUT);
  const COUNT_UP = 1;
  const pct = Math.round(
    // climbing from the first frame it shows, not resting on 0% while an ease gets going (polish, 5 Nov); easing only
    // into the 30
    30 * progress(frame, B(COUNT_UP), B(17.5) - B(COUNT_UP), COUNT_EASE),
  );
  const button = progress(frame, enter - 1, 8, EASE_OUT);
  const press = interpolate(frame, [tap, tap + 3, tap + 9], [1, 0.93, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ring = progress(frame, tap, 14, EASE_OUT);
  // the drop: the window bursts to full frame, the page falls away
  const burst = progress(frame, DROP, 10, EASE_OUT);
  const page = 1 - progress(frame, DROP, 6);
  const win = { x: 80, y: 430, w: 920, h: 900, r: 32 };
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
      {/* the page sits 150px lower, centred now nothing is under the window (the 5 4 3 2 1 moved into the capsule),
          sliding back up as the window bursts to full frame */}
      <AbsoluteFill style={{ transform: `translateY(${150 * (1 - burst)}px)` }}>
        {/* the page: a soft light behind the window */}
        <AbsoluteFill
          style={{
            opacity: page * intro,
            background:
              "radial-gradient(ellipse 70% 40% at 50% 42%, rgba(161,82,114,0.16), transparent 70%)",
          }}
        />
        <AbsoluteFill style={{ opacity: page * intro }}>
          <div
            style={{
              position: "absolute",
              top: 108, // 40px up: room between Now open and the capsule (Scott, 5 Nov)
              width: "100%",
              textAlign: "center",
              ...caps(32, MAUVE, 0.02),
            }}
          >
            Black Friday Sale
          </div>
          <div
            style={{
              position: "absolute",
              top: 146,
              width: "100%",
              textAlign: "center",
              fontFamily: serif,
              fontWeight: 400,
              fontSize: 96,
              color: colors.cream,
            }}
          >
            Now open
          </div>
          {/* one capsule up top that changes (Scott, 5 Nov: "get rid of the 5 4 3 2 1 [below], just the single capsule
            changes, too many places to look"): Save up to 30% counting up, then 5 4 3 2 1 in it on the beat, then it
            turns into Book now and takes the tap; it comes in as it starts counting so "0%" never sits on screen */}
          <div
            style={{
              position: "absolute",
              top: 292, // even gaps above and below the capsule (polish, 5 Nov)
              width: "100%",
              display: "flex",
              justifyContent: "center",
              opacity: progress(frame, B(COUNT_UP), 8),
            }}
          >
            <div
              style={{
                position: "relative",
                width: 420,
                height: 92,
                borderRadius: 46,
                overflow: "hidden",
                backgroundColor: MAUVE,
                fontFamily: sans,
                fontWeight: 600,
                color: colors.cream,
                textTransform: "uppercase",
                transform: `scale(${press})`,
                boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
              }}
            >
              <AbsoluteFill
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 16,
                  opacity: offerOut,
                  // a roll: the offer lifts out as Book now rises in
                  transform: `translateY(${-(1 - offerOut) * 22}px)`,
                }}
              >
                <span style={{ fontSize: 30, letterSpacing: "0.02em" }}>
                  Save up to
                </span>
                <span
                  style={{
                    fontSize: 48,
                    fontWeight: 700,
                    fontVariantNumeric: "lining-nums tabular-nums",
                    minWidth: 92,
                    textAlign: "right",
                  }}
                >
                  {pct}%
                </span>
              </AbsoluteFill>
              <AbsoluteFill
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: button,
                  transform: `translateY(${(1 - button) * 22}px)`,
                  ...caps(36, colors.cream, 0.04),
                }}
              >
                Book now
              </AbsoluteFill>
            </div>
          </div>
          {frame >= tap ? (
            <div
              style={{
                position: "absolute",
                left: 560 - 40 - ring * 40,
                top: 338 - 40 - ring * 40,
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
            outline:
              burst < 1
                ? `1px solid rgba(245,239,227,${0.16 * (1 - burst)})`
                : undefined,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: -box.left,
              top: -box.top,
              width: 1080,
              height: 1920,
            }}
          >
            <Clips
              list={WAIT}
              until={B(cut.after.length ? cut.after[0].at : cut.end)}
            />
          </div>
          <WindowCaption burst={burst} />
        </div>
      </AbsoluteFill>
      {/* The wait / is over, on the drop */}
      {frame >= DROP ? (
        <>
          <AbsoluteFill
            style={{
              background:
                "linear-gradient(to bottom, rgba(9,9,10,0.78), rgba(9,9,10,0.5) 30%, transparent 52%)",
              opacity: progress(frame, DROP + 4, 10),
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 270,
              width: "100%",
              textAlign: "center",
            }}
          >
            {["The wait", "is over"].map((l, i) => (
              <Rise
                key={l}
                at={DROP + 6 + i * 5}
                style={{
                  fontFamily: serif,
                  fontWeight: 400,
                  fontSize: 132,
                  lineHeight: 1.08,
                  color: colors.cream,
                  textShadow:
                    "0 2px 6px rgba(9,9,10,0.6), 0 4px 40px rgba(9,9,10,0.7)",
                }}
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
  // all at once, not staggered (Scott, 5 Nov: "last card just reveal all at once")
  const pill = progress(frame, at + 10, 14, EASE_OUT);
  // a dissolve from the recap's last photo, not a hard cut (Scott, 5 Nov: "the end card is just abrupt cut, feels
  // weird"); the type comes up together as the picture settles
  const dissolve = progress(frame, at, 12, EASE_IN_OUT);
  return (
    <AbsoluteFill style={{ opacity: dissolve }}>
      <Img
        // the wider crop from the landscape artwork, her elbows and the headboard whole (Scott, 5 Nov: "crop it
        // better"; `scripts/bf-end-9x16.py`), the type over its dark top as on the 4:5 artwork
        src={staticFile(P + "bed-9x16.jpg")}
        style={{
          width: "100%",
          height: "100%",
          transform: `scale(${push})`,
          transformOrigin: "50% 55%",
        }}
      />
      <div style={{ position: "absolute", left: 90, top: 250 }}>
        <Rise
          at={at + 10}
          style={{ ...caps(40, MAUVE, 0.02), marginBottom: 26 }}
        >
          The wait is over
        </Rise>
        {["Black Friday", "Sale"].map((l) => (
          <Rise
            key={l}
            at={at + 10}
            style={{
              fontFamily: serif,
              fontWeight: 600,
              fontSize: 170,
              lineHeight: 1.0,
              color: colors.cream,
              letterSpacing: "-0.01em",
            }}
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
        <span style={{ ...caps(62, colors.cream, 0.02), fontWeight: 700 }}>
          30%
        </span>
      </div>
      {/* the campaign's lockup, as on the official artwork: the gold CB over Classic British Hotels & Resorts */}
      <Img
        src={staticFile("brand/cbh-logo-on-light.svg")}
        style={{
          position: "absolute",
          right: 90,
          top: 1298,
          width: 150,
          opacity: pill,
        }}
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

// a recap before the end card (Scott, 5 Nov: "cycle through them all again rapidly before the Black Friday Sale,
// like a recap shutter"): the 14, north to south, a hard cut each, quickening from five frames to two, each kicking in
// at a touch over full size like a shutter; then the end card
const H = "hotels/";
const RECAP: { src: string; pos: string }[] = [
  // a second photo each, none the window or full frame shots already showed (Scott, 5 Nov: "are those duplicate photos,
  // maybe get a second photo each so we're not duplicating"), north to south, cosy picks
  { src: H + "dalmahoy/bedroom.jpg", pos: "45% 50%" },
  { src: H + "skipton/canal-reflection.jpg", pos: "35% 50%" }, // fewer pools in the recap (polish, 5 Nov)
  { src: H + "holdsworth-house/breakfast-in-bed.jpg", pos: "50% 50%" },
  { src: H + "gomersal-park/spa-pool.jpg", pos: "50% 50%" },
  { src: H + "waterton-park/footbridge-autumn.jpg", pos: "47% 50%" },
  { src: H + "the-imperial/seafront.jpg", pos: "50% 50%" }, // not a third afternoon tea
  { src: H + "ruthin-castle/white-bed.jpg", pos: "50% 50%" },
  { src: H + "oaklands-hall/plate.jpg", pos: "50% 50%" },
  { src: H + "forest-of-arden/pool.jpg", pos: "50% 50%" },
  { src: H + "jockey-club-rooms/bedroom-blue.jpg", pos: "45% 50%" }, // the full frame shot is the green bedroom
  { src: H + "whittlebury-park/salt-sauna.jpg", pos: "50% 50%" },
  { src: H + "burleigh-court/bedroom.jpg", pos: "45% 50%" },
  { src: H + "oakley-hall/bedroom.jpg", pos: "60% 50%" },
  { src: H + "the-alfriston/bedroom.jpg", pos: "40% 50%" },
];
const RECAP_BEATS = 8; // calm and steady (Scott: "not so manic", "a calmer steady shutter", "a little slower"): ~9 frames each
const Recap: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const total = B(RECAP_BEATS);
  const w = RECAP.map(() => 1); // an even beat, every shot the same length
  const scale = total / w.reduce((a, b) => a + b, 0);
  let t = at;
  for (let k = 0; k < RECAP.length; k++) {
    const d = w[k] * scale;
    if (frame < t + d || k === RECAP.length - 1) {
      const kick = 1.03 - 0.03 * Math.min(1, (frame - t) / Math.max(1, d));
      return (
        <AbsoluteFill style={{ backgroundColor: colors.black }}>
          <Img
            src={staticFile(RECAP[k].src)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: RECAP[k].pos,
              transform: `scale(${kick})`,
            }}
          />
        </AbsoluteFill>
      );
    }
    t += d;
  }
  return null;
};

export const QueueReel: React.FC<{ story?: boolean }> = ({ story = false }) => {
  const frame = useCurrentFrame();
  const cut = CUTS[story ? "story" : "reel"];
  const recap = B(cut.end);
  const end = B(cut.end + RECAP_BEATS);
  const len = B(cut.len);
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      <Queue cut={cut} />
      <Clips list={cut.after} until={recap} />
      {/* the full frame labels: Ruthin (still in the window's list) and the shots after it */}
      <FullLabel list={[...WAIT, ...cut.after]} until={recap} />
      {frame >= recap && frame < end + 12 ? <Recap at={recap} /> : null}
      {/* a soft camera shutter on each photo of the recap (Scott, 5 Nov: "maybe even add a sound"; synthesised, peaks
          -18 dBFS, under the music; recap-shutter.wav is timed to RECAP_BEATS over the 14 photos) */}
      {/* a soft press on Book now, in the track's one beat stop (peaks -16 dBFS) */}
      <Sequence from={B(19.5)} durationInFrames={10}>
        <Audio src={staticFile(P + "tap.wav")} volume={0.9} />
      </Sequence>
      <Sequence from={recap} durationInFrames={end - recap + 20}>
        <Audio src={staticFile(P + "recap-shutter.wav")} volume={0.8} />
      </Sequence>
      {frame >= end && !OFFICIAL_END ? <EndCard at={end} len={len} /> : null}
      {/* the white CB in its corner (Scott, 5 Nov: "also needs the white CB"; it was taken off on 3 Nov), where every
          film has it, until the end card, which carries the gold lockup in that corner */}
      {frame < end ? (
        <Img
          src={staticFile("brand/cb-watermark.png")}
          style={{
            position: "absolute",
            left: 920,
            top: 1452 + 150 * (1 - progress(frame, DROP, 10, EASE_OUT)), // below the window on the page, in its corner once full frame
            width: 100,
            height: 108,
            opacity: 1 - progress(frame, end - 6, 6),
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
