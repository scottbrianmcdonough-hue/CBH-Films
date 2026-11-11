#!/usr/bin/env node
// The world map for the CB Global Hub LinkedIn animation (src/linkedin/GlobalHub.tsx): Natural Earth land (world-atlas,
// 1:110m, Antarctica left off) in Equal Earth, fitted across the 4:5 frame's middle, the UK and eight world markets
// projected onto it. The markets are illustrative (the 8 partnerships' markets weren't given); swap them for the real
// ones in MARKETS and rerun. Usage: node scripts/global-hub-map.mjs (writes src/linkedin/global-hub/map.json)
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { geoEqualEarth, geoPath } from "d3-geo";
import { feature } from "topojson-client";

const require = createRequire(import.meta.url);
const world = require("world-atlas/countries-110m.json");
const countries = feature(world, world.objects.countries).features.filter(
  (c) => c.properties.name !== "Antarctica",
);
const land = { type: "FeatureCollection", features: countries };
const projection = geoEqualEarth()
  .rotate([-10, 0])
  .fitExtent(
    [
      [30, 470],
      [1050, 1000],
    ],
    land,
  );
const path = geoPath(projection);
const round = (d) => d.replace(/(\d+\.\d)\d+/g, "$1");
const HOME = { id: "uk", lon: -1.5, lat: 52.6 };
const MARKETS = [
  { id: "new-york", lon: -74.0, lat: 40.7 },
  { id: "dubai", lon: 55.3, lat: 25.2 },
  { id: "los-angeles", lon: -118.2, lat: 34.1 },
  { id: "singapore", lon: 103.8, lat: 1.35 },
  { id: "sao-paulo", lon: -46.6, lat: -23.5 },
  { id: "tokyo", lon: 139.7, lat: 35.7 },
  { id: "mumbai", lon: 72.8, lat: 19.1 },
  { id: "sydney", lon: 151.2, lat: -33.9 },
];
const pt = (p) => {
  const [x, y] = projection([p.lon, p.lat]);
  return { id: p.id, x: +x.toFixed(1), y: +y.toFixed(1) };
};
writeFileSync(
  new URL("../src/linkedin/global-hub/map.json", import.meta.url),
  JSON.stringify({ land: round(path(land)), home: pt(HOME), markets: MARKETS.map(pt) }),
);
console.log("ok", pt(HOME));
