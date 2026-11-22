import { loadFont } from "@remotion/fonts";
import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { FilmFinish } from "../components/FilmFinish";
import { colors, progress, sans, serif } from "../theme";

// "Clocking off", a stick-figure flipbook (Scott, 30 Oct: "a new reel with a stick figure animation ...
// with fun", "similar to the hand drawn CB", "more about the motion like a stick figure drawing then
// flip"). Pencil on a cream pad, drawn on twos (a new page every two frames, 15 a second), every page
// slightly off register and its pencil lines a little different (the boil of hand-drawn pages), the
// corner flicking as the pad is thumbed. A stick figure slumps at a desk under a rain cloud; the
// clock hits five, a lightbulb, he grabs a suitcase and runs; a doodled country house grows as he
// reaches it, the door swings open and the real hotel opens out of the doorway. A mock-up of the
// opening (Scott: show the look before the full build).

// the scribbles in Caveat (OFL, public/fonts/OFL-Caveat.txt), a pencil hand
const HAND = "Caveat";
loadFont({ family: HAND, url: staticFile("fonts/Caveat-SemiBold.woff2"), weight: "600" });

const W = 1080;
const H = 1920;
export const STICK_FRAMES = 300;
// two looks (Scott: "black and gold so it looks premium ... or does that lose magic"): pencil on a
// cream pad, or gold ink on black card; the line boils and the corner flicks the same in both
type Look = { ink: string; paper: string; under: string; curl: string; bg: string; grain: string; glow: string; light: string };
const LOOKS: Record<"pad" | "gold", Look> = {
  pad: { ink: "#3b3833", paper: "#f2ecdf", under: "#e4dccb", curl: "#d9d0bd", bg: "#1b1a18",
    grain: "0 0 0 0 0.45  0 0 0 0 0.4  0 0 0 0 0.33  0 0 0 0.09 0", glow: "none", light: "#e8c98a" },
  gold: { ink: "#C9A55E", paper: "#141312", under: "#0d0c0c", curl: "#22201d", bg: "#050505",
    grain: "0 0 0 0 0.8  0 0 0 0 0.7  0 0 0 0 0.55  0 0 0 0.05 0", glow: "drop-shadow(0 0 3px rgba(201,165,94,0.35))", light: "#f6e3b0" },
};
const LookCtx = React.createContext<Look>(LOOKS.pad);
// the knockout pass: the same lines, wider, in the paper's colour, drawn under the figure so the lines
// behind him break around him instead of tangling through him (the way an inker lifts the pen)
const HaloCtx = React.createContext(false);
// the Christmas cut (Scott: "add more Christmassy elements in the gags, elevate"): a Santa hat on him
// throughout, a garland under the time on every party page, and a festive touch in each gag
const XmasCtx = React.createContext(false);
// off for the pages before the party hats went on (Scott: "we didn't have the headgear on till dinner")
const HatCtx = React.createContext(true);

