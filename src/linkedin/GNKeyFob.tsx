import { loadFont } from "@remotion/fonts";
import { Audio } from "@remotion/media";
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
  staticFile,
  useCurrentFrame,
} from "remotion";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GN_HEIGHT, GN_WIDTH } from "./GNStats";
import hotels from "./gn-map/hotels.json";

// "Your key", a Great National Group brand moment for LinkedIn (after the full-house fill and
// the map: Scott, "not as cool as the cb one ... needs to be fresh"): 4:5 and silent. A brass
// room key hangs on a split ring with a round fob, lime round navy like GN's badge, in warm low
// light. The fob turns on its ring and every face is one of GN's 26 hotels (name and town,
// the hotel behind it out of focus: Scott's photos from greatnationalhotels.com), turning
// faster and faster, then slowing until it lands face on as the badge itself; the key drops
// into the dark, the badge settles and GN's wordmark comes up beneath. Real 3D (three.js):
// the key and ring are lit brass, the fob glossy enamel. No shimmer (that's CBH's).
// Backgrounds: scripts/gn-key-bg.sh. Logo pieces cut from GN's theme SVG (public/brand/gn).

const serif = "Source Serif 4";
const sans = "Open Sans";
loadFont({
  family: serif,
  url: staticFile("fonts/SourceSerif4-Bold.woff2"),
  weight: "700",
});
loadFont({
  family: sans,
  url: staticFile("fonts/OpenSans.woff2"),
  weight: "300 800",
});

// GN's own colours, from the theme's logo SVG
const c = {
  lime: "#AFBD37",
  navy: "#152C3D",
  night: "#0C1823",
  white: "#FFFFFF",
};

type Hotel = { id: string; name: string; place: string; country: string };
const BY_ID = Object.fromEntries((hotels as Hotel[]).map((h) => [h.id, h]));
// the order the faces come round: readable ones first and last, Ireland and the UK mixed
const ORDER = [
  "ballina",
  "lensfield",
  "ballykisteen",
  "dower-house",
  "south-court",
  "langstone-cliff",
  "claregalway",
  "cliff-hotel",
  "newtown-park",
  "grand-swansea",
  "temple-gate",
  "penmere-manor",
  "shannon-springs",
  "speech-house",
  "killaloe",
  "hamlet-court",
  "abbey-hotel",
  "elfordleigh",
  "lady-gregory",
  "abbeyleix-manor",
  "crown-quarter",
  "midlands-park",
  "ballyroe-lodge",
  "gold-coast",
  "inn-woodhall-spa",
  "riverside-park",
];
const FACES = ORDER.length + 1; // the hotels, then the badge

// frames between one face and the next: slow enough to read, quickening to a spin, then
// slowing to land on the badge
const GAPS = [
  20, 15, 11, 8, 6, 5, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 6, 7, 9, 11, 14,
  18, 24,
];
const START = 20;
const FACE_AT = GAPS.reduce((a, g) => [...a, a[a.length - 1] + g], [START]);
const LANDED = FACE_AT[FACE_AT.length - 1];

// the lockup
const KEY_OUT = [LANDED + 14, LANDED + 40] as const;
const SETTLE = [LANDED + 26, LANDED + 62] as const;
const WORD = [LANDED + 48, LANDED + 74] as const;
export const GN_KEY_FOB_FRAMES = LANDED + 120;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (
  f: number,
  a: number,
  b: number,
  easing = Easing.inOut(Easing.cubic),
) => interpolate(f, [a, b], [0, 1], { ...clamp, easing });

// a smooth, never-reversing turn through the face times (Fritsch-Carlson monotone cubic),
// at rest at both ends: returns how many half turns the fob has made
const SLOPES = (() => {
  const n = FACE_AT.length;
  const d = FACE_AT.slice(1).map((t, i) => 1 / (t - FACE_AT[i]));
  const m = FACE_AT.map((_, i) =>
    i === 0 || i === n - 1 ? 0 : (2 * d[i - 1] * d[i]) / (d[i - 1] + d[i]),
  );
  return m;
})();
const halfTurns = (f: number) => {
  if (f <= FACE_AT[0]) return 0;
  if (f >= LANDED) return FACES - 1;
  let i = 0;
  while (FACE_AT[i + 1] < f) i++;
  const h = FACE_AT[i + 1] - FACE_AT[i];
  const t = (f - FACE_AT[i]) / h;
  const h00 = 2 * t ** 3 - 3 * t ** 2 + 1;
  const h10 = t ** 3 - 2 * t ** 2 + t;
  const h01 = -2 * t ** 3 + 3 * t ** 2;
  const h11 = t ** 3 - t ** 2;
  return (
    h00 * i + h10 * h * SLOPES[i] + h01 * (i + 1) + h11 * h * SLOPES[i + 1]
  );
};

