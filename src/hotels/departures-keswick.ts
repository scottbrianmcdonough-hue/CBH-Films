import type { DeparturesSpec } from "../hotel-film/departures/types";

// Departures, episode 1: Keswick, Lake District Castle Inn Hotel & Spa. Scott: "maybe like two
// or three hotels or even one, not 4", "it can be a series": one hotel a reel, the board's
// other rows (Pitlochry, Wolverhampton, Dartmoor) still ON TIME as the next episodes.
// The trip: a traveller wheels a case down a station corridor, the platform, a hand out of
// the car window over the moors and dry-stone walls, then the hotel (Scott's photos):
// the garden under the fells (the label), a fell walk, cycling the valley, the pool, and
// dinner by the wood burner last (Scott: "grade it cosy autumn": end on the warmest).
//
// Stock (Pexels, free licence, sent by Scott): corridor 8044819 (25fps, interpolated to
// 30), platform 12169863 (4K 25fps, scaled and interpolated), car-window 15307404.
// The place on the board, KESWICK, is the nearest town (the hotel is by Bassenthwaite
// Lake): confirm it's the wording Scott wants.
// Music: "Acoustic Upbeat Folk (Happy Feels)" by MarkJuly (Pixabay 113869; Scott picked it
// over Peaceful Acoustic Guitar for its energy). Also on the Dad birthday chat reel (from
// 7.13s): this reel uses a later stretch, from the 121.10s beat, so the board flips in over
// the groove and turns into the trip on the chorus at 124.8s (the full band back).
// The photos are rendered as camera moves with real depth (scripts/still-depth-dolly.py:
// near things travel further than the fells; Scott: "add more depth", "look more real, not
// AI"); shots cut on whole beats.

const S = "campaigns/departures/stock";
const P = "campaigns/departures/posters";
const H = "campaigns/departures/hotels";

export const departuresKeswick: DeparturesSpec = {
  id: "departures-keswick",
  beat: 13.932, // Happy Feels, 129.2 BPM
  intro: 8,
  rows: [
    { time: "09:12", place: "KESWICK" },
    { time: "10:05", place: "PITLOCHRY" },
    { time: "11:40", place: "WOLVERHAMPTON" },
    { time: "12:15", place: "DARTMOOR" },
  ],
  turn: 2,
  legs: [
    {
      row: 0,
      // the full name on two lines (Scott), never shortened
      hotel: "Lake District\nCastle Inn Hotel & Spa",
      hold: 0,
      shots: [
        {
          side: "stock",
          kind: "video",
          src: `${S}/corridor.mp4`,
          from: 0.4,
          posterIn: `${P}/corridor.jpg`,
          beats: 3,
        },
        {
          side: "stock",
          kind: "video",
          src: `${S}/platform.mp4`,
          from: 0.5,
          beats: 2,
        },
        {
          side: "stock",
          kind: "video",
          src: `${S}/car-window.mp4`,
          from: 2,
          beats: 3,
        },
        // Scott's photos as camera moves with real depth (scripts/still-depth-dolly.py),
        // no handheld wobble (Scott: "not too much handheld, looks fake")
        {
          side: "hotel",
          kind: "video",
          src: `${H}/castle-inn-garden.mp4`,
          from: 0,
          beats: 4,
        },
        {
          side: "hotel",
          kind: "video",
          src: `${H}/castle-inn-fell-walk.mp4`,
          from: 0,
          beats: 3,
        },
        {
          side: "hotel",
          kind: "video",
          src: `${H}/castle-inn-cyclists.mp4`,
          from: 0,
          beats: 3,
        },
        {
          side: "hotel",
          kind: "video",
          src: `${H}/castle-inn-pool.mp4`,
          from: 0,
          beats: 3,
        },
        {
          // Scott: more of the table, not just a stove: it pans from the wine and dinner
          // across to the lit wood burner
          side: "hotel",
          kind: "video",
          src: `${H}/castle-inn-fireside.mp4`,
          from: 0,
          posterOut: `${P}/castle-inn-fireside-end.jpg`,
          beats: 5,
        },
      ],
    },
  ],
  end: { lines: ["WHERE TO", "  NEXT? "], beats: 7 },
  music: {
    src: "campaigns/departures/happy-feels.mp3",
    startAt: 3633, // 121.10s
    gain: 0.4,
    seconds: 161.5,
  },
};
