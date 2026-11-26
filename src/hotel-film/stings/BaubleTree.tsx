import { Audio } from "@remotion/media";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import React, { useEffect, useMemo, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { EASE_OUT, sans, serif } from "../theme";
import { FELTS, Kind, paintFelt, SHAPES } from "./FeltOrnament";
import { BAUBLES, cbMask, DarkBack, drawMotif, paintSkin } from "./GlassBauble";

// The bauble tree (Bianca, 25 Nov: "really like the bauble stuff, can we have it baubles being hung on the Christmas
// tree, with the CB as the star on top of the tree? For 1st Dec"): a dark Christmas tree built in three.js (needles as
// thousands of instanced strands on brown twigs, warm fairy lights glowing in it), the glass and felt ornaments already
// hanging and swinging gently (Scott: lowering them "looks weird"), the camera travelling up the tree from one to the
// next on each downbeat, then drawing back as the felt CB star (Scott: "the star on top instead of the bauble") rises to
// the top and the lights come up; the tree fades out, then "Merry Christmas, from our houses to yours" in cream
// Cormorant (Scott). Polish (Scott: "the tree looks plastic"): matte needles in natural fir greens, lighter new growth at
// the tips, darker into the tree, twigs under them, depth falling away into shadow (fog). An AI assisted 3D render, 9:16.
//
// Music: "Vintage Christmas Swing Big Band" by OpenMindAudio (Pixabay 620485, Pixabay Content License, not Content ID
// registered: Scott, 25 Nov). 103.4 BPM (a beat every 0.5805s); bars counted back from its final hit at 206.97s:
// 183.75, 186.07, 188.40 ... The reel plays 183.75s to ~208.8s.

export const TREE_W = 1080;
export const TREE_H = 1920;
const FPS = 30;
const FROM = 183.75;
const BAR = 4 * 0.5805;
const bar = (n: number) => Math.round(n * BAR * FPS); // frame of the nth downbeat from the start
export const TREE_FRAMES = Math.round((208.8 - FROM) * FPS);

const PAL = { gold: "#c7ab77", pale: "#f2f0f0" };

// --- the tree: a cone of tiers from the base to the top ---
const BASE_Y = -3.0;
const TOP_Y = 3.2;
const BASE_R = 2.45;
const radiusAt = (y: number) => BASE_R * Math.max(0, (TOP_Y - y) / (TOP_Y - BASE_Y));
const rng = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

const buildNeedles = () => {
  const r = rng(7);
  const mats: THREE.Matrix4[] = [];
  const cols: THREE.Color[] = [];
  const twigs: THREE.Matrix4[] = [];
  const dummy = new THREE.Object3D();
  const tw = new THREE.Object3D();
  const tiers = 46;
  for (let t = 0; t < tiers; t++) {
    const ty = BASE_Y + (t / tiers) * (TOP_Y - BASE_Y - 0.25);
    const branches = Math.max(7, Math.round(10 + 32 * (radiusAt(ty) / BASE_R)));
    for (let b = 0; b < branches; b++) {
      const y0 = ty + (r() - 0.5) * 0.22; // branches staggered, not in rings
      const R = radiusAt(y0);
      const ang = (b / branches) * Math.PI * 2 + r() * 0.9 + t * 2.4;
      const len = R * (0.8 + r() * 0.3);
      const segs = 13;
      // each branch its own green: most a deep fir, some bluer, some warmer
      const hue = r();
      const bc = hue < 0.2 ? [0.022, 0.06, 0.055] : hue > 0.8 ? [0.04, 0.07, 0.028] : [0.03, 0.068, 0.036];
      let prev = new THREE.Vector3(0, y0, 0);
      for (let k = 1; k <= segs; k++) {
        const u = k / segs;
        // along the branch: out from the trunk, sagging a little, the tip turning up
        const d = u * len;
        const sag = -0.18 * Math.sin(u * Math.PI) * (len / BASE_R) + 0.08 * u * u;
        // the main stem, then from halfway two side shoots fanning out from it
        const shoot = u > 0.35 && k % 2 === 0 ? [0, 1, -1] : [0];
        // the twig under the needles, segment by segment
        const stem = new THREE.Vector3(Math.sin(ang) * d, y0 + sag, Math.cos(ang) * d);
        const sl = stem.distanceTo(prev);
        const mid = prev.clone().add(stem).multiplyScalar(0.5);
        const inPocket = POCKETS().some((c) => c.distanceTo(prev) < c.r + 0.03 || c.distanceTo(stem) < c.r + 0.03 || c.distanceTo(mid) < c.r + 0.03);
        tw.position.copy(prev);
        tw.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), stem.clone().sub(prev).normalize());
        tw.scale.set(1.4 - u, sl, 1.4 - u);
        tw.updateMatrix();
        if (!inPocket) twigs.push(tw.matrix.clone());
        prev = stem;
        for (const sd of shoot) {
        const off = sd * 0.16 * (1 - u * 0.4);
        const px = Math.sin(ang) * d + Math.cos(ang) * off, pz = Math.cos(ang) * d - Math.sin(ang) * off, py = y0 + sag - Math.abs(sd) * 0.03;
        const per = sd === 0 ? 14 : 10;
        for (let n = 0; n < per; n++) {
          // fir sprays (Scott: "less plastic, more like real pine"): short flat needles fanning out to either side of the
          // twig and a little upward, so each branch is a flat layered spray, not a bottle brush
          const leftSide = n % 2 ? 1 : -1;
          const spin = (leftSide > 0 ? 0 : Math.PI) + leftSide * (0.22 + r() * 0.5);
          const l = (0.1 + r() * 0.05) * (1 - 0.25 * u);
          // spread along the segment so the needles don't bunch at one point
          const along = (r() - 0.5) * (len / segs);
          dummy.position.set(px + Math.sin(ang) * along, py, pz + Math.cos(ang) * along);
          const dir = new THREE.Vector3(Math.sin(ang), 0.15, Math.cos(ang)).normalize();
          const side = new THREE.Vector3(Math.cos(ang), 0, -Math.sin(ang));
          const up = new THREE.Vector3().crossVectors(side, dir);
          const out = side.clone().multiplyScalar(Math.cos(spin)).add(up.clone().multiplyScalar(Math.sin(spin)));
          const nd = dir.clone().multiplyScalar(0.42).add(out.multiplyScalar(0.9)).normalize();
          const base = dummy.position.clone(), tip = base.clone().addScaledVector(nd, l), mid = base.clone().addScaledVector(nd, l / 2);
          if (POCKETS().some((c) => c.distanceTo(base) < c.r || c.distanceTo(tip) < c.r || c.distanceTo(mid) < c.r)) continue;
          // lay the flat blade in the spray's plane, its face turned up to the light
          dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), nd);
          dummy.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), (r() - 0.5) * 0.6));
          dummy.scale.set(1, l, 1);
          dummy.updateMatrix();
          mats.push(dummy.matrix.clone());
          const g = (0.75 + r() * 0.5) * (0.28 + 0.72 * u); // darker towards the trunk
          // the new growth at the tips a lighter, yellower green
          const tipN = u > 0.82 && r() < 0.55 ? 1 : 0;
          cols.push(
            tipN
              ? new THREE.Color(0.075 * g, 0.12 * g, 0.045 * g)
              : new THREE.Color(bc[0] * g * 1.15, bc[1] * g * 1.15, bc[2] * g * 1.15),
          );
        }
        }
      }
    }
  }
  return { mats, cols, twigs };
};

