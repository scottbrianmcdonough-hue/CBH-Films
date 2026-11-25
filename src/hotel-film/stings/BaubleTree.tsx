import { Audio } from "@remotion/media";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import React, { useEffect, useMemo, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { EASE_OUT, serif } from "../theme";
import { FELTS, Kind, paintFelt, SHAPES } from "./FeltOrnament";
import { BAUBLES, cbMask, DarkBack, drawMotif, paintSkin } from "./GlassBauble";

// The bauble tree (Bianca, 25 Nov: "really like the bauble stuff, can we have it baubles being hung on the Christmas
// tree, with the CB as the star on top of the tree? For 1st Dec"): a dark Christmas tree built in three.js (needles as
// thousands of instanced strands, warm fairy lights glowing in it), the glass and felt ornaments lowered onto its
// branches one a bar, each settling with a swing, the camera starting close and drawing back as the tree fills; then
// the CB (the logo's own outline, extruded in gold) rises to the top as the star and the lights come up the tree; "Merry
// Christmas, from our houses to yours". An AI assisted 3D render, 9:16.
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
  const dummy = new THREE.Object3D();
  const tiers = 34;
  for (let t = 0; t < tiers; t++) {
    const ty = BASE_Y + (t / tiers) * (TOP_Y - BASE_Y - 0.25);
    const branches = Math.max(6, Math.round(9 + 26 * (radiusAt(ty) / BASE_R)));
    for (let b = 0; b < branches; b++) {
      const y0 = ty + (r() - 0.5) * 0.22; // branches staggered, not in rings
      const R = radiusAt(y0);
      const ang = (b / branches) * Math.PI * 2 + r() * 0.9 + t * 2.4;
      const len = R * (0.8 + r() * 0.3);
      const segs = 13;
      for (let k = 1; k <= segs; k++) {
        const u = k / segs;
        // along the branch: out from the trunk, sagging a little, the tip turning up
        const d = u * len;
        const sag = -0.18 * Math.sin(u * Math.PI) * (len / BASE_R) + 0.08 * u * u;
        // the main stem, then from halfway two side shoots fanning out from it
        const shoot = u > 0.35 && k % 2 === 0 ? [0, 1, -1] : [0];
        for (const sd of shoot) {
        const off = sd * 0.16 * (1 - u * 0.4);
        const px = Math.sin(ang) * d + Math.cos(ang) * off, pz = Math.cos(ang) * d - Math.sin(ang) * off, py = y0 + sag - Math.abs(sd) * 0.03;
        const per = sd === 0 ? 10 : 7;
        for (let n = 0; n < per; n++) {
          const spin = (n / per) * Math.PI * 2 + r();
          const l = (0.15 + r() * 0.07) * (1 - 0.3 * u);
          dummy.position.set(px, py, pz);
          // a needle angled forward along the branch and out round it
          const dir = new THREE.Vector3(Math.sin(ang), 0.15, Math.cos(ang)).normalize();
          const side = new THREE.Vector3(Math.cos(ang), 0, -Math.sin(ang));
          const up = new THREE.Vector3().crossVectors(side, dir);
          const out = side.clone().multiplyScalar(Math.cos(spin)).add(up.clone().multiplyScalar(Math.sin(spin)));
          const nd = dir.clone().multiplyScalar(0.65).add(out.multiplyScalar(0.75)).normalize();
          const base = new THREE.Vector3(px, py, pz), tip = base.clone().addScaledVector(nd, l), mid = base.clone().addScaledVector(nd, l / 2);
          if (POCKETS().some((c) => c.distanceTo(base) < c.r || c.distanceTo(tip) < c.r || c.distanceTo(mid) < c.r)) continue;
          dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), nd);
          dummy.scale.set(1, l, 1);
          dummy.updateMatrix();
          mats.push(dummy.matrix.clone());
          const g = (0.7 + r() * 0.6) * (0.3 + 0.7 * u); // darker towards the trunk
          const blue = r() * 0.02;
          cols.push(new THREE.Color(0.025 * g, 0.085 * g, 0.05 * g + blue));
        }
        }
      }
    }
  }
  return { mats, cols };
};

