import { Audio } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { FilmFinish } from "../components/FilmFinish";
import { colors, EASE_IN_OUT, progress, sans, serif } from "../theme";

// "Winter weekends" (Scott, 5 Nov, from the Instagram grid on his phone: "a reel like this, like a
// photo album on the phone, and can do shifted moves"): a phone's photo album (a generic one in the
// CBH black and gold, not any maker's look) holding a winter of weekends away, a section a weekend,
// each headed by its date and the house label. It opens on the whole album at six across (the
// cover: a weekend a row), a pinch spreads it to three across (every tile sliding to its new place: the shifted
// move), a tap opens a weekend's first shot full screen on the drop, a swipe pages to the next, a
// swipe down sends it back into its tile, a flick scrolls on to the next weekend. After the fifth,
// the album runs on to "Next weekend": one empty slot. A pinch draws it all back into one wall
// (the tiles reflowing), the question rises over it and the empty slot lights on the track's
// last hit. Real speed everywhere (no slow motion), the thumb a soft ring as in a screen recording.

const W = 1080;
const H = 1920;
export const ROLL_FPS = 30;
const D = "campaigns/camera-roll";
const P = (s: string) => `${D}/posters/${s}.jpg`;

type Item = { src: string; poster?: string; still?: boolean; pos?: string; dur?: string };
type Trip = { date: string; long: string; place?: string; hotel?: string; items: Item[] };

const clip = (hotelPath: string, poster: string, dur: string): Item => ({
  src: `hotels/${hotelPath}.mp4`,
  poster: P(poster),
  dur,
});
const still = (src: string, pos = "50% 50%"): Item => ({ src: `hotels/${src}`, still: true, pos });

// Five weekends, a hotel each, autumn into winter; the first two items of each are the ones opened.
const TRIPS: Trip[] = [
  {
    date: "Sat 7 Nov",
    long: "Saturday 7 November",
    place: "NORTH WALES",
    hotel: "Ruthin Castle Hotel & Spa",
    items: [
      clip("ruthin-castle/sumac-and-ruins", "ruthin-castle-sumac-and-ruins", "0:02"),
      clip("ruthin-castle/hot-tub", "ruthin-castle-hot-tub", "0:02"),
      still("ruthin-castle/castle.jpg", "50% 50%"),
      still("ruthin-castle/peacock.jpg", "60% 50%"),
      still("ruthin-castle/fireside-plate.jpg", "55% 50%"),
      still("ruthin-castle/white-bed.jpg", "30% 50%"),
    ],
  },
  {
    date: "Sat 14 Nov",
    long: "Saturday 14 November",
    place: "RUTLAND",
    hotel: "Rutland Hall Hotel & Spa",
    items: [
      clip("rutland-hall/screen-time/lake-sunset", "rutland-hall-lake-sunset", "0:02"),
      clip("rutland-hall/screen-time/candlelit-bath", "rutland-hall-candlelit-bath", "0:04"),
      clip("rutland-hall/screen-time/suite-beds", "rutland-hall-suite-beds", "0:02"),
      clip("rutland-hall/screen-time/loungers", "rutland-hall-loungers", "0:02"),
      clip("rutland-hall/spa-baths", "rutland-hall-spa-baths", "0:04"),
      clip("rutland-hall/screen-time/treatment-bed", "rutland-hall-treatment-bed", "0:02"),
    ],
  },
  {
    date: "Sat 21 Nov",
    long: "Saturday 21 November",
    place: "HALIFAX, WEST YORKSHIRE",
    hotel: "Holdsworth House Hotel",
    items: [
      still("holdsworth-house/tea-by-the-fire.jpg", "42% 50%"),
      still("holdsworth-house/breakfast-in-bed.jpg", "50% 50%"),
      still("holdsworth-house/main-hall.jpg", "50% 50%"),
      still("holdsworth-house/dinner.jpg", "55% 50%"),
      still("holdsworth-house/afternoon-tea.jpg", "30% 50%"),
      still("holdsworth-house/spa.jpg", "50% 50%"),
    ],
  },
  {
    date: "Sat 28 Nov",
    long: "Saturday 28 November",
    place: "WINDERMERE, LAKE DISTRICT",
    hotel: "Low Wood Bay Resort & Spa",
    items: [
      clip("low-wood-bay/screen-time/misty-lake-4s", "low-wood-bay-misty-lake-4s", "0:04"),
      clip("low-wood-bay/screen-time/quartet-4s", "low-wood-bay-quartet-4s", "0:04"),
      clip("low-wood-bay/screen-time/candles", "low-wood-bay-candles", "0:02"),
      clip("low-wood-bay/screen-time/cello", "low-wood-bay-cello", "0:02"),
      clip("low-wood-bay/screen-time/snowy-rooftops", "low-wood-bay-snowy-rooftops", "0:02"),
      clip("low-wood-bay/screen-time/misty-lake", "low-wood-bay-misty-lake", "0:02"),
    ],
  },
  {
    date: "Sat 5 Dec",
    long: "Saturday 5 December",
    place: "NORTH YORKSHIRE",
    hotel: "Gisborough Hall",
    items: [
      clip("gisborough-hall/screen-time/misty-sunrise", "gisborough-hall-misty-sunrise", "0:02"),
      clip("gisborough-hall/screen-time/snowy-garden", "gisborough-hall-snowy-garden", "0:02"),
      clip("gisborough-hall/screen-time/bedroom", "gisborough-hall-bedroom", "0:02"),
      clip("gisborough-hall/screen-time/fireplace", "gisborough-hall-fireplace", "0:02"),
      clip("gisborough-hall/screen-time/lit-doorway", "gisborough-hall-lit-doorway", "0:02"),
      clip("gisborough-hall/screen-time/misty-lawn", "gisborough-hall-misty-lawn", "0:02"),
    ],
  },
];
// the album runs on to next weekend: one empty slot
const NEXT = { date: "Next weekend" };
const SECTIONS = TRIPS.length + 1;

