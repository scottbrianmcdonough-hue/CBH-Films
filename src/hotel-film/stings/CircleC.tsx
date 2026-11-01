import React from "react";
import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { FilmFinish } from "../components/FilmFinish";
import { colors, EASE_OUT, progress, serif } from "../theme";

// "Every circle is a C", a brand moment (Scott: "a whole new take ... like these new logo
// moments"): match cuts on round things from across the collection, each lit in darkness
// and landing at exactly the same place and size, the cuts coming faster; every circle
// turns slowly, the turn slowing to a stop as the last (Hintlesham's dark slate plate)
// becomes the C of the CB in gold. The B joins it and the CB
// settles into the official logo, with its shimmer (Scott tried the white corner CB, then
// "kinda like the gold logo": gold, as on the mosaic's logo moments). Plate rims from scripts/plate-rim.py.

// faster (Scott: "make it faster"), ending on the offer so it reads as a stay, not only
// restaurants ("Foodie Breaks from 139 ... so it doesn't look like we just do restaurants")

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const GRADE =
  "sepia(0.3) hue-rotate(-14deg) saturate(1.08) contrast(1.02) brightness(0.98)";

// where every circle lands: the C's own outer circle (centre 216.2, 154.5, radius 156.9 in
// the logo's viewBox, fitted from cbh-logo-c-only.svg) at this size on screen
const CX = 540;
const CY = 900;
const R = 380;

type Circle = { src: string; c: [number, number, number] }; // the rim: centre, radius
// Overhead plates with their whole rim in the photo (rims from scripts/plate-rim.py; a rim
// that runs to the edge has the photo extended with scripts/plate-pad.py), breakfast to
// dinner, light and dark alternating (Scott: "needs more plates"; the CBH site's overhead
// shots, 16 Oct). Tilted plates aren't stretched round (it would look fake).
const PLATES: { shot: Circle }[] = [
  {
    shot: {
      src: "stings/plates/padded/gomersal-park-breakfast.jpg",
      c: [1105.9, 840.8, 563],
    },
  },
  {
    shot: {
      src: "stings/plates/donnington-manor-breakfast-1.jpg",
      c: [1027.4, 509.7, 397],
    },
  },
  {
    shot: {
      src: "stings/plates/padded/low-wood-bay.jpg",
      c: [876.3, 1310, 540],
    },
  },
  {
    shot: { src: "stings/plates/waterton-park.jpg", c: [1241.6, 608.9, 490] },
  },
  {
    // its rim runs just off the top of the photo: extended by a soft 140px mirrored strip
    shot: {
      src: "stings/fish-and-chips-padded.jpg",
      c: [889.6, 738.3, 623],
    },
  },
  {
    // only 1024px on the site: on screen for a moment, so it holds up
    shot: {
      src: "stings/plates/donnington-and-co.jpg",
      c: [346.7, 266.3, 137.5],
    },
  },
  {
    shot: {
      src: "campaigns/foodie-match-cut/gisborough-hall.jpg",
      c: [792.3, 990.8, 629.4],
    },
  },
  {
    shot: {
      src: "campaigns/foodie-match-cut/hintlesham-hall.jpg",
      c: [845.1, 1167.1, 667.6],
    },
  },
];
// The cycle runs like a wheel spun and slowing (Scott: "make it longer through the cycling
// so it looks like speed then slow"): the cuts quicken to a blur of plates two frames each,
// then ease back out, Hintlesham (the last, always) held as it becomes the gold C on the
// track's hit. The plates repeat through the blur, never twice in a row. [plate, frames]
const CYCLE: [number, number][] = [
  [0, 14],
  [1, 11],
  [2, 9],
  [3, 7],
  [4, 5],
  [5, 4],
  [6, 3],
  [0, 3],
  [2, 2],
  [4, 2],
  [1, 2],
  [3, 2],
  [5, 2],
  [6, 2],
  [0, 3],
  [2, 3],
  [4, 4],
  [1, 5],
  [3, 7],
  [6, 9],
  [0, 12],
  [7, 18],
];
// the spin follows the same rhythm: fast through the blur, slowing to a stop on the C
const SPIN = (() => {
  const dur: number[] = [];
  CYCLE.forEach(([, f]) => {
    for (let k = 0; k < f; k++) dur.push(f);
  });
  const n = dur.length;
  const w = dur.map(
    (d, i) => (24 / d) * Math.pow(Math.min(1, (n - i) / 18), 2),
  );
  const sm = w.map((_, i) => {
    // eased, so the spin speeds up and slows without steps
    let a = 0,
      c = 0;
    for (let j = Math.max(0, i - 4); j <= Math.min(n - 1, i + 4); j++) {
      a += w[j];
      c++;
    }
    return a / c;
  });
  const angle = new Array(n + 1).fill(0);
  for (let i = n - 1; i >= 0; i--) angle[i] = angle[i + 1] + sm[i];
  return angle; // degrees still to turn at each frame; 0 on the C
})();
// Each version is cut to its own track (Scott sent five loungey Pixabay options), the gold C
// on the track's hit
export type CircleCVariant = {
  id: string;
  music: string;
  hit: number; // seconds into the track: the gold C lands here
  gain: number; // about -15.5 LUFS
};
export const CIRCLE_C_VARIANTS: CircleCVariant[] = [
  {
    // Deep House Sunset (Sunset House Grooves, Pixabay 538759), 123 BPM: the plates start on
    // the last kick before the drop and run through the kickless bar; the C on the drop
    id: "cbh-circle-c",
    music: "stings/deep-house-sunset.mp3",
    hit: 94.05,
    gain: 0.57,
  },
  {
    // Jazz Cocktail Lounge Music (alex-morgan, Pixabay 556246), 112 BPM: the plates run
    // through the band's stop over the piano, Hintlesham on the drum fill, the C as the band
    // comes back in
    id: "cbh-circle-c-cocktail",
    music: "stings/jazz-cocktail-lounge.mp3",
    hit: 52.02,
    gain: 0.48,
  },
];
const AFTER = 137; // the logo and the offer, after the C
const SHOW_OFFER = false; // the text offer under the logo (Scott: a link sticker goes there)
const CYCLE_FRAMES = CYCLE.reduce((a, [, f]) => a + f, 0);
// (one cycle for both tracks: the variant only sets where the C lands in its music)
export const circleCFrames = () => CYCLE_FRAMES + AFTER;

