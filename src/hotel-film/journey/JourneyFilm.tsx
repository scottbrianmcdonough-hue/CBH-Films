import { Audio, Video } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  random,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { LightsToCB } from "./LightsToCB";
import { FilmFinish } from "../components/FilmFinish";
import { colors, EASE_IN_OUT, EASE_OUT, progress, sans, serif } from "../theme";
import type { JourneyMap, JourneyShot, JourneySpec } from "./types";

const W = 1080;
const H = 1920;
const OPEN = 10; // frames for a shot to open out of its pin
const CLOSE = 14; // frames for it to fold back in, as the thread moves on
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

type Cam = { fx: number; fy: number; z: number; ax: number; ay: number };
const FULL: Cam = { fx: W / 2, fy: H / 2, z: 1, ax: W / 2, ay: H / 2 };
const mix = (a: Cam, b: Cam, t: number): Cam => ({
  fx: a.fx + (b.fx - a.fx) * t,
  fy: a.fy + (b.fy - a.fy) * t,
  z: Math.exp(Math.log(a.z) + (Math.log(b.z) - Math.log(a.z)) * t),
  ax: a.ax + (b.ax - a.ax) * t,
  ay: a.ay + (b.ay - a.ay) * t,
});
const toScreen = (c: Cam, x: number, y: number): [number, number] => [
  (x - c.fx) * c.z + c.ax,
  (y - c.fy) * c.z + c.ay,
];

// The point on the thread at running length `len`.
const headAt = (map: JourneyMap, len: number): [number, number] => {
  const t = map.thread;
  let lo = 0;
  let hi = t.length - 1;
  if (len <= 0) return [t[0][0], t[0][1]];
  if (len >= t[hi][2]) return [t[hi][0], t[hi][1]];
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (t[mid][2] < len) lo = mid;
    else hi = mid;
  }
  const k = (len - t[lo][2]) / (t[hi][2] - t[lo][2] || 1);
  return [
    t[lo][0] + (t[hi][0] - t[lo][0]) * k,
    t[lo][1] + (t[hi][1] - t[lo][1]) * k,
  ];
};

// The extras light in order of distance from the thread's end, as their sparks land.
const extraLands = (f: JourneySpec) => {
  const last = f.map.thread[f.map.thread.length - 1];
  const extras = f.map.extras ?? [];
  const dist = extras.map((e) => Math.hypot(e.x - last[0], e.y - last[1]));
  const far = Math.max(1, ...dist);
  return extras.map((e, k) => ({
    ...e,
    from: [last[0], last[1]] as [number, number],
    at: Math.round(f.scatter + 4 + 24 * Math.sqrt(dist[k] / far)),
  }));
};

// The pin a stop opens out of: its own, or (a Story) the one `stopPins` names, the thread
// running on through the other pins between, lighting them as it passes.
const pinOf = (f: JourneySpec, i: number) => f.map.pins[f.stopPins?.[i] ?? i];

// Where the film is on the journey at `frame`: the camera, and how much thread is drawn.
const journeyAt = (f: JourneySpec, frame: number) => {
  const { map, lands, travel, zoom } = f;
  const n = lands.length;
  const pin = (i: number): Cam => ({
    fx: pinOf(f, i).x,
    fy: pinOf(f, i).y,
    z: zoom,
    ax: W / 2,
    ay: 880,
  });
  const ends = pinOf(f, n - 1).at;
  if (frame < f.intro.dive) return { cam: FULL, drawn: 0, moving: false };
  if (frame < lands[0]) {
    const t = interpolate(frame, [f.intro.dive, lands[0]], [0, 1], {
      ...clamp,
      easing: EASE_IN_OUT,
    });
    return { cam: mix(FULL, pin(0), t), drawn: 0, moving: false };
  }
  if (frame >= f.pullBack) {
    const t = interpolate(frame, [f.pullBack, f.pullBack + 48], [0, 1], {
      ...clamp,
      easing: EASE_IN_OUT,
    });
    // The thread doesn't stop at the last hotel: it carries on north, still trailing
    // sparks, as the camera pulls back; its head bursts (`scatter`), then becomes the logo.
    const total = map.thread[map.thread.length - 1][2];
    const on = interpolate(frame, [f.pullBack, f.scatter], [0, 1], {
      ...clamp,
      easing: EASE_IN_OUT,
    });
    return {
      cam: mix(pin(n - 1), FULL, t),
      drawn: ends + (total - ends) * on,
      moving: on > 0 && on < 1,
    };
  }
  let i = 0;
  lands.forEach((l, k) => {
    if (frame >= l) i = k;
  });
  const next = i + 1;
  if (next < n && frame >= lands[next] - travel) {
    const t = interpolate(frame, [lands[next] - travel, lands[next]], [0, 1], {
      ...clamp,
      easing: EASE_IN_OUT,
    });
    const a = pinOf(f, i).at;
    const b = pinOf(f, next).at;
    const drawn = a + (b - a) * t;
    const [hx, hy] = headAt(map, drawn);
    // Long hops pull the camera back a little mid-flight, so the map reads as a map.
    const z =
      zoom / (1 + 0.55 * Math.sin(Math.PI * t) * Math.min(1, (b - a) / 220));
    return {
      cam: { fx: hx, fy: hy, z, ax: W / 2, ay: 880 },
      drawn,
      moving: true,
    };
  }
  return { cam: pin(i), drawn: pinOf(f, i).at, moving: false };
};