// ---- the beat grid: Upbeat Dance Pop Infectious (toolikes, Pixabay 225269), 128 BPM, the music
// edit from `scripts/camera-roll-prep.sh`: the film opens four beats before the groove's first kick
// (film beat 0), and the track's own final hit lands on film beat 48.
const BEAT = 0.46873 * ROLL_FPS; // 14.06 frames
const b = (n: number) => Math.round((n + 4) * BEAT);
const TRIP_AT = (k: number) => 8 * k; // the beat each weekend opens on
const END_SCROLL = 38.3; // to Next weekend
const PINCH1 = 40; // three across back to six: the whole winter in one wall
const LINE = 44;
const HIT = 48; // the track's last hit: the empty slot lights
export const ROLL_FRAMES = b(54.6);

// ---- the album's layout, for any number across
const TOP = 420; // where the album starts on screen, under its title
const G = 4;
type Rect = { x: number; y: number; w: number; h: number };
const lerp = (a: number, c: number, t: number) => a + (c - a) * t;
const lerpRect = (a: Rect, c: Rect, t: number): Rect => ({
  x: lerp(a.x, c.x, t),
  y: lerp(a.y, c.y, t),
  w: lerp(a.w, c.w, t),
  h: lerp(a.h, c.h, t),
});
const FULL: Rect = { x: 0, y: 0, w: W, h: H };
const GOLD = (a: number) => `rgba(195,158,85,${a})`;
const CREAM = (a: number) => `rgba(245,239,227,${a})`;

type Layout = { head: number[]; headScale: number; tiles: Rect[][] };
const layoutFor = (cols: number): Layout => {
  const size = (W - G * (cols - 1)) / cols;
  const headH = cols <= 3 ? 196 : cols <= 5 ? 150 : 112;
  const headScale = cols <= 3 ? 1 : cols <= 5 ? 0.8 : 0.62;
  const after = cols <= 3 ? 36 : cols <= 5 ? 30 : 22;
  let y = 0;
  const head: number[] = [];
  const tiles: Rect[][] = [];
  for (let s = 0; s < SECTIONS; s++) {
    head.push(y);
    y += headH;
    const n = s < TRIPS.length ? TRIPS[s].items.length : 1;
    const row: Rect[] = [];
    for (let i = 0; i < n; i++) {
      row.push({ x: (i % cols) * (size + G), y: y + Math.floor(i / cols) * (size + G), w: size, h: size });
    }
    tiles.push(row);
    y += Math.ceil(n / cols) * (size + G) - G + after;
  }
  return { head, headScale, tiles };
};
const L3 = layoutFor(3);
const L6 = layoutFor(6);

// scroll that puts weekend k's header just under the title
const scrollTo3 = (k: number) => L3.head[k] - 0;
// scroll that puts the empty slot's centre at screen y `cy`
const slotScroll = (L: Layout, cy: number) => {
  const t = L.tiles[TRIPS.length][0];
  return TOP + t.y + t.h / 2 - cy;
};

