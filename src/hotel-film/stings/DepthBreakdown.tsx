import React from "react";
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
import { colors, EASE_OUT, progress } from "../theme";
import { accent, personal } from "./personal-type";
import { CUP_OUTLINE, HILL_OUTLINE } from "./depth-paths";

// How the depth moves are made, for Scott's LinkedIn (and a 9:16) (Scott: "a demo how it is
// made, like how you took screenshots, hand drawn the lines, depth map then moves then 3D";
// "add the mountain too, how it's made, if it fits"). The coffee: 01 the two screenshots come
// in; 02 the lines draw on (the window's edge, the rail, the cup's outline, traced from its
// matte); 03 they become the depth map (near light, far dark); 04 the cup lifts out, the sill
// filled in behind it (so nothing behind it warps: Scott, "watch the warping"); 05 the camera
// move; 06 its layers pulled apart in 3D. The mountain: 07 a model reads its depth (MiDaS, the
// map wiping across); 08 the near hillside traced and cut out; 09 the move; 10 its layers in
// 3D. "Crossing into / the third dimension" (Scott: make "Made from two photos" stronger; it
// matches the post's hook). Deep House Sunset from 44.76s, the coffee's 3D on its
// second drop (62.76s), every step on a bar. Assets from public/demo/make-breakdown-assets.py.

export const DEPTH_BREAKDOWN_FRAMES = 1235; // the end line gets time to turn 3D

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const DROP = 540; // the coffee's 3D, on the drop
const MUSIC_START = Math.round(62.76 * 30) - DROP;
// the coffee's steps, then the mountain's, each on a bar (58.5 frames)
const S = { draw: 72, depth: 247, cut: 306, move: 423, three: 540, end: 716 };
const M = { depth: 716, cut: 775, move: 833, three: 950, end: 1067 };
const PW = 1126; // the coffee photo's basis
const PH = 2000;
const MW = 1333; // the mountain photo's
const MH = 2000;
const stroke = accent; // white: Scott's own piece, not CBH gold

const ease = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });

const Fill: React.FC<{
  src: string;
  w: number;
  h: number;
  style?: React.CSSProperties;
}> = ({ src, w, h, style }) => (
  <Img
    src={staticFile(src)}
    style={{
      position: "absolute",
      left: 0,
      top: 0,
      width: w,
      height: h,
      ...style,
    }}
  />
);

const Step: React.FC<{
  n: string;
  label: string;
  from: number;
  to: number;
  top: number;
}> = ({ n, label, from, to, top }) => {
  const frame = useCurrentFrame();
  const o =
    progress(frame, from + 2, 14, EASE_OUT) *
    interpolate(frame, [to - 8, to], [1, 0], clamp);
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: top + 200,
          background: "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0))",
          opacity: o,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 72,
          top,
          display: "flex",
          alignItems: "baseline",
          gap: 20,
          opacity: o,
          transform: `translateY(${(1 - o) * 12}px)`,
          fontFamily: personal,
          fontWeight: 500,
          letterSpacing: "-0.01em",
          textShadow: "0 1px 4px rgba(0,0,0,0.5), 0 0 28px rgba(0,0,0,0.55)",
        }}
      >
        <span style={{ color: accent, fontSize: 40, opacity: 0.7 }}>{n}</span>
        <span style={{ color: accent, fontSize: 54 }}>{label}</span>
      </div>
    </>
  );
};

const Tag: React.FC<{
  text: string;
  x: number;
  y: number;
  o: number;
  dark?: boolean; // on the light (near) end of the map
}> = ({ text, x, y, o, dark = false }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      fontFamily: personal,
      fontWeight: 500,
      letterSpacing: "-0.01em",
      fontSize: 68,
      color: dark ? "#1b1610" : accent,
      opacity: o,
      textShadow: dark ? "none" : "0 2px 18px rgba(0,0,0,0.7)",
    }}
  >
    {text}
  </div>
);

// white lines drawing on, in a photo's basis
const Lines: React.FC<{
  w: number;
  h: number;
  paths: [string, number][];
  opacity: number;
}> = ({ w, h, paths, opacity }) => (
  <svg
    width={w}
    height={h}
    style={{ position: "absolute", left: 0, top: 0, opacity }}
  >
    {paths.map(([d, off], i) => (
      <path
        key={i}
        d={d}
        pathLength={1}
        fill="none"
        stroke={stroke}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="1 1"
        strokeDashoffset={off}
        style={{ filter: `drop-shadow(0 0 8px ${stroke})` }}
      />
    ))}
  </svg>
);

