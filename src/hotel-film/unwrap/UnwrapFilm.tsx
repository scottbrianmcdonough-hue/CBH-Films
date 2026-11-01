import { Audio, Video } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { CBLogo } from "../components/CBLogo";
import { FilmFinish } from "../components/FilmFinish";
import { EndCard } from "../footage/FootageFilm";
import { colors, EASE_IN_OUT, EASE_OUT, progress, sans, serif } from "../theme";
import type { UnwrapSection, UnwrapShot, UnwrapSpec } from "./types";

const W = 1080;
const H = 1920;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// The ribbon crosses the frame through its centre, tilted a little like a ribbon round a
// parcel (rising to the right). Each half peels away from it along its normal.
type Pt = [number, number];
const C: Pt = [W / 2, H / 2];
const TILT = (-6 * Math.PI) / 180;
const U: Pt = [Math.cos(TILT), Math.sin(TILT)];
const N_UP: Pt = [Math.sin(TILT), -Math.cos(TILT)];
const CURL = 70; // radius the paper rolls round as it lifts
const LAG = 2; // the lower half follows the upper by a couple of frames
const FRAME: Pt[] = [
  [0, 0],
  [W, 0],
  [W, H],
  [0, H],
];

const at = (n: Pt, d: number): Pt => [C[0] + n[0] * d, C[1] + n[1] * d];

// Clip a polygon to the half-plane (p - m) . n <= 0 (Sutherland-Hodgman, one edge).
const clipHalf = (poly: Pt[], m: Pt, n: Pt): Pt[] => {
  const d = (p: Pt) => (p[0] - m[0]) * n[0] + (p[1] - m[1]) * n[1];
  const out: Pt[] = [];
  poly.forEach((a, i) => {
    const b = poly[(i + 1) % poly.length];
    const da = d(a);
    const db = d(b);
    if (da <= 0) out.push(a);
    if (da * db < 0) {
      const t = da / (da - db);
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  });
  return out;
};

// The part of the frame whose distance from the ribbon along n lies in [d0, d1].
const band = (n: Pt, d0: number, d1 = 1e5): Pt[] =>
  clipHalf(clipHalf(FRAME, at(n, d0), [-n[0], -n[1]]), at(n, d1), n);

const pts = (poly: Pt[]) => poly.map(([x, y]) => `${x},${y}`).join(" ");
const sub = (poly: Pt[]) =>
  poly.length > 2 ? `M${poly.map(([x, y]) => `${x} ${y}`).join(" L")} Z` : "";

// How far the frame reaches from the ribbon on one side.
const reach = (n: Pt) =>
  Math.max(...FRAME.map((p) => (p[0] - C[0]) * n[0] + (p[1] - C[1]) * n[1]));

// One half of the wrap at eased progress e: the fold has travelled f from the ribbon; the
// lifted paper rolls round a curl of radius CURL and, once it has gone over the top, lies
// folded back over the flat paper, its cut edge (gilded) at `edge`.
const half = (n: Pt, e: number) => {
  const f = e * (reach(n) + CURL * 4);
  const inner = f < (Math.PI * CURL) / 2 ? CURL * Math.sin(f / CURL) : CURL;
  const edge =
    f <= Math.PI * CURL
      ? f - CURL * Math.sin(f / CURL)
      : 2 * f - Math.PI * CURL;
  return { n, f, inner, edge };
};
type Half = ReturnType<typeof half>;

const grad = (
  id: string,
  n: Pt,
  d0: number,
  d1: number,
  stops: [number, string, number][],
) => {
  const [a, b] = [at(n, d0), at(n, d1)];
  return (
    <linearGradient
      key={id}
      id={id}
      gradientUnits="userSpaceOnUse"
      x1={a[0]}
      y1={a[1]}
      x2={b[0]}
      y2={b[1]}
    >
      {stops.map(([o, c, op]) => (
        <stop key={o} offset={o} stopColor={c} stopOpacity={op} />
      ))}
    </linearGradient>
  );
};

// The paper of one half in flight, drawn over the sheet's flat remainder: the shadow it
// casts on the shot beneath, the curl (black paper catching a gold sheen), the folded-back
// flap with its own soft shadow, and the gilded cut edge.
const Flight: React.FC<{ h: Half; id: string }> = ({ h, id }) => {
  const { n, f, inner, edge } = h;
  if (f <= 0) return null;
  const flap = edge > f;
  const line = (d: number) => {
    const p = at(n, d);
    return {
      x1: p[0] - U[0] * 1400,
      y1: p[1] - U[1] * 1400,
      x2: p[0] + U[0] * 1400,
      y2: p[1] + U[1] * 1400,
    };
  };
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <defs>
        {grad(`${id}-cast`, n, f - inner - 120, f - inner, [
          [0, "#000", 0],
          [1, "#000", 0.5],
        ])}
        {grad(`${id}-curl`, n, f - CURL, f, [
          [0, "#030303", 1],
          [0.45, "#141210", 1],
          [0.72, "#5e4c31", 1],
          [0.86, "#2a241c", 1],
          [1, "#1a1714", 1],
        ])}
        {grad(`${id}-flap`, n, f, Math.max(edge, f + 1), [
          [0, "#1a1714", 1],
          [0.12, "#2b2419", 1],
          [0.4, "#0e0d0c", 1],
          [1, "#070707", 1],
        ])}
        {grad(`${id}-shade`, n, edge, edge + 70, [
          [0, "#000", 0.5],
          [1, "#000", 0],
        ])}
        <filter id={`${id}-glow`} x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow
            dx={0}
            dy={0}
            stdDeviation={3}
            floodColor={colors.lightGold}
            floodOpacity={0.55}
          />
        </filter>
      </defs>
      {f - inner > 0 ? (
        <polygon
          points={pts(band(n, Math.max(0, f - inner - 120), f - inner))}
          fill={`url(#${id}-cast)`}
        />
      ) : null}
      {flap ? (
        <>
          <polygon
            points={pts(band(n, edge, edge + 70))}
            fill={`url(#${id}-shade)`}
          />
          <polygon points={pts(band(n, f, edge))} fill={`url(#${id}-flap)`} />
        </>
      ) : null}
      <polygon
        points={pts(band(n, Math.max(0, f - inner), f))}
        fill={`url(#${id}-curl)`}
      />
      <line
        {...line(edge)}
        stroke={colors.gold}
        strokeWidth={3}
        filter={`url(#${id}-glow)`}
      />
    </svg>
  );
};

