import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { FilmFinish } from "../components/FilmFinish";
import { HotelName } from "../story/HotelName";
import { colors, EASE_IN_OUT, progress } from "../theme";

// The Black Friday follow up reel (`black-friday-steam`; Scott, 4 Nov, in the spirit of Fairlawns'
// lipstick heart on the mirror, which Bianca liked). It opens on the hook: the steamed glass over Rowton
// Hall's indoor pool, a finger drawing the gift tag and "Black / Friday / Sale" (the still
// out/black-friday/cbh-black-friday-steam.jpg set in motion, frames from scripts/steam-tag-frames.py),
// a drip; then a palm wipes the steam off (Scott: "put Black Friday Sale on the tag in the beginning then
// reveal the stuff"; the official asset is out, "that's already out") and the hotels are behind the
// glass, landing on the track's drop: Rowton Hall (the indoor pool, cake by the fire, a facial, a churro), the
// Kingfisher (the river, the log burner), Barnett Hill (salmon at dinner, breakfast in bed), each name
// once over its own shots (the `black-friday-close-v3` montage, its clips from claude/loving-brown-0k56ps).
// The close: CBH's official Black Friday asset on the track's last bar (Scott). No hotel name over
// the tag. The small white CB sits in the corner until the official asset, which has its own logo.
//
// Music (Scott's pick after Luxury, Dirty Thinkin' and Party Dance): Rich Enough (Instrumental) by pietix
// (Pixabay 510327, also on cbh-screens), 112.2 BPM, edited by scripts/black-friday-steam-audio.sh: the
// build's last two bars under the tag, the drop on the reveal, the groove under the montage, a jump of a
// phrase under the cut into the last shot (beat 32), then the track plays on into its own last bar and tail.

export const STEAM_FPS = 30;
const BEAT = 0.5348;
// beat n -> frame: the film opens two bars before the drop (beat 8)
const b = (n: number) => Math.round(n * BEAT * STEAM_FPS);
// every cut a frame ahead of its beat (the picture reads on the beat)
const c = (n: number) => Math.max(0, b(n) - 1);
const DROP = b(8);
// the wipe: straight after the drip (Scott: "too long on the steam"), clear on the drop
const WIPE = b(6.8);
const WIPE_LEN = DROP - WIPE;
const CLIP = 130; // steam-tag.mp4: beats 0-8, the tag, the words, the drip
const CARD = c(36); // the track's own last bar
// the close bookends the opener (Scott: the cut to the official asset was "abrupt and stutters ... needs
// like another wipe"): the last shot mists over like the glass, then the same palm wipe reveals the
// asset, clear on the last bar
const MIST = c(33.6);
const WIPE2 = c(34.8);
// the wipe settles a third of a second past the bar line (Scott, 9 Nov: the ending "is abrupt"; it snapped in)
const WIPE2_LEN = CARD - WIPE2 + 10;
// its last kick lands three beats into that bar, then the tail
// then its tail rings out to silence (about 4.4s after the kick; Scott heard the end clipped)
export const STEAM_FRAMES = b(39) + 86;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const D = "campaigns/black-friday-close";

// name, first frame, and any grade of its own (as on v3); each slot fits its clip's length.
const SHOTS: [string, number, string?][] = [
  // the pool wide opens out of the wipe: the steamed glass was this pool (Scott: no outside shot)
  ["poolwide", WIPE, "sepia(0.06)"],
  ["cake", c(11)],
  ["massage", c(14), "brightness(1.1)"],
  ["churro", c(17)],
  ["river", c(21), "sepia(0.1)"],
  ["fire", c(25)],
  ["dinner", c(29)],
  ["breakfast", c(32), "brightness(0.96)"],
];

const HOTELS: { name: string; place: string; from: number; to: number }[] = [
  { name: "Rowton Hall Hotel & Spa", place: "Chester", from: DROP, to: c(21) },
  { name: "The Kingfisher", place: "Bedford", from: c(21), to: c(29) },
  { name: "Barnett Hill", place: "Guildford, Surrey", from: c(29), to: c(34) },
];

// One gentle grade over the lot (Rowton, the Kingfisher and Barnett Hill shot on different phones)
const GRADE = "saturate(1.04) contrast(1.03) sepia(0.06)";