// --- the fob's faces, drawn once ---

const TEX = 1024;
const FACE_R = 0.94; // the flat face; the rounded lime edge takes it out to 1
const DISC = 0.903 / FACE_R; // the navy disc, as a share of the face (the badge's own ratio)

const wrap = (ctx: CanvasRenderingContext2D, text: string, max: number) => {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (ctx.measureText(next).width > max && line) {
      lines.push(line);
      line = w;
    } else line = next;
  }
  lines.push(line);
  return lines;
};

const hotelFace = (h: Hotel) => {
  const cv = document.createElement("canvas");
  cv.width = cv.height = TEX;
  const ctx = cv.getContext("2d")!;
  const m = TEX / 2;
  ctx.fillStyle = c.lime;
  ctx.fillRect(0, 0, TEX, TEX);
  // a shade deeper than GN's navy: the warm light lifts the enamel, and it should read navy
  // while it turns, not slate (the badge face flattens to the exact colours at the end)
  ctx.fillStyle = "#0B2032";
  ctx.beginPath();
  ctx.arc(m, m, m * DISC, 0, Math.PI * 2);
  ctx.fill();

  // the name, as large as fits in three lines, with the town in lime caps above
  let size = 124;
  let lines: string[] = [];
  for (; size > 60; size -= 4) {
    ctx.font = `700 ${size}px "${serif}"`;
    lines = wrap(ctx, h.name, 740);
    if (
      lines.length <= 3 &&
      lines.every((l) => ctx.measureText(l).width <= 760)
    )
      break;
  }
  const lead = size * 1.12;
  const capSize = 42;
  const gap = 36;
  const block = capSize + gap + lead * lines.length;
  const top = m - block / 2;
  ctx.fillStyle = c.lime;
  ctx.font = `700 ${capSize}px "${sans}"`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.letterSpacing = "8px";
  ctx.fillText(h.place.toUpperCase(), m + 4, top + capSize * 0.8);
  ctx.letterSpacing = "0px";
  ctx.fillStyle = c.white;
  ctx.font = `700 ${size}px "${serif}"`;
  lines.forEach((l, i) =>
    ctx.fillText(l, m, top + capSize + gap + lead * i + size * 0.82),
  );
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
};

const badgeFace = (badge: HTMLImageElement) => {
  const cv = document.createElement("canvas");
  cv.width = cv.height = TEX;
  const ctx = cv.getContext("2d")!;
  ctx.fillStyle = c.lime;
  ctx.fillRect(0, 0, TEX, TEX);
  // the badge's navy disc meets the face's edge where the hotel faces' discs do
  const s = TEX * (DISC / 0.903);
  ctx.drawImage(badge, (TEX - s) / 2, (TEX - s) / 2, s, s);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
};

// --- the key: an old barrel key, built round its hanging point (the top of the bow) ---

const bitShape = (() => {
  // the bit, stepped like a lever lock key's
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(0.34, 0);
  s.lineTo(0.34, 0.07);
  s.lineTo(0.25, 0.07);
  s.lineTo(0.25, 0.12);
  s.lineTo(0.34, 0.12);
  s.lineTo(0.34, 0.21);
  s.lineTo(0.2, 0.21);
  s.lineTo(0.2, 0.26);
  s.lineTo(0.34, 0.26);
  s.lineTo(0.34, 0.33);
  s.lineTo(0, 0.33);
  s.closePath();
  return s;
})();

const extrude = (shape: THREE.Shape, depth: number, bevel: number) => {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 4,
    curveSegments: 48,
  });
  g.translate(0, 0, -depth / 2);
  return g;
};