// The gold ribbon drawing across the frame, left to right, a light travelling at its tip.
const Ribbon: React.FC<{ p: number }> = ({ p }) => {
  const L = 560;
  const a: Pt = [C[0] - U[0] * L, C[1] - U[1] * L];
  const b: Pt = [a[0] + U[0] * 2 * L * p, a[1] + U[1] * 2 * L * p];
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <radialGradient id="tip">
          <stop offset="0" stopColor="#FFF6DC" stopOpacity={0.95} />
          <stop offset="0.35" stopColor={colors.lightGold} stopOpacity={0.5} />
          <stop offset="1" stopColor={colors.gold} stopOpacity={0} />
        </radialGradient>
        <filter id="rib-shadow" x="-10%" y="-50%" width="120%" height="200%">
          <feGaussianBlur stdDeviation={3} />
        </filter>
        <filter id="rib-glow" x="-10%" y="-50%" width="120%" height="200%">
          <feDropShadow
            dx={0}
            dy={0}
            stdDeviation={3}
            floodColor={colors.lightGold}
            floodOpacity={0.55}
          />
        </filter>
      </defs>
      <line
        x1={a[0]}
        y1={a[1] + 2}
        x2={b[0]}
        y2={b[1] + 2}
        stroke="#000"
        strokeOpacity={0.4}
        strokeWidth={6}
        filter="url(#rib-shadow)"
      />
      <line
        x1={a[0]}
        y1={a[1]}
        x2={b[0]}
        y2={b[1]}
        stroke={colors.gold}
        strokeWidth={3}
        filter="url(#rib-glow)"
      />
      <circle
        cx={b[0]}
        cy={b[1]}
        r={34}
        fill="url(#tip)"
        opacity={Math.sin(Math.PI * p)}
      />
    </svg>
  );
};

