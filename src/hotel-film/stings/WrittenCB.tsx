import React, { useEffect, useMemo, useState } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { FilmFinish } from "../components/FilmFinish";
import { colors, serif } from "../theme";

// "Written in", a brand moment (Scott, after a mixtape cover whose portrait is made of its own
// lyrics: "can you do something like that with the words or images making up the CB"): a page
// of words, every one a hotel or a stay from the collection, run on like lyrics. It opens close
// on the first line, the words lighting as the camera reads along it, then draws back until the
// page fills the frame and lies back. Then the CB becomes 3D (Scott: "not rumble, more like
// becomes 3D, rises smoothly, morphs the space around it, kinda like the magnet reel"): the
// page is a surface (three.js, its words drawn into a texture laid out exactly as the opening's
// type) and the CB rises out of it in one smooth pull, the page and its words drawn up round it
// and in towards it, the words on the letters turning gold, lit from one side so the relief
// reads; the camera drops lower as it rises (Scott: "depth move with the rise")
// and the page turns under it. Then the page falls away, the CB comes down flat, fills solid
// gold and settles into the logo, with its shimmer. A silent mock-up.

export const WRITTEN_CB_FRAMES = 520;

const W = 1080;
const H = 1920;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// the stays, from the reels (names and places as the films label them)
const STAYS = [
  "Afternoon tea at Holdsworth House",
  "The Beatles stayed here",
  "Ruthin Castle",
  "A castle since the 1200s",
  "Breakfast in bed",
  "Dessert by the fire at The Kingfisher",
  "Ilsington on Dartmoor",
  "A four-poster",
  "The fells over Castle Inn",
  "Waterton Park, its own island",
  "One bridge in",
  "Low Wood Bay on Windermere",
  "Dalmahoy, Edinburgh",
  "Speech House in the Forest of Dean",
  "A walk with the dog at Oakley Hall",
  "Hythe Imperial",
  "Langshott Manor",
  "Rutland Hall on Rutland Water",
  "Nailcote Hall",
  "Fairlawns, Walsall",
  "Prince Rupert, Shrewsbury",
  "Whitley Hall, Sheffield",
  "Wild Boar in the Lake District",
  "Hardwick Hall, County Durham",
  "Gisborough Hall",
  "Haycock Manor",
  "The Alfriston",
  "Whittlebury Park",
  "Hintlesham Hall, a Suffolk country manor",
  "The Mount, Wolverhampton",
  "Rowton Hall",
  "The hot tub at Ruthin",
  "Sunday lunch",
  "The fire lit",
  "A spa morning",
  "The long walk back",
  "A glass by the fire",
  "One more night",
];


