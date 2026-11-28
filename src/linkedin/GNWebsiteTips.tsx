import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { sans, serif } from "../hotel-film/theme";

// Great National tips carousels (`set`): "5 ways to fill your hotel in January" and "5 things to check on your hotel's
// Google listing before January". The second was a carousel for GN's Digital
// Growth Solutions (a website checklist was dropped: GN's own site is dated, so it invited the comparison; Scott chose
// the Google listing version) (Scott, 28 Nov: not another animation, "it looks samey"; "draft the five tips, do the carousel").
// Seven 4:5 slides, rendered as stills and put together as a PDF: a cover over a GN hotel at dusk in the navy tint (the
// videos' look), five tips on GN's white (a lime numeral, the tip in navy Cormorant, one plain line), and a navy close.
// Tips are practical and plain, no figures; no hyphens, em dashes or triads; no rules under titles (Scott: a Claude tell). Slide by prop: `slide` 1 to 7.

/* Colours */
const navy = "#182b3c";
const lime = "#aabb17";
const grey = "#4d5d6c";
const white = "#ffffff";

export const GN_TIPS_SLIDES = 7;

/* Each carousel's words: the cover's label, title and photo, the five tips, and the close */
type Set = { label: string; title: string; photo: string; pos: string; tips: [string, string][]; ask: string; help: string };
export const GN_TIP_SETS: Record<"google" | "january", Set> = {
  google: {
    label: "DIGITAL GROWTH",
    title: "5 things to check on your hotel’s Google listing before January",
    photo: "newtown-park",
    pos: "40% 50%",
    tips: [
      ["Your Christmas hours are set", "Add special opening hours for the restaurant and spa over Christmas and New Year, so nobody arrives to a closed door."],
      ["Your photos show winter", "Add a few fresh winter photos. Your listing is often the first look a guest gets at your hotel."],
      ["Reviews have replies", "A short, warm reply to recent reviews shows guests that someone is looking after the place."],
      ["The booking link works", "Check it takes guests straight to booking on your own site, not to a page that no longer exists."],
      ["Your festive offers are posted", "Add a Google post for your Christmas and New Year offers, so they show right on your listing."],
    ],
    ask: "Want a second pair of eyes?",
    help: "Our Digital Growth team can take a look at your listing with you.",
  },
  // Scott, 28 Nov: "do the 5 ways to fill January carousel" (it follows Tuesday's "January's quieter" post)
  january: {
    label: "PLANNING AHEAD",
    title: "5 ways to fill your hotel in January",
    photo: "abbeyleix-manor",
    pos: "45% 50%",
    tips: [
      ["A midweek January break", "Give guests a reason to come Sunday to Thursday, with a simple midweek offer they can book now."],
      ["Remind voucher holders", "Gift vouchers given at Christmas are stays waiting to happen. A friendly January reminder gets them booked."],
      ["Email last January’s guests", "They’ve stayed with you at this time of year before. Let them know what’s on this January."],
      ["Look after your locals", "A dinner or spa offer for people who live nearby can fill the quieter nights."],
      ["Bring in January meetings", "Plenty of companies plan away days at the start of the year. Let local businesses know you have space."],
    ],
    ask: "Want a hand with January?",
    help: "Our team can help with the pricing and the marketing for your quieter months.",
  },
};

const Badge: React.FC<{ size?: number }> = ({ size = 96 }) => (
  <Img src={staticFile("brand/gn/gnh-badge.svg")} style={{ position: "absolute", left: 80, top: 80, width: size, height: size }} />
);

const Count: React.FC<{ n: number; light?: boolean }> = ({ n, light }) => (
  <div
    style={{
      position: "absolute",
      right: 80,
      top: 112,
      fontFamily: sans,
      fontSize: 26,
      color: light ? "rgba(255,255,255,0.8)" : grey,
    }}
  >
    {n} / {GN_TIPS_SLIDES}
  </div>
);

export const GNWebsiteTips: React.FC<{ slide?: number; set?: "google" | "january" }> = ({ slide = 1, set = "google" }) => {
  const S = GN_TIP_SETS[set];
  /* the cover: a GN hotel at dusk in the navy tint, the title in white */
  if (slide === 1) {
    return (
      <AbsoluteFill style={{ background: navy }}>
        <Img
          src={staticFile(`campaigns/gn-key/hotels/${S.photo}.jpg`)}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: S.pos, filter: "blur(2px) saturate(0.9)" }}
        />
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(24,43,60,0.78) 0%, rgba(24,43,60,0.70) 50%, rgba(24,43,60,0.88) 100%)" }} />
        <Badge />
        <div style={{ position: "absolute", right: 80, top: 112, fontFamily: sans, fontSize: 26, color: "rgba(255,255,255,0.85)" }}>Swipe →</div>
        <div style={{ position: "absolute", left: 80, top: 420, fontFamily: sans, fontWeight: 700, fontSize: 26, color: lime, letterSpacing: 0 }}>
          {S.label}
        </div>
        <div style={{ position: "absolute", left: 80, right: 80, top: 480, fontFamily: serif, fontWeight: 500, fontSize: 96, lineHeight: 1.08, color: white }}>
          {S.title}
        </div>
      </AbsoluteFill>
    );
  }

  /* the close: navy, the roundel, the offer of help, how to get in touch */
  if (slide === GN_TIPS_SLIDES) {
    return (
      <AbsoluteFill style={{ background: navy }}>
        <Img src={staticFile("brand/gn/gnh-badge.svg")} style={{ position: "absolute", left: 540 - 95, top: 330, width: 190, height: 190 }} />
        <div style={{ position: "absolute", left: 80, right: 80, top: 580, textAlign: "center", fontFamily: serif, fontWeight: 500, fontSize: 80, lineHeight: 1.1, color: white }}>
          {S.ask}
        </div>
        <div style={{ position: "absolute", left: 120, right: 120, top: 790, textAlign: "center", fontFamily: sans, fontSize: 34, lineHeight: 1.5, color: "rgba(255,255,255,0.9)" }}>
          {S.help}
        </div>
        <div
          style={{
            position: "absolute",
            left: 540 - 300,
            width: 600,
            top: 960,
            textAlign: "center",
            fontFamily: sans,
            fontWeight: 700,
            fontSize: 30,
            color: navy,
            background: lime,
            borderRadius: 999,
            padding: "20px 0",
          }}
        >
          Send us a message
        </div>
      </AbsoluteFill>
    );
  }

  /* a tip: the lime numeral, the tip, one plain line */
  const n = slide - 1;
  const [head, body] = S.tips[n - 1];
  return (
    <AbsoluteFill style={{ background: "linear-gradient(135deg, #ffffff 0%, #ffffff 36%, #eef1f4 100%)" }}>
      <Badge />
      <Count n={slide} />
      {/* the tip, centred in the slide below the badge (a numeral, the tip, the line, as one block) */}
      <div style={{ position: "absolute", left: 80, right: 110, top: 220, bottom: 120, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontFamily: serif, fontWeight: 500, fontSize: 240, lineHeight: 0.9, color: lime, fontVariantNumeric: "lining-nums", marginLeft: -6 }}>
          {n}
        </div>
        <div style={{ fontFamily: serif, fontWeight: 500, fontSize: 84, lineHeight: 1.08, color: navy, marginTop: 40 }}>{head}</div>
        <div style={{ fontFamily: sans, fontSize: 38, lineHeight: 1.5, color: grey, marginTop: 36 }}>{body}</div>
      </div>
    </AbsoluteFill>
  );
};