// A shot, full bleed: a photo with a gentle push over its time on screen, or a clip.
const Shot: React.FC<{ shot: JourneyShot; frames: number; push: number }> = ({
  shot,
  frames,
  push,
}) => {
  const frame = useCurrentFrame();
  if (shot.kind === "video") {
    return (
      <Video
        src={staticFile(shot.src)}
        trimBefore={Math.round((shot.from ?? 0) * 30)}
        playbackRate={shot.rate ?? 1}
        muted
        objectFit="cover"
        style={{ width: "100%", height: "100%" }}
      />
    );
  }
  const [sw, sh] = shot.size!;
  const crop = shot.crop!;
  const ch = crop.h ?? sh;
  const cw = (ch * W) / H;
  const cy = crop.cy ?? sh / 2;
  const k = H / ch;
  const z = interpolate(frame, [0, frames], [1, push], clamp);
  return (
    <AbsoluteFill style={{ transform: `scale(${z})` }}>
      <Img
        src={staticFile(shot.src)}
        style={{
          position: "absolute",
          width: sw * k,
          height: sh * k,
          left: -(crop.cx - cw / 2) * k,
          top: -(cy - ch / 2) * k,
        }}
      />
    </AbsoluteFill>
  );
};

// The hotel, bottom-left over a scrim, in the house style (the skill's "Hotel name and
// location", Scott 21 Oct: the journey reel brought into it): the place on top in small
// gold Open Sans caps with the still 2px gold underline the width of the words, the
// hotel's full name under it large in cream Cormorant. A long name wraps evenly onto a
// second line, inside the right-hand safe zone.
const Tag: React.FC<{ name: string; place: string; from: number }> = ({
  name,
  place,
  from,
}) => {
  const frame = useCurrentFrame();
  const p = progress(frame, from, OPEN, EASE_OUT);
  const lift = "0 3px 28px rgba(9,9,10,0.6), 0 1px 3px rgba(9,9,10,0.5)";
  return (
    <>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(9,9,10,0) 46%, rgba(9,9,10,0.5) 60%, rgba(9,9,10,0.62) 78%, rgba(9,9,10,0.3) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 72,
          bottom: 470,
          maxWidth: 888,
          opacity: p,
          transform: `translateY(${(1 - p) * 10}px)`,
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontWeight: 600,
            fontSize: 26,
            letterSpacing: "0.26em",
            textTransform: "uppercase",
            color: colors.gold,
            textShadow:
              "0 1px 3px rgba(9,9,10,0.6), 0 0 18px rgba(9,9,10,0.55)",
          }}
        >
          <span
            style={{
              display: "inline-block",
              whiteSpace: "nowrap",
              paddingBottom: 10,
              borderBottom: `2px solid ${colors.gold}`,
            }}
          >
            <span style={{ marginRight: "-0.26em" }}>{place}</span>
          </span>
        </div>
        <div
          style={{
            fontFamily: serif,
            fontWeight: 500,
            fontSize: 76,
            lineHeight: 1.02,
            marginTop: 22,
            textWrap: "balance", // a long name splits evenly, never one word alone
            color: colors.cream,
            textShadow: lift,
          }}
        >
          {name}
        </div>
      </div>
    </>
  );
};

