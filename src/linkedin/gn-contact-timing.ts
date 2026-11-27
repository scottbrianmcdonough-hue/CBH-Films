// Timings for the GN Customer Contact Centre animation, one set per track. Shared by GNContactCentre.tsx (the picture)
// and scripts/gn-contact-sfx.py (the soundtrack, which imports this file through node), so the ring, the pickup and
// the cuts land on the same frames. Plain TypeScript, no JSX, so node can strip the types and run it.
//
// Every track lands its big hit on PICKUP: the phone rings over the build, the handset lifts on the hit and the band
// comes in under the answer. The beats before it are counted back from there on the track's own grid.

export type GNContactTrack = "indie" | "ambition";

export const GN_CONTACT_TRACKS: Record<
  GNContactTrack,
  { file: string; hit: number; beat: number; before: { L1: number; L2: number; cards: number[]; L3: number } }
> = {
  // Inspiring Uplifting Indie Rock (Music_for_Creators, Pixabay 328509), 120 BPM: a quiet intro, the band in at 10.09s
  indie: {
    file: "music/musicforcreators-inspiring-uplifting-indie-rock-328509.mp3",
    hit: 10.09,
    beat: 15,
    before: { L1: 16, L2: 13, cards: [10, 8, 6], L3: 4 },
  },
  // Driving Ambition (Mixkit 32), 99.4 BPM: a steady build, the impact at 38.60s
  ambition: {
    file: "music/mixkit-driving-ambition-32.mp3",
    hit: 38.6,
    beat: 18.11,
    before: { L1: 14, L2: 11.5, cards: [9, 7, 5], L3: 3 },
  },
};

// a ring burst: a double trill, on 11 frames, off 6, on 13 (frames from the burst's start)
export const RING_ON: [number, number][] = [
  [0, 11],
  [17, 30],
];

export const gnContactTiming = (track: GNContactTrack) => {
  const { beat, before } = GN_CONTACT_TRACKS[track];
  const PICKUP = 14 + Math.round(before.L1 * beat); // the hit: the handset lifts, the ringing stops
  const at = (n: number) => PICKUP - Math.round(n * beat);
  const L1 = at(before.L1);
  const L2 = at(before.L2);
  const CARDS = before.cards.map(at);
  const L3 = at(before.L3);
  // a burst as the phone appears and one with each card, then one more after "Who picks up?" that the pickup cuts
  const RINGS = [L2 + 11, ...CARDS, PICKUP - 23];
  // the answer: "We do." on the hit, "In your hotel's name." a beat later, both away before the end card
  const A1 = PICKUP + 10;
  const A2 = A1 + Math.round(beat * 2);
  const A_OUT = PICKUP + Math.round(beat * 6);
  const END = A_OUT + 12; // the end card comes in
  const FRAMES = END + 50 + 85; // in by END + 50, held ~2.8s
  return { PICKUP, L1, L2, CARDS, L3, RINGS, A1, A2, A_OUT, END, FRAMES };
};

// how hard the phone is ringing at frame f (0 to 1), for the icons' wobble; `only` picks one burst
export const ringing = (rings: number[], pickup: number, f: number, only?: number) => {
  if (f >= pickup) return 0;
  const list = only === undefined ? rings : [rings[only]];
  for (const r of list) {
    const t = f - r;
    for (const [a, b] of RING_ON) {
      if (t >= a && t < b) return Math.sin((Math.PI * (t - a)) / (b - a));
    }
  }
  return 0;
};