// fairy lights scattered over the outside of the tree
const LIGHTS = (() => {
  const r = rng(91);
  return Array.from({ length: 170 }, () => {
    const y = BASE_Y + 0.1 + r() * (TOP_Y - BASE_Y - 0.5);
    const a = r() * Math.PI * 2;
    const R = radiusAt(y) * (0.82 + r() * 0.18);
    return { p: new THREE.Vector3(Math.sin(a) * R, y + 0.05, Math.cos(a) * R), phase: r() * 6.28, warm: r() };
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
type Hang = { kind: "glass" | "felt"; variant: string; y: number; a: number };
const HANGS: Hang[] = [
  { kind: "glass", variant: "tea", y: 0.2, a: -0.3 },
  { kind: "felt", variant: "manor", y: 1.3, a: 0.32 },
  { kind: "glass", variant: "key", y: -1.0, a: 0.45 },
  { kind: "felt", variant: "stocking", y: -2.1, a: -0.4 },
  { kind: "glass", variant: "manor", y: -0.6, a: -0.95 },
  { kind: "felt", variant: "teapot", y: 1.9, a: -0.2 },
];
const LAND = HANGS.map((_, i) => bar(i + 1)); // each lands on the downbeat of bars 1..6
const STAR_FROM = bar(6);
const STAR_LAND = bar(7); // the felt CB star seats on the top as the bar turns
// then the lit tree holds a bar, fades to black (Scott: "fade the Christmas tree out, then the cream Cormorant")
const TREE_OUT = bar(8);
const LINE_AT = TREE_OUT + 30;
const hangPoint = (h: Hang) => {
  const R = radiusAt(h.y) * 1.05 + 0.3;
  return new THREE.Vector3(Math.sin(h.a) * R, h.y, Math.cos(h.a) * R);
};
const DROP = 22;
// where each ornament's body hangs (its centre, below the cord), and the room it needs to swing in clear of needles
type Pocket = THREE.Vector3 & { r: number };
let pockets: Pocket[] | null = null;
const POCKETS = () =>
  (pockets ??= HANGS.map((h) => {
    const p = hangPoint(h);
    const drop = h.kind === "glass" ? CORD + 1.37 * 0.34 : CORD + 1.15 * 0.32;
    return Object.assign(new THREE.Vector3(p.x, p.y - drop, p.z), { r: h.kind === "glass" ? 0.41 : 0.38 });
  }));
const dropFor = (i: number) => (i === 0 ? LAND[0] : DROP);
const CORD = 0.32;

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

const Ornament: React.FC<{ h: Hang; i: number; skins: Skins; gold: THREE.Material }> = ({ h, i, skins, gold }) => {
  const frame = useCurrentFrame();
  const land = LAND[i];
  const t = (frame - land) / FPS;
  const drop = interpolate(frame, [land - dropFor(i), land], [i === 0 ? 2.2 : 1.4, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.2)) });
  const swing = t > 0 ? 0.2 * Math.exp(-t / 1.4) * Math.sin((2 * Math.PI * t) / 1.15) : 0;
  const turn = h.kind === "glass" ? -0.5 + 0.18 * (frame - land) / FPS : -0.6 * Math.exp(-Math.max(0, t) / 1.6) * Math.cos((2 * Math.PI * Math.max(0, t)) / 2.3) + 0.1 * Math.sin(frame / 45);
  const hp = hangPoint(h);
  const glassMat = useMemo(() => {
    if (h.kind !== "glass") return null;
    const g = skins.glass[h.variant];
    return new THREE.MeshPhysicalMaterial({ map: g.map, roughnessMap: g.rough, metalnessMap: g.rough, roughness: 1, metalness: 1, clearcoat: 1, clearcoatRoughness: 0.02 });
  }, [h, skins]);
  const felt = useFelt(h.kind === "felt" ? h.variant : null, skins);
  if (frame < land - dropFor(i)) return null;
  const S = h.kind === "glass" ? 0.34 : 0.32;
  const topY = h.kind === "glass" ? 1.37 : 1.15; // the loop's top, in the ornament's own units
  return (
    // pivot at the hang point on the branch; the ornament hangs CORD below it, lowered in from above
    <group position={[hp.x, hp.y + drop, hp.z]} rotation={[0, 0, swing]}>
      <mesh position={[0, -CORD / 2, 0]} material={gold}>
        <cylinderGeometry args={[0.004, 0.004, CORD, 6]} />
      </mesh>
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
  );
};

const Tree: React.FC<{ skins: Skins }> = ({ skins }) => {
  const frame = useCurrentFrame();
  const { camera, gl, scene } = useThree();
  const env = useMemo(() => new THREE.PMREMGenerator(gl).fromScene(new RoomEnvironment(), 0.03).texture, [gl]);
  scene.environment = env;
  scene.environmentIntensity = 0.35;
  const needles = useMemo(() => {
    const { mats, cols } = buildNeedles();
    const geo = new THREE.CylinderGeometry(0.007, 0.0105, 1, 4);
    geo.translate(0, 0.5, 0);
    const mat = new THREE.MeshStandardMaterial({ roughness: 0.75, metalness: 0 });
    const m = new THREE.InstancedMesh(geo, mat, mats.length);
    mats.forEach((mx, i) => {
      m.setMatrixAt(i, mx);
      m.setColorAt(i, cols[i]);
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    return m;
  }, []);
  const gold = useMemo(goldMat, []);
  const star = useFelt("star", skins);
  const glow = glowTexture();

  // the camera: close on each ornament as it lands, drawing back as the tree fills, then up to the star
  const keys = [
    { f: 0, d: 3.6, y: 0.55, x: 0 },
    ...HANGS.map((h, i) => {
      const p = hangPoint(h);
      return { f: LAND[i], d: 3.4 + i * 1.05, y: p.y * (1 - i / 9) - 0.25, x: p.x * (1 - i / 7) };
    }),
    { f: STAR_LAND, d: 15.8, y: 0.25, x: 0 },
    { f: TREE_FRAMES, d: 16.6, y: 0.25, x: 0 },
  ];
  const k = keys.findIndex((q, i) => i < keys.length - 1 && frame >= q.f && frame < keys[i + 1].f);
  const a = keys[Math.max(0, k)], b = keys[Math.max(0, k) + 1] ?? a;
  const u = b.f > a.f ? Easing.inOut(Easing.cubic)(Math.min(1, Math.max(0, (frame - a.f) / (b.f - a.f)))) : 0;
  const d = a.d + (b.d - a.d) * u, cy = a.y + (b.y - a.y) * u, cx = a.x + (b.x - a.x) * u;
  camera.position.set(cx, cy + 0.15, d + 1.2);
  camera.lookAt(cx, cy, 0);

  // the lights: a soft twinkle, coming right up as the star lands
  const lift = interpolate(frame, [STAR_LAND - 6, STAR_LAND + 30], [0.55, 1.25], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // the star: rising from below the frame's top to its place, turning to face us
  const rise = interpolate(frame, [STAR_FROM, STAR_LAND], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const starY = TOP_Y + 0.12 + (1 - rise) * 1.6;
  const starTurn = (1 - rise) * Math.PI * 1.5 + 0.12 * Math.sin(frame / 40);

  return (
    <>
      <ambientLight intensity={0.08} />
      <directionalLight position={[3, 4, 6]} intensity={0.9} color="#ffdcb0" />
      <pointLight position={[-4, 1, 3]} intensity={6} color="#f4e2c4" />
      <pointLight position={[0, 1, -4]} intensity={8} color="#e8cf9c" />
      {/* the tree's own warm light from inside, for the needles near the bulbs */}
      <pointLight position={[0, 0, 0.8]} intensity={3.5 * lift} distance={4.5} color="#ffbf73" />
      <mesh position={[0, BASE_Y - 0.3, 0]}>
        <cylinderGeometry args={[0.12, 0.16, 1.0, 12]} />
        <meshStandardMaterial color="#2a1c12" roughness={0.9} />
      </mesh>
      <mesh position={[0, (BASE_Y + TOP_Y) / 2 - 0.1, 0]}>
        <coneGeometry args={[BASE_R * 0.62, TOP_Y - BASE_Y - 0.4, 40]} />
        <meshStandardMaterial color="#0a1a10" roughness={1} />
      </mesh>
      <primitive object={needles} />
      {LIGHTS.map((l, i) => {
        const tw = 0.75 + 0.25 * Math.sin(frame / 9 + l.phase);
        const o = Math.min(0.9, 0.85 * tw * lift);
        return (
          <sprite key={i} position={l.p} scale={[0.09 + 0.04 * lift, 0.09 + 0.04 * lift, 1]}>
            <spriteMaterial map={glow} transparent opacity={o} depthWrite={false} blending={THREE.AdditiveBlending} />
          </sprite>
        );
      })}
      {HANGS.map((h, i) => (
        <Ornament key={i} h={h} i={i} skins={skins} gold={gold} />
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
        volume={(v) => 0.8 * interpolate(v, [0, 3, total - 28, total - 2], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      />
    </AbsoluteFill>
  );
};
