import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import React, { useEffect, useMemo, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { DarkBack, DarkFront } from "./GlassBauble";

// CBH felt ornaments (Scott, 25 Nov: "now do the felt ones", "needs to be lighter background with the one secondary
// colour lift"), the felt companions to the glass baubles (GlassBauble.tsx): puffy stitched shapes in wool felt (a
// matte cloth with a soft sheen and a fibre texture, all drawn in code), gold thread embroidery and running stitch,
// each hanging on a gold cord. On the light background: the 2026 palette's neutrals (pale #f2f0f0, light beige
// #ebe8e4) leading with the black and gold, and one secondary as the lift, the sage green #869674, in the out of focus
// branches and the stocking. An AI assisted 3D render: built and lit in three.js, the CB is the logo's own outline.

export const FELT_W = 1080;
export const FELT_H = 1350;
export const FELT_FRAMES = 240;

const PAL = {
  black: "#000000",
  gold: "#c7ab77",
  pale: "#f2f0f0",
  beige: "#ebe8e4",
  green: "#869674",
};

type Kind = "star" | "manor" | "stocking" | "teapot";
export const FELTS: Record<string, { kind: Kind; felt: string; trim?: string; thread?: string }> = {
  star: { kind: "star", felt: "#efe9df" }, // cream felt, the CB embroidered in gold
  manor: { kind: "manor", felt: "#cbbfab" }, // beige felt, gold windows (black felt vanished on the black background)
  stocking: { kind: "stocking", felt: "#7f8f6e", trim: "#f1ece3" }, // the sage green, a cream cuff
  teapot: { kind: "teapot", felt: "#c2a56f", thread: "#f2f0f0" }, // gold felt, cream thread (beige on the beige was lost)
};

const S = 1024; // texture size, covering -1.25..1.25 in shape units
const SPAN = 2.5;
const px = (x: number) => ((x + SPAN / 2) / SPAN) * S;
const py = (y: number) => ((SPAN / 2 - y) / SPAN) * S;

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((res, rej) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = rej;
    im.src = src;
  });

const cbMask = async () => {
  const im = await loadImage(staticFile("brand/cbh-logo-cb-only.svg"));
  const c = document.createElement("canvas");
  c.width = 534 * 2;
  c.height = 656 * 2;
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

// --- the shapes, in units, roughly 2 tall, centred ---
const starShape = () => {
  const s = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const a = Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 ? 0.5 : 1.08;
    const x = Math.cos(a) * r, y = Math.sin(a) * r - 0.05;
    if (i) s.lineTo(x, y);
    else s.moveTo(x, y);
  }
  s.closePath();
  return [s];
};
const manorShape = () => {
  const s = new THREE.Shape();
  s.moveTo(-0.95, -0.8);
  s.lineTo(0.95, -0.8);
  s.lineTo(0.95, 0.32);
  s.lineTo(0.72, 0.32);
  s.lineTo(0.72, 0.62); // right chimney
  s.lineTo(0.56, 0.62);
  s.lineTo(0.56, 0.42);
  s.lineTo(0.0, 0.92); // the roof's peak
  s.lineTo(-0.56, 0.42);
  s.lineTo(-0.56, 0.62); // left chimney
  s.lineTo(-0.72, 0.62);
  s.lineTo(-0.72, 0.32);
  s.lineTo(-0.95, 0.32);
  s.closePath();
  return [s];
};
const stockingShape = () => {
  const s = new THREE.Shape();
  s.moveTo(-0.55, 1.0);
  s.lineTo(0.3, 1.0);
  s.lineTo(0.3, -0.15);
  s.quadraticCurveTo(0.95, -0.35, 0.82, -0.78);
  s.quadraticCurveTo(0.7, -1.08, 0.2, -0.98);
  s.lineTo(-0.25, -0.88);
  s.quadraticCurveTo(-0.62, -0.78, -0.58, -0.4);
  s.closePath();
  const cuff = new THREE.Shape();
  cuff.moveTo(-0.64, 1.06);
  cuff.lineTo(0.39, 1.06);
  cuff.lineTo(0.39, 0.66);
  cuff.lineTo(-0.64, 0.66);
  cuff.closePath();
  return [s, cuff];
};
const teapotShape = () => {
  const body = new THREE.Shape();
  body.absellipse(0, -0.25, 0.78, 0.62, 0, Math.PI * 2, false, 0);
  const lid = new THREE.Shape();
  lid.moveTo(-0.42, 0.3);
  lid.quadraticCurveTo(0, 0.62, 0.42, 0.3);
  lid.closePath();
  const knob = new THREE.Shape();
  knob.absellipse(0, 0.6, 0.1, 0.1, 0, Math.PI * 2, false, 0);
  const spout = new THREE.Shape();
  spout.moveTo(0.62, -0.1);
  spout.quadraticCurveTo(1.0, -0.05, 1.12, 0.32);
  spout.lineTo(0.98, 0.34);
  spout.quadraticCurveTo(0.86, 0.06, 0.6, -0.42);
  spout.closePath();
  const handle = new THREE.Shape();
  handle.absellipse(-0.82, -0.2, 0.34, 0.4, 0, Math.PI * 2, false, 0);
  const hole = new THREE.Path();
  hole.absellipse(-0.82, -0.2, 0.18, 0.24, 0, Math.PI * 2, true, 0);
  handle.holes.push(hole);
  return [handle, spout, body, lid, knob];
};
const SHAPES: Record<Kind, () => THREE.Shape[]> = { star: starShape, manor: manorShape, stocking: stockingShape, teapot: teapotShape };

