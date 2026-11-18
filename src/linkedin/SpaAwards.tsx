import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { colors, sans, serif } from "../hotel-film/theme";

// Good Spa Guide Awards 2026, our winners (Scott, 18 Nov: "can you do a better collage" than his, which left a
// third of the frame empty charcoal; a first redo, two boxes with captions under them, was "not that great": a
// template, not a collage). A real collage, 16:9: each winner a block of three tiles (its spa photo tall, two
// smaller views of the hotel beside it), the two blocks mirrored about the middle, and a charcoal seal over the
// seam with the title in it. The winner's label sits in the foot of its tall photo, house order with the award
// where the place goes: gold caps (no underline, Scott), the name in cream Cormorant, the place in small caps.
// The tall photos are cut from Scott's collage with his lettering painted out (cv2 inpaint), so no enlarging:
// public/campaigns/spa-awards/*-tall.jpg. Swap in the originals if he sends them.
const CHARCOAL = "#282825";
const A = "campaigns/spa-awards";
const S = "campaigns/screen-time";
const M = 24;
const G = 10;
const HERO_W = 600;
const SIDE_W = 314;
const FULL_H = 1080 - 2 * M;
const HALF_H = (FULL_H - G) / 2;
const R = 6;

type Winner = { hero: string; heroPos: string; side: [string, string][]; award: string; name: string; place: string };
const WINNERS: Winner[] = [
  { hero: `${A}/low-wood-bay-tall.jpg`, heroPos: "45% 50%", side: [[`${S}/lwb-lake-poster.jpg`, "50% 62%"], ["campaigns/flipbook-winter/lake-poster.jpg", "50% 45%"]],
    award: "BEST RESORT SPA", name: "Low Wood Bay\nResort & Spa", place: "WINDERMERE, LAKE DISTRICT" },
  { hero: `${A}/gisborough-hall-tall.jpg`, heroPos: "28% 50%", side: [["campaigns/showcase/gisborough-exterior.jpg", "50% 50%"], [`${S}/gis-sunrise-poster.jpg`, "50% 40%"]],
    award: "BEST NEW SPA", name: "Gisborough Hall Country\nHouse Hotel & Spa", place: "NORTH YORKSHIRE" },
];

const Tile: React.FC<{ src: string; pos: string; x: number; y: number; w: number; h: number; children?: React.ReactNode }> = ({ src, pos, x, y, w, h, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: R, overflow: "hidden", background: "#111" }}>
    <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos }} />
    {children}
  </div>
);

export const SpaAwards: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: CHARCOAL }}>
    {WINNERS.map((w, i) => {
      // the left block has its tall photo outermost, the right block mirrors it
      const heroX = i === 0 ? M : 1920 - M - HERO_W;
      const sideX = i === 0 ? M + HERO_W + G : 1920 - M - HERO_W - G - SIDE_W;
      return (
        <React.Fragment key={w.award}>
          <Tile src={w.hero} pos={w.heroPos} x={heroX} y={M} w={HERO_W} h={FULL_H}>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(20,20,18,0) 56%, rgba(20,20,18,0.78) 82%, rgba(20,20,18,0.9) 100%)" }} />
            <div style={{ position: "absolute", left: 40, right: 40, bottom: 44 }}>
              {/* no underline under the award (Scott) */}
              <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 23, letterSpacing: "0.26em", color: colors.gold }}>{w.award}</div>
              <div style={{ fontFamily: serif, fontSize: 50, lineHeight: 1.08, color: colors.cream, marginTop: 14, whiteSpace: "pre-line" }}>{w.name}</div>
              <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 18, letterSpacing: "0.22em", color: colors.cream, opacity: 0.78, marginTop: 14 }}>{w.place}</div>
            </div>
          </Tile>
          <Tile src={w.side[0][0]} pos={w.side[0][1]} x={sideX} y={M} w={SIDE_W} h={HALF_H} />
          <Tile src={w.side[1][0]} pos={w.side[1][1]} x={sideX} y={M + HALF_H + G} w={SIDE_W} h={HALF_H} />
        </React.Fragment>
      );
    })}
    {/* the seal over the seam */}
    <div style={{ position: "absolute", left: 960 - 178, top: 540 - 178, width: 356, height: 356, borderRadius: 178, background: CHARCOAL, boxShadow: "0 10px 40px rgba(0,0,0,0.55)" }}>
      <div style={{ position: "absolute", inset: 9, borderRadius: "50%", border: `2px solid ${colors.gold}` }} />
      <div style={{ position: "absolute", inset: 17, borderRadius: "50%", border: `1px solid ${colors.gold}`, opacity: 0.55 }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <Img src={staticFile("brand/cb-watermark.png")} style={{ width: 46, height: 50 }} />
        <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 15.5, letterSpacing: "0.3em", paddingLeft: "0.3em", color: colors.gold, marginTop: 16, textAlign: "center", lineHeight: 1.7 }}>
          GOOD SPA GUIDE
          <br />
          AWARDS 2026
        </div>
        <div style={{ fontFamily: serif, fontStyle: "italic", fontSize: 66, lineHeight: 1, color: colors.cream, marginTop: 10 }}>Winners</div>
      </div>
    </div>
  </AbsoluteFill>
);