// The hotel, big enough to read at a glance: the place in gold caps, then the name large
// in Cormorant, each line rising from behind its own baseline a few frames apart (one soft,
// wide shadow), and a thin gold rule drawing under it at a steady pace until the next
// ribbon. It holds over all the hotel's shots and is printed on the sheet, so it peels away
// with it; the scrim is there from the start, so nothing pumps behind the CB mark.
const Label: React.FC<{
  name: string[];
  place: string;
  from: number;
  ruleTo: number;
}> = ({ name, place, from, ruleTo }) => {
  const frame = useCurrentFrame();
  const ruleFrom = from + 6 + name.length * 5;
  const rule = interpolate(frame, [ruleFrom, ruleTo], [0, 1], clamp);
  return (
    <>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(9,9,10,0) 46%, rgba(9,9,10,0.5) 62%, rgba(9,9,10,0.62) 76%, rgba(9,9,10,0.3) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 72,
          bottom: 470,
          textShadow: "0 4px 40px rgba(9,9,10,0.7)",
        }}
      >
        <Rise from={from}>
          <div
            style={{
              fontFamily: sans,
              fontWeight: 600,
              fontSize: 28,
              letterSpacing: "0.26em",
              textTransform: "uppercase",
              color: colors.gold,
              marginBottom: 10,
            }}
          >
            {place}
          </div>
        </Rise>
        {name.map((line, i) => (
          <Rise key={line} from={from + 5 + i * 5}>
            <div
              style={{
                fontFamily: serif,
                fontWeight: 500,
                fontSize: 86,
                lineHeight: 1.0,
                color: colors.cream,
                whiteSpace: "nowrap",
              }}
            >
              {line}
            </div>
          </Rise>
        ))}
        <div
          style={{
            height: 3,
            width: 340 * rule,
            marginTop: 22,
            background: `linear-gradient(90deg, ${colors.lightGold}, ${colors.gold})`,
          }}
        />
      </div>
    </>
  );
};

// A shot, full bleed: a photo with the barely-there push over its whole time on screen, or
// a 1080x1920 clip playing from `from`.
const Shot: React.FC<{ shot: UnwrapShot; frames: number; push: number }> = ({
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

// The scrim under the words at the foot of a sheet: there from the start (a scrim fading
// in after each landing read as the corner pumping behind the CB mark).
const Scrim: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "linear-gradient(to bottom, rgba(9,9,10,0) 52%, rgba(9,9,10,0.42) 66%, rgba(9,9,10,0.55) 78%, rgba(9,9,10,0.28) 100%)",
    }}
  />
);

// One hotel per shot, kept small: the name in gold caps, the place beneath, a soft fade
// in a few frames after the cut. Printed with the shot, so the next cut takes it away.
const Tag: React.FC<{ name: string; place: string; from: number }> = ({
  name,
  place,
  from,
}) => {
  const frame = useCurrentFrame();
  const p = progress(frame, from, 12);
  return (
    <div
      style={{
        position: "absolute",
        left: 72,
        bottom: 470,
        opacity: p,
        textShadow: "0 2px 24px rgba(9,9,10,0.7)",
      }}
    >
      <div
        style={{
          fontFamily: sans,
          fontWeight: 600,
          fontSize: 25,
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          color: colors.gold,
        }}
      >
        {name}
      </div>
      <div
        style={{
          fontFamily: sans,
          fontSize: 24,
          letterSpacing: "0.04em",
          color: "rgba(245,239,227,0.85)",
          marginTop: 6,
        }}
      >
        {place}
      </div>
    </div>
  );
};

// A short line that plays off the pictures, in Cormorant italic above the tags: it rises
// as its chapter is uncovered and fades before the chapter moves on.
const ChapterLine: React.FC<{
  text: string[];
  from: number;
  until: number;
}> = ({ text, from, until }) => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [until - 10, until], [1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: 72,
        bottom: 560,
        opacity: out,
        fontFamily: serif,
        fontStyle: "italic",
        fontWeight: 400,
        fontSize: 92,
        lineHeight: 1.02,
        color: colors.cream,
        textShadow: "0 4px 40px rgba(9,9,10,0.7)",
      }}
    >
      {text.map((line, i) => (
        <Rise key={line} from={from + i * 5}>
          {line}
        </Rise>
      ))}
    </div>
  );
};