// The map: Ireland in the dark, Britain's coastline drawn in gold (revealed from the
// south as the film opens), the thread so far with a glow, and the pins: faint until the
// thread reaches them, then lit.
const MapLayer: React.FC<{
  film: JourneySpec;
  cam: Cam;
  drawn: number;
  frame: number;
}> = ({ film, cam, drawn, frame }) => {
  const { map } = film;
  const reveal = interpolate(frame, [0, 52], [H + 200, -200], {
    ...clamp,
    easing: EASE_OUT,
  });
  const done = map.thread
    .filter((p) => p[2] <= drawn)
    .map((p) => `${p[0]},${p[1]}`);
  const [hx, hy] = headAt(map, drawn);
  const thread = [...done, `${hx},${hy}`].join(" ");
  const pinsIn = (i: number) => progress(frame, 20 + i * 2.4, 10);
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="reveal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="white" stopOpacity={0} />
          <stop offset="1" stopColor="white" stopOpacity={1} />
        </linearGradient>
        <mask
          id="coast"
          maskUnits="userSpaceOnUse"
          x={-4000}
          y={-4000}
          width={9000}
          height={9000}
        >
          <rect x={-4000} y={reveal} width={9000} height={9000} fill="white" />
          <rect
            x={-4000}
            y={reveal - 260}
            width={9000}
            height={260}
            fill="url(#reveal)"
          />
        </mask>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={6} />
        </filter>
        <radialGradient id="pinglow">
          <stop offset="0" stopColor="#FFF3D6" stopOpacity={0.9} />
          <stop offset="0.4" stopColor={colors.lightGold} stopOpacity={0.45} />
          <stop offset="1" stopColor={colors.gold} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g
        transform={`translate(${cam.ax} ${cam.ay}) scale(${cam.z}) translate(${-cam.fx} ${-cam.fy})`}
      >
        <path
          d={map.ireland}
          fill="#12100d"
          stroke={colors.gold}
          strokeOpacity={0.3}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
        <g mask="url(#coast)">
          <path
            d={map.uk}
            fill="none"
            stroke={colors.lightGold}
            strokeOpacity={0.35}
            strokeWidth={6}
            vectorEffect="non-scaling-stroke"
            filter="url(#glow)"
          />
          <path
            d={map.uk}
            fill="#1d1913"
            stroke={colors.gold}
            strokeOpacity={0.95}
            strokeWidth={1.7}
            vectorEffect="non-scaling-stroke"
          />
        </g>
        {drawn > 0 ? (
          <>
            <polyline
              points={thread}
              fill="none"
              stroke={colors.lightGold}
              strokeOpacity={0.6}
              strokeWidth={9}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              filter="url(#glow)"
            />
            <polyline
              points={thread}
              fill="none"
              stroke={colors.gold}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </>
        ) : null}
        {extraLands(film).map((e) => {
          const age = frame - e.at;
          if (age < 0) return null;
          const pop = interpolate(age, [0, 5, 10], [0, 1.4, 1], clamp);
          return (
            <g key={e.id}>
              <circle
                cx={e.x}
                cy={e.y}
                r={(26 / cam.z) * pop}
                fill="url(#pinglow)"
              />
              <circle
                cx={e.x}
                cy={e.y}
                r={(6 / cam.z) * pop}
                fill="#FFF3D6"
                stroke={colors.gold}
                strokeWidth={2}
                vectorEffect="non-scaling-stroke"
              />
            </g>
          );
        })}
        {map.pins.map((p, i) => {
          const lit = drawn >= p.at - 0.5 && frame >= film.lands[0] - 2;
          const r = (lit ? 7 : 5.5) / cam.z;
          return (
            <g key={p.id} opacity={pinsIn(i)}>
              <circle
                cx={p.x}
                cy={p.y}
                r={(lit ? 30 : 16) / cam.z}
                fill="url(#pinglow)"
                opacity={lit ? 1 : 0.55}
              />
              <circle
                cx={p.x}
                cy={p.y}
                r={r * (0.6 + 0.4 * pinsIn(i))}
                fill={lit ? "#FFF3D6" : colors.gold}
                stroke={colors.gold}
                strokeWidth={lit ? 2 : 0}
                vectorEffect="non-scaling-stroke"
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
};

// Gold particles, all deterministic: dust drifting up through the whole film, a trail
// shed by the thread's head as it travels, and a burst from each pin as its shot opens.
const Particles: React.FC<{ film: JourneySpec; frame: number; cam: Cam }> = ({
  film,
  frame,
  cam,
}) => {
  const dots: { x: number; y: number; r: number; o: number }[] = [];
  // the dust clears as the lights fly into the CB, so the end card is black with only the
  // logo (Scott: no gold specks left on it)
  const beat = film.beat ?? 15.65;
  const dust = interpolate(
    frame,
    [film.endAt, film.endAt + 2.6 * beat],
    [1, 0],
    clamp,
  );
  for (let k = 0; k < 56; k++) {
    const speed = 0.4 + random(`ds${k}`) * 1.1;
    const y =
      ((((random(`dy${k}`) * (H + 100) - frame * speed) % (H + 100)) +
        H +
        100) %
        (H + 100)) -
      50;
    const x = random(`dx${k}`) * W + Math.sin(frame / 40 + k) * 10;
    const tw =
      0.5 + 0.5 * Math.sin(frame / (9 + random(`dw${k}`) * 14) + k * 2.1);
    dots.push({
      x,
      y,
      r: 1.2 + random(`dr${k}`) * 2.6,
      o: (0.12 + 0.38 * tw) * dust,
    });
  }
  // The trail: sparks shed at the head over the last 16 frames, drifting off as they fade.
  const { lands, travel, map } = film;
  for (let age = 0; age < 16; age++) {
    const at = frame - age;
    const j = journeyAt(film, at);
    if (!j.moving) continue;
    const [hx, hy] = headAt(map, j.drawn);
    const [sx, sy] = toScreen(cam, hx, hy);
    for (let s = 0; s < 3; s++) {
      const a = random(`ta${at}-${s}`) * Math.PI * 2;
      const v = 0.6 + random(`tv${at}-${s}`) * 2.2;
      dots.push({
        x: sx + Math.cos(a) * v * age,
        y: sy + Math.sin(a) * v * age + age * 0.6,
        r: 1.6 + random(`tr${at}-${s}`) * 2.4 * (1 - age / 16),
        o: 0.9 * (1 - age / 16),
      });
    }
  }
  // The bursts: from each pin as its shot opens, fast at first, settling as they fade.
  lands.forEach((l, i) => {
    const age = frame - (l - 2);
    if (age < 0 || age > 26) return;
    const [px, py] = toScreen(cam, pinOf(film, i).x, pinOf(film, i).y);
    for (let s = 0; s < 30; s++) {
      const a = (s / 30) * Math.PI * 2 + random(`ba${i}-${s}`) * 0.4;
      const v = 6 + random(`bv${i}-${s}`) * 16;
      const d = v * (1 - Math.exp(-age / 7)) * 7;
      dots.push({
        x: px + Math.cos(a) * d,
        y: py + Math.sin(a) * d,
        r: 1.5 + random(`br${i}-${s}`) * 3,
        o: interpolate(age, [0, 4, 26], [0, 1, 0], clamp),
      });
    }
  });
  // The scatter: the head bursts, and a spark flies out on a gentle arc to each of the
  // collection's other hotels, a short trail behind it and a small pop where it lands.
  const tail = map.thread[map.thread.length - 1];
  const age = frame - film.scatter;
  if (age >= 0 && age <= 30) {
    const [px, py] = toScreen(cam, tail[0], tail[1]);
    for (let s = 0; s < 44; s++) {
      const a = (s / 44) * Math.PI * 2 + random(`ea${s}`) * 0.3;
      const v = 8 + random(`ev${s}`) * 18;
      const d = v * (1 - Math.exp(-age / 8)) * 8;
      dots.push({
        x: px + Math.cos(a) * d,
        y: py + Math.sin(a) * d,
        r: 1.6 + random(`er${s}`) * 3.4,
        o: interpolate(age, [0, 4, 30], [0, 1, 0], clamp),
      });
    }
  }
  extraLands(film).forEach((e, k) => {
    const fly = e.at - film.scatter;
    const along = (t: number): [number, number] => {
      const dx = e.x - e.from[0];
      const dy = e.y - e.from[1];
      const bend = Math.sin(Math.PI * t) * 0.18 * (k % 2 ? 1 : -1);
      return toScreen(
        cam,
        e.from[0] + dx * t - dy * bend,
        e.from[1] + dy * t + dx * bend,
      );
    };
    if (age >= 0 && frame < e.at) {
      const t = EASE_OUT(age / fly);
      for (let q = 0; q < 5; q++) {
        const [x, y] = along(Math.max(0, t - q * 0.05));
        dots.push({ x, y, r: 3.2 - q * 0.5, o: 1 - q * 0.18 });
      }
    }
    const pop = frame - e.at;
    if (pop >= 0 && pop <= 14) {
      const [x, y] = along(1);
      for (let s = 0; s < 8; s++) {
        const a = (s / 8) * Math.PI * 2;
        const d = 22 * (1 - Math.exp(-pop / 4));
        dots.push({
          x: x + Math.cos(a) * d,
          y: y + Math.sin(a) * d,
          r: 1.6,
          o: interpolate(pop, [0, 2, 14], [0, 1, 0], clamp),
        });
      }
    }
  });
  void travel;
  return (
    <svg
      width={W}
      height={H}
      style={{ position: "absolute", inset: 0, mixBlendMode: "screen" }}
    >
      <defs>
        <radialGradient id="mote">
          <stop offset="0" stopColor="#FFF6DC" stopOpacity={1} />
          <stop offset="0.35" stopColor={colors.lightGold} stopOpacity={0.6} />
          <stop offset="1" stopColor={colors.gold} stopOpacity={0} />
        </radialGradient>
      </defs>
      {dots.map((d, i) => (
        <circle
          key={i}
          cx={d.x}
          cy={d.y}
          r={d.r * 2.4}
          fill="url(#mote)"
          opacity={d.o}
        />
      ))}
    </svg>
  );
};

// The music as parts: the file from `startAt`, then from each edit's `from` at its frame.
const musicParts = (film: JourneySpec) => {
  const cuts = [
    { at: 0, from: film.music.startAt / 30 },
    ...(film.music.edits ?? []),
  ];
  return cuts.map((c, i) => ({
    ...c,
    to: cuts[i + 1]?.at ?? film.durationInFrames,
    // half the crossfade at each cut, in frames
    xin: i === 0 ? 0 : 1,
    xout: i < cuts.length - 1 ? 1 : 0,
  }));
};

export const JourneyFilm: React.FC<{ film: JourneySpec }> = ({ film }) => {
  const frame = useCurrentFrame();
  const { cam, drawn } = journeyAt(film, frame);
  const { lands, travel, stops, map } = film;
  const n = stops.length;
  const closeAt = (i: number) =>
    i < n - 1 ? lands[i + 1] - travel : film.pullBack;
  // The end (Scott: "the CBH lights from the map"): every lit pin lifts off the map on a
  // beat and flies into the CB, the map falling away beneath them (LightsToCB.tsx).
  const beat = film.beat ?? 15.65;
  const end = interpolate(
    frame,
    [film.endAt + 2, film.endAt + 2.6 * beat],
    [0, 1],
    {
      ...clamp,
      easing: EASE_IN_OUT,
    },
  );
  const lineIn = progress(frame, 8, 22);
  const lineOut = interpolate(
    frame,
    [film.intro.dive - 14, film.intro.dive],
    [1, 0],
    clamp,
  );
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      {musicParts(film).map((part) => (
        <Sequence
          key={part.at}
          from={part.at - part.xin}
          durationInFrames={part.to - part.at + part.xin + part.xout}
        >
          <Audio
            src={staticFile(film.music.src)}
            trimBefore={Math.round(part.from * 30) - part.xin}
            volume={(lf) => {
              const f = lf + part.at - part.xin;
              return (
                film.music.gain *
                // a two frame crossfade at each cut, so it doesn't click
                (part.xin
                  ? interpolate(f, [part.at - 1, part.at + 1], [0, 1], clamp)
                  : 1) *
                (part.xout
                  ? interpolate(f, [part.to - 1, part.to + 1], [1, 0], clamp)
                  : 1) *
                interpolate(f, [0, film.music.fadeIn], [0, 1], clamp) *
                interpolate(
                  f,
                  [film.music.fadeFrom, film.durationInFrames],
                  [1, 0],
                  { ...clamp, easing: Easing.in(Easing.quad) },
                )
              );
            }}
          />
        </Sequence>
      ))}
      <AbsoluteFill
        style={{
          opacity: 1 - end,
          transform: `scale(${1 - 0.08 * end})`,
          transformOrigin: "50% 48%",
        }}
      >
        <MapLayer film={film} cam={cam} drawn={drawn} frame={frame} />
      </AbsoluteFill>
      {stops.map((stop, i) => {
        const from = lands[i] - 2;
        const to = closeAt(i) + CLOSE;
        if (frame < from || frame >= to) return null;
        const open = interpolate(frame, [from, from + OPEN], [0, 1], {
          ...clamp,
          easing: EASE_OUT,
        });
        const shut = interpolate(
          frame,
          [closeAt(i), closeAt(i) + CLOSE],
          [1, 0],
          {
            ...clamp,
            easing: EASE_IN_OUT,
          },
        );
        const [px, py] = toScreen(cam, pinOf(film, i).x, pinOf(film, i).y);
        // Sized to the frame's farthest corner from the pin, so the whole open and fold
        // are seen (a bigger circle would spend most of its time off-frame).
        const reach = Math.max(
          ...[
            [0, 0],
            [W, 0],
            [0, H],
            [W, H],
          ].map(([x, y]) => Math.hypot(x - px, y - py)),
        );
        const r = (reach + 8) * Math.min(open, shut);
        return (
          <Sequence
            key={stop.shot.src}
            from={from}
            durationInFrames={to - from}
          >
            <AbsoluteFill
              style={{ clipPath: `circle(${r}px at ${px}px ${py}px)` }}
            >
              <Shot shot={stop.shot} frames={to - from} push={film.push} />
              {/* In sync with the burst and the open (Scott: it came a second late). */}
              <Tag {...stop.tag} from={0} />
            </AbsoluteFill>
            {r > 2 && r < reach - 4 ? (
              <svg
                width={W}
                height={H}
                style={{ position: "absolute", inset: 0 }}
              >
                <circle
                  cx={px}
                  cy={py}
                  r={r}
                  fill="none"
                  stroke={colors.lightGold}
                  strokeWidth={3}
                  opacity={0.9}
                />
              </svg>
            ) : null}
          </Sequence>
        );
      })}
      <Particles film={film} frame={frame} cam={cam} />
      <div
        style={{
          // In the North Sea, beside Scotland, clear of the coastline.
          position: "absolute",
          top: 430,
          left: 590,
          textAlign: "left",
          fontFamily: serif,
          fontStyle: "italic",
          fontSize: 78,
          lineHeight: 1.04,
          color: colors.cream,
          opacity: lineIn * lineOut,
          transform: `translateY(${(1 - lineIn) * 24}px)`,
          textShadow: "0 4px 40px rgba(9,9,10,0.8)",
        }}
      >
        {film.intro.lines.map((l) => (
          <div key={l}>{l}</div>
        ))}
      </div>
      {film.watermark ? (
        <Img
          src={staticFile(film.watermark.src)}
          style={{
            position: "absolute",
            left: film.watermark.x,
            top: film.watermark.y,
            width: film.watermark.size[0],
            height: film.watermark.size[1],
            // Held steady while the hotels play: in as the first opens, out as the camera
            // pulls back (on the full map it would sit on Kent).
            opacity:
              progress(frame, film.lands[0] - 16, 14) *
              interpolate(
                frame,
                [film.pullBack, film.pullBack + 14],
                [1, 0],
                clamp,
              ),
          }}
        />
      ) : null}
      {frame >= film.endAt ? (
        <LightsToCB
          frame={frame - film.endAt}
          beat={beat}
          origins={[...map.pins, ...(map.extras ?? [])].map((p) => {
            const [x, y] = toScreen(cam, p.x, p.y);
            return { x, y };
          })}
        />
      ) : null}
      <FilmFinish />
    </AbsoluteFill>
  );
};
