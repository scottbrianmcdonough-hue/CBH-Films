#!/usr/bin/env node
// Build the map for the Great National Group map reel (src/linkedin/GNMap.tsx): Ireland
// and Great Britain (Natural Earth 1:10m, via world-atlas) fitted into the 4:5 frame, and
// each of GN's 26 hotels (src/linkedin/gn-map/hotels.json, from
// greatnationalhotels.com/our-hotels, placed by town) projected onto it.
// Usage: node scripts/gn-map.mjs  (writes src/linkedin/gn-map/map.json)
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { geoPath, geoTransverseMercator } from "d3-geo";
import { feature } from "topojson-client";

const require = createRequire(import.meta.url);
const world = require("world-atlas/countries-10m.json");
const dir = new URL("../src/linkedin/gn-map/", import.meta.url);
const hotels = JSON.parse(readFileSync(new URL("hotels.json", dir), "utf8"));

const countries = feature(world, world.objects.countries).features;
const uk = countries.find((c) => c.properties.name === "United Kingdom");
const ireland = countries.find((c) => c.properties.name === "Ireland");

// the whole of both islands, Mizen Head to Orkney, Achill to Lowestoft, in the frame
const bbox = {
  type: "MultiPoint",
  coordinates: [
    [-10.5, 49.95],
    [1.8, 49.95],
    [1.8, 58.65],
    [-10.5, 58.65],
  ],
};
const projection = geoTransverseMercator()
  .rotate([4.5, 0])
  .fitExtent(
    [
      [70, 90],
      [1010, 1190],
    ],
    bbox,
  );
const path = geoPath(projection);
const round = (d) => d.replace(/(\d+\.\d{1})\d+/g, "$1");

const pins = hotels.map((h) => {
  const [x, y] = projection([h.lon, h.lat]);
  return { id: h.id, country: h.country, x: +x.toFixed(1), y: +y.toFixed(1) };
});
writeFileSync(
  new URL("map.json", dir),
  JSON.stringify({ uk: round(path(uk)), ireland: round(path(ireland)), pins }),
);
console.log(`${pins.length} pins`);