const Key: React.FC<{ mat: THREE.Material }> = ({ mat }) => {
  const bit = useMemo(() => extrude(bitShape, 0.05, 0.015), []);
  return (
    <group>
      {/* the bow: a cast oval ring, round in section (a flat one read as a washer) */}
      <mesh
        castShadow
        receiveShadow
        material={mat}
        position={[0, -0.3, 0]}
        scale={[1, 1.12, 1]}
      >
        <torusGeometry args={[0.2, 0.062, 32, 96]} />
      </mesh>
      <mesh castShadow receiveShadow material={mat} position={[0, -0.59, 0]}>
        <cylinderGeometry args={[0.05, 0.068, 0.08, 40]} />
      </mesh>
      {/* the collar and the shaft */}
      <mesh castShadow receiveShadow material={mat} position={[0, -0.66, 0]}>
        <cylinderGeometry args={[0.075, 0.075, 0.09, 40]} />
      </mesh>
      <mesh castShadow receiveShadow material={mat} position={[0, -0.76, 0]}>
        <cylinderGeometry args={[0.058, 0.058, 0.05, 40]} />
      </mesh>
      <mesh castShadow receiveShadow material={mat} position={[0, -1.4, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 1.3, 32]} />
      </mesh>
      <mesh castShadow receiveShadow material={mat} position={[0, -2.05, 0]}>
        <sphereGeometry args={[0.05, 24, 16]} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={bit}
        material={mat}
        position={[0.02, -2.06, 0]}
      />
    </group>
  );
};

// --- the scene ---

const Environment: React.FC<{ intensity: number }> = ({ intensity }) => {
  const { gl, scene } = useThree();
  const env = useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    return pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  }, [gl]);
  scene.environment = env;
  scene.environmentIntensity = intensity;
  return null;
};

const PIVOT = 1.59; // the split ring's centre, above the fob's
const CAM_D = 9.6;
const CAM_Y = 0.5;
const PX = GN_HEIGHT / (2 * CAM_D * Math.tan((15 * Math.PI) / 180)); // pixels a unit at the fob
// the lockup, in GN's own proportions: badge 300px, the wordmark 2.4x its width beneath
const BADGE_PX = 300;
const LOCK_TOP =
  (GN_HEIGHT - (BADGE_PX * (1 + 11.2 / 121.1) + BADGE_PX * (58 / 121.1))) / 2;
const BADGE_CY = LOCK_TOP + BADGE_PX / 2;
const WORD_TOP = LOCK_TOP + BADGE_PX * (1 + 11.2 / 121.1);
const WORD_W = BADGE_PX * (292 / 121.1);