// --- the felt's skin: colour, fibre bump, and the gold thread ---
const rnd = (i: number) => {
  const s = Math.sin(i * 12.9898) * 43758.5453;
  return s - Math.floor(s);
};

const paintFelt = (kind: Kind, felt: string, shapes: THREE.Shape[], cb: HTMLCanvasElement, trim?: string, threadColor: string = PAL.gold) => {
  const mk = () => {
    const c = document.createElement("canvas");
    c.width = S;
    c.height = S;
    return c;
  };
  const color = mk();
  const c = color.getContext("2d")!;
  const bump = mk();
  const b = bump.getContext("2d")!;
  const thread = mk(); // where the gold thread is: shiny-ish, raised
  const t = thread.getContext("2d")!;
  c.fillStyle = felt;
  c.fillRect(0, 0, S, S);
  b.fillStyle = "#808080";
  b.fillRect(0, 0, S, S);
  // wool fibres: thousands of short curled hairs, lighter and darker than the felt, and the same in the bump
  for (let i = 0; i < 26000; i++) {
    const x = rnd(i) * S, y = rnd(i + 0.5) * S;
    const a = rnd(i + 0.3) * Math.PI * 2, l = 3 + rnd(i + 0.7) * 9;
    const light = rnd(i + 0.9) > 0.5;
    c.strokeStyle = light ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
    b.strokeStyle = light ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)";
    for (const g of [c, b]) {
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(x, y);
      g.quadraticCurveTo(x + Math.cos(a + 0.8) * l * 0.6, y + Math.sin(a + 0.8) * l * 0.6, x + Math.cos(a) * l, y + Math.sin(a) * l);
      g.stroke();
    }
  }
  // the stocking's cuff is its own cream felt piece
  if (kind === "stocking" && trim) {
    c.fillStyle = trim;
    c.fillRect(px(-0.7), py(1.1), px(0.45) - px(-0.7), py(0.62) - py(1.1));
    for (let i = 0; i < 4000; i++) {
      const x = px(-0.7) + rnd(i + 3) * (px(0.45) - px(-0.7));
      const y = py(1.1) + rnd(i + 4) * (py(0.62) - py(1.1));
      c.fillStyle = rnd(i + 5) > 0.5 ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.05)";
      c.fillRect(x, y, 2, 2);
    }
  }
  // gold thread: a running stitch round each piece just inside its edge, and the embroidery
  t.strokeStyle = "#fff";
  t.fillStyle = "#fff";
  t.lineCap = "round";
  const running = (pts: THREE.Vector2[], inset: number, dash = 14, gap = 9, w = 5) => {
    const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
    const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
    t.lineWidth = w;
    t.setLineDash([dash, gap]);
    t.beginPath();
    pts.forEach((p, i) => {
      const x = cx + (p.x - cx) * inset, y = cy + (p.y - cy) * inset;
      if (i) t.lineTo(px(x), py(y));
      else t.moveTo(px(x), py(y));
    });
    t.closePath();
    t.stroke();
    t.setLineDash([]);
  };
  if (kind === "star") {
    running(shapes[0].getPoints(), 0.86);
    // the CB, embroidered: the logo's outline filled with satin stitches
    const h = 0.95, w = (h * cb.width) / cb.height;
    const x0 = px(-w / 2), y0 = py(h / 2 - 0.04), W = px(w / 2) - x0, H = py(-h / 2 - 0.04) - y0;
    t.drawImage(cb, x0, y0, W, H);
  } else if (kind === "manor") {
    running(shapes[0].getPoints(), 0.88);
    // stitched windows with glazing bars, an arched door, a little wreath
    t.lineWidth = 5;
    const win = (x: number, y: number) => {
      const X = px(x), Y = py(y), w = px(0.2) - px(0), h = py(-0.24) - py(0);
      t.strokeRect(X, Y, w, h);
      t.beginPath();
      t.moveTo(X + w / 2, Y);
      t.lineTo(X + w / 2, Y + h);
      t.moveTo(X, Y + h / 2);
      t.lineTo(X + w, Y + h / 2);
      t.stroke();
    };
    for (const y of [0.18, -0.18]) for (const x of [-0.7, -0.4, 0.2, 0.5]) win(x, y);
    win(-0.1, 0.18);
    t.beginPath();
    t.moveTo(px(-0.13), py(-0.72));
    t.lineTo(px(-0.13), py(-0.45));
    t.arc(px(0), py(-0.45), px(0.13) - px(0), Math.PI, 0);
    t.lineTo(px(0.13), py(-0.72));
    t.stroke();
    t.beginPath();
    t.arc(px(0), py(-0.5), 9, 0, Math.PI * 2);
    t.fill();
  } else if (kind === "stocking") {
    running(shapes[0].getPoints(), 0.87);
    // the cuff sits over the leg's stitching: clear it there, then stitch the cuff's own edge
    t.clearRect(px(-0.7), py(1.1), px(0.45) - px(-0.7), py(0.62) - py(1.1));
    running(shapes[1].getPoints(), 0.82, 10, 8, 4);
    // a stitched star on the leg
    t.lineWidth = 5;
    t.beginPath();
    for (let i = 0; i < 11; i++) {
      const a = Math.PI / 2 + (i * Math.PI) / 5;
      const r = i % 2 ? 0.07 : 0.16;
      const x = px(-0.12 + Math.cos(a) * r), y = py(0.12 + Math.sin(a) * r);
      if (i) t.lineTo(x, y);
      else t.moveTo(x, y);
    }
    t.stroke();
  } else if (kind === "teapot") {
    running(shapes[2].getPoints(), 0.9);
    // a gold band round the pot and a little stitched heart
    t.lineWidth = 6;
    t.setLineDash([12, 8]);
    t.beginPath();
    t.moveTo(px(-0.76), py(-0.12));
    t.quadraticCurveTo(px(0), py(-0.02), px(0.76), py(-0.12));
    t.stroke();
    t.setLineDash([]);
    t.beginPath();
    const hx = px(0), hy = py(-0.4), r = 18;
    t.moveTo(hx, hy + r * 1.2);
    t.bezierCurveTo(hx - r * 2, hy, hx - r, hy - r * 1.4, hx, hy - r * 0.4);
    t.bezierCurveTo(hx + r, hy - r * 1.4, hx + r * 2, hy, hx, hy + r * 1.2);
    t.fill();
  }
  // lay the thread into the colour (gold, with fine twist lines) and the bump (raised)
  const gold = mk();
  const g = gold.getContext("2d")!;
  g.drawImage(thread, 0, 0);
  g.globalCompositeOperation = "source-in";
  g.fillStyle = threadColor;
  g.fillRect(0, 0, S, S);
  g.globalCompositeOperation = "source-atop";
  g.strokeStyle = "rgba(90,70,30,0.35)";
  g.lineWidth = 1.5;
  for (let i = -S; i < S * 2; i += 6) {
    g.beginPath();
    g.moveTo(i, 0);
    g.lineTo(i + S, S);
    g.stroke();
  }
  c.drawImage(gold, 0, 0);
  const raised = mk();
  const r2 = raised.getContext("2d")!;
  r2.drawImage(thread, 0, 0);
  r2.globalCompositeOperation = "source-in";
  r2.fillStyle = "#fff";
  r2.fillRect(0, 0, S, S);
  b.globalAlpha = 0.8;
  b.drawImage(raised, 0, 0);
  // roughness (G) and metalness (B): felt fully rough, the thread a little shiny
  const rm = mk();
  const m = rm.getContext("2d")!;
  m.fillStyle = "rgb(0,250,0)";
  m.fillRect(0, 0, S, S);
  const shine = mk();
  const sh = shine.getContext("2d")!;
  sh.drawImage(thread, 0, 0);
  sh.globalCompositeOperation = "source-in";
  sh.fillStyle = "rgb(0,110,150)";
  sh.fillRect(0, 0, S, S);
  m.drawImage(shine, 0, 0);
  const tex = (cv: HTMLCanvasElement, srgb: boolean) => {
    const tx = new THREE.CanvasTexture(cv);
    tx.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    tx.repeat.set(1 / SPAN, 1 / SPAN);
    tx.offset.set(0.5, 0.5);
    tx.anisotropy = 8;
    tx.needsUpdate = true;
    return tx;
  };
  return { map: tex(color, true), bump: tex(bump, false), rm: tex(rm, false) };
};

