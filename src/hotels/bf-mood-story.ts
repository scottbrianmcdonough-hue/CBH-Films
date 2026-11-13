import type { RippleSpec } from "../hotel-film/ripple/types";

// Black Friday mood Story (Scott, 13 Nov: "a Story for today, maybe without named hotels, just a mood Story, and it's
// Black Friday month"): 9:16, under 15s, no hotel names or labels. The Kingfisher's dessert by the fire (its own
// footage) opens for two bars under "Long nights, / warm rooms", then a bar each: robes and fizz on the sofa
// (Holdsworth), the table by the fire (Burleigh Court), breakfast in bed (Holdsworth), slow pushes and glides, hard
// cuts on the bar; the end card the campaign's: BLACK FRIDAY SALE in Lee's mauve caps over "Save up to 30%" (the
// collection's best). Luxury Life (Kulakovka, the South's track) from the same downbeat. Built by hand (clips by
// still-push.py, cut by cut-picture.py, public/campaigns/bf-mood-story/cut.json).
export const bfMoodStory: RippleSpec = {
  id: "bf-mood-story",
  picture: "campaigns/bf-mood-story/picture.mp4",
  frames: 443,
  label: { eyebrow: "", name: "", from: 0, to: 1 },
  lines: [{ text: "Long nights,\nwarm rooms", from: 12, to: 170 }],
  deepScrim: true,
  endCard: { at: 355, eyebrow: "Black Friday Sale", line: "Save up to 30%", quick: true },
  music: {
    src: "music/kulakovka-luxury-life-618587.mp3",
    startAt: 346,
    gain: 0.78,
    seconds: 145,
    fadeOut: 40,
  },
};