const page = (f: number) => Math.floor(f / 2); // drawn on twos
const smooth = (f: number, a: number, b: number) => {
  const t = Math.min(1, Math.max(0, (f - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const rnd = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
// the boil: every page each point sits a pixel or two somewhere else
const j = (p: number, id: number, amp = 2.2) => (rnd(p * 1.37 + id * 7.91) - 0.5) * 2 * amp;

type Pt = [number, number];
// a pencil line: a slightly wobbly path, drawn twice (a firm stroke and a faint second pass beside it)
const Pencil: React.FC<{ d: Pt[]; p: number; id: number; w?: number; closed?: boolean }> = ({ d, p, id, w = 7, closed }) => {
  const look = React.useContext(LookCtx);
  const INK = look.ink;
  const halo = React.useContext(HaloCtx);
  const pts = d.map(([x, y], k) => [x + j(p, id * 31 + k), y + j(p, id * 31 + k + 100)] as Pt);
  const path = (o: number) =>
    pts.map(([x, y], k) => `${k ? "L" : "M"}${(x + o * 0.6).toFixed(1)} ${(y + o).toFixed(1)}`).join(" ") + (closed ? " Z" : "");
  if (halo) return <path d={path(1.2)} fill="none" stroke={look.paper} strokeWidth={w + 12} strokeLinecap="round" strokeLinejoin="round" />;
  return (
    <>
      <path d={path(0)} fill="none" stroke={INK} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />
      <path d={path(2.4)} fill="none" stroke={INK} strokeWidth={w * 0.45} strokeLinecap="round" strokeLinejoin="round" opacity={0.35} />
    </>
  );
};
const Circle: React.FC<{ c: Pt; r: number; p: number; id: number; w?: number }> = ({ c, r, p, id, w = 7 }) => {
  const n = 22;
  const d: Pt[] = [];
  for (let k = 0; k <= n + 2; k++) {
    const a = (k / n) * Math.PI * 2 + 0.3;
    const rr = r * (1 + (rnd(p + id + k * 0.7) - 0.5) * 0.05);
    d.push([c[0] + Math.cos(a) * rr, c[1] + Math.sin(a) * rr]);
  }
  return <Pencil d={d} p={p} id={id} w={w} />;
};

// the figure: joint angles (radians, 0 = straight down) from the hip
type Pose = { x: number; y: number; lean: number; head: number; ua: [number, number]; fa: [number, number]; th: [number, number]; sh: [number, number] };
const L = { torso: 150, head: 40, upper: 78, fore: 72, thigh: 92, shin: 90 };
const at = (o: Pt, a: number, len: number): Pt => [o[0] + Math.sin(a) * len, o[1] + Math.cos(a) * len];
type Hat = "santa" | "antlers" | "elf";
const Figure: React.FC<{ q: Pose; p: number; hat?: Hat }> = ({ q, p, hat = "santa" }) => {
  const xmas = React.useContext(XmasCtx) && React.useContext(HatCtx);
  const hip: Pt = [q.x, q.y];
  const neck = at(hip, Math.PI + q.lean, L.torso);
  const headC = at(neck, Math.PI + q.lean + q.head, L.head + 6);
  const shoulder = at(hip, Math.PI + q.lean, L.torso * 0.86);
  const limbs = [0, 1].map((s) => {
    const elbow = at(shoulder, q.ua[s] + q.lean, L.upper);
    const hand = at(elbow, q.fa[s] + q.lean, L.fore);
    const knee = at(hip, q.th[s], L.thigh);
    const foot = at(knee, q.sh[s], L.shin);
    return { elbow, hand, knee, foot };
  });
  const lines = (
    <>
      <Circle c={headC} r={L.head} p={p} id={1} />
      <Pencil d={[hip, neck]} p={p} id={2} />
      {limbs.map((m, s) => (
        <React.Fragment key={s}>
          <Pencil d={[shoulder, m.elbow, m.hand]} p={p} id={3 + s} />
          <Pencil d={[hip, m.knee, m.foot]} p={p} id={5 + s} />
        </React.Fragment>
      ))}
      {xmas && hat === "santa" ? <SantaHat c={headC} a={-(q.lean + q.head)} p={p} /> : null}
      {xmas && hat !== "santa" ? <Headband c={headC} a={-(q.lean + q.head)} p={p} kind={hat} /> : null}
    </>
  );
  return <Knockout>{lines}</Knockout>;
};
// draws its lines over a halo of paper; the halo stops just above the ground so his feet stay on it
const Knockout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <clipPath id="above-ground"><rect x={-2000} y={-2000} width={6000} height={2000 + 1384} /></clipPath>
    <g clipPath="url(#above-ground)">
      <HaloCtx.Provider value>{children}</HaloCtx.Provider>
    </g>
    {children}
  </>
);
// a Santa hat on a head centred at `c`, tilted `a` with it: a furry brim, the cone flopping over to
// one side, a bobble on the tip
const turn = (pts: Pt[], c: Pt, a: number): Pt[] =>
  pts.map(([x, y]) => [c[0] + x * Math.cos(a) - y * Math.sin(a), c[1] + x * Math.sin(a) + y * Math.cos(a)]);
// the party's other headgear (Scott: "not so many Christmas hats, do some antlers, some upside down elf legs like the
// pics"): a headband with reindeer antlers, or with a pair of elf legs sticking up, curly shoes in the air
const Headband: React.FC<{ c: Pt; a: number; p: number; kind: "antlers" | "elf" }> = ({ c, a, p, kind }) => {
  const T = (pts: Pt[]) => turn(pts, c, a);
  const band = <Pencil d={T([[-38, -18], [-24, -36], [0, -43], [24, -36], [38, -18]])} p={p} id={610} w={5} />;
  if (kind === "antlers") {
    return (
      <>
        {band}
        {[-1, 1].map((sd) => (
          <React.Fragment key={sd}>
            <Pencil d={T([[sd * 18, -40], [sd * 30, -78], [sd * 36, -118]])} p={p} id={611 + sd} w={6} />
            <Pencil d={T([[sd * 26, -66], [sd * 54, -80]])} p={p} id={614 + sd} w={5} />
            <Pencil d={T([[sd * 32, -94], [sd * 12, -112]])} p={p} id={617 + sd} w={5} />
            <Pencil d={T([[sd * 34, -104], [sd * 58, -116]])} p={p} id={620 + sd} w={5} />
          </React.Fragment>
        ))}
      </>
    );
  }
  return (
    <>
      {band}
      {[-1, 1].map((sd) => (
        <React.Fragment key={sd}>
          <Pencil d={T([[sd * 10, -42], [sd * 22, -84], [sd * 26, -108]])} p={p} id={623 + sd} w={6} />
          <Pencil d={T([[sd * 26, -108], [sd * 50, -112], [sd * 60, -128], [sd * 50, -136]])} p={p} id={626 + sd} w={5} />
          <Pencil d={T([[sd * 8, -62], [sd * 24, -60]])} p={p} id={629 + sd} w={3} />
          <Pencil d={T([[sd * 13, -80], [sd * 29, -78]])} p={p} id={632 + sd} w={3} />
          <Pencil d={T([[sd * 17, -97], [sd * 33, -96]])} p={p} id={635 + sd} w={3} />
        </React.Fragment>
      ))}
    </>
  );
};
const SantaHat: React.FC<{ c: Pt; a: number; p: number; sc?: number }> = ({ c, a, p, sc = 1 }) => {
  const T = (pts: Pt[]) => turn(pts.map(([x, y]) => [x * sc, y * sc] as Pt), c, a);
  const bob = T([[54, -80]])[0];
  return (
    <>
      <Pencil d={T([[-46, -22], [46, -22], [44, -42], [-44, -42]])} p={p} id={600} w={6} closed />
      <Pencil d={T([[-38, -42], [-6, -96], [46, -84]])} p={p} id={601} w={6} />
      <Pencil d={T([[38, -42], [18, -70], [46, -84]])} p={p} id={602} w={6} />
      <Circle c={bob} r={12 * sc} p={p} id={603} w={5} />
    </>
  );
};
const hand = (q: Pose, s: number): Pt => {
  const shoulder = at([q.x, q.y], Math.PI + q.lean, L.torso * 0.86);
  return at(at(shoulder, q.ua[s] + q.lean, L.upper), q.fa[s] + q.lean, L.fore);
};

// poses, facing right (towards the desk, then the way he runs): a positive angle swings a limb
// forward, a negative lean tips him forward
const SLUMP: Pose = { x: 560, y: 1210, lean: 0.5, head: 0.35, ua: [-1.15, -0.95], fa: [-1.75, -1.6], th: [-1.45, -1.35], sh: [0.05, 0.1] };
const SIGH: Pose = { ...SLUMP, lean: 0.6, head: 0.45 };
const SIT_UP: Pose = { x: 560, y: 1210, lean: 0.08, head: -0.05, ua: [-0.35, -0.15], fa: [-0.7, -0.5], th: [-1.45, -1.35], sh: [0.05, 0.1] };
const CROUCH: Pose = { x: 585, y: 1252, lean: -0.3, head: 0.1, ua: [-0.95, -0.8], fa: [-0.55, -0.45], th: [0.75, 0.55], sh: [-0.55, -0.5] };
const JUMP_UP: Pose = { x: 600, y: 1110, lean: 0.05, head: 0.15, ua: [3.0, 3.35], fa: [3.05, 3.4], th: [0.15, -0.1], sh: [-0.05, -0.25] };
const LAND: Pose = { x: 610, y: 1240, lean: -0.2, head: 0.05, ua: [1.6, 1.3], fa: [1.9, 1.6], th: [0.6, 0.4], sh: [-0.45, -0.4] };
const STAND: Pose = { x: 615, y: 1208, lean: 0, head: 0, ua: [0.2, -0.15], fa: [0.12, -0.1], th: [0.12, -0.12], sh: [0, 0] };
// the run, continuous: legs swinging on a sine, the knee folding as a leg comes through (heel kicking
// up behind), arms swinging against the legs, a bob in the stride
const RUN_CYCLE = 15; // frames a stride pair: a footfall on every half beat
const runPose = (t: number, x: number): Pose => {
  const ph = (2 * Math.PI * t) / RUN_CYCLE;
  const leg = (s: number) => {
    const a = ph + s * Math.PI;
    const th = 0.85 * Math.sin(a);
    return { th, sh: th - (0.25 + 1.45 * Math.max(0, Math.cos(a))), ua: -0.95 * Math.sin(a) };
  };
  const l0 = leg(0);
  const l1 = leg(1);
  return { x, y: 1194 + 18 * Math.abs(Math.sin(ph)), lean: -0.3, head: 0.12,
    ua: [l0.ua, l1.ua], fa: [l0.ua + 1.35, l1.ua + 1.35], th: [l0.th, l1.th], sh: [l0.sh, l1.sh] };
};
const mix = (a: Pose, b: Pose, t: number): Pose => {
  const m = (u: number, v: number) => u + (v - u) * t;
  const m2 = (u: [number, number], v: [number, number]): [number, number] => [m(u[0], v[0]), m(u[1], v[1])];
  return { x: m(a.x, b.x), y: m(a.y, b.y), lean: m(a.lean, b.lean), head: m(a.head, b.head), ua: m2(a.ua, b.ua), fa: m2(a.fa, b.fa), th: m2(a.th, b.th), sh: m2(a.sh, b.sh) };
};
// keyed poses between the idea and the run, eased between keys
const KEYS: [number, Pose][] = [[70, SLUMP], [78, SIT_UP], [85, CROUCH], [93, JUMP_UP], [100, LAND], [110, STAND]];
const keyed = (f: number, keys: [number, Pose][] = KEYS): Pose => {
  for (let k = 0; k < keys.length - 1; k++) {
    const [a, pa] = keys[k];
    const [b, pb] = keys[k + 1];
    if (f <= b) {
      const t = Math.min(1, Math.max(0, (f - a) / (b - a)));
      return mix(pa, pb, t * t * (3 - 2 * t));
    }
  }
  return keys[keys.length - 1][1];
};

// the timeline (frames)
// Music (Scott: "better add music"): Funkee Monkeee (Mixkit 1140; no other film uses it), 120 BPM,
// a beat every 15 frames. From 5.69s: its hi-hats and drum fill under the slump, the band landing on
// 8.02s with the lightbulb; the crouch, the landing, the run, the door and the reveal on beats.
// Its audio is lifted 2.3 dB through a limiter after the render (ffmpeg) to sit at ~-15.5 LUFS.
const MUSIC = "music/mixkit-funkee-monkeee-1140.mp3";
const MUSIC_FROM = 8.02 - 70 / 30;
const T = { idea: 70, jump: 85, grab: 108, run: 115, house: 175, door: 220, open: 235, photo: 250 };

const Paper: React.FC<{ p: number }> = ({ p }) => {
  const look = React.useContext(LookCtx);
  // each page sits a little off register; the corner flicks as the pad is thumbed
  const dx = j(p, 901, 5);
  const dy = j(p, 902, 4);
  const curl = 60 + rnd(p * 3.1) * 70;
  return (
    <>
      {/* the pages beneath, their edges showing at the bottom right */}
      <div style={{ position: "absolute", left: 40, top: 70, width: W - 70, height: H - 100, background: look.under, borderRadius: 6 }} />
      <div style={{ position: "absolute", left: 34 + dx, top: 60 + dy, width: W - 70, height: H - 104, background: look.paper, borderRadius: 6,
        boxShadow: "0 6px 18px rgba(0,0,0,0.35)" }} />
      <svg width={W} height={H} style={{ position: "absolute", left: dx, top: dy }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={3} seed={p % 7} />
          <feColorMatrix type="matrix" values={look.grain} />
        </filter>
        <rect x={34} y={60} width={W - 70} height={H - 104} filter="url(#grain)" />
        {/* the thumbed corner lifting */}
        <path d={`M${W - 36 - curl} ${H - 44} Q${W - 36 - curl * 0.35} ${H - 44 - curl * 0.35} ${W - 36} ${H - 44 - curl} L${W - 36} ${H - 44} Z`}
          fill={look.curl} />
        <path d={`M${W - 36 - curl} ${H - 44} Q${W - 36 - curl * 0.35} ${H - 44 - curl * 0.35} ${W - 36} ${H - 44 - curl}`}
          fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth={2} />
      </svg>
    </>
  );
};

export const StickFlip: React.FC<{ look?: "pad" | "gold"; bare?: boolean; xmas?: boolean }> = ({ look: lookId = "pad", bare, xmas }) => {
  const look = LOOKS[lookId];
  const INK = look.ink;
  const frame = useCurrentFrame();
  const p = page(frame); // the pencil's boil and the page's jitter change on twos
  const f = frame; // the motion is drawn on every frame (Scott: "needs a lot more frames")
  const dx = j(p, 901, 5);
  const dy = j(p, 902, 4);

  // the figure's pose for this frame
  let q: Pose;
  if (f < T.idea) {
    q = mix(SLUMP, SIGH, (Math.sin(f / 9) + 1) / 2); // a slow sigh
  } else if (f < T.run) {
    q = keyed(f); // sits up, slides off the stool, crouches, jumps, lands, stands for the case
  } else {
    // he runs clear of the desk, then keeps pace while the office slides away and the house comes on
    const runX = interpolate(f, [T.run, T.run + 24, T.door - 8], [615, 660, 540], { extrapolateRight: "clamp" });
    const into = Math.min(1, (f - T.run) / 8);
    q = mix(STAND, runPose(f - T.run, runX), into);
  }
  const running = f >= T.run;
  const scroll = running ? interpolate(f, [T.run + 6, T.house], [0, 1250], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

  // the clock: its minute hand creeping to the hour
  const minute = interpolate(f, [0, T.idea], [-0.45, 0], { extrapolateRight: "clamp" });
  const houseGrow = interpolate(f, [T.house, T.door - 12], [0.78, 1.0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // the door swings open as he reaches it (eased), and he runs in
  const doorOpen = smooth(f, T.door - 18, T.door - 4);
  // he runs away up the path to the door: smaller as he goes, his feet on the ground, into the doorway
  const away = smooth(f, T.house - 5, T.door - 6);
  const size = 1 - 0.82 * away;
  const gone = smooth(f, T.door - 7, T.door - 1);
  // the doorway's light, brightening once he is in
  const glow = interpolate(f, [T.door - 4, T.door + 6, T.open], [0.6, 0.95, 0.85], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // the real hotel opening out of the doorway (smooth, not on twos: it is the payoff)
  const reveal = progress(frame, T.open, 26);
  const doorC: Pt = [540, 1600 - 46 * 1.32]; // the door, in the scaled scene
  const radius = 40 + 2300 * reveal ** 1.8;

  return (
    <LookCtx.Provider value={look}>
    <XmasCtx.Provider value={Boolean(xmas)}>
    <AbsoluteFill style={{ backgroundColor: look.bg }}>
      <Paper p={p} />
      <svg width={W} height={H} style={{ position: "absolute", left: dx, top: dy, filter: look.glow }}>
        <g transform="translate(540 1600) scale(1.32) translate(-540 -1392)">
        {/* the ground stays put while the office slides away */}
        {f < T.door ? <Pencil d={[[60, 1392], [1020, 1392]]} p={p} id={27} w={5} /> : null}
        {/* the office: desk, stool, the rain cloud, the clock; they slide away as he runs */}
        <g transform={`translate(${-scroll} 0)`}>
          {f < T.door ? (
            <>
              <Pencil d={[[90, 1130], [440, 1130]]} p={p} id={20} />
              <Pencil d={[[110, 1130], [110, 1390]]} p={p} id={21} />
              <Pencil d={[[420, 1130], [420, 1390]]} p={p} id={22} />
              {/* the screen on the desk */}
              <Pencil d={[[170, 1130], [170, 990], [340, 990], [340, 1130]]} p={p} id={23} />
              <Pencil d={[[490, 1235], [630, 1235]]} p={p} id={24} />
              <Pencil d={[[510, 1235], [510, 1390]]} p={p} id={25} />
              <Pencil d={[[610, 1235], [610, 1390]]} p={p} id={26} />
              {/* the clock */}
              <Circle c={[300, 560]} r={90} p={p} id={30} />
              <Pencil d={[[300, 560], [300, 495]]} p={p} id={31} />
              <Pencil d={[[300, 560], [300 + Math.sin(Math.PI + minute) * -80, 560 + Math.cos(Math.PI + minute) * 80]]} p={p} id={32} />
              {/* the rain cloud over his head, raining until the idea */}
              {f < T.idea ? (
                <>
                  <Pencil d={[[430, 820], [420, 770], [465, 735], [515, 745], [545, 700], [610, 705], [640, 745], [690, 750], [705, 800], [675, 830], [430, 830]]} p={p} id={40} closed />
                  {xmas
                    ? // the Christmas cut: a snow cloud, flakes drifting down
                      [0, 1, 2, 3, 4, 5].map((k) => {
                        const y0 = 860 + ((f * 2.2 + k * 41) % 150);
                        const x0 = 455 + k * 44 + 10 * Math.sin(f * 0.12 + k);
                        return <React.Fragment key={k}>
                          <Pencil d={[[x0 - 9, y0], [x0 + 9, y0]]} p={p} id={41 + k} w={3} />
                          <Pencil d={[[x0 - 5, y0 - 8], [x0 + 5, y0 + 8]]} p={p} id={141 + k} w={3} />
                          <Pencil d={[[x0 + 5, y0 - 8], [x0 - 5, y0 + 8]]} p={p} id={241 + k} w={3} />
                        </React.Fragment>;
                      })
                    : [0, 1, 2, 3, 4].map((k) => {
                        const y0 = 860 + ((f * 9 + k * 37) % 120);
                        return <Pencil key={k} d={[[460 + k * 50, y0], [452 + k * 50, y0 + 26]]} p={p} id={41 + k} w={5} />;
                      })}
                </>
              ) : f < T.run ? (
                // the lightbulb
                <>
                  <Circle c={[560, 820]} r={44} p={p} id={50} />
                  <Pencil d={[[542, 864], [542, 892], [578, 892], [578, 864]]} p={p} id={51} />
                  {[0, 1, 2, 3, 4].map((k) => {
                    const a = -1.2 + k * 0.6;
                    return <Pencil key={k} d={[[560 + Math.sin(a) * 64, 820 - Math.cos(a) * 64], [560 + Math.sin(a) * 96, 820 - Math.cos(a) * 96]]} p={p} id={52 + k} w={5} />;
                  })}
                </>
              ) : null}
            </>
          ) : null}
          {/* the suitcase on the floor until it hops up into his hand */}
          {f < T.grab - 6 ? (
            <Pencil d={[[700, 1392], [700, 1300], [820, 1300], [820, 1392]]} p={p} id={60} closed />
          ) : null}
        </g>
        {/* the house he runs to, growing as he reaches it */}
        {f >= T.house - 20 ? (
          <g transform={`translate(${interpolate(f, [T.house - 20, T.door - 12], [1300, 540], { extrapolateRight: "clamp", easing: (x) => 1 - (1 - x) ** 2 })} 1392) scale(${houseGrow}) translate(-540 -1392)`}>
            {xmas ? (
              <>
            {/* Hogarths Stone Manor, drawn from its rooms (black and white timbers, leaded windows; no
                exterior photo yet): two timbered gables either side of the hall, a wreath on its oak
                doors and lights along the eaves for Christmas */}
            <Pencil d={[[300, 1392], [300, 1110], [880, 1110], [880, 1392]]} p={p} id={70} />
            <Pencil d={[[285, 1112], [390, 975], [495, 1112]]} p={p} id={71} />
            <Pencil d={[[685, 1112], [790, 975], [895, 1112]]} p={p} id={72} />
            <Pencil d={[[495, 1112], [495, 1060], [685, 1060], [685, 1112]]} p={p} id={73} w={5} />
            {/* its tall brick chimneys */}
            <Pencil d={[[520, 1060], [520, 925], [552, 925], [552, 1060]]} p={p} id={74} w={5} />
            <Pencil d={[[628, 1060], [628, 940], [658, 940], [658, 1060]]} p={p} id={75} w={5} />
            <Pencil d={[[514, 925], [558, 925]]} p={p} id={76} w={4} />
            <Pencil d={[[622, 940], [664, 940]]} p={p} id={77} w={4} />
            {/* the timbers: studs, a rail, braces in the gables */}
            {[330, 370, 410, 450, 730, 770, 810, 850].map((x, k) => (
              <Pencil key={k} d={[[x, 1112], [x, 1392]]} p={p} id={110 + k} w={3} />
            ))}
            <Pencil d={[[300, 1240], [880, 1240]]} p={p} id={120} w={4} />
            <Pencil d={[[345, 1100], [390, 1040], [435, 1100]]} p={p} id={121} w={3} />
            <Pencil d={[[745, 1100], [790, 1040], [835, 1100]]} p={p} id={122} w={3} />
            {/* leaded windows */}
            {[[338, 1150], [742, 1150], [338, 1280], [742, 1280], [540, 1140]].map(([x, y], k) => (
              <React.Fragment key={k}>
                <Pencil d={[[x, y], [x + 92, y], [x + 92, y + 64], [x, y + 64]]} p={p} id={125 + k} closed w={5} />
                {[1, 2, 3].map((c) => <Pencil key={c} d={[[x + c * 23, y], [x + c * 23, y + 64]]} p={p} id={130 + k * 6 + c} w={2} />)}
                <Pencil d={[[x, y + 32], [x + 92, y + 32]]} p={p} id={150 + k} w={2} />
              </React.Fragment>
            ))}
            {/* lights along the eaves */}
            {Array.from({ length: 18 }).map((_, k) => {
              const t = k / 17;
              const x = 495 + t * 190;
              return <circle key={k} cx={x + j(p, 140 + k, 1.2)} cy={1066 + j(p, 180 + k, 1.2)} r={5} fill={look.light} stroke={INK} strokeWidth={2} />;
            })}
            {/* the oak doors under their arch, a wreath on them, swinging open */}
            <Pencil d={[[500, 1392], [500, 1300], [540, 1270], [580, 1300], [580, 1392]]} p={p} id={160} />
            {doorOpen > 0.05 ? <rect x={503} y={1300} width={74} height={90} fill={look.light} opacity={glow * doorOpen} /> : null}
            <Pencil d={[[505, 1392], [505, 1302], [505 + 35 * (1 - doorOpen * 0.85), 1290 + doorOpen * 10], [505 + 35 * (1 - doorOpen * 0.85), 1392 - doorOpen * 8]]} p={p} id={161} closed w={5} />
            <Pencil d={[[575, 1392], [575, 1302], [575 - 35 * (1 - doorOpen * 0.85), 1290 + doorOpen * 10], [575 - 35 * (1 - doorOpen * 0.85), 1392 - doorOpen * 8]]} p={p} id={162} closed w={5} />
            {doorOpen < 0.3 ? <Circle c={[540, 1325]} r={14} p={p} id={163} w={5} /> : null}
              </>
            ) : (
              <>
            {/* Rowton Hall, from its dusk clip: a wide white Georgian front, a low roof with three
                chimney stacks, five sashes upstairs, a balcony over the ground floor, the lit
                conservatory wing on the left strung with fairy lights */}
            <Pencil d={[[330, 1392], [330, 1080], [870, 1080], [870, 1392]]} p={p} id={70} />
            <Pencil d={[[318, 1082], [362, 1040], [838, 1040], [882, 1082]]} p={p} id={71} />
            <Pencil d={[[372, 1040], [372, 948], [394, 948], [394, 1040]]} p={p} id={72} />
            <Pencil d={[[368, 948], [398, 948]]} p={p} id={73} w={5} />
            <Pencil d={[[480, 1040], [480, 972], [534, 972], [534, 1040]]} p={p} id={74} />
            <Pencil d={[[490, 972], [490, 958], [502, 958], [502, 972]]} p={p} id={75} w={5} />
            <Pencil d={[[512, 972], [512, 958], [524, 958], [524, 972]]} p={p} id={76} w={5} />
            <Pencil d={[[808, 1040], [808, 1006], [836, 1006], [836, 1040]]} p={p} id={77} />
            <Pencil d={[[330, 1230], [870, 1230]]} p={p} id={78} w={5} />
            {[375, 470, 565, 660, 790].map((x, k) => (
              <React.Fragment key={k}>
                <Pencil d={[[x, 1112], [x + 48, 1112], [x + 48, 1186], [x, 1186]]} p={p} id={90 + k} closed w={5} />
                <Pencil d={[[x, 1149], [x + 48, 1149]]} p={p} id={100 + k} w={3} />
              </React.Fragment>
            ))}
            {/* the balcony */}
            <Pencil d={[[400, 1256], [720, 1256]]} p={p} id={110} w={5} />
            <Pencil d={[[400, 1280], [720, 1280]]} p={p} id={111} w={5} />
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((k) => (
              <Pencil key={k} d={[[404 + k * 39, 1256], [404 + k * 39, 1280]]} p={p} id={112 + k} w={3} />
            ))}
            {/* ground floor windows */}
            {[410, 625, 790].map((x, k) => (
              <Pencil key={k} d={[[x, 1305], [x + 50, 1305], [x + 50, 1376], [x, 1376]]} p={p} id={125 + k} closed w={5} />
            ))}
            {/* the conservatory wing and its fairy lights */}
            <Pencil d={[[160, 1392], [160, 1302], [330, 1292]]} p={p} id={130} />
            {[180, 225, 270].map((x, k) => (
              <Pencil key={k} d={[[x, 1322], [x + 32, 1322], [x + 32, 1392], [x, 1392]]} p={p} id={131 + k} closed w={4} />
            ))}
            {Array.from({ length: 16 }).map((_, k) => {
              const t = k / 15;
              const x = 165 + t * 555;
              const y = 1290 + Math.sin(t * Math.PI * 3) ** 2 * 18 - t * 8;
              return <circle key={k} cx={x + j(p, 140 + k, 1.2)} cy={y + j(p, 160 + k, 1.2)} r={6} fill={look.light} stroke={INK} strokeWidth={2} />;
            })}
            {/* the door, swinging open */}
            <Pencil d={[[505, 1392], [505, 1300], [575, 1300], [575, 1392]]} p={p} id={80} />
            <Pencil d={[[505, 1392], [505 + 70 * (1 - doorOpen * 0.85), 1392 - doorOpen * 12], [505 + 70 * (1 - doorOpen * 0.85), 1300 + doorOpen * 12], [505, 1300]]} p={p} id={81} />
            {doorOpen > 0.05 ? <rect x={507} y={1302} width={66} height={88} fill={look.light} opacity={glow * doorOpen} /> : null}
              </>
            )}
          </g>
        ) : null}
        {/* him: holding the suitcase once he has it; speed lines behind him on the run */}
        {f < T.door - 1 ? (
          <g transform={`translate(${q.x} 1392) scale(${size}) translate(${-q.x} -1392)`} opacity={1 - gone}>
            {f >= T.run + 10 && f < T.house + 12
              ? [0, 1, 2].map((k) => (
                  <Pencil key={k} d={[[q.x - 150 - k * 22, 1050 + k * 46], [q.x - 230 - k * 30, 1050 + k * 46]]} p={p} id={64 + k} w={4} />
                ))
              : null}
            <Figure q={q} p={p} />
            {f >= T.grab - 6 ? (() => {
              // the case hops from the floor up into his hand, then swings with him
              const h = hand(q, 0);
              const t = interpolate(f, [T.grab - 6, T.grab], [0, 1], { extrapolateRight: "clamp" });
              const cx = 760 + (h[0] - 760) * t;
              const cy = 1346 + (h[1] + 52 - 1346) * t - Math.sin(Math.PI * t) * 140;
              return <Knockout><Pencil d={[[cx - 55, cy - 42], [cx - 55, cy + 42], [cx + 55, cy + 42], [cx + 55, cy - 42]]} p={p} id={61} closed /></Knockout>;
            })() : null}
          </g>
        ) : null}
        </g>
        {/* the scribbled line at the top of the page */}
        <text x={90} y={300} fontFamily={HAND} fontWeight={600} fontSize={64} fill={INK} opacity={0.85}>
          {xmas ? (f < T.idea ? "Fri 20 Nov, 4:59pm" : "Fri 20 Nov, 5:00pm") : f < T.idea ? "Friday, 4:59pm" : "Friday, 5:00pm"}
        </text>
      </svg>
      {/* the real hotel opening out of the doorway */}
      {frame >= T.open ? (
        <AbsoluteFill style={{ clipPath: `circle(${radius}px at ${doorC[0]}px ${doorC[1]}px)` }}>
          <Sequence from={T.open} layout="none">
            {xmas ? (
              // through the doors into Stone Manor at Christmas (its own festive reel, cut on the beat): the oak
              // door under its garland, the hall and its tree, lights, the tables (drinks only in the drinks scene)
              <OffthreadVideo src={staticFile("hotels/hogarths-stone-manor/festive/arrival.mp4")} muted style={{ position: "absolute", width: W, height: H }} />
            ) : (
              <OffthreadVideo src={staticFile("campaigns/flipbook-winter/rowton-dusk.mp4")} muted style={{ position: "absolute", width: W, height: H }} />
            )}
          </Sequence>
          <AbsoluteFill style={{ opacity: progress(frame, T.photo, 14) }}>
            <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(9,9,10,0) 52%, rgba(9,9,10,0.55) 74%, rgba(9,9,10,0.3) 100%)" }} />
            <div style={{ position: "absolute", left: 72, bottom: 500 }}>
              <div style={{ display: "inline-block" }}>
                <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 28, letterSpacing: "0.24em", color: colors.gold }}>{xmas ? "KIDDERMINSTER" : "CHESTER"}</div>
              </div>
              <div style={{ fontFamily: serif, fontSize: 64, lineHeight: 1.1, marginTop: 14, color: colors.cream }}>{xmas ? "Hogarths Stone Manor" : "Rowton Hall Hotel & Spa"}</div>
            </div>
          </AbsoluteFill>
        </AbsoluteFill>
      ) : null}
      {frame >= T.open ? <InkRing c={doorC} r={radius} o={1 - reveal * reveal} /> : null}
      {/* in the reel the track and the finish belong to the whole film */}
      {bare ? null : (
        <>
          <Audio
            src={staticFile(MUSIC)}
            trimBefore={Math.round(MUSIC_FROM * 30)}
            volume={(v) => interpolate(v, [0, 6, STICK_FRAMES - 20, STICK_FRAMES], [0, 1, 1, 0], { extrapolateRight: "clamp" })}
          />
          <FilmFinish />
        </>
      )}
    </AbsoluteFill>
    </XmasCtx.Provider>
    </LookCtx.Provider>
  );
};

// ---------------------------------------------------------------------------------------------
// The reel (Scott: "put more Rowton Hall clips and more stick figure stuff, like him at the spa,
// food, fun"): after the door, the weekend at Rowton as gags, each drawn on the page and opening
// into Rowton's own footage at real speed: the fizz popped on arrival (welcome fizz), a dive off the
// board (the pool), a giant slice of cake (the cake cut by the fire), a run and a leap into the
// four-poster (the canopied bed); the time at the top of the page runs on through the weekend; end
// card "Out of office / till Monday" (the office at five). No scribbled words on the page (Scott: they
// read gaggy): the timestamps and the drifting z are the only writing; the motion carries the jokes. Every scene starts on a downbeat of
// Funkee Monkeee (a bar is 60 frames); each drawing gets a bar, each shot a bar (the pool two).

const SCENE = (x: number, y: number): Pt => [540 + (x - 540) * 1.32, 1600 + (y - 1392) * 1.32]; // scene to screen
const OPEN_AT = 58; // the shot opens out of the drawing just before the next downbeat
const FLIP = 8; // frames a page takes to lift away over its top edge, landing on the downbeat

// the edge of a shot opening out of the drawing: a gold ink ring that fades as it spreads
const InkRing: React.FC<{ c: Pt; r: number; o: number }> = ({ c, r, o }) => {
  const look = React.useContext(LookCtx);
  return (
    <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, filter: look.glow }}>
      <circle cx={c[0]} cy={c[1]} r={r} fill="none" stroke={look.ink} strokeWidth={7} opacity={0.95 * o} />
      <circle cx={c[0] + 2} cy={c[1] + 3} r={r + 4} fill="none" stroke={look.ink} strokeWidth={3} opacity={0.4 * o} />
    </svg>
  );
};

// a page of the pad lifting away over its top edge in its last FLIP frames, uncovering the next
const FlipOut: React.FC<{ total: number; children: React.ReactNode }> = ({ total, children }) => {
  const frame = useCurrentFrame();
  const t = progress(frame, total - FLIP, FLIP, (x) => x * x);
  return (
    <AbsoluteFill style={{ transformOrigin: "50% 0%", transform: `perspective(2400px) rotateX(${-t * 96}deg)`,
      backfaceVisibility: "hidden", filter: t > 0 ? `brightness(${1 - 0.35 * t})` : undefined }}>
      {children}
    </AbsoluteFill>
  );
};
const OPEN_FOR = 16;

const Ellipse: React.FC<{ c: Pt; rx: number; ry: number; p: number; id: number; w?: number }> = ({ c, rx, ry, p, id, w = 5 }) => {
  const d: Pt[] = [];
  for (let k = 0; k <= 26; k++) {
    const a = (k / 24) * Math.PI * 2;
    d.push([c[0] + Math.cos(a) * rx, c[1] + Math.sin(a) * ry]);
  }
  return <Pencil d={d} p={p} id={id} w={w} />;
};
const Scribble: React.FC<{ x: number; y: number; size?: number; o?: number; children: React.ReactNode }> = ({ x, y, size = 60, o = 1, children }) => {
  const ink = React.useContext(LookCtx).ink;
  return <text x={x} y={y} fontFamily={HAND} fontWeight={600} fontSize={size} fill={ink} opacity={0.9 * o}>{children}</text>;
};

// a run of photos after a page's drawing: the first opens out of the drawing, the rest are hard cuts on the beat.
// A portrait photo fills the frame on a slow push; a landscape one (`wide`) sits across the middle over its own
// blurred copy and drifts sideways so the whole group is seen.
type Shot = { src: string; len: number; pos?: string; split?: boolean; plates?: string[]; grid?: string[];
  to?: string; toPos?: string;
  halves?: boolean; zoom?: number }; // with `split`: the two tiles are the photo's exact left and right halves, nobody shown twice // `to`: the same view later on, snap cut to half way (the day group, then the night one)
const pop = (f: number, at0: number, n = 5) => Math.min(1, Math.max(0, (f - at0) / n));
const PartyShot: React.FC<{ s: Shot; f: number }> = ({ s, f }) => {
  const look = React.useContext(LookCtx);
  const t = Math.min(1, Math.max(0, f / s.len));
  // a landscape photo as two tiles, its left half over its right half, the second landing half a beat on
  if (s.split) {
    const late = s.len <= 15 ? 3 : s.len <= 30 ? 7 : 15;
    const up = 1 - (1 - pop(f, late, 6)) ** 3;
    const half = (side: number, top: number, dy: number) => (
      <div style={{ position: "absolute", left: 0, top, width: W, height: 954, overflow: "hidden", transform: `translateY(${dy}px)` }}>
        <Img src={staticFile(s.src)} style={{ position: "absolute", left: side ? -W : 0, top: -118, width: 2 * W, height: 1216,
          transformOrigin: side ? "75% 45%" : "25% 45%", transform: `scale(${1 + 0.03 * t})` }} />
      </div>
    );
    if (s.halves) {
      return (
        <AbsoluteFill style={{ backgroundColor: look.bg }}>
          {half(0, 0, 0)}
          {f >= late ? half(1, 966, (1 - up) * 960) : null}
        </AbsoluteFill>
      );
    }
    const tile = (side: number, top: number, dy: number) => (
      <div style={{ position: "absolute", left: 0, top, width: W, height: 954, overflow: "hidden", transform: `translateY(${dy}px)` }}>
        <Img src={staticFile(s.src)} style={{ width: W, height: 954, objectFit: "cover", objectPosition: `${side ? 100 - 6 * t : 6 * t}% 50%`, transform: `scale(${1.02 + 0.03 * t})` }} />
      </div>
    );
    return (
      <AbsoluteFill style={{ backgroundColor: look.bg }}>
        {tile(0, 0, 0)}
        {f >= late ? tile(1, 966, (1 - up) * 960) : null}
      </AbsoluteFill>
    );
  }
  // the plates: a match cut, every plate in the same circle, a new course every half beat
  if (s.plates) {
    const k = Math.min(s.plates.length - 1, Math.floor(Math.max(0, f) / 15));
    const in0 = pop(f, k * 15, 4);
    const R0 = 480;
    const CY = 860;
    const p = page(f);
    const dip = 26 * (1 - in0) ** 2;
    const atlas: Pose = { x: 540, y: 1672 + dip, lean: 0.03 * Math.sin(f * 0.35), head: -0.05, ua: [2.3, -2.3], fa: [2.75, -2.75],
      th: [0.22 + dip * 0.012, -0.22 - dip * 0.012], sh: [-0.08 - dip * 0.012, 0.08 + dip * 0.012] };
    return (
      <AbsoluteFill style={{ backgroundColor: look.bg }}>
        <div style={{ position: "absolute", left: 540 - R0, top: CY - R0 + dip * 0.6, width: 2 * R0, height: 2 * R0, borderRadius: "50%", overflow: "hidden",
          transform: `scale(${1.07 - 0.07 * in0})`, boxShadow: "0 30px 90px rgba(0,0,0,0.7)" }}>
          <Img src={staticFile(s.plates[k])} style={{ width: "100%", height: "100%", transform: `rotate(${(1 - in0) * -14 + (f - k * 15) * 0.25}deg) scale(1.08)` }} />
        </div>
        <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, filter: look.glow }}>
          <circle cx={540} cy={CY + dip * 0.6} r={R0 + 14} fill="none" stroke={look.ink} strokeWidth={5} opacity={0.9} />
          {/* he holds every course up; each one lands with a dip of the knees */}
          <Pencil d={[[260, 1856], [820, 1856]]} p={p} id={790} w={5} />
          <Figure q={atlas} p={p} hat="antlers" />
        </svg>
      </AbsoluteFill>
    );
  }
  // the wall: twelve faces, three across, landing one after another
  if (s.grid) {
    return (
      <AbsoluteFill style={{ backgroundColor: look.bg }}>
        {s.grid.map((src, k) => {
          const a = pop(f, k * 2.5, 5);
          if (a <= 0) return null;
          return (
            <div key={src} style={{ position: "absolute", left: (k % 3) * 360 + 3, top: Math.floor(k / 3) * 480 + 3, width: 354, height: 474, overflow: "hidden",
              transform: `scale(${0.82 + 0.18 * (1 - (1 - a) ** 3)})`, opacity: a }}>
              <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 30%", transform: `scale(${1.25 + 0.04 * t})`, transformOrigin: "50% 35%" }} />
            </div>
          );
        })}
      </AbsoluteFill>
    );
  }
  const one = (src: string, pos: string | undefined, o: number) => (
    <Img src={staticFile(src)} style={{ position: "absolute", width: W, height: H, objectFit: "cover", objectPosition: pos ?? "50% 50%",
      transformOrigin: pos ?? "50% 50%", transform: `scale(${(s.zoom ?? 1) * (1 + 0.05 * t)})`, opacity: o }} />
  );
  if (s.to) {
    // a snap cut on the beat half way (Scott: "or a quick cut snap"), the new photo punching in and settling
    const at0 = Math.round(s.len / 2);
    // more of a pop (Scott): the day photo leans in a touch, then the night one slams in big and springs back
    const d = f - at0;
    const k = d >= 0 ? Math.max(1, 1 + 0.24 * Math.exp(-d / 2.4) + 0.05 * Math.exp(-d / 7) * Math.sin(d * 0.9))
      : 1 + 0.03 * Math.max(0, 1 + d / 8) ** 2;
    const lift = d >= 0 ? 1 + 0.22 * Math.exp(-d / 3) : 1;
    return (
      <AbsoluteFill style={{ backgroundColor: "#000", transform: `scale(${k})`, filter: lift > 1.01 ? `brightness(${lift})` : undefined }}>
        {f < at0 ? one(s.src, s.pos, 1) : one(s.to, s.toPos ?? s.pos, 1)}
      </AbsoluteFill>
    );
  }
  return one(s.src, s.pos, 1);
};
const shotAt = (stills: Shot[], frame: number) => {
  let a = 60;
  for (let k = 0; k < stills.length; k++) {
    const s = stills[k];
    if (frame < a + s.len || k === stills.length - 1) return <PartyShot key={`${k}${s.src}`} s={s} f={frame - a} />;
    a += s.len;
  }
  return null;
};