const Environment: React.FC = () => {
  const { gl, scene } = useThree();
  const env = useMemo(() => new THREE.PMREMGenerator(gl).fromScene(new RoomEnvironment(), 0.03).texture, [gl]);
  scene.environment = env;
  scene.environmentIntensity = 0.35;
  return null;
};

type Skin = ReturnType<typeof paintFelt>;

const Ornament: React.FC<{ kind: Kind; felt: string; skin: Skin; shapes: THREE.Shape[] }> = ({ kind, felt, skin, shapes }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const turn = interpolate(frame, [0, FELT_FRAMES], [-0.55, 0.3]);
  const sway = 0.03 * Math.sin(t * 1.1);
  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        map: skin.map,
        bumpMap: skin.bump,
        bumpScale: 1.6,
        roughnessMap: skin.rm,
        metalnessMap: skin.rm,
        roughness: 1,
        metalness: 1,
        sheen: 1,
        sheenRoughness: 0.55,
        sheenColor: new THREE.Color("#ffffff").multiplyScalar(0.45),
      }),
    [skin],
  );
  const gold = useMemo(() => new THREE.MeshPhysicalMaterial({ color: new THREE.Color(PAL.gold), metalness: 1, roughness: 0.3 }), []);
  // the cut edges: plain felt in the piece's own colour (the stocking's cuff is the cream); their texture coordinates
  // fell outside the painted board and showed as white bands
  const edge = useMemo(
    () => (c: string) => new THREE.MeshPhysicalMaterial({ color: new THREE.Color(c), roughness: 1, sheen: 1, sheenRoughness: 0.55, sheenColor: new THREE.Color("#ffffff").multiplyScalar(0.4) }),
    [],
  );
  const geos = useMemo(
    () =>
      shapes.map((s, i) => {
        // a pillowy felt piece: a little depth, a deep rounded bevel; pieces layered front to back
        const geo = new THREE.ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.09, bevelSize: 0.06, bevelSegments: 8, curveSegments: 48 });
        geo.translate(0, 0, (i - (shapes.length - 1)) * 0.02);
        return geo;
      }),
    [shapes],
  );
  const top = kind === "star" ? 1.03 : kind === "manor" ? 0.92 : kind === "stocking" ? 1.06 : 0.7;
  return (
    <group position={[0, 1.45, 0]} rotation={[0, 0, sway]}>
      {/* the cord, from above the frame down to the top of the loop (world y 1.21, -0.24 in this group) */}
      <mesh position={[0, 2.13, 0]} material={gold}>
        <cylinderGeometry args={[0.011, 0.011, 4.74, 10]} />
      </mesh>
      <group position={[0, -1.45 - (top - 1.0), 0]} rotation={[0, turn, 0]}>
        {geos.map((g, i) => (
          <mesh key={i} geometry={g} material={[mat, edge(kind === "stocking" && i === 1 ? FELTS.stocking.trim! : felt)]} />
        ))}
        <mesh material={gold} position={[0, top + 0.12, 0.03]}>
          <torusGeometry args={[0.09, 0.016, 12, 40]} />
        </mesh>
      </group>
    </group>
  );
};

