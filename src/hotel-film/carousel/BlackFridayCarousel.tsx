import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { colors, sans, serif } from "../theme";

// Black Friday 2026 regional carousels (Bianca, CBH-133: "after launch the follow ups posts can be
// regional focused with participating hotels in a carousel"). Instagram 4:5, one frame per slide
// (render with --sequence). A cover (BLACK FRIDAY SALE in the campaign's mauve over the region in
// cream Cormorant), one slide per participating hotel (full bleed photo, the place in gold caps over
// its underline, the name in cream Cormorant, the offer and its terms beneath), and a close in the
// campaign's line. Offers exactly as the 2026 sheet; no hotel counts (house rule).

const MAUVE = "#A15272";
const H = "hotels/";

type Hotel = {
  src: string;
  pos: string;
  place: string;
  name: string;
  offer: string;
  terms: string;
  // a second photo for the cover collage, so the cover never repeats a slide (Scott, 5 Nov)
  tile: { src: string; pos: string };
};
type Region = {
  id: string;
  title: string;
  cover: { src: string; pos: string };
  hotels: Hotel[];
};

const FD = "Plus 25% off food and drink, stays to 31 March";
const FD20 = "Plus 20% off food and drink, stays to 31 March"; // Gomersal and Ruthin (the sheet, 5 Nov update)
const REGIONS: Region[] = [
  {
    id: "yorkshire-scotland",
    title: "Scotland\n& Yorkshire",
    cover: { src: H + "skipton/canal-reflection.jpg", pos: "35% 50%" },
    hotels: [
      {
        // cosy spa and autumn interiors (Scott, 5 Nov: "more cosy spa type stuff and interiors, autumny November")
        src: H + "skipton/afternoon-tea.jpg",
        pos: "35% 50%",
        tile: { src: H + "skipton/pool.jpg", pos: "50% 50%" },
        place: "Skipton, North Yorkshire",
        name: "Skipton Hotel",
        offer: "25% off your stay",
        terms: FD,
      },
      {
        // scroll stoppers (Scott, 5 Nov: "photos need to be scroll stoppers and inspiring"): the footbridge to the
        // island in autumn colour
        src: H + "waterton-park/footbridge-autumn.jpg",
        pos: "47% 50%",
        tile: { src: H + "waterton-park/indoor-pool.jpg", pos: "50% 50%" },
        place: "Wakefield, West Yorkshire",
        name: "Waterton Park\nHotel & Spa",
        offer: "15% off your stay",
        terms: FD,
      },
      {
        src: H + "gomersal-park/spa-pool.jpg", // the spa pool's steps and water wall
        pos: "50% 50%",
        tile: { src: H + "gomersal-park/bedroom.jpg", pos: "50% 50%" },
        place: "Gomersal, West Yorkshire",
        name: "Gomersal Park\nHotel & Spa", // as on its CBH page, like Waterton Park Hotel & Spa
        offer: "20% off your stay",
        terms: FD20,
      },
      {
        src: H + "holdsworth-house/robes-fizz.jpg", // robes and fizz; no fireplaces (Scott, 5 Nov)
        pos: "50% 50%",
        tile: { src: H + "holdsworth-house/breakfast-in-bed.jpg", pos: "50% 50%" },
        place: "Halifax, West Yorkshire",
        name: "Holdsworth House Hotel",
        offer: "10% off B&B",
        terms: "Stays to 31 March",
      },
      {
        // a warm lamplit bedroom (the house front was flat; not the fireside lounge, it read like Holdsworth's)
        src: H + "dalmahoy/bedroom.jpg",
        pos: "45% 50%",
        tile: { src: H + "dalmahoy/pool.jpg", pos: "50% 50%" },
        place: "Edinburgh",
        name: "Dalmahoy Hotel\n& Country Club",
        offer: "30% off B&B",
        terms: "Stays to 30 April",
      },
    ],
  },
  {
    id: "wales",
    title: "Wales",
    cover: { src: H + "the-imperial/bay-from-great-orme.jpg", pos: "62% 50%" },
    hotels: [
      {
        src: H + "ruthin-castle/white-bed.jpg", // the carved white bed under the red curtains
        pos: "50% 50%",
        tile: { src: H + "ruthin-castle/hot-tub-fizz.jpg", pos: "50% 50%" },
        place: "Ruthin, North Wales",
        name: "Ruthin Castle\nHotel & Spa",
        offer: "20% off your stay",
        terms: FD20,
      },
      {
        src: H + "the-imperial/breakfast-in-bed.jpg",
        pos: "50% 50%",
        tile: { src: H + "the-imperial/afternoon-tea.jpg", pos: "45% 50%" },
        place: "Llandudno, North Wales",
        name: "The Imperial Hotel",
        offer: "Up to 30% off B&B",
        terms: "Stays to 31 March",
      },
    ],
  },
  {
    id: "midlands-east",
    title: "The Midlands\n& East",
    cover: { src: H + "jockey-club-rooms/dining-room.jpg", pos: "50% 50%" },
    hotels: [
      {
        // the course and hotel from the air in autumn colour (Scott's CBH site photos, 5 Nov)
        src: H + "forest-of-arden/aerial-autumn.jpg",
        pos: "72% 50%",
        tile: { src: H + "forest-of-arden/pool.jpg", pos: "50% 50%" },
        place: "Meriden, Warwickshire",
        name: "Forest of Arden Hotel",
        // no percentage on the sheet: lead on the rate itself
        offer: "Advance purchase B&B rate",
        terms: "Non refundable, stays to 9 April",
      },
      {
        src: H + "whittlebury-park/spa-pool.jpg", // the spa pool lit up (a plate is on Oaklands' slide)
        pos: "50% 50%",
        tile: { src: H + "whittlebury-park/salt-sauna.jpg", pos: "50% 50%" },
        place: "Whittlebury, Northamptonshire",
        name: "Whittlebury Park",
        offer: "10% off your stay",
        terms: "B&B or dinner, B&B, stays to 31 March, selected dates",
      },
      {
        src: H + "jockey-club-rooms/bedroom.jpg",
        pos: "40% 50%",
        tile: { src: H + "jockey-club-rooms/dining-room.jpg", pos: "50% 50%" },
        place: "Newmarket, Suffolk",
        name: "Jockey Club Rooms",
        offer: "15% off B&B",
        terms: "Stays to 31 March, selected dates",
      },
      {
        src: H + "oaklands-hall/plate.jpg",
        pos: "50% 50%",
        tile: { src: H + "oaklands-hall/bedroom.jpg", pos: "50% 50%" },
        place: "Laceby, Lincolnshire",
        name: "Oaklands Hall Hotel",
        offer: "18% off your stay",
        terms: "Room only, B&B or dinner, B&B, selected dates to 31 March",
      },
    ],
  },
  {
    id: "south",
    title: "The South",
    cover: { src: H + "the-alfriston/bedroom.jpg", pos: "40% 50%" },
    hotels: [
      {
        src: H + "burleigh-court/plate.jpg",
        pos: "52% 50%",
        tile: { src: H + "burleigh-court/bedroom.jpg", pos: "45% 50%" },
        place: "Minchinhampton, Gloucestershire",
        name: "Burleigh Court",
        offer: "25% off B&B",
        terms: "Stays to 31 March, selected dates",
      },
      {
        src: H + "oakley-hall/bedroom.jpg", // the gold bed
        pos: "60% 50%",
        tile: { src: H + "oakley-hall/dessert.jpg", pos: "50% 50%" }, // not a second afternoon tea beside The Alfriston's
        place: "Oakley, Hampshire",
        name: "Oakley Hall Hotel",
        offer: "30% off your stay",
        terms: "Room only or B&B, stays to April",
      },
      {
        src: H + "the-alfriston/afternoon-tea.jpg",
        pos: "50% 60%",
        tile: { src: H + "the-alfriston/bedroom.jpg", pos: "40% 50%" },
        place: "Alfriston, East Sussex",
        name: "The Alfriston",
        offer: "30% off B&B",
        terms: "Book 27 to 30 November only, stays to 31 March",
      },
    ],
  },
];

