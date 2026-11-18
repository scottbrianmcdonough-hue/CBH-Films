import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { colors, sans, serif } from "../hotel-film/theme";

// Good Spa Guide Awards 2026, our winners (Scott, 18 Nov: "can you do a better collage" than the one with a third
// of the frame empty charcoal and the names over the photos): 16:9 still. The title across the top, the two
// photos as a matched pair filling the width, each winner beneath its photo in the house order (the award in gold
// caps over its underline, the name in cream Cormorant, the place in small caps), on CBH charcoal. The photos are
// cut from Scott's first collage (public/campaigns/spa-awards/): swap in the originals when they come.
const CHARCOAL = "#282825";
const WINNERS = [
  { src: "campaigns/spa-awards/low-wood-bay.jpg", award: "BEST RESORT SPA", name: "Low Wood Bay Resort & Spa", place: "WINDERMERE, LAKE DISTRICT" },
  { src: "campaigns/spa-awards/gisborough-hall.jpg", award: "BEST NEW SPA", name: "Gisborough Hall Country House Hotel & Spa", place: "NORTH YORKSHIRE" },
];
const M = 80; // side margin
const GAP = 40;
const CARD_W = (1920 - 2 * M - GAP) / 2;
const CARD_H = 520;
const TOP = 318;

export const SpaAwards: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: CHARCOAL }}>
    <div style={{ position: "absolute", top: 54, left: 0, right: 0, textAlign: "center" }}>
      <Img src={staticFile("brand/cb-watermark.png")} style={{ width: 58, height: 62 }} />
      <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 25, letterSpacing: "0.32em", paddingLeft: "0.32em", color: colors.gold, marginTop: 18 }}>
        GOOD SPA GUIDE AWARDS 2026
      </div>
      <div style={{ fontFamily: serif, fontSize: 104, lineHeight: 1.05, color: colors.cream, marginTop: 6 }}>Our Winners</div>
    </div>
    {WINNERS.map((w, i) => {
      const left = M + i * (CARD_W + GAP);
      return (
        <React.Fragment key={w.name}>
          <Img src={staticFile(w.src)} style={{ position: "absolute", left, top: TOP, width: CARD_W, height: CARD_H, objectFit: "cover" }} />
          <div style={{ position: "absolute", left, top: TOP + CARD_H + 34, width: CARD_W }}>
            <div style={{ display: "inline-block" }}>
              <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 25, letterSpacing: "0.26em", color: colors.gold }}>{w.award}</div>
              <div style={{ height: 2, marginTop: 11, background: colors.gold }} />
            </div>
            <div style={{ fontFamily: serif, fontSize: 45, lineHeight: 1.1, color: colors.cream, marginTop: 14, whiteSpace: "nowrap" }}>{w.name}</div>
            <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 19, letterSpacing: "0.22em", color: colors.cream, opacity: 0.72, marginTop: 12 }}>{w.place}</div>
          </div>
        </React.Fragment>
      );
    })}
  </AbsoluteFill>
);