// --- the light background (Scott: "subtle, clean, a few out of focus festive elements in the secondary colour", per
// the 2026 guidelines): the neutrals lead, pale to light beige; four baubles hanging far back in the sage green (the
// one secondary, used as a lift), thrown out of focus; a little soft gold bokeh. No branches.
const FAR = [
  { x: 150, y: 330, r: 95, blur: 22, o: 0.55, cord: true },
  { x: 940, y: 520, r: 120, blur: 28, o: 0.5, cord: true },
  { x: 205, y: 1130, r: 70, blur: 18, o: 0.45, cord: false },
  { x: 880, y: 1210, r: 55, blur: 16, o: 0.4, cord: false },
];
const BOKEH = Array.from({ length: 10 }, (_, i) => ({
  x: rnd(i + 100) * FELT_W,
  y: rnd(i + 200) * FELT_H,
  d: 50 + rnd(i + 300) * 110,
  o: 0.12 + rnd(i + 400) * 0.2,
}));

const LightBackdrop: React.FC<{ frame: number }> = ({ frame }) => {
  const d = (frame / FELT_FRAMES) * 2 - 1;
  return (
    <>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 70% at 50% 46%, ${PAL.pale} 0%, ${PAL.beige} 60%, #e0dad1 100%)` }} />
      {FAR.map((b, i) => (
        <React.Fragment key={i}>
          {b.cord ? (
            <div style={{ position: "absolute", left: b.x + d * 6 - 2, top: 0, width: 4, height: b.y - b.r, background: "rgba(199,171,119,0.35)", filter: `blur(${b.blur / 2}px)` }} />
          ) : null}
          <div
            style={{
              position: "absolute",
              left: b.x - b.r + d * 6,
              top: b.y - b.r,
              width: b.r * 2,
              height: b.r * 2,
              borderRadius: "50%",
              background: `radial-gradient(circle at 36% 32%, rgba(255,255,255,0.7) 0%, ${PAL.green} 26%, #6f7d60 70%, #5d6950 100%)`,
              opacity: b.o,
              filter: `blur(${b.blur}px)`,
            }}
          />
        </React.Fragment>
      ))}
      {BOKEH.map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: b.x - b.d / 2 + d * 10,
            top: b.y - b.d / 2,
            width: b.d,
            height: b.d,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${PAL.gold}99 0%, ${PAL.gold}77 58%, #dcc79c 66%, transparent 71%)`,
            opacity: b.o,
            filter: `blur(${4 + b.d / 40}px)`,
          }}
        />
      ))}
    </>
  );
};

