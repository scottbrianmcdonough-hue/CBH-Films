import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { FilmFinish } from "../components/FilmFinish";
import { colors, EASE_IN_OUT, sans, serif } from "../theme";
import type { FlipbookPage, FlipbookSpec } from "./types";

// Every page is the full 1080x1920 frame, bound down the left edge: the turn curls the
// whole frame away to reveal the next full-bleed page beneath.
const W = 1080;
const H = 1920;
const PAPER = "#F2EBDC"; // the reverse of each page, seen on the curl
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

type Pt = [number, number];

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

const pts = (poly: Pt[]) => poly.map(([x, y]) => `${x},${y}`).join(" ");

// The page-turn geometry at eased progress e: the bottom-right corner lifts and travels
// over the spine on an arc (inside the circle the spine allows, so the paper never
// stretches), and the fold is the perpendicular bisector between where the corner was and
// where it is now. Returns the part still lying flat, the part lifted off the page below,
// the folded-back flap (the lifted part reflected across the fold), and the fold line.
const curl = (e: number) => {
  const a: Pt = [W, H];
  const th = Math.PI * e;
  const p: Pt = [W * Math.cos(th), H - W * 0.34 * Math.sin(th)];
  const m: Pt = [(a[0] + p[0]) / 2, (a[1] + p[1]) / 2];
  const len = Math.hypot(a[0] - p[0], a[1] - p[1]);
  const n: Pt = [(a[0] - p[0]) / len, (a[1] - p[1]) / len];
  const page: Pt[] = [
    [0, 0],
    [W, 0],
    [W, H],
    [0, H],
  ];
  const flat = clipHalf(page, m, n);
  const lifted = clipHalf(page, m, [-n[0], -n[1]]);
  const flap = lifted.map(([x, y]): Pt => {
    const d = (x - m[0]) * n[0] + (y - m[1]) * n[1];
    return [x - 2 * d * n[0], y - 2 * d * n[1]];
  });
  return { flat, lifted, flap, m, n };
};

// A photo page: the photo full bleed with a barely-there push (1.00 -> 1.04 over its time
// in view), the caption bottom-left in Cormorant italic over a soft scrim, the hotel small
// in gold beneath with its location.
const PhotoPage: React.FC<{ page: FlipbookPage; push: number }> = ({
  page,
  push,
}) => {
  const [sw, sh] = page.size;
  const ch = page.crop.h ?? sh;
  const cw = (ch * W) / H;
  const cy = page.crop.cy ?? sh / 2;
  const k = H / ch;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `scale(${1 + 0.04 * push})`,
          transformOrigin: "50% 50%",
        }}
      >
        <Img
          src={staticFile(page.src)}
          style={{
            position: "absolute",
            width: sw * k,
            height: sh * k,
            left: -(page.crop.cx - cw / 2) * k,
            top: -(cy - ch / 2) * k,
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(9,9,10,0) 48%, rgba(9,9,10,0.55) 64%, rgba(9,9,10,0.68) 76%, rgba(9,9,10,0.4) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 72,
          bottom: 500,
          color: colors.cream,
          textShadow: "0 2px 20px rgba(9,9,10,0.55)",
        }}
      >
        {page.caption.map((line) => (
          <div
            key={line}
            style={{
              fontFamily: serif,
              fontStyle: "italic",
              fontWeight: 500,
              fontSize: 76,
              lineHeight: 1.06,
              whiteSpace: "nowrap",
            }}
          >
            {line}
          </div>
        ))}
        <div
          style={{
            fontFamily: sans,
            fontWeight: 600,
            fontSize: 26,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: colors.gold,
            marginTop: 26,
          }}
        >
          {page.hotel}
        </div>
        <div
          style={{
            fontFamily: sans,
            fontSize: 26,
            letterSpacing: "0.04em",
            color: "rgba(245,239,227,0.8)",
            marginTop: 8,
          }}
        >
          {page.location}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Dark cloth with a fine weave and the binding's shadow down the left: the cover and the
