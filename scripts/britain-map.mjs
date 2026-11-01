#!/usr/bin/env node
// Build the map for the journey reel: the UK and Ireland coastlines (Natural Earth 1:10m,
// via world-atlas) projected into the 1080x1920 frame, each hotel's pin, and a smooth gold
// thread through the pins in order, sampled with its running length so the film can draw
// it up to any point.
// Usage: node scripts/britain-map.mjs <stops.json> <out.json> [extras.json]
//   stops.json: [{ "id": "...", "lat": 50.57, "lon": -3.73 }, ...] in travelling order;
//   a stop with "ghost": true shapes the thread (e.g. carrying it on past the last hotel
//   and off the map) but gets no pin.
//   extras.json: more of the collection, same shape, lit at the end (no thread through them).
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { geoPath, geoTransverseMercator } from "d3-geo";
import { feature } from "topojson-client";

const require = createRequire(import.meta.url);
const world = require("world-atlas/countries-10m.json");
const [stopsFile, outFile, extrasFile] = process.argv.slice(2);
const stops = JSON.parse(readFileSync(stopsFile, "utf8"));

const countries = feature(world, world.objects.countries).features;
const uk = countries.find((c) => c.properties.name === "United Kingdom");
const ireland = countries.find((c) => c.properties.name === "Ireland");

// Fit mainland Britain (Scilly to Orkney) into the frame, a little above centre, leaving
// the safe zones clear; Ireland sits in the dark at the left edge.
const bbox = {
  type: "MultiPoint",
  coordinates: [
    [-6.4, 49.9],
    [1.8, 49.9],
    [1.8, 58.7],
    [-6.4, 58.7],
  ],
};
const projection = geoTransverseMercator()
  .rotate([2, 0])
  .fitExtent(
    [
      [90, 150],
      [990, 1660],
    ],
    bbox,
  );
const path = geoPath(projection);
const round = (d) => d.replace(/(\d+\.\d{1})\d+/g, "$1");

const pins = stops.map((s) => {
  const [x, y] = projection([s.lon, s.lat]);
  return { id: s.id, x: +x.toFixed(1), y: +y.toFixed(1), ghost: !!s.ghost };
});

// A Catmull-Rom curve through the pins, sampled finely, with the running length at every
// sample and at every pin.
const samples = [];
const at = [];
const cr = (p0, p1, p2, p3, t) => {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
};
let length = 0;
let prev = null;
for (let i = 0; i < pins.length - 1; i++) {
  const p0 = pins[Math.max(0, i - 1)];
  const p1 = pins[i];
  const p2 = pins[i + 1];
  const p3 = pins[Math.min(pins.length - 1, i + 2)];
  const steps = 60;
  at.push(length); // the running length where this pin sits
  for (let s = 0; s <= steps; s++) {
    if (i > 0 && s === 0) continue;
    const t = s / steps;
    const x = cr(p0.x, p1.x, p2.x, p3.x, t);
    const y = cr(p0.y, p1.y, p2.y, p3.y, t);
    if (prev) length += Math.hypot(x - prev[0], y - prev[1]);
    samples.push([+x.toFixed(1), +y.toFixed(1), +length.toFixed(1)]);
    prev = [x, y];
  }
}
at.push(length);

const extras = extrasFile
  ? JSON.parse(readFileSync(extrasFile, "utf8")).map((s) => {
      const [x, y] = projection([s.lon, s.lat]);
      return { id: s.id, x: +x.toFixed(1), y: +y.toFixed(1) };
    })
  : [];

writeFileSync(
  outFile,
  JSON.stringify({
    uk: round(path(uk)),
    ireland: round(path(ireland)),
    pins: pins
      .map((p, i) => ({ ...p, at: +at[i].toFixed(1) }))
      .filter((p) => !p.ghost)
      .map(({ ghost: _, ...p }) => p),
    thread: samples,
    extras,
  }),
);
console.log(
  `${pins.length} pins, thread ${length.toFixed(0)}px, ${samples.length} samples`,
);