// a page of the pad: the time at the top, the ground, a drawing; then the shot opens out of the point `from`
const Gag: React.FC<{
  time: string; clip?: string; still?: string; pos?: string; from: Pt; stills?: Shot[];
  draw: (f: number, p: number, look: Look, xmas: boolean) => React.ReactNode; ground?: [number, number];
}> = ({ time, clip, still, pos, from, draw, ground = [60, 1020], stills }) => {
  // the page sits under the last one for FLIP frames as that one lifts away, its drawing held on its first pose
  const frame = Math.max(0, useCurrentFrame() - FLIP);
  const look = React.useContext(LookCtx);
  const xmas = React.useContext(XmasCtx);
  const p = page(frame);
  const dx = j(p, 901, 5);
  const dy = j(p, 902, 4);
  const reveal = progress(frame, OPEN_AT, OPEN_FOR);
  const radius = 30 + 2300 * reveal ** 1.8; // opening slowly at first, so the ring is seen
  const write = progress(frame, 2, 16, (x) => x); // the time written in, left to right, at a writing pace
  const [cx, cy] = SCENE(from[0], from[1]);
  return (
    <AbsoluteFill style={{ backgroundColor: look.bg }}>
      <Paper p={p} />
      <svg width={W} height={H} style={{ position: "absolute", left: dx, top: dy, filter: look.glow }}>
        <g transform="translate(540 1600) scale(1.32) translate(-540 -1392)">
          <Pencil d={[[ground[0], 1392], [ground[1], 1392]]} p={p} id={27} w={5} />
          {draw(frame, p, look, xmas)}
        </g>
        <clipPath id="write"><rect x={70} y={220} width={20 + 700 * write} height={110} /></clipPath>
        <g clipPath="url(#write)"><Scribble x={90} y={300} size={64} o={0.95}>{time}</Scribble></g>
        {xmas ? <Garland p={p} f={frame} look={look} /> : null}
      </svg>
      {/* a run of photos comes in on a straight cut on the beat, no opening circle (Scott: "lose the circle in the
          middle before every transition") */}
      {frame >= 60 && stills ? <AbsoluteFill>{shotAt(stills, frame)}</AbsoluteFill> : null}
      {frame >= OPEN_AT && (clip || still) ? (
        <AbsoluteFill style={{ clipPath: `circle(${radius}px at ${cx}px ${cy}px)` }}>
          {still ? (
            <Img src={staticFile(still)} style={{ position: "absolute", width: W, height: H, objectFit: "cover", objectPosition: pos ?? "50% 50%",
              transform: `scale(${interpolate(frame, [OPEN_AT, OPEN_AT + 62], [1, 1.05])})` }} />
          ) : (
            <Sequence from={OPEN_AT + FLIP} layout="none">
              <OffthreadVideo src={staticFile(clip!)} muted style={{ position: "absolute", width: W, height: H }} />
            </Sequence>
          )}
        </AbsoluteFill>
      ) : null}
      {frame >= OPEN_AT && (clip || still) ? <InkRing c={[cx, cy]} r={radius} o={1 - reveal * reveal} /> : null}
      <LiftShadow />
    </AbsoluteFill>
  );
};
// a garland strung across the top of a party page in three swags, a bauble at the foot of each,
// glinting in turn
const Garland: React.FC<{ p: number; f: number; look: Look }> = ({ p, f, look }) => {
  const swag = (t: number): Pt => [70 + t * 940, 372 + 52 * Math.sin(Math.PI * ((t * 3) % 1))];
  const line = Array.from({ length: 46 }, (_, k) => swag(k / 45));
  return (
    <>
      <Pencil d={line} p={p} id={610} w={4} />
      {[1 / 6, 1 / 2, 5 / 6].map((t, k) => {
        const [x, y] = swag(t);
        const glint = 0.35 + 0.35 * Math.max(0, Math.sin(f * 0.12 - k * 2.1));
        return (
          <React.Fragment key={k}>
            <Pencil d={[[x, y + 2], [x, y + 18]]} p={p} id={611 + k} w={3} />
            <circle cx={x} cy={y + 44} r={22} fill={look.light} opacity={glint} />
            <Circle c={[x, y + 44]} r={24} p={p} id={615 + k} w={5} />
            <Pencil d={[[x - 9, y + 18], [x + 9, y + 18], [x + 9, y + 24], [x - 9, y + 24]]} p={p} id={619 + k} w={3} closed />
          </React.Fragment>
        );
      })}
    </>
  );
};
// the shadow of the page lifting off this one, falling from the top and clearing as it goes
const LiftShadow: React.FC = () => {
  const raw = useCurrentFrame();
  if (raw >= FLIP) return null;
  const t = raw / FLIP;
  return <AbsoluteFill style={{ background: `linear-gradient(to bottom, rgba(0,0,0,${0.55 * (1 - t)}) ${t * 60}%, rgba(0,0,0,0) ${t * 60 + 40}%)` }} />;
};

// a bottle held at `h`, tilted `ang` from upright; returns its mouth too
const bottle = (h: Pt, ang: number) => {
  const u: Pt = [Math.sin(ang), -Math.cos(ang)];
  const v: Pt = [Math.cos(ang), Math.sin(ang)];
  const P = (o: Pt, a: number, b: number): Pt => [o[0] + u[0] * a + v[0] * b, o[1] + u[1] * a + v[1] * b];
  const d: Pt[] = [P(h, -50, -20), P(h, 40, -20), P(h, 56, -8), P(h, 92, -8), P(h, 92, 8), P(h, 56, 8), P(h, 40, 20), P(h, -50, 20)];
  return { d, mouth: P(h, 96, 0), u };
};

// 1. Friday evening: the fizz popped on arrival
const FIZZ_STAND: Pose = { x: 470, y: 1208, lean: 0, head: 0, ua: [1.2, -0.2], fa: [1.5, -0.1], th: [0.1, -0.1], sh: [0, 0] };
const FIZZ_UP: Pose = { x: 470, y: 1200, lean: 0.1, head: -0.2, ua: [2.15, -0.9], fa: [2.45, -0.5], th: [0.15, -0.2], sh: [0.05, -0.1] };
const Fizz = (f: number, p: number) => {
  const shake = f < 16 ? Math.sin(f * 1.7) : 0;
  const q0 = mix(FIZZ_STAND, FIZZ_UP, smooth(f, 22, 32));
  const q: Pose = { ...q0, ua: [q0.ua[0] + 0.22 * shake, q0.ua[1]], fa: [q0.fa[0] + 0.3 * shake, q0.fa[1]] };
  const b = bottle(hand(q, 0), f < 16 ? 0.35 * shake : interpolate(f, [16, 32], [0, 0.45], { extrapolateRight: "clamp" }));
  const pop = f >= 16;
  const ct = Math.max(0, (f - 16) / 20);
  const cork: Pt = [b.mouth[0] + ct * 330, b.mouth[1] - ct * 520 + ct * ct * 260];
  return (
    <>
      <Figure q={q} p={p} />
      <Pencil d={b.d} p={p} id={200} w={6} closed />
      {/* the cork flying off with a dotted trail */}
      {pop && f < 40 ? (
        <>
          <Circle c={cork} r={11} p={p} id={201} w={5} />
          {[0.25, 0.5, 0.75].map((k, i) => {
            const t = ct * k;
            const pt: Pt = [b.mouth[0] + t * 330, b.mouth[1] - t * 520 + t * t * 260];
            return <Pencil key={i} d={[pt, [pt[0] + 6, pt[1] - 8]]} p={p} id={202 + i} w={4} />;
          })}
        </>
      ) : null}
      {/* the foam: lines spraying out of the neck, bubbles rising */}
      {pop
        ? [-0.5, -0.2, 0.15, 0.45].map((a, i) => {
            const len = 40 + 70 * smooth(f, 16, 26) + 10 * Math.sin(f * 0.9 + i);
            const ang = Math.atan2(b.u[0], -b.u[1]) + a;
            const s: Pt = [b.mouth[0] + Math.sin(ang) * 14, b.mouth[1] - Math.cos(ang) * 14];
            return <Pencil key={i} d={[s, [s[0] + Math.sin(ang) * len * 0.5 + 6, s[1] - Math.cos(ang) * len * 0.55], [s[0] + Math.sin(ang) * len, s[1] - Math.cos(ang) * len + 18]]} p={p} id={210 + i} w={4} />;
          })
        : null}
      {pop
        ? [0, 1, 2, 3, 4].map((k) => {
            const t = ((f - 16) * 0.035 + k * 0.2) % 1;
            return <Circle key={k} c={[b.mouth[0] - 50 + k * 26 + 10 * Math.sin(f * 0.3 + k), b.mouth[1] - 40 - t * 220]} r={6 + (k % 2) * 3} p={p} id={220 + k} w={3} />;
          })
        : null}
    </>
  );
};
// where Fizz's bottle mouth ends up (the shot opens out of it)
const FIZZ_FROM: Pt = bottle(hand(FIZZ_UP, 0), 0.45).mouth;

