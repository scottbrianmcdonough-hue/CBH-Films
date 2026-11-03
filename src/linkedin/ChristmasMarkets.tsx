import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { colors, sans, serif } from "../hotel-film/theme";

// The Christmas markets blog post (Bianca, 3 Nov: "get the xmas market stuff out again"), a 4:5 still for
// Instagram and Facebook pointing to classicbritishhotels.com/christmas-markets/. The blog itself is
// blocked from here, so no market or town is named: Hintlesham Hall lit up for Christmas at dusk, under
// CHRISTMAS MARKETS in gold caps with its underline and a line in cream Cormorant.
export const ChristmasMarkets: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: colors.black }}>
    <Img
      src={staticFile("campaigns/festive/graded/hintlesham-hall-exterior.jpg")}
      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "58% 50%" }}
    />
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(to bottom, rgba(9,9,10,0.05) 30%, rgba(9,9,10,0.82) 68%, rgba(9,9,10,0.94) 100%)",
      }}
    />
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 150, textAlign: "center" }}>
      <div style={{ display: "inline-block" }}>
        <div
          style={{
            fontFamily: sans,
            fontWeight: 600,
            fontSize: 30,
            letterSpacing: "0.3em",
            color: colors.gold,
            textTransform: "uppercase",
          }}
        >
          Christmas markets
        </div>
        <div style={{ height: 2, background: colors.gold, marginTop: 10 }} />
      </div>
      <div style={{ fontFamily: serif, fontSize: 100, lineHeight: 1.04, color: colors.cream, marginTop: 28 }}>
        Browse the stalls,
        <br />
        <span style={{ fontStyle: "italic" }}>then somewhere warm</span>
      </div>
      <div style={{ fontFamily: sans, fontSize: 30, color: "rgba(245,239,227,0.85)", marginTop: 26 }}>
        Our guide to the markets near our hotels
      </div>
    </div>
    <Img
      src={staticFile("brand/cb-watermark.png")}
      style={{ position: "absolute", right: 72, top: 72, width: 64, height: 69 }}
    />
  </AbsoluteFill>
);