const Shot: React.FC<{ name: string; len: number; grade?: string }> = ({ name, len, grade = "" }) => {
  const frame = useCurrentFrame();
  const push = interpolate(frame, [0, len], [1, 1.03], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      <OffthreadVideo
        src={staticFile(`${D}/${name}.mp4`)}
        muted
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${push})`,
          filter: `${GRADE} ${grade}`.trim(),
        }}
      />
    </AbsoluteFill>
  );
};

// The steam tag, the opener: the frames carry the steam, the finger and the drip; a barely-there
// drift so it never sits frozen.
const SteamTag: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, CLIP], [1, 1.025], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      <OffthreadVideo
        src={staticFile("campaigns/black-friday-steam/steam-tag.mp4")}
        muted
        style={{ width: "100%", height: "100%", transform: `scale(${drift})`, filter: GRADE }}
      />
    </AbsoluteFill>
  );
};

// The palm's wipe: one gesture in three broad passes down the pane, the stroke drawn on by its dash,
// its edges soft (an SVG drawn as a CSS mask over the first shot, so the hotel shows through where the
// steam has gone).
const SWEEP = [
  "M -420 230 C 240 170 840 380 1500 400",
  "C 1900 420 1900 960 1500 960",
  "C 840 940 240 1060 -420 1080",
  "C -820 1100 -820 1640 -420 1640",
  "C 240 1630 840 1760 1500 1780",
].join(" ");
// The mask is an inline SVG <mask> in the page, referenced by id, so every frame has it the moment it
// draws (a data URL mask was decoded asynchronously and lagged a frame now and then: Scott saw a
// stutter in both wipes).
// The sweep's turns happen off the frame's edges, so drawing it at an even pace cleared the glass in
// spurts: still frames at each turn, then a lurch (Scott: "a little stutter at the end swipe"). This
// maps the wipe's progress to how far along the stroke to draw so the cleared area grows evenly:
// measured by rasterising the stroke (the area covered at 201 points along it, inverted at 21).
const DASH_FOR_AREA = [
  0.0, 0.0336, 0.0557, 0.077, 0.0972, 0.1161, 0.1352, 0.1644, 0.4045, 0.4266, 0.4471, 0.4662, 0.4853, 0.504,
  0.5233, 0.7682, 0.796, 0.8223, 0.8482, 0.8747, 1.0,
];
const dashFor = (p: number) =>
  interpolate(p, DASH_FOR_AREA.map((_, i) => i / (DASH_FOR_AREA.length - 1)), DASH_FOR_AREA, clamp);

const Wiped: React.FC<{ children: React.ReactNode; len?: number; id: string }> = ({ children, len = WIPE_LEN, id }) => {
  const frame = useCurrentFrame();
  const p = progress(frame, 0, len, EASE_IN_OUT);
  if (p >= 1) return <>{children}</>;
  // the shot comes up out of a soft focus as the glass clears
  const focus = 8 * (1 - p);
  const m = `url(#${id})`;
  const clean = interpolate(frame, [len * 0.62, len], [0, 1], { ...clamp, easing: EASE_IN_OUT });
  return (
    <AbsoluteFill>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <defs>
          <filter id={`${id}-soft`} filterUnits="userSpaceOnUse" x={-600} y={-600} width={2280} height={3120}>
            <feGaussianBlur stdDeviation={36} />
          </filter>
          <mask id={id} maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" x={0} y={0} width={1080} height={1920}>
            <path
              d={SWEEP}
              fill="none"
              stroke="#fff"
              strokeWidth={780}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset={(1 - dashFor(p)).toFixed(4)}
              filter={`url(#${id}-soft)`}
            />
          </mask>
        </defs>
      </svg>
      <AbsoluteFill
        style={{
          WebkitMaskImage: m,
          maskImage: m,
          filter: focus > 0.05 ? `blur(${focus.toFixed(2)}px)` : undefined,
        }}
      >
        {children}
      </AbsoluteFill>
      {/* the sweep's soft edges never quite reach the corners, so a sliver of the shot before hung on
          there and vanished in one frame (Scott: "a blip on the swipe like a leftover clip"); over the
          last stretch the whole shot fades in on top, so what's left of the glass dissolves */}
      {clean > 0 ? <AbsoluteFill style={{ opacity: clean }}>{children}</AbsoluteFill> : null}
    </AbsoluteFill>
  );
};

// The grain and vignette, fading out across the closing wipe (they stopped dead on the last bar: a pop)
const Finish: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: 1 - progress(frame, WIPE2, WIPE2_LEN, EASE_IN_OUT) }}>
      <FilmFinish />
    </AbsoluteFill>
  );
};