// One section: each shot from its cut (frames relative to the section's sheet) to the
// next, photos pushing over their own time on screen; a large label or a line holds across
// the cuts, small tags change with them.
const Hotel: React.FC<{
  section: UnwrapSection;
  starts: number[];
  frames: number;
  push: number;
  labelFrom: number;
  ruleTo: number;
  lineUntil: number;
}> = ({ section, starts, frames, push, labelFrom, ruleTo, lineUntil }) => (
  <AbsoluteFill style={{ backgroundColor: colors.black }}>
    {section.shots.map((shot, i) => {
      const from = starts[i];
      const len = (starts[i + 1] ?? frames) - from;
      return (
        <Sequence key={shot.src} from={from} durationInFrames={len}>
          <Shot shot={shot} frames={len} push={push} />
          {section.label ? null : <Scrim />}
          {shot.tag ? (
            <Tag {...shot.tag} from={i === 0 ? labelFrom : 3} />
          ) : null}
        </Sequence>
      );
    })}
    {section.label ? (
      <Label {...section.label} from={labelFrom} ruleTo={ruleTo} />
    ) : null}
    {section.line ? (
      <ChapterLine
        text={section.line.text}
        from={labelFrom}
        until={lineUntil}
      />
    ) : null}
  </AbsoluteFill>
);

// The brand card: the official CBH logo, larger, with its shimmer on the CB, and the
// address in gold caps beneath; one calm arrival, then it holds while the music fades.
const BrandCard: React.FC<{ location: string }> = ({ location }) => {
  const frame = useCurrentFrame();
  const p = progress(frame, 34, 20);
  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.black,
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: 140,
      }}
    >
      <CBLogo start={4} width={300} shimmerAt={40} cbOnly />
      <div
        style={{
          fontFamily: sans,
          fontWeight: 600,
          fontSize: 28,
          letterSpacing: "0.3em",
          paddingLeft: "0.3em",
          textTransform: "uppercase",
          color: colors.gold,
          marginTop: 56,
          opacity: p,
        }}
      >
        {location}
      </div>
    </AbsoluteFill>
  );
};

// A line rising out of its own mask.
const Rise: React.FC<{ from: number; children: React.ReactNode }> = ({
  from,
  children,
}) => {
  const frame = useCurrentFrame();
  const p = progress(frame, from, 22);
  return (
    <div style={{ overflow: "hidden", paddingBottom: "0.12em" }}>
      <div
        style={{
          transform: `translateY(${(1 - p) * 105}%)`,
          opacity: interpolate(p, [0, 0.4], [0, 1], clamp),
        }}
      >
        {children}
      </div>
    </div>
  );
};

// The opening: one calm line in Cormorant italic, on black or over a gift photo.
const Opening: React.FC<{
  eyebrow?: string;
  lines: string[];
  still?: UnwrapShot;
  frames: number;
  push: number;
}> = ({ eyebrow, lines, still, frames, push }) => (
  <AbsoluteFill style={{ backgroundColor: colors.black }}>
    {still ? (
      <>
        <Shot shot={still} frames={frames} push={push} />
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(to bottom, rgba(9,9,10,0.82) 0%, rgba(9,9,10,0.7) 30%, rgba(9,9,10,0.15) 52%, rgba(9,9,10,0.1) 100%)",
          }}
        />
      </>
    ) : null}
    <div
      style={{
        position: "absolute",
        top: still ? 290 : 600,
        width: W,
        textAlign: "center",
        fontFamily: serif,
        fontStyle: "italic",
        fontWeight: 400,
        fontSize: 104,
        lineHeight: 1.04,
        color: colors.cream,
        textShadow: still ? "0 2px 24px rgba(9,9,10,0.6)" : undefined,
      }}
    >
      {eyebrow ? (
        <Rise from={6}>
          <div
            style={{
              fontFamily: sans,
              fontStyle: "normal",
              fontWeight: 600,
              fontSize: 30,
              letterSpacing: "0.32em",
              paddingLeft: "0.32em",
              textTransform: "uppercase",
              color: colors.gold,
              marginBottom: 18,
            }}
          >
            {eyebrow}
          </div>
        </Rise>
      ) : null}
      {lines.map((line, i) => (
        <Rise key={line} from={12 + i * 6}>
          {line}
        </Rise>
      ))}
    </div>
  </AbsoluteFill>
);