// fairy lights scattered over the outside of the tree
const LIGHTS = (() => {
  const r = rng(91);
  // the first 240 glow all along; the rest (Scott: "make the lights pop bright at the end to show we have lots more in
  // the collection") switch on as the star lands, popping on down the tree from the top
  return Array.from({ length: 640 }, (_, i) => {
    const y = BASE_Y + 0.1 + r() * (TOP_Y - BASE_Y - 0.5);
    const a = r() * Math.PI * 2;
    const R = radiusAt(y) * (0.82 + r() * 0.2);
    const late = i >= 240;
    const pop = late ? (TOP_Y - y) / (TOP_Y - BASE_Y) : -1;
    return { p: new THREE.Vector3(Math.sin(a) * R, y + 0.05, Math.cos(a) * R), phase: r() * 6.28, warm: r(), pop, jitter: r() };
  });
})();

const glowTexture = (() => {
  let tex: THREE.Texture | null = null;
  return () => {
    if (tex) return tex;
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, "rgba(255,240,210,1)");
    grad.addColorStop(0.2, "rgba(255,214,150,0.6)");
    grad.addColorStop(0.5, "rgba(255,190,110,0.15)");
    grad.addColorStop(1, "rgba(255,180,100,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };
})();

// --- the ornaments and where they hang ---
type Hang = { kind: "glass" | "felt"; variant: string; y: number; a: number; s?: number; at?: number };
// bottom to top, the order the camera climbs, glass and felt alternating, left and right of centre
const HANGS: Hang[] = [
  // our hotels (Scott, 26 Nov: "a few more shapes like our hotels"): Holdsworth House in felt, Hintlesham Hall on glass
  { kind: "felt", variant: "imperial", y: -2.05, a: -0.42 },
  { kind: "glass", variant: "oakley", y: -1.2, a: 0.44 },
  // all houses (Scott, 26 Nov: "go all houses"): Hatherley Manor in felt, Coombe Abbey on glass
  { kind: "felt", variant: "hatherley", y: -0.42, a: -0.44 },
  { kind: "glass", variant: "coombe", y: 0.62, a: 0.44 },
  // the real houses (Scott, 26 Nov): Ruthin Castle in felt, Dalmahoy's front in gold on glass
  { kind: "felt", variant: "hythe", y: 1.42, a: -0.36 },
  { kind: "glass", variant: "dalmahoy", y: 2.1, a: 0.3 },
];
// each house named as the camera lands on it (Scott, 26 Nov: "put the name of each hotel"): the place in gold caps,
// the name in cream Cormorant, no underline (as on the Hatherley and Coombe reels)
const LABELS: [string, string][] = [
  // full names (Scott, 26 Nov), on two lines where they run long, as on the Hatherley reel's label
  // the CB Unite members (Bianca, 26 Nov): The Imperial, Oakley Hall and Hythe Imperial in place of Holdsworth,
  // Hintlesham and Ruthin
  ["Llandudno, North Wales", "The Imperial Hotel"],
  ["Oakley, Hampshire", "Oakley Hall Hotel"],
  ["Cotswolds", "Hatherley Manor\nHotel & Spa"],
  ["Coventry, Warwickshire", "Coombe Abbey Hotel"],
  ["Hythe, Kent", "Hythe Imperial Hotel,\nGolf & Spa"],
  ["Edinburgh", "Dalmahoy Hotel\n& Country Club"],
];
const AT = HANGS.map((_, i) => bar(i)); // the camera arrives on each on a downbeat: the first from frame one
const GLIDE = 30; // frames for each move, landing on its downbeat
const STAR_FROM = bar(6) - 6;
const STAR_LAND = bar(7); // the felt CB star seats on the top as the bar turns
// then the lit tree holds a bar, fades to black (Scott: "fade the Christmas tree out, then the cream Cormorant")
const TREE_OUT = bar(8);
const LINE_AT = TREE_OUT + 30;
const hangPoint = (h: Hang) => {
  // the six the camera visits hang a little proud of the needles; the smaller ones closer in, so none float off the edge
  const R = h.s ? radiusAt(h.y) * 1.0 + 0.16 : radiusAt(h.y) * 1.05 + 0.3;
  return new THREE.Vector3(Math.sin(h.a) * R, h.y, Math.cos(h.a) * R);
};
const CORD = 0.32;
// an ornament's size and where its body hangs (its centre, below the cord)
const sizeOf = (h: Hang) => (h.kind === "glass" ? 0.34 : 0.32) * (h.s ?? 1);
const bodyOf = (h: Hang) => {
  const p = hangPoint(h);
  return new THREE.Vector3(p.x, p.y - CORD - (h.kind === "glass" ? 1.37 : 1.15) * sizeOf(h), p.z);
};
// many more houses all round the tree (Scott: "make it seem like we have many more"): the six again, smaller, in felt
// and glass, spread over the whole tree and kept clear of each other and of the six the camera visits
const EXTRAS: Hang[] = (() => {
  const designs: Record<Hang["kind"], string[]> = { felt: ["imperial", "hatherley", "hythe"], glass: ["oakley", "coombe", "dalmahoy"] };
  const out: Hang[] = [];
  // where an ornament sits as seen from the front (x across, y up): spacing is checked here so none overlap on screen
  const face = (h: Hang) => {
    const b = bodyOf(h);
    return new THREE.Vector2(b.x, b.y);
  };
  const featured = HANGS.map(face);
  const placed: THREE.Vector2[] = [];
  // clean, even rows (Scott: "make it clean, not sloppy"): no jitter, each row offset half a step from the one above,
  // felt and glass alternating like a chequerboard, every ornament clear of its neighbours and of the six featured
  let row = 0;
  for (let y = -2.22; y < 2.4; y += 0.4, row++) {
    const R = radiusAt(y);
    const n = Math.max(1, Math.round(R * 3.2));
    const span = 0.85;
    for (let k = 0; k < n; k++) {
      const u = (k + (row % 2 ? 0.75 : 0.25)) / n;
      const h: Hang = { kind: (row + k) % 2 ? "glass" : "felt", variant: "", y, a: -span + u * 2 * span, s: 0.72 };
      const f = face(h);
      // each ornament's box on screen, clear of the others (felt ~0.61 wide, both ~0.4 tall at this size)
      const hits = (q: THREE.Vector2, w: number, hh: number) => Math.abs(q.x - f.x) < w && Math.abs(q.y - f.y) < hh;
      if (featured.some((q) => hits(q, 0.7, 0.62)) || placed.some((q) => hits(q, 0.62, 0.44))) continue;
      const list = designs[h.kind];
      placed.push(f);
      out.push({ ...h, variant: list[(row + k * 2) % list.length] });
    }
  }
  return out;
})();
// and more again at the end (Bianca, 26 Nov: "replicate the hotel baubles, make them smaller and add to the end before
// the lights come on, just to represent more hotels"): small ones popping onto the tree from the bottom up as the camera
// draws back, filling the gaps, before the star lands and the lights come on
const LATE: Hang[] = (() => {
  const designs: Record<Hang["kind"], string[]> = { felt: ["hythe", "imperial", "hatherley"], glass: ["dalmahoy", "coombe", "oakley"] };
  const face = (h: Hang) => {
    const b = bodyOf(h);
    return new THREE.Vector2(b.x, b.y);
  };
  const big = [...HANGS.map((h) => ({ f: face(h), w: 0.6, h: 0.55 })), ...EXTRAS.map((h) => ({ f: face(h), w: 0.52, h: 0.36 }))];
  const placed: THREE.Vector2[] = [];
  const out: Hang[] = [];
  const from = bar(6) + 2, to = STAR_LAND - 10;
  let row = 0;
  for (let y = -2.3; y < 2.55; y += 0.28, row++) {
    const n = Math.max(1, Math.round(radiusAt(y) * 4.6));
    const span = 0.86;
    for (let k = 0; k < n; k++) {
      const u = (k + (row % 2 ? 0.75 : 0.25)) / n;
      const h: Hang = { kind: (row + k) % 2 ? "felt" : "glass", variant: "", y, a: -span + u * 2 * span, s: 0.48 };
      const f = face(h);
      const hits = (q: THREE.Vector2, w: number, hh: number) => Math.abs(q.x - f.x) < w && Math.abs(q.y - f.y) < hh;
      if (big.some((q) => hits(q.f, q.w, q.h)) || placed.some((q) => hits(q, 0.42, 0.3))) continue;
      placed.push(f);
      const list = designs[h.kind];
      const at = Math.round(from + ((y + 2.3) / 4.85) * (to - from) + (u - 0.5) * 6);
      out.push({ ...h, variant: list[(row * 2 + k) % list.length], at });
    }
  }
  return out;
})();
const ALL = [...HANGS, ...EXTRAS, ...LATE];
// the room each ornament needs to swing in, clear of needles and twigs
type Pocket = THREE.Vector3 & { r: number };
let pockets: Pocket[] | null = null;
const POCKETS = () =>
  (pockets ??= ALL.flatMap((h) => {
    const r = (h.kind === "glass" ? 0.42 : 0.44) * (h.s ?? 1);
    const b = bodyOf(h);
    const out = new THREE.Vector3(Math.sin(h.a), 0, Math.cos(h.a)).multiplyScalar(0.32 * (h.s ?? 1));
    // round the ornament, and in front of it (Scott: needles were "poking out the bauble")
    return [Object.assign(b.clone(), { r }), Object.assign(b.clone().add(out), { r: r * 0.95 })];
  }));

type Skins = {
  glass: Record<string, { map: THREE.Texture; rough: THREE.Texture }>;
  felt: Record<string, { skin: ReturnType<typeof paintFelt>; shapes: THREE.Shape[] }>;
};

const goldMat = () => new THREE.MeshPhysicalMaterial({ color: new THREE.Color(PAL.gold), metalness: 1, roughness: 0.25, clearcoat: 0.5 });

// a felt piece (its face and edge materials, its layered shapes), shared by the hung ornaments and the topper
const useFelt = (variant: string | null, skins: Skins) =>
  useMemo(() => {
    if (!variant) return null;
    const f = skins.felt[variant];
    const def = FELTS[variant];
    const edge = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(def.felt), roughness: 1, sheen: 1, sheenRoughness: 0.55 });
    const face = new THREE.MeshPhysicalMaterial({ map: f.skin.map, bumpMap: f.skin.bump, bumpScale: 1.6, roughnessMap: f.skin.rm, metalnessMap: f.skin.rm, roughness: 1, metalness: 1, sheen: 1, sheenRoughness: 0.55, sheenColor: new THREE.Color("#ffffff").multiplyScalar(0.45) });
    const geos = f.shapes.map((sh, k, all) => {
      const g = new THREE.ExtrudeGeometry(sh, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.09, bevelSize: 0.06, bevelSegments: 6, curveSegments: 36 });
      g.translate(0, 0, (k - (all.length - 1)) * 0.02);
      return g;
    });
    return { mats: [face, edge], geos };
  }, [variant, skins]);

