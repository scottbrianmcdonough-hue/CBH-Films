import { Audio, Video } from "@remotion/media";
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
import { colors, EASE_OUT, progress, sans, serif } from "../theme";
import { LEAVES_FRAMES, LEAVES_GUST, LeafPile } from "./LeafPile";
import pile from "./pile.json";

// The autumn leaves reel (Scott, 28 Oct: the leaves brand moment "with pictures or some real
// footage to make it a reel"). The wind is the one idea all the way through: a flurry of the
// same drawn leaves blows across the frame left to right and each cut to the next hotel's
// autumn shot happens behind it, on the beat (an object wipe, never a fake effect over a
// still frame). The last shot is buried by the leaves of the pile (`LeafPile` in its `over`
// mode, the ground fading in under them), and the gust on the bass clears them off the CB,
// which settles into the logo as in the brand moment. Music only (no rustle in the reel).
//
// Music: Fireplace Holiday (villatic_music, Pixabay; Scott checked it), 73 BPM, a beat every
// 0.8216s. The reel plays 172.72-207.2s: the hotels on the full band (beats 0-16), the
// bass dropping out at beat 16 (185.86s) under the firesides and the pile, and coming back
// on beat 32 (199.01s), where the gust lands.
export const AUTUMN_FPS = 30;
const BEAT = 0.8216 * AUTUMN_FPS;
const k = (n: number) => Math.round(n * BEAT);
const MUSIC_START = Math.round(172.719 * AUTUMN_FPS);
// the pile starts so its gust lands on beat 32
const PILE = k(32) - LEAVES_GUST;
export const AUTUMN_FRAMES = PILE + LEAVES_FRAMES;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const rand = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};
const leafSrc = (f: string) => staticFile(`campaigns/leaves/${f}`);
const A = "campaigns/autumn-leaves-reel";

type Shot = {
  src: string;
  video?: boolean;
  from: number; // the cut, in frames
  pos?: string; // object-position for a still's 9:16 crop
  // a still's Ken Burns move across its time on screen: zoom, and travel in frame pixels
  // (never more than the zoom's spare edge, (z - 1) * 540 across, (z - 1) * 960 down)
  move?: { z: [number, number]; x?: [number, number]; y?: [number, number] };
  label?: { name: string; place: string }; // none: the shot carries on the last label
  // a depth move made from the still (scripts/still-depth-dolly.py on a hand-drawn map), played in place of its
  // Ken Burns (Scott, 1 Nov: "are there depth moves on the leaves story")
  depth?: string;
};

// Outdoors in the afternoon to the fire after dark (no Kingfisher or Fairlawns: Scott). The
// hook: "Autumn suits us" (Scott: not "Follow the leaves", nothing corny).
const SHOTS: Shot[] = [
  {
    src: `${A}/gisborough-ivy.jpg`,
    from: 0,
    move: { z: [1.06, 1.16], x: [-25, 40], y: [0, -30] }, // in towards the house
    label: { name: "Gisborough Hall", place: "North Yorkshire" },
  },
  // (Rutland's lake was dropped, not autumn; then Ruthin's drive: Scott)
  {
    src: `${A}/ruthin-sumac.mp4`,
    video: true,
    from: k(6),
    label: { name: "Ruthin Castle Hotel & Spa", place: "Ruthin, North Wales" },
  },
  {
    src: "hotels/hintlesham-hall/autumn-main.jpg",
    from: k(10),
    pos: "38% 50%",
    move: { z: [1.04, 1.16], x: [0, 30], y: [20, -40] }, // down onto the plate
    label: { name: "Hintlesham Hall Hotel", place: "Ipswich, Suffolk" },
  },
  {
    src: "campaigns/showcase/wild-boar.jpg",
    from: k(14),
    move: { z: [1.12, 1.16], x: [-55, 55] }, // a slow drift across, with the wind
    label: { name: "Wild Boar Estate", place: "Lake District National Park" },
  },
  {
    // by the fire until the leaves bury it (Scott: it held too long from beat 16)
    src: `${A}/langshott-tea.jpg`,
    from: k(18),
    move: { z: [1.0, 1.14], x: [0, 25], y: [0, 30] }, // a long push towards the fire
    label: { name: "Langshott Manor", place: "Surrey" },
  },
];
const DX = 12;
// the last shot stays under the pile until its ground has faded in
const SHOTS_END = PILE + 170;