// back page.
const Cloth: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill
    style={{
      backgroundColor: "#1C1A18",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <svg
      width={W}
      height={H}
      style={{ position: "absolute", opacity: 0.35, mixBlendMode: "overlay" }}
    >
      <filter id="cloth">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.55 0.9"
          numOctaves={2}
          seed={3}
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width={W} height={H} filter="url(#cloth)" />
    </svg>
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(to right, rgba(0,0,0,0.45), rgba(0,0,0,0) 70px), radial-gradient(ellipse 80% 60% at 45% 42%, rgba(255,235,200,0.07), transparent 70%)",
      }}
    />
    {children}
  </AbsoluteFill>
);

// The cover: the title stamped in gold foil.
const Cover: React.FC<{ eyebrow: string; title: string }> = ({
  eyebrow,
  title,
}) => (
  <Cloth>
    <div style={{ textAlign: "center", marginTop: -120 }}>
      <div
        style={{
          fontFamily: sans,
          fontWeight: 600,
          fontSize: 28,
          letterSpacing: "0.34em",
          paddingLeft: "0.34em",
          textTransform: "uppercase",
          color: colors.gold,
        }}
      >
        {eyebrow}
      </div>
      <div
        style={{
          fontFamily: serif,
          fontWeight: 500,
          fontSize: 150,
          lineHeight: 1.0,
          marginTop: 30,
          background: `linear-gradient(170deg, ${colors.paleGold} 0%, ${colors.gold} 45%, #9C7A3C 100%)`,
          WebkitBackgroundClip: "text",
          color: "transparent",
          filter: "drop-shadow(0 1px 0 rgba(0,0,0,0.6))",
        }}
      >
        {title}
      </div>
    </div>
  </Cloth>
);

// The back page: the campaign artwork (4:5) laid on the cloth, centred inside the grid's
// 4:5 crop.
const BackPage: React.FC<{ src: string; size: [number, number] }> = ({
  src,
  size,
}) => (
  <Cloth>
    <Img
      src={staticFile(src)}
      style={{
        width: W,
        height: (W * size[1]) / size[0],
        boxShadow: "0 18px 50px rgba(0,0,0,0.55)",
      }}
    />
  </Cloth>
);

// One sheet, cut to whatever part of it is still lying flat.
const Sheet: React.FC<{ clip?: Pt[]; children: React.ReactNode }> = ({
  clip,
  children,
}) => (
  <AbsoluteFill
    style={{
      clipPath: clip
        ? `polygon(${clip.map(([x, y]) => `${x}px ${y}px`).join(",")})`
        : undefined,
    }}
  >
    {children}
  </AbsoluteFill>
);