const ease = (f: number, a: number, d: number) => progress(f, a, d, EASE_IN_OUT);

// the album state at a frame: two layouts, how far between them, and the scroll
const albumAt = (frame: number) => {
  // pinches: [start beat, length in beats, from, to]
  const pinches: [number, number, Layout, Layout][] = [
    [-2.7, 1.3, L6, L3],
    [PINCH1, 1.5, L3, L6],
  ];
  let from = L6;
  let to = L6;
  let t = 0;
  for (const [at, len, a, c] of pinches) {
    if (frame >= b(at)) {
      from = a;
      to = c;
      t = ease(frame, b(at), b(at + len) - b(at));
    }
  }
  // scroll keys (frame, value), eased between
  const keys: [number, number][] = [
    [0, 0],
    [b(-2.7), 0],
    [b(-1.4), scrollTo3(0)],
  ];
  for (let k = 1; k < TRIPS.length; k++) {
    keys.push([b(TRIP_AT(k - 1) + 6.25), scrollTo3(k - 1)]);
    keys.push([b(TRIP_AT(k - 1) + 7.2), scrollTo3(k)]);
  }
  keys.push([b(END_SCROLL), scrollTo3(TRIPS.length - 1)]);
  keys.push([b(END_SCROLL + 1), slotScroll(L3, 1180)]);
  keys.push([b(PINCH1), slotScroll(L3, 1180)]);
  keys.push([b(PINCH1 + 1.5), slotScroll(L6, 1470)]);
  keys.push([ROLL_FRAMES, slotScroll(L6, 1430)]); // a slow drift through the hold
  let scroll = keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [f0, v0] = keys[i - 1];
    const [f1, v1] = keys[i];
    if (frame >= f0) scroll = f1 > f0 ? lerp(v0, v1, ease(frame, f0, f1 - f0)) : v1;
  }
  const tile = (s: number, i: number): Rect => {
    const r = lerpRect(from.tiles[s][i], to.tiles[s][i], t);
    return { ...r, y: TOP + r.y - scroll };
  };
  const head = (s: number) => TOP + lerp(from.head[s], to.head[s], t) - scroll;
  const headScale = lerp(from.headScale, to.headScale, t);
  return { tile, head, headScale };
};

// a photo or clip's picture, framed as a portrait 9:16 and scaled into a rect (the tile shows the
// middle square of exactly what the viewer shows full screen, so the hand-over never jumps)
const Picture: React.FC<{ item: Item; r: Rect; push?: number; playFrom?: number; videoOn?: number }> = ({
  item,
  r,
  push = 1,
  playFrom,
  videoOn = 1,
}) => {
  const scale = Math.max(r.w / W, r.h / H) * push;
  return (
    <div style={{ position: "absolute", left: r.x, top: r.y, width: r.w, height: r.h, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: W,
          height: H,
          transform: `translate(-50%, -50%) scale(${scale})`,
        }}
      >
        <Img
          src={staticFile(item.still ? item.src : item.poster!)}
          style={{ width: W, height: H, objectFit: "cover", objectPosition: item.pos ?? "50% 50%" }}
        />
        {playFrom !== undefined && !item.still ? (
          <Sequence from={playFrom} layout="none">
            <OffthreadVideo
              src={staticFile(item.src)}
              muted
              style={{ position: "absolute", left: 0, top: 0, width: W, height: H, opacity: videoOn }}
            />
          </Sequence>
        ) : null}
      </div>
    </div>
  );
};

// a weekend's header: the date, then the house label (gold caps place over its underline, the name
// in cream Cormorant)
const Header: React.FC<{ s: number; y: number; scale: number }> = ({ s, y, scale }) => {
  const trip = s < TRIPS.length ? TRIPS[s] : undefined;
  return (
    <div style={{ position: "absolute", left: 40, top: y + 34 * scale, transformOrigin: "0 0",
      transform: `scale(${scale})`, whiteSpace: "nowrap" }}>
      <div style={{ fontFamily: sans, fontSize: 25, fontWeight: 600, color: CREAM(0.55), letterSpacing: "0.02em" }}>
        {trip ? trip.date : NEXT.date}
      </div>
      {trip ? (
        <>
          <div style={{ display: "inline-block", marginTop: 16 }}>
            <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 22, letterSpacing: "0.24em", color: colors.gold }}>
              {trip.place}
            </div>
            <div style={{ height: 2, marginTop: 8, background: colors.gold }} />
          </div>
          <div style={{ fontFamily: serif, fontSize: 50, lineHeight: 1.1, marginTop: 6, color: colors.cream }}>
            {trip.hotel}
          </div>
        </>
      ) : null}
    </div>
  );
};

