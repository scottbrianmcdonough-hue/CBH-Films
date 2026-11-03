import React from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors, sans, serif } from "../hotel-film/theme";

// "50 sleeps until Christmas" (Bianca, 3 Nov: a push for the Christmas availability, "a '50 Sleeps until Xmas'
// style headline", out Thu 5 Nov; 5 Nov to 25 Dec is 50 days). In the house style (Scott: "update to house
// style and make it feel premium"; the first version was one still with a giant 50): a 4:5 carousel, a frame a
// slide (--sequence): the cover full bleed on Hogarths Stone Manor's Christmas table (its festive reel), the
// house label bottom left (50 SLEEPS UNTIL CHRISTMAS in gold caps with its still underline, the line in cream
// Cormorant: "Reserve your seat at the table", Bianca: "still room" read as not popular); four hotels dressed for Christmas, each with its label (the place in gold caps, the name in cream
// Cormorant); the close a clean black card, cream Cormorant centred, white CB. The Story (9:16) is the cover.

const F = "campaigns/festive/graded/";
type Slide = { src: string; pos: string; place: string; name: string };
// only hotels with Christmas rooms left (Scott checked each CBH page and the booking engine, 3 Nov): Rowton Hall
// on the cover, Barnett Hill (tight) and Langshott Manor; Hogarths Stone Manor (no Christmas availability) and
// Low Wood Bay (no Christmas package, 24 to 26 Dec closed) are out
const HOTELS: Slide[] = [
  {
    src: F + "barnett-hill-staircase.jpg",
    pos: "45% 50%",
    place: "Guildford, Surrey",
    name: "Barnett Hill",
  },
  {
    src: F + "langshott-manor-nutcracker.jpg",
    pos: "30% 60%",
    place: "Horley, Surrey",
    name: "Langshott Manor",
  },
];
export const FIFTY_SLIDES = HOTELS.length + 2;

const Caps: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ display: "inline-block" }}>
    <div
      style={{
        fontFamily: sans,
        fontWeight: 600,
        fontSize: 28,
        letterSpacing: "0.3em",
        color: colors.gold,
        textTransform: "uppercase",
      }}
    >
      {children}
    </div>
    <div style={{ height: 2, background: colors.gold, marginTop: 12 }} />
  </div>
);
const Shade: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "linear-gradient(to bottom, rgba(9,9,10,0) 45%, rgba(9,9,10,0.7) 74%, rgba(9,9,10,0.9) 100%)",
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
const Mark: React.FC<{ tall: boolean }> = ({ tall }) => (
  <Img
    src={staticFile("brand/cb-watermark.png")}
    style={{
      position: "absolute",
      right: 72,
      bottom: tall ? 480 : 72,
      width: 58,
      height: 63,
      opacity: 0.9,
    }}
  />
);

export const FiftySleeps: React.FC = () => {
  const i = useCurrentFrame();
  const tall = useVideoConfig().height > 1500;
  if (i === 0) {
    return (
      <AbsoluteFill style={{ backgroundColor: colors.black }}>
        <Photo src={F + "rowton-hall-mantel.jpg"} pos="45% 50%" />
        <Shade />
        <div
          style={{
            position: "absolute",
            left: 76,
            right: 170,
            bottom: tall ? 470 : 110,
          }}
        >
          <Caps>50 sleeps until Christmas</Caps>
          <div
            style={{
              fontFamily: serif,
              fontSize: 96,
              lineHeight: 1.04,
              color: colors.cream,
              marginTop: 24,
            }}
          >
            Reserve your seat
            <br />
            <span style={{ fontStyle: "italic" }}>at the table</span>
          </div>
          <div
            style={{
              fontFamily: sans,
              fontSize: 26,
              letterSpacing: "0.04em",
              color: "rgba(245,239,227,0.78)",
              marginTop: 22,
            }}
          >
            Rowton Hall Hotel &amp; Spa, Chester
          </div>
        </div>
        <Mark tall={tall} />
      </AbsoluteFill>
    );
  }
  if (i === HOTELS.length + 1) {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: colors.black,
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 92,
            lineHeight: 1.1,
            color: colors.cream,
            marginTop: -40,
          }}
        >
          Christmas, Twixmas
          <br />
          <span style={{ fontStyle: "italic" }}>and New Year</span>
        </div>
        <div
          style={{
            fontFamily: sans,
            fontSize: 26,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: "rgba(245,239,227,0.8)",
            marginTop: 40,
          }}
        >
          Breaks bookable now
        </div>
        <Mark tall={tall} />
      </AbsoluteFill>
    );
  }
  const h = HOTELS[i - 1];
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      <Photo src={h.src} pos={h.pos} />
      <Shade />
      <div style={{ position: "absolute", left: 76, right: 170, bottom: 110 }}>
        <Caps>{h.place}</Caps>
        <div
          style={{
            fontFamily: serif,
            fontSize: 80,
            lineHeight: 1.05,
            color: colors.cream,
            marginTop: 20,
            whiteSpace: "pre-line",
          }}
        >
          {h.name}
        </div>
      </div>
      <Mark tall={tall} />
    </AbsoluteFill>
  );
};
