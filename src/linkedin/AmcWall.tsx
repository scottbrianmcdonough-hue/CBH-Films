import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { colors, sans, serif } from "../hotel-film/theme";

// AMC 2026, the 25th Anniversary AMC (Scott, 21 Oct: "make the composition better, like a theme
// ... impressive ... a gif that changes pictures and cycles through a few"). A living photo wall
// in CBH black and gold: three photo tiles round one brand tile, each tile pushing to its next
// photo in turn, so something moves every two thirds of a second and the wall never stands still.
// The brand tile follows the house label rule: the venue in gold caps with its still underline
// exactly the width of the words, then "25th Anniversary / AMC" (the stage screen's own words)
// in cream Cormorant. Smoother (Scott): each push glides over 40 frames on a gentle sine ease,
// the incoming photo covering the outgoing one, which drifts a third as far and dims (a layered
// move, not two photos shoved together); calmer (Scott: "is the switching too fast"): one push
// every 1.7s, each photo held 5s; the slow push-in on each photo runs
// unbroken from its arrival to its exit. Each photo once and no scene twice (Scott: the Stronger
// Together screen had been in two tiles); the three "And The Winner Is" shots in the big tile.
// 4:5, silent, 20s, loops seamlessly (each tile comes back round to its first photo); frame 0
// is a still moment between pushes, as LinkedIn previews the first
// frame: it shows each tile's last photo, so those are the strongest (the gala team, the welcome
// stand, the lectern).
// Polish: the balloons as the wider shot, both stars whole in the tall tile; the flat daylight
// phone shots (arrivals, AV desk) warmed and given a little contrast so they sit with the lit
// stage photos; a faint vignette in every photo tile.

export const AMC_WALL_FRAMES = 600;
export const AMC_WALL_W = 1080;
export const AMC_WALL_H = 1350;
// Landscape (Scott: "can you do landscape"), 16:9: the tall tile down the left, the big tile
// top right, the brand tile and the third tile beneath it. Same photos, timings and loop.
export const AMC_WALL_LAND_W = 1920;
export const AMC_WALL_LAND_H = 1080;

const A = "campaigns/amc-2026/";
const G = 8; // gutter
const PUSH = 40; // frames a push takes

// zoom: a closer crop, centred on pos (for a figure small in a wide photo)
type Shot = { src: string; pos?: string; look?: string; hold: number; zoom?: number };
type Box = { x: number; y: number; w: number; h: number };
type Tile = {
  offset: number; // when in the period this tile pushes
  dir: "left" | "right" | "up" | "down"; // where the new photo comes from
  shots: Shot[];
};

const WARM = "contrast(1.07) saturate(1.06) sepia(0.08) brightness(0.98)";

// where the big tile, the two smaller tiles and the brand tile sit, in each shape
type Layout = { hero: Box; second: Box; tall: Box; brand: Box };
const portrait = (): Layout => {
  const heroH = 600;
  const lowY = heroH + G;
  const lowH = AMC_WALL_H - lowY;
  const col = (AMC_WALL_W - G) / 2;
  const brandH = 300;
  return {
    hero: { x: 0, y: 0, w: AMC_WALL_W, h: heroH },
    second: { x: col + G, y: lowY + brandH + G, w: col, h: lowH - brandH - G },
    tall: { x: 0, y: lowY, w: col, h: lowH },
    brand: { x: col + G, y: lowY, w: col, h: brandH },
  };
};
const landscape = (): Layout => {
  const W = AMC_WALL_LAND_W;
  const H = AMC_WALL_LAND_H;
  const tallW = 600;
  const rx = tallW + G;
  const rw = W - rx;
  const heroH = 700;
  const lowY = heroH + G;
  const brandW = 600;
  return {
    hero: { x: rx, y: 0, w: rw, h: heroH },
    second: { x: rx + brandW + G, y: lowY, w: rw - brandW - G, h: H - lowY },
    tall: { x: 0, y: 0, w: tallW, h: H },
    brand: { x: rx, y: lowY, w: brandW, h: H - lowY },
  };
};

// Bianca (21 Oct): the AV crew out ("they look bored"), Georgina dancing out (the "G standing"
// photo), Louise at the CB lectern kept, Phill in (close at the lectern); Rachel is the woman in
// the burgundy jacket at the welcome stand; the single-person and room shots change faster (about 3-4s) and the group shots
// hold longer (about 4-6s) so faces can be found. Each shot has its own hold; every tile's holds
// sum to the loop, and the tile offsets space the pushes at least a second apart with nothing
// moving in the first 20 frames (LinkedIn's preview).
const TILES: (Tile & { at: keyof Layout })[] = [
  {
    at: "hero",
    offset: 60,
    dir: "right",
    shots: [
      { src: "room-wide.jpg", pos: "50% 50%", hold: 80 },
      { src: "winner-donnington.jpg", pos: "50% 40%", hold: 130 },
      { src: "winner-imperial.jpg", pos: "50% 40%", hold: 130 },
      { src: "winner-hogarths.jpg", pos: "50% 40%", hold: 130 },
      { src: "team-gala.webp", pos: "50% 30%", hold: 130 },
    ],
  },
  {
    at: "second",
    offset: 20,
    dir: "left",
    shots: [
      { src: "table-3-selfie.jpg", hold: 170 },
      { src: "sales-panel.jpg", pos: "35% 50%", hold: 110 },
      { src: "winners-stage.jpg", pos: "50% 45%", hold: 170 },
      { src: "welcome-stand.jpg", pos: "50% 45%", hold: 150 },
    ],
  },
  {
    at: "tall",
    offset: 110,
    dir: "down",
    shots: [
      { src: "banner-arrivals.jpg", pos: "50% 40%", look: WARM, hold: 130 },
      { src: "stronger-together.jpg", pos: "96% 52%", zoom: 1.35, hold: 130 },
      { src: "speaker-lectern.jpg", pos: "50% 40%", hold: 130 },
      { src: "team-balloons-25-years-wide.jpg", pos: "50% 55%", hold: 210 },
    ],
  },
];

