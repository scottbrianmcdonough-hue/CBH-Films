import type { MESpec } from "../hotel-film/me/MEReel";

// Black Friday 2026 hotel spotlight reels (Scott, 9 Nov: "do the spotlights ... like the Rutland Hall Four Roots
// reel"): the Stories' template (MEReel) run longer, a day at the hotel a shot at a time with a line over each,
// ending on the hotel's offer card. Lee's mauve caps for the place, the house cream Cormorant for the lines.
// Dalmahoy first as the sample. Music as the Stories: "What the Funk" by Rockot (Pixabay 549053), ~124.9 BPM
// (a beat 0.4805s), from beat 19 (9.497s, a phrase start); every scene six beats, the label eight.
const B = (k: number) => Math.round((k - 19) * 0.4805 * 30);
const H = "hotels/";

const line = (title: string) => ({ eyebrow: "", title, subs: [""] });

export const dalmahoySpotlight: MESpec = {
  id: "black-friday-spotlight-dalmahoy",
  frames: B(61),
  scenes: [
    {
      at: 0,
      shots: [{ src: H + "dalmahoy/exterior.jpg", pos: "45% 50%" }],
      text: {
        eyebrow: "Edinburgh",
        title: "Dalmahoy Hotel\n& Country Club",
        subs: [""],
        mauve: true,
      },
    },
    {
      at: B(27),
      cut: true,
      shots: [{ src: H + "dalmahoy/syrup-pour.mp4", from: 4 }],
      text: line("Breakfast\ntakes its time"),
    },
    {
      at: B(33),
      cut: true,
      shots: [{ src: H + "dalmahoy/golf-burn.jpg", pos: "58% 50%" }],
      text: line("Then a round\nalong the burn"),
    },
    {
      at: B(39),
      cut: true,
      shots: [{ src: H + "dalmahoy/pool.jpg", pos: "50% 50%" }],
      text: line("A length\nbefore dinner"),
    },
    {
      at: B(45),
      cut: true,
      shots: [{ src: H + "dalmahoy/bedroom.jpg", pos: "45% 50%" }],
      text: line("Lamps low,\ndoor closed"),
    },
  ],
  end: {
    at: B(51),
    cut: true,
    name: "Dalmahoy Hotel & Country Club",
    place: "Edinburgh",
    offer: { title: "30% off B&B", lines: ["Stays to 30 April"] },
  },
  music: {
    src: "music/rockot-what-the-funk-549053.mp3",
    startAt: 285,
    gain: 0.56,
    fadeOut: 40,
  },
};

export const BF_SPOTLIGHTS: MESpec[] = [dalmahoySpotlight];