const FeltBody: React.FC<{ felt: NonNullable<ReturnType<typeof useFelt>> }> = ({ felt }) => (
  <>
    {felt.geos.map((g, k) => (
      <mesh key={k} geometry={g} material={felt.mats} />
    ))}
  </>
);

// the thread each ornament hangs by (Scott: "should be strings, not rods"): a fine matte gold thread from the loop,
// straight up under the ornament's weight, then curving back over a branch and into the needles
const threads = new Map<Hang, THREE.TubeGeometry>();
const threadGeo = (h: Hang) => {
  let g = threads.get(h);
  if (!g) {
    const back = h.s ? 0.24 : 0.42; // how far in the branch is
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -CORD, 0),
      new THREE.Vector3(0, -CORD * 0.35, -0.005),
      new THREE.Vector3(0, 0.02, -0.06),
      new THREE.Vector3(0, 0.07, -back * 0.55),
      new THREE.Vector3(0, 0.04, -back),
    ]);
    g = new THREE.TubeGeometry(curve, 40, 0.0028, 6, false);
    threads.set(h, g);
  }
  return g;
};
const threadMat = () => new THREE.MeshStandardMaterial({ color: "#a8884e", roughness: 0.6, metalness: 0.25 });

const Ornament: React.FC<{ h: Hang; i: number; skins: Skins; gold: THREE.Material; thread: THREE.Material }> = ({ h, i, skins, gold, thread }) => {
  const frame = useCurrentFrame();
  const pop = h.at === undefined ? 1 : interpolate(frame, [h.at, h.at + 5, h.at + 10], [0.001, 1.15, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) });
  const t = frame / FPS;
  // already hanging, swinging gently on its cord, each at its own pace (a pendulum of its length ~1.3s)
  const ph = i * 1.9;
  const swing = (h.s ? 0.5 : 1) * 0.075 * Math.sin((2 * Math.PI * t) / (1.25 + i * 0.07) + ph) + (h.s ? 0.5 : 1) * 0.02 * Math.sin((2 * Math.PI * t) / 3.1 + ph);
  const turn = h.kind === "glass" ? 0.05 + 0.14 * Math.sin((2 * Math.PI * t) / 6 + ph) : 0.22 * Math.sin((2 * Math.PI * t) / 4.4 + ph);
  const hp = hangPoint(h);
  const glassMat = useMemo(() => {
    if (h.kind !== "glass") return null;
    const g = skins.glass[h.variant];
    return new THREE.MeshPhysicalMaterial({ map: g.map, roughnessMap: g.rough, metalnessMap: g.rough, roughness: 1, metalness: 1, clearcoat: 1, clearcoatRoughness: 0.02 });
  }, [h, skins]);
  const felt = useFelt(h.kind === "felt" ? h.variant : null, skins);
  const S = sizeOf(h);
  const topY = h.kind === "glass" ? 1.37 : 1.15; // the loop's top, in the ornament's own units
  return (
    // pivot at the hang point on the branch, facing out from the tree; the ornament hangs CORD below it
    <group position={[hp.x, hp.y, hp.z]} rotation={[0, h.a * 0.55, 0]} scale={pop}>
    <group rotation={[0, 0, swing]}>
      <mesh geometry={threadGeo(h)} material={thread} />
      <group position={[0, -CORD - topY * S, 0]} scale={S} rotation={[0, turn, 0]}>
        {h.kind === "glass" ? (
          <>
            <mesh material={glassMat!}>
              <sphereGeometry args={[1, 96, 72]} />
            </mesh>
            <mesh material={gold} position={[0, 1.08, 0]}>
              <cylinderGeometry args={[0.26, 0.29, 0.3, 32]} />
            </mesh>
            <mesh material={gold} position={[0, 1.33, 0]}>
              <torusGeometry args={[0.085, 0.02, 12, 32]} />
            </mesh>
          </>
        ) : (
          <>
            <FeltBody felt={felt!} />
            <mesh material={gold} position={[0, 1.08, 0.03]}>
              <torusGeometry args={[0.09, 0.018, 12, 32]} />
            </mesh>
          </>
        )}
      </group>
    </group>
    </group>
  );
};

