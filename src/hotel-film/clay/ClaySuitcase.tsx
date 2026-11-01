import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import React, { useEffect, useMemo } from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { FilmFinish } from "../components/FilmFinish";
import { colors, progress, sans, serif } from "../theme";

// "Packed?", a claymation test (Scott, 29 Oct: "a claymation type animation or that effect"; he picked
// the suitcase over the clay guest and the clay breakfast). A clay suitcase on a dark table, lit like a
// stop-motion set: matte, lumpy, thumbprinted plasticine, moving on twos (12 poses a second) with the
// small pose-to-pose wobble ("boil") of hand-animated clay. The lid pops open in steps, a pair of clay
// wellies hops in, the camera pushes into a welly and cuts on its squash to the real thing: Nailcote
// Hall in the snow (Scott: "Christmas stuff"; "enough Gisborough"). The Christmas reel would pack a
// stocking (Rowton Hall's mantel), a present (Langshott Manor's nutcracker), a Santa hat (Donnington's Santa,
// the families moment) and snap shut on "Packed for Christmas?". The full reel would pack an item per hotel (swimsuit to a spa, paperback to a
// fireside, scarf to a dusk stroll) and snap shut on "Packed?". Real 3D (three.js): render with
// `--gl=angle`.

const W = 1080;
const H = 1920;
export const CLAY_FRAMES = 300;
const END = 240; // the end card: the question on black, the white CB
const CUT = 158; // the cut from clay to the hotel, on the welly's squash

const ON_TWOS = (f: number) => Math.floor(f / 2) * 2;
const clampE = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const step = (f: number, a: number, b: number, from: number, to: number, ease = Easing.inOut(Easing.cubic)) =>
  interpolate(f, [a, b], [from, to], { ...clampE, easing: ease });

// a tiny repeatable jitter per pose: the "boil" of clay moved by hand between frames
const rnd = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const boil = (f: number, id: number, amp: number) => (rnd(ON_TWOS(f) * 0.37 + id * 9.13) - 0.5) * 2 * amp;

// plasticine, in the shader so no UVs are needed: the surface is pushed in and out by soft noise (lumps),
// the shading normal is roughened by finer noise (dents and smears), and both shift a little every pose,
// so the clay "boils" the way hand-animated plasticine does
const POSE = { value: 0 };
const GLSL_NOISE = `
  float h3(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
  float vnoise(vec3 x) {
    vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(h3(i), h3(i + vec3(1,0,0)), f.x), mix(h3(i + vec3(0,1,0)), h3(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(h3(i + vec3(0,0,1)), h3(i + vec3(1,0,1)), f.x), mix(h3(i + vec3(0,1,1)), h3(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  float fbm(vec3 p) { return 0.55 * vnoise(p) + 0.3 * vnoise(p * 2.3) + 0.15 * vnoise(p * 5.1); }
`;
const makeClay = (color: string, lump: number, rough: number) => {
  const m = new THREE.MeshStandardMaterial({ color, roughness: 0.95, metalness: 0 });
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uPose = POSE;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\nuniform float uPose;\nvarying vec3 vClayPos;\n${GLSL_NOISE}`)
      .replace("#include <begin_vertex>", `#include <begin_vertex>
        vec3 q = position * 1.4 + vec3(uPose * 0.013);
        transformed += objectNormal * (fbm(q) - 0.5) * ${lump.toFixed(3)};
        vClayPos = (modelMatrix * vec4(transformed, 1.0)).xyz;`);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\nuniform float uPose;\nvarying vec3 vClayPos;\n${GLSL_NOISE}`)
      .replace("#include <normal_fragment_maps>", `#include <normal_fragment_maps>
        vec3 cp = vClayPos * 7.0 + vec3(uPose * 0.02);
        float e = 0.04;
        float n0 = fbm(cp);
        vec3 g = vec3(fbm(cp + vec3(e, 0.0, 0.0)) - n0, fbm(cp + vec3(0.0, e, 0.0)) - n0, fbm(cp + vec3(0.0, 0.0, e)) - n0) / e;
        normal = normalize(normal - ${rough.toFixed(3)} * (viewMatrix * vec4(g, 0.0)).xyz);`);
  };
  return m;
};

const useClay = (color: string, lump = 0.06, rough = 0.09) => useMemo(() => makeClay(color, lump, rough), [color, lump, rough]);

// the suitcase: a shallow tray and a matching lid hinged along the back edge, gold clasps, a handle
const TW = 3.0;
const TD = 2.0;
const TH = 0.6;
const WALL = 0.16;
const Tray: React.FC<{ mat: THREE.Material }> = ({ mat }) => {
  const parts = useMemo(() => {
    const box = (w: number, h: number, d: number) => new RoundedBoxGeometry(w, h, d, 6, 0.08);
    return {
      bottom: box(TW, WALL, TD),
      front: box(TW, TH, WALL),
      back: box(TW, TH, WALL),
      left: box(WALL, TH, TD),
      right: box(WALL, TH, TD),
    };
  }, []);
  return (
    <group>
      <mesh geometry={parts.bottom} material={mat} position={[0, WALL / 2, 0]} castShadow receiveShadow />
      <mesh geometry={parts.front} material={mat} position={[0, TH / 2, TD / 2 - WALL / 2]} castShadow receiveShadow />
      <mesh geometry={parts.back} material={mat} position={[0, TH / 2, -TD / 2 + WALL / 2]} castShadow receiveShadow />
      <mesh geometry={parts.left} material={mat} position={[-TW / 2 + WALL / 2, TH / 2, 0]} castShadow receiveShadow />
      <mesh geometry={parts.right} material={mat} position={[TW / 2 - WALL / 2, TH / 2, 0]} castShadow receiveShadow />
    </group>
  );
};

// one welly, rolled from green clay: a slightly tapered leg with a rolled rim, a rounded toe pointing forward
// and a dark sole under the foot only
const Welly: React.FC<{ mat: THREE.Material; sole: THREE.Material }> = ({ mat, sole }) => {
  const g = useMemo(() => ({
    leg: new THREE.CylinderGeometry(0.21, 0.19, 0.72, 32, 6),
    rim: new THREE.TorusGeometry(0.205, 0.045, 12, 36),
    heel: new THREE.SphereGeometry(0.19, 28, 18),
    toe: new THREE.CapsuleGeometry(0.16, 0.26, 12, 28),
    sole: new RoundedBoxGeometry(0.36, 0.06, 0.72, 4, 0.03),
  }), []);
  return (
    <group>
      <mesh geometry={g.leg} material={mat} position={[0, 0.52, -0.06]} castShadow receiveShadow />
      <mesh geometry={g.rim} material={mat} position={[0, 0.88, -0.06]} rotation={[Math.PI / 2, 0, 0]} castShadow />
      <mesh geometry={g.heel} material={mat} position={[0, 0.2, -0.06]} castShadow receiveShadow />
      <mesh geometry={g.toe} material={mat} position={[0, 0.18, 0.2]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow />
      <mesh geometry={g.sole} material={sole} position={[0, 0.03, 0.08]} castShadow receiveShadow />
    </group>
  );
};

// the camera follows a keyed path, posed on twos like everything else
const Camera: React.FC<{ f: number }> = ({ f }) => {
  const { camera } = useThree();
  // wide on the case, then in to the welly as it lands
  const k = step(f, 112, CUT, 0, 1, Easing.in(Easing.cubic));
  const pos = new THREE.Vector3(0, 7.4, 9.0).lerp(new THREE.Vector3(0.35, 1.6, 2.1), k);
  const look = new THREE.Vector3(0, 1.1, -0.9).lerp(new THREE.Vector3(0.35, 0.65, 0.1), k);
  useEffect(() => {
    camera.position.copy(pos);
    camera.lookAt(look);
    camera.updateProjectionMatrix();
  });
  return null;
};

const Scene: React.FC<{ f: number }> = ({ f }) => {
  POSE.value = f;
  const tan = useClay("#c98a4e");
  const strap = useClay("#6b4527", 0.03);
  const gold = useMemo(() => new THREE.MeshStandardMaterial({ color: colors.gold, roughness: 0.55, metalness: 0.35 }), []);
  const green = useClay("#3b6b45", 0.05);
  const rubber = useClay("#262421", 0.02);
  const table = useClay("#1d1a17", 0.0, 0.05);
  const handle = useMemo(() => new THREE.TorusGeometry(0.32, 0.08, 14, 36, Math.PI), []);
  const clasp = useMemo(() => new RoundedBoxGeometry(0.22, 0.16, 0.08, 4, 0.03), []);

  // the lid: closed, a shiver, then open in three pops with a little overshoot
  const lid = f < 40 ? 0 : f < 70 ? step(f, 40, 70, 0, -1.2) + Math.sin((f - 40) / 3) * 0.02 : step(f, 70, 84, -1.2, -1.95, Easing.out(Easing.back(2)));
  const shiver = f > 26 && f < 40 ? boil(f, 1, 0.04) : 0;

  // the wellies hop in from the right, each in two arcs, squashing as they land
  const hop = (start: number, fromX: number, toX: number, toZ: number) => {
    const t = interpolate(f, [start, start + 36], [0, 1], clampE);
    const seg = t < 0.5 ? t / 0.5 : (t - 0.5) / 0.5;
    const x = interpolate(t, [0, 0.5, 1], [fromX, (fromX + toX) / 2, toX]);
    const z = interpolate(t, [0, 1], [0.4, toZ]);
    const floor = t < 0.5 ? 0 : WALL;
    const y = floor + Math.sin(seg * Math.PI) * (t < 0.5 ? 1.1 : 1.4) + (t >= 0.5 ? (1 - seg) * 0 : 0);
    const landed = t >= 1 ? 1 : 0;
    const sq = landed ? 1 - 0.18 * Math.max(0, 1 - (f - start - 36) / 6) : 1 + 0.08 * Math.sin(seg * Math.PI);
    return { x, y: t >= 1 ? WALL : y, z, sq, tilt: (1 - t) * -0.35 };
  };
  const w1 = hop(86, 4.2, 0.35, 0.1);
  const w2 = hop(100, 4.6, -0.35, 0.05);
  // the welly squashes as the camera arrives: the cut lands on it
  const squash = f > CUT - 8 ? 1 - 0.22 * step(f, CUT - 8, CUT, 0, 1) : 1;

  return (
    <>
      <color attach="background" args={["#0d0c0b"]} />
      <hemisphereLight args={["#fff1dc", "#1a1410", 0.7]} />
      <directionalLight position={[3.5, 7, 4.5]} intensity={2.4} color="#ffe7c4" castShadow
        shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-left={-6} shadow-camera-right={6}
        shadow-camera-top={6} shadow-camera-bottom={-6} shadow-bias={-0.0004} />
      <pointLight position={[-4, 2.5, -3]} intensity={18} color="#c39e55" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={table}>
        <planeGeometry args={[30, 30]} />
      </mesh>
      <group position={[boil(f, 2, 0.01), 0, boil(f, 3, 0.01)]} rotation={[0, -0.18 + boil(f, 4, 0.006), shiver]}>
        <Tray mat={tan} />
        {/* the lid, hinged on the back top edge */}
        <group position={[0, TH, -TD / 2]} rotation={[lid, 0, 0]}>
          <group position={[0, 0, TD / 2]} rotation={[Math.PI, 0, 0]}>
            <group position={[0, -TH, 0]}>
              <Tray mat={tan} />
            </group>
          </group>
          {/* the handle on the lid's front edge */}
          <mesh geometry={handle} material={strap} position={[0, -0.02, TD + 0.08]} rotation={[0, 0, 0]} castShadow />
        </group>
        {/* gold clasps on the front */}
        <mesh geometry={clasp} material={gold} position={[-0.9, TH - 0.06, TD / 2 + 0.03]} castShadow />
        <mesh geometry={clasp} material={gold} position={[0.9, TH - 0.06, TD / 2 + 0.03]} castShadow />
        {/* the wellies */}
        <group position={[w1.x + boil(f, 5, 0.01), w1.y, w1.z]} rotation={[0, -0.3, w1.tilt]} scale={[1 / Math.sqrt(w1.sq), w1.sq * squash, 1 / Math.sqrt(w1.sq)]}>
          <Welly mat={green} sole={rubber} />
        </group>
        <group position={[w2.x + boil(f, 6, 0.01), w2.y, w2.z]} rotation={[0, -0.1, w2.tilt]} scale={[1 / Math.sqrt(w2.sq), w2.sq, 1 / Math.sqrt(w2.sq)]}>
          <Welly mat={green} sole={rubber} />
        </group>
      </group>
      <Camera f={f} />
    </>
  );
};

// the house label: gold caps place over its underline, the name in cream Cormorant
const Label: React.FC<{ on: number }> = ({ on }) => (
  <AbsoluteFill style={{ opacity: on }}>
    <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(9,9,10,0) 52%, rgba(9,9,10,0.55) 74%, rgba(9,9,10,0.3) 100%)" }} />
    <div style={{ position: "absolute", left: 72, bottom: 500, transform: `translateY(${(1 - on) * 18}px)` }}>
      <div style={{ display: "inline-block" }}>
        <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 28, letterSpacing: "0.24em", color: colors.gold }}>WARWICKSHIRE</div>
        <div style={{ height: 2, marginTop: 12, background: colors.gold }} />
      </div>
      <div style={{ fontFamily: serif, fontSize: 64, lineHeight: 1.1, marginTop: 14, color: colors.cream, whiteSpace: "pre" }}>{"Nailcote Hall"}</div>
    </div>
  </AbsoluteFill>
);

