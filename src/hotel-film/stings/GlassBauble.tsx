import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import React, { useEffect, useMemo, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

// A CBH glass bauble (Scott, 25 Nov: The Relais Cooden Beach's AI baubles, "can we try something like it but in glass
// or felt", "make it CBH so it's fresh and original", "do it in code and then render in jpg or mp4", "like the
// snowglobe"). Built in three.js, not generated: black glass with a gold painted band, the real CB monogram (the
// logo's own outline) fired on in gold, a fluted gold cap and a gold cord, turning slowly on its cord in a pool of
// gold bokeh. The 2026 brand palette (Scott, 25 Nov): black #000000 and gold #c7ab77 lead, with the neutrals pale
// #f2f0f0 and light beige #ebe8e4; the secondaries (red #a05272, green #869674, blue #779096, heather #755c78)
// only as a lift, one or two at most, never leading.

export const BAUBLE_W = 1080;
export const BAUBLE_H = 1350;
export const BAUBLE_FRAMES = 240;

const PAL = {
  black: "#000000",
  gold: "#c7ab77",
  pale: "#f2f0f0",
  beige: "#ebe8e4",
  green: "#869674",
};

const TW = 2048;
const TH = 1024; // equirectangular: square pixels at the equator
const FRONT_U = 0.25; // three's SphereGeometry faces +z (the camera) at u = 0.25

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((res, rej) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = rej;
    im.src = src;
  });

// the CB, cut tight from the logo's frame and filled flat gold
const cbMask = async () => {
  const im = await loadImage(staticFile("brand/cbh-logo-cb-only.svg"));
  const s = 4;
  const c = document.createElement("canvas");
  c.width = 534 * s;
  c.height = 656 * s;
  const x = c.getContext("2d")!;
  x.drawImage(im, 0, 0, c.width, c.height);
  const d = x.getImageData(0, 0, c.width, c.height).data;
  let x0 = c.width, y0 = c.height, x1 = 0, y1 = 0;
  for (let y = 0; y < c.height; y++)
    for (let i = 0; i < c.width; i++)
      if (d[(y * c.width + i) * 4 + 3] > 8) {
        x0 = Math.min(x0, i); x1 = Math.max(x1, i); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      }
  const out = document.createElement("canvas");
  out.width = x1 - x0 + 1;
  out.height = y1 - y0 + 1;
  out.getContext("2d")!.drawImage(c, x0, y0, out.width, out.height, 0, 0, out.width, out.height);
  return out;
};

// trim a canvas to its painted pixels
const trim = (c: HTMLCanvasElement) => {
  const x = c.getContext("2d")!;
  const d = x.getImageData(0, 0, c.width, c.height).data;
  let x0 = c.width, y0 = c.height, x1 = 0, y1 = 0;
  for (let y = 0; y < c.height; y++)
    for (let i = 0; i < c.width; i++)
      if (d[(y * c.width + i) * 4 + 3] > 8) {
        x0 = Math.min(x0, i); x1 = Math.max(x1, i); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      }
  const out = document.createElement("canvas");
  out.width = x1 - x0 + 1;
  out.height = y1 - y0 + 1;
  out.getContext("2d")!.drawImage(c, x0, y0, out.width, out.height, 0, 0, out.width, out.height);
  return out;
};