const Scene: React.FC<{ faces: THREE.Texture[] }> = ({ faces }) => {
  const frame = useCurrentFrame();
  const turns = halfTurns(frame);
  const angle = turns * Math.PI;
  const front = Math.min(FACES - 1, 2 * Math.round(turns / 2));
  const back = Math.min(FACES - 1, 2 * Math.floor(turns / 2) + 1);

  const keyOut = ramp(frame, KEY_OUT[0], KEY_OUT[1]);
  const settle = ramp(frame, SETTLE[0], SETTLE[1]);
  // the badge flattens to its true colours as the light goes off the key
  const flat = ramp(frame, LANDED + 10, SETTLE[0] + 10);

  // a slow swing on the ring, calming as the fob comes to rest
  const calm = 1 - settle;
  const swing =
    (0.075 * Math.sin((frame / 64) * Math.PI * 2 + 0.6) +
      0.02 * Math.sin((frame / 23) * Math.PI * 2)) *
    calm;
  const tilt = 0.06 * Math.sin((frame / 80) * Math.PI * 2) * calm;
  const keySway = 0.05 * Math.sin((frame / 64) * Math.PI * 2 - 0.4) * calm;

  const brass = useMemo(() => {
    // handled brass: fine streaks along each part break up the shine, so it reads as metal
    // that has been in hands, not as gold plastic
    const cv = document.createElement("canvas");
    cv.width = cv.height = 256;
    const ctx = cv.getContext("2d")!;
    ctx.fillStyle = "rgb(200,200,200)";
    ctx.fillRect(0, 0, 256, 256);
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 900; i++) {
      const v = 140 + rnd() * 115;
      ctx.fillStyle = `rgba(${v},${v},${v},0.35)`;
      ctx.fillRect(rnd() * 256, 0, 0.6 + rnd() * 1.6, 256);
    }
    const rough = new THREE.CanvasTexture(cv);
    rough.wrapS = rough.wrapT = THREE.RepeatWrapping;
    return new THREE.MeshStandardMaterial({
      color: "#B39352",
      metalness: 1,
      roughness: 0.48,
      roughnessMap: rough,
      transparent: true,
    });
  }, []);
  // the key goes into the dark: its light falls away as it fades, so it sinks into the
  // shadow instead of turning to glass
  brass.opacity = 1 - ramp(frame, KEY_OUT[0] + 8, KEY_OUT[1]);
  brass.color.set("#B39352").multiplyScalar(1 - 0.85 * keyOut);
  brass.envMapIntensity = 1 - keyOut;
  brass.depthWrite = keyOut < 0.7;

  const faceMats = useMemo(
    () =>
      [0, 1].map(
        () =>
          new THREE.MeshPhysicalMaterial({
            roughness: 0.7,
            clearcoat: 1,
            clearcoatRoughness: 0.12,
            emissive: new THREE.Color("#FFFFFF"),
          }),
      ),
    [],
  );
  const edgeMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        roughness: 0.6,
        clearcoat: 1,
        clearcoatRoughness: 0.15,
      }),
    [],
  );
  const lime = new THREE.Color(c.lime);
  [faceMats[0], faceMats[1]].forEach((m, k) => {
    const map = faces[k === 0 ? front : back];
    if (m.map !== map) {
      m.map = map;
      m.emissiveMap = map;
      m.needsUpdate = true;
    }
    m.color.setScalar(0.8 * (1 - flat));
    m.emissiveIntensity = flat;
    // a dielectric still catches the light; that lifted the navy to grey, so the enamel keeps
    // little of it, and none once flat
    m.specularIntensity = 0.12 * (1 - flat);
    m.clearcoat = 0.6 * (1 - flat);
    m.envMapIntensity = 0.12 * (1 - flat);
    m.roughness = 0.7 + 0.3 * flat;
  });
  edgeMat.color.copy(lime).multiplyScalar(0.62 * (1 - flat));
  edgeMat.emissive.copy(lime);
  edgeMat.emissiveIntensity = flat;
  edgeMat.specularIntensity = 0.6 * (1 - flat);
  edgeMat.clearcoat = 0.7 * (1 - flat);
  edgeMat.envMapIntensity = 0.3 * (1 - flat);

  // the whole rig lifts and shrinks into the lockup, round the fob's centre
  const s = interpolate(settle, [0, 1], [1, BADGE_PX / (2 * PX)]);
  const y = interpolate(
    settle,
    [0, 1],
    [0, CAM_Y + (GN_HEIGHT / 2 - BADGE_CY) / PX],
  );

  return (
    <>
      <Environment intensity={0.7 * (1 - flat * 0.6)} />
      <ambientLight intensity={0.18} color="#FFE6C8" />
      <directionalLight
        position={[-3, 4, 6]}
        intensity={2.1}
        color="#FFE2BE"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
      />
      <directionalLight
        position={[3, 1.5, -2]}
        intensity={1.2}
        color="#FFC48A"
      />
      <group position={[0, y, 0]} scale={s}>
        <group position={[0, PIVOT, 0]} rotation={[tilt, 0, swing]}>
          <group position={[0, -PIVOT, 0]}>
            {/* the split ring */}
            <mesh
              castShadow
              receiveShadow
              material={brass}
              position={[0, PIVOT, 0]}
              rotation={[0, -0.9, 0]}
            >
              <torusGeometry args={[0.36, 0.034, 20, 96]} />
            </mesh>
            {/* the key, hanging behind, off to the left */}
            <group
              position={[-0.01, PIVOT + 0.096, -0.28]}
              rotation={[0, 0.2, -0.86 + keySway]}
            >
              <Key mat={brass} />
            </group>
            {/* the fob, turning on its own loop */}
            <group rotation={[0, angle, 0]}>
              <mesh
                castShadow
                receiveShadow
                material={brass}
                position={[0, 1.11, 0]}
                rotation={[0, Math.PI / 2, 0]}
              >
                <torusGeometry args={[0.11, 0.03, 16, 48]} />
              </mesh>
              <mesh
                castShadow
                receiveShadow
                material={faceMats[0]}
                position={[0, 0, 0.06]}
              >
                <circleGeometry args={[FACE_R, 128]} />
              </mesh>
              <mesh
                castShadow
                receiveShadow
                material={faceMats[1]}
                position={[0, 0, -0.06]}
                rotation={[0, Math.PI, 0]}
              >
                <circleGeometry args={[FACE_R, 128]} />
              </mesh>
              <mesh castShadow receiveShadow material={edgeMat}>
                <torusGeometry args={[FACE_R, 0.06, 24, 160]} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </>
  );
};

