import React from "react";
import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { FilmFinish } from "../components/FilmFinish";
import { colors } from "../theme";
import { GRID } from "./grid";
import { GRID as FOODIE } from "./grid-foodie";

type Grid = typeof GRID;

// Variations (Scott: "more cool takes and variations ... just brand moments I can use"):
// the wall (the collection, or only plates), the look (outside the CB sinking into black, or
// turning black and white so a colour CB rises out of a monochrome collection), and the
// direction (reversed: it opens on the gold CB and dives into one hotel).
export type MosaicVariant = {
  id: string;
  grid: Grid;
  look: "black" | "mono";
  reverse?: boolean;
  music: boolean;
  frames?: number; // the film's length, if not MOSAIC_FRAMES
};
// reversed, it starts where the forward film's shimmer has finished (not on a 4s still
// logo) and holds on the hotel for a beat at the end
const REVERSE_FROM = 420;
export const MOSAIC_VARIANTS: MosaicVariant[] = [
  { id: "cbh-mosaic", grid: GRID, look: "black", music: true },
  { id: "cbh-mosaic-foodie", grid: FOODIE, look: "black", music: true },
  { id: "cbh-mosaic-mono", grid: GRID, look: "mono", music: true },
  {
    id: "cbh-mosaic-reverse",
    grid: GRID,
    look: "black",
    reverse: true,
    music: false,
    frames: REVERSE_FROM + 30,
  },
];

// The mosaic (Scott: "a mosaic one ... where the scenes become one image, maybe CB"; the
// comic flip was "too Marvel"): one hotel photo fills the frame, then the camera draws
// back in one long unbroken move and it turns out to be a single tile in a wall of the
// whole collection; as the wall comes into view the CB rises out of it, a ripple running
// out from that first tile, the tiles inside the letters warming to gold and the rest
// sinking into black (a photomosaic: the wall in scripts/mosaic-grid.py puts bright, warm
// photos inside the CB); the blocky letters sharpen into the crisp gold CB and the full
// logo settles round it with the shimmer. Music: Soul Retro Groove by alexguz (Pixabay
// 378379; also on the Hardwick Hall search reel, Scott: "you can use it"; he wanted
// "loungey, uplifting"), from 15.5s into its intro: a soft chord on the first photo, the
// intro's hush as the camera draws back to the wall, the band in (21.14s) as the wave starts
// turning the tiles, and the gold on the downbeat two bars later.

// the piano's phrase finishes on a chord at 16.1s (Scott: "let the piano finish at the end",
// then 19.3s was "too long"): it ends a second after it, faded as the chord sounds
export const MOSAIC_FRAMES = 516;

const W = 1080;
const H = 1920;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const GRADE =
  "sepia(0.32) hue-rotate(-15deg) saturate(1.12) contrast(1.02) brightness(0.96)";
const GAP = 1.5; // the grout between tiles, world px

// The official logo, and its CB, at the end
const CB = staticFile("brand/cbh-logo-cb-only.svg");
const LOGO = staticFile("brand/cbh-logo-on-dark.svg");
const VB: [number, number] = [534.25, 655.69];
const CENTRE: [number, number] = [267.4, 225.75]; // the middle of the CB's bounding box
const LOGO_W = 640;
const LOGO_X = (W - LOGO_W) / 2;
const LOGO_Y = 470;
const LOGO_S = LOGO_W / VB[0];

// Timeline (frames)
// The one camera move (keys by the camera, below): the first tile, the wall held, the logo
const DARK = [250, 296]; // everything outside the CB goes to black
// The tiles give way to the crisp gold CB in three moves: the blocky edges dissolve to
// the CB's true outline, the grout between the tiles lights gold, then the tiles turn gold
// one by one in a sweep from the C across to the B (the shimmer's direction)
const SHARP = [300, 324];
const GROUT = [318, 332];
const GILD = 326; // the sweep starts
const GILD_SPREAD = 22; // frames from the first tile to the last
const GILD_TILE = 10; // frames each tile takes
const GOLD_DONE = GILD + GILD_SPREAD + GILD_TILE;
const CB_BOX = [58.4, 0, 476.4, 451.5]; // the CB's bounds in the logo's viewBox
// The wave (Scott: "just one shuffle each, like a ripple that creates the CB, and not so AI
// looking"): from the first tile outwards, each tile turns over once, from the mixed wall
// the camera pulled back to onto its tile in the CB's wall (bright inside the letters,
// darker outside), and warms or dims as it lands; the CB builds as the wave passes.
const WAVE = 170; // the first tile turns, as the band comes in
const WAVE_PER_CELL = 2.2; // frames later for each cell further out
const TURN = 10; // frames each tile takes to turn over
const LOGO_IN = [356, 388];
const SHIMMER = 392;
// the music: its hit on the grout lighting gold and the first tiles gilding
const MUSIC = staticFile("mosaic/soul-retro-groove.mp3");
// a bar line two bars after the band comes in (21.14s; bars of 2.6s), on the gold; the band
// itself then comes in on the wave (Scott: the percussion came in "right at the end")
const MUSIC_HIT = 26.337; // seconds into the track
const HIT = GILD;
const MUSIC_START = Math.round((MUSIC_HIT - HIT / 30) * 30); // frames into the track at frame 0
const MUSIC_GAIN = 0.72; // -15.5 LUFS
const FADE_IN = 4; // frames: the track starts mid-intro
const FADE = 30; // frames of fade-out at the end, from just after the last chord

