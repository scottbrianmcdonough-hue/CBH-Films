import { Audio, Video } from "@remotion/media";
import {
  AbsoluteFill,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { CBLogo } from "../components/CBLogo";
import { FilmFinish } from "../components/FilmFinish";
import { colors, EASE_IN_OUT, EASE_OUT, progress, sans, serif } from "../theme";
import {
  filed,
  OPEN,
  SETTLE,
  type RolodexCard,
  type RolodexShot,
  type RolodexSpec,
} from "./types";

const W = 1080;
const H = 1920;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// The drum: cards 900x520 standing out from a core on an axle (radius R), seen from above
// and a little to the side, so the cards behind fan back and show their tops and tabs.
const CW = 900;
const CH = 520;
const CX = (W - CW) / 2;
const R = 150;
const AXLE = 1330;
const PERSPECTIVE = 1900;
const EYE: [number, number] = [540, -900];
const TURN = -14; // the drum turned a touch towards us (degrees about the vertical)
const LEAN = 22; // the card being read leans back this far (we look down onto the file)

const ink = "#1D1B19";
const darkGold = "#8C6F3A";
const paper = "#F3ECDD";

// A card's tilt (degrees, positive leans back) from its place `d` in the file relative to
// the card being read: the cards behind fan back, the one being read stands nearly
// upright, a card turning over falls forward (slowly at first, like a real flip), and the
// ones already turned lie forward over the axle.
const tilt = (d: number) => {
  if (d >= 0)
    return Math.min(104, LEAN + Math.min(d, 1) * 10 + Math.max(0, d - 1) * 5);
  if (d > -1) return LEAN - Math.pow(-d, 1.5) * (LEAN + 44);
  return Math.max(-112, -44 - (-d - 1) * 26);
};

// The card outline with the two slots that hold it on the rails.
const SLOT = 22;
const cardPath = (() => {
  const r = 16;
  const s1 = CW * 0.3;
  const s2 = CW * 0.7;
  return (
    `M ${r} 0 H ${CW - r} A ${r} ${r} 0 0 1 ${CW} ${r} V ${CH - r} ` +
    `A ${r} ${r} 0 0 1 ${CW - r} ${CH} H ${s2 + SLOT} A ${SLOT} ${SLOT} 0 0 0 ${s2 - SLOT} ${CH} ` +
    `H ${s1 + SLOT} A ${SLOT} ${SLOT} 0 0 0 ${s1 - SLOT} ${CH} H ${r} ` +
    `A ${r} ${r} 0 0 1 0 ${CH - r} V ${r} A ${r} ${r} 0 0 1 ${r} 0 Z`
  );
})();

const Face: React.FC<{
  card: RolodexCard | null;
  last?: string;
  shade: number;
  back?: boolean;
}> = ({ card, last, shade, back }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      backfaceVisibility: "hidden",
      transform: back ? "rotateX(180deg)" : undefined,
      clipPath: `path("${cardPath}")`,
      backgroundColor: paper,
      // The front ruled for notes; the back shaded towards the rails, its free edge marked
      // so each turned card reads in the stack.
      backgroundImage: back
        ? "linear-gradient(to bottom, rgba(40,30,20,0.28), rgba(40,30,20,0) 55%, rgba(40,30,20,0) 96%, rgba(60,45,25,0.55) 100%)"
        : "repeating-linear-gradient(to bottom, transparent 0 63px, rgba(86,110,130,0.13) 63px 65px)",
      backgroundPosition: back ? "0 0" : "0 182px",
      backgroundRepeat: "no-repeat",
      backgroundSize: back ? "100% 100%" : "100% 320px",
    }}
  >
    {!back && card ? (
      <div style={{ position: "absolute", left: 64, right: 64, top: 52 }}>
        <div
          style={{
            fontFamily: serif,
            fontWeight: 600,
            fontSize: 66,
            lineHeight: 1.02,
            color: ink,
            height: 136,
            display: "flex",
            alignItems: "flex-end",
          }}
        >
          {card.name}
        </div>
        <div
          style={{ height: 3, background: colors.gold, margin: "18px 0 20px" }}
        />
        <div
          style={{
            fontFamily: sans,
            fontWeight: 600,
            fontSize: 25,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: darkGold,
          }}
        >
          {card.place}
        </div>
      </div>
    ) : null}
    {!back && last ? (
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: 40,
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontWeight: 600,
            fontSize: 24,
            letterSpacing: "0.3em",
            color: darkGold,
            marginBottom: 26,
          }}
        >
          CLASSIC BRITISH HOTELS
        </div>
        <div
          style={{
            fontFamily: serif,
            fontStyle: "italic",
            fontWeight: 500,
            fontSize: 78,
            color: ink,
          }}
        >
          {last}
        </div>
      </div>
    ) : null}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#000",
        opacity: shade,
      }}
    />
  </div>
);