// The close (Scott: "should we end on the official asset", yes): CBH's official Black Friday 4:5 ("THE
// WAIT IS OVER / Black Friday Sale / SAVE UP TO 30%", the robe at the curtains) on the track's last bar,
// set high so its offer stays clear of the Reels caption, a blurred, darker copy filling above and
// below, its own top and bottom feathered into it, settling from a slight push to the end.
const OFFICIAL = staticFile("campaigns/black-friday-steam/official-curtains-4x5.jpg");
const ASSET_TOP = 220;
const FEATHER =
  "linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)";

// The last shot steaming over, as the glass did at the start: soft focus and a pale haze.
const Misted: React.FC<{ at: number; len: number; children: React.ReactNode }> = ({ at, len, children }) => {
  const frame = useCurrentFrame();
  const m = progress(frame, at, len, EASE_IN_OUT);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: m > 0.01 ? `blur(${(m * 16).toFixed(2)}px)` : undefined }}>{children}</AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: `rgba(219, 221, 223, ${(0.5 * m).toFixed(3)})` }} />
    </AbsoluteFill>
  );
};

const OfficialEnd: React.FC = () => {
  const frame = useCurrentFrame();
  const len = STEAM_FRAMES - WIPE2;
  // an even, slow push all the way to the end, so the hold never freezes
  const push = interpolate(frame, [0, len], [1.0, 1.05], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      <AbsoluteFill style={{ transform: `scale(${push.toFixed(4)})`, transformOrigin: `540px ${ASSET_TOP + 675}px` }}>
        <Img
          src={OFFICIAL}
          style={{
            position: "absolute",
            left: -300,
            top: -160,
            width: 1680,
            height: 2240,
            objectFit: "cover",
            filter: "blur(36px)",
            opacity: 0.5,
          }}
        />
        <Img
          src={OFFICIAL}
          style={{
            position: "absolute",
            left: 0,
            top: ASSET_TOP,
            width: 1080,
            height: 1350,
            WebkitMaskImage: FEATHER,
            maskImage: FEATHER,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// the corner CB, leaving as the wipe brings in the official asset's own logo
const CornerCB: React.FC = () => {
  const frame = useCurrentFrame();
  const o = 1 - progress(frame, WIPE2, WIPE2_LEN, EASE_IN_OUT);
  return (
    <Img
      src={staticFile("brand/cb-watermark.png")}
      style={{ position: "absolute", left: 920, top: 1452, width: 100, height: 108, opacity: o }}
    />
  );
};

const EndFade: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{ backgroundColor: colors.black, opacity: progress(frame, STEAM_FRAMES - 42, 40, EASE_IN_OUT) }}
    />
  );
};

export const VoucherSteam: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      <Sequence durationInFrames={CLIP}>
        <SteamTag />
      </Sequence>
      {SHOTS.map(([name, from, grade], i) => {
        const len = (SHOTS[i + 1]?.[1] ?? CARD) - from;
        const shot = <Shot name={name} len={len} grade={grade} />;
        const last = i === SHOTS.length - 1;
        return (
          <Sequence key={name} from={from} durationInFrames={len}>
            {i === 0 ? (
              <Wiped id="wipe-open">{shot}</Wiped>
            ) : last ? (
              <Misted at={MIST - from} len={WIPE2 + 6 - MIST}>
                {shot}
              </Misted>
            ) : (
              shot
            )}
          </Sequence>
        );
      })}
      {HOTELS.map((h) => (
        <Sequence key={h.place} from={h.from} durationInFrames={h.to - h.from}>
          <HotelName name={h.name} place={h.place} len={h.to - h.from} />
        </Sequence>
      ))}
      <Sequence from={WIPE2}>
        <Wiped id="wipe-close" len={WIPE2_LEN}>
          <OfficialEnd />
        </Wiped>
      </Sequence>
      {/* the grain and vignette stop at the official asset, shown as it is */}
      <Sequence durationInFrames={CARD}>
        <Finish />
      </Sequence>
      {/* the corner CB to the official asset, which carries its own logo */}
      <Sequence durationInFrames={CARD}>
        <CornerCB />
      </Sequence>
      {/* the picture fades to black as the last note rings out, not a dead stop on the held asset (Scott, 9 Nov) */}
      <EndFade />
      <Audio
        src={staticFile("campaigns/black-friday-steam/rich-enough-steam-edit.m4a")}
        volume={(f) => interpolate(f, [STEAM_FRAMES - 12, STEAM_FRAMES], [1, 0], clamp)}
      />
    </AbsoluteFill>
  );
};
