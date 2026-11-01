import { Audio } from "@remotion/media";
import React from "react";
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
import { FilmFinish } from "../components/FilmFinish";
import { SCRIM } from "../footage/FootageFilm";
import { colors, EASE_IN_OUT, EASE_OUT, progress, sans, serif } from "../theme";
import {
  collageFrames,
  landings,
  placeAt,
  placeRect,
  placeShoved,
  type CollageSpec,
  type CollageState,
  type Rect,
} from "./types";

const W = 1080;
const H = 1920;
const FULL: Rect = [0, 0, W, H];
// a little past the frame's edges, so the zoomed tile fills it with room to keep pushing
const ZOOM_TO: Rect = [-40, -70, W + 80, H + 140];
// Tiles, not cards (Scott: "make sure they are tiles and not cards, we did cards already",
// the deck reel): small corners, flat, set on a grid with even gutters, sliding straight.
const RADIUS = 12;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
// Cosy autumn, as the Departures reel.
const GRADE =
  "sepia(0.36) hue-rotate(-16deg) saturate(1.12) contrast(0.97) brightness(0.97)";

type Place = {
  rect: Rect;
  radius: number;
  z: number;
  opacity: number;
  speed?: number;
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpRect = (a: Rect, b: Rect, t: number): Rect =>
  a.map((v, i) => lerp(v, b[i], t)) as Rect;

// Where every photo sits at frame `f`. Shift and slide (Scott: "it should shift and
// slide"; the pop, knock and pose snaps read as jerks): on each hit tiles slide between
// slots, new ones slide in from the nearer side of the frame, old ones slide off it, and a
// tile growing into the scene opens out to the frame's edges. Every move is one smooth
// ease in and out, fastest just before the hit and settled a few frames after it, with a
// touch of motion blur while it travels. Each tile lands on its own hit
// (`at`); the scene change and any exits on the layout's beat.
const SLIDE = Easing.bezier(0.65, 0, 0.25, 1);
const SETTLE = 3; // frames after the hit for the move to come to rest
const SHOVE = Easing.out(Easing.cubic); // knocked: full pace at once, slowing into place
const places = (film: CollageSpec, f: number) => {
  const B = film.beat;
  const S = film.states;
  const starts = S.map(
    (s) => Math.min(...landings(s)) * B - film.move + SETTLE,
  );
  const ends = S.map((s) => Math.max(...landings(s)) * B + SETTLE);
  const j = S.findIndex((_, k) => k > 0 && ends[k] > f);
  const a = j < 0 ? S[S.length - 1] : S[j - 1];
  const b = j > 0 && f >= starts[j] ? S[j] : undefined;
  const landOf = (id: string) => {
    const tp = b?.tiles[id];
    return (tp ? placeAt(tp, b!.beat) : b!.beat) * B;
  };
  // shoved tiles set off when the tile sliding into them arrives (just under halfway
  // through its move, where it covers most of the gap) and decelerate into place
  const shovedOf = (id: string) => {
    const tp = b?.tiles[id];
    return tp ? placeShoved(tp) : !!b?.shovedOff?.includes(id);
  };
  const linOf = (id: string) =>
    b
      ? interpolate(
          f,
          [
            landOf(id) - film.move * (shovedOf(id) ? 0.45 : 1) + SETTLE,
            landOf(id) + SETTLE,
          ],
          [0, 1],
          clamp,
        )
      : 0;
  const at = (s: CollageState, id: string): Place | undefined => {
    if (s.scene === id) return { rect: FULL, radius: 0, z: 0, opacity: 1 };
    const keys = Object.keys(s.tiles);
    const k = keys.indexOf(id);
    if (k < 0) return undefined;
    return {
      rect: placeRect(s.tiles[id]),
      radius: RADIUS,
      z: 10 + k,
      opacity: 1,
    };
  };
  // just off the nearer side of the frame, level with the rect
  const offside = ([x, y, w, h]: Rect): Rect =>
    x + w / 2 < W / 2 ? [-w - 60, y, w, h] : [W + 60, y, w, h];
  const ids = new Set([a.scene, ...Object.keys(a.tiles)]);
  if (b) [b.scene, ...Object.keys(b.tiles)].forEach((id) => ids.add(id));
  const out: (Place & { id: string; key?: string })[] = [];
  ids.forEach((id) => {
    const pa = at(a, id);
    const pbRaw = b ? at(b, id) : undefined;
    const lin = linOf(id);
    const t = (shovedOf(id) ? SHOVE : SLIDE)(lin);
    // travel speed (the ease's slope), for the blur in flight
    const speed = lin > 0 && lin < 1 ? Math.sin(Math.PI * lin) : 0;
    const pb = lin > 0 ? pbRaw : undefined;
    if (pa && !pb && !(b && !pbRaw && lin > 0)) return out.push({ id, ...pa });
    if (pa && pb && pa.z === 0 && pb.z > 0)
      // the scene shrinking into a tile: a copy stays full-frame underneath until the
      // photo growing in its place covers it (else black shows in the gap)
      out.push({ id, key: `${id}-under`, ...pa, z: -2 });
    if (pa && pb) {
      return out.push({
        id,
        rect: lerpRect(pa.rect, pb.rect, t),
        radius: Math.max(0, lerp(pa.radius, pb.radius, t)),
        // a tile growing into the scene stays on top until it fills the frame, then drops
        // under the tiles landing over it
        z: pb.z === 0 && pa.z > 0 ? (lin < 1 ? pa.z : 0) : Math.max(pa.z, pb.z),
        opacity: 1,
        speed,
      });
    }
    if (pa) {
      // leaving: the old scene stays put under whatever replaces it; a tile slides off
      if (pa.z === 0) return out.push({ id, ...pa, z: -1 });
      const off = offside(pa.rect);
      return out.push({
        id,
        ...pa,
        rect: lerpRect(pa.rect, off, t),
        speed,
      });
    }
    if (pb) {
      // arriving: a new scene fades up over the old; a tile slides in from the side
      if (pb.z === 0) return out.push({ id, ...pb, z: 1, opacity: t });
      const off = offside(pb.rect);
      return out.push({
        id,
        ...pb,
        rect: lerpRect(off, pb.rect, t),
        speed,
      });
    }
  });
  return out.sort((p, q) => p.z - q.z);
};

// The scene joins the choreography (Scott: "you can use the background shot on the
// choreography too"): on every landing it glides to a new framing, a sideways shift and a
// slight push, alternating, eased like the tiles so they land together.
const FRAMINGS: [number, number, number][] = [
  [0, 0, 1],
  [-42, -10, 1.03],
  [34, 12, 1.015],
  [-24, 18, 1.045],
  [40, -14, 1.02],
];
const sceneShift = (film: CollageSpec, f: number) => {
  const lands = [...new Set(film.states.slice(1).flatMap((s) => landings(s)))]
    .map((b) => b * film.beat)
    .sort((p, q) => p - q);
  const done = lands.filter((l) => l + SETTLE <= f).length;
  const next = lands[done];
  const p =
    next === undefined
      ? 0
      : SLIDE(
          interpolate(
            f,
            [next - film.move + SETTLE, next + SETTLE],
            [0, 1],
            clamp,
          ),
        );
  const A = FRAMINGS[done % FRAMINGS.length];
  const B = FRAMINGS[(done + 1) % FRAMINGS.length];
  return A.map((v, i) => lerp(v, B[i], p)) as [number, number, number];
};

// Depth without making them cards: flat tiles with a faint shadow and a fine edge; the
// scene behind drifts slowly the other way, softly out of focus and a touch darker while
// tiles sit over it. The tile layer drifts as one, like a slow camera move, so the frame
// never sits still between hits.
const Tile: React.FC<
  { film: CollageSpec; id: string; cover: number } & Place
> = ({ film, id, rect, radius, opacity, cover, speed = 0 }) => {
  const frame = useCurrentFrame();
  const photo = film.photos[id];
  const ph = random(id) * Math.PI * 2;
  const tile = Math.min(1, radius / RADIUS); // 1 as a tile, 0 as the scene
  const [x0, y0, w, h] = rect;
  const camX = 16 * Math.sin(frame / 70);
  const camY = 12 * Math.sin(frame / 53);
  const x = x0 + tile * camX - (1 - tile) * camX * 0.6;
  const y = y0 + tile * camY - (1 - tile) * camY * 0.6;
  const scene = 1 - tile;
  const [sx, sy, sz] = sceneShift(film, frame);
  // the scene gets a little more room so its shifts never show an edge
  const inner =
    (1.06 + 0.03 * Math.sin(frame / 53 + ph)) * lerp(1, 1.06 * sz, scene);
  const pan = 14 * Math.sin(frame / 61 + ph * 0.7) + scene * sx;
  const lift = scene * sy;
  // The wall in 3D, as tiles (Scott: "the 3D depth is cool if they look like tiles and
  // not cards"): every tile sits on one plane, tilted back a little and turning slowly as
  // one, like a camera passing a tiled wall (each tile turns about the frame's centre, so
  // they share the plane); tiles have thickness (a solid edge below) and cast a shadow on
  // the scene; a moving tile lifts off the wall and sets back flat on the hit.
  const planeX = 7 * tile;
  const planeY = 6 * Math.sin(frame / 110) * tile;
  const z = 70 * speed * tile;
  const edge = Math.round(7 * tile);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: radius,
        overflow: "hidden",
        opacity,
        transformOrigin: `${540 - x}px ${960 - y}px`,
        transform: tile
          ? `perspective(2000px) rotateX(${planeX}deg) rotateY(${planeY}deg) translateZ(${z}px)`
          : undefined,
        boxShadow: tile
          ? `0 ${edge}px 0 rgb(38,31,26), 0 ${edge + 1}px 0 rgba(0,0,0,0.5), 0 ${16 + z * 0.4}px ${26 + z * 0.6}px rgba(0,0,0,${0.5 * tile})`
          : undefined,
        filter: speed > 0.1 ? `blur(${(speed * 2.6).toFixed(2)}px)` : undefined,
      }}
    >
      <Img
        src={staticFile(photo.src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: `${(photo.focus?.[0] ?? 0.5) * 100}% ${(photo.focus?.[1] ?? 0.5) * 100}%`,
          filter: `${GRADE} blur(${(scene * cover * 2.2).toFixed(2)}px) brightness(${1 - scene * cover * 0.14})`,
          transform: `translate(${pan}px, ${lift}px) scale(${inner})`,
        }}
      />
      <AbsoluteFill
        style={{
          background: "rgba(255,150,64,0.16)",
          mixBlendMode: "soft-light",
        }}
      />
      {tile ? (
        <AbsoluteFill
          style={{
            borderRadius: radius,
            boxShadow: `inset 0 0 0 1px rgba(245,239,227,${0.14 * tile})`,
          }}
        />
      ) : null}
    </div>
  );
};