// The gold designs for the other baubles, drawn as line work like gilding on glass (white here; the skin turns it
// gold), on an 800 x 800 board.
const drawMotif = (kind: string) => {
  const c = document.createElement("canvas");
  c.width = 800;
  c.height = 800;
  const k = c.getContext("2d")!;
  k.strokeStyle = "#fff";
  k.fillStyle = "#fff";
  k.lineCap = "round";
  k.lineJoin = "round";
  const line = (pts: number[][], w: number) => {
    k.lineWidth = w;
    k.beginPath();
    pts.forEach(([x, y], i) => (i ? k.lineTo(x, y) : k.moveTo(x, y)));
    k.stroke();
  };
  const ell = (x: number, y: number, rx: number, ry: number, w: number, fill = false) => {
    k.lineWidth = w;
    k.beginPath();
    k.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    if (fill) k.fill();
    else k.stroke();
  };
  if (kind === "manor") {
    // a Georgian country house: cornice and pediment, two chimneys, lit windows, a wreath on the arched door
    k.lineWidth = 14;
    k.strokeRect(160, 330, 480, 320);
    line([[130, 330], [670, 330]], 20);
    line([[300, 330], [400, 252], [500, 330]], 14);
    k.strokeRect(200, 250, 44, 80);
    k.strokeRect(556, 250, 44, 80);
    // windows as gilded outlines with a glazing bar, so the house reads as line work, not a grid of blocks
    const win = (x: number, y: number) => {
      k.lineWidth = 9;
      k.strokeRect(x, y, 48, 66);
      line([[x + 24, y + 4], [x + 24, y + 62]], 5);
      line([[x + 4, y + 33], [x + 44, y + 33]], 5);
    };
    for (const y of [370, 470]) for (const x of [196, 276, 376, 476, 556]) win(x, y);
    for (const x of [196, 276, 476, 556]) win(x, 568);
    k.lineWidth = 12;
    k.beginPath();
    k.moveTo(372, 650);
    k.lineTo(372, 600);
    k.arc(400, 600, 28, Math.PI, 0);
    k.lineTo(428, 650);
    k.stroke();
    ell(400, 604, 11, 11, 6);
    line([[330, 668], [470, 668]], 12);
    line([[140, 668], [660, 668]], 8);
  } else if (kind === "key") {
    // a vintage hotel room key: an open bow with an inner ring, a collar, the shaft and the bit
    ell(210, 400, 112, 112, 22);
    ell(210, 400, 58, 58, 12);
    line([[322, 400], [650, 400]], 24);
    line([[350, 372], [350, 428]], 12);
    line([[378, 372], [378, 428]], 12);
    k.beginPath();
    k.moveTo(560, 400);
    k.lineTo(560, 500);
    k.lineTo(590, 500);
    k.lineTo(590, 462);
    k.lineTo(615, 462);
    k.lineTo(615, 510);
    k.lineTo(650, 510);
    k.lineTo(650, 400);
    k.closePath();
    k.fill();
  } else if (kind === "tea") {
    // a three tier afternoon tea stand: the ring handle, the rod, three plates of little cakes, the foot
    ell(400, 112, 34, 34, 16);
    line([[400, 146], [400, 650]], 20);
    const tiers: [number, number][] = [[272, 130], [422, 175], [582, 220]];
    tiers.forEach(([y, rx], ti) => {
      ell(400, y, rx, rx * 0.17, 20);
      // little cakes and scones on each plate, either side of the rod
      const n = 2 + ti;
      for (let i = 0; i < n; i++) {
        const x = 400 - rx * 0.6 + (i * rx * 1.2) / (n - 1);
        if (Math.abs(x - 400) < 30) continue;
        k.beginPath();
        k.arc(x, y - 12, 30 + ti * 3, Math.PI, 0);
        k.fill();
      }
    });
    ell(400, 662, 80, 16, 10, true);
  }
  return trim(c);
};

type Variant = { motif: "cb" | "manor" | "key" | "tea"; glass: string; height: number };
// The carousel (Scott: "do a few others for like a carousel"): black, pale, green and red glass, each one gold design.
// The palette's green and red are secondaries, so each only as one bauble's glass, never together on one.
export const BAUBLES: Record<string, Variant> = {
  cb: { motif: "cb", glass: "#010101", height: 0.3 },
  manor: { motif: "manor", glass: "#e6e1d8", height: 0.27 },
  key: { motif: "key", glass: "#2f3a29", height: 0.2 },
  tea: { motif: "tea", glass: "#4e2233", height: 0.31 },
};