// The A-Z guide tab on the first card of each letter, stepping across the file.
const TabLetter: React.FC<{ letter: string; shade: number }> = ({
  letter,
  shade,
}) => {
  const step = letter.charCodeAt(0) - 65;
  return (
    <div
      style={{
        position: "absolute",
        top: -50,
        left: 40 + (step % 7) * 118,
        width: 96,
        height: 54,
        borderRadius: "12px 12px 0 0",
        backgroundColor: colors.gold,
        backfaceVisibility: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: serif,
        fontWeight: 700,
        fontSize: 38,
        color: colors.black,
        overflow: "hidden",
      }}
    >
      {letter}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#000",
          opacity: shade,
        }}
      />
    </div>
  );
};

const Card: React.FC<{
  card: RolodexCard | null;
  last?: string;
  d: number;
  tab: string | null;
}> = ({ card, last, d, tab }) => {
  const a = tilt(d);
  // Light from above and in front: the cards deeper in the file and the ones lying
  // forward fall into shadow.
  const shade =
    d >= 0
      ? Math.min(0.66, Math.max(0, d - 0.3) * 0.06)
      : 0.1 + Math.min(0.3, -d * 0.07);
  return (
    <div
      style={{
        position: "absolute",
        left: CX,
        top: AXLE - R - CH,
        width: CW,
        height: CH,
        transformOrigin: `50% ${CH + R}px`,
        transform: `rotateX(${a}deg)`,
        transformStyle: "preserve-3d",
      }}
    >
      {tab ? <TabLetter letter={tab} shade={shade} /> : null}
      <Face card={card} last={last} shade={shade} />
      <Face card={null} shade={Math.min(0.75, shade + 0.12)} back />
    </div>
  );
};

// The shot a landing opens into: full frame, clipped to the card's outline on screen and
// opened out to the frame's corners (and folded back the same way).
const project = (x: number, h: number, deg: number) => {
  const t = (deg * Math.PI) / 180;
  const f = (TURN * Math.PI) / 180;
  const y = AXLE - (R + h) * Math.cos(t);
  const z = -(R + h) * Math.sin(t);
  const dx = CX + x - W / 2;
  const x1 = dx * Math.cos(f) + z * Math.sin(f);
  const z1 = -dx * Math.sin(f) + z * Math.cos(f);
  const k = PERSPECTIVE / (PERSPECTIVE - z1);
  return [EYE[0] + (W / 2 + x1 - EYE[0]) * k, EYE[1] + (y - EYE[1]) * k];
};
const cardOnScreen = [
  project(0, CH, LEAN),
  project(CW, CH, LEAN),
  project(CW, 0, LEAN),
  project(0, 0, LEAN),
];
const FRAME = [
  [0, 0],
  [W, 0],
  [W, H],
  [0, H],
];

const Media: React.FC<{ shot: RolodexShot; frames: number }> = ({
  shot,
  frames,
}) => {
  const frame = useCurrentFrame();
  if (shot.kind === "video")
    return (
      <Video
        src={staticFile(shot.src)}
        trimBefore={Math.round((shot.from ?? 0) * 30)}
        muted
        objectFit="cover"
        style={{ width: "100%", height: "100%" }}
      />
    );
  const [sw, sh] = shot.size!;
  const crop = shot.crop!;
  const ch = crop.h ?? sh;
  const cw = (ch * W) / H;
  const cy = crop.cy ?? sh / 2;
  const k = H / ch;
  const z = interpolate(frame, [0, frames], [1, 1.06], clamp);
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

const Opened: React.FC<{
  shot: RolodexShot;
  card: RolodexCard;
  open: number;
  close: number;
}> = ({ shot, card, open, close }) => {
  const frame = useCurrentFrame(); // from the open
  const t =
    progress(frame, 0, OPEN, EASE_IN_OUT) -
    progress(frame, close - open, OPEN, EASE_IN_OUT);
  const pts = cardOnScreen
    .map(([x, y], i) => {
      const [fx, fy] = FRAME[i];
      return `${x + (fx - x) * t}px ${y + (fy - y) * t}px`;
    })
    .join(", ");
  const tagIn =
    progress(frame, OPEN, 10) * (1 - progress(frame, close - open - 8, 8));
  return (
    <AbsoluteFill style={{ clipPath: `polygon(${pts})` }}>
      <AbsoluteFill style={{ transform: `scale(${1.12 - 0.12 * t})` }}>
        <Media shot={shot} frames={close - open + OPEN} />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          opacity: tagIn,
          background:
            "linear-gradient(to bottom, rgba(9,9,10,0) 62%, rgba(9,9,10,0.45) 76%, rgba(9,9,10,0.45) 86%, rgba(9,9,10,0.2) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 72,
          bottom: 470,
          opacity: tagIn,
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
          {card.name}
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
          {card.place}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// The core the cards are slotted on (a gold-dark cylinder in twelve facets) and the
// discs at either end.
const Drum: React.FC = () => {
  const facet = 2 * R * Math.tan(Math.PI / 12) + 2;
  const len = CW + 60;
  return (
    <>
      {Array.from({ length: 12 }, (_, k) => {
        const a = k * 30;
        const light = Math.max(0, Math.cos(((a - 40) * Math.PI) / 180));
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: (W - len) / 2,
              top: AXLE - facet / 2,
              width: len,
              height: facet,
              transform: `rotateX(${a}deg) translateZ(${R - 4}px)`,
              background: `rgb(${40 + 120 * light}, ${32 + 98 * light}, ${22 + 62 * light})`,
            }}
          />
        );
      })}
      {[(W - len) / 2 - 2, (W + len) / 2 + 2].map((x) => (
        <div
          key={x}
          style={{
            position: "absolute",
            left: x - (R + 40),
            top: AXLE - (R + 40),
            width: 2 * (R + 40),
            height: 2 * (R + 40),
            borderRadius: "50%",
            transform: "rotateY(90deg)",
            background:
              "radial-gradient(circle, #6b5634 0%, #3a2f1f 55%, #a58b57 62%, #2a2216 70%, #1a1612 100%)",
          }}
        />
      ))}
    </>
  );
};