// The voucher: the black and gold card (or the real CBH artwork) slides up into the open
// gift and settles, a light crosses it, and the terms rise beneath it.
const Gift: React.FC<{
  gift: NonNullable<UnwrapSpec["gift"]>;
  from: number;
  out: number;
}> = ({ gift, from, out }) => {
  const frame = useCurrentFrame();
  const slide = progress(frame, from, 34);
  const fade = interpolate(frame, [out - 12, out], [1, 0], clamp);
  const sweep = interpolate(frame, [from + 38, from + 72], [-40, 140], clamp);
  const cardW = gift.art ? W : 820;
  const cardH = gift.art ? (W * gift.art.size[1]) / gift.art.size[0] : 500;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black, opacity: fade }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 70% 40% at 50% 44%, rgba(195,158,85,0.2), transparent 70%)",
          opacity: slide,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: (W - cardW) / 2,
          top: gift.art ? 400 : 560,
          width: cardW,
          height: cardH,
          perspective: 1800,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            transform: gift.art
              ? `translateY(${(1 - slide) * 1100}px) rotateX(${(1 - slide) * 28}deg) rotate(${(1 - slide) * -5}deg)`
              : `translateY(${(1 - slide) * 1100}px) rotateX(${(1 - slide) * 28}deg) rotate(${-4 + slide * 2.5}deg)`,
            transformOrigin: "50% 100%",
          }}
        >
          {gift.art ? (
            <Img
              src={staticFile(gift.art.src)}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          ) : (
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                borderRadius: 18,
                overflow: "hidden",
                background:
                  "linear-gradient(140deg, #1b1916 0%, #0b0b0b 55%, #15130f 100%)",
                boxShadow:
                  "0 40px 90px rgba(0,0,0,0.7), 0 0 0 1px rgba(195,158,85,0.35)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 22,
                  border: `1.5px solid ${colors.gold}`,
                  borderRadius: 8,
                  opacity: 0.75,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div style={{ width: 92, height: 74, overflow: "hidden" }}>
                  <Img
                    src={staticFile("brand/cbh-logo-cb-only.svg")}
                    style={{ width: 92, height: 92 * (655.69 / 534.25) }}
                  />
                </div>
                <div
                  style={{
                    fontFamily: serif,
                    fontStyle: "italic",
                    fontSize: 46,
                    color: colors.cream,
                    marginTop: 26,
                  }}
                >
                  {gift.card.eyebrow}
                </div>
                {gift.card.title.map((t) => (
                  <div
                    key={t}
                    style={{
                      fontFamily: serif,
                      fontWeight: 500,
                      fontSize: 112,
                      lineHeight: 1,
                      marginTop: 4,
                      background: `linear-gradient(170deg, ${colors.paleGold} 0%, ${colors.gold} 48%, #9C7A3C 100%)`,
                      WebkitBackgroundClip: "text",
                      color: "transparent",
                    }}
                  >
                    {t}
                  </div>
                ))}
              </div>
              <AbsoluteFill
                style={{
                  background: `linear-gradient(110deg, transparent ${sweep - 18}%, rgba(255,246,220,0.16) ${sweep}%, transparent ${sweep + 18}%)`,
                }}
              />
            </div>
          )}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: gift.art ? 1270 : 1150,
          width: W,
          textAlign: "center",
          fontFamily: serif,
          fontWeight: 500,
          fontSize: 92,
          lineHeight: 1.04,
          color: colors.cream,
          textShadow: "0 4px 40px rgba(9,9,10,0.7)",
        }}
      >
        <Rise from={from + 28}>{gift.headline}</Rise>
        <Rise from={from + 34}>
          <div
            style={{
              fontFamily: sans,
              fontWeight: 600,
              fontSize: 28,
              letterSpacing: "0.26em",
              paddingLeft: "0.26em",
              textTransform: "uppercase",
              color: colors.gold,
              marginTop: 16,
            }}
          >
            {gift.small}
          </div>
        </Rise>
      </div>
    </AbsoluteFill>
  );
};