const Tree: React.FC<{ skins: Skins }> = ({ skins }) => {
  const frame = useCurrentFrame();
  const { camera, gl, scene } = useThree();
  const env = useMemo(() => new THREE.PMREMGenerator(gl).fromScene(new RoomEnvironment(), 0.03).texture, [gl]);
  scene.environment = env;
  scene.environmentIntensity = 0.35;
  const [needles, twigs] = useMemo(() => {
    const { mats, cols, twigs: tm } = buildNeedles();
    // a needle: a slim flattened strand, tapering to its tip; matte, barely catching the room (it read as plastic)
    // a needle: a flat blade, broad at the base, tapering to a point, darker where it joins the twig, paler at the tip
    const geo = new THREE.CylinderGeometry(0.0022, 0.0075, 1, 4);
    geo.scale(1, 1, 0.38);
    geo.translate(0, 0.5, 0);
    const pos = geo.attributes.position;
    const vc = new Float32Array(pos.count * 3);
    for (let v = 0; v < pos.count; v++) {
      const k = 0.55 + 0.75 * pos.getY(v);
      vc[v * 3] = k * 1.05;
      vc[v * 3 + 1] = k;
      vc[v * 3 + 2] = k * 0.92;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(vc, 3));
    const mat = new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0, envMapIntensity: 0.1, vertexColors: true });
    const m = new THREE.InstancedMesh(geo, mat, mats.length);
    mats.forEach((mx, i) => {
      m.setMatrixAt(i, mx);
      m.setColorAt(i, cols[i]);
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    const tg = new THREE.CylinderGeometry(0.009, 0.012, 1, 5);
    tg.translate(0, 0.5, 0);
    const tw = new THREE.InstancedMesh(tg, new THREE.MeshStandardMaterial({ color: "#2b1d12", roughness: 1, envMapIntensity: 0.1 }), tm.length);
    tm.forEach((mx, i) => tw.setMatrixAt(i, mx));
    tw.instanceMatrix.needsUpdate = true;
    return [m, tw];
  }, []);
  const gold = useMemo(goldMat, []);
  const thread = useMemo(threadMat, []);
  const star = useFelt("star", skins);
  const glow = glowTexture();

  // the camera: close on each ornament in turn, gliding up the tree to arrive at the next on each downbeat, then
  // drawing back to the whole tree as the star goes on. Cylindrical: an angle round the tree, a height, a distance.
  const near = (i: number) => {
    const h = HANGS[i];
    const body = h.y - CORD - (h.kind === "glass" ? 1.37 : 1.15) * 0.33;
    return { a: h.a * 0.9, y: body + 0.12, look: body + 0.02, r: radiusAt(h.y) * 1.05 + 0.3 + 2.95, lr: radiusAt(h.y) * 0.9 };
  };
  let p = 0;
  for (let i = 1; i < HANGS.length; i++) p += interpolate(frame, [AT[i] - GLIDE, AT[i]], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.45, 0, 0.55, 1) });
  const i0 = Math.min(HANGS.length - 1, Math.floor(p)), fr = p - i0;
  const n0 = near(i0), n1 = near(Math.min(HANGS.length - 1, i0 + 1));
  const mix = (k: keyof typeof n0) => n0[k] + (n1[k] - n0[k]) * fr;
  const close = { a: mix("a"), y: mix("y"), look: mix("look"), r: mix("r"), lr: mix("lr") };
  const wide = { a: 0, y: 0.3, look: 0.25, r: 16.4, lr: 0 };
  const w = interpolate(frame, [bar(6) - 14, STAR_LAND + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const drift = interpolate(frame, [STAR_LAND + 12, TREE_FRAMES], [0, 0.7], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cam = {
    a: close.a + (wide.a - close.a) * w,
    y: close.y + (wide.y - close.y) * w,
    look: close.look + (wide.look - close.look) * w,
    r: close.r + (wide.r - close.r) * w + drift,
    lr: close.lr + (wide.lr - close.lr) * w,
  };
  camera.position.set(Math.sin(cam.a) * cam.r, cam.y, Math.cos(cam.a) * cam.r);
  camera.lookAt(Math.sin(cam.a) * cam.lr, cam.look, Math.cos(cam.a) * cam.lr);
  // depth into shadow: the far side of the tree and its inside fall away to black (fog), a few units past the subject
  const subject = cam.r - cam.lr;
  scene.fog = new THREE.Fog(0x000000, subject - 0.4, subject + 2.8 + 3 * w);

  // the lights: a soft twinkle, coming right up as the star lands
  const lift = interpolate(frame, [STAR_LAND - 6, STAR_LAND + 30], [0.55, 1.4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // the star: rising from below the frame's top to its place, turning to face us
  const rise = interpolate(frame, [STAR_FROM, STAR_LAND], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const starY = TOP_Y + 0.12 + (1 - rise) * 1.6;
  const starTurn = (1 - rise) * Math.PI * 1.5 + 0.12 * Math.sin(frame / 40);

  return (
    <>
      <ambientLight intensity={0.05} />
      <hemisphereLight args={["#9fb3c8", "#4a3420", 0.35]} />
      <directionalLight position={[3, 4, 6]} intensity={0.7} color="#ffdcb0" />
      <pointLight position={[-4, 1, 3]} intensity={6} color="#f4e2c4" />
      <pointLight position={[0, 1, -4]} intensity={8} color="#e8cf9c" />
      {/* the tree's own warm light from inside, for the needles near the bulbs */}
      {/* from the trunk, spread up the tree (one light against the core burnt a hot patch in the middle: Scott) */}
      {[-1.6, -0.2, 1.3].map((y) => (
        <pointLight key={y} position={[0, y, 0]} intensity={1.8 * lift} distance={3.6} color="#ffb766" />
      ))}
      <mesh position={[0, BASE_Y - 0.3, 0]}>
        <cylinderGeometry args={[0.12, 0.16, 1.0, 12]} />
        <meshStandardMaterial color="#2a1c12" roughness={0.9} />
      </mesh>
      <mesh position={[0, (BASE_Y + TOP_Y) / 2 - 0.1, 0]}>
        <coneGeometry args={[BASE_R * 0.62, TOP_Y - BASE_Y - 0.4, 40]} />
        <meshBasicMaterial color="#0b1c12" />
      </mesh>
      <primitive object={twigs} />
      <primitive object={needles} />
      {LIGHTS.map((l, i) => {
        const tw = 0.75 + 0.25 * Math.sin(frame / 9 + l.phase);
        // the late lights pop on in a cascade from the top over ~24 frames as the star lands: a bright flash, settling
        const at = STAR_LAND - 4 + l.pop * 24 + l.jitter * 6;
        if (l.pop >= 0 && frame < at) return null;
        const flash = l.pop >= 0 ? interpolate(frame, [at, at + 3, at + 18], [0, 2.6, 1.15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
        const o = Math.min(1, 0.85 * tw * lift * flash);
        const size = (0.075 + 0.04 * lift) * (1 + 0.7 * Math.max(0, flash - 1));
        return (
          <sprite key={i} position={l.p} scale={[size, size, 1]}>
            <spriteMaterial map={glow} transparent opacity={o} depthWrite={false} blending={THREE.AdditiveBlending} />
          </sprite>
        );
      })}
      {ALL.map((h, i) => (
        <Ornament key={i} h={h} i={i} skins={skins} gold={gold} thread={thread} />
      ))}
      {frame >= STAR_FROM - 2 ? (
        <group position={[0, starY, 0]} rotation={[0, starTurn, 0]}>
          <sprite scale={[1.9 * rise, 1.9 * rise, 1]} position={[0, 0, -0.05]}>
            <spriteMaterial map={glow} transparent opacity={0.85 * rise} depthWrite={false} blending={THREE.AdditiveBlending} />
          </sprite>
          <group scale={0.46} position={[0, -0.05, 0]}>
            <FeltBody felt={star!} />
          </group>
        </group>
      ) : null}
    </>
  );
};

// the house's label, bottom left, rising in once the camera has landed and clearing before it moves on
const HouseLabel: React.FC<{ i: number }> = ({ i }) => {
  const frame = useCurrentFrame();
  // in step with the camera: rising as the house comes into place, clearing as the camera sets off for the next
  const from = i === 0 ? 8 : AT[i] - 10;
  const to = i < HANGS.length - 1 ? AT[i + 1] - GLIDE + 10 : bar(6) - 10;
  const inP = interpolate(frame, [from, from + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT });
  const outP = interpolate(frame, [to - 8, to], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const o = inP * (1 - outP);
  if (o <= 0) return null;
  const [place, name] = LABELS[i];
  return (
    <div style={{ position: "absolute", left: 80, bottom: 385, opacity: o, transform: `translateY(${(1 - inP) * 14}px)`, textShadow: "0 2px 22px rgba(0,0,0,0.75)" }}>
      <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 28, letterSpacing: "0.24em", color: PAL.gold, textTransform: "uppercase", marginBottom: 10 }}>{place}</div>
      {name.split("\n").map((l) => (
        <div key={l} style={{ fontFamily: serif, fontWeight: 400, fontSize: 68, lineHeight: 1.04, color: PAL.pale }}>
          {l}
        </div>
      ))}
    </div>
  );
};

export const BaubleTree: React.FC = () => {
  const frame = useCurrentFrame();
  const [skins, setSkins] = useState<Skins | null>(null);
  const [handle] = useState(() => delayRender("tree skins"));
  useEffect(() => {
    (async () => {
      const cb = await cbMask();
      const glass: Skins["glass"] = {};
      for (const h of HANGS.filter((x) => x.kind === "glass")) {
        const v = BAUBLES[h.variant];
        glass[h.variant] = paintSkin(v.motif === "cb" ? cb : drawMotif(v.motif), v.glass, v.height);
      }
      const felt: Skins["felt"] = {};
      for (const variant of [...HANGS.filter((x) => x.kind === "felt").map((x) => x.variant), "star"]) {
        const def = FELTS[variant];
        const shapes = SHAPES[def.kind as Kind]();
        felt[variant] = { skin: paintFelt(def.kind as Kind, def.felt, shapes, cb, def.trim, def.thread), shapes };
      }
      setSkins({ glass, felt });
      continueRender(handle);
    })();
  }, [handle]);
  const total = TREE_FRAMES;
  const a = interpolate(frame, [LINE_AT, LINE_AT + 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT });
  const b = interpolate(frame, [LINE_AT + 8, LINE_AT + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT });
  const treeOut = interpolate(frame, [TREE_OUT, TREE_OUT + 24], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) });
  const fade = interpolate(frame, [total - 28, total - 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ opacity: treeOut }}>
      <AbsoluteFill style={{ transform: "scale(1.5)" }}>
        <DarkBack frame={frame} />
      </AbsoluteFill>
      {skins ? (
        <ThreeCanvas
          width={TREE_W}
          height={TREE_H}
          camera={{ fov: 30, position: [0, 0.5, 5], near: 0.05, far: 60 }}
          gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }}
        >
          <Tree skins={skins} />
        </ThreeCanvas>
      ) : null}
      {/* a soft shade at the foot of the frame so the labels read over the bright needles */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 900, opacity: interpolate(frame, [bar(6) - 30, bar(6) - 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), background: "linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0) 100%)" }} />
      {HANGS.map((_, i) => (
        <HouseLabel key={i} i={i} />
      ))}
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 830, textAlign: "center", color: PAL.pale }}>
        <div style={{ fontFamily: serif, fontWeight: 400, fontSize: 96, lineHeight: 1.05, opacity: a, transform: `translateY(${(1 - a) * 16}px)` }}>Merry Christmas,</div>
        <div style={{ fontFamily: serif, fontStyle: "italic", fontWeight: 400, fontSize: 74, lineHeight: 1.25, opacity: 0.94 * b, transform: `translateY(${(1 - b) * 16}px)` }}>
          from our houses to yours
        </div>
      </div>
      <Img src={staticFile("brand/cb-watermark.png")} style={{ position: "absolute", left: 920, top: 1452, width: 100, height: 108, opacity: 1 - treeOut }} />
      <AbsoluteFill style={{ background: "#000", opacity: fade }} />
      <Audio
        src={staticFile("music/festive/openmindaudio-vintage-christmas-swing-big-band-620485.mp3")}
        trimBefore={Math.round(FROM * FPS)}
        volume={(v) => 0.65 * interpolate(v, [0, 3, total - 28, total - 2], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      />
    </AbsoluteFill>
  );
};