// A flurry: a light gust of leaves across the frame left to right, at its thickest on the
// cut (Scott: "less leaves on the transition, more subtle"), the dissolve doing the cut
// underneath. The leaves move as the pile's do in the air (Scott: those "look way better"):
// carried on the wind at an easy pace, tumbling slowly so each one turns over and catches
// the light (a turn is a squash through the edge, mirrored once over, the back paler and
// duller), each at its own height above the picture: higher means larger, faster, a softer
// shadow further off, and, nearest the lens, a touch out of focus.
const N = 24; // a few, kept subtle: the full pile is saved for the end (Scott)
const flurry = (seed: number) =>
  Array.from({ length: N }, (_, i) => {
    const r = (q: number) => rand(seed * 1000 + i * 13 + q);
    const kind = pile.leaves[Math.floor(r(1) * pile.leaves.length)];
    const z = 0.12 + 0.6 * r(2); // height above the picture
    return {
      k: kind.k,
      s: kind.s,
      z,
      x: -200 + 1480 * r(3), // where it is on the cut
      y: -100 + 2120 * r(4),
      vx: 20 + 14 * r(5) + 18 * z,
      vy: 3 + 5 * r(6),
      rz: r(7) * 360,
      spin: (r(8) - 0.5) * 7,
      // a slow tumble: the roll keeps turning, the pitch rocks
      ry0: r(9) * 360,
      rySpeed: (r(10) < 0.5 ? -1 : 1) * (3 + 5 * r(11)),
      ax: 25 + 40 * r(12),
      wx: 0.1 + 0.12 * r(13),
      ph: r(14) * 6.28,
      sway: 25 + 45 * r(15),
    };
  });

// cos of a turn, kept off zero so an edge-on leaf is a sliver, not nothing (as in the pile)
const flat = (deg: number) => {
  const c = Math.cos((deg * Math.PI) / 180);
  return Math.sign(c || 1) * Math.max(0.08, Math.abs(c));
};

const WINDOW = 90; // wide enough that every leaf enters and leaves off-frame