// Paint one layer of the sphere's skin. `ink` draws the gold work; the colour map gets it in gold over black glass,
// the roughness/metal map gets it as polished metal (G = roughness, B = metalness) over smooth glass.
const paintSkin = (cb: HTMLCanvasElement, glassColor = "#010101", height = 0.3) => {
  const make = () => {
    const c = document.createElement("canvas");
    c.width = TW;
    c.height = TH;
    return c;
  };
  const ink = make();
  const k = ink.getContext("2d")!;
  k.fillStyle = "#fff";
  // two fine bands above and below the equator, and a row of small beads between them round the back
  const band = (v: number, h: number) => k.fillRect(0, v * TH - h / 2, TW, h);
  band(0.3, 7);
  band(0.318, 2.5);
  band(0.7, 7);
  band(0.682, 2.5);
  for (let i = 0; i < 64; i++) {
    const u = (i + 0.5) / 64;
    const du = Math.abs(((u - FRONT_U + 1.5) % 1) - 0.5); // distance round from the front
    if (du < 0.13) continue; // keep the front clear for the CB
    k.beginPath();
    k.arc(u * TW, TH * 0.5, 5, 0, Math.PI * 2);
    k.fill();
  }
  // the CB at the front, pre-squeezed row by row so it reads true on the sphere (rows away from the equator stretch
  // by 1 / cos(latitude) once wrapped)
  let cbH = TH * height; // 0.3 is ~54 degrees of latitude tall
  let cbW = (cbH * cb.width) / cb.height;
  if (cbW > TW * 0.2) { // a wide design (the key): keep it within the front of the bauble
    cbH *= (TW * 0.2) / cbW;
    cbW = TW * 0.2;
  }
  const top = TH * 0.5 - cbH / 2;
  for (let r = 0; r < Math.ceil(cbH); r++) {
    const v = (top + r) / TH;
    const lat = (0.5 - v) * Math.PI;
    const sq = Math.cos(lat);
    const sy = (r / cbH) * cb.height;
    const w = cbW / sq;
    k.drawImage(cb, 0, sy, cb.width, cb.height / cbH + 0.5, FRONT_U * TW - w / 2, top + r, w, 1.2);
  }
  const color = make();
  const c = color.getContext("2d")!;
  c.fillStyle = glassColor;
  c.fillRect(0, 0, TW, TH);
  c.globalCompositeOperation = "source-over";
  const gold = make();
  const g = gold.getContext("2d")!;
  g.drawImage(ink, 0, 0);
  g.globalCompositeOperation = "source-in";
  g.fillStyle = PAL.gold;
  g.fillRect(0, 0, TW, TH);
  c.drawImage(gold, 0, 0);
  const rm = make();
  const m = rm.getContext("2d")!;
  m.fillStyle = "rgb(0,14,0)"; // glass: smooth, not metal
  m.fillRect(0, 0, TW, TH);
  const metal = make();
  const mt = metal.getContext("2d")!;
  mt.drawImage(ink, 0, 0);
  mt.globalCompositeOperation = "source-in";
  mt.fillStyle = "rgb(0,80,255)"; // gold leaf: a little rough, fully metal
  mt.fillRect(0, 0, TW, TH);
  m.drawImage(metal, 0, 0);
  const tex = (cv: HTMLCanvasElement, srgb: boolean) => {
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    t.anisotropy = 8;
    t.needsUpdate = true;
    return t;
  };
  return { map: tex(color, true), rough: tex(rm, false) };
};

const Environment: React.FC = () => {
  const { gl, scene } = useThree();
  const env = useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    return pmrem.fromScene(new RoomEnvironment(), 0.03).texture;
  }, [gl]);
  scene.environment = env;
  scene.environmentIntensity = 0.42;
  return null;
};

const goldMat = () =>
  new THREE.MeshPhysicalMaterial({ color: new THREE.Color(PAL.gold), metalness: 1, roughness: 0.22, clearcoat: 0.6 });