// the logo
const VB: [number, number] = [534.25, 655.69];
const C_CENTRE: [number, number] = [216.2, 154.5];
const C_R = 156.9;
const LOGO_W = 640;
const LOGO_X = (1080 - LOGO_W) / 2;
const LOGO_Y = 380; // a little higher than usual, to leave room for the offer
const LOGO_S = LOGO_W / VB[0];

// every circle turns with the cycle (one turn shared across the cuts, so the motion carries
// straight through them)
const turnAt = (frame: number) => SPIN[Math.min(frame, SPIN.length - 1)];

const Shot: React.FC<{ shot: Circle; frame: number; blur: number }> = ({
  shot,
  frame,
  blur,
}) => {
  const [cx, cy, r] = shot.c;
  const k = R / r;
  return (
    <AbsoluteFill
      style={{
        // lit in darkness: the photo falls away to black beyond its rim
        maskImage: `radial-gradient(circle at ${CX}px ${CY}px, black ${R * 1.03}px, transparent ${R * 1.28}px)`,
        transform: `rotate(${turnAt(frame)}deg)`,
        transformOrigin: `${CX}px ${CY}px`,
      }}
    >
      <Img
        src={staticFile(shot.src)}
        style={{
          position: "absolute",
          left: CX - cx * k,
          top: CY - cy * k,
          transform: `scale(${k})`,
          transformOrigin: "0 0",
          // a touch of motion blur at the fastest cuts, so the spin reads as speed
          filter: blur ? `${GRADE} blur(${blur}px)` : GRADE,
          maxWidth: "none",
        }}
      />
    </AbsoluteFill>
  );
};