export const RolodexFilm: React.FC<{ film: RolodexSpec }> = ({ film }) => {
  const frame = useCurrentFrame();
  const cards = filed(film.cards);
  const N = cards.length; // the closing card sits after the last hotel
  const index = (name: string) => cards.findIndex((c) => c.name === name);

  // Where the file is open: riffles between landings, eased so each starts at speed
  // (the first) or picks up, and slows to rest on its card before it opens.
  const legs: {
    from: number;
    to: number;
    a: number;
    b: number;
    ease: (t: number) => number;
  }[] = [];
  let at = 0;
  let pos = 0;
  film.landings.forEach((l, i) => {
    const target = index(l.card);
    legs.push({
      from: at,
      to: l.open - SETTLE,
      a: pos,
      b: target,
      ease: i === 0 ? EASE_OUT : EASE_IN_OUT,
    });
    at = l.close + OPEN;
    pos = target;
  });
  legs.push({ from: at, to: film.last.land, a: pos, b: N, ease: EASE_IN_OUT });
  let p = 0;
  for (const leg of legs) {
    if (frame >= leg.from)
      p = interpolate(frame, [leg.from, leg.to], [leg.a, leg.b], {
        ...clamp,
        easing: leg.ease,
      });
  }

  const first = new Set<number>();
  cards.forEach((c, i) => {
    const l = (c.sortAs ?? c.name.replace(/^The /, ""))[0];
    const prev = i
      ? (cards[i - 1].sortAs ?? cards[i - 1].name.replace(/^The /, ""))[0]
      : "";
    if (l !== prev) first.add(i);
  });
  const lo = Math.max(0, Math.floor(p) - 3);
  const hi = Math.min(N, Math.floor(p) + 18);
  const shown: number[] = [];
  for (let i = hi; i >= lo; i--) shown.push(i);

  const fadeOut = interpolate(
    frame,
    [film.endAt, film.endAt + 18],
    [1, 0],
    clamp,
  );
  const fadeIn = interpolate(frame, [0, 10], [0, 1], clamp);

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
      <AbsoluteFill style={{ opacity: fadeOut * fadeIn }}>
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse 80% 45% at 50% 52%, #2B241C 0%, #151311 45%, #09090A 100%)",
          }}
        />
        <AbsoluteFill
          style={{
            perspective: PERSPECTIVE,
            perspectiveOrigin: `${EYE[0]}px ${EYE[1]}px`,
          }}
        >
          <AbsoluteFill
            style={{
              transformStyle: "preserve-3d",
              transform: `rotateY(${TURN}deg)`,
              transformOrigin: `${W / 2}px ${AXLE}px`,
            }}
          >
            <Drum />
            {shown.map((i) => {
              const c = i < N ? cards[i] : null;
              const sortKey = c
                ? (c.sortAs ?? c.name.replace(/^The /, ""))
                : "";
              return (
                <Card
                  key={i}
                  card={c}
                  last={i === N ? film.last.line : undefined}
                  d={i - p}
                  tab={c && first.has(i) ? sortKey[0].toUpperCase() : null}
                />
              );
            })}
          </AbsoluteFill>
        </AbsoluteFill>
      </AbsoluteFill>
      {film.landings.map((l) => (
        <Sequence
          key={l.card}
          from={l.open}
          durationInFrames={l.close - l.open + OPEN}
        >
          <Opened
            shot={l.shot}
            card={cards[index(l.card)]}
            open={l.open}
            close={l.close}
          />
        </Sequence>
      ))}
      {film.watermark ? (
        <Img
          src={staticFile(film.watermark.src)}
          style={{
            position: "absolute",
            left: film.watermark.x,
            top: film.watermark.y,
            width: film.watermark.size[0],
            height: film.watermark.size[1],
            opacity: fadeOut,
          }}
        />
      ) : null}
      <Sequence from={film.endAt + 12}>
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            paddingBottom: 140,
          }}
        >
          <CBLogo start={2} width={300} shimmerAt={38} cbOnly />
        </AbsoluteFill>
      </Sequence>
      <FilmFinish />
    </AbsoluteFill>
  );
};
