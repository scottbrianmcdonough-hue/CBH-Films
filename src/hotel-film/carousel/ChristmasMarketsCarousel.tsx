import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { colors, sans, serif } from "../theme";

// The Christmas markets blog as an Instagram carousel (Bianca, 3 Nov: "get the xmas market stuff out again";
// Scott: "more premium, it's going on Insta and it's going to be a carousel, so need photos"). 4:5, a frame a
// slide (render with --sequence). The blog itself is blocked from here, so no market is named: the cover,
// then one hotel at Christmas a slide, minimal and full bleed (the place in gold caps with its still
// underline, the name in cream Cormorant, a short italic line about the photo), then a close that points to
// the guide. The festive graded photos from the festive reel; no hotel counts.

const F = "campaigns/festive/graded/";
type Slide = {
  src: string;
  pos: string;
  place: string;
  name: string;
  line: string;
};
const SLIDES: Slide[] = [
  {
    src: F + "rowton-hall-mantel.jpg",
    pos: "45% 50%",
    place: "Chester",
    name: "Rowton Hall Hotel & Spa",
    line: "Garland on the mantel",
  },
  {
    src: F + "low-wood-bay-columns.jpg",
    pos: "50% 50%",
    place: "Windermere, Lake District",
    name: "Low Wood Bay Resort",
    line: "Lights all the way down the hall",
  },
  {
    src: F + "langshott-manor-nutcracker.jpg",
    pos: "30% 50%",
    place: "Horley, Surrey",
    name: "Langshott Manor",
    line: "A nutcracker on guard",
  },
  {
    src: F + "barnett-hill-staircase.jpg",
    pos: "45% 50%",
    place: "Guildford, Surrey",
    name: "Barnett Hill",
    line: "The tree on the stair",
  },
  {
    src: F + "nailcote-hall-snow.jpg",
    pos: "35% 50%",
    place: "Berkswell, Warwickshire",
    name: "Nailcote Hall",
    line: "Snow on the gables",
  },
  {
    src: F + "oakley-hall-exterior.jpg",
    pos: "50% 50%",
    place: "Oakley, Hampshire",
    name: "Oakley Hall Hotel",
    line: "Lit up for the season",
  },
];
export const MARKETS_SLIDES = SLIDES.length + 2;

const Caps: React.FC<{ children: React.ReactNode; size?: number }> = ({
  children,
  size = 26,
}) => (
  <div style={{ display: "inline-block" }}>
    <div
      style={{
        fontFamily: sans,
        fontWeight: 600,
        fontSize: size,
        letterSpacing: "0.3em",
        color: colors.gold,
        textTransform: "uppercase",
      }}
    >
      {children}
    </div>
    <div style={{ height: 2, background: colors.gold, marginTop: 10 }} />
  </div>
);
const Mark: React.FC = () => (
  <Img
    src={staticFile("brand/cb-watermark.png")}
    style={{
      position: "absolute",
      right: 72,
      bottom: 92,
      width: 58,
      height: 63,
      opacity: 0.9,
    }}
  />
);
const Photo: React.FC<{ src: string; pos: string }> = ({ src, pos }) => (
  <Img
    src={staticFile(src)}
    style={{
      width: "100%",
      height: "100%",
      objectFit: "cover",
      objectPosition: pos,
    }}
  />
);

export const ChristmasMarketsCarousel: React.FC = () => {
  const i = useCurrentFrame();
  if (i === 0) {
    return (
      <AbsoluteFill style={{ backgroundColor: colors.black }}>
        <Photo src={F + "hintlesham-hall-exterior.jpg"} pos="58% 50%" />
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(to bottom, rgba(9,9,10,0) 34%, rgba(9,9,10,0.8) 70%, rgba(9,9,10,0.94) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 170,
            textAlign: "center",
          }}
        >
          <Caps size={28}>Christmas markets</Caps>
          <div
            style={{
              fontFamily: serif,
              fontSize: 104,
              lineHeight: 1.03,
              color: colors.cream,
              marginTop: 30,
            }}
          >
            Browse the stalls,
            <br />
            <span style={{ fontStyle: "italic" }}>then somewhere warm</span>
          </div>
        </div>
        <Mark />
      </AbsoluteFill>
    );
  }
  if (i === SLIDES.length + 1) {
    return (
      <AbsoluteFill style={{ backgroundColor: colors.black }}>
        <Photo src={F + "fairlawns-afternoon-tea.jpg"} pos="50% 50%" />
        <AbsoluteFill style={{ backgroundColor: "rgba(9,9,10,0.72)" }} />
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <div style={{ marginTop: -40 }}>
            <Caps size={28}>The guide</Caps>
            <div
              style={{
                fontFamily: serif,
                fontSize: 100,
                lineHeight: 1.06,
                color: colors.cream,
                marginTop: 30,
              }}
            >
              Plan your
              <br />
              <span style={{ fontStyle: "italic" }}>market weekend</span>
            </div>
            <div
              style={{
                fontFamily: sans,
                fontSize: 26,
                letterSpacing: "0.22em",
                color: "rgba(245,239,227,0.82)",
                textTransform: "uppercase",
                marginTop: 44,
              }}
            >
              classicbritishhotels.com
            </div>
          </div>
        </AbsoluteFill>
        <Mark />
      </AbsoluteFill>
    );
  }
  const s = SLIDES[i - 1];
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      <Photo src={s.src} pos={s.pos} />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(9,9,10,0) 52%, rgba(9,9,10,0.62) 78%, rgba(9,9,10,0.86) 100%)",
        }}
      />
      <div style={{ position: "absolute", left: 76, right: 160, bottom: 96 }}>
        <Caps>{s.place}</Caps>
        <div
          style={{
            fontFamily: serif,
            fontSize: 76,
            lineHeight: 1.04,
            color: colors.cream,
            marginTop: 18,
          }}
        >
          {s.name}
        </div>
        <div
          style={{
            fontFamily: serif,
            fontStyle: "italic",
            fontSize: 40,
            color: "rgba(245,239,227,0.88)",
            marginTop: 10,
          }}
        >
          {s.line}
        </div>
      </div>
      <Mark />
    </AbsoluteFill>
  );
};