// `n`: how many of the flurry's leaves fly (the line Story: half, Scott 1 Nov: "a few less leaves on the transitions")
const Flurry: React.FC<{ at: number; seed: number; n?: number }> = ({
  at,
  seed,
  n = N,
}) => {
  const frame = useCurrentFrame();
  const leaves = React.useMemo(() => flurry(seed).slice(0, n), [seed, n]);
  const t = frame - at;
  if (Math.abs(t) > WINDOW) return null;
  return (
    <AbsoluteFill>
      {leaves.map((l, i) => {
        const size = 320 * l.s * (1 + 0.55 * l.z);
        const x = l.x + l.vx * t + l.sway * Math.sin(t * 0.07 + l.ph);
        const y = l.y + l.vy * t + l.sway * 0.6 * Math.cos(t * 0.06 + l.ph);
        if (x < -size || x > 1080 + size) return null;
        const rz = l.rz + l.spin * t;
        const ry = l.ry0 + l.rySpeed * t;
        const rx = l.ax * Math.sin(t * l.wx + l.ph);
        const face =
          Math.cos((rx * Math.PI) / 180) * Math.cos((ry * Math.PI) / 180);
        const lit = (0.72 + 0.34 * Math.abs(face)) * (1 + 0.12 * l.z);
        const shOff = 10 + 150 * l.z;
        const base: React.CSSProperties = {
          position: "absolute",
          left: 0,
          top: 0,
          width: size,
          height: size,
        };
        return (
          <React.Fragment key={i}>
            <Img
              src={leafSrc(`shadow-${l.k}.png`)}
              style={{
                ...base,
                opacity: 0.4 * (1 - 0.6 * l.z) * Math.max(0.35, Math.abs(face)),
                transform: `translate(${x - size / 2 + shOff * 0.55}px, ${y - size / 2 + shOff}px) rotate(${rz}deg) scale(${(1 + 0.2 * l.z) * Math.max(0.3, Math.abs(Math.cos((ry * Math.PI) / 180)))}, ${Math.max(0.3, Math.abs(Math.cos((rx * Math.PI) / 180)))})`,
              }}
            />
            <Img
              src={leafSrc(`leaf-${l.k}.png`)}
              style={{
                ...base,
                transform: `translate(${x - size / 2}px, ${y - size / 2}px) rotate(${rz}deg) scale(${flat(ry).toFixed(4)}, ${flat(rx).toFixed(4)})`,
                filter: `brightness(${lit.toFixed(3)})${face < 0 ? " saturate(0.7) sepia(0.25)" : ""}${l.z > 0.45 ? ` blur(${((l.z - 0.45) * 5).toFixed(2)}px)` : ""}`,
              }}
            />
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

const Picture: React.FC<{ shot: Shot; frames: number }> = ({
  shot,
  frames,
}) => {
  const frame = useCurrentFrame();
  if (shot.video || shot.depth) {
    return (
      <Video
        src={staticFile(shot.depth ?? shot.src)}
        muted
        objectFit="cover"
        style={{ width: "100%", height: "100%" }}
      />
    );
  }
  // its Ken Burns move (Scott: "add some depth or Ken Burns moves"), linear like a camera
  // move; the barely-there push if it has none
  const t = Math.min(1, frame / frames);
  const m = shot.move ?? { z: [1, 1.04] as [number, number] };
  const lerp = (r?: [number, number]) => (r ? r[0] + (r[1] - r[0]) * t : 0);
  const z = lerp(m.z);
  return (
    <Img
      src={staticFile(shot.src)}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: shot.pos ?? "50% 50%",
        transform: `translate(${lerp(m.x).toFixed(2)}px, ${lerp(m.y).toFixed(2)}px) scale(${z.toFixed(5)})`,
      }}
    />
  );
};

// One line rising from behind its own baseline.
const Rise: React.FC<{ at: number; children: React.ReactNode }> = ({
  at,
  children,
}) => {
  const frame = useCurrentFrame();
  const p = progress(frame, at, 16, EASE_OUT);
  return (
    <div
      style={{
        overflow: "hidden",
        paddingBottom: "0.14em",
        marginBottom: "-0.14em",
      }}
    >
      <div style={{ transform: `translateY(${(1 - p) * 120}%)` }}>
        {children}
      </div>
    </div>
  );
};

const SHADOW = "0 2px 18px rgba(9,9,10,0.7)";

// The hotel: the place in gold caps with the still gold underline, the name in Cormorant,
// bottom-left over a soft shade; in after the leaves have passed, out before the next gust.
const Label: React.FC<{
  name: string;
  place: string;
  at: number;
  out: number;
}> = ({ name, place, at, out }) => {
  const frame = useCurrentFrame();
  const gone = interpolate(frame, [out - 8, out], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: gone }}>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(9,9,10,0) 52%, rgba(9,9,10,0.55) 68%, rgba(9,9,10,0.62) 80%, rgba(9,9,10,0.3) 100%)",
          opacity: progress(frame, at - 6, 12),
        }}
      />
      <div style={{ position: "absolute", left: 72, bottom: 500 }}>
        <Rise at={at}>
          <div
            style={{
              fontFamily: sans,
              fontWeight: 600,
              fontSize: 28,
              letterSpacing: "0.26em",
              textTransform: "uppercase",
              color: colors.gold,
              textShadow: SHADOW,
              whiteSpace: "nowrap",
              marginBottom: 14,
            }}
          >
            <span
              style={{
                display: "inline-block",
                paddingBottom: 8,
                borderBottom: `2px solid ${colors.gold}`,
              }}
            >
              <span style={{ marginRight: "-0.26em" }}>{place}</span>
            </span>
          </div>
        </Rise>
        <Rise at={at + 4}>
          <div
            style={{
              fontFamily: serif,
              fontSize: 76,
              lineHeight: 1.05,
              color: colors.cream,
              whiteSpace: "nowrap",
              textShadow: SHADOW,
            }}
          >
            {name}
          </div>
        </Rise>
      </div>
    </AbsoluteFill>
  );
};

