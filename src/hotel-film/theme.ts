import { loadFont } from "@remotion/fonts";
import { Easing, interpolate, staticFile } from "remotion";

// Fonts are bundled in public/fonts (variable, latin subset) so renders work offline.
export const serif = "Cormorant Garamond";
export const sans = "Open Sans";

loadFont({
  family: serif,
  url: staticFile("fonts/CormorantGaramond.woff2"),
  weight: "300 700",
});
loadFont({
  family: serif,
  url: staticFile("fonts/CormorantGaramond-Italic.woff2"),
  weight: "300 700",
  style: "italic",
});
loadFont({
  family: sans,
  url: staticFile("fonts/OpenSans.woff2"),
  weight: "300 800",
});

// Classic British Hotels palette: gold from the official CBH logo SVG, on black.
export const colors = {
  black: "#09090A",
  charcoal: "#18181A",
  gold: "#C39E55",
  lightGold: "#DAC396",
  paleGold: "#EDE2C4",
  cream: "#F5EFE3",
};

export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);

// Eased 0 -> 1 progress between `start` and `start + duration`.
export const progress = (
  frame: number,
  start: number,
  duration: number,
  easing = EASE_OUT,
) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });
