import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import React, { useEffect, useMemo, useState } from "react";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  Easing,
  Img,
  interpolate,
  random,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import * as THREE from "three";
import { Audio } from "@remotion/media";
import { FilmFinish } from "../components/FilmFinish";
import { HotelName } from "../story/HotelName";
import { colors, sans, serif } from "../theme";

// "Shake up your winter" (Bianca, 21 Oct: a Hintlesham Hall social comp on
// CB Facebook and Instagram, a family winter break as the prize, "in a more creative way";
// the sketch style is Holdsworth's, so a new take; no snow joke in the copy, Scott: people
// would take it as a promise). A glass snow globe on a dark walnut table in warm light, the
// hall inside on a curved card, HINTLESHAM HALL in gold round its black base. It is
// tapped and shaken, the snow swirls up through the glass and settles over the hall, the
// camera goes in through the glass, and the hall comes up full frame under the house
// caption; end card: win a family winter break, comment who you'd bring. Real 3D
// (three.js; render with --gl=angle). Mock-up, silent.

export const GLOBE_FPS = 30;
const W = 1080;
const H = 1920;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (
  f: number,
  a: number,
  b: number,
  e = Easing.inOut(Easing.cubic),
) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: e });

// the timeline: the globe at rest, then a shake every two seconds, each showing a new
// corner of the hall through the swirl (Scott: "every shake a different photo or video");
// the camera goes in through the glass on the last, into the hall lit for Christmas
// Christmas Swing by AtlasAudio (Pixabay 621552; Scott checked it, in no other film):
// 112.3 BPM (0.5455s beats), the first downbeat at 1.161s, a bar every 2.182s; the film
// plays from the track's start. A shake on each bar from bar 1, the camera in through the
// glass on bar 6, the end card on the phrase change (bar 8, 18.62s, the crash).
const BEAT = 0.5455;
const bar = (n: number) => Math.round((1.161 + 4 * BEAT * n) * GLOBE_FPS);
const SHAKES = [bar(1), bar(2), bar(3), bar(4), bar(5)];
const SHAKE_LEN = 26;
const SWAP = 9; // frames after a shake: the new scene comes through the thick of the snow
const SWAP_LEN = 12;
const INTO = bar(5.25); // the camera starts in through the glass
const PHOTO = bar(6); // the hall full frame
const CARD = bar(8);
// the payoff: the hall for a bar, then a quick fire of the scenes from the globe, now
// full frame, a beat each on hard cuts (a frame ahead of the beat)
const QUICK = [2, 3, 4, 1].map((k, i) => ({
  k,
  from: Math.round((1.161 + 4 * BEAT * 7 + BEAT * i) * GLOBE_FPS) - 1,
}));
export const GLOBE_FRAMES = bar(11.5); // the end card held 3.5 bars (Scott: hold it a bit)

// the globe
const BASE_H = 0.62;
const R = 1.2; // the glass
const CY = BASE_H + R * 0.86; // its centre
const FLOOR = BASE_H + 0.1; // the snowy ground inside
const CARD_Y = FLOOR + 0.6; // the middle of the scene's card
const MUSIC_GAIN = 0.6;
const ENV_SRC = staticFile("hotels/hintlesham-hall/carriers-restaurant.jpg");
const D = "campaigns/hintlesham-comp";
// what is in the globe: at rest, then after each shake (cx: the crop's centre across)
const SCENES: { src: string; cx: number }[] = [
  { src: `${D}/hintlesham-night-reflection.jpg`, cx: 0.62 }, // lit up at night
  { src: "hotels/hintlesham-hall/hotel-grounds-001.jpg", cx: 0.52 }, // misty autumn grounds
  { src: `${D}/hintlesham-lounge.jpg`, cx: 0.5 }, // the lamp-lit lounge
  { src: `${D}/hintlesham-afternoon-tea.jpg`, cx: 0.66 }, // afternoon tea
  { src: `${D}/hintlesham-queen-anne-suite.jpg`, cx: 0.62 }, // the Queen Anne suite
  // the last, and the way in: the hall lit for Christmas (Scott: autumn and winter, not
  // summer, so the summer walk up the drive is out)
  { src: "campaigns/cbh-site/hintlesham-hall-christmas-night.jpg", cx: 0.5 },
];
const FINAL = SCENES[SCENES.length - 1].src;

// --- the snow: deterministic, from the frame alone ---
const N = 1600;
type Flake = {
  r0: number; // resting radius and angle on the ground
  a0: number;
  sy: number; // where the shake throws it
  sr: number;
  sa: number;
  fall: number; // units per second
  swirl: number; // radians per second at the start of the swirl
  sway: number;
  size: number;
};
let seed = 7;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const FLAKES: Flake[] = Array.from({ length: N }, () => {
  const sy = FLOOR + 0.15 + rnd() * (CY + R * 0.7 - FLOOR - 0.15);
  return {
    r0: Math.sqrt(rnd()) * 0.95,
    a0: rnd() * Math.PI * 2,
    sy,
    sr: Math.sqrt(rnd()),
    sa: rnd() * Math.PI * 2,
    fall: 0.07 + rnd() * 0.16,
    swirl: (rnd() < 0.5 ? -1 : 1) * (1.2 + rnd() * 2.4),
    sway: rnd() * Math.PI * 2,
    size: 0.005 + rnd() * rnd() * 0.013,
  };
});
// the room inside the glass at a height (a little in from the wall)
const roomAt = (y: number) =>
  0.9 * Math.sqrt(Math.max(0, R * R - (y - CY) * (y - CY)));

// the settled snow: a soft mound, higher in the middle and banked up against the glass,
// with drifts across it (the first cut was a flat disc, Scott: "static")
const GROUND_R = 0.9 * Math.sqrt(R * R - (FLOOR + 0.05 - CY) ** 2) + 0.02;
const surf = (x: number, z: number) => {
  const u = Math.min(1, Math.hypot(x, z) / GROUND_R);
  const dome = 0.05 * Math.pow(1 - u * u, 0.8);
  const bank = 0.03 * Math.pow(Math.max(0, (u - 0.8) / 0.2), 2);
  const drift =
    0.009 * Math.sin(5.1 * x + 1.3) * Math.sin(4.3 * z + 0.7) +
    0.006 * Math.sin(9.7 * x - 6.1 * z + 2.1) +
    0.004 * Math.sin(17.3 * z + 3.9 * x);
  return dome + bank + drift * (1 - u * u * 0.6);
};
const ground = (r: number, a: number): [number, number, number] => {
  const x = r * Math.cos(a);
  const z = r * Math.sin(a);
  return [x, FLOOR + surf(x, z) + 0.004, z];
};
const TAU = 1.6;
// shake k: where the storm carries a flake t seconds after the shake, and where it lands
const stormAt = (f: Flake, k: number, t: number): [number, number, number] => {
  const sy =
    FLOOR +
    0.15 +
    (((f.sy - FLOOR - 0.15) * (1 + 0.37 * k)) % (CY + R * 0.7 - FLOOR - 0.15));
  const sa = f.sa + k * 1.7;
  const swirl = f.swirl * (k % 2 ? -1 : 1);
  const SL = SHAKE_LEN / GLOBE_FPS;
  const angAt = (tq: number) => sa + swirl * TAU * (1 - Math.exp(-tq / TAU));
  // the swirl dies away just above the mound, then the flake drops onto its own spot on
  // the drifts (the angle is frozen first, so a landed flake never slides)
  const tl1 = (sy - FLOOR - 0.03) / f.fall + SL;
  const land = ground(f.sr * roomAt(FLOOR + 0.02), angAt(tl1));
  const tl2 = (sy - land[1]) / f.fall + SL;
  if (t >= tl2) return land;
  const ang = angAt(Math.min(t, tl1));
  const y = Math.max(land[1], sy - Math.max(0, t - SL) * f.fall);
  // the radius eases to the landing spot's, so the flake doesn't jump sideways as it lands
  const near = Math.min(1, (y - land[1]) / 0.15);
  const rr = f.sr * (roomAt(y) * near + roomAt(FLOOR + 0.02) * (1 - near));
  const sw = 0.03 * near;
  return [
    rr * Math.cos(ang) + sw * Math.sin(t * 2.1 + f.sway),
    y,
    rr * Math.sin(ang),
  ];
};

const flakeAt = (f: Flake, frame: number): [number, number, number] => {
  // the last shake before this frame, thrown from wherever the flake was then
  let k = -1;
  for (let i = 0; i < SHAKES.length; i++) if (frame >= SHAKES[i]) k = i;
  if (k < 0) return ground(f.r0 * roomAt(FLOOR + 0.02), f.a0);
  const from: [number, number, number] =
    k === 0
      ? ground(f.r0 * roomAt(FLOOR + 0.02), f.a0)
      : stormAt(f, k - 1, (SHAKES[k] - SHAKES[k - 1]) / GLOBE_FPS);
  const t = (frame - SHAKES[k]) / GLOBE_FPS;
  const p = stormAt(f, k, t);
  const up = ramp(
    frame,
    SHAKES[k],
    SHAKES[k] + SHAKE_LEN,
    Easing.out(Easing.cubic),
  );
  return [
    from[0] + (p[0] - from[0]) * up,
    from[1] + (p[1] - from[1]) * up,
    from[2] + (p[2] - from[2]) * up,
  ];
};

const Snow: React.FC<{ frame: number }> = ({ frame }) => {
  const mesh = useMemo(() => {
    const m = new THREE.InstancedMesh(
      new THREE.SphereGeometry(1, 8, 6),
      new THREE.MeshStandardMaterial({
        color: "#ffffff",
        roughness: 0.6,
        emissive: "#f4f1ea",
        emissiveIntensity: 0.35,
      }),
      N,
    );
    m.frustumCulled = false;
    return m;
  }, []);
  // placed synchronously for this frame, before the canvas draws it
  const mtx = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const pos = new THREE.Vector3();
  const scl = new THREE.Vector3();
  FLAKES.forEach((f, i) => {
    const [x, y, z] = flakeAt(f, frame);
    mtx.compose(pos.set(x, y, z), q, scl.set(f.size, f.size * 0.6, f.size));
    mesh.setMatrixAt(i, mtx);
  });
  mesh.instanceMatrix.needsUpdate = true;
  return <primitive object={mesh} />;
};

// --- the materials ---
const walnut = () => {
  const cv = document.createElement("canvas");
  cv.width = 1024;
  cv.height = 1024;
  const ctx = cv.getContext("2d")!;
  ctx.fillStyle = "#2a1a10";
  ctx.fillRect(0, 0, 1024, 1024);
  let s = 11;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 520; i++) {
    const y = r() * 1024;
    ctx.strokeStyle =
      r() < 0.5
        ? `rgba(14,8,4,${0.15 + r() * 0.3})`
        : `rgba(90,58,34,${0.08 + r() * 0.18})`;
    ctx.lineWidth = 0.6 + r() * 2.4;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= 1024; x += 64)
      ctx.lineTo(x, y + Math.sin(x / 140 + i) * (2 + r() * 4));
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.anisotropy = 8;
  return tex;
};

// the gold lettering round the base, engraved: gold on the black lacquer
const lettering = () => {
  const cv = document.createElement("canvas");
  cv.width = 4096;
  cv.height = 256;
  const ctx = cv.getContext("2d")!;
  ctx.fillStyle = "#0d0c0b";
  ctx.fillRect(0, 0, 4096, 256);
  ctx.fillStyle = colors.gold;
  ctx.font = `600 120px "${sans}"`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // spaced caps centred on u = 0.5 (the band is turned so that faces the camera)
  const spaced = "HINTLESHAM HALL"
    .split("")
    .join(String.fromCharCode(8202, 8202));
  // the canvas wraps the whole band, so a pixel across is 1.57x a pixel down: drawn
  // narrower to match, the letters keep their true shape and the name sits in the front
  // ~80 degrees instead of stretching round to the sides
  ctx.save();
  ctx.translate(2048, 132);
  ctx.scale(4096 / (2 * Math.PI * 1.203) / (256 / 0.3), 1);
  ctx.fillText(spaced, 0, 0);
  ctx.restore();
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
};

const baseGeometry = () =>
  new THREE.LatheGeometry(
    [
      [0.001, 0],
      [1.24, 0],
      [1.27, 0.03],
      [1.27, 0.08],
      [1.2, 0.12],
      [1.2, 0.44],
      [1.12, 0.5],
      [1.0, BASE_H - 0.04],
      [0.96, BASE_H],
      [0.001, BASE_H],
    ].map(([x, y]) => new THREE.Vector2(x, y)),
    160,
  );

const Environment: React.FC<{ room: THREE.Texture }> = ({ room }) => {
  const { gl, scene } = useThree();
  const env = useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    return pmrem.fromEquirectangular(room).texture;
  }, [gl, room]);
  scene.environment = env;
  scene.environmentIntensity = 0.9;
  return null;
};

// --- the camera ---
const FOV = 30;
const camFor = (frame: number) => {
  // a slow push through the whole table shot, then in through the glass
  const push = interpolate(frame, [0, INTO], [9.4, 8.2], clamp);
  const into = ramp(frame, INTO, PHOTO, Easing.in(Easing.cubic));
  const d = push + (0.9 - push) * into;
  const elev = 0.2 * (1 - into);
  const lookY = CY + 0.3 + (CARD_Y - (CY + 0.3)) * into;
  // a jolt as it's tapped
  const k = SHAKES.reduce(
    (a, sh) =>
      a +
      ramp(frame, sh, sh + 3, Easing.linear) *
        (1 - ramp(frame, sh + 3, sh + 14)),
    0,
  );
  return {
    pos: new THREE.Vector3(
      0.04 * k,
      lookY + d * Math.sin(elev),
      d * Math.cos(elev),
    ),
    look: new THREE.Vector3(0, lookY, 0),
  };
};
const CameraRig: React.FC<{ frame: number }> = ({ frame }) => {
  const { camera } = useThree();
  const { pos, look } = camFor(frame);
  camera.position.copy(pos);
  camera.lookAt(look);
  camera.updateProjectionMatrix();
  return null;
};

// the mound's surface: lathed, then displaced by the drifts, with a fine snow grain
const groundGeometry = () => {
  const pts: THREE.Vector2[] = [];
  // outside in, so the faces look up
  for (let i = 40; i >= 0; i--)
    pts.push(new THREE.Vector2((GROUND_R * i) / 40, 0));
  const g = new THREE.LatheGeometry(pts, 160);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    p.setY(i, surf(p.getX(i), p.getZ(i)));
  }
  g.computeVertexNormals();
  return g;
};

const snowGrain = () => {
  const cv = document.createElement("canvas");
  cv.width = 1024;
  cv.height = 1024;
  const ctx = cv.getContext("2d")!;
  ctx.fillStyle = "#f4f1ea";
  ctx.fillRect(0, 0, 1024, 1024);
  let s = 23;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  // faint blue-grey hollows, then the grain
  for (let i = 0; i < 70; i++) {
    const x = r() * 1024;
    const y = r() * 1024;
    const rad = 40 + r() * 140;
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, "rgba(176,186,200,0.16)");
    g.addColorStop(1, "rgba(176,186,200,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  for (let i = 0; i < 60000; i++) {
    const v = r();
    ctx.fillStyle =
      v < 0.5
        ? `rgba(150,158,170,${0.05 + r() * 0.08})`
        : `rgba(255,255,255,${0.12 + r() * 0.2})`;
    ctx.fillRect(r() * 1024, r() * 1024, 1 + r() * 1.5, 1 + r() * 1.5);
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.anisotropy = 8;
  return tex;
};

// ice crystals in the settled snow, each catching the light now and then
const GLINTS = Array.from({ length: 320 }, () => {
  const r = Math.sqrt(rnd()) * GROUND_R * 0.97;
  const a = rnd() * Math.PI * 2;
  const x = r * Math.cos(a);
  const z = r * Math.sin(a);
  return {
    x,
    y: FLOOR + surf(x, z) + 0.003,
    z,
    w: 0.05 + rnd() * 0.09,
    ph: rnd() * Math.PI * 2,
    size: 0.005 + rnd() * 0.005,
  };
});

const Glints: React.FC<{ frame: number }> = ({ frame }) => {
  const mesh = useMemo(() => {
    const m = new THREE.InstancedMesh(
      new THREE.OctahedronGeometry(1, 0),
      new THREE.MeshBasicMaterial({ color: "#ffffff", toneMapped: false }),
      GLINTS.length,
    );
    m.frustumCulled = false;
    return m;
  }, []);
  const mtx = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const pos = new THREE.Vector3();
  const scl = new THREE.Vector3();
  const col = new THREE.Color();
  GLINTS.forEach((g, i) => {
    const tw = Math.pow(Math.max(0, Math.sin(frame * g.w + g.ph)), 8);
    const k = 0.35 + 2.2 * tw;
    mtx.compose(pos.set(g.x, g.y, g.z), q, scl.setScalar(g.size * (0.6 + tw)));
    mesh.setMatrixAt(i, mtx);
    mesh.setColorAt(i, col.setRGB(k, k * 0.97, k * 0.9));
  });
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  return <primitive object={mesh} />;
};

const Scene: React.FC<{
  frame: number;
  room: THREE.Texture;
  scenes: HTMLImageElement[];
}> = ({ frame, room, scenes }) => {
  const table = useMemo(walnut, []);
  const letters = useMemo(lettering, []);
  const groundGeo = useMemo(groundGeometry, []);
  const grain = useMemo(snowGrain, []);
  const base = useMemo(baseGeometry, []);
  // the shake: a quick wobble about the base, dying away
  const wob = SHAKES.reduce((a, sh, i) => {
    if (frame < sh) return a;
    const st = (frame - sh) / GLOBE_FPS;
    return (
      a + (i % 2 ? -1 : 1) * 0.07 * Math.sin(st * 22) * Math.exp(-st * 4.5)
    );
  }, 0);
  const lacquer = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#0d0c0b",
        roughness: 0.32,
        clearcoat: 1,
        clearcoatRoughness: 0.12,
      }),
    [],
  );
  const gold = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: colors.gold,
        metalness: 1,
        roughness: 0.25,
      }),
    [],
  );
  const glass = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#ffffff",
        metalness: 0,
        roughness: 0.02,
        transmission: 1,
        thickness: 0.35,
        ior: 1.33,
        clearcoat: 1,
        clearcoatRoughness: 0.02,
        envMapIntensity: 1.3,
        transparent: true,
      }),
    [],
  );
  // the card: the photo on a curve behind the middle of the globe, inside the glass,
  // cropped round the house (u reversed: it is seen from inside the curve)
  const card = useMemo(() => {
    // 12% larger than the first cut, so the scene fills more of the globe
    const g = new THREE.CylinderGeometry(
      0.694,
      0.694,
      1.4,
      64,
      1,
      true,
      -0.95,
      1.9,
    );
    const uv = g.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setX(i, 1 - uv.getX(i));
    return g;
  }, []);
  // each scene cropped round its subject with feathered edges, so it sits in the globe
  // like a scene rather than a print (the sides and the sky fade out, the ground meets
  // the snow), flattened onto the dark behind the globe so the card stays solid (hashed
  // alpha fizzed at the edges, Scott)
  const crops = useMemo(
    () =>
      scenes.map((img, i) => {
        const cv = document.createElement("canvas");
        cv.width = 1024;
        cv.height = 1088;
        const ctx = cv.getContext("2d")!;
        const sw = Math.min(img.width, img.height * (1024 / 1088));
        const sx = Math.min(
          img.width - sw,
          Math.max(0, img.width * SCENES[i].cx - sw / 2),
        );
        const sh = sw * (1088 / 1024);
        const sy = Math.max(0, (img.height - sh) / 2);
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, 1024, 1088);
        ctx.globalCompositeOperation = "destination-in";
        const gx = ctx.createLinearGradient(0, 0, 1024, 0);
        gx.addColorStop(0, "rgba(0,0,0,0)");
        gx.addColorStop(0.14, "rgba(0,0,0,1)");
        gx.addColorStop(0.86, "rgba(0,0,0,1)");
        gx.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = gx;
        ctx.fillRect(0, 0, 1024, 1088);
        const gy = ctx.createLinearGradient(0, 0, 0, 1088);
        gy.addColorStop(0, "rgba(0,0,0,0)");
        gy.addColorStop(0.2, "rgba(0,0,0,1)");
        gy.addColorStop(1, "rgba(0,0,0,1)");
        ctx.fillStyle = gy;
        ctx.fillRect(0, 0, 1024, 1088);
        return cv;
      }),
    [scenes],
  );
  // the card for this frame: the scene showing, dissolving into the next through the
  // thick of the snow just after each shake
  const [cardCanvas, cardTex] = useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = 1024;
    cv.height = 1088;
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return [cv, t] as const;
  }, []);
  let shown = 0;
  let mix = 0;
  SHAKES.forEach((sh, i) => {
    if (frame >= sh + SWAP) {
      shown = i;
      mix = ramp(
        frame,
        sh + SWAP,
        sh + SWAP + SWAP_LEN,
        Easing.inOut(Easing.quad),
      );
    }
  });
  if (frame >= SHAKES[0] + SWAP && mix >= 1) {
    shown += 1;
    mix = 0;
  }
  {
    const o = cardCanvas.getContext("2d")!;
    o.globalAlpha = 1;
    o.fillStyle = "#0a0807";
    o.fillRect(0, 0, 1024, 1088);
    o.drawImage(crops[shown], 0, 0);
    if (mix > 0) {
      o.globalAlpha = mix;
      o.fillRect(0, 0, 1024, 1088);
      o.drawImage(crops[shown + 1], 0, 0);
    }
    cardTex.needsUpdate = true;
  }
  return (
    <>
      <CameraRig frame={frame} />
      <Environment room={room} />
      <ambientLight intensity={0.1} color="#FFE6C8" />
      <spotLight
        position={[2.2, 7.5, 4.5]}
        angle={0.42}
        penumbra={0.85}
        intensity={110}
        color="#FFDDB0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
      />
      <pointLight position={[-3, 2.4, 2]} intensity={6} color="#C9D4E8" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[90, 90]} />
        <meshStandardMaterial map={table} roughness={0.55} metalness={0} />
      </mesh>
      <group rotation={[0, 0, wob]} position={[0, 0, 0]}>
        <mesh geometry={base} material={lacquer} castShadow receiveShadow />
        <mesh
          position={[0, 0.085, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          material={gold}
        >
          <torusGeometry args={[1.255, 0.012, 12, 200]} />
        </mesh>
        <mesh position={[0, 0.28, 0]} rotation={[0, Math.PI, 0]}>
          <cylinderGeometry args={[1.203, 1.203, 0.3, 160, 1, true]} />
          <meshPhysicalMaterial
            map={letters}
            roughness={0.32}
            clearcoat={1}
            clearcoatRoughness={0.12}
            metalness={0.2}
          />
        </mesh>
        <mesh
          position={[0, BASE_H - 0.01, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          material={gold}
        >
          <torusGeometry args={[0.97, 0.016, 12, 200]} />
        </mesh>
        {/* inside: the snowy ground and the hall on its card */}
        <mesh geometry={groundGeo} position={[0, FLOOR, 0]} receiveShadow>
          <meshStandardMaterial
            map={grain}
            roughness={0.88}
            emissive="#f4f1ea"
            emissiveIntensity={0.24}
          />
        </mesh>
        <Glints frame={frame} />
        <mesh
          geometry={card}
          position={[0, FLOOR + 0.6, -0.05]}
          rotation={[0, Math.PI, 0]}
        >
          {/* a little of its own light, so the scene glows through the glass rather
              than sitting dim behind it */}
          <meshStandardMaterial
            map={cardTex}
            emissiveMap={cardTex}
            emissive="#ffffff"
            emissiveIntensity={0.32}
            side={THREE.BackSide}
            roughness={0.7}
          />
        </mesh>
        <group position={[0, 0, 0]}>
          <Snow frame={frame} />
        </group>
        <mesh position={[0, CY, 0]} material={glass}>
          <sphereGeometry args={[R, 96, 64]} />
        </mesh>
      </group>
    </>
  );
};

// the giveaway, said from the first frame (Bianca, 4 Nov: "make it obvious that it's a giveaway ...
// I wouldn't know it's a giveaway until the last frame ... a thumbnail to the beginning to serve as
// the grid/reel preview"): WIN in gold caps (its underline dropped, Scott: no gold underlines), the prize in cream Cormorant under
// it, already in place on frame one (the cover and the grid preview, inside the grid's 3:4 crop),
// held over the globe through every shake and gone as the camera goes in through the glass
const Line: React.FC<{ frame: number }> = ({ frame }) => {
  const o = 1 - ramp(frame, INTO - 14, INTO + 4);
  return (
    <div
      style={{
        position: "absolute",
        top: 262,
        left: 60,
        right: 60,
        textAlign: "center",
        opacity: o,
        transform: `translateY(${(-(1 - o) * 14).toFixed(2)}px)`,
        textShadow: "0 2px 24px rgba(9,9,10,0.7)",
      }}
    >
      <div
        style={{
          display: "inline-block",
          fontFamily: sans,
          fontWeight: 600,
          fontSize: 76,
          lineHeight: 1,
          letterSpacing: "0.3em",
          color: colors.gold,
        }}
      >
        <span style={{ marginRight: "-0.3em" }}>WIN</span>
      </div>
      <div
        style={{
          marginTop: 28,
          fontFamily: serif,
          fontWeight: 500,
          fontSize: 80,
          lineHeight: 1.06,
          color: colors.cream,
        }}
      >
        A family overnight stay
        <br />
        at Hintlesham Hall
      </div>
    </div>
  );
};

// a light snowfall behind the end card, so the long hold keeps a little life (Scott): sparse,
// slow and soft, two depths, the far flakes smaller and dimmer, never over the copy's weight
const END_FLAKES = Array.from({ length: 70 }, (_, i) => {
  const far = i % 3 !== 0;
  return {
    x: random(`ex${i}`) * W,
    y: random(`ey${i}`) * (H + 200) - 100,
    r: far ? 3 + random(`er${i}`) * 4 : 7 + random(`er${i}`) * 7,
    v: far ? 0.9 + random(`ev${i}`) * 0.6 : 1.6 + random(`ev${i}`) * 0.9,
    o: far ? 0.2 + random(`eo${i}`) * 0.16 : 0.34 + random(`eo${i}`) * 0.2,
    sway: 10 + random(`es${i}`) * 22,
    ph: random(`ep${i}`) * Math.PI * 2,
  };
});

const EndSnow: React.FC = () => {
  const f = useCurrentFrame();
  // falling from the card's first frame (a slow fade read as a second's delay, Scott)
  const fade = ramp(f, 0, 4, Easing.linear);
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      {END_FLAKES.map((k, i) => {
        const y = ((k.y + f * k.v + 100) % (H + 200)) - 100;
        const x = k.x + Math.sin(f / 38 + k.ph) * k.sway;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - k.r,
              top: y - k.r,
              width: k.r * 2,
              height: k.r * 2,
              borderRadius: "50%",
              opacity: k.o,
              background:
                "radial-gradient(circle, rgba(243,238,228,1) 0%, rgba(243,238,228,0.55) 45%, rgba(243,238,228,0) 72%)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const a = ramp(frame, 0, 18, Easing.out(Easing.cubic));
  const b = ramp(frame, 22, 40, Easing.out(Easing.cubic));
  const c = ramp(frame, 36, 52, Easing.out(Easing.cubic));
  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.black,
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        paddingBottom: 120,
      }}
    >
      <EndSnow />
      <div
        style={{
          opacity: a,
          transform: `translateY(${(1 - a) * 24}px)`,
          fontFamily: serif,
          fontWeight: 500,
          fontSize: 100,
          lineHeight: 1.06,
          color: colors.cream,
        }}
      >
        Win a family
        <br />
        overnight stay
      </div>
      <div
        style={{
          opacity: a,
          marginTop: 24,
          fontFamily: serif,
          fontSize: 52,
          color: colors.cream,
        }}
      >
        at Hintlesham Hall Hotel
      </div>
      <div
        style={{
          opacity: b,
          marginTop: 74,
          fontFamily: sans,
          fontWeight: 600,
          fontSize: 28,
          letterSpacing: "0.24em",
          color: colors.gold,
        }}
      >
        <span
          style={{
            display: "inline-block",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ marginRight: "-0.24em" }}>
            FOLLOW AND COMMENT WHO YOU&rsquo;D BRING
          </span>
        </span>
      </div>
      <div
        style={{
          opacity: c * 0.8,
          marginTop: 40,
          fontFamily: sans,
          fontSize: 30,
          color: colors.cream,
        }}
      >
        Closes 10 December. T&amp;Cs apply
      </div>
    </AbsoluteFill>
  );
};

// one of the quick fire: full frame, a touch of push so it never sits still
const QuickShot: React.FC<{ src: string; cx: number; len: number }> = ({
  src,
  cx,
  len,
}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black, overflow: "hidden" }}>
      <Img
        src={staticFile(src)}
        style={{
          width: W,
          height: H,
          objectFit: "cover",
          objectPosition: `${cx * 100}% 50%`,
          transform: `scale(${interpolate(f, [0, len], [1.06, 1.0], clamp)})`,
          // autumn and winter colours (Scott): warmer, the cool whites taken to cream
          filter: "sepia(0.22) saturate(1.12) contrast(1.04) brightness(0.96)",
        }}
      />
      {/* a low amber light over it, deeper at the edges */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 60% 35%, rgba(255,170,80,0.10) 0%, rgba(40,20,5,0.32) 100%)",
          mixBlendMode: "multiply",
        }}
      />
      <AbsoluteFill
        style={{
          backgroundColor: "rgba(255,150,60,0.07)",
          mixBlendMode: "soft-light",
        }}
      />
    </AbsoluteFill>
  );
};

export const SnowGlobe: React.FC = () => {
  const frame = useCurrentFrame();
  const [tex, setTex] = useState<{
    room: THREE.Texture;
    scenes: HTMLImageElement[];
  } | null>(null);
  const [handle] = useState(() => delayRender("snow globe textures"));
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    const load = (src: string) =>
      new Promise<THREE.Texture>((res) => loader.load(src, res));
    Promise.all([
      load(ENV_SRC),
      ...SCENES.map((sc) => load(staticFile(sc.src))),
    ]).then(([room, ...pics]) => {
      room.mapping = THREE.EquirectangularReflectionMapping;
      room.colorSpace = THREE.SRGBColorSpace;
      setTex({ room, scenes: pics.map((p) => p.image as HTMLImageElement) });
      continueRender(handle);
    });
  }, [handle]);
  // the photo full frame, as the camera arrives at the card
  // the photo takes over from the globe over the last three frames of the move in, laid
  // exactly over the card: its scale and drop follow the camera (fitted to the card as
  // rendered, matching it to within a few percent), so the two never show at different
  // sizes; then it draws back to the whole hall in one move
  const full = ramp(frame, PHOTO - 3, PHOTO, Easing.linear);
  const camAt = (f: number) =>
    8.2 + (0.9 - 8.2) * ramp(f, INTO, PHOTO, Easing.in(Easing.cubic));
  const tracked = (f: number) => 2.532 / (camAt(f) + 0.27);
  const landed = tracked(PHOTO);
  const back = ramp(frame, PHOTO, QUICK[0].from, Easing.out(Easing.cubic));
  const push = frame < PHOTO ? tracked(frame) : landed + (1 - landed) * back;
  // the photo's centre sits below the frame's by about 156px per unit of scale as it lands
  const drop = frame < PHOTO ? 156 * push : 156 * landed * (1 - back);
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      {tex && full < 1 ? (
        <AbsoluteFill>
          <ThreeCanvas
            width={W}
            height={H}
            shadows
            camera={{ fov: FOV, near: 0.05, far: 100, position: [0, 2, 9] }}
            gl={{ antialias: true }}
          >
            <color attach="background" args={["#0a0807"]} />
            <fog attach="fog" args={["#0a0807", 11, 22]} />
            <Scene frame={frame} room={tex.room} scenes={tex.scenes} />
          </ThreeCanvas>
          <AbsoluteFill
            style={{
              background:
                "radial-gradient(ellipse 80% 55% at 50% 50%, rgba(9,9,10,0) 45%, rgba(9,9,10,0.8) 100%)",
            }}
          />
        </AbsoluteFill>
      ) : null}
      {full > 0 ? (
        <AbsoluteFill style={{ opacity: full }}>
          {/* the hall lit for Christmas, opening from the globe's framing */}
          <Img
            src={staticFile(FINAL)}
            style={{
              position: "absolute",
              height: H,
              width: (1920 / 1280) * H,
              left: W / 2 - ((1920 / 1280) * H) / 2,
              top: 0,
              transform: `translateY(${drop}px) scale(${push})`,
            }}
          />
        </AbsoluteFill>
      ) : null}
      {QUICK.map((q, i) => {
        const to = i + 1 < QUICK.length ? QUICK[i + 1].from : CARD;
        const sc = SCENES[q.k];
        return (
          <Sequence key={q.k} from={q.from} durationInFrames={to - q.from}>
            <QuickShot src={sc.src} cx={sc.cx} len={to - q.from} />
          </Sequence>
        );
      })}
      <Sequence from={PHOTO} durationInFrames={CARD - PHOTO}>
        <HotelName
          name="Hintlesham Hall Hotel"
          place="Hintlesham, Suffolk"
          len={CARD - PHOTO}
        />
      </Sequence>
      <Line frame={frame} />
      {/* a tap on the glass just before each shake, then the shake itself
          (scripts/globe-sfx.py: noise only) */}
      {SHAKES.map((sh, i) => (
        <React.Fragment key={`sfx-${i}`}>
          <Sequence from={sh - 2} durationInFrames={18}>
            <Audio
              src={staticFile(`${D}/audio/tap-${(i % 3) + 1}.wav`)}
              volume={0.24}
            />
          </Sequence>
          <Sequence from={sh} durationInFrames={44}>
            <Audio
              src={staticFile(`${D}/audio/shake-${(i % 3) + 1}.wav`)}
              volume={0.22}
            />
          </Sequence>
        </React.Fragment>
      ))}
      <Audio
        src={staticFile(`${D}/audio/christmas-swing.mp3`)}
        volume={(f) =>
          MUSIC_GAIN *
          interpolate(
            f,
            [0, 4, GLOBE_FRAMES - bar(1.5) + bar(0), GLOBE_FRAMES],
            [0, 1, 1, 0],
            clamp,
          )
        }
      />
      <Sequence from={CARD}>
        <EndCard />
      </Sequence>
      <Img
        src={staticFile("brand/cb-watermark.png")}
        style={{
          position: "absolute",
          left: 920,
          top: 1452,
          width: 100,
          height: 108,
          opacity: ramp(frame, PHOTO, PHOTO + 12),
        }}
      />
      <FilmFinish />
    </AbsoluteFill>
  );
};