// the page: the stays run on, each pass in a fresh order (a seeded shuffle), so no phrase sits
// beside the same neighbour twice; the first pass starts as written, for the opening line
const rand = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
};
const phrases = (seed: number, passes: number, firstAsWritten: boolean) => {
  const r = rand(seed);
  const out: string[] = [];
  for (let pass = 0; pass < passes; pass++) {
    const order = STAYS.slice();
    if (pass > 0 || !firstAsWritten) {
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(r() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
    }
    out.push(...order);
  }
  return out;
};
const OPENING = 4; // the first phrases, which the camera reads at the start

// words, each with the phrase it belongs to (for the opening's lighting)
type Word = { t: string; p: number };
const wordsOf = (list: string[], end: string): Word[] =>
  list.flatMap((ph, p) => {
    const ws = ph.split(" ");
    return ws.map((t, i) => ({
      t: i === ws.length - 1 ? t + (p === list.length - 1 ? end : ",") : t,
      p,
    }));
  });
const PAGE_WORDS = wordsOf(phrases(7, 40, true), ".");
const ABOVE_WORDS = wordsOf(phrases(29, 14, false), ",");

// the type, in world px (the page fills the frame at zoom 1)
const SIZE = 19;
const LEAD = 20.5;
const MARGIN = 18;
const FONT = `600 ${SIZE}px "${serif}"`;
// the page runs past the frame on every side, so it still fills it when it tilts
const PAGE_X = -520;
const PAGE_W = W + 1040;
const LINE_W = PAGE_W - MARGIN * 2;
const ABOVE_LINES = 40; // lines of the page above the first, fading into the distance
const PAGE_LINES = 150;
// the surface's extent in the world (above the first line to the foot of the page)
const SX0 = PAGE_X;
const SX1 = PAGE_X + PAGE_W;
const SY0 = -ABOVE_LINES * LEAD;
const SY1 = PAGE_LINES * LEAD;
const TEX_RES = 1.5; // texture px per world px
const HMAP_RES = 0.5;

// depth: the page in perspective, lying back like the ground as the CB rises out of it
const PERSPECTIVE = 1500;
const FOV = (2 * Math.atan(H / 2 / PERSPECTIVE) * 180) / Math.PI;
const TILT0 = 28; // degrees the page lies back at the opening, as if on a table
const TILT_PAGE = 29; // as it draws back to the full page
const GROUND = 40; // as the CB rises out of it
const LIFT = 110; // world px the letters rise out of the page
const HALO_LIFT = 40; // world px the page round them is drawn up
const WAVE = 30; // world px of the swell's height
const DEPTH = 150; // world px of each letter's solid (most of it below the page until it rises)
const BEVEL = 1.3; // viewBox units of the rounded edge round each letter's top
const DRAW_IN = 16000; // how far the page is drawn in towards the rising CB (world px per unit slope)
// once the page lies back the camera all but holds (Scott: "less camera movement after the
// reveal, focus on the CB rise, that's the payoff"): it has reached the ground as the letters
// start, then drifts back only this much more through the rise, no turn
const DRIFT = 0.03;

// the CB in the world: the logo's viewBox placed so the CB is 720 wide, centred
const VB: [number, number] = [534.25, 655.69];
const CENTRE: [number, number] = [267.4, 225.75]; // the middle of the CB's bounding box
const K = 720 / (476.4 - 58.4); // world px per viewBox unit
const CB_AT: [number, number] = [540, 960];
const BOX = {
  position: "absolute" as const,
  left: CB_AT[0] - CENTRE[0] * K,
  top: CB_AT[1] - CENTRE[1] * K,
  width: VB[0] * K,
  height: VB[1] * K,
};
// the logo on screen at the end (as the mosaic and the wax seal)
const LOGO_W = 640;
const LOGO_S = LOGO_W / VB[0];
const LOGO_Y = 470;
const LOGO_CB: [number, number] = [W / 2, LOGO_Y + CENTRE[1] * LOGO_S];

// Timeline (frames)
const READ = [8, 70]; // the opening words light as the camera reads along them
const PULL = [56, 200]; // the camera draws back to the page
// the type hands over to the surface (the same words, laid out alike): the surface (opaque) fades
// in over the type, which stays as it is underneath (fading both dimmed the words twice: a dip)
const HANDOFF = [194, 202];
// the words morph first (Scott: "need to see the words morph more before the CB appears"):
// ripples run in across the page towards the middle and its lines are drawn in and up, as
// the filings were drawn to the magnet; then the letters rise out of the gathered page
const MORPH = [204, 290];
const WAVES = [200, 272]; // the swell runs in to the letters, which then rise out of it
const DIM = [270, 316]; // the words round the CB dim (bright while they morph)
const RISE = [262, 334]; // the CB rises, in one smooth pull
const AWAY = [374, 404]; // the page falls away
const SETTLE = [376, 428]; // the camera to the logo, the CB down flat
// the risen letters are the page's own (its cream words on top, the page's dark in their walls)
// and only then turn gold (Scott: "don't like how the letters are already gold, they should be the
// letters from the CB then turn gold then the shimmer")
const GOLD = [338, 372];
const GILD = [406, 430]; // the letters fill solid gold
const WORDMARK = [428, 454];
const SHIMMER = 458;

// the camera: a point in the world on the frame's centre, a zoom and the page's turn
const Z0 = 4.4;
const START: [number, number] = [PAGE_X + MARGIN + W / 2 / Z0 - 4, LEAD * 1.6];
const START_END: [number, number] = [START[0] + 150, START[1]];
const Z_END = LOGO_S / K;
const C_END: [number, number] = [
  CB_AT[0] - (LOGO_CB[0] - W / 2) / Z_END,
  CB_AT[1] - (LOGO_CB[1] - H / 2) / Z_END,
];
const ease = (f: number, range: readonly number[], e = Easing.inOut(Easing.cubic)) =>
  interpolate(f, range as number[], [0, 1], { ...clamp, easing: e });

// a smooth path through keys: a monotone cubic (Fritsch-Carlson), so the camera eases from
// one key to the next without overshooting or a kink where two moves meet (Scott: "camera
// needs to be smoother")
const curve = (keys: [number, number][]) => {
  const t = keys.map((k) => k[0]);
  const v = keys.map((k) => k[1]);
  const d = t.slice(1).map((ti, i) => (v[i + 1] - v[i]) / (ti - t[i]));
  const m = t.map((_, i) => {
    if (i === 0 || i === t.length - 1) return 0;
    const [p, q] = [d[i - 1], d[i]];
    // the harmonic mean of the slopes either side (zero at a turn), which keeps it monotone
    return p * q <= 0 ? 0 : (2 * p * q) / (p + q);
  });
  return (f: number) => {
    if (f <= t[0]) return v[0];
    if (f >= t[t.length - 1]) return v[v.length - 1];
    let i = 0;
    while (f > t[i + 1]) i++;
    const h = t[i + 1] - t[i];
    const s = (f - t[i]) / h;
    const s2 = s * s;
    const s3 = s2 * s;
    return (
      (2 * s3 - 3 * s2 + 1) * v[i] +
      (s3 - 2 * s2 + s) * h * m[i] +
      (-2 * s3 + 3 * s2) * v[i + 1] +
      (s3 - s2) * h * m[i + 1]
    );
  };
};
// the zoom (in log space): close on the first line, the long draw back to the page, still
// drawing back (slowly) through the rise, out to the logo: one way all the way, so the camera
// never stops to change direction (the depth move with the rise is the camera dropping lower)
const ZOOM = curve([
  [0, Math.log(Z0)],
  [40, Math.log(Z0 * 0.96)],
  [200, 0],
  [262, Math.log(1 - DRIFT)],
  [376, Math.log(1 - DRIFT * 1.3)],
  [428, Math.log(Z_END)],
]);
// the page's lie: only ever further back until the logo (no coming up then going down again)
const TILT = curve([
  [0, TILT0],
  [200, TILT_PAGE],
  [262, GROUND],
  [376, GROUND + 0.6],
  [428, 0],
]);

const camera = (f: number) => {
  // reading along the first line, then the long draw back
  const read = ease(f, [0, PULL[0] + 30], Easing.inOut(Easing.sin));
  const settle = ease(f, SETTLE);
  const z = Math.exp(ZOOM(f));
  const rx = START[0] + (START_END[0] - START[0]) * read;
  const ry = START[1] + (START_END[1] - START[1]) * read;
  // the point moves with the draw back's zoom (in 1/z), so the opening line stays in view as
  // it pulls; once the page is in frame it stays on the CB
  const zPull = f >= 200 ? 1 : Math.max(1, z);
  const pu = Math.min(1, Math.max(0, (1 / zPull - 1 / Z0) / (1 - 1 / Z0)));
  let cx = rx + (CB_AT[0] - rx) * pu;
  let cy = ry + (CB_AT[1] - ry) * pu;
  cx = cx + (C_END[0] - cx) * settle;
  cy = cy + (C_END[1] - cy) * settle;
  return { z, cx, cy, tiltX: TILT(f), tiltY: 0 };
};

// the same camera for CSS: the world scaled by the zoom, turned about the camera's point
const cssWorld = (cam: ReturnType<typeof camera>) =>
  `translate(${W / 2}px, ${H / 2}px) rotateX(${cam.tiltX}deg) rotateY(${cam.tiltY}deg) scale3d(${cam.z}, ${cam.z}, ${cam.z}) translate(${-cam.cx}px, ${-cam.cy}px)`;

// --- the layout: lines broken once, by the type's own measure, for both the opening's type
// and the surface's texture, so the hand-over between them doesn't move a word ---

type Line = { words: Word[]; widths: number[]; last: boolean };
const breakLines = (ctx: CanvasRenderingContext2D, words: Word[]): Line[] => {
  ctx.font = FONT;
  const space = ctx.measureText(" ").width;
  const lines: Line[] = [];
  let cur: Word[] = [];
  let ws: number[] = [];
  let w = 0;
  for (const word of words) {
    const ww = ctx.measureText(word.t).width;
    if (cur.length && w + space + ww > LINE_W) {
      lines.push({ words: cur, widths: ws, last: false });
      cur = [];
      ws = [];
      w = 0;
    }
    w += (cur.length ? space : 0) + ww;
    cur.push(word);
    ws.push(ww);
  }
  if (cur.length) lines.push({ words: cur, widths: ws, last: true });
  return lines;
};

type Layout = { page: Line[]; above: Line[]; baseline: number; space: number };
const makeLayout = (): Layout => {
  const ctx = document.createElement("canvas").getContext("2d")!;
  const page = breakLines(ctx, PAGE_WORDS).slice(0, PAGE_LINES);
  page[page.length - 1].last = false;
  const above = breakLines(ctx, ABOVE_WORDS).slice(0, ABOVE_LINES);
  above.forEach((l) => (l.last = false));
  // where CSS puts the baseline in a line box: the font's content area centred in the lead
  ctx.font = FONT;
  const m = ctx.measureText("Hg");
  const asc = m.fontBoundingBoxAscent;
  const desc = m.fontBoundingBoxDescent;
  return {
    page,
    above,
    baseline: (LEAD - (asc + desc)) / 2 + asc,
    space: ctx.measureText(" ").width,
  };
};

// where each word of a line starts, justified (the spare width shared between the gaps)
const placeWords = (l: Line, space: number) => {
  const sum = l.widths.reduce((a, b) => a + b, 0);
  const gaps = l.words.length - 1;
  const gap = l.last || gaps === 0 ? space : (LINE_W - sum) / gaps;
  const xs: number[] = [];
  let x = 0;
  l.widths.forEach((w) => {
    xs.push(x);
    x += w + gap;
  });
  return xs;
};

// the words into a canvas
const drawLines = (
  ctx: CanvasRenderingContext2D,
  lines: Line[],
  top: number,
  baseline: number,
  alpha: (i: number) => number,
) => {
  const space = ctx.measureText(" ").width;
  lines.forEach((l, i) => {
    const xs = placeWords(l, space);
    ctx.globalAlpha = alpha(i);
    l.words.forEach((w, k) => {
      ctx.fillText(w.t, PAGE_X + MARGIN - SX0 + xs[k], top + i * LEAD + baseline);
    });
  });
  ctx.globalAlpha = 1;
};

const pageTexture = (layout: Layout) => {
  const cv = document.createElement("canvas");
  cv.width = Math.round((SX1 - SX0) * TEX_RES);
  cv.height = Math.round((SY1 - SY0) * TEX_RES);
  const ctx = cv.getContext("2d")!;
  ctx.scale(TEX_RES, TEX_RES);
  ctx.font = FONT;
  ctx.fillStyle = "#fff";
  // the lines above fade into the distance (as the opening's mask: clear at the top, solid
  // from 70% of the way down)
  drawLines(ctx, layout.above, 0, layout.baseline, (i) =>
    Math.min(1, (i + 0.5) / (ABOVE_LINES * 0.7)),
  );
  drawLines(ctx, layout.page, -SY0, layout.baseline, () => 1);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.NoColorSpace;
  tex.anisotropy = 8;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  return tex;
};

// the height of the surface: the CB as a relief with flat tops and rounded shoulders, standing
// on a wide gentle rise, so the page is drawn up towards the letters; the CB's own shape
// (sharper), for the gold; and the slopes, worked out here in floating point (8-bit heights
// stepped, and the steps shredded the words)
const blurFloat = (src: Float32Array, w: number, h: number, sigma: number) => {
  // three box blurs, each way, approximate a gaussian
  const r = Math.max(1, Math.round(Math.sqrt((12 * sigma * sigma) / 3 + 1) / 2));
  const a = src.slice();
  const t = new Float32Array(w * h);
  for (let pass = 0; pass < 3; pass++) {
    for (let y = 0; y < h; y++) {
      let acc = 0;
      for (let x = -r; x <= r; x++) acc += a[y * w + Math.min(w - 1, Math.max(0, x))];
      for (let x = 0; x < w; x++) {
        t[y * w + x] = acc / (2 * r + 1);
        acc += a[y * w + Math.min(w - 1, x + r + 1)] - a[y * w + Math.max(0, x - r)];
      }
    }
    for (let x = 0; x < w; x++) {
      let acc = 0;
      for (let y = -r; y <= r; y++) acc += t[Math.min(h - 1, Math.max(0, y)) * w + x];
      for (let y = 0; y < h; y++) {
        a[y * w + x] = acc / (2 * r + 1);
        acc += t[Math.min(h - 1, y + r + 1) * w + x] - t[Math.max(0, y - r) * w + x];
      }
    }
  }
  return a;
};

// exact euclidean distance transform (Felzenszwalb and Huttenlocher), squared distances in texels
const edt1d = (f: Float64Array, n: number, d: Float64Array, v: Int32Array, z: Float64Array) => {
  let k = 0;
  v[0] = 0;
  z[0] = -Infinity;
  z[1] = Infinity;
  for (let q = 1; q < n; q++) {
    let sx = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    while (sx <= z[k]) {
      k--;
      sx = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    }
    k++;
    v[k] = q;
    z[k] = sx;
    z[k + 1] = Infinity;
  }
  k = 0;
  for (let q = 0; q < n; q++) {
    while (z[k + 1] < q) k++;
    d[q] = (q - v[k]) * (q - v[k]) + f[v[k]];
  }
};
const distanceTo = (inside: Uint8Array, w: number, h: number) => {
  const BIG = 1e12;
  const g = new Float64Array(w * h);
  for (let i = 0; i < w * h; i++) g[i] = inside[i] ? 0 : BIG;
  const n = Math.max(w, h);
  const f = new Float64Array(n);
  const d = new Float64Array(n);
  const v = new Int32Array(n);
  const z = new Float64Array(n + 1);
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) f[y] = g[y * w + x];
    edt1d(f, h, d, v, z);
    for (let y = 0; y < h; y++) g[y * w + x] = d[y];
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) f[x] = g[y * w + x];
    edt1d(f, w, d, v, z);
    for (let x = 0; x < w; x++) g[y * w + x] = Math.sqrt(d[x]);
  }
  return g;
};