export const ClaySuitcase: React.FC = () => {
  const frame = useCurrentFrame();
  const f = ON_TWOS(frame); // the clay lives on twos
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      {frame < CUT ? (
        <ThreeCanvas width={W} height={H} shadows camera={{ fov: 32, position: [0, 7.4, 9.0], near: 0.1, far: 60 }}>
          <Scene f={f} />
        </ThreeCanvas>
      ) : null}
      {frame >= CUT ? (
        <Img src={staticFile("campaigns/festive/graded/nailcote-hall-snow.jpg")} style={{ position: "absolute", width: W, height: H,
          objectFit: "cover", objectPosition: "46% 50%", transform: `scale(${interpolate(frame, [CUT, CLAY_FRAMES], [1, 1.05])})` }} />
      ) : null}
      <Label on={progress(frame, CUT + 8, 14) * (1 - progress(frame, END - 12, 10))} />
      {/* the end card */}
      <AbsoluteFill style={{ backgroundColor: colors.black, opacity: progress(frame, END - 6, 12) }} />
      <div style={{ position: "absolute", top: 800, width: "100%", textAlign: "center", fontFamily: serif, fontSize: 96,
        lineHeight: 1.12, color: colors.cream, opacity: progress(frame, END + 6, 16),
        transform: `translateY(${(1 - progress(frame, END + 6, 16)) * 22}px)` }}>
        Packed for
        <br />
        Christmas?
      </div>
      <Img src={staticFile("brand/cb-watermark.png")} style={{ position: "absolute", left: 490, top: 1300, width: 100, height: 108,
        opacity: progress(frame, END + 18, 16) }} />
      <FilmFinish />
    </AbsoluteFill>
  );
};
