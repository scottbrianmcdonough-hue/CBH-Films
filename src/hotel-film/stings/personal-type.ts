import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Scott's own LinkedIn pieces (the depth demo and breakdown) are his, not CBH's: Inter Display
// (SIL OFL, public/fonts/OFL-Inter.txt), white accents in place of the CBH gold.
export const personal = "Inter Display";
export const accent = "#FFFFFF";

loadFont({
  family: personal,
  url: staticFile("fonts/InterDisplay-Light.otf"),
  weight: "300",
});
loadFont({
  family: personal,
  url: staticFile("fonts/InterDisplay-Medium.otf"),
  weight: "500",
});