const heightTexture = (letters: HTMLImageElement[]) => {
  const w = Math.round((SX1 - SX0) * HMAP_RES);
  const h = Math.round((SY1 - SY0) * HMAP_RES);
  const s = HMAP_RES; // texels per world px
  const letterMask = (img: HTMLImageElement) => {
    const cv = document.createElement("canvas");
    cv.width = w;
    cv.height = h;
    const ctx = cv.getContext("2d")!;
    ctx.drawImage(
      img,
      (BOX.left - SX0) * HMAP_RES,
      (BOX.top - SY0) * HMAP_RES,
      BOX.width * HMAP_RES,
      BOX.height * HMAP_RES,
    );
    const px = ctx.getImageData(0, 0, w, h).data;
    const m = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) m[i] = px[i * 4 + 3] / 255;
    return m;
  };
  // the letters are solids now (below); the map is the page round them: the wide rise, the
  // CB's shape (where the page isn't drawn in), and the shadow at the letters' feet
  const masks = letters.map(letterMask);
  const mask = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) mask[i] = Math.max(masks[0][i], masks[1][i]);
  const core = blurFloat(mask, w, h, 2 * s);
  const near = blurFloat(mask, w, h, 9 * s); // the ground close in beside the letters
  const halo = blurFloat(mask, w, h, 75 * s);
  const hts = new Float32Array(w * h);
  const shade = new Float32Array(w * h);
  let max = 0;
  let hmax = 0;
  for (let i = 0; i < w * h; i++) hmax = Math.max(hmax, halo[i]);
  for (let i = 0; i < w * h; i++) {
    halo[i] /= hmax;
    hts[i] = halo[i];
    max = Math.max(max, hts[i]);
    // in the letters' shadow down at their feet, and darkest in the gap between them
    shade[i] = 1 - 0.85 * Math.min(1, near[i] * 1.8) * (1 - mask[i]);
  }
  for (let i = 0; i < w * h; i++) hts[i] /= max;
  // the ripples' rings follow the CB's own outline (Scott: "less circle ripples and more CB shape
  // ripples"): a signed distance from it in world px (negative inside), softened a little so the
  // rings round off in the CB's tight corners
  const inC = new Uint8Array(w * h);
  const outC = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    inC[i] = mask[i] > 0.5 ? 1 : 0;
    outC[i] = 1 - inC[i];
  }
  const dOut = distanceTo(inC, w, h);
  const dIn = distanceTo(outC, w, h);
  const sd = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) sd[i] = (dOut[i] - dIn[i]) / s;
  const dist = blurFloat(sd, w, h, 6 * s);
  // into textures (rows bottom up, as GL has them; slopes per world px, y up as the mesh's)
  const toHalf = THREE.DataUtils.toHalfFloat;
  const A = new Uint16Array(w * h * 4);
  const B = new Uint16Array(w * h * 4);
  const C = new Uint16Array(w * h * 4);
  const at = (arr: Float32Array, x: number, y: number) =>
    arr[Math.min(h - 1, Math.max(0, y)) * w + Math.min(w - 1, Math.max(0, x))];
  for (let y = 0; y < h; y++) {
    const row = h - 1 - y;
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const o = (row * w + x) * 4;
      const gx = ((at(hts, x + 1, y) - at(hts, x - 1, y)) * s) / 2;
      const gy = -((at(hts, x, y + 1) - at(hts, x, y - 1)) * s) / 2;
      const wx = ((at(halo, x + 1, y) - at(halo, x - 1, y)) * s) / 2;
      const wy = -((at(halo, x, y + 1) - at(halo, x, y - 1)) * s) / 2;
      A[o] = toHalf(hts[i]);
      A[o + 1] = toHalf(core[i]);
      A[o + 2] = toHalf(gx);
      A[o + 3] = toHalf(gy);
      B[o] = toHalf(wx);
      B[o + 1] = toHalf(wy);
      B[o + 2] = toHalf(shade[i]);
      // the distance (in hundreds of px, for the half float's precision) and its direction
      const dx = ((at(dist, x + 1, y) - at(dist, x - 1, y)) * s) / 2;
      const dy = -((at(dist, x, y + 1) - at(dist, x, y - 1)) * s) / 2;
      const dl = Math.hypot(dx, dy) || 1;
      C[o] = toHalf(dist[i] / 100);
      C[o + 1] = toHalf(dx / dl);
      C[o + 2] = toHalf(dy / dl);
    }
  }
  const tex = (data: Uint16Array) => {
    const t = new THREE.DataTexture(data, w, h, THREE.RGBAFormat, THREE.HalfFloatType);
    t.minFilter = THREE.LinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.needsUpdate = true;
    return t;
  };
  return { tex: tex(A), slope: tex(B), shape: tex(C) };
};

