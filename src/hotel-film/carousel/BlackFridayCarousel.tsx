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
  from: string; // the region's lowest from price, for the cover pill
  cover: { src: string; pos: string };
  // the cover's tiles when the hotels' own second photos are too few (Wales has two hotels: four tiles, not two strips)
  coverTiles?: { src: string; pos: string }[];
  hotels: Hotel[];
};

// Regrouped and reordered (Bianca, 9 Nov: "North | East & Midlands | South | Scotland & Wales", "listing the hotels
// from cheapest first"; Scott: "page is live, not Catherine's sheet"): the offers and from prices as on the live page
// classicbritishhotels.com/offer-category/black-friday-offers/ (9 Nov), each hotel at its lowest from price, lowest
// first. The Alfriston isn't on the page yet (its offer books 27 to 30 Nov only); Donnington is Donnington Manor,
// Sevenoaks. No prices on the slides (Scott, 9 Nov): each pill is the page's offer; the cover keeps Lee's Save up to 30%.
// Hotel slides on the hotel's exterior, the cover a mix of hero shots, no pink bed (Bianca, 10 Nov); Gomersal Park keeps
// its spa (its exterior isn't its best); Donnington Manor's exterior and terrace breakfast are Scott's (10 Nov).
// No "B&B" in the pills (Scott, 10 Nov: "B&B sounds so uninviting"): lead with breakfast; the North done first.
const REGIONS: Region[] = [
  {
    id: "north",
    title: "The North",
    from: "85",
    cover: { src: H + "gomersal-park/burger.jpg", pos: "60% 50%" },
    hotels: [
      {
        src: H + "gomersal-park/spa-pool.jpg",
        pos: "50% 50%",
        tile: { src: H + "gomersal-park/burger.jpg", pos: "60% 50%" },
        place: "Gomersal, West Yorkshire",
        name: "Gomersal Park\nHotel & Spa",
        offer: "Breakfast plus dining savings",
        terms: "",
      },
      {
        src: H + "skipton/canal-reflection.jpg",
        pos: "22% 50%",
        tile: { src: H + "skipton/afternoon-tea.jpg", pos: "45% 50%" },
        place: "Skipton, North Yorkshire",
        name: "Skipton Hotel",
        offer: "25% off food and drink",
        terms: "",
      },
      {
        src: H + "waterton-park/footbridge-autumn.jpg",
        pos: "47% 50%",
        tile: { src: H + "waterton-park/outdoor-hot-tub.jpg", pos: "55% 50%" },
        place: "Wakefield, West Yorkshire",
        name: "Waterton Park\nHotel & Spa",
        offer: "Breakfast plus dining savings",
        terms: "",
      },
      {
        src: H + "holdsworth-house/exterior.jpg",
        pos: "50% 50%",
        tile: { src: H + "holdsworth-house/breakfast-in-bed.jpg", pos: "50% 50%" },
        place: "Halifax, West Yorkshire",
        name: "Holdsworth House Hotel",
        offer: "10% off, breakfast included",
        terms: "",
      },
    ],
  },
  {
    id: "scotland-wales",
    title: "Scotland & Wales",
    from: "85",
    cover: { src: H + "ruthin-castle/hot-tub-fizz.jpg", pos: "50% 50%" },
    hotels: [
      {
        src: H + "ruthin-castle/castle.jpg",
        pos: "25% 50%",
        tile: { src: H + "ruthin-castle/hot-tub-fizz.jpg", pos: "50% 50%" },
        place: "Ruthin, North Wales",
        name: "Ruthin Castle\nHotel & Spa",
        offer: "Breakfast plus dining savings",
        terms: "",
      },
      {
        src: H + "the-imperial/seafront.jpg",
        pos: "45% 50%",
        tile: { src: H + "the-imperial/breakfast-in-bed.jpg", pos: "50% 50%" },
        place: "Llandudno, North Wales",
        name: "The Imperial Hotel",
        offer: "Save up to 30%",
        terms: "",
      },
      {
        src: H + "dalmahoy/exterior.jpg",
        pos: "35% 50%",
        tile: { src: H + "dalmahoy/salmon-plate.jpg", pos: "50% 50%" },
        place: "Edinburgh",
        name: "Dalmahoy Hotel\n& Country Club",
        offer: "30% off, breakfast included",
        terms: "",
      },
    ],
  },
  {
    id: "east-midlands",
    title: "East & Midlands",
    from: "77.90",
    cover: { src: H + "oaklands-hall/bedroom.jpg", pos: "50% 50%" },
    hotels: [
      {
        src: H + "oaklands-hall/exterior-front.jpg",
        pos: "50% 40%",
        tile: { src: H + "oaklands-hall/plate.jpg", pos: "50% 50%" },
        place: "Laceby, Lincolnshire",
        name: "Oaklands Hall Hotel",
        offer: "Room only, breakfast or half board",
        terms: "",
      },
      {
        src: H + "whittlebury-park/exterior.jpg",
        pos: "50% 50%",
        tile: { src: H + "whittlebury-park/spa-pool.jpg", pos: "50% 50%" },
        place: "Whittlebury, Northamptonshire",
        name: "Whittlebury Park",
        offer: "Breakfast or half board",
        terms: "",
      },
      {
        src: H + "forest-of-arden/aerial-autumn.jpg",
        pos: "72% 50%",
        tile: { src: H + "forest-of-arden/chef-afternoon-tea.jpg", pos: "50% 50%" },
        place: "Meriden, Warwickshire",
        name: "Forest of Arden Hotel",
        offer: "Breakfast included",
        terms: "",
      },
      {
        src: H + "jockey-club-rooms/garden-front.jpg",
        pos: "30% 50%",
        tile: { src: H + "jockey-club-rooms/dining-room.jpg", pos: "50% 50%" },
        place: "Newmarket, Suffolk",
        name: "Jockey Club Rooms",
        offer: "Breakfast included",
        terms: "",
      },
    ],
  },
  {
    id: "south",
    title: "The South",
    from: "77.60",
    cover: { src: H + "frensham-pond/restaurant.jpg", pos: "40% 50%" },
    hotels: [
      {
        src: H + "frensham-pond/exterior-dusk.jpg",
        pos: "55% 50%",
        tile: { src: H + "frensham-pond/restaurant.jpg", pos: "40% 50%" },
        place: "Farnham, Surrey",
        name: "Frensham Pond\nHotel & Spa",
        offer: "20% off, breakfast included",
        terms: "",
      },
      {
        src: H + "donnington-manor/exterior.jpg",
        pos: "4% 50%",
        tile: { src: H + "donnington-manor/breakfast-terrace.jpg", pos: "50% 50%" },
        place: "Sevenoaks, Kent",
        name: "Donnington Manor\nHotel",
        offer: "20% off, breakfast included",
        terms: "",
      },
      {
        src: H + "oakley-hall/exterior.jpg",
        pos: "50% 50%",
        tile: { src: H + "oakley-hall/afternoon-tea.jpg", pos: "40% 50%" },
        place: "Oakley, Hampshire",
        name: "Oakley Hall Hotel",
        offer: "Room only or with breakfast",
        terms: "",
      },
      {
        src: H + "burleigh-court/garden-house.jpg",
        pos: "72% 50%",
        tile: { src: H + "burleigh-court/bedroom.jpg", pos: "45% 50%" },
        place: "Minchinhampton, Gloucestershire",
        name: "Burleigh Court",
        offer: "25% off, breakfast included",
        terms: "",
      },
    ],
  },
];