// The hook, set from frame one in the top third: the reel's one line.
const Hook: React.FC<{ out: number }> = ({ out }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [out - 10, out], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(9,9,10,0.5) 0%, rgba(9,9,10,0.35) 22%, rgba(9,9,10,0) 40%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 72,
          top: 290,
          fontFamily: serif,
          fontStyle: "italic",
          fontSize: 112,
          lineHeight: 1.02,
          color: colors.cream,
          textShadow: SHADOW,
        }}
      >
        Autumn
        <br />
        suits us
      </div>
    </AbsoluteFill>
  );
};

export const AutumnLeavesReel: React.FC = () => {
  const frame = useCurrentFrame();
  const cuts = SHOTS.map((s) => s.from);
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      <Audio
        src={staticFile("campaigns/now-arriving/fireplace-holiday.mp3")}
        trimBefore={MUSIC_START}
        volume={(f) =>
          0.8 *
          interpolate(f, [AUTUMN_FRAMES - 30, AUTUMN_FRAMES - 1], [1, 0], clamp)
        }
      />
      {SHOTS.map((shot, i) => {
        // a short dissolve (DX frames) centred on the beat, under the passing leaves
        const from = i === 0 ? 0 : shot.from - DX / 2;
        const to =
          i < SHOTS.length - 1 ? SHOTS[i + 1].from + DX / 2 : SHOTS_END;
        return (
          <Sequence key={shot.src} from={from} durationInFrames={to - from}>
            <AbsoluteFill
              style={{
                opacity:
                  i === 0
                    ? 1
                    : interpolate(frame - from, [0, DX], [0, 1], clamp),
              }}
            >
              <Picture shot={shot} frames={to - from} />
            </AbsoluteFill>
          </Sequence>
        );
      })}
      {SHOTS.map((shot, i) => {
        if (!shot.label) return null;
        // a label holds until the next labelled shot; the last clears before the pile's
        // leaves bury its shot
        const next = SHOTS.slice(i + 1).find((s) => s.label);
        const to = next ? next.from : PILE + 40;
        const at = i === 0 ? 14 : 10;
        return (
          <Sequence
            key={`l${i}`}
            from={shot.from}
            durationInFrames={to - shot.from}
          >
            <Label {...shot.label} at={at} out={to - shot.from - 4} />
          </Sequence>
        );
      })}
      <Sequence durationInFrames={cuts[1]}>
        <Hook out={cuts[1] - 6} />
      </Sequence>
      {/* the CB mark on the shots, going as the pile covers them */}
      <Img
        src={staticFile("brand/cb-watermark.png")}
        style={{
          position: "absolute",
          left: 920,
          top: 1452,
          width: 100,
          height: 108,
          opacity: interpolate(frame, [PILE + 50, PILE + 80], [1, 0], clamp),
        }}
      />
      {/* the opening gust clears over the first shot; one at every cut */}
      <Flurry at={2} seed={1} />
      {cuts.slice(1).map((c, i) => (
        <Flurry key={c} at={c} seed={i + 2} />
      ))}
      <Sequence from={PILE}>
        <LeafPile over />
      </Sequence>
      <FilmFinish />
    </AbsoluteFill>
  );
};