// The opening label: the place in gold caps with its still underline, the hotel's name in
// Cormorant beneath, bottom-left over the scrim; it lifts away before `until`.
const Label: React.FC<{ eyebrow: string; name: string; out: number }> = ({
  eyebrow,
  name,
  out,
}) => {
  const frame = useCurrentFrame();
  const a = progress(frame, 6, 18, EASE_OUT);
  const o = 1 - progress(frame, out - 12, 12, EASE_IN_OUT);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ background: SCRIM }} />
      <div
        style={{
          position: "absolute",
          left: 72,
          bottom: 470,
          opacity: a,
          transform: `translateY(${(1 - a) * 30}px)`,
        }}
      >
        <div style={{ display: "inline-block", marginBottom: 18 }}>
          <div
            style={{
              fontFamily: sans,
              fontWeight: 600,
              fontSize: 30,
              letterSpacing: "0.28em",
              color: colors.gold,
              textTransform: "uppercase",
            }}
          >
            {eyebrow}
          </div>
          <div style={{ height: 2, background: colors.gold, marginTop: 8 }} />
        </div>
        {name.split("\n").map((l) => (
          <div
            key={l}
            style={{
              fontFamily: serif,
              fontSize: 92,
              lineHeight: 1.04,
              color: colors.cream,
              textShadow: "0 3px 28px rgba(9,9,10,0.55)",
            }}
          >
            {l}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// The end card on black (Scott: the blurred wall "kind of abrupt"): the question rises
// once the zoomed tile has faded out, and fades with the music's last frames.
const EndCard: React.FC<{ line: string; frames: number }> = ({
  line,
  frames,
}) => {
  const frame = useCurrentFrame();
  const a = progress(frame, 2, 20, EASE_OUT);
  const out = 1 - progress(frame, frames - 14, 14, EASE_IN_OUT);
  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.black,
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: 120,
      }}
    >
      <div
        style={{
          opacity: a * out,
          transform: `translateY(${(1 - a) * 30}px)`,
          textAlign: "center",
        }}
      >
        {line.split("\n").map((l, i) => (
          <div
            key={l}
            style={{
              fontFamily: serif,
              fontStyle: i ? "italic" : "normal",
              fontSize: i ? 96 : 120,
              lineHeight: 1.08,
              color: colors.cream,
              whiteSpace: "nowrap",
            }}
          >
            {l}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const CollageFilm: React.FC<{ film: CollageSpec }> = ({ film }) => {
  const frame = useCurrentFrame();
  const total = collageFrames(film);
  const endAt = Math.round(film.end.beat * film.beat);
  // The ending (Scott: the blur was "kind of abrupt ... have a tile fly up / zoom in then
  // to black"): the tile lifts out of the wall and flies up to past the frame's edges,
  // its corners and the wall's tilt easing away, filling the frame on `land`.
  const zoom = film.end.zoom;
  const zoomFrom = zoom ? Math.round(zoom.from * film.beat) : Infinity;
  const zoomLand = zoom ? Math.round(zoom.land * film.beat) : Infinity;
  const zt = zoom
    ? SLIDE(interpolate(frame, [zoomFrom, zoomLand], [0, 1], clamp))
    : 0;
  const lastAt = zoom
    ? [...film.states].reverse().find((st) => st.tiles[zoom.tile])
    : undefined;
  const zoomRect: Rect = lastAt ? placeRect(lastAt.tiles[zoom!.tile]) : FULL;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      {film.music ? (
        <Audio
          src={staticFile(film.music.src)}
          trimBefore={film.music.startAt}
          volume={(f) =>
            film.music!.gain *
            interpolate(
              f,
              [total - Math.round(4 * film.beat), total],
              [1, 0],
              clamp,
            )
          }
        />
      ) : null}
      {(() => {
        // the zoom's tile leaves the wall when it sets off (it's drawn on top below)
        const ps = places(film, frame).filter(
          (p) => !(zoom && frame >= zoomFrom && p.id === zoom.tile),
        );
        // how much of the scene is under tiles, for its depth of field
        const cover = Math.min(
          1,
          ps.filter((p) => p.z >= 10).reduce((n, p) => n + p.opacity, 0),
        );
        return ps.map((p) => (
          <Tile key={p.key ?? p.id} film={film} cover={cover} {...p} />
        ));
      })()}
      {zoom && frame >= zoomFrom ? (
        <>
          {/* the wall drops into shadow behind the tile flying up */}
          <AbsoluteFill
            style={{
              backgroundColor: colors.black,
              opacity: 0.8 * zt,
            }}
          />
          <Tile
            key="zoom"
            film={film}
            id={zoom.tile}
            cover={0}
            opacity={1}
            z={100}
            rect={lerpRect(zoomRect, ZOOM_TO, zt)}
            radius={RADIUS * (1 - zt)}
            speed={zt > 0 && zt < 1 ? Math.sin(Math.PI * zt) * 0.6 : 0}
          />
          {/* then to black, black on the end card's beat */}
          <AbsoluteFill
            style={{
              backgroundColor: colors.black,
              opacity: interpolate(frame, [endAt - 14, endAt], [0, 1], {
                ...clamp,
                easing: EASE_IN_OUT,
              }),
            }}
          />
        </>
      ) : null}
      <Sequence durationInFrames={Math.round(film.label.until * film.beat)}>
        <Label
          eyebrow={film.label.eyebrow}
          name={film.label.name}
          out={Math.round(film.label.until * film.beat)}
        />
      </Sequence>
      <Sequence from={endAt}>
        <EndCard line={film.end.line} frames={total - endAt} />
      </Sequence>
      <Img
        src={staticFile("brand/cb-watermark.png")}
        style={{
          position: "absolute",
          left: 920,
          top: 1452,
          width: 100,
          height: 108,
        }}
      />
      <FilmFinish />
    </AbsoluteFill>
  );
};