export const CircleC: React.FC<{ variant: CircleCVariant }> = ({ variant }) => {
  const frame = useCurrentFrame();
  const total = circleCFrames();
  const C_AT = total - AFTER; // the gold C replaces the last plate
  const SETTLE = [C_AT + 2, C_AT + 30]; // the CB settles into the logo
  // the B joins once the shrinking CB fits on screen (13 frames into the settle; at the
  // rim's size it ran off the right edge: Scott, "the CB flicks out of the screen"), quick:
  // half-faded it read as a grey block
  const B_IN = [C_AT + 15, C_AT + 20];
  const WORDMARK = [C_AT + 28, C_AT + 50];
  const OFFER = C_AT + 46; // Foodie Breaks, from £139, rising in under the logo
  const SHIMMER = C_AT + 58;
  let start = 0;
  const i = CYCLE.findIndex(([, f]) => {
    if (frame < start + f) return true;
    start += f;
    return false;
  });
  const shot = i >= 0 ? PLATES[CYCLE[i][0]] : undefined;
  // the CB: from the C on the last plate's rim to its place in the logo
  const t = interpolate(frame, SETTLE, [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const k0 = R / C_R;
  const k = k0 + (LOGO_S - k0) * t;
  const ox = interpolate(t, [0, 1], [CX - C_CENTRE[0] * k0, LOGO_X]);
  const oy = interpolate(t, [0, 1], [CY - C_CENTRE[1] * k0, LOGO_Y]);
  const box = {
    position: "absolute" as const,
    left: ox,
    top: oy,
    width: VB[0] * k,
    height: VB[1] * k,
  };
  const b = interpolate(frame, B_IN, [0, 1], clamp);
  const word = interpolate(frame, WORDMARK, [0, 1], clamp);
  const sweep = interpolate(frame, [SHIMMER, SHIMMER + 30], [-60, 160], clamp);
  // a soft bloom on the C as it lands, fading
  const bloom = interpolate(frame, [C_AT, C_AT + 20], [0.55, 0], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      <Audio
        src={staticFile(variant.music)}
        trimBefore={Math.round(variant.hit * 30 - C_AT)}
        volume={(f) =>
          variant.gain *
          interpolate(f, [0, 3, total - 24, total], [0, 1, 1, 0], clamp)
        }
      />
      {shot ? (
        <Shot
          shot={shot.shot}
          frame={frame}
          blur={CYCLE[i][1] <= 2 ? 1.6 : CYCLE[i][1] === 3 ? 0.8 : 0}
        />
      ) : null}
      {frame >= C_AT ? (
        <>
          <Img
            src={staticFile("brand/cbh-logo-on-dark.svg")}
            style={{ ...box, opacity: word }}
          />
          <div
            style={{
              ...box,
              backgroundColor: colors.gold,
              WebkitMaskImage: `url(${staticFile("brand/cbh-logo-c-only.svg")})`,
              maskImage: `url(${staticFile("brand/cbh-logo-c-only.svg")})`,
              WebkitMaskSize: "100% 100%",
              maskSize: "100% 100%",
              filter: `drop-shadow(0 0 ${40 * bloom}px rgba(255,214,150,${bloom}))`,
              opacity: 1 - word,
            }}
          />
          <div
            style={{
              ...box,
              backgroundColor: colors.gold,
              WebkitMaskImage: `url(${staticFile("brand/cbh-logo-b-only.svg")})`,
              maskImage: `url(${staticFile("brand/cbh-logo-b-only.svg")})`,
              WebkitMaskSize: "100% 100%",
              maskSize: "100% 100%",
              opacity: b * (1 - word),
            }}
          />
          <div
            style={{
              ...box,
              WebkitMaskImage: `url(${staticFile("brand/cbh-logo-cb-only.svg")})`,
              maskImage: `url(${staticFile("brand/cbh-logo-cb-only.svg")})`,
              WebkitMaskSize: "100% 100%",
              maskSize: "100% 100%",
              background: `linear-gradient(110deg, transparent ${sweep - 25}%, rgba(255,246,220,0.95) ${sweep}%, transparent ${sweep + 25}%)`,
            }}
          />
        </>
      ) : null}
      {/* the offer, under the logo: cream Cormorant (the text rule); off for posting, Scott
          puts Instagram's Foodie Breaks link sticker in that space instead */}
      {SHOW_OFFER ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 1262,
            textAlign: "center",
            opacity: progress(frame, OFFER, 22, EASE_OUT),
            transform: `translateY(${(1 - progress(frame, OFFER, 22, EASE_OUT)) * 30}px)`,
          }}
        >
          <div
            style={{
              fontFamily: serif,
              fontSize: 84,
              lineHeight: 1.05,
              color: colors.cream,
            }}
          >
            Foodie Breaks
          </div>
          <div
            style={{
              fontFamily: serif,
              fontStyle: "italic",
              fontSize: 64,
              lineHeight: 1.1,
              color: colors.cream,
            }}
          >
            from £139
          </div>
        </div>
      ) : null}
      <FilmFinish />
    </AbsoluteFill>
  );
};
