import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { colors, sans, serif } from "../theme";

// The Christmas markets blog as an Instagram carousel (Bianca, 3 Nov; Scott: "more premium, it's going
// on Insta"). Rebuilt from the blog itself (classicbritishhotels.com/christmas-markets/, its text and its
// 12 photos via Scott, public/campaigns/christmas-markets/blog-brief.txt): the markets and the hotels the
// blog pairs them with, dates only where the blog gives them. 4:5, a frame a slide (--sequence).
//
// The blog's photos are 1024 x 576, so the market slides frame them as a 16:9 window on black (sharp at
// 936px), a soft dark copy of the photo filling the card behind: the market in gold caps with its still
// underline and the dates above, "Stay at" and the paired hotel in cream Cormorant beneath. The cover is
// the out of focus tree full bleed (it is meant to be soft), the close the champagne toast.

const M = "campaigns/christmas-markets/";
type Market = {
  src: string;
  pos?: string;
  market: string;
  kind: string; // what the market is, from the blog, in gold caps over the city
  dates: string;
  hotels: string[];
};
// Worcester (Hogarths Stone Manor) dropped: no December availability (Scott, 3 Nov)
const MARKETS: Market[] = [
  {
    src: M + "birmingham.jpg",
    market: "Birmingham",
    kind: "Frankfurt Christmas Market",
    dates: "5 November to 24 December",
    hotels: ["Hogarths Solihull"],
  },
  {
    src: M + "leeds.jpg",
    market: "Leeds",
    kind: "Christmas market, City Square",
    dates: "19 November to 23 December",
    hotels: ["Gomersal Park Hotel", "Waterton Park Hotel & Spa"],
  },
  {
    src: M + "chester.jpg",
    market: "Chester",
    kind: "Christmas market",
    dates: "18 November to 22 December",
    hotels: ["Rowton Hall\nHotel & Spa"],
  },
  {
    src: M + "winchester.jpg",
    market: "Winchester",
    kind: "Cathedral Christmas Market",
    dates: "20 November to 22 December",
    hotels: ["Oakley Hall Hotel"],
  },
  {
    src: M + "durham-snow.jpg",
    market: "Durham",
    kind: "Christmas Festival",
    dates: "4 to 6 December",
    hotels: ["The Morritt Hotel\n& Garage Spa"],
  },
  {
    src: M + "donnington-manor-snow.jpg",
    market: "Canterbury",
    kind: "Christmas market",
    dates: "Kent's biggest market",
    hotels: ["Donnington Manor Hotel", "Hythe Imperial Hotel"],
  },
  {
    src: M + "cotswolds-bridge.jpg",
    market: "Gloucester Quays",
    kind: "Christmas markets at the docks",
    dates: "The weekends before Christmas",
    hotels: ["Hatherley Manor\nHotel & Spa"],
  },
];
export const MARKETS_SLIDES = MARKETS.length + 2;

const Caps: React.FC<{ children: React.ReactNode; size?: number }> = ({
  children,
  size = 28,
}) => (
  <div style={{ display: "inline-block" }}>
    <div
      style={{
        fontFamily: sans,
        fontWeight: 600,
        fontSize: size,
        letterSpacing: "0.32em",
        color: colors.gold,
        textTransform: "uppercase",
      }}
    >
      {children}
    </div>
    <div style={{ height: 2, background: colors.gold, marginTop: 12 }} />
  </div>
);
const Mark: React.FC = () => (
  <Img
    src={staticFile("brand/cb-watermark.png")}
    style={{
      position: "absolute",
      right: 72,
      bottom: 72,
      width: 58,
      height: 63,
      opacity: 0.9,
    }}
  />
);
const Backdrop: React.FC<{ src: string; dim?: number; blur?: number }> = ({
  src,
  dim = 0.32,
  blur = 40,
}) => (
  <Img
    src={staticFile(src)}
    style={{
      position: "absolute",
      inset: -80,
      width: 1240,
      height: 1510,
      objectFit: "cover",
      filter: `blur(${blur}px) brightness(${dim})`,
    }}
  />
);

export const ChristmasMarketsCarousel: React.FC = () => {
  const i = useCurrentFrame();
  if (i === 0) {
    return (
      <AbsoluteFill style={{ backgroundColor: colors.black }}>
        <Img
          src={staticFile(M + "tree-bokeh.jpg")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "48% 50%",
          }}
        />
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(to bottom, rgba(9,9,10,0.25) 0%, rgba(9,9,10,0.15) 35%, rgba(9,9,10,0.82) 72%, rgba(9,9,10,0.94) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 190,
            textAlign: "center",
          }}
        >
          <Caps>Christmas markets</Caps>
          <div
            style={{
              fontFamily: serif,
              fontSize: 112,
              lineHeight: 1.02,
              color: colors.cream,
              marginTop: 32,
            }}
          >
            The markets,
            <br />
            <span style={{ fontStyle: "italic" }}>and where to stay</span>
          </div>
        </div>
        <Mark />
      </AbsoluteFill>
    );
  }
  if (i === MARKETS.length + 1) {
    return (
      <AbsoluteFill style={{ backgroundColor: colors.black }}>
        <Backdrop src={M + "chichester-toast.jpg"} dim={0.42} blur={6} />
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <div style={{ marginTop: -40 }}>
            <Caps>The full guide</Caps>
            <div
              style={{
                fontFamily: serif,
                fontSize: 104,
                lineHeight: 1.06,
                color: colors.cream,
                marginTop: 32,
              }}
            >
              Plan your
              <br />
              <span style={{ fontStyle: "italic" }}>market weekend</span>
            </div>
            <div
              style={{
                fontFamily: sans,
                fontSize: 30,
                color: "rgba(245,239,227,0.86)",
                marginTop: 40,
                lineHeight: 1.5,
              }}
            >
              Christmas, Twixmas and New Year breaks
              <br />
              are bookable now
            </div>
          </div>
        </AbsoluteFill>
        <Mark />
      </AbsoluteFill>
    );
  }
  // full bleed for social (Scott: "don't like the photo in the middle like that, crop it", "full bleed"):
  // each blog photo cropped to 4:5 on its subject, upscaled with a light sharpen (<name>-4x5.jpg), the
  // market, dates and hotel at the bottom over a soft shade
  const m = MARKETS[i - 1];
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      <Img
        src={staticFile(m.src.replace(".jpg", "-4x5.jpg"))}
        style={{ width: "100%", height: "100%" }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(9,9,10,0) 40%, rgba(9,9,10,0.72) 70%, rgba(9,9,10,0.92) 100%)",
        }}
      />
      {/* the house label only (Scott: "too much information in the lower third, trim it nice and clean, leave the
          details for the posts"): the market in gold caps with its underline, the paired hotel in cream Cormorant */}
      {/* the market is the hero (Scott: "more about the markets ... we lost the market context"), still clean:
          what the market is in gold caps with its underline, the city in cream Cormorant, the hotel one small
          italic line; dates stay in the post */}
      <div style={{ position: "absolute", left: 76, right: 170, bottom: 108 }}>
        <Caps size={26}>{m.kind}</Caps>
        <div
          style={{
            fontFamily: serif,
            fontSize: 112,
            lineHeight: 1.0,
            color: colors.cream,
            marginTop: 22,
          }}
        >
          {m.market}
        </div>
        <div
          style={{
            fontFamily: serif,
            fontStyle: "italic",
            fontSize: 42,
            color: "rgba(245,239,227,0.88)",
            marginTop: 14,
          }}
        >
          Stay at {m.hotels[0].replace("\n", " ")}
        </div>
      </div>
      <Mark />
    </AbsoluteFill>
  );
};