// The Story cut: every hotel and less time on the CB (Scott, 30 Oct: "needs more hotels and
// less on the CB"). The hook over Gisborough (four beats), then Ruthin's sumac, Hintlesham,
// the Wild Boar and Langshott's tea by the fire, three beats each; the pile's leaves come
// in 1.4x faster, so Langshott is buried sooner, the gust still lands on the bass's return,
// and the Story ends on the shimmer's last beat instead of holding the logo.
const S_ARRIVE = Math.round(LEAVES_GUST / 1.4); // the pile's leaves-in, sped up
const S_GUST = k(25);
const S_PILE = S_GUST - S_ARRIVE;
export const AUTUMN_STORY_FRAMES = S_GUST + k(8.5); // the shimmer is over by beat 8.25
const S_MUSIC_START = Math.round(199.01 * AUTUMN_FPS) - S_GUST;
// the four stills as depth moves (campaigns/autumn-leaves-reel/make-depth.py: the house a plane with the lawn
// coming forward, the bottle and glass sliding over the table, the pudding's plate over the soft room, the tea and
// fire one plane with the tablecloth coming forward), each the length of its time on screen
const CLIPS = "campaigns/autumn-leaves-reel/clips";
const STORY_SHOTS: Shot[] = [
  { ...SHOTS[0], depth: `${CLIPS}/gisborough.mp4` },
  // Ruthin and Hintlesham four beats each (Scott, 1 Nov: "hold any longer on Ruthin and Hintlesham"): Hintlesham's
  // move remade at 117 frames (ruthin-sumac-story.mp4, the sumac slowed to fit, is no longer used)
  // Ruthin is now its breakfast table by the window (Scott's photo, 1 Nov: "swap this photo for Ruthin"; 1024px, so
  // a gentle pan from the plate to the chair with a slight push, no depth: hotels/ruthin-castle/breakfast-window.jpg)
  { ...SHOTS[1], from: k(4), depth: `${CLIPS}/ruthin-breakfast.mp4` },
  { ...SHOTS[2], from: k(8), depth: `${CLIPS}/hintlesham.mp4` },
  { ...SHOTS[3], from: k(12), depth: `${CLIPS}/wildboar.mp4` },
  { ...SHOTS[SHOTS.length - 1], from: k(15), depth: `${CLIPS}/langshott.mp4` },
];
// the last shot stays under the pile until its ground has faded in (pile frame 170)
const S_END_SHOTS = S_PILE + Math.round(170 / 1.4);

// the pile on the Story's clock: its leaves-in compressed into S_ARRIVE frames, then 1:1
// from the gust so the lockup keeps to the music's beats
const StoryPile: React.FC<{ bare?: boolean; line?: string[] }> = ({
  bare,
  line,
}) => {
  const f = useCurrentFrame();
  const pf =
    f < S_ARRIVE ? (f * LEAVES_GUST) / S_ARRIVE : LEAVES_GUST + (f - S_ARRIVE);
  return <LeafPile over frame={pf} bare={bare} line={line} />;
};

// `bare`: the gust reveals the gold CB and it stays there, no wordmark, no shimmer (autumn-leaves-story-bare)
// `line`: the gust reveals a line on the ground, no gold, the white CB kept in its corner (autumn-leaves-story-line)
export const AutumnLeavesStory: React.FC<{
  bare?: boolean;
  line?: string[];
}> = ({ bare, line }) => {
  const frame = useCurrentFrame();
  const end = AUTUMN_STORY_FRAMES;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      <Audio
        src={staticFile("campaigns/now-arriving/fireplace-holiday.mp3")}
        trimBefore={S_MUSIC_START}
        volume={(f) => 0.8 * interpolate(f, [end - 30, end - 1], [1, 0], clamp)}
      />
      {STORY_SHOTS.map((shot, i) => {
        const from = i === 0 ? 0 : shot.from - DX / 2;
        const to =
          i < STORY_SHOTS.length - 1
            ? STORY_SHOTS[i + 1].from + DX / 2
            : S_END_SHOTS;
        return (
          <Sequence key={shot.src} from={from} durationInFrames={to - from}>
            <AbsoluteFill
              style={{
                opacity:
                  i === 0
                    ? 1
                    : interpolate(frame - from, [0, DX], [0, 1], clamp),
              }}
            >
              <Picture shot={shot} frames={to - from} />
            </AbsoluteFill>
          </Sequence>
        );
      })}
      {STORY_SHOTS.map((shot, i) => {
        const to =
          i < STORY_SHOTS.length - 1 ? STORY_SHOTS[i + 1].from : S_PILE + 30;
        return (
          <Sequence
            key={`l${i}`}
            from={shot.from}
            durationInFrames={to - shot.from}
          >
            <Label
              {...shot.label!}
              at={i === 0 ? 14 : 10}
              out={to - shot.from - 4}
            />
          </Sequence>
        );
      })}
      {/* with a line at the end, the hook moves there (Scott: "or change that to the end") */}
      {line ? null : (
        <Sequence durationInFrames={k(4)}>
          <Hook out={k(4) - 6} />
        </Sequence>
      )}
      <Img
        src={staticFile("brand/cb-watermark.png")}
        style={{
          position: "absolute",
          left: 920,
          top: 1452,
          width: 100,
          height: 108,
          opacity: line
            ? 1
            : interpolate(frame, [S_PILE + 36, S_PILE + 57], [1, 0], clamp),
        }}
      />
      {/* with the line, the leaves fly only on the cuts (Scott: "you got it twice on Gisborough Hall") */}
      {line ? null : <Flurry at={2} seed={1} />}
      {STORY_SHOTS.slice(1).map((shot, i) => (
        <Flurry key={shot.from} at={shot.from} seed={i + 2} n={line ? 12 : N} />
      ))}
      <Sequence from={S_PILE}>
        <StoryPile bare={bare} line={line} />
      </Sequence>
      {line ? (
        // the white CB stays on over the pile and the end card (the watermark, not a brand moment)
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
      ) : null}
      {/* the pile's own fade-out is past the Story's end: fade the logo out here */}
      <AbsoluteFill
        style={{
          backgroundColor: colors.black,
          opacity: interpolate(frame, [end - 18, end - 2], [0, 1], clamp),
        }}
      />
      <FilmFinish />
    </AbsoluteFill>
  );
};

