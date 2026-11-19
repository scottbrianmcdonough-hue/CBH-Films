import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { colors, sans, serif } from "../hotel-film/theme";

// Coombe Abbey joins the collection: the LinkedIn carousel (Scott, 17 Nov: "need the Coombe Abbey LinkedIn intro
// post and the carousel"), 4:5, a frame a slide (render each as a still, then a PDF for LinkedIn's document post).
// CBH's look: full-bleed photo, the kicker in gold caps over its underline, the line in cream Cormorant, a quiet
// italic beneath, white CB; a black close with the logo. Facts from coombeabbey.com (121 rooms, 500 acres laid out
// by Capability Brown, an abbey since the 12th century, Elizabeth I, the Gunpowder Plot, Mediaeval Banquets,
// 11 meeting spaces and a marquee for 450, CBH's own meetings page; the hotel's site says 500). Photos from its site, `public/hotels/coombe-abbey/`.
const C = "hotels/coombe-abbey";
type Slide = { src: string; pos: string; kicker: string; line: string; sub: string; shade?: number };
const SLIDES: Slide[] = [
  { src: `${C}/history-bust.jpg`, pos: "4% 50%", kicker: "SINCE THE 12TH CENTURY", line: "An abbey with\nnine centuries\nof stories", sub: "Elizabeth I stayed. The Gunpowder Plot came calling.", shade: 30 },
  { src: `${C}/canopied-bed.jpg`, pos: "50% 50%", kicker: "121 BEDROOMS", line: "Canopied beds\nand roll top baths", sub: "Four posters, canopies and Victorian tubs" },
  { src: `${C}/garden-front.jpg`, pos: "40% 50%", kicker: "500 ACRES", line: "Parkland by\nCapability Brown", sub: "Formal gardens, a lake and room to roam" },
  { src: `${C}/banquet-cast.jpg`, pos: "50% 50%", kicker: "MEETINGS AND EVENTS", line: "11 meeting spaces\nand a marquee\nfor 450", sub: "Then a Mediaeval Banquet when the agenda is done" },
];
export const COOMBE_INTRO_SLIDES = SLIDES.length + 2;

const Mark: React.FC = () => <Img src={staticFile("brand/cb-watermark.png")} style={{ position: "absolute", right: 72, bottom: 96, width: 64, height: 69 }} />;

export const CoombeIntro: React.FC = () => {
  const i = useCurrentFrame();
  if (i === 0) {
    return (
      <AbsoluteFill style={{ backgroundColor: colors.black }}>
        <Img src={staticFile(`${C}/aerial.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "47% 50%" }} />
        <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(9,9,10,0.1) 30%, rgba(9,9,10,0.78) 78%, rgba(9,9,10,0.9) 100%)" }} />
        <Mark />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 200, textAlign: "center" }}>
          <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 30, letterSpacing: "0.3em", color: colors.gold, paddingLeft: "0.3em" }}>WELCOME TO THE COLLECTION</div>
          <div style={{ fontFamily: serif, fontSize: 150, lineHeight: 1.05, color: colors.cream, marginTop: 16 }}>Coombe Abbey</div>
          <div style={{ fontFamily: serif, fontStyle: "italic", fontSize: 42, color: colors.cream, opacity: 0.88, marginTop: 18 }}>Warwickshire</div>
        </div>
      </AbsoluteFill>
    );
  }
  if (i === COOMBE_INTRO_SLIDES - 1) {
    return (
      <AbsoluteFill style={{ backgroundColor: colors.black, alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", marginTop: -330 }}>
          <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 28, letterSpacing: "0.3em", color: colors.gold, paddingLeft: "0.3em" }}>NOW PART OF CLASSIC BRITISH HOTELS</div>
          <div style={{ fontFamily: serif, fontSize: 112, lineHeight: 1.1, color: colors.cream, marginTop: 30 }}>
            Welcome,
            <br />
            Coombe Abbey
          </div>
        </div>
        <Img src={staticFile("brand/cbh-logo-on-dark.svg")} style={{ position: "absolute", left: (1080 - 230) / 2, bottom: 150, width: 230 }} />
      </AbsoluteFill>
    );
  }
  const s = SLIDES[i - 1];
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      <Img src={staticFile(s.src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: s.pos }} />
      <AbsoluteFill style={{ background: `linear-gradient(to bottom, rgba(9,9,10,0) ${s.shade ?? 38}%, rgba(9,9,10,0.74) 74%, rgba(9,9,10,0.88) 100%)` }} />
      <Mark />
      <div style={{ position: "absolute", left: 72, right: 150, bottom: 96 }}>
        <div style={{ display: "inline-block" }}>
          <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 28, letterSpacing: "0.24em", color: colors.gold }}>{s.kicker}</div>
        </div>
        <div style={{ fontFamily: serif, fontSize: 84, lineHeight: 1.06, marginTop: 18, color: colors.cream, whiteSpace: "pre-line" }}>{s.line}</div>
        <div style={{ fontFamily: serif, fontStyle: "italic", fontSize: 40, color: colors.cream, opacity: 0.9, marginTop: 22 }}>{s.sub}</div>
      </div>
    </AbsoluteFill>
  );
};