// one weekend opened: the tap opens its first shot full screen, a swipe pages to the second, a
// swipe down sends it back into its tile
const Viewer: React.FC<{ k: number; tileRect: (i: number) => Rect }> = ({ k, tileRect }) => {
  const frame = useCurrentFrame();
  const T = TRIP_AT(k);
  const trip = TRIPS[k];
  const [A, Bi] = trip.items;
  const open0 = b(T - 0.6);
  const open1 = b(T);
  const swipe0 = b(T + 2.5);
  const swipe1 = b(T + 3);
  const dis0 = b(T + 5.45);
  const dis1 = b(T + 6);
  if (frame < open0 || frame >= dis1) return null;
  const o = ease(frame, open0, open1 - open0);
  const sw = ease(frame, swipe0, swipe1 - swipe0);
  const d = ease(frame, dis0, dis1 - dis0);
  const pageW = W + 40;
  const aRect = { ...lerpRect(tileRect(0), FULL, o), x: lerp(tileRect(0).x, 0, o) - sw * pageW };
  // the swipe down: the shot follows the thumb down a little, then flies home to its tile
  const drag = Math.sin(Math.PI * Math.min(1, d * 1.4)) * 60 * (1 - d);
  const bFull = { ...FULL, x: (1 - sw) * pageW };
  const bRect = lerpRect(bFull, tileRect(1), d);
  bRect.y += drag;
  const back = o * (1 - d);
  const chrome = progress(frame, open1 - 3, 8) * (1 - progress(frame, dis0, 6));
  const pushA = A.still ? lerp(1, 1.06, progress(frame, open0, swipe1 - open0, (x) => x)) : 1;
  const pushB = Bi.still ? lerp(1, 1.06, progress(frame, swipe0, dis1 - swipe0, (x) => x)) : 1;
  const label = progress(frame, open1 + 4, 14) * (1 - progress(frame, swipe0 - 8, 8));
  const current = frame < (swipe0 + swipe1) / 2 ? 0 : 1;
  return (
    <AbsoluteFill style={{ zIndex: 10 }}>
      <AbsoluteFill style={{ backgroundColor: colors.black, opacity: back }} />
      {frame < swipe1 ? <Picture item={A} r={aRect} push={pushA} playFrom={open0} /> : null}
      {frame >= swipe0 ? (
        <Picture item={Bi} r={bRect} push={pushB} playFrom={swipe0} videoOn={1 - progress(frame, dis0, dis1 - dis0)} />
      ) : null}
      {/* the viewer's own chrome: the date above, a strip of the weekend's shots below */}
      <div style={{ position: "absolute", top: 236, width: "100%", textAlign: "center", fontFamily: sans,
        fontSize: 27, fontWeight: 600, color: CREAM(0.9), opacity: chrome, textShadow: "0 2px 14px rgba(0,0,0,0.6)" }}>
        {trip.long}
      </div>
      <div style={{ position: "absolute", top: 1600, left: 0, width: "100%", display: "flex", justifyContent: "center",
        gap: 4, opacity: chrome }}>
        {trip.items.map((it, i) => {
          const wide = i === current;
          return (
            <div key={i} style={{ position: "relative", width: wide ? 84 : 56, height: 84, overflow: "hidden",
              border: wide ? `2px solid ${CREAM(0.9)}` : "none", boxSizing: "border-box" }}>
              <Img src={staticFile(it.still ? it.src : it.poster!)}
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: it.pos ?? "50% 50%" }} />
            </div>
          );
        })}
      </div>
      {/* the house label on the weekend's first shot */}
      {label > 0 ? (
        <>
          <AbsoluteFill style={{ opacity: label, background:
            "linear-gradient(to bottom, rgba(9,9,10,0) 52%, rgba(9,9,10,0.62) 70%, rgba(9,9,10,0.66) 80%, rgba(9,9,10,0) 88%)" }} />
          <div style={{ position: "absolute", left: 72, bottom: 560, opacity: label,
            transform: `translateY(${(1 - label) * 18}px)` }}>
            <div style={{ display: "inline-block" }}>
              <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 28, letterSpacing: "0.24em", color: colors.gold,
                textShadow: "0 2px 16px rgba(9,9,10,0.7)" }}>{trip.place}</div>
              <div style={{ height: 2, marginTop: 12, background: colors.gold }} />
            </div>
            <div style={{ fontFamily: serif, fontSize: 66, lineHeight: 1.1, marginTop: 14, color: colors.cream,
              textShadow: "0 2px 22px rgba(9,9,10,0.55)" }}>{trip.hotel}</div>
          </div>
        </>
      ) : null}
    </AbsoluteFill>
  );
};