export type Turn = { from: number; to: number; span: number };
const DEFAULT_TURN: Turn = { from: -0.95, to: 0.35, span: BAUBLE_FRAMES };
const Bauble: React.FC<{ skin: { map: THREE.Texture; rough: THREE.Texture }; spin: Turn }> = ({ skin, spin }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  // turning slowly on its cord: from three-quarters round to face on and a little past, with a gentle sway
  const turn = interpolate(frame, [0, spin.span], [spin.from, spin.to], { extrapolateRight: "clamp" });
  const sway = 0.035 * Math.sin(t * 1.1);
  const glass = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        map: skin.map,
        roughnessMap: skin.rough,
        metalnessMap: skin.rough,
        roughness: 1,
        metalness: 1,
        clearcoat: 1,
        clearcoatRoughness: 0.02,
        ior: 1.5,
        reflectivity: 0.6,
      }),
    [skin],
  );
  const gold = useMemo(goldMat, []);
  // the cap's flutes
  const cap = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    pts.push(new THREE.Vector2(0.0, 0.0));
    pts.push(new THREE.Vector2(0.3, 0.0));
    pts.push(new THREE.Vector2(0.31, 0.03));
    pts.push(new THREE.Vector2(0.29, 0.06));
    pts.push(new THREE.Vector2(0.27, 0.27));
    pts.push(new THREE.Vector2(0.29, 0.3));
    pts.push(new THREE.Vector2(0.2, 0.34));
    pts.push(new THREE.Vector2(0.0, 0.35));
    const geo = new THREE.LatheGeometry(pts, 96);
    // flutes: push the wall in and out round the cap
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      if (y > 0.06 && y < 0.27) {
        const a = Math.atan2(z, x);
        const f = 1 + 0.06 * Math.cos(a * 16);
        pos.setX(i, x * f);
        pos.setZ(i, z * f);
      }
    }
    geo.computeVertexNormals();
    return geo;
  }, []);
  return (
    <group position={[0, 1.35, 0]} rotation={[0, 0, sway]}>
      {/* the cord, from above the frame down to the loop */}
      <mesh position={[0, 2.2, 0]} material={gold}>
        <cylinderGeometry args={[0.012, 0.012, 4.2, 12]} />
      </mesh>
      <group position={[0, -1.35, 0]} rotation={[0, turn, 0]}>
        <mesh material={glass} castShadow>
          <sphereGeometry args={[1, 160, 120]} />
        </mesh>
        <mesh geometry={cap} material={gold} position={[0, 0.93, 0]} />
        <mesh material={gold} position={[0, 1.37, 0]}>
          <torusGeometry args={[0.085, 0.018, 16, 48]} />
        </mesh>
      </group>
    </group>
  );
};

// gold bokeh, out of focus behind the bauble, drifting a little
const BOKEH = Array.from({ length: 9 }, (_, i) => {
  const r = (n: number) => {
    const s = Math.sin(i * 127.1 + n * 311.7) * 43758.5453;
    return s - Math.floor(s);
  };
  return {
    x: r(1) * BAUBLE_W,
    y: r(2) * BAUBLE_H,
    d: 60 + r(3) * 190,
    o: 0.3 + r(4) * 0.5,
    pale: r(5) > 0.7,
    red: r(7) > 0.86,
    drift: (r(6) - 0.5) * 30,
  };
});

// The tree round it, all out of focus (Scott: "add the christmas tree artifacts like how you have gold flecks in the
// back out of focus, do more festive colours"): pine branches reaching in from the edges, a few red, gold and pale
// baubles hanging further back, and warm fairy lights among the gold bokeh. Drawn as SVG and blurred by depth.
// a few far baubles only (Scott: "fewer out of focus bokeh")
const FAR_BAUBLES = [
  { x: 150, y: 380, r: 62, c: "#8e1f2b", blur: 12 },
  { x: 930, y: 640, r: 78, c: "#8e1f2b", blur: 14 },
  { x: 190, y: 1010, r: 54, c: PAL.gold, blur: 12 },
];