// North to south (Bianca, 5 Nov: "makes more sense to do it from North to South order, so start with Scotland"):
// the regions in posting order, and the hotels in each from the most northerly down
const NORTH_TO_SOUTH: Record<string, string[]> = {
  "yorkshire-scotland": ["Edinburgh", "Skipton", "Halifax", "Gomersal", "Wakefield"],
  wales: ["Llandudno", "Ruthin"],
  "midlands-east": ["Laceby", "Meriden", "Newmarket", "Whittlebury"],
  south: ["Minchinhampton", "Oakley", "Alfriston"],
};
const rank = (id: string, h: Hotel) => NORTH_TO_SOUTH[id].findIndex((p) => h.place.startsWith(p));
export const BF_REGIONS: Region[] = ["yorkshire-scotland", "wales", "midlands-east", "south"].map((id) => {
  const r = REGIONS.find((x) => x.id === id)!;
  return { ...r, hotels: [...r.hotels].sort((a, b) => rank(id, a) - rank(id, b)) };
});

const Shade: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "linear-gradient(to bottom, rgba(9,9,10,0) 40%, rgba(9,9,10,0.7) 72%, rgba(9,9,10,0.88) 100%)",
    }}
  />
);
const Mark: React.FC = () => (
  // bottom right: Instagram puts its slide counter top right
  <Img
    src={staticFile("brand/cb-watermark.png")}
    style={{
      position: "absolute",
      right: 72,
      bottom: 96,
      width: 64,
      height: 69,
    }}
  />
);
const Caps: React.FC<{
  color: string;
  children: React.ReactNode;
  size?: number;
}> = ({ color, children, size = 28 }) => (
  <div style={{ display: "inline-block" }}>
    <div
      style={{
        fontFamily: sans,
        fontWeight: 600,
        fontSize: size,
        // the official artwork's eyebrow (Scott, 5 Nov: "match like his with the purple pink font and he doesn't use
        // the letter spacing"): mauve caps, tight, no underline
        letterSpacing: "0.02em",
        color,
        textTransform: "uppercase",
        textShadow: "0 2px 14px rgba(9,9,10,0.55)",
      }}
    >
      {children}
    </div>
  </div>
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

// the two official 4:5 files alternate, in posting order (Scott: "can't be using the same cover for four
// posts"): the launch post has the curtains, so the first carousel opens on the bed
const OFFICIAL: Record<string, "bed" | "curtains"> = {
  "yorkshire-scotland": "bed",
  wales: "curtains",
  "midlands-east": "bed",
  south: "curtains",
};

// each region's best offer on the 2026 sheet, for the cover's pill
const BEST: Record<string, number> = { "yorkshire-scotland": 30, wales: 30, "midlands-east": 18, south: 30 };

export const bfSlides = (id: string) =>
  (BF_REGIONS.find((r) => r.id === id)?.hotels.length ?? 0) + 2;

export const BlackFridayCarousel: React.FC<{ region: string }> = ({
  region,
}) => {
  const r = BF_REGIONS.find((x) => x.id === region)!;
  const i = useCurrentFrame();
  // the region graphic leads (Bianca, 5 Nov: "on the grid people will see the same pic again as the launch, so why
  // don't you lead with the last graphic instead"); the official artwork as supplied closes the set
  const close = i === 0;
  if (i === r.hotels.length + 1) {
    return (
      <AbsoluteFill style={{ backgroundColor: colors.black }}>
        <Img
          src={staticFile(`campaigns/black-friday-2026/campaign/${OFFICIAL[region] ?? "bed"}-4x5.jpg`)}
          style={{ width: "100%", height: "100%" }}
        />
      </AbsoluteFill>
    );
  }
  if (close) {
    // a collage of the region's hotels (Scott, 5 Nov: "a collage of the ones featured", then "elevate the composition,
    // make it premium"): an editorial cover, a row of photos above and below a black band that holds the words, so no
    // type sits over a photo; thin even gutters, the hotels north to south, top row then bottom
    const G = 8;
    const BAND = 430;
    const nTop = Math.max(1, Math.floor(r.hotels.length / 2));
    const rowH = (1350 - BAND - 2 * G) / 2;
    const row = (list: Hotel[], y: number) =>
      list.map((h, k) => {
        const w = (1080 - G * (list.length - 1)) / list.length;
        return { h, x: k * (w + G), y, w, hh: rowH };
      });
    const tiles = [...row(r.hotels.slice(0, nTop), 0), ...row(r.hotels.slice(nTop), rowH + G + BAND + G)];
    return (
      <AbsoluteFill
        style={{
          backgroundColor: colors.black,
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        {tiles.map((t) => (
          <div key={t.h.name} style={{ position: "absolute", left: t.x, top: t.y, width: t.w, height: t.hh, overflow: "hidden" }}>
            <Photo src={t.h.tile.src} pos={t.h.tile.pos} />
          </div>
        ))}
        {/* the band in the official card's own order (Scott, 5 Nov: "the covers can match Lee's cards better"): the
            region where his card has THE WAIT IS OVER, in its tight mauve caps, then Black Friday Sale in cream, then his
            mauve pill with the region's best offer */}
        <div style={{ position: "relative" }}>
          <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 32, letterSpacing: "0.02em", color: MAUVE,
            textTransform: "uppercase" }}>
            {r.title.replace("\n", " ")}
          </div>
          <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 118, lineHeight: 1, color: colors.cream, marginTop: 14,
            whiteSpace: "nowrap", letterSpacing: "-0.01em" }}>
            Black Friday Sale
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 18, height: 78, padding: "0 36px",
            borderRadius: 39, backgroundColor: MAUVE, marginTop: 30, fontFamily: sans, fontWeight: 600,
            color: colors.cream, textTransform: "uppercase" }}>
            <span style={{ fontSize: 30, letterSpacing: "0.02em" }}>Save up to</span>
            <span style={{ fontSize: 46, fontWeight: 700, fontVariantNumeric: "lining-nums" }}>{BEST[r.id]}%</span>
          </div>
        </div>
        <Mark />
      </AbsoluteFill>
    );
  }
  const h = r.hotels[i - 1];
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      <Photo src={h.src} pos={h.pos} />
      <Shade />
      <Mark />
      <div style={{ position: "absolute", left: 72, right: 160, bottom: 96 }}>
        <Caps color={MAUVE} size={32}>{h.place}</Caps>
        <div
          style={{
            fontFamily: serif,
            fontSize: 80,
            lineHeight: 1.04,
            color: colors.cream,
            marginTop: 18,
            whiteSpace: "pre-line",
          }}
        >
          {h.name}
        </div>
        <div
          style={{
            marginTop: 26,
            display: "flex",
            alignItems: "baseline",
            gap: 18,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              fontFamily: sans,
              fontWeight: 700,
              fontSize: 34,
              letterSpacing: "0.02em",
              textTransform: "uppercase",
              color: colors.cream,
              background: MAUVE,
              padding: "10px 22px",
              borderRadius: 40,
              fontVariantNumeric: "lining-nums",
            }}
          >
            {h.offer}
          </div>
        </div>
        <div
          style={{
            fontFamily: sans,
            fontSize: 28,
            color: "rgba(245,239,227,0.86)",
            marginTop: 16,
            fontVariantNumeric: "lining-nums",
          }}
        >
          {h.terms}
        </div>
      </div>
    </AbsoluteFill>
  );
};