// the camera for a wall: zoom from the first tile filling the frame's height to the CB at
// its size in the logo, about a point that travels from the first tile to the CB's centre.
// The one camera move, from the first tile to the logo, through the whole wall: it draws
// back to the wall filling the frame and lingers there, still drifting back slowly (Scott:
// "show the big wall a little more before morphing into the CB"), then carries on out to
// the logo. Keyframes of the zoom, through a monotone cubic (Fritsch-Carlson) on the log
// zoom, so the move slows over the wall without ever stopping and eases in and out.
const S0 = H / (34 - GAP);
const makeCamera = (g: Grid) => {
  const startXY = [
    (g.START % g.COLS) * g.T + g.T / 2,
    Math.floor(g.START / g.COLS) * g.T + g.T / 2,
  ];
  const s1 = LOGO_S / g.CB_K;
  const keys: [number, number][] = [
    [10, S0], // the first tile fills the frame
    [60, S0 * 0.9], // still on it, the pull just starting
    [165, 1.06], // the wall fills the frame
    [245, 0.96], // still the wall, drifting back
    [335, s1], // the CB at its size in the logo
  ];
  const KT = keys.map((k) => k[0]);
  const KV = keys.map(([, v]) => Math.log(v));
  const d = KT.slice(1).map((t, i) => (KV[i + 1] - KV[i]) / (t - KT[i]));
  const KM = KT.map((_, i) => {
    if (i === 0 || i === KT.length - 1) return 0;
    const [a, b] = [d[i - 1], d[i]];
    return a * b <= 0 ? 0 : (2 * a * b) / (a + b);
  });
  const logZoom = (frame: number) => {
    if (frame <= KT[0]) return KV[0];
    if (frame >= KT[KT.length - 1]) return KV[KV.length - 1];
    const i = KT.findIndex((t, k) => frame < KT[k + 1]);
    const h = KT[i + 1] - KT[i];
    const t = (frame - KT[i]) / h;
    const t2 = t * t;
    const t3 = t2 * t;
    return (
      (2 * t3 - 3 * t2 + 1) * KV[i] +
      (t3 - 2 * t2 + t) * h * KM[i] +
      (-2 * t3 + 3 * t2) * KV[i + 1] +
      (t3 - t2) * h * KM[i + 1]
    );
  };
  return (frame: number) => {
    const s = Math.exp(logZoom(frame));
    // the anchor moves with the visible width (1/s), so the view draws back in a straight
    // line and the first tile stays in frame while it is big
    const w = (1 / s - 1 / S0) / (1 / s1 - 1 / S0);
    const f = [
      interpolate(w, [0, 1], [startXY[0], g.CB_O[0] + CENTRE[0] * g.CB_K]),
      interpolate(w, [0, 1], [startXY[1], g.CB_O[1] + CENTRE[1] * g.CB_K]),
    ];
    const p = [
      interpolate(w, [0, 1], [W / 2, LOGO_X + CENTRE[0] * LOGO_S]),
      interpolate(w, [0, 1], [H / 2, LOGO_Y + CENTRE[1] * LOGO_S]),
    ];
    // screen = world * s + offset
    return { s, ox: p[0] - f[0] * s, oy: p[1] - f[1] * s };
  };
};

// where a cell is in its turn: the tile showing, its angle (0 flat, 90 edge-on)
const turned = (g: Grid, i: number, frame: number, at: number) => {
  const p = interpolate(frame, [at, at + TURN], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.quad),
  });
  return {
    tile: p < 0.5 ? g.CELLS_PRE[i] : g.CELLS[i],
    angle: p < 0.5 ? p * 180 : (p - 1) * 180,
  };
};