const Photo: React.FC<{ shot: Shot; age: number; drift: boolean }> = ({ shot, age, drift }) => {
  const life = shot.hold + PUSH; // its whole time on screen, arrival to exit
  // a slow push-in for life, continuous across the photo's whole stay (off for the GIF: a still
  // photo between pushes keeps the file small)
  const s = (shot.zoom ?? 1) * (drift ? 1.03 + 0.05 * (age / life) : 1.03);
  return (
    <Img
      src={staticFile(A + shot.src)}
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: shot.pos ?? "50% 50%",
        transform: `scale(${s})`,
        transformOrigin: shot.pos ?? "50% 50%",
        filter: shot.look,
      }}
    />
  );
};

const CyclingTile: React.FC<{ tile: Tile; box: Box; drift: boolean }> = ({ tile, box, drift }) => {
  const frame = useCurrentFrame();
  const n = tile.shots.length;
  // where in the loop this tile is, and which shot that falls in
  const t = (((frame - tile.offset) % AMC_WALL_FRAMES) + AMC_WALL_FRAMES) % AMC_WALL_FRAMES;
  let k = 0;
  let begin = 0;
  while (k < n - 1 && t >= begin + tile.shots[k].hold) {
    begin += tile.shots[k].hold;
    k += 1;
  }
  const into = t - begin;
  const cur = tile.shots[k];
  const prev = tile.shots[(k - 1 + n) % n];
  const p = interpolate(into, [0, PUSH], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });
  // the incoming photo pushes the outgoing one off the far side
  const [dx, dy] = {
    right: [1, 0],
    left: [-1, 0],
    down: [0, -1],
    up: [0, 1],
  }[tile.dir];
  const inT = `translate(${dx * (1 - p) * 100}%, ${dy * (1 - p) * 100}%)`;
  const outT = `translate(${-dx * p * 33}%, ${-dy * p * 33}%)`;
  return (
    <div
      style={{
        position: "absolute",
        left: box.x,
        top: box.y,
        width: box.w,
        height: box.h,
        overflow: "hidden",
        background: colors.black,
      }}
    >
      {p < 1 ? (
        <div style={{ position: "absolute", inset: 0, transform: outT, filter: `brightness(${1 - 0.45 * p})` }}>
          <Photo shot={prev} age={prev.hold + into} drift={drift} />
        </div>
      ) : null}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: inT,
          boxShadow: p < 1 ? "0 0 40px rgba(0,0,0,0.55)" : undefined,
        }}
      >
        <Photo shot={cur} age={into} drift={drift} />
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.22) 100%)",
        }}
      />
    </div>
  );
};

const BrandTile: React.FC<{ box: Box }> = ({ box }) => (
  <div
    style={{
      position: "absolute",
      left: box.x,
      top: box.y,
      width: box.w,
      height: box.h,
      background: colors.black,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
    }}
  >
    <div
      style={{
        fontFamily: sans,
        fontWeight: 600,
        fontSize: 22,
        letterSpacing: "0.26em",
        color: colors.gold,
        whiteSpace: "nowrap",
        paddingBottom: 10,
        marginBottom: 24,
        borderBottom: `2px solid ${colors.gold}`,
      }}
    >
      {/* the last letter unspaced, so the underline ends exactly under it */}
      FOREST OF ARDE<span style={{ letterSpacing: 0 }}>N</span>
    </div>
    <div
      style={{
        fontFamily: serif,
        fontWeight: 500,
        fontSize: 58,
        lineHeight: 1.08,
        color: colors.cream,
      }}
    >
      25th Anniversary
      <br />
      AMC
    </div>
  </div>
);

export const AmcWall: React.FC<{ drift?: boolean; land?: boolean }> = ({
  drift = true,
  land = false,
}) => {
  const layout = land ? landscape() : portrait();
  return (
    <AbsoluteFill style={{ background: colors.black }}>
      {TILES.map((tile, i) => (
        <CyclingTile key={i} tile={tile} box={layout[tile.at]} drift={drift} />
      ))}
      <BrandTile box={layout.brand} />
    </AbsoluteFill>
  );
};