// 2. Saturday morning: off the board into the pool
const DIVE = (lean: number, x: number, y: number): Pose => ({
  x, y, lean, head: 0, ua: [Math.PI - 0.1, Math.PI + 0.1], fa: [Math.PI, Math.PI], th: [lean, lean + 0.12], sh: [lean, lean + 0.12],
});
const WATER = 1440;
const SPLASH: Pt = [800, WATER];
const Pool = (f: number, p: number) => {
  let q: Pose;
  if (f < 20) q = runPose(f, interpolate(f, [0, 20], [200, 585]));
  else if (f < 27) q = mix(runPose(20, 585), { ...CROUCH, x: 600, y: 1240, lean: -0.25 }, smooth(f, 20, 25));
  else {
    // the dive: up off the board and over, head first into the water
    const t = Math.min(1, (f - 27) / 21);
    const dive = DIVE(-Math.PI * 0.95 * smooth(f, 27, 46), 600 + 190 * t, lerpY(t));
    q = mix({ ...CROUCH, x: 600, y: 1240, lean: -0.25 }, dive, Math.min(1, (f - 27) / 4));
  }
  const tip = f >= 20 && f < 34 ? 14 * Math.sin(((f - 20) / 14) * Math.PI * 2) * (1 - (f - 20) / 14) : 0;
  const splash = smooth(f, 46, 58);
  return (
    <>
      {/* the pool: its edge, the wall, the water with a wave */}
      <Pencil d={[[540, 1392], [540, 1660]]} p={p} id={230} />
      <Pencil d={Array.from({ length: 14 }, (_, k): Pt => [540 + k * 32, WATER + 6 * Math.sin(k * 1.1 + f * 0.25)])} p={p} id={231} w={5} />
      <Pencil d={Array.from({ length: 12 }, (_, k): Pt => [560 + k * 34, WATER + 60 + 5 * Math.sin(k * 0.9 - f * 0.2)])} p={p} id={232} w={3} />
      {/* the board, springing */}
      <Pencil d={[[440, 1392], [640, 1392 + tip]]} p={p} id={233} />
      <Pencil d={[[440, 1404], [640, 1404 + tip]]} p={p} id={234} w={4} />
      {/* the diver: nothing below the water */}
      <clipPath id="above-water"><rect x={0} y={0} width={2000} height={WATER} /></clipPath>
      {f < 54 ? <g clipPath="url(#above-water)"><Figure q={q} p={p} /></g> : null}
      {/* the splash: drops flung up and out, rings spreading */}
      {f >= 46
        ? [-1.0, -0.6, -0.25, 0.25, 0.6, 1.0].map((a, i) => {
            const r0 = 20 + splash * 90;
            const r1 = r0 + 40 + 30 * (i % 2);
            return <Pencil key={i} d={[[SPLASH[0] + Math.sin(a) * r0, SPLASH[1] - Math.cos(a) * r0 * 1.4], [SPLASH[0] + Math.sin(a) * r1, SPLASH[1] - Math.cos(a) * r1 * 1.4]]} p={p} id={240 + i} w={5} />;
          })
        : null}
      {f >= 46 ? <Ellipse c={SPLASH} rx={30 + splash * 120} ry={8 + splash * 18} p={p} id={250} w={4} /> : null}
      {f >= 50 ? <Ellipse c={SPLASH} rx={20 + smooth(f, 50, 60) * 70} ry={5 + smooth(f, 50, 60) * 10} p={p} id={251} w={3} /> : null}
    </>
  );
};
function lerpY(t: number) {
  return 1240 + (WATER + 140 - 1240) * t - 1150 * t * (1 - t);
}

// 3. Saturday afternoon: a giant slice of cake
const SIT_L = SIT_UP; // facing the table on the left
const EAT_REACH: Pose = { ...SIT_L, lean: 0.25, ua: [-1.25, -0.2], fa: [-1.55, -0.5] };
const EAT_MOUTH: Pose = { ...SIT_L, lean: 0.05, head: -0.1, ua: [-0.75, -0.2], fa: [-2.75, -0.5] };
const Cake = (f: number, p: number) => {
  // eats on the beat: to the cake and back to his mouth every half beat
  const bite = f >= 12 && f < 54 ? (1 - Math.cos(((f - 12) / 15) * Math.PI * 2)) / 2 : 0;
  const q = f < 12 ? mix(SIT_L, EAT_REACH, smooth(f, 4, 12) * 0.3) : mix(EAT_MOUTH, EAT_REACH, 1 - bite);
  const h = hand(q, 0);
  const eaten = smooth(f, 12, 54); // the wedge gets shorter
  const tip = 280 + eaten * 55;
  return (
    <>
      {/* the table and the stool */}
      <Pencil d={[[110, 1130], [450, 1130]]} p={p} id={260} />
      <Pencil d={[[130, 1130], [130, 1390]]} p={p} id={261} />
      <Pencil d={[[430, 1130], [430, 1390]]} p={p} id={262} />
      <Pencil d={[[490, 1235], [630, 1235]]} p={p} id={263} />
      <Pencil d={[[510, 1235], [510, 1390]]} p={p} id={264} />
      <Pencil d={[[610, 1235], [610, 1390]]} p={p} id={265} />
      {/* the plate, the wedge (its layers, a strawberry on top), a teacup */}
      <Ellipse c={[330, 1122]} rx={85} ry={12} p={p} id={266} />
      <Pencil d={[[tip, 1116], [395, 1116], [395, 1030], [tip, 1080 - (tip - 280) * 0.3]]} p={p} id={267} closed />
      <Pencil d={[[tip + 4, 1092], [393, 1080]]} p={p} id={268} w={3} />
      <Pencil d={[[tip + 4, 1068 - (tip - 280) * 0.15], [393, 1056]]} p={p} id={269} w={3} />
      <Circle c={[378, 1016]} r={12} p={p} id={270} w={4} />
      <Pencil d={[[172, 1086], [176, 1124], [222, 1124], [226, 1086]]} p={p} id={271} w={5} />
      <Pencil d={[[226, 1096], [242, 1098], [240, 1112], [224, 1114]]} p={p} id={272} w={3} />
      {/* steam off the tea */}
      <Pencil d={[[190, 1070], [198, 1050], [188, 1030], [196, 1010]]} p={p} id={273} w={3} />
      <Figure q={q} p={p} />
      {/* the fork */}
      <Pencil d={[h, [h[0] - 34, h[1] - 18]]} p={p} id={274} w={4} />
      {/* crumbs */}
      {f >= 14
        ? [0, 1, 2].map((k) => {
            const t = ((f - 14) * 0.05 + k * 0.33) % 1;
            return <Circle key={k} c={[340 + k * 30, 1110 + t * 260]} r={3} p={p} id={275 + k} w={3} />;
          })
        : null}
    </>
  );
};

// 4. Saturday night: a run and a leap into the four-poster
const LIE: Pose = { x: 660, y: 1266, lean: -Math.PI / 2, head: -0.1, ua: [0.15, -0.1], fa: [0.15, -0.1], th: [-Math.PI / 2, -Math.PI / 2 + 0.06], sh: [-Math.PI / 2, -Math.PI / 2 + 0.06] };
const Bed = (f: number, p: number, look: Look, xmas = false) => {
  let q: Pose;
  if (f < 14) q = runPose(f, interpolate(f, [0, 14], [150, 360]));
  else {
    const t = smooth(f, 14, 30);
    const base = mix(runPose(14, 360), LIE, t);
    const dip = f >= 30 && f < 40 ? 10 * Math.sin(((f - 30) / 10) * Math.PI) : 0;
    q = { ...base, y: base.y - 240 * Math.sin(Math.PI * Math.min(1, (f - 14) / 16)) + dip };
  }
  const cover = smooth(f, 32, 42);
  const sag = f >= 30 && f < 40 ? 8 * Math.sin(((f - 30) / 10) * Math.PI) : 0;
  return (
    <>
      {/* the four-poster: posts, a scalloped canopy, its drapes, the mattress, a pillow */}
      <Pencil d={[[470, 1392], [470, 990]]} p={p} id={290} />
      <Pencil d={[[900, 1392], [900, 990]]} p={p} id={291} />
      <Pencil d={[[455, 990], [915, 990]]} p={p} id={292} />
      <Pencil d={Array.from({ length: 19 }, (_, k): Pt => [470 + k * 23.9, 1000 + 22 * Math.abs(Math.sin((k / 18) * Math.PI * 6))])} p={p} id={293} w={4} />
      <Pencil d={[[470, 1000], [500, 1120], [478, 1230]]} p={p} id={294} w={4} />
      <Pencil d={[[900, 1000], [870, 1120], [892, 1230]]} p={p} id={295} w={4} />
      <Pencil d={[[470, 1300 + sag], [900, 1300 + sag]]} p={p} id={296} />
      <Pencil d={[[470, 1340], [900, 1340]]} p={p} id={297} />
      <Ellipse c={[852, 1290 + sag]} rx={42} ry={14} p={p} id={298} />
      {/* a stocking hung on the foot post, waiting */}
      {xmas ? (
        <>
          <Pencil d={[[906, 1040], [906, 1112], [926, 1138], [962, 1138], [964, 1118], [936, 1104], [936, 1040]]} p={p} id={630} w={5} closed />
          <Pencil d={[[906, 1060], [936, 1060]]} p={p} id={631} w={4} />
        </>
      ) : null}
      <Figure q={q} p={p} />
      {/* the cover pulled up over him (paper underneath, so it hides his legs) */}
      {cover > 0 ? (
        <>
          <path d={`M490 ${1300 + sag} L490 ${1236 + sag} L${490 + 330 * cover} ${1236 + sag} L${490 + 330 * cover} ${1300 + sag} Z`} fill={look.paper} />
          <Pencil d={[[490, 1300 + sag], [490, 1238 + sag], [490 + 330 * cover, 1236 + sag], [490 + 330 * cover, 1300 + sag]]} p={p} id={299} w={6} />
          {cover > 0.6 ? <Pencil d={[[520, 1262 + sag], [560, 1270 + sag], [600, 1260 + sag]]} p={p} id={300} w={3} /> : null}
        </>
      ) : null}
      {/* Zzz, drifting up */}
      {f >= 40
        ? [0, 1, 2].map((k) => {
            const t = Math.max(0, (f - 40 - k * 5) / 20);
            return t > 0 ? <Scribble key={k} x={780 + k * 30 + t * 16} y={1190 - k * 50 - t * 60} size={44 + k * 12} o={Math.min(1, t * 3)}>z</Scribble> : null;
          })
        : null}
    </>
  );
};

// the end card on the black card: the line in cream Cormorant, centred, the white CB in the corner
const EndLine: React.FC<{ lines: [string, string] }> = ({ lines }) => {
  const frame = useCurrentFrame();
  const look = React.useContext(LookCtx);
  const p = page(frame);
  const line = progress(frame, FLIP + 4, 18);
  return (
    <AbsoluteFill style={{ backgroundColor: look.bg }}>
      <Paper p={p} />
      <div style={{ position: "absolute", top: 760, width: "100%", textAlign: "center", fontFamily: serif, fontSize: 104,
        lineHeight: 1.12, color: colors.cream, opacity: line, transform: `translateY(${(1 - line) * 22}px)` }}>
        {lines[0]}
        <br />
        {lines[1]}
      </div>
      <Img src={staticFile("brand/cb-watermark.png")} style={{ position: "absolute", left: 920, top: 1452, width: 100, height: 108 }} />
      <LiftShadow />
    </AbsoluteFill>
  );
};

// the party's end card (Scott: "A faultless night, almost", "make it funny like the u or something falls off the
// faultless"): the line comes up, the u works loose, swings on one corner and drops off the card; then "almost"
const FaultlessEnd: React.FC = () => {
  const frame = useCurrentFrame();
  const look = React.useContext(LookCtx);
  const p = page(frame);
  const line = progress(frame, FLIP + 4, 18);
  const loose = progress(frame, 36, 8, (x) => x);
  const swing = loose * (22 + 12 * Math.sin((frame - 36) * 0.55) * Math.exp(-(frame - 36) / 40)); // hangs and swings for a second (Scott: "hold it longer")
  const t = Math.max(0, frame - 68);
  const dy = 1.5 * t * t;
  const almost = progress(frame, 98, 12); // only once the u has gone
  return (
    <AbsoluteFill style={{ backgroundColor: look.bg }}>
      <Paper p={p} />
      <div style={{ position: "absolute", top: 760, width: "100%", textAlign: "center", fontFamily: serif, fontSize: 104, lineHeight: 1.12,
        color: colors.cream, opacity: line, transform: `translateY(${(1 - line) * 22}px)`, whiteSpace: "nowrap" }}>
        A fa
        <span style={{ display: "inline-block", transformOrigin: "100% 12%",
          transform: `translate(${t * 1.6}px, ${dy}px) rotate(${frame >= 68 ? swing + t * 7 : swing}deg)`, opacity: dy > 1100 ? 0 : 1 }}>u</span>
        ltless night,
        <br />
        <span style={{ display: "inline-block", opacity: almost, transform: `translateY(${(1 - almost) * 18}px)` }}>almost</span>
      </div>
      <Img src={staticFile("brand/cb-watermark.png")} style={{ position: "absolute", left: 920, top: 1452, width: 100, height: 108 }} />
      <LiftShadow />
    </AbsoluteFill>
  );
};

const R = "hotels/rowton-hall/screen-time";
const REEL_SCENES = [
  { from: 310, len: 120, el: <Gag time="Friday, 6:15pm" clip={`${R}/welcome-fizz.mp4`} from={FIZZ_FROM} draw={Fizz} /> },
  { from: 430, len: 180, el: <Gag time="Saturday, 10:00am" clip={`${R}/pool-4s.mp4`} from={SPLASH} draw={Pool} ground={[60, 540]} /> },
  { from: 610, len: 120, el: <Gag time="Saturday, 3:30pm" clip={`${R}/cake-by-the-fire.mp4`} from={[340, 1075]} draw={Cake} /> },
  { from: 730, len: 120, el: <Gag time="Saturday, 11:00pm" clip={`${R}/four-poster.mp4`} from={[852, 1280]} draw={Bed} /> },
];
type Scene = { from: number; len: number; el: React.ReactNode };
// `skip` starts the opening that many frames in (the music with it); with no `end` the last scene holds to the
// last frame instead of lifting away to an end card; `over` sits on top of everything (the TikTok cut's text)
const StickFilm: React.FC<{
  look: "pad" | "gold"; xmas?: boolean; scenes: Scene[]; endAt?: number; frames: number; end?: [string, string]; skip?: number; over?: React.ReactNode;
  endEl?: React.ReactNode; // an end card of its own in place of the two plain lines
  track?: string; // another track in place of Funkee Monkeee, played from frame `musicAt` of its file
  musicAt?: number; // with it there is no office opening: the film is its scenes, the track from this frame of its file
}> = ({ look: lookId, xmas, scenes, endAt, frames, end, skip = 0, over, musicAt, endEl, track }) => (
  <LookCtx.Provider value={LOOKS[lookId]}>
  <XmasCtx.Provider value={Boolean(xmas)}>
    <AbsoluteFill style={{ backgroundColor: LOOKS[lookId].bg }}>
      {/* each page comes in FLIP frames early, under the one lifting away; the earlier page drawn on top */}
      {end && endAt !== undefined ? (
        <Sequence from={endAt - FLIP}>
          {endEl ?? <EndLine lines={end} />}
        </Sequence>
      ) : null}
      {[...scenes].reverse().map((s, k) => (
        <Sequence key={s.from} from={s.from - FLIP} durationInFrames={s.len + FLIP}>
          {!end && k === 0 ? s.el : <FlipOut total={s.len + FLIP}>{s.el}</FlipOut>}
        </Sequence>
      ))}
      {musicAt === undefined ? (
        <Sequence from={-skip} durationInFrames={310}>
          <FlipOut total={310}>
            <StickFlip look={lookId} xmas={xmas} bare />
          </FlipOut>
        </Sequence>
      ) : null}
      <Audio
        src={staticFile(track ?? MUSIC)}
        trimBefore={musicAt ?? Math.round(MUSIC_FROM * 30) + skip}
        volume={(v) => interpolate(v, [0, 6, frames - (end ? 30 : 14), frames], [0, 1, 1, 0], { extrapolateRight: "clamp" })}
      />
      <FilmFinish />
      {over}
    </AbsoluteFill>
  </XmasCtx.Provider>
  </LookCtx.Provider>
);

export const STICK_REEL_FRAMES = 970;
export const StickReel: React.FC<{ look?: "pad" | "gold" }> = ({ look = "gold" }) => (
  <StickFilm look={look} scenes={REEL_SCENES} endAt={850} frames={STICK_REEL_FRAMES} end={["Out of office", "till Monday"]} />
);

// ---------------------------------------------------------------------------------------------
// The TikTok cut (Scott, 16 Nov: a separate TikTok grid, "tik tok text"): the same film made native. A text hook
// on frame one in TikTok's own caption look (white bold sans on black pills, top third, clear of the app's right
// rail and caption area), the slump trimmed to a second so the lightbulb comes quickly, three gags (fizz, pool,
// bed; the cake out), no end card and no logo: the line sits over the last page and its shot. 23.3s. The page's
// handwritten timestamps stay. Scenes still fall on the track's downbeats.
// The TikTok caption style, fixed (Scott, 17 Nov: "once we go with it it needs to be consistent"): white Figtree
// Bold 60px on black rounded blocks, lower case, at most two short lines, always baked in (never added in the app,
// whose own font differs); over a full-frame picture its top sits at TT_TOP, above a card at TT_TOP_CARD.
export const TT_TOP = 470;
export const TT_TOP_CARD = 196;
const TIKTOK = "Figtree";
loadFont({ family: TIKTOK, url: staticFile("fonts/Figtree-Bold.woff2"), weight: "700" });
export const TikTokText: React.FC<{ lines: string[]; top: number; left?: number; out?: number; still?: boolean }> = ({ lines, top, left = 90, out, still }) => {
  const frame = useCurrentFrame();
  const gone = out === undefined ? 0 : progress(frame, out, 5);
  return (
    <div style={{ position: "absolute", top, left, width: 800, display: "flex", flexDirection: "column", alignItems: "center", gap: 0, opacity: 1 - gone }}>
      {lines.map((l, k) => {
        const t = still ? 1 : progress(frame, k * 3, 6); // the hook is there on frame one (the feed's preview)
        return (
          <div key={k} style={{ fontFamily: TIKTOK, fontWeight: 700, fontSize: 60, lineHeight: 1, color: "#fff", background: "#000",
            padding: "17px 26px 19px", borderRadius: 16, marginTop: k ? -6 : 0, opacity: Math.min(1, t * 2),
            transform: `scale(${0.86 + 0.14 * t + 0.05 * Math.sin(Math.PI * t)})` }}>
            {l}
          </div>
        );
      })}
    </div>
  );
};
const TT_SKIP = 30;
const TT_SCENES = [
  { from: 280, len: 120, el: <Gag time="Friday, 6:15pm" clip={`${R}/welcome-fizz.mp4`} from={FIZZ_FROM} draw={Fizz} /> },
  { from: 400, len: 180, el: <Gag time="Saturday, 10:00am" clip={`${R}/pool-4s.mp4`} from={SPLASH} draw={Pool} ground={[60, 540]} /> },
  { from: 580, len: 120, el: <Gag time="Saturday, 11:00pm" clip={`${R}/four-poster.mp4`} from={[852, 1280]} draw={Bed} /> },
];
export const STICK_TIKTOK_FRAMES = 700;
export const StickTikTok: React.FC = () => (
  <StickFilm look="gold" scenes={TT_SCENES} frames={STICK_TIKTOK_FRAMES} skip={TT_SKIP}
    over={
      <>
        <Sequence durationInFrames={67} layout="none">
          <TikTokText lines={["POV: it\u2019s 4:59pm", "on a Friday"]} top={440} left={280} out={62} still />
        </Sequence>
        <Sequence from={614} layout="none">
          <TikTokText lines={["out of office", "till Monday"]} top={420} />
        </Sequence>
      </>
    } />
);

