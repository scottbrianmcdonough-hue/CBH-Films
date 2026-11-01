import { Audio, Video } from "@remotion/media";
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
import { MOSAIC_PHOTOS } from "../mosaic/photos";
import { colors, EASE_IN_OUT, EASE_OUT, progress, sans, serif } from "../theme";

// "Screens", a fly-through of the collection (Scott: "multiple windows or squares flying past
// or like TV screens flying past each with different footage or stills / Ken Burns of hotels,
// so it's like a virtual space"). The camera drifts forward through a dark void; screens hang
// in it on every side, edged in fine gold, each a different hotel: real footage in the
// portrait ones, photos drifting slowly in the landscape ones, footage and stills alternating
// (Scott's rule on the festive reel), all cosy, nothing that reads as summer (Scott: "should
// probably be winter footage"). They come out of the dark ahead, brighten and slide past the
// edges of the frame. A faint gold dust hangs in the space. The camera picks up speed on the
// drop, then eases into one screen until it is the frame, the Kingfisher's dessert by the
// fire, with its label. As the band stops the screen drifts back into the space, the other
// screens around it fading up out of the dark, and the question rises over them: "Flying visit,
// / or stay a while?" (Scott, 31 Oct: better than "Which one caught your eye?", "like just flying
// through or something to do with hotels"), the white CB in its corner.
// CSS 3D (Chrome sorts the planes by depth), so the footage plays frame-accurate; a plane at
// translateZ(P - d) is d px from the eye (the perspective puts the eye P in front of z = 0).
// Polish (Scott: "smoother, more natural"): the camera's speed is one smooth curve (drift, a
// push on the drop, cruise, a long ease in) and never quite stops, the sway is softer, and the
// hand-off to the full-frame shot is matched to the pixel, so it reads as one move.
// Faster (Scott: "kind of drags"): a shorter drift, a quicker cruise, a three-second hold and a
// quicker end. Music: Rich Enough (Instrumental) by pietix (Pixabay 510327, Scott's pick for
// Bianca: Deep House Sunset was out, "we need a different track"), from 138.44s, two bars
// before its full drop at 142.55s (after the breakdown and the four-bar build): the camera
// pushes on the drop, lands four bars later, the screen drifts back two bars after that, the
// question on the next bar line, the music fading over the last bar.

const W = 1080;
const H = 1920;
const P = 1844; // perspective: a 55-degree vertical field of view
const FAR = 9000; // screens come out of the dark from here
const NEAR = 60;
const MUSIC = "stings/screens/rich-enough.mp3";

const FOOTAGE = [
  "hotels/fairlawns/copper-bath.mp4",
  "campaigns/november/hotels/kingfisher-tea-pour-slow.mp4",
  "hotels/ruthin-castle/sumac-and-ruins.mp4",
  "campaigns/departures/hotels/castle-inn-fireside.mp4",
  "hotels/fairlawns/sauce-pour.mp4",
  "campaigns/november/hotels/ilsington-map-window.mp4",
  "hotels/the-kingfisher/roast.mp4",
  "hotels/rutland-hall/spa-baths.mp4",
  "hotels/fairlawns/afternoon-tea.mp4",
  "hotels/ruthin-castle/hot-tub.mp4",
  "campaigns/november/hotels/ilsington-scone-slow.mp4",
  "hotels/fairlawns/food-spread.mp4",
  "hotels/dalmahoy/syrup-pour.mp4",
  "hotels/fairlawns/bedroom.mp4",
  "hotels/ruthin-castle/pub-sign.mp4",
  "hotels/fairlawns/dish-and-wine.mp4",
];
// the flying screens play 720px proxies (public/stings/screens/, cut with a short GOP so
// seeking is quick): a dozen full-size clips at once timed the render out
const proxy = (src: string) =>
  `stings/screens/${src.split("/").slice(-2).join("--")}`;