// The plain Story (Scott, 1 Nov: "one without the logo, just the white CB"; the week was heavy on brand moments): the
// five hotels with the hook and labels and the white CB in the corner, no pile and no lockup; Langshott holds to
// beat 17 and the whole thing fades out with the music. 14.0s, inside a Story's 15.
export const AUTUMN_STORY_PLAIN_FRAMES = k(19);
export const AutumnLeavesStoryPlain: React.FC = () => {
  const frame = useCurrentFrame();
  const end = AUTUMN_STORY_PLAIN_FRAMES;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      <Audio
        src={staticFile("campaigns/now-arriving/fireplace-holiday.mp3")}
        trimBefore={S_MUSIC_START}
        volume={(f) => 0.8 * interpolate(f, [end - 30, end - 1], [1, 0], clamp)}
      />
      {STORY_SHOTS.map((shot, i) => {
        const from = i === 0 ? 0 : shot.from - DX / 2;
        const to =
          i < STORY_SHOTS.length - 1 ? STORY_SHOTS[i + 1].from + DX / 2 : end;
        return (
          <Sequence key={shot.src} from={from} durationInFrames={to - from}>
            <AbsoluteFill
              style={{
                opacity:
                  i === 0
                    ? 1
                    : interpolate(frame - from, [0, DX], [0, 1], clamp),
              }}
            >
              <Picture shot={shot} frames={to - from} />
            </AbsoluteFill>
          </Sequence>
        );
      })}
      {STORY_SHOTS.map((shot, i) => {
        const to =
          i < STORY_SHOTS.length - 1 ? STORY_SHOTS[i + 1].from : end - 20;
        return (
          <Sequence
            key={`l${i}`}
            from={shot.from}
            durationInFrames={to - shot.from}
          >
            <Label
              {...shot.label!}
              at={i === 0 ? 14 : 10}
              out={to - shot.from - 4}
            />
          </Sequence>
        );
      })}
      <Sequence durationInFrames={k(4)}>
        <Hook out={k(4) - 6} />
      </Sequence>
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
      <Flurry at={2} seed={1} />
      {STORY_SHOTS.slice(1).map((shot, i) => (
        <Flurry key={shot.from} at={shot.from} seed={i + 2} />
      ))}
      <AbsoluteFill
        style={{
          backgroundColor: colors.black,
          opacity: interpolate(frame, [end - 18, end - 2], [0, 1], clamp),
        }}
      />
      <FilmFinish />
    </AbsoluteFill>
  );
};