// ---------------------------------------------------------------------------------------------
// The first event tie-in for TikTok (Scott, 16 Nov: "sports events and music events where our hotels are", "do
// one"): race day at Silverstone, Whittlebury Park next door. The hook on frame one over him waving a chequered
// flag as the cars go by; five o'clock, everyone else in the car park queue while he jogs past it, opening into
// the hotel; then the evening as the Rowton gags on Whittlebury's photos (pool, fizz like a podium, bed), "and
// it's lights out". No race logos, footage or names beyond the place. Funkee Monkeee from 56.02s, a scene a bar
// or two. Stills, since there is no Whittlebury footage in the repo.
const raceCar = (cx: number, p: number, id: number, look: Look, lines = true) => (
  <>
    <Pencil d={[[cx - 140, 1356], [cx - 122, 1318], [cx - 30, 1312], [cx - 8, 1288], [cx + 34, 1288], [cx + 52, 1318], [cx + 150, 1338], [cx + 176, 1358], [cx - 140, 1358]]} p={p} id={id} w={6} closed />
    <Pencil d={[[cx - 156, 1276], [cx - 104, 1276]]} p={p} id={id + 1} w={6} />
    <Pencil d={[[cx - 130, 1276], [cx - 126, 1318]]} p={p} id={id + 2} w={5} />
    <Pencil d={[[cx + 150, 1362], [cx + 196, 1362]]} p={p} id={id + 3} w={5} />
    <circle cx={cx - 92} cy={1364} r={27} fill={look.paper} />
    <circle cx={cx + 88} cy={1364} r={27} fill={look.paper} />
    <Circle c={[cx - 92, 1364]} r={27} p={p} id={id + 4} w={6} />
    <Circle c={[cx + 88, 1364]} r={27} p={p} id={id + 5} w={6} />
    <Circle c={[cx + 12, 1280]} r={17} p={p} id={id + 6} w={5} />
    {lines
      ? [[1296, 150], [1328, 210], [1352, 120]].map(([y, len], k) => (
          <Pencil key={k} d={[[cx - 190, y], [cx - 190 - len, y]]} p={p} id={id + 7 + k} w={4} />
        ))
      : null}
  </>
);
const FLAG_A: Pose = { x: 300, y: 1208, lean: 0.04, head: 0.1, ua: [2.3, -0.25], fa: [2.6, -0.15], th: [0.12, -0.12], sh: [0, 0] };
const FLAG_B: Pose = { x: 300, y: 1208, lean: -0.04, head: 0.2, ua: [2.75, 0.5], fa: [3.0, 1.2], th: [0.12, -0.12], sh: [0, 0] };
const PASSES = [6, 66, 78]; // when a car comes into the page
const Race = (f: number, p: number, look: Look) => {
  const wave = (1 - Math.cos((f / 15) * Math.PI * 2)) / 2; // a wave of the flag a beat
  // a hop as each car goes by
  const hop = PASSES.reduce((h, t) => Math.max(h, f >= t + 4 && f < t + 16 ? Math.sin(((f - t - 4) / 12) * Math.PI) : 0), 0);
  const q0 = mix(FLAG_A, FLAG_B, wave);
  const q: Pose = { ...q0, y: q0.y - 46 * hop, th: [0.12 + 0.25 * hop, -0.12 - 0.25 * hop], sh: [-0.3 * hop, -0.5 * hop] };
  const h = hand(q, 0);
  const tilt = -0.35 + 0.7 * wave; // the stick swings with the arm
  const top: Pt = [h[0] + Math.sin(tilt) * 190, h[1] - Math.cos(tilt) * 190];
  // the flag: four by three squares flying off the top of the stick, rippling
  const cell = (i: number, k: number): Pt => {
    const fl = 0.5 + 0.5 * Math.sin(f * 0.5 - i * 0.9);
    return [top[0] + Math.sin(tilt) * -k * 34 + Math.cos(tilt) * i * 40, top[1] + Math.cos(tilt) * k * 34 + Math.sin(tilt) * i * 40 + i * 5 * fl];
  };
  return (
    <>
      {/* the far kerb */}
      <Pencil d={Array.from({ length: 12 }, (_, k): Pt => [60 + k * 86, 1180 + (k % 2) * 3])} p={p} id={640} w={3} />
      <Figure q={q} p={p} />
      <Pencil d={[h, top]} p={p} id={641} w={5} />
      {[0, 1, 2, 3].flatMap((i) => [0, 1, 2].map((k) =>
        (i + k) % 2 === 0 ? (
          <path key={`${i}-${k}`} d={`M${cell(i, k).join(" ")} L${cell(i + 1, k).join(" ")} L${cell(i + 1, k + 1).join(" ")} L${cell(i, k + 1).join(" ")} Z`} fill={look.ink} opacity={0.9} />
        ) : null))}
      <Pencil d={[cell(0, 0), cell(4, 0), cell(4, 3), cell(0, 3)]} p={p} id={642} w={4} closed />
      {/* the cars, through in under half a second each */}
      {PASSES.map((t, k) => {
        const cx = -260 + (f - t) * 84;
        return f >= t && f < t + 20 ? <g key={k} transform={`translate(${cx} 1392) scale(1.4) translate(${-cx} -1392)`}>{raceCar(cx, p, 650 + k * 12, look)}</g> : null;
      })}
    </>
  );
};
const boxCar = (c: number, dy: number, p: number, id: number, look: Look) => (
  <>
    <rect x={c - 104} y={1296 + dy} width={208} height={70} fill={look.paper} />
    <Pencil d={[[c - 104, 1300 + dy], [c + 104, 1300 + dy], [c + 108, 1366 + dy], [c - 106, 1366 + dy]]} p={p} id={id} w={6} closed />
    <Pencil d={[[c - 66, 1300 + dy], [c - 44, 1246 + dy], [c + 36, 1246 + dy], [c + 64, 1300 + dy]]} p={p} id={id + 1} w={6} />
    <Pencil d={[[c - 4, 1248 + dy], [c - 4, 1298 + dy]]} p={p} id={id + 2} w={3} />
    <circle cx={c - 60} cy={1368} r={23} fill={look.paper} />
    <circle cx={c + 60} cy={1368} r={23} fill={look.paper} />
    <Circle c={[c - 60, 1368]} r={23} p={p} id={id + 3} w={6} />
    <Circle c={[c + 60, 1368]} r={23} p={p} id={id + 4} w={6} />
  </>
);
const QUEUE = [170, 500, 830];
const WALK_TO: Pt = [900, 1150];
const Traffic = (f: number, p: number, look: Look) => {
  const q = runPose(f * 0.85, interpolate(f, [0, 56], [140, WALK_TO[0]], { extrapolateRight: "clamp" }));
  return (
    <>
      {QUEUE.map((c, k) => (
        <g key={k} transform={`translate(${c} 1392) scale(1.5) translate(${-c} -1392)`}>
          {boxCar(c, 2 * Math.sin(f * 1.3 + k * 2), p, 700 + k * 8, look)}
          {/* exhaust, puffing up behind each one */}
          {[0, 1, 2].map((n) => {
            const t = (f * 0.03 + n * 0.33 + k * 0.2) % 1;
            return <Circle key={n} c={[c - 126 - t * 26, 1350 - t * 110]} r={7 + t * 12} p={p} id={724 + k * 3 + n} w={3} />;
          })}
        </g>
      ))}
      {/* a horn from the middle car, on the beat */}
      {f % 30 < 12
        ? [-0.5, 0, 0.5].map((a, i) => (
            <Pencil key={i} d={[[QUEUE[1] + Math.sin(a) * 30, 1150 - Math.cos(a) * 30], [QUEUE[1] + Math.sin(a) * 66, 1150 - Math.cos(a) * 66]]} p={p} id={740 + i} w={4} />
          ))
        : null}
      <Figure q={q} p={p} />
    </>
  );
};
const WP = "hotels/whittlebury-park";
const RACE_SCENES = [
  { from: 0, len: 120, el: <Gag time="Sunday, 3:00pm" from={[0, 0]} draw={Race} /> },
  { from: 120, len: 180, el: <Gag time="Sunday, 5:00pm" still={`${WP}/exterior.jpg`} pos="33% 50%" from={WALK_TO} draw={Traffic} /> },
  { from: 300, len: 120, el: <Gag time="Sunday, 5:45pm" still={`${WP}/pool.jpg`} pos="49% 50%" from={SPLASH} draw={Pool} ground={[60, 540]} /> },
  { from: 420, len: 120, el: <Gag time="Sunday, 7:30pm" still={`${WP}/murrays-dish-2x.jpg`} pos="62% 50%" from={FIZZ_FROM} draw={Fizz} /> },
  { from: 540, len: 120, el: <Gag time="Sunday, 10:30pm" still={`${WP}/room.jpg`} pos="40% 50%" from={[852, 1280]} draw={Bed} /> },
];
// the house label over the hotel's first shot: the place in gold caps, underlined, the name in cream Cormorant
const PlaceLabel: React.FC<{ place: string; name: string; len: number; strong?: boolean }> = ({ place, name, len, strong }) => {
  const frame = useCurrentFrame();
  const o = progress(frame, 0, 12) * (1 - progress(frame, len - 10, 8));
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ background: strong
        ? "linear-gradient(to bottom, rgba(9,9,10,0) 44%, rgba(9,9,10,0.82) 70%, rgba(9,9,10,0.7) 100%)"
        : "linear-gradient(to bottom, rgba(9,9,10,0) 52%, rgba(9,9,10,0.55) 74%, rgba(9,9,10,0.3) 100%)" }} />
      <div style={{ position: "absolute", left: 72, bottom: 500 }}>
        <div style={{ display: "inline-block" }}>
          <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 28, letterSpacing: "0.24em", color: colors.gold }}>{place}</div>
        </div>
        <div style={{ fontFamily: serif, fontSize: 64, lineHeight: 1.1, marginTop: 14, color: colors.cream }}>{name}</div>
      </div>
    </AbsoluteFill>
  );
};
export const STICK_RACE_FRAMES = 660;
export const StickRaceDay: React.FC = () => (
  <StickFilm look="gold" scenes={RACE_SCENES} frames={STICK_RACE_FRAMES} musicAt={Math.round(56.02 * 30)}
    over={
      <>
        <Sequence durationInFrames={105} layout="none">
          <TikTokText lines={["POV: your hotel is", "next door to Silverstone"]} top={440} left={140} out={100} still />
        </Sequence>
        <Sequence from={126} durationInFrames={56} layout="none">
          <TikTokText lines={["everyone else:", "the car park queue"]} top={440} left={140} out={51} />
        </Sequence>
        <Sequence from={198} durationInFrames={94} layout="none">
          <PlaceLabel place="NORTHAMPTONSHIRE" name="Whittlebury Park" len={94} />
          <TikTokText lines={["you: already checked in"]} top={440} left={140} out={86} />
        </Sequence>
        <Sequence from={576} layout="none">
          <TikTokText lines={["and it\u2019s lights out"]} top={440} left={140} />
        </Sequence>
      </>
    } />
);

// ---------------------------------------------------------------------------------------------
// The Christmas office party, a draft (Scott: "do a draft Christmas one, then we can adapt later"; a work
// do with the farce in the drawings and the hotels calm in the footage, Fawlty Towers in tone only): the
// office under a snow cloud on the party night (Fri 20 Nov, Scott), the run to the hotel; a cracker
// pulled so hard he lands on his bum, the crown dropping onto his head (Fairlawns' crackers); the turkey
// shooting off the platter as he carves (Hogarths' chef plating); a kick on the dance floor that sends his
// shoe to the top of the tree (Ramside's tree, up to its star); the morning after in a clawfoot bath with
// a rubber duck (the Ramside treehouse's copper bath); "Leave the party / to us". The music is the Rowton
// reel's for now: the Christmas cut wants its own festive track.

const mirror = (q: Pose, x = q.x): Pose => ({
  x, y: q.y, lean: -q.lean, head: -q.head,
  ua: [-q.ua[0], -q.ua[1]], fa: [-q.fa[0], -q.fa[1]], th: [-q.th[0], -q.th[1]], sh: [-q.sh[0], -q.sh[1]],
});
const headOf = (q: Pose): Pt => {
  const neck = at([q.x, q.y], Math.PI + q.lean, L.torso);
  return at(neck, Math.PI + q.lean + q.head, L.head + 6);
};
const rot = (pts: Pt[], c: Pt, a: number): Pt[] =>
  pts.map(([x, y]) => [c[0] + x * Math.cos(a) - y * Math.sin(a), c[1] + x * Math.sin(a) + y * Math.cos(a)]);
const CROWN: Pt[] = [[-38, 0], [-38, -34], [-19, -14], [0, -38], [19, -14], [38, -34], [38, 0]];

// 1. The crackers
const PULL: Pose = { x: 400, y: 1215, lean: 0.35, head: -0.1, ua: [1.45, 1.3], fa: [1.55, 1.4], th: [0.35, -0.2], sh: [0.15, -0.35] };
const BUM: Pose = { x: 320, y: 1366, lean: 0.4, head: -0.2, ua: [-0.5, -0.3], fa: [-0.4, -0.2], th: [1.5, 1.35], sh: [1.6, 1.45] };
const BANG = 20;
// kept for when Stone Manor's festive clips arrive (a cracker pulled, a tree for the shoe)
export const Crackers = (f: number, p: number) => {
  const tug = f < BANG ? 10 * Math.sin(f * 0.9) : 0;
  const t = smooth(f, BANG, BANG + 9);
  const me0: Pose = { ...PULL, x: PULL.x + tug };
  const me = mix(me0, BUM, t);
  const meQ = { ...me, y: me.y - 70 * Math.sin(Math.PI * t) * (1 - t) };
  const them = mix(mirror(PULL, 700 + tug), mirror(STAND, 760), smooth(f, BANG, BANG + 10));
  const hA = hand(meQ, 0);
  const hB = hand(them, 0);
  const burst: Pt = [(hand(me0, 0)[0] + hand(mirror(PULL, 700), 0)[0]) / 2, hand(me0, 0)[1]];
  // the crown: up out of the bang, turning, down onto his head
  const ct = Math.min(1, Math.max(0, (f - (BANG + 2)) / 22));
  const head = headOf(meQ);
  const top: Pt = [head[0], head[1] - L.head + 6];
  const cpos: Pt = f >= BANG + 24 ? top : [burst[0] + (top[0] - burst[0]) * ct, burst[1] + (top[1] - burst[1]) * ct - 300 * Math.sin(Math.PI * ct)];
  const tube = (a: Pt, b: Pt, id: number) => {
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const n: Pt = [-Math.sin(ang) * 13, Math.cos(ang) * 13];
    return <Pencil d={[[a[0] + n[0], a[1] + n[1]], [b[0] + n[0], b[1] + n[1]], [b[0] - n[0], b[1] - n[1]], [a[0] - n[0], a[1] - n[1]]]} p={p} id={id} w={5} closed />;
  };
  const toward = (a: Pt, b: Pt, len: number): Pt => {
    const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    return [a[0] + ((b[0] - a[0]) / d) * len, a[1] + ((b[1] - a[1]) / d) * len];
  };
  return (
    <>
      <Figure q={meQ} p={p} />
      <Figure q={them} p={p} />
      {f < BANG ? tube(hA, hB, 310) : (
        <>
          {tube(hA, toward(hA, [hA[0] + 80, hA[1] - 30], 70), 311)}
          {tube(hB, toward(hB, [hB[0] - 80, hB[1] - 30], 70), 312)}
        </>
      )}
      {/* the bang: lines flung out of the middle */}
      {f >= BANG && f < BANG + 12
        ? Array.from({ length: 9 }, (_, k) => {
            const a = (k / 9) * Math.PI * 2;
            const r0 = 16 + (f - BANG) * 6;
            return <Pencil key={k} d={[[burst[0] + Math.cos(a) * r0, burst[1] + Math.sin(a) * r0], [burst[0] + Math.cos(a) * (r0 + 34), burst[1] + Math.sin(a) * (r0 + 34)]]} p={p} id={320 + k} w={5} />;
          })
        : null}
      {f >= BANG + 2 ? <Pencil d={rot(CROWN, cpos, f >= BANG + 24 ? meQ.lean * 0.4 : (1 - ct) * 4)} p={p} id={330} w={5} closed /> : null}
    </>
  );
};

// 2. Carving
const CARVE_R: Pose = { x: 0, y: 1208, lean: -0.15, head: 0.15, ua: [1.1, 0.9], fa: [1.7, 1.4], th: [0.1, -0.1], sh: [0, 0] };
const SHOCK_R: Pose = { x: 0, y: 1204, lean: 0.18, head: -0.1, ua: [2.5, -2.4], fa: [2.9, -2.8], th: [0.2, -0.15], sh: [0.05, -0.2] };
const FLY = 18;
const Carving = (f: number, p: number) => {
  const saw = f < FLY ? 0.28 * Math.sin(f * 1.5) : 0;
  const base = mix(CARVE_R, SHOCK_R, smooth(f, FLY + 2, FLY + 8));
  const r: Pose = { ...base, ua: [base.ua[0] + saw, base.ua[1]], fa: [base.fa[0] + saw, base.fa[1]] };
  const q = mirror(r, 770); // facing the table on the left
  const h0 = hand(q, 0);
  const h1 = hand(q, 1);
  const tt = Math.max(0, (f - FLY) / 22);
  const tc: Pt = f < FLY ? [420, 1100] : [420 - 760 * tt, 1100 - 420 * tt + 380 * tt * tt];
  const spin = f < FLY ? 0 : tt * 7;
  const turkey: Pt[] = Array.from({ length: 15 }, (_, k): Pt => {
    const a = Math.PI + (k / 14) * Math.PI;
    return [Math.cos(a) * 80, Math.sin(a) * 46 + 10];
  });
  return (
    <>
      <Pencil d={[[180, 1150], [640, 1150]]} p={p} id={340} />
      <Pencil d={[[200, 1150], [200, 1390]]} p={p} id={341} />
      <Pencil d={[[620, 1150], [620, 1390]]} p={p} id={342} />
      <Ellipse c={[420, 1140]} rx={115} ry={14} p={p} id={343} />
      {/* the Christmas pudding beside it, its sauce and a sprig of holly */}
      <Pencil d={Array.from({ length: 13 }, (_, k): Pt => [240 - 46 * Math.cos((k / 12) * Math.PI), 1148 - 50 * Math.sin((k / 12) * Math.PI)])} p={p} id={640} w={6} />
      <Pencil d={[[202, 1120], [214, 1128], [226, 1118], [240, 1130], [254, 1118], [266, 1128], [278, 1120]]} p={p} id={641} w={4} />
      <Ellipse c={[228, 1090]} rx={16} ry={7} p={p} id={642} w={3} />
      <Ellipse c={[254, 1090]} rx={16} ry={7} p={p} id={643} w={3} />
      <Circle c={[241, 1088]} r={6} p={p} id={644} w={3} />
      <Circle c={[242, 1100]} r={6} p={p} id={645} w={3} />
      {tt < 1 ? (
        <>
          <Pencil d={rot(turkey, tc, spin)} p={p} id={344} w={6} closed />
          <Pencil d={rot([[60, -10], [100, -40]], tc, spin)} p={p} id={345} w={6} />
          <Pencil d={rot([[40, -24], [76, -58]], tc, spin)} p={p} id={346} w={6} />
          <Circle c={rot([[104, -46]], tc, spin)[0]} r={9} p={p} id={347} w={4} />
          <Circle c={rot([[80, -64]], tc, spin)[0]} r={9} p={p} id={348} w={4} />
        </>
      ) : null}
      {/* where it went: speed lines off the platter */}
      {f >= FLY && f < FLY + 14
        ? [0, 1, 2].map((k) => (
            <Pencil key={k} d={[[440 + k * 20, 1080 + k * 22], [520 + k * 20, 1072 + k * 22]]} p={p} id={350 + k} w={4} />
          ))
        : null}
      <Figure q={q} p={p} />
      {/* the carving knife and fork */}
      <Pencil d={[h0, [h0[0] - 52, h0[1] + 14]]} p={p} id={355} w={4} />
      <Pencil d={[h1, [h1[0] - 30, h1[1] + 6]]} p={p} id={356} w={4} />
    </>
  );
};