const VERT = `
uniform sampler2D hmap;
uniform sampler2D slope;
uniform sampler2D shape;
uniform float lift;
uniform float drawIn;
uniform float wave;
uniform float front;
const float SWELL_W = 110.0;
uniform float calm;
varying vec2 vUv;
varying vec3 vN;
varying float vCore;
varying float vWall;
varying float vShade;
varying float vDepth;
void main() {
  vUv = uv;
  vec4 hm = texture2D(hmap, uv);
  // the slope of the surface, and of the wide rise round the CB, per world px
  vec2 g = hm.ba;
  vec4 sl = texture2D(slope, uv);
  vec2 gw = sl.rg;
  vShade = sl.b;
  vec3 p = position;
  p.z += hm.r * lift;
  // the page round it drawn in towards the CB, as the filings were drawn to the magnet, easing
  // off at the letters' feet so their walls stand straight
  p.xy += gw * drawIn * (1.0 - smoothstep(0.0, 0.5, hm.g));
  // one swell in the CB's own shape (its distance field) running in across the page to the letters'
  // outline (Scott: "not so many ripples, it's more like one morph"); the ground under the letters
  // settles as they start to come up through it
  vec4 sh = texture2D(shape, uv);
  float d = sh.r * 100.0;
  float fall = 1.0 - calm * smoothstep(0.0, 0.5, hm.g);
  float x = (d - front) / SWELL_W;
  float bump = exp(-x * x);
  p.z += wave * fall * bump;
  vec2 ws = sh.gb * wave * fall * bump * (-2.0 * x / SWELL_W);
  vN = normalize(vec3(-(g * lift + ws), 1.0));
  vWall = 0.0;
  vCore = hm.g;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}`;

