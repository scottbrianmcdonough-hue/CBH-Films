import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, sans, serif } from "../theme";

// November Best Loved as an Instagram carousel (Scott, 30 Oct: "and also do a carousel with
// slides"): 4:5, one frame per slide. A cover (the hook over Hatherley's fireplace), one slide
// per hotel (full-bleed photo; the place in gold caps over its underline, the name in cream
// Cormorant, the offer and its "from" price beneath), and a closing question . Render each frame as a still.

const W = 1080;
// The same slides at 9:16 for TikTok's photo carousel (Scott, 30 Oct): the label and the CB lifted
// clear of TikTok's caption and its buttons down the right.
const useTall = () => useVideoConfig().height > 1500;
const N = "campaigns/november-best-loved";

// `tall`: the 9:16 framing and the name over two lines (the reel's), so it clears the CB
type Slide = { src: string; pos: string; place: string; name: string; offer: string; price: string; tall: [string, string, number?] };
const SLIDES: Slide[] = [
  { src: `${N}/hatherley-manor/spa-relaxation-full.jpg`, pos: "45% 50%", place: "COTSWOLDS", name: "Hatherley Manor Hotel", offer: "A Cosy Night In", price: "£117", tall: ["37% 50%", "Hatherley Manor\nHotel"] },
  { src: `${N}/ramside-hall/hydrotherapy-pool-full.jpg`, pos: "50% 50%", place: "DURHAM", name: "Ramside Hall Hotel,\nGolf & Spa", offer: "Stay, Spa & Dine", price: "£249", tall: ["49% 50%", "Ramside Hall Hotel,\nGolf & Spa"] },
  { src: `${N}/frensham-pond/spa-pool.jpg`, pos: "54% 50%", place: "FARNHAM, SURREY", name: "Frensham Pond Hotel & Spa", offer: "Bubbles & Bliss", price: "£304", tall: ["53% 50%", "Frensham Pond\nHotel & Spa"] },
  { src: `${N}/forest-of-arden-exterior.jpg`, pos: "55% 50%", place: "WARWICKSHIRE", name: "Forest of Arden Hotel\n& Country Club", offer: "1 Night Golf Package", price: "£308", tall: ["55% 50%", "Forest of Arden Hotel\n& Country Club", 26] },
  { src: `${N}/donnington-valley/robes-reading.jpg`, pos: "50% 25%", place: "NEWBURY, BERKSHIRE", name: "Donnington Hotel, Spa & Golf", offer: "Deluxe Spa & Stay", price: "£338", tall: ["50% 25%", "Donnington Hotel,\nSpa & Golf"] },
  { src: `${N}/rowton-hall/junior-suite.jpg`, pos: "88% 50%", place: "CHESTER", name: "Rowton Hall Hotel & Spa", offer: "Romantic Spa Package", price: "£414", tall: ["88% 50%", "Rowton Hall\nHotel & Spa"] },
];
export const CAROUSEL_SLIDES = SLIDES.length + 2;

const Shade: React.FC<{ from?: number }> = ({ from = 45 }) => (
  <AbsoluteFill style={{ background: `linear-gradient(to bottom, rgba(9,9,10,0) ${from}%, rgba(9,9,10,0.72) 78%, rgba(9,9,10,0.85) 100%)` }} />
);
const Mark: React.FC = () => {
  // bottom right, on the offer line: Instagram puts its slide counter top right
  const tall = useTall();
  return <Img src={staticFile("brand/cb-watermark.png")} style={{ position: "absolute", right: tall ? 160 : 72, bottom: tall ? 508 : 104, width: 64, height: 69 }} />;
};

export const BestLovedCarousel: React.FC = () => {
  const tall = useTall();
  const lift = tall ? 404 : 0; // TikTok's caption sits over the bottom of the frame
  const i = useCurrentFrame();
  if (i === 0) {
    return (
      <AbsoluteFill style={{ backgroundColor: colors.black }}>
        <Img src={staticFile(`${N}/hatherley-manor/lounge-bar.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "62% 50%" }} />
        <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(9,9,10,0.15) 30%, rgba(9,9,10,0.8) 80%, rgba(9,9,10,0.9) 100%)" }} />
        <Mark />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 210 + lift, textAlign: "center" }}>
          <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 30, letterSpacing: "0.3em", color: colors.gold }}>NOVEMBER'S</div>
          <div style={{ fontFamily: serif, fontSize: 150, lineHeight: 1.05, color: colors.cream, marginTop: 14 }}>Best Loved</div>
          <div style={{ fontFamily: serif, fontStyle: "italic", fontSize: 40, color: colors.cream, opacity: 0.85, marginTop: 22 }}>Six cosy escapes to swipe through</div>
        </div>
      </AbsoluteFill>
    );
  }
  if (i === CAROUSEL_SLIDES - 1) {
    return (
      <AbsoluteFill style={{ backgroundColor: colors.black, alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: serif, fontSize: 104, lineHeight: 1.12, color: colors.cream, textAlign: "center", marginTop: -80 }}>
          Which would
          <br />
          you choose?
        </div>
        <Img src={staticFile("brand/cb-watermark.png")} style={{ position: "absolute", left: (W - 100) / 2, bottom: 150 + lift, width: 100, height: 108 }} />
      </AbsoluteFill>
    );
  }
  const s = SLIDES[i - 1];
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      <Img src={staticFile(s.src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: tall ? s.tall[0] : s.pos }} />
      <Shade from={tall ? s.tall[2] ?? 38 : 45} />
      <Mark />
      <div style={{ position: "absolute", left: 72, right: 72, bottom: 96 + lift }}>
        <div style={{ display: "inline-block" }}>
          <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 28, letterSpacing: "0.24em", color: colors.gold }}>{s.place}</div>
          <div style={{ height: 2, marginTop: 12, background: colors.gold }} />
        </div>
        <div style={{ fontFamily: serif, fontSize: 72, lineHeight: 1.08, marginTop: 16, color: colors.cream, whiteSpace: "pre-line" }}>{tall ? s.tall[1] : s.name}</div>
        {/* the offer only, no prices (Scott) */}
        <div style={{ fontFamily: serif, fontStyle: "italic", fontSize: 46, color: colors.cream, opacity: 0.92, marginTop: 22 }}>{s.offer}</div>
      </div>
    </AbsoluteFill>
  );
};