// The turn in progress: the page beneath lies flat with a soft shadow along the fold, the
// turning page keeps only its flat part (darkening into the curl), and the flap shows the
// paper's reverse folded back over it, shaded along the bend and casting a soft shadow.
// Past the spine (the frame's left edge) the flap is cut: it folds away behind the binding.
const Turn: React.FC<{ e: number; front: React.ReactNode }> = ({
  e,
  front,
}) => {
  const { flat, lifted, flap, m, n } = curl(e);
  const g = (d: number): Pt => [m[0] + n[0] * d, m[1] + n[1] * d];
  const [c1, c2] = [g(0), g(150)];
  const [b1, b2] = [g(0), g(-90)];
  const [f1, f2] = [g(0), g(-220)];
  const shown = clipHalf(flap, [0, 0], [-1, 0]);
  // The shading softens as the page comes down on the other side.
  const depth = Math.sin(Math.PI * e);
  return (
    <>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <defs>
          <linearGradient
            id="cast"
            gradientUnits="userSpaceOnUse"
            x1={c1[0]}
            y1={c1[1]}
            x2={c2[0]}
            y2={c2[1]}
          >
            <stop
              offset="0"
              stopColor="#140c04"
              stopOpacity={0.5 * depth + 0.1}
            />
            <stop offset="1" stopColor="#140c04" stopOpacity={0} />
          </linearGradient>
        </defs>
        <polygon points={pts(lifted)} fill="url(#cast)" />
      </svg>
      <Sheet clip={flat}>{front}</Sheet>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <defs>
          <linearGradient
            id="bend"
            gradientUnits="userSpaceOnUse"
            x1={b1[0]}
            y1={b1[1]}
            x2={b2[0]}
            y2={b2[1]}
          >
            <stop offset="0" stopColor="#140c04" stopOpacity={0.3 * depth} />
            <stop offset="1" stopColor="#140c04" stopOpacity={0} />
          </linearGradient>
          <linearGradient
            id="verso"
            gradientUnits="userSpaceOnUse"
            x1={f1[0]}
            y1={f1[1]}
            x2={f2[0]}
            y2={f2[1]}
          >
            <stop offset="0" stopColor="#ffffff" stopOpacity={0.0} />
            <stop offset="0.12" stopColor="#ffffff" stopOpacity={0.35} />
            <stop offset="0.45" stopColor="#000000" stopOpacity={0.0} />
            <stop offset="1" stopColor="#3a2a18" stopOpacity={0.18} />
          </linearGradient>
          <filter id="lift" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow
              dx={-8}
              dy={12}
              stdDeviation={18}
              floodColor="#000"
              floodOpacity={0.45 * depth}
            />
          </filter>
        </defs>
        <polygon
          points={pts(clipHalf(flat, g(-90), [-n[0], -n[1]]))}
          fill="url(#bend)"
        />
        <g filter="url(#lift)">
          <polygon points={pts(shown)} fill={PAPER} />
          <polygon points={pts(shown)} fill="url(#verso)" />
        </g>
      </svg>
    </>
  );
};

export const FlipbookFilm: React.FC<{ film: FlipbookSpec }> = ({ film }) => {
  const frame = useCurrentFrame();
  // Sheets in order: the cover, each photo page, the back page.
  const sheets: React.ReactNode[] = [
    <Cover key="cover" {...film.cover} />,
    ...film.pages.map((page, i) => {
      // The push runs from when the page first shows (as the one above starts to turn)
      // until it has turned itself.
      const from = film.lands[i] - film.turn;
      const to = film.lands[i + 1];
      const push = interpolate(frame, [from, to], [0, 1], clamp);
      return <PhotoPage key={page.src} page={page} push={push} />;
    }),
    <BackPage key="back" {...film.back} />,
  ];
  // The sheet on top: the first whose turn hasn't finished.
  const top = film.lands.findIndex((land) => frame < land);
  const current = top === -1 ? sheets.length - 1 : top;
  const turning =
    top !== -1 && frame >= film.lands[top] - film.turn
      ? interpolate(
          frame,
          [film.lands[top] - film.turn, film.lands[top]],
          [0, 1],
          { ...clamp, easing: EASE_IN_OUT },
        )
      : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      <Audio
        src={staticFile(film.music.src)}
        trimBefore={film.music.startAt}
        volume={(f) =>
          film.music.gain *
          interpolate(
            f,
            [film.music.fadeFrom, film.durationInFrames],
            [1, 0],
            clamp,
          )
        }
      />
      {current + 1 < sheets.length ? (
        <AbsoluteFill>{sheets[current + 1]}</AbsoluteFill>
      ) : null}
      {turning > 0 ? (
        <Turn e={turning} front={sheets[current]} />
      ) : (
        <Sheet>{sheets[current]}</Sheet>
      )}
      {film.watermark ? (
        <Img
          src={staticFile(film.watermark.src)}
          style={{
            position: "absolute",
            left: film.watermark.x,
            top: film.watermark.y,
            width: film.watermark.size[0],
            height: film.watermark.size[1],
            // On the photo pages, not the back page (the brand appears once there): it
            // fades as the last page turns.
            opacity: interpolate(
              frame,
              [
                film.lands[film.lands.length - 1] - film.turn,
                film.lands[film.lands.length - 1],
              ],
              [1, 0],
              clamp,
            ),
          }}
        />
      ) : null}
      <FilmFinish />
    </AbsoluteFill>
  );
};