const FRAG = `
uniform sampler2D page;
uniform float rise;
uniform float dim;
uniform float pageOpacity;
uniform float cbOpacity;
uniform vec3 cream;
uniform vec3 gold;
varying vec2 vUv;
varying vec3 vN;
varying float vCore;
varying float vWall;
varying float vShade;
varying float vDepth;
void main() {
  // the far page's words a touch softer (a mip bias with distance), so they don't shimmer
  float a = texture2D(page, vUv, smoothstep(1300.0, 2000.0, vDepth) * 1.2).a * (1.0 - vWall);
  // lit so the relief reads (1 where the page is flat)
  vec3 L = normalize(vec3(-0.5, -0.3, 0.8)); // from the upper left, a little in front
  float shade = clamp(1.0 + 0.65 * (dot(normalize(vN), L) / L.z - 1.0), 0.35, 1.6);
  float g = 0.0; // the gold is on the letters' tops (the solids), not the page
  // the surface's words a touch brighter than the type's 0.62 (its texture softens thin strokes), so
  // the hand-over doesn't step
  float bright = mix(mix(0.765, 0.24, dim), 1.25, g);
  vec3 txt = mix(cream, gold, g) * bright * shade;
  float aa = min(1.0, a * (1.0 + 0.7 * g));
  // the page itself, a warm dark, seen only once it starts to move
  vec3 paper = mix(vec3(0.06, 0.05, 0.036), gold * 0.16, g) * shade * rise;
  // the walls: solid gold in shadow, lit where they face the light
  vec3 wall = gold * 0.55 * shade;
  vec3 col = mix(mix(paper, wall, vWall), txt, aa) * mix(pageOpacity, cbOpacity, max(g, vWall));
  // the letters' shadow at their feet, as they rise
  col *= mix(1.0, vShade, rise);
  // never below the film's own black (#09090A), so the 3D page matches the frame round it
  // the far page fades into the dark (Scott: "a flicker on the edge": its words grew too small to
  // hold still where the page runs off towards the horizon)
  col *= 1.0 - smoothstep(1550.0, 2200.0, vDepth);
  gl_FragColor = vec4(max(col, vec3(0.035, 0.035, 0.039)), 1.0);
}`;

