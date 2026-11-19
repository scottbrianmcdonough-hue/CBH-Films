import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CB_B, CB_C, CB_VIEWBOX } from "../sketch/cb-paths";
import { EASE_IN_OUT, EASE_OUT, palette, progress, sans } from "../theme";

// "Every name, one CB" (Scott, 19 Nov: "the CB words, hotel names are words, and then the light scans through them and
// clicks off and turns the gold CB"). The collection's hotel names fill the CB's own outline in faint cream caps, line on
// line; a band of light scans down through them, each name catching it as it passes; the lights click off to black (a
// hard cut, no fade); then the CB comes back solid gold, a soft glow and one shimmer. Silent mock-up (needs a track).
// Names: the rolodex list (check them against the CBH site) plus Coombe Abbey Hotel.
const NAMES = [
  "The Alfriston", "Almondsbury Inn", "Arnos Manor Hotel", "Atholl Palace", "Avisford Park Hotel", "Barnett Hill Hotel",
  "The Beaches Hotel & Spa", "Burleigh Court", "Castle Inn", "Coombe Abbey Hotel", "County Hotel", "Dalmahoy Hotel & Country Club",
  "Donnington Manor Hotel", "Fairlawns Hotel & Spa", "Feathers Hotel", "Forest of Arden Hotel & Country Club",
  "Frensham Pond Hotel & Spa", "Gisborough Hall", "Gomersal Park Hotel & Spa", "Hardwick Hall Hotel", "Hatherley Manor",
  "Haycock Manor Hotel", "Hintlesham Hall", "Hogarths Solihull", "Hogarths Stone Manor", "Holdsworth House Hotel",
  "Hythe Imperial", "Ilsington Country House Hotel", "Imperial Hotel Tenby", "The Imperial Hotel", "The Kingfisher",
  "Knowsley Inn", "Lancaster House Hotel", "Langshott Manor", "Langstone Cliff Hotel", "Low Wood Bay Resort & Spa",
  "Metropole Hotel", "Morritt Hotel", "The Mount Country Manor Hotel", "Nailcote Hall", "Oaklands Hall Hotel",
  "Oakley Hall Hotel", "Park House Hotel", "Prince Rupert Hotel", "Ramside Hall", "Rowton Hall Hotel & Spa",
  "Ruthin Castle Hotel & Spa", "Rutland Hall Hotel & Spa", "Skipton Hotel", "Speech House Hotel", "Stoke by Nayland Resort",
  "Tiverton Hotel", "Waterton Park Hotel", "Whitley Hall Country House Hotel", "Whittlebury Park", "Wild Boar Estate",
  "Wildes Inns", "Wrightington Hotel & Spa",
];

export const NAMES_CB_FRAMES = 300; // 10s
const SCAN = [24, 150]; // the band of light's sweep, top to bottom
const OFF = 168; // the lights click off
const GOLD = 180; // the gold CB comes in
const SHIMMER = 222;

const [, , VW, VH] = CB_VIEWBOX.split(" ").map(Number);
const ROW = 9.4; // line height in the CB's units (small and dense, so the names fill the strokes and the CB reads)
const SIZE = 7.6;
const ROWS = Math.ceil(VH / ROW) + 1;
// each line a long run of names, starting at a different name so no two lines read the same
const line = (r: number) => {
  const out: string[] = [];
  for (let i = 0; i < 22; i++) out.push(NAMES[(r * 7 + i) % NAMES.length]);
  return out.join("  ·  ").toUpperCase();
};

export const NamesCB: React.FC = () => {
  const frame = useCurrentFrame();
  const appear = progress(frame, 0, 26, EASE_OUT);
  const scanY = interpolate(frame, SCAN, [-0.25 * VH, 1.25 * VH], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IN_OUT });
  const off = frame >= OFF;
  const gold = progress(frame, GOLD, 22, EASE_OUT);
  const shimmer = interpolate(frame, [SHIMMER, SHIMMER + 30], [-0.6, 1.6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const drift = interpolate(frame, [0, OFF], [0, -18]); // the lines creep sideways a touch while lit
  const W = 820;
  const H = (W * VH) / VW;
  return (
    <AbsoluteFill style={{ backgroundColor: palette.black, justifyContent: "center", alignItems: "center" }}>
      <svg width={W} height={H} viewBox={CB_VIEWBOX} style={{ overflow: "visible" }}>
        <defs>
          <clipPath id="cb-clip">
            <path d={CB_C} />
            <path d={CB_B} />
          </clipPath>
          {/* the band of light, a soft horizontal stripe moving down */}
          <linearGradient id="scan" gradientUnits="userSpaceOnUse" x1="0" y1={scanY - 130} x2="0" y2={scanY + 130}>
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="1" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask id="scan-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={VW} height={VH}>
            <rect x="0" y="0" width={VW} height={VH} fill="url(#scan)" />
          </mask>
          <linearGradient id="shine" gradientUnits="userSpaceOnUse" x1={VW * shimmer - 120} y1="0" x2={VW * shimmer + 120} y2={VH * 0.4}>
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.75" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="14" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {!off ? (
          <g clipPath="url(#cb-clip)">
            {/* the names, faint */}
            <rect x="0" y="0" width={VW} height={VH} fill={palette.pale} opacity={0.05 * appear} />
            <g opacity={0.38 * appear} fill={palette.pale} fontFamily={sans} fontWeight={600} fontSize={SIZE} letterSpacing={0.9}>
              {Array.from({ length: ROWS }, (_, r) => (
                <text key={r} x={-40 + (r % 2 ? 0 : -60) + drift} y={r * ROW + SIZE}>
                  {line(r)}
                </text>
              ))}
            </g>
            {/* the same names lit where the band passes */}
            <g mask="url(#scan-mask)" fill="#e6d3a8" fontFamily={sans} fontWeight={700} fontSize={SIZE} letterSpacing={0.9}>
              {Array.from({ length: ROWS }, (_, r) => (
                <text key={r} x={-40 + (r % 2 ? 0 : -60) + drift} y={r * ROW + SIZE} style={{ filter: "drop-shadow(0 0 3px rgba(199,171,119,0.9))" }}>
                  {line(r)}
                </text>
              ))}
            </g>
          </g>
        ) : null}
        {/* the gold CB */}
        {frame >= GOLD ? (
          <g opacity={gold} transform={`translate(${VW / 2} ${VH / 2}) scale(${0.97 + 0.03 * gold}) translate(${-VW / 2} ${-VH / 2})`}>
            <g filter="url(#glow)" fill={palette.gold}>
              <path d={CB_C} />
              <path d={CB_B} />
            </g>
            <g clipPath="url(#cb-clip)">
              <rect x="0" y="0" width={VW} height={VH} fill="url(#shine)" />
            </g>
          </g>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};
