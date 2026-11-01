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
const Figure: React.FC<{ q: Pose; p: number }> = ({ q, p }) => {
  const xmas = React.useContext(XmasCtx);
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
      {xmas ? <SantaHat c={headC} a={-(q.lean + q.head)} p={p} /> : null}
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
                <div style={{ height: 2, marginTop: 12, background: colors.gold }} />
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

// a page of the pad: the time at the top, the ground, a drawing; then the shot opens out of the point `from`
const Gag: React.FC<{
  time: string; clip?: string; still?: string; pos?: string; from: Pt;
  draw: (f: number, p: number, look: Look, xmas: boolean) => React.ReactNode; ground?: [number, number];
}> = ({ time, clip, still, pos, from, draw, ground = [60, 1020] }) => {
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
      {frame >= OPEN_AT ? (
        <AbsoluteFill style={{ clipPath: `circle(${radius}px at ${cx}px ${cy}px)` }}>
          {still ? (
            <Img src={staticFile(still)} style={{ position: "absolute", width: W, height: H, objectFit: "cover", objectPosition: pos ?? "50% 50%",
              transform: `scale(${interpolate(frame, [OPEN_AT, OPEN_AT + 62], [1, 1.05], { extrapolateRight: "clamp" })})` }} />
          ) : (
            <Sequence from={OPEN_AT + FLIP} layout="none">
              <OffthreadVideo src={staticFile(clip!)} muted style={{ position: "absolute", width: W, height: H }} />
            </Sequence>
          )}
        </AbsoluteFill>
      ) : null}
      {frame >= OPEN_AT ? <InkRing c={[cx, cy]} r={radius} o={1 - reveal * reveal} /> : null}
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

const R = "hotels/rowton-hall/screen-time";
const REEL_SCENES = [
  { from: 310, len: 120, el: <Gag time="Friday, 6:15pm" clip={`${R}/welcome-fizz.mp4`} from={FIZZ_FROM} draw={Fizz} /> },
  { from: 430, len: 180, el: <Gag time="Saturday, 10:00am" clip={`${R}/pool-4s.mp4`} from={SPLASH} draw={Pool} ground={[60, 540]} /> },
  { from: 610, len: 120, el: <Gag time="Saturday, 3:30pm" clip={`${R}/cake-by-the-fire.mp4`} from={[340, 1075]} draw={Cake} /> },
  { from: 730, len: 120, el: <Gag time="Saturday, 11:00pm" clip={`${R}/four-poster.mp4`} from={[852, 1280]} draw={Bed} /> },
];
type Scene = { from: number; len: number; el: React.ReactNode };
const StickFilm: React.FC<{ look: "pad" | "gold"; xmas?: boolean; scenes: Scene[]; endAt: number; frames: number; end: [string, string] }> = ({
  look: lookId, xmas, scenes, endAt, frames, end,
}) => (
  <LookCtx.Provider value={LOOKS[lookId]}>
  <XmasCtx.Provider value={Boolean(xmas)}>
    <AbsoluteFill style={{ backgroundColor: LOOKS[lookId].bg }}>
      {/* each page comes in FLIP frames early, under the one lifting away; the earlier page drawn on top */}
      <Sequence from={endAt - FLIP}>
        <EndLine lines={end} />
      </Sequence>
      {[...scenes].reverse().map((s) => (
        <Sequence key={s.from} from={s.from - FLIP} durationInFrames={s.len + FLIP}>
          <FlipOut total={s.len + FLIP}>{s.el}</FlipOut>
        </Sequence>
      ))}
      <Sequence durationInFrames={310}>
        <FlipOut total={310}>
          <StickFlip look={lookId} xmas={xmas} bare />
        </FlipOut>
      </Sequence>
      <Audio
        src={staticFile(MUSIC)}
        trimBefore={Math.round(MUSIC_FROM * 30)}
        volume={(v) => interpolate(v, [0, 6, frames - 30, frames], [0, 1, 1, 0], { extrapolateRight: "clamp" })}
      />
      <FilmFinish />
    </AbsoluteFill>
  </XmasCtx.Provider>
  </LookCtx.Provider>
);

export const STICK_REEL_FRAMES = 970;
export const StickReel: React.FC<{ look?: "pad" | "gold" }> = ({ look = "gold" }) => (
  <StickFilm look={look} scenes={REEL_SCENES} endAt={850} frames={STICK_REEL_FRAMES} end={["Out of office", "till Monday"]} />
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