// 3. The dance floor
const DISCO_A: Pose = { x: 430, y: 1208, lean: 0.05, head: -0.15, ua: [2.6, -0.5], fa: [2.75, -1.2], th: [0.3, -0.12], sh: [0.05, -0.12] };
const DISCO_B: Pose = { x: 430, y: 1208, lean: -0.05, head: 0.15, ua: [0.5, -2.6], fa: [1.2, -2.75], th: [0.12, -0.3], sh: [0.12, -0.05] };
const KICK: Pose = { x: 420, y: 1200, lean: 0.3, head: 0.1, ua: [1.9, -1.9], fa: [2.2, -2.2], th: [1.65, -0.05], sh: [1.75, -0.05] };
const WOBBLE: Pose = { x: 420, y: 1208, lean: 0.12, head: 0.3, ua: [1.6, -1.7], fa: [1.3, -1.4], th: [0.05, -0.05], sh: [-1.2, 0] };
const TREE_TOP: Pt = [830, 940];
export const Dance = (f: number, p: number) => {
  let q: Pose;
  if (f < 30) {
    const w = (1 - Math.cos((f / 15) * Math.PI * 2)) / 2; // a move every half beat
    q = mix(DISCO_A, DISCO_B, w);
    q = { ...q, y: q.y + 10 * Math.abs(Math.sin((f / 7.5) * Math.PI)) };
  } else if (f < 40) q = mix(DISCO_A, KICK, smooth(f, 30, 37));
  else q = mix(KICK, WOBBLE, smooth(f, 40, 47));
  // the shoe: off his kicking foot and up onto the top of the tree
  const knee = at([KICK.x, KICK.y], KICK.th[0], L.thigh);
  const foot = at(knee, KICK.sh[0], L.shin);
  const st = Math.min(1, Math.max(0, (f - 37) / 14));
  const shoe: Pt = f < 37 ? foot : [foot[0] + (TREE_TOP[0] - foot[0]) * st, foot[1] + (TREE_TOP[1] - 14 - foot[1]) * st - 260 * Math.sin(Math.PI * st)];
  const tier = (y0: number, y1: number, half: number, id: number) => <Pencil d={[[830, y0], [830 - half, y1], [830 + half, y1]]} p={p} id={id} closed />;
  return (
    <>
      {/* the tree, its baubles, its star */}
      {tier(950, 1110, 85, 360)}
      {tier(1030, 1220, 100, 361)}
      {tier(1120, 1340, 115, 362)}
      <Pencil d={[[815, 1340], [815, 1392]]} p={p} id={363} w={5} />
      <Pencil d={[[845, 1340], [845, 1392]]} p={p} id={364} w={5} />
      {[[800, 1090], [865, 1160], [790, 1290], [880, 1300], [835, 1210]].map((c, k) => (
        <Circle key={k} c={c as Pt} r={9} p={p} id={365 + k} w={4} />
      ))}
      <Pencil d={Array.from({ length: 11 }, (_, k): Pt => {
        const a = -Math.PI / 2 + (k / 10) * Math.PI * 2;
        const r = k % 2 ? 11 : 26;
        return [830 + Math.cos(a) * r, 936 + Math.sin(a) * r];
      })} p={p} id={370} w={4} />
      <Figure q={q} p={p} />
      {f >= 30 ? (
        <>
          <Ellipse c={shoe} rx={22} ry={10} p={p} id={371} w={5} />
          <Pencil d={[[shoe[0] - 18, shoe[1] - 6], [shoe[0] - 18, shoe[1] - 22], [shoe[0] - 2, shoe[1] - 22]]} p={p} id={372} w={4} />
        </>
      ) : null}
    </>
  );
};

// 4. The morning after: a clawfoot bath, foam and a rubber duck
const RECLINE: Pose = { x: 520, y: 1300, lean: 0.95, head: 0.35, ua: [-0.4, -0.2], fa: [0.6, 0.3], th: [1.3, 1.2], sh: [2.35, 2.25] };
const Bath = (f: number, p: number, look: Look) => {
  let q: Pose;
  if (f < 16) q = runPose(f * 0.6, interpolate(f, [0, 16], [150, 290]));
  else {
    const t = smooth(f, 16, 30);
    const b = mix(runPose(16 * 0.6, 290), RECLINE, t);
    q = { ...b, y: b.y - 220 * Math.sin(Math.PI * Math.min(1, (f - 16) / 14)) };
  }
  const tub = "M330 1250 L345 1320 Q360 1355 410 1358 L680 1358 Q730 1355 745 1320 L760 1250 Z";
  const foam = f >= 28;
  const splash = smooth(f, 28, 40);
  const bob = 4 * Math.sin(f * 0.25);
  return (
    <>
      <Figure q={q} p={p} />
      {/* the tub in front of him: paper inside its outline hides what is under the water */}
      <path d={tub} fill={look.paper} />
      <Pencil d={[[322, 1250], [768, 1250]]} p={p} id={380} w={6} />
      <Pencil d={[[330, 1252], [345, 1320], [372, 1350], [410, 1358], [680, 1358], [718, 1350], [745, 1320], [760, 1252]]} p={p} id={381} />
      <Pencil d={[[395, 1356], [378, 1392]]} p={p} id={382} w={5} />
      <Pencil d={[[695, 1356], [712, 1392]]} p={p} id={383} w={5} />
      {/* foam along the rim, bubbles flung up by the splash, then drifting */}
      {foam
        ? [340, 378, 420, 600, 645, 690, 732].map((x, k) => <Circle key={k} c={[x, 1238 - (k % 2) * 8]} r={15 + (k % 3) * 4} p={p} id={384 + k} w={4} />)
        : null}
      {f >= 28 && f < 44
        ? [-0.9, -0.4, 0.2, 0.7, 1.1].map((a, k) => {
            const r = 30 + splash * 170;
            return <Circle key={k} c={[545 + Math.sin(a) * r, 1240 - Math.cos(a) * r * 0.9]} r={8 + (k % 2) * 4} p={p} id={392 + k} w={3} />;
          })
        : null}
      {f >= 40
        ? [0, 1, 2].map((k) => {
            const t = ((f - 40) * 0.04 + k * 0.33) % 1;
            return <Circle key={k} c={[470 + k * 70 + 8 * Math.sin(f * 0.2 + k), 1210 - t * 240]} r={7 + k * 2} p={p} id={398 + k} w={3} />;
          })
        : null}
      {/* the rubber duck */}
      {foam ? (
        <>
          <Ellipse c={[540, 1228 + bob]} rx={28} ry={14} p={p} id={402} w={4} />
          <Circle c={[560, 1200 + bob]} r={13} p={p} id={403} w={4} />
          <Pencil d={[[572, 1198 + bob], [588, 1202 + bob], [572, 1206 + bob]]} p={p} id={404} w={3} />
          <SantaHat c={[560, 1200 + bob]} a={-0.2} p={p} sc={0.32} />
        </>
      ) : null}
    </>
  );
};

// a wine glass at `c` (its rim's centre), tilted `ang`
const glass = (c: Pt, ang: number, sc = 1): Pt[][] => {
  const R = (pts: Pt[]) => rot(pts.map(([x, y]) => [x * sc, y * sc] as Pt), c, ang);
  return [R([[-11, 0], [-9, 14], [0, 20], [9, 14], [11, 0]]), R([[0, 20], [0, 42]]), R([[-9, 42], [9, 42]])];
};

// 1. Drinks: a tray of glasses held high, wobbling, then everywhere
const CARRY: Pose = { x: 0, y: 1208, lean: -0.05, head: -0.1, ua: [2.5, -0.6], fa: [3.0, -0.2], th: [0, 0], sh: [0, 0] };
const TRIP: Pose = { x: 0, y: 1240, lean: -0.75, head: 0.3, ua: [1.7, 1.2], fa: [1.9, 1.5], th: [0.6, -0.5], sh: [0.1, -1.3] };
const SPILL = 22;
const TRAY_FROM: Pt = [620, 900];
const Tray = (f: number, p: number) => {
  const x = interpolate(f, [0, SPILL + 6], [200, 470], { extrapolateRight: "clamp" });
  const walk = runPose(f * 0.55, x);
  const carry: Pose = { ...walk, lean: -0.05, head: -0.1, ua: [CARRY.ua[0], walk.ua[1] * 0.5], fa: [CARRY.fa[0], walk.fa[1] * 0.5], y: 1200 + (walk.y - 1194) * 0.5 };
  const q = f < SPILL ? carry : mix(carry, { ...TRIP, x: x + 20 }, smooth(f, SPILL, SPILL + 6));
  const h = hand(f < SPILL ? carry : q, 0);
  const wob = f < SPILL ? 0.1 * Math.sin(f * 0.9) * (f / SPILL) : 0;
  const tray: Pt[] = rot([[-70, 0], [70, 0]], [h[0] + 10, h[1] - 6], wob);
  const start = (k: number): Pt => [h[0] - 45 + k * 30, h[1] - 36];
  return (
    <>
      <Figure q={q} p={p} />
      {f < SPILL + 4 ? <Pencil d={tray} p={p} id={410} w={6} /> : null}
      {/* the mistletoe he walks under */}
      <Pencil d={[[560, 560], [560, 740]]} p={p} id={650} w={3} />
      <Pencil d={rot([[-30, 0], [0, 10], [30, 0], [0, -6]], [560, 752], 0.5)} p={p} id={651} w={4} closed />
      <Pencil d={rot([[-30, 0], [0, 10], [30, 0], [0, -6]], [560, 752], -0.5)} p={p} id={652} w={4} closed />
      {[[552, 772], [568, 772], [560, 784]].map((c, k) => <Circle key={k} c={c as Pt} r={6} p={p} id={653 + k} w={3} />)}
      {/* the glasses: riding the tray, then flung off in arcs, landing in a heap of lines */}
      {[0, 1, 2, 3].map((k) => {
        const t = Math.max(0, (f - SPILL - k) / 18);
        if (t >= 1) return null;
        const s0 = start(k);
        const c: Pt = f < SPILL ? rot([[s0[0] - h[0] - 10, s0[1] - h[1] + 6]], [h[0] + 10, h[1] - 6], wob)[0]
          : [s0[0] + (60 + k * 50) * t, s0[1] - 220 * Math.sin(Math.PI * t) * (0.7 + k * 0.15) + (1392 - 40 - s0[1]) * t];
        return glass(c, f < SPILL ? wob : t * (4 + k), 1).map((d, i) => <Pencil key={`${k}-${i}`} d={d} p={p} id={420 + k * 3 + i} w={4} />);
      })}
      {f >= SPILL + 16
        ? Array.from({ length: 7 }, (_, k) => {
            const a = -Math.PI + (k / 6) * Math.PI;
            const cx = 640 + (k % 3) * 40;
            return <Pencil key={k} d={[[cx + Math.cos(a) * 18, 1388 + Math.sin(a) * 18], [cx + Math.cos(a) * 44, 1388 + Math.sin(a) * 44]]} p={p} id={440 + k} w={4} />;
          })
        : null}
    </>
  );
};

// 3. The toast: a fork on a glass, the glass raised, then it shatters
const TOAST_R: Pose = { x: 0, y: 1208, lean: 0, head: -0.05, ua: [1.0, 0.7], fa: [2.3, 1.6], th: [0.05, -0.05], sh: [0, 0] };
const RAISE_R: Pose = { x: 0, y: 1204, lean: 0.08, head: -0.2, ua: [2.4, 0.7], fa: [2.9, 1.6], th: [0.05, -0.05], sh: [0, 0] };
const SHRUG_R: Pose = { x: 0, y: 1208, lean: 0.05, head: 0.25, ua: [1.2, -1.2], fa: [2.4, -2.4], th: [0.08, -0.08], sh: [0, 0] };
const POP = 28;
const TOAST_FROM: Pt = [640, 880];
const Toast = (f: number, p: number) => {
  const tap = f < 14 ? 0.12 * Math.sin(f * 2.2) : 0;
  let r = f < 14 ? TOAST_R : mix(TOAST_R, RAISE_R, smooth(f, 14, 24));
  if (f >= POP + 4) r = mix(RAISE_R, SHRUG_R, smooth(f, POP + 4, POP + 14));
  r = { ...r, ua: [r.ua[0], r.ua[1] + tap], fa: [r.fa[0], r.fa[1] + tap] };
  const q = { ...r, x: 560 };
  const h0 = hand(q, 0);
  const h1 = hand(q, 1);
  const g: Pt = [h0[0] + 4, h0[1] - 44];
  return (
    <>
      {/* the table and its cloth */}
      <Pencil d={[[110, 1180], [430, 1180]]} p={p} id={450} />
      <Pencil d={[[110, 1180], [100, 1250]]} p={p} id={451} w={4} />
      <Pencil d={[[430, 1180], [440, 1250]]} p={p} id={452} w={4} />
      <Pencil d={[[160, 1250], [160, 1392]]} p={p} id={453} w={5} />
      <Pencil d={[[380, 1250], [380, 1392]]} p={p} id={454} w={5} />
      <Ellipse c={[250, 1170]} rx={44} ry={8} p={p} id={455} w={4} />
      {/* the tree in the corner, its star */}
      {[[1110, 1210, 56], [1170, 1290, 70], [1240, 1370, 84]].map(([y0, y1, half], k) => (
        <Pencil key={k} d={[[880, y0], [880 - half, y1], [880 + half, y1]]} p={p} id={660 + k} closed />
      ))}
      <Pencil d={[[870, 1370], [870, 1392]]} p={p} id={663} w={5} />
      <Pencil d={[[890, 1370], [890, 1392]]} p={p} id={664} w={5} />
      {[[858, 1196], [902, 1262], [866, 1330], [910, 1344]].map((c, k) => <Circle key={k} c={c as Pt} r={8} p={p} id={665 + k} w={4} />)}
      <Pencil d={Array.from({ length: 11 }, (_, k): Pt => {
        const a = -Math.PI / 2 + (k / 10) * Math.PI * 2;
        const r = k % 2 ? 9 : 21;
        return [880 + Math.cos(a) * r, 1098 + Math.sin(a) * r];
      })} p={p} id={670} w={4} />
      <Figure q={q} p={p} />
      {/* the glass in his hand, the fork in the other */}
      {f < POP
        ? glass(g, 0, 1.2).map((d, i) => <Pencil key={i} d={d} p={p} id={460 + i} w={4} />)
        : <Pencil d={[[h0[0] + 4, h0[1] - 18], [h0[0] + 4, h0[1] + 6]]} p={p} id={463} w={4} />}
      {f < 16 ? <Pencil d={[h1, [h1[0] + 30, h1[1] - 22]]} p={p} id={464} w={4} /> : null}
      {/* the taps: little lines off the glass */}
      {f < 14 && f % 6 < 3
        ? [-0.6, 0, 0.6].map((a, k) => <Pencil key={k} d={[[g[0] + 20 * Math.sin(a), g[1] - 6 - 20 * Math.cos(a)], [g[0] + 34 * Math.sin(a), g[1] - 6 - 34 * Math.cos(a)]]} p={p} id={465 + k} w={3} />)
        : null}
      {/* the shatter: shards flung out and falling */}
      {f >= POP && f < POP + 22
        ? Array.from({ length: 8 }, (_, k) => {
            const a = (k / 8) * Math.PI * 2;
            const t = (f - POP) / 22;
            const c: Pt = [g[0] + Math.cos(a) * 120 * t, g[1] + Math.sin(a) * 90 * t + 260 * t * t];
            return <Pencil key={k} d={[c, [c[0] + 10 * Math.cos(a + 1), c[1] + 10 * Math.sin(a + 1)], [c[0] + 4, c[1] + 12]]} p={p} id={470 + k} w={3} closed />;
          })
        : null}
    </>
  );
};

const SM = "hotels/hogarths-stone-manor";
const XMAS_SCENES: Scene[] = [
  { from: 310, len: 120, el: <Gag time="Fri 20 Nov, 7:00pm" clip={`${SM}/festive/drinks.mp4`} from={TRAY_FROM} draw={Tray} /> },
  { from: 430, len: 120, el: <Gag time="Fri 20 Nov, 8:30pm" clip={`${SM}/festive/dinner.mp4`} from={[420, 1130]} draw={Carving} /> },
  { from: 550, len: 120, el: <Gag time="Fri 20 Nov, 10:00pm" still={`${SM}/drawing-room-event.jpg`} pos="50% 50%" from={TOAST_FROM} draw={Toast} /> },
  { from: 670, len: 120, el: <Gag time="Sat 21 Nov, 1:00am" still={`${SM}/luxury-suite.jpg`} pos="50% 50%" from={[852, 1280]} draw={Bed} /> },
  { from: 790, len: 120, el: <Gag time="Sat 21 Nov, 10:00am" still={`${SM}/suite-bathroom.jpg`} pos="74% 50%" from={[545, 1240]} draw={Bath} /> },
];
export const STICK_XMAS_FRAMES = 1030;
export const StickXmas: React.FC = () => (
  <StickFilm look="gold" xmas scenes={XMAS_SCENES} endAt={910} frames={STICK_XMAS_FRAMES} end={["Leave the party", "to us"]} />
);