// a photo's layers pulled apart in 3D and swung round, then put back
// the mountain photo's 1333 x 2000 basis: filling the height on the 9:16 (centred), the
// width on the 4:5
export const mountainBasis = (tall: boolean) => {
  const ms = tall ? 1920 / MH : 1080 / MW;
  return {
    w: MW,
    h: MH,
    transform: `translate(${tall ? (1080 - MW * ms) / 2 : 0}px, ${tall ? 0 : (1350 - MH * ms) / 2}px) scale(${ms})`,
  };
};

export const Layers3D: React.FC<{
  frame: number;
  from: number;
  to: number;
  frameH: number;
  basis: { w: number; h: number; transform: string };
  layers: [string, number][];
}> = ({ frame, from, to, frameH, basis, layers }) => {
  const apart = ease(frame, from, from + 40) - ease(frame, to - 40, to - 6);
  const swing = ease(frame, from, from + 70) - ease(frame, to - 46, to - 6);
  const sway = Math.sin(((frame - from) / (to - from)) * Math.PI);
  return (
    <AbsoluteFill style={{ perspective: 2200 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformStyle: "preserve-3d",
          transform: `rotateX(${8 * swing}deg) rotateY(${-20 * swing + 5 * sway}deg) scale(${1 - 0.22 * apart})`,
          transformOrigin: `540px ${frameH / 2}px`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: basis.w,
            height: basis.h,
            transformStyle: "preserve-3d",
            transform: basis.transform,
            transformOrigin: "0 0",
          }}
        >
          {layers.map(([src, z]) => (
            <div
              key={src}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: basis.w,
                height: basis.h,
                transform: `translateZ(${z * apart}px)`,
                outline: `3px solid rgba(255,255,255,${0.55 * apart})`,
              }}
            >
              <Fill src={src} w={basis.w} h={basis.h} />
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Word: React.FC<{
  word: string;
  z: number;
  depth: number;
  ex: number;
  size: number;
  weight?: number;
}> = ({ word, z, depth, ex, size, weight = 300 }) => {
  const N = 24;
  const type: React.CSSProperties = {
    fontFamily: personal,
    fontWeight: weight,
    letterSpacing: "-0.01em",
    fontSize: size,
    lineHeight: 1.15,
    whiteSpace: "nowrap",
  };
  return (
    <div
      style={{
        position: "relative",
        transformStyle: "preserve-3d",
        transform: `translateZ(${z}px)`,
      }}
    >
      <div style={{ ...type, visibility: "hidden" }}>{word}</div>
      {Array.from({ length: N + 1 }, (_, k) => N - k).map((i) => {
        // the back layers first; the face (i = 0) last, in white; dark sides so it reads
        const t = i / N;
        const shade = Math.round(120 - 95 * t);
        return (
          <div
            key={i}
            style={{
              ...type,
              position: "absolute",
              left: 0,
              top: 0,
              color: i === 0 ? accent : `rgb(${shade},${shade},${shade})`,
              transform: `translateZ(${-depth * t}px)`,
              opacity: i === 0 ? 1 : Math.min(1, ex * 3),
            }}
          >
            {word}
          </div>
        );
      })}
    </div>
  );
};

// The end: "Crossing into / the third dimension" set inside the mountain photo (Scott: "more
// realistic ... needs to be wow"): the photo's layers part a little, the camera glides (each
// layer scaled so it fills the frame at rest, so only the parallax shows), and the line rises
// from behind the near hillside to sit in the depth between the lake and the hill, solid
// type with a shadow falling on the mountain behind it
const EndScene: React.FC<{
  frame: number;
  from: number;
  to: number;
  basis: { w: number; h: number; transform: string };
}> = ({ frame, from, to, basis }) => {
  const P = 2200; // perspective
  const apart = ease(frame, from, from + 50);
  const glide = interpolate(frame, [from, to], [0, 1], clamp);
  const rotY = 8 - 16 * glide; // a slow glide across, the near hill passing the line
  const rotX = 3;
  // the line rises up out of the far shore of the lake, as if over a horizon, so it is seen
  // to travel (Scott: "into peeks from the cliff ... it just showed up, it needs to rise")
  const rise = interpolate(frame, [from + 16, from + 92], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const ex = ease(frame, from + 40, from + 80);
  const fadeOut = interpolate(frame, [to - 16, to], [1, 0], clamp);
  // basis px: the frame's centre sits at (666, 1000) in both sizes
  const O = "666px 1000px";
  const plane = (z: number, children: React.ReactNode, key: string) => (
    <div
      key={key}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: basis.w,
        height: basis.h,
        transformStyle: "preserve-3d",
        // pushed back, then scaled up so it still fills the frame: only parallax shows
        transform: `translateZ(${z * apart}px) scale(${(P - z * apart) / P})`,
        transformOrigin: O,
      }}
    >
      {children}
    </div>
  );
  const size = 104;
  const textTop = 790 + 300 * (1 - rise);
  const HORIZON = 1072; // basis px: the lake's far shore, the line rises from behind it
  // a soft edge, not a hard cut: the letters come up out of the haze over the lake instead
  // of being sliced off along a straight line
  const horizon = (dy: number): React.CSSProperties => {
    const mask = `linear-gradient(to bottom, black ${HORIZON + dy - 70}px, transparent ${HORIZON + dy + 6}px)`;
    return { maskImage: mask, WebkitMaskImage: mask };
  };
  const lines = (
    <div
      style={{
        position: "absolute",
        left: 0,
        width: basis.w,
        top: textTop,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        transformStyle: "preserve-3d",
      }}
    >
      {["Crossing into", "the third dimension"].map((t) => (
        <Word
          key={t}
          word={t}
          z={0}
          depth={14 * ex}
          ex={ex}
          size={size}
          weight={500}
        />
      ))}
    </div>
  );
  const shadow = (
    <div
      style={{
        position: "absolute",
        left: 26,
        width: basis.w,
        top: textTop + 30,
        textAlign: "center",
        fontFamily: personal,
        fontWeight: 500,
        fontSize: size,
        lineHeight: 1.15,
        color: "rgba(0,0,0,0.5)",
        filter: "blur(14px)",
        opacity: rise,
      }}
    >
      Crossing into
      <br />
      the third dimension
    </div>
  );
  return (
    <AbsoluteFill style={{ perspective: P, opacity: fadeOut }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotX * apart}deg) rotateY(${rotY * apart}deg) scale(1.12)`,
          transformOrigin: "540px 50%",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: basis.w,
            height: basis.h,
            transformStyle: "preserve-3d",
            transform: basis.transform,
            transformOrigin: "0 0",
          }}
        >
          {plane(
            -300,
            <Fill
              src="demo/bm-far-v3.png"
              w={basis.w}
              h={basis.h}
              style={{ filter: `brightness(${1 - 0.22 * rise})` }}
            />,
            "far",
          )}
          {plane(
            -150,
            <Fill
              src="demo/bm-mid-v6.png"
              w={basis.w}
              h={basis.h}
              style={{ filter: `brightness(${1 - 0.22 * rise})` }}
            />,
            "mid",
          )}
          {plane(
            -145,
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: basis.w,
                height: basis.h,
                ...horizon(30),
              }}
            >
              {shadow}
            </div>,
            "shadow",
          )}
          {plane(
            -40,
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: basis.w,
                height: basis.h,
                ...horizon(0),
              }}
            >
              {lines}
            </div>,
            "text",
          )}
          {plane(
            110,
            <Fill src="demo/bm-near-v2.png" w={basis.w} h={basis.h} />,
            "near",
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const DepthBreakdown: React.FC<{ aspect: "45" | "916" }> = ({
  aspect,
}) => {
  const frame = useCurrentFrame();
  const tall = aspect === "916";
  const H = tall ? 1920 : 1350;
  const top = tall ? 250 : 64;
  // the coffee fills the width; the 4:5 sits on the cup, sill and lower window
  const offY = tall ? 1 : -588;
  const coffee = {
    w: PW,
    h: PH,
    transform: `translateY(${offY}px) scale(${1080 / PW})`,
  };
  const mountain = mountainBasis(tall);
  const basisStyle = (
    b: { w: number; h: number; transform: string },
    o: number,
  ) =>
    ({
      position: "absolute",
      left: 0,
      top: 0,
      width: b.w,
      height: b.h,
      transform: b.transform,
      transformOrigin: "0 0",
      opacity: o,
    }) as React.CSSProperties;

  // 01: the two screenshots drop in, then the coffee opens out to fill the frame
  const inA = progress(frame, 4, 22, EASE_OUT);
  const inB = progress(frame, 14, 22, EASE_OUT);
  const open = ease(frame, 52, S.draw);
  const cardW = 430;
  const cardH = cardW * (PH / PW);
  const cardY = (H - cardH) / 2;

  // coffee 02-04: lines draw on, the depth map, the cup lifts out
  const line = (a: number, b: number) =>
    interpolate(frame, [a, b], [1, 0], {
      ...clamp,
      easing: Easing.inOut(Easing.quad),
    });
  const linesOut = interpolate(
    frame,
    [S.depth + 20, S.depth + 40],
    [1, 0],
    clamp,
  );
  const dim = interpolate(frame, [S.draw, S.draw + 20], [1, 0.62], clamp);
  const depthIn = ease(frame, S.depth, S.depth + 22);
  const depthOut = ease(frame, S.cut, S.cut + 16);
  const lift =
    ease(frame, S.cut + 12, S.cut + 42) - ease(frame, S.move - 30, S.move - 4);
  const toMove = frame >= S.move ? 1 : 0; // a hard cut on the bar

  // mountain 07-08: the depth map wipes across, then the hillside is traced and lit
  const mWipe =
    ease(frame, M.depth + 10, M.depth + 44) *
    100 *
    (1 - ease(frame, M.cut, M.cut + 14));
  const mDim = interpolate(frame, [M.cut, M.cut + 14], [1, 0.45], clamp);
  const mToMove = frame >= M.move ? 1 : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.black, overflow: "hidden" }}>
      <Audio
        src={staticFile("stings/deep-house-sunset.mp3")}
        trimBefore={MUSIC_START}
        volume={(f) =>
          0.57 *
          interpolate(
            f,
            [0, 3, DEPTH_BREAKDOWN_FRAMES - 30, DEPTH_BREAKDOWN_FRAMES],
            [0, 1, 1, 0],
            clamp,
          )
        }
      />

      {/* 01 the screenshots */}
      {frame < S.draw ? (
        <>
          <div
            style={{
              position: "absolute",
              left: 70 - (1 - inA) * 300 - open * 600,
              top: cardY - 20,
              width: cardW,
              height: cardH,
              borderRadius: 28,
              overflow: "hidden",
              transform: `rotate(${-6 * inA}deg)`,
              opacity: inA,
              boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
            }}
          >
            <Img
              src={staticFile("demo/mountain.jpg")}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div
            style={{
              position: "absolute",
              left: interpolate(open, [0, 1], [600, 0]) + (1 - inB) * 300,
              top: interpolate(open, [0, 1], [cardY + 20, offY]),
              width: interpolate(open, [0, 1], [cardW, 1080]),
              height: interpolate(open, [0, 1], [cardW, 1080]) * (PH / PW),
              borderRadius: 28 * (1 - open),
              overflow: "hidden",
              transform: `rotate(${interpolate(open, [0, 1], [5, 0]) * inB}deg)`,
              opacity: inB,
              boxShadow: `0 30px 80px rgba(0,0,0,${0.6 * (1 - open)})`,
            }}
          >
            <Img
              src={staticFile("demo/coffee.jpg")}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </>
      ) : null}

      {/* coffee 02-04: the photo, its lines, its depth, the cup lifting out */}
      {frame >= S.draw && frame < S.move ? (
        <div style={basisStyle(coffee, 1 - toMove)}>
          <Fill
            src={frame < S.cut ? "demo/coffee.jpg" : "demo/bd-bg.jpg"}
            w={PW}
            h={PH}
            style={{ filter: `brightness(${frame < S.depth + 30 ? dim : 1})` }}
          />
          {frame >= S.cut ? (
            <Fill
              src="demo/bd-cup.png"
              w={PW}
              h={PH}
              style={{
                transform: `translateY(${-70 * lift}px) scale(${1 + 0.05 * lift})`,
                transformOrigin: "500px 1550px",
                filter: `drop-shadow(0 ${40 * lift}px ${36 * lift}px rgba(0,0,0,${0.55 * lift}))`,
              }}
            />
          ) : null}
          {/* the map over the cup, so it fades off a whole photo, cup and all */}
          <Fill
            src="demo/bd-depth.jpg"
            w={PW}
            h={PH}
            style={{ opacity: depthIn * (1 - depthOut) }}
          />
          <Lines
            w={PW}
            h={PH}
            opacity={linesOut}
            paths={[
              ["M220,0 L220,1080", line(S.draw + 8, S.draw + 40)],
              ["M220,1080 L1126,1590", line(S.draw + 30, S.draw + 70)],
              ["M220,1120 L1126,1710", line(S.draw + 50, S.draw + 90)],
              [CUP_OUTLINE, line(S.draw + 80, S.depth - 6)],
            ]}
          />
          <Tag text="Far" x={640} y={1000} o={depthIn * (1 - depthOut)} />
          <Tag text="Near" x={110} y={1830} o={depthIn * (1 - depthOut)} dark />
        </div>
      ) : null}

      {/* coffee 05: the move */}
      <Sequence from={S.move} durationInFrames={S.three - S.move}>
        <AbsoluteFill style={{ opacity: toMove }}>
          <Video src={staticFile(`demo/coffee-${aspect}.mp4`)} muted />
        </AbsoluteFill>
      </Sequence>

      {/* coffee 06: its layers in 3D */}
      {frame >= S.three && frame < S.end ? (
        <Layers3D
          frame={frame}
          from={S.three}
          to={S.end}
          frameH={H}
          basis={coffee}
          layers={[
            ["demo/bd-far.png", -900],
            ["demo/bd-mid.png", -250],
            ["demo/bd-cup.png", 260],
          ]}
        />
      ) : null}

      {/* mountain 07-08: a model reads its depth; the hillside traced and cut out */}
      {frame >= M.depth && frame < M.move ? (
        <div style={basisStyle(mountain, 1 - mToMove)}>
          <Fill
            src={frame < M.cut ? "demo/mountain.jpg" : "demo/bm-bg.jpg"}
            w={MW}
            h={MH}
            style={{ filter: `brightness(${mDim})` }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              clipPath: `inset(0 ${100 - mWipe}% 0 0)`,
            }}
          >
            <Fill src="demo/bm-depth.jpg" w={MW} h={MH} />
          </div>
          {mWipe > 0 && mWipe < 100 ? (
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: `calc(${mWipe}% - 2px)`,
                width: 4,
                backgroundColor: stroke,
                boxShadow: `0 0 18px ${stroke}`,
              }}
            />
          ) : null}
          {frame >= M.cut ? (
            <>
              <Fill src="demo/bm-near-v2.png" w={MW} h={MH} />
              <Lines
                w={MW}
                h={MH}
                opacity={1}
                paths={[[HILL_OUTLINE, line(M.cut + 6, M.move - 8)]]}
              />
            </>
          ) : null}
        </div>
      ) : null}

      {/* mountain 09: the move */}
      <Sequence from={M.move} durationInFrames={M.three - M.move}>
        <AbsoluteFill style={{ opacity: mToMove }}>
          <Video src={staticFile(`demo/mountain-${aspect}.mp4`)} muted />
        </AbsoluteFill>
      </Sequence>

      {/* mountain 10: its layers in 3D */}
      {frame >= M.three && frame < M.end + 12 ? (
        <Layers3D
          frame={frame}
          from={M.three}
          to={M.end}
          frameH={H}
          basis={mountain}
          layers={[
            ["demo/bm-far-v3.png", -650],
            ["demo/bm-mid-v6.png", -280],
            ["demo/bm-near-v2.png", 220],
          ]}
        />
      ) : null}

      {/* the end: the line inside the mountain */}
      {frame >= M.end ? (
        <EndScene
          frame={frame}
          from={M.end}
          to={DEPTH_BREAKDOWN_FRAMES}
          basis={mountain}
        />
      ) : null}

      <Step n="01" label="Two screenshots" from={0} to={S.draw} top={top} />
      <Step
        n="02"
        label="Draw the depth"
        from={S.draw}
        to={S.depth}
        top={top}
      />
      <Step n="03" label="The depth map" from={S.depth} to={S.cut} top={top} />
      <Step n="04" label="Cut out the cup" from={S.cut} to={S.move} top={top} />
      <Step
        n="05"
        label="Move the camera"
        from={S.move}
        to={S.three}
        top={top}
      />
      <Step n="06" label="Pull it apart" from={S.three} to={S.end} top={top} />
      <Step n="07" label="Map the depth" from={M.depth} to={M.cut} top={top} />
      <Step
        n="08"
        label="Cut out the hillside"
        from={M.cut}
        to={M.move}
        top={top}
      />
      <Step
        n="09"
        label="Move the camera"
        from={M.move}
        to={M.three}
        top={top}
      />
      <Step n="10" label="Step inside" from={M.three} to={M.end} top={top} />
    </AbsoluteFill>
  );
};