// in posting order: the North (Wed 11), Scotland & Wales (Fri 13), East & Midlands (Tue 17), the South (Mon 23)
export const BF_REGIONS: Region[] = REGIONS;

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
  north: "bed",
  "scotland-wales": "curtains",
  "east-midlands": "bed",
  south: "curtains",
};

// each region's best offer on the 2026 sheet, for the cover's pill

// no closing campaign slide (Bianca, 10 Nov: it goes out on its own on Mon 16 Nov with the email): the cover, then the hotels
export const bfSlides = (id: string) =>
  (BF_REGIONS.find((r) => r.id === id)?.hotels.length ?? 0) + 1;

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
          src={staticFile(
            `campaigns/black-friday-2026/campaign/${OFFICIAL[region] ?? "bed"}-4x5.jpg`,
          )}
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
    const pics = r.coverTiles ?? r.hotels.map((h) => h.tile);
    const nTop = Math.max(1, Math.floor(pics.length / 2));
    const rowH = (1350 - BAND - 2 * G) / 2;
    const row = (list: { src: string; pos: string }[], y: number) =>
      list.map((h, k) => {
        const w = (1080 - G * (list.length - 1)) / list.length;
        return { h, x: k * (w + G), y, w, hh: rowH };
      });
    const tiles = [
      ...row(pics.slice(0, nTop), 0),
      ...row(pics.slice(nTop), rowH + G + BAND + G),
    ];
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
          <div
            key={t.h.src}
            style={{
              position: "absolute",
              left: t.x,
              top: t.y,
              width: t.w,
              height: t.hh,
              overflow: "hidden",
            }}
          >
            <Photo src={t.h.src} pos={t.h.pos} />
          </div>
        ))}
        {/* the band in the official card's own order (Scott, 5 Nov: "the covers can match Lee's cards better"): the
            region where his card has THE WAIT IS OVER, in its tight mauve caps, then Black Friday Sale in cream, then his
            mauve pill with the region's best offer */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              fontFamily: sans,
              fontWeight: 600,
              fontSize: 32,
              letterSpacing: "0.02em",
              color: MAUVE,
              textTransform: "uppercase",
            }}
          >
            {r.title.replace("\n", " ")}
          </div>
          <div
            style={{
              fontFamily: serif,
              fontWeight: 600,
              fontSize: 118,
              lineHeight: 1,
              color: colors.cream,
              marginTop: 14,
              whiteSpace: "nowrap",
              letterSpacing: "-0.01em",
            }}
          >
            Black Friday Sale
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 18,
              height: 78,
              padding: "0 36px",
              borderRadius: 39,
              backgroundColor: MAUVE,
              marginTop: 30,
              fontFamily: sans,
              fontWeight: 600,
              color: colors.cream,
              textTransform: "uppercase",
            }}
          >
            {/* the region's lowest from price (Bianca: cheapest first) */}
            <span style={{ fontSize: 30, letterSpacing: "0.02em" }}>
              Save up to
            </span>
            <span
              style={{
                fontSize: 46,
                fontWeight: 700,
                fontVariantNumeric: "lining-nums",
              }}
            >
              30%
            </span>
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
        <Caps color={MAUVE} size={32}>
          {h.place}
        </Caps>
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