// ---------------------------------------------------------------------------------------------
// The CBH team's own Christmas party at Hogarths Stone Manor (Scott, 21 Nov, with the team's photos: "Christmas
// party Stone Manor reel, Fawlty Towers dinner party theme. Business meeting, dice games, secret santa, dinner and
// comedy, then sleep and breakfast in the am", "can make it longer, like under a minute"). The flipbook's day:
// each part a page where it goes a little wrong (the farce is only in the drawings), opening into the real photos
// on hard beat cuts. No names, no lines from any show.
const P = "campaigns/xmas-party-2026";

// 1. The meeting: he points at the chart, then slaps a Christmas tree sticker over it (Scott: not the board
// falling over)
const POINT: Pose = { x: 470, y: 1208, lean: 0.04, head: 0.1, ua: [1.75, -0.15], fa: [1.85, -0.1], th: [0.1, -0.1], sh: [0, 0] };
const WIND: Pose = { x: 460, y: 1210, lean: -0.12, head: 0.05, ua: [-0.9, -0.2], fa: [-2.2, -0.1], th: [0.05, -0.15], sh: [0, 0] };
const SLAP: Pose = { x: 500, y: 1206, lean: 0.2, head: 0.1, ua: [1.6, -0.5], fa: [1.6, -0.6], th: [0.3, -0.2], sh: [0, -0.2] };
const PROUD: Pose = { x: 470, y: 1208, lean: -0.04, head: -0.15, ua: [0.9, -0.9], fa: [-1.4, 1.4], th: [0.14, -0.14], sh: [0, 0] };
const FOLD = 26;
const CHART_FROM: Pt = [800, 1070];
const Meeting = (f: number, p: number) => {
  const tap = f < 16 ? 0.08 * Math.sin(f * 1.1) : 0;
  const base: Pose = { ...POINT, ua: [POINT.ua[0] + tap, POINT.ua[1]], fa: [POINT.fa[0] + tap, POINT.fa[1]] };
  let q = f < 16 ? base : mix(base, WIND, smooth(f, 16, FOLD - 3));
  if (f >= FOLD - 3) q = mix(WIND, SLAP, smooth(f, FOLD - 3, FOLD));
  if (f >= FOLD + 8) q = mix(SLAP, PROUD, smooth(f, FOLD + 8, FOLD + 16));
  const hit = f >= FOLD;
  const jig = hit ? 9 * Math.sin((f - FOLD) * 1.6) * Math.exp(-(f - FOLD) / 5) : 0; // the board takes the slap
  const B = (pts: Pt[]) => pts.map(([x, y]) => [x + jig, y] as Pt);
  const drawn = Math.min(1, f / 14);
  const graph: Pt[] = [[715, 1160], [760, 1120], [800, 1135], [850, 1060], [895, 990]];
  const n = Math.max(2, Math.round(1 + drawn * 4));
  const c: Pt = [800 + jig, 1070];
  const sc = hit ? 1 + 0.3 * Math.exp(-(f - FOLD) / 2.5) : 1;
  const T = (pts: Pt[]) => pts.map(([x, y]) => [c[0] + x * sc, c[1] + y * sc] as Pt);
  const h = hand(q, 0);
  return (
    <>
      <Pencil d={[[700, 1200], [660, 1392]]} p={p} id={700} w={5} />
      <Pencil d={[[900, 1200], [940, 1392]]} p={p} id={701} w={5} />
      <Pencil d={[[800, 1200], [800, 1392]]} p={p} id={702} w={4} />
      <Pencil d={B([[690, 940], [910, 940], [910, 1200], [690, 1200]])} p={p} id={703} closed />
      {!hit ? <Pencil d={graph.slice(0, n)} p={p} id={704} w={5} /> : null}
      {!hit && drawn >= 1 ? <Pencil d={[[870, 992], [895, 990], [892, 1016]]} p={p} id={705} w={4} /> : null}
      {/* the sticker: in his hand on the wind up, then on the board, a tree with its star */}
      {f >= 16 && !hit ? <Circle c={[h[0], h[1] - 6]} r={26} p={p} id={709} w={4} /> : null}
      {hit ? (
        <Knockout>
          <Circle c={c} r={104 * sc} p={p} id={710} w={5} />
          {[[-78, -44, 34], [-40, 6, 48], [2, 56, 62]].map(([y0, y1, half], k) => (
            <Pencil key={k} d={T([[0, y0], [-half, y1], [half, y1]])} p={p} id={711 + k} w={5} closed />
          ))}
          <Pencil d={T([[-9, 56], [-9, 76], [9, 76], [9, 56]])} p={p} id={714} w={4} />
          <Pencil d={T(Array.from({ length: 11 }, (_, k): Pt => {
            const a = -Math.PI / 2 + (k / 10) * Math.PI * 2;
            const r = k % 2 ? 6 : 14;
            return [Math.cos(a) * r, -88 + Math.sin(a) * r];
          }))} p={p} id={715} w={3} />
        </Knockout>
      ) : null}
      {hit && f < FOLD + 8
        ? [0, 1, 2, 3, 4, 5].map((k) => {
            const a = (k / 6) * Math.PI * 2 + 0.3;
            return <Pencil key={k} d={[[c[0] + Math.cos(a) * 122, c[1] + Math.sin(a) * 122], [c[0] + Math.cos(a) * 150, c[1] + Math.sin(a) * 150]]} p={p} id={716 + k} w={4} />;
          })
        : null}
      <Figure q={q} p={p} />
    </>
  );
};

// 2. The dice: a shake, a throw, two sixes
const SHAKE: Pose = { x: 300, y: 1208, lean: 0.05, head: 0, ua: [2.0, -0.2], fa: [2.7, -0.1], th: [0.12, -0.12], sh: [0, 0] };
const THROW: Pose = { x: 310, y: 1212, lean: 0.3, head: 0.1, ua: [1.3, -0.5], fa: [1.4, -0.4], th: [0.35, -0.25], sh: [0, -0.2] };
const CHEER: Pose = { x: 310, y: 1150, lean: 0, head: -0.1, ua: [2.8, -2.8], fa: [3.0, -3.0], th: [0.3, -0.3], sh: [-0.5, 0.5] };
const ROLL = 18;
const DICE_FROM: Pt = [700, 1340];
const Dice = (f: number, p: number) => {
  const sh = f < ROLL ? 0.25 * Math.sin(f * 1.9) : 0;
  const shake: Pose = { ...SHAKE, ua: [SHAKE.ua[0] + sh, SHAKE.ua[1]], fa: [SHAKE.fa[0] + sh, SHAKE.fa[1]] };
  let q = f < ROLL ? shake : mix(shake, THROW, smooth(f, ROLL, ROLL + 5));
  if (f >= 42) {
    const up = Math.abs(Math.sin(((f - 42) / 9) * Math.PI));
    q = mix(THROW, { ...CHEER, y: 1208 - 70 * up }, smooth(f, 42, 46));
  }
  const h = hand(shake, 0);
  const die = (k: number) => {
    const land = 640 + k * 130;
    const t = Math.min(1, Math.max(0, (f - ROLL - k * 2) / 20));
    const x = h[0] + (land - h[0]) * t;
    const bounce = t < 0.6 ? Math.sin((t / 0.6) * Math.PI) * 300 : Math.sin(((t - 0.6) / 0.4) * Math.PI) * 70;
    const y = h[1] + (1366 - h[1]) * Math.min(1, t / 0.6) - bounce * (t < 0.6 ? 0.5 : 1);
    const a = t < 1 ? t * (7 + k * 2) : 0;
    const c: Pt = f < ROLL ? [h[0] + 6 + k * 8, h[1] - 30 - k * 10] : [x, y];
    return (
      <React.Fragment key={k}>
        <Pencil d={rot([[-26, -26], [26, -26], [26, 26], [-26, 26]], c, a)} p={p} id={720 + k} w={5} closed />
        {t >= 1 ? [-13, 0, 13].flatMap((dy) => [-11, 11].map((dx) => <Circle key={`${dx}${dy}`} c={[c[0] + dx, c[1] + dy]} r={3} p={p} id={724 + k * 9 + dx + dy} w={3} />)) : null}
      </React.Fragment>
    );
  };
  return (
    <>
      <Figure q={q} p={p} />
      {/* the cup in his hand until the throw */}
      {f < ROLL + 3 ? <Pencil d={rot([[-20, -34], [-15, 0], [15, 0], [20, -34]], hand(q, 0), 0)} p={p} id={719} w={5} /> : null}
      {f >= ROLL ? [0, 1].map(die) : null}
    </>
  );
};

// 3. Secret santa: he lifts the lid and it comes out on a spring
const REACH: Pose = { x: 420, y: 1226, lean: 0.4, head: 0.15, ua: [1.0, 0.8], fa: [1.2, 1.0], th: [0.5, -0.3], sh: [-0.3, -0.5] };
const LIFT = 20;
export const SANTA_FROM: Pt = [690, 1040];
export const Santa = (f: number, p: number) => {
  const out = smooth(f, LIFT, LIFT + 7);
  const q = f < LIFT ? mix({ ...STAND, x: 400 }, REACH, smooth(f, 4, 14))
    : mix(REACH, { ...BUM, x: 330 }, smooth(f, LIFT + 2, LIFT + 12));
  const top = 1290 - 250 * out + (out >= 1 ? 16 * Math.sin((f - LIFT) * 0.9) * Math.exp(-(f - LIFT - 7) / 14) : 0);
  const sway = out >= 1 ? 26 * Math.sin((f - LIFT) * 0.7) * Math.exp(-(f - LIFT - 7) / 16) : 0;
  const coil: Pt[] = Array.from({ length: 13 }, (_, k) => [690 + (k % 2 ? 26 : -26) + (sway * k) / 12, 1290 + ((top - 1290) * k) / 12]);
  const lidT = Math.min(1, Math.max(0, (f - LIFT) / 16));
  const lid: Pt = [690 + 190 * lidT, 1282 - 260 * Math.sin(Math.PI * lidT) + 104 * lidT];
  const c: Pt = [690 + sway, top - 30];
  return (
    <>
      {/* the box and its ribbon */}
      <Pencil d={[[620, 1290], [760, 1290], [760, 1392], [620, 1392]]} p={p} id={740} closed />
      <Pencil d={[[690, 1290], [690, 1392]]} p={p} id={741} w={4} />
      <Pencil d={rot([[-78, -8], [78, -8], [78, 8], [-78, 8]], lid, lidT * 5)} p={p} id={742} w={5} closed />
      {out > 0 ? <Pencil d={coil} p={p} id={743} w={4} /> : null}
      {out > 0 ? (
        <>
          <Circle c={c} r={30} p={p} id={744} w={5} />
          <Pencil d={[[c[0] - 30, c[1] - 14], [c[0] + 6, c[1] - 78], [c[0] + 30, c[1] - 14]]} p={p} id={745} w={5} />
          <Circle c={[c[0] + 10, c[1] - 82]} r={8} p={p} id={746} w={4} />
        </>
      ) : null}
      <Figure q={q} p={p} />
    </>
  );
};

// 3b. The steal (Scott: "all sitting at a table stealing gifts ... gifts being stolen across the table", not a
// chase): two of them sat either side, the present swiped across, swiped back, swiped again, a die between them
const STEAL_FROM: Pt = [540, 1130];
const SEAT_R: Pose = { ...SIT_L, x: 850 };
const GRAB_R: Pose = { ...EAT_REACH, x: 850, lean: 0.42, ua: [-1.45, -0.2], fa: [-1.6, -0.5] };
const Steal = (f: number, p: number) => {
  const swipe = (a: number) => smooth(f, a, a + 8);
  const gx = 400 + 280 * (swipe(12) - swipe(28) + swipe(44));
  const reach = (a: number) => Math.max(0, 1 - Math.abs(f - a - 2) / 7);
  const right = mix(SEAT_R, GRAB_R, Math.max(reach(12), reach(44)));
  const left = mirror(mix(SEAT_R, GRAB_R, reach(28)), 230);
  const c: Pt = [gx, 1132];
  const stool = (x: number, id: number) => (
    <>
      <Pencil d={[[x - 46, 1218], [x + 46, 1218]]} p={p} id={id} w={5} />
      <Pencil d={[[x - 34, 1218], [x - 40, 1392]]} p={p} id={id + 1} w={4} />
      <Pencil d={[[x + 34, 1218], [x + 40, 1392]]} p={p} id={id + 2} w={4} />
    </>
  );
  return (
    <>
      <Pencil d={[[330, 1176], [750, 1176]]} p={p} id={784} />
      <Pencil d={[[540, 1176], [540, 1392]]} p={p} id={785} w={5} />
      <Pencil d={[[470, 1392], [610, 1392]]} p={p} id={786} w={5} />
      {stool(230, 787)}
      {stool(850, 791)}
      <Figure q={left} p={p} />
      <Figure q={right} p={p} hat="antlers" />
      <Pencil d={rot([[-44, -40], [44, -40], [44, 40], [-44, 40]], c, 0)} p={p} id={780} closed />
      <Pencil d={[[c[0], c[1] - 40], [c[0], c[1] + 40]]} p={p} id={781} w={4} />
      <Pencil d={[[c[0] - 44, c[1]], [c[0] + 44, c[1]]]} p={p} id={782} w={4} />
      <Pencil d={[[c[0], c[1] - 40], [c[0] - 22, c[1] - 66], [c[0] - 30, c[1] - 44], [c[0], c[1] - 40], [c[0] + 22, c[1] - 66], [c[0] + 30, c[1] - 44], [c[0], c[1] - 40]]} p={p} id={783} w={4} />
      {/* the die, knocked about each time */}
      <Pencil d={rot([[-14, -14], [14, -14], [14, 14], [-14, 14]], [540 + 30 * Math.sin(f * 0.5), 1160], f * 0.4)} p={p} id={795} w={4} closed />
    </>
  );
};

// 3c. The quiz: question marks, then a long look at the answers across the table, which get covered up
const PEEK: Pose = { ...SEAT_R, lean: 0.8, head: 0.35, ua: [-0.3, -0.2], fa: [-0.6, -0.4] };
const COVER: Pose = { ...SEAT_R, lean: 0.32, head: 0.3, ua: [-1.0, -0.9], fa: [-1.9, -1.8] };
const Quiz = (f: number, p: number) => {
  const left = mirror(mix(SEAT_R, PEEK, smooth(f, 26, 36)), 230);
  const right = mix(SEAT_R, COVER, smooth(f, 34, 42));
  const q = (c: Pt, id: number) => (
    <React.Fragment key={id}>
      <Pencil d={[...Array.from({ length: 9 }, (_, k): Pt => {
        const a = -2.6 + (k / 8) * 4.0;
        return [c[0] + 17 * Math.cos(a), c[1] - 22 + 17 * Math.sin(a)];
      }), [c[0], c[1] + 10]]} p={p} id={id} w={5} />
      <Circle c={[c[0], c[1] + 28]} r={3} p={p} id={id + 1} w={4} />
    </React.Fragment>
  );
  const sheet = (x: number, id: number) => <Pencil d={[[x - 34, 1172], [x - 22, 1150], [x + 40, 1150], [x + 28, 1172]]} p={p} id={id} w={4} closed />;
  return (
    <>
      <Pencil d={[[330, 1176], [750, 1176]]} p={p} id={860} />
      <Pencil d={[[540, 1176], [540, 1392]]} p={p} id={861} w={5} />
      <Pencil d={[[470, 1392], [610, 1392]]} p={p} id={862} w={5} />
      {[230, 850].map((x, k) => (
        <React.Fragment key={k}>
          <Pencil d={[[x - 46, 1218], [x + 46, 1218]]} p={p} id={863 + k * 3} w={5} />
          <Pencil d={[[x - 34, 1218], [x - 40, 1392]]} p={p} id={864 + k * 3} w={4} />
          <Pencil d={[[x + 34, 1218], [x + 40, 1392]]} p={p} id={865 + k * 3} w={4} />
        </React.Fragment>
      ))}
      {sheet(410, 870)}
      {sheet(670, 871)}
      <Figure q={left} p={p} hat="antlers" />
      <Figure q={right} p={p} hat="elf" />
      {f < 30 ? [[190, 900], [262, 860], [322, 910]].map((c, k) => (f >= 4 + k * 7 ? q(c as Pt, 872 + k * 2) : null)) : null}
    </>
  );
};

// 4. Drinks (Scott: "he didn't trip and drop his glasses", the waiter got a slap from the host): the waiter with
// his tray, the host winds up and slaps him; he reels, and the tray never moves
const SL_STAND: Pose = { x: 380, y: 1208, lean: 0, head: 0.05, ua: [0.2, -0.15], fa: [0.3, -0.1], th: [0.12, -0.12], sh: [0, 0] };
const SL_WIND: Pose = { x: 375, y: 1208, lean: 0.14, head: 0.05, ua: [-1.3, -0.2], fa: [-2.3, -0.1], th: [0.05, -0.15], sh: [0, 0] };
const SL_HIT: Pose = { x: 430, y: 1206, lean: -0.25, head: 0.1, ua: [2.0, -0.5], fa: [2.3, -0.6], th: [0.3, -0.2], sh: [0, -0.2] };
const WHACK = 24;
const SLAP_FROM: Pt = [600, 960];
const Slap = (f: number, p: number) => {
  let q = mix(SL_STAND, SL_WIND, smooth(f, 8, WHACK - 4));
  if (f >= WHACK - 4) q = mix(SL_WIND, SL_HIT, smooth(f, WHACK - 4, WHACK));
  if (f >= WHACK + 8) q = mix(SL_HIT, SL_STAND, smooth(f, WHACK + 8, WHACK + 18));
  const reel = f >= WHACK ? Math.exp(-(f - WHACK) / 12) : 0;
  const w0 = mirror({ ...CARRY, x: 0 }, 690);
  const w: Pose = { ...w0, lean: w0.lean + 0.4 * reel * Math.cos((f - WHACK) * 0.5), head: w0.head - 0.9 * reel * Math.cos((f - WHACK) * 0.7) };
  const h = hand(w0, 0);
  const hd = headOf(w);
  return (
    <>
      <Figure q={q} p={p} />
      <Figure q={w} p={p} />
      <Pencil d={[[h[0] - 76, h[1] - 6], [h[0] + 64, h[1] - 6]]} p={p} id={880} w={6} />
      {/* his name card (Scott: "put a name card, Manuel"), on a tag beside him */}
      <Pencil d={[[730, 1010], [920, 1010], [920, 1084], [730, 1084]]} p={p} id={905} w={4} closed />
      <Pencil d={[[730, 1047], [712, 1060]]} p={p} id={906} w={3} />
      <Scribble x={750} y={1066} size={54}>Manuel</Scribble>
      {[0, 1, 2].map((k) => glass([h[0] - 46 + k * 40, h[1] - 50], 0, 1).map((d, i) => <Pencil key={`${k}${i}`} d={d} p={p} id={881 + k * 3 + i} w={4} />))}
      {f >= WHACK && f < WHACK + 7
        ? [0, 1, 2, 3, 4].map((k) => {
            const a = -2.6 + k * 0.5;
            return <Pencil key={k} d={[[hd[0] - 30 + Math.cos(a) * 44, hd[1] + Math.sin(a) * 44], [hd[0] - 30 + Math.cos(a) * 78, hd[1] + Math.sin(a) * 78]]} p={p} id={892 + k} w={4} />;
          })
        : null}
      {f >= WHACK + 5
        ? [0, 1, 2].map((k) => {
            const a = f * 0.45 + (k * 2 * Math.PI) / 3;
            const c: Pt = [hd[0] + 56 * Math.cos(a), hd[1] - 64 + 14 * Math.sin(a)];
            return <Pencil key={k} d={Array.from({ length: 11 }, (_, i): Pt => {
              const b = -Math.PI / 2 + (i / 10) * Math.PI * 2;
              const r = i % 2 ? 5 : 12;
              return [c[0] + Math.cos(b) * r, c[1] + Math.sin(b) * r];
            })} p={p} id={897 + k} w={3} />;
          })
        : null}
    </>
  );
};