const TreeBackdrop: React.FC<{ frame: number }> = ({ frame }) => {
  const d = (frame / BAUBLE_FRAMES) * 2 - 1; // -1 .. 1 over the shot
  return (
    <>
      {FAR_BAUBLES.map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: b.x - b.r + d * 6,
            top: b.y - b.r,
            width: b.r * 2,
            height: b.r * 2,
            borderRadius: "50%",
            background: `radial-gradient(circle at 38% 34%, rgba(255,240,215,0.75) 0%, ${b.c} 22%, ${b.c} 60%, rgba(0,0,0,0.9) 100%)`,
            filter: `blur(${b.blur + 4}px)`,
            opacity: 0.5,
          }}
        />
      ))}
    </>
  );
};

// The dark background, shared with the felt ornaments (Scott: "a black background like the Christmas glass ones, match
// that"): the quiet tree behind (DarkBack) and the soft near branch in front of the ornament (DarkFront).
export const DarkBack: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    <TreeBackdrop frame={frame} />
    {BOKEH.map((b, i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          left: b.x - b.d / 2 + (b.drift * frame) / BAUBLE_FRAMES,
          top: b.y - b.d / 2,
          width: b.d,
          height: b.d,
          borderRadius: "50%",
          // a lit disc with a brighter rim, like an out of focus fairy light
          background: b.red
            ? "radial-gradient(circle, #b3303ccc 0%, #b3303caa 58%, #d4505c 66%, transparent 71%)"
            : `radial-gradient(circle, ${b.pale ? "#ffe9c2" : PAL.gold}cc 0%, ${b.pale ? "#ffe9c2" : PAL.gold}aa 58%, ${b.pale ? "#fff4dc" : "#e2cc9c"} 66%, transparent 71%)`,
          opacity: 0.6 * b.o * (b.red ? 0.7 : b.pale ? 0.6 : 0.8),
          filter: `blur(${2 + b.d / 55}px)`,
        }}
      />
    ))}
    {/* the light falling away to black round the edges, so the bauble sits in a warm pool */}
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 65% at 50% 55%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 70%, rgba(0,0,0,0.8) 100%)" }} />
  </>
);
// (the soft near branch is gone: Scott, "get rid of the Christmas tree brush strokes"; kept as a no-op so callers stay)
export const DarkFront: React.FC<{ frame: number }> = () => null;

export const GlassBauble: React.FC<{ variant?: string; spin?: Turn }> = ({ variant = "cb", spin = DEFAULT_TURN }) => {
  const v = BAUBLES[variant];
  const frame = useCurrentFrame();
  const [skin, setSkin] = useState<{ map: THREE.Texture; rough: THREE.Texture } | null>(null);
  const [handle] = useState(() => delayRender("bauble skin"));
  useEffect(() => {
    (v.motif === "cb" ? cbMask() : Promise.resolve(drawMotif(v.motif)))
      .then((m) => {
        setSkin(paintSkin(m, v.glass, v.height));
        continueRender(handle);
      })
      .catch((e) => {
        throw e;
      });
  }, [handle, v]);
  const push = interpolate(frame, [0, spin.span], [7.4, 6.6], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: PAL.black }}>
      <DarkBack frame={frame} />
      {skin ? (
        <ThreeCanvas
          width={BAUBLE_W}
          height={BAUBLE_H}
          camera={{ fov: 30, position: [0, 0.1, push], near: 0.1, far: 50 }}
          gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
        >
          <Environment />
          <ambientLight intensity={0.15} />
          <pointLight position={[2.5, 3, 4]} intensity={34} color="#ffe2b8" />
          <pointLight position={[0, 0.5, -3]} intensity={10} color="#e8cf9c" />
          <pointLight position={[-3, -1, 2]} intensity={8} color={PAL.gold} />
          <Bauble skin={skin} spin={spin} />
        </ThreeCanvas>
      ) : null}
      <DarkFront frame={frame} />
    </AbsoluteFill>
  );
};
