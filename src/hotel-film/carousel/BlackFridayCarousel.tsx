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
const C = "campaigns/";

type Hotel = {
  src: string;
  pos: string;
  place: string;
  name: string;
  offer: string;
  terms: string;
};
type Region = {
  id: string;
  title: string;
  cover: { src: string; pos: string };
  hotels: Hotel[];
};

const FD = "Plus 25% off food and drink, stays to 31 March";
export const BF_REGIONS: Region[] = [
  {
    id: "yorkshire-scotland",
    title: "Yorkshire\n& Scotland",
    cover: { src: H + "skipton/canal-reflection.jpg", pos: "35% 50%" },
    hotels: [
      {
        src: H + "skipton/canal-boats.jpg",
        pos: "70% 50%",
        place: "Skipton, North Yorkshire",
        name: "Skipton Hotel",
        offer: "25% off your stay",
        terms: FD,
      },
      {
        src: H + "waterton-park/aerial.jpg",
        pos: "50% 50%",
        place: "Wakefield, West Yorkshire",
        name: "Waterton Park\nHotel & Spa",
        offer: "15% off your stay",
        terms: FD,
      },
      {
        src: H + "gomersal-park/afternoon-tea.jpg",
        pos: "38% 50%",
        place: "Gomersal, West Yorkshire",
        name: "Gomersal Park Hotel",
        offer: "20% off your stay",
        terms: FD,
      },
      {
        src: H + "holdsworth-house/tea-by-the-fire.jpg",
        pos: "50% 50%",
        place: "Halifax, West Yorkshire",
        name: "Holdsworth House Hotel",
        offer: "10% off B&B",
        terms: "Stays to 31 March",
      },
      {
        src: C + "cosy-escapes/page4-dalmahoy-log-fire-bar.jpg",
        pos: "40% 50%",
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
        src: H + "ruthin-castle/castle.jpg",
        pos: "50% 50%",
        place: "Ruthin, North Wales",
        name: "Ruthin Castle\nHotel & Spa",
        offer: "20% off your stay",
        terms: FD,
      },
      {
        src: H + "the-imperial/breakfast-in-bed.jpg",
        pos: "50% 50%",
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
        src: C + "november-best-loved/forest-of-arden-exterior.jpg",
        pos: "55% 50%",
        place: "Meriden, Warwickshire",
        name: "Forest of Arden Hotel",
        offer: "A Black Friday B&B rate",
        terms: "Advance purchase, stays to 9 April",
      },
      {
        src: H + "whittlebury-park/murrays-dish-2x.jpg",
        pos: "50% 50%",
        place: "Whittlebury, Northamptonshire",
        name: "Whittlebury Park",
        offer: "10% off your stay",
        terms: "B&B or dinner, B&B, stays to 31 March",
      },
      {
        src: H + "jockey-club-rooms/hyperion-statue.jpg",
        pos: "62% 50%",
        place: "Newmarket, Suffolk",
        name: "Jockey Club Rooms",
        offer: "15% off B&B",
        terms: "Stays to 31 March, selected dates",
      },
      {
        src: H + "oaklands-hall/sausages-fireside.jpg",
        pos: "42% 50%",
        place: "Laceby, Lincolnshire",
        name: "Oaklands Hall Hotel",
        offer: "18% off your stay",
        terms: "Selected dates to 31 March",
      },
    ],
  },
  {
    id: "south",
    title: "The South",
    cover: { src: H + "the-alfriston/bedroom.jpg", pos: "40% 50%" },
    hotels: [
      {
        src: H + "burleigh-court/fireside-table.jpg",
        pos: "55% 50%",
        place: "Minchinhampton, Gloucestershire",
        name: "Burleigh Court",
        offer: "25% off B&B",
        terms: "Stays to 31 March, selected dates",
      },
      {
        src: C + "journey-new/oakley-hall-exterior-frost.jpg",
        pos: "50% 50%",
        place: "Oakley, Hampshire",
        name: "Oakley Hall Hotel",
        offer: "30% off your stay",
        terms: "Room only or B&B, stays to April",
      },
      {
        src: H + "the-alfriston/fireside-table.jpg",
        pos: "60% 50%",
        place: "Alfriston, East Sussex",
        name: "The Alfriston",
        offer: "30% off B&B",
        terms: "Book 27 to 30 November, selected dates",
      },
    ],
  },
];

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
        letterSpacing: "0.28em",
        color,
        textTransform: "uppercase",
      }}
    >
      {children}
    </div>
    <div style={{ height: 2, background: color, marginTop: 10 }} />
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

export const bfSlides = (id: string) =>
  (BF_REGIONS.find((r) => r.id === id)?.hotels.length ?? 0) + 2;

export const BlackFridayCarousel: React.FC<{ region: string }> = ({
  region,
}) => {
  const r = BF_REGIONS.find((x) => x.id === region)!;
  const i = useCurrentFrame();
  if (i === 0) {
    return (
      <AbsoluteFill style={{ backgroundColor: colors.black }}>
        <Photo {...r.cover} />
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(to bottom, rgba(9,9,10,0.12) 18%, rgba(9,9,10,0.86) 58%, rgba(9,9,10,0.94) 100%)",
          }}
        />
        <Mark />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 200,
            textAlign: "center",
          }}
        >
          <Caps color={MAUVE} size={30}>
            Black Friday Sale
          </Caps>
          <div
            style={{
              fontFamily: serif,
              fontSize: 132,
              lineHeight: 1.02,
              color: colors.cream,
              marginTop: 24,
              whiteSpace: "pre-line",
            }}
          >
            {r.title}
          </div>
          <div
            style={{
              fontFamily: serif,
              fontStyle: "italic",
              fontSize: 42,
              color: colors.cream,
              opacity: 0.88,
              marginTop: 22,
            }}
          >
            Swipe for this year&apos;s offers
          </div>
        </div>
      </AbsoluteFill>
    );
  }
  if (i === r.hotels.length + 1) {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: colors.black,
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <div style={{ marginTop: -60 }}>
          <Caps color={MAUVE} size={30}>
            Black Friday Sale
          </Caps>
          <div
            style={{
              fontFamily: serif,
              fontSize: 116,
              lineHeight: 1.08,
              color: colors.cream,
              marginTop: 28,
            }}
          >
            The wait
            <br />
            is over
          </div>
          <div
            style={{
              fontFamily: sans,
              fontSize: 30,
              letterSpacing: "0.04em",
              color: "rgba(245,239,227,0.8)",
              marginTop: 40,
            }}
          >
            classicbritishhotels.com/black-friday-countdown
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
        <Caps color={colors.gold}>{h.place}</Caps>
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
              letterSpacing: "0.06em",
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