// 5. The room in stitches (Scott: "just draw the crowd of people eating at table laughing while they do their comedy
// bits"; nothing invented): two at a table rocking with laughter, the act beside them (the host mid rant, or the
// comedian with a mic)
const Laughers = (f: number, p: number, act: "rant" | "mic" | "chase") => {
  const lf = (q: Pose, ph: number, dir: number): Pose => {
    const w = Math.sin(f * 1.3 + ph);
    return { ...q, y: q.y + 3 * w, lean: q.lean + dir * (0.2 + 0.14 * w), head: q.head - dir * (0.25 + 0.15 * w),
      ua: [q.ua[0] + dir * 0.5 * w, q.ua[1] - dir * 0.4 * w], fa: [q.fa[0] + dir * 0.7 * w, q.fa[1]] };
  };
  const a = lf(mirror(SEAT_R, 165), 0, 1);
  const b = lf({ ...SEAT_R, x: 520 }, 1.7, -1);
  const w = Math.sin(f * 0.9);
  const star: Pose = act === "rant"
    ? { x: 820, y: 1204, lean: 0.1 * w, head: 0.2 * w, ua: [-2.4 + 0.5 * w, 2.4 + 0.5 * w], fa: [-2.8 + 0.8 * w, 2.8 + 0.8 * w], th: [0.2, -0.2], sh: [0, 0] }
    : { x: 830, y: 1208, lean: -0.05 + 0.05 * w, head: 0.1, ua: [-1.3, 0.9 + 0.5 * w], fa: [-2.6, 1.6 + 0.6 * w], th: [0.12, -0.12], sh: [0, 0] };
  const m = hand(star, 0);
  return (
    <>
      <g transform={act === "chase" ? "translate(120 -300) translate(430 1392) scale(0.62) translate(-430 -1392)" : "translate(110 0)"}>
      {act === "chase" ? <Pencil d={[[40, 1392], [640, 1392]]} p={p} id={909} w={6} /> : null}
      <Pencil d={[[215, 1176], [435, 1176]]} p={p} id={910} />
      <Pencil d={[[325, 1176], [325, 1392]]} p={p} id={911} w={5} />
      <Pencil d={[[265, 1392], [385, 1392]]} p={p} id={912} w={5} />
      <Ellipse c={[280, 1168]} rx={34} ry={6} p={p} id={913} w={4} />
      <Ellipse c={[372, 1168]} rx={34} ry={6} p={p} id={914} w={4} />
      {[165, 520].map((x, k) => (
        <React.Fragment key={k}>
          <Pencil d={[[x - 46, 1218], [x + 46, 1218]]} p={p} id={915 + k * 3} w={5} />
          <Pencil d={[[x - 34, 1218], [x - 40, 1392]]} p={p} id={916 + k * 3} w={4} />
          <Pencil d={[[x + 34, 1218], [x + 40, 1392]]} p={p} id={917 + k * 3} w={4} />
        </React.Fragment>
      ))}
      <Figure q={a} p={p} hat="antlers" />
      <Figure q={b} p={p} hat="elf" />
      {/* the laughter written in (Scott: "put ha ha on the laughter bit"), popping up over the table in turn */}
      {[[90, 880, 0, 62], [290, 840, 5, 76], [480, 890, 10, 62], [180, 770, 15, 54], [410, 760, 21, 58]].map(([x, y, at0, size], k) => {
        const t = f - at0;
        if (t < 0) return null;
        const bob = 6 * Math.sin(f * 0.9 + k);
        return <Scribble key={k} x={x} y={y + bob - Math.min(14, t)} size={size} o={Math.min(1, t / 3)}>{k % 2 ? "ha ha" : "ha"}</Scribble>;
      })}
      </g>
      {act === "chase" ? (
        <>
          {/* the actors tearing round the room: the waiter, the host after him */}
          <Figure q={runPose(f * 0.6, -60 + f * 13)} p={p} />
          <Figure q={{ ...runPose(f * 0.6 + 0.5, -330 + f * 13), ua: [1.5, 1.2], fa: [1.6, 1.3] }} p={p} />
        </>
      ) : <Figure q={star} p={p} />}
      {act === "mic" ? (
        <>
          <Pencil d={[m, [m[0] + 4, m[1] + 34]]} p={p} id={930} w={5} />
          <Circle c={[m[0] - 2, m[1] - 8]} r={10} p={p} id={931} w={5} />
        </>
      ) : null}
    </>
  );
};
const LaughRant = (f: number, p: number) => Laughers(f, p, "rant");
export const LaughMic = (f: number, p: number) => Laughers(f, p, "mic");
const LaughChase = (f: number, p: number) => Laughers(f, p, "chase");

// 0. Check in: the bell on the desk, dinged politely, then not politely, and nobody comes
const RING_UP: Pose = { x: 400, y: 1208, lean: 0.06, head: 0.1, ua: [1.5, -0.15], fa: [2.0, -0.1], th: [0.1, -0.1], sh: [0, 0] };
const RING_DN: Pose = { x: 400, y: 1208, lean: 0.1, head: 0.16, ua: [1.15, -0.15], fa: [1.25, -0.1], th: [0.1, -0.1], sh: [0, 0] };
const GIVE_UP: Pose = { x: 400, y: 1208, lean: -0.05, head: -0.3, ua: [1.2, -1.2], fa: [2.4, -2.4], th: [0.1, -0.1], sh: [0, 0] };
const PING = 44;
export const Bell = (f: number, p: number) => {
  // two polite dings, a pause to look round, then a frantic run of them
  const rate = f < 20 ? 10 : f < 26 ? 0 : 3.2;
  const ph = rate ? (f % rate) / rate : 1;
  const down = rate ? Math.max(0, 1 - Math.abs(ph - 0.4) / 0.4) : 0;
  let q = mix(RING_UP, RING_DN, down);
  if (f >= 20 && f < 26) q = { ...RING_UP, head: -0.5 + (f - 20) * 0.2 };
  if (f >= PING) q = mix(RING_UP, GIVE_UP, smooth(f, PING, PING + 8));
  const t = Math.min(1, Math.max(0, (f - PING) / 16));
  const bell: Pt = f < PING ? [610, 1162] : [610 + 260 * t, 1162 - 330 * Math.sin(Math.PI * t) + 230 * t];
  const dome = Array.from({ length: 9 }, (_, k): Pt => [-34 * Math.cos((k / 8) * Math.PI), -30 * Math.sin((k / 8) * Math.PI)]);
  return (
    <>
      {/* the desk, the key rack behind it */}
      <Pencil d={[[520, 1166], [960, 1166]]} p={p} id={800} />
      <Pencil d={[[540, 1166], [540, 1392]]} p={p} id={801} w={5} />
      <Pencil d={[[940, 1166], [940, 1392]]} p={p} id={802} w={5} />
      <Pencil d={[[700, 900], [920, 900], [920, 1040], [700, 1040]]} p={p} id={803} w={4} closed />
      {[0, 1, 2, 3, 4, 5].map((k) => <Circle key={k} c={[740 + (k % 3) * 70, 940 + Math.floor(k / 3) * 56]} r={7} p={p} id={804 + k} w={3} />)}
      <Pencil d={rot([...dome, [-40, 0], [40, 0]], bell, t * 9)} p={p} id={812} w={5} />
      <Circle c={[bell[0], bell[1] - 36]} r={5} p={p} id={813} w={3} />
      {down > 0.6 && f < PING
        ? [-0.8, 0, 0.8].map((a, k) => <Pencil key={k} d={[[610 + 52 * Math.sin(a), 1140 - 52 * Math.cos(a)], [610 + 78 * Math.sin(a), 1140 - 78 * Math.cos(a)]]} p={p} id={814 + k} w={3} />)
        : null}
      <Figure q={q} p={p} />
    </>
  );
};

// 5b. The kitchen doorway: one waiter going in, one coming out, both with plates
const CLASH = 24;
export const DOOR_FROM: Pt = [540, 1060];
export const Doors = (f: number, p: number) => {
  const go = Math.min(1, f / CLASH);
  const xa = 150 + 290 * go;
  const xb = 930 - 290 * go;
  const wa = runPose(f * 0.55, xa);
  const carry = (w: Pose): Pose => ({ ...w, lean: -0.05, head: -0.1, ua: [2.5, w.ua[1] * 0.5], fa: [3.0, w.fa[1] * 0.5], y: 1200 + (w.y - 1194) * 0.5 });
  const a0 = carry(wa);
  const b0 = mirror(carry(runPose(f * 0.55 + 0.5, 0)), xb);
  const fall = smooth(f, CLASH, CLASH + 8);
  const a = f < CLASH ? a0 : mix(a0, { ...BUM, x: 330 }, fall);
  const b = f < CLASH ? b0 : mix(b0, mirror(BUM, 750), fall);
  const ha = hand(a0, 0);
  const hb = hand(b0, 0);
  const stack = (h: Pt, side: number, id: number) => [0, 1, 2].map((k) => {
    const t = Math.max(0, (f - CLASH - k) / 20);
    if (t >= 1) return null;
    const c: Pt = f < CLASH ? [h[0] + side * 8, h[1] - 10 - k * 13]
      : [h[0] + side * (40 + k * 70) * t, h[1] - 10 - k * 13 - (300 + k * 60) * Math.sin(Math.PI * t) + (1392 - h[1]) * t];
    return <Ellipse key={`${id}${k}`} c={c} rx={46} ry={f < CLASH ? 7 : 7 + 22 * Math.abs(Math.sin(t * 9 + k))} p={p} id={id + k} w={4} />;
  });
  return (
    <>
      <Pencil d={[[440, 1392], [440, 930], [640, 930], [640, 1392]]} p={p} id={820} w={5} />
      <Circle c={[540, 1010]} r={30} p={p} id={821} w={4} />
      <Pencil d={[[540, 930], [540, 1392]]} p={p} id={822} w={3} />
      <Figure q={a} p={p} />
      <Figure q={b} p={p} />
      {stack(ha, 1, 830)}
      {stack(hb, -1, 840)}
      {f >= CLASH && f < CLASH + 8
        ? [0, 1, 2, 3, 4].map((k) => {
            const an = -Math.PI + (k / 4) * Math.PI;
            return <Pencil key={k} d={[[540 + Math.cos(an) * 50, 1140 + Math.sin(an) * 50], [540 + Math.cos(an) * 96, 1140 + Math.sin(an) * 96]]} p={p} id={850 + k} w={4} />;
          })
        : null}
    </>
  );
};

// 7. Breakfast: the toast leaves the toaster, one for the plate, one for his head
const WAIT: Pose = { x: 600, y: 1208, lean: 0, head: -0.05, ua: [-1.2, 0.15], fa: [-1.7, 0.1], th: [0.1, -0.1], sh: [0, 0] };
const POPT = 16;
export const Breakfast = (f: number, p: number) => {
  const q = WAIT;
  const plate = hand(q, 0);
  const head = headOf(q);
  const fly = (k: number) => {
    const t = Math.min(1, Math.max(0, (f - POPT - k * 3) / 24));
    const to: Pt = k === 0 ? [plate[0] - 8, plate[1] - 22] : [head[0], head[1] - 50];
    const from0: Pt = [262 + k * 36, 1120];
    const c: Pt = f < POPT ? [from0[0], 1136] : [from0[0] + (to[0] - from0[0]) * t, from0[1] + (to[1] - from0[1]) * t - (420 + k * 160) * Math.sin(Math.PI * t)];
    const a = t < 1 ? t * (6 + k * 3) : k === 0 ? Math.PI / 2 : Math.PI / 2;
    return <Pencil key={k} d={rot([[-22, -26], [-22, 20], [22, 20], [22, -26], [10, -32], [-10, -32]], c, f < POPT ? 0 : a)} p={p} id={770 + k} w={5} closed />;
  };
  return (
    <>
      {/* the table, the toaster on it */}
      <Pencil d={[[130, 1180], [450, 1180]]} p={p} id={760} />
      <Pencil d={[[170, 1180], [170, 1392]]} p={p} id={761} w={5} />
      <Pencil d={[[410, 1180], [410, 1392]]} p={p} id={762} w={5} />
      <Pencil d={[[230, 1180], [230, 1126], [330, 1126], [330, 1180]]} p={p} id={763} />
      <Pencil d={[[330, 1150], [346, 1150 + (f >= POPT ? -14 : 6)]]} p={p} id={764} w={4} />
      {[0, 1].map(fly)}
      <Figure q={q} p={p} />
      {/* the plate held out */}
      <Pencil d={[[plate[0] - 46, plate[1] - 4], [plate[0] + 30, plate[1] - 4]]} p={p} id={765} w={6} />
    </>
  );
};

const beat = 30;
const FACES = ["red-antlers", "cream", "green-antlers", "sequin", "brown-antlers", "gingerbread", "tubes", "peace", "boppers", "lace", "thumbs", "santa-boppers"].map((n) => `${P}/p-${n}.jpg`);
const PARTY: { time: string; draw: (f: number, p: number, look: Look, xmas: boolean) => React.ReactNode; from: Pt; stills: Shot[] }[] = [
  { time: "Fri 20 Nov, 2:00pm", draw: Meeting, from: CHART_FROM, stills: [
    { src: "campaigns/festive/graded/hogarths-entrance.jpg", len: 2 * beat, pos: "50% 50%" }, { src: `${P}/meeting-wide.jpg`, len: 2 * beat, split: true }] },
  { time: "Fri 20 Nov, 3:00pm", draw: Quiz, from: [540, 1130], stills: [{ src: `${P}/meeting-smiles.jpg`, len: 2 * beat, split: true, halves: true }] },
  { time: "Fri 20 Nov, 3:30pm", draw: Dice, from: DICE_FROM, stills: [{ src: `${P}/dice-game.jpg`, len: 2 * beat, split: true }] },
  { time: "Fri 20 Nov, 4:00pm", draw: Steal, from: STEAL_FROM, stills: [{ src: `${P}/secret-santa.jpg`, len: 2 * beat, split: true }, { src: `${P}/group-day.jpg`, len: 4 * beat, pos: "50% 56%", to: `${P}/group-evening.jpg`, toPos: "47% 55%", zoom: 1.2 }] },
  { time: "Fri 20 Nov, 7:00pm", draw: Slap, from: SLAP_FROM, stills: [
    { src: `${SM}/waiter-tray.jpg`, len: beat, pos: "16% 50%" }, { src: `${P}/cast-tree-portrait.jpg`, len: beat, pos: "50% 40%" },
    { src: `${P}/table-1-group.jpg`, len: 2 * beat, split: true }, { src: `${P}/table-2-group.jpg`, len: 2 * beat, split: true }] },
  { time: "Fri 20 Nov, 8:00pm", draw: Cake, from: [340, 1075], stills: [
    { src: "plates", len: 4 * beat, plates: ["prawn", "terrine", "turkey", "pud", "opera", "cheese"].map((n) => `${P}/plate-${n}.jpg`) }] },
  { time: "Fri 20 Nov, 8:45pm", draw: LaughRant, from: [640, 1080], stills: [
    ...["host-card", "hostess-close", "waiter-guest", "host-pour", "hostess-guest", "waiter-antlers", "hostess-table-1"]
      .map((n, k): Shot => ({ src: `${P}/${n}.jpg`, len: k === 6 ? beat : beat / 2 }))] },
  { time: "Fri 20 Nov, 9:15pm", draw: LaughChase, from: [640, 1080], stills: [
    { src: `${P}/comedian-1.jpg`, len: beat }, { src: `${P}/comedian-2.jpg`, len: beat },     { src: `${P}/host-table-2.jpg`, len: beat, pos: "52% 50%" },
    { src: "grid", len: 3 * beat, grid: FACES }] }, // the waving group photo is out (Scott: the same as the posed one)
];
const PARTY_SCENES: Scene[] = (() => {
  const out: Scene[] = [];
  let at0 = 0;
  for (const s of PARTY) {
    const len = 60 + s.stills.reduce((a, x) => a + x.len, 0);
    const hats = /7:00pm|8:00pm|8:45pm|9:15pm/.test(s.time);
    out.push({ from: at0, len, el: <HatCtx.Provider value={hats}><Gag time={s.time} from={s.from} draw={s.draw} stills={s.stills} /></HatCtx.Provider> });
    at0 += len;
  }
  // bed, then the morning as photos only (Scott: "lose the breakfast gag")
  out.push({ from: at0, len: 120, el: <Gag time="Sat 21 Nov, 1:00am" from={[852, 1280]} draw={Bed}
    stills={[{ src: `${SM}/luxury-suite.jpg`, len: beat }, { src: `${SM}/breakfast-eggs.jpg`, len: beat, pos: "54% 50%" }]} /> });
  return out;
})();
const PARTY_END = PARTY_SCENES[PARTY_SCENES.length - 1].from + 120;
export const STICK_PARTY_FRAMES = PARTY_END + 140;
export const StickParty: React.FC = () => (
  <StickFilm look="gold" xmas scenes={PARTY_SCENES} endAt={PARTY_END} frames={STICK_PARTY_FRAMES} end={["A faultless night,", "almost"]} endEl={<FaultlessEnd />} musicAt={0} track={`${P}/christmas-fun-120.mp3`}
    over={<Sequence from={66} durationInFrames={54} layout="none"><PlaceLabel place="KIDDERMINSTER" name="Hogarths Stone Manor" len={54} strong /></Sequence>} />
);