export const FeltOrnament: React.FC<{ variant?: string; light?: boolean }> = ({ variant = "star", light = false }) => {
  const v = FELTS[variant];
  const frame = useCurrentFrame();
  const shapes = useMemo(() => SHAPES[v.kind](), [v.kind]);
  const [skin, setSkin] = useState<Skin | null>(null);
  const [handle] = useState(() => delayRender("felt skin"));
  useEffect(() => {
    cbMask().then((cb) => {
      setSkin(paintFelt(v.kind, v.felt, shapes, cb, v.trim, v.thread));
      continueRender(handle);
    });
  }, [handle, v, shapes]);
  const push = interpolate(frame, [0, FELT_FRAMES], [7.3, 6.7]);
  return (
    // the dark background by default, matching the glass baubles (Scott); the light one kept behind `light`
    <AbsoluteFill style={{ background: light ? PAL.beige : PAL.black }}>
      {light ? <LightBackdrop frame={frame} /> : <DarkBack frame={frame} />}
      {skin ? (
        <ThreeCanvas
          width={FELT_W}
          height={FELT_H}
          shadows
          camera={{ fov: 30, position: [0, 0.1, push], near: 0.1, far: 50 }}
          gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: light ? 1.0 : 0.92 }}
        >
          <Environment />
          {/* lit like the glass baubles on the dark background: a warm key from the upper right, a soft fill, a little rim */}
          <ambientLight intensity={light ? 0.35 : 0.12} />
          <directionalLight position={[2.5, 3, 4]} intensity={light ? 2.2 : 1.5} color="#ffe6c4" />
          <pointLight position={[-3, 1, 2]} intensity={light ? 6 : 3} color="#f4e6cf" />
          <pointLight position={[0, 1, -3]} intensity={light ? 0 : 6} color="#e8cf9c" />
          <Ornament kind={v.kind} felt={v.felt} skin={skin} shapes={shapes} />
        </ThreeCanvas>
      ) : null}
      {light ? null : <DarkFront frame={frame} />}
    </AbsoluteFill>
  );
};