// the one the camera flies into: a winter evening by the fire (the first try, a chef at an
// ice-cream cart in the sun, read as summer), slowed to 0.42x with motion interpolation so it
// plays from HERO_FROM to the end without looping; until then its screen, still far off,
// holds the clip's first frame
const HERO_CLIP = "stings/screens/hero-slow.mp4"; // the-kingfisher/dessert-by-the-fire.mp4
const HERO_POSTER = "stings/screens/hero-poster.jpg";

// the photos, less anything green and sunny (gardens, golf, aerials, facades in leaf) and the
// pizza, which the collage left out too
const SUMMER = [
  "speech-house-walk",
  "garden-fells",
  "fell-walker",
  "cyclists",
  "golfer",
  "whittlebury-park/golf",
  "walton-hall",
  "waterton-park/aerial",
  "outdoor-hot-tub",
  "whitley-peacock",
  "showcase/wild-boar",
  "nailcote-magnolia",
  "alfriston",
  "holdsworth-house/aerial",
  "holdsworth-house/exterior",
  "golf-course",
  "aerial-grounds",
  "the-mount/aerial",
  "the-mount/entrance",
  "golf-club-pavilion",
  "garden-horse",
  "whittlebury-park/exterior",
  "gisborough-exterior",
  "the-kingfisher/river",
  "hintlesham-hall/facade",
  "ruthin-castle",
  "prince-rupert",
  "dalmahoy-golf",
  "black-friday/ruthin-hot-tub",
  "pizza",
];
const PHOTOS = MOSAIC_PHOTOS.filter((p) => !SUMMER.some((s) => p.includes(s)));

type Cut = {
  musicFrom: number; // s into the track
  gain: number; // to -15.5 LUFS
  // the moments, in beats from the drop
  decel: number;
  arrive: number;
  recede: number;
  line: number;
  end: number;
};

