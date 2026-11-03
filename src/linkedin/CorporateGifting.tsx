import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { colors, sans, serif } from "../hotel-film/theme";

// Corporate gifting on LinkedIn (Bianca, 3 Nov: "corporate gifting on LinkedIn next week too"), to go
// with the refreshed "The Perfect Gift" blog. A 4:5 still: the official CBH gift voucher artwork
// (campaigns/black-friday/gift-vouchers.png, the two cards on black) under CORPORATE GIFTING in gold
// caps and a line in cream Cormorant, the voucher facts beneath (classicbritishhotels.com/gift-vouchers/,
// checked by Scott 10 Oct: redeemed against stays that include an overnight, valid for 12 months).
export const CorporateGifting: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: colors.black }}>
    <AbsoluteFill
      style={{ background: "radial-gradient(ellipse 70% 45% at 50% 58%, rgba(195,158,85,0.12), transparent 70%)" }}
    />
    <div style={{ position: "absolute", top: 130, left: 0, right: 0, textAlign: "center" }}>
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
          Corporate gifting
        </div>
        <div style={{ height: 2, background: colors.gold, marginTop: 10 }} />
      </div>
      <div style={{ fontFamily: serif, fontSize: 104, lineHeight: 1.04, color: colors.cream, marginTop: 30 }}>
        Thank the team
        <br />
        <span style={{ fontStyle: "italic" }}>with a night away</span>
      </div>
    </div>
    <Img
      src={staticFile("campaigns/black-friday/gift-vouchers.png")}
      // its black ground drops out (lighten), so no box shows against the page and its glow
      style={{ position: "absolute", left: 60, top: 470, width: 960, mixBlendMode: "lighten" }}
    />
    <div
      style={{
        position: "absolute",
        bottom: 110,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: sans,
        fontSize: 30,
        lineHeight: 1.5,
        color: "rgba(245,239,227,0.85)",
        fontVariantNumeric: "lining-nums",
      }}
    >
      Gift vouchers for a stay at our hotels
      <br />
      Valid for 12 months
    </div>
  </AbsoluteFill>
);