export const UnwrapFilm: React.FC<{ film: UnwrapSpec }> = ({ film }) => {
  const frame = useCurrentFrame();
  const { lands, peel, ribbon } = film;
  const hp = peel / 2;
  // Scenes in order: the opening (if any), each section, then the last scene (the gift, or
  // plain black under the end card). Scene k is uncovered by the peel centred on
  // lands[k - 1] and peeled away by the one centred on lands[k].
  const first = film.opening ? 1 : 0;
  const last = first + film.sections.length;
  const show = (k: number) => (k === 0 ? 0 : lands[k - 1] - hp);
  const gone = (k: number) =>
    k < last ? lands[k] + hp + LAG : film.durationInFrames;
  const peelOf = (k: number, lag: number) =>
    interpolate(frame, [lands[k] - hp + lag, lands[k] + hp + lag], [0, 1], {
      ...clamp,
      easing: EASE_IN_OUT,
    });
  // The unwrap in progress (the ribbon drawing, or the peel), if any.
  const active = lands.findIndex(
    (l) => frame >= l - hp - ribbon - 2 && frame < l + hp + LAG,
  );
  const peeling = active !== -1 && frame >= lands[active] - hp;
  const halves = peeling
    ? [
        half(N_UP, peelOf(active, 0)),
        half([-N_UP[0], -N_UP[1]], peelOf(active, LAG)),
      ]
    : [];
  // The turning sheet keeps only the paper still lying flat. Once none is left, hide it
  // outright: an empty path() is invalid CSS, which would drop the clip and flash the
  // whole old sheet for a frame under the curl.
  const flat = halves
    .map((h) => sub(band(h.n, h.f)))
    .join(" ")
    .trim();
  const clip = peeling
    ? flat
      ? `path("${flat}")`
      : "polygon(0 0, 0 0, 0 0)"
    : undefined;
  const lastLand = lands[lands.length - 1];
  const scene = (k: number) => {
    const frames = gone(k) - show(k);
    if (k < first && film.opening)
      return <Opening {...film.opening} frames={frames} push={film.push} />;
    if (k === last)
      return film.gift ? (
        <Gift gift={film.gift} from={hp + 4} out={film.endAt - show(k)} />
      ) : (
        <AbsoluteFill style={{ backgroundColor: colors.black }} />
      );
    const section = film.sections[k - first];
    // The words wait for the peel to finish, except on a film's very first frame.
    const labelFrom = k === 0 ? 0 : hp + 2;
    return (
      <Hotel
        section={section}
        starts={[0, ...section.cuts.map((c) => c - show(k))]}
        frames={frames}
        push={film.push}
        labelFrom={labelFrom}
        ruleTo={lands[k] - hp - ribbon - 2 - show(k)}
        lineUntil={(section.line?.until ?? 0) - show(k)}
      />
    );
  };
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      <Audio
        src={staticFile(film.music.src)}
        trimBefore={film.music.startAt}
        volume={(f) =>
          film.music.gain *
          interpolate(f, [0, film.music.fadeIn], [0, 1], clamp) *
          interpolate(f, [film.music.fadeFrom, film.durationInFrames], [1, 0], {
            ...clamp,
            easing: Easing.in(Easing.quad),
          })
        }
      />
      {Array.from({ length: last + 1 }, (_, k) => k)
        .filter((k) => frame >= show(k) && frame < gone(k))
        .reverse()
        .map((k) => (
          <Sequence
            key={k}
            from={show(k)}
            durationInFrames={gone(k) - show(k)}
            style={{ clipPath: k === active && peeling ? clip : undefined }}
          >
            {scene(k)}
          </Sequence>
        ))}
      {peeling
        ? halves.map((h, i) => <Flight key={i} h={h} id={`h${i}`} />)
        : null}
      {active !== -1 && !peeling ? (
        <Ribbon
          p={interpolate(
            frame,
            [lands[active] - hp - ribbon - 2, lands[active] - hp - 2],
            [0, 1],
            { ...clamp, easing: EASE_OUT },
          )}
        />
      ) : null}
      {film.watermark ? (
        <Img
          src={staticFile(film.watermark.src)}
          style={{
            position: "absolute",
            left: film.watermark.x,
            top: film.watermark.y,
            width: film.watermark.size[0],
            height: film.watermark.size[1],
            // Over every shot; it leaves with the last unwrap (the brand comes next).
            opacity: interpolate(
              frame,
              [lastLand - hp, lastLand],
              [1, 0],
              clamp,
            ),
          }}
        />
      ) : null}
      {frame >= film.endAt ? (
        <Sequence from={film.endAt}>
          {film.endCard.lines.length ? (
            <EndCard
              {...film.endCard}
              logo="cb-shimmer"
              rule={false}
              delay={0}
            />
          ) : (
            <BrandCard location={film.endCard.location} />
          )}
        </Sequence>
      ) : null}
      <FilmFinish />
    </AbsoluteFill>
  );
};
