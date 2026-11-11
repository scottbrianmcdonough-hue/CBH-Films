#!/usr/bin/env node
// The world map for the CB Global Hub LinkedIn animation (src/linkedin/GlobalHub.tsx): Natural Earth land (world-atlas,
// 1:110m, Antarctica left off) in Equal Earth, fitted across the 4:5 frame's middle, the UK and eight world markets
// projected onto it. The markets are illustrative (the 8 partnerships' markets weren't given); swap them for the real
// ones in MARKETS and rerun. Usage: node scripts/global-hub-map.mjs (writes src/linkedin/global-hub/map.json)
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { geoContains, geoEqualEarth, geoPath } from "d3-geo";
import { feature } from "topojson-client";

const require = createRequire(import.meta.url);
const world = require("world-atlas/countries-110m.json");
const countries = feature(world, world.objects.countries).features.filter(
  (c) => c.properties.name !== "Antarctica",
);
const land = { type: "FeatureCollection", features: countries };
// 4:5 by default; with --wide, the 16:9 LinkedIn cut's right two thirds
const WIDE = process.argv.includes("--wide");
const projection = geoEqualEarth()
  .rotate([-10, 0])
  .fitExtent(
    WIDE
      ? [
          [800, 200],
          [1880, 870],
        ]
      : [
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
// the agents: points scattered over the land (seeded), with their distance from the UK for the spreading wave
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const home = pt(HOME);
const agents = [];
while (agents.length < 420) {
  const lon = -170 + 340 * rnd();
  const lat = -55 + 128 * rnd();
  if (!countries.some((c) => geoContains(c, [lon, lat]))) continue;
  const [x, y] = projection([lon, lat]);
  agents.push({ x: +x.toFixed(1), y: +y.toFixed(1), d: +(Math.hypot(x - home.x, y - home.y) / 600).toFixed(3) });
}
writeFileSync(
  new URL(`../src/linkedin/global-hub/${WIDE ? "map-wide" : "map"}.json`, import.meta.url),
  JSON.stringify({ land: round(path(land)), home: pt(HOME), markets: MARKETS.map(pt), agents }),
);
console.log("ok", pt(HOME));