export const Mosaic: React.FC<{ variant: MosaicVariant }> = ({ variant }) => {
  const g = variant.grid;
  const { look } = variant;
  const now = useCurrentFrame();
  // reversed: the same film played backwards (it opens on the gold CB, ends in one hotel)
  const frame = variant.reverse ? Math.max(0, REVERSE_FROM - now) : now;
  const camera = React.useMemo(() => makeCamera(g), [g]);
  const { s, ox, oy } = camera(frame);
  const { COLS, ROWS, T, CB_K, CB_O, START, COVER, VARIANTS, PHOTOS } = g;
  const ATLAS = staticFile(g.ATLAS);
  const dark = interpolate(frame, DARK, [0, 1], clamp);
  const sharp = interpolate(frame, SHARP, [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.quad),
  });
  const grout = interpolate(frame, GROUT, [0, 1], clamp);
  const wall = frame < GOLD_DONE;
  const logo = interpolate(frame, LOGO_IN, [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.quad),
  });
  const sweep = interpolate(frame, [SHIMMER, SHIMMER + 30], [-60, 160], clamp);
  const sc = g.ATLAS_TILE / (T - GAP); // atlas px per world px
  // the mono look: outside the CB the wall turns black and white behind the wave instead of
  // sinking into black, dimming only at the end so the logo reads
  const monoDark = interpolate(frame, [232, 272], [0, 1], clamp);

  const tiles: React.ReactNode[] = [];
  const gilt: React.ReactNode[] = [];
  if (wall) {
    for (let i = 0; i < COLS * ROWS; i++) {
      const c = i % COLS;
      const r = Math.floor(i / COLS);
      const x = c * T * s + ox;
      const y = r * T * s + oy;
      const size = (T - GAP) * s;
      if (x > W || y > H || x + size < 0 || y + size < 0) continue;
      const cover = COVER[i];
      // the wave: each tile turns a little after the one nearer the first tile, and warms
      // (inside the CB) or dims (outside) as it lands
      const d = Math.hypot(c - (START % COLS), r - Math.floor(START / COLS));
      const at = WAVE + d * WAVE_PER_CELL;
      const e = interpolate(frame, [at + TURN / 2, at + TURN + 14], [0, 1], {
        ...clamp,
        easing: Easing.inOut(Easing.quad),
      });
      const shade =
        look === "mono"
          ? (1 - cover) * Math.min(1, e * 0.25 + monoDark)
          : (1 - cover) * Math.min(1, e * 0.78 + dark);
      // a tile gone wholly black is dropped (the grade shifts its black off the background's)
      if (cover === 0 && shade >= 0.999) continue;
      const { tile: ph, angle } = turned(g, i, frame, at);
      const warm = cover * e * 0.4;
      // the far side of a turning tile is in shadow
      const turnShade = 0.3 * Math.sin((Math.abs(angle) * Math.PI) / 180);
      // the gold sweep, mostly left to right, a little top to bottom
      if (cover > 0 && frame >= GILD) {
        const gx =
          ((c + 0.5) * T - CB_O[0] - CB_BOX[0] * CB_K) /
          ((CB_BOX[2] - CB_BOX[0]) * CB_K);
        const gy =
          ((r + 0.5) * T - CB_O[1] - CB_BOX[1] * CB_K) /
          ((CB_BOX[3] - CB_BOX[1]) * CB_K);
        const at =
          GILD + Math.min(1, Math.max(0, 0.75 * gx + 0.25 * gy)) * GILD_SPREAD;
        const g = interpolate(frame, [at, at + GILD_TILE], [0, 1], {
          ...clamp,
          easing: Easing.inOut(Easing.quad),
        });
        if (g > 0)
          gilt.push(
            <div
              key={i}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: size,
                height: size,
                borderRadius: 1.2 * s,
                backgroundColor: colors.gold,
                opacity: g,
              }}
            />,
          );
      }
      // hi-res photos for the tiles near the first one while they are big
      const hi =
        s > 5 &&
        Math.abs(c - (START % COLS)) <= 2 &&
        Math.abs(r - Math.floor(START / COLS)) <= 2;
      tiles.push(
        <div
          key={i}
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: size,
            height: size,
            overflow: "hidden",
            borderRadius: 1.2 * s,
            transform: angle
              ? `perspective(${size * 5}px) rotateY(${angle}deg)`
              : undefined,
            backgroundImage: hi ? undefined : `url(${ATLAS})`,
            backgroundSize: `${(g.ATLAS_SIZE[0] / sc) * s}px ${(g.ATLAS_SIZE[1] / sc) * s}px`,
            backgroundPosition: `${((-(ph % g.ATLAS_COLS) * g.ATLAS_TILE) / sc) * s}px ${((-Math.floor(ph / g.ATLAS_COLS) * g.ATLAS_TILE) / sc) * s}px`,
          }}
        >
          {hi
            ? (() => {
                // the full photo, placed so the tile's crop fills the tile
                const [p, cx, cy, side] = VARIANTS[ph];
                const k = size / side;
                return (
                  <Img
                    src={staticFile(PHOTOS[p])}
                    style={{
                      position: "absolute",
                      left: -cx * k,
                      top: -cy * k,
                      width: g.PHOTO_SIZES[p][0] * k,
                      height: g.PHOTO_SIZES[p][1] * k,
                      maxWidth: "none",
                    }}
                  />
                );
              })()
            : null}
          {warm > 0 ? (
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: colors.gold,
                opacity: warm,
              }}
            />
          ) : null}
          {shade > 0 || turnShade > 0 ? (
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: colors.black,
                opacity: Math.min(1, shade + turnShade * (1 - shade)),
              }}
            />
          ) : null}
        </div>,
      );
    }
  }

  // the wave front on screen: it leaves the first tile at WAVE, a cell every WAVE_PER_CELL
  const waveX = ((START % COLS) + 0.5) * T * s + ox;
  const waveY = (Math.floor(START / COLS) + 0.5) * T * s + oy;
  const waveR = Math.max(0, (frame - WAVE - TURN / 2) / WAVE_PER_CELL) * T * s;
  // the crisp CB on the wall, in world coordinates through the same camera
  const cbBox = {
    left: CB_O[0] * s + ox,
    top: CB_O[1] * s + oy,
    width: VB[0] * CB_K * s,
    height: VB[1] * CB_K * s,
  };
  // a full-frame layer cut to the CB's true outline
  const cbMask: React.CSSProperties = {
    WebkitMaskImage: `url(${CB})`,
    maskImage: `url(${CB})`,
    WebkitMaskSize: `${cbBox.width}px ${cbBox.height}px`,
    maskSize: `${cbBox.width}px ${cbBox.height}px`,
    WebkitMaskPosition: `${cbBox.left}px ${cbBox.top}px`,
    maskPosition: `${cbBox.left}px ${cbBox.top}px`,
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
  };
  const cbStyle: React.CSSProperties = {
    position: "absolute",
    left: CB_O[0] * s + ox,
    top: CB_O[1] * s + oy,
    width: VB[0] * CB_K * s,
    height: VB[1] * CB_K * s,
    WebkitMaskImage: `url(${CB})`,
    maskImage: `url(${CB})`,
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
  };

  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      {variant.music ? (
        <Audio
          src={MUSIC}
          trimBefore={MUSIC_START}
          volume={(f) =>
            MUSIC_GAIN *
            interpolate(
              f,
              [0, FADE_IN, MOSAIC_FRAMES - FADE, MOSAIC_FRAMES],
              [0, 1, 1, 0],
              clamp,
            )
          }
        />
      ) : null}
      {/* gold under the tiles, showing through the grout, and the CB once they are gilt */}
      <div
        style={{
          ...cbStyle,
          backgroundColor: colors.gold,
          opacity: frame >= GOLD_DONE ? 1 : grout,
        }}
      />
      {wall ? (
        <>
          {/* the blocky mosaic, its stair-stepped edges dissolving away */}
          {sharp < 1 ? (
            <AbsoluteFill style={{ filter: GRADE, opacity: 1 - sharp }}>
              {tiles}
            </AbsoluteFill>
          ) : null}
          {/* the mono look: behind the wave front, everything outside the CB's true outline
              turns black and white (the same tiles, greyed, masked to the wave's circle less
              the CB) */}
          {look === "mono" && sharp < 1 ? (
            <AbsoluteFill
              style={{
                filter: `${GRADE} grayscale(1) contrast(1.05)`,
                opacity: 1 - sharp,
                maskImage: `radial-gradient(circle at ${waveX}px ${waveY}px, black ${Math.max(0, waveR - 120)}px, transparent ${Math.max(1, waveR)}px), url(${CB})`,
                maskSize: `100% 100%, ${cbBox.width}px ${cbBox.height}px`,
                maskPosition: `0px 0px, ${cbBox.left}px ${cbBox.top}px`,
                maskRepeat: "no-repeat",
                maskComposite: "subtract",
              }}
            >
              {tiles}
            </AbsoluteFill>
          ) : null}
          {/* the same tiles cut to the CB's true outline, then gilt one by one */}
          {sharp > 0 ? (
            <AbsoluteFill style={cbMask}>
              <AbsoluteFill style={{ filter: GRADE }}>{tiles}</AbsoluteFill>
              {gilt}
            </AbsoluteFill>
          ) : null}
        </>
      ) : null}
      <Img
        src={LOGO}
        style={{
          position: "absolute",
          left: LOGO_X,
          top: LOGO_Y,
          width: LOGO_W,
          height: LOGO_W * (VB[1] / VB[0]),
          opacity: logo,
        }}
      />
      <div
        style={{
          ...cbStyle,
          background: `linear-gradient(110deg, transparent ${sweep - 25}%, rgba(255,246,220,0.95) ${sweep}%, transparent ${sweep + 25}%)`,
        }}
      />
      <FilmFinish />
    </AbsoluteFill>
  );
};