// one space, cut to a timeline: the reel and the Story share everything else
const makeSpace = (cut: Cut) => {
  const MUSIC_FROM = cut.musicFrom;
  // the track's beat in frames: 112.5 BPM, 16 frames a beat, beat 0 the drop's downbeat at
  // 142.496s (read off its kicks); everything lands on it (Scott: "snap to the beat a bit more")
  const BEAT0 = (142.496 - MUSIC_FROM) * 30;
  const beat = (n: number) => Math.round(BEAT0 + n * 16);
  const DROP = beat(0); // the full drop: the camera pushes on
  const DECEL = beat(cut.decel); // and starts easing in
  const ARRIVE = beat(cut.arrive); // the screen fills the frame
  const RECEDE = beat(cut.recede); // the screen drifts back into the space
  const LINE_AT = beat(cut.line); // on a bar: the question
  const SCREEN_SPACE_FRAMES = beat(cut.end); // the music fading over the last bar

  // the clip's steadiest stretch on the full-frame hold (its last second or so is handheld
  // wobble), the same frames in both cuts; it runs to the end either way (389 frames)
  const HERO_FROM = ARRIVE - 133;
  // a seeded random, so every render lays the space out the same
  const rng = (() => {
    let s = 20261020;
    return () => {
      s = (s * 16807) % 2147483647;
      return s / 2147483647;
    };
  })();

  const smooth = (t: number) => {
    const c = Math.min(1, Math.max(0, t));
    return c * c * (3 - 2 * c);
  };

  // the camera's speed, px a frame: one smooth curve, so the move never jolts. A slow drift
  // over the lighter bars, a push up to cruise on the drop, a long ease in to the screen, then
  // a creep that never quite stops (a dead stop reads as a freeze)
  const base = (f: number) => {
    if (f < DROP - 4) return 40 + 18 * smooth(f / (DROP - 4));
    if (f < DECEL) return 58 + 37 * smooth((f - (DROP - 4)) / 12);
    if (f < ARRIVE) return 95 - 94.6 * smooth((f - DECEL) / (ARRIVE - DECEL));
    return 0.4 - 0.25 * smooth((f - ARRIVE) / (RECEDE - ARRIVE));
  };
  // on every beat the camera surges forward and settles (the same mean speed, so the timing
  // holds): lightly through the build, harder after the drop, gone as it eases in
  const SURGE_MEAN = (3.5 / 16) * (1 - Math.exp(-16 / 3.5));
  const surge = (f: number) => {
    const t = (((f - BEAT0) % 16) + 16) % 16;
    const amount = f < DROP ? 0.3 : 0.75 * (1 - smooth((f - DECEL) / 40));
    return 1 + amount * (Math.exp(-t / 3.5) - SURGE_MEAN);
  };
  const speed = (f: number) => base(f) * (f < ARRIVE ? surge(f) : 1);
  const CZ: number[] = [0];
  for (let f = 1; f <= SCREEN_SPACE_FRAMES; f++) CZ.push(CZ[f - 1] + speed(f));
  const camZ = (f: number) => CZ[Math.min(SCREEN_SPACE_FRAMES, Math.max(0, f))];

  const HERO_H = 640;
  const HERO_W = (HERO_H * 9) / 16;
  // a touch closer than filling the frame, so its gold edge is just outside it as it lands
  const HERO_Z = camZ(ARRIVE) + (0.96 * HERO_H * P) / H;
  // at the end it sits this far off, raised clear of the question
  const HERO_END_D = 2400;
  const HERO_END_Y = -320; // px on screen

  type Screen = {
    x: number;
    y: number;
    z: number; // distance along the path, px
    w: number;
    h: number;
    yaw: number; // drawn, so the seeded layout holds, but not applied (see Plane)
    tilt: number;
    src: string;
    video: boolean;
    from: number; // a clip plays once from here (frames), holding its first frame before
    kb: { s0: number; s1: number; x0: number; x1: number };
  };

  // the proxies' lengths in frames: no clip ever loops (Scott saw the 2.4s tea pour jump back
  // to its start, twice, on the end card), so each plays once, timed to the screen it is on;
  // each proxy is one shot (the syrup pour, map and pub sign clips had cuts in them, trimmed)
  const CLIP_FRAMES: Record<string, number> = {
    "kingfisher-tea-pour-slow": 71,
    "ilsington-scone-slow": 72,
    "hot-tub": 79,
    "sumac-and-ruins": 79,
    "pub-sign": 72,
    "castle-inn-fireside": 82,
    "dish-and-wine": 88,
    bedroom: 112,
    "ilsington-map-window": 104,
    "spa-baths": 120,
    "copper-bath": 133,
    "sauce-pour": 135,
    "afternoon-tea": 140,
    "food-spread": 165,
    roast: 170,
    "syrup-pour": 301,
  };
  const clipFrames = (src: string) =>
    CLIP_FRAMES[src.split("/").slice(-1)[0].replace(".mp4", "")];
  // the ones long enough to run from the screen's drift back to the end without looping
  const LONG_FOOTAGE = FOOTAGE.filter(
    (f) => clipFrames(f) >= SCREEN_SPACE_FRAMES - RECEDE,
  );

  // the frame a screen at z first comes into range, and the frame it has all but passed
  const appearAt = (z: number) => {
    for (let f = 0; f <= ARRIVE; f++) if (z - camZ(f) < FAR) return f;
    return ARRIVE;
  };
  const passAt = (z: number) => {
    for (let f = 0; f <= ARRIVE; f++) if (z - camZ(f) < NEAR) return f;
    return ARRIVE;
  };

  // the barely-there push (Bianca dislikes an obvious Ken Burns)
  const kenBurns = () => ({
    s0: 1.0 + rng() * 0.02,
    s1: 1.04 + rng() * 0.02,
    x0: (rng() - 0.5) * 2,
    x1: (rng() - 0.5) * 2,
  });

  let photo = 0;
  let foot = 0;
  const nextSrc = (video: boolean) =>
    video
      ? FOOTAGE[foot++ % FOOTAGE.length]
      : PHOTOS[(photo++ * 7) % PHOTOS.length];

  const SCREENS: Screen[] = (() => {
    const out: Screen[] = [];
    // every ~440px of travel a screen, round the path a quadrant at a time so they never stack
    for (let z = 1500, i = 0; z < HERO_Z - 120; z += 380 + rng() * 120, i++) {
      const video = i % 2 === 0;
      const w = video ? 300 + rng() * 80 : 460 + rng() * 120;
      const h = video ? (w * 16) / 9 : (w * 2) / 3;
      const quad = i % 4;
      const sx = quad === 0 || quad === 3 ? 1 : -1;
      const sy = quad < 2 ? -1 : 1;
      // clear of the camera's lane: an edge at least 140px off the path on one axis
      const x = sx * (w / 2 + 140 + rng() * 520);
      const y = sy * (rng() * 900);
      out.push({
        x,
        y,
        z,
        w,
        h,
        yaw: -Math.sign(x) * (0.14 + rng() * 0.16),
        tilt: (rng() - 0.5) * 0.08,
        src: nextSrc(video),
        video,
        // a clip shorter than the screen's time in view runs out as it passes; until then,
        // while it is still far off and small, it holds its first frame
        from: 0,
        kb: kenBurns(),
      });
      const sc = out[out.length - 1];
      if (video)
        sc.from = Math.max(appearAt(z), passAt(z) - clipFrames(sc.src));
    }
    return out;
  })();

  // the space the screen drifts back into: screens all round it, placed on screen (clear of
  // the hero and of each other) at depths from 1700 to 5500 px, fading up out of the dark
  const FIELD: Screen[] = (() => {
    const out: Screen[] = [];
    const boxes: [number, number, number, number][] = [
      // the hero at the end, with a margin
      [
        540 - (HERO_W * P) / HERO_END_D / 2 - 40,
        960 + HERO_END_Y - (HERO_H * P) / HERO_END_D / 2 - 40,
        540 + (HERO_W * P) / HERO_END_D / 2 + 40,
        960 + HERO_END_Y + (HERO_H * P) / HERO_END_D / 2 + 40,
      ],
    ];
    const z0 = camZ(RECEDE);
    let long = 0;
    for (let tries = 0, i = 0; out.length < 28 && tries < 6000; tries++) {
      // a few of them footage, each a different long clip
      const video = i % 3 === 0 && long < LONG_FOOTAGE.length;
      const w = video ? 300 + rng() * 80 : 460 + rng() * 120;
      const h = video ? (w * 16) / 9 : (w * 2) / 3;
      const d = 1700 + rng() * 3800;
      const pw = (w * P) / d;
      const ph = (h * P) / d;
      const cx = -160 + rng() * (W + 320);
      const cy = -160 + rng() * (H + 320);
      // none bigger on screen than half the hero, so it stays the one
      if (
        pw * ph >
        0.5 * ((HERO_W * P) / HERO_END_D) * ((HERO_H * P) / HERO_END_D)
      )
        continue;
      const box: [number, number, number, number] = [
        cx - pw / 2 - 26,
        cy - ph / 2 - 26,
        cx + pw / 2 + 26,
        cy + ph / 2 + 26,
      ];
      if (
        boxes.some(
          (b) =>
            box[0] < b[2] && box[2] > b[0] && box[1] < b[3] && box[3] > b[1],
        )
      )
        continue;
      boxes.push(box);
      i++;
      out.push({
        x: ((cx - W / 2) * d) / P,
        y: ((cy - H / 2) * d) / P,
        z: z0 + d,
        w,
        h,
        yaw: (rng() - 0.5) * 0.4,
        tilt: (rng() - 0.5) * 0.06,
        src: video ? LONG_FOOTAGE[long++] : nextSrc(false),
        video,
        from: RECEDE,
        kb: kenBurns(),
      });
    }
    return out;
  })();

  // the gold dust: specks round the path, drifting a little, out past the end
  const DUST = Array.from({ length: 300 }, () => ({
    x: (rng() - 0.5) * 3200,
    y: (rng() - 0.5) * 4200,
    z: rng() * (HERO_Z + 7000),
    r: 1.5 + rng() * 2.5,
    ph: rng() * 6.28,
  }));

  const fog = (d: number) =>
    interpolate(d, [NEAR, 900, FAR * 0.55, FAR], [1, 1, 0.75, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  // the house label, only on the screen the camera flies into (the flying ones pass too fast to
  // read): the place in small gold caps with its underline on top, the name in cream Cormorant
  const LIFT = "0 3px 28px rgba(9,9,10,0.55), 0 1px 3px rgba(9,9,10,0.45)";
  const HeroLabel: React.FC = () => {
    const frame = useCurrentFrame();
    const a = progress(frame, ARRIVE, 12, EASE_OUT);
    const o = 1 - progress(frame, RECEDE - 14, 16, EASE_IN_OUT);
    return (
      <AbsoluteFill style={{ opacity: o * a }}>
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse 1150px 520px at 0px 400px, rgba(9,9,10,0.56) 0%, rgba(9,9,10,0.34) 45%, rgba(9,9,10,0) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 72,
            top: 300,
            transform: `translateY(${(1 - a) * 20}px)`,
          }}
        >
          <div style={{ display: "inline-block", marginBottom: 18 }}>
            <div
              style={{
                fontFamily: sans,
                fontWeight: 600,
                fontSize: 30,
                letterSpacing: "0.28em",
                color: colors.gold,
                textTransform: "uppercase",
              }}
            >
              Bedford
            </div>
            <div style={{ height: 2, background: colors.gold, marginTop: 8 }} />
          </div>
          <div
            style={{
              fontFamily: serif,
              fontSize: 92,
              lineHeight: 1.04,
              color: colors.cream,
              textShadow: LIFT,
            }}
          >
            The Kingfisher
          </div>
        </div>
      </AbsoluteFill>
    );
  };

  const Face: React.FC<{ s: Screen; appear: number }> = ({ s, appear }) => {
    const frame = useCurrentFrame();
    if (s.src === HERO_CLIP) {
      return frame < HERO_FROM ? (
        <Img
          src={staticFile(HERO_POSTER)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <Sequence from={HERO_FROM} layout="none">
          <Video
            src={staticFile(HERO_CLIP)}
            muted
            objectFit="cover"
            style={{ width: "100%", height: "100%" }}
          />
        </Sequence>
      );
    }
    if (s.video) {
      return frame < s.from ? (
        <Img
          src={staticFile(proxy(s.src).replace(".mp4", ".jpg"))}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <Sequence from={s.from} layout="none">
          <OffthreadVideo
            src={staticFile(proxy(s.src))}
            muted
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Sequence>
      );
    }
    // a slow Ken Burns, all the while it is in view
    const t = Math.min(1, Math.max(0, (frame - appear) / 300));
    const sc = s.kb.s0 + (s.kb.s1 - s.kb.s0) * t;
    const tx = s.kb.x0 + (s.kb.x1 - s.kb.x0) * t;
    return (
      <Img
        src={staticFile(s.src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `translateX(${tx.toFixed(2)}%) scale(${sc.toFixed(4)})`,
        }}
      />
    );
  };

  // one screen in the space, d px from the eye. Square to the camera, only tilted: Chrome drops
  // a plane turned on Y for a few frames when it hangs over the frame's edge (Scott: "it splits
  // and flickers")
  const Plane: React.FC<{
    s: Screen;
    d: number;
    camX: number;
    camY: number;
    appear: number;
    fade?: number;
    dim?: number;
  }> = ({ s, d, camX, camY, appear, fade = 1, dim = 1 }) => {
    const near = interpolate(d, [500, 4000], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return (
      <div
        style={{
          position: "absolute",
          width: s.w,
          height: s.h,
          marginLeft: -s.w / 2,
          marginTop: -s.h / 2,
          overflow: "hidden",
          borderRadius: 6,
          opacity: fog(d) * fade,
          border: `2px solid rgba(195,158,85,${(0.35 + 0.55 * near).toFixed(3)})`,
          boxShadow: `0 0 ${(18 + 30 * near).toFixed(0)}px rgba(195,158,85,${(0.08 + 0.22 * near).toFixed(3)})`,
          filter: `brightness(${((0.55 + 0.45 * near) * dim).toFixed(3)})`,
          transform: `translate3d(${(s.x - camX).toFixed(1)}px, ${(s.y - camY).toFixed(1)}px, ${(P - d).toFixed(1)}px) rotateZ(${s.tilt}rad)`,
        }}
      >
        <Face s={s} appear={appear} />
      </div>
    );
  };

  const HERO: Screen = {
    x: 0,
    y: 0,
    z: HERO_Z,
    w: HERO_W,
    h: HERO_H,
    yaw: 0,
    tilt: 0,
    src: HERO_CLIP,
    video: true,
    from: HERO_FROM,
    kb: { s0: 1, s1: 1, x0: 0, x1: 0 },
  };

  const ScreenSpace: React.FC = () => {
    const frame = useCurrentFrame();
    const cz = camZ(frame);
    // a soft drift and roll, several slow swells at once so it feels flown, not oscillating,
    // settling to nothing as the screen fills the frame
    const settle =
      1 - progress(frame, DECEL - 40, ARRIVE - DECEL + 40, EASE_IN_OUT);
    const camX =
      (Math.sin(frame / 97) * 24 + Math.sin(frame / 53 + 2) * 8) * settle;
    const camY =
      (Math.sin(frame / 83 + 1) * 18 + Math.sin(frame / 41 + 4) * 6) * settle;
    const roll =
      (Math.sin(frame / 120) * 0.9 + Math.sin(frame / 67 + 1) * 0.3) * settle;
    const full = frame >= ARRIVE && frame < RECEDE;
    const end = frame >= RECEDE;
    // the screen drifting back: its distance and its rise on screen
    const back = progress(frame, RECEDE, 32, EASE_IN_OUT); // two beats, settled for the line
    const heroD0 = HERO_Z - cz;
    const heroD = heroD0 + (HERO_END_D - heroD0) * back;
    const hero: Screen = {
      ...HERO,
      z: cz + heroD,
      y: (back * HERO_END_Y * heroD) / P,
    };
    // the full-frame shot carries on the camera's creep: scaled to match the screen exactly
    const fullScale = (HERO_H * P) / (heroD0 * H);
    const line = progress(frame, LINE_AT, 12, EASE_OUT);

    return (
      <AbsoluteFill style={{ backgroundColor: colors.black }}>
        <Audio
          src={staticFile(MUSIC)}
          trimBefore={Math.round(MUSIC_FROM * 30)}
          volume={(f) =>
            cut.gain *
            interpolate(
              f,
              [0, 4, beat(cut.end - 4), SCREEN_SPACE_FRAMES],
              [0, 1, 1, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            )
          }
        />
        {!full ? (
          <AbsoluteFill style={{ perspective: P, overflow: "hidden" }}>
            <div
              style={{
                position: "absolute",
                left: W / 2,
                top: H / 2,
                transformStyle: "preserve-3d",
                transform: `rotateZ(${roll}deg)`, // no turn on Y (see Plane)
              }}
            >
              {DUST.map((d, i) => {
                const dz = d.z - cz;
                if (dz < NEAR || dz > FAR) return null;
                const o = fog(dz) * (0.35 + 0.35 * Math.sin(frame / 20 + d.ph));
                return (
                  <div
                    key={`d${i}`}
                    style={{
                      position: "absolute",
                      width: d.r * 2,
                      height: d.r * 2,
                      marginLeft: -d.r,
                      marginTop: -d.r,
                      borderRadius: "50%",
                      background: colors.gold,
                      opacity: o,
                      transform: `translate3d(${(d.x - camX).toFixed(1)}px, ${(d.y - camY + Math.sin(frame / 40 + d.ph) * 12).toFixed(1)}px, ${(P - dz).toFixed(1)}px)`,
                    }}
                  />
                );
              })}
              {end
                ? FIELD.map((s, i) => {
                    // the space round it drifts gently toward the camera, the screens
                    // coming up out of the dark a group on each beat
                    const d = s.z - cz - (frame - RECEDE) * 4;
                    const fieldIn = progress(
                      frame,
                      beat(cut.recede + 1 + (i % 4)),
                      6,
                    );
                    return (
                      <Plane
                        key={`f${i}`}
                        s={s}
                        d={d}
                        camX={0}
                        camY={0}
                        appear={RECEDE}
                        fade={fieldIn}
                        dim={1.15}
                      />
                    );
                  })
                : SCREENS.map((s, i) => {
                    const d = s.z - cz;
                    if (d < NEAR || d > FAR) return null;
                    return (
                      <Plane
                        key={`s${i}`}
                        s={s}
                        d={d}
                        camX={camX}
                        camY={camY}
                        appear={appearAt(s.z)}
                      />
                    );
                  })}
              {heroD < FAR ? (
                <Plane
                  s={hero}
                  d={heroD}
                  camX={end ? 0 : camX}
                  camY={end ? 0 : camY}
                  appear={HERO_FROM}
                  dim={1 + 0.3 * back}
                />
              ) : null}
            </div>
          </AbsoluteFill>
        ) : (
          // arrived: the screen is the frame, its shot playing on as the camera creeps in
          <AbsoluteFill style={{ transform: `scale(${fullScale.toFixed(5)})` }}>
            <Sequence from={HERO_FROM} layout="none">
              <Video
                src={staticFile(HERO_CLIP)}
                muted
                objectFit="cover"
                style={{ width: "100%", height: "100%" }}
              />
            </Sequence>
          </AbsoluteFill>
        )}
        {frame >= ARRIVE && frame < RECEDE + 4 ? <HeroLabel /> : null}
        {/* the question, over the space */}
        {frame >= LINE_AT ? (
          <AbsoluteFill>
            <AbsoluteFill
              style={{
                opacity: line,
                background:
                  "radial-gradient(ellipse 760px 380px at 540px 1120px, rgba(9,9,10,0.82) 0%, rgba(9,9,10,0.55) 50%, rgba(9,9,10,0) 100%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 1010,
                width: "100%",
                opacity: line,
                transform: `translateY(${(1 - line) * 24}px)`,
                textAlign: "center",
              }}
            >
              {["Flying visit,", "or stay a while?"].map((l, i) => (
                <div
                  key={l}
                  style={{
                    fontFamily: serif,
                    fontStyle: i ? "italic" : "normal",
                    fontSize: i ? 92 : 112,
                    lineHeight: 1.08,
                    color: colors.cream,
                    textShadow: LIFT,
                    whiteSpace: "nowrap",
                  }}
                >
                  {l}
                </div>
              ))}
            </div>
          </AbsoluteFill>
        ) : null}
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
        <FilmFinish />
      </AbsoluteFill>
    );
  };
  return { Component: ScreenSpace, frames: SCREEN_SPACE_FRAMES };
};

// the reel: two bars before the drop, landing four bars after it, the question two bars on
const REEL = makeSpace({
  musicFrom: 138.44,
  gain: 1,
  decel: 10,
  arrive: 16,
  recede: 22,
  line: 24,
  end: 32,
});
export const ScreenSpace = REEL.Component;
export const SCREEN_SPACE_FRAMES = REEL.frames;

// the Story (15s or under): a bar before the drop, landing three bars after it
const STORY = makeSpace({
  musicFrom: 142.496 - 4 * (60 / 112.5),
  gain: 1.02,
  decel: 7,
  arrive: 12,
  recede: 18,
  line: 20,
  end: 24,
});
export const ScreenSpaceStory = STORY.Component;
export const SCREEN_SPACE_STORY_FRAMES = STORY.frames;