// the letters: solids traced from the logo's own outlines (three.js extrusions of the SVG
// paths, Scott: "hand trace if you have to"), rising up through the page; their tops carry the
// page's own words where they stand (so as each comes up it is the page itself rising), turning
// gold, and their walls and rounded edges are solid gold, lit from the same side as the page
const LETTER_VERT = `
uniform float k;
uniform vec2 boxTL;
uniform vec4 ext;
varying vec2 vPageUv;
varying vec3 vN;
varying float vTop;
void main() {
  vec2 wp = boxTL + position.xy * k;
  vPageUv = vec2((wp.x - ext.x) / (ext.z - ext.x), 1.0 - (wp.y - ext.y) / (ext.w - ext.y));
  // the mesh is flipped in y (the SVG's y runs down), so its normals are too
  vN = normalize(vec3(normal.x, -normal.y, normal.z));
  vTop = step(0.97, normal.z);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;
const LETTER_FRAG = `
uniform sampler2D page;
uniform float goldT;
uniform float base;
uniform float opacity;
uniform vec3 cream;
uniform vec3 gold;
varying vec2 vPageUv;
varying vec3 vN;
varying float vTop;
void main() {
  vec3 L = normalize(vec3(-0.5, -0.3, 0.8)); // from the upper left, a little in front
  vec3 n = normalize(vN);
  vec3 col;
  if (vTop > 0.5) {
    float a = texture2D(page, vPageUv).a;
    vec3 txt = mix(cream * base, gold * 1.25, goldT);
    vec3 paper = gold * 0.16 * goldT;
    col = mix(paper, txt, min(1.0, a * (1.0 + 0.7 * goldT)));
  } else {
    float d = max(0.0, dot(n, L));
    vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
    float sp = pow(max(0.0, dot(n, H)), 24.0);
    // the page's dark, lit, until they turn gold
    vec3 body = mix(vec3(0.2, 0.19, 0.17), gold, goldT);
    col = body * (0.16 + 0.8 * d) + vec3(1.0, 0.93, 0.78) * 0.25 * sp * (0.25 + 0.75 * goldT);
  }
  gl_FragColor = vec4(max(col * opacity, vec3(0.035, 0.035, 0.039)), 1.0);
}`;

const letterGeometry = (svg: string) => {
  const shapes = new SVGLoader().parse(svg).paths.flatMap((p) => SVGLoader.createShapes(p));
  const geo = new THREE.ExtrudeGeometry(shapes, {
    depth: DEPTH / K,
    curveSegments: 24,
    bevelEnabled: true,
    bevelThickness: BEVEL,
    bevelSize: BEVEL,
    bevelOffset: -BEVEL, // the walls stand on the logo's own outline
    bevelSegments: 4,
  });
  return geo;
};

const hex = (c: string) => new THREE.Color(c);

const Surface: React.FC<{
  page: THREE.Texture;
  hmap: { tex: THREE.Texture; slope: THREE.Texture; shape: THREE.Texture };
  letters: THREE.BufferGeometry[];
  cam: ReturnType<typeof camera>;
  rise: number;
  gold: number;
  morph: number;
  waves: number;
  frame: number;
  dim: number;
  pageOpacity: number;
  cbOpacity: number;
}> = ({ page, hmap, letters, cam, rise, gold, morph, waves, frame, dim, pageOpacity, cbOpacity }) => {
  const { camera: c3 } = useThree();
  const pc = c3 as THREE.PerspectiveCamera;
  pc.fov = FOV;
  pc.near = 10;
  pc.far = 20000;
  pc.position.set(0, 0, PERSPECTIVE / cam.z);
  pc.rotation.set(0, 0, 0);
  pc.updateProjectionMatrix();
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        uniforms: {
          page: { value: page },
          hmap: { value: hmap.tex },
          slope: { value: hmap.slope },
          shape: { value: hmap.shape },
          lift: { value: 0 },
          drawIn: { value: 0 },
          wave: { value: 0 },
          front: { value: 0 },
          calm: { value: 0 },
          rise: { value: 0 },
          dim: { value: 0 },
          pageOpacity: { value: 1 },
          cbOpacity: { value: 1 },
          cream: { value: hex(colors.cream) },
          gold: { value: hex(colors.lightGold) },
        },
      }),
    [page, hmap],
  );
  material.uniforms.lift.value = HALO_LIFT * morph;
  material.uniforms.drawIn.value = DRAW_IN * morph;
  material.uniforms.wave.value = WAVE * waves;
  // the swell's crest runs in from well out to the letters' outline as the morph goes
  material.uniforms.front.value = 460 * (1 - Easing.inOut(Easing.sin)(interpolate(frame, WAVES, [0, 1], clamp)));
  material.uniforms.calm.value = Math.min(1, rise * 5);
  material.uniforms.rise.value = rise;
  material.uniforms.dim.value = dim;
  material.uniforms.pageOpacity.value = pageOpacity;
  material.uniforms.cbOpacity.value = cbOpacity;
  const geometry = useMemo(
    () => new THREE.PlaneGeometry(SX1 - SX0, SY1 - SY0, 848, 1558),
    [],
  );
  const letterMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: LETTER_VERT,
        fragmentShader: LETTER_FRAG,
        side: THREE.DoubleSide,
        uniforms: {
          page: { value: page },
          k: { value: K },
          boxTL: { value: new THREE.Vector2(BOX.left, BOX.top) },
          ext: { value: new THREE.Vector4(SX0, SY0, SX1, SY1) },
          goldT: { value: 0 },
          base: { value: 0.62 },
          opacity: { value: 1 },
          cream: { value: hex(colors.cream) },
          gold: { value: hex(colors.lightGold) },
        },
      }),
    [page],
  );
  letterMaterial.uniforms.goldT.value = gold;
  // the letters' words: the page's brightness as they come up, then brighter as the page round them dims
  letterMaterial.uniforms.base.value = 0.765 + 0.2 * dim;
  letterMaterial.uniforms.opacity.value = cbOpacity;
  // each letter's top: just under the page, then up out of it
  const top = -3 + LIFT * rise;
  const z = top - (DEPTH / K + 2 * BEVEL) * K;
  return (
    <group rotation={new THREE.Euler((-cam.tiltX * Math.PI) / 180, (cam.tiltY * Math.PI) / 180, 0, "XYZ")}>
      <mesh
        geometry={geometry}
        material={material}
        position={[(SX0 + SX1) / 2 - cam.cx, -((SY0 + SY1) / 2 - cam.cy), 0]}
      />
      {rise > 0
        ? letters.map((g, i) => (
            <mesh
              key={i}
              geometry={g}
              material={letterMaterial}
              position={[BOX.left - cam.cx, -(BOX.top - cam.cy), z]}
              scale={[K, -K, K]}
            />
          ))
        : null}
    </group>
  );
};

const maskOf = (src: string) => ({
  WebkitMaskImage: `url(${staticFile(src)})`,
  maskImage: `url(${staticFile(src)})`,
  WebkitMaskSize: "100% 100%",
  maskSize: "100% 100%",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
});

// the opening's type: the page as CSS text, every word placed where the surface's texture has it
const typeStyle = {
  position: "absolute" as const,
  whiteSpace: "nowrap" as const,
  fontFamily: serif,
  fontWeight: 600,
  fontSize: SIZE,
  lineHeight: `${LEAD}px`,
  color: colors.cream,
};
const TypeLine: React.FC<{ l: Line; top: number; space: number; opacity: (w: Word) => number }> = ({
  l,
  top,
  space,
  opacity,
}) => {
  const xs = placeWords(l, space);
  return (
    <>
      {l.words.map((w, k) => (
        <span
          key={k}
          // faded by colour, not opacity: Chrome dropped a whole line of separately faded spans
          // for a frame in the 3D view (Scott: "a flicker at the start")
          style={{ ...typeStyle, left: PAGE_X + MARGIN + xs[k], top, color: `rgba(245, 239, 227, ${opacity(w)})` }}
        >
          {w.t}
        </span>
      ))}
    </>
  );
};
const TypePage: React.FC<{ layout: Layout; lit: number }> = ({ layout, lit }) => {
  const above = interpolate(lit, [OPENING + 1, OPENING + 3], [0, 1], clamp);
  return (
    <>
      {above > 0
        ? layout.above.map((l, i) => {
            const o = Math.min(1, (i + 0.5) / (ABOVE_LINES * 0.7)) * above;
            return <TypeLine key={`a${i}`} l={l} top={SY0 + i * LEAD} space={layout.space} opacity={() => o} />;
          })
        : null}
      {layout.page.slice(0, 110).map((l, i) => (
        <TypeLine
          key={i}
          l={l}
          top={i * LEAD}
          space={layout.space}
          opacity={(w) =>
            w.p < OPENING ? 0.35 + 0.65 * interpolate(lit, [w.p, w.p + 1], [0, 1], clamp) : 1
          }
        />
      ))}
    </>
  );
};

export const WrittenCB: React.FC = () => {
  const frame = useCurrentFrame();
  const [handle] = useState(() => delayRender("written-cb page"));
  const [built, setBuilt] = useState<{
    layout: Layout;
    page: THREE.Texture;
    hmap: { tex: THREE.Texture; slope: THREE.Texture; shape: THREE.Texture };
    letters: THREE.BufferGeometry[];
  } | null>(null);
  useEffect(() => {
    const [c, b] = ["c", "b"].map((l) => {
      const img = new Image();
      img.src = staticFile(`brand/cbh-logo-${l}-only.svg`);
      return img;
    });
    const svgs = ["c", "b"].map((l) =>
      fetch(staticFile(`brand/cbh-logo-${l}-only.svg`)).then((r) => r.text()),
    );
    Promise.all([document.fonts.load(FONT), c.decode(), b.decode(), ...svgs]).then((res) => {
      const layout = makeLayout();
      setBuilt({
        layout,
        page: pageTexture(layout),
        hmap: heightTexture([c, b]),
        letters: (res.slice(3) as string[]).map(letterGeometry),
      });
      continueRender(handle);
    });
  }, [handle]);

  const cam = camera(frame);
  // the opening's reading: a phrase at a time, then the lines above come up as it draws back
  const lit = interpolate(frame, READ, [0, OPENING], clamp) +
    interpolate(frame, [110, 190], [0, 3], clamp);
  const dim = ease(frame, DIM, Easing.inOut(Easing.quad));
  const away = ease(frame, AWAY, Easing.inOut(Easing.quad));
  const settle = ease(frame, SETTLE);
  const rise = ease(frame, RISE) * (1 - settle);
  const morph = ease(frame, MORPH) * (1 - settle);
  // the swell grows as it runs in and dies back into the ground as the letters come up
  const waves =
    interpolate(frame, [WAVES[0], WAVES[0] + 24], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) }) *
    (1 - interpolate(frame, [WAVES[1] - 4, RISE[1] - 20], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) }));
  const gild = ease(frame, GILD, Easing.inOut(Easing.quad));
  const word = interpolate(frame, WORDMARK, [0, 1], clamp);
  const shimmer = interpolate(frame, [SHIMMER, SHIMMER + 30], [-60, 160], clamp);
  const handoff = interpolate(frame, HANDOFF, [0, 1], clamp);
  const world = {
    position: "absolute" as const,
    left: 0,
    top: 0,
    width: W,
    height: H,
    transformOrigin: "0 0",
    transformStyle: "preserve-3d" as const,
    transform: cssWorld(cam),
  };

  return (
    <AbsoluteFill style={{ backgroundColor: colors.black, overflow: "hidden" }}>
      {/* the opening: the page as type, until it hands over to the surface */}
      {built && handoff < 1 ? (
        <AbsoluteFill style={{ perspective: PERSPECTIVE, perspectiveOrigin: "50% 50%" }}>
          <div style={world}>
            <div style={{ position: "absolute", inset: 0, opacity: 0.62 }}>
              <TypePage layout={built.layout} lit={lit} />
            </div>
          </div>
        </AbsoluteFill>
      ) : null}
      {/* the surface: the same page, which the CB rises out of */}
      {built && handoff > 0 && frame < GILD[1] + 2 ? (
        <AbsoluteFill style={{ opacity: handoff }}>
          <ThreeCanvas width={W} height={H} flat gl={{ antialias: true }}>
            <Surface
              page={built.page}
              hmap={built.hmap}
              letters={built.letters}
              cam={cam}
              rise={rise}
              gold={ease(frame, GOLD, Easing.inOut(Easing.quad))}
              morph={morph}
              waves={waves}
              frame={frame}
              dim={dim}
              pageOpacity={1 - away}
              cbOpacity={1 - gild}
            />
          </ThreeCanvas>
        </AbsoluteFill>
      ) : null}
      {/* the letters fill solid gold, then the logo comes up round them */}
      {frame >= GILD[0] ? (
        <AbsoluteFill style={{ perspective: PERSPECTIVE, perspectiveOrigin: "50% 50%" }}>
          <div style={world}>
            <Img
              src={staticFile("brand/cbh-logo-on-dark.svg")}
              style={{ ...BOX, opacity: word }}
            />
            <div
              style={{
                ...BOX,
                ...maskOf("brand/cbh-logo-cb-only.svg"),
                backgroundColor: colors.gold,
                opacity: gild * (1 - word),
              }}
            />
            <div
              style={{
                ...BOX,
                ...maskOf("brand/cbh-logo-cb-only.svg"),
                background: `linear-gradient(110deg, transparent ${shimmer - 25}%, rgba(255,246,220,0.95) ${shimmer}%, transparent ${shimmer + 25}%)`,
              }}
            />
          </div>
        </AbsoluteFill>
      ) : null}
      <FilmFinish />
    </AbsoluteFill>
  );
};