// --- the film ---

const BG = (id: string) => staticFile(`campaigns/gn-key/bg/${id}.jpg`);

// with its sound (scripts/gn-key-sfx.py: the key, the ticks of the turn, the landing) or not
export const GNKeyFob: React.FC<{ sound?: boolean }> = ({ sound = true }) => {
  const frame = useCurrentFrame();
  const [faces, setFaces] = useState<THREE.Texture[] | null>(null);
  const [handle] = useState(() => delayRender("gn-key-fob faces"));

  useEffect(() => {
    const badge = new Image();
    badge.src = staticFile("brand/gn/gnh-badge.svg");
    Promise.all([
      document.fonts.load(`700 100px "${serif}"`),
      document.fonts.load(`700 38px "${sans}"`),
      badge.decode(),
    ]).then(() => {
      setFaces([...ORDER.map((id) => hotelFace(BY_ID[id])), badgeFace(badge)]);
      continueRender(handle);
    });
  }, [handle]);

  const turns = halfTurns(frame);
  const n = Math.floor(turns);
  const frac = turns - n;
  // each hotel's photo behind its face, crossing to the next as the fob goes edge on, and
  // held back in the dark while it spins fast
  const mix = interpolate(frac, [0.3, 0.7], [0, 1], clamp);
  const speed = halfTurns(frame + 0.5) - halfTurns(frame - 0.5);
  const dim = interpolate(speed, [0.07, 0.22], [0, 0.6], clamp);
  const bgFor = (i: number) => (i < ORDER.length ? ORDER[i] : null);
  const layers = [
    { id: bgFor(n), o: 1 - mix },
    { id: bgFor(n + 1), o: mix },
  ];
  const word = ramp(frame, WORD[0], WORD[1], Easing.out(Easing.cubic));

  return (
    <AbsoluteFill style={{ backgroundColor: c.night }}>
      {sound ? <Audio src={staticFile("campaigns/gn-key/sfx.wav")} /> : null}
      {layers.map((l, k) =>
        l.id && l.o > 0 ? (
          <Img
            key={k}
            src={BG(l.id)}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              opacity: l.o * (1 - dim),
            }}
          />
        ) : null,
      )}
      {/* a pool of warm light round the key, the corners falling away */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 45%, rgba(0,0,0,0) 0%, rgba(6,10,14,0.55) 70%, rgba(6,10,14,0.85) 100%)",
        }}
      />
      {faces ? (
        <ThreeCanvas
          width={GN_WIDTH}
          height={GN_HEIGHT}
          flat
          shadows
          camera={{
            fov: 30,
            position: [0, CAM_Y, CAM_D],
            // looking straight ahead (not down at the origin), so the lockup lands where it is placed
            rotation: [0, 0, 0],
            near: 0.1,
            far: 50,
          }}
          gl={{ antialias: true, alpha: true }}
        >
          <Scene faces={faces} />
        </ThreeCanvas>
      ) : null}
      {/* GN's wordmark, coming up beneath the badge */}
      <Img
        src={staticFile("brand/gn/gnh-wordmark-on-navy.svg")}
        style={{
          position: "absolute",
          left: (GN_WIDTH - WORD_W) / 2,
          top: WORD_TOP + (1 - word) * 24,
          width: WORD_W,
          opacity: word,
        }}
      />
    </AbsoluteFill>
  );
};