// the thumb: soft rings, as in a screen recording
type Touch = { x: number; y: number; on: number; down: boolean };
const touchesAt = (frame: number, tileRect: (k: number, i: number) => Rect): Touch[] => {
  const out: Touch[] = [];
  const show = (a: number, z: number) => progress(frame, a - 4, 6) * (1 - progress(frame, z, 6));
  // pinches: two fingers apart (zoom in) or together (zoom out)
  const pinch = (at: number, len: number, spread: boolean) => {
    const f0 = b(at) - 4;
    const f1 = b(at + len);
    if (frame < f0 - 6 || frame > f1 + 8) return;
    const t = ease(frame, f0, f1 - f0);
    const gap = spread ? lerp(90, 330, t) : lerp(330, 90, t);
    const on = show(f0, f1);
    out.push({ x: 540 - gap, y: 1040 + gap * 0.35, on, down: true });
    out.push({ x: 540 + gap, y: 1040 - gap * 0.35, on, down: true });
  };
  pinch(-2.7, 1.3, true);
  pinch(PINCH1, 1.5, false);
  for (let k = 0; k < TRIPS.length; k++) {
    const T = TRIP_AT(k);
    // the tap on the weekend's first tile
    const r = tileRect(k, 0);
    const press = b(T - 0.62);
    if (frame >= press - 14 && frame < press + 10) {
      const reach = ease(frame, press - 12, 10);
      out.push({ x: lerp(r.x + r.w / 2 + 120, r.x + r.w / 2, reach), y: lerp(r.y + r.h / 2 + 260, r.y + r.h / 2, reach),
        on: show(press - 12, press + 2), down: frame >= press - 1 && frame < press + 4 });
    }
    // the swipe to the second shot
    const s0 = b(T + 2.5) - 3;
    const s1 = b(T + 3);
    if (frame >= s0 - 8 && frame < s1 + 8) {
      const t = ease(frame, s0, s1 - s0);
      out.push({ x: lerp(860, 220, t), y: 1080, on: show(s0 - 4, s1), down: frame >= s0 - 1 && frame <= s1 });
    }
    // the swipe down to close
    const d0 = b(T + 5.45) - 3;
    const d1 = b(T + 5.9);
    if (frame >= d0 - 8 && frame < d1 + 8) {
      const t = ease(frame, d0, d1 - d0);
      out.push({ x: 540, y: lerp(820, 1260, t), on: show(d0 - 4, d1), down: frame >= d0 - 1 && frame <= d1 });
    }
    // the flick up to the next weekend (and after the last, on to next weekend)
    const f0 = k < TRIPS.length - 1 ? b(T + 6.25) - 2 : b(END_SCROLL) - 2;
    const f1 = f0 + 8;
    if (frame >= f0 - 8 && frame < f1 + 8) {
      const t = ease(frame, f0, f1 - f0);
      out.push({ x: 600, y: lerp(1420, 820, t), on: show(f0 - 4, f1), down: frame >= f0 - 1 && frame <= f1 });
    }
  }
  return out;
};

