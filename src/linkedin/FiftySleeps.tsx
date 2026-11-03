import React from "react";
import { AbsoluteFill, Img, staticFile, useVideoConfig } from "remotion";
import { colors, sans, serif } from "../hotel-film/theme";

// "50 sleeps until Christmas" (Bianca, 3 Nov: "still have plenty of availabilities left for Xmas so we need to
// do a push this week before the BF launch ... social post with a '50 Sleeps until Xmas' style headline, and get
// it out on Thurs 5th Nov"; 5 Nov to 25 Dec is 50 days). A still in two sizes: 4:5 for the feed, 9:16 for the
// Story. Hogarths Stone Manor's table at Christmas (a frame of its festive reel: the lit tree, a candle, the
// champagne on ice), the 50 in cream Cormorant over SLEEPS UNTIL CHRISTMAS in gold caps with its underline,
// one line beneath. The white CB top right (Instagram's controls sit bottom right on a Story).
export const FiftySleeps: React.FC = () => {
  const { height } = useVideoConfig();
  const tall = height > 1500;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      <Img
        src={staticFile("campaigns/fifty-sleeps/arrival-2.3.jpg")}
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 38%" }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(9,9,10,0.25) 0%, rgba(9,9,10,0) 22%, rgba(9,9,10,0.35) 40%, rgba(9,9,10,0.9) 62%, rgba(9,9,10,0.96) 100%)",
        }}
      />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: tall ? 400 : 110, textAlign: "center" }}>
        <div
          style={{
            fontFamily: serif,
            fontSize: 300,
            lineHeight: 0.9,
            color: colors.cream,
            fontVariantNumeric: "lining-nums",
          }}
        >
          50
        </div>
        <div style={{ display: "inline-block", marginTop: 22 }}>
          <div
            style={{
              fontFamily: sans,
              fontWeight: 600,
              fontSize: 32,
              letterSpacing: "0.3em",
              color: colors.gold,
              textTransform: "uppercase",
            }}
          >
            Sleeps until Christmas
          </div>
          <div style={{ height: 2, background: colors.gold, marginTop: 12 }} />
        </div>
        <div
          style={{
            fontFamily: serif,
            fontStyle: "italic",
            fontSize: 46,
            color: "rgba(245,239,227,0.9)",
            marginTop: 26,
          }}
        >
          and there&apos;s still room at the table
        </div>
      </div>
      <Img
        src={staticFile("brand/cb-watermark.png")}
        style={{ position: "absolute", right: 64, top: tall ? 250 : 64, width: 58, height: 63, opacity: 0.9 }}
      />
    </AbsoluteFill>
  );
};