export const CameraRoll: React.FC = () => {
  const frame = useCurrentFrame();
  const album = albumAt(frame);
  const touches = touchesAt(frame, (k, i) => album.tile(k, i));
  // which weekend is open: its two tiles hide while their shots are out
  const openK = TRIPS.findIndex((_, k) => frame >= b(TRIP_AT(k) - 0.6) && frame < b(TRIP_AT(k) + 6));
  const dim = progress(frame, b(LINE) - 6, 18);
  const line = progress(frame, b(LINE), 20);
  const lit = progress(frame, b(HIT) - 2, 6) * (1 - 0.35 * progress(frame, b(HIT) + 4, 24));
  const pop = 1 + 0.07 * Math.sin(Math.PI * progress(frame, b(HIT) - 2, 12, (x) => x));
  const title = 1 - 0.6 * dim;

  const tiles: React.ReactNode[] = [];
  for (let s = 0; s < SECTIONS; s++) {
    const hy = album.head(s);
    if (hy < H + 40 && hy > -400) {
      tiles.push(<Header key={`h${s}`} s={s} y={hy} scale={album.headScale} />);
    }
    if (s < TRIPS.length) {
      TRIPS[s].items.forEach((it, i) => {
        const r = album.tile(s, i);
        if (r.y > H || r.y + r.h < 0) return;
        if (s === openK && i < 2) return;
        tiles.push(
          <React.Fragment key={`t${s}-${i}`}>
            <Picture item={it} r={r} />
            {it.dur ? (
              <div style={{ position: "absolute", left: r.x, top: r.y + r.h - 40 * (r.w / 358), width: r.w - 12 * (r.w / 358),
                textAlign: "right", fontFamily: sans, fontWeight: 600, fontSize: 22 * (r.w / 358), color: CREAM(0.95),
                textShadow: "0 1px 8px rgba(0,0,0,0.7)" }}>{it.dur}</div>
            ) : null}
          </React.Fragment>,
        );
      });
    } else {
      // next weekend: one empty slot, a fine gold outline and a plus
      const r = album.tile(s, 0);
      const cx = r.x + r.w / 2;
      const cy = r.y + r.h / 2;
      const w = r.w * pop;
      tiles.push(
        <div key="slot" style={{ position: "absolute", left: cx - w / 2, top: cy - w / 2, width: w, height: w,
          border: `${Math.max(1.5, 2.5 * (r.w / 358))}px dashed ${GOLD(0.55 + 0.45 * lit)}`, boxSizing: "border-box",
          background: GOLD(0.05 + 0.12 * lit), zIndex: 6,
          boxShadow: lit > 0 ? `0 0 ${60 * lit}px ${GOLD(0.35 * lit)}` : "none" }}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: sans, fontWeight: 300, fontSize: 120 * (r.w / 358), color: GOLD(0.7 + 0.3 * lit), lineHeight: 1 }}>
            +
          </div>
        </div>,
      );
    }
  }

  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      {tiles}
      {/* the album's title, over a fade at the top */}
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: W, height: TOP + 10,
          background: "linear-gradient(to bottom, rgba(9,9,10,1) 0%, rgba(9,9,10,1) 90%, rgba(9,9,10,0) 100%)" }} />
        <div style={{ position: "absolute", left: 40, top: 226, opacity: title }}>
          <div style={{ fontFamily: serif, fontSize: 84, lineHeight: 1, color: colors.cream }}>Winter weekends</div>
          <div style={{ fontFamily: sans, fontSize: 24, fontWeight: 600, marginTop: 14, color: CREAM(0.5) }}>
            5 weekends away · 30 items
          </div>
        </div>
      </AbsoluteFill>
      {/* the question over the whole winter, the empty slot left lit */}
      <AbsoluteFill style={{ backgroundColor: `rgba(9,9,10,${0.72 * dim})`, zIndex: 5 }} />
      <div style={{ position: "absolute", top: 700, width: "100%", textAlign: "center", fontFamily: serif, fontSize: 100,
        lineHeight: 1.12, color: colors.cream, opacity: line, transform: `translateY(${(1 - line) * 22}px)`, zIndex: 7,
        textShadow: "0 4px 30px rgba(9,9,10,0.8)" }}>
        Room for
        <br />
        one more?
      </div>
      {openK >= 0 ? <Viewer k={openK} tileRect={(i) => album.tile(openK, i)} /> : null}
      {touches.map((t, i) => (
        <div key={i} style={{ position: "absolute", left: t.x - 34, top: t.y - 34, width: 68, height: 68, borderRadius: 34,
          border: `2px solid ${CREAM(0.7)}`, background: CREAM(t.down ? 0.26 : 0.14), opacity: t.on, zIndex: 30,
          transform: `scale(${t.down ? 0.88 : 1})`, boxShadow: "0 6px 20px rgba(0,0,0,0.35)" }} />
      ))}
      <Img src={staticFile("brand/cb-watermark.png")}
        style={{ position: "absolute", left: 920, top: 1452, width: 100, height: 108, zIndex: 25 }} />
      <Audio
        src={staticFile(`${D}/upbeat-pop-edit.m4a`)}
        volume={(f) => interpolate(f, [ROLL_FRAMES - 14, ROLL_FRAMES], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      />
      <FilmFinish />
    </AbsoluteFill>
  );
};
